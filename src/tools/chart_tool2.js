/**
 * @param chartOptions.project
 *            morpheus.Project
 * @param chartOptions.getVisibleTrackNames
 *            {Function}
 */
morpheus.ChartTool2 = function (chartOptions) {
	var _this = this;
	this.getVisibleTrackNames = chartOptions.getVisibleTrackNames;
	this.project = chartOptions.project;
	var project = this.project;
	this.$el = $('<div class="container-fluid">'
		+ '<div class="row">'
		+ '<div name="configPane" class="col-xs-2"></div>'
		+ '<div class="col-xs-10"><div style="position:relative;" name="chartDiv"></div></div>'
		+ '</div></div>');

	var formBuilder = new morpheus.FormBuilder({
		vertical: true
	});
	this.formBuilder = formBuilder;
	formBuilder.append({
		name: 'chart_type',
		type: 'bootstrap-select',
		options: ['boxplot', 'row scatter', 'column scatter', 'row profile', 'column profile']
	});
	var rowOptions = [];
	var columnOptions = [];
	var numericRowOptions = [];
	var numericColumnOptions = [];
	var options = [];
	var numericOptions = [];
	var updateOptions = function () {
		var dataset = project.getFullDataset();
		rowOptions = [{
			name: '(None)',
			value: ''
		}];
		columnOptions = [{
			name: '(None)',
			value: ''
		}];
		numericRowOptions = [{
			name: '(None)',
			value: ''
		}];
		numericColumnOptions = [{
			name: '(None)',
			value: ''
		}];
		options = [{
			name: '(None)',
			value: ''
		}];
		numericOptions = [{
			name: '(None)',
			value: ''
		}];

		morpheus.MetadataUtil.getMetadataNames(dataset.getRowMetadata())
		.forEach(
			function (name) {
				var dataType = morpheus.VectorUtil
				.getDataType(dataset.getRowMetadata()
				.getByName(name));
				if (dataType === 'number'
					|| dataType === '[number]') {
					numericRowOptions.push({
						name: name + ' (row)',
						value: name + '_r'
					});
				}
				rowOptions.push({
					name: name + ' (row)',
					value: name + '_r'
				});
			});

		morpheus.MetadataUtil.getMetadataNames(dataset.getColumnMetadata())
		.forEach(
			function (name) {
				var dataType = morpheus.VectorUtil
				.getDataType(dataset.getColumnMetadata()
				.getByName(name));
				if (dataType === 'number'
					|| dataType === '[number]') {
					numericColumnOptions.push({
						name: name + ' (column)',
						value: name + '_c'
					});
				}
				columnOptions.push({
					name: name + ' (column)',
					value: name + '_c'
				});
			});

		options = options.concat(rowOptions.slice(1));
		options = options.concat(columnOptions.slice(1));

		numericOptions = numericOptions.concat(numericRowOptions.slice(1));
		numericOptions = numericOptions.concat(numericColumnOptions.slice(1));
	};

	updateOptions();
	formBuilder.append({
		name: 'group_columns_by',
		type: 'bootstrap-select',
		options: options
	});
	formBuilder.append({
		name: 'group_rows_by',
		type: 'bootstrap-select',
		options: options
	});

	formBuilder.append({
		name: 'axis_label',
		type: 'bootstrap-select',
		options: rowOptions
	});
	formBuilder.append({
		name: 'show_points',
		type: 'checkbox',
		value: true
	});

	formBuilder.append({
		name: 'color',
		type: 'bootstrap-select',
		options: options
	});

	formBuilder.append({
		name: 'size',
		type: 'bootstrap-select',
		options: numericOptions
	});
	formBuilder.append({
		name: 'tooltip',
		type: 'bootstrap-select',
		multiple: true,
		search: true,
		options: options.slice(1)
	});

	function setVisibility() {
		// 'boxplot', 'row scatter', 'column scatter', 'row profile', 'column profile'
		var chartType = formBuilder.getValue('chart_type');
		formBuilder.setVisible('group_rows_by', chartType === 'boxplot');
		formBuilder.setVisible('group_columns_by', chartType === 'boxplot');
		if (chartType !== 'boxplot') {
			formBuilder.setOptions('axis_label',
				(chartType === 'row scatter' || chartType === 'column profile') ? rowOptions : columnOptions,
				true);
			formBuilder.setOptions('color',
				(chartType === 'row scatter' || chartType === 'column profile') ? columnOptions : rowOptions,
				true);
			formBuilder.setOptions('size',
				(chartType === 'row scatter' || chartType === 'row profile') ? numericColumnOptions
					: numericRowOptions, true);

		} else {
			formBuilder.setOptions('color', options, true);
			formBuilder.setOptions('size', numericOptions, true);
		}
		formBuilder.setVisible('axis_label', chartType !== 'boxplot');

	}

	this.tooltip = [];
	formBuilder.$form.find('select').on('change', function (e) {
		if ($(this).attr('name') === 'tooltip') {
			var tooltipVal = _this.formBuilder.getValue('tooltip');
			_this.tooltip = [];
			if (tooltipVal != null) {
				tooltipVal.forEach(function (tip) {
					_this.tooltip.push(morpheus.ChartTool2.getVectorInfo(tip));
				});
			}
		} else {
			setVisibility();
			_this.draw();
		}

	});
	formBuilder.$form.find('input').on('click', function () {
		_this.draw();
	});
	setVisibility();
	// chart types: boxplot, scatter
	// add: tooltip, color, size, allow boxplot and scatter of attributes?

	var draw = function () {
		_.debounce(_this.draw(), 100);
	};
	var trackChanged = function () {
		updateOptions();
		setVisibility();
		formBuilder.setOptions('group_columns_by', options, true);
		formBuilder.setOptions('group_rows_by', options, true);
	};

	project.getColumnSelectionModel().on('selectionChanged.chart', draw);
	project.getRowSelectionModel().on('selectionChanged.chart', draw);
	project.on('trackChanged.chart', trackChanged);
	this.$chart = this.$el.find('[name=chartDiv]');
	var $dialog = $('<div style="background:white;" title="Chart"></div>');
	var $configPane = this.$el.find('[name=configPane]');
	formBuilder.$form.appendTo($configPane);
	this.$el.appendTo($dialog);
	$dialog.dialog({
		close: function (event, ui) {
			project.off('trackChanged.chart', trackChanged);
			project.getRowSelectionModel().off('selectionChanged.chart', draw);
			project.getColumnSelectionModel().off('selectionChanged.chart',
				draw);
			_this.$el.empty();
		},

		resizable: true,
		height: 600,
		width: 900
	});
	this.$dialog = $dialog;
	this.draw();
};

morpheus.ChartTool2.getPlotlyDefaults = function () {
	var layout = {
		hovermode: 'closest',
		autosize: true,
		paper_bgcolor: 'rgb(255,255,255)',
		plot_bgcolor: 'rgb(229,229,229)',
		showlegend: false,
		margin: {
			l: 80,
			r: 0,
			t: 10,
			b: 14,
			autoexpand: true
		},
		xaxis: {
			zeroline: false,
			titlefont: {
				size: 12
			},
			gridcolor: 'rgb(255,255,255)',
			showgrid: true,
			showline: false,
			showticklabels: true,
			tickcolor: 'rgb(127,127,127)',
			ticks: 'outside'
		},
		yaxis: {
			zeroline: false,
			titlefont: {
				size: 12
			},
			gridcolor: 'rgb(255,255,255)',
			showgrid: true,
			showline: false,
			showticklabels: true,
			tickcolor: 'rgb(127,127,127)',
			ticks: 'outside'
		}
	};
	var config = {
		showLink: false,
		displaylogo: false,
		staticPlot: false,
		showHints: true,
		modeBarButtonsToRemove: ['sendDataToCloud']
	};
	return {
		layout: layout,
		config: config
	};
};

morpheus.ChartTool2.getVectorInfo = function (value) {
	var field = value.substring(0, value.length - 2);
	var isColumns = value.substring(value.length - 2) === '_c';
	return {
		field: field,
		isColumns: isColumns
	};
};
morpheus.ChartTool2.prototype = {
	annotate: function (options) {
		var _this = this;
		var formBuilder = new morpheus.FormBuilder();
		formBuilder.append({
			name: 'annotation_name',
			type: 'text',
			required: true
		});
		formBuilder.append({
			name: 'annotation_value',
			type: 'text',
			required: true
		});
		// formBuilder.append({
		// name : 'annotate',
		// type : 'radio',
		// required : true,
		// options : [ 'Rows', 'Columns', 'Rows And Columns' ],
		// value : 'Rows'
		// });
		morpheus.FormBuilder
		.showOkCancel({
			title: 'Annotate Selection',
			content: formBuilder.$form,
			okCallback: function () {
				var dataset = options.dataset;
				var eventData = options.eventData;
				var array = options.array;
				var value = formBuilder.getValue('annotation_value');
				var annotationName = formBuilder
				.getValue('annotation_name');
				// var annotate = formBuilder.getValue('annotate');
				var isRows = true;
				var isColumns = true;
				var existingRowVector = null;
				var rowVector = null;
				if (isRows) {
					existingRowVector = dataset.getRowMetadata()
					.getByName(annotationName);
					rowVector = dataset.getRowMetadata().add(
						annotationName);
				}
				var existingColumnVector = null;
				var columnVector = null;
				if (isColumns) {
					existingColumnVector = dataset.getColumnMetadata()
					.getByName(annotationName);
					columnVector = dataset.getColumnMetadata().add(
						annotationName);
				}

				for (var p = 0, nselected = eventData.points.length; p < nselected; p++) {
					var item = array[eventData.points[p].pointNumber];
					if (isRows) {
						if (_.isArray(item.row)) {
							item.row.forEach(function (r) {
								rowVector.setValue(r, value);
							});

						} else {
							rowVector.setValue(item.row, value);
						}

					}
					if (isColumns) {
						columnVector.setValue(item.column, value);
					}
				}
				if (isRows) {
					morpheus.VectorUtil
					.maybeConvertStringToNumber(rowVector);
					_this.project.trigger('trackChanged', {
						vectors: [rowVector],
						render: existingRowVector != null ? []
							: [morpheus.VectorTrack.RENDER.TEXT],
						columns: false
					});
				}
				if (isColumns) {
					morpheus.VectorUtil
					.maybeConvertStringToNumber(columnVector);
					_this.project.trigger('trackChanged', {
						vectors: [columnVector],
						render: existingColumnVector != null ? []
							: [morpheus.VectorTrack.RENDER.TEXT],
						columns: true
					});
				}
			}
		});

	},
	_createScatter: function (options) {
		var dataset = options.dataset;
		var colorByVector = options.colorByVector;
		var colorModel = options.colorModel;
		var sizeByVector = options.sizeByVector;
		var sizeFunction = options.sizeFunction;

		var heatmap = this.heatmap;
		var myPlot = options.myPlot;
		var isColumnChart = options.isColumnChart;
		// scatter
		var x = [];
		var y = [];
		var text = [];
		var color = colorByVector ? [] : '#1f78b4';
		var size = sizeByVector ? [] : 6;

		var array = [];
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			y.push(dataset.getValue(options.rowIndexOne, j));
			x.push(dataset.getValue(options.rowIndexTwo, j));
			array.push({
				row: [options.rowIndexOne, options.rowIndexTwo],
				column: j
			});
			if (colorByVector) {
				var colorByValue = colorByVector.getValue(j);
				color.push(colorModel.getMappedValue(colorByVector,
					colorByValue));
			}
			if (sizeByVector) {
				var sizeByValue = sizeByVector.getValue(j);
				size.push(sizeFunction(sizeByValue));
			}
			var obj = {
				j: j
			};
			obj.toString = function () {
				var s = [];
				for (var tipIndex = 0; tipIndex < _this.tooltip.length; tipIndex++) {
					var tip = _this.tooltip[tipIndex];
					if (tip.isColumns) {
						morpheus.HeatMapTooltipProvider.vectorToString(dataset.getColumnMetadata().getByName(tip.field),
							this.j, s, '<br>');
					}
				}

				return s.join('');

			};
			text.push(obj);
		}

		// TODO add R^2
		var trace = {
			x: x,
			y: y,
			marker: {
				color: color,
				size: size,
				symbol: 'circle-open'
			},
			text: text,
			mode: 'markers',
			type: 'scatter' // scattergl
		};
		var selection = null;
		var _this = this;
		var config = $
		.extend(
			true,
			{},
			options.config,
			{
				modeBarButtonsToAdd: [[{
					name: 'annotate',
					title: 'Annotate Selection',
					attr: 'dragmode',
					val: 'annotate',
					icon: {
						'width': 1792,
						'path': 'M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z',
						'ascent': 1792,
						'descent': 0
					},
					click: function () {
						if (!selection) {
							morpheus.FormBuilder
							.showInModal({
								title: 'Annotate Selection',
								html: 'Please select points in the chart',
								close: 'Close'
							});
						} else {
							_this.annotate({
								array: array,
								eventData: selection,
								dataset: dataset
							});
						}
					}
				}]]
			});
		Plotly.newPlot(myPlot, [trace], options.layout, config);
		myPlot.on('plotly_selected', function (eventData) {
			selection = eventData;
		});

	},
	_createProfile: function (options) {
		var dataset = options.dataset;
		// only allow coloring by row
		var colorByVector = options.colorByVector;
		var colorModel = options.colorModel;
		var sizeByVector = options.sizeByVector;
		var sizeFunction = options.sizeFunction;
		var axisLabelVector = options.axisLabelVector;
		var isColumnChart = options.isColumnChart;
		var heatmap = this.heatmap;
		var myPlot = options.myPlot;

		var traces = [];
		var ticktext = [];
		var tickvals = [];
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			ticktext.push(axisLabelVector != null ? axisLabelVector.getValue(j) : '' + j);
			tickvals.push(j);
		}
		for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
			// each row is a new trace
			var x = [];
			var y = [];
			var text = [];
			var size = sizeByVector ? [] : 6;
			var color = colorByVector ? colorModel.getMappedValue(colorByVector,
				colorByVector.getValue(i)) : undefined;

			for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
				x.push(j);
				y.push(dataset.getValue(i, j));

				if (sizeByVector) {
					var sizeByValue = sizeByVector.getValue(j);
					size.push(sizeFunction(sizeByValue));
				}
				var obj = {
					i: i,
					j: j
				};
				obj.toString = function () {
					var s = [];
					for (var tipIndex = 0; tipIndex < _this.tooltip.length; tipIndex++) {
						var tip = _this.tooltip[tipIndex];
						if (tip.isColumns) {
							morpheus.HeatMapTooltipProvider.vectorToString(dataset.getColumnMetadata().getByName(tip.field),
								this.j, s, '<br>');
						} else {
							morpheus.HeatMapTooltipProvider.vectorToString(dataset.getRowMetadata().getByName(tip.field),
								this.i, s, '<br>');
						}
					}

					return s.join('');

				};

				text.push(obj);
			}
			var trace = {
					x: x,
					y: y,
					name: colorByVector ? colorByVector.getValue(i) : '',
					tickmode: 'array',
					marker: {
						size: size,
						symbol: 'circle'
					},
					text: text,
					mode: 'lines' + (options.showPoints ? '+markers' : ''
					),
					type: 'scatter' // scattergl
				}
				;
			traces.push(trace);
		}

		var selection = null;
		var _this = this;
		options.layout.xaxis.tickvals = tickvals;
		options.layout.xaxis.ticktext = ticktext;
		options.layout.xaxis.tickmode = 'array';

		var config = $
		.extend(
			true,
			{},
			options.config,
			{
				modeBarButtonsToAdd: [[{
					name: 'annotate',
					title: 'Annotate Selection',
					attr: 'dragmode',
					val: 'annotate',
					icon: {
						'width': 1792,
						'path': 'M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z',
						'ascent': 1792,
						'descent': 0
					},
					click: function () {
						if (!selection) {
							morpheus.FormBuilder
							.showInModal({
								title: 'Annotate Selection',
								html: 'Please select points in the chart',
								close: 'Close'
							});
						} else {
							_this.annotate({
								eventData: selection,
								dataset: dataset
							});
						}
					}
				}]]
			});
		var $parent = $(myPlot).parent();
		options.layout.width = $parent.width();
		options.layout.height = this.$dialog.height() - 30;
		Plotly.newPlot(myPlot, traces, options.layout, config);
		myPlot.on('plotly_selected', function (eventData) {
			selection = eventData;
		});

		function resize() {
			var width = $parent.width();
			var height = _this.$dialog.height() - 30;
			Plotly.relayout(myPlot, {
				width: width,
				height: height
			});
		}

		this.$dialog.on('dialogresize', resize);
		$(myPlot).on('remove', function () {
			_this.$dialog.off('dialogresize');
		});

	},
	_createBoxPlot: function (options) {
		var array = options.array; // array of items
		var points = options.points;
		var colorByVector = options.colorByVector;
		var colorByGetter = options.colorByGetter;
		var colorModel = options.colorModel;
		var myPlot = options.myPlot;
		var dataset = options.dataset;
		var y = [];
		var color = points && colorByVector ? [] : '#1f78b4';
		var text = [];
		var x = [];
		var heatmap = this.heatmap;
		var sizeFunction = options.sizeFunction;
		var sizeByGetter = options.sizeByGetter;
		var size = sizeFunction ? [] : 6;
		var scale = d3.scale.linear().domain([0, 1]).range([-0.3, -1]);
		for (var k = 0, nitems = array.length; k < nitems; k++) {
			var item = array[k];
			y.push(dataset.getValue(item.row, item.column));
			if (points) {
				x.push(scale(Math.random()));
				if (colorByVector) {
					var colorByValue = colorByGetter(item);
					color.push(colorModel.getMappedValue(colorByVector,
						colorByValue));
				}
				if (sizeFunction) {
					var sizeByValue = sizeByGetter(item);
					size.push(sizeFunction(sizeByValue));
				}
				var obj = {
					i: item.row,
					j: item.column
				};
				obj.toString = function () {
					var s = [];
					for (var tipIndex = 0; tipIndex < _this.tooltip.length; tipIndex++) {
						var tip = _this.tooltip[tipIndex];
						if (tip.isColumns) {
							morpheus.HeatMapTooltipProvider.vectorToString(dataset.getColumnMetadata().getByName(tip.field),
								this.j, s, '<br>');
						} else {
							morpheus.HeatMapTooltipProvider.vectorToString(dataset.getRowMetadata().getByName(tip.field),
								this.i, s, '<br>');
						}
					}

					return s.join('');

				};
				text.push(obj);
			}

		}

		var traces = [{
			name: '',
			y: y,
			type: 'box',
			boxpoints: false
		}];
		if (points) {
			traces.push({
				name: '',
				x: x,
				y: y,
				hoverinfo: 'y+text',
				mode: 'markers',
				type: 'scatter',
				text: text,
				marker: {
					symbol: 'circle-open',
					size: size,
					color: color
				}
			});
		}
		var selection = null;
		var _this = this;
		var config = $
		.extend(
			true,
			{},
			options.config,
			{
				modeBarButtonsToAdd: [[{
					name: 'annotate',
					title: 'Annotate Selection',
					attr: 'dragmode',
					val: 'annotate',
					icon: {
						'width': 1792,
						'path': 'M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z',
						'ascent': 1792,
						'descent': 0
					},
					click: function () {
						if (!selection) {
							morpheus.FormBuilder
							.showInModal({
								title: 'Annotate Selection',
								html: 'Please select points in the chart',
								close: 'Close'
							});
						} else {
							_this.annotate({
								array: array,
								eventData: selection,
								dataset: dataset
							});
						}
					}
				}]]
			});

		Plotly.newPlot(myPlot, traces, options.layout, config);
		myPlot.on('plotly_selected', function (eventData) {
			selection = eventData;
		});

	},
	draw: function () {
		var _this = this;
		this.$chart.empty();
		var plotlyDefaults = morpheus.ChartTool2.getPlotlyDefaults();
		var layout = plotlyDefaults.layout;
		var config = plotlyDefaults.config;
		var chartWidth = 400;
		var chartHeight = 400;
		var showPoints = this.formBuilder.getValue('show_points');

		var groupColumnsBy = this.formBuilder.getValue('group_columns_by');
		var axisLabel = this.formBuilder.getValue('axis_label');
		var colorBy = this.formBuilder.getValue('color');
		var sizeBy = this.formBuilder.getValue('size');
		var groupRowsBy = this.formBuilder.getValue('group_rows_by');
		var chartType = this.formBuilder.getValue('chart_type');

		var dataset = this.project.getSelectedDataset({
			emptyToAll: false
		});
		this.dataset = dataset;
		if (dataset.getRowCount() * dataset.getColumnCount() === 0) {
			$('<h4>Please select rows and columns in the heat map.</h4>')
			.appendTo(this.$chart);
			return;
		}
		if ((dataset.getRowCount() * dataset.getColumnCount()) > 100000) {
			showPoints = false;
		}

		var grid = [];
		var rowIds = [undefined];
		var columnIds = [undefined];
		var items = [];
		var heatmap = this.heatmap;
		var colorByInfo = morpheus.ChartTool2.getVectorInfo(colorBy);
		var sizeByInfo = morpheus.ChartTool2.getVectorInfo(sizeBy);
		var colorModel = !colorByInfo.isColumns ? this.project.getRowColorModel()
			: this.project.getColumnColorModel();
		var axisLabelInfo = morpheus.ChartTool2.getVectorInfo(axisLabel);
		var axisLabelVector = axisLabelInfo.isColumns ? dataset.getColumnMetadata().getByName(axisLabelInfo.field) : dataset.getRowMetadata().getByName(
			axisLabelInfo.field);
		var sizeByVector = sizeByInfo.isColumns ? dataset.getColumnMetadata().getByName(sizeByInfo.field) : dataset.getRowMetadata().getByName(
			sizeByInfo.field);
		var colorByVector = colorByInfo.isColumns ? dataset.getColumnMetadata().getByName(colorByInfo.field) : dataset.getRowMetadata().getByName(
			colorByInfo.field);

		var sizeByScale = null;
		if (sizeByVector) {
			var minMax = morpheus.VectorUtil.getMinMax(sizeByVector);
			sizeByScale = d3.scale.linear().domain(
				[minMax.min, minMax.max]).range([3, 16])
			.clamp(true);
		}
		if (chartType === 'row profile' || chartType === 'column profile') {
			var $chart = $('<div></div>');
			var myPlot = $chart[0];
			$chart.appendTo(this.$chart);
			if (chartType === 'column profile') {
				dataset = new morpheus.TransposedDatasetView(dataset);
			}
			this
			._createProfile({
				showPoints: showPoints,
				isColumnChart: chartType === 'column profile',
				axisLabelVector: axisLabelVector,
				colorByVector: colorByVector,
				colorModel: colorModel,
				sizeByVector: sizeByVector,
				sizeFunction: sizeByScale,
				myPlot: myPlot,
				dataset: dataset,
				config: config,
				layout: $
				.extend(
					true,
					{},
					layout,
					{
						showlegend: true,
						width: chartWidth,
						height: chartHeight,
						margin: {
							b: 80
						},
						yaxis: {},
						xaxis: {}
					})
			});
		}
		if (chartType === 'row scatter' || chartType === 'column scatter') {
			var transpose = chartType === 'column scatter';

			if (transpose) {
				dataset = new morpheus.TransposedDatasetView(dataset);
			}
			if (dataset.getRowCount() > 20) {
				$('<h4>Maximum chart size exceeded.</h4>')
				.appendTo(this.$chart);
				return;
			}

			// rowIndexOne is along rows of chart (y axis), rowIndexTwo along x
			// axis

			// draw grid
			for (var rowIndexOne = 0, nrows = dataset.getRowCount(); rowIndexOne < nrows; rowIndexOne++) {
				for (var rowIndexTwo = 0; rowIndexTwo < nrows; rowIndexTwo++) {
					if (rowIndexOne > rowIndexTwo) {
						continue;
					}
					var $chart = $('<div style="width:' + chartWidth
						+ 'px;height:' + chartHeight
						+ 'px;position:absolute;left:'
						+ (rowIndexTwo * chartWidth) + 'px;top:'
						+ (rowIndexOne * chartHeight) + 'px;"></div>');
					var myPlot = $chart[0];
					$chart.appendTo(this.$chart);

					if (rowIndexOne === rowIndexTwo) { // boxplot
						var array = [];
						for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
							array.push({
								row: rowIndexTwo,
								column: j
							});
						}

						this
						._createBoxPlot({
							array: array,
							points: showPoints,
							colorByVector: colorByVector,
							colorModel: colorModel,
							colorByGetter: function (item) {
								return colorByVector
								.getValue(item.column);
							},
							sizeByGetter: function (item) {
								return sizeByVector
								.getValue(item.column);
							},
							sizeFunction: sizeByScale,
							myPlot: myPlot,
							dataset: dataset,
							config: config,
							transposed: isColumns,
							layout: $
							.extend(
								true,
								{},
								layout,
								{
									width: chartWidth,
									height: chartHeight,
									margin: {
										b: 80
									},
									xaxis: {
										title: axisLabelVector == null ? ''
											: axisLabelVector
										.getValue(rowIndexTwo),
										showticklabels: false
									}
								})
						});

					} else {
						this
						._createScatter({
							isColumnChart: transpose,
							rowIndexOne: rowIndexOne,
							rowIndexTwo: rowIndexTwo,
							colorByVector: colorByVector,
							colorModel: colorModel,
							colorByGetter: function (item) {
								return colorByVector
								.getValue(item.column);
							},
							sizeByVector: sizeByVector,
							sizeFunction: sizeByScale,
							myPlot: myPlot,
							dataset: dataset,
							config: config,
							layout: $
							.extend(
								true,
								{},
								layout,
								{
									width: chartWidth,
									height: chartHeight,
									margin: {
										b: 80
									},
									yaxis: {
										title: axisLabelVector == null ? ''
											: axisLabelVector
										.getValue(rowIndexOne),
									},
									xaxis: {
										title: axisLabelVector == null ? ''
											: axisLabelVector
										.getValue(rowIndexTwo)
									}
								})
						});

					}
				}
			}
		} else if (chartType === 'boxplot') {
			for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
				for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
					items.push({
						row: i,
						column: j
					});
				}
			}
			var colorByInfo = morpheus.ChartTool2.getVectorInfo(colorBy);
			var colorByVector = colorByInfo.isColumns ? dataset.getColumnMetadata()
			.getByName(colorByInfo.field) : dataset.getRowMetadata()
			.getByName(colorByInfo.field);

			var colorModel = !colorByInfo.isColumns ? this.project
			.getRowColorModel() : this.project.getColumnColorModel();
			var colorByGetter = colorByInfo.isColumns ? function (item) {
				return colorByVector.getValue(item.column);
			} : function (item) {
				return colorByVector.getValue(item.row);
			};
			var sizeByVector = sizeByInfo.isColumns ? dataset.getColumnMetadata()
			.getByName(sizeByInfo.field) : dataset.getRowMetadata()
			.getByName(sizeByInfo.field);
			var sizeByGetter = sizeByInfo.isColumns ? function (item) {
				return sizeByVector.getValue(item.column);
			} : function (item) {
				return sizeByVector.getValue(item.row);
			};
			var sizeByScale = null;
			if (sizeByVector) {
				var minMax = morpheus.VectorUtil.getMinMax(sizeByVector);
				sizeByScale = d3.scale.linear().domain([minMax.min, minMax.max])
				.range([3, 16]).clamp(true);
			}
			if (groupColumnsBy || groupRowsBy) {
				var rowIdToArray = new morpheus.Map();
				if (groupRowsBy) {
					var groupRowsByInfo = morpheus.ChartTool2
					.getVectorInfo(groupRowsBy);
					var vector = groupRowsByInfo.isColumns ? dataset
					.getColumnMetadata().getByName(groupRowsByInfo.field)
						: dataset.getRowMetadata().getByName(
						groupRowsByInfo.field);

					var getter = groupRowsByInfo.isColumns ? function (item) {
						return vector.getValue(item.column);
					} : function (item) {
						return vector.getValue(item.row);
					};

					for (var i = 0, nitems = items.length; i < nitems; i++) {
						var item = items[i];
						var value = getter(item);
						var array = rowIdToArray.get(value);
						if (array == undefined) {
							array = [];
							rowIdToArray.set(value, array);
						}
						array.push(item);
					}
				} else {
					rowIdToArray.set(undefined, items);
				}

				if (groupColumnsBy) {
					var name = groupColumnsBy.substring(0,
						groupColumnsBy.length - 2);
					var isColumns = groupColumnsBy
						.substring(groupColumnsBy.length - 2) === '_c';
					var vector = isColumns ? dataset.getColumnMetadata().getByName(
						name) : dataset.getRowMetadata().getByName(name);
					var getter = isColumns ? function (item) {
						return vector.getValue(item.column);
					} : function (item) {
						return vector.getValue(item.row);
					};

					var columnIdToIndex = new morpheus.Map();
					var rowIndex = 0;
					rowIdToArray.forEach(function (array, id) {
						grid[rowIndex] = [];
						for (var i = 0, nitems = array.length; i < nitems; i++) {
							var item = array[i];
							var value = getter(item);
							var columnIndex = columnIdToIndex.get(value);
							if (columnIndex === undefined) {
								columnIndex = columnIdToIndex.size();
								columnIdToIndex.set(value, columnIndex);
							}
							if (grid[rowIndex][columnIndex] === undefined) {
								grid[rowIndex][columnIndex] = [];
							}

							grid[rowIndex][columnIndex].push(item);
						}
						rowIds[rowIndex] = id;
						rowIndex++;
					});
					columnIdToIndex.forEach(function (index, id) {
						columnIds[index] = id;
					});

				} else {
					var rowIndex = 0;
					rowIdToArray.forEach(function (array, id) {
						grid[rowIndex] = [array];
						rowIds[rowIndex] = id;
						rowIndex++;
					});
				}

			} else {
				grid = [[items]];
			}

			var gridRowCount = rowIds.length;
			var gridColumnCount = columnIds.length;

			for (var i = 0; i < gridRowCount; i++) {
				var rowId = rowIds[i];
				var yrange = [Number.MAX_VALUE, -Number.MAX_VALUE];
				if (chartType === 'boxplot') {
					for (var j = 0; j < gridColumnCount; j++) {
						var array = grid[i][j];
						if (array) {
							for (var k = 0, nitems = array.length; k < nitems; k++) {
								var item = array[k];
								var value = dataset.getValue(item.row, item.column);
								if (!isNaN(value)) {
									yrange[0] = Math.min(yrange[0], value);
									yrange[1] = Math.max(yrange[1], value);
								}

							}
						}
					}
					// for now increase range by 1%
					var span = yrange[1] - yrange[0];
					var delta = (span * 0.01);
					yrange[1] += delta;
					yrange[0] -= delta;
				}
				for (var j = 0; j < gridColumnCount; j++) {
					var array = grid[i][j];
					var columnId = columnIds[j];
					if (array) {

						var $chart = $('<div style="width:' + chartWidth
							+ 'px;height:' + chartHeight
							+ 'px;position:absolute;left:' + (j * chartWidth)
							+ 'px;top:' + (i * chartHeight) + 'px;"></div>');
						$chart.appendTo(this.$chart);
						var myPlot = $chart[0];
						if (chartType === 'boxplot') {

							this._createBoxPlot({
								layout: $.extend(true, {}, layout, {
									width: chartWidth,
									height: chartHeight,
									yaxis: {
										range: yrange,
										title: rowId,
									},
									xaxis: {
										title: columnId,
										showticklabels: false
									}
								}),
								array: array,
								points: showPoints,
								sizeByGetter: sizeByGetter,
								sizeFunction: sizeByScale,
								colorModel: colorModel,
								colorByVector: colorByVector,
								colorByGetter: colorByGetter,
								myPlot: myPlot,
								dataset: dataset,
								config: config
							});
						}

					}
				}

			}
		}

	}
};

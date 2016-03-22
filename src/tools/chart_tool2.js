/**
 * @param chartOptions.project
 *            morpheus.Project
 * @param chartOptions.getVisibleTrackNames
 *            {Function}
 */
morpheus.ChartTool2 = function(chartOptions) {
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
		vertical : true
	});
	this.formBuilder = formBuilder;
	formBuilder.append({
		name : 'chart_type',
		type : 'select',
		options : [ 'boxplot', 'row scatter', 'column scatter' ]
	});
	var rowOptions = [];
	var columnOptions = [];
	var numericRowOptions = [];
	var numericColumnOptions = [];
	var options = [];
	var numericOptions = [];
	var updateOptions = function() {
		var dataset = project.getFullDataset();
		rowOptions = [ {
			name : '(None)',
			value : ''
		} ];
		columnOptions = [ {
			name : '(None)',
			value : ''
		} ];
		numericRowOptions = [ {
			name : '(None)',
			value : ''
		} ];
		numericColumnOptions = [ {
			name : '(None)',
			value : ''
		} ];
		options = [ {
			name : '(None)',
			value : ''
		} ];
		numericOptions = [ {
			name : '(None)',
			value : ''
		} ];

		morpheus.MetadataUtil.getMetadataNames(dataset.getRowMetadata())
				.forEach(
						function(name) {
							var dataType = morpheus.VectorUtil
									.getDataType(dataset.getRowMetadata()
											.getByName(name));
							if (dataType === 'number'
									|| dataType === '[number]') {
								numericRowOptions.push({
									name : name + ' (row)',
									value : name + '_r'
								});
							}
							rowOptions.push({
								name : name + ' (row)',
								value : name + '_r'
							});
						});

		morpheus.MetadataUtil.getMetadataNames(dataset.getColumnMetadata())
				.forEach(
						function(name) {
							var dataType = morpheus.VectorUtil
									.getDataType(dataset.getColumnMetadata()
											.getByName(name));
							if (dataType === 'number'
									|| dataType === '[number]') {
								numericColumnOptions.push({
									name : name + ' (column)',
									value : name + '_c'
								});
							}
							columnOptions.push({
								name : name + ' (column)',
								value : name + '_c'
							});
						});

		options = options.concat(rowOptions.slice(1));
		options = options.concat(columnOptions.slice(1));

		numericOptions = numericOptions.concat(numericRowOptions.slice(1));
		numericOptions = numericOptions.concat(numericColumnOptions.slice(1));
	};

	updateOptions();
	formBuilder.append({
		name : 'group_columns_by',
		type : 'select',
		options : options
	});
	formBuilder.append({
		name : 'group_rows_by',
		type : 'select',
		options : options
	});

	formBuilder.append({
		name : 'axis_label',
		type : 'select',
		options : rowOptions
	});
	formBuilder.append({
		name : 'show_points',
		type : 'checkbox',
		value : true
	});

	formBuilder.append({
		name : 'color',
		type : 'select',
		options : options
	});

	formBuilder.append({
		name : 'size',
		type : 'select',
		options : numericOptions
	});

	function setVisibility() {
		var chartType = formBuilder.getValue('chart_type');
		var isBoxplot = chartType === 'boxplot';
		// formBuilder.setVisible('points', isBoxplot);
		formBuilder.setVisible('group_rows_by', isBoxplot);
		formBuilder.setVisible('group_columns_by', isBoxplot);
		if (!isBoxplot) {
			formBuilder.setOptions('axis_label',
					chartType === 'row scatter' ? rowOptions : columnOptions,
					true);
			formBuilder.setOptions('color',
					chartType === 'row scatter' ? columnOptions : rowOptions,
					true);
			formBuilder.setOptions('size',
					chartType === 'row scatter' ? numericColumnOptions
							: numericRowOptions, true);

		} else {
			formBuilder.setOptions('color', options, true);
			formBuilder.setOptions('size', numericOptions, true);
		}
		formBuilder.setVisible('axis_label', !isBoxplot);

	}
	formBuilder.$form.find('select').on('change', function() {
		setVisibility();
		_this.draw();
	});
	formBuilder.$form.find('input').on('click', function() {
		_this.draw();
	});
	setVisibility();
	// chart types: boxplot, scatter
	// add: tooltip, color, size, allow boxplot and scatter of attributes?

	var draw = function() {
		_.debounce(_this.draw(), 100);
	};
	var trackChanged = function() {
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
		close : function(event, ui) {
			project.off('trackChanged.chart', trackChanged);
			project.getRowSelectionModel().off('selectionChanged.chart', draw);
			project.getColumnSelectionModel().off('selectionChanged.chart',
					draw);
			_this.$el.empty();
		},
		resizable : true,
		height : 600,
		width : 900
	});
	this.draw();
};

morpheus.ChartTool2.getPlotlyDefaults = function() {
	var layout = {
		autosize : false,
		paper_bgcolor : 'rgb(255,255,255)',
		plot_bgcolor : 'rgb(229,229,229)',
		showlegend : false,
		margin : {
			l : 80,
			r : 0,
			t : 10,
			b : 14,
			autoexpand : true
		},
		xaxis : {
			zeroline : false,
			titlefont : {
				size : 12
			},
			gridcolor : 'rgb(255,255,255)',
			showgrid : true,
			showline : false,
			showticklabels : true,
			tickcolor : 'rgb(127,127,127)',
			ticks : 'outside',
			type : 'linear'
		},
		yaxis : {
			zeroline : false,
			titlefont : {
				size : 12
			},
			gridcolor : 'rgb(255,255,255)',
			showgrid : true,
			showline : false,
			showticklabels : true,
			tickcolor : 'rgb(127,127,127)',
			ticks : 'outside',
			type : 'linear'
		}
	};
	var config = {
		showLink : false,
		displaylogo : false,
		staticPlot : false,
		showHints : true,
		modeBarButtonsToRemove : [ 'sendDataToCloud' ]
	};
	return {
		layout : layout,
		config : config
	};
};

morpheus.ChartTool2.getVectorInfo = function(value) {
	var field = value.substring(0, value.length - 2);
	var isColumns = value.substring(value.length - 2) === '_c';
	return {
		field : field,
		isColumns : isColumns
	};
};
morpheus.ChartTool2.prototype = {
	annotate : function(options) {
		var _this = this;
		var formBuilder = new morpheus.FormBuilder();
		formBuilder.append({
			name : 'annotation_name',
			type : 'text',
			required : true
		});
		formBuilder.append({
			name : 'annotation_value',
			type : 'text',
			required : true
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
					title : 'Annotate Selection',
					content : formBuilder.$form,
					okCallback : function() {
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
									item.row.forEach(function(r) {
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
								vectors : [ rowVector ],
								render : existingRowVector != null ? []
										: [ morpheus.VectorTrack.RENDER.TEXT ],
								columns : false
							});
						}
						if (isColumns) {
							morpheus.VectorUtil
									.maybeConvertStringToNumber(columnVector);
							_this.project.trigger('trackChanged', {
								vectors : [ columnVector ],
								render : existingColumnVector != null ? []
										: [ morpheus.VectorTrack.RENDER.TEXT ],
								columns : true
							});
						}
					}
				});

	},
	_createScatter : function(options) {
		var dataset = options.dataset;
		var colorByVector = options.colorByVector;
		var colorModel = options.colorModel;
		var sizeByVector = options.sizeByVector;
		var sizeFunction = options.sizeFunction;

		var heatmap = this.heatmap;
		var myPlot = options.myPlot;
		var isColumnScatter = options.isColumnScatter;
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
				row : [ options.rowIndexOne, options.rowIndexTwo ],
				column : j
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
				j : j
			};
			obj.toString = function() {
				var trackNames = _this.getVisibleTrackNames(!isColumnScatter);
				var s = [];

				for (var i = 0; i < trackNames.length; i++) {
					var v = dataset.getColumnMetadata()
							.getByName(trackNames[i]);
					if (v) {
						morpheus.HeatMapTooltipProvider.vectorToString(v,
								this.j, s, '<br>');
					}

				}
				return s.join('');

			};
			text.push(obj);
		}

		// TODO add R^2
		var trace = {
			x : x,
			y : y,
			marker : {
				color : color,
				size : size,
				symbol : 'circle-open'
			},
			text : text,
			mode : 'markers',
			type : 'scatter' // scattergl
		};
		var selection = null;
		var _this = this;
		var config = $
				.extend(
						true,
						{},
						options.config,
			{
				modeBarButtonsToAdd : [ [ {
					name : 'annotate',
					title : 'Annotate Selection',
					attr : 'dragmode',
					val : 'annotate',
					icon : {
						'width' : 1792,
						'path' : 'M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z',
						'ascent' : 1792,
						'descent' : 0
					},
					click : function() {
						if (!selection) {
							morpheus.FormBuilder
												.showInModal({
													title : 'Annotate Selection',
													html : 'Please select points in the chart',
													close : 'Close'
												});
						} else {
							_this.annotate({
											array : array,
											eventData : selection,
											dataset : dataset
										});
						}
					}
				} ] ]
			});
		Plotly.newPlot(myPlot, [ trace ], options.layout, config);

		myPlot.on('plotly_selected', function(eventData) {
			selection = eventData;
		});

	},
	_createBoxPlot : function(options) {
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
		var scale = d3.scale.linear().domain([ 0, 1 ]).range([ -0.3, -1 ]);
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
					row : item.row,
					column : item.column
				};
				obj.toString = function() {
					var s = [];
					var trackNames = _this.getVisibleTrackNames(true);

					for (var trackIndex = 0; trackIndex < trackNames.length; trackIndex++) {
						var v = dataset.getColumnMetadata().getByName(
								trackNames[trackIndex]);
						if (v) {
							morpheus.HeatMapTooltipProvider.vectorToString(v,
									this.column, s, '<br>');
						}

					}

					trackNames = _this.getVisibleTrackNames(false);

					for (var trackIndex = 0; trackIndex < trackNames.length; trackIndex++) {
						var v = dataset.getRowMetadata().getByName(
								trackNames[trackIndex]);
						if (v) {
							morpheus.HeatMapTooltipProvider.vectorToString(v,
									this.row, s, '<br>');
						}

					}
					return s.join('');

				};
				text.push(obj);
			}

		}

		var traces = [ {
			name : '',
			y : y,
			type : 'box',
			boxpoints : false
		} ];
		if (points) {
			traces.push({
				name : '',
				x : x,
				y : y,
				hoverinfo : 'y+text',
				mode : 'markers',
				type : 'scatter',
				text : text,
				marker : {
					symbol : 'circle-open',
					size : size,
					color : color
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
				modeBarButtonsToAdd : [ [ {
					name : 'annotate',
					title : 'Annotate Selection',
					attr : 'dragmode',
					val : 'annotate',
					icon : {
						'width' : 1792,
						'path' : 'M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z',
						'ascent' : 1792,
						'descent' : 0
					},
					click : function() {
						if (!selection) {
							morpheus.FormBuilder
												.showInModal({
													title : 'Annotate Selection',
													html : 'Please select points in the chart',
													close : 'Close'
												});
						} else {
							_this.annotate({
											array : array,
											eventData : selection,
											dataset : dataset
										});
						}
					}
				} ] ]
			});

		Plotly.newPlot(myPlot, traces, options.layout, config);
		myPlot.on('plotly_selected', function(eventData) {
			selection = eventData;
		});

	},
	draw : function() {
		var _this = this;
		this.$chart.empty();
		var plotlyDefaults = morpheus.ChartTool2.getPlotlyDefaults();
		var layout = plotlyDefaults.layout;
		var config = plotlyDefaults.config;
		var chartWidth = 400;
		var chartHeight = 400;
		var points = this.formBuilder.getValue('show_points');

		var groupColumnsBy = this.formBuilder.getValue('group_columns_by');
		var titleBy = this.formBuilder.getValue('axis_label');
		var colorBy = this.formBuilder.getValue('color');
		var sizeBy = this.formBuilder.getValue('size');
		var groupRowsBy = this.formBuilder.getValue('group_rows_by');
		var chartType = this.formBuilder.getValue('chart_type');

		var dataset = this.project.getSelectedDataset({
			emptyToAll : false
		});
		this.dataset = dataset;
		if (dataset.getRowCount() * dataset.getColumnCount() === 0) {
			$('<h4>Please select rows and columns in the heat map.</h4>')
					.appendTo(this.$chart);
			return;
		}
		if ((dataset.getRowCount() * dataset.getColumnCount()) > 100000) {
			points = false;
		}

		var grid = [];
		var rowIds = [ undefined ];
		var columnIds = [ undefined ];
		var items = [];
		var heatmap = this.heatmap;
		var colorByInfo = morpheus.ChartTool2.getVectorInfo(colorBy);
		var sizeByInfo = morpheus.ChartTool2.getVectorInfo(sizeBy);
		if (chartType === 'row scatter' || chartType === 'column scatter') {

			var titleInfo = morpheus.ChartTool2.getVectorInfo(titleBy);

			var isColumnScatter = chartType === 'column scatter';
			if (isColumnScatter) {
				dataset = new morpheus.TransposedDatasetView(dataset);
			}
			if (dataset.getRowCount() > 15) {
				$('<h4>Maximum chart size exceeded.</h4>')
						.appendTo(this.$chart);
				return;
			}
			// title vector is always rows
			var titleVector = dataset.getRowMetadata().getByName(
					titleInfo.field);
			// color vector is always columns
			var colorByVector = dataset.getColumnMetadata().getByName(
					colorByInfo.field);
			var colorModel = isColumnScatter ? this.project.getRowColorModel()
					: this.project.getColumnColorModel();

			// size by vector is always columns
			var sizeByVector = dataset.getColumnMetadata().getByName(
					sizeByInfo.field);
			// rowIndexOne is along rows of chart (y axis), rowIndexTwo along x
			// axis
			var sizeByScale = null;
			if (sizeByVector) {
				var minMax = morpheus.VectorUtil.getMinMax(sizeByVector);
				sizeByScale = d3.scale.linear().domain(
						[ minMax.min, minMax.max ]).range([ 3, 16 ])
						.clamp(true);
			}
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
								row : rowIndexTwo,
								column : j
							});
						}

						this
								._createBoxPlot({
									array : array,
									points : points,
									colorByVector : colorByVector,
									colorModel : colorModel,
									colorByGetter : function(item) {
										return colorByVector
												.getValue(item.column);
									},
									sizeByGetter : function(item) {
										return sizeByVector
												.getValue(item.column);
									},
									sizeFunction : sizeByScale,
									myPlot : myPlot,
									dataset : dataset,
									config : config,
									transposed : isColumns,
									layout : $
											.extend(
													true,
													{},
													layout,
										{
											width : chartWidth,
											height : chartHeight,
											margin : {
												b : 80
											},
											xaxis : {
												title : titleVector == null ? ''
																	: titleVector
																			.getValue(rowIndexTwo),
												showticklabels : false
											}
										})
								});

					} else {
						this
								._createScatter({
									isColumnScatter : isColumnScatter,
									rowIndexOne : rowIndexOne,
									rowIndexTwo : rowIndexTwo,
									colorByVector : colorByVector,
									colorModel : colorModel,
									colorByGetter : function(item) {
										return colorByVector
												.getValue(item.column);
									},
									sizeByVector : sizeByVector,
									sizeFunction : sizeByScale,
									myPlot : myPlot,
									dataset : dataset,
									config : config,
									layout : $
											.extend(
													true,
													{},
													layout,
										{
											width : chartWidth,
											height : chartHeight,
											margin : {
												b : 80
											},
											yaxis : {
												title : titleVector == null ? ''
																	: titleVector
																			.getValue(rowIndexOne),
											},
											xaxis : {
												title : titleVector == null ? ''
																	: titleVector
																			.getValue(rowIndexTwo)
											}
										})
								});

					}

				}
			}
			return;
		}

		// boxplot
		for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
			for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
				items.push({
					row : i,
					column : j
				});
			}
		}
		var colorByInfo = morpheus.ChartTool2.getVectorInfo(colorBy);
		var colorByVector = colorByInfo.isColumns ? dataset.getColumnMetadata()
				.getByName(colorByInfo.field) : dataset.getRowMetadata()
				.getByName(colorByInfo.field);

		var colorModel = !colorByInfo.isColumns ? this.project
				.getRowColorModel() : this.project.getColumnColorModel();
		var colorByGetter = colorByInfo.isColumns ? function(item) {
			return colorByVector.getValue(item.column);
		} : function(item) {
			return colorByVector.getValue(item.row);
		};
		var sizeByVector = sizeByInfo.isColumns ? dataset.getColumnMetadata()
				.getByName(sizeByInfo.field) : dataset.getRowMetadata()
				.getByName(sizeByInfo.field);
		var sizeByGetter = sizeByInfo.isColumns ? function(item) {
			return sizeByVector.getValue(item.column);
		} : function(item) {
			return sizeByVector.getValue(item.row);
		};
		var sizeByScale = null;
		if (sizeByVector) {
			var minMax = morpheus.VectorUtil.getMinMax(sizeByVector);
			sizeByScale = d3.scale.linear().domain([ minMax.min, minMax.max ])
					.range([ 3, 16 ]).clamp(true);
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

				var getter = groupRowsByInfo.isColumns ? function(item) {
					return vector.getValue(item.column);
				} : function(item) {
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
				var getter = isColumns ? function(item) {
					return vector.getValue(item.column);
				} : function(item) {
					return vector.getValue(item.row);
				};

				var columnIdToIndex = new morpheus.Map();
				var rowIndex = 0;
				rowIdToArray.forEach(function(array, id) {
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
				columnIdToIndex.forEach(function(index, id) {
					columnIds[index] = id;
				});

			} else {
				var rowIndex = 0;
				rowIdToArray.forEach(function(array, id) {
					grid[rowIndex] = [ array ];
					rowIds[rowIndex] = id;
					rowIndex++;
				});
			}

		} else {
			grid = [ [ items ] ];
		}

		var gridRowCount = rowIds.length;
		var gridColumnCount = columnIds.length;

		for (var i = 0; i < gridRowCount; i++) {
			var rowId = rowIds[i];
			var yrange = [ Number.MAX_VALUE, -Number.MAX_VALUE ];
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
							layout : $.extend(true, {}, layout, {
								width : chartWidth,
								height : chartHeight,
								yaxis : {
									range : yrange,
									title : rowId,
								},
								xaxis : {
									title : columnId,
									showticklabels : false
								}
							}),
							array : array,
							points : points,
							sizeByGetter : sizeByGetter,
							sizeFunction : sizeByScale,
							colorModel : colorModel,
							colorByVector : colorByVector,
							colorByGetter : colorByGetter,
							myPlot : myPlot,
							dataset : dataset,
							config : config
						});
					}

				}

			}
		}

	}
};
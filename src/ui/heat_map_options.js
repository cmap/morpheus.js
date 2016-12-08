morpheus.HeatMapOptions = function (controller) {
	var items = [
		{
			name: 'color_by',
			required: true,
			help: 'Use a different color scheme for distinct row annotation values',
			type: 'select',
			options: ['(None)'].concat(morpheus.MetadataUtil
			.getMetadataNames(controller.getProject()
			.getFullDataset().getRowMetadata())),
			value: controller.heatmap.getColorScheme()
			.getSeparateColorSchemeForRowMetadataField()
		}, {
			name: 'color_by_value',
			required: true,
			type: 'select',
			options: []
		}, {
			name: 'load_predefined_scheme',
			required: true,
			type: 'select',
			options: [{
				name: '',
				value: ''
			}, {
				name: 'relative',
				value: 'gene'
			}, {
				name: 'binary',
				value: 'binary'
			}, {
				name: 'MAF',
				value: 'MAF'
			}, {
				name: 'fixed (-1, -0.5, 0.5, 1)',
				value: 'wtcs'
			}, {
				name: 'fixed (-1.5, -0.1, 0.1, 1.5)',
				value: 'cn'
			}, {
				name: 'fixed (-100, -98, -95, 95, 98, 100)',
				value: '100scale2'
			}, {
				name: 'fixed (-100, -98, 98, 100)',
				value: '100scale1'
			}]
		}, {
			name: 'save_color_scheme',
			type: 'button'
		}, {
			name: 'load_color_scheme',
			type: 'file'
		}];

	items.push({
		name: 'size_by',
		required: true,
		type: 'select',
		options: ['(None)'].concat(morpheus.DatasetUtil
		.getSeriesNames(controller.getProject().getFullDataset()))
	});
	items.push({
		name: 'size_by_minimum',
		title: 'Size by minimum',
		required: true,
		type: 'text',
		col: 'col-xs-4'
	});
	items.push({
		name: 'size_by_maximum',
		title: 'Size by maximum',
		required: true,
		type: 'text',
		col: 'col-xs-4'
	});

	items.push({
		name: 'conditional_rendering',
		required: true,
		type: 'button',
		col: 'col-xs-4'
	});

	var displayItems = [
		{
			disabled: controller.getProject().getFullDataset().getColumnCount() !== controller.getProject().getFullDataset().getRowCount(),
			name: 'link_rows_and_columns',
			required: true,
			type: 'checkbox',
			col: 'col-xs-4',
			value: controller.getProject().__symmetricProjectListener != null
		},
		{
			name: 'show_grid',
			required: true,
			type: 'checkbox',
			value: controller.heatmap.isDrawGrid()
		},
		{
			name: 'grid_thickness',
			required: true,
			type: 'text',
			col: 'col-xs-4',
			value: morpheus.Util.nf(controller.heatmap.getGridThickness())
		},
		{
			name: 'grid_color',
			required: true,
			type: 'color',
			col: 'col-xs-2',
			value: controller.heatmap.getGridColor()
		},
		{
			name: 'row_size',
			required: true,
			type: 'text',
			col: 'col-xs-4',
			value: morpheus.Util.nf(controller.heatmap.getRowPositions()
			.getSize())
		},
		{
			name: 'column_size',
			required: true,
			type: 'text',
			col: 'col-xs-4',
			value: morpheus.Util.nf(controller.heatmap
			.getColumnPositions().getSize())
		}, {
			name: 'show_values',
			required: true,
			type: 'checkbox',
			value: controller.heatmap.isDrawValues()
		}];
	if (controller.rowDendrogram) {
		displayItems
		.push({
			name: 'row_dendrogram_line_thickness',
			required: true,
			type: 'text',
			col: 'col-xs-4',
			value: morpheus.Util
			.nf(controller.rowDendrogram ? controller.rowDendrogram.lineWidth
				: 1)
		});
	}
	if (controller.columnDendrogram) {
		displayItems
		.push({
			name: 'column_dendrogram_line_thickness',
			required: true,
			type: 'text',
			col: 'col-xs-4',
			value: morpheus.Util
			.nf(controller.columnDendrogram ? controller.columnDendrogram.lineWidth
				: 1)
		});
	}

	displayItems.push({
		name: 'info_window',
		required: true,
		type: 'select',
		col: 'col-xs-4',
		options: [{
			name: 'Fixed To Top',
			value: 0
		}, {
			name: 'New Window',
			value: 1
		}],
		value: controller.tooltipMode
	});

	displayItems.push({
		name: 'inline_tooltip',
		required: true,
		type: 'checkbox',
		value: controller.options.inlineTooltip
	});

	var colorSchemeFormBuilder = new morpheus.FormBuilder();
	_.each(items, function (item) {
		colorSchemeFormBuilder.append(item);
	});
	var displayFormBuilder = new morpheus.FormBuilder();
	_.each(displayItems, function (item) {
		displayFormBuilder.append(item);
	});
	var colorSchemeChooser = new morpheus.HeatMapColorSchemeChooser({
		showRelative: true,
		colorScheme: controller.heatmap
		.getColorScheme()
	});
	var updatingSizer = false;
	colorSchemeChooser.on('change', function () {
		if (controller.heatmap.getColorScheme().getSizer
			&& controller.heatmap.getColorScheme().getSizer() != null) {
			colorSchemeFormBuilder.setValue('size_by', controller.heatmap
			.getColorScheme().getSizer().getSeriesName());
			colorSchemeFormBuilder.setEnabled('size_by_minimum',
				controller.heatmap.getColorScheme().getSizer()
				.getSeriesName() != null);
			colorSchemeFormBuilder.setEnabled('size_by_maximum',
				controller.heatmap.getColorScheme().getSizer()
				.getSeriesName() != null);

			if (!updatingSizer) {
				colorSchemeFormBuilder.setValue('size_by_minimum',
					controller.heatmap.getColorScheme().getSizer().getMin());
				colorSchemeFormBuilder.setValue('size_by_maximum',
					controller.heatmap.getColorScheme().getSizer().getMax());
			}

		}
		// repaint the heat map when color scheme changes
		controller.heatmap.setInvalid(true);
		controller.heatmap.repaint();
		colorSchemeChooser.restoreCurrentValue();
	});
	function createMetadataField(isColumns) {
		var options = [];
		var value = {};
		_.each(controller.getVisibleTrackNames(isColumns), function (name) {
			value[name] = true;
		});
		_.each(morpheus.MetadataUtil.getMetadataNames(isColumns ? controller
			.getProject().getFullDataset().getColumnMetadata() : controller
			.getProject().getFullDataset().getRowMetadata()),
			function (name) {
				options.push(name);
			});
		var field = {
			type: 'bootstrap-select',
			search: options.length > 10,
			name: isColumns ? 'column_annotations' : 'row_annotations',
			multiple: true,
			value: value,
			options: options,
			toggle: true
		};

		return field;
	}

	var annotationsBuilder = new morpheus.FormBuilder();
	annotationsBuilder.append(createMetadataField(false));
	annotationsBuilder.append(createMetadataField(true));
	function annotationsListener($select, isColumns) {
		var names = [];
		_.each(controller.getVisibleTrackNames(isColumns), function (name) {
			names.push(name);
		});
		var values = $select.val();
		var selectedNow = _.difference(values, names);
		var unselectedNow = _.difference(names, values);
		var tracks = [];
		_.each(selectedNow, function (name) {
			tracks.push({
				name: name,
				isColumns: isColumns,
				visible: true
			});
		});
		_.each(unselectedNow, function (name) {
			tracks.push({
				name: name,
				isColumns: isColumns,
				visible: false
			});
		});
		controller.setTrackVisibility(tracks);
		colorSchemeChooser.restoreCurrentValue();
	}

	var $ca = annotationsBuilder.$form.find('[name=column_annotations]');
	$ca.on('change', function (e) {
		annotationsListener($(this), true);
	});
	var $ra = annotationsBuilder.$form.find('[name=row_annotations]');
	$ra.on('change', function (e) {
		annotationsListener($(this), false);
	});
	var annotationOptionsTabId = _.uniqueId('morpheus');
	var heatMapOptionsTabId = _.uniqueId('morpheus');
	var displayOptionsTabId = _.uniqueId('morpheus');

	var $metadataDiv = $('<div class="tab-pane" id="' + annotationOptionsTabId
		+ '"></div>');
	$metadataDiv.append($(annotationsBuilder.$form));
	var $heatMapDiv = $('<div class="tab-pane active" id="'
		+ heatMapOptionsTabId + '"></div>');
	$heatMapDiv.append(colorSchemeChooser.$div);
	$heatMapDiv.append($(colorSchemeFormBuilder.$form));
	var $displayDiv = $('<div class="tab-pane" id="' + displayOptionsTabId
		+ '"></div>');
	$displayDiv.append($(displayFormBuilder.$form));
	displayFormBuilder.setEnabled('grid_thickness', controller.heatmap.isDrawGrid());
	displayFormBuilder.setEnabled('grid_color', controller.heatmap.isDrawGrid());

	displayFormBuilder.$form.find('[name=show_grid]').on('click', function (e) {
		var grid = $(this).prop('checked');
		displayFormBuilder.setEnabled('grid_thickness', grid);
		displayFormBuilder.setEnabled('grid_color', grid);
		controller.heatmap.setDrawGrid(grid);
		controller.revalidate();
		colorSchemeChooser.restoreCurrentValue();
	});
	displayFormBuilder.$form.find('[name=show_values]').on('click', function (e) {
		controller.heatmap.setDrawValues($(this).prop('checked'));
		controller.revalidate();
		colorSchemeChooser.restoreCurrentValue();
	});
	displayFormBuilder.$form.find('[name=inline_tooltip]').on('click',
		function (e) {
			controller.options.inlineTooltip = $(this).prop('checked');
		});

	displayFormBuilder.$form.find('[name=grid_color]').on(
		'change',
		function (e) {
			var value = $(this).val();
			controller.heatmap.setGridColor(value);
			controller.heatmap.setInvalid(true);
			controller.heatmap.repaint();
		});

	displayFormBuilder.$form.find('[name=grid_thickness]').on(
		'keyup',
		_.debounce(function (e) {
			var value = parseFloat($(this).val());
			if (!isNaN(value)) {
				controller.heatmap.setGridThickness(value);
				controller.heatmap.setInvalid(true);
				controller.heatmap.repaint();
			}
		}, 100));

	displayFormBuilder.$form.find('[name=row_size]').on(
		'keyup',
		_.debounce(function (e) {
			var value = parseFloat($(this).val());
			if (!isNaN(value)) {
				controller.heatmap.getRowPositions().setSize(
					value);
				controller.revalidate();
				colorSchemeChooser.restoreCurrentValue();
			}

		}, 100));
	displayFormBuilder.$form.find('[name=info_window]').on('change',
		function (e) {
			controller.setTooltipMode(parseInt($(this).val()));
		});
	displayFormBuilder.find('link_rows_and_columns').on('click',
		function (e) {
			var checked = $(this).prop('checked');
			if (checked) {
				var l = new morpheus.SymmetricProjectListener(controller.getProject(), controller.vscroll, controller.hscroll);
				controller.getProject().__symmetricProjectListener = l;
			} else {
				controller.getProject().__symmetricProjectListener.dispose();
				delete controller.getProject().__symmetricProjectListener;
			}
		});

	var $colorByValue = colorSchemeFormBuilder.$form
	.find('[name=color_by_value]');
	var separateSchemesField = controller.heatmap.getColorScheme()
	.getSeparateColorSchemeForRowMetadataField();
	if (separateSchemesField != null) {
		$colorByValue.html(morpheus.Util.createOptions(morpheus.VectorUtil
		.createValueToIndexMap(
			controller.project.getFullDataset().getRowMetadata()
			.getByName(separateSchemesField)).keys()));
	}

	if (separateSchemesField != null) {
		colorSchemeChooser.setCurrentValue($colorByValue.val());
	}
	if (controller.heatmap.getColorScheme().getSizer
		&& controller.heatmap.getColorScheme().getSizer() != null
		&& controller.heatmap.getColorScheme().getSizer().getSeriesName()) {
		colorSchemeFormBuilder.setValue('size_by', controller.heatmap
		.getColorScheme().getSizer().getSeriesName());
	}
	colorSchemeFormBuilder.$form.find('[name=size_by]')
	.on(
		'change',
		function (e) {
			var series = $(this).val();
			if (series == '(None)') {
				series = null;
			}
			colorSchemeChooser.colorScheme.getSizer()
			.setSeriesName(series);
			colorSchemeChooser.fireChanged();
		});
	colorSchemeFormBuilder.$form.find('[name=size_by_minimum]').on(
		'keyup',
		_.debounce(function (e) {
			updatingSizer = true;
			colorSchemeChooser.colorScheme.getSizer().setMin(
				parseFloat($(this).val()));
			colorSchemeChooser.fireChanged(true);
			updatingSizer = false;
		}, 100));
	colorSchemeFormBuilder.$form.find('[name=size_by_maximum]').on(
		'keyup',
		_.debounce(function (e) {
			updatingSizer = true;
			colorSchemeChooser.colorScheme.getSizer().setMax(
				parseFloat($(this).val()));
			colorSchemeChooser.fireChanged(true);
			updatingSizer = false;
		}, 100));
	colorSchemeFormBuilder.$form
	.find('[name=conditional_rendering]')
	.on(
		'click',
		function (e) {
			e.preventDefault();
			var conditionalRenderingUI = new morpheus.ConditionalRenderingUI(
				controller);
			morpheus.FormBuilder.showInModal({
				title: 'Conditional Rendering',
				html: conditionalRenderingUI.$div,
				close: 'Close',
				z: 1051,
				callback: function () {

				}
			});
		});

	colorSchemeFormBuilder.find('save_color_scheme').on('click', function (e) {
		e.preventDefault();
		var blob = new Blob([controller.heatmap.getColorScheme().toJson()], {
			type: 'application/json'
		});
		saveAs(blob, 'color_scheme.json');
	});
	colorSchemeFormBuilder.on('change', function (e) {
		if (e.name === 'load_color_scheme') {
			if (e.value !== '' && e.value != null) {
				morpheus.Util.getText(e.value).done(
					function (text) {
						var json = JSON.parse($.trim(text));
						controller.heatmap.getColorScheme().fromJson(json);
						colorSchemeChooser
						.setColorScheme(controller.heatmap
						.getColorScheme());
						controller.heatmap.setInvalid(true);
						controller.heatmap.repaint();

					}).fail(function () {
					morpheus.FormBuilder.showInModal({
						title: 'Error',
						html: 'Unable to read saved color scheme.'
					});
				});

			}
		}
	});

	colorSchemeFormBuilder.$form
	.on(
		'change',
		'[name=load_predefined_scheme]',
		function (e) {
			var val = $(this).val();
			if (val !== '') {
				if (val === 'gene') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.RELATIVE()));
				} else if (val === 'cn') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.CN()));
				} else if (val === 'wtcs') {
					controller.heatmap.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier({
							type: 'fixed',
							map: [{
								value: -1,
								color: 'blue'
							}, {
								value: -0.5,
								color: 'white'
							}, {
								value: 0.5,
								color: 'white'
							}, {
								value: 1,
								color: 'red'
							}]
						}));
				} else if (val === 'MAF') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.MAF()));
				} else if (val === 'binary') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.BINARY()));
				} else if (val === '100scale1') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.SUMMLY()));

				} else if (val === '100scale2') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.SUMMLY2()));

				} else {
					console.log('not found');
				}
				colorSchemeChooser
				.setColorScheme(controller.heatmap
				.getColorScheme());
				controller.heatmap.setInvalid(true);
				controller.heatmap.repaint();
				$(this).val('');
			} else {
				console.log('empty option selected');
			}
			colorSchemeChooser.restoreCurrentValue();
		});
	colorSchemeFormBuilder.$form
	.find('[name=color_by]')
	.on(
		'change',
		function (e) {
			var colorByField = $(this).val();
			if (colorByField == '(None)') {
				colorByField = null;
			}
			var colorByValue = null;
			controller.heatmap.getColorScheme()
			.setSeparateColorSchemeForRowMetadataField(
				colorByField);
			if (colorByField != null) {
				$colorByValue
				.html(morpheus.Util
				.createOptions(morpheus.VectorUtil
				.createValueToIndexMap(
					controller.project
					.getFullDataset()
					.getRowMetadata()
					.getByName(
						colorByField))
				.keys()));
				colorByValue = $colorByValue.val();
			} else {
				$colorByValue.html('');
			}

			controller.heatmap.getColorScheme().setCurrentValue(
				colorByValue);
			colorSchemeChooser.setCurrentValue(colorByValue);
			controller.heatmap.setInvalid(true);
			controller.heatmap.repaint();
			colorSchemeChooser.setColorScheme(controller.heatmap
			.getColorScheme());
		});
	$colorByValue.on('change', function (e) {
		if (controller.heatmap.getColorScheme()
			.getSeparateColorSchemeForRowMetadataField() == null) {
			colorSchemeChooser.setCurrentValue(null);
			controller.heatmap.getColorScheme().setCurrentValue(null);
			colorSchemeChooser.setColorScheme(controller.heatmap
			.getColorScheme());
		} else {
			colorSchemeChooser.setCurrentValue($colorByValue.val());
			colorSchemeChooser.setColorScheme(controller.heatmap
			.getColorScheme());
		}
	});
	displayFormBuilder.$form.find('[name=column_size]').on(
		'keyup',
		_.debounce(function (e) {
			controller.heatmap.getColumnPositions().setSize(
				parseFloat($(this).val()));
			controller.revalidate();
			colorSchemeChooser.restoreCurrentValue();

		}, 100));
	displayFormBuilder.$form.find('[name=gap_size]').on('keyup',
		_.debounce(function (e) {
			controller.gapSize = parseFloat($(this).val());
			controller.revalidate();
			colorSchemeChooser.restoreCurrentValue();
		}, 100));
	displayFormBuilder.$form.find('[name=squish_factor]').on('keyup',
		_.debounce(function (e) {
			var f = parseFloat($(this).val());
			controller.heatmap.getColumnPositions().setSquishFactor(f);
			controller.heatmap.getRowPositions().setSquishFactor(f);
			controller.revalidate();
			colorSchemeChooser.restoreCurrentValue();
		}, 100));
	displayFormBuilder.$form.find('[name=row_dendrogram_line_thickness]').on(
		'keyup', _.debounce(function (e) {
			controller.rowDendrogram.lineWidth = parseFloat($(this).val());
			controller.revalidate();
			colorSchemeChooser.restoreCurrentValue();

		}, 100));
	displayFormBuilder.$form.find('[name=column_dendrogram_line_thickness]')
	.on(
		'keyup',
		_.debounce(function (e) {
			controller.columnDendrogram.lineWidth = parseFloat($(
				this).val());
			controller.revalidate();
			colorSchemeChooser.restoreCurrentValue();
		}, 100));
	var $tab = $('<div class="tab-content"></div>');
	$metadataDiv.appendTo($tab);
	$heatMapDiv.appendTo($tab);
	$displayDiv.appendTo($tab);
	var $div = $('<div></div>');
	var $ul = $('<ul class="nav nav-tabs" role="tablist">' + '<li><a href="#'
		+ annotationOptionsTabId
		+ '" role="tab" data-toggle="tab">Annotations</a></li>'
		+ '<li><a href="#' + heatMapOptionsTabId
		+ '" role="tab" data-toggle="tab">Color Scheme</a></li>'
		+ '<li><a href="#' + displayOptionsTabId
		+ '" role="tab" data-toggle="tab">Display</a></li>' + '</ul>');
	$ul.appendTo($div);
	$tab.appendTo($div);
	// set current scheme
	colorSchemeChooser.setColorScheme(controller.heatmap.getColorScheme());
	colorSchemeChooser.trigger('change');
	$ul.find('[role=tab]:eq(1)').tab('show');
	morpheus.FormBuilder.showInModal({
		title: 'Options',
		html: $div,
		close: 'Close',
		callback: function () {
			$div.find('input').off('keyup');
			$ca.off('change');
			$ra.off('change');
			$div.remove();
			colorSchemeChooser.dispose();
		}
	});
};

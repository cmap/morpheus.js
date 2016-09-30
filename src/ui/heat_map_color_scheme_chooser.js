morpheus.HeatMapColorSchemeChooser = function (options) {
	var that = this;
	this.$div = $('<div></div>');
	this.currentValue = null;
	this.legend = new morpheus.LegendWithStops();
	this.colorScheme = options.colorScheme || new morpheus.HeatMapColorScheme(new morpheus.Project(new morpheus.Dataset({
			rows: 0,
			columns: 0
		})));
	this.legend.on('added', function (e) {
		var fractions = that.colorScheme.getFractions();
		fractions.push(e.fraction);
		var colors = that.colorScheme.getColors();
		colors.push('black');
		that.colorScheme.setFractions({
			fractions: fractions,
			colors: colors
		});
		that.setSelectedIndex(_.indexOf(fractions, e.fraction));
		that.fireChanged();
	}).on('selectedIndex', function (e) {
		that.setSelectedIndex(e.selectedIndex);
	}).on('delete', function (index) {
		that.deleteSelectedStop();
	}).on(
		'moved',
		function (e) {
			var fraction = e.fraction;
			var fractions = that.colorScheme.getFractions();
			fractions[that.legend.selectedIndex] = fraction;
			that.colorScheme.setFractions({
				fractions: fractions,
				colors: that.colorScheme.getColors()
			});
			var newIndex = that.colorScheme.getFractions()
			.indexOf(fraction);
			if (newIndex !== -1) {
				that.legend.selectedIndex = newIndex;
			}
			var fractionToValue = d3.scale.linear().domain([0, 1])
			.range(
				[that.colorScheme.getMin(),
					that.colorScheme.getMax()])
			.clamp(true);
			that.formBuilder.setValue('selected_value',
				fractionToValue(fractions[that.legend.selectedIndex]));
			that.fireChanged();
		});
	var $row = $('<div></div>');
	$row.css('height', '50px').css('width', '300px').css('margin-left', 'auto')
	.css('margin-right', 'auto');
	$row.appendTo(this.$div);

	$(this.legend.canvas).appendTo($row);
	var formBuilder = new morpheus.FormBuilder();
	var items = [];
	items = items.concat({
		name: 'selected_color',
		type: 'color',
		col: 'col-xs-2'
	}, {
		name: 'selected_value',
		type: 'text',
		col: 'col-xs-4'
	}, [{
		name: 'delete',
		type: 'button',
		value: 'Delete Selected Color Stop',
	}, {
		name: 'add',
		type: 'button',
		value: 'Add Color Stop'
	}], {
		name: 'minimum',
		type: 'text',
		col: 'col-xs-4'
	}, {
		name: 'maximum',
		type: 'text',
		col: 'col-xs-4'
	});
	if (options.showRelative) {
		items = items.concat({
			name: 'relative_color_scheme',
			type: 'checkbox',
			help: 'A relative color scheme uses the minimum and maximum values in each row' +
			' to convert values to colors'
		});
		items = items.concat({
			name: 'transform_values',
			type: 'select',
			value: 0,
			options: [{
				name: 'None',
				value: 0
			}, {
				name: 'Subtract row mean, divide by row standard deviation',
				value: morpheus.AbstractColorSupplier.Z_SCORE
			}, {
				name: 'Subtract row median, divide by row median absolute deviation',
				value: morpheus.AbstractColorSupplier.ROBUST_Z_SCORE
			}]
		});
	}

	items = items.concat({
		name: 'missing_color',
		type: 'color',
		col: 'col-xs-2'
	});
	items
	.push({
		name: 'stepped_colors',
		type: 'checkbox',
		value: false,
		help: 'Intervals include left end point and exclude right end point, except for the highest interval'
	});
	_.each(items, function (item) {
		formBuilder.append(item);
	});
	this.$div.append(formBuilder.$form);
	formBuilder.$form.find('[name^=selected],[name=delete]').prop('disabled',
		true);
	formBuilder.$form.find('[name=add]').on('click', function (e) {
		var fractions = that.colorScheme.getFractions();
		var val = 0.5;
		while (val >= 0 && _.indexOf(fractions, val) !== -1) {
			val -= 0.1;
		}
		val = Math.max(0, val);
		fractions.push(val);
		var colors = that.colorScheme.getColors();
		colors.push('black');
		that.colorScheme.setFractions({
			fractions: fractions,
			colors: colors
		});
		that.setSelectedIndex(_.indexOf(fractions, val));
		that.fireChanged();
	});
	formBuilder.$form.find('[name=delete]').on('click', function (e) {
		that.deleteSelectedStop();
	});
	formBuilder.$form.find('[name=transform_values]').on('change', function (e) {
		that.colorScheme.setTransformValues(parseInt(formBuilder.getValue('transform_values')));
		that.fireChanged();
	});
	formBuilder.$form.on('keyup', '[name=selected_value]', _.debounce(function (e) {
		var val = parseFloat($(this).val());
		if (!isNaN(val)) {
			that.setSelectedValue(val);
			that.fireChanged();
		}
	}, 100));
	formBuilder.$form.on('change', '[name=selected_color]', function (e) {
		var colors = that.colorScheme.getColors();
		colors[that.legend.selectedIndex] = $(this).val();
		that.colorScheme.setFractions({
			fractions: that.colorScheme.getFractions(),
			colors: colors
		});
		that.fireChanged();
	});
	formBuilder.$form.on('change', '[name=missing_color]', function (e) {
		var color = $(this).val();
		that.colorScheme.setMissingColor(color);
		that.fireChanged(false);
	});
	formBuilder.$form.on('change', '[name=stepped_colors]', function (e) {
		that.colorScheme.setStepped($(this).prop('checked'));
		that.fireChanged();
	});
	formBuilder.$form.on('keyup', '[name=minimum]', _.debounce(function (e) {
		var val = parseFloat($(this).val());
		if (!isNaN(val)) {
			that.colorScheme.setMin(val);
			that.setSelectedIndex(that.legend.selectedIndex);
			that.fireChanged(false);
		}
	}, 100));
	formBuilder.$form.on('keyup', '[name=maximum]', _.debounce(function (e) {
		var val = parseFloat($(this).val());
		if (!isNaN(val)) {
			that.colorScheme.setMax(val);
			that.setSelectedIndex(that.legend.selectedIndex);
			that.fireChanged(false);
		}

	}, 100));
	formBuilder.$form
	.on(
		'change',
		'[name=relative_color_scheme]',
		_
		.throttle(
			function (e) {
				that.legend.selectedIndex = -1;
				// FIXME set fixed min and max
				var scalingMode = $(this).prop('checked') ? morpheus.HeatMapColorScheme.ScalingMode.RELATIVE
					: morpheus.HeatMapColorScheme.ScalingMode.FIXED;
				that.colorScheme
				.setScalingMode(scalingMode);
				that.setColorScheme(that.colorScheme);
				that.fireChanged();
			}, 100));
	this.formBuilder = formBuilder;
	// selection: delete, color, value
	// general: add, min, max, relative or global
};
morpheus.HeatMapColorSchemeChooser.prototype = {
	deleteSelectedStop: function () {
		var fractions = this.colorScheme.getFractions();
		fractions.splice(this.legend.selectedIndex, 1);
		var colors = this.colorScheme.getColors();
		colors.splice(this.legend.selectedIndex, 1);
		this.colorScheme.setFractions({
			fractions: fractions,
			colors: colors
		});
		this.formBuilder.$form.find('[name^=selected],[name=delete]').prop(
			'disabled', true);
		this.legend.setSelectedIndex(-1);
		this.fireChanged();
	},
	setSelectedValue: function (val) {
		var valueToFraction = d3.scale.linear().domain(
			[this.colorScheme.getMin(), this.colorScheme.getMax()])
		.range([0, 1]).clamp(true);
		var fractions = this.colorScheme.getFractions();
		fractions[this.legend.selectedIndex] = valueToFraction(val);
		this.colorScheme.setFractions({
			fractions: fractions,
			colors: this.colorScheme.getColors()
		});
	},
	setSelectedIndex: function (index) {
		var fractions = this.colorScheme.getFractions();
		if (index >= fractions.length) {
			index = -1;
		}
		this.legend.setSelectedIndex(index);
		var formBuilder = this.formBuilder;
		formBuilder.$form.find('[name^=selected],[name=delete]').prop(
			'disabled', this.legend.selectedIndex === -1);
		if (this.legend.selectedIndex !== -1) {
			var fractionToValue = d3.scale.linear().domain([0, 1]).range(
				[this.colorScheme.getMin(), this.colorScheme.getMax()])
			.clamp(true);
			formBuilder.setValue('selected_value',
				fractionToValue(fractions[this.legend.selectedIndex]));
			var context = this.legend.canvas.getContext('2d');
			var colors = this.colorScheme.getColors();
			context.fillStyle = colors[this.legend.selectedIndex];
			formBuilder.setValue('selected_color', context.fillStyle);
		} else {
			formBuilder.setValue('selected_value', '');
		}
		this.draw();
	},
	setMinMax: function () {
		if (this.colorScheme.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
			this.colorScheme.setMin(0);
			this.colorScheme.setMax(1);
		}
	},
	dispose: function () {
		this.off('change');
		this.legend.destroy();
		this.formBuilder.$form.off('keyup', 'input');
		this.formBuilder.$form.off('change', '[name=relative_color_scheme]');
	},
	restoreCurrentValue: function () {
		if (this.colorScheme.setCurrentValue) {
			this.colorScheme.setCurrentValue(this.currentValue);
		}
	},
	setCurrentValue: function (value) {
		this.currentValue = value;
		if (this.colorScheme && this.colorScheme.setCurrentValue) {
			this.colorScheme.setCurrentValue(this.currentValue);
		}
		this.setColorScheme(this.colorScheme);
	},
	setColorScheme: function (colorScheme) {
		this.colorScheme = colorScheme;
		this.setMinMax();
		if (colorScheme.setCurrentValue) {
			colorScheme.setCurrentValue(this.currentValue);
		}
		this.formBuilder
		.setValue(
			'relative_color_scheme',
			colorScheme.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE ? true
				: false);
		this.formBuilder.setValue('transform_values', colorScheme.getTransformValues());
		this.formBuilder.setEnabled('transform_values', colorScheme.getScalingMode() !== morpheus.HeatMapColorScheme.ScalingMode.RELATIVE);

		this.formBuilder.$form
		.find('[name=minimum],[name=maximum]')
		.prop(
			'disabled',
			colorScheme.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE);
		this.formBuilder.setValue('minimum', this.colorScheme.getMin());
		this.formBuilder.setValue('maximum', this.colorScheme.getMax());
		this.formBuilder.setValue('stepped_colors', this.colorScheme
		.isStepped());
		this.formBuilder.setValue('missing_color', this.colorScheme
		.getMissingColor());
		this.draw();
	},
	getFractionToStopPix: function () {
		return d3.scale.linear().clamp(true).domain([0, 1]).range(
			[this.legend.border,
				this.legend.getUnscaledWidth() - this.legend.border]);
	},
	fireChanged: function (noreset) {
		this.trigger('change');
		if (noreset !== false) {
			this.setColorScheme(this.colorScheme);
		}
	},
	draw: function () {
		var colorScheme = this.colorScheme;
		if (colorScheme.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
			colorScheme.setMin(0);
			colorScheme.setMax(1);
		}
		var fractions = colorScheme.getFractions();
		var colors = colorScheme.getColors();
		var fractionToStopPix = this.getFractionToStopPix();
		this.legend.draw(fractions, colors, colorScheme.isStepped(),
			fractionToStopPix);
	}
};
morpheus.Util.extend(morpheus.HeatMapColorSchemeChooser, morpheus.Events);

morpheus.AbstractColorSupplier = function () {
	this.fractions = [0, 0.5, 1];
	this.colors = ['blue', 'white', 'red'];
	this.names = null; // optional color stop names
	this.min = 0;
	this.max = 1;
	this.missingColor = '#c0c0c0';
	this.scalingMode = morpheus.HeatMapColorScheme.ScalingMode.RELATIVE;
	this.stepped = false;
	this.sizer = new morpheus.HeatMapSizer();
	this.conditions = new morpheus.HeatMapConditions();
	this.transformValues = 0;// z-score, robust z-score
};
morpheus.AbstractColorSupplier.Z_SCORE = 1;
morpheus.AbstractColorSupplier.ROBUST_Z_SCORE = 2;

morpheus.AbstractColorSupplier.toJson = function (cs) {
	return {
		fractions: cs.fractions,
		colors: cs.colors,
		names: cs.names,
		min: cs.min,
		max: cs.max,
		missingColor: cs.missingColor,
		scalingMode: cs.scalingMode,
		stepped: cs.stepped,
		transformValues: cs.transformValues,
		conditions: cs.conditions.array,
		size: {
			seriesName: cs.sizer.seriesName,
			min: cs.sizer.min,
			max: cs.sizer.max
		}
	};

};
morpheus.AbstractColorSupplier.fromJson = function (json) {
	var cs = json.stepped ? new morpheus.SteppedColorSupplier()
		: new morpheus.GradientColorSupplier();
	cs.setDiscrete(json.discrete);
	cs.setScalingMode(json.scalingMode);
	cs.setMin(json.min);
	cs.setMax(json.max);
	cs.setMissingColor(json.missingColor);
	if (morpheus.HeatMapColorScheme.ScalingMode.RELATIVE !== json.scalingMode) {
		cs.setTransformValues(json.transformValues);
	}
	if (json.colors != null && json.colors.length > 0) {
		cs.setFractions({
			colors: json.colors,
			fractions: json.fractions,
			names: json.names
		});
	}

	if (json.size) {
		cs.getSizer().setSeriesName(json.size.seriesName);
		cs.getSizer().setMin(json.size.min);
		cs.getSizer().setMax(json.size.max);
	}

	if (json.conditions) {
		// load conditions
		json.conditions.forEach(function (condition) {
			var gtf = function () {
				return true;
			};
			var ltf = function () {
				return true;
			};
			if (condition.v1 != null && !isNaN(condition.v1)) {
				gtf = condition.v1Op === 'gt' ? function (val) {
					return val > condition.v1;
				} : function (val) {
					return val >= condition.v1;
				};
			}

			if (condition.v2 != null && !isNaN(condition.v2)) {
				ltf = condition.v2Op === 'lt' ? function (val) {
					return val < condition.v2;
				} : function (val) {
					return val <= condition.v2;
				};
			}
			condition.accept = function (val) {
				return gtf(val) && ltf(val);
			};
		});
		cs.conditions.array = json.conditions;
	}
	return cs;
};

morpheus.AbstractColorSupplier.prototype = {
	discrete: false,
	getTransformValues: function () {
		return this.transformValues;
	},
	setTransformValues: function (transformValues) {
		this.transformValues = transformValues;
	},
	getSizer: function () {
		return this.sizer;
	},
	getConditions: function () {
		return this.conditions;
	},
	isDiscrete: function () {
		return this.discrete;
	},
	setDiscrete: function (discrete) {
		this.discrete = discrete;
	},
	createInstance: function () {
		throw 'not implemented';
	},
	copy: function () {
		var c = this.createInstance();
		c.discrete = this.discrete;
		c.setFractions({
			fractions: this.fractions.slice(0),
			colors: this.colors.slice(0)
		});
		if (this.names != null) {
			c.names = this.names.slice(0);
		}
		if (this.sizer) {
			c.sizer = this.sizer.copy();
		}
		if (this.conditions) {
			c.conditions = this.conditions.copy();
		}
		c.scalingMode = this.scalingMode;
		c.min = this.min;
		c.max = this.max;
		c.missingColor = this.missingColor;
		if (this.scalingMode !== morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
			c.transformValues = this.transformValues;
		}

		return c;
	},
	setMissingColor: function (missingColor) {
		this.missingColor = missingColor;
	},
	getMissingColor: function () {
		return this.missingColor;
	},
	getScalingMode: function () {
		return this.scalingMode;
	},
	setScalingMode: function (scalingMode) {
		if (scalingMode !== this.scalingMode) {
			if (scalingMode === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
				this.min = 0;
				this.max = 1;
			}
			this.scalingMode = scalingMode;
		}
	},
	isStepped: function () {
		return false;
	},
	getColor: function (row, column, value) {
		throw 'not implemented';
	},
	getColors: function () {
		return this.colors;
	},
	getNames: function () {
		return this.names;
	},
	getFractions: function () {
		return this.fractions;
	},
	getMin: function () {
		return this.min;
	},
	getMax: function () {
		return this.max;
	},
	setMin: function (min) {
		this.min = min;
	},
	setMax: function (max) {
		// the min and max are set by heat map color scheme for each row
		this.max = max;
	},
	/**
	 *
	 * @param options.fractions
	 *            Array of stop fractions
	 * @param options.colors
	 *            Array of stop colors
	 * @param options.names
	 *            Array of stop names
	 */
	setFractions: function (options) {
		var index = morpheus.Util.indexSort(options.fractions, true);
		this.fractions = morpheus.Util.reorderArray(options.fractions, index);
		this.colors = morpheus.Util.reorderArray(options.colors, index);
		this.names = options.names ? morpheus.Util.reorderArray(options.names,
			index) : null;
	}
};

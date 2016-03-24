/**
 * @param type
 *            Either relative or fixed.
 * @param stops
 *            An array of objects with value and color
 */
morpheus.HeatMapColorScheme = function(project, scheme) {
	this.project = project;
	var that = this;

	this.separateColorSchemeForRowMetadataField = null;
	this.rowValueToColorSupplier = {};
	this.value = null;
	if (scheme) {
		this.rowValueToColorSupplier[null] = morpheus.HeatMapColorScheme
				.createColorSupplier(scheme);
		this.currentColorSupplier = this.rowValueToColorSupplier[this.value];
	}
	project
			.on(
					'rowFilterChanged columnFilterChanged rowSortOrderChanged columnSortOrderChanged datasetChanged',
					function() {
						that.projectUpdated();
					});
	this.projectUpdated();
};
morpheus.HeatMapColorScheme.Predefined = {};
morpheus.HeatMapColorScheme.Predefined.SUMMLY = function() {
	return {
		type : 'fixed',
		map : [ {
			value : -100,
			color : 'blue'
		}, {
			value : -90,
			color : 'white'
		}, {
			value : 98,
			color : 'white'
		}, {
			value : 100,
			color : 'red'
		} ]
	};
};

morpheus.HeatMapColorScheme.Predefined.SUMMLY2 = function() {
	return {
		type : 'fixed',
		map : [ {
			value : -100,
			color : 'blue'
		}, {
			value : -90,
			color : '#abdda4'
		}, {
			value : -80,
			color : 'white'
		}, {
			value : 80,
			color : 'white'
		}, {
			value : 90,
			color : '#fdae61'
		}, {
			value : 100,
			color : 'red'
		} ]
	};
};

morpheus.HeatMapColorScheme.Predefined.SUMMLY3 = function() {
	return {
		type : 'fixed',
		map : [ {
			value : -100,
			color : 'blue'
		}, {
			value : -90,
			color : '#abdda4'
		}, {
			value : -80,
			color : '#e6f598'
		}, {
			value : -70,
			color : 'white'
		}, {
			value : 70,
			color : 'white'
		}, {
			value : 80,
			color : '#fee08b'
		}, {
			value : 90,
			color : '#fdae61'
		}, {
			value : 100,
			color : 'red'
		} ]
	};
};

morpheus.HeatMapColorScheme.Predefined.CN = function() {
	return {
		type : 'fixed',
		map : [ {
			value : -2,
			color : 'blue'
		}, {
			value : -0.1,
			color : 'white'
		}, {
			value : 0.1,
			color : 'white'
		}, {
			value : 2,
			color : 'red'
		} ]
	};
};
morpheus.HeatMapColorScheme.Predefined.BINARY = function() {
	return {
		type : 'fixed',
		map : [ {
			value : 0,
			color : 'white'
		}, {
			value : 1,
			color : 'black'
		} ]
	};
};
morpheus.HeatMapColorScheme.Predefined.RELATIVE = function() {
	return {
		type : 'relative'
	};
};
morpheus.HeatMapColorScheme.Predefined.MAF = function() {
	// coMut plot colors

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var toHex = function(rgb) {
		ctx.fillStyle = rgb;
		return ctx.fillStyle;
	};

	return {
		type : 'fixed',
		stepped : true,
		map : [ {
			value : 0,
			color : toHex('rgb(' + [ 255, 255, 255 ].join(',') + ')')
		}, {
			value : 1,
			color : toHex('rgb(' + [ 77, 175, 74 ].join(',') + ')'),
			name : 'Synonymous'
		}, {
			value : 2,
			color : toHex('rgb(' + [ 255, 255, 51 ].join(',') + ')'),
			name : 'In Frame Indel'
		}, {
			value : 3,
			color : toHex('rgb(' + [ 166, 86, 40 ].join(',') + ')'),
			name : 'Other Non-Synonymous'
		}, {
			value : 4,
			color : toHex('rgb(' + [ 55, 126, 184 ].join(',') + ')'),
			name : 'Missense'
		}, {
			value : 5,
			color : toHex('rgb(' + [ 152, 78, 163 ].join(',') + ')'),
			name : 'Splice Site'
		}, {
			value : 6,
			color : toHex('rgb(' + [ 255, 127, 0 ].join(',') + ')'),
			name : 'Frame Shift'
		}, {
			value : 7,
			color : toHex('rgb(' + [ 228, 26, 28 ].join(',') + ')'),
			name : 'Nonsense'
		} ]
	};
};
// morpheus.HeatMapColorScheme.Predefined.MAF_NEW = function() {
// // Synonymous 1
// //In_frame_Indel 2
// //Other_non_syn. 3
// //Missense 4
// //Splice_Site 5
// //Frame_Shift 6
// //Nonsense 7
// return {
// type : 'fixed',
// stepped : true,
// map : [ {
// value : 0,
// color : 'rgb(' + [ 255, 255, 255 ].join(',') + ')',
// name : ''
// }, {
// value : 1,
// color : 'rgb(' + [ 255, 255, 179 ].join(',') + ')',
// name : 'Silent'
// }, {
// value : 2,
// color : 'rgb(' + [ 69, 117, 180 ].join(',') + ')',
// name : 'In Frame Indel'
// }, {
// value : 3,
// color : 'rgb(' + [ 247, 182, 210 ].join(',') + ')',
// name : 'Other Non-Synonymous'
// }, {
// value : 4,
// color : 'rgb(' + [ 1, 133, 113 ].join(',') + ')',
// name : 'Missense'
// }, {
// value : 5,
// color : 'rgb(' + [ 253, 180, 98 ].join(',') + ')',
// name : 'Splice Site'
// }, {
// value : 6,
// color : 'rgb(' + [ 140, 81, 10 ].join(',') + ')',
// name : 'Frame Shift'
// }, {
// value : 7,
// color : 'rgb(' + [ 123, 50, 148 ].join(',') + ')',
// name : 'Nonsense'
// } ]
// };
// };
morpheus.HeatMapColorScheme.Predefined.ZS = function() {
	return {
		type : 'fixed',
		map : [ {
			value : -10,
			color : 'blue'
		}, {
			value : -2,
			color : 'white'
		}, {
			value : 2,
			color : 'white'
		}, {
			value : 10,
			color : 'red'
		} ]
	};
};
morpheus.HeatMapColorScheme.ScalingMode = {
	RELATIVE : 0,
	FIXED : 1
};

morpheus.HeatMapConditions = function() {
	this.conditions = [];
	// each condition is a object with fields: series, shape, color and
	// accept(val) function

};
morpheus.HeatMapConditions.prototype = {
	insert : function(index, c) {
		this.conditions.splice(index, 0, c);
	},
	getConditions : function() {
		return this.conditions;
	},
	remove : function(index) {
		this.conditions.splice(index, 1);
	},
	copy : function() {
		var c = new morpheus.HeatMapConditions();
		this.conditions.forEach(function(cond) {
			c.conditions.push(_.clone(cond));
		});
		return c;
	}
};
morpheus.HeatMapSizer = function() {
	this._seriesName = null;
	this._sizeByScale = d3.scale.linear().domain([ this._min, this._max ])
			.range([ 0, 1 ]).clamp(true);
};
morpheus.HeatMapSizer.prototype = {
	_min : 0,
	_max : 1,
	copy : function() {
		var sizer = new morpheus.HeatMapSizer();
		sizer._seriesName = this._seriesName;
		sizer._min = this._mini;
		sizer._max = this._max;
		sizer._sizeByScale = this._sizeByScale.copy();
		return sizer;
	},
	valueToFraction : function(value) {
		return this._sizeByScale(value);
	},
	setMin : function(min) {
		this._min = min;
		this._sizeByScale = d3.scale.linear().domain([ this._min, this._max ])
				.range([ 0, 1 ]).clamp(true);
	},
	setMax : function(max) {
		this._max = max;
		this._sizeByScale = d3.scale.linear().domain([ this._min, this._max ])
				.range([ 0, 1 ]).clamp(true);
	},
	getMin : function() {
		return this._min;
	},
	getMax : function() {
		return this._max;
	},
	getSeriesName : function() {
		return this._seriesName;
	},
	setSeriesName : function(name) {
		this._seriesName = name;
	}
};
morpheus.HeatMapColorScheme.createColorSupplier = function(options) {
	var type = options.type;
	var stepped = options.stepped;
	var map = options.map;
	var scalingMode;
	var colorSupplier = stepped ? new morpheus.SteppedColorSupplier()
			: new morpheus.GradientColorSupplier();
	if (type === 'fixed') {
		scalingMode = morpheus.HeatMapColorScheme.ScalingMode.FIXED;
		if (map) { // get min/max
			var min = Number.MAX_VALUE;
			var max = -Number.MAX_VALUE;
			for (var i = 0; i < map.length; i++) {
				min = Math.min(min, map[i].value);
				max = Math.max(max, map[i].value);
			}
			colorSupplier.setMin(min);
			colorSupplier.setMax(max);
		}
	} else {
		scalingMode = morpheus.HeatMapColorScheme.ScalingMode.RELATIVE;
	}
	if (options.missingColor !== undefined) {
		colorSupplier.setMissingColor(options.missingColor);
	}
	colorSupplier.setScalingMode(scalingMode);
	if (map) {
		var fractions = [];
		var colors = [];
		var names = [];
		var valueToFraction = d3.scale.linear().domain(
				[ colorSupplier.getMin(), colorSupplier.getMax() ]).range(
				[ 0, 1 ]).clamp(true);
		var hasNames = false;
		for (var i = 0; i < map.length; i++) {
			fractions.push(valueToFraction(map[i].value));
			colors.push(map[i].color);
			var name = map[i].name;
			if (!hasNames && name !== undefined) {
				hasNames = true;
			}
			names.push(name);
		}
		colorSupplier.setFractions({
			fractions : fractions,
			colors : colors,
			names : hasNames ? names : null
		});
	}

	return colorSupplier;
};
morpheus.HeatMapColorScheme.prototype = {
	getColors : function() {
		return this.currentColorSupplier.getColors();
	},
	setMissingColor : function(color) {
		this.currentColorSupplier.setMissingColor(color);
	},
	getHiddenValues : function() {
		return this.currentColorSupplier.getHiddenValues ? this.currentColorSupplier
				.getHiddenValues()
				: null;
	},
	getMissingColor : function() {
		return this.currentColorSupplier.getMissingColor();
	},
	getScalingMode : function() {
		return this.currentColorSupplier.getScalingMode();
	},
	getSizer : function() {
		return this.currentColorSupplier.getSizer();
	},
	getConditions : function() {
		return this.currentColorSupplier.getConditions();
	},
	setScalingMode : function(scalingMode) {
		this.currentColorSupplier.setScalingMode(scalingMode);
	},
	getFractions : function() {
		return this.currentColorSupplier.getFractions();
	},
	getNames : function() {
		return this.currentColorSupplier.getNames();
	},
	getMin : function() {
		return this.currentColorSupplier.getMin();
	},
	getMax : function() {
		return this.currentColorSupplier.getMax();
	},
	setMin : function(min) {
		this.currentColorSupplier.setMin(min);
	},
	setMax : function(max) {
		this.currentColorSupplier.setMax(max);
	},
	isStepped : function() {
		return this.currentColorSupplier.isStepped();
	},
	isDiscrete : function() {
		return this.currentColorSupplier.isDiscrete();
	},
	setFractions : function(options) {
		this.currentColorSupplier.setFractions(options);
	},
	setStepped : function(stepped) {
		var oldColorSupplier = this.currentColorSupplier;
		var newColorSupplier = stepped ? new morpheus.SteppedColorSupplier()
				: new morpheus.GradientColorSupplier();
		newColorSupplier._sizer = oldColorSupplier.getSizer();
		newColorSupplier._conditions = oldColorSupplier.getConditions();
		newColorSupplier.getScalingMode(oldColorSupplier.getScalingMode());
		newColorSupplier.setMin(oldColorSupplier.getMin());
		newColorSupplier.setMax(oldColorSupplier.getMax());
		newColorSupplier.setFractions({
			fractions : oldColorSupplier.getFractions(),
			colors : oldColorSupplier.getColors()
		});
		this.currentColorSupplier = newColorSupplier;
		this.rowValueToColorSupplier[this.value] = this.currentColorSupplier;
	},
	toJson : function() {
		var json = {};
		var _this = this;
		if (this.separateColorSchemeForRowMetadataField != null) {
			json.separateColorSchemeForRowMetadataField = this.separateColorSchemeForRowMetadataField;
		}
		json.colorSchemes = {};
		_.each(_.keys(this.rowValueToColorSupplier), function(key) {
			// save each scheme
			var val = _this.rowValueToColorSupplier[key];
			delete val._sizer;
			delete val._conditions;
			json.colorSchemes[key] = val;

		});

		return JSON.stringify(json);
	},
	fromJson : function(json) {
		var _this = this;
		if (json.separateColorSchemeForRowMetadataField) {
			this.separateColorSchemeForRowMetadataField = json.separateColorSchemeForRowMetadataField;
			this.vector = this.project.getSortedFilteredDataset()
					.getRowMetadata().getByName(
							this.separateColorSchemeForRowMetadataField);
		}
		this.rowValueToColorSupplier = {};
		_.each(_.keys(json.colorSchemes), function(key) {
			var colorSupplier = morpheus.AbstractColorSupplier
					.fromJson(json.colorSchemes[key]);
			_this.rowValueToColorSupplier[key] = colorSupplier;
		});
		this._ensureColorSupplierExists();

	},
	copy : function(project) {
		var _this = this;
		var c = new morpheus.HeatMapColorScheme(project);
		c.separateColorSchemeForRowMetadataField = this.separateColorSchemeForRowMetadataField;
		if (c.separateColorSchemeForRowMetadataField != null) {
			c.vector = project.getSortedFilteredDataset().getRowMetadata()
					.getByName(c.separateColorSchemeForRowMetadataField);

		}
		if (c.vector == null) {
			c.separateColorSchemeForRowMetadataField = null;
		}
		_.each(_.keys(this.rowValueToColorSupplier), function(key) {
			c.rowValueToColorSupplier[key] = _this.rowValueToColorSupplier[key]
					.copy();
		});

		c.value = this.value;
		c.currentColorSupplier = c.rowValueToColorSupplier[c.value];

		return c;
	},
	setSeparateColorSchemeForRowMetadataField : function(
			separateColorSchemeForRowMetadataField) {
		if (separateColorSchemeForRowMetadataField != this.separateColorSchemeForRowMetadataField) {
			this.separateColorSchemeForRowMetadataField = separateColorSchemeForRowMetadataField;
			this.vector = this.project.getSortedFilteredDataset()
					.getRowMetadata().getByName(
							separateColorSchemeForRowMetadataField);
			var that = this;
			_.each(_.keys(this.rowValueToColorSupplier), function(key) {
				// remove old color schemes
				delete that.rowValueToColorSupplier[key];
			});
		}
	},
	getProject : function() {
		return this.project;
	},
	getSeparateColorSchemeForRowMetadataField : function() {
		return this.separateColorSchemeForRowMetadataField;
	},
	getColorByValues : function() {
		return _.keys(this.rowValueToColorSupplier);
	},
	projectUpdated : function() {
		var dataset = this.project.getSortedFilteredDataset();
		if (this.separateColorSchemeForRowMetadataField != null) {
			this.vector = this.project.getSortedFilteredDataset()
					.getRowMetadata().getByName(
							this.separateColorSchemeForRowMetadataField);
		}
		this.cachedRowStats = new morpheus.RowStats(dataset);
	},
	/**
	 * @private
	 */
	_ensureColorSupplierExists : function() {
		this.currentColorSupplier = this.rowValueToColorSupplier[this.value];
		if (this.currentColorSupplier === undefined) {
			var cs = morpheus.HeatMapColorScheme.createColorSupplier({
				type : 'relative'
			});
			this.rowValueToColorSupplier[this.value] = cs;
			this.currentColorSupplier = cs;
		}
	},
	setColorSupplierForCurrentValue : function(colorSupplier) {
		this.rowValueToColorSupplier[this.value] = colorSupplier;
		this.currentColorSupplier = colorSupplier;
	},
	setCurrentValue : function(value) {
		this.value = value;
		this._ensureColorSupplierExists();
	},
	isSizeBy : function() {
		this.currentColorSupplier.isSizeBy();
	},
	getColor : function(row, column, val) {
		if (this.vector !== undefined) {
			var tmp = this.vector.getValue(row);
			if (this.value !== tmp) {
				this.value = tmp;
				this._ensureColorSupplierExists();
			}
		}
		if (this.currentColorSupplier.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
			if (this.cachedRowStats.maybeUpdate(row)) {
				this.currentColorSupplier
						.setMin(this.cachedRowStats.rowCachedMin);
				this.currentColorSupplier
						.setMax(this.cachedRowStats.rowCachedMax);
			}
		}
		return this.currentColorSupplier.getColor(row, column, val);
	}
};
morpheus.RowStats = function(dataset) {
	this.datasetRowView = new morpheus.DatasetRowView(dataset);
	this.cachedRow = -1;
	this.rowCachedMax = 0;
	this.rowCachedMin = 0;
};
morpheus.RowStats.prototype = {
	maybeUpdate : function(row) {
		if (this.cachedRow !== row) {
			this.cachedRow = row;
			this.datasetRowView.setIndex(row);
			this.rowCachedMax = -Number.MAX_VALUE;
			this.rowCachedMin = Number.MAX_VALUE;
			for (var j = 0, ncols = this.datasetRowView.size(); j < ncols; j++) {
				var d = this.datasetRowView.getValue(j);
				if (!isNaN(d)) {
					this.rowCachedMax = d > this.rowCachedMax ? d
							: this.rowCachedMax;
					this.rowCachedMin = d < this.rowCachedMin ? d
							: this.rowCachedMin;
				}
			}
			if (this.rowCachedMin === this.rowCachedMax) {
				this.rowCachedMin--;
			}
			return true;
		}
		return false;
	}
};
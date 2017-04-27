/**
 * @param type
 *            Either relative or fixed.
 * @param stops
 *            An array of objects with value and color
 */
morpheus.HeatMapColorScheme = function (project, scheme) {
  this.project = project;
  var that = this;

  this.separateColorSchemeForRowMetadataField = null;
  this.rowValueToColorSupplier = {};
  this.value = null;
  if (scheme) {
    if (scheme.valueToColorScheme) { // json representation
      this.fromJSON(scheme);
    } else {
      this.rowValueToColorSupplier[null] = morpheus.HeatMapColorScheme
        .createColorSupplier(scheme);
      this.currentColorSupplier = this.rowValueToColorSupplier[this.value];
    }
  }
  project
    .on(
      'rowFilterChanged columnFilterChanged rowSortOrderChanged columnSortOrderChanged datasetChanged',
      function () {
        that.projectUpdated();
      });
  this.projectUpdated();
};
morpheus.HeatMapColorScheme.Predefined = {};
morpheus.HeatMapColorScheme.Predefined.SUMMLY = function () {
  return {
    name: '(-100, -97.5, -95, 95, 97.5, 100)',
    type: 'fixed',
    map: [{
      value: -100,
      color: '#0000ff'
    }, {
      value: -97.5,
      color: '#abdda4'
    }, {
      value: -95,
      color: '#ffffff'
    }, {
      value: 95,
      color: '#ffffff'
    }, {
      value: 97.5,
      color: '#fdae61'
    }, {
      value: 100,
      color: '#ff0000'
    }]
  };
};

morpheus.HeatMapColorScheme.Predefined.SUMMLY2 = function () {
  return {
    name: '(-100, -95, -90, 90, 95, 100)',
    type: 'fixed',
    map: [{
      value: -100,
      color: '#0000ff'
    }, {
      value: -95,
      color: '#abdda4'
    }, {
      value: -90,
      color: '#ffffff'
    }, {
      value: 90,
      color: '#ffffff'
    }, {
      value: 95,
      color: '#fdae61'
    }, {
      value: 100,
      color: '#ff0000'
    }]
  };
};

morpheus.HeatMapColorScheme.Predefined.SUMMLY3 = function () {
  return {
    type: 'fixed',
    map: [{
      value: -100,
      color: '#0000ff'
    }, {
      value: -90,
      color: '#abdda4'
    }, {
      value: -80,
      color: '#e6f598'
    }, {
      value: -70,
      color: '#ffffff'
    }, {
      value: 70,
      color: '#ffffff'
    }, {
      value: 80,
      color: '#fee08b'
    }, {
      value: 90,
      color: '#fdae61'
    }, {
      value: 100,
      color: '#ff0000'
    }]
  };
};

morpheus.HeatMapColorScheme.Predefined.CN = function () {
  return {
    type: 'fixed',
    map: [{
      value: -2,
      color: '#0000ff'
    }, {
      value: -0.1,
      color: '#ffffff'
    }, {
      value: 0.1,
      color: '#ffffff'
    }, {
      value: 2,
      color: '#ff0000'
    }]
  };
};
morpheus.HeatMapColorScheme.Predefined.BINARY = function () {
  return {
    type: 'fixed',
    map: [{
      value: 0,
      color: '#ffffff'
    }, {
      value: 1,
      color: 'black'
    }]
  };
};
morpheus.HeatMapColorScheme.Predefined.RELATIVE = function () {
  return {
    type: 'relative'
  };
};
morpheus.HeatMapColorScheme.Predefined.MAF = function () {
  // coMut plot colors

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var toHex = function (rgb) {
    ctx.fillStyle = rgb;
    return ctx.fillStyle;
  };

  return {
    type: 'fixed',
    stepped: true,
    map: [{
      value: 0,
      color: toHex('rgb(' + [255, 255, 255].join(',') + ')')
    }, {
      value: 1,
      color: toHex('rgb(' + [77, 175, 74].join(',') + ')'),
      name: 'Synonymous'
    }, {
      value: 2,
      color: toHex('rgb(' + [255, 255, 51].join(',') + ')'),
      name: 'In Frame Indel'
    }, {
      value: 3,
      color: toHex('rgb(' + [166, 86, 40].join(',') + ')'),
      name: 'Other Non-Synonymous'
    }, {
      value: 4,
      color: toHex('rgb(' + [55, 126, 184].join(',') + ')'),
      name: 'Missense'
    }, {
      value: 5,
      color: toHex('rgb(' + [152, 78, 163].join(',') + ')'),
      name: 'Splice Site'
    }, {
      value: 6,
      color: toHex('rgb(' + [255, 127, 0].join(',') + ')'),
      name: 'Frame Shift'
    }, {
      value: 7,
      color: toHex('rgb(' + [228, 26, 28].join(',') + ')'),
      name: 'Nonsense'
    }]
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
morpheus.HeatMapColorScheme.Predefined.ZS = function () {
  return {
    type: 'fixed',
    map: [{
      value: -10,
      color: '#0000ff'
    }, {
      value: -2,
      color: '#ffffff'
    }, {
      value: 2,
      color: '#ffffff'
    }, {
      value: 10,
      color: '#ff0000'
    }]
  };
};
morpheus.HeatMapColorScheme.ScalingMode = {
  RELATIVE: 0,
  FIXED: 1
};

morpheus.HeatMapConditions = function () {
  this.array = [];
  // each condition is a object with: series, shape, color and
  // accept(val) function

};
morpheus.HeatMapConditions.prototype = {
  insert: function (index, c) {
    this.array.splice(index, 0, c);
  },
  add: function (c) {
    this.array.push(c);
  },
  getConditions: function () {
    return this.array;
  },
  remove: function (index) {
    this.array.splice(index, 1);
  },
  copy: function () {
    var c = new morpheus.HeatMapConditions();
    this.array.forEach(function (cond) {
      c.array.push(_.clone(cond));
    });
    return c;
  }
};

morpheus.HeatMapColorScheme.createColorSupplier = function (options) {
  var type = options.type;
  var stepped = options.stepped;
  var map = options.map;
  var scalingMode;
  var min = 0;
  var max = 1;
  if (type === 'fixed') {
    scalingMode = morpheus.HeatMapColorScheme.ScalingMode.FIXED;
    if (map) { // get min/max
      min = Number.MAX_VALUE;
      max = -Number.MAX_VALUE;
      for (var i = 0; i < map.length; i++) {
        min = Math.min(min, map[i].value);
        max = Math.max(max, map[i].value);
      }
    }
  } else {
    scalingMode = morpheus.HeatMapColorScheme.ScalingMode.RELATIVE;
  }

  var fractions = [];
  var colors = [];
  var names = [];
  var hasNames = false;
  if (map) {
    var valueToFraction = d3.scale.linear().domain(
      [min, max]).range(
      [0, 1]).clamp(true);

    for (var i = 0; i < map.length; i++) {
      fractions.push(valueToFraction(map[i].value));
      colors.push(map[i].color);
      var name = map[i].name;
      if (!hasNames && name !== undefined) {
        hasNames = true;
      }
      names.push(name);
    }
  }

  var json = {
    stepped: options.stepped,
    scalingMode: scalingMode,
    fractions: fractions,
    colors: colors,
    names: hasNames ? names : null,
    min: min,
    max: max,
    transformValues: options.transformValues
  };
  if (options.missingColor != null) {
    json.missingColor = options.missingColor;
  }

  if (options.conditions != null) {
    json.conditions = options.conditions;
  }
  if (options.size != null) {
    json.size = options.size;
  }
  return morpheus.AbstractColorSupplier.fromJSON(json);
};
morpheus.HeatMapColorScheme.prototype = {
  getColors: function () {
    return this.currentColorSupplier.getColors();
  },
  setMissingColor: function (color) {
    this.currentColorSupplier.setMissingColor(color);
  },
  getHiddenValues: function () {
    return this.currentColorSupplier.getHiddenValues ? this.currentColorSupplier
      .getHiddenValues()
      : null;
  },
  getMissingColor: function () {
    return this.currentColorSupplier.getMissingColor();
  },
  getScalingMode: function () {
    return this.currentColorSupplier.getScalingMode();
  },
  getSizer: function () {
    return this.currentColorSupplier.getSizer();
  },
  getConditions: function () {
    return this.currentColorSupplier.getConditions();
  },
  setScalingMode: function (scalingMode) {
    this.currentColorSupplier.setScalingMode(scalingMode);
  },
  getFractions: function () {
    return this.currentColorSupplier.getFractions();
  },
  getNames: function () {
    return this.currentColorSupplier.getNames();
  },
  getMin: function () {
    return this.currentColorSupplier.getMin();
  },
  getMax: function () {
    return this.currentColorSupplier.getMax();
  },
  setMin: function (min) {
    this.currentColorSupplier.setMin(min);
  },
  setMax: function (max) {
    this.currentColorSupplier.setMax(max);
  },
  isStepped: function () {
    return this.currentColorSupplier.isStepped();
  },
  setFractions: function (options) {
    this.currentColorSupplier.setFractions(options);
  },
  setTransformValues: function (options) {
    this.currentColorSupplier.setTransformValues(options);
    this.cachedRowStats.cachedRow = -1;
  },
  getTransformValues: function () {
    return this.currentColorSupplier.getTransformValues();
  },
  setStepped: function (stepped) {
    var oldColorSupplier = this.currentColorSupplier;
    var newColorSupplier = stepped ? new morpheus.SteppedColorSupplier()
      : new morpheus.GradientColorSupplier();
    newColorSupplier.sizer = oldColorSupplier.getSizer();
    newColorSupplier.array = oldColorSupplier.getConditions();
    newColorSupplier.setScalingMode(oldColorSupplier.getScalingMode());
    newColorSupplier.setMin(oldColorSupplier.getMin());
    newColorSupplier.setMax(oldColorSupplier.getMax());
    newColorSupplier.setFractions({
      fractions: oldColorSupplier.getFractions(),
      colors: oldColorSupplier.getColors()
    });
    this.currentColorSupplier = newColorSupplier;
    this.rowValueToColorSupplier[this.value] = this.currentColorSupplier;
  },
  toJSON: function () {
    var json = {};
    var _this = this;
    if (this.separateColorSchemeForRowMetadataField != null) {
      json.separateColorSchemeForRowMetadataField = this.separateColorSchemeForRowMetadataField;
    }
    json.valueToColorScheme = {};
    _.each(_.keys(this.rowValueToColorSupplier), function (key) {
      // save each scheme
      json.valueToColorScheme[key] = morpheus.AbstractColorSupplier.toJSON(_this.rowValueToColorSupplier[key]);
    });

    return json;
  },
  fromJSON: function (json) {
    var _this = this;
    if (json.separateColorSchemeForRowMetadataField) {
      this.separateColorSchemeForRowMetadataField = json.separateColorSchemeForRowMetadataField;
      this.vector = this.project.getSortedFilteredDataset()
        .getRowMetadata().getByName(
          this.separateColorSchemeForRowMetadataField);
    }
    this.rowValueToColorSupplier = {};
    var obj = json.valueToColorScheme || json.colorSchemes;
    _.each(_.keys(obj), function (key) {
      var colorSupplier = morpheus.AbstractColorSupplier
        .fromJSON(obj[key]);
      _this.rowValueToColorSupplier[key] = colorSupplier;
    });
    this._ensureColorSupplierExists();

  },
  copy: function (project) {
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
    _.each(_.keys(this.rowValueToColorSupplier), function (key) {
      c.rowValueToColorSupplier[key] = _this.rowValueToColorSupplier[key]
        .copy();
    });

    c.value = this.value;
    c.currentColorSupplier = c.rowValueToColorSupplier[c.value];

    return c;
  },
  setSeparateColorSchemeForRowMetadataField: function (separateColorSchemeForRowMetadataField) {
    if (separateColorSchemeForRowMetadataField != this.separateColorSchemeForRowMetadataField) {
      this.separateColorSchemeForRowMetadataField = separateColorSchemeForRowMetadataField;
      this.vector = this.project.getSortedFilteredDataset()
        .getRowMetadata().getByName(
          separateColorSchemeForRowMetadataField);
      var that = this;
      _.each(_.keys(this.rowValueToColorSupplier), function (key) {
        // remove old color schemes
        delete that.rowValueToColorSupplier[key];
      });
    }
  },
  getProject: function () {
    return this.project;
  },
  getSeparateColorSchemeForRowMetadataField: function () {
    return this.separateColorSchemeForRowMetadataField;
  },
  getColorByValues: function () {
    return _.keys(this.rowValueToColorSupplier);
  },
  projectUpdated: function () {
    var dataset = this.project.getSortedFilteredDataset();
    if (this.separateColorSchemeForRowMetadataField != null) {
      this.vector = this.project.getSortedFilteredDataset()
        .getRowMetadata().getByName(
          this.separateColorSchemeForRowMetadataField);
    }
    this.cachedRowStats = new morpheus.RowStats(dataset);
  },
  setColorSupplierForCurrentValue: function (colorSupplier) {
    this.rowValueToColorSupplier[this.value] = colorSupplier;
    this.currentColorSupplier = colorSupplier;
  },
  setCurrentValue: function (value) {
    this.value = value;
    this._ensureColorSupplierExists();
  },
  isSizeBy: function () {
    this.currentColorSupplier.isSizeBy();
  },
  getColor: function (row, column, val) {
    if (this.vector !== undefined) {
      var tmp = this.vector.getValue(row);
      if (this.value !== tmp) {
        this.value = tmp;
        this._ensureColorSupplierExists();
      }
    }
    if (this.currentColorSupplier.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
      if (this.cachedRowStats.maybeUpdateRelative(row)) {
        this.currentColorSupplier
          .setMin(this.cachedRowStats.rowCachedMin);
        this.currentColorSupplier
          .setMax(this.cachedRowStats.rowCachedMax);
      }
    } else if (this.currentColorSupplier.getTransformValues() && this.cachedRowStats.cachedRow !== row) {
      this.cachedRowStats.cacheTransformValues(row, this.currentColorSupplier.getTransformValues());
      val = (val - this.cachedRowStats.rowCachedMean) / this.cachedRowStats.rowCachedStandardDeviation;
    }
    return this.currentColorSupplier.getColor(row, column, val);
  },
  /**
   * @private
   */
  _ensureColorSupplierExists: function () {
    this.currentColorSupplier = this.rowValueToColorSupplier[this.value];
    if (this.currentColorSupplier === undefined) {
      var cs = morpheus.HeatMapColorScheme.createColorSupplier({
        type: 'relative'
      });
      this.rowValueToColorSupplier[this.value] = cs;
      this.currentColorSupplier = cs;
    }
  }
};
morpheus.RowStats = function (dataset) {
  this.datasetRowView = new morpheus.DatasetRowView(dataset);
  this.cachedRow = -1;
  this.rowCachedMax = 0;
  this.rowCachedMin = 0;
  this.rowCachedStandardDeviation = -1;
  this.rowCachedMean = -1;
};
morpheus.RowStats.prototype = {
  cacheTransformValues: function (row, transform) {
    var meanFunction = transform === morpheus.AbstractColorSupplier.Z_SCORE ? morpheus.Mean : morpheus.Median;
    var stdevFunction = transform === morpheus.AbstractColorSupplier.Z_SCORE ? morpheus.StandardDeviation : morpheus.MAD;
    this.datasetRowView.setIndex(row);
    this.rowCachedMean = meanFunction(this.datasetRowView);
    this.rowCachedStandardDeviation = stdevFunction(this.datasetRowView, this.rowCachedMean);
  },
  maybeUpdateRelative: function (row) {
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

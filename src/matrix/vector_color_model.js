morpheus.VectorColorModel = function () {
  this.vectorNameToColorMap = new morpheus.Map();
  this.vectorNameToColorScheme = new morpheus.Map();
  this.colors = morpheus.VectorColorModel.TWENTY_COLORS;
};

morpheus.VectorColorModel.YES_COLOR = '#d8b365';
morpheus.VectorColorModel.FEMALE = '#ff99ff';
morpheus.VectorColorModel.MALE = '#66ccff';

// tableau 20-same as d3 category20
morpheus.VectorColorModel.TWENTY_COLORS = ['#1f77b4', '#aec7e8', '#ff7f0e',
  '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd',
  '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f',
  '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];
morpheus.VectorColorModel.CATEGORY_20A = morpheus.VectorColorModel.TWENTY_COLORS;
morpheus.VectorColorModel.CATEGORY_20B = ['#393b79', '#5254a3', '#6b6ecf',
  '#9c9ede', '#637939', '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31',
  '#bd9e39', '#e7ba52', '#e7cb94', '#843c39', '#ad494a', '#d6616b',
  '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'];
morpheus.VectorColorModel.CATEGORY_20C = ['#3182bd', '#6baed6', '#9ecae1',
  '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354',
  '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc',
  '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'];

morpheus.VectorColorModel.CATEGORY_ALL = [].concat(
  morpheus.VectorColorModel.CATEGORY_20A,
  morpheus.VectorColorModel.CATEGORY_20B,
  morpheus.VectorColorModel.CATEGORY_20C);

morpheus.VectorColorModel.TABLEAU10 = ['#1f77b4', '#ff7f0e', '#2ca02c',
  '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22',
  '#17becf'];
morpheus.VectorColorModel.STANDARD_COLORS = {
  'na': '#c0c0c0',
  'nan': '#c0c0c0',
  '': '#ffffff',
  'wt': '#ffffff',
  'n': '#ffffff',
  '0': '#ffffff',
  'y': morpheus.VectorColorModel.YES_COLOR,
  '1': morpheus.VectorColorModel.YES_COLOR,
  'male': morpheus.VectorColorModel.MALE,
  'm': morpheus.VectorColorModel.MALE,
  'female': morpheus.VectorColorModel.FEMALE,
  'f': morpheus.VectorColorModel.FEMALE,
  'kd': '#C675A8',
  'oe': '#56b4e9',
  'cp': '#FF9933',
  'pcl':'#003B4A',
  'trt_sh.cgs': '#C675A8',
  'trt_oe': '#56b4e9',
  'trt_cp': '#FF9933',
  'a375': '#1490C1',
  'a549': '#AAC8E9',
  'hcc515': '#1C9C2A',
  'hepg2': '#94DC89',
  'ht29': '#946DBE',
  'mcf7': '#C5B2D5',
  'pc3': '#38C697',
  'asc': '#FF8000',
  'cd34': '#FFBB75',
  'ha1e': '#FB4124',
  'neu': '#FF9A94',
  'npc': '#E57AC6',
  'cancer': '#1490C1',
  'immortalized normal': '#FF8000'
};
morpheus.VectorColorModel.getStandardColor = function (value) {
  if (value == null) {
    return '#ffffff';
  }
  var stringValue = value.toString().toLowerCase();
  return morpheus.VectorColorModel.STANDARD_COLORS[stringValue];

};
morpheus.VectorColorModel.getColorMapForNumber = function (length) {
  var colors;
  if (length < 3) {
    colors = colorbrewer.Set1[3];
  } else {
    colors = colorbrewer.Paired[length];
  }
  return colors ? colors : morpheus.VectorColorModel.TWENTY_COLORS;
};
morpheus.VectorColorModel.prototype = {
  toJSON: function () {
    var json = {};
    this.vectorNameToColorScheme.forEach(function (colorScheme, name) {
      var colorSchemeJSON = morpheus.AbstractColorSupplier.toJSON(colorScheme);
      colorSchemeJSON.continuous = true;
      json[name] = colorSchemeJSON;
    });
    this.vectorNameToColorMap.forEach(function (colorMap, name) {
      json[name] = colorMap;
    });
    return json;
  },
  fromJSON: function (json) {
    for (var name in json) {
      if (json.continuous) {
        this.vectorNameToColorScheme.set(name, morpheus.AbstractColorSupplier.fromJSON());
      } else {
        this.vectorNameToColorMap.set(name, morpheus.Map.fromJSON(json[name]));
      }
    }
  },
  clear: function (vector) {
    this.vectorNameToColorMap.remove(vector.getName());
    this.vectorNameToColorScheme.remove(vector.getName());
  },
  copy: function () {
    var c = new morpheus.VectorColorModel();
    c.colors = this.colors.slice(0);
    this.vectorNameToColorMap.forEach(function (colorMap, name) {
      var newColorMap = new morpheus.Map();
      newColorMap.setAll(colorMap); // copy existing values
      c.vectorNameToColorMap.set(name, newColorMap);
    });
    this.vectorNameToColorScheme.forEach(function (colorScheme, name) {
      c.vectorNameToColorScheme.set(name, colorScheme
      .copy(new morpheus.Project(new morpheus.Dataset({
        name: '',
        rows: 1,
        columns: 1
      }))));
    });
    return c;
  },
  clearAll: function () {
    this.vectorNameToColorMap = new morpheus.Map();
    this.vectorNameToColorScheme = new morpheus.Map();
  },
  containsDiscreteColor: function (vector, value) {
    var metadataValueToColorMap = this.vectorNameToColorMap.get(vector
    .getName());
    if (metadataValueToColorMap === undefined) {
      return false;
    }
    var c = metadataValueToColorMap.get(value);
    return c != null;
  },
  setDiscreteColorMap: function (colors) {
    this.colors = colors;
  },
  getContinuousColorScheme: function (vector) {
    var scheme = this.vectorNameToColorScheme.get(vector.getName());
    if (scheme == null) {
      scheme = this.createContinuousColorMap(vector);
    }
    return scheme;
  },
  getDiscreteColorScheme: function (vector) {
    return this.vectorNameToColorMap.get(vector.getName());
  },
  createContinuousColorMap: function (vector) {
    var minMax = morpheus.VectorUtil.getMinMax(vector);
    var min = minMax.min;
    var max = minMax.max;
    var cs = new morpheus.HeatMapColorScheme(new morpheus.Project(
      new morpheus.Dataset({
        name: '',
        rows: 1,
        columns: 1
      })), {
      type: 'fixed',
      map: [{
        value: min,
        color: colorbrewer.Greens[3][0]
      }, {
        value: max,
        color: colorbrewer.Greens[3][2]
      }]
    });
    this.vectorNameToColorScheme.set(vector.getName(), cs);
    return cs;

  },
  _getColorForValue: function (value) {
    var color = morpheus.VectorColorModel.getStandardColor(value);
    if (color == null) { // try to reuse existing color map
      var existingMetadataValueToColorMap = this.vectorNameToColorMap
      .values();
      for (var i = 0, length = existingMetadataValueToColorMap.length; i < length; i++) {
        color = existingMetadataValueToColorMap[i].get(value);
        if (color !== undefined) {
          return color;
        }
      }
    }
    return color;
  },
  getContinuousMappedValue: function (vector, value) {
    var cs = this.vectorNameToColorScheme.get(vector.getName());
    if (cs === undefined) {
      cs = this.createContinuousColorMap(vector);
    }
    return cs.getColor(0, 0, value);
  },
  getMappedValue: function (vector, value) {
    var metadataValueToColorMap = this.vectorNameToColorMap.get(vector
    .getName());
    if (metadataValueToColorMap === undefined) {
      metadataValueToColorMap = new morpheus.Map();
      this.vectorNameToColorMap.set(vector.getName(),
        metadataValueToColorMap);
      // set all possible colors
      var values = morpheus.VectorUtil.getValues(vector);
      var ncolors = 0;
      var colors = null;
      if (values.length < 3) {
        colors = colorbrewer.Dark2[3];
      } else {
        colors = colorbrewer.Paired[values.length];
      }

      if (!colors) {
        if (values.length <= 20) {
          colors = d3.scale.category20().range();
        } else {
          colors = morpheus.VectorColorModel.CATEGORY_ALL;
        }
      }

      if (colors) {
        var ncolors = colors.length;
        for (var i = 0, nvalues = values.length; i < nvalues; i++) {
          var color = this._getColorForValue(values[i]);
          if (color == null) {
            color = colors[i % ncolors];
          }
          metadataValueToColorMap.set(values[i], color);
        }
      } else {
        var _this = this;
        _.each(values, function (val) {
          _this.getMappedValue(vector, val);
        });
      }
    }
    var color = metadataValueToColorMap.get(value);
    if (color == null) {
      color = this._getColorForValue(value);
      if (color == null) {
        var index = metadataValueToColorMap.size();
        color = this.colors[index % this.colors.length];
      }
      metadataValueToColorMap.set(value, color);
    }
    return color;
  },
  setMappedValue: function (vector, value, color) {
    var metadataValueToColorMap = this.vectorNameToColorMap.get(vector
    .getName());
    if (metadataValueToColorMap === undefined) {
      metadataValueToColorMap = new morpheus.Map();
      this.vectorNameToColorMap.set(vector.getName(),
        metadataValueToColorMap);
    }
    metadataValueToColorMap.set(value, color);
  }
};

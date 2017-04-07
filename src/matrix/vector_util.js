morpheus.VectorUtil = function () {
};

morpheus.VectorUtil.jsonToFunction = function (vector, key) {
  var f = vector.getProperties().get(key);
  if (typeof f === 'object') {
    var binSize = f.binSize;
    var min = f.domain[0];
    var max = f.domain[1];
    var numberOfBins = Math.ceil((max - min) / binSize);
    var percent = f.percent;
    var cumulative = f.cumulative;
    var histogramFunction = function (view, selectedDataset, columnIndex) {
      var total = 0;
      var binNumberToOccurences = new Uint32Array(numberOfBins);
      for (var i = 0, nrows = selectedDataset.getRowCount(); i < nrows; i++) {
        var value = selectedDataset.getValue(i, columnIndex);
        if (!isNaN(value)) {
          if (value >= min && value <= max) {
            var bin = Math.floor(((value - min) / binSize));
            if (bin < 0) {
              bin = 0;
            } else if (bin >= numberOfBins) {
              bin = numberOfBins - 1;
            }
            binNumberToOccurences[bin]++;
          }
          total++;
        }
      }
      if (cumulative) {
        for (var i = numberOfBins - 2; i >= 0; i--) {
          binNumberToOccurences[i] += binNumberToOccurences[i + 1];
        }
      }
      if (percent) {
        var percents = new Float32Array(numberOfBins);
        for (var i = 0; i < numberOfBins; i++) {
          percents[i] = 100 * (binNumberToOccurences[i] / total);
        }
        return percents;
      }
      return binNumberToOccurences;
    };
    vector.getProperties().set(key, histogramFunction);
    var jsonSpec = f;
    f = histogramFunction;
    f.toJSON = function () {
      return jsonSpec;
    };
  }
  return f;
};
morpheus.VectorUtil.createValueToIndexMap = function (vector, splitArrayValues) {
  var map = new morpheus.Map();
  var isArray = splitArrayValues && morpheus.VectorUtil.getDataType(vector)[0] === '[';
  for (var j = 0, size = vector.size(); j < size; j++) {
    var val = vector.getValue(j);
    if (isArray) {
      if (val != null) {
        for (var k = 0; k < val.length; k++) {
          map.set(val[k], j);
        }
      }
    } else {
      map.set(val, j);
    }
  }
  return map;
};

morpheus.VectorUtil.createValueToIndicesMap = function (vector, splitArrayValues) {
  if (!vector) {
    throw 'vector is null';
  }
  var isArray = splitArrayValues && morpheus.VectorUtil.getDataType(vector)[0] === '[';
  var map = new morpheus.Map();
  for (var j = 0, size = vector.size(); j < size; j++) {
    var val = vector.getValue(j);
    if (isArray) {
      if (val != null) {
        for (var k = 0; k < val.length; k++) {
          var list = map.get(val[k]);
          if (list === undefined) {
            list = [];
            map.set(val[k], list);
          }
          list.push(j);
        }
      }
    } else {
      var list = map.get(val);
      if (list === undefined) {
        list = [];
        map.set(val, list);
      }
      list.push(j);
    }
  }
  return map;
};

morpheus.VectorUtil.createValueToCountMap = function (vector) {
	if (!vector) {
		throw 'vector is null';
	}
	var map = new morpheus.Map();
	var dataType = morpheus.VectorUtil.getDataType(vector);
	var isArray = dataType[0] === '[';
	for (var j = 0, size = vector.size(); j < size; j++) {
		var val = vector.getValue(j);
		if (val != null) {
			if (isArray) {
				for (var k = 0; k < val.length; k++) {
					var count = map.get(val[k]) || 0;
					map.set(val[k], count + 1);
				}
			} else {
				var count = map.get(val) || 0;
				map.set(val, count + 1);
			}
		}
	}
	return map;
};

morpheus.VectorUtil.createValuesToIndicesMap = function (vectors) {
  var map = new morpheus.Map();
  var nvectors = vectors.length;
  if (vectors[0] == null) {
    throw 'no vectors found';
  }
  for (var i = 0, nitems = vectors[0].size(); i < nitems; i++) {
    var array = [];
    for (var j = 0; j < nvectors; j++) {
      var vector = vectors[j];
      var val = vector.getValue(i);
      array.push(val);
    }
    var key = new morpheus.Identifier(array);
    var list = map.get(key);
    if (list === undefined) {
      list = [];
      map.set(key, list);
    }
    list.push(i);
  }
  return map;
};
morpheus.VectorUtil.createValuesToIndexMap = function (vectors) {
  var map = new morpheus.Map();
  var nvectors = vectors.length;
  if (vectors[0] == null) {
    throw 'no vectors found';
  }
  for (var i = 0, nitems = vectors[0].size(); i < nitems; i++) {
    var array = [];
    for (var j = 0; j < nvectors; j++) {
      var vector = vectors[j];
      var val = vector.getValue(i);
      array.push(val);
    }
    var key = new morpheus.Identifier(array);
    map.set(key, i);
  }
  return map;
};

morpheus.VectorUtil.createValuesToCountMap = function (vectors) {
  var map = new morpheus.Map();
  var nvectors = vectors.length;
  if (vectors[0] == null) {
    throw 'no vectors found';
  }
  for (var i = 0, nitems = vectors[0].size(); i < nitems; i++) {
    var array = [];
    for (var j = 0; j < nvectors; j++) {
      var vector = vectors[j];
      var val = vector.getValue(i);
      array.push(val);
    }
    var key = new morpheus.Identifier(array);
    var count = map.get(key) || 0;
    map.set(key, count + 1);
  }
  return map;
};

/**
 *
 * @param vector
 * @param excludeNull
 * @returns A sorted array of unique values contained in the vector. Note that array values are
 * not split.
 */
morpheus.VectorUtil.getValues = function (vector, excludeNull) {
  var set = new morpheus.Set();
  for (var j = 0, size = vector.size(); j < size; j++) {
    var val = vector.getValue(j);
    if (excludeNull && val == null) {
      continue;
    }
    set.add(val);
  }
  var array = set.values();
  array.sort(morpheus.SortKey.ASCENDING_COMPARATOR);
  return array;
};

morpheus.VectorUtil.getSet = function (vector, splitArrayValues) {
  var set = new morpheus.Set();
  var isArray = splitArrayValues && morpheus.VectorUtil.getDataType(vector)[0] === '[';
  for (var j = 0, size = vector.size(); j < size; j++) {
    var value = vector.getValue(j);
    if (isArray) {
      if (value != null) {
        for (var k = 0, nvalues = value.length; k < nvalues; k++) {
          set.add(value[k]);
        }
      }
    } else {
      set.add(value);
    }

  }
  return set;
};
morpheus.VectorUtil.maybeConvertToStringArray = function (vector, delim) {
  var newValues = [];
  var regex = new RegExp(delim);
  var found = false;

  for (var i = 0, nrows = vector.size(); i < nrows; i++) {
    var s = vector.getValue(i);
    if (s != null) {
      if (!s.split) {
        return false;
      }
      var tokens = s.split(regex);
      newValues.push(tokens);
      if (!found && tokens.length > 1) {
        found = true;
      }
    }

  }
  if (found) {
    for (var i = 0, nrows = newValues.length; i < nrows; i++) {
      vector.setValue(i, newValues[i]);
    }
    vector.getProperties().set(morpheus.VectorKeys.DATA_TYPE, '[string]');
  }

  return found;
};

morpheus.VectorUtil.maybeConvertStringToNumber = function (vector) {
  var newValues = [];
  var found = false;
  for (var i = 0, nrows = vector.size(); i < nrows; i++) {
    var s = vector.getValue(i);
    if (s != null && s !== '' && s !== 'NA' && s !== 'NaN') {
      if (!$.isNumeric(s)) {
        return false;
      } else {
        found = true;
      }
    }
    newValues.push(parseFloat(s));
  }
  if (!found) {
    return false;
  }
  for (var i = 0, nrows = newValues.length; i < nrows; i++) {
    vector.setValue(i, newValues[i]);
  }
  vector.getProperties().set(morpheus.VectorKeys.DATA_TYPE, 'number');
  return true;
};
morpheus.VectorUtil.containsMoreThanOneValue = function (vector) {
  return morpheus.VectorUtil.containsMoreThanNValues(vector, 1);
};
morpheus.VectorUtil.containsMoreThanNValues = function (vector, n) {
  var s = new morpheus.Set();
  for (var j = 0, size = vector.size(); j < size; j++) {
    var val = vector.getValue(j);
    s.add(val);
    if (s.size() > n) {
      return true;
    }
  }
  return false;
};

morpheus.VectorUtil.createSpanMap = function (vector) {
  var previous = vector.getValue(0);
  // find 1st row with different value
  var startIndexToEndIndex = new morpheus.Map();
  var start = 0;
  for (var i = 1, nrows = vector.size(); i < nrows; i++) {
    var val = vector.getValue(i);
    if (previous !== val) {
      previous = val;
      // start inclusive, end exclusive
      startIndexToEndIndex.set(start, i);
      start = i;
    }
  }
  startIndexToEndIndex.set(start, vector.size());
  return startIndexToEndIndex;
};
morpheus.VectorUtil.toArray = function (vector) {
  var array = [];
  for (var i = 0, length = vector.size(); i < length; i++) {
    var val = vector.getValue(i);
    array.push(val);
  }
  return array;
};

morpheus.VectorUtil.arrayAsVector = function (array, name) {
  var v = new morpheus.Vector(name, array.length);
  v.array = array;
  return v;
};
morpheus.VectorUtil.toString = function (vector) {
  var array = [];
  for (var i = 0, length = vector.size(); i < length; i++) {
    var val = vector.getValue(i);
    array.push(val);
  }
  return array.join(', ');
};

morpheus.VectorUtil.getDataType = function (vector) {
  var dataType = vector.getProperties().get(morpheus.VectorKeys.DATA_TYPE);
  if (dataType === undefined) {
    var firstNonNull = morpheus.VectorUtil.getFirstNonNull(vector);
    dataType = morpheus.Util.getDataType(firstNonNull);
    vector.getProperties().set(morpheus.VectorKeys.DATA_TYPE, dataType);
  }
  return dataType;

};

morpheus.VectorUtil.getMinMax = function (vector) {
  var min = Number.MAX_VALUE;
  var max = -Number.MAX_VALUE;
  var fields = vector.getProperties().get(morpheus.VectorKeys.FIELDS);
  var isArray = morpheus.VectorUtil.getDataType(vector)[0] === '[';
  if (fields != null) {
    var nvalues = fields.length;
    for (var i = 0, size = vector.size(); i < size; i++) {
      var array = vector.getValue(i);
      if (array) {
        for (var j = 0; j < nvalues; j++) {
          var value = array[j];
          if (!isNaN(value)) {
            min = value < min ? value : min;
            max = value > max ? value : max;
          }
        }
      }
    }
  } else if (isArray) {
    for (var i = 0, size = vector.size(); i < size; i++) {
      var array = vector.getValue(i);
      if (array != null) {
        for (var j = 0, nvalues = array.length; j < nvalues; j++) {
          var value = array[j];
          if (!isNaN(value)) {
            min = value < min ? value : min;
            max = value > max ? value : max;
          }
        }
      }
    }
  } else {
    for (var i = 0, size = vector.size(); i < size; i++) {
      var value = vector.getValue(i);
      if (!isNaN(value)) {
        min = value < min ? value : min;
        max = value > max ? value : max;
      }
    }
  }
  return {
    min: min,
    max: max
  };
}
;
morpheus.VectorUtil.getFirstNonNull = function (vector) {
  for (var i = 0, length = vector.size(); i < length; i++) {
    var val = vector.getValue(i);
    if (val != null) {
      return val;
    }
  }
  return null;
};
morpheus.VectorUtil.isNumber = function (vector) {
  return morpheus.VectorUtil.getDataType(vector) === 'number';
};

morpheus.VectorUtil = function() {
};
morpheus.VectorUtil.createValueToIndicesMap = function(vector) {
	if (!vector) {
		throw 'vector is null';
	}
	var map = new morpheus.Map();
	for (var j = 0, size = vector.size(); j < size; j++) {
		var val = vector.getValue(j);
		var list = map.get(val);
		if (list === undefined) {
			list = [];
			map.set(val, list);
		}
		list.push(j);
	}
	return map;
};
morpheus.VectorUtil.createValueToCountMap = function(vector) {
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
morpheus.VectorUtil.maybeConvertStringToNumber = function(vector) {
	var newValues = [];

	for (var i = 0, nrows = vector.size(); i < nrows; i++) {
		var s = vector.getValue(i);
		if (s != null && s !== '' && s !== 'NA' && s !== 'NaN') {
			if (!$.isNumeric(s)) {
				return false;
			}
		}
		newValues.push(parseFloat(s));
	}
	for (var i = 0, nrows = newValues.length; i < nrows; i++) {
		vector.setValue(i, newValues[i]);
	}
	return true;
};
morpheus.VectorUtil.createValuesToIndicesMap = function(vectors) {
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
morpheus.VectorUtil.createValuesToIndexMap = function(vectors) {
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
morpheus.VectorUtil.containsMoreThanOneValue = function(vector) {
	return morpheus.VectorUtil.containsMoreThanNValues(vector, 1);
};
morpheus.VectorUtil.containsMoreThanNValues = function(vector, n) {
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
morpheus.VectorUtil.createValueToIndexMap = function(vector) {
	var map = new morpheus.Map();
	for (var j = 0, size = vector.size(); j < size; j++) {
		var val = vector.getValue(j);
		map.set(val, j);
	}
	return map;
};
morpheus.VectorUtil.getValues = function(vector, excludeNull) {
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
morpheus.VectorUtil.getSet = function(vector) {
	var set = new morpheus.Set();
	for (var j = 0, size = vector.size(); j < size; j++) {
		set.add(vector.getValue(j));
	}
	return set;
};
morpheus.VectorUtil.createSpanMap = function(vector) {
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
morpheus.VectorUtil.toArray = function(vector) {
	var array = [];
	for (var i = 0, length = vector.size(); i < length; i++) {
		var val = vector.getValue(i);
		array.push(val);
	}
	return array;
};

morpheus.VectorUtil.arrayAsVector = function(array, name) {
	var v = new morpheus.Vector(name, array.length);
	v.array = array;
	return v;
};
morpheus.VectorUtil.toString = function(vector) {
	var array = [];
	for (var i = 0, length = vector.size(); i < length; i++) {
		var val = vector.getValue(i);
		array.push(val);
	}
	return array.join(', ');
};

morpheus.VectorUtil.getDataType = function(vector) {
	var dataType = vector.getProperties().get(morpheus.VectorKeys.DATA_TYPE);
	if (dataType === undefined) {
		var firstNonNull = morpheus.VectorUtil.getFirstNonNull(vector);
		var isArray = morpheus.Util.isArray(firstNonNull);
		if (isArray && firstNonNull.length > 0) {
			firstNonNull = firstNonNull[0];
		}
		if (_.isString(firstNonNull)) {
			dataType = 'string';
		} else if (_.isNumber(firstNonNull)) {
			dataType = 'number';
		} else {
			dataType = 'object';
		}
		if (isArray) {
			dataType = '[' + dataType + ']';
		}
		vector.getProperties().set(morpheus.VectorKeys.DATA_TYPE, dataType);
	}
	return dataType;

};

morpheus.VectorUtil.getMinMax = function(vector) {
	var min = Number.MAX_VALUE;
	var max = -Number.MAX_VALUE;
	var fields = vector.getProperties().get(morpheus.VectorKeys.FIELDS);
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
		min : min,
		max : max
	};
};
morpheus.VectorUtil.getFirstNonNull = function(vector) {
	for (var i = 0, length = vector.size(); i < length; i++) {
		var val = vector.getValue(i);
		if (val != null) {
			return val;
		}
	}
	return null;
};
morpheus.VectorUtil.isNumber = function(vector) {
	return _.isNumber(morpheus.VectorUtil.getFirstNonNull(vector));
};

morpheus.Dataset = function (options) {
	morpheus.AbstractDataset.call(this, options.rows,
		options.columns);
	if (options.dataType == null) {
		options.dataType = 'Float32';
	}

	this.seriesNames.push(options.name);
	this.seriesArrays.push(options.array ? options.array : morpheus.Dataset
	.createArray(options));
	this.seriesDataTypes.push(options.dataType);
};
morpheus.Dataset.toJson = function (dataset, options) {
	options = options || {};

	var data = [];
	for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
		var row = [];
		data.push(row);
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			row[j] = dataset.getValue(i, j);
		}
	}
	var vectorToJson = function (vector) {
		var array = [];
		for (var i = 0, size = vector.size(); i < size; i++) {
			array[i] = vector.getValue(i);
		}
		return {
			name: vector.getName(),
			array: array
		};
	};
	var metadataToJson = function (metadata, fields) {
		var vectors = [];
		var filter;
		if (fields) {
			filter = new morpheus.Set();
			fields.forEach(function (field) {
				filter.add(field);
			});
		}
		for (var i = 0, count = metadata.getMetadataCount(); i < count; i++) {
			var v = metadata.get(i);
			if (filter) {
				if (filter.has(v.getName())) {
					vectors.push(vectorToJson(v));
				}
			} else {
				vectors.push(vectorToJson(v));
			}
		}
		return vectors;
	};
	return {
		rows: dataset.getRowCount(),
		columns: dataset.getColumnCount(),
		seriesArrays: [data],
		seriesDataTypes: [dataset.getDataType(0)],
		seriesNames: [dataset.getName()],
		rowMetadataModel: {
			vectors: metadataToJson(dataset.getRowMetadata(),
				options.rowFields)
		},
		columnMetadataModel: {
			vectors: metadataToJson(dataset.getColumnMetadata(),
				options.columnFields)
		}
	};
};
morpheus.Dataset.fromJson = function (options) {
	// Object {seriesNames:
	// Array[1], seriesArrays:
	// Array[1], rows:
	// 6238, columns: 7251,
	// rowMetadataModel: Object…}
	// columnMetadataModel: Object
	// itemCount: 7251
	// vectors: Array[3]
	// array: Array[7251]
	// n: 7251
	// name: "pert_id"
	// properties: Object
	// columns: 7251
	// rowMetadataModel: Object
	// rows: 6238
	// seriesArrays: Array[1]
	// seriesNames: Array[1]
	// var array = morpheus.Dataset.createArray(options);
	// for (var i = 0; i < options.rows; i++) {
	// var row = array[i];
	// var jsonRow = options.array[i];
	// for (var j = 0; j < options.columns; j++) {
	// row[j] = jsonRow[j];
	// }
	// }

	if (options.seriesMappings) {
		for (var seriesIndex = 0; seriesIndex < options.seriesMappings.length; seriesIndex++) {
			// map ordinal values
			if (options.seriesMappings[seriesIndex]) {

				var map = options.seriesMappings[seriesIndex]; // e.g. foo:1, bar:3
				var valueMap = new morpheus.Map();
				for (var key in map) {
					var value = map[key];
					valueMap.set(value, morpheus.Util.wrapNumber(value, key));
				}

				var array = options.seriesArrays[seriesIndex];
				for (var i = 0; i < options.rows; i++) {
					for (var j = 0; j < options.columns; j++) {
						var value = array[i][j];
						array[i][j] = valueMap.get(value);
					}
				}
				options.seriesDataTypes[seriesIndex] = 'Number';
			}
		}
	}
	var dataset = new morpheus.Dataset({
		name: options.seriesNames[0],
		dataType: options.seriesDataTypes[0],
		array: options.seriesArrays[0],
		rows: options.rows,
		columns: options.columns
	});

	if (options.rowMetadataModel) {
		options.rowMetadataModel.vectors.forEach(function (v) {
			var vector = new morpheus.Vector(v.name, dataset.getRowCount());
			vector.array = v.array;
			dataset.rowMetadataModel.vectors.push(vector);
		});
	}
	if (options.columnMetadataModel) {
		options.columnMetadataModel.vectors.forEach(function (v) {
			var vector = new morpheus.Vector(v.name, dataset.getColumnCount());
			vector.array = v.array;
			dataset.columnMetadataModel.vectors.push(vector);
		});
	}
	for (var i = 1; i < options.seriesArrays.length; i++) {

		dataset.addSeries({
			name: options.seriesNames[i],
			dataType: options.seriesDataTypes[i],
			array: options.seriesArrays[i]
		});
	}
	return dataset;
};
morpheus.Dataset.createArray = function (options) {
	var array = [];
	if (options.dataType == null || options.dataType === 'Float32') {
		for (var i = 0; i < options.rows; i++) {
			array.push(new Float32Array(options.columns));
		}
	} else if (options.dataType === 'Int8') {
		for (var i = 0; i < options.rows; i++) {
			array.push(new Int8Array(options.columns));
		}
	} else if (options.dataType === 'Int16') {
		for (var i = 0; i < options.rows; i++) {
			array.push(new Int16Array(options.columns));
		}
	} else { // [object, number, Number] array of arrays
		for (var i = 0; i < options.rows; i++) {
			array.push([]);
		}
	}
	return array;
};
morpheus.Dataset.prototype = {
	getValue: function (i, j, seriesIndex) {
		seriesIndex = seriesIndex || 0;
		return this.seriesArrays[seriesIndex][i][j];
	},
	toString: function () {
		return this.getName();
	},
	setValue: function (i, j, value, seriesIndex) {
		seriesIndex = seriesIndex || 0;
		this.seriesArrays[seriesIndex][i][j] = value;
	},
	addSeries: function (options) {
		options = $.extend({}, {
			rows: this.getRowCount(),
			columns: this.getColumnCount(),
			dataType: 'Float32'
		}, options);
		this.seriesDataTypes.push(options.dataType);
		this.seriesNames.push(options.name);
		this.seriesArrays.push(options.array != null ? options.array
			: morpheus.Dataset.createArray(options));
		return this.seriesNames.length - 1;
	}
};
morpheus.Util.extend(morpheus.Dataset, morpheus.AbstractDataset);

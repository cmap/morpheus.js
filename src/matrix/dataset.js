morpheus.Dataset = function(options) {
	morpheus.AbstractDataset.call(this, options.name, options.rows,
			options.columns);
	if (options.dataType == null) {
		options.dataType = 'Float32';
	}

	this.seriesArrays.push(options.array ? options.array : morpheus.Dataset
			.createArray(options));
	this.seriesDataTypes.push(options.dataType);
};
morpheus.Dataset.toJson = function(dataset, options) {
	options = options || {};

	var data = [];
	for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
		var row = [];
		data.push(row);
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			row[j] = dataset.getValue(i, j);
		}
	}
	var vectorToJson = function(vector) {
		var array = [];
		for (var i = 0, size = vector.size(); i < size; i++) {
			array[i] = vector.getValue(i);
		}
		return {
			name : vector.getName(),
			array : array
		};
	};
	var metadataToJson = function(metadata, fields) {
		var vectors = [];
		var filter;
		if (fields) {
			filter = new morpheus.Set();
			fields.forEach(function(field) {
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
		rows : dataset.getRowCount(),
		columns : dataset.getColumnCount(),
		seriesArrays : [ data ],
		seriesNames : [ dataset.getName() ],
		rowMetadataModel : {
			vectors : metadataToJson(dataset.getRowMetadata(),
					options.rowFields)
		},
		columnMetadataModel : {
			vectors : metadataToJson(dataset.getColumnMetadata(),
					options.columnFields)
		}
	};
};
morpheus.Dataset.fromJson = function(options) {
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
	options.array = options.seriesArrays[0];
	var dataset = new morpheus.Dataset(options);
	dataset.seriesNames = options.seriesNames;
	if (options.rowMetadataModel) {
		options.rowMetadataModel.vectors.forEach(function(v) {
			var vector = new morpheus.Vector(v.name, dataset.getRowCount());
			vector.array = v.array;
			dataset.rowMetadataModel.vectors.push(vector);
		});
	}
	if (options.columnMetadataModel) {
		options.columnMetadataModel.vectors.forEach(function(v) {
			var vector = new morpheus.Vector(v.name, dataset.getColumnCount());
			vector.array = v.array;
			dataset.columnMetadataModel.vectors.push(vector);
		});
	}
	return dataset;
};
morpheus.Dataset.createArray = function(options) {
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
	} else if (options.dataType === 'sparse') {
		// array of objects
		for (var i = 0; i < options.rows; i++) {
			array.push({});
		}
	} else { // dataType===object, array of arrays
		for (var i = 0; i < options.rows; i++) {
			array.push([]);
		}
	}
	return array;
};
morpheus.Dataset.prototype = {
	getValue : function(i, j, seriesIndex) {
		seriesIndex = seriesIndex || 0;
		return this.seriesArrays[seriesIndex][i][j];
	},
	toString : function() {
		return this.getName();
	},
	setValue : function(i, j, value, seriesIndex) {
		seriesIndex = seriesIndex || 0;
		this.seriesArrays[seriesIndex][i][j] = value;
	},
	addSeries : function(options) {
		options = $.extend({}, {
			rows : this.getRowCount(),
			columns : this.getColumnCount(),
			dataType : 'Float32'
		}, options);
		this.seriesDataTypes.push(options.dataType);
		this.seriesNames.push(options.name);
		this.seriesArrays.push(options.array != null ? options.array
				: morpheus.Dataset.createArray(options));
		return this.seriesNames.length - 1;
	},
	setESSession : function () {
		var _this = this;
		if (this.esSession != null) {
			return this.esSession;
		}
		else {
			var protoMessage = morpheus.DatasetUtil.toProtoMessage(this);


			var req = ocpu.call("createES", protoMessage, function (session) {
				console.log(session);
				_this.esSession = session;
			}, true);

			req.fail(function () {
				alert("failed to create ExpressionSet of dataset");
			})
		}
	},
	getESSession : function () {
		return this.esSession;
	}

};
morpheus.Util.extend(morpheus.Dataset, morpheus.AbstractDataset);
morpheus.TxtReader = function (options) {
	this.options = $.extend({}, {
		dataRowStart: 1,
		dataColumnStart: 1
	}, options);
};
morpheus.TxtReader.prototype = {
	read: function (fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util
		.getFileName(fileOrUrl));
		morpheus.BufferedReader.getArrayBuffer(fileOrUrl, function (err,
																	arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				try {
					callback(null, _this._read(name,
						new morpheus.BufferedReader(new Uint8Array(
							arrayBuffer))));
				} catch (x) {
					callback(x);
				}
			}
		});

	},
	_read: function (datasetName, reader) {
		var tab = /\t/;
		var header = morpheus.Util.trim(reader.readLine()).split(tab);
		if (this.options.dataRowStart > 1) {
			for (var i = 1; i < this.options.dataRowStart; i++) {
				reader.readLine();
			}
		}
		var dataColumnStart = this.options.dataColumnStart;
		var ncols = header.length - dataColumnStart;
		var matrix = [];
		var s;
		var arrayOfRowArrays = [];
		for (var i = 0; i < dataColumnStart; i++) {
			arrayOfRowArrays.push([]);
		}

		while ((s = reader.readLine()) !== null) {
			s = morpheus.Util.trim(s);
			if (s !== '') {
				var array = new Float32Array(ncols);
				matrix.push(array);
				var tokens = s.split(tab);
				for (var j = 0; j < dataColumnStart; j++) {
					// row metadata
					arrayOfRowArrays[j].push(morpheus.Util.copyString(tokens[j]));
				}
				for (var j = dataColumnStart; j <= ncols; j++) {
					var token = tokens[j];
					array[j - dataColumnStart] = parseFloat(token);
				}
			}
		}
		var dataset = new morpheus.Dataset({
			name: datasetName,
			rows: matrix.length,
			columns: ncols,
			array: matrix,
			dataType: 'Float32'
		});

		var columnIds = dataset.getColumnMetadata().add('id');
		for (var i = 0, j = dataColumnStart; i < ncols; i++, j++) {
			columnIds.setValue(i, morpheus.Util.copyString(header[j]));
		}
		var rowIdVector = dataset.getRowMetadata().add('id');
		rowIdVector.array = arrayOfRowArrays[0];
		for (var i = 1; i < dataColumnStart; i++) {
			var v = dataset.getRowMetadata().add(header[i]);
			v.array = arrayOfRowArrays[i];
		}

		return dataset;
	}
};

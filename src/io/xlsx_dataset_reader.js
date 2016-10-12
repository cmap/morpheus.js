morpheus.XlsxDatasetReader = function() {
};
morpheus.XlsxDatasetReader.prototype = {
	read : function(fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util
				.getFileName(fileOrUrl));
		morpheus.ArrayBufferReader.getArrayBuffer(fileOrUrl, function(err,
				arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				try {
					var data = new Uint8Array(arrayBuffer);
					var arr = [];
					for (var i = 0; i != data.length; ++i) {
						arr[i] = String.fromCharCode(data[i]);
					}
					var bstr = arr.join('');
					callback(null, _this._read(name, bstr));
				} catch (x) {
					callback(x);
				}
			}
		});

	},

	_read : function(datasetName, bstr) {
		var lines = morpheus.Util.xlsxTo2dArray(bstr);
		var nrows = lines.length - 1;
		var header = lines[0];
		var ncols = header.length - 1;
		var dataset = new morpheus.Dataset({
			name : datasetName,
			rows : nrows,
			columns : ncols
		});
		var columnIds = dataset.getColumnMetadata().add('id');
		for (var j = 1; j <= ncols; j++) {
			columnIds.setValue(j - 1, header[j]);
		}
		var rowIds = dataset.getRowMetadata().add('id');
		for (var i = 1; i < lines.length; i++) {
			var tokens = lines[i];
			rowIds.setValue(i - 1, tokens[0]);
			for (var j = 1; j <= ncols; j++) {
				var token = tokens[j];
				var value = parseFloat(token);
				dataset.setValue(i - 1, j - 1, value);
			}
		}
		return dataset;
	}
};

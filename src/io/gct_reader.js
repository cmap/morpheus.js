morpheus.GctReader = function() {

};

morpheus.GctReader.prototype = {
	getFormatName : function() {
		return 'gct';
	},
	read : function(fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util
				.getFileName(fileOrUrl));
		morpheus.BufferedReader.getArrayBuffer(fileOrUrl, function(err,
				arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				try {
					callback(null, _this._read(name,
							new morpheus.BufferedReader(new Uint8Array(
									arrayBuffer))));
				} catch (x) {
					if (x.stack) {
						console.log(x.stack);
					}
					callback(x);
				}
			}
		});

	},
	_read : function(datasetName, reader) {
		var versionLine = $.trim(reader.readLine());
		if (versionLine === '') {
			throw new Error('Missing version line');
		}
		var tab = /\t/;
		var dimensionsLine = reader.readLine();
		if (dimensionsLine == null) {
			throw new Error('No dimensions specified');
		}
		var columnNamesLine = reader.readLine();
		if (columnNamesLine == null) {
			throw new Error('No column annotations');
		}
		var version = 2;
		if ('#1.2' === versionLine) {
			version = 2;
		} else if ('#1.3' === versionLine) {
			version = 3;
		} else {
			console.log('Unknown version: assuming version 2');
		}
		// <numRows> <tab> <numCols>
		var dimensions = dimensionsLine.split(/[ \t]/);
		var numRowAnnotations = 1; // in addition to row id
		var numColumnAnnotations = 0; // in addition to column id
		var nrows = parseInt(dimensions[0]);
		var ncols = parseInt(dimensions[1]);

		if (version == 3) {
			numRowAnnotations = parseInt(dimensions[2]);
			numColumnAnnotations = parseInt(dimensions[3]);
		}

		if (nrows <= 0 || ncols <= 0) {
			throw new Error(
					'Number of rows and columns must be greater than 0.');
		}

		var columnNamesArray = columnNamesLine.split(tab);
		if (version == 2) {
			var expectedColumns = ncols + 2;
			if (columnNamesArray.length !== expectedColumns) {
				throw new Error('Expected ' + (expectedColumns - 2)
						+ ' column names, but read '
						+ (columnNamesArray.length - 2) + ' column names.');
			}
		}
		var name = columnNamesArray[0];
		var slashIndex = name.lastIndexOf('/');
		var columnIdFieldName = 'id';
		var rowIdFieldName = 'id';
		if (slashIndex != -1 && slashIndex < (name.length - 1)) {
			rowIdFieldName = name.substring(0, slashIndex);
			columnIdFieldName = name.substring(slashIndex + 1);
		}
		var dataset = new morpheus.Dataset({
			dataType : 'Float32',
			name : datasetName,
			rows : nrows,
			columns : ncols
		});

		var columnIds = dataset.getColumnMetadata().add(columnIdFieldName);
		if (version == 3) {
			for (var j = 0; j < ncols; j++) {
				var index = j + numRowAnnotations + 1;
				var columnName = index < columnNamesArray.length ? columnNamesArray[index]
						: null;
				columnIds.setValue(j, String(columnName));
			}
		} else {
			for (var j = 0; j < ncols; j++) {
				var columnName = columnNamesArray[j + numRowAnnotations + 1];
				columnIds.setValue(j, String(columnName));
			}
		}

		var rowAnnotationVectors = [ dataset.getRowMetadata().add(
				rowIdFieldName) ];
		if (version === 3) {
			for (var j = 0; j < numRowAnnotations; j++) {
				var rowMetadataName = '' === columnNamesArray[1] ? 'description'
						: columnNamesArray[j + 1];
				rowAnnotationVectors.push(dataset.getRowMetadata().add(
						rowMetadataName));
			}

		} else {
			rowAnnotationVectors.push(dataset.getRowMetadata().add(
					columnNamesArray[1]));
		}

		var dataColumnStart = numRowAnnotations + 1;
		var ntokens = ncols + numRowAnnotations + 1;
		var linen = 3;
		if (numColumnAnnotations > 0) {
			for (var columnAnnotationIndex = 0; columnAnnotationIndex < numColumnAnnotations; columnAnnotationIndex++) {
				var tokens = reader.readLine().split(tab);
				var metadataName = tokens[0];
				var v = dataset.getColumnMetadata().add(metadataName);
				for (var j = 0; j < ncols; j++) {
					v.setValue(j, String(tokens[j + dataColumnStart]));
				}
			}
		}

		var nonEmptyDescriptionFound = false;
		var numRowAnnotationsPlusOne = numRowAnnotations + 1;

		for (var rowIndex = 0, nrows = dataset.getRowCount(); rowIndex < nrows; rowIndex++) {
			var s = reader.readLine();
			if (s === null) {
				throw new Error('Missing data rows.');
			}
			var tokens = s.split(tab);
			if (version === 2) {
				rowAnnotationVectors[0].setValue(rowIndex, String(tokens[0]));
				var desc = tokens[1];
				if (!nonEmptyDescriptionFound) {
					nonEmptyDescriptionFound = desc !== '';
				}
				rowAnnotationVectors[1].setValue(rowIndex, String(desc));
			} else {
				// we iterate to numRowAnnotations + 1 to include id row
				// metadata field
				for (var rowAnnotationIndex = 0; rowAnnotationIndex < numRowAnnotationsPlusOne; rowAnnotationIndex++) {
					var rowMetadataValue = tokens[rowAnnotationIndex];
					rowAnnotationVectors[rowAnnotationIndex].setValue(rowIndex,
							String(rowMetadataValue));

				}
			}
			for (var columnIndex = 0; columnIndex < ncols; columnIndex++) {
				var token = tokens[columnIndex + dataColumnStart];
				// if (token[0] === '{') {
				// var value = JSON.parse(token);
				// dataset.setValue(rowIndex, columnIndex, morpheus.Util
				// .wrapNumber(value.__v, value));
				// } else {
				// dataset.setValue(rowIndex, columnIndex, parseFloat(token));
				// }
				dataset.setValue(rowIndex, columnIndex, parseFloat(token));
			}

		}

		if (version === 2 && !nonEmptyDescriptionFound) {
			dataset.getRowMetadata().remove(1);
		}
		if (rowIndex !== nrows) {
			throw new Error('Missing data rows');
		}

		morpheus.MetadataUtil.maybeConvertStrings(dataset.getRowMetadata(), 1);
		morpheus.MetadataUtil.maybeConvertStrings(dataset.getColumnMetadata(),
				1);
		return dataset;
	}
};

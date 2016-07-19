morpheus.GctReader = function () {

};

morpheus.GctReader.prototype = {
	getFormatName: function () {
		return 'gct';
	},
	read: function (fileOrUrl, callback) {
		if (fileOrUrl instanceof File) {
			this._readChunking(fileOrUrl, callback, false);
		} else {
			this._readNoChunking(fileOrUrl, callback);
		}
	},
	_readChunking: function (fileOrUrl, callback, tryNoChunkIfError) {
		var _this = this;
		// Papa.LocalChunkSize = 10485760 * 10; // 100 MB
		// Papa.RemoteChunkSize = 10485760 * 10; // 100 MB
		var lineNumber = 0;
		var version;
		var numRowAnnotations = 1; // in addition to row id
		var numColumnAnnotations = 0; // in addition to column id
		var nrows = -1;
		var ncols = -1;
		var version = 2;
		var rowMetadataNames = [];
		var columnMetadataNames = [];
		var rowMetadata = [[]];
		var columnMetadata = [[]];
		var dataColumnStart;
		var matrix = [];
		var dataMatrixLineNumberStart;
		var columnIdFieldName = 'id';
		var rowIdFieldName = 'id';
		var columnNamesArray;
		Papa.parse(fileOrUrl, {
			delimiter: "\t",	// auto-detect
			newline: "",	// auto-detect
			header: false,
			dynamicTyping: false,
			preview: 0,
			encoding: "",
			worker: false,
			comments: false,
			step: function (result) {
				if (lineNumber === 0) {
					var text = result.data[0][0].trim();
					if ('#1.2' === text) {
						version = 2;
					} else if ('#1.3' === text) {
						version = 3;
					} else {
						console.log('Unknown version: assuming version 2');
					}
				} else if (lineNumber === 1) {
					var dimensions = result.data[0];
					if (version === 3) {
						if (dimensions.length >= 4) {
							nrows = parseInt(dimensions[0]);
							ncols = parseInt(dimensions[1]);
							numRowAnnotations = parseInt(dimensions[2]);
							numColumnAnnotations = parseInt(dimensions[3]);
						} else { // no dimensions specified
							numRowAnnotations = parseInt(dimensions[0]);
							numColumnAnnotations = parseInt(dimensions[1]);
						}
					} else {
						nrows = parseInt(dimensions[0]);
						ncols = parseInt(dimensions[1]);
						if (nrows <= 0 || ncols <= 0) {
							callback(
								'Number of rows and columns must be greater than 0.');
						}
					}
					dataColumnStart = numRowAnnotations + 1;
				} else if (lineNumber === 2) {
					columnNamesArray = result.data[0];
					if (ncols === -1) {
						ncols = columnNamesArray.length - numRowAnnotations - 1;
					}
					if (version == 2) {
						var expectedColumns = ncols + 2;
						if (columnNamesArray.length !== expectedColumns) {
							callback('Expected ' + (expectedColumns - 2)
								+ ' column names, but read '
								+ (columnNamesArray.length - 2) + ' column names.');
						}
					}
					var name = columnNamesArray[0];
					var slashIndex = name.lastIndexOf('/');

					if (slashIndex != -1 && slashIndex < (name.length - 1)) {
						rowIdFieldName = name.substring(0, slashIndex);
						columnIdFieldName = name.substring(slashIndex + 1);
					}
					rowMetadataNames.push(rowIdFieldName);
					columnMetadataNames.push(columnIdFieldName);
					for (var j = 0; j < ncols; j++) {
						var index = j + numRowAnnotations + 1;
						var columnName = index < columnNamesArray.length ? columnNamesArray[index]
							: null;
						columnMetadata[0].push(String(columnName));
					}

					for (var j = 0; j < numRowAnnotations; j++) {
						var rowMetadataName = '' === columnNamesArray[1] ? 'description'
							: columnNamesArray[j + 1];
						rowMetadataNames.push(
							rowMetadataName);
						rowMetadata.push([]);
					}
					dataMatrixLineNumberStart = 3 + numColumnAnnotations;
				} else { // lines >=3
					var tokens = result.data[0];
					if (lineNumber < dataMatrixLineNumberStart) {
						var metadataName = tokens[0];
						var v = [];
						columnMetadata.push(v);
						columnMetadataNames.push(metadataName);
						for (var j = 0; j < ncols; j++) {
							v.push(String(tokens[j + dataColumnStart]));
						}
					} else { // data lines
						if (tokens[0] !== '') {
							var array = new Float32Array(ncols);
							matrix.push(array);
							// we iterate to numRowAnnotations + 1 to include id row
							// metadata field
							for (var rowAnnotationIndex = 0; rowAnnotationIndex <= numRowAnnotations; rowAnnotationIndex++) {
								var rowMetadataValue = tokens[rowAnnotationIndex];
								rowMetadata[rowAnnotationIndex].push(
									String(rowMetadataValue));

							}

							for (var columnIndex = 0; columnIndex < ncols; columnIndex++) {
								var token = tokens[columnIndex + dataColumnStart];
								array[columnIndex] = parseFloat(token);
							}
						}
					}
				}
				lineNumber++;

			},
			complete: function () {
				var dataset = new morpheus.Dataset({
					name: morpheus.Util.getBaseFileName(morpheus.Util
					.getFileName(fileOrUrl)),
					rows: matrix.length,
					columns: ncols,
					array: matrix,
					dataType: 'Float32'
				});
				for (var i = 0; i < rowMetadataNames.length; i++) {
					dataset.getRowMetadata().add(rowMetadataNames[i]).array = rowMetadata[i];
				}
				for (var i = 0; i < columnMetadataNames.length; i++) {
					dataset.getColumnMetadata().add(columnMetadataNames[i]).array = columnMetadata[i];
				}
				morpheus.MetadataUtil.maybeConvertStrings(dataset.getRowMetadata(), 1);
				morpheus.MetadataUtil.maybeConvertStrings(dataset.getColumnMetadata(),
					1);
				callback(null, dataset);
			},
			error: function (err) {
				if (tryNoChunkIfError) {
					_this._readNoChunking(fileOrUrl, callback);
				} else {
					callback(err);
				}
			},
			download: !(fileOrUrl instanceof File),
			skipEmptyLines: false,
			chunk: undefined,
			fastMode: true,
			beforeFirstChunk: undefined,
			withCredentials: undefined
		});
	},
	_read: function (datasetName, reader) {
		var tab = /\t/;
		var versionLine = $.trim(reader.readLine());
		if (versionLine === '') {
			throw new Error('Missing version line');
		}
		var version = 2;
		if ('#1.2' === versionLine) {
			version = 2;
		} else if ('#1.3' === versionLine) {
			version = 3;
		} else {
			console.log('Unknown version: assuming version 2');
		}
		var dimensionsLine = reader.readLine();
		if (dimensionsLine == null) {
			throw new Error('No dimensions specified');
		}
		// <numRows> <tab> <numCols>
		var dimensions = dimensionsLine.split(/[ \t]/);
		var numRowAnnotations = 1; // in addition to row id
		var numColumnAnnotations = 0; // in addition to column id
		var nrows = -1;
		var ncols = -1;
		if (version === 3) {
			if (dimensions.length >= 4) {
				nrows = parseInt(dimensions[0]);
				ncols = parseInt(dimensions[1]);
				numRowAnnotations = parseInt(dimensions[2]);
				numColumnAnnotations = parseInt(dimensions[3]);
			} else { // no dimensions specified
				numRowAnnotations = parseInt(dimensions[0]);
				numColumnAnnotations = parseInt(dimensions[1]);
			}
		} else {
			nrows = parseInt(dimensions[0]);
			ncols = parseInt(dimensions[1]);
			if (nrows <= 0 || ncols <= 0) {
				throw new Error(
					'Number of rows and columns must be greater than 0.');
			}
		}
		var columnNamesLine = reader.readLine();
		if (columnNamesLine == null) {
			throw new Error('No column annotations');
		}

		var columnNamesArray = columnNamesLine.split(tab);
		if (ncols === -1) {
			ncols = columnNamesArray.length - numRowAnnotations - 1;
		}
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
		if (nrows === -1) {
			var matrix = [];
			var rowMetadataNames = [rowIdFieldName];
			var columnMetadataNames = [columnIdFieldName];
			var rowMetadata = [[]];
			var columnMetadata = [[]];
			for (var j = 0; j < ncols; j++) {
				var index = j + numRowAnnotations + 1;
				var columnName = index < columnNamesArray.length ? columnNamesArray[index]
					: null;
				columnMetadata[0].push(String(columnName));
			}

			for (var j = 0; j < numRowAnnotations; j++) {
				var rowMetadataName = '' === columnNamesArray[1] ? 'description'
					: columnNamesArray[j + 1];
				rowMetadataNames.push(
					rowMetadataName);
				rowMetadata.push([]);
			}

			var dataColumnStart = numRowAnnotations + 1;
			var ntokens = ncols + numRowAnnotations + 1;
			var linen = 3;
			if (numColumnAnnotations > 0) {
				for (var columnAnnotationIndex = 0; columnAnnotationIndex < numColumnAnnotations; columnAnnotationIndex++) {
					var tokens = reader.readLine().split(tab);
					var metadataName = tokens[0];
					var v = [];
					columnMetadata.push(v);
					columnMetadataNames.push(metadataName);
					for (var j = 0; j < ncols; j++) {
						v.push(String(tokens[j + dataColumnStart]));
					}
				}
			}

			var nonEmptyDescriptionFound = false;
			var numRowAnnotationsPlusOne = numRowAnnotations + 1;
			var s;
			while ((s = reader.readLine()) !== null) {
				if (s !== '') {
					var array = new Float32Array(ncols);
					matrix.push(array);
					var tokens = s.split(tab);
					// we iterate to numRowAnnotations + 1 to include id row
					// metadata field
					for (var rowAnnotationIndex = 0; rowAnnotationIndex < numRowAnnotationsPlusOne; rowAnnotationIndex++) {
						var rowMetadataValue = tokens[rowAnnotationIndex];
						rowMetadata[rowAnnotationIndex].push(
							String(rowMetadataValue));

					}

					for (var columnIndex = 0; columnIndex < ncols; columnIndex++) {
						var token = tokens[columnIndex + dataColumnStart];
						array[columnIndex] = parseFloat(token);
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
			for (var i = 0; i < rowMetadataNames.length; i++) {
				dataset.getRowMetadata().add(rowMetadataNames[i]).array = rowMetadata[i];
			}
			for (var i = 0; i < columnMetadataNames.length; i++) {
				dataset.getColumnMetadata().add(columnMetadataNames[i]).array = columnMetadata[i];
			}
			morpheus.MetadataUtil.maybeConvertStrings(dataset.getRowMetadata(), 1);
			morpheus.MetadataUtil.maybeConvertStrings(dataset.getColumnMetadata(),
				1);
			return dataset;

		} else {
			var dataset = new morpheus.Dataset({
				dataType: 'Float32',
				name: datasetName,
				rows: nrows,
				columns: ncols
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

			var rowAnnotationVectors = [dataset.getRowMetadata().add(
				rowIdFieldName)];
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

	},
	_readNoChunking: function (fileOrUrl, callback) {
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
					if (x.stack) {
						console.log(x.stack);
					}
					callback(x);
				}
			}
		});

	}
};

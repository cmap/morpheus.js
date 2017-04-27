morpheus.GctReader = function () {

};

morpheus.GctReader.prototype = {
  getFormatName: function () {
    return 'gct';
  },
  read: function (fileOrUrl, callback) {
    var _this = this;
    if (fileOrUrl instanceof File) {
      this._readChunking(fileOrUrl, callback, false);
    } else {
      if (morpheus.Util.isFetchSupported()) {
        this._readChunking(fileOrUrl, callback, true);
      } else {
        this._readNoChunking(fileOrUrl, callback);
      }
      // XXX only do byte range requests from S3
      // if (fileOrUrl.indexOf('s3.amazonaws.com') !== -1) {
      // 	$.ajax({
      // 		url: fileOrUrl,
      // 		method: 'HEAD'
      // 	}).done(function (data, textStatus, jqXHR) {
      // 		if ('gzip' === jqXHR.getResponseHeader('Content-Encoding')) {
      // 			_this._readNoChunking(fileOrUrl, callback);
      // 		} else {
      // 			_this._readChunking(fileOrUrl, callback, false);
      // 		}
      // 	}).fail(function () {
      // 		_this._readNoChunking(fileOrUrl, callback);
      // 	});
      // } else {
      // 	_this._readNoChunking(fileOrUrl, callback);
      // }
    }
  },
  _readChunking: function (fileOrUrl, callback, useFetch) {
    var _this = this;
    // Papa.LocalChunkSize = 10485760 * 10; // 100 MB
    //Papa.RemoteChunkSize = 10485760 / 2; // 10485760 = 10MB
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

    var handleTokens = function (tokens) {

      if (lineNumber === 0) {
        var text = tokens[0].trim();
        if ('#1.2' === text) {
          version = 2;
        } else if ('#1.3' === text) {
          version = 3;
        } else {
          console.log('Unknown version: assuming version 2');
        }
      } else if (lineNumber === 1) {
        var dimensions = tokens;
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
        columnNamesArray = tokens;
        for (var i = 0; i < columnNamesArray.length; i++) {
          columnNamesArray[i] = morpheus.Util.copyString(columnNamesArray[i]);
        }
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
          columnMetadata[0].push(morpheus.Util.copyString(columnName));
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
        if (lineNumber < dataMatrixLineNumberStart) {
          var metadataName = morpheus.Util.copyString(tokens[0]);
          var v = [];
          columnMetadata.push(v);
          columnMetadataNames.push(metadataName);
          for (var j = 0; j < ncols; j++) {
            v.push(morpheus.Util.copyString(tokens[j + dataColumnStart]));
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
                morpheus.Util.copyString(rowMetadataValue));

            }

            for (var columnIndex = 0; columnIndex < ncols; columnIndex++) {
              var token = tokens[columnIndex + dataColumnStart];
              array[columnIndex] = parseFloat(token);
            }
          }
        }
      }
      lineNumber++;

    };
    (useFetch ? morpheus.BufferedReader : Papa).parse(fileOrUrl, {
      delimiter: '\t',	// auto-detect
      newline: '',	// auto-detect
      header: false,
      dynamicTyping: false,
      preview: 0,
      encoding: '',
      worker: false,
      comments: false,
      handleTokens: handleTokens,
      step: function (result) {
        handleTokens(result.data[0]);
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
        callback(err);
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
    var versionLine = morpheus.Util.copyString(reader.readLine().trim());
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
    var dimensionsLine = morpheus.Util.copyString(reader.readLine());
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
    var columnNamesLine = morpheus.Util.copyString(reader.readLine());
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
        columnMetadata[0].push(morpheus.Util.copyString(columnName));
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
            v.push(morpheus.Util.copyString(tokens[j + dataColumnStart]));
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
              morpheus.Util.copyString(rowMetadataValue));

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
          columnIds.setValue(j, morpheus.Util.copyString(columnName));
        }

      } else {
        for (var j = 0; j < ncols; j++) {
          var columnName = columnNamesArray[j + numRowAnnotations + 1];
          columnIds.setValue(j, morpheus.Util.copyString(columnName));
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
            v.setValue(j, morpheus.Util.copyString(tokens[j + dataColumnStart]));
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
          rowAnnotationVectors[0].setValue(rowIndex, morpheus.Util.copyString(tokens[0]));
          var desc = tokens[1];
          if (!nonEmptyDescriptionFound) {
            nonEmptyDescriptionFound = desc !== '';
          }
          rowAnnotationVectors[1].setValue(rowIndex, morpheus.Util.copyString(desc));
        } else {
          // we iterate to numRowAnnotations + 1 to include id row
          // metadata field
          for (var rowAnnotationIndex = 0; rowAnnotationIndex < numRowAnnotationsPlusOne; rowAnnotationIndex++) {
            var rowMetadataValue = tokens[rowAnnotationIndex];
            rowAnnotationVectors[rowAnnotationIndex].setValue(rowIndex,
              morpheus.Util.copyString(rowMetadataValue));

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
    morpheus.ArrayBufferReader.getArrayBuffer(fileOrUrl, function (err, arrayBuffer) {
      if (err) {
        callback(err);
      } else {
        callback(null, _this._read(name,
          new morpheus.ArrayBufferReader(new Uint8Array(
            arrayBuffer))));
      }
    });
    // $.ajax({
    // 	url: fileOrUrl,
    // 	dataType: 'text'
    // }).done(function (text) {
    // 	callback(null, _this.read(name, new morpheus.StringReader(text)));
    // }).fail(function (err) {
    // 	callback(err);
    // });

  }
};

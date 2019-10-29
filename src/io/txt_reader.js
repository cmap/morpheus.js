/**
 *
 * @param options.dataRowStart
 * @param options.dataColumnStart
 * @param options.columnMetadata Whether rows before dataRowStart contain column metadata
 * @constructor
 */
morpheus.TxtReader = function (options) {
  if (options == null) {
    options = {};
  }
  this.options = options;
};


morpheus.TxtReader.prototype = {
  read: function (fileOrUrl, callback) {
    var _this = this;
    var name = morpheus.Util.getBaseFileName(morpheus.Util
      .getFileName(fileOrUrl));
    morpheus.ArrayBufferReader.getArrayBuffer(fileOrUrl, function (err,
                                                                   arrayBuffer) {
      if (err) {
        callback(err);
      } else {
        try {
          callback(null, _this._read(name,
            new morpheus.ArrayBufferReader(new Uint8Array(
              arrayBuffer))));
        } catch (x) {
          callback(x);
        }
      }
    });

  },
  _read: function (datasetName, reader) {
    var dataColumnStart = this.options.dataColumnStart;
    var dataRowStart = this.options.dataRowStart;
    if (dataRowStart == null) {
      dataRowStart = 1;
    }
    var headerLine = reader.readLine();
    var separator = morpheus.Util.detectSeparator(headerLine);

    var testLine = null;
    var rtrim = /\s+$/;
    var header = headerLine.split(separator);
    morpheus.Util.stripQuotes(header);
    if (dataColumnStart == null) { // try to figure out where data starts by finding 1st
      // numeric column
      testLine = reader.readLine().replace(rtrim, '');
      var tokens = testLine.split(separator);
      for (var i = 1; i < tokens.length; i++) {
        var token = tokens[i];
        if (token === '' || token === 'NA' || token === 'NaN' || $.isNumeric(token)) {
          dataColumnStart = i;
          break;
        }
      }

      if (dataColumnStart == null) {
        dataColumnStart = 1;
      }
    }

    var columnVectors = [];
    var ncols = header.length - dataColumnStart;
    if (dataRowStart > 1) {
      if (this.options.columnMetadata) {
        // add additional column metadata
        for (var row = 1; row < dataRowStart; row++) {
          var line = reader.readLine();
          var columnTokens = line.split(separator);
          morpheus.Util.stripQuotes(columnTokens);
          var name = columnTokens[0];
          if (name == null || name === '' || name === 'na') {
            name = 'id';
          }
          var v = new morpheus.Vector(name, ncols);
          for (var i = 0, j = dataColumnStart; i < ncols; i++, j++) {
            v.setValue(i, morpheus.Util.copyString(columnTokens[j]));
          }
          columnVectors.push(v);
        }
      } else {
        for (var i = 1; i < dataRowStart; i++) {
          reader.readLine(); // skip
        }
      }
    }

    var matrix = [];
    // if sparse, array of {indices, values}
    var s;
    var arrayOfRowArrays = [];
    for (var i = 0; i < dataColumnStart; i++) {
      arrayOfRowArrays.push([]);
    }
    var isSparse = false;
    if (testLine == null) {
      testLine = reader.readLine();
    }

    if (testLine != null) {
      var tmp = new Float32Array(ncols);

      var tokens = testLine.split(separator);
      morpheus.Util.stripQuotes(tokens);
      for (var j = 0; j < dataColumnStart; j++) {
        // row metadata
        arrayOfRowArrays[j].push(morpheus.Util.copyString(tokens[j]));
      }
      var nzero = 0;
      for (var j = dataColumnStart, k = 0; k < ncols; j++, k++) {
        var token = tokens[j];
        var value = parseFloat(token);
        if (value === 0) {
          nzero++;
        }
        tmp[j - dataColumnStart] = value;
      }
      var percentSparse = nzero / tmp.length;
      if (percentSparse > 0.3) {
        isSparse = true;
        var obj = {values: new Float32Array(tmp.length - nzero), indices: new Uint32Array(tmp.length - nzero)};
        for (var j = 0, k = 0; j < tmp.length; j++) {
          if (tmp[j] !== 0.0) {
            obj.values[k] = tmp[j];
            obj.indices[k] = j;
            k++;
          }
        }
        tmp = obj;
      }
      matrix.push(tmp);
    }

    while ((s = reader.readLine()) !== null) {
      s = s.replace(rtrim, '');
      if (s !== '') {
        var tokens = s.split(separator);
        morpheus.Util.stripQuotes(tokens);
        for (var j = 0; j < dataColumnStart; j++) {
          // row metadata
          arrayOfRowArrays[j].push(morpheus.Util.copyString(tokens[j]));
        }
        var values = new Float32Array(ncols);
        for (var j = dataColumnStart, k = 0; k < ncols; j++, k++) {
          var token = tokens[j];
          var value = parseFloat(token);
          values[j - dataColumnStart] = value;
        }
        if (isSparse) {
          var count = 0;
          for (var j = 0, k = 0; j < ncols; j++) {
            if (values[j] !== 0.0) {
              count++;
            }
          }
          var obj = {values: new Float32Array(count), indices: new Uint32Array(count)};
          for (var j = 0, k = 0; j < ncols; j++) {
            if (values[j] !== 0.0) {
              obj.values[k] = values[j];
              obj.indices[k] = j;
              k++;
            }
          }
          matrix.push(obj);
        } else {
          matrix.push(values);
        }
      }
    }
    var dataset = new morpheus.Dataset({
      name: datasetName,
      rows: matrix.length,
      columns: ncols,
      array: matrix,
      dataType: 'Float32',
      defaultValue: isSparse ? 0 : undefined
    });

    var columnIds = dataset.getColumnMetadata().add('id');
    for (var i = 0, j = dataColumnStart; i < ncols; i++, j++) {
      columnIds.setValue(i, morpheus.Util.copyString(header[j]));
    }
    columnVectors.forEach(function (v) {
      var unique = 1;
      var name = v.getName();
      while (dataset.getColumnMetadata().getByName(name) != null) {
        name = name + '-' + unique;
        unique++;
      }
      dataset.getColumnMetadata().add(name).array = v.array;
    });
    var rowIdVector = dataset.getRowMetadata().add('id');
    rowIdVector.array = arrayOfRowArrays[0];
    // add additional row metadata
    for (var i = 1; i < dataColumnStart; i++) {
      var v = dataset.getRowMetadata().add(header[i]);
      v.array = arrayOfRowArrays[i];

    }
    for (var i = 0; i < dataset.getRowMetadata().getMetadataCount(); i++) {
      morpheus.VectorUtil.maybeConvertStringToNumber(dataset.getRowMetadata().get(i));
    }
    for (var i = 0; i < dataset.getColumnMetadata().getMetadataCount(); i++) {
      morpheus.VectorUtil.maybeConvertStringToNumber(dataset.getColumnMetadata().get(i));
    }
    return dataset;
  }
};

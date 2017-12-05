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
    morpheus.ArrayBufferReader.getArrayBuffer(fileOrUrl, function (
      err,
      arrayBuffer) {
      if (err) {
        callback(err);
      } else {
        try {
          callback(null, _this._read(name,
            new morpheus.ArrayBufferReader(new Uint8Array(
              arrayBuffer))));
        }
        catch (x) {
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
    var tab = /\t/;
    var testLine = null;
    var rtrim = /\s+$/;
    var header = reader.readLine().replace(rtrim, '').split(tab);
    if (dataColumnStart == null) { // try to figure out where data starts by finding 1st
      // numeric column
      testLine = reader.readLine().replace(rtrim, '');
      var tokens = testLine.split(tab);
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
          var columnTokens = line.split(tab);
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

      var tokens = testLine.split(tab);
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
      if (nzero / tmp.length > 0.25) {
        isSparse = true;
        var sparse = {};
        for (var j = 0; j < tmp.length; j++) {
          if (tmp[j] !== 0) {
            sparse[j] = tmp[j];
          }
        }
        tmp = sparse;
      }
      matrix.push(tmp);
    }
    while ((s = reader.readLine()) !== null) {
      s = s.replace(rtrim, '');
      if (s !== '') {
        var dataRow = isSparse ? {} : new Float32Array(ncols);
        matrix.push(dataRow);
        var tokens = s.split(tab);
        for (var j = 0; j < dataColumnStart; j++) {
          // row metadata
          arrayOfRowArrays[j].push(morpheus.Util.copyString(tokens[j]));
        }
        for (var j = dataColumnStart, k = 0; k < ncols; j++, k++) {
          var token = tokens[j];
          var value = parseFloat(token);
          if (isSparse) {
            if (value !== 0.0) {
              dataRow[j - dataColumnStart] = value;
            }
          } else {
            dataRow[j - dataColumnStart] = value;
          }

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

    return dataset;
  }
};

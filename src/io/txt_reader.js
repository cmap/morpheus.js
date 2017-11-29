/**
 *
 * @param options.dataRowStart
 * @param options.dataColumnStart
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
    var header = reader.readLine().trim().split(tab);
    if (dataRowStart > 1) {
      for (var i = 1; i < dataRowStart; i++) {
        reader.readLine(); // skip
      }
    }
    var testLine = null;
    if (dataColumnStart == null) { // try to figure out where data starts by finding 1st
      // numeric column
      testLine = reader.readLine().trim();
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

    var ncols = header.length - dataColumnStart;
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
      s = s.trim();
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

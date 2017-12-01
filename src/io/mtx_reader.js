morpheus.MtxReader = function () {

};

morpheus.MtxReader.prototype = {
  getFormatName: function () {
    return 'mtx';
  },
  read: function (fileOrUrl, callback) {
    var _this = this;
    if (morpheus.Util.isFile(fileOrUrl)) {
      this._read(fileOrUrl, callback, false, true);
    } else {
      if (morpheus.Util.isFetchStreamingSupported()) {
        this._read(fileOrUrl, callback, true, true);
      } else {
        this._read(fileOrUrl, callback, false, false);
      }
    }
  },
  _read: function (fileOrUrl, callback, useFetch, chunk) {
    var _this = this;
    var isHeader = true;
    var dataset;
    var matrix = [];
    var nrows;
    var ncols;
    var dataType = 'Int16';
    var columnsAreSorted = true;
    var lastRowIndex = -1;
    var lastColumnIndex = -1;
    // for each row we store values and indices
    var _complete = function () {
      for (var i = 0, nrows = matrix.length; i < nrows; i++) {
        var obj = matrix[i];
        if (obj.values != null) {
          // trim to size
          var values = new Uint16Array(obj.length);
          var indices = new Uint32Array(obj.length);
          values.set(obj.values.slice(0, obj.length));
          indices.set(obj.indices.slice(0, obj.length));
          matrix[i] = {values: values, indices: indices};
        }
      }
      dataset = new morpheus.Dataset({
        rows: nrows, columns: ncols, name: morpheus.Util.getBaseFileName(morpheus.Util
          .getFileName(fileOrUrl)), array: matrix, dataType: dataType, defaultValue: 0
      });
    };
    var handleTokens = function (tokens) {
      if (tokens[0][0] !== '%' && tokens.length !== 1) {
        if (isHeader) {
          isHeader = false;

          nrows = parseInt(tokens[0]);
          ncols = parseInt(tokens[1]);
          for (var i = 0; i < nrows; i++) {
            matrix.push({});
          }

          // rows, columns, entries
        } else {
          var rowIndex = parseInt(tokens[0]) - 1;
          var columnIndex = parseInt(tokens[1]) - 1;
          var value = parseInt(tokens[2]);
          var obj = matrix[rowIndex];
          if (obj.values == null) {
            var initalCapacity = Math.max(1, Math.min(100, Math.floor(ncols * 0.01)));
            obj.values = new Uint16Array(initalCapacity);
            obj.indices = new Uint32Array(initalCapacity);
            obj.length = 0;
          }
          if (obj.length >= obj.values.length) {
            var newCapacity = Math.min(ncols, Math.floor(obj.values.length * 1.1));
            var values = new Uint16Array(newCapacity);
            var indices = new Uint32Array(newCapacity);
            values.set(obj.values);
            indices.set(obj.indices);
            obj.values = values;
            obj.indices = indices;

          }
          obj.values[obj.length] = value;
          obj.indices[obj.length] = columnIndex;
          obj.length++;
          if (columnsAreSorted) {
            if (rowIndex !== lastRowIndex) {
              lastColumnIndex = -1;
              lastRowIndex = rowIndex;
            }
            if (columnIndex < lastColumnIndex) {
              callback(new Error('Column indices are not sorted'));
            }
          }

        }
      }
    };
    if (chunk) {
      (useFetch ? morpheus.BufferedReader : Papa).parse(fileOrUrl, {
        delimiter: ' ',	// auto-detect
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
          _complete();
          callback(null, dataset);
        },
        error: function (err) {
          callback(err);
        },
        download: !morpheus.Util.isFile(fileOrUrl),
        skipEmptyLines: false,
        chunk: undefined,
        fastMode: true,
        beforeFirstChunk: undefined,
        withCredentials: undefined
      });
    } else {
      morpheus.ArrayBufferReader.getArrayBuffer(fileOrUrl, function (err, arrayBuffer) {
        if (err) {
          callback(err);
        } else {
          var reader = new morpheus.ArrayBufferReader(new Uint8Array(
            arrayBuffer));
          var delim = / /;
          var s;
          while ((s = reader.readLine()) !== null) {
            if (s[0] !== '%') {
              var tokens = s.split(delim);
              handleTokens(tokens);
            }
          }
          _complete();
          callback(null, dataset);
        }
      });
    }
  }
};

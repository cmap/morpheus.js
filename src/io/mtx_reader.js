morpheus.MtxReader = function () {

};

morpheus.MtxReader.prototype = {
  getFormatName: function () {
    return 'mtx';
  },
  read: function (fileOrUrl, callback) {
    var _this = this;
    if (morpheus.Util.isFile(fileOrUrl)) {
      this._readChunking(fileOrUrl, callback, false);
    } else {
      if (morpheus.Util.isFetchStreamingSupported()) {
        this._readChunking(fileOrUrl, callback, true);
      } else {
        this._readNoChunking(fileOrUrl, callback);
      }
    }
  },
  _readChunking: function (fileOrUrl, callback, useFetch) {
    var _this = this;
    var isHeader = true;
    var dataset;
    var matrix;
    var handleTokens = function (tokens) {
      if (tokens[0][0] !== '%' && tokens.length !== 1) {
        if (isHeader) {
          isHeader = false;
          matrix = [];
          var nrows = parseInt(tokens[0]);
          var ncols = parseInt(tokens[1]);
          for (var i = 0; i < nrows; i++) {
            matrix.push([]);
          }
          dataset = new morpheus.Dataset({
            rows: nrows, columns: ncols, name: morpheus.Util.getBaseFileName(morpheus.Util
              .getFileName(fileOrUrl)), array: matrix, dataType: 'Float32'
          });
          // rows, columns, entries
        } else {
          var rowIndex = parseInt(tokens[0]) - 1;
          var dataRow = matrix[rowIndex];
          var columnIndex = parseInt(tokens[1]) - 1;
          dataRow[columnIndex] = parseFloat(tokens[2]);
        }
      }
    };
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
  },
  _read: function (datasetName, reader) {
    var delim = / /;
    var isHeader = true;
    var dataset;
    var matrix;
    var s;
    while ((s = reader.readLine()) !== null) {
      if (s[0] !== '%') {
        var tokens = s.split(delim);
        if (isHeader) {
          isHeader = false;
          matrix = [];
          dataset = new morpheus.Dataset({
            rows: parseInt(tokens[0]), columns: parseInt(tokens[1]), name: datasetName, array: matrix, dataType: 'Float32'
          });
          for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
            matrix.push({});
          }
          // rows, columns, entries
        } else {
          var dataRow = matrix[parseInt(tokens[0]) - 1];
          dataRow[parseInt(tokens[1]) - 1] = parseFloat(tokens[2]);
        }
      }
    }

    return dataset;

  }
  ,
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
  }
};

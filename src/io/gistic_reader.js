morpheus.GisticReader = function () {

};
morpheus.GisticReader.prototype = {
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
        }
        catch (x) {
          if (x.stack) {
            console.log(x.stack);
          }
          callback(x);
        }
      }
    });

  },
  _read: function (datasetName, reader) {
    var tab = /\t/;
    var header = reader.readLine().trim().split(tab);

    // Unique Name, Descriptor, Wide Peak Limits, Peak Limits, Region
    // Limits, q values, Residual q values after removing segments shared
    // with higher peaks, Broad or Focal, Amplitude Threshold

    var ncols = header.length - 9;
    var matrix = [];
    var s;
    var rowIds = [];
    var qValues = [];
    while ((s = reader.readLine()) !== null) {
      s = s.trim();

      if (s !== '') {
        var tokens = s.split(tab);
        if (tokens[8] === 'Actual Copy Change Given') {
          var array = new Float32Array(ncols);
          matrix.push(array);
          rowIds.push(String($.trim(tokens[1])));
          qValues.push(parseFloat(tokens[5]));
          for (var j = 9; j <= ncols; j++) {
            var token = tokens[j];
            array[j - 9] = parseFloat(token);
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
    for (var j = 0; j < ncols; j++) {
      columnIds.setValue(j, String(header[j + 9]));
    }

    dataset.getRowMetadata().add('id').array = rowIds;
    dataset.getRowMetadata().add('q_value').array = qValues;
    return dataset;
  }
};

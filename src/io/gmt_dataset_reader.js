morpheus.GmtDatasetReader = function () {
};
morpheus.GmtDatasetReader.prototype = {
  getFormatName: function () {
    return 'gmt';
  },
  read: function (fileOrUrl, callback) {
    var name = morpheus.Util.getBaseFileName(morpheus.Util
    .getFileName(fileOrUrl));
    morpheus.ArrayBufferReader.getArrayBuffer(fileOrUrl, function (err, arrayBuffer) {
      if (err) {
        callback(err);
      } else {
        try {
          callback(null, morpheus.DatasetUtil.geneSetsToDataset(name,
            new morpheus.GmtReader()
            .read(new morpheus.ArrayBufferReader(
              new Uint8Array(arrayBuffer)))));
        }
        catch (x) {
          callback(x);
        }
      }
    });

  }
};

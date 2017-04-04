morpheus.AdjustDataTool = function () {
};
morpheus.AdjustDataTool.prototype = {
  toString: function () {
    return 'Adjust';
  },
  gui: function () {
    // z-score, robust z-score, log2, inverse log2
    return [{
      name: 'log_2',
      type: 'checkbox'
    }, {
      name: 'inverse_log_2',
      type: 'checkbox'
    }, {
      name: 'quantile_normalize',
      type: 'checkbox'
    }, {
      name: 'z-score',
      type: 'checkbox',
      help: 'Subtract mean, divide by standard deviation'
    }, {
      name: 'robust_z-score',
      type: 'checkbox',
      help: 'Subtract median, divide by median absolute deviation'
    }, {
        name: 'extended_normalization',
        type: 'checkbox',
        help: 'Add 1, take log2, then apply quantile normalization'
    }, {
      name: 'use_selected_rows_and_columns_only',
      type: 'checkbox'
    }];
  },
  execute: function (options) {
    var project = options.project;
    var controller = options.controller;

    if (options.input.log_2 || options.input.inverse_log_2
      || options.input['z-score'] || options.input['robust_z-score'] || options.input.quantile_normalize
        || options.input['quantile_normalization']) {
      // clone the values 1st
      var sortedFilteredDataset = morpheus.DatasetUtil.copy(project
      .getSortedFilteredDataset());
      var rowIndices = project.getRowSelectionModel()
      .getViewIndices().values().sort(
        function (a, b) {
          return (a === b ? 0 : (a < b ? -1 : 1));
        });
      if (rowIndices.length === 0) {
        rowIndices = null;
      }
      var columnIndices = project.getColumnSelectionModel()
      .getViewIndices().values().sort(
        function (a, b) {
          return (a === b ? 0 : (a < b ? -1 : 1));
        });
      if (columnIndices.length === 0) {
        columnIndices = null;
      }
      var dataset = options.input.use_selected_rows_and_columns_only ? new morpheus.Slice
        : sortedFilteredDataset;
      var rowView = new morpheus.DatasetRowView(dataset);
      var functions = [];
      if (options.input.log_2) {
        for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
          for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
            dataset.setValue(i, j, morpheus.Log2(dataset.getValue(
              i, j)));
          }
        }
      }
      if (options.input.inverse_log_2) {
        for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
          for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
            var value = dataset.getValue(i, j);
            if (value >= 0) {
              dataset.setValue(i, j, Math.pow(2, value));
            }
          }
        }
      }
      if (options.input.quantile_normalize) {
        morpheus.QNorm.execute(dataset);
      }
      if (options.input['z-score']) {
        for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
          rowView.setIndex(i);
          var mean = morpheus.Mean(rowView);
          var stdev = Math.sqrt(morpheus.Variance(rowView));
          for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
            dataset.setValue(i, j, (dataset.getValue(i, j) - mean)
              / stdev);
          }
        }
      }
      if (options.input['robust_z-score']) {
        for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
          rowView.setIndex(i);
          var median = morpheus.Median(rowView);
          var mad = morpheus.MAD(rowView, median);
          for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
            dataset.setValue(i, j,
              (dataset.getValue(i, j) - median) / mad);
          }
        }
      }
        if (options.input['quantile_normalization']) {
            var es = dataset.getESSession();
            es.then(function(session) {
                var args = {
                    es : session
                };
                if (rowIndices && rowIndices.size()) {
                    args.rows = rowIndices.values();
                }
                if (columnIndices && columnIndices.size()) {
                    args.cols = columnIndices.values();
                }
                var req = ocpu.call('quantileNormalization', args, function(resSession) {
                    resSession.getObject(function(success) {
                        console.log("Quantile Normalization :: ", success);
                        var r = new FileReader();
                        var filePath = morpheus.Util.getFilePath(resSession, success);
                        r.onload = function (e) {
                            var contents = e.target.result;
                            var ProtoBuf = dcodeIO.ProtoBuf;
                            ProtoBuf.protoFromFile("./message.proto", function(error, success) {
                                if (error) {
                                    alert(error);
                                    console.log("Quantile Normalization ::", "ProtoBuilder failed", error);
                                }
                                var builder = success,
                                    rexp = builder.build("rexp"),
                                    REXP = rexp.REXP,
                                    rclass = REXP.RClass;
                                var res = REXP.decode(contents);
                                var data = morpheus.Util.getRexpData(res, rclass).data;
                                console.log(data);

                                for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
                                    for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
                                        var value = data.values[i + j * data.dim[0]];
                                        dataset.setValue(i, j, value);

                                    }
                                }
                                alert("Quantile normalization finished successfully")
                            })
                        };
                        morpheus.BlobFromPath.getFileObject(filePath, function (file) {
                            r.readAsArrayBuffer(file);
                        });
                    });
                    dataset.setESSession(new Promise(function(resolve, reject) {
                        resolve(resSession);
                    }));
                }, false, "::es");
                req.fail(function() {
                    console.log(req.responseText);
                })
            })

        }

      return new morpheus.HeatMap({
        name: controller.getName(),
        dataset: dataset,
        parent: controller,
        symmetric: project.isSymmetric() && dataset.getColumnCount() === dataset.getRowCount()
      });
    }
  }
};

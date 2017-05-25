morpheus.AdjustDataTool = function () {
};
morpheus.AdjustDataTool.prototype = {
  toString: function () {
    return 'Adjust';
  },
  init: function (project, form) {
    var _this = this;
    form.$form.find('[name=scale_column_sum]').on('change', function (e) {
      form.setVisible('column_sum', form.getValue('scale_column_sum'));
    });
    form.setVisible('column_sum', false);

  },
  gui: function () {
    // z-score, robust z-score, log2, inverse log2
    return [{
      name: 'scale_column_sum',
      type: 'checkbox',
      help: 'Whether to scale each column sum to a specified value'
    }, {
      name: 'column_sum',
      type: 'text',
      style: 'max-width:150px;'
    }, {
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
      name: 'use_selected_rows_and_columns_only',
      type: 'checkbox'
    }];
  },
  execute: function (options) {
    var project = options.project;
    var heatMap = options.heatMap;

    if (options.input.log_2 || options.input.inverse_log_2
      || options.input['z-score'] || options.input['robust_z-score'] || options.input.quantile_normalize || options.input.scale_column_sum) {
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
      if (options.input.scale_column_sum) {
        var scaleToValue = parseFloat(options.input.column_sum);
        if (!isNaN(scaleToValue)) {
          for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
            var sum = 0;
            for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
              var value = dataset.getValue(i, j);
              if (!isNaN(value)) {
                sum += value;
              }
            }
            var ratio = scaleToValue / sum;
            for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
              var value = dataset.getValue(i, j);
              dataset.setValue(i, j, value * ratio);
            }
          }
        }
      }
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

      return new morpheus.HeatMap({
        name: heatMap.getName(),
        dataset: dataset,
        parent: heatMap,
        symmetric: project.isSymmetric() && dataset.getColumnCount() === dataset.getRowCount()
      });
    }
  }
};

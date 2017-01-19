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
    var controller = options.controller;

    if (options.input.log_2 || options.input.inverse_log_2
      || options.input['z-score'] || options.input['robust_z-score']) {
      var selectedColumnIndices = project.getColumnSelectionModel()
      .getViewIndices();
      var selectedRowIndices = project.getRowSelectionModel()
      .getViewIndices();
      project.setFullDataset(morpheus.DatasetUtil.copy(project
      .getFullDataset()));
      project.getColumnSelectionModel().setViewIndices(
        selectedColumnIndices);
      project.getRowSelectionModel().setViewIndices(selectedRowIndices);
      // clone the values 1st
      var dataset = options.input.use_selected_rows_and_columns_only ? project
        .getSelectedDataset()
        : project.getSortedFilteredDataset();
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

      project.trigger('datasetChanged');
      project.getColumnSelectionModel().setViewIndices(
        selectedColumnIndices, true);
      project.getRowSelectionModel().setViewIndices(selectedRowIndices,
        true);
    }
  }
};

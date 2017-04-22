morpheus.KMeansTool = function () {
};

morpheus.KMeansTool.execute = function (dataset, input) {
  // note: in worker here
  var f = morpheus.HClusterTool.Functions.fromString(input.metric);
  if (f === morpheus.HClusterTool.PRECOMPUTED_DIST) {
    f = 0;
  } else if (f === morpheus.HClusterTool.PRECOMPUTED_SIM) {
    f = 1;
  }
  var rows = input.cluster == 'Rows' || input.cluster == 'Rows and columns';
  var columns = input.cluster == 'Columns'
    || input.cluster == 'Rows and columns';

  var doCluster = function (d) {
    var kmeans = new morpheus.KMeansPlusPlusClusterer(input.number_of_clusters, input.maximum_iterations, f);
    var vectors = [];
    for (var i = 0; i < d.getRowCount(); i++) {
      vectors.push(new morpheus.DatasetRowView(d).setIndex(i));
    }
    var clusters = kmeans.execute(vectors);
    // need to return in JSON
    var assignments = [];
    for (var i = 0; i < clusters.length; i++) {
      clusters[i].getPoints().forEach(function (p) {
        assignments[p.i] = i + 1;
      });
    }
    return assignments;
  };
  var rowAssignments;
  var columnAssignments;
  if (rows) {
    rowAssignments = doCluster(
      input.selectedColumnsToUseForClusteringRows ? new morpheus.SlicedDatasetView(dataset,
        null, input.selectedColumnsToUseForClusteringRows) : dataset);
  }
  if (columns) {
    columnAssignments = doCluster(
      morpheus.DatasetUtil
      .transposedView(input.selectedRowsToUseForClusteringColumns ? new morpheus.SlicedDatasetView(
        dataset, input.selectedRowsToUseForClusteringColumns, null)
        : dataset));

  }

  return {
    rowAssignments: rowAssignments,
    columnAssignments: columnAssignments
  };
};
morpheus.KMeansTool.prototype = {
  toString: function () {
    return 'KMeans Clustering';
  },
  init: function (project, form) {
    form
    .setVisible('cluster_rows_in_space_of_selected_columns_only',
      false);
    form.$form.find('[name=cluster]').on(
      'change',
      function (e) {
        var val = $(this).val();
        var val = $(this).val();
        var showGroupColumns = false;
        var showGroupRows = false;
        if (val === 'Columns') {
          showGroupColumns = true;
        } else if (val === 'Rows') {
          showGroupRows = true;
        } else {
          showGroupColumns = true;
          showGroupRows = true;
        }
        form.setVisible(
          'cluster_columns_in_space_of_selected_rows_only',
          showGroupColumns);
        form.setVisible(
          'cluster_rows_in_space_of_selected_columns_only',
          showGroupRows);
      });
  },
  gui: function () {
    return [{
      name: 'metric',
      options: morpheus.HClusterTool.Functions,
      value: morpheus.HClusterTool.Functions[4].toString(),
      type: 'select'
    }, {
      name: 'cluster',
      options: ['Columns', 'Rows', 'Rows and columns'],
      value: 'Columns',
      type: 'select'
    }, {
      name: 'number_of_clusters',
      value: '2',
      type: 'text'
    }, {
      name: 'cluster_columns_in_space_of_selected_rows_only',
      type: 'checkbox'
    }, {
      name: 'cluster_rows_in_space_of_selected_columns_only',
      type: 'checkbox'
    }, {
      name: 'maximum_iterations',
      value: '1000',
      type: 'text'
    },];
  },
  execute: function (options) {
    var project = options.project;
    var heatmap = options.heatMap;
    options.input.number_of_clusters = parseInt(options.input.number_of_clusters);
    options.input.maximum_iterations = parseInt(options.input.maximum_iterations);
    var selectedRowsToUseForClusteringColumns = options.input.cluster_columns_in_space_of_selected_rows_only ? project
    .getRowSelectionModel().getViewIndices().values()
      : null;
    if (selectedRowsToUseForClusteringColumns != null && selectedRowsToUseForClusteringColumns.length === 0) {
      selectedRowsToUseForClusteringColumns = null;
    }
    var selectedColumnsToUseForClusteringRows = options.input.cluster_rows_in_space_of_selected_columns_only ? project
    .getColumnSelectionModel().getViewIndices().values()
      : null;
    if (selectedColumnsToUseForClusteringRows != null && selectedColumnsToUseForClusteringRows.length === 0) {
      selectedColumnsToUseForClusteringRows = null;
    }
    var rows = options.input.cluster == 'Rows'
      || options.input.cluster == 'Rows and columns';
    var columns = options.input.cluster == 'Columns'
      || options.input.cluster == 'Rows and columns';
    options.input.selectedRowsToUseForClusteringColumns = selectedRowsToUseForClusteringColumns;
    options.input.selectedColumnsToUseForClusteringRows = selectedColumnsToUseForClusteringRows;
    var dataset = project.getSortedFilteredDataset();

    options.input.background = options.input.background && typeof Worker !== 'undefined';
    function addAssignments(d, assignments, k) {
      var v = d.getColumnMetadata().add('k_means_' + k);
      for (var i = 0; i < assignments.length; i++) {
        v.setValue(i, assignments[i]);
      }
    }

    if (options.input.background === false) {
      var result = morpheus.KMeansTool.execute(dataset, options.input);
      if (result.columnAssignments) {
        addAssignments(dataset, result.columnAssignments, options.input.number_of_clusters);
        heatmap.addTrack('k_means_' + options.input.number_of_clusters, true, {
          highlightMatchingValues: true,
          discreteAutoDetermined: true,
          render: {color: true}
        });
      }
      if (result.rowAssignments) {
        addAssignments(new morpheus.TransposedDatasetView(dataset), result.rowAssignments, options.input.number_of_clusters);
        heatmap.addTrack('k_means_' + options.input.number_of_clusters, false, {
          highlightMatchingValues: true,
          discreteAutoDetermined: true,
          render: {color: true}
        });
      }
      heatmap.revalidate();
    } else {
      var blob = new Blob(
        ['self.onmessage = function(e) {'
        + 'importScripts(e.data.scripts);'
        + 'self.postMessage(morpheus.KMeansTool.execute(morpheus.Dataset.fromJSON(e.data.dataset), e.data.input));'
        + '}']);

      var url = window.URL.createObjectURL(blob);
      var worker = new Worker(url);
      worker.postMessage({
        scripts: morpheus.Util.getScriptPath(),
        dataset: morpheus.Dataset.toJSON(dataset, {
          columnFields: [],
          rowFields: [],
          seriesIndices: [0]
        }),
        input: options.input
      });

      worker.onmessage = function (e) {
        var result = e.data;
        if (result.columnAssignments) {
          addAssignments(dataset, result.columnAssignments, options.input.number_of_clusters);
          heatmap.addTrack('k_means_' + options.input.number_of_clusters, true, {
            highlightMatchingValues: true,
            discrete: true,
            render: {color: true}
          });
        }
        if (result.rowAssignments) {
          addAssignments(new morpheus.TransposedDatasetView(dataset), result.rowAssignments, options.input.number_of_clusters);
          heatmap.addTrack('k_means_' + options.input.number_of_clusters, false, {
            highlightMatchingValues: true,
            discrete: true,
            render: {color: true}
          });
        }
        heatmap.revalidate();
        worker.terminate();
        window.URL.revokeObjectURL(url);
      };
      return worker;
    }

  }
};

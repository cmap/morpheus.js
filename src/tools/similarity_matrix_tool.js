morpheus.SimilarityMatrixTool = function () {
};

morpheus.SimilarityMatrixTool.Functions = [morpheus.Euclidean,
  morpheus.Jaccard, morpheus.Cosine, morpheus.KendallsCorrelation, morpheus.Pearson, morpheus.Spearman];
morpheus.SimilarityMatrixTool.Functions.fromString = function (s) {
  for (var i = 0; i < morpheus.SimilarityMatrixTool.Functions.length; i++) {
    if (morpheus.SimilarityMatrixTool.Functions[i].toString() === s) {
      return morpheus.SimilarityMatrixTool.Functions[i];
    }
  }
  throw new Error(s + ' not found');
};
morpheus.SimilarityMatrixTool.execute = function (dataset, input) {
  var isColumnMatrix = input.compute_matrix_for == 'Columns';
  var f = morpheus.SimilarityMatrixTool.Functions.fromString(input.metric);
  return morpheus.HCluster.computeDistanceMatrix(
    isColumnMatrix ? new morpheus.TransposedDatasetView(dataset)
      : dataset, f);
};
morpheus.SimilarityMatrixTool.prototype = {
  toString: function () {
    return 'Similarity Matrix';
  },
  init: function (project, form) {

  },
  gui: function () {
    return [{
      name: 'metric',
      options: morpheus.SimilarityMatrixTool.Functions,
      value: morpheus.SimilarityMatrixTool.Functions[4].toString(),
      type: 'select'
    }, {
      name: 'compute_matrix_for',
      options: ['Columns', 'Rows'],
      value: 'Columns',
      type: 'radio'
    }];
  },
  execute: function (options) {
    var project = options.project;
    var heatMap = options.heatMap;
    var isColumnMatrix = options.input.compute_matrix_for == 'Columns';
    var f = morpheus.SimilarityMatrixTool.Functions
      .fromString(options.input.metric);
    var dataset = project.getSortedFilteredDataset();
    var blob = new Blob(
      ['self.onmessage = function(e) {'
      + 'importScripts(e.data.scripts);'
      + 'self.postMessage(morpheus.SimilarityMatrixTool.execute(morpheus.Dataset.fromJSON(e.data.dataset), e.data.input));'
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
      var name = heatMap.getName() + ' ' + options.input.metric;
      var matrix = e.data;
      var n = isColumnMatrix ? dataset.getColumnCount() : dataset
        .getRowCount();
      var d = new morpheus.Dataset({
        name: name,
        rows: n,
        columns: n
      });
      // set the diagonal
      var isDistance = f.toString() === morpheus.Euclidean.toString()
        || f.toString() === morpheus.Jaccard.toString();
      for (var i = 1; i < n; i++) {
        for (var j = 0; j < i; j++) {
          var value = matrix[i][j];
          d.setValue(i, j, value);
          d.setValue(j, i, value);
        }
      }
      // no need to set diagonal if not distance as array already
      // initialized to 0
      if (!isDistance) {
        for (var i = 0; i < n; i++) {
          d.setValue(i, i, 1);
        }
      }
      var metadata = isColumnMatrix ? dataset.getColumnMetadata()
        : dataset.getRowMetadata();
      d.rowMetadataModel = morpheus.MetadataUtil.shallowCopy(metadata);
      d.columnMetadataModel = morpheus.MetadataUtil.shallowCopy(metadata);
      var colorScheme;
      if (!isDistance) {
        colorScheme = {
          type: 'fixed',
          map: [{
            value: -1,
            color: 'blue'
          }, {
            value: 0,
            color: 'white'
          }, {
            value: 1,
            color: 'red'
          }]
        };
      } else {
        colorScheme = {
          type: 'fixed',
          map: [{
            value: 0,
            color: 'white'
          }, {
            value: morpheus.DatasetUtil.max(d),
            color: 'red'
          }]
        };
      }
      new morpheus.HeatMap({
        colorScheme: colorScheme,
        name: name,
        dataset: d,
        parent: heatMap,
        inheritFromParentOptions: {
          rows: !isColumnMatrix,
          columns: isColumnMatrix
        }
      });
      worker.terminate();
      window.URL.revokeObjectURL(url);
    };
    return worker;
  }
};

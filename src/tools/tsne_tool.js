morpheus.TsneTool = function () {
};

morpheus.TsneTool.execute = function (dataset, input) {
  // note: in worker here
  var matrix = [];
  var rows = input.run_on == 'Rows';
  if (!rows) {
    dataset = new morpheus.TransposedDatasetView(dataset);
  }
  var N = dataset.getRowCount();
  var f = morpheus.HClusterTool.Functions.fromString(input.metric);
  if (f === morpheus.TsneTool.PRECOMPUTED_DIST) {
    for (var i = 0; i < N; i++) {
      matrix.push([]);
      for (var j = i + 1; j < N; j++) {
        matrix[i][j] = dataset.getValue(i, j);
      }
    }
  } else if (f === morpheus.TsneTool.PRECOMPUTED_SIM) {
    var max = morpheus.DatasetUtil.max(dataset);
    for (var i = 0; i < N; i++) {
      matrix.push([]);
      for (var j = i + 1; j < N; j++) {
        matrix[i][j] = max - dataset.getValue(i, j);
      }
    }
  } else {
    var list1 = new morpheus.DatasetRowView(dataset);
    var list2 = new morpheus.DatasetRowView(dataset);
    for (var i = 0; i < N; i++) {
      matrix.push([]);
      list1.setIndex(i);
      for (var j = i + 1; j < N; j++) {
        var d = f(list1, list2.setIndex(j));
        matrix[i][j] = d;
      }
    }
  }
  var opt = {};
  opt.epsilon = input.epsilon;
  opt.perplexity = input.perplexity;
  opt.dim = 2;
  var tsne = new tsnejs.tSNE(opt);
  tsne.initDataDist(matrix);
  for (var k = 0; k < 1000; k++) {
    tsne.step();
  }
  var Y = tsne.getSolution();
  return {solution: Y};

}
;
morpheus.TsneTool.prototype = {
  toString: function () {
    return 't-SNE';
  },
  init: function (project, form) {

  },
  gui: function () {
    return [{
      name: 'metric',
      options: morpheus.HClusterTool.Functions,
      value: morpheus.HClusterTool.Functions[4].toString(),
      type: 'select'
    }, {
      name: 'run_on',
      options: ['Columns', 'Rows'],
      value: 'Columns',
      type: 'select'
    }, {
      name: 'epsilon',
      value: '10',
      type: 'text',
      help: 'learning rate'
    }, {
      name: 'perplexity',
      value: '30',
      type: 'text',
      help: 'number of effective nearest neighbors'
    }];
  },
  execute: function (options) {
    var project = options.project;
    var heatMap = options.heatMap;
    var rows = options.input.run_on == 'Rows';
    var dataset = project.getSortedFilteredDataset();
    options.input.epsilon = parseInt(options.input.epsilon);
    options.input.perplexity = parseInt(options.input.perplexity);

    var done = function (result) {
      var solution = result.solution;
      var t1Vector = !rows ? dataset.getColumnMetadata().add('T1') : dataset.getRowMetadata().add('T1');
      var t2Vector = !rows ? dataset.getColumnMetadata().add('T2') : dataset.getRowMetadata().add('T2');
      for (var i = 0; i < t1Vector.size(); i++) {
        t1Vector.setValue(i, solution[i][0]);
        t2Vector.setValue(i, solution[i][1]);
      }

      project.trigger('trackChanged', {
        vectors: [t1Vector, t2Vector],
        display: ['color', 'color'],
        columns: !rows
      });
    };
    var useWOrker = false;
    if (useWOrker) {
      var blob = new Blob(
        ['self.onmessage = function(e) {'
        + 'e.data.scripts.forEach(function (s) { importScripts(s); });'
        + 'self.postMessage(morpheus.TsneTool.execute(morpheus.Dataset.fromJSON(e.data.dataset), e.data.input));'
        + '}']);

      var url = URL.createObjectURL(blob);
      var worker = new Worker(url);
      worker.postMessage({
        scripts: [morpheus.Util.getScriptPath()],
        dataset: morpheus.Dataset.toJSON(dataset, {
          columnFields: [],
          rowFields: [],
          seriesIndices: [0]
        }),
        input: options.input
      });
      worker.onmessage = function (e) {
        done(e.data.solution);
        worker.terminate();
        window.URL.revokeObjectURL(url);
      };
      return worker;
    } else {
      done(morpheus.TsneTool.execute(dataset, options.input));
    }
  }
};

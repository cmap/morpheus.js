morpheus.MarkerSelection = function () {

};

/**
 * @private
 */
morpheus.MarkerSelection.Functions = [morpheus.FisherExact,
  morpheus.FoldChange, morpheus.SignalToNoise,
  morpheus.createSignalToNoiseAdjust(), morpheus.TTest];

morpheus.MarkerSelection.Functions.fromString = function (s) {
  for (var i = 0; i < morpheus.MarkerSelection.Functions.length; i++) {
    if (morpheus.MarkerSelection.Functions[i].toString() === s) {
      return morpheus.MarkerSelection.Functions[i];
    }
  }
  throw s + ' not found';
};
morpheus.MarkerSelection.execute = function (dataset, input) {
  var aIndices = [];
  var bIndices = [];
  for (var i = 0; i < input.numClassA; i++) {
    aIndices[i] = i;
  }
  for (var i = input.numClassA; i < dataset.getColumnCount(); i++) {
    bIndices[i] = i;
  }

  var f = morpheus.MarkerSelection.Functions.fromString(input.metric);
  var permutations = new morpheus.PermutationPValues(dataset, aIndices,
    bIndices, input.npermutations, f);
  return {
    rowSpecificPValues: permutations.rowSpecificPValues,
    k: permutations.k,
    fdr: permutations.fdr,
    scores: permutations.scores
  };
};
morpheus.MarkerSelection.prototype = {
  toString: function () {
    return 'Marker Selection';
  },
  init: function (project, form) {
    var _this = this;
    var updateAB = function (fieldNames) {
      var ids = [];
      if (fieldNames != null) {
        var vectors = morpheus.MetadataUtil.getVectors(project
          .getFullDataset().getColumnMetadata(), fieldNames);
        var idToIndices = morpheus.VectorUtil
          .createValuesToIndicesMap(vectors);
        idToIndices.forEach(function (indices, id) {
          ids.push(id);
        });
      }
      ids.sort();
      form.setOptions('class_a', ids);
      form.setOptions('class_b', ids);

    };
    var $field = form.$form.find('[name=field]');
    $field.on('change', function (e) {
      updateAB($(this).val());
    });

    if ($field[0].options.length > 0) {
      $field.val($field[0].options[0].value);
    }
    updateAB($field.val());
    var $metric = form.$form.find('[name=metric]');
    $metric.on('change', function (e) {
      var isFishy = $(this).val() === 'Fisher Exact Test';
      form.setVisible('grouping_value', isFishy);
      form.setVisible('permutations', !isFishy);
      form.setVisible('number_of_markers', !isFishy);

    });
    form.setVisible('grouping_value', false);

  },
  gui: function (project) {
    var dataset = project.getSortedFilteredDataset();
    var fields = morpheus.MetadataUtil.getMetadataNames(dataset
      .getColumnMetadata());
    return [
      {
        name: 'metric',
        options: morpheus.MarkerSelection.Functions,
        value: morpheus.SignalToNoise.toString(),
        type: 'select',
        help: ''
      },
      {
        name: 'grouping_value',
        value: '1',
        help: 'Class values are categorized into two groups based on whether dataset values are greater than or equal to this value',
      },
      {
        name: 'field',
        options: fields,
        type: 'select',
        multiple: true
      },
      {
        name: 'class_a',
        title: 'Class A',
        options: [],
        value: '',
        type: 'checkbox-list',
        multiple: true
      },
      {
        name: 'class_b',
        title: 'Class B',
        options: [],
        value: '',
        type: 'checkbox-list',
        multiple: true
      },
      {
        name: 'number_of_markers',
        value: '100',
        type: 'text',
        help: 'The initial number of markers to show in each direction. Click <button title="Filter (Ctrl+L)" type="button" class="btn btn-default btn-xs dropdown-toggle"><span class="fa fa-filter"></span></button> to change.'
      }, {
        name: 'permutations',
        value: '0',
        type: 'text'
      }];
  },
  execute: function (options) {

    var project = options.project;
    // classA and classB are arrays of identifiers if run via user
    // interface. If run via JSON, will be string arrays
    var classA = options.input.class_a;

    for (var i = 0; i < classA.length; i++) {
      var val = classA[i];
      if (!(val instanceof morpheus.Identifier)) {
        classA[i] = new morpheus.Identifier(
          morpheus.Util.isArray(val) ? val : [val]);
      }
    }
    var classB = options.input.class_b;
    for (var i = 0; i < classB.length; i++) {
      var val = classB[i];
      if (!(val instanceof morpheus.Identifier)) {
        classB[i] = new morpheus.Identifier(
          morpheus.Util.isArray(val) ? val : [val]);
      }
    }
    var npermutations = parseInt(options.input.permutations);
    var fieldNames = options.input.field;
    if (!morpheus.Util.isArray(fieldNames)) {
      fieldNames = [fieldNames];
    }
    var dataset = project.getSortedFilteredDataset();
    var vectors = morpheus.MetadataUtil.getVectors(dataset
      .getColumnMetadata(), fieldNames);

    var idToIndices = morpheus.VectorUtil.createValuesToIndicesMap(vectors);
    var f = morpheus.MarkerSelection.Functions
      .fromString(options.input.metric);

    var aIndices = [];
    var bIndices = [];
    classA.forEach(function (id) {
      var indices = idToIndices.get(id);
      if (indices === undefined) {
        throw new Error(id + ' not found in ' + idToIndices.keys());
      }
      aIndices = aIndices.concat(indices);
    });
    classB.forEach(function (id) {
      var indices = idToIndices.get(id);
      if (indices === undefined) {
        throw new Error(id + ' not found in ' + idToIndices.keys());
      }
      bIndices = bIndices.concat(indices);
    });

    if (aIndices.length === 0 && bIndices.length === 0) {
      throw 'No samples in class A and class B';
    }

    if (aIndices.length === 0) {
      throw 'No samples in class A';
    }
    if (bIndices.length === 0) {
      throw 'No samples in class B';
    }

    var classASet = {};
    for (var i = 0; i < aIndices.length; i++) {
      classASet[aIndices[i]] = true;
    }
    for (var i = 0; i < bIndices.length; i++) {
      if (classASet[bIndices[i]]) {
        throw 'The sample was found in class A and class B';
      }
    }
    var isFishy = f.toString() === morpheus.FisherExact.toString();
    if (aIndices.length === 1 || bIndices.length === 1
      && !(f instanceof morpheus.FisherExact)) {
      f = morpheus.FoldChange;
    }
    var list1 = new morpheus.DatasetRowView(new morpheus.SlicedDatasetView(
      dataset, null, aIndices));
    var list2 = new morpheus.DatasetRowView(new morpheus.SlicedDatasetView(
      dataset, null, bIndices));
    // remove
    // other
    // marker
    // selection
    // fields
    var markerSelectionFields = morpheus.MarkerSelection.Functions.map(
      function (f) {
        return f.toString();
      }).concat(['odds_ratio', 'FDR(BH)', 'p_value']);
    markerSelectionFields.forEach(function (name) {
      var index = morpheus.MetadataUtil.indexOf(dataset.getRowMetadata(),
        name);
      if (index !== -1) {
        dataset.getRowMetadata().remove(index);
        options.heatMap.removeTrack(name, false);
      }
    });
    var v = dataset.getRowMetadata().add(f.toString());
    var vectors = [v];
    var comparisonVector = dataset.getColumnMetadata().add('Comparison');

    for (var i = 0; i < aIndices.length; i++) {
      comparisonVector.setValue(aIndices[i], 'A');
    }
    for (var i = 0; i < bIndices.length; i++) {
      comparisonVector.setValue(bIndices[i], 'B');
    }
    function done() {

      if (project.getRowFilter().getFilters().length > 0) {
        project.getRowFilter().setAnd(true, true);
      }
      var rowFilters = project.getRowFilter().getFilters();
      // remove existing top n filters
      for (var i = 0; i < rowFilters.length; i++) {
        if (rowFilters[i] instanceof morpheus.TopNFilter) {
          project.getRowFilter().remove(i, true);
          i--;
        }
      }
      if (!isFishy) {
        project.getRowFilter().add(
          new morpheus.TopNFilter(
            parseInt(options.input.number_of_markers),
            morpheus.TopNFilter.TOP_BOTTOM, vectors[0]
              .getName()), true);
      }

      project.setRowFilter(project.getRowFilter(), true);
      project.setRowSortKeys([new morpheus.SortKey(vectors[0].getName(),
        isFishy ? morpheus.SortKey.SortOrder.ASCENDING
          : morpheus.SortKey.SortOrder.DESCENDING)], true);
      // select samples used in comparison
      var selectedColumnIndices = new morpheus.Set();
      aIndices.forEach(function (index) {
        selectedColumnIndices.add(index);
      });
      bIndices.forEach(function (index) {
        selectedColumnIndices.add(index);
      });
      project.getColumnSelectionModel().setViewIndices(selectedColumnIndices, true);

      project.setColumnSortKeys([new morpheus.SortKey(comparisonVector
        .getName(), morpheus.SortKey.SortOrder.ASCENDING)], true);

      project.trigger('trackChanged', {
        vectors: vectors,
        render: vectors.map(function () {
          return 'text';
        }),
        columns: false
      });
      project.trigger('trackChanged', {
        vectors: [comparisonVector],
        render: ['color'],
        columns: true
      });
    }

    if (isFishy) {
      var groupingValue = parseFloat(options.input.grouping_value);
      var oddsRatioVector = dataset.getRowMetadata().add('odds_ratio');
      var fdrVector = dataset.getRowMetadata().add('FDR(BH)');
      var contingencyTableVector = dataset.getRowMetadata().add(
        'contingency_table');
      var pvalues = [];
      for (var i = 0, size = dataset.getRowCount(); i < size; i++) {
        var abcd = morpheus.createContingencyTable(list1.setIndex(i),
          list2.setIndex(i), groupingValue);
        contingencyTableVector.setValue(i, '[[' + abcd[0] + ', '
          + abcd[1] + '], [' + abcd[2] + ', ' + abcd[3] + ']]');
        var ratio = (abcd[0] * abcd[3]) / (abcd[1] * abcd[2]);
        if (isNaN(ratio) || ratio === Number.POSITIVE_INFINITY) {
          ratio = 0;
        }
        oddsRatioVector.setValue(i, ratio);
        v.setValue(i, morpheus.FisherExact.fisherTest(abcd[0], abcd[1],
          abcd[2], abcd[3]));
        pvalues.push(v.getValue(i));
      }
      var fdr = morpheus.FDR_BH(pvalues);
      for (var i = 0, size = dataset.getRowCount(); i < size; i++) {
        fdrVector.setValue(i, fdr[i]);
      }
      vectors.push(oddsRatioVector);
      vectors.push(fdrVector);
      vectors.push(contingencyTableVector);
      done();
    } else {
      // background
      if (npermutations > 0) {
        options.input.numClassA = aIndices.length;
        options.input.npermutations = npermutations;
        var blob = new Blob(
          ['self.onmessage = function(e) {'
          + 'importScripts(e.data.scripts);'
          + 'self.postMessage(morpheus.MarkerSelection.execute(morpheus.Dataset.fromJSON(e.data.dataset), e.data.input));'
          + '}']);

        var url = window.URL.createObjectURL(blob);
        var worker = new Worker(url);
        var subset = new morpheus.SlicedDatasetView(dataset, null,
          aIndices.concat(bIndices));

        worker.postMessage({
          scripts: morpheus.Util.getScriptPath(),
          dataset: morpheus.Dataset.toJSON(subset, {
            columnFields: [],
            rowFields: [],
            seriesIndices: [0]
          }),
          input: options.input
        });

        worker.onmessage = function (e) {
          var result = e.data;
          var pvalueVector = dataset.getRowMetadata().add('p_value');
          var fdrVector = dataset.getRowMetadata().add('FDR(BH)');
          var kVector = dataset.getRowMetadata().add('k');

          for (var i = 0, size = pvalueVector.size(); i < size; i++) {
            pvalueVector.setValue(i, result.rowSpecificPValues[i]);
            fdrVector.setValue(i, result.fdr[i]);
            kVector.setValue(i, result.k[i]);
            v.setValue(i, result.scores[i]);
          }
          vectors.push(pvalueVector);
          vectors.push(fdrVector);
          vectors.push(kVector);
          done();
          worker.terminate();
          window.URL.revokeObjectURL(url);
        };
        return worker;
      } else {
        for (var i = 0, size = dataset.getRowCount(); i < size; i++) {
          v.setValue(i, f(list1.setIndex(i), list2.setIndex(i)));
        }
        done();
      }
    }

  }
};

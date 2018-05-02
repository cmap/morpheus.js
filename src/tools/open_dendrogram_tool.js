morpheus.OpenDendrogramTool = function (file) {
  this._file = file;
};
morpheus.OpenDendrogramTool.prototype = {
  toString: function () {
    return 'Open Dendrogram';
  },
  init: function (project, form) {
    var setValue = function (val) {
      var isRows = val === 'Rows';
      var names = morpheus.MetadataUtil.getMetadataNames(isRows ? project
      .getFullDataset().getRowMetadata() : project
      .getFullDataset().getColumnMetadata());
      names.unshift('Newick file does not contain node ids');
      form.setOptions('match_leaf_node_ids_to', names);
    };
    form.$form.find('[name=orientation]').on('change', function (e) {
      setValue($(this).val());
    });
    setValue('Columns');
  },
  gui: function () {
    return [{
      name: 'orientation',
      options: ['Columns', 'Rows'],
      value: 'Columns',
      type: 'radio'
    }, {
      name: 'match_leaf_node_ids_to',
      options: [],
      type: 'select'
    }];
  },
  execute: function (options) {
    var fileOrUrl = this._file;
    var isColumns = options.input.orientation === 'Columns';
    var dendrogramField = options.input.match_leaf_node_ids_to;
    if (dendrogramField == '' || dendrogramField === 'Newick file does not contain node ids') {
      dendrogramField = null;
    }
    var heatMap = options.heatMap;
    var dendrogramDeferred = morpheus.Util.getText(fileOrUrl);
    dendrogramDeferred
    .done(function (text) {
      var dataset = options.project.getSortedFilteredDataset();
      if (isColumns) {
        dataset = new morpheus.TransposedDatasetView(dataset);
      }
      var tree = morpheus.DendrogramUtil.parseNewick(text);
      if (tree.leafNodes.length !== dataset.getRowCount()) {
        throw new Error('# leaf nodes in dendrogram '
          + tree.leafNodes.length + ' != '
          + dataset.getRowCount());
      }
      var modelIndices = [];
      if (dendrogramField != null) {
        var vector = dataset.getRowMetadata().getByName(
          dendrogramField);
        var valueToIndex = morpheus.VectorUtil.createValueToIndexMap(vector);
        for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
          var newickId = tree.leafNodes[i].name;
          var index = valueToIndex.get(newickId);
          if (index === undefined) {
            throw new Error('Unable to find dendrogram id '
              + tree.leafNodes[i].name
              + ' in annotations');
          }
          modelIndices.push(index);
        }
      } else {
        // see if leaf node ids are indices
        for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
          var newickId = tree.leafNodes[i].name;
          newickId = parseInt(newickId);
          if (!isNaN(newickId)) {
            modelIndices.push(newickId);
          } else {
            break;
          }
        }

        if (modelIndices.length !== tree.leafNodes.length) {
          modelIndices = [];
          for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
            modelIndices.push(i);
          }
        }
      }
      heatMap.setDendrogram(tree, isColumns, modelIndices);
    });
  }
};

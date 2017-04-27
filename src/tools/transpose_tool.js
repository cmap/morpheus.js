morpheus.TransposeTool = function () {
};
morpheus.TransposeTool.prototype = {
  toString: function () {
    return 'Transpose';
  },
  execute: function (options) {
    var project = options.project;
    var heatMap = options.heatMap;
    var dataset = new morpheus.TransposedDatasetView(project
      .getSortedFilteredDataset());
    // make a shallow copy of the dataset, metadata is immutable via the UI
    var rowMetadataModel = morpheus.MetadataUtil.shallowCopy(dataset
      .getRowMetadata());
    var columnMetadataModel = morpheus.MetadataUtil.shallowCopy(dataset
      .getColumnMetadata());
    dataset.getRowMetadata = function () {
      return rowMetadataModel;
    };
    dataset.getColumnMetadata = function () {
      return columnMetadataModel;
    };

    // TODO see if we can subset dendrograms
    // only handle contiguous selections for now
    // if (heatMap.columnDendrogram != null) {
    // var indices = project.getColumnSelectionModel().getViewIndices()
    // .toArray();
    // morpheus.DendrogramUtil.leastCommonAncestor();
    // }
    // if (heatMap.rowDendrogram != null) {
    //
    // }
    var name = options.input.name || heatMap.getName();
    new morpheus.HeatMap({
      name: name,
      dataset: dataset,
      inheritFromParentOptions: {
        transpose: true
      },
      parent: heatMap
    });

  }
};

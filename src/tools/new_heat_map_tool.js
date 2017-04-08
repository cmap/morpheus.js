morpheus.NewHeatMapTool = function () {
};
morpheus.NewHeatMapTool.prototype = {
  toString: function () {
    return 'New Heat Map';
  },
  // gui : function() {
  // return [ {
  // name : 'name',
  // type : 'text'
  // }, {
  // name : 'include_selected_rows',
  // type : 'checkbox',
  // value : true
  // }, {
  // name : 'include_selected_columns',
  // type : 'checkbox',
  // value : true
  // } ];
  // },
  execute: function (options) {
    var project = options.project;
    var heatMap = options.heatMap;
    var dataset = project.getSelectedDataset({
      selectedRows: true,
      selectedColumns: true
    });
    morpheus.DatasetUtil.shallowCopy(dataset);
    //morpheus.DatasetUtil.toESSessionPromise(dataset);
    console.log(dataset);
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
    var heatmap = new morpheus.HeatMap({
      name: heatMap.getName(),
      dataset: dataset,
      parent: heatMap,
      symmetric: project.isSymmetric() && dataset.getColumnCount() === dataset.getRowCount()
    });

  }
};

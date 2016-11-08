morpheus.NewHeatMapTool = function() {
};
morpheus.NewHeatMapTool.prototype = {
	toString : function() {
		return 'New Heat Map (' + morpheus.Util.COMMAND_KEY + 'X)';
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
	execute : function(options) {
		var project = options.project;
		var controller = options.controller;
		var dataset = project.getSelectedDataset({
			selectedRows : true,
			selectedColumns : true
		});
		morpheus.DatasetUtil.shallowCopy(dataset);
		morpheus.DatasetUtil.toESSessionPromise(dataset);
		// TODO see if we can subset dendrograms
		// only handle contiguous selections for now
		// if (controller.columnDendrogram != null) {
		// var indices = project.getColumnSelectionModel().getViewIndices()
		// .toArray();
		// morpheus.DendrogramUtil.leastCommonAncestor();
		// }
		// if (controller.rowDendrogram != null) {
		//
		// }
		var name = options.input.name || controller.getName();
		new morpheus.HeatMap({
			name : name,
			dataset : dataset,
			parent : controller

		});

	}
};

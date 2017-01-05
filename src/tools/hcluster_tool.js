morpheus.HClusterTool = function () {
};
morpheus.HClusterTool.PRECOMPUTED_DIST = 'Matrix values (for a precomputed distance matrix)';
morpheus.HClusterTool.PRECOMPUTED_SIM = 'Matrix values (for a precomputed similarity matrix)';
morpheus.HClusterTool.Functions = [morpheus.Euclidean, morpheus.Jaccard,
	new morpheus.OneMinusFunction(morpheus.Cosine),
	new morpheus.OneMinusFunction(morpheus.KendallsCorrelation),
	new morpheus.OneMinusFunction(morpheus.Pearson),
	new morpheus.OneMinusFunction(morpheus.Spearman),
	morpheus.HClusterTool.PRECOMPUTED_DIST,
	morpheus.HClusterTool.PRECOMPUTED_SIM];
morpheus.HClusterTool.Functions.fromString = function (s) {
	for (var i = 0; i < morpheus.HClusterTool.Functions.length; i++) {
		if (morpheus.HClusterTool.Functions[i].toString() === s) {
			return morpheus.HClusterTool.Functions[i];
		}
	}
	throw new Error(s + ' not found');
};

morpheus.HClusterTool.createLinkageMethod = function (linkageString) {
	var linkageMethod;
	if (linkageString === 'Average') {
		linkageMethod = morpheus.AverageLinkage;
	} else if (linkageString === 'Complete') {
		linkageMethod = morpheus.CompleteLinkage;
	} else if (linkageString === 'Single') {
		linkageMethod = morpheus.SingleLinkage;
	} else {
		throw new Error('Unknown linkage method ' + linkageString);
	}
	return linkageMethod;
};

morpheus.HClusterTool.execute = function (dataset, input) {
	// note: in worker here
	var linkageMethod = morpheus.HClusterTool
	.createLinkageMethod(input.linkage_method);
	var f = morpheus.HClusterTool.Functions.fromString(input.metric);
	if (f === morpheus.HClusterTool.PRECOMPUTED_DIST) {
		f = 0;
	} else if (f === morpheus.HClusterTool.PRECOMPUTED_SIM) {
		f = 1;
	}
	var rows = input.cluster == 'Rows' || input.cluster == 'Rows and columns';
	var columns = input.cluster == 'Columns'
		|| input.cluster == 'Rows and columns';
	var doCluster = function (d, groupByFields) {
		return (groupByFields && groupByFields.length > 0) ? new morpheus.HClusterGroupBy(
				d, groupByFields, f, linkageMethod)
			: new morpheus.HCluster(morpheus.HCluster
			.computeDistanceMatrix(d, f), linkageMethod);
	};

	var rowsHcl;
	var columnsHcl;

	if (rows) {
		rowsHcl = doCluster(
			input.selectedColumnsToUseForClusteringRows ? new morpheus.SlicedDatasetView(dataset,
					null, input.selectedColumnsToUseForClusteringRows) : dataset,
			input.group_rows_by);
	}
	if (columns) {
		columnsHcl = doCluster(
			morpheus.DatasetUtil
			.transposedView(input.selectedRowsToUseForClusteringColumns ? new morpheus.SlicedDatasetView(
					dataset, input.selectedRowsToUseForClusteringColumns, null)
				: dataset), input.group_columns_by);

	}
	return {
		rowsHcl: rowsHcl,
		columnsHcl: columnsHcl
	};
};
morpheus.HClusterTool.prototype = {
	toString: function () {
		return 'Hierarchical Clustering';
	},
	init: function (project, form) {
		form.setOptions('group_rows_by', morpheus.MetadataUtil
		.getMetadataNames(project.getFullDataset().getRowMetadata()));
		form
		.setOptions('group_columns_by', morpheus.MetadataUtil
		.getMetadataNames(project.getFullDataset()
		.getColumnMetadata()));
		form.setVisible('group_rows_by', false);
		form
		.setVisible('cluster_rows_in_space_of_selected_columns_only',
			false);
		form.$form.find('[name=cluster]').on(
			'change',
			function (e) {
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
				form.setVisible('group_columns_by', showGroupColumns);
				form.setVisible('group_rows_by', showGroupRows);
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
			name: 'linkage_method',
			options: ['Average', 'Complete', 'Single'],
			value: 'Average',
			type: 'select'
		}, {
			name: 'group_columns_by',
			options: [],
			type: 'bootstrap-select',
			multiple: true
		}, {
			name: 'group_rows_by',
			options: [],
			type: 'bootstrap-select',
			multiple: true
		}, {
			name: 'cluster_columns_in_space_of_selected_rows_only',
			type: 'checkbox'
		}, {
			name: 'cluster_rows_in_space_of_selected_columns_only',
			type: 'checkbox'
		}];
	},
	execute: function (options) {

		var project = options.project;
		var controller = options.controller;
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

		if (options.input.background === false) {
			var result = morpheus.HClusterTool.execute(dataset, options.input);
			if (result.rowsHcl) {
				controller.setDendrogram(result.rowsHcl.tree, false,
					result.rowsHcl.reorderedIndices);
			}
			if (result.columnsHcl) {
				controller.setDendrogram(result.columnsHcl.tree, true,
					result.columnsHcl.reorderedIndices);
			}
		} else {
			var subtitle = ['clustering '];
			if (rows) {
				subtitle.push(dataset.getRowCount() + ' row'
					+ morpheus.Util.s(dataset.getRowCount()));
			}
			if (columns) {
				subtitle.push(rows ? ', ' : '');
				subtitle.push(dataset.getColumnCount() + ' column'
					+ morpheus.Util.s(dataset.getColumnCount()));
			}

			var blob = new Blob(
				['self.onmessage = function(e) {'
				+ 'importScripts(e.data.scripts);'
				+ 'self.postMessage(morpheus.HClusterTool.execute(morpheus.Dataset.fromJson(e.data.dataset), e.data.input));'
				+ '}']);

			var url = window.URL.createObjectURL(blob);
			var worker = new Worker(url);

			worker.postMessage({
				scripts: morpheus.Util.getScriptPath(),
				dataset: morpheus.Dataset.toJson(dataset, {
					columnFields: options.input.group_columns_by || [],
					rowFields: options.input.group_rows_by || []
				}),
				input: options.input
			});

			worker.onmessage = function (e) {
				var result = e.data;
				if (result.rowsHcl) {
					controller.setDendrogram(result.rowsHcl.tree, false,
						result.rowsHcl.reorderedIndices);
				}
				if (result.columnsHcl) {
					controller.setDendrogram(result.columnsHcl.tree, true,
						result.columnsHcl.reorderedIndices);
				}
				worker.terminate();
				window.URL.revokeObjectURL(url);
			};
			return worker;
		}

	}
};

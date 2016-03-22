morpheus.NearestNeighbors = function() {
};
morpheus.NearestNeighbors.Functions = [ morpheus.Cosine, morpheus.Euclidean,
		morpheus.Jaccard, morpheus.Pearson, morpheus.Spearman,
		morpheus.WeightedMean ];
morpheus.NearestNeighbors.Functions.fromString = function(s) {
	for (var i = 0; i < morpheus.NearestNeighbors.Functions.length; i++) {
		if (morpheus.NearestNeighbors.Functions[i].toString() === s) {
			return morpheus.NearestNeighbors.Functions[i];
		}
	}
	throw new Error(s + ' not found');
};
morpheus.NearestNeighbors.prototype = {
	toString : function() {
		return 'Nearest Neighbors';
	},
	init : function(project, form) {
		var $selectedOnly = form.$form.find('[name=use_selected_only]')
				.parent();
		form.$form
				.find('[name=compute_nearest_neighbors_of]')
				.on(
						'change',
						function(e) {
							var val = $(this).val();
							if (val === 'selected rows') {
								$($selectedOnly.contents()[1])
										.replaceWith(
												document
														.createTextNode(' Use selected columns only'));
							} else {
								$($selectedOnly.contents()[1])
										.replaceWith(
												document
														.createTextNode(' Use selected rows only'));
							}
						});
		$($selectedOnly.contents()[1]).replaceWith(
				document.createTextNode(' Use selected columns only'));
	},
	gui : function() {
		return [ {
			name : 'metric',
			options : morpheus.NearestNeighbors.Functions,
			value : morpheus.Pearson.toString(),
			type : 'select'
		}, {
			name : 'compute_nearest_neighbors_of',
			options : [ 'selected rows', 'selected columns' ],
			value : 'selected rows',
			type : 'radio'
		}, {
			name : 'use_selected_only',
			type : 'checkbox'
		} ];
	},
	execute : function(options) {
		var project = options.project;
		var isColumns = options.input.compute_nearest_neighbors_of == 'selected columns';
		var controller = options.controller;
		var f = morpheus.NearestNeighbors.Functions
				.fromString(options.input.metric);
		var dataset = project.getSortedFilteredDataset();
		if (isColumns) {
			dataset = morpheus.DatasetUtil.transposedView(dataset);
		}
		var selectedIndices = (isColumns ? project.getColumnSelectionModel()
				: project.getRowSelectionModel()).getViewIndices().values();
		if (selectedIndices.length === 0) {
			throw new Error('No ' + (isColumns ? 'columns' : 'rows')
					+ ' selected');
		}
		var spaceIndices = null;
		if (options.input.use_selected_only) {
			spaceIndices = (!isColumns ? project.getColumnSelectionModel()
					: project.getRowSelectionModel()).getViewIndices().values();
			dataset = morpheus.DatasetUtil.slicedView(dataset, null,
					spaceIndices);
		}
		var d1 = morpheus.DatasetUtil
				.slicedView(dataset, selectedIndices, null);
		var list1;
		if (d1.getRowCount() > 1) {
			// collapse each column in the dataset to a single value
			var columnView = new morpheus.DatasetColumnView(d1);
			var newDataset = new morpheus.Dataset({
				name : '',
				rows : 1,
				columns : d1.getColumnCount()
			});
			for (var j = 0, ncols = d1.getColumnCount(); j < ncols; j++) {
				var v = morpheus.Percentile(columnView.setIndex(j), 50);
				newDataset.setValue(0, j, v);
			}
			d1 = newDataset;
		}
		list1 = new morpheus.DatasetRowView(d1);
		var list2 = new morpheus.DatasetRowView(dataset);
		var values = [];
		var v = dataset.getRowMetadata().getByName(f.toString());
		if (v == null) {
			v = dataset.getRowMetadata().add(f.toString());
		}
		for (var i = 0, size = dataset.getRowCount(); i < size; i++) {
			v.setValue(i, f(list1, list2.setIndex(i)));
		}
		if (!isColumns) {
			project.setRowSortKeys([ new morpheus.SortKey(f.toString(),
					morpheus.SortKey.SortOrder.DESCENDING) ], true);
		} else {
			project.setColumnSortKeys([ new morpheus.SortKey(f.toString(),
					morpheus.SortKey.SortOrder.DESCENDING) ], true);
		}
		project.trigger('trackChanged', {
			vectors : [ v ],
			render : [ 'text' ],
			columns : isColumns
		});
	}
};
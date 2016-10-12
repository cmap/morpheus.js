morpheus.OpenDendrogramTool = function(file) {
	this._file = file;
};
morpheus.OpenDendrogramTool.prototype = {
	toString : function() {
		return 'Open Dendrogram';
	},
	init : function(project, form) {
		var setValue = function(val) {
			var isRows = val === 'Rows';
			var names = morpheus.MetadataUtil.getMetadataNames(isRows ? project
					.getFullDataset().getRowMetadata() : project
					.getFullDataset().getColumnMetadata());
			names.unshift('Newick file does not contain node ids');
			form.setOptions('match_node_id_to', names);
		};
		form.$form.find('[name=orientation]').on('change', function(e) {
			setValue($(this).val());
		});
		setValue('Columns');
	},
	gui : function() {
		return [ {
			name : 'orientation',
			options : [ 'Columns', 'Rows' ],
			value : 'Columns',
			type : 'radio'
		}, {
			name : 'match_node_id_to',
			options : [],
			type : 'select'
		} ];
	},
	execute : function(options) {
		var fileOrUrl = this._file;
		var isColumns = options.input.orientation === 'Columns';
		var dendrogramField = options.input.match_node_id_to;
		if (dendrogramField === 'Newick file does not contain node ids') {
			dendrogramField = null;
		}
		// prompt for annotation in dataset to match node ids on
		var controller = options.controller;
		var dendrogramDeferred = morpheus.Util.getText(fileOrUrl);
		dendrogramDeferred
				.done(function(text) {
					var dataset = options.project.getSortedFilteredDataset();
					if (isColumns) {
						dataset = morpheus.DatasetUtil.transposedView(dataset);
					}
					var tree = morpheus.DendrogramUtil.parseNewick(text);
					if (tree.leafNodes.length !== dataset.getRowCount()) {
						throw new Error('# leaf nodes in dendrogram '
								+ tree.leafNodes.length + ' != '
								+ dataset.getRowCount());
					}
					var indices = [];
					if (dendrogramField != null) {
						var vector = dataset.getRowMetadata().getByName(
								dendrogramField);
						var valueToIndex = morpheus.VectorUtil
								.createValueToIndexMap(vector);
						for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
							var index = valueToIndex
									.get(tree.leafNodes[i].name);
							if (index === undefined) {
								throw new Error('Unable to find dendrogram id '
										+ tree.leafNodes[i].name
										+ ' in annotations');
							}
							indices.push(index);
						}
					} else {
						for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
							indices.push(i);
						}
					}
					controller.setDendrogram(tree, isColumns, indices);
				});
	}
};

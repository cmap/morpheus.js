morpheus.DendrogramEnrichmentTool = function(isColumns) {
	this.isColumns = isColumns;
};

morpheus.DendrogramEnrichmentTool.prototype = {
	toString : function() {
		return 'Dendrogram Enrichment';
	},
	gui : function(project) {
		var dataset = project.getSortedFilteredDataset();
		var fields = morpheus.MetadataUtil
				.getMetadataNames(this.isColumns ? dataset.getColumnMetadata()
						: dataset.getRowMetadata());
		return [ {
			name : 'field',
			options : fields,
			type : 'bootstrap-select',
			multiple : false
		}, {
			name : 'min_p-value_for_enrichment',
			type : 'text',
			value : '0.05'
		}, {
			name : 'minimum_number_of_total_members_in_group',
			type : 'text',
			value : '5'
		}, {
			name : 'minimum_number_of_members_in_group',
			type : 'text',
			value : '3'
		} ];
	},
	execute : function(options) {
		var project = options.project;
		var controller = options.controller;
		var pValue = options.input['min_p-value_for_enrichment'];
		var minTotalGroupSize = options.input.minimum_number_of_total_members_in_group;
		var minGroupSize = options.input.minimum_number_of_members_in_group;
		var dataset = project.getSortedFilteredDataset();
		var dendrogram = this.isColumns ? controller.columnDendrogram
				: controller.rowDendrogram;
		var vector = this.isColumns ? dataset.getColumnMetadata().getByName(
				options.input.field) : dataset.getRowMetadata().getByName(
				options.input.field);

		var valueToIndices = morpheus.VectorUtil
				.createValueToIndicesMap(vector);
		var valueToGlobalCount = new morpheus.Map();
		var values = [];
		valueToIndices.forEach(function(indices, value) {
			valueToGlobalCount.set(value, indices.length);
			values.push(value);
		});
		var nvalues = values.length;
		var N = vector.size();

		morpheus.AbstractDendrogram.dfs(dendrogram.tree.rootNode,
				function(node) {
					delete node.info;
					var valueToCount = new morpheus.Map();
					for (var i = 0; i < nvalues; i++) {
						valueToCount.set(values[i], 0);
					}
					var min = node.minIndex;
					var max = node.maxIndex;
					var n = max - min + 1;
					if (n > 1 && n >= minTotalGroupSize) {
						for (var i = min; i <= max; i++) {
							var value = vector.getValue(i);
							valueToCount
									.set(value, valueToCount.get(value) + 1);
						}
						for (var i = 0; i < nvalues; i++) {
							var K = valueToGlobalCount.get(values[i]);
							var k = valueToCount.get(values[i]);
							if (k >= minGroupSize) {
								var a = k;
								var b = K - k;
								var c = n - k;
								var d = N + k - n - K;
								var p = morpheus.FisherExact.fisherTest(a, b,
										c, d);
								if (p <= pValue) {
									if (!node.info) {
										node.info = {};
									}
									node.info[values[i]] = p;

								}
							}
						}
					}
					return true;
				});
		dendrogram.setInvalid(true);
		dendrogram.repaint();
	}
};
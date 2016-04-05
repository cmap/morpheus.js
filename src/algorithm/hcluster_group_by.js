morpheus.HClusterGroupBy = function(dataset, groupByFieldNames,
		distanceFunction, linkageMethod) {
	var model = dataset.getRowMetadata();
	var vectors = morpheus.MetadataUtil.getVectors(dataset.getRowMetadata(),
			groupByFieldNames);
	var idToIndices = morpheus.VectorUtil.createValuesToIndicesMap(vectors);
	var reorderedIndices = [];
	var offset = 0;
	var root = {
		id : -1,
		children : [],
		height : 0
	};
	var tree = {
		maxHeight : 0,
		rootNode : root,
		leafNodes : [],
		nLeafNodes : 0
	};
	idToIndices
			.forEach(function(rowIndices, id) {
				var originalIndicesForGroup = idToIndices.get(id);
				var subset = morpheus.DatasetUtil.slicedView(dataset,
						originalIndicesForGroup, null);
				var hcl;
				var distanceMatrix = morpheus.HCluster.computeDistanceMatrix(
						subset, distanceFunction);
				hcl = new morpheus.HCluster(distanceMatrix, linkageMethod);
				var reorderedGroupIndices = hcl.reorderedIndices;
				for (var i = 0, rows = subset.getRowCount(); i < rows; i++) {
					var originalIndex = originalIndicesForGroup[reorderedGroupIndices[i]];
					reorderedIndices.push(originalIndex);
				}

				morpheus.AbstractDendrogram.dfs(hcl.tree.rootNode, function(
						node) {
					node.index += offset;
					node.minIndex += offset;
					node.maxIndex += offset;
					node.id += offset;
					return true;
				});
				if (hcl.tree.leafNodes.length === 0) {
					tree.leafNodes = tree.leafNodes
							.concat([ hcl.tree.rootNode ]);
				} else {
					tree.leafNodes = tree.leafNodes.concat(hcl.tree.leafNodes);

				}

				root.children.push(hcl.tree.rootNode);
				if (!isNaN(hcl.tree.maxHeight)) {
					tree.maxHeight = Math.max(tree.maxHeight,
							hcl.tree.maxHeight);
				}
				offset += subset.getRowCount();
			});
	tree.nLeafNodes = tree.leafNodes.length;
	tree.rootNode.height = tree.maxHeight;
	this.tree = tree;
	this.reorderedIndices = reorderedIndices;
};
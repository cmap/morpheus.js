morpheus.DendrogramUtil = {};
morpheus.DendrogramUtil.setIndices = function (root, counter) {
	counter = counter || 0;
	var setIndex = function (node) {
		var children = node.children;
		var maxIndex = children[0].maxIndex;
		var minIndex = children[0].minIndex;
		var sum = children[0].index;
		for (var i = 1, length = children.length; i < length; i++) {
			var child = children[i];
			sum += child.index;
			minIndex = Math.min(minIndex, child.minIndex);
			maxIndex = Math.max(maxIndex, child.maxIndex);
		}
		node.minIndex = minIndex;
		node.maxIndex = maxIndex;
		node.index = sum / children.length;
		node.children.sort(function (a, b) {
			return (a.index === b.index ? 0 : (a.index < b.index ? -1 : 1));
		});
	};

	var visit = function (node, callback) {
		var children = node.children;
		var n;
		if (children && (n = children.length)) {
			var i = -1;
			while (++i < n) {
				visit(children[i], callback);
			}
		}
		callback(node);
	};
	visit(root, function (n) {
		if (n.children === undefined) {
			n.minIndex = counter;
			n.maxIndex = counter;
			n.index = counter;
			counter++;
		} else {
			setIndex(n);
		}
		return true;
	});
};
morpheus.DendrogramUtil.convertEdgeLengthsToHeights = function (rootNode) {
	var maxHeight = 0;

	function setHeights(node, height) {
		var newHeight = height;
		if (node.length !== undefined) {
			newHeight += node.length;
		}
		node.height = newHeight;
		maxHeight = Math.max(maxHeight, node.height);
		_.each(node.children, function (child) {
			setHeights(child, newHeight);
		});
	}

	setHeights(rootNode, 0);
	var counter = 0;
	morpheus.DendrogramUtil.dfs(rootNode, function (node) {
		node.id = counter;
		counter++;
		node.height = maxHeight - node.height;
		return true;
	});
	return {
		maxHeight: maxHeight,
		n: counter
	};
};
morpheus.DendrogramUtil.parseNewick = function (text) {
	var rootNode = Newick.parse(text);
	var counter = 0;
	var leafNodes = [];

	function visit(node) {
		var children = node.children;
		if (children !== undefined) {
			var left = children[0];
			var right = children[1];
			left.parent = node;
			right.parent = node;
			visit(left);
			visit(right);
		} else { // leaf node
			node.minIndex = counter;
			node.maxIndex = counter;
			node.index = counter;
			leafNodes.push(node);
			counter++;
		}
	}

	visit(rootNode);
	var maxHeight = morpheus.DendrogramUtil
	.convertEdgeLengthsToHeights(rootNode).maxHeight;
	morpheus.DendrogramUtil.setNodeDepths(rootNode);
	morpheus.DendrogramUtil.setIndices(rootNode);
	return {
		maxHeight: rootNode.height,
		rootNode: rootNode,
		leafNodes: leafNodes,
		nLeafNodes: leafNodes.length
	};
};
morpheus.DendrogramUtil.cutAtHeight = function (rootNode, h) {
	var roots = [];
	morpheus.DendrogramUtil.dfs(rootNode, function (node) {
		if (node.height < h) {
			roots.push(node);
			return false;
		}
		return true;
	});
	roots.sort(function (a, b) {
		return (a.index < b.index ? -1 : (a.index == b.index ? 0 : 1));
	});
	return roots;
};
morpheus.DendrogramUtil.getDeepestChild = function (node, isMin) {
	while (true) {
		if (node.children === undefined) {
			return node;
		}
		var index;
		if (isMin) {
			index = node.children[0].index < node.children[node.children.length - 1].index ? 0
				: node.children.length - 1;
		} else {
			index = node.children[0].index > node.children[node.children.length - 1].index ? 0
				: node.children.length - 1;
		}

		node = node.children[index];
	}
};
/**
 * Pre-order depth first traversal 1. Visit the root. 2. Traverse the left
 * subtree. 3. Traverse the right subtree.
 */
morpheus.DendrogramUtil.dfs = function (node, callback, childrenAccessor) {
	if (childrenAccessor === undefined) {
		childrenAccessor = function (n) {
			return n.children;
		};
	}
	if (callback(node)) {
		var children = childrenAccessor(node);
		var n;
		if (children && (n = children.length)) {
			var i = -1;
			while (++i < n) {
				morpheus.DendrogramUtil.dfs(children[i], callback,
					childrenAccessor);
			}
		}
	}
};
morpheus.DendrogramUtil.copyTree = function (tree) {
	var counter = 0;

	function recurse(node) {
		var children = node.children;
		if (children !== undefined) {
			var newChildren = [];
			for (var i = 0, n = children.length; i < n; i++) {
				var copy = $.extend({}, children[i]);
				copy.parent = node;
				newChildren.push(copy);
			}
			node.children = newChildren;
			for (var i = 0, n = newChildren.length; i < n; i++) {
				recurse(newChildren[i]);
			}
		} else {
			node.index = counter;
			node.minIndex = counter;
			node.maxIndex = counter;
			counter++;
		}
	}

	var rootNode = $.extend({}, tree.rootNode);
	rootNode.parent = undefined;
	recurse(rootNode);
	return {
		nLeafNodes: tree.nLeafNodes,
		maxDepth: tree.maxDepth,
		rootNode: rootNode
	};
};
morpheus.DendrogramUtil.collapseAtDepth = function (rootNode, maxDepth) {
	// restore collapsed children
	morpheus.DendrogramUtil.dfs(rootNode, function (d) {
		if (d.collapsedChildren) {
			d.children = d.collapsedChildren;
			d.collapsedChildren = undefined;
		}
		return true;
	});
	// collapse nodes below specified depth
	morpheus.DendrogramUtil.dfs(rootNode, function (d) {
		var depth = d.depth;
		if (depth > maxDepth) {
			d.collapsedChildren = d.children;
			d.children = undefined;
			return false;
		}
		return true;
	});
};
morpheus.DendrogramUtil.setNodeDepths = function (rootNode) {
	var max = 0;

	function recurse(node, depth) {
		var children = node.children;
		node.depth = depth;
		max = Math.max(depth, max);
		if (children !== undefined) {
			var i = -1;
			var j = depth + 1;
			var n = children.length;
			while (++i < n) {
				var d = recurse(children[i], j);
			}
		}
		return node;
	}

	recurse(rootNode, 0);
	return max;
};
morpheus.DendrogramUtil.sortDendrogram = function (root, vectorToSortBy,
												   project, summaryFunction) {
	summaryFunction = summaryFunction || function (array) {
			var min = Number.MAX_VALUE;
			for (var i = 0; i < array.length; i++) {
				// sum += array[i].weight;
				min = Math.min(min, array[i].weight);
			}
			return min;
		};
	var setWeights = function (node) {
		if (node.children !== undefined) {
			var children = node.children;
			for (var i = 0; i < children.length; i++) {
				setWeights(children[i]);
			}
			node.weight = summaryFunction(children);
		} else {
			node.weight = vectorToSortBy.getValue(node.index);
		}
	};
	setWeights(root);
	// sort children by weight
	var nodeIdToModelIndex = {};
	var leafNodes = morpheus.DendrogramUtil.getLeafNodes(root);
	_.each(leafNodes, function (node) {
		nodeIdToModelIndex[node.id] = project
		.convertViewColumnIndexToModel(node.index);
	});
	morpheus.DendrogramUtil.dfs(root, function (node) {
		if (node.children) {
			node.children.sort(function (a, b) {
				return (a.weight === b.weight ? 0 : (a.weight < b.weight ? -1
					: 1));
			});
		}
		return true;
	});
	morpheus.DendrogramUtil.setIndices(root);
	var sortOrder = [];
	_.each(leafNodes, function (node) {
		var oldModelIndex = nodeIdToModelIndex[node.id];
		var newIndex = node.index;
		sortOrder[newIndex] = oldModelIndex;
	});
	return sortOrder;
};
morpheus.DendrogramUtil.leastCommonAncestor = function (leafNodes) {
	function getPathToRoot(node) {
		var path = new morpheus.Map();
		while (node != null) {
			path.set(node.id, node);
			node = node.parent;
		}
		return path;
	}

	var path = getPathToRoot(leafNodes[0]);
	for (var i = 1; i < leafNodes.length; i++) {
		var path2 = getPathToRoot(leafNodes[i]);
		path.forEach(function (node, id) {
			if (!path2.has(id)) {
				path.remove(id);
			}
		});
		// keep only those in path that are also in path2
	}
	var max = -Number.MAX_VALUE;
	var maxNode;
	path.forEach(function (n, id) {
		if (n.depth > max) {
			max = n.depth;
			maxNode = n;
		}
	});
	return maxNode;
};
// morpheus.DendrogramUtil.computePositions = function(rootNode, positions)
// {
// if (rootNode == null) {
// return;
// }
// morpheus.DendrogramUtil._computePositions(rootNode, positions);
// };
// /**
// * position is (left+right)/2
// */
// morpheus.DendrogramUtil._computePositions = function(node, positions) {
// if (node.children !== undefined) {
// var children = node.children;
// var left = children[0];
// var right = children[1];
// morpheus.DendrogramUtil._computePositions(left, positions);
// morpheus.DendrogramUtil._computePositions(right, positions);
// morpheus.DendrogramUtil.setIndex(node);
// node.position = (left.position + right.position) / 2;
// } else {
// node.position = positions.getItemSize(node.index) / 2
// + positions.getPosition(node.index);
// }
// };
morpheus.DendrogramUtil.search = function (rootNode, searchText) {
	var tokens = morpheus.Util.getAutocompleteTokens(searchText);
	var predicates;
	var nmatches = 0;
	if (tokens == null || tokens.length == 0) {
		morpheus.DendrogramUtil.dfs(rootNode, function (node) {
			node.search = false;
			return true;
		});
		nmatches = -1;
	} else {
		predicates = morpheus.Util.createSearchPredicates({
			tokens: tokens
		});
		var npredicates = predicates.length;
		morpheus.DendrogramUtil
		.dfs(
			rootNode,
			function (node) {
				var matches = false;
				if (node.info) {
					searchLabel: for (var name in node.info) {
						var vals = node.info[name];
						if (node.info) {
							for (var p = 0; p < npredicates; p++) {
								var predicate = predicates[p];
								for (var i = 0, nvals = vals.length; i < nvals; i++) {
									if (predicate.accept(vals[i])) {
										matches = true;
										break searchLabel;
									}
								}

							}
						}
					}
				}
				node.search = matches;
				if (matches) {
					nmatches++;
				}
				return true;
			});

	}
	return nmatches;
};
morpheus.DendrogramUtil.squishNonSearchedNodes = function (heatMap,
														   isColumns) {
	if (isColumns) {
		heatMap.getHeatMapElementComponent().getColumnPositions().setSize(13);
	} else {
		heatMap.getHeatMapElementComponent().getRowPositions().setSize(13);
	}
	var expandedLeafNodes = {};
	var dendrogram = isColumns ? heatMap.columnDendrogram
		: heatMap.rowDendrogram;
	morpheus.DendrogramUtil.dfs(dendrogram.tree.rootNode, function (node) {
		for (var i = node.minIndex; i <= node.maxIndex; i++) {
			if (node.search) {
				expandedLeafNodes[i] = true;
			}
		}
		return true;
	});
	var clusterIds = [];
	var previous = expandedLeafNodes[0];
	var squishedIndices = {};
	if (!previous) {
		squishedIndices[0] = true;
	}
	var clusterNumber = 0;
	clusterIds.push(clusterNumber);
	for (var i = 1, nleaves = dendrogram.tree.leafNodes.length; i < nleaves; i++) {
		var expanded = expandedLeafNodes[i];
		if (expanded !== previous) {
			clusterNumber++;
			previous = expanded;
		}
		if (!expanded) {
			squishedIndices[i] = true;
		}
		clusterIds.push(clusterNumber);
	}
	if (isColumns) {
		heatMap.getHeatMapElementComponent().getColumnPositions()
		.setSquishedIndices(squishedIndices);
		heatMap.getProject().setGroupColumns(
			[new morpheus.SpecifiedGroupByKey(clusterIds)], false);
	} else {
		heatMap.getHeatMapElementComponent().getRowPositions()
		.setSquishedIndices(squishedIndices);
		heatMap.getProject().setGroupRows(
			[new morpheus.SpecifiedGroupByKey(clusterIds)], false);
	}
};
morpheus.DendrogramUtil.getLeafNodes = function (rootNode) {
	var leafNodes = [];
	morpheus.DendrogramUtil.dfs(rootNode, function (node) {
		if (node.children === undefined) {
			leafNodes.push(node);
		}
		return true;
	});
	return leafNodes;
};

/*
 * 
 * @param tree An object with maxHeight, rootNode, leafNodes, nLeafNodes. Each node has an id (integer), name (string), children, height, minIndex, maxIndex, parent. Leaf nodes also have an index.
	The root has the largest height, leaves the smallest height.
	
 */
morpheus.AbstractDendrogram = function(controller, tree, positions, project,
		type) {
	morpheus.AbstractCanvas.call(this, true);
	this._overviewHighlightColor = '#d8b365';
	this._searchHighlightColor = '#e41a1c';
	this._selectedNodeColor = type === morpheus.AbstractDendrogram.Type.COLUMN ? '#377eb8'
			: '#984ea3';
	this.tree = tree;
	this.type = type;
	this.squishEnabled = false;
	this.controller = controller;
	this.positions = positions;
	this.project = project;
	var $label = $('<span></span>');
	$label.addClass('label label-info');
	$label.css('position', 'absolute');
	this.$label = $label;
	var $squishedLabel = $('<span></span>');
	$squishedLabel.addClass('label label-default');
	$squishedLabel.css('position', 'absolute').css('top', 18);
	this.$squishedLabel = $squishedLabel;
	this.$label = $label;
	this.cutHeight = this.tree.maxHeight;
	this.drawLeafNodes = true;
	this.lineWidth = 0.7;
	this.selectedNodeIds = {};
	this.selectedRootNodeIdToNode = {};
	this.nodeIdToHighlightedPathsToRoot = {};
	var _this = this;
	this.defaultStroke = 'rgb(0,0,0)';

	var mouseMove = function(event) {
		if (!morpheus.CanvasUtil.dragging) {
			var position = morpheus.CanvasUtil.getMousePosWithScroll(
					event.target, event, _this.lastClip.x, _this.lastClip.y);
			if (_this.isDragHotSpot(position)) { // dendrogram cutter
				_this.canvas.style.cursor = _this.getResizeCursor();
			} else {
				var nodes;
				if (_this.getNodes) {
					nodes = _this.getNodes(position);
				} else {
					var node = _this.getNode(position);
					if (node) {
						nodes = [ node ];
					}
				}
				if (nodes != null) {
					nodes.sort(function(a, b) {
						return a.name < b.name;
					});
					var tipOptions = {
						event : event
					};
					tipOptions[type === morpheus.AbstractDendrogram.Type.COLUMN ? 'columnNodes'
							: 'rowNodes'] = nodes;
					_this.controller.setToolTip(-1, -1, tipOptions);
					_this.canvas.style.cursor = 'pointer';
				} else {
					_this.controller.setToolTip(-1, -1);
					_this.canvas.style.cursor = 'default';
				}
			}
		}
	};
	var mouseExit = function(e) {
		if (!morpheus.CanvasUtil.dragging) {
			_this.canvas.style.cursor = 'default';
		}
	};
	if (type !== morpheus.AbstractDendrogram.Type.RADIAL) {

		$(this.canvas)
				.on(
						'contextmenu',
						function(e) {
							e.preventDefault();
							e.stopPropagation();
							e.stopImmediatePropagation();
							morpheus.Popup
									.showPopup(
											[ {
												name : 'Annotate...'
											}, {
												name : 'Enrichment...'
											}, {
												separator : true
											}, {
												name : 'Squish',
												checked : _this.squishEnabled
											}, {
												separator : true
											}, {
												name : 'Delete'
											} ],
								{
									x : e.pageX,
									y : e.pageY
								},
											e.target,
											function(menuItem, item) {
												if (item === 'Annotate...') {
													morpheus.HeatMap
															.showTool(
																	new morpheus.AnnotateDendrogramTool(
																			type === morpheus.AbstractDendrogram.Type.COLUMN),
																	_this.controller);
												}
												if (item === 'Enrichment...') {
													morpheus.HeatMap
															.showTool(
																	new morpheus.DendrogramEnrichmentTool(
																			type === morpheus.AbstractDendrogram.Type.COLUMN),
																	_this.controller);
												} else if (item === 'Squish') {
													_this.squishEnabled = !_this.squishEnabled;
													if (!_this.squishEnabled) {
														_this.positions
																.setSquishedIndices(null);
													}
												} else if (item === 'Delete') {
													_this.resetCutHeight();
													_this.controller
															.setDendrogram(
																	null,
																	type === morpheus.AbstractDendrogram.Type.COLUMN);
												}
											});
							return false;
						});

		$(this.canvas).on('mousemove', _.throttle(mouseMove, 100)).on(
				'mouseout', _.throttle(mouseExit, 100)).on('mouseenter',
				_.throttle(mouseMove, 100));
	}
	var dragStartScaledCutHeight = 0;
	this.cutTreeHotSpot = false;
	if (type !== morpheus.AbstractDendrogram.Type.RADIAL) {
		this.hammer = morpheus.Util
				.hammer(this.canvas, [ 'pan', 'tap' ])
				.on(
						'tap',
						function(event) {
							if (!morpheus.CanvasUtil.dragging) {
								var position = morpheus.CanvasUtil
										.getMousePosWithScroll(event.target,
												event, _this.lastClip.x,
												_this.lastClip.y);
								_this.cutTreeHotSpot = _this
										.isDragHotSpot(position);
								if (_this.cutTreeHotSpot) {
									return;
								}
								var node = _this.getNode(position);
								if (node != null && node.parent === undefined) {
									node = null; // can't select root
								}
								var commandKey = morpheus.Util.IS_MAC ? event.srcEvent.metaKey
										: event.srcEvent.ctrlKey;
								_this.setSelectedNode(node,
										event.srcEvent.shiftKey || commandKey);
							}
						})
				.on('panend', function(event) {
					morpheus.CanvasUtil.dragging = false;
					_this.canvas.style.cursor = 'default';
					_this.cutTreeHotSpot = true;
				})
				.on(
						'panstart',
						function(event) {
							var position = morpheus.CanvasUtil
									.getMousePosWithScroll(event.target, event,
											_this.lastClip.x, _this.lastClip.y,
											true);
							_this.cutTreeHotSpot = _this
									.isDragHotSpot(position);
							if (_this.cutTreeHotSpot) { // make sure start event
								// was on hotspot
								morpheus.CanvasUtil.dragging = true;
								_this.canvas.style.cursor = _this
										.getResizeCursor();
								dragStartScaledCutHeight = _this
										.scale(_this.cutHeight);
							}
						})
				.on(
						'panmove',
						function(event) {
							if (_this.cutTreeHotSpot) {
								var cutHeight;
								if (_this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
									var delta = event.deltaY;
									cutHeight = Math
											.max(
													0,
													Math
															.min(
																	_this.tree.maxHeight,
																	_this.scale
																			.invert(dragStartScaledCutHeight
																					+ delta)));
								} else if (_this.type === morpheus.AbstractDendrogram.Type.ROW) {
									var delta = event.deltaX;
									cutHeight = Math
											.max(
													0,
													Math
															.min(
																	_this.tree.maxHeight,
																	_this.scale
																			.invert(dragStartScaledCutHeight
																					+ delta)));
								} else {
									var point = morpheus.CanvasUtil
											.getMousePos(event.target, event);
									point.x = _this.radius - point.x;
									point.y = _this.radius - point.y;
									var radius = Math.sqrt(point.x * point.x
											+ point.y * point.y);
									if (radius <= 4) {
										cutHeight = _this.tree.maxHeight;
									} else {
										cutHeight = Math.max(0, Math.min(
												_this.tree.maxHeight,
												_this.scale.invert(radius)));
									}
								}
								if (cutHeight >= _this.tree.maxHeight) {
									_this.resetCutHeight();
								} else {
									_this.setCutHeight(cutHeight);
								}
								event.preventDefault();
							}
						});
	}
};
morpheus.AbstractDendrogram.Type = {
	COLUMN : 0,
	ROW : 1,
	RADIAL : 2
};
morpheus.AbstractDendrogram.prototype = {
	setSelectedNode : function(node, add) {
		var _this = this;
		var viewIndices;
		var selectionModel = this.type === morpheus.AbstractDendrogram.Type.COLUMN ? this.project
				.getColumnSelectionModel()
				: this.project.getRowSelectionModel();
		if (node == null) {
			// clear selection
			_this.selectedNodeIds = {};
			_this.selectedRootNodeIdToNode = {};
			viewIndices = new morpheus.Set();
		} else {
			if (add) { // add to selection
				viewIndices = selectionModel.getViewIndices();
			} else {
				viewIndices = new morpheus.Set();
				_this.selectedNodeIds = {};
				_this.selectedRootNodeIdToNode = {};
			}
			if (node != null) {
				if (node.children === undefined) { // leaf node
					var contains = _this.nodeIdToHighlightedPathsToRoot[node.id];
					if (!add) {
						_this.nodeIdToHighlightedPathsToRoot = {};
					}
					if (contains) {
						delete _this.nodeIdToHighlightedPathsToRoot[node.id];
						// toggle
					} else {
						_this.nodeIdToHighlightedPathsToRoot[node.id] = node;
					}
				} else {
					_this.selectedRootNodeIdToNode[node.id] = node;
					morpheus.AbstractDendrogram.dfs(node, function(d) {
						_this.selectedNodeIds[d.id] = true;
						return true;
					});
				}
				for (var i = node.minIndex; i <= node.maxIndex; i++) {
					viewIndices.add(i);
				}
			}
		}
		_this.trigger('nodeSelectionChanged', _this.selectedRootNodeIdToNode);
		selectionModel.setViewIndices(viewIndices, true);
		_this.repaint();
	},
	getPathStroke : function(node) {
		if (this.selectedNodeIds[node.id]) {
			return this._selectedNodeColor;
		}
		// if (node.search) {
		// return this._searchHighlightColor;
		// }
		return this.defaultStroke;
	},
	getNodeFill : function(node) {
		if (this.selectedRootNodeIdToNode[node.id]) {
			return this._selectedNodeColor;
		}
		if (node.search) {
			return this._searchHighlightColor;
		}
		if (node.info !== undefined) {
			return this._overviewHighlightColor;
		}
	},
	resetCutHeight : function() {
		this.positions.setSquishedIndices(null);
		if (this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
			this.project.setGroupColumns([], true);
		} else {
			this.project.setGroupRows([], true);
		}
		this.$label.text('');
		this.$squishedLabel.text('');
		var dataset = this.project.getSortedFilteredDataset();
		var clusterIdVector = this.type === morpheus.AbstractDendrogram.Type.COLUMN ? dataset
				.getColumnMetadata().getByName('dendrogram_cut')
				: dataset.getRowMetadata().getByName('dendrogram_cut');
		if (clusterIdVector) {
			for (var i = 0, size = clusterIdVector.size(); i < size; i++) {
				clusterIdVector.setValue(i, NaN);
			}
		}
	},
	setCutHeight : function(height) {
		this.cutHeight = height;
		var squishedIndices = {};
		var clusterNumber = 0;
		var nsquished = 0;

		var squishEnabled = this.squishEnabled;
		var roots = morpheus.AbstractDendrogram.cutAtHeight(this.tree.rootNode,
				this.cutHeight);
		var dataset = this.project.getSortedFilteredDataset();
		var clusterIdVector = this.type === morpheus.AbstractDendrogram.Type.COLUMN ? dataset
				.getColumnMetadata().add('dendrogram_cut')
				: dataset.getRowMetadata().add('dendrogram_cut');
		for (var i = 0, nroots = roots.length; i < nroots; i++) {
			var root = roots[i];
			var minChild = morpheus.AbstractDendrogram.getDeepestChild(root,
					true);
			var maxChild = morpheus.AbstractDendrogram.getDeepestChild(root,
					false);
			var clusterId;
			if (squishEnabled && minChild.index === maxChild.index) {
				squishedIndices[minChild.index] = true;
				clusterId = -2;
				nsquished++;
			} else {
				clusterNumber++;
				clusterId = clusterNumber;
			}
			for (var j = minChild.index; j <= maxChild.index; j++) {
				clusterIdVector.setValue(j, clusterId);
			}

		}
		this.$label.text((clusterNumber) + ' cluster'
				+ morpheus.Util.s(clusterNumber));
		if (nsquished > 0) {
			this.$squishedLabel.text(nsquished + ' squished');
		} else {
			this.$squishedLabel.text('');
		}
		if (squishEnabled) {
			this.positions.setSquishedIndices(squishedIndices);
		}
		if (this.controller.getTrackIndex(clusterIdVector.getName(),
				this.type === morpheus.AbstractDendrogram.Type.COLUMN) === -1) {
			var settings = {
				discrete : true,
				discreteAutoDetermined : true,
				renderMethod : {}
			};
			settings.renderMethod[morpheus.VectorTrack.RENDER.COLOR] = true;
			this.controller.addTrack(clusterIdVector.getName(),
					this.type === morpheus.AbstractDendrogram.Type.COLUMN,
					settings);
		}

		if (this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
			this.project.setGroupColumns([ new morpheus.SortKey(clusterIdVector
					.getName(), morpheus.SortKey.SortOrder.UNSORTED) ], true);
		} else {
			this.project.setGroupRows([ new morpheus.SortKey(clusterIdVector
					.getName(), morpheus.SortKey.SortOrder.UNSORTED) ], true);
		}
	},
	dispose : function() {
		var $c = $(this.canvas);
		$c
				.off('mousemove.morpheus mouseout.morpheus mouseenter.morpheus contextmenu.morpheus');
		$c.remove();
		this.$label.remove();
		this.$squishedLabel.remove();
		this.hammer.destroy();
		this.canvas = null;
		this.$label = null;
		this.$squishedLabel = null;
		this.hammer = null;
	},
	isCut : function() {
		return this.cutHeight < this.tree.maxHeight;
	},
	getMinIndex : function() {
		return 0;
	},
	getMaxIndex : function() {
		return this.positions.getLength() - 1;
	},
	getNode : function(p) {
		var _this = this;
		if (this.lastNode) {
			var xy = _this.toPix(this.lastNode);
			if (Math.abs(xy[0] - p.x) < 4 && Math.abs(xy[1] - p.y) < 4) {
				return this.lastNode;
			}
		}
		this.lastNode = this._getNode(p);
		return this.lastNode;
	},
	// getNode : function(p) {
	// var x = p.x;
	// var y = p.y;
	// var leafIndex = this.positions.getIndex(x, true);
	// if (leafIndex >= 0 && leafIndex < leafNodeIds.length) {
	// leafid = leafNodeIds[leafIndex];
	// } else {
	// return null;
	// }
	// var n = leafNodes.get(leafid);
	// if (n != null) {
	// while (!n.isRoot()) {
	// var parent = n.getParent();
	// getNodePosition(parent, p);
	// if (Math.abs(p.x - x) < 4 && Math.abs(p.y - y) < 4) {
	// return parent;
	// }
	// n = parent;
	// }
	// }
	// return null;
	// },
	_getNode : function(p) {
		var _this = this;
		// brute force search
		var hit = null;
		try {
			morpheus.AbstractDendrogram.dfs(this.tree.rootNode, function(node) {
				var xy = _this.toPix(node);
				if (Math.abs(xy[0] - p.x) < 4 && Math.abs(xy[1] - p.y) < 4) {
					hit = node;
					throw 'break';
				}
				return hit === null;
			});
		} catch (x) {
		}
		return hit;
	},
	getResizeCursor : function() {
		if (this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
			return 'ns-resize';
		} else if (this.type === morpheus.AbstractDendrogram.Type.ROW) {
			return 'ew-resize';
		}
		return 'nesw-resize';
	},
	isDragHotSpot : function(p) {
		return false;
	},
	preDraw : function(context, clip) {
	},
	postDraw : function(context, clip) {
	},
	prePaint : function(clip, context) {
		this.scale = this.createScale();
		var min = this.getMinIndex(clip);
		var max = this.getMaxIndex(clip);
		if (min !== this.lastMinIndex || max !== this.lastMinIndex) {
			this.lastMinIndex = min;
			this.lastMaxIndex = max;
		}
		this.invalid = true;
	},
	draw : function(clip, context) {
		context.translate(-clip.x, -clip.y);
		context.strokeStyle = 'black';
		context.fillStyle = 'black';
		this.scale = this.createScale();
		var min = this.lastMinIndex;
		var max = this.lastMaxIndex;
		context.lineWidth = this.lineWidth;
		this.preDraw(context, clip);
		context.strokeStyle = this.defaultStroke;
		context.fillStyle = 'rgba(166,206,227,0.5)';
		this.drawDFS(context, this.tree.rootNode, min, max, 0);
		context.strokeStyle = 'black';
		context.fillStyle = 'black';
		this.postDraw(context, clip);
	},
	postPaint : function(clip, context) {
		context.strokeStyle = 'black';
		this.paintMouseOver(clip, context);
		// this.drawHighlightedPathsToRoot(context, this.lastMinIndex,
		// this.lastMaxIndex);
	},
	// drawHighlightedPathsToRoot : function(context, minIndex, maxIndex) {
	// context.lineWidth = 1;
	// context.strokeStyle = 'black';
	// context.textAlign = 'left';
	// var i = 0;
	// for ( var key in this.nodeIdToHighlightedPathsToRoot) {
	// context.fillStyle = '#99d594';
	// context.strokeStyle = context.fillStyle;
	// var node = this.nodeIdToHighlightedPathsToRoot[key];
	// if (node.collapsed) {
	// for (var node = node.parent; node.collapsedChildren != null; node =
	// node.parent) {
	// node = node.parent;
	// }
	// }
	// // var pix = this.toPix(node);
	// // context.globalAlpha = 0.5;
	// // context.beginPath();
	// // context.arc(pix[0], pix[1], 8, Math.PI * 2, false);
	// // context.fill();
	// // context.globalAlpha = 1;
	// for (var root = node; root.parent !== undefined; root = root.parent) {
	// this
	// .drawPathFromNodeToParent(context, root, minIndex,
	// maxIndex);
	// }
	// i++;
	// }
	// },
	getNodeRadius : function(node) {
		// if (this._nodeRadiusScaleField != null) {
		// var vals = node.info[this._nodeRadiusScaleField];
		// if (vals === undefined) {
		// return 4;
		// }
		// // TODO get max or min
		// return this._nodeRadiusScale(vals[0]) * 8;
		// }
		return 4;
	},

	drawNode : function(context, node) {
	},
	drawDFS : function(context, node, minIndex, maxIndex) {
		if (this.type !== morpheus.AbstractDendrogram.Type.RADIAL) {
			if ((node.maxIndex < minIndex) || (node.minIndex > maxIndex)) {
				return;
			}
		}
		var nodeFill = this.getNodeFill(node);
		if (nodeFill !== undefined) {
			context.fillStyle = nodeFill;
			this.drawNode(context, node);
		}
		context.strokeStyle = this.getPathStroke(node);
		var children = node.children;
		if (children !== undefined) {
			this.drawNodePath(context, node, minIndex, maxIndex);
			for (var i = 0, nchildren = children.length; i < nchildren; i++) {
				this.drawDFS(context, children[i], minIndex, maxIndex);
			}

		}
	}
};
morpheus.AbstractDendrogram.setIndices = function(root) {
	var setIndex = function(node) {
		var children = node.children;
		var maxIndex = children[0].maxIndex;
		var minIndex = children[0].minIndex;
		for (var i = 1, length = children.length; i < length; i++) {
			var child = children[i];
			minIndex = Math.min(minIndex, child.minIndex);
			maxIndex = Math.max(maxIndex, child.maxIndex);
		}
		node.maxIndex = maxIndex;
		node.minIndex = minIndex;
	};
	var counter = 0;
	var visit = function(node, callback) {
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
	visit(root, function(n) {
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
morpheus.AbstractDendrogram.convertEdgeLengthsToHeights = function(rootNode) {
	var maxHeight = 0;
	function setHeights(node, height) {
		var newHeight = height;
		if (node.length !== undefined) {
			newHeight += node.length;
		}
		node.height = newHeight;
		maxHeight = Math.max(maxHeight, node.height);
		_.each(node.children, function(child) {
			setHeights(child, newHeight);
		});
	}
	setHeights(rootNode, 0);
	var counter = 0;
	morpheus.AbstractDendrogram.dfs(rootNode, function(node) {
		node.id = counter;
		counter++;
		node.height = maxHeight - node.height;
		return true;
	});
	return {
		maxHeight : maxHeight,
		n : counter
	};
};
morpheus.AbstractDendrogram.parseNewick = function(text) {
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
	var maxHeight = morpheus.AbstractDendrogram
			.convertEdgeLengthsToHeights(rootNode).maxHeight;
	morpheus.AbstractDendrogram.setNodeDepths(rootNode);
	morpheus.AbstractDendrogram.setIndices(rootNode);
	return {
		maxHeight : rootNode.height,
		rootNode : rootNode,
		leafNodes : leafNodes,
		nLeafNodes : leafNodes.length
	};
};
morpheus.AbstractDendrogram.cutAtHeight = function(rootNode, h) {
	var roots = [];
	morpheus.AbstractDendrogram.dfs(rootNode, function(node) {
		if (node.height < h) {
			roots.push(node);
			return false;
		}
		return true;
	});
	roots.sort(function(a, b) {
		return (a.index < b.index ? -1 : (a.index == b.index ? 0 : 1));
	});
	return roots;
};
morpheus.AbstractDendrogram.getDeepestChild = function(node, isMin) {
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
morpheus.AbstractDendrogram.dfs = function(node, callback, childrenAccessor) {
	if (childrenAccessor === undefined) {
		childrenAccessor = function(n) {
			return n.children;
		};
	}
	if (callback(node)) {
		var children = childrenAccessor(node);
		var n;
		if (children && (n = children.length)) {
			var i = -1;
			while (++i < n) {
				morpheus.AbstractDendrogram.dfs(children[i], callback,
						childrenAccessor);
			}
		}
	}
};
morpheus.AbstractDendrogram.copyTree = function(tree) {
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
		nLeafNodes : tree.nLeafNodes,
		maxDepth : tree.maxDepth,
		rootNode : rootNode
	};
};
morpheus.AbstractDendrogram.collapseAtDepth = function(rootNode, maxDepth) {
	// restore collapsed children
	morpheus.AbstractDendrogram.dfs(rootNode, function(d) {
		if (d.collapsedChildren) {
			d.children = d.collapsedChildren;
			d.collapsedChildren = undefined;
		}
		return true;
	});
	// collapse nodes below specified depth
	morpheus.AbstractDendrogram.dfs(rootNode, function(d) {
		var depth = d.depth;
		if (depth > maxDepth) {
			d.collapsedChildren = d.children;
			d.children = undefined;
			return false;
		}
		return true;
	});
};
morpheus.AbstractDendrogram.setNodeDepths = function(rootNode) {
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
morpheus.AbstractDendrogram.sortDendrogram = function(root, vectorToSortBy,
		project, summaryFunction) {
	summaryFunction = summaryFunction || function(array) {
		var min = Number.MAX_VALUE;
		for (var i = 0; i < array.length; i++) {
			// sum += array[i].weight;
			min = Math.min(min, array[i].weight);
		}
		return min;
	};
	var setWeights = function(node) {
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
	var leafNodes = morpheus.AbstractDendrogram.getLeafNodes(root);
	_.each(leafNodes, function(node) {
		nodeIdToModelIndex[node.id] = project
				.convertViewColumnIndexToModel(node.index);
	});
	morpheus.AbstractDendrogram.dfs(root, function(node) {
		if (node.children) {
			node.children.sort(function(a, b) {
				return (a.weight === b.weight ? 0 : (a.weight < b.weight ? -1
						: 1));
			});
		}
		return true;
	});
	morpheus.AbstractDendrogram.setIndices(root);
	var sortOrder = [];
	_.each(leafNodes, function(node) {
		var oldModelIndex = nodeIdToModelIndex[node.id];
		var newIndex = node.index;
		sortOrder[newIndex] = oldModelIndex;
	});
	return sortOrder;
};
morpheus.AbstractDendrogram.leastCommonAncestor = function(leafNodes) {
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
		path.forEach(function(node, id) {
			if (!path2.has(id)) {
				path.remove(id);
			}
		});
		// keep only those in path that are also in path2
	}
	var max = -Number.MAX_VALUE;
	var maxNode;
	path.forEach(function(n, id) {
		if (n.depth > max) {
			max = n.depth;
			maxNode = n;
		}
	});
	return maxNode;
};
// morpheus.AbstractDendrogram.computePositions = function(rootNode, positions)
// {
// if (rootNode == null) {
// return;
// }
// morpheus.AbstractDendrogram._computePositions(rootNode, positions);
// };
// /**
// * position is (left+right)/2
// */
// morpheus.AbstractDendrogram._computePositions = function(node, positions) {
// if (node.children !== undefined) {
// var children = node.children;
// var left = children[0];
// var right = children[1];
// morpheus.AbstractDendrogram._computePositions(left, positions);
// morpheus.AbstractDendrogram._computePositions(right, positions);
// morpheus.AbstractDendrogram.setIndex(node);
// node.position = (left.position + right.position) / 2;
// } else {
// node.position = positions.getItemSize(node.index) / 2
// + positions.getPosition(node.index);
// }
// };
morpheus.AbstractDendrogram.search = function(rootNode, searchText) {
	var tokens = morpheus.Util.getAutocompleteTokens(searchText);
	var clearSearch = false;
	var predicates;
	var nmatches = 0;
	if (tokens == null || tokens.length == 0) {
		clearSearch = true;
		morpheus.AbstractDendrogram.dfs(rootNode, function(node) {
			node.search = false;
			return true;
		});
		nmatches = -1;
	} else {
		predicates = morpheus.Util.createSearchPredicates({
			tokens : tokens
		});
		var npredicates = predicates.length;
		morpheus.AbstractDendrogram
				.dfs(
						rootNode,
						function(node) {
							var matches = false;
							if (node.info) {
								searchLabel: for ( var name in node.info) {
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
morpheus.AbstractDendrogram.squishNonSearchedNodes = function(heatMap,
		isColumns) {
	if (isColumns) {
		heatMap.getHeatMapElementComponent().getColumnPositions().setSize(13);
	} else {
		heatMap.getHeatMapElementComponent().getRowPositions().setSize(13);
	}
	var expandedLeafNodes = {};
	var dendrogram = isColumns ? heatMap.columnDendrogram
			: heatMap.rowDendrogram;
	morpheus.AbstractDendrogram.dfs(dendrogram.tree.rootNode, function(node) {
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
				[ new morpheus.SpecifiedGroupByKey(clusterIds) ], false);
	} else {
		heatMap.getHeatMapElementComponent().getRowPositions()
				.setSquishedIndices(squishedIndices);
		heatMap.getProject().setGroupRows(
				[ new morpheus.SpecifiedGroupByKey(clusterIds) ], false);
	}
};
morpheus.AbstractDendrogram.getLeafNodes = function(rootNode) {
	var leafNodes = [];
	morpheus.AbstractDendrogram.dfs(rootNode, function(node) {
		if (node.children === undefined) {
			leafNodes.push(node);
		}
		return true;
	});
	return leafNodes;
};
morpheus.Util.extend(morpheus.AbstractDendrogram, morpheus.AbstractCanvas);
morpheus.Util.extend(morpheus.AbstractDendrogram, morpheus.Events);

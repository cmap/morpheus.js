morpheus.ColumnDendrogram = function(controller, tree, positions, project) {
	morpheus.AbstractDendrogram.call(this, controller, tree, positions,
			project, morpheus.AbstractDendrogram.Type.COLUMN);
};
morpheus.ColumnDendrogram.prototype = {
	drawNode : function(context, node) {
		var radius = this.getNodeRadius(node);
		var pix = this.toPix(node);
		context.beginPath();
		context.arc(pix[0], pix[1], 4, Math.PI * 2, false);
		context.fill();
	},
	isDragHotSpot : function(p) {
		return Math.abs(this.scale(this.cutHeight) - p.y) <= 2;
	},
	preDraw : function(context, clip) {
		if (context.setLineDash) {
			context.setLineDash([ 5 ]);
		}
		context.strokeStyle = 'black';
		var ny = this.scale(this.cutHeight);
		context.beginPath();
		context.moveTo(clip.x, ny);
		context.lineTo(this.getUnscaledWidth(), ny);
		context.stroke();
		if (context.setLineDash) {
			context.setLineDash([]);
		}
	},
	createScale : function() {
		// root has the largest height, leaves the smallest height
		return d3.scale.linear().domain([ this.tree.maxHeight, 0 ]).range(
				[ 0, this.getUnscaledHeight() ]);
	},
	paintMouseOver : function(clip, context) {
		if (this.project.getHoverColumnIndex() !== -1) {
			morpheus.CanvasUtil.resetTransform(context);
			context.translate(-clip.x, 0);
			this.drawColumnBorder(context, this.positions, this.project
					.getHoverColumnIndex(), this.getUnscaledWidth());
		}
	},
	drawColumnBorder : function(context, positions, index, gridSize) {
		var size = positions.getItemSize(index);
		var pix = positions.getPosition(index);
		// top and bottom lines
		context.beginPath();
		context.moveTo(pix + size, 0);
		context.lineTo(pix + size, gridSize);
		context.stroke();
		context.beginPath();
		context.moveTo(pix, 0);
		context.lineTo(pix, gridSize);
		context.stroke();
	},
	getMaxIndex : function(clip) {
		return morpheus.Positions.getRight(clip, this.positions);
	},
	getMinIndex : function(clip) {
		return morpheus.Positions.getLeft(clip, this.positions);
	},
	getPreferredSize : function(context) {
		return {
			width : Math.ceil(this.positions.getPosition(this.positions
					.getLength() - 1)
					+ this.positions
							.getItemSize(this.positions.getLength() - 1)),
			height : 100
		};
	},
	toPix : function(node) {
		var min = this.positions.getPosition(node.minIndex)
				+ this.positions.getItemSize(node.minIndex) / 2;
		var max = this.positions.getPosition(node.maxIndex)
				+ this.positions.getItemSize(node.maxIndex) / 2;
		return [ (min + max) / 2, this.scale(node.height) ];
	},
	drawPathFromNodeToParent : function(context, node) {
		var pix = this.toPix(node);
		var parentPix = this.toPix(node.parent);
		context.beginPath();
		context.moveTo(pix[0], pix[1]);
		context.lineTo(pix[0], parentPix[1]);
		context.lineTo(parentPix[0], parentPix[1]);
		context.stroke();
	},
	drawNodePath : function(context, node, minIndex, maxIndex) {
		var children = node.children;
		var left = children[0];
		var right = children[1];
		// set up points for poly line
		var ny = this.scale(node.height);
		var rx = this.toPix(right)[0];
		var ry = this.scale(right.height);
		var lx = this.toPix(left)[0];
		var ly = this.scale(left.height);
		var x, y;
		if (!this.drawLeafNodes) {
			var leftIsLeaf = left.children !== undefined;
			var rightIsLeaf = right.children !== undefined;
			if (leftIsLeaf) {
				ly = ny + 4;
			}
			if (rightIsLeaf) {
				ry = ny + 4;
			}
			x = [ rx, rx, lx, lx ];
			y = [ ry, ny, ny, ly ];
		} else {
			x = [ rx, rx, lx, lx ];
			y = [ ry, ny, ny, ly ];
		}
		context.beginPath();
		context.moveTo(x[0], y[0]);
		for (var i = 1, length = x.length; i < length; i++) {
			context.lineTo(x[i], y[i]);
		}
		context.stroke();
	}
};
morpheus.Util.extend(morpheus.ColumnDendrogram, morpheus.AbstractDendrogram);
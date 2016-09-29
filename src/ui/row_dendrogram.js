morpheus.RowDendrogram = function (controller, tree, positions, project) {
	morpheus.AbstractDendrogram.call(this, controller, tree, positions,
		project, morpheus.AbstractDendrogram.Type.ROW);
};
morpheus.RowDendrogram.prototype = {
	drawNode: function (context, node) {
		var radius = this.getNodeRadius(node);
		var pix = this.toPix(node);
		context.beginPath();
		context.arc(pix[0], pix[1], radius, Math.PI * 2, false);
		context.fill();
	},
	isDragHotSpot: function (p) {
		return Math.abs(this.scale(this.cutHeight) - p.x) <= 2;
	},
	drawCutSlider: function (context, clip) {
		if (context.setLineDash) {
			context.setLineDash([5]);
		}
		context.strokeStyle = 'black';
		var nx = this.scale(this.cutHeight);
		context.beginPath();
		context.moveTo(nx, clip.y);
		context.lineTo(nx, this.getUnscaledHeight());
		context.stroke();
		if (context.setLineDash) {
			context.setLineDash([]);
		}
	},
	getPreferredSize: function () {
		return {
			width: 100,
			height: Math.ceil(this.positions.getPosition(this.positions
					.getLength() - 1)
				+ this.positions
				.getItemSize(this.positions.getLength() - 1))
		};
	},
	paintMouseOver: function (clip, context) {
		if (this.project.getHoverRowIndex() !== -1) {
			morpheus.CanvasUtil.resetTransform(context);
			context.translate(0, -clip.y);
			this.drawRowBorder(context, this.positions, this.project
			.getHoverRowIndex(), this.getUnscaledWidth());
		}
	},
	drawRowBorder: function (context, positions, index, gridSize) {
		var size = positions.getItemSize(index);
		var pix = positions.getPosition(index);
		// top and bottom lines
		context.beginPath();
		context.moveTo(0, pix + size);
		context.lineTo(gridSize, pix + size);
		context.stroke();
		context.beginPath();
		context.moveTo(0, pix);
		context.lineTo(gridSize, pix);
		context.stroke();
	},
	createScale: function () {
		return d3.scale.linear().domain([0, this.tree.maxHeight]).range(
			[this.getUnscaledWidth(), 0]);
	},
	getMaxIndex: function (clip) {
		return morpheus.Positions.getBottom(clip, this.positions);
	},
	getMinIndex: function (clip) {
		return morpheus.Positions.getTop(clip, this.positions);
	},
	toPix: function (node) {
		var min = this.positions.getPosition(node.minIndex)
			+ this.positions.getItemSize(node.minIndex) / 2;
		var max = this.positions.getPosition(node.maxIndex)
			+ this.positions.getItemSize(node.maxIndex) / 2;
		return [this.scale(node.height), (min + max) / 2];
	},
	drawPathFromNodeToParent: function (context, node) {
		var pix = this.toPix(node);
		var parentPix = this.toPix(node.parent);
		context.beginPath();
		context.moveTo(pix[0], pix[1]);
		context.lineTo(parentPix[0], pix[1]);
		context.lineTo(parentPix[0], parentPix[1]);
		context.stroke();
	},
	drawNodePath: function (context, node, minIndex, maxIndex) {
		var children = node.children;
		var left = children[0];
		var right = children[1];
		// set up points for poly line
		var ry = this.toPix(right)[1];
		var rx = this.scale(right.height);
		var ly = this.toPix(left)[1];
		var lx = this.scale(left.height);
		var nx = this.scale(node.height);
		var x;
		var y;
		if (!this.drawLeafNodes) {
			var leftIsLeaf = left.children !== undefined;
			var rightIsLeaf = right.children !== undefined;
			if (leftIsLeaf) {
				lx = nx + 4;
			}
			if (rightIsLeaf) {
				rx = nx + 4;
			}
			x = [rx, nx, nx, lx];
			y = [ry, ry, ly, ly];
		} else {
			x = [rx, nx, nx, lx];
			y = [ry, ry, ly, ly];
		}
		context.beginPath();
		context.moveTo(x[0], y[0]);
		for (var i = 1, length = x.length; i < length; i++) {
			context.lineTo(x[i], y[i]);
		}
		context.stroke();
	}
};
morpheus.Util.extend(morpheus.RowDendrogram, morpheus.AbstractDendrogram);

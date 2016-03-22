morpheus.HeatMapElementCanvas = function(project) {
	morpheus.AbstractCanvas.call(this, true);
	this.colorScheme = null;
	this.project = project;
	this.dataset = null;
	var _this = this;
	this.columnPositions = new morpheus.Positions();
	this.rowPositions = new morpheus.Positions();
	this.lastPosition = {
		left : -1,
		right : -1,
		top : -1,
		bottom : -1
	};
	project.getElementSelectionModel().on('selectionChanged', function() {
		_this.repaint();
	});
};
morpheus.HeatMapElementCanvas.GRID_COLOR = 'rgb(128,128,128)';
morpheus.HeatMapElementCanvas.prototype = {
	drawGrid : true,
	getColorScheme : function() {
		return this.colorScheme;
	},
	isDrawGrid : function() {
		return this.drawGrid;
	},
	setDrawGrid : function(drawGrid) {
		this.drawGrid = drawGrid;
	},
	setColorScheme : function(colorScheme) {
		this.colorScheme = colorScheme;
	},
	setDataset : function(dataset) {
		this.dataset = dataset;
		this.columnPositions.setLength(this.dataset.getColumnCount());
		this.rowPositions.setLength(this.dataset.getRowCount());
	},
	getColumnPositions : function() {
		return this.columnPositions;
	},
	getRowPositions : function() {
		return this.rowPositions;
	},
	getPreferredSize : function(context) {
		var w = Math.ceil(this.columnPositions.getPosition(this.columnPositions
				.getLength() - 1)
				+ this.columnPositions.getItemSize(this.columnPositions
						.getLength() - 1));
		var h = Math.ceil(this.rowPositions.getPosition(this.rowPositions
				.getLength() - 1)
				+ this.rowPositions
						.getItemSize(this.rowPositions.getLength() - 1));
		return {
			width : w,
			height : h
		};
	},
	prePaint : function(clip, context) {
		var lastPosition = this.lastPosition;
		var columnPositions = this.columnPositions;
		var rowPositions = this.rowPositions;
		var left = morpheus.Positions.getLeft(clip, columnPositions);
		var right = morpheus.Positions.getRight(clip, columnPositions);
		var top = morpheus.Positions.getTop(clip, rowPositions);
		var bottom = morpheus.Positions.getBottom(clip, rowPositions);
		if (this.invalid || left !== lastPosition.left
				|| right !== lastPosition.right || top !== lastPosition.top
				|| bottom !== lastPosition.bottom) {
			lastPosition.right = right;
			lastPosition.left = left;
			lastPosition.top = top;
			lastPosition.bottom = bottom;
			this.invalid = true;
		}
	},
	postPaint : function(clip, context) {
		// draw mouse over stuff
		morpheus.CanvasUtil.resetTransform(context);
		var project = this.project;
		context.strokeStyle = 'Grey';
		context.lineWidth = 1;
		var rowPositions = this.getRowPositions();
		var columnPositions = this.getColumnPositions();
		if (project.getHoverColumnIndex() >= 0
				|| project.getHoverRowIndex() >= 0) {

			var height = rowPositions
					.getItemSize(project.getHoverColumnIndex());
			var width = columnPositions.getItemSize(project
					.getHoverColumnIndex());
			var y = (project.getHoverRowIndex() === -1 ? rowPositions
					.getPosition(rowPositions.getLength() - 1) : rowPositions
					.getPosition(project.getHoverRowIndex()));
			var x = (project.getHoverColumnIndex() === -1 ? columnPositions
					.getPosition(0) : columnPositions.getPosition(project
					.getHoverColumnIndex()));

			if (project.getHoverColumnIndex() !== -1) {
				context.strokeRect(x - clip.x, 0, width, this
						.getUnscaledHeight());
			}
			if (project.getHoverRowIndex() !== -1) {
				context.strokeRect(0, y - clip.y, this.getUnscaledWidth(),
						height);
			}
			if (project.getHoverColumnIndex() !== -1
					&& project.getHoverRowIndex() !== -1) {
				context.strokeStyle = 'black';
				context.lineWidth = 3;
				context.strokeRect(x - clip.x + 1.5, y - clip.y + 1.5,
						width - 1.5, height - 1.5);
			}
		}
		var left = morpheus.Positions.getLeft(clip, columnPositions);
		var right = morpheus.Positions.getRight(clip, columnPositions);
		var top = morpheus.Positions.getTop(clip, rowPositions);
		var bottom = morpheus.Positions.getBottom(clip, rowPositions);
		context.strokeStyle = 'rgb(182,213,253)';
		context.lineWidth = 3;
		// context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		context.translate(-clip.x, -clip.y);
		var selectedElements = project.getElementSelectionModel()
				.getViewIndices();

		if (selectedElements != null) {
			selectedElements.forEach(function(id) {
				var rowIndex = id.getArray()[0];
				var columnIndex = id.getArray()[1];
				if (rowIndex >= top && rowIndex < bottom && columnIndex >= left
						&& columnIndex < right) {
					var rowSize = rowPositions.getItemSize(rowIndex);
					var py = rowPositions.getPosition(rowIndex);
					var columnSize = columnPositions.getItemSize(columnIndex);
					var px = columnPositions.getPosition(columnIndex);
					context.strokeRect(px + 1.5, py + 1.5, columnSize - 1.5,
							rowSize - 1.5);

				}
			});
		}
		// draw selection stuff
		// selectedRowElements = getSelectedRectangles(heatMapElementRenderer
		// .getProject().getRowSelectionModel().getSelectedViewIndices());
		// selectedColumnElements = getSelectedRectangles(heatMapElementRenderer
		// .getProject().getColumnSelectionModel()
		// .getSelectedViewIndices());
		// if (!(selectedRowElements.size() == 0 &&
		// selectedColumnElements.size() == 0)) {
		// if (selectedRowElements.size() == 0) {
		// selectedRowElements.add(new Point(top, bottom - 1));
		// }
		// if (selectedColumnElements.size() == 0) {
		// selectedColumnElements.add(new Point(left, right - 1));
		// }
		// }
		// var emptySelection = selectedRowElements.size() == 0;
		// emptySelection = emptySelection && selectedColumnElements.size() ==
		// 0;
	},
	setElementDrawCallback : function(elementDrawCallback) {
		this._elementDrawCallback = elementDrawCallback;
	},
	setDrawCallback : function(drawCallback) {
		this.drawCallback = drawCallback;
	},
	draw : function(clip, context) {
		var columnPositions = this.columnPositions;
		var rowPositions = this.rowPositions;
		var left = morpheus.Positions.getLeft(clip, columnPositions);
		var right = morpheus.Positions.getRight(clip, columnPositions);
		var top = morpheus.Positions.getTop(clip, rowPositions);
		var bottom = morpheus.Positions.getBottom(clip, rowPositions);
		var dataset = this.dataset;
		// context.fillStyle = 'LightGrey';
		// context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		context.translate(-clip.x, -clip.y);

		var colorScheme = this.colorScheme;
		var drawGrid = this.drawGrid;
		var elementDrawCallback = this._elementDrawCallback;
		var seriesNameToIndex = {};
		for (var i = 0; i < dataset.getSeriesCount(); i++) {
			seriesNameToIndex[dataset.getName(i)] = i;
		}
		var sizer;
		var sizeBySeriesName;
		var sizeBySeriesIndex;

		var conditions;
		var conditionSeriesIndices;
		context.lineWidth = 0.1;
		for (var row = top; row < bottom; row++) {
			var rowSize = rowPositions.getItemSize(row);
			var py = rowPositions.getPosition(row);
			for (var column = left; column < right; column++) {
				var columnSize = columnPositions.getItemSize(column);
				var px = columnPositions.getPosition(column);
				context.fillStyle = colorScheme.getColor(row, column, dataset
						.getValue(row, column));
				if (column === left) { // check if the color scheme for this
					// row is sizing
					sizer = colorScheme.getSizer();

					sizeBySeriesName = sizer.getSeriesName();
					sizeBySeriesIndex = sizeBySeriesName != null ? seriesNameToIndex[sizeBySeriesName]
							: undefined;
					conditionSeriesIndices = [];
					conditions = colorScheme.getConditions().getConditions();
					for (var ci = 0, nconditions = conditions.length; ci < nconditions; ci++) {
						conditionSeriesIndices
								.push(seriesNameToIndex[conditions[ci].series]);
					}

				}
				var yoffset = 0;
				var cellRowSize = rowSize;
				if (sizeBySeriesIndex !== undefined) {
					var sizeByValue = dataset.getValue(row, column,
							sizeBySeriesIndex);
					if (!isNaN(sizeByValue)) {
						var f = sizer.valueToFraction(sizeByValue);
						var rowDiff = rowSize - rowSize * f;
						yoffset = rowDiff;
						cellRowSize -= rowDiff;
					}
				}
				if (conditions.length > 0) {
					var condition = null;
					for (var ci = 0, nconditions = conditions.length; ci < nconditions; ci++) {
						var cond = conditions[ci];
						var condValue = dataset.getValue(row, column,
								conditionSeriesIndices[ci]);

						if (!isNaN(condValue) && cond.accept(condValue)) {
							condition = cond;
							break;
						}

					}
					if (condition !== null) {
						context.fillRect(px, py + yoffset, columnSize,
								cellRowSize);
						// x and y are at center
						var x = px + cellRowSize / 2;
						var y = py + yoffset + columnSize / 2;
						context.fillStyle = condition.color;
						morpheus.CanvasUtil.drawShape(context, condition.shape,
								x, y, Math.min(columnSize, cellRowSize) / 4);
						context.fill();
					} else {
						context.fillRect(px, py + yoffset, columnSize,
								cellRowSize);
					}
				} else {
					context.fillRect(px, py + yoffset, columnSize, cellRowSize);
				}

				if (elementDrawCallback) {
					elementDrawCallback(context, dataset, row, column, px, py,
							columnSize, rowSize);
				}
			}
		}
		if (drawGrid) {
			context.strokeStyle = morpheus.HeatMapElementCanvas.GRID_COLOR;
			context.lineWidth = 0.1;
			for (var row = top; row < bottom; row++) {
				var rowSize = rowPositions.getItemSize(row);
				var py = rowPositions.getPosition(row);
				for (var column = left; column < right; column++) {
					var columnSize = columnPositions.getItemSize(column);
					var px = columnPositions.getPosition(column);
					var grid = drawGrid && columnSize > 10 && rowSize > 10;
					if (grid) {
						context.strokeRect(px, py, columnSize, rowSize);
					}
				}
			}

		}
		if (this.drawCallback) {
			this.drawCallback({
				context : context,
				dataset : dataset,
				top : top,
				bottom : bottom,
				left : left,
				right : right,
				rowPositions : rowPositions,
				columnPositions : columnPositions,
				project : this.project,
				clip : clip
			});
		}
		context.lineWidth = 1;
		context.translate(clip.x, clip.y);
	}
};
morpheus.Util.extend(morpheus.HeatMapElementCanvas, morpheus.AbstractCanvas);

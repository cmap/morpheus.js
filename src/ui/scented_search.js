/**
 * @param model{morpheus.SelectionModel}
 */
morpheus.ScentedSearch = function(model, positions, isVertical, scrollbar,
		controller) {
	morpheus.AbstractCanvas.call(this, false);
	this.model = model;
	this.positions = positions;
	this.isVertical = isVertical;
	this.scrollbar = scrollbar;
	this.controller = controller;
	this.searchIndices = [];
	scrollbar.decorator = this;
	var _this = this;
	var mouseMove = function(e) {
		var index = _this.getIndex(e);
		_this.mouseMovedIndex = index;
		document.body.style.cursor = index < 0 ? 'default' : 'pointer';
		scrollbar.canvas.style.cursor = index < 0 ? 'default' : 'pointer';
		var tipOptions = {
			event : e
		};
		if (isVertical) {
			controller.setToolTip(index >= 0 ? _this.searchIndices[index] : -1,
					-1, tipOptions);
		} else {
			controller.setToolTip(-1, index >= 0 ? _this.searchIndices[index]
					: -1, tipOptions);
		}

	};
	var mouseExit = function(e) {
		// need to set body cursor b/c mouse can be partially on the scroll bar,
		// but the canvas cursor has no effect
		document.body.style.cursor = 'default';
		scrollbar.canvas.style.cursor = 'default';
	};
	$(scrollbar.canvas).on('mousemove', mouseMove).on('mouseexit', mouseExit);
};

morpheus.ScentedSearch.prototype = {
	mouseMovedIndex : -1,
	getIndex : function(event) {
		var pix = morpheus.CanvasUtil.getMousePos(event.target, event);
		var val = pix[this.isVertical ? 'y' : 'x'];
		return this.getIndexForPix(val);
	},
	getIndexForPix : function(pix) {
		var indices = this.searchIndices;
		if (indices == null) {
			return -1;
		}
		var tolerance = 1.2;
		if (this.mouseMovedIndex > 0) {
			var midVal = this.positions
					.getPosition(indices[this.mouseMovedIndex])
					* scale;
			if (Math.abs(midVal - pix) <= tolerance) {
				return this.mouseMovedIndex;
			}
		}
		var low = 0;
		var scale = this.scale;
		var high = indices.length - 1;

		while (low <= high) {
			var mid = (low + high) >> 1;
			var midVal = this.positions.getPosition(indices[mid]) * scale;
			var cmp = 0;
			if (Math.abs(midVal - pix) <= tolerance) {
				cmp = 0;
			} else if (midVal < pix) {
				cmp = -1; // Neither val is NaN, thisVal is smaller
			} else if (midVal > pix) {
				cmp = 1; // Neither val is NaN, thisVal is larger
			}
			if (cmp < 0)
				low = mid + 1;
			else if (cmp > 0)
				high = mid - 1;
			else
				return mid; // key found
		}
		return -1; // -(low + 1); // key not found.

	},
	tap : function(position) {
		var val = position[this.isVertical ? 'y' : 'x'];
		var index = this.getIndexForPix(val);
		this.scrollbar.canvas.style.cursor = index < 0 ? 'default' : 'pointer';
		if (index >= 0) {
			if (this.isVertical) {
				this.controller.scrollTop(this.positions
						.getPosition(this.searchIndices[index]));
			} else {
				this.controller.scrollLeft(this.positions
						.getPosition(this.searchIndices[index]));
			}
			return true;
		}
		return false;
	},
	update : function() {
		this.searchIndices = this.model.getViewIndices().values().sort(
				function(a, b) {
					return a < b ? -1 : 1;
				});
	},
	draw : function(clip, context) {
		var width = this.scrollbar.getUnscaledWidth();
		var height = this.scrollbar.getUnscaledHeight();
		this.scale = (this.isVertical ? height : width)
				/ (this.positions.getPosition(this.positions.getLength() - 1) + this.positions
						.getItemSize(this.positions.getLength() - 1));
		var innerColor = '#FFDD00';
		var outerColor = '#CCAA00';
		context.strokeStyle = outerColor;
		context.fillStyle = innerColor;
		context.lineWidth = 1;
		this.drawIndices(context, this.searchIndices);
		this.drawHoverIndices(context);
	},

	drawHoverIndices : function(context) {
		var heatmap = this.controller;
		context.fillStyle = 'black';
		if (heatmap.mousePositionOptions
				&& heatmap.mousePositionOptions.name != null) {
			var isColumns = !this.isVertical;
			var track = heatmap.getTrack(heatmap.mousePositionOptions.name,
					isColumns);
			if (track == null) {
				return;
			}
			if (track.settings.highlightMatchingValues) {
				var hoverIndex = isColumns ? heatmap.getProject()
						.getHoverColumnIndex() : heatmap.getProject()
						.getHoverRowIndex();
				if (hoverIndex === -1) {
					return;
				}
				var vector = track.getVector();
				var value = vector.getValue(hoverIndex);
				var valueToModelIndices = track.getFullVector().getProperties()
						.get(morpheus.VectorKeys.VALUE_TO_INDICES);
				if (!valueToModelIndices) {
					var fullVector = track.getFullVector();
					valueToModelIndices = morpheus.VectorUtil
							.createValueToIndicesMap(fullVector);
					fullVector.getProperties().set(
							morpheus.VectorKeys.VALUE_TO_INDICES,
							valueToModelIndices);

				}
				var modelIndices = valueToModelIndices.get(value);
				if (modelIndices == null) {
					console.log('valueToModelIndices error');
					return;
				}
				var scale = this.scale;
				var lineLength = !this.isVertical ? this.scrollbar
						.getUnscaledHeight() : this.scrollbar
						.getUnscaledWidth();
				var isVertical = this.isVertical;
				var positions = this.positions;
				var project = heatmap.getProject();
				for (var i = 0, length = modelIndices.length; i < length; i++) {
					var modelIndex = modelIndices[i];
					var index = isVertical ? project
							.convertModelRowIndexToView(modelIndex) : project
							.convertModelColumnIndexToView(modelIndex);
					if (index === -1) {
						continue;
					}
					var pix = positions.getPosition(index) * scale;
					if (isVertical) {
						context.fillRect(0, pix, lineLength, 2);
					} else {
						context.fillRect(pix, 0, 2, lineLength);

					}
				}
			}

		}
	},
	drawIndices : function(context, highlightedIndices) {
		var scale = this.scale;
		var lineLength = !this.isVertical ? this.scrollbar.getUnscaledHeight()
				: this.scrollbar.getUnscaledWidth();
		var isVertical = this.isVertical;
		var positions = this.positions;
		for (var i = 0, length = highlightedIndices.length; i < length; i++) {
			var index = highlightedIndices[i];
			var pix = positions.getPosition(index) * scale;
			if (isVertical) {
				context.fillRect(0, pix, lineLength, 2);
				context.strokeRect(0, pix, lineLength, 2);

			} else {
				context.fillRect(pix, 0, 2, lineLength);
				context.strokeRect(pix, 0, 2, lineLength);
			}
		}

	}
};
morpheus.Util.extend(morpheus.ScentedSearch, morpheus.AbstractCanvas);
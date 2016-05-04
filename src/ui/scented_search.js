/**
 * @param model{morpheus.SelectionModel}
 */
morpheus.ScentedSearch = function (model, positions, isVertical, scrollbar,
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
	var mouseMove = function (e) {
		var indices = _this.getSearchIndices(e);

		document.body.style.cursor = indices.length === 0 ? 'default' : 'pointer';
		scrollbar.canvas.style.cursor = indices.length === 0 ? 'default' : 'pointer';
		var tipOptions = {
			event: e,
			heatMapLens: indices.length >= 0
		};
		if (isVertical) {
			controller.setToolTip(indices.length >= 0 ? indices : null,
				-1, tipOptions);
		} else {
			controller.setToolTip(-1, indices.length >= 0 ? indices
				: null, tipOptions);
		}

	};
	var mouseExit = function (e) {
		// need to set body cursor b/c mouse can be partially on the scroll bar,
		// but the canvas cursor has no effect
		document.body.style.cursor = 'default';
		scrollbar.canvas.style.cursor = 'default';
		controller.setToolTip(-1, -1, {event: e});
	};
	$(scrollbar.canvas).on('mousemove', mouseMove).on('mouseout', mouseExit);
};

morpheus.ScentedSearch.LINE_HEIGHT = 3.5;
morpheus.ScentedSearch.prototype = {
	mouseMovedIndex: -1,
	getIndex: function (event) {
		var pix = morpheus.CanvasUtil.getMousePos(event.target, event);
		var val = pix[this.isVertical ? 'y' : 'x'];
		return this.getIndexForPix(val);
	},
	getSearchIndices: function (event) {
		var pix = morpheus.CanvasUtil.getMousePos(event.target, event);
		var val = pix[this.isVertical ? 'y' : 'x'];
		return this.getSearchIndicesForPix(val);
	},
	getSearchIndicesForPix: function (pix) {
		var indices = this.searchIndices;
		if (indices == null) {
			return [];
		}
		var scale = this.scale;
		var tolerance = morpheus.ScentedSearch.LINE_HEIGHT;
		var matches = [];
		for (var i = 0, length = indices.length; i < length; i++) {
			var midVal = this.positions.getPosition(indices[i]) * scale;
			if (Math.abs(midVal - pix) <= tolerance) {
				matches.push(indices[i]);
			}
		}
		return matches;
	},
	getIndexForPix: function (pix) {
		var indices = this.searchIndices;
		if (indices == null) {
			return -1;
		}
		var tolerance = morpheus.ScentedSearch.LINE_HEIGHT;
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
	tap: function (position) {
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
	update: function () {
		this.searchIndices = this.model.getViewIndices().values().sort(
			function (a, b) {
				return a < b ? -1 : 1;
			});
	},
	draw: function (clip, context) {
		var width = this.scrollbar.getUnscaledWidth();
		var height = this.scrollbar.getUnscaledHeight();
		var availableLength = ((this.isVertical ? height : width))
			- morpheus.ScentedSearch.LINE_HEIGHT;
		this.scale = availableLength
			/ (this.positions.getPosition(this.positions.getLength() - 1) + this.positions
			.getItemSize(this.positions.getLength() - 1));
		context.strokeStyle = 'rgb(106,137,177)';
		context.fillStyle = 'rgb(182,213,253)';
		context.lineWidth = 1;
		this.drawIndices(context, this.searchIndices);
		this.drawHoverMatchingValues(context);
	},
	drawHoverMatchingValues: function (context) {
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
						context.fillRect(0, pix, lineLength,
							morpheus.ScentedSearch.LINE_HEIGHT);
					} else {
						context.fillRect(pix, 0,
							morpheus.ScentedSearch.LINE_HEIGHT, lineLength);

					}
				}
			}

		}
	},
	drawIndices: function (context, highlightedIndices) {
		var scale = this.scale;
		var lineLength = !this.isVertical ? this.scrollbar.getUnscaledHeight()
			: this.scrollbar.getUnscaledWidth();

		var isVertical = this.isVertical;
		var positions = this.positions;
		for (var i = 0, length = highlightedIndices.length; i < length; i++) {
			var index = highlightedIndices[i];
			var pix = positions.getPosition(index) * scale;
			if (isVertical) {
				context.beginPath();
				context.rect(0, pix, lineLength,
					morpheus.ScentedSearch.LINE_HEIGHT);
				context.fill();
				context.stroke();

			} else {
				context.beginPath();
				context.rect(pix, 0, morpheus.ScentedSearch.LINE_HEIGHT,
					lineLength);
				context.fill();
				context.stroke();
			}
		}

	}
};
morpheus.Util.extend(morpheus.ScentedSearch, morpheus.AbstractCanvas);

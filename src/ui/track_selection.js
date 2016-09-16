morpheus.TrackSelection = function (track, positions, selectionModel, isColumns,
									controller) {
	var canvas = track.canvas;
	var startIndex = -1;
	var coord = isColumns ? 'x' : 'y';

	function getPosition(event, useDelta) {
		if (track.settings.squished) {
			var total = positions.getPosition(positions.getLength() - 1)
				+ positions.getItemSize(positions.getLength() - 1);
			var squishFactor = total
				/ (isColumns ? track.getUnscaledWidth() : track
				.getUnscaledHeight());
			var clientXY = morpheus.CanvasUtil.getClientXY(event, useDelta);
			var p = morpheus.CanvasUtil.getMousePosWithScroll(event.target,
				event, 0, 0, useDelta);
			p[coord] *= squishFactor;
			return p;

		} else {
			return morpheus.CanvasUtil.getMousePosWithScroll(event.target,
				event, controller.scrollLeft(), controller.scrollTop(),
				useDelta);
		}

	}

	this.hammer = morpheus.Util
	.hammer(canvas, ['pan', 'tap', 'longpress'])
	.on('longpress', function (event) {
		event.preventDefault();
		event.srcEvent.stopImmediatePropagation();
		event.srcEvent.stopPropagation();
		controller.setSelectedTrack(track.name, isColumns);
		track.showPopup(event.srcEvent);
	})
	.on(
		'panmove',
		function (event) {
			var position = getPosition(event);
			var endIndex = positions.getIndex(position[coord],
				false);
			var commandKey = morpheus.Util.IS_MAC ? event.srcEvent.metaKey
				: event.srcEvent.ctrlKey;
			var viewIndices = commandKey ? selectionModel
			.getViewIndices() : new morpheus.Set();
			var _startIndex = startIndex;
			if (startIndex > endIndex) {
				var tmp = endIndex;
				endIndex = _startIndex;
				_startIndex = tmp;
			}
			for (var i = _startIndex; i <= endIndex; i++) {
				viewIndices.add(i);
			}
			selectionModel.setViewIndices(viewIndices, true);
			if (!isColumns) {
				var scrollTop = controller.scrollTop();
				var scrollBottom = scrollTop
					+ controller.heatmap.getUnscaledHeight();
				if (position.y > scrollBottom) {
					controller.scrollTop(scrollTop + 8);
				} else if (position.y < scrollTop) {
					controller.scrollTop(scrollTop - 8);
				}
			} else {
				var scrollLeft = controller.scrollLeft();
				var scrollRight = scrollLeft
					+ controller.heatmap.getUnscaledWidth();
				if (position.x > scrollRight) {
					controller.scrollLeft(scrollLeft + 8);
				} else if (position.x < scrollLeft) {
					controller.scrollLeft(scrollLeft - 8);
				}
			}
			event.preventDefault();
			event.srcEvent.stopPropagation();
			event.srcEvent.stopImmediatePropagation();
		})
	.on('panstart', function (event) {
		controller.setSelectedTrack(track.name, isColumns);
		var position = getPosition(event, true);
		startIndex = positions.getIndex(position[coord], false);
	})
	.on(
		'tap doubletap',
		function (event) {
			var position = getPosition(event);
			var index = positions.getIndex(position[coord], false);
			if (event.tapCount > 1) {
				if ((isColumns && !controller.options.columnsSortable)
					|| (!isColumns && !controller.options.rowsSortable)) {
					return;
				}
				// var viewIndices = new morpheus.Set();
				// viewIndices.add(index);
				// selectionModel.setViewIndices(viewIndices,
				// false);
				controller.sortBasedOnSelection(null, isColumns,
					event.srcEvent.shiftKey);
			} else {
				controller.setSelectedTrack(track.name, isColumns);
				var commandKey = morpheus.Util.IS_MAC ? event.srcEvent.metaKey
					: event.srcEvent.ctrlKey;
				if (morpheus.Util.IS_MAC && event.srcEvent.ctrlKey) { // right-click
					// on
					// Mac
					return;
				}
				var viewIndices;
				if (commandKey) { // toggle selection
					viewIndices = selectionModel.getViewIndices();
					if (viewIndices.has(index)) {
						viewIndices.remove(index);
					} else {
						viewIndices.add(index);
					}
				} else if (event.srcEvent.shiftKey) { // add to
					// selection
					viewIndices = selectionModel.getViewIndices();
					var min = Number.MAX_VALUE;
					var max = -Number.MAX_VALUE;
					viewIndices.forEach(function (viewIndex) {
						min = Math.min(viewIndex, min);
						max = Math.max(viewIndex, max);
					});

					if (index >= max) { // select from index to max
						for (var i = max; i <= index; i++) {
							viewIndices.add(i);
						}
					} else {// select from index to min
						for (var i = Math.min(index, min), max = Math
						.max(index, min); i <= max; i++) {
							viewIndices.add(i);
						}
					}
				} else {
					viewIndices = new morpheus.Set();
					viewIndices.add(index);
				}
				selectionModel.setViewIndices(viewIndices, true);
			}
		});
};
morpheus.TrackSelection.prototype = {
	dispose: function () {
		this.hammer.destroy();
	}
};

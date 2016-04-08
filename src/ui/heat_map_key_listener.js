morpheus.HeatMapKeyListener = function(controller) {
	var keydown = function(e) {

		// if ((e.isImmediatePropagationStopped && e
		// .isImmediatePropagationStopped())
		// || (e.isDefaultPrevented && e.isDefaultPrevented())) {
		// return;
		// }

		var tagName = e.target.tagName;
		if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
			return;
		}
		var found = false;
		var commandKey = morpheus.Util.IS_MAC ? e.metaKey : e.ctrlKey;
		var altKey = e.altKey;
		var shiftKey = e.shiftKey;

		if (commandKey && e.which === 65) { // select all
			var active = controller.getActiveComponent();
			if (active !== -1) {
				found = true;
				var selectionModel = active === 0 ? controller.getProject()
						.getRowSelectionModel() : controller.getProject()
						.getColumnSelectionModel();
				var count = active === 0 ? controller.getProject()
						.getSortedFilteredDataset().getRowCount() : controller
						.getProject().getSortedFilteredDataset()
						.getColumnCount();
				var indices = new morpheus.Set();
				for (var i = 0; i < count; i++) {
					indices.add(i);
				}
				selectionModel.setViewIndices(indices, true);
				found = true;
			}
		} else if (e.which === 61 || e.which === 187 || e.which === 107) { // zoom
			// in
			controller.zoom(true);
			found = true;
		} else if (e.which === 173 || e.which === 189 || e.which === 109) { // zoom
			// out
			controller.zoom(false);
			found = true;
		} else if (e.which === 35) { // end
			controller.scrollLeft(controller.heatmap.getPreferredSize().width);
			controller.scrollTop(controller.heatmap.getPreferredSize().height);
			found = true;
		} else if (e.which === 36) { // home
			controller.scrollLeft(0);
			controller.scrollTop(0);
			found = true;
		} else if (e.which === 34) { // page down
			// if (shiftKey) {
			// var pos = controller.scrollLeft();
			// controller.scrollLeft(pos
			// + controller.heatmap.getUnscaledWidth() - 2);
			// } else {
			var pos = controller.scrollTop();
			controller.scrollTop(pos + controller.heatmap.getUnscaledHeight()
					- 2);
			// }
			found = true;
		} else if (e.which === 33) { // page up
			// if (shiftKey) {
			// var pos = controller.scrollLeft();
			// controller.scrollLeft(pos
			// - controller.heatmap.getUnscaledWidth() + 2);
			// } else {
			var pos = controller.scrollTop();
			controller.scrollTop(pos - controller.heatmap.getUnscaledHeight()
					+ 2);
			// }
			found = true;
		} else if (e.which === 38) { // up arrow
			if (commandKey) { // to top
				controller.scrollTop(0);
			} else {
				controller.scrollTop(controller.scrollTop() - 8);
			}
			found = true;
		} else if (e.which === 40) {// down arrow
			if (commandKey) { // to bottom
				controller
						.scrollTop(controller.heatmap.getPreferredSize().height);
			} else {
				controller.scrollTop(controller.scrollTop() + 8);
			}
			found = true;
		} else if (e.which === 37) {// left arrow
			if (commandKey) { // to left
				controller.scrollLeft(0);
			} else {
				controller.scrollLeft(controller.scrollLeft() - 8);
			}
			found = true;
		} else if (e.which === 39) {// right arrow
			if (commandKey) { // to right
				controller
						.scrollLeft(controller.heatmap.getPreferredSize().width);
			} else {
				controller.scrollLeft(controller.scrollLeft() + 8);
			}
			found = true;
		} else if (commandKey) {
			if (e.which === 83) {
				if (shiftKey) {
					morpheus.HeatMap.showTool(new morpheus.SaveDatasetTool(),
							controller);
				} else {
					morpheus.HeatMap.showTool(new morpheus.SaveImageTool(),
							controller);
				}
				found = true;
			} else if (e.which === 79) {
				morpheus.HeatMap.showTool(new morpheus.OpenFileTool(),
						controller);
				found = true;
			} else if (e.which === 70) { // search columns or rows
				controller.getToolbarElement().find(
						e.shiftKey ? '[name=searchColumns]'
								: '[name=searchRows]').focus();
				found = true;
			} else if (e.which === 88) { // ctrl-X
				morpheus.HeatMap.showTool(new morpheus.NewHeatMapTool(),
						controller);
				found = true;
			}
		}
		if (found) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			return false;
		}
	};
	var $keyelement = controller.$content;
	$keyelement.on('keydown', keydown);
	$keyelement.on('dragover.morpheus dragenter.morpheus', function(e) {
		e.preventDefault();
		e.stopPropagation();
	}).on(
			'drop.morpheus',
			function(e) {
				if (e.originalEvent.dataTransfer
						&& e.originalEvent.dataTransfer.files.length) {
					e.preventDefault();
					e.stopPropagation();
					var files = e.originalEvent.dataTransfer.files;
					morpheus.HeatMap.showTool(new morpheus.OpenFileTool({
						file : files[0]
					}), controller);
				}
			});
	$keyelement.on('paste.morpheus',
			function(e) {
				var tagName = e.target.tagName;
				if (tagName == 'INPUT' || tagName == 'SELECT'
						|| tagName == 'TEXTAREA') {
					return;
				}
				var text = e.originalEvent.clipboardData.getData('text/plain');
				if (text != null && text.length > 0) {
					e.preventDefault();
					e.stopPropagation();
					var blob = new Blob([ text ]);
					var url = window.URL.createObjectURL(blob);
					morpheus.HeatMap.showTool(new morpheus.OpenFileTool({
						file : url
					}), controller);
				}
			});
	$keyelement.on('mousewheel', function(e) {
		var scrolly = e.deltaY * e.deltaFactor;
		var scrollx = e.deltaX * e.deltaFactor;
		if (e.altKey) {
			controller.zoom(scrolly > 0, {
				rows : true,
				columns : true
			});
		} else {
			if (scrolly !== 0) {
				controller.scrollTop(controller.scrollTop() - scrolly);
			}
			if (scrollx !== 0) {
				controller.scrollLeft(controller.scrollLeft() - scrollx);
			}
		}
		e.preventDefault();
		e.stopPropagation();
	});
};
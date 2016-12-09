/**
 *
 * @param options.which Array of key codes
 * @param options.shift Whether shift key is required
 * @param options.alt Whether alt key is required
 * @param options.name Shortcut name
 * @param options.description Shortcut description
 * @param options.cb Function callback
 * @constructor
 */
morpheus.KeyboardShortcut = function (options) {

};

morpheus.HeatMapKeyListener = function (controller) {

	var keydown = function (e) {
		var tagName = e.target.tagName;
		var found = false;
		var commandKey = morpheus.Util.IS_MAC ? e.metaKey : e.ctrlKey;
		var altKey = e.altKey;
		var shiftKey = e.shiftKey;
		var isInputField = (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
		if (!isInputField) {
			if (e.which === 61 || e.which === 187 || e.which === 107) { // zoom
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
				if (commandKey) { // to bottom
					controller
					.scrollTop(controller.heatmap.getPreferredSize().height);
				} else {
					var pos = controller.scrollTop();
					controller.scrollTop(pos + controller.heatmap.getUnscaledHeight()
						- 2);
				}
				found = true;
			} else if (e.which === 33) { // page up
				if (commandKey) { // to top
					controller
					.scrollTop(0);
				} else {
					var pos = controller.scrollTop();
					controller.scrollTop(pos - controller.heatmap.getUnscaledHeight()
						+ 2);
				}
				found = true;
			} else if (e.which === 38) { // up arrow
				if (commandKey) { // shrink rows
					controller.zoom(false, {
						columns: false,
						rows: true
					});
				} else {
					controller.scrollTop(controller.scrollTop() - 8);
				}
				found = true;
			} else if (e.which === 40) {// down arrow
				if (commandKey) { // grow rows
					controller.zoom(true, {
						columns: false,
						rows: true
					});
				} else {
					controller.scrollTop(controller.scrollTop() + 8);
				}
				found = true;
			} else if (e.which === 37) {// left arrow
				if (commandKey) { // shrink columns
					controller.zoom(false, {
						columns: true,
						rows: false
					});
				} else {
					controller.scrollLeft(controller.scrollLeft() - 8);
				}
				found = true;
			} else if (e.which === 39) {// right arrow
				if (commandKey) { // grow columns
					controller.zoom(true, {
						columns: true,
						rows: false
					});
				} else {
					controller.scrollLeft(controller.scrollLeft() + 8);
				}
				found = true;
			}
		}
		if (!found && commandKey) {
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
			} else if (e.which === 191) { // slash toggle search
				controller.getToolbar().toggleSearch();
				found = true;
			} else if (e.which === 88 && (!isInputField || window.getSelection().toString() === '')) { // ctrl-X
				morpheus.HeatMap.showTool(new morpheus.NewHeatMapTool(),
					controller);
				found = true;
			} else if (!isInputField && e.which === 65) { // select all
				var active = controller.getActiveComponent();
				if (active === 'rowTrack' || active === 'columnTrack') {
					found = true;
					var selectionModel = active === 'rowTrack' ? controller.getProject()
					.getRowSelectionModel() : controller.getProject()
					.getColumnSelectionModel();
					var count = active === 'rowTrack' ? controller.getProject()
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
			}
		}
		if (found) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			return false;
		}
	};
	var $keyelement = controller.$tabPanel;
	$keyelement.on('keydown', keydown);
	$keyelement.on('dragover.morpheus dragenter.morpheus', function (e) {
		e.preventDefault();
		e.stopPropagation();
	}).on(
		'drop.morpheus',
		function (e) {
			if (e.originalEvent.dataTransfer
				&& e.originalEvent.dataTransfer.files.length) {
				e.preventDefault();
				e.stopPropagation();
				var files = e.originalEvent.dataTransfer.files;
				morpheus.HeatMap.showTool(new morpheus.OpenFileTool({
					file: files[0]
				}), controller);
			}
		});
	$keyelement.on('paste.morpheus',
		function (e) {
			var tagName = e.target.tagName;
			if (tagName == 'INPUT' || tagName == 'SELECT'
				|| tagName == 'TEXTAREA') {
				return;
			}
			var text = e.originalEvent.clipboardData.getData('text/plain');
			if (text != null && text.length > 0) {
				e.preventDefault();
				e.stopPropagation();
				var blob = new Blob([text]);
				var url = window.URL.createObjectURL(blob);
				morpheus.HeatMap.showTool(new morpheus.OpenFileTool({
					file: url
				}), controller);
			}
		});
	$keyelement.on('mousewheel', function (e) {
		var scrolly = e.deltaY * e.deltaFactor;
		var scrollx = e.deltaX * e.deltaFactor;
		if (e.altKey) {
			controller.zoom(scrolly > 0, {
				rows: true,
				columns: true
			});
		} else {
			if (scrolly !== 0) {
				controller.scrollTop(controller.scrollTop() - scrolly);
			}
			if (scrollx !== 0) {
				controller.scrollLeft(controller.scrollLeft() + scrollx);
			}
		}
		e.preventDefault();
		e.stopPropagation();
	});
};

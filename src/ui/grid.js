morpheus.Grid = function(options) {
	this.options = options;
	var _this = this;
	var grid;
	this.items = options.items;
	/**
	 * Maps from model index to view index. Note that not all model indices are
	 * contained in the map because they might have been filtered from the view.
	 */
	this.modelToView = null;
	/** view order in model space */
	this.viewOrder = null;
	function getItemColumnValue(item, column) {
		return column.getter(item);
	}

	var model = {
		getLength : function() {
			return _this.viewOrder != null ? _this.viewOrder.length
					: _this.items.length;
		},
		getItem : function(index) {
			return _this.items[_this.viewOrder != null ? _this.viewOrder[index]
					: index];
		}
	};
	this.$el = options.$el;

	var gridOptions = $.extend({}, {
		select : true,
		headerRowHeight : 0,
		showHeaderRow : false,
		multiColumnSort : true,
		multiSelect : false,
		topPanelHeight : 0,
		enableTextSelectionOnCells : true,
		forceFitColumns : true,
		dataItemColumnValueExtractor : getItemColumnValue,
		defaultFormatter : function(row, cell, value, columnDef, dataContext) {
			if (_.isNumber(value)) {
				return morpheus.Util.nf(value);
			} else if (morpheus.Util.isArray(value)) {
				var s = [];
				for (var i = 0, length = value.length; i < length; i++) {
					if (i > 0) {
						s.push(', ');
					}
					var val = value[i];
					s.push(value[i]);
				}
				return s.join('');
			} else {
				return value;
			}
		}
	}, options.gridOptions || {});

	grid = new Slick.Grid(options.$el, model, options.columns, gridOptions);
	this.grid = grid;
	grid.registerPlugin(new morpheus.AutoTooltips2());

	grid.onCellChange.subscribe(function(e, args) {
		_this.trigger('edit', args);
	});

	if (gridOptions.select) {
		grid.setSelectionModel(new Slick.RowSelectionModel({
			selectActiveRow : true,
			multiSelect : gridOptions.multiSelect
		}));
		grid.getSelectionModel().onSelectedRangesChanged.subscribe(function(e) {
			var nitems = grid.getDataLength();
			_this.trigger('selectionChanged', {
				selectedRows : grid.getSelectedRows().filter(function(row) {
					return row >= 0 && row <= nitems;
				})
			});
		});
	}

	grid.onSort.subscribe(function(e, args) {
		_this.sortCols = args.sortCols;
		_this._updateMappings();
		grid.invalidate();
	});

	options.$el.on('click', function(e) {
		var cell = grid.getCellFromEvent(e);
		if (cell) {
			_this.trigger('click', {
				row : cell.row,
				target : e.target
			});
		}
	});
	options.$el.on('dblclick', function(e) {
		var cell = grid.getCellFromEvent(e);
		if (cell) {
			_this.trigger('dblclick', {
				row : cell.row,
				target : e.target
			});
		}
	});
	if (options.sort) {
		var gridSortColumns = [];
		var gridColumns = grid.getColumns();
		var sortCols = [];
		options.sort.forEach(function(c) {
			var column = null;
			for (var i = 0; i < gridColumns.length; i++) {
				if (gridColumns[i].name === c.name) {
					column = gridColumns[i];
					break;
				}
			}
			if (column != null) {
				sortCols.push({
					sortCol : column,
					sortAsc : c.sortAsc
				});
				gridSortColumns.push({
					columnId : column.id,
					sortAsc : c.sortAsc
				});
			} else {
				console.log(c.name + ' not found.');
			}
		});
		grid.setSortColumns(gridSortColumns);
		this.sortCols = sortCols;
		this._updateMappings();
		grid.invalidate();
	}

	this.grid.invalidate();

};
morpheus.Grid.prototype = {
	columnsAutosized : false,
	setColumns : function(columns) {
		this.grid.setColumns(columns);
		this.grid.resizeCanvas();
		this.grid.invalidate();
	},
	getColumns : function() {
		return this.grid.getColumns();
	},
	getSelectedRows : function() {
		var nitems = this.grid.getDataLength();
		return this.grid.getSelectedRows().filter(function(row) {
			return row >= 0 && row <= nitems;
		});
	},
	getSelectedItems : function() {
		var rows = this.grid.getSelectedRows();
		var selection = [];
		for (var i = 0, nrows = rows.length; i < nrows; i++) {
			selection.push(this.items[this.convertViewIndexToModel(rows[i])]);
		}
		return selection;
	},
	getSelectedItem : function() {
		var rows = this.grid.getSelectedRows();
		if (rows.length === 1) {
			return this.items[this.convertViewIndexToModel(rows[0])];
		}
		return null;
	},
	/**
	 * Gets the sorted, visible items
	 */
	getItems : function() {
		var items = [];
		for (var i = 0, length = this.getFilteredItemCount(); i < length; i++) {
			items.push(this.items[this.convertViewIndexToModel(i)]);
		}
		return items;
	},
	getAllItemCount : function() {
		return this.items.length;
	},
	getAllItems : function() {
		return this.items;
	},
	getFilteredItemCount : function() {
		return this.viewOrder ? this.viewOrder.length : this.items.length;
	},
	redraw : function() {
		this.grid.invalidate();
	},
	redrawRows : function(rows) {
		this.grid.invalidateRows(rows);
		this.grid.render();
	},
	setItems : function(items) {
		// clear the selection
		this.items = items;
		if (this.grid.getSelectionModel()) {
			this.grid.setSelectedRows([]);
		}
		this.setFilter(this.filter);
		if (!this.columnsAutosized) {
			this.autosizeColumns();
		}

	},
	convertModelIndexToView : function(modelIndex) {
		if (this.modelToView !== null) {
			var index = this.modelToView.get(modelIndex);
			return index !== undefined ? index : -1;
		}
		return modelIndex;
	},
	convertViewIndexToModel : function(viewIndex) {
		return this.viewOrder != null ? (viewIndex < this.viewOrder.length
				&& viewIndex >= 0 ? this.viewOrder[viewIndex] : -1) : viewIndex;
	},
	_updateMappings : function() {
		var selectedViewIndices = this.grid.getSelectionModel() != null ? this.grid
				.getSelectedRows()
				: null;
		var selectedModelIndices = [];
		if (selectedViewIndices) {
			for (var i = 0, length = selectedViewIndices.length; i < length; i++) {
				selectedModelIndices.push(this
						.convertViewIndexToModel(selectedViewIndices[i]));
			}
		}
		this.viewOrder = null;
		if (this.filter != null) {
			this.viewOrder = [];
			for (var i = 0, length = this.items.length; i < length; i++) {
				if (this.filter(this.items[i])) {
					this.viewOrder.push(i);
				}
			}
		}

		var cols = this.sortCols;
		if (cols && cols.length > 0) {
			if (this.viewOrder == null) {
				this.viewOrder = [];
				for (var i = 0, length = this.items.length; i < length; i++) {
					this.viewOrder.push(i);
				}
			}
			var ncols = cols.length;
			var items = this.items;
			this.viewOrder.sort(function(index1, index2) {
				for (var i = 0; i < ncols; i++) {
					var getter = cols[i].sortCol.getter;
					var sign = cols[i].sortAsc ? 1 : -1;
					var value1 = getter(items[index1]);
					var value2 = getter(items[index2]);
					var comparator = cols[i].sortCol.comparator;
					var result = comparator(value1, value2) * sign;
					if (result !== 0) {
						return result;
					}
				}
				return 0;
			});
		}
		if (this.viewOrder != null) {
			this.modelToView = new morpheus.Map();
			for (var i = 0, length = this.viewOrder.length; i < length; i++) {
				this.modelToView.set(this.viewOrder[i], i);
			}
		} else {
			this.modelToView = null;
		}
		if (this.grid.getSelectionModel() != null) {
			var newSelectedViewIndices = [];
			for (var i = 0, length = selectedModelIndices.length; i < length; i++) {
				var index = this
						.convertModelIndexToView(selectedModelIndices[i]);
				if (index !== undefined) {
					newSelectedViewIndices.push(index);
				}
			}
			this.grid.setSelectedRows(newSelectedViewIndices);
		}
	},
	setSelectedRows : function(rows) {
		this.grid.setSelectedRows(rows);
	},
	setFilter : function(filter) {
		this.filter = filter;
		this._updateMappings();
		this.grid.invalidate();
		this.trigger('filter');
	},
	getFilter : function() {
		return this.filter;
	},
	autosizeColumns : function() {
		this.columnsAutosized = true;
		var columns = this.grid.getColumns();
		var items = this.getItems();
		if (!columns || columns.length <= 1) {
			return;
		}
		var div = document.createElement('div');
		document.body.appendChild(div);
		var $d = $(div);

		$d.css({
			position : 'absolute',
			left : -1000,
			top : -1000
		});
		var $row = $('<div class="slick-table"><div class="ui-widget-content slick-row"><div class="slick-cell selected"></div></div></div>');
		var $cell = $row.find('.slick-cell');
		$row.appendTo($d);
		var gridWidth = this.options.$el.width();
		var maxWidth = Math.min(parseInt(gridWidth / 2), 400);
		var getColumnWidth = function(column) {
			$cell.html(column.name);
			var w = Math.max($cell.outerWidth(), 4);
			if (column.prototypeValue) {
				$cell.html(column.prototypeValue);
				w = Math.max($cell.outerWidth(), w);
			} else {
				for (var i = 0, nrows = Math.min(items.length, 10); i < nrows; i++) {
					var text = column.formatter(i, null, column
							.getter(items[i]), column, items[i]);
					$cell.html(text);
					w = Math.max($cell.outerWidth(), w);
				}
			}
			column.width = parseInt(Math.min(maxWidth, w));

		};
		var totalWidth = 0;
		for (var i = 0; i < columns.length; i++) {
			getColumnWidth(columns[i]);
			totalWidth += columns[i].width;
		}
		if (totalWidth < gridWidth) {
			// grow columns
			// var delta = parseInt((gridWidth - totalWidth) / columns.length);
			// for (var i = 0; i < columns.length; i++) {
			// //columns[i].width += delta;
			// }

		} else if (totalWidth > gridWidth) {
			// shrink
			columns[columns.length - 1].width -= (totalWidth - gridWidth);
			// shrink last column
		}

		$d.remove();
		this.grid.resizeCanvas();
	}
};

morpheus.Util.extend(morpheus.Grid, morpheus.Events);

/**
 * AutoTooltips2 plugin to show/hide tooltips when columns are too narrow to fit
 * content.
 * 
 * @constructor
 */
morpheus.AutoTooltips2 = function(options) {
	var _grid;
	var _self = this;
	var tip;

	/**
	 * Initialize plugin.
	 */
	function init(grid) {
		_grid = grid;

		$(_grid.getCanvasNode()).on('mouseover', '.slick-row', showToolTip);
		$(_grid.getCanvasNode()).on('mouseout', '.slick-row', hideToolTip);
		$(_grid.getCanvasNode()).on('mouseup', hideAll);

		// $(_grid.getContainerNode()).on('mouseover', '.slick-header-column',
		// showHeaderToolTip);
		// $(_grid.getContainerNode()).on('mouseout', '.slick-header-column',
		// hideHeaderToolTip);

	}

	/**
	 * Destroy plugin.
	 */
	function destroy() {
		$(_grid.getCanvasNode()).off('mouseover', showToolTip);
		$(_grid.getCanvasNode()).off('mouseout', hideToolTip);
		$(_grid.getCanvasNode()).off('mouseup', hideAll);
		// $(_grid.getContainerNode()).off('mouseover', '.slick-header-column',
		// showHeaderToolTip);
		// $(_grid.getContainerNode()).off('mouseout', '.slick-header-column',
		// hideHeaderToolTip);

	}

	/**
	 * Handle mouse entering grid cell to add/remove tooltip.
	 * 
	 * @param {jQuery.Event}
	 *            e - The event
	 */
	function hideToolTip(e) {
		var cell = _grid.getCellFromEvent(e);
		if (cell) {
			var $node = $(_grid.getCellNode(cell.row, cell.cell));
			if ($node.data('bs.tooltip')) {
				$node.tooltip('hide');
			}
		}
	}
	function hideAll() {
		$(_grid.getCanvasNode()).find('[data-original-title]').attr(
				'data-original-title', '').tooltip('hide');

	}

	function hideHeaderToolTip(e) {
		var $node = $(e.target);
		if ($node.data('bs.tooltip')) {
			$node.tooltip('hide');
		}
	}
	function showHeaderToolTip(e) {
		var show = false;
		var $node = $(e.target);

		if (($node[0].scrollWidth > $node[0].offsetWidth)) {
			show = true;
			var $name = $node.find('.slick-column-name');
			if (!$node.data('bs.tooltip')) {
				$node.tooltip({
					placement : 'auto',
					html : true,
					container : 'body',
					trigger : 'manual'
				});
			}
			$node.attr('data-original-title', $name.text());
			if (show) {
				$node.tooltip('show');
			} else {
				$node.tooltip('hide');
			}
		}
	}
	function showToolTip(e) {
		var cell = _grid.getCellFromEvent(e);
		if (cell) {
			var $node = $(_grid.getCellNode(cell.row, cell.cell));
			var text = '';
			var c = _grid.getColumns()[cell.cell];
			var show = false;
			if (c.alwaysShowTooltip
					|| ($node[0].scrollWidth > $node[0].offsetWidth)) {
				var item = _grid.getDataItem(cell.row);
				text = c.tooltip(item, c.getter(item));
				show = true;
			}
			$node.attr('data-original-title', text);
			var hasTip = $node.data('bs.tooltip');
			if (!hasTip) {
				$node.tooltip({
					placement : 'auto',
					html : true,
					container : 'body',
					trigger : 'manual'
				});
			}
			if (show) {
				$node.tooltip('show');
			} else if (hasTip) {
				$node.tooltip('hide');
			}
		}
	}

	/**
	 * Handle mouse entering header cell to add/remove tooltip.
	 * 
	 * @param {jQuery.Event}
	 *            e - The event
	 * @param {object}
	 *            args.column - The column definition
	 */
	function handleHeaderMouseEnter(e, args) {
		var column = args.column, $node = $(e.target).closest(
				'.slick-header-column');
		if (!column.toolTip) {
			$node.attr('title',
					($node.innerWidth() < $node[0].scrollWidth) ? column.name
							: '');
		}
	}

	// Public API
	$.extend(this, {
		'init' : init,
		'destroy' : destroy
	});

};
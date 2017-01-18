/**
 * @param options.$el The jQuery element to render to. Must be in the DOM.
 * @param options.items An array of items to display in the table
 * @param options.search Whether to create a search widget
 * @param options.rowHeader Renderer to call for each row in the table
 * @param options.rowHeight Table row height
 * @param height: Height in pixels of table. '564px',
 * @param options.collapseBreakpoint: 500
 * @param options.showHeader: true
 * @param options.select: true
 * @param options.responsive: true
 * @param options.fixedWidth: Fixed table with when responsive is false. '320px'
 * @param options.columns An array of column descriptors. Each column can have the properties:
 * visible, name, field, renderer
 */



morpheus.Table = function (options) {
	options = morpheus.Table.createOptions(options);
	this.options = options;
	if (!options.width) {
		options.width = options.$el.attr('class');
	}
	var _this = this;

	var height = options.height;
	var $gridDiv = $('<div class="slick-table'
		+ (options.tableClass ? (' ' + options.tableClass) : '')
		+ '" style="width:' + options.fixedWidth + ';height:' + height
		+ '"></div>');

	this.$gridDiv = $gridDiv;
	$gridDiv.appendTo(options.$el);
	// all columns (including those that are currently not visible */
	var columns = options.columns;
	this.columns = columns;
	var visibleColumns = columns.filter(function (c) {
		return c.visible;
	});
	var grid = new morpheus.Grid({
		gridOptions: {
			select: options.select,
			rowHeight: options.rowHeight,
			autoEdit: false,
			editable: false,
			autoHeight: options.height === 'auto',
			enableTextSelectionOnCells: true,
		},
		$el: $gridDiv,
		items: options.items,
		columns: visibleColumns
	});
	this.grid = grid;
	this.searchFunction = null;
	var searchFilter = {
		isEmpty: function () {
			return _this.searchFunction == null;
		},
		init: function () {
		},
		accept: function (item) {
			return _this.searchFunction(item);
		}
	};
	// add empty search filter
	this.grid
	.getFilter().add(searchFilter);
	var $header = $('<div class="slick-table-header"><div name="top"></div><div style="display: inline-block;" name="left" class="pad-bottom-8 pad-top-8"></div><div name="right" class="pull-right pad-bottom-8' +
		' pad-top-8"></div></div>');
	this.$header = $header;
	var $right = $header.find('.pull-right');
	if (options.search) {
		var tableSearch = new morpheus.TableSearchUI({
			$el: $header.find('[name=top]'),
			$right: $right
		});
		tableSearch.setTable(this);
		this.tableSearch = tableSearch;
	}
	if (options.columnPicker && visibleColumns.length !== this.columns.length) {
		var select = [];
		select
		.push('<select data-width="90px" data-selected-text-format="static" title="Columns..." multiple class="pad-left-4 selectpicker show-tick">');
		// sort column names
		var sortedColumns = this.columns.slice().sort(function (a, b) {
			a = a.name.toLowerCase();
			b = b.name.toLowerCase();
			return (a === b ? 0 : (a < b ? -1 : 1));
		});
		sortedColumns.forEach(function (c, i) {
			select.push('<option value="' + i + '"');
			if (c.visible) {
				select.push(' selected');
			}
			select.push('>');
			select.push(c.name);
			select.push('</option>');
		});
		select.push('</select>');
		var $select = $(select.join(''));
		$select.appendTo($right);
		$select.selectpicker({
			iconBase: 'fa',
			tickIcon: 'fa-check',
			style: 'btn-default btn-xs'
		});
		$select.on('change', function () {
			var oldColumns = grid.getColumns().map(function (c) {
				return c.id;
			});
			var selectedColumnIndices = $select.val();
			visibleColumns = [];
			for (var i = 0; i < selectedColumnIndices.length; i++) {
				visibleColumns.push(sortedColumns[parseInt(selectedColumnIndices[i])]);
			}
			var newColumns = visibleColumns.map(function (c) {
				return c.id;
			});

			grid.setColumns(visibleColumns);

			if (newColumns.length > oldColumns.length) {
				var set = new morpheus.Set();
				for (var i = 0; i < newColumns.length; i++) {
					set.add(newColumns[i]);
				}
				for (var i = 0; i < oldColumns.length; i++) {
					set.remove(oldColumns[i]);
				}
				var added = set.values();

				grid.setSortColumns([{
					columnId: added[0],
					sortAsc: true
				}]);
			}
			// if column added, sort by added column
			_this.resize();
			_this.redraw();

		});
	}
	$header.prependTo(options.$el);
	var collapsed = false;
	var lastWidth = -1;
	var resize = function () {
		if (!_this.options.responsive) {
			return;
		}

		var gridWidth = options.$el.width();
		if (gridWidth === lastWidth) {
			return;
		}
		lastWidth = gridWidth;

		$gridDiv.css('width', gridWidth + 'px');
		// if (options.responsiveHeight) {
		// var verticalPosition = _this.$gridDiv[0].getBoundingClientRect().top
		// + window.pageYOffset;
		// $gridDiv.css('height',
		// (document.body.clientHeight - verticalPosition) + 'px');
		// }
		if (!collapsed && gridWidth < options.collapseBreakpoint
			&& visibleColumns.length > 1) {
			collapsed = true;
			$gridDiv.addClass('slick-stacked');

			_this.grid.grid.getOptions().rowHeight = (options.collapsedRowHeight ? options.collapsedRowHeight : options.rowHeight)
				* visibleColumns.length;
			// collapse
			_this.grid.grid
			.setColumns([{
				id: 0,
				tooltip: function (item, value) {
					var html = [];
					for (var i = 0; i < visibleColumns.length; i++) {
						var text = visibleColumns[i].tooltip(item, visibleColumns[i]
						.getter(item));
						if (text != null && text !== '') {
							html.push(text);
						}
					}
					return html.join('<br />');
				},
				collapsed: true,
				getter: function (item) {
					return item;
				},
				formatter: function (row, cell, value, columnDef,
									 dataContext) {
					var html = [];
					html
					.push('<div class="slick-table-wrapper"><div class="slick-cell-wrapper">');
					if (options.rowHeader) { // e.g. render checkbox
						html.push(options.rowHeader(dataContext));
						html.push('<div style="height:4px;"></div>');
					}
					for (var i = 0; i < visibleColumns.length; i++) {
						if (i > 0) {
							html.push('<div style="height:4px;"></div>');
						}
						var c = visibleColumns[i];
						html.push(c.name);
						html.push(':');
						var s = c.renderer(dataContext, c
						.getter(dataContext));
						html.push(s);

					}
					html.push('</div></div>');
					return html.join('');
				},
				sortable: false,
				name: ''
			}]);
			$gridDiv.find('.slick-header').hide();
			_this.grid.grid.resizeCanvas();
			_this.grid.grid.invalidate();

		} else if (collapsed && gridWidth >= options.collapseBreakpoint) {
			$gridDiv.removeClass('slick-stacked');
			collapsed = false;
			if (options.showHeader) {
				$gridDiv.find('.slick-header').show();
			}
			_this.grid.grid.getOptions().rowHeight = options.rowHeight;
			_this.grid.grid.setColumns(visibleColumns);
			_this.grid.grid.resizeCanvas();
			if (options.select) {
				_this.grid.grid.setSelectedRows(_this.grid.grid
				.getSelectedRows());
			}
			_this.grid.grid.invalidate();
		} else {
			_this.grid.grid.resizeCanvas();
			_this.grid.grid.invalidate();
		}
		_this.grid.maybeAutoResizeColumns();

	};
	if (!options.showHeader) {
		$gridDiv.find('.slick-header').hide();
	}
	if (options.responsive) {
		$(window).on('resize orientationchange', resize);
		$gridDiv.on('remove', function () {
			$(window).off('resize', resize);
		});
		resize();
	}
	this.resize = resize;
	if (visibleColumns.length > 1 && options.items != null
		&& options.items.length > 0) {
		this.setItems(options.items);
	}
	if (!$gridDiv.is(':visible')) {
		// find 1st parent that is not visible
		var $parent = $gridDiv;
		var observer = new MutationObserver(function (mutations) {
			if (window.getComputedStyle($parent[0]).display !== 'none') {
				observer.disconnect();
				resize();
			}
		});

		while ($parent.length > 0) {
			if (window.getComputedStyle($parent[0]).display === 'none') {
				break;
			}
			$parent = $parent.parent();

		}

		if ($parent.length > 0) {
			observer.observe($parent[0], {
				attributes: true,
				childList: false,
				characterData: false
			});
		}

	}
}
;

morpheus.Table.defaultRenderer = function (item, value) {
	if (value == null) {
		return '';
	} else if (_.isNumber(value)) {
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
		return '' + value;
	}
};

morpheus.Table.prototype = {
	toText: function () {
		var text = [];
		var items = this.getItems();
		var columns = this.columns.filter(function (c) {
			return c.visible;
		});
		for (var j = 0; j < columns.length; j++) {
			if (j > 0) {
				text.push('\t');
			}
			text.push(columns[j].name);
		}
		text.push('\n');
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			for (var j = 0; j < columns.length; j++) {
				if (j > 0) {
					text.push('\t');
				}
				var value = columns[j].getter(item);
				text.push(morpheus.Util.toString(value));
			}
			text.push('\n');
		}
		return text.join('');
	},
	setHeight: function (height) {
		this.options.height = height;
		if (height === 'auto') {
			this.$gridDiv.css('height', '');
			this.grid.grid.getOptions().autoHeight = true;
			this.grid.grid.setOptions(this.grid.grid.getOptions());

		} else {
			this.$gridDiv.css('height', height);
		}
		this.grid.grid.resizeCanvas();
		if (height === 'auto') {
			var height = this.getItems().length * this.options.rowHeight
				+ this.options.rowHeight;
			this.$gridDiv.find('.slick-viewport').css('height', height + 'px');
		}
		this.grid.grid.invalidate();

	},
	setSearchVisible: function (visible) {
		this.$header.find('[name=search]').css('display', visible ? '' : 'none');
	},
	autocomplete: function (tokens, response) {
		var matches = [];
		var token = tokens != null && tokens.length > 0 ? tokens[tokens.selectionStartIndex]
			: '';
		token = $.trim(token);
		var columns = this.columns.filter(function (c) {
			return (c.searchable && c.visible) || c.alwaysSearch;
		});

		var ncolumns = columns.length;
		var showField = ncolumns > 1;
		if (token === '') {
			if (ncolumns <= 1) {
				return response(matches);
			}
			for (var i = 0; i < ncolumns; i++) {
				var field = columns[i].name;
				matches.push({
					value: field + ':',
					label: '<span style="font-weight:300;">' + field
					+ ':</span>',
					show: true
				});
				// show column names

			}
			matches
			.sort(function (a, b) {
				return (a.value === b.value ? 0
					: (a.value < b.value ? -1 : 1));
			});
			return response(matches);
		}
		var field = null;
		var semi = token.indexOf(':');
		var regex = new RegExp('^' + morpheus.Util.escapeRegex(token), 'i');
		if (semi > 0) { // field search?
			if (token.charCodeAt(semi - 1) !== 92) { // \:
				var possibleField = $.trim(token.substring(0, semi));
				if (possibleField.length > 0 && possibleField[0] === '"'
					&& possibleField[token.length - 1] === '"') {
					possibleField = possibleField.substring(1,
						possibleField.length - 1);
				}
				var columnNameToColumn = new morpheus.Map();
				var columnNames = columns.map(function (c) {
					return c.name;
				});
				for (var i = 0; i < columnNames.length; i++) {
					columnNameToColumn.set(columnNames[i], columns[i]);
				}
				var c = columnNameToColumn.get(possibleField);
				if (c !== undefined) {
					token = $.trim(token.substring(semi + 1));
					columns = [c];
					ncolumns = 1;
				}
			}

		} else if (ncolumns > 1) {
			var regex = new RegExp('^' + morpheus.Util.escapeRegex(token), 'i');
			for (var j = 0; j < ncolumns; j++) {
				var field = columns[j].name;
				if (regex.test(field)) {
					matches.push({
						value: field + ':',
						label: '<span style="font-weight:300;">' + field
						+ ':</span>',
						show: true
					});
				}
			}
		}
		var set = new morpheus.Set();
		var regex = new RegExp('^' + morpheus.Util.escapeRegex(token), 'i');
		var items = this.getItems();
		var dataTypes = [];
		// filter numeric columns
		var filteredColumns = [];
		columns.forEach(function (c) {
			var dataType = null;
			for (var i = 0, nitems = items.length; i < nitems; i++) {
				var value = c.getter(items[i]);
				if (value != null) {
					dataType = morpheus.Util.getDataType(value);
					break;
				}
			}
			if (dataType === 'string' || dataType === '[string]') {
				dataTypes.push(dataType);
				filteredColumns.push(c);
			}
		});
		columns = filteredColumns;
		ncolumns = columns.length;
		var maxSize = matches.length + 10;
		for (var i = 0, nitems = items.length; i < nitems; i++) {
			var item = items[i];
			for (var j = 0; j < ncolumns; j++) {
				var field = columns[j].name;
				var value = columns[j].getter(item);
				var dataType = dataTypes[j];
				if (dataType === '[string]') {
					var nvalues = value == null ? 0 : value.length;
					for (var k = 0; k < nvalues; k++) {
						var val = value[k];
						if (regex.test(val) && !set.has(val)) {
							set.add(val);
							matches
							.push({
								value: showField ? (field + ':' + val)
									: val,
								label: showField ? ('<span style="font-weight:300;">'
									+ field
									+ ':</span>'
									+ '<span style="font-weight:900;">'
									+ val + '</span>')
									: ('<span style="font-weight:900;">'
									+ val + '</span>')
							});
						}
						if (matches.length === maxSize) {
							return response(matches);
						}
					}
				} else {
					if (regex.test(value) && !set.has(value)) {
						set.add(value);
						matches
						.push({
							value: showField ? (field + ':' + value)
								: value,
							label: showField ? ('<span style="font-weight:300;">'
								+ field
								+ ':</span>'
								+ '<span style="font-weight:900;">'
								+ value + '</span>')
								: ('<span style="font-weight:900;">'
								+ value + '</span>')
						});
						if (matches.length === maxSize) {
							return response(matches);
						}
					}
				}

			}
		}
		return response(matches);

	},
	searchWithPredicates: function (predicates) {
		if (predicates == null || predicates.length === 0) {
			this.searchFunction = null;
			this.grid
			.setFilter(this.grid
			.getFilter());
			return;
		}
		var columns = this.columns.filter(function (c) {
			return (c.searchable && c.visible) || c.alwaysSearch;
		});
		var columnNameToColumn = new morpheus.Map();
		var columnNames = columns.map(function (c) {
			return c.name;
		});
		for (var i = 0; i < columnNames.length; i++) {
			columnNameToColumn.set(columnNames[i], columns[i]);
		}

		var filteredPredicates = [];
		var npredicates = predicates.length;
		for (var i = 0; i < npredicates; i++) {
			var predicate = predicates[i];
			var filterColumnName = predicate.getField();
			if (filterColumnName != null) {
				var column = columnNameToColumn.get(filterColumnName);
				if (column) {
					predicate.column = column;
					filteredPredicates.push(predicate);
				}
			} else {
				filteredPredicates.push(predicate);
			}
		}
		predicates = filteredPredicates;
		npredicates = predicates.length;
		var f = function (item) {
			for (var p = 0; p < npredicates; p++) {
				var predicate = predicates[p];
				var searchColumns;
				if (predicate.column) {
					searchColumns = [predicate.column];
				} else {
					searchColumns = columns;
				}
				for (var j = 0, ncolumns = searchColumns.length; j < ncolumns; j++) {
					var value = searchColumns[j].getter(item);
					if (morpheus.Util.isArray(value)) {
						var nvalues = value.length;
						for (var i = 0; i < nvalues; i++) {
							if (predicate.accept(value[i])) {
								return true;
							}
						}
					} else {
						var predicate = predicates[p];
						if (predicate.accept(value)) {
							return true;
						}
					}
				}

			}

			return false;
		};
		this.searchFunction = f;
		this.grid
		.setFilter(this.grid
		.getFilter());
	},
	search: function (text) {
		if (text === '') {
			this.searchFunction = null;
			this.grid
			.setFilter(this.grid
			.getFilter());
		} else {
			var tokens = morpheus.Util.getAutocompleteTokens(text);
			var columns = this.columns.filter(function (c) {
				return (c.searchable && c.visible) || c.alwaysSearch;
			});
			var columnNames = columns.map(function (c) {
				return c.name;
			});
			var predicates = morpheus.Util.createSearchPredicates({
				tokens: tokens,
				fields: columnNames
			});
			this.searchWithPredicates(predicates);
		}
	},
	getSelectedRows: function () {
		return this.grid.getSelectedRows();
	},
	getSelectedItems: function () {
		return this.grid.getSelectedItems();
	},
	getSelectedItem: function () {
		return this.grid.getSelectedItem();
	},
	setSelectedRows: function (rows) {
		this.grid.setSelectedRows(rows);
	},
	getItems: function (items) {
		return this.grid.getItems();
	},
	getAllItemCount: function () {
		return this.grid.getAllItemCount();
	},
	getFilteredItemCount: function () {
		return this.grid.getFilteredItemCount();
	},
	setFilter: function (f) {
		this.grid.setFilter(f);
	},
	getFilter: function () {
		return this.grid.getFilter();
	},
	setItems: function (items) {
		this.grid.setItems(items);
		this.grid.redraw();
		// TODO update height?
	},
	redraw: function () {
		this.grid.redraw();
	},
	/**
	 * @param evtStr
	 *            selectionChanged
	 */
	on: function (evtStr, handler) {
		this.grid.on(evtStr, handler);
		return this;
	},
	off: function (evtStr, handler) {
		this.grid.off(evtStr, handler);
		return this;
	},
	trigger: function (evtStr) {
		this.grid.trigger(evtStr);
	}
};

morpheus.Table.createOptions = function (options) {
	options = $.extend(true, {}, {
		items: [],
		height: '564px',
		collapseBreakpoint: 400,
		showHeader: true,
		select: true,
		rowHeader: null,
		responsive: true,
		fixedWidth: '320px',
		columnPicker: true
	}, options);

	if (!options.columns) {
		options.columns = [{
			name: ''
		}];
	}
	var columns = [];
	options.columns.forEach(function (c, i) {
		var column = $.extend(true, {}, {
			id: i,
			tooltip: function (dataContext, value) {
				return morpheus.Table.defaultRenderer(dataContext, value);
			},
			formatter: function (row, cell, value, columnDef, dataContext) {

				var html = [];
				html.push('<div class="slick-table-wrapper"><div class="slick-cell-wrapper">');
				if (options.rowHeader && cell === 0) {
					html.push(options.rowHeader(dataContext));
				}
				html.push(column.renderer(dataContext, value));
				html.push('</div></div>');
				return html.join('');

			},
			comparator: function (a, b) {
				var aNaN = (a == null || _.isNumber(a) && isNaN(a));
				var bNaN = (b == null || _.isNumber(b) && isNaN(b));
				if (aNaN && bNaN) {
					return 0;
				}
				if (aNaN) {
					return 1;
				}
				if (bNaN) {
					return -1;
				}
				if (a.toLowerCase) {
					a = a.toLowerCase();
				}
				if (b.toLowerCase) {
					b = b.toLowerCase();
				}

				return (a === b ? 0 : (a < b ? -1 : 1));
			},
			sortable: true,
			searchable: true,
			width: null,
			name: c.name,
			renderer: morpheus.Table.defaultRenderer
		}, c);

		if (column.visible === undefined) {
			column.visible = true;
		}
		if (!column.getter) {
			column.getter = column.field == null ? function (item) {
				return item;
			} : function (item) {
				return item[c.field];
			};
		}

		columns.push(column);
	});

	options.columns = columns;
	if (options.columns.length === 1) {
		options.tableClass = 'slick-table-compact';
	} else {
		options.tableClass = 'slick-bordered-table';
	}
	if (!options.rowHeight) {
		// options.rowHeight = options.tableClass === 'slick-table-compact' ? 18
		// 	: 20;
		options.rowHeight = 22;
	}
	return options;
};

morpheus.TableSearchUI = function (options) {
	var _this = this;
	var $search = $('<input name="search" type="text" class="form-control input-sm"' +
		' placeholder="Search" autocomplete="off">');
	$search.appendTo(options.$el);
	this.$search = $search;
	this.$searchResults = $('<span class="pad-top-2 tableview-rowcount" name="search"></span>');
	this.$showAll = $('<div style="display:inline-block;min-width:60px;" name="search" class="pad-left-8 text-button-copy tableview-rowcount">Show' +
		' all</div>');
	this.$searchResults.appendTo(options.$right);
	this.$showAll.appendTo(options.$right);
	this.$showAll.on('click', function (e) {
		e.preventDefault();
		$search.val('');
		_this.table.search('');
		_this.table.trigger('showAll', {table: _this.table});

	});
	$search.on('keyup', _.debounce(function () {
		_this.table.search($.trim($(this).val()));
	}, 100));
	morpheus.Util.autosuggest({
		$el: $search,
		suggestWhenEmpty: true,
		filter: function (tokens, response) {
			_this.table.autocomplete(tokens, response);
		},
		select: function () {
			_this.table.search($.trim($search.val()));
		}
	});
};

morpheus.TableSearchUI.prototype = {
	updateSearchLabel: function () {
		var text = 'Showing: ' + morpheus.Util.intFormat(this.table.getFilteredItemCount()) + ' / ' + morpheus.Util.intFormat(this.table.getAllItemCount());
		this.$searchResults.html(text);
	},
	setTable: function (table) {
		this.table = table;
		var _this = this;

		table.on('filter', function () {
			_this.updateSearchLabel();
		});

	}

};


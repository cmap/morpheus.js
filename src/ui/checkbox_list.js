/**
 * @param {morpheus.Set} [] -
 *            options.set set of selected items
 * @see morpheus.Table
 */
morpheus.CheckBoxList = function(options) {
	var _this = this;
	var set = options.set || new morpheus.Set();
	options = $.extend(true, {}, {
		height : '138px',
		showHeader : false,
		select : false,
		search : true,
		checkBoxSelectionOnTop : false,
		rowHeader : function(item) {
			var header = [];
			// header
			// .push('<div style="overflow: hidden;text-overflow: ellipsis;"
			// class="morpheus-hover">');
			header.push('<span><input name="toggle" type="checkbox" '
					+ (set.has(_this.getter(item)) ? ' checked' : '') + '/> ');
			header.push('</span>');
			// header
			// .push('<button
			// style="background-color:inherit;position:absolute;top:0;right:0;line-height:inherit;padding:0px;margin-top:4px;"
			// class="btn btn-link morpheus-hover-show">only</button>');
			// header.push('</div>');
			return header.join('');
			// return '<span><input name="toggle"
			// type="checkbox" '
			// + (set.has(_this.getter(item)) ? ' checked' : '')
			// + '/> </span>'
		}
	}, options);
	options = morpheus.Table.createOptions(options);
	if (options.columns.length === 1) {
		options.maxWidth = 583;
	}
	var idColumn = options.columns[0];
	for (var i = 0; i < options.columns.length; i++) {
		if (options.columns[i].idColumn) {
			idColumn = options.columns[i];
			break;
		}
	}

	this.getter = idColumn.getter;
	var html = [];

	var table = new morpheus.Table(options);
	this.table = table;
	var html = [];
	html.push('<div style="font-size:12px;">');
	html.push('<div style="display:inline;" class="dropdown">');
	html
			.push('<button type="button" data-toggle="dropdown" class="btn btn-default btn-xs dropdown-toggle" aria-haspopup="true" aria-expanded="false">');
	html.push('<span class="caret"></span>');
	html.push('</button>');
	html.push('<ul style="font-size:12px;" class="dropdown-menu">');
	html.push('<li><a name="selectAll" href="#">All</a></li>');
	html.push('<li><a name="selectNone" href="#">None</a></li>');
	html.push('<li><a name="invertSel" href="#">Invert</a></li>');

	html.push('</ul>');
	html.push('</div>');
	html.push('<span name="checkBoxResults" style="padding-left:6px;"></span>');
	html.push('</div>');
	var $div = $(html.join(''));
	var $checkBoxResults = $div.find('[name=checkBoxResults]');
	table.$gridDiv.before($div);

	var $selectAll = $div.find('[name=selectAll]');
	var $selectNone = $div.find('[name=selectNone]');
	$selectAll.on('click', function(e) {
		var items = table.getItems();
		for (var i = 0, nitems = items.length; i < nitems; i++) {
			set.add(_this.getter(items[i]));
		}
		_this.table.trigger('checkBoxSelectionChanged', {
			source : _this,
			set : set
		});
		e.preventDefault();
		_this.table.redraw();
	});
	$div.find('[name=invertSel]').on('click', function(e) {
		// selected become unselected, unselected become selected
		var items = table.getItems();
		for (var i = 0, nitems = items.length; i < nitems; i++) {
			var val = _this.getter(items[i]);
			if (set.has(val)) {
				set.remove(val);
			} else {
				set.add(val);
			}

		}
		_this.table.trigger('checkBoxSelectionChanged', {
			source : _this,
			set : set
		});
		e.preventDefault();
		_this.table.redraw();
	});
	$selectNone.on('click', function(e) {
		var items = table.getItems();
		for (var i = 0, nitems = items.length; i < nitems; i++) {
			set.remove(_this.getter(items[i]));
		}
		_this.table.trigger('checkBoxSelectionChanged', {
			source : _this,
			set : set
		});

		e.preventDefault();
		_this.table.redraw();
	});

	this.set = set;
	this.table = table;
	$checkBoxResults.html('selected ' + morpheus.Util.intFormat(set.size())
			+ ' of ' + morpheus.Util.intFormat(table.getAllItemCount()));

	var priorCount = 0;
	this.table.on('checkBoxSelectionChanged', function() {
		// if (options.checkBoxSelectionOnTop) {
		// var selectedItems = set.values();
		// selectedItems.sort();
		// for (var i = 0, n = selectedItems.length; i < n; i++) {
		// selectedItems[i].__selected = true;
		// }
		// var previousItems = _this.table.getItems();
		// for (var i = 0, n = previousItems.length; i < n; i++) {
		// var item = previousItems[i];
		// if (!item.__selected) {
		// selectedItems.push(item);
		// }
		// }
		//
		// var $viewport = table.$gridDiv.find('.slick-viewport');
		// var top = $viewport.scrollTop();
		//
		// _this.table.setItems(selectedItems);
		// $viewport.scrollTop(Math.max(0, top
		// + (20 * (set.size() - priorCount))));
		// priorCount = set.size();
		// }
		$checkBoxResults.html('selected ' + morpheus.Util.intFormat(set.size())
				+ ' of ' + morpheus.Util.intFormat(table.getAllItemCount()));
		_this.table.redraw();
	});

	table.on('click',
			function(e) {
				var $target = $(e.target);
				var item = table.getItems()[e.row];
				var value = _this.getter(item);
				if ($target.is('.morpheus-hover-show')) { // only
					set.clear();
					set.add(value);
					_this.table.trigger('checkBoxSelectionChanged', {
						source : _this,
						set : set
					});
				} else if (!options.select
						|| ($target.is('[type=checkbox]') && $target
								.attr('name') === 'toggle')) {
					if (set.has(value)) {
						set.remove(value);
					} else {
						set.add(value);
					}
					_this.table.trigger('checkBoxSelectionChanged', {
						source : _this,
						set : set
					});
				}

			});

};
morpheus.CheckBoxList.prototype = {
	searchWithPredicates : function(predicates) {
		this.table.searchWithPredicates(predicates);
	},
	autocomplete : function(tokens, cb) {
		this.table.autocomplete(tokens, cb);
	},
	setHeight : function(height) {
		this.table.setHeight(height);
	},
	resize : function() {
		this.table.resize();
	},
	setSearchVisible : function(visible) {
		this.table.setSearchVisible(visible);
	},
	getSelectedRows : function() {
		return this.table.getSelectedRows();
	},
	getSelectedItems : function() {
		return this.table.getSelectedItems();
	},
	setSelectedRows : function(rows) {
		this.table.setSelectedRows(rows);
	},
	getItems : function(items) {
		return this.table.getItems();
	},
	getAllItemCount : function() {
		return this.table.getAllItemCount();
	},
	getFilteredItemCount : function() {
		return this.table.getFilteredItemCount();
	},
	setFilter : function(f) {
		this.table.setFilter(f);
	},

	redraw : function() {
		this.table.redraw();
	},
	getSelection : function() {
		return this.set;
	},
	clearSelection : function(values) {
		this.set.clear();
		this.table.redraw();
	},
	setValue : function(values) {
		this.setSelectedValues(values);
	},
	setSelectedValues : function(values) {
		this.set.clear();

		if (morpheus.Util.isArray(values)) {
			for (var i = 0; i < values.length; i++) {
				this.set.add(values[i]);
			}
		} else {
			this.set.add(values);
		}
		this.table.redraw();
	},
	val : function() {
		return this.set.values();
	},
	on : function(evtStr, handler) {
		this.table.on(evtStr, handler);
		return this;
	},
	off : function(evtStr, handler) {
		this.table.off(evtStr, handler);
	},
	setItems : function(items) {
		// remove items in selection that are not in new items
		var newItems = new morpheus.Set();
		var getter = this.getter;
		for (var i = 0; i < items.length; i++) {
			newItems.add(getter(items[i]));

		}
		var selection = this.set;
		selection.forEach(function(val) {
			if (!newItems.has(val)) {
				selection.remove(val);
			}
		});

		// if (this.table.tableSearch) {
		// this.table.tableSearch.$el.css('display',
		// items.length <= 6 ? 'none' : '');
		// }

		this.table.setItems(items);
		this.table.trigger('checkBoxSelectionChanged', {
			source : this,
			set : selection
		});
	}
};

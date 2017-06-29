/**
 * @param {morpheus.Set} [] -
 *            options.set set of selected items
 * @see morpheus.Table
 */
morpheus.CheckBoxList = function (options) {
  var _this = this;
  var set = options.set || new morpheus.Set();
  options = $.extend(true, {}, {
    height: '150px',
    showHeader: false,
    select: false,
    search: true,
    checkBoxSelectionOnTop: false,
    rowHeader: function (item) {
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
  if (options.columns.length === 1) {
    options.$el.find('.slick-table-header').find('[name=right]').remove();
  }
  this.table = table;
  var html = [];

  html.push('<div style="display:inline;">');
  html.push('<div style="display:inline;" class="dropdown">');
  html.push('<button class="btn btn-default btn-xs dropdown-toggle" type="button"' +
    ' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">');
  html.push('<i data-name="checkbox" class="fa fa-square-o"' +
    ' aria-hidden="true"></i>');
  html.push(' <span class="fa fa-caret-down"></span>');
  html.push('</button>');
  html.push('<ul style="font-size:12px;" class="dropdown-menu">');
  html.push('<li><a name="selectAll" href="#">Select All</a></li>');
  html.push('<li><a name="selectNone" href="#">Select None</a></li>');
  html.push('<li><a name="invertSel" href="#">Invert Selection</a></li>');

  html.push('</ul>');
  html.push('</div>');
  html.push('<span data-name="available" style="font-size:12px;padding-left:6px;"></span>');
  html.push('</div>');
  var $checkBoxEl = $(html.join(''));
  table.$header.find('[name=left]').html($checkBoxEl);
  var $selection = $checkBoxEl.find('[data-name=available]');
  var $selectAll = $checkBoxEl.find('[name=selectAll]');
  var $selectNone = $checkBoxEl.find('[name=selectNone]');
  var $cb = $checkBoxEl.find('[data-name=checkbox]');
  var updateLabel = function () {
    var label = [];
    label.push('selected ');
    label.push(morpheus.Util.intFormat(set.size()));
    label.push(' of ');
    label.push(morpheus.Util.intFormat(table.getAllItemCount()));
    if (table.getFilteredItemCount() !== table.getAllItemCount()) {
      label.push(', ');
      label.push(morpheus.Util.intFormat(table.getFilteredItemCount()));
      label.push(table.getFilteredItemCount() === 1 ? ' match' : ' matches');
    }
    $selection.html(label.join(''));

  };
  table.grid.on('filter', function (e) {
    updateLabel();
  });
  $cb.on('click', function (e) {
    if ($cb.hasClass('fa-square-o')) {
      var items = table.getItems(); // select all
      for (var i = 0; i < items.length; i++) {
        set.add(_this.getter(items[i]));
      }
    } else { // select none
      var items = table.getItems();
      for (var i = 0; i < items.length; i++) {
        set.remove(_this.getter(items[i]));
      }
    }
    table.trigger('checkBoxSelectionChanged', {
      source: _this,
      set: set
    });
    e.preventDefault();
    e.stopPropagation();

  });
  $selectAll.on('click', function (e) {
    var items = table.getItems();
    for (var i = 0, nitems = items.length; i < nitems; i++) {
      set.add(_this.getter(items[i]));
    }
    _this.table.trigger('checkBoxSelectionChanged', {
      source: _this,
      set: set
    });
    e.preventDefault();
    _this.table.redraw();
  });
  $checkBoxEl.find('[name=invertSel]').on('click', function (e) {
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
      source: _this,
      set: set
    });
    e.preventDefault();
    _this.table.redraw();
  });
  $selectNone.on('click', function (e) {
    var items = table.getItems();
    for (var i = 0, nitems = items.length; i < nitems; i++) {
      set.remove(_this.getter(items[i]));
    }
    _this.table.trigger('checkBoxSelectionChanged', {
      source: _this,
      set: set
    });

    e.preventDefault();
    _this.table.redraw();
  });

  this.set = set;
  this.table = table;
  updateLabel();

  var priorCount = 0;
  this.table.on('checkBoxSelectionChanged', function () {
    if (set.size() === 0) {
      $cb.attr('class', 'fa fa-square-o');
    } else {
      var items = table.getItems();
      var count = 0;
      var found = false;
      var notFound = false;
      for (var i = 0; i < items.length; i++) {
        if (set.has(_this.getter(items[i]))) {
          count++;
          found = true;
          if (notFound) {
            break;
          }
        } else {
          notFound = true;
          if (found) {
            break;
          }
        }
      }
      if (count === 0) {
        $cb.attr('class', 'fa fa-square-o');
      } else if (count === items.length) {
        $cb.attr('class', 'fa fa-check-square-o');
      } else {
        $cb.attr('class', 'fa fa-minus-square-o');
      }
    }

    updateLabel();

    _this.table.redraw();
  });

  table.on('click',
    function (e) {
      var $target = $(e.target);
      var item = table.getItems()[e.row];
      var value = _this.getter(item);
      if ($target.is('.morpheus-hover-show')) { // only
        set.clear();
        set.add(value);
        _this.table.trigger('checkBoxSelectionChanged', {
          source: _this,
          set: set
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
          source: _this,
          set: set
        });
      }

    });

};
morpheus.CheckBoxList.prototype = {
  searchWithPredicates: function (predicates) {
    this.table.searchWithPredicates(predicates);
  },
  autocomplete: function (tokens, cb) {
    this.table.autocomplete(tokens, cb);
  },
  setHeight: function (height) {
    this.table.setHeight(height);
  },
  resize: function () {
    this.table.resize();
  },
  setSearchVisible: function (visible) {
    this.table.setSearchVisible(visible);
  },
  getSelectedRows: function () {
    return this.table.getSelectedRows();
  },
  getSelectedItems: function () {
    return this.table.getSelectedItems();
  },
  setSelectedRows: function (rows) {
    this.table.setSelectedRows(rows);
  },
  getItems: function (items) {
    return this.table.getItems();
  },
  getAllItemCount: function () {
    return this.table.getAllItemCount();
  },
  getFilteredItemCount: function () {
    return this.table.getFilteredItemCount();
  },
  setFilter: function (f) {
    this.table.setFilter(f);
  },

  redraw: function () {
    this.table.redraw();
  },
  getSelection: function () {
    return this.set;
  },
  clearSelection: function (values) {
    this.set.clear();
    this.table.redraw();
  },
  setValue: function (values) {
    this.setSelectedValues(values);
  },
  setSelectedValues: function (values) {
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
  val: function () {
    return this.set.values();
  },
  on: function (evtStr, handler) {
    this.table.on(evtStr, handler);
    return this;
  },
  off: function (evtStr, handler) {
    this.table.off(evtStr, handler);
  },
  setItems: function (items) {
    // remove items in selection that are not in new items
    var newItems = new morpheus.Set();
    var getter = this.getter;
    for (var i = 0; i < items.length; i++) {
      newItems.add(getter(items[i]));

    }
    var selection = this.set;
    selection.forEach(function (val) {
      if (!newItems.has(val)) {
        selection.remove(val);
      }
    });

    this.table.setItems(items);
    this.table.trigger('checkBoxSelectionChanged', {
      source: this,
      set: selection
    });
  }
};

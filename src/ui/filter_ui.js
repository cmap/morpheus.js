morpheus.FilterUI = function (project, isColumns) {
  var _this = this;
  this.project = project;
  this.isColumns = isColumns;
  var $div = $('<div style="min-width:180px;"></div>');
  this.$div = $div;
  $div.append(this.addBase());
  var $filterMode = $div.find('[name=filterMode]');
  $filterMode.on('change', function (e) {
    var isAndFilter = $filterMode.prop('checked');
    (isColumns ? project.getColumnFilter() : project.getRowFilter())
    .setAnd(isAndFilter);
    isColumns ? _this.project.setColumnFilter(_this.project
      .getColumnFilter(), true) : _this.project.setRowFilter(
        _this.project.getRowFilter(), true);
    e.preventDefault();
  });

  $div.on('click', '[data-name=add]', function (e) {
    var $this = $(this);
    var $row = $this.closest('.morpheus-entry');
    // add after
    var index = $row.index();
    var newFilter = new morpheus.AlwaysTrueFilter();
    (isColumns ? project.getColumnFilter() : project.getRowFilter())
    .insert(index, newFilter);
    $row.after(_this.add(newFilter));
    e.preventDefault();
  });
  $div.on('click', '[data-name=delete]', function (e) {
    var $this = $(this);
    var $row = $this.closest('.morpheus-entry');
    var index = $row.index() - 1;
    (isColumns ? project.getColumnFilter() : project.getRowFilter())
    .remove(index);
    $row.remove();
    isColumns ? _this.project.setColumnFilter(_this.project
      .getColumnFilter(), true) : _this.project.setRowFilter(
        _this.project.getRowFilter(), true);
    e.preventDefault();
  });
  $div.on('submit', 'form', function (e) {
    var $this = $(this);
    e.preventDefault();
  });
  $div.on('change', '[name=by]', function (e) {
    var $this = $(this);
    var fieldName = $this.val();
    var $row = $this.closest('.morpheus-entry');
    var index = $row.index() - 1;
    _this.createFilter({
      fieldName: fieldName,
      $div: $this
    });

    isColumns ? _this.project.setColumnFilter(_this.project
      .getColumnFilter(), true) : _this.project.setRowFilter(
        _this.project.getRowFilter(), true);
  });
  // show initial filters
  var combinedFilter = (isColumns ? project.getColumnFilter() : project
    .getRowFilter());
  var filters = combinedFilter.getFilters ? combinedFilter.getFilters() : [];
  for (var i = 0; i < filters.length; i++) {
    this.createFilter({
      filter: filters[i]
    });
  }
  if (combinedFilter.on) {
    combinedFilter.on('add', function (e) {
      _this.createFilter({
        filter: e.filter
      });
    });
    combinedFilter.on('remove', function (e) {
      // offset of 1 for header
      var $row = $div.find('.morpheus-entry')[1 + e.index].remove();
    });
    combinedFilter.on('and', function (e) {
      $filterMode.prop('checked', e.source.isAnd());
    });

  }
};

morpheus.FilterUI.rangeFilter = function (project, name, isColumns, $ui, filter) {
  $ui.empty();
  var html = [];
  html.push('<label>Range of values</label><br />');
  html
  .push('<label>>= </label> <input style="max-width:200px;" class="form-control input-sm" name="min" type="text" />');
  html
  .push('<label> and <= </label> <input style="max-width:200px;" class="form-control input-sm" name="max" type="text" />');
  html.push('<br /><a data-name="switch" href="#">Switch to top filter</a>');
  var $form = $(html.join(''));
  $form.appendTo($ui);
  $ui.find('[data-name=switch]')
  .on(
    'click',
    function (e) {
      e.preventDefault();
      var newFilter = morpheus.FilterUI.topFilter(project,
        name, isColumns, $ui);
      var index = -1;
      var filters = isColumns ? project.getColumnFilter()
        .getFilters() : project.getRowFilter()
        .getFilters();
      for (var i = 0; i < filters.length; i++) {
        if (filters[i] === filter) {
          index = i;
          break;
        }
      }
      if (index === -1) {
        throw new Error('Filter not found.');
      }
      (isColumns ? project.getColumnFilter() : project
        .getRowFilter()).set(index, newFilter);
      isColumns ? project.setColumnFilter(project
        .getColumnFilter(), true) : project
        .setRowFilter(project.getRowFilter(), true);
    });
  var $min = $ui.find('[name=min]');
  var $max = $ui.find('[name=max]');
  if (!filter) {
    filter = new morpheus.RangeFilter(-Number.MAX_VALUE, Number.MAX_VALUE,
      name, isColumns);
  } else {
    $min.val(filter.min);
    $max.val(filter.max);
  }

  $min.on('keyup', _.debounce(function (e) {
    filter.setMin(parseFloat($.trim($(this).val())));
    isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
      : project.setRowFilter(project.getRowFilter(), true);

  }, 100));
  $max.on('keyup', _.debounce(function (e) {
    filter.setMax(parseFloat($.trim($(this).val())));
    isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
      : project.setRowFilter(project.getRowFilter(), true);

  }, 100));

  return filter;

};
morpheus.FilterUI.topFilter = function (project, name, isColumns, $ui, filter) {
  $ui.empty();
  var html = [];
  html.push('<label>Top</label><br />');
  html
  .push('<select style="width:auto;" class="form-control input-sm" name="direction"><option value="Top">Top</option><option value="Bottom">Bottom</option><option value="TopBottom">Top/Bottom</option></select>');
  html
  .push(' <label>N </label> <input style="max-width:200px;" class="form-control input-sm" name="n" type="text" />');
  html.push('<br /><a data-name="switch" href="#">Switch to range filter</a>');
  var $form = $(html.join(''));
  $form.appendTo($ui);
  var $n = $ui.find('[name=n]');
  var $direction = $ui.find('[name=direction]');
  $ui.find('[data-name=switch]')
  .on(
    'click',
    function (e) {
      e.preventDefault();
      var newFilter = morpheus.FilterUI.rangeFilter(project,
        name, isColumns, $ui);
      var index = -1;
      var filters = isColumns ? project.getColumnFilter()
        .getFilters() : project.getRowFilter()
        .getFilters();
      for (var i = 0; i < filters.length; i++) {
        if (filters[i] === filter) {
          index = i;
          break;
        }
      }
      if (index === -1) {
        throw new Error('Filter not found.');
      }
      (isColumns ? project.getColumnFilter() : project
        .getRowFilter()).set(index, newFilter);
      isColumns ? project.setColumnFilter(project
        .getColumnFilter(), true) : project
        .setRowFilter(project.getRowFilter(), true);
    });
  if (!filter) {
    filter = new morpheus.TopNFilter(NaN, morpheus.TopNFilter.TOP, name, isColumns);
  } else {
    var dirVal;
    if (filter.direction === morpheus.TopNFilter.TOP) {
      dirVal = 'Top';
    } else if (filter.direction === morpheus.TopNFilter.BOTTOM) {
      dirVal = 'Bottom';
    } else {
      dirVal = 'TopBottom';
    }
    $direction.val(dirVal);
    $n.val(filter.n);
  }

  $direction.on('change', function () {
    var dir = $(this).val();
    var dirVal;
    if (dir === 'Top') {
      dirVal = morpheus.TopNFilter.TOP;
    } else if (dir === 'Bottom') {
      dirVal = morpheus.TopNFilter.BOTTOM;
    } else {
      dirVal = morpheus.TopNFilter.TOP_BOTTOM;
    }
    filter.setDirection(dirVal);

    isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
      : project.setRowFilter(project.getRowFilter(), true);
  });
  $n.on('keyup', _.debounce(function (e) {
    filter.setN(parseInt($.trim($(this).val())));
    isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
      : project.setRowFilter(project.getRowFilter(), true);

  }, 100));

  return filter;
};
morpheus.FilterUI.prototype = {
  /**
   *
   * @param options
   *            options.$div div to add filter to or null to add to end
   *            options.filter Pre-existing filter or null to create filter
   *            options.fieldName Field name to filter on
   */
  createFilter: function (options) {
    var index = -1;
    var $div = options.$div;
    var isColumns = this.isColumns;
    var filter = options.filter;
    var project = this.project;
    var fieldName = filter ? filter.name : options.fieldName;
    var $ui;
    if (!$div) {
      // add filter to end
      var $add = $(this.add(filter));
      $add.appendTo(this.$div);
      $ui = $add.find('[data-name=ui]');
    } else { // existing $div
      var $row = $div.closest('.morpheus-entry');
      index = $row.index() - 1;
      $ui = $row.find('[data-name=ui]');
    }

    $ui.empty();
    var vector = (isColumns ? this.project.getFullDataset()
      .getColumnMetadata() : this.project.getFullDataset()
      .getRowMetadata()).getByName(fieldName);

    if (filter instanceof morpheus.RangeFilter) {
      morpheus.FilterUI.rangeFilter(project, fieldName, isColumns, $ui,
        filter);
    } else if (filter instanceof morpheus.TopNFilter) {
      morpheus.FilterUI.topFilter(project, fieldName, isColumns, $ui,
        filter);
    } else if (filter == null && morpheus.VectorUtil.isNumber(vector)
      && morpheus.VectorUtil.containsMoreThanNValues(vector, 9)) {
      filter = morpheus.FilterUI.rangeFilter(project, fieldName,
        isColumns, $ui, filter);
    } else {
      var set = morpheus.VectorUtil.getSet(vector);
      var array = set.values();
      array.sort(morpheus.SortKey.ASCENDING_COMPARATOR);
      if (!filter) {
        filter = new morpheus.VectorFilter(new morpheus.Set(), set
        .size(), fieldName, isColumns);
      } else {
        filter.maxSetSize = array.length;
      }

      var checkBoxList = new morpheus.CheckBoxList({
        responsive: false,
        $el: $ui,
        items: array,
        set: filter.set
      });
      checkBoxList.on('checkBoxSelectionChanged', function () {
        isColumns ? project.setColumnFilter(project.getColumnFilter(),
            true) : project.setRowFilter(project.getRowFilter(),
            true);

      });
    }
    if (index !== -1) {
      // set the filter index
      if (fieldName !== '') {
        (isColumns ? project.getColumnFilter() : project.getRowFilter())
        .set(index, filter);
      } else {
        (isColumns ? project.getColumnFilter() : project.getRowFilter())
        .set(index, new morpheus.AlwaysTrueFilter());
      }
    }
    return filter;
  },

  addBase: function () {
    var html = [];
    html
    .push('<div style="padding-bottom:2px;border-bottom:1px solid #eee" class="morpheus-entry">');
    html.push('<div class="row">');
    html
    .push('<div class="col-xs-12">'
      + '<div class="checkbox"><label><input type="checkbox" name="filterMode">Pass all filters</label></div> '

      + '</div>');
    html.push('</div>');
    html.push('<div class="row">');
    html
    .push('<div class="col-xs-8"><a class="btn btn-default btn-xs" role="button"' +
      ' data-name="add" href="#">Add</a></div>');

    html.push('</div>');
    html.push('</div>');
    return html.join('');
  },
  add: function (filter) {
    var project = this.project;
    var isColumns = this.isColumns;
    var fields = morpheus.MetadataUtil.getMetadataNames(isColumns ? project
      .getFullDataset().getColumnMetadata() : project
      .getFullDataset().getRowMetadata());
    var html = [];
    html.push('<div class="morpheus-entry">');

    html.push('<div class="form-group">');
    html.push('<label>Field</label>');
    // field

    html
    .push('<select style="max-width:160px;overflow-x:hidden;" name="by" class="form-control input-sm">');
    html.push('<option value=""></option>');
    var filterField = filter ? filter.toString() : null;

    _.each(fields, function (field) {
      html.push('<option value="' + field + '"');
      if (field === filterField) {
        html.push(' selected');
      }
      html.push('>');
      html.push(field);
      html.push('</option>');
    });
    html.push('</select>');
    html.push('</div>');
    html.push('<div class="row">');
    // filter ui
    html.push('<div data-name="ui" class="col-xs-12"></div>');
    html.push('</div>');

    // end filter ui

    // add/delete
    html
    .push('<div style="padding-bottom:6px; border-bottom:1px solid #eee" class="row">');

    html.push('<div class="col-xs-11">');

    html
    .push('<a class="btn btn-default btn-xs" role="button" data-name="delete"' +
      ' href="#">Remove</a>');
    html.push('</div>');

    html.push('</div>'); // row
    html.push('</div>'); // morpheus-entry
    return html.join('');
  }
};

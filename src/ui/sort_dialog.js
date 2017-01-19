morpheus.SortDialog = function (project) {
  var _this = this;
  // choose rows or columns
  var $chooserDiv = $('<div class="container-fluid"></div>');
  var $div = $('<div class="container-fluid"></div>');
  var html = [];
  html
  .push('<div style="border-bottom:1px solid LightGrey;margin-bottom:20px;" class="row">');
  html.push('<form class="form-horizontal" role="form">');
  html
  .push('<div class="col-xs-2"><label class="control-label">Sort</label></div>');
  html.push('<div class="col-xs-5">');
  html
  .push('<div class="radio"><label><input type="radio" name="rowsOrColumns" value="rows" checked>Rows</label></div>');
  html
  .push('<div class="radio"><label><input type="radio" name="rowsOrColumns" value="columns">Columns</label></div>');
  html.push('</div>');
  html.push('</form>');
  html.push('</div>');
  $chooserDiv.html(html.join(''));
  function toggle(isColumns) {
    _this.isColumns = isColumns;
    var $element = _this.build(project, isColumns);
    $div.empty().html($element);
    $div.on('click', '[data-name=delete]', function (e) {
      var $this = $(this);
      e.preventDefault();
      $this.closest('div.row').remove();
    });
    $div.on('click', '[data-name=add]', function (e) {
      var $this = $(this);
      var level = [];
      var $sibling = $this.closest('div.row');
      _this.createLevel(level, new morpheus.SortKey('',
        morpheus.SortKey.SortOrder.ASCENDING), _this.fields);
      $sibling.after($(level.join('')));
      e.preventDefault();
    });
  }

  $chooserDiv.on('change', '[name=rowsOrColumns]', function (e) {
    var $this = $(this);
    toggle($this.val() === 'columns');
  });
  toggle(false);
  var $outer = $('<div></div>');
  $chooserDiv.appendTo($outer);
  $div.appendTo($outer);
  morpheus.FormBuilder
  .showOkCancel({
    title: 'Sort',
    content: $outer,
    okCallback: function () {
      var $forms = $div.find('form');
      var sortBy = $forms.find('[name=sortBy]').map(function () {
        return $(this).val();
      });
      var sortOrder = $forms.find('[name=sortOrder]:checked')
      .map(function () {
        return $(this).val();
      });
      var groupBy = $div.find('[name=groupBy]').val();
      var newSortKeys = [];
      var modelIndices = _this.isColumns ? project
        .getRowSelectionModel().toModelIndices() : project
        .getColumnSelectionModel().toModelIndices();
      var existingSortKeys = _this.isColumns ? project
        .getColumnSortKeys() : project.getRowSortKeys();
      // keep MatchesOnTopSortKey and dendrogram
      var keysToKeep = _
      .filter(
        existingSortKeys,
        function (key) {
          return key instanceof morpheus.MatchesOnTopSortKey
            || (key instanceof morpheus.SpecifiedModelSortOrder && key.name === 'dendrogram');
        });
      if (keysToKeep.length > 0) {
        _.each(keysToKeep, function (key) {
          newSortKeys.push(key);
        });
      }
      var newSortKeyFields = new morpheus.Set();
      for (var i = 0; i < sortBy.length; i++) {
        if (!newSortKeyFields.has(sortBy[i])) {
          newSortKeyFields.add(sortBy[i]);
          if (sortBy[i] === 'selection') {
            newSortKeys.push(new morpheus.SortByValuesKey(
              modelIndices, sortOrder[i],
              _this.isColumns));
          } else if (sortBy[i] !== '') {
            newSortKeys.push(new morpheus.SortKey(
              sortBy[i], sortOrder[i]));
          }
        }
      }
      var newGroupKeys = [];
      if (groupBy != null) {
        for (var i = 0; i < groupBy.length; i++) {
          newGroupKeys.push(new morpheus.SortKey(groupBy[i],
            morpheus.SortKey.SortOrder.UNSORTED));
        }
      }

      if (_this.isColumns) {
        project.setGroupColumns(newGroupKeys, true);
        project.setColumnSortKeys(morpheus.SortKey
        .keepExistingSortKeys(newSortKeys, project
        .getColumnSortKeys()), true);
      } else {
        project.setGroupRows(newGroupKeys, true);
        project.setRowSortKeys(morpheus.SortKey
        .keepExistingSortKeys(newSortKeys, project
        .getRowSortKeys()), true);
      }
    }
  });
};
morpheus.SortDialog.prototype = {
  isColumns: false,
  build: function (project, isColumns) {
    var fields = morpheus.MetadataUtil.getMetadataNames(isColumns ? project
      .getFullDataset().getColumnMetadata() : project
      .getFullDataset().getRowMetadata());
    this.fields = fields;
    var html = [];
    var sortKeys = isColumns ? project.getColumnSortKeys() : project
      .getRowSortKeys();
    this.createLevel0(html);
    for (var i = 0; i < sortKeys.length; i++) { // add existing keys
      // ignoring
      // MatchesOnTopSortKey and
      // dendrogram
      if (!(sortKeys[i] instanceof morpheus.MatchesOnTopSortKey)
        && !(sortKeys[i] instanceof morpheus.SpecifiedModelSortOrder && sortKeys[i].name === 'dendrogram')) {
        this.createLevel(html, sortKeys[i], fields);
      }
    }
    // group by
    html.push('<div class="row">');
    html
    .push('<form name="groupByForm" class="form-horizontal" role="form">');
    html.push('<div class="col-xs-2"><label>Group by</label></div>');
    html.push('<div class="col-xs-4">');
    var groupByKeys = (isColumns ? project.getGroupColumns() : project
      .getGroupRows()).map(function (key) {
      return key.field;
    });

    html.push('<select multiple name="groupBy" class="form-control">');
    _.each(fields, function (field) {
      html.push('<option value="' + field + '"');
      if (_.indexOf(groupByKeys, field) !== -1) {
        html.push(' selected');
      }
      html.push('>');
      html.push(field);
      html.push('</option>');
    });
    html.push('</select>');
    html.push('</form>');
    html.push('</div>');
    return $(html.join(''));
  },
  createLevel0: function (html) {
    html
    .push('<div style="border-bottom:1px solid LightGrey;margin-bottom:20px;" class="row">');
    html.push('<form class="form-horizontal" role="form">');
    html.push('<div class="col-xs-8">');
    html.push('<a data-name="add" href="#">Add sort level</a>');
    html.push('</div>');
    html.push('</form>');
    html.push('</div>');
  },
  createLevel: function (html, key, fields) {
    html
    .push('<div style="border-bottom:1px solid LightGrey;margin-bottom:20px;" class="row">');
    html.push('<form class="form-horizontal" role="form">');
    html
    .push('<div class="col-xs-2"><label class="control-label">Sort by</label></div>');
    html.push('<div class="col-xs-4">');
    html.push('<select name="sortBy" class="form-control">');
    html.push('<option value=""></option>');
    html.push('<option value="selection"'
      + (key instanceof morpheus.SortByValuesKey ? ' selected' : '')
      + '>selection</option>');
    _.each(fields, function (field) {
      html.push('<option value="' + field + '"');
      if (field == key.field) {
        html.push(' selected');
      }
      html.push('>');
      html.push(field);
      html.push('</option>');
    });
    html.push('</select>');
    html.push('</div>');
    html.push('<div class="col-xs-5">');
    html
    .push('<div class="radio"><label><input type="radio" name="sortOrder" value="ascending"'
      + (morpheus.SortKey.SortOrder.ASCENDING == key
      .getSortOrder() ? ' checked' : '')
      + '>Ascending</label></div>');
    html
    .push('<div class="radio"><label><input type="radio" name="sortOrder" value="descending"'
      + (morpheus.SortKey.SortOrder.DESCENDING == key
      .getSortOrder() ? ' checked' : '')
      + '>Descending</label></div>');
    html.push('</div>');
    html.push('<div class="col-xs-1">');
    html.push('<a data-name="delete" class="pull-right">Delete</a>');
    html.push('</div>');
    html.push('<div class="col-xs-8">');
    html.push('<a data-name="add" href="#">Add sort level</a>');
    html.push('</div>');
    html.push('</form>');
    html.push('</div>');
  }
};

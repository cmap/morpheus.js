morpheus.SymmetricProjectListener = function (project, vscroll, hscroll) {
  var ignoreEvent = false;
  var rowGroupBy;
  var columnGroupBy;
  var rowFilter;
  var columnFilter;
  var rowSortOrder;
  var columnSortOrder;
  var columnSelection;
  var rowSelection;
  var vscrollFunction;
  var hscrollFunction;
  project.on(morpheus.Project.Events.ROW_GROUP_BY_CHANGED, rowGroupBy = function () {
    if (ignoreEvent) {
      return;
    }
    ignoreEvent = true;
    project.setGroupColumns(project.getGroupRows(), true);
    ignoreEvent = false;
  });
  project.on(morpheus.Project.Events.COLUMN_GROUP_BY_CHANGED, columnGroupBy = function () {
    if (ignoreEvent) {
      return;
    }
    ignoreEvent = true;
    project.setGroupRows(project.getGroupColumns(), true);
    ignoreEvent = false;
  });
  project.on(morpheus.Project.Events.ROW_FILTER_CHANGED, rowFilter = function () {
    if (ignoreEvent) {
      return;
    }
    ignoreEvent = true;
    project.setColumnFilter(project.getRowFilter(), true);
    ignoreEvent = false;
  });
  project.on(morpheus.Project.Events.COLUMN_FILTER_CHANGED, columnFilter = function () {
    if (ignoreEvent) {
      return;
    }
    ignoreEvent = true;
    project.setRowFilter(project.getColumnFilter(), true);
    ignoreEvent = false;
  });
  project.on(morpheus.Project.Events.ROW_SORT_ORDER_CHANGED, rowSortOrder = function () {
    if (ignoreEvent) {
      return;
    }
    ignoreEvent = true;
    project.setColumnSortKeys(project.getRowSortKeys(), true);
    ignoreEvent = false;
  });
  project.on(morpheus.Project.Events.COLUMN_SORT_ORDER_CHANGED, columnSortOrder = function () {
    if (ignoreEvent) {
      return;
    }
    ignoreEvent = true;
    project.setRowSortKeys(project.getColumnSortKeys(), true);
    ignoreEvent = false;
  });
  project.getColumnSelectionModel().on('selectionChanged', columnSelection = function () {
    if (ignoreEvent) {
      return;
    }
    ignoreEvent = true;
    project.getRowSelectionModel().setViewIndices(project.getColumnSelectionModel().getViewIndices(), true);
    ignoreEvent = false;
  });
  project.getRowSelectionModel().on('selectionChanged', rowSelection = function () {
    if (ignoreEvent) {
      return;
    }
    ignoreEvent = true;
    project.getColumnSelectionModel().setViewIndices(project.getRowSelectionModel().getViewIndices(), true);
    ignoreEvent = false;
  });
  vscroll.on('scroll', vscrollFunction = function () {
    if (ignoreEvent) {
      return;
    }
    ignoreEvent = true;
    var f = vscroll.getMaxValue() === 0 ? 0 : vscroll.getValue() / vscroll.getMaxValue();
    hscroll.setValue(f * hscroll.getMaxValue(), true);
    ignoreEvent = false;
  });
  hscroll.on('scroll', hscrollFunction = function () {
    if (ignoreEvent) {
      return;
    }
    ignoreEvent = true;
    var f = hscroll.getMaxValue() === 0 ? 0 : hscroll.getValue() / hscroll.getMaxValue();
    vscroll.setValue(f * vscroll.getMaxValue(), true);
    ignoreEvent = false;
  });

  this.dispose = function () {
    project.off(morpheus.Project.Events.ROW_GROUP_BY_CHANGED, rowGroupBy);
    project.off(morpheus.Project.Events.COLUMN_GROUP_BY_CHANGED, columnGroupBy);
    project.off(morpheus.Project.Events.ROW_FILTER_CHANGED, rowFilter);
    project.off(morpheus.Project.Events.COLUMN_FILTER_CHANGED, columnFilter);
    project.off(morpheus.Project.Events.ROW_SORT_ORDER_CHANGED, rowSortOrder);
    project.off(morpheus.Project.Events.COLUMN_SORT_ORDER_CHANGED, columnSortOrder);
    project.getColumnSelectionModel().off('selectionChanged', columnSelection);
    project.getRowSelectionModel().off('selectionChanged', rowSelection);
    vscroll.off('scroll', vscrollFunction);
    hscroll.off('scroll', hscrollFunction);
  };
};




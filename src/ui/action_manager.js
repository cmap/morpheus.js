/**
 * Action object contains
 * @param options.which Array of key codes
 * @param options.shift Whether shift key is required
 * @param options.commandKey Whether command key is required
 * @param options.name Shortcut name
 * @param options.cb Function callback
 * @param options.accept Additional function to test whether to accept shortcut
 * @param options.icon Optional icon to display
 */
morpheus.ActionManager = function () {
  this.actionNameToAction = new morpheus.Map();
  this.actions = [];
  // TODO copy all row/column metadata
  // pin/unpin tab,
  // header stuff-display, delete.
  this.add({
    ellipsis: true,
    name: 'Sort/Group',
    cb: function (options) {
      new morpheus.SortDialog(options.heatMap.getProject());
    },
    icon: 'fa fa-sort-alpha-asc'
  });

  var $filterModal = null;
  var windowOpen = function (url) {
    if (morpheus.Util.isNode()) {
      var remote = require('electron').remote;
      var BrowserWindow = remote.BrowserWindow;
      var newWindow = new BrowserWindow({
        fullscreenable: false
      });
      newWindow.loadURL(url);
      newWindow.on('closed', function () {
        newWindow = null;
      });
    } else {
      window.open(url);
    }
  };
  this.add({
    name: 'Filter',
    ellipsis: true,
    cb: function (options) {
      if ($filterModal == null) {
        var filterModal = [];
        var filterLabelId = _.uniqueId('morpheus');
        filterModal
          .push('<div class="modal" tabindex="1" role="dialog" aria-labelledby="'
            + filterLabelId + '">');
        filterModal.push('<div class="modal-dialog" role="document">');
        filterModal.push('<div class="modal-content">');
        filterModal.push('<div class="modal-header">');
        filterModal
          .push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
        filterModal.push('<h4 class="modal-title" id="' + filterLabelId
          + '">Filter</h4>');
        filterModal.push('</div>');
        filterModal.push('<div class="modal-body"></div>');
        filterModal.push('<div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div>');
        filterModal.push('</div>');
        filterModal.push('</div>');
        filterModal.push('</div>');
        $filterModal = $(filterModal.join(''));
        $filterModal.on('mousewheel', function (e) {
          e.stopPropagation();
        });
        var $filter = $('<div style="padding-bottom:30px;"></div>');
        $filter.appendTo($filterModal.find('.modal-body'));
        var filterHtml = [];
        filterHtml
          .push('<div class="radio"><label><input type="radio" name="rowsOrColumns" value="rows" checked>Rows</label></div> ');
        filterHtml
          .push('<div class="radio"><label><input type="radio" name="rowsOrColumns" value="columns">Columns</label></div>');

        var $filterChooser = $(filterHtml.join(''));
        $filterChooser.appendTo($filter);
        var columnFilterUI = new morpheus.FilterUI(options.heatMap.getProject(), true);
        var rowFilterUI = new morpheus.FilterUI(options.heatMap.getProject(), false);
        // options.heatMap.getProject().getRowFilter().on('focus', function (e) {
        //   $filterChooser.find('[value=rows]').prop('checked', true);
        //   columnFilterUI.$div.hide();
        //   rowFilterUI.$div.show();
        //   $filterModal.modal('show');
        //   morpheus.Util.trackEvent({
        //     eventCategory: '',
        //     eventAction: 'rowFilter'
        //   });
        //
        // });
        // options.heatMap.getProject().getColumnFilter().on('focus', function (e) {
        //   $filterChooser.find('[value=columns]').prop('checked', true);
        //   columnFilterUI.$div.show();
        //   rowFilterUI.$div.hide();
        //   $filterModal.modal('show');
        //   morpheus.Util.trackEvent({
        //     eventCategory: '',
        //     eventAction: 'columnFilter'
        //   });
        // });
        rowFilterUI.$div.appendTo($filter);
        columnFilterUI.$div.appendTo($filter);
        columnFilterUI.$div.css('display', 'none');
        var $filterRadio = $filterChooser.find('[name=rowsOrColumns]');
        $filterRadio.on('change', function (e) {
          var val = $filterRadio.filter(':checked').val();
          if (val === 'columns') {
            columnFilterUI.$div.show();
            rowFilterUI.$div.hide();
          } else {
            columnFilterUI.$div.hide();
            rowFilterUI.$div.show();
          }
          e.preventDefault();
        });
        $filterModal.appendTo(options.heatMap.$content);
        $filterModal.on('hidden.bs.modal', function () {
          options.heatMap.focus();
        });
      }
      $filterModal.modal('show');
    },
    icon: 'fa fa-filter'
  });

  this.add({
    name: 'Options',
    ellipsis: true,
    cb: function (options) {
      options.heatMap.showOptions();
    },
    icon: 'fa fa-cog'
  });

  this.add({
    which: [191], // slash
    commandKey: true,
    global: true,
    name: 'Toggle Search',
    cb: function (options) {
      options.heatMap.getToolbar().toggleSearch();
    }
  });

  //
  this.add({
    name: 'Copy Image',
    icon: 'fa fa-clipboard',
    cb: function (options) {
      var bounds = options.heatMap.getTotalSize();
      var height = bounds.height;
      var width = bounds.width;
      var canvas = $('<canvas></canvas>')[0];
      var backingScale = morpheus.CanvasUtil.BACKING_SCALE;
      canvas.height = backingScale * height;
      canvas.style.height = height + 'px';
      canvas.width = backingScale * width;
      canvas.style.width = width + 'px';
      var context = canvas.getContext('2d');
      morpheus.CanvasUtil.resetTransform(context);
      options.heatMap.snapshot(context);
      var url = canvas.toDataURL();
      // canvas.toBlob(function (blob) {
      // 	url = URL.createObjectURL(blob);
      // 	event.clipboardData
      // 	.setData(
      // 		'text/html',
      // 		'<img src="' + url + '">');
      // });

      morpheus.Util.setClipboardData([
        {
          format: 'text/html',
          data: '<img src="' + url + '">'
        }], true);
    }
  });

  //
  this.add({
    name: 'Close Tab',
    cb: function (options) {
      options.heatMap.getTabManager().remove(options.heatMap.tabId);
    }
  });
  this.add({
    name: 'Rename Tab',
    ellipsis: true,
    cb: function (options) {
      options.heatMap.getTabManager().rename(options.heatMap.tabId);
    }
  });

  this.add({
    which: [88], // x
    commandKey: true,
    name: 'New Heat Map',
    accept: function (options) {
      return (!options.isInputField || window.getSelection().toString() === '');
    },

    cb: function (options) {
      morpheus.HeatMap.showTool(new morpheus.NewHeatMapTool(),
        options.heatMap);
    }
  });

  this.add({
    which: [67], // C
    commandKey: true,
    name: 'Copy'
  });

  this.add({
    which: [86], // V
    commandKey: true,
    name: 'Paste Dataset'
  });

  this.add({
    global: true,
    name: 'Open',
    ellipsis: true,
    cb: function (options) {
      morpheus.HeatMap.showTool(new morpheus.OpenFileTool(), options.heatMap);
    },
    which: [79],
    commandKey: true,
    icon: 'fa fa-folder-open-o'
  });

  this.add({
    ellipsis: true,
    name: 'Save Image',
    gui: function () {
      return new morpheus.SaveImageTool();
    },
    cb: function (options) {
      morpheus.HeatMap.showTool(this.gui(),
        options.heatMap);
    },
    which: [83],
    commandKey: true,
    global: true,
    icon: 'fa fa-file-image-o'
  });

  this.add({
    ellipsis: true,
    name: 'Save Dataset',
    gui: function () {
      return new morpheus.SaveDatasetTool();
    },
    cb: function (options) {
      morpheus.HeatMap.showTool(this.gui(),
        options.heatMap);
    },
    // shiftKey: true,
    // which: [83],
    // commandKey: true,
    // global: true,
    icon: 'fa fa-floppy-o'
  });

  this.add({
    ellipsis: true,
    name: 'Save Session',
    gui: function () {
      return new morpheus.SaveSessionTool();
    },
    cb: function (options) {
      morpheus.HeatMap.showTool(this.gui(), options.heatMap);
    },
    icon: 'fa fa-anchor'
  });

  if (typeof echarts !== 'undefined') {
    this.add({
      name: 'Chart',
      cb: function (options) {
        new morpheus.ChartTool({
          project: options.heatMap.getProject(),
          heatmap: options.heatMap,
          getVisibleTrackNames: _.bind(
            options.heatMap.getVisibleTrackNames, options.heatMap)
        });
      },
      icon: 'fa fa-line-chart'
    });
  }

  this.add({
    name: 'Zoom In',
    cb: function (options) {
      options.heatMap.zoom(true);
    },
    which: [107, 61, 187]
  });
  this.add({
    name: 'Zoom Out',
    cb: function (options) {
      options.heatMap.zoom(false);
    },
    which: [173, 189, 109]
  });

  this.add({
    name: 'Fit To Window',
    cb: function (options) {
      options.heatMap.fitToWindow({fitRows: true, fitColumns: true, repaint: true});
    },
    which: [48], // zero
    commandKey: true,
    icon: 'fa fa-compress'
  });
  this.add({
    name: 'Fit Columns To Window',
    cb: function (options) {
      options.heatMap.fitToWindow({fitRows: false, fitColumns: true, repaint: true});
    }
  });
  this.add({
    name: 'Fit Rows To Window',
    cb: function (options) {
      options.heatMap.fitToWindow({fitRows: true, fitColumns: false, repaint: true});
    }
  });
  this.add({
    name: '100%',
    cb: function (options) {
      options.heatMap.resetZoom();
    },
    button: '100%',
    which: [48], // zero
    commandKey: true,
    shiftKey: true
  });

  this.add({
    which: [35],
    name: 'Go To End',
    cb: function (options) {
      options.heatMap.scrollLeft(options.heatMap.heatmap.getPreferredSize().width);
      options.heatMap.scrollTop(options.heatMap.heatmap.getPreferredSize().height);
    }
  });
  this.add({
    which: [36], // home key
    name: 'Go To Start',
    cb: function (options) {
      options.heatMap.scrollLeft(0);
      options.heatMap.scrollTop(0);
    }
  });
  this.add({
    which: [34], // page down
    commandKey: true,
    name: 'Go To Bottom',
    cb: function (options) {
      options.heatMap
        .scrollTop(options.heatMap.heatmap.getPreferredSize().height);
    }
  });
  this.add({
    which: [34], // page down
    commandKey: false,
    name: 'Scroll Page Down',
    cb: function (options) {
      var pos = options.heatMap.scrollTop();
      options.heatMap.scrollTop(pos + options.heatMap.heatmap.getUnscaledHeight()
        - 2);
    }
  });

  this.add({
    which: [33], // page up
    commandKey: true,
    name: 'Go To Top',
    cb: function (options) {
      options.heatMap
        .scrollTop(0);
    }
  });
  this.add({
    which: [33], // page up
    commandKey: false,
    name: 'Scroll Page Up',
    cb: function (options) {
      var pos = options.heatMap.scrollTop();
      options.heatMap.scrollTop(pos - options.heatMap.heatmap.getUnscaledHeight()
        + 2);
    }
  });

  this.add({
    which: [38], // up arrow
    commandKey: true,
    name: 'Zoom Out Rows',
    cb: function (options) {
      options.heatMap.zoom(false, {
        columns: false,
        rows: true
      });
    }
  });
  this.add({
    which: [38], // up arrow
    commandKey: false,
    name: 'Scroll Up',
    cb: function (options) {
      options.heatMap.scrollTop(options.heatMap.scrollTop() - 8);
    }
  });

  this.add({
    which: [40], // down arrow
    commandKey: true,
    name: 'Zoom In Rows',
    cb: function (options) {
      options.heatMap.zoom(true, {
        columns: false,
        rows: true
      });
    }
  });
  this.add({
    which: [40], // down arrow
    commandKey: false,
    name: 'Scroll Down',
    cb: function (options) {
      options.heatMap.scrollTop(options.heatMap.scrollTop() + 8);
    }
  });

  this.add({
    which: [37], // left arrow
    commandKey: true,
    name: 'Zoom Out Columns',
    cb: function (options) {
      options.heatMap.zoom(false, {
        columns: true,
        rows: false
      });
    }
  });
  this.add({
    which: [37], // left arrow
    commandKey: false,
    name: 'Scroll Left',
    cb: function (options) {
      options.heatMap.scrollLeft(options.heatMap.scrollLeft() - 8);
    }
  });

  this.add({
    which: [39], // right arrow
    commandKey: true,
    name: 'Zoom In Columns',
    cb: function (options) {
      options.heatMap.zoom(true, {
        columns: true,
        rows: false
      });
    }
  });
  this.add({
    which: [39], // right arrow
    commandKey: false,
    name: 'Scroll Right',
    cb: function (options) {
      options.heatMap.scrollLeft(options.heatMap.scrollLeft() + 8);
    }
  });
  this.add({
    name: 'Tutorial',
    cb: function () {
      windowOpen('https://software.broadinstitute.org/morpheus/tutorial.html');
    }
  });

  this.add({
    icon: 'fa fa-code',
    name: 'Source Code',
    cb: function () {
      windowOpen('https://github.com/cmap/morpheus.js');
    }
  });
  var $findModal;
  var $search;

  this.add({
    which: [65],
    ellipsis: true,
    shiftKey: true,
    commandKey: true,
    name: 'Find Action',
    cb: function (options) {
      if ($findModal == null) {
        var findModal = [];
        var id = _.uniqueId('morpheus');
        findModal
          .push('<div class="modal" tabindex="1" role="dialog" aria-labelledby="'
            + id + '">');
        findModal.push('<div class="modal-dialog" role="document">');
        findModal.push('<div class="modal-content">');
        findModal.push('<div class="modal-header">');
        findModal
          .push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
        findModal.push('<h4 class="modal-title" id="' + id
          + '">Enter action</h4>');
        findModal.push('</div>');
        findModal.push('<div class="modal-body ui-front"><input class="form-control input-sm"></div>');
        findModal.push('</div>');
        findModal.push('</div>');
        findModal.push('</div>');
        $findModal = $(findModal.join(''));
        $findModal.appendTo(options.heatMap.$content);
        var allActions = options.heatMap.getActionManager().getActions();
        $search = $findModal.find('input');
        $search.on('keyup', function (e) {
          if (e.which === 13) {
            var text = $search.val().trim();
            if (text !== '') {
              var action = _this.getAction(text);
              if (action) {
                $findModal.modal('hide');
                _this.execute(text, {event: e});
              }
            }
          }
        });
        morpheus.Util.autosuggest({
          $el: $search,
          multi: false,
          suggestWhenEmpty: false,
          //  history: options.history,
          filter: function (tokens, response) {
            var token = tokens[0].trim();
            var matches = [];
            var replaceRegex = new RegExp('(' + morpheus.Util.escapeRegex(token) + ')', 'i');
            for (var i = 0; i < allActions.length; i++) {
              if (allActions[i].cb) {
                var name = allActions[i].name;
                if (replaceRegex.test(name)) {
                  matches.push({
                    clear: true,
                    value: name,
                    label: '<span style="margin-left: 10px">'
                    + name.replace(replaceRegex, '<b>$1</b>') + '</span>'
                  });
                }
              }
            }
            response(matches);

          },
          select: function () {
            setTimeout(function () {
              var text = $search.val().trim();
              if (text !== '') {
                var action = _this.getAction(text);
                if (action) {
                  $findModal.modal('hide');
                  _this.execute(text);
                }
              }
            }, 20);

          }
        });
        $findModal.on('hidden.bs.modal', function () {
          options.heatMap.focus();
        });
      }
      $findModal.modal('show');
      $search.focus();
    }
  });
  this.add({
    name: 'Keyboard Shortcuts',
    cb: function (options) {
      new morpheus.HeatMapKeyListener(options.heatMap).showKeyMapReference();
    }
  });

  this.add({
    name: 'Configuration',
    cb: function () {
      windowOpen('https://software.broadinstitute.org/morpheus/configuration.html');
    }
  });
  this.add({
    name: 'Contact',
    icon: 'fa fa-envelope-o',
    cb: function (options) {
      morpheus.FormBuilder.showInModal({
        title: 'Contact',
        html: 'Please email us at morpheus@broadinstitute.org',
        focus: options.heatMap.getFocusEl()
      });
    }
  });

  this.add({
    which: [65], // a
    commandKey: true,
    name: 'Select All',
    accept: function (options) {
      var active = options.heatMap.getActiveComponent();
      return (active === 'rowTrack' || active === 'columnTrack');
    },
    cb: function (options) {
      var active = options.heatMap.getActiveComponent();
      var selectionModel = active === 'rowTrack' ? options.heatMap.getProject()
        .getRowSelectionModel() : options.heatMap.getProject()
        .getColumnSelectionModel();
      var count = active === 'rowTrack' ? options.heatMap.getProject()
        .getSortedFilteredDataset().getRowCount() : options.heatMap
        .getProject().getSortedFilteredDataset()
        .getColumnCount();
      var indices = new morpheus.Set();
      for (var i = 0; i < count; i++) {
        indices.add(i);
      }
      selectionModel.setViewIndices(indices, true);
    }
  });

  var invertAction = function (options, isColumns) {
    var model = isColumns ? options.heatMap.getProject().getColumnSelectionModel() : options.heatMap.getProject().getRowSelectionModel();
    var viewIndices = model.getViewIndices();
    var inverse = new morpheus.Set();
    var n = n = isColumns ? options.heatMap.getProject().getSortedFilteredDataset().getColumnCount() : options.heatMap.getProject().getSortedFilteredDataset().getRowCount();
    for (var i = 0; i < n; i++) {
      if (!viewIndices.has(i)) {
        inverse.add(i);
      }
    }
    model.setViewIndices(inverse, true);
  };
  this.add({
    name: 'Invert Selected Rows',
    cb: function (options) {
      invertAction(options, false);
    }
  });
  this.add({
    name: 'Invert Selected Columns',
    cb: function (options) {
      invertAction(options, true);
    }
  });
  var clearAction = function (options, isColumns) {
    var model = isColumns ? options.heatMap.getProject()
      .getColumnSelectionModel() : options.heatMap.getProject()
      .getRowSelectionModel();
    model.setViewIndices(new morpheus.Set(), true);
  };
  this.add({
    name: 'Clear Selected Rows',
    cb: function (options) {
      clearAction(options, false);
    }
  });
  this.add({
    name: 'Clear Selected Columns',
    cb: function (options) {
      clearAction(options, true);
    }
  });

  var moveToTop = function (options, isColumns) {
    var project = options.heatMap.getProject();
    var selectionModel = !isColumns ? project.getRowSelectionModel()
      : project
        .getColumnSelectionModel();
    var viewIndices = selectionModel.getViewIndices().values();
    if (viewIndices.length === 0) {
      return;
    }
    viewIndices.sort(function (a, b) {
      return (a === b ? 0 : (a < b ? -1 : 1));
    });
    var converter = isColumns ? project.convertViewColumnIndexToModel
      : project.convertViewRowIndexToModel;
    converter = _.bind(converter, project);
    var modelIndices = [];
    for (var i = 0, n = viewIndices.length; i < n; i++) {
      modelIndices.push(converter(viewIndices[i]));
    }
    var sortKey = new morpheus.MatchesOnTopSortKey(project, modelIndices, 'selection on top', isColumns);
    sortKey.setLockOrder(1);
    sortKey.setUnlockable(false);
    if (isColumns) {
      project
        .setColumnSortKeys(
          morpheus.SortKey
            .keepExistingSortKeys(
              [sortKey],
              project
                .getColumnSortKeys().filter(function (key) {
                return !(key instanceof morpheus.MatchesOnTopSortKey && key.toString() === sortKey.toString());
              })),
          true);
    } else {
      project
        .setRowSortKeys(
          morpheus.SortKey
            .keepExistingSortKeys(
              [sortKey],
              project
                .getRowSortKeys().filter(function (key) {
                return !(key instanceof morpheus.MatchesOnTopSortKey && key.toString() === sortKey.toString());
              })),
          true);
    }
  };
  this.add({
    name: 'Move Selected Rows To Top',
    cb: function (options) {
      moveToTop(options, false);
    }
  });
  this.add({
    name: 'Move Selected Columns To Top',
    cb: function (options) {
      moveToTop(options, true);
    }
  });
  var selectAll = function (options, isColumns) {
    var project = options.heatMap.getProject();
    var selectionModel = !isColumns ? project.getRowSelectionModel()
      : project
        .getColumnSelectionModel();
    var count = !isColumns ? project
      .getSortedFilteredDataset()
      .getRowCount() : project
      .getSortedFilteredDataset()
      .getColumnCount();
    var indices = new morpheus.Set();
    for (var i = 0; i < count; i++) {
      indices.add(i);
    }
    selectionModel.setViewIndices(indices, true);
  };
  this.add({
    name: 'Select All Rows',
    cb: function (options) {
      selectAll(options, false);
    }
  });
  this.add({
    name: 'Select All Columns',
    cb: function (options) {
      selectAll(options, true);
    }
  });
  var copySelection = function (options, isColumns) {
    var project = options.heatMap.getProject();
    var dataset = project
      .getSortedFilteredDataset();
    var activeTrackName = options.heatMap.getSelectedTrackName(isColumns);
    var v;
    if (activeTrackName == null) {
      v = isColumns ? dataset.getColumnMetadata()
        .get(0) : dataset
        .getRowMetadata().get(0);
    } else {
      v = isColumns ? dataset.getColumnMetadata()
        .getByName(activeTrackName) : dataset
        .getRowMetadata().getByName(activeTrackName);
    }

    var selectionModel = isColumns ? project
      .getColumnSelectionModel() : project
      .getRowSelectionModel();
    var text = [];
    var toStringFunction = morpheus.VectorTrack.vectorToString(v);
    selectionModel.getViewIndices().forEach(
      function (index) {
        text.push(toStringFunction(v
          .getValue(index)));
      });
    morpheus.Util.setClipboardData([
      {
        format: 'text/plain',
        data: text.join('\n')
      }]);
  };
  this.add({
    name: 'Copy Selected Rows',
    cb: function (options) {
      copySelection(options, false);
    }
  });
  this.add({
    name: 'Copy Selected Columns',
    cb: function (options) {
      copySelection(options, true);
    }
  });

  var annotateSelection = function (options, isColumns) {

    var project = options.heatMap.getProject();
    var selectionModel = isColumns ? project
        .getColumnSelectionModel()
      : project
        .getRowSelectionModel();
    if (selectionModel.count() === 0) {
      morpheus.FormBuilder
        .showMessageModal({
          title: 'Annotate Selection',
          html: 'No ' + (isColumns ? 'columns' : 'rows') + ' selected.',
          focus: options.heatMap.getFocusEl()
        });
      return;
    }
    var formBuilder = new morpheus.FormBuilder();
    formBuilder.append({
      name: 'annotation_name',
      type: 'text',
      required: true
    });
    formBuilder.append({
      name: 'annotation_value',
      type: 'text',
      required: true
    });
    morpheus.FormBuilder
      .showOkCancel({
        title: 'Annotate',
        content: formBuilder.$form,
        focus: options.heatMap.getFocusEl(),
        okCallback: function () {
          var value = formBuilder
            .getValue('annotation_value');
          var annotationName = formBuilder
            .getValue('annotation_name');
          var dataset = project
            .getSortedFilteredDataset();
          var fullDataset = project
            .getFullDataset();
          if (isColumns) {
            dataset = new morpheus.TransposedDatasetView(dataset);
            fullDataset = new morpheus.TransposedDatasetView(fullDataset);
          }

          var existingVector = fullDataset
            .getRowMetadata()
            .getByName(
              annotationName);
          var v = dataset
            .getRowMetadata().add(
              annotationName);

          selectionModel
            .getViewIndices()
            .forEach(
              function (index) {
                v
                  .setValue(
                    index,
                    value);
              });
          morpheus.VectorUtil
            .maybeConvertStringToNumber(v);
          project
            .trigger(
              'trackChanged',
              {
                vectors: [v],
                display: existingVector != null ? []
                  : [morpheus.VectorTrack.RENDER.TEXT],
                columns: isColumns
              });
        }
      });
  };
  this.add({
    ellipsis: true,
    name: 'Annotate Selected Rows',
    cb: function (options) {
      annotateSelection(options, false);
    }
  });
  this.add({
    ellipsis: true,
    name: 'Annotate Selected Columns',
    cb: function (options) {
      annotateSelection(options, true);
    }
  });
  this.add({
    name: 'Copy Selected Dataset',
    cb: function (options) {
      var project = options.heatMap.getProject();
      var dataset = project.getSelectedDataset({
        emptyToAll: false
      });
      var columnMetadata = dataset
        .getColumnMetadata();
      var rowMetadata = dataset.getRowMetadata();
      // only copy visible tracks
      var visibleColumnFields = options.heatMap
        .getVisibleTrackNames(true);
      var columnFieldIndices = [];
      _.each(visibleColumnFields, function (name) {
        var index = morpheus.MetadataUtil.indexOf(
          columnMetadata, name);
        if (index !== -1) {
          columnFieldIndices.push(index);
        }
      });
      columnMetadata = new morpheus.MetadataModelColumnView(
        columnMetadata, columnFieldIndices);
      var rowMetadata = dataset.getRowMetadata();
      // only copy visible tracks
      var visibleRowFields = options.heatMap
        .getVisibleTrackNames(false);
      var rowFieldIndices = [];
      _.each(visibleRowFields, function (name) {
        var index = morpheus.MetadataUtil.indexOf(
          rowMetadata, name);
        if (index !== -1) {
          rowFieldIndices.push(index);
        }
      });
      rowMetadata = new morpheus.MetadataModelColumnView(
        rowMetadata, rowFieldIndices);

      var text = new morpheus.GctWriter()
        .write(dataset);
      morpheus.Util.setClipboardData([
        {
          format: 'text/plain',
          data: text
        }]);

    }
  });
  var _this = this;
  [
    new morpheus.HClusterTool(), new morpheus.KMeansTool(), new morpheus.MarkerSelection(), new morpheus.NearestNeighbors(), new morpheus.AdjustDataTool(),
    new morpheus.CollapseDatasetTool(), new morpheus.CreateAnnotation(), new morpheus.SimilarityMatrixTool(), new morpheus.TransposeTool(), new morpheus.TsneTool(),
    new morpheus.DevAPI()].forEach(function (tool) {
    _this.add({
      ellipsis: true,
      name: tool.toString(),
      gui: function () {
        return tool;
      },
      cb: function (options) {
        morpheus.HeatMap.showTool(tool, options.heatMap);
      }
    });
  });
  this.add({
    name: 'Edit Fonts',
    ellipse: true,
    cb: function (options) {
      var trackInfo = options.heatMap.getLastSelectedTrackInfo();
      var project = options.heatMap.getProject();
      var model = trackInfo.isColumns ? project
        .getColumnFontModel() : project
        .getRowFontModel();
      var chooser = new morpheus.FontChooser({
        fontModel: model,
        track: options.heatMap.getTrack(trackInfo.name, trackInfo.isColumns),
        heatMap: options.heatMap
      });
      morpheus.FormBuilder.showInModal({
        title: 'Edit Fonts',
        html: chooser.$div,
        close: 'Close',
        focus: options.heatMap.getFocusEl()
      });
    }
  });

};
morpheus.ActionManager.prototype = {
  getActions: function () {
    return this.actions;
  },
  getAction: function (name) {
    return this.actionNameToAction.get(name);
  },
  execute: function (name, args) {
    var action = this.getAction(name);
    if (args == null) {
      args = {};
    }

    args.heatMap = this.heatMap;
    action.cb(args);

    morpheus.Util.trackEvent({
      eventCategory: 'Tool',
      eventAction: name
    });
  },
  add: function (action) {
    this.actions.push(action);
    this.actionNameToAction.set(action.name, action);
  }
};

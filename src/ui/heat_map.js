/**
 * rows and columns can contain field, renameTo, display, order
 *
 */

morpheus.HeatMap = function (options) {
  morpheus.Util.loadTrackingCode();
  var _this = this;
  // don't extend
  var dontExtend = ['parent', 'columnDendrogram', 'rowDendrogram'];
  var cache = [];
  for (var i = 0; i < dontExtend.length; i++) {
    var field = dontExtend[i];
    cache[i] = options[field];
    options[field] = null;
  }
  options = $.extend(
    true,
    {},
    {
      /*
       * The element in which to render to the heat map.
       */
      el: null,
      /*
       * A File or URL to a <a target="_blank"
       * href="http://support.lincscloud.org/hc/en-us/articles/202105453-GCT-Gene-Cluster-Text-Format-">GCT
       * 1.3</a>, ' + '<a target="_blank"
       * href="http://www.broadinstitute.org/cancer/software/genepattern/gp_guides/file-formats/sections/gct">GCT
       * 1.2</a>, ' + '<a target="_blank"
       * href="https://wiki.nci.nih.gov/display/TCGA/Mutation+Annotation+Format+%28MAF%29+Specification">MAF</a>, ' + '<a
       * target="_blank",
       * href="http://www.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#GMT:_Gene_Matrix_Transposed_file_format_.28.2A.gmt.29">GMT</a>, ' + '
       * or a tab-delimitted text file. Can also be an array
       * of File or URLs in which case the datasets are
       * combined by matching on column ids.
       */
      dataset: undefined,
      /*
       *
       * @description Array of file, datasetField, fileField,
       *              and include (optional fields to include
       *              from file). File can be xlsx file,
       *              tab-delimitted text file, or gmt file.
       *              <p>
       *              <b>Example:</b> Annotate rows matching
       *              'name' field in dataset to 'id' field in
       *              file.
       *              </p>
       *              <code>[{file:'https://MY_URL', datasetField:'name', fileField:'id'}]</code>
       */
      rowAnnotations: undefined,
      /*
       * Array of file, datasetField, fileField, and include
       * (optional fields to include from file). File can be
       * xlsx file, tab-delimitted text file, or gmt file.
       */
      columnAnnotations: undefined,

      /*
       * Array of column metadata names to group the heat map
       * by.
       *
       * <p>
       * <b>Example:</b> Group by the type and gender
       * metadata field.
       * </p>
       *
       * <code>['type', 'gender']</code>
       */
      columnGroupBy: undefined,
      /*
       * Array of row metadata names to group the heat map by.
       *
       * <p>
       * <b>Example:</b> Group by the gene metadata field.
       * </p>
       * <code>['gene']</code>
       */
      rowGroupBy: undefined,
      /*
       * Object that describes mapping of values to colors.
       * scalingMode can be 'fixed' or 'relative'. Stepped indicates
       * whether color scheme is continuous (false) or
       * discrete (true).
       * <p>
       * <b>Example:</b> Use a fixed color scheme with color
       * stops at -100, -90, 90, and 100.
       * <p>
       * <code>{ scalingMode : 'fixed', stepped:false, values : [-100, -90, 90, 100], colors : ['blue', 'white', 'white', 'red'] };</code>
       */
      colorScheme: undefined,
      /*
       * Array of metadata names and sort order. Use 0 for
       * ascending and 1 for descending. To sort by values use
       * modelIndices.
       *
       * <p>
       * <b>Example:</b> Sort ascending by gene, and then
       * descending by stdev
       * </p>
       * <code>[{field:'gene', order:0}, {field:'stdev',
       *              order:1}]</code>
       */
      rowSortBy: undefined,
      /*
       * Array of metadata names and sort order. Use 0 for
       * ascending and 1 for descending.
       *
       * <p>
       * <b>Example:</b> to sort ascending by gene, and then
       * descending by stdev
       * </p>
       * <code> [{name:'gene',
       *              order:0}, {name:'stdev', order:1}]</code>
       */
      columnSortBy: undefined,
      /*
       * URL to a dendrogram in <a target="_blank"
       * href="https://en.wikipedia.org/wiki/Newick_format">Newick
       * format</a>
       */
      rowDendrogram: undefined,
      /*
       * URL to a dendrogram in <a target="_blank"
       * href="https://en.wikipedia.org/wiki/Newick_format">Newick
       * format</a>
       */
      columnDendrogram: undefined,

      /*
       * Column metadata field in dataset used to match leaf
       * node ids in column dendrogram Newick file
       */
      columnDendrogramField: null,
      /*
       * Row metadata field in dataset used to match leaf node
       * ids in row dendrogram Newick file
       */
      rowDendrogramField: null,
      /*
       * Array of objects describing how to display row
       * metadata fields. Each object in the array must have
       * field, and optionally display, order, and renameTo.
       * Field is the metadata field name. Display is a comma
       * delimited string that describes how to display a
       * metadata field. Options are text, color, stacked_bar,
       * bar, highlight, shape, discrete, and continuous.
       * Order is a number that indicates the order in which
       * the field should appear in the heat map. RenameTo
       * allows you to rename a field.
       */
      rows: [],
      /*
       * Array of objects describing how to display column
       * metadata fields. Each object in the array must have
       * field, and optionally display, order, and renameTo.
       * Field is the metadata field name. Display is a comma
       * delimited string that describes how to display a
       * metadata field. Options are text, color, stacked_bar,
       * bar, highlight, shape, discrete, and continuous.
       * Order is a number that indicates the order in which
       * the field should appear in the heat map. RenameTo
       * allows you to rename a field.
       */
      columns: [],
      /*
       * Optional array of tools to run at load time. For
       * example: <code>tools : [ {
       * name : 'Marker Selection',
       * params : {
       * 		field : [ comparisonVector.getName() ],
       *      class_a : [ 'A' ], class_b : [ 'B' ] }} ]</code>
       */
      tools: undefined,
      /*
       * Optional array of {name:string, values:[]}
       */
      rowFilter: undefined,
      columnFilter: undefined,
      /*
       * Whether to auto-hide the tab bar when only one tab is visible
       */
      autohideTabBar: false,
      /*
       * Whether this heat map tab can be closed
       */
      closeable: true,
      /*
       * Whether heat map tab can be renamed
       */
      rename: true,
      /*
       * Heat map row size in pixels or 'fit' to fit heat map to current height.
       */
      rowSize: 14,
      /*
       * Heat map column size in pixels or 'fit' to fit heat map to current width.
       */
      columnSize: 14,
      rowGapSize: 10,
      columnGapSize: 10,
      /*
       * Whether to draw heat map grid
       */
      drawGrid: true,
      /*
       * Heat map grid color
       */
      gridColor: '#808080',

      showRowNumber: false,
      /*
       * Heat map grid thickness in pixels
       */
      gridThickness: 0.1,

      rowDendrogramLineWidth: 0.7,
      columnDendrogramLineWidth: 0.7,
      height: 'window', // set the available height for the
      // heat map. If not
      // set, it will be determined automatically
      width: undefined, // set the available width for the
      // heat map. If not
      // set, it will be determined automatically
      /* Whether to focus this tab */
      focus: true,
      tooltipMode: 0, // 0=top status bar, 1=dialog, 2=follow
      inheritFromParent: true,
      inheritFromParentOptions: {
        transpose: false
      },
      /** Callback function to invoke for customizing inline matrix tooltips. */
      tooltip: undefined,
      structureUrlProvider: undefined,
      promises: undefined, // additional promises to wait
      // for
      // not inherited
      renderReady: undefined,
      // not inherited
      datasetReady: undefined,
      // inherited
      tabOpened: undefined,
      loadedCallback: undefined,
      name: undefined,
      rowsSortable: true,
      columnsSortable: true,
      popupEnabled: true,
      symmetric: false,
      keyboard: true,
      inlineTooltip: true,
      // Prevent mousewheel default (stops accidental page back on Mac), but also prevents page
      // scrolling
      standalone: false,
      $loadingImage: morpheus.Util.createLoadingEl()

    }, options);

  var resolveFunction;
  this.promise = new Promise(function (resolve, reject) {
    resolveFunction = resolve;
  });
  for (var i = 0; i < dontExtend.length; i++) {
    var field = dontExtend[i];
    options[field] = cache[i];
  }
  if (options.menu == null) {
    options.menu = {
      File: [
        'Open', null, 'Save Image', 'Save Dataset', 'Save Session', null, 'Close Tab', null, 'Rename' +
        ' Tab'],
      Tools: [
        'New Heat Map',
        null,
        'Hierarchical Clustering',
        'KMeans Clustering',
        null,
        'Marker Selection',
        'Nearest Neighbors',
        'Create Calculated Annotation',
        null,
        'Adjust',
        'Collapse',
        'Similarity Matrix',
        'Transpose',
        null,
        'Chart',
        null,
        't-SNE',
        null,
        'Sort/Group',
        'Filter',
        null,
        'API'],
      View: [
        'Zoom In', 'Zoom Out', null, 'Fit To Window', 'Fit Rows To Window', 'Fit Columns To Window', null, '100%', null,
        'Options'],
      Edit: [
        'Copy Image',
        'Copy Selected Dataset',
        null,
        'Move Selected Rows To Top',
        'Annotate Selected Rows',
        'Copy Selected Rows',
        'Invert' +
        ' Selected Rows',
        'Select All Rows',
        'Clear Selected Rows',
        null,
        'Move Selected Columns To Top',
        'Annotate Selected Columns',
        'Copy Selected Columns',
        'Invert' +
        ' Selected Columns',
        'Select All Columns',
        'Clear Selected Columns'],
      Help: [
        'Find Action', null, 'Contact', 'Configuration', 'Tutorial', 'Source Code', null, 'Keyboard' +
        ' Shortcuts']
    };
  }
  if (options.toolbar == null) {
    options.toolbar = [
      'Search Rows', 'Search Columns', 'Dimensions', 'Zoom', 'Options', 'Save Image', 'Filter',
      'Sort/Group', 'Color Key'];
  }

  this.options = options;
  this.tooltipProvider = morpheus.HeatMapTooltipProvider;
  if (!options.el) {
    this.$el = $('<div></div>');
  } else {
    this.$el = $(options.el);
  }
  this.rowGapSize = options.rowGapSize;
  this.columnGapSize = options.columnGapSize;
  this.actionManager = new morpheus.ActionManager();
  this.actionManager.heatMap = this;
  this.$el.addClass('morpheus');

  if (this.options.dataset == null) {
    var datasetFormBuilder = new morpheus.FormBuilder();
    datasetFormBuilder.append({
      name: 'file',
      type: 'file'
    });
    this.options.dataset = new Promise(function (resolve, reject) {
      morpheus.FormBuilder.showOkCancel({
        title: 'Dataset',
        appendTo: _this.getContentEl(),
        focus: _this.getFocusEl(),
        content: datasetFormBuilder.$form,
        okCallback: function () {
          var file = datasetFormBuilder.getValue('file');
          morpheus.DatasetUtil.read(file).then(function (dataset) {
            resolve(dataset);
          }).catch(function (err) {
            reject(err);
          });
        },
        cancelCallback: function () {
          reject('Session cancelled.');
        }
      });
    });

  }
  if (this.options.name == null) {
    this.options.name = morpheus.Util.getBaseFileName(morpheus.Util.getFileName(this.options.dataset.file ? this.options.dataset.file
      : this.options.dataset));
  }

  var isPrimary = this.options.parent == null;
  if (this.options.parent == null) {

    if (!morpheus.Util.isHeadless()) {
      if (this.options.tabManager == null) {
        this.tabManager =
          new morpheus.TabManager({
            landingPage: function () {
              if (_this.options.landingPage == null) {
                _this.options.landingPage = new morpheus.LandingPage({tabManager: _this.tabManager});
                _this.options.landingPage.$el.prependTo(_this.$el);
              }
              return _this.options.landingPage;
            },
            autohideTabBar: this.options.autohideTabBar
          });
      } else {
        this.tabManager = this.options.tabManager;
      }

      if (this.options.tabManager == null) {
        this.tabManager.appendTo(this.$el);
      }
    }
  } else {
    if (this.options.inheritFromParent) {
      this.popupItems = this.options.parent.popupItems;
      if (!this.options.tabOpened) {
        this.options.tabOpened = this.options.parent.options.tabOpened;
      }
      this.options.drawCallback = this.options.parent.options.drawCallback;
    }
    this.tabManager = this.options.parent.tabManager;
  }
  this.$content = $('<div></div>');
  this.$content.css({
    'width': '100%',
    'user-select': 'none',

    '-webkit-user-select': 'none',
    '-webkit-user-drag': 'none',
    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',

    '-moz-user-select': 'none',
    '-moz-user-drag': 'none',
    '-moz-tap-highlight-color': 'rgba(0, 0, 0, 0)',

    '-ms-user-select': 'none',
    '-ms-user-drag': 'none',
    '-ms-tap-highlight-color': 'rgba(0, 0, 0, 0)',

    '-o-user-select': 'none',
    '-o-user-drag': 'none',
    '-o-tap-highlight-color': 'rgba(0, 0, 0, 0)',

    'overflow-x': 'visible',
    'overflow-y': 'visible'
  });

  this.$content.on('remove.morpheus', function () {
    _this.$content.off('remove.morpheus');
    _this.dispose();
  });
  if (!morpheus.Util.isHeadless()) {
    this.menu = new morpheus.HeatMapMenu(this);
    var tab = this.tabManager.add({
      $el: this.$content,
      closeable: this.options.closeable,
      rename: this.options.rename,
      title: this.options.name,
      object: this,
      focus: this.options.focus
    });
    this.tabId = tab.id;
    this.$tabPanel = tab.$panel;
  }
  if (options.$loadingImage) {
    options.$loadingImage.appendTo(this.$content);
  }

  this.options.dataSource = !options.dataset ? ''
    : (options.dataset.file ? options.dataset.file : options.dataset);
  this._togglingInfoWindow = false;

  var promises = [];
  if (options.promises) {
    for (var i = 0; i < options.promises.length; i++) {
      promises.push(options.promises[i]);
    }
  }
  this.whenLoaded = [];

  if (options.rowAnnotations) {
    var rowDef = morpheus.DatasetUtil.annotate({
      annotations: options.rowAnnotations,
      isColumns: false
    });
    rowDef.then(function (callbacks) {
      _this.whenLoaded = _this.whenLoaded.concat(callbacks);
    });
    promises.push(rowDef);

  }
  if (options.columnAnnotations) {
    var columnDef = morpheus.DatasetUtil.annotate({
      annotations: options.columnAnnotations,
      isColumns: true
    });
    columnDef.then(function (callbacks) {
      _this.whenLoaded = _this.whenLoaded.concat(callbacks);
    });
    promises.push(columnDef);
  }

  if (options.rowDendrogram != null
    && _.isString(options.rowDendrogram)) {
    if (options.rowDendrogram[0] === '(') {
      _this.options.rowDendrogram = morpheus.DendrogramUtil.parseNewick(options.rowDendrogram);
    } else {
      var rowDendrogramDeferred = morpheus.Util.getText(options.rowDendrogram);
      rowDendrogramDeferred.then(function (text) {
        _this.options.rowDendrogram = morpheus.DendrogramUtil.parseNewick(text);
      });
      promises.push(rowDendrogramDeferred);
    }

  }
  if (options.columnDendrogram != null
    && _.isString(options.columnDendrogram)) {
    if (options.columnDendrogram[0] === '(') {
      _this.options.columnDendrogram = morpheus.DendrogramUtil.parseNewick(options.columnDendrogram);
    } else {
      var columnDendrogramDeferred = morpheus.Util.getText(options.columnDendrogram);
      columnDendrogramDeferred.then(function (text) {
        _this.options.columnDendrogram = morpheus.DendrogramUtil.parseNewick(text);
      });
      promises.push(columnDendrogramDeferred);
    }

  }

  var heatMapLoaded = function () {
    if (typeof window !== 'undefined') {
      $(window).on('orientationchange.morpheus resize.morpheus', _this.resizeListener = function () {
        _this.revalidate();
      });
    }
    _this.revalidate();
    if (options.loadedCallback) {
      options.loadedCallback(_this);
    }
    resolveFunction();
    if (_this.tabManager) {
      if (_this.options.focus) {
        _this.tabManager.setActiveTab(tab.id);
        _this.focus();
      } else if (_this.tabManager.getTabCount() === 1) {
        _this.tabManager.setActiveTab(tab.id);
      }
    }
    _this.$el.trigger('heatMapLoaded', _this);
  };
  if (morpheus.Util.isArray(options.dataset)) {
    var d = morpheus.DatasetUtil.readDatasetArray(options.dataset);
    d.catch(function (message) {
      if (_this.options.$loadingImage) {
        _this.options.$loadingImage.remove();
      }
      if (_this.options.error) {
        _this.options.error(message);
      }
      morpheus.FormBuilder.showInModal({
        title: 'Error',
        html: message,
        appendTo: _this.getContentEl(),
        focus: _this.getFocusEl()
      });
    }).then(function (joined) {
      if (_this.options.$loadingImage) {
        _this.options.$loadingImage.remove();
      }

      _this.options.dataset = joined;
      _this._init();
      if (joined.getRowMetadata().getByName('Source') != null
        && !_this.options.colorScheme) {
        _this.heatmap.getColorScheme().setSeparateColorSchemeForRowMetadataField(
          'Source');
      }

      _.each(
        options.dataset,
        function (option) {
          if (option.colorScheme) {
            _this.heatmap.getColorScheme().setCurrentValue(
              morpheus.Util.getBaseFileName(morpheus.Util.getFileName(option.dataset)));
            _this.heatmap.getColorScheme().setColorSupplierForCurrentValue(
              morpheus.AbstractColorSupplier.fromJSON(option.colorScheme));

          } else {
            try {
              _this.autoDisplay({
                extension: morpheus.Util.getExtension(morpheus.Util.getFileName(option.dataset)),
                filename: morpheus.Util.getBaseFileName(morpheus.Util.getFileName(option.dataset))
              });
            } catch (x) {
              console.log('Autodisplay errror');
            }

          }
        });

      heatMapLoaded();
    });
  } else {
    var dsPromise = options.dataset.file ? morpheus.DatasetUtil.read(
      options.dataset.file, options.dataset.options)
      : morpheus.DatasetUtil.read(options.dataset);
    dsPromise.then(function (dataset) {
      _this.options.dataset = dataset;
    }).catch(function (err) {
      _this.options.$loadingImage.remove();
      var message = [
        'Error opening '
        + (options.dataset.file ? morpheus.Util.getFileName(options.dataset.file) : morpheus.Util.getFileName(options.dataset)) + '.'];

      if (err.message) {
        message.push('<br />Cause: ');
        message.push(err.message);

      }
      if (_this.options.error) {
        _this.options.error(message);
      }
      morpheus.FormBuilder.showInModal({
        title: 'Error',
        html: message.join(''),
        appendTo: _this.getContentEl(),
        focus: _this.getFocusEl()
      });
    });
    promises.push(dsPromise);
    var datasetOverlay = null;
    if (options.datasetOverlay) {
      var d = options.datasetOverlay.file ? morpheus.DatasetUtil.read(
        options.datasetOverlay.file, options.datasetOverlay.options)
        : morpheus.DatasetUtil.read(options.datasetOverlay);
      d.then(function (dataset) {
        datasetOverlay = dataset;
      });
      promises.push(d);
    }
    Promise.all(promises).then(function () {
      if (_this.options.$loadingImage) {
        _this.options.$loadingImage.remove();
      }
      if (_this.options.dataset == null) {
        return _this.tabManager.remove(_this.tabId);
      }
      _this._init();
      if (datasetOverlay) {
        morpheus.DatasetUtil.overlay({
          dataset: _this.options.dataset,
          newDataset: datasetOverlay,
          rowAnnotationName: 'id',
          newRowAnnotationName: 'id',
          columnAnnotationName: 'id',
          newColumnAnnotationName: 'id'
        });
      }
      heatMapLoaded();
    });
  }
};

morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS = 6;

/**
 *
 * @param tool A tool instance
 * @param heatMap The calling heat map instance
 * @param callback Optional callback to invoke when tool is then
 */
morpheus.HeatMap.showTool = function (tool, heatMap, callback) {
  if (tool.gui) {
    var gui = tool.gui(heatMap.getProject());
    var formBuilder = new morpheus.FormBuilder();
    _.each(gui, function (item) {
      formBuilder.append(item);
    });
    var tabId = heatMap.getTabManager().getActiveTabId();
    if (tool.init) {
      tool.init(heatMap.getProject(), formBuilder, {
        heatMap: heatMap
      });
    }
    heatMap.trigger('beforeToolShown', {
      tool: tool,
      formBuilder: formBuilder
    });
    var okCallback = function () {
      var $dialogContent = $('<div><span>' + tool.toString() + '...</span><div><progress></progress></div><button class="btn' +
        ' btn-xs btn-default" style="margin-left:6px;display: none;">Cancel</button></div>');
      var value = null;

      var $dialog = morpheus.FormBuilder.showInDraggableDiv({
        $content: $dialogContent,
        appendTo: heatMap.getContentEl(),
        width: 'auto'
      });
      morpheus.DialogUtil.add($dialog);
      var input = {};
      _.each(gui, function (item) {
        input[item.name] = formBuilder.getValue(item.name);
      });
      // give ui a chance to update

      setTimeout(function () {
        value = tool.execute({
          heatMap: heatMap,
          project: heatMap.getProject(),
          input: input
        });
        if (value instanceof Worker) {
          morpheus.DialogUtil.remove($dialog);
          $dialogContent.find('button').css('display', '').on('click', function () {
            value.terminate();
          });
          value.onerror = function (e) {
            value.terminate();
            morpheus.FormBuilder.showInModal({
              title: 'Error',
              html: e,
              close: 'Close',
              focus: heatMap.getFocusEl(),
              appendTo: heatMap.getContentEl()
            });
            if (e.stack) {
              console.log(e.stack);
            }
          };
          var terminate = _.bind(value.terminate, value);
          value.terminate = function () {
            terminate();
            $dialog.remove();
            if (callback) {
              callback(input);
            }
          };
        } else {
          if (value != null && typeof value.then === 'function') { // promise
            value.finally(function () {
              if (callback) {
                callback(input);
              }
              $dialog.remove();
              morpheus.DialogUtil.remove($dialog);
            });
          } else {
            if (callback) {
              callback(input);
            }
            $dialog.remove();
            morpheus.DialogUtil.remove($dialog);
          }

        }
      }, 20);
      // setTimeout(function () {
      //   // in case an exception was thrown
      //   if (!(value instanceof Worker)) {
      //     $dialog.remove();
      //   }
      // }, 5000);

    };
    var $formDiv;
    tool.ok = function () {
      $formDiv.modal('hide');
      okCallback();
    };
    var guiOptions = $.extend({}, {
      ok: true
    }, gui.options);
    $formDiv = morpheus.FormBuilder.showOkCancel({
      title: tool.toString(),
      apply: tool.apply,
      ok: guiOptions.ok,
      cancel: guiOptions.cancel,
      size: guiOptions.size,
      draggable: true,
      content: formBuilder.$form,
      appendTo: heatMap.getContentEl(),
      align: 'right',
      okCallback: okCallback,
      focus: heatMap.getFocusEl()
    });
  } else { // run headless
    tool.execute({
      heatMap: heatMap,
      project: heatMap.getProject(),
      input: {}
    });
    if (callback) {
      callback({});
    }
  }
};

morpheus.HeatMap.getSpaces = function (groupByKeys, length, gapSize) {
  var previousArray = [];
  var nkeys = groupByKeys.length;
  for (var keyIndex = 0; keyIndex < nkeys; keyIndex++) {
    var key = groupByKeys[keyIndex];
    previousArray.push(key.getValue(0));
  }
  var spaces = [];
  var sum = 0;
  spaces.push(sum);
  for (var i = 1; i < length; i++) {
    var isEqual = true;
    for (var keyIndex = 0; keyIndex < nkeys; keyIndex++) {
      var key = groupByKeys[keyIndex];
      var comparator = key.getComparator();
      var val = key.getValue(i);
      var c = comparator(val, previousArray[keyIndex]);
      if (c !== 0) { // not equal, add space
        isEqual = false;
        for (var keyIndex2 = 0; keyIndex2 < nkeys; keyIndex2++) {
          previousArray[keyIndex2] = groupByKeys[keyIndex2].getValue(i);
        }
        break;
      }
    }
    if (!isEqual) {
      sum += gapSize;
    }
    spaces.push(sum);
  }
  return spaces;
};
morpheus.HeatMap.createGroupBySpaces = function (dataset, groupByKeys, gapSize, isColumns) {
  if (groupByKeys.length > 0) {
    var nkeys = groupByKeys.length;
    for (var keyIndex = 0; keyIndex < nkeys; keyIndex++) {
      groupByKeys[keyIndex].init(groupByKeys[keyIndex].isColumns() ? new morpheus.TransposedDatasetView(dataset) : dataset);
    }
    return morpheus.HeatMap.getSpaces(groupByKeys, isColumns ? dataset.getColumnCount() : dataset.getRowCount(),
      gapSize);
  }
};
morpheus.HeatMap.isDendrogramVisible = function (project, isColumns) {
  var sortKeys = isColumns ? project.getColumnSortKeys() : project.getRowSortKeys();
  if (sortKeys.length === 0) {
    return true;
  }
  // var filter = isColumns ? this.project.getColumnFilter()
  //   : this.project.getRowFilter();
  // // TODO compare filters
  var size = isColumns ? project.getSortedFilteredDataset().getColumnCount()
    : project.getSortedFilteredDataset().getRowCount();
  for (var i = 0; i < sortKeys.length; i++) {
    if (!sortKeys[i].isPreservesDendrogram() || sortKeys[i].nvisible !== size) {
      return false;
    }
  }
  return true;
};

morpheus.HeatMap.prototype = {
  updatingScroll: false,
  getWhitespaceEl: function () {
    return this.$whitespace;
  },
  getActionManager: function () {
    return this.actionManager;
  },
  autoDisplay: function (options) {
    if (options.filename == null) {
      options.filename = '';
    }
    var colorScheme;
    if (options.extension === 'segtab' || options.extension === 'seg') {
      colorScheme = {
        scalingMode: 'fixed',
        values: morpheus.HeatMapColorScheme.Predefined.CN().values.map(function (value) {
          return Math.pow(2, 1 + value);
        }),
        colors: morpheus.HeatMapColorScheme.Predefined.CN().colors
      };
    } else if (options.extension === 'maf') {
      colorScheme = morpheus.HeatMapColorScheme.Predefined.MAF();
      var rowMutProfile = this.project.getFullDataset().getRowMetadata().getByName('mutation_summary');
      var fieldNames = rowMutProfile.getProperties().get(morpheus.VectorKeys.FIELDS);
      if (fieldNames == null) {
        fieldNames = morpheus.MafFileReader.FIELD_NAMES;
        rowMutProfile.getProperties().set(morpheus.VectorKeys.FIELDS, fieldNames);
      }
      var useMafColorMap = true;
      if (fieldNames.length !== morpheus.MafFileReader.FIELD_NAMES.length) {
        useMafColorMap = false;
      } else {
        for (var i = 0; i < fieldNames.length; i++) {
          if (fieldNames[i] !== morpheus.MafFileReader.FIELD_NAMES[i]) {
            useMafColorMap = false;
            break;
          }
        }
      }
      if (!useMafColorMap) {
        colorScheme = {
          scalingMode: 'fixed',
          stepped: true,
          values: [0],
          colors: ['rgb(255,255,255)']
        };
        for (var i = 0; i < fieldNames.length; i++) {
          colorScheme.values.push(i + 1);
          colorScheme.colors.push(morpheus.VectorColorModel.TWENTY_COLORS[i % morpheus.VectorColorModel.TWENTY_COLORS.length]);
          colorScheme.names.push(fieldNames[i]);
        }
      }
      var columnMutationSummaryVectors = [];
      var columnMutationSummaryNames = ['mutation_summary', 'mutation_summary_selection'];
      for (var i = 0; i < columnMutationSummaryNames.length; i++) {
        var name = columnMutationSummaryNames[i];
        if (this.project.getFullDataset().getColumnMetadata().getByName(name)) {
          columnMutationSummaryVectors.push(this.project.getFullDataset().getColumnMetadata().getByName(name));
          track = this.getTrack(name, true);
          if (track) {
            track.settingFromConfig('stacked_bar');
            if (name === 'mutation_summary_selection') {
              track.settings.autoscaleAlways = true;
            }
          }
        }
      }

      var track = this.getTrack('mutation_summary', false);
      if (track) {
        track.settingFromConfig('stacked_bar');
      }

      for (var i = 1; i < colorScheme.colors.length; i++) {
        if (rowMutProfile) {
          this.getProject().getRowColorModel().setMappedValue(
            rowMutProfile, i - 1, colorScheme.colors[i]);
        }
        for (var j = 0; j < columnMutationSummaryVectors.length; j++) {
          this.getProject().getColumnColorModel().setMappedValue(
            columnMutationSummaryVectors[j], i - 1, colorScheme.colors[i]);
        }

      }
    } else if (options.extension === 'gmt') {
      colorScheme = morpheus.HeatMapColorScheme.Predefined.BINARY();
    } else if (options.filename === 'all_lesions.conf_99'
      || options.filename === 'all_data_by_genes.txt' || options.filename.toLowerCase().indexOf('gistic') !== -1) {
      colorScheme = {
        scalingMode: 'fixed',
        values: [-0.5, 0, 0.5],
        colors: ['blue', 'white', 'red']
      };
    } else if (options.filename.toLowerCase().indexOf('copynumber') !== -1 ||
      options.filename.toLowerCase().indexOf('copy number') !== -1) {
      colorScheme = {
        scalingMode: 'fixed',
        values: [-1.5, 0, 1.5],
        colors: ['blue', 'white', 'red']
      };
    }

    if (colorScheme && options.filename && this.heatmap.getColorScheme()) {
      this.heatmap.getColorScheme().setCurrentValue(options.filename);
      this.heatmap.getColorScheme().setColorSupplierForCurrentValue(
        morpheus.AbstractColorSupplier.fromJSON(colorScheme));
    }
    return colorScheme;
  },
  /**
   *
   * @param sortOrder
   * @param isColumns
   *            Whether sorting based on column selection
   * @param append
   *            Whether to add to existing sort order
   */
  sortBasedOnSelection: function (sortOrder, isColumns, append) {
    // if isColumns, sort rows
    var project = this.project;
    var selectionModel = isColumns ? project.getColumnSelectionModel()
      : project.getRowSelectionModel();
    var modelIndices = selectionModel.toModelIndices();
    if (modelIndices.length === 0) {
      return;
    }

    var priorSortKeyIndex = -1;
    if (sortOrder == null) {
      // toggle sort order?
      var existingSortKeys = isColumns ? project.getRowSortKeys()
        : project.getColumnSortKeys();
      for (var i = 0, length = existingSortKeys.length; i < length; i++) {
        var key = existingSortKeys[i];
        if (key instanceof morpheus.SortByValuesKey
          && morpheus.Util.arrayEquals(key.modelIndices,
            modelIndices)) {
          priorSortKeyIndex = i;
          if (key.getSortOrder() === morpheus.SortKey.SortOrder.UNSORTED) {
            sortOrder = morpheus.SortKey.SortOrder.DESCENDING; // 1st
            // click
          } else if (key.getSortOrder() === morpheus.SortKey.SortOrder.DESCENDING) {
            sortOrder = morpheus.SortKey.SortOrder.ASCENDING; // 2nd
            // click
          } else if (key.getSortOrder() === morpheus.SortKey.SortOrder.ASCENDING) {
            sortOrder = morpheus.SortKey.SortOrder.TOP_N; // 3rd
            // click
          } else if (key.getSortOrder() === morpheus.SortKey.SortOrder.TOP_N) {
            sortOrder = morpheus.SortKey.SortOrder.UNSORTED; // 4th
            // click
          }
          break;
        }
      }

    }

    if (sortOrder == null) {
      sortOrder = morpheus.SortKey.SortOrder.DESCENDING;
    }

    var sortKeys;
    if (append) {
      sortKeys = !isColumns ? project.getColumnSortKeys() : project.getRowSortKeys();

      if (priorSortKeyIndex !== -1) {
        if (sortOrder === morpheus.SortKey.SortOrder.UNSORTED) {
          // remove existing sort key
          sortKeys.splice(priorSortKeyIndex, 1);
        } else {
          sortKeys[priorSortKeyIndex].setSortOrder(sortOrder);
        }

      } else {
        if (sortOrder !== morpheus.SortKey.SortOrder.UNSORTED) {
          sortKeys.push(new morpheus.SortByValuesKey(modelIndices,
            sortOrder, !isColumns));
        }
        // add new sort key
      }

      sortKeys = morpheus.SortKey.keepExistingSortKeys(sortKeys,
        !isColumns ? project.getColumnSortKeys() : project.getRowSortKeys());

    } else {
      var newSortKeys = sortOrder === morpheus.SortKey.SortOrder.UNSORTED ? []
        : [
          new morpheus.SortByValuesKey(modelIndices, sortOrder,
            !isColumns)];
      sortKeys = morpheus.SortKey.keepExistingSortKeys(newSortKeys,
        !isColumns ? project.getColumnSortKeys() : project.getRowSortKeys());
    }

    if (!isColumns) { // sort columns by selected rows
      project.setColumnSortKeys(sortKeys, true);
      this.scrollLeft(0);
    } else { // sort rows by selected column
      project.setRowSortKeys(sortKeys, true);
      this.scrollTop(0);
    }
    morpheus.Util.trackEvent({
      eventCategory: 'Tool',
      eventAction: isColumns ? 'sortRowsBasedOnSelection' : 'sortColumnsBasedOnSelection'
    });

  },
  getToolbarElement: function () {
    return this.toolbar.$el;
  },
  getToolbar: function () {
    return this.toolbar;
  },
  setName: function (name) {
    this.options.name = name;
  },
  getName: function () {
    return this.options.name;
  },
  showOptions: function () {
    new morpheus.HeatMapOptions(this);
  },
  getProject: function () {
    return this.project;
  },
  getDendrogram: function (isColumns) {
    return isColumns ? this.columnDendrogram : this.rowDendrogram;
  },
  toJSON: function (options) {
    var _this = this;
    var json = {};
    // color scheme
    json.colorScheme = this.heatmap.getColorScheme().toJSON();

    json.name = this.options.name;

    json.showRowNumber = this.isShowRowNumber();

    // annotation shapes
    json.rowShapeModel = this.getProject().getRowShapeModel().toJSON(this.getVisibleTracks(false));
    json.columnShapeModel = this.getProject().getColumnShapeModel().toJSON(this.getVisibleTracks(true));

    // annotation font
    json.rowFontModel = this.getProject().getRowFontModel().toJSON(this.getVisibleTracks(false));
    json.columnFontModel = this.getProject().getColumnFontModel().toJSON(this.getVisibleTracks(true));

    // annotation colors
    json.rowColorModel = this.getProject().getRowColorModel().toJSON(this.getVisibleTracks(false));
    json.columnColorModel = this.getProject().getColumnColorModel().toJSON(this.getVisibleTracks(true));
    // annotation display
    json.rows = this.getVisibleTracks(false).map(function (track) {
      var size = morpheus.CanvasUtil.getPreferredSize(_this.getTrackHeaderByIndex(_this.getTrackIndex(track.getName(), false), false));
      var obj = track.settings;
      obj.field = track.getName();
      obj.size = {
        width: size.widthSet ? size.width : undefined
      };
      return obj;
    });
    json.columns = this.getVisibleTracks(true).map(function (track) {
      var size = morpheus.CanvasUtil.getPreferredSize(_this.getTrackHeaderByIndex(_this.getTrackIndex(track.getName(), true), true));
      var obj = track.settings;
      obj.field = track.getName();
      obj.size = {
        width: size.widthSet ? size.width : undefined,
        height: size.heightSet ? size.height : undefined
      };
      return obj;
    });

    // sort
    json.rowSortBy = morpheus.SortKey.toJSON(this.getProject().getRowSortKeys());
    json.columnSortBy = morpheus.SortKey.toJSON(this.getProject().getColumnSortKeys());

    // group
    json.rowGroupBy = morpheus.SortKey.toJSON(this.getProject().getGroupRows());
    json.columnGroupBy = morpheus.SortKey.toJSON(this.getProject().getGroupColumns());

    // filter
    json.rowFilter = morpheus.CombinedFilter.toJSON(this.getProject().getRowFilter());
    json.columnFilter = morpheus.CombinedFilter.toJSON(this.getProject().getColumnFilter());

    // element size, symmetric
    json.symmetric = this.options.symmetric;
    json.rowSize = this.heatmap.getRowPositions().getSize();
    json.columnSize = this.heatmap.getColumnPositions().getSize();
    json.rowGapSize = this.heatmap.rowGapSize;
    json.columnGapSize = this.heatmap.columnGapSize;
    json.drawGrid = this.heatmap.isDrawGrid();
    json.gridColor = this.heatmap.getGridColor();
    json.gridThickness = this.heatmap.getGridThickness();
    json.drawValues = this.heatmap.isDrawValues();
    json.shape = this.heatmap.getShape();

    // selection
    json.rowSelection = this.getProject().getRowSelectionModel().toModelIndices();
    json.columnSelection = this.getProject().getColumnSelectionModel().toModelIndices();

    // search terms
    json.rowSearchTerm = this.toolbar.getSearchField(morpheus.HeatMapToolBar.ROW_SEARCH_FIELD).val();
    json.columnSearchTerm = this.toolbar.getSearchField(morpheus.HeatMapToolBar.COLUMN_SEARCH_FIELD).val();

    //  dendrogram
    if (this.rowDendrogram != null) {
      var out = [];
      morpheus.DendrogramUtil.writeNewick(this.rowDendrogram.tree.rootNode, out, function (n) {
        return n.index;
      });
      json.rowDendrogram = out.join('');
      json.rowDendrogramField = null;
      json.rowDendrogramLineWidth = this.rowDendrogram.lineWidth;
    }
    if (this.columnDendrogram != null) {
      var out = [];
      morpheus.DendrogramUtil.writeNewick(this.columnDendrogram.tree.rootNode, out, function (n) {
        return n.index;
      });
      json.columnDendrogram = out.join('');
      json.columnDendrogramField = null;
      json.columnDendrogramLineWidth = this.columnDendrogram.lineWidth;
    }
    if (options.dataset) {
      json.dataset = morpheus.Dataset.toJSON(this.getProject().getFullDataset());
    }

    return json;
  },
  /**
   * @param tree
   *            An object with maxHeight, a rootNode, leafNodes, and
   *            nLeafNodes
   */
  setDendrogram: function (tree, isColumns, modelOrder) {
    var dendrogram = isColumns ? this.columnDendrogram : this.rowDendrogram;
    if (dendrogram) {
      dendrogram.dispose();
      dendrogram = null;
    }
    if (tree != null) {
      //  var modelIndexSet = new morpheus.Set();
      var size = isColumns ? this.project.getFullDataset().getColumnCount() : this.project.getFullDataset().getRowCount();
      if (isColumns) {
        dendrogram = new morpheus.ColumnDendrogram(this, tree,
          this.heatmap.getColumnPositions(), this.project);
        dendrogram.filter = this.project.getColumnFilter().shallowClone();
        this.columnDendrogram = dendrogram;
        var sortKey = new morpheus.SpecifiedModelSortOrder(modelOrder,
          modelOrder.length, 'dendrogram', true);
        sortKey.setPreservesDendrogram(true);
        sortKey.setLockOrder(2);
        sortKey.setUnlockable(false);
        this.project.setColumnSortKeys(
          [sortKey], true);
      } else {
        dendrogram = new morpheus.RowDendrogram(this, tree,
          this.heatmap.getRowPositions(), this.project);
        dendrogram.filter = this.project.getRowFilter().shallowClone();
        this.rowDendrogram = dendrogram;
        var sortKey = new morpheus.SpecifiedModelSortOrder(modelOrder,
          modelOrder.length, 'dendrogram', false);
        sortKey.setPreservesDendrogram(true);
        sortKey.setLockOrder(2);
        sortKey.setUnlockable(false);
        this.project.setRowSortKeys(
          [sortKey], true);
      }
      dendrogram.appendTo(this.$parent);
      dendrogram.$label.appendTo(this.$parent);
      dendrogram.$squishedLabel.appendTo(this.$parent);

    } else { // no more dendrogram
      var sortKeys = isColumns ? this.project.getColumnSortKeys()
        : this.project.getRowSortKeys();
      // remove dendrogram sort key
      for (var i = 0; i < sortKeys.length; i++) {
        if (sortKeys[i].isPreservesDendrogram()) {
          sortKeys.splice(i, 1);
          i--;
        }
      }
      if (isColumns) {
        this.heatmap.getColumnPositions().setSquishedIndices(null);
        delete this.columnDendrogram;
        this.project.setColumnSortKeys(sortKeys, true);
      } else {
        delete this.rowDendrogram;
        this.project.setRowSortKeys(sortKeys, true);
        this.heatmap.getRowPositions().setSquishedIndices(null);
      }

    }
    // FIXME update grouping
    this.trigger('dendrogramChanged', {
      isColumns: isColumns
    });
  },
  getTabManager: function () {
    return this.tabManager;
  },
  getSelectedElementsText: function () {
    var _this = this;
    var project = this.project;
    var selectedViewIndices = project.getElementSelectionModel().getViewIndices();
    if (selectedViewIndices.size() > 0) {
      var tipText = [];
      var dataset = project.getSortedFilteredDataset();
      var rowTracks = _this.rowTracks.filter(function (t) {
        return t.settings.inlineTooltip;
      });
      var columnTracks = _this.columnTracks.filter(function (t) {
        return t.settings.inlineTooltip;
      });
      selectedViewIndices.forEach(function (id) {
        var rowIndex = id.getArray()[0];
        var columnIndex = id.getArray()[1];
        tipText.push(morpheus.Util.nf(dataset.getValue(rowIndex,
          columnIndex)));
        rowTracks.forEach(function (track) {
          tipText.push('\t');
          tipText.push(morpheus.Util.toString(dataset.getRowMetadata().getByName(track.name).getValue(
            rowIndex)));
        });
        columnTracks.forEach(function (track) {
          tipText.push('\t');
          tipText.push(morpheus.Util.toString(dataset.getColumnMetadata().getByName(track.name).getValue(columnIndex)));
        });

        tipText.push('\n');

      });
      return tipText.join('');

    }

  },
  _init: function () {
    var _this = this;
    morpheus.MetadataUtil.renameFields(this.options.dataset, this.options);
    var dataset = this.options.dataset;
    var rowDendrogram = this.options.rowDendrogram;
    var columnDendrogram = this.options.columnDendrogram;
    _.each(this.whenLoaded, function (f) {
      f(_this.options.dataset);
    });
    if (this.options.datasetReady) {
      var updatedDataset = this.options.datasetReady(dataset);
      if (updatedDataset) {
        dataset = updatedDataset;
      }
    }

    this.project = new morpheus.Project(dataset);

    if (this.tabManager) {
      this.tabManager.setTabTitle(this.tabId, this.project.getFullDataset().getRowCount()
        + ' row'
        + morpheus.Util.s(this.project.getFullDataset().getRowCount())
        + ' x '
        + this.project.getFullDataset().getColumnCount()
        + ' column'
        + morpheus.Util.s(this.project.getFullDataset().getColumnCount()));
    }
    if (this.options.inheritFromParent && this.options.parent != null) {
      morpheus.HeatMap.copyFromParent(this.project, this.options);
    }

    // filter ui will be initialized automatically
    if (this.options.rowFilter) {
      morpheus.CombinedFilter.fromJSON(_this.project.getRowFilter(), this.options.rowFilter);
      _this.project.setRowFilter(_this.project.getRowFilter(), true);
    }
    if (this.options.columnFilter) {
      this.options.columnFilter.filters.forEach(function (filter) {
        filter.isColumns = true;
      });
      morpheus.CombinedFilter.fromJSON(_this.project.getColumnFilter(), this.options.columnFilter);
      _this.project.setColumnFilter(_this.project.getColumnFilter(), true);
    }
    this.whenLoaded = null;
    this.$parent = $('<div></div>').css('position', 'relative');

    this.$parent.appendTo(this.$content);
    if (!morpheus.Util.isHeadless()) {
      this.toolbar = new morpheus.HeatMapToolBar(this);
    }

    // scroll bars at the bottom of the heatmap, and right of the heatmap
    // TODO along bottom of row metadata, and along left of column metadata
    // the viewport is the size of the visible region, the view is the full
    // size of the heat map
    this.vscroll = new morpheus.ScrollBar(true);
    this.vscroll.appendTo(this.$parent);
    this.vscroll.on('scroll', function () {
      if (_this.updatingScroll) {
        return;
      }
      _this.paintAll({
        paintRows: true,
        paintColumns: false,
        invalidateRows: true,
        invalidateColumns: false
      });
    });

    // for resizing column dendrogram
    this.beforeColumnTrackDivider = new morpheus.Divider(false);
    this.beforeColumnTrackDivider.appendTo(this.$parent);
    var dragStartHeight = 0;
    this.beforeColumnTrackDivider.on('resizeStart', function (e) {
      dragStartHeight = _this.columnDendrogram.getUnscaledHeight();
    }).on('resize', function (e) {
      // grow or shrink the column dendrogram
      var newHeight = Math.max(8, dragStartHeight + e.delta);
      _this.columnDendrogram.setPrefHeight(newHeight);
      _this.revalidate();
    }).on('resizeEnd', function () {
      dragStartHeight = 0;
    });

    // for resizing row dendrogram
    this.afterRowDendrogramDivider = new morpheus.Divider(true);
    this.afterRowDendrogramDivider.appendTo(this.$parent);
    var rowDendrogramStartWidth = 0;
    this.afterRowDendrogramDivider.on('resizeStart', function (e) {
      rowDendrogramStartWidth = _this.rowDendrogram.getUnscaledWidth();
    }).on('resize', function (e) {
      // grow or shrink the column dendrogram
      var newWidth = Math.max(8, rowDendrogramStartWidth + e.delta);
      _this.rowDendrogram.setPrefWidth(newWidth);
      _this.revalidate();
    }).on('resizeEnd', function () {
      rowDendrogramStartWidth = 0;
    });

    this.afterVerticalScrollBarDivider = new morpheus.Divider(true);
    this.afterVerticalScrollBarDivider.appendTo(this.$parent);
    var resizeStartHeatMapWidth = 0;
    this.afterVerticalScrollBarDivider.on('resizeStart', function (e) {
      resizeStartHeatMapWidth = _this.heatmap.getUnscaledWidth();
    }).on('resize', function (e) {
      // grow or shrink the heat map
      _this.heatmap.prefWidth = resizeStartHeatMapWidth + e.delta;
      _this.revalidate();
    });
    // horizontal scroll
    this.hscroll = new morpheus.ScrollBar(false);
    this.hscroll.appendTo(this.$parent);
    this.hscroll.on('scroll', function () {
      if (_this.updatingScroll) {
        return;
      }
      _this.paintAll({
        paintRows: false,
        paintColumns: true,
        invalidateRows: false,
        invalidateColumns: true
      });
    });
    this.$whitespace = $('<div style="position: absolute;"></div>');
    this.$whitespace.appendTo(this.$parent);
    var heatmap = new morpheus.HeatMapElementCanvas(this.project);
    if (this.options.drawCallback) {
      heatmap.setDrawCallback(this.options.drawCallback);
    }

    $(heatmap.canvas).on(
      'contextmenu',
      function (e) {
        var items = [];
        morpheus.Popup.showPopup(
          [

            {
              name: 'Copy Image',
              class: 'copy'
            },
            {
              name: 'Save Image (' + morpheus.Util.COMMAND_KEY + 'S)'
            },
            // {
            //   name: 'Copy Selection',
            //   disabled: _this.project
            //   .getElementSelectionModel()
            //   .count() === 0,
            //   class: 'copy'
            // },
            {
              separator: true
            },
            {
              name: 'Show Inline Tooltip',
              checked: _this.options.inlineTooltip
            }],
          {
            x: e.pageX,
            y: e.pageY
          },
          e.target,
          function (event, item) {
            if (item === 'Show Inline Tooltip') {
              _this.options.inlineTooltip = !_this.options.inlineTooltip;
            } else if (item === ('Save Image (' + morpheus.Util.COMMAND_KEY + 'S)')) {
              _this.getActionManager().execute('Save Image');
            } else if (item === 'Copy Selection') {
              var text = _this.getSelectedElementsText();
              if (text !== '') {
                event.clipboardData.setData(
                  'text/plain',
                  text);
              }
            } else if (item === 'Copy Image') {
              _this.getActionManager().execute('Copy Image', {event: event});
            } else {
              console.log(item + ' unknown.');
            }
          });

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      });
    heatmap.appendTo(this.$parent);
    this.heatmap = heatmap;
    var rowDendrogramSortKey = null;
    if (rowDendrogram != null) {
      var tree = rowDendrogram;
      if (tree.leafNodes.length !== this.project.getSortedFilteredDataset().getRowCount()) {
        console.log('# leaf nodes in row dendrogram ' + tree.leafNodes.length
          + ' != ' + this.project.getSortedFilteredDataset().getRowCount());
      } else {
        var rowIndices = null;
        // when saving a session the dataset is reordered to reflect the clustering
        if (this.options.rowDendrogramField != null) {
          var vector = dataset.getRowMetadata().getByName(
            this.options.rowDendrogramField);
          if (vector == null) {
            console.log(this.options.rowDendrogramField + ' not found in ' + morpheus.MetadataUtil.getMetadataNames(dataset.getRowMetadata()));
            throw new Error(this.options.rowDendrogramField + ' not found');
          }

          rowIndices = [];
          var map = new morpheus.Map();
          var re = /[,:]/g;
          var isString = morpheus.VectorUtil.getDataType(vector) === 'string';
          for (var j = 0, size = vector.size(); j < size; j++) {
            var key = vector.getValue(j);
            if (isString) {
              key = key.replace(re, '');
            }
            map.set(key, j);
          }
          // need to replace special characters to match ids in newick
          // file

          for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
            var index = map.get(tree.leafNodes[i].name);
            if (index === undefined) {
              console.log('Unable to find row dendrogram id '
                + tree.leafNodes[i].name
                + ' in row annotations');
              throw new Error('Unable to find row dendrogram id '
                + tree.leafNodes[i].name
                + ' in row annotations');
            }
            rowIndices.push(index);
          }
        } else {
          // see if leaf node ids are indices
          // for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
          //   var newickId = tree.leafNodes[i].name;
          //   newickId = parseInt(newickId);
          //   if (!isNaN(newickId)) {
          //     rowIndices.push(newickId);
          //   } else {
          //     break;
          //   }
          // }
          // if (rowIndices.length !== tree.leafNodes.length) {
          //   rowIndices = [];
          //   for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
          //     rowIndices.push(i);
          //   }
          // }
        }
        this.rowDendrogram = new morpheus.RowDendrogram(this, tree, heatmap.getRowPositions(), this.project, true);
        this.rowDendrogram.lineWidth = this.options.rowDendrogramLineWidth;
        this.rowDendrogram.appendTo(this.$parent);
        this.rowDendrogram.$label.appendTo(this.$parent);
        this.rowDendrogram.$squishedLabel.appendTo(this.$parent);
        if (rowIndices != null) {
          rowDendrogramSortKey = new morpheus.SpecifiedModelSortOrder(
            rowIndices, rowIndices.length, 'dendrogram');
          rowDendrogramSortKey.setLockOrder(2);
          rowDendrogramSortKey.setUnlockable(false);
          rowDendrogramSortKey.setPreservesDendrogram(true);
        }
      }
    }
    var columnDendrogramSortKey = null;
    if (columnDendrogram != null) {
      var tree = columnDendrogram;

      if (tree.leafNodes.length !== this.project.getSortedFilteredDataset().getColumnCount()) {
        console.log('# leaf nodes ' + tree.leafNodes.length + ' != ' + this.project.getSortedFilteredDataset().getColumnCount());
      } else {
        var columnIndices = null;
        if (this.options.columnDendrogramField != null) {
          columnIndices = [];
          var vector = dataset.getColumnMetadata().getByName(
            this.options.columnDendrogramField);
          if (vector == null) {
            console.log(this.options.columnDendrogramField + ' not found in ' + morpheus.MetadataUtil.getMetadataNames(dataset.getRowMetadata()));
            throw new Error(this.options.columnDendrogramField + ' not found');
          }
          var map = new morpheus.Map();
          var re = /[,:]/g;
          var isString = morpheus.VectorUtil.getDataType(vector) === 'string';
          for (var j = 0, size = vector.size(); j < size; j++) {
            var key = vector.getValue(j);
            if (isString) {
              key = key.replace(re, '');
            }
            map.set(key, j);
          }

          for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
            var index = map.get(tree.leafNodes[i].name);
            if (index === undefined) {
              throw 'Unable to find column dendrogram id '
              + tree.leafNodes[i].name
              + ' in column annotations';
            }
            columnIndices.push(index);
          }
        } else {
          // for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
          //   var newickId = tree.leafNodes[i].name;
          //   newickId = parseInt(newickId);
          //   if (!isNaN(newickId)) {
          //     columnIndices.push(newickId);
          //   } else {
          //     break;
          //   }
          // }
          // if (columnIndices.length !== tree.leafNodes.length) {
          //   columnIndices = [];
          //   for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
          //     columnIndices.push(i);
          //   }
          // }
        }
        this.columnDendrogram = new morpheus.ColumnDendrogram(this, tree,
          heatmap.getColumnPositions(), this.project, true);
        this.columnDendrogram.lineWidth = this.options.columnDendrogramLineWidth;
        this.columnDendrogram.appendTo(this.$parent);
        this.columnDendrogram.$label.appendTo(this.$parent);
        this.columnDendrogram.$squishedLabel.appendTo(this.$parent);
        if (columnIndices != null) {
          columnDendrogramSortKey = new morpheus.SpecifiedModelSortOrder(
            columnIndices, columnIndices.length, 'dendrogram');
          columnDendrogramSortKey.setLockOrder(2);
          columnDendrogramSortKey.setUnlockable(false);
          columnDendrogramSortKey.setPreservesDendrogram(true);
        }
      }
    }

    if (this.options.drawGrid != null) {
      this.heatmap.setDrawGrid(this.options.drawGrid);
    }

    if (this.options.gridColor != null) {
      this.heatmap.setGridColor(this.options.gridColor);
    }
    if (this.options.gridThickness != null) {
      this.heatmap.setGridThickness(this.options.gridThickness);
    }
    if (this.options.drawValues != null) {
      this.heatmap.setDrawValues(this.options.drawValues);
    }

    if (rowDendrogramSortKey != null) {
      this.project.setRowSortKeys([rowDendrogramSortKey]);
    }
    if (columnDendrogramSortKey != null) {
      this.project.setColumnSortKeys([columnDendrogramSortKey]);
    }
    if (this.options.rowSortBy && this.options.rowSortBy.length > 0) {
      this.project.setRowSortKeys(morpheus.SortKey.fromJSON(this.project, this.options.rowSortBy), false);
    }
    if (this.options.columnSortBy && this.options.columnSortBy.length > 0) {
      this.project.setColumnSortKeys(morpheus.SortKey.fromJSON(this.project, this.options.columnSortBy), false);
    }
    if (this.options.rowGroupBy != null && this.options.rowGroupBy.length > 0) {
      var keys = morpheus.SortKey.fromJSON(this.project, this.options.rowGroupBy);
      for (var i = 0; i < keys.length; i++) {
        this.project.groupRows.push(keys[i]);
      }
    }
    if (this.options.columnGroupBy != null && this.options.columnGroupBy.length > 0) {
      var keys = morpheus.SortKey.fromJSON(this.project, this.options.columnGroupBy);
      for (var i = 0; i < keys.length; i++) {
        this.project.groupColumns.push(keys[i]);
      }
    }
    if (this.options.rowSelection != null && this.options.rowSelection.length > 0) {
      var indices = new morpheus.Set();
      for (var i = 0, length = this.options.rowSelection.length; i < length; i++) {
        indices.add(this.project.convertModelRowIndexToView(this.options.rowSelection[i]));
      }
      this.project.getRowSelectionModel().setViewIndices(indices, false);
    }
    if (this.options.columnSelection != null && this.options.columnSelection.length > 0) {
      var indices = new morpheus.Set();
      for (var i = 0, length = this.options.columnSelection.length; i < length; i++) {
        indices.add(this.project.convertModelColumnIndexToView(this.options.columnSelection[i]));
      }
      this.project.getColumnSelectionModel().setViewIndices(indices, false);
    }
    if (this.options.rowSearchTerm != null && this.options.rowSearchTerm !== '') {
      this.toolbar.getSearchField(morpheus.HeatMapToolBar.ROW_SEARCH_FIELD).val(this.options.rowSearchTerm);
    }
    if (this.options.columnSearchTerm != null && this.options.columnSearchTerm !== '') {
      this.toolbar.getSearchField(morpheus.HeatMapToolBar.COLUMN_SEARCH_FIELD).val(this.options.columnSearchTerm);
    }

    this.vSortByValuesIndicator = new morpheus.SortByValuesIndicator(
      this.project, true, heatmap.getRowPositions());
    this.vSortByValuesIndicator.appendTo(this.$parent);
    this.hSortByValuesIndicator = new morpheus.SortByValuesIndicator(
      this.project, false, heatmap.getColumnPositions());
    this.hSortByValuesIndicator.appendTo(this.$parent);
    this.verticalSearchBar = new morpheus.ScentedSearch(this.project.getRowSelectionModel(), heatmap.getRowPositions(), true,
      this.vscroll, this);
    this.horizontalSearchBar = new morpheus.ScentedSearch(this.project.getColumnSelectionModel(), heatmap.getColumnPositions(),
      false, this.hscroll, this);
    this.rowTracks = [];
    this.rowTrackHeaders = [];
    this.columnTracks = [];
    this.columnTrackHeaders = [];
    if (this.options.rowSize != null && this.options.rowSize !== 'fit') {
      this.heatmap.getRowPositions().setSize(this.options.rowSize);
    }
    if (this.options.columnSize != null && this.options.columnSize !== 'fit') {
      this.heatmap.getColumnPositions().setSize(
        this.options.columnSize);
    }
    var setInitialDisplay = function (isColumns, options) {
      var nameToOption = new morpheus.Map();
      // at
      // least
      // one
      // display option
      // supplied

      var displaySpecified = (_this.options.parent != null && _this.options.inheritFromParent);
      if (options != null && options.length > 0) {
        displaySpecified = true;
        for (var i = 0; i < options.length; i++) {
          nameToOption.set(options[i].renameTo != null ? options[i].renameTo
            : options[i].field, options[i]);
        }
      }

      var displayMetadata = isColumns ? dataset.getColumnMetadata()
        : dataset.getRowMetadata();
      // see if default fields found
      if (!displaySpecified) {
        var defaultFieldsToShow = new morpheus.Set();
        ['id', 'name', 'description'].forEach(function (field) {
          defaultFieldsToShow.add(field);
        });
        for (var i = 0, metadataCount = displayMetadata.getMetadataCount(); i < metadataCount; i++) {
          var v = displayMetadata.get(i);
          if (defaultFieldsToShow.has(v.getName()) && !nameToOption.has(v.getName())) {
            nameToOption.set(v.getName(), {
              display: ['text']
            });
            displaySpecified = true;
          }
        }
      }
      var isFirst = true;
      for (var i = 0, metadataCount = displayMetadata.getMetadataCount(); i < metadataCount; i++) {
        var v = displayMetadata.get(i);
        var name = v.getName();
        var option = nameToOption.get(name);
        if (displaySpecified && option == null) {
          continue;
        }

        var count = isColumns ? dataset.getColumnCount() : dataset.getRowCount();
        if (option == null && !displaySpecified && count > 1
          && !morpheus.VectorUtil.containsMoreThanOneValue(v)) {
          continue;
        }
        if (option == null) {
          option = {};
        }
        if (option.title) {
          v.getProperties().set(morpheus.VectorKeys.TITLE,
            option.title);
        }

        if (option.display == null) {
          if (name === 'name' || name === 'id' || isFirst) {
            option.inlineTooltip = true;
            option.display = ['text'];
          } else {
            option.display = isColumns ? 'color,highlight' : 'text';
          }
        }
        isFirst = false;
        var track = _this.addTrack(name, isColumns, option);

        if (option.size) {
          if (!isColumns && option.size.width != null) {
            var header = _this.getTrackHeaderByIndex(_this.getTrackIndex(name, isColumns), isColumns);
            track.setPrefWidth(option.size.width); // can only set width
            header.setPrefWidth(option.size.width);
          } else if (isColumns && (option.size.width != null || option.size.height != null)) {
            var header = _this.getTrackHeaderByIndex(_this.getTrackIndex(name, isColumns), isColumns);
            if (option.size.height) {
              track.setPrefHeight(option.size.height);
              header.setPrefHeight(option.size.height);
            }
            if (option.size.width) {
              // TODO set width for all tracks since they all have same width
              track.setPrefWidth(option.size.width);
              header.setPrefWidth(option.size.width);
            }
          }
        }
        if (option.header && option.header.font) {
          var header = _this.getTrackHeaderByIndex(_this.getTrackIndex(name, isColumns), isColumns);
          header.font = option.header.font;
        }
        if (option.formatter) {
          v.getProperties().set(morpheus.VectorKeys.FORMATTER, morpheus.Util.createNumberFormat(option.formatter));
        }
        if (track.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)
          && option.color) {
          var m = isColumns ? _this.project.getColumnColorModel()
            : _this.project.getRowColorModel();
          if (track.getFullVector().getProperties.get(morpheus.VectorKeys.DISCRETE)) {
            _.each(options.color, function (p) {
              m.setMappedValue(v, p.value, p.color);
            });
          } else {
            var cs = m.createContinuousColorMap(v);
            var min = Number.MAX_VALUE;
            var max = -Number.MAX_VALUE;
            _.each(options.color, function (p) {
              min = Math.min(min, p.value);
              max = Math.max(max, p.value);
            });

            cs.setMin(min);
            cs.setMax(max);
            var valueToFraction = d3.scale.linear().domain(
              [cs.getMin(), cs.getMax()]).range(
              [0, 1]).clamp(true);
            var fractions = [];
            var colors = [];
            _.each(options.color, function (p) {
              fractions.push(valueToFraction(p.value));
              colors.push(p.color);
            });

            cs.setFractions({
              fractions: fractions,
              colors: colors
            });
          }

          if (track.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)
            && option.shape) {
            var m = isColumns ? _this.project.getColumnShapeModel()
              : _this.project.getRowShapeModel();
            _.each(options.shape, function (p) {
              m.setMappedValue(v, p.value, p.shape);
            });

          }
        }
      }
    };
    setInitialDisplay(false, this.options.rows);
    setInitialDisplay(true, this.options.columns);

    function reorderTracks(array, isColumns) {
      if (array == null || array.length <= 1) {
        return;
      }
      var nameOrderPairs = [];
      var found = false;
      array.forEach(function (item, index) {

        var name = item.renameTo || item.field;
        var order = index;
        if (item.order != null) {
          order = item.order;
          found = true;
        }
        nameOrderPairs.push({
          name: name,
          order: order
        });
      });
      if (!found) {
        array.forEach(function (item, index) {
          var name = item.renameTo || item.field;
          nameOrderPairs.push({
            name: name,
            order: index
          });
        });
      }

      nameOrderPairs.sort(function (a, b) {
        return (a.order === b.order ? 0 : (a.order < b.order ? -1
          : 1));
      });
      for (var i = 0, counter = 0; i < nameOrderPairs.length; i++) {
        var index = _this.getTrackIndex(nameOrderPairs[i].name,
          isColumns);
        if (index !== -1) {
          _this.moveTrack(index, counter, isColumns);
          counter++;
        }
      }

    }

    reorderTracks(this.options.rows, false);
    reorderTracks(this.options.columns, true);

    if (this.options.showRowNumber) {
      this.setShowRowNumber(true);
    }
    var colorSchemeSpecified = this.options.colorScheme != null;
    if (this.options.colorScheme == null) {
      var ext = '';
      if (this.options.dataSource) {
        ext = morpheus.Util.getExtension(morpheus.Util.getFileName(this.options.dataSource));
      }

      var colorScheme = this.autoDisplay({
        filename: morpheus.Util.getBaseFileName(morpheus.Util.getFileName(this.options.dataset)),
        extension: ext
      });
      if (colorScheme == null) {
        colorScheme = {
          type: 'relative'
        };
      }
      this.options.colorScheme = colorScheme;
      var name = this.project.getFullDataset().getName();
      if (ext === 'maf' && !this.options.rowSortBy) {
        var sortKeys = [];
        if (this.project.getFullDataset().getRowMetadata().getByName(
          'order')) {
          sortKeys.push(new morpheus.SortKey('order',
            morpheus.SortKey.SortOrder.ASCENDING));
        }
        sortKeys.push(new morpheus.SortKey('id',
          morpheus.SortKey.SortOrder.ASCENDING));
        this.project.setRowSortKeys(sortKeys, false);

      }
      if (morpheus.DatasetUtil.getSeriesIndex(this.project.getFullDataset(), 'allelic_fraction') !== -1) {
        this.options.sizeBy = {
          seriesName: 'allelic_fraction',
          min: 0,
          max: 1
        };
      }

    }
    if (this.options.parent && this.options.inheritFromParent) {
      this.heatmap.setPropertiesFromParent(this.options.parent.heatmap);
    }
    if (this.options.shape != null) {
      this.heatmap.setShape(this.options.shape);
    }
    if (this.options.parent && this.options.inheritFromParent
      && !colorSchemeSpecified) {
      heatmap.setColorScheme(this.options.parent.heatmap.getColorScheme().copy(this.project));
    } else {
      heatmap.setColorScheme(new morpheus.HeatMapColorScheme(
        this.project, this.options.colorScheme));
      if (this.options.dataset.getRowMetadata().getByName('Source') != null) {
        // separate color scheme for each source file
        var sourcesSet = morpheus.VectorUtil.getSet(this.options.dataset.getRowMetadata().getByName('Source'));
        this.heatmap.getColorScheme().setSeparateColorSchemeForRowMetadataField('Source');
        sourcesSet.forEach(function (source) {
          _this.autoDisplay({
            extension: morpheus.Util.getExtension(source),
            filename: '' + source
          });
        });
      }
    }

    if (this.options.sizeBy) {
      heatmap.getColorScheme().getSizer().setSeriesName(
        this.options.sizeBy.seriesName);
      heatmap.getColorScheme().getSizer().setMin(
        this.options.sizeBy.min);
      heatmap.getColorScheme().getSizer().setMax(
        this.options.sizeBy.max);
    }

    this.updateDataset();

    // tabOpened is inherited by child heat maps
    if (this.options.tabOpened) {
      this.options.tabOpened(this);
      this.updateDataset();
    }
    // renderReady is only called once for the parent heat map
    if (this.options.renderReady) {
      this.options.renderReady(this);
      this.updateDataset();
    }

    if (this.options.rowSize === 'fit') {
      this.heatmap.getRowPositions().setSize(this.getFitRowSize());
      this.revalidate({
        paint: false
      });
    }
    if (this.options.columnSize === 'fit') {
      this.heatmap.getColumnPositions().setSize(
        this.getFitColumnSize());
      this.revalidate({
        paint: false
      });

    }
    if (this.options.rowColorModel) {
      this.getProject().getRowColorModel().fromJSON(this.options.rowColorModel);
    }
    if (this.options.columnColorModel) {
      this.getProject().getColumnColorModel().fromJSON(this.options.columnColorModel);
    }
    if (this.options.rowShapeModel) {
      this.getProject().getRowShapeModel().fromJSON(this.options.rowShapeModel);
    }
    if (this.options.columnShapeModel) {
      this.getProject().getColumnShapeModel().fromJSON(this.options.columnShapeModel);
    }
    if (this.options.rowFontModel) {
      this.getProject().getRowFontModel().fromJSON(this.options.rowFontModel);
    }
    if (this.options.columnFontModel) {
      this.getProject().getColumnFontModel().fromJSON(this.options.columnFontModel);
    }
    if (this.options.rowSize === 'fit' || this.options.columnSize === 'fit') {
      // note that we have to revalidate twice because column sizes are
      // dependent on row sizes and vice versa
      if (this.options.columnSize === 'fit') {
        this.heatmap.getColumnPositions().setSize(
          this.getFitColumnSize());
        this.revalidate({
          paint: false
        });
      }
      if (this.options.rowSize === 'fit') {
        this.heatmap.getRowPositions().setSize(this.getFitRowSize());
        this.revalidate({
          paint: false
        });
      }
      this.paintAll({
        paintRows: true,
        paintColumns: true,
        invalidateRows: true,
        invalidateColumns: true
      });
    }

    this.options.parent = null; // avoid memory leak
    this.$tipFollow = $('<div style="display:none;"' +
      ' class="morpheus-tip-inline"></div>');
    this.$tipFollow.appendTo(this.$parent);

    this.$tipInfoWindow = $('<div class="morpheus-tip-dialog"></div>');
    this.$tipInfoWindow.appendTo(this.$parent);

    if (!morpheus.Util.isHeadless()) {
      this.$tipInfoWindow.dialog({
        close: function (event, ui) {
          if (!_this._togglingInfoWindow) {
            _this.toggleInfoWindow();
          }
        },
        autoOpen: false,
        width: 220,
        height: 280,
        minHeight: 38,
        minWidth: 10,
        collision: 'fit',
        position: {
          my: 'right-30 bottom',
          at: 'right top',
          of: this.$parent
        },
        title: 'Info'
      });
      this.setTooltipMode(this.options.tooltipMode);
    }

    this.getProject().on(
      'rowFilterChanged columnFilterChanged rowGroupByChanged columnGroupByChanged rowSortOrderChanged columnSortOrderChanged datasetChanged',
      function (e) {
        if (e.type === 'datasetChanged') { // remove
          // tracks
          // that are no
          // longer in the
          // dataset

          var dataset = _this.getProject().getFullDataset();
          for (var i = 0; i < _this.rowTracks.length; i++) {
            var track = _this.rowTracks[i];
            if (!dataset.getRowMetadata().getByName(
              track.getName())) {
              _this.removeTrack(track.getName(),
                false);
              i--;
            }
          }
          for (var i = 0; i < _this.columnTracks.length; i++) {
            var track = _this.columnTracks[i];
            if (!dataset.getColumnMetadata().getByName(
              track.getName())) {
              _this.removeTrack(track.getName(),
                true);
              i--;
            }
          }

        }

        _this.updateDataset();
        _this.revalidate();
      });

    this.getProject().on('trackChanged', function (e) {
      var columns = e.columns;
      _.each(e.vectors, function (v, i) {
        var index = _this.getTrackIndex(v.getName(), columns);
        if (index === -1) {
          _this.addTrack(v.getName(), columns, e.display[i]);
        } else {
          // repaint
          var track = _this.getTrackByIndex(index, columns);
          var display = e.display[i];
          if (display) {
            track.settingFromConfig(display);
          }
          track.setInvalid(true);
        }
      });
      _this.revalidate();
    });
    this.getProject().on('rowTrackRemoved', function (e) {
      _this.removeTrack(e.vector.getName(), false);
      _this.revalidate();
    });
    this.getProject().on('columnTrackRemoved', function (e) {
      _this.removeTrack(e.vector.getName(), true);
      _this.revalidate();
    });
    this.getProject().getRowSelectionModel().on(
      'selectionChanged',
      function () {
        // repaint tracks that indicate selection
        for (var i = 0; i < _this.columnTracks.length; i++) {
          var track = _this.columnTracks[i];
          if (track.getFullVector().getProperties().get(morpheus.VectorKeys.RECOMPUTE_FUNCTION_SELECTION)) {
            var selectedDataset = _this.getProject().getSelectedDataset({
              selectedRows: true,
              selectedColumns: false,
              emptyToAll: false
            });
            var vector = selectedDataset.getColumnMetadata().getByName(track.getName());
            var f = morpheus.VectorUtil.jsonToFunction(vector, morpheus.VectorKeys.FUNCTION);
            if (typeof f === 'function') {
              // iterate over each column
              var view = new morpheus.DatasetColumnView(selectedDataset);
              // TODO only set values that are currently visible
              for (var j = 0, size = vector.size(); j < size; j++) {
                view.setIndex(j);
                vector.setValue(j, f(view, selectedDataset, j));
              }
              track.setInvalid(true);
              track.repaint();
            }
          }
        }
        _this.verticalSearchBar.update();
        _this.heatmap.updateRowSelectionCache();
        _this.paintAll({
          paintRows: true,
          paintColumns: false,
          invalidateRows: false,
          invalidateColumns: false
        });
      });
    this.getProject().getColumnSelectionModel().on('selectionChanged',
      function () {
        _this.horizontalSearchBar.update();
        _this.heatmap.updateColumnSelectionCache();
        _this.paintAll({
          paintRows: false,
          paintColumns: true,
          invalidateRows: false,
          invalidateColumns: false
        });
      });

    this.pasteListener = function (e) {
      if (_this.isActiveComponent()) {
        var text = e.originalEvent.clipboardData.getData('text/plain');
        if (text != null && text.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          // open a file from clipboard
          var url;
          if (text.indexOf('http') === 0) {
            url = text;
          } else {
            var blob = new Blob([text], {type: 'text/plain'});
            url = URL.createObjectURL(blob);
          }
          morpheus.HeatMap.showTool(
            new morpheus.OpenFileTool({
              clipboard: true,
              file: url
            }), _this);
        }
      }
    };
    this.beforeCopyListener = function (e) {
      if (_this.isActiveComponent()) {
        e.preventDefault();
      }

    };
    this.copyListener = function (ev) {
      if (_this.isActiveComponent()) {
        var activeComponent = _this.getActiveComponent();
        var project = _this.project;
        if (activeComponent === 'heatMap' || ev.shiftKey) {
          // copy selected text or image
          // var text = _this.getSelectedElementsText();
          // if (text !== '') {
          // 	ev.originalEvent.clipboardData.setData(
          // 		'text/plain', text);
          // 	return;
          // }
          var bounds = _this.getTotalSize();
          var height = bounds.height;
          var width = bounds.width;
          var canvas = $('<canvas></canvas>')[0];
          canvas.height = height;
          canvas.width = width;
          var context = canvas.getContext('2d');
          _this.snapshot(context);
          var url = canvas.toDataURL();
          ev.originalEvent.clipboardData.setData(
            'text/html',
            '<img src="' + url + '">');
          ev.preventDefault();
          ev.stopImmediatePropagation();
          return;
        }
        // copy all selected rows and columns
        var dataset = project.getSelectedDataset({
          emptyToAll: false
        });
        var rowsSelected = dataset.getRowCount() > 0;
        var columnsSelected = dataset.getColumnCount() > 0;
        var columnMetadata = dataset.getColumnMetadata();
        var rowMetadata = dataset.getRowMetadata();
        // only copy visible tracks
        var visibleColumnFields = _this.getVisibleTrackNames(true);
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
        var visibleRowFields = _this.getVisibleTrackNames(false);
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
        var text = [];

        if (rowsSelected && columnsSelected) { // copy
          // as
          // gct
          // 1.3
          text = new morpheus.GctWriter().write(dataset);
        } else {
          var text = [];
          var model = rowsSelected ? rowMetadata
            : columnMetadata;
          for (var i = 0, count = model.getItemCount(); i < count; i++) {
            for (var j = 0, nfields = model.getMetadataCount(); j < nfields; j++) {
              var v = model.get(j);
              if (j > 0) {
                text.push('\t');
              }
              text.push(morpheus.Util.toString(v.getValue(i)));
            }
            text.push('\n');
          }
          text = text.join('');
        }
        ev.originalEvent.clipboardData.setData(
          'text/plain', text);
        ev.preventDefault();
        ev.stopImmediatePropagation();

      }
    };

    if (typeof window !== 'undefined') {
      $(window)
        .on('paste.morpheus', this.pasteListener)
        .on('beforecopy.morpheus', this.beforeCopyListener)
        .on('copy.morpheus', this.copyListener);
    }
    if (this.options.keyboard && !morpheus.Util.isHeadless()) {
      new morpheus.HeatMapKeyListener(this);
    }
    if (this.options.symmetric) {
      this.getProject().setSymmetric(this);
    }
    var dragStartScrollTop;
    var dragStartScrollLeft;
    var panstartMousePosition;
    this.hammer = morpheus.Util.hammer(_this.heatmap.canvas, ['pan', 'pinch', 'tap', 'swipe']).on('swipe', this.swipe = function (event) {
      event.preventDefault();
    }).on('panend', this.panend = function (event) {
      _this.panning = false;
      if (panstartMousePosition) {
        panstartMousePosition = null;
        _this.heatmap.setSelectionBox(null);
        _this.heatmap.repaint();
      }
      event.preventDefault();
    }).on('panmove', this.panmove = function (event) {
      if (panstartMousePosition) {
        var pos = morpheus.CanvasUtil.getMousePosWithScroll(event.target, event,
          _this.scrollLeft(), _this.scrollTop());
        var rowIndex = _this.heatmap.getRowPositions().getIndex(pos.y, false);
        var columnIndex = _this.heatmap.getColumnPositions().getIndex(pos.x, false);
        _this.updatingScroll = false;
        _this.heatmap.setSelectionBox({
          y: [panstartMousePosition.rowIndex, rowIndex],
          x: [panstartMousePosition.columnIndex, columnIndex]
        });
        var rowIndices = new morpheus.Set();
        for (var i = Math.min(panstartMousePosition.rowIndex, rowIndex),
               end = Math.max(panstartMousePosition.rowIndex, rowIndex); i <= end; i++) {
          rowIndices.add(i);
        }
        var columnIndices = new morpheus.Set();
        for (var i = Math.min(panstartMousePosition.columnIndex, columnIndex),
               end = Math.max(panstartMousePosition.columnIndex, columnIndex); i <= end; i++) {
          columnIndices.add(i);
        }
        _this.project.getRowSelectionModel().setViewIndices(rowIndices, true);
        _this.project.getColumnSelectionModel().setViewIndices(columnIndices, true);
        // _this.heatmap.repaint(); don't need to repaint as setViewIndices triggers repaint
      } else {
        _this.updatingScroll = true; // avoid infinite paints
        var rows = false;
        var columns = false;
        if (event.deltaY !== 0) {
          var pos = dragStartScrollTop + event.deltaY;
          _this.scrollTop(pos);
          rows = true;
        }
        if (event.deltaX !== 0) {
          var pos = dragStartScrollLeft + event.deltaX;
          _this.scrollLeft(pos);
          columns = true;
        }
        _this.updatingScroll = false;
        if (rows || columns) {
          _this.paintAll({
            paintRows: rows,
            paintColumns: rows,
            invalidateRows: rows,
            invalidateColumns: columns
          });
        }
      }
      event.preventDefault();
    }).on('panstart', this.panstart = function (event) {
      _this.panning = true; // don't draw inline tooltips when panning
      _this.project.setHoverRowIndex(-1);
      _this.project.setHoverColumnIndex(-1);

      if (event.srcEvent.shiftKey) {
        var pos = morpheus.CanvasUtil.getMousePosWithScroll(event.target, event,
          _this.scrollLeft(), _this.scrollTop());
        panstartMousePosition = {
          rowIndex: _this.heatmap.getRowPositions().getIndex(pos.y, false),
          columnIndex: _this.heatmap.getColumnPositions().getIndex(pos.x, false)
        };
      } else {
        panstartMousePosition = null;
        dragStartScrollTop = _this.scrollTop();
        dragStartScrollLeft = _this.scrollLeft();
      }
      event.preventDefault();
    }).on(
      'tap',
      this.tap = function (event) {
        // var commandKey = morpheus.Util.IS_MAC ? event.srcEvent.metaKey
        //   : event.srcEvent.ctrlKey;
        if (morpheus.Util.IS_MAC && event.srcEvent.ctrlKey) { // right-click
          // on
          // Mac
          return;
        }
        _this.project.getRowSelectionModel().setViewIndices(new morpheus.Set(), true);
        _this.project.getColumnSelectionModel().setViewIndices(new morpheus.Set(), true);
        // var position = morpheus.CanvasUtil
        // .getMousePosWithScroll(event.target, event,
        //   _this.scrollLeft(), _this
        //   .scrollTop());
        // var rowIndex = _this.heatmap.getRowPositions()
        // .getIndex(position.y, false);
        // var columnIndex = _this.heatmap
        // .getColumnPositions().getIndex(position.x,
        //   false);
        // _this.project.getElementSelectionModel().click(
        //   rowIndex, columnIndex,
        //   event.srcEvent.shiftKey || commandKey);
      }).on(
      'pinch',
      this.pinch = function (event) {
        var scale = event.scale;
        _this.heatmap.getRowPositions().setSize(14 * scale);
        _this.heatmap.getColumnPositions().setSize(14 * scale);
        var reval = {};
        if (_this.project.getHoverRowIndex() !== -1) {
          reval.scrollTop = this.heatmap.getRowPositions().getPosition(
            this.project.getHoverRowIndex());
        }
        if (_this.project.getHoverColumnIndex() !== -1) {
          reval.scrollLeft = this.heatmap.getColumnPositions().getPosition(
            this.project.getHoverColumnIndex());
        }

        _this.revalidate(reval);
        event.preventDefault();
      });
    var heatMapMouseMoved = function (event) {
      var mouseI, mouseJ;
      if (event.type === 'mouseout') {
        mouseI = -1;
        mouseJ = -1;
      } else {
        var position = morpheus.CanvasUtil.getMousePosWithScroll(
          event.target, event, _this.scrollLeft(), _this.scrollTop());
        mouseI = _this.heatmap.getRowPositions().getIndex(position.y,
          false);
        mouseJ = _this.heatmap.getColumnPositions().getIndex(
          position.x, false);
      }
      _this.setMousePosition(mouseI, mouseJ, {
        event: event
      });
    };
    $(_this.heatmap.canvas).on('mouseout', heatMapMouseMoved).on(
      'mousemove', heatMapMouseMoved);
    // tools to run at load time
    _.each(this.options.tools, function (item) {
      var action = _this.getActionManager().getAction(item.name);
      if (action == null) {
        console.log(item.name + ' not found.');
      } else {

        var actionGui = action.gui();
        var gui = actionGui.gui(_this.getProject());
        var formBuilder = new morpheus.FormBuilder();
        _.each(gui, function (item) {
          formBuilder.append(item);
        });
        var input = {};
        _.each(gui, function (item) {
          input[item.name] = formBuilder.getValue(item.name);
        });
        if (item.params) {
          // overide default values
          for (var key in item.params) {
            input[key] = item.params[key];
          }
        }

        actionGui.execute({
          heatMap: _this,
          project: _this.getProject(),
          input: input
        });

      }

    });
  },
  setMousePosition: function (i, j, options) {
    this.mousePositionOptions = options;
    var updateColumns = this.project.getHoverColumnIndex() !== j;
    var updateRows = this.project.getHoverRowIndex() !== i;
    if (updateColumns || updateRows) {
      if (!this.panning) {
        this.project.setHoverRowIndex(i);
        this.project.setHoverColumnIndex(j);
      }
      this.setToolTip(i, j, options);
      this.paintAll({
        paintRows: updateRows,
        paintColumns: updateColumns,
        invalidateRows: false,
        invalidateColumns: false
      });
    } else {
      this._updateTipFollowPosition(options);

    }
    // else if (this.options.tooltipMode === 2 &&
    // (this.project.getHoverColumnIndex() !== -1 || this.project
    // .getHoverRowIndex() !== -1)) {
    //
    // }
    this.trigger('change', {
      name: 'setMousePosition',
      source: this,
      arguments: arguments
    });
  },
  getContentEl: function () {
    return this.$content;
  },
  focus: function () {
    var scrollTop = document.body.scrollTop;
    this.$tabPanel.focus();
    document.body.scrollTop = scrollTop;
  },
  getFocusEl: function () {
    return this.$tabPanel;
  },
  /**
   Set where the tooltip is shown
   @param mode 0 is formula bar, 1 is dialog, -1 is no tooltip
   */

  setTooltipMode: function (mode) {
    this._togglingInfoWindow = true;
    this.options.tooltipMode = mode;
    this.$tipInfoWindow.html('');
    this.toolbar.$tip.html('');
    this.$tipFollow.html('').css({
      display: 'none'
    });
    this.toolbar.$tip.css('display', mode === 0 ? '' : 'none');
    this.setToolTip(-1, -1);
    if (this.options.tooltipMode === 1) {
      this.$tipInfoWindow.dialog('open');
    } else {
      this.$tipInfoWindow.dialog('close');
    }
    this._togglingInfoWindow = false;
  },
  toggleInfoWindow: function () {
    this.setTooltipMode(this.options.tooltipMode == 1 ? 0 : 1);
  },
  _setTipText: function (tipText, tipFollowText, options) {
    if (this.options.tooltipMode === 0) {
      this.toolbar.$tip.html(tipText.join(''));
    } else if (this.options.tooltipMode === 1) {
      this.$tipInfoWindow.html(tipText.join(''));
    }

    if (tipFollowText != null) {
      this.tipFollowHidden = false;
      this.$tipFollow.html(tipFollowText);
      this._updateTipFollowPosition(options);
    } else {
      this.tipFollowHidden = true;
      this.$tipFollow.empty().css({
        display: 'none'
      });
    }
    this.trigger('change', {
      name: 'setToolTip',
      source: this,
      arguments: arguments
    });
  },
  setToolTip: function (rowIndex, columnIndex, options) {
    options = options || {};
    if (this.options.showSeriesNameInTooltip) {
      options.showSeriesNameInTooltip = true;
    }
    if (this.options.tooltipSeriesIndices) {
      options.tooltipSeriesIndices = this.options.tooltipSeriesIndices;
    }
    if (options.heatMapLens) {
      var maxSelectedCount = 20;
      // don't draw lens if currently visible
      // row lens
      var $wrapper = $('<div></div>');
      var wrapperHeight = 0;
      var wrapperWidth = 0;
      var found = false;
      var inline = [];
      var indicesForLens = [];
      // only draw heat map lens if less than maxSelectedCount indices selected
      if (rowIndex != null && rowIndex.length > 0) {
        for (var hoverIndex = 0; hoverIndex < rowIndex.length; hoverIndex++) {
          var row = rowIndex[hoverIndex];
          if (row >= 0 && (row >= this.heatmap.lastPosition.bottom || row < this.heatmap.lastPosition.top)) {
            indicesForLens.push(row);
          } else {
            inline.push(row);
          }
        }
        if (indicesForLens.length < maxSelectedCount) {
          for (var hoverIndex = 0; hoverIndex < indicesForLens.length; hoverIndex++) {
            var row = indicesForLens[hoverIndex];
            var heatMapWidth = this.heatmap.getUnscaledWidth();
            var top = row; // Math.max(0, rowIndex - 1);
            var bottom = row + 1; //Math.min(rowIndex + 1, this.heatmap.rowPositions.getLength());
            var startPix = this.heatmap.rowPositions.getPosition(top);
            var endPix = startPix + this.heatmap.rowPositions.getItemSize(top);
            var heatMapHeight = endPix - startPix;
            var canvas = morpheus.CanvasUtil.createCanvas();
            var trackWidth = 0;
            for (var i = 0, ntracks = this.rowTracks.length; i < ntracks; i++) {
              var track = this.rowTracks[i];
              if (track.isVisible()) {
                trackWidth += track.getUnscaledWidth();
              }
            }

            var canvasWidth = trackWidth + heatMapWidth + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
            canvas.width = canvasWidth * morpheus.CanvasUtil.BACKING_SCALE;
            canvas.style.width = canvasWidth + 'px';
            canvas.height = heatMapHeight * morpheus.CanvasUtil.BACKING_SCALE;
            canvas.style.height = heatMapHeight + 'px';
            var context = canvas.getContext('2d');
            morpheus.CanvasUtil.resetTransform(context);
            context.save();
            context.translate(-this.heatmap.lastClip.x, -startPix);
            context.rect(this.heatmap.lastClip.x, startPix, this.heatmap.lastClip.width, this.heatmap.lastClip.height);
            context.clip();
            this.heatmap._draw({
              left: this.heatmap.lastPosition.left,
              right: this.heatmap.lastPosition.right,
              top: top,
              bottom: bottom,
              context: context
            });
            context.restore();
            context.translate(heatMapWidth + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS, -startPix);
            trackWidth = 0;
            for (var i = 0, ntracks = this.rowTracks.length; i < ntracks; i++) {
              var track = this.rowTracks[i];
              if (track.isVisible()) {
                context.save();
                context.translate(trackWidth, 0);
                context.rect(0, startPix, track.getUnscaledWidth(), track.lastClip.height);
                context.clip();
                track._draw({
                  start: top,
                  end: bottom,
                  vector: track.getVector(),
                  context: context,
                  availableSpace: track.getUnscaledWidth()
                });
                context.restore();
                trackWidth += track.getUnscaledWidth();
              }
            }
            $(canvas).appendTo($wrapper);
            canvas.style.top = wrapperHeight + 'px';
            wrapperHeight += parseFloat(canvas.style.height);
            wrapperWidth = parseFloat(canvas.style.width);

          }
        }

        if (indicesForLens.length > 0) {
          if (indicesForLens.length < maxSelectedCount) {
            $wrapper.css({
              height: wrapperHeight,
              width: wrapperWidth
            });

            var rect = this.$parent[0].getBoundingClientRect();
            this.$tipFollow.html($wrapper).css({
              display: '',
              left: Math.round(parseFloat(this.heatmap.canvas.style.left) - 1) + 'px',
              top: (options.event.clientY - rect.top - wrapperHeight / 2) + 'px'
            });
          } else {
            this.$tipFollow.html('');
          }
          return;
        } else {
          var tipText = [];
          var tipFollowText = [];
          if (inline.length < maxSelectedCount) {
            for (var hoverIndex = 0; hoverIndex < inline.length; hoverIndex++) {
              this.tooltipProvider(this, inline[hoverIndex], -1,
                options, this.options.tooltipMode === 0 ? '&nbsp;&nbsp;&nbsp;'
                  : '<br />', false, tipText);
              if (this.options.inlineTooltip) {
                this.tooltipProvider(this, inline[hoverIndex], -1,
                  options, '<br />', true, tipFollowText);

              }
            }
          }
          var text = tipFollowText.join('');
          this._setTipText(tipText, text.length === 0 ? null : '<span style="max-width:400px;">' + text + '</span>', options);
        }
      }
      if (columnIndex != null && columnIndex.length > 0) {
        for (var hoverIndex = 0; hoverIndex < columnIndex.length; hoverIndex++) {
          var column = columnIndex[hoverIndex];
          if (column >= 0 && (column >= this.heatmap.lastPosition.right || column < this.heatmap.lastPosition.left)) {
            indicesForLens.push(column);
          } else {
            inline.push(column);
          }
        }

        if (indicesForLens.length < maxSelectedCount) {
          for (var hoverIndex = 0; hoverIndex < indicesForLens.length; hoverIndex++) {
            var column = indicesForLens[hoverIndex];
            var heatMapHeight = this.heatmap.getUnscaledHeight();
            var left = column; // Math.max(0, rowIndex - 1);
            var right = column + 1; //Math.min(rowIndex + 1, this.heatmap.rowPositions.getLength());
            var startPix = this.heatmap.columnPositions.getPosition(left);
            var endPix = startPix + this.heatmap.columnPositions.getItemSize(left);
            var heatMapWidth = endPix - startPix;
            var canvas = morpheus.CanvasUtil.createCanvas();
            var trackHeight = 0;
            for (var i = 0, ntracks = this.columnTracks.length; i < ntracks; i++) {
              var track = this.columnTracks[i];
              if (track.isVisible()) {
                trackHeight += track.getUnscaledHeight();
              }
            }
            var canvasHeight = trackHeight + heatMapHeight + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
            canvas.width = heatMapWidth * morpheus.CanvasUtil.BACKING_SCALE;
            canvas.style.width = heatMapWidth + 'px';
            canvas.height = canvasHeight * morpheus.CanvasUtil.BACKING_SCALE;
            canvas.style.height = canvasHeight + 'px';
            var context = canvas.getContext('2d');
            morpheus.CanvasUtil.resetTransform(context);
            context.translate(-startPix, 0);
            context.save();
            context.rect(startPix, trackHeight + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS,
              this.heatmap.lastClip.width, this.heatmap.lastClip.height + trackHeight +
              morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS);
            context.clip();
            context.translate(0, trackHeight + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS - this.heatmap.lastClip.y);

            this.heatmap._draw({
              top: this.heatmap.lastPosition.top,
              bottom: this.heatmap.lastPosition.bottom,
              left: left,
              right: right,
              context: context
            });
            context.restore();
            trackHeight = 0;
            for (var i = 0, ntracks = this.columnTracks.length; i < ntracks; i++) {
              var track = this.columnTracks[i];
              if (track.isVisible()) {
                context.save();
                context.translate(0, trackHeight);
                context.rect(startPix, 0, track.lastClip.width, track.getUnscaledHeight());
                context.clip();
                track._draw({
                  start: left,
                  end: right,
                  vector: track.getVector(),
                  context: context,
                  availableSpace: track.getUnscaledHeight(),
                  clip: {
                    x: track.lastClip.x,
                    y: track.lastClip.y
                  }
                });
                context.restore();
                trackHeight += track.getUnscaledHeight();
              }
            }
            canvas.style.left = wrapperWidth + 'px';
            wrapperWidth += parseFloat(canvas.style.width);
            wrapperHeight = parseFloat(canvas.style.height);
            $(canvas).appendTo($wrapper);
          }
        }
        if (indicesForLens.length > 0) {
          if (indicesForLens.length < maxSelectedCount) {
            $wrapper.css({
              height: wrapperHeight,
              width: wrapperWidth
            });

            var rect = this.$parent[0].getBoundingClientRect();
            this.$tipFollow.html($wrapper).css({
              top: parseFloat(this.heatmap.canvas.style.top) - trackHeight - morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS - 1,
              left: (options.event.clientX - rect.left) - (wrapperWidth / 2),
              display: ''
            });

          } else {
            this.$tipFollow.html('');
          }
          return;
        } else {
          var tipText = [];
          var tipFollowText = [];
          if (inline.length < maxSelectedCount) {
            for (var hoverIndex = 0; hoverIndex < inline.length; hoverIndex++) {
              this.tooltipProvider(this, -1, inline[hoverIndex],
                options, this.options.tooltipMode === 0 ? '&nbsp;&nbsp;&nbsp;'
                  : '<br />', false, tipText);
              if (this.options.inlineTooltip) {
                this.tooltipProvider(this, -1, inline[hoverIndex],
                  options, '<br />', true, tipFollowText);
              }
            }
          }
          var text = tipFollowText.join('');
          this._setTipText(tipText, text === '' ? null : '<span style="max-width:400px;">' + text + '</span>', options);
        }
      }

      // column lens

    }

    // tooltipMode=0 top, 1=window, 2=inline
    var tipText = [];
    this.tooltipProvider(this, rowIndex, columnIndex,
      options, this.options.tooltipMode === 0 ? '&nbsp;&nbsp;&nbsp;'
        : '<br />', false, tipText);

    var text = [];
    var customToolTip = false;
    var $tipFollowText;
    if (!this.panning) {
      var tipFollowText = [];
      if (this.options.inlineTooltip) {
        this.tooltipProvider(this, rowIndex, columnIndex,
          options, '<br />', true, tipFollowText);

        if (this.options.tooltip && rowIndex !== -1 && columnIndex !== -1) {
          tipFollowText.push('<div data-name="tip"></div>');
        }
      }

      text = tipFollowText.join('');
      $tipFollowText = $('<span style="max-width:400px;">' + text + '</span>');

      // tooltip callback
      if (this.options.tooltip && rowIndex !== -1 && columnIndex !== -1) {
        this.options.tooltip(this, rowIndex, columnIndex, $tipFollowText.find('[data-name=tip]'));
        customToolTip = true;
      }

    }
    this._setTipText(tipText, text.length > 0 || customToolTip ? $tipFollowText : null, options);

  }
  ,
  _updateTipFollowPosition: function (options) {
    if (this.tipFollowHidden) {
      return;
    }
    // top, bottom are negative when scrolled
    var parentRect = this.$parent[0].getBoundingClientRect();
    var tipRect = this.$tipFollow[0].getBoundingClientRect();
    var tipWidth = tipRect.width;
    var tipHeight = tipRect.height;
    var offset = 10;
    var left = options.event.clientX - parentRect.left + offset;
    var top = options.event.clientY - parentRect.top + offset;
    // default is bottom-right
    var scrollBarSize = 18;
    if ((left + tipWidth) >= (parentRect.right - parentRect.left - scrollBarSize)) { // offscreen
      // right, place tip on
      // left
      left = options.event.clientX - parentRect.left - offset - tipWidth;
    }
    if ((top + tipHeight) >= (parentRect.bottom - parentRect.top - scrollBarSize)) { // offscreen
      // bottom,
      // place tip
      // on top
      top = options.event.clientY - parentRect.top - offset - tipHeight;
    }
    this.$tipFollow.css({
      left: left + 'px',
      top: top + 'px',
      display: ''
    });

  }
  ,
  setTrackVisibility: function (tracks) {
    var _this = this;
    _.each(tracks, function (track) {
      var existingTrack = _this.getTrack(track.name, track.isColumns);
      if (track.visible && existingTrack != null
        && _.keys(existingTrack.settings).length === 0) {
        existingTrack.settingFromConfig('Text');
      }
      _this.setTrackVisible(track.name, track.visible, track.isColumns);
    });
    this.revalidate();
    this.trigger('change', {
      name: 'setTrackVisibility',
      source: this,
      arguments: arguments
    });
  }
  ,
  setTrackVisible: function (name, visible, isColumns) {
    var trackIndex = this.getTrackIndex(name, isColumns);
    if (trackIndex === -1) { // not currently visible
      if (!visible) {
        return;
      }
      this.addTrack(name, isColumns);
    } else {
      var track = isColumns ? this.columnTracks[trackIndex]
        : this.rowTracks[trackIndex];
      var header = isColumns ? this.columnTrackHeaders[trackIndex]
        : this.rowTrackHeaders[trackIndex];
      if (track.isVisible() !== visible) {
        track.setVisible(visible);
        header.setVisible(visible);
      } else {
        return;
      }
    }
    this.trigger('change', {
      name: 'setTrackVisible',
      source: this,
      arguments: arguments
    });
  },
  addTrack: function (name, isColumns, renderSettings, trackIndex) {
    if (name === undefined) {
      throw 'Name not specified';
    }

    var tracks = isColumns ? this.columnTracks : this.rowTracks;
    var headers = isColumns ? this.columnTrackHeaders : this.rowTrackHeaders;
    // see if already exists
    var existingIndex = this.getTrackIndex(name, isColumns);
    if (existingIndex !== -1) {
      return tracks[existingIndex];
    }
    if (renderSettings == null) {
      var metadata = isColumns ? this.project.getFullDataset().getColumnMetadata() : this.project.getFullDataset().getRowMetadata();
      renderSettings = morpheus.VectorUtil.getDataType(metadata.getByName(name)) === '[number]' ? {display: ['bar']}
        : {display: ['text']};
    }

    var positions = isColumns ? this.heatmap.getColumnPositions() : this.heatmap.getRowPositions();
    var track = new morpheus.VectorTrack(this.project, name, positions, isColumns, this);
    track.settingFromConfig(renderSettings);
    track.appendTo(this.$parent);
    var header = new morpheus.VectorTrackHeader(this.project, name, isColumns,
      this);
    header.appendTo(this.$parent);
    track._selection = new morpheus.TrackSelection(track, positions,
      isColumns ? this.project.getColumnSelectionModel() : this.project.getRowSelectionModel(),
      isColumns, this);
    if (trackIndex != null && trackIndex >= 0) {
      tracks.splice(trackIndex, 0, track);
      headers.splice(trackIndex, 0, header);
    } else {
      tracks.push(track);
      headers.push(header);
    }
    return track;
  }
  ,
  addPopup: function (item) {
    if (!this.popupItems) {
      this.popupItems = [];
    }
    this.popupItems.push(item);
  }
  ,
  getPopupItems: function () {
    return this.popupItems || [];
  }
  ,
  removeTrack: function (name, isColumns) {
    var index = this.getTrackIndex(name, isColumns);
    var tracks = isColumns ? this.columnTracks : this.rowTracks;
    if (isNaN(index) || index < 0 || index >= tracks.length) {
      console.log('removeTrack: ' + name + ' not found.');
      return;
    }

    var headers = isColumns ? this.columnTrackHeaders
      : this.rowTrackHeaders;
    var track = tracks[index];
    var header = headers[index];
    track.dispose();
    header.dispose();
    tracks.splice(index, 1);
    headers.splice(index, 1);
    this.trigger('change', {
      name: 'removeTrack',
      source: this,
      arguments: arguments
    });
  }
  ,
  updateDataset: function () {
    var dataset = this.project.getSortedFilteredDataset();
    this.verticalSearchBar.update();
    this.horizontalSearchBar.update();
    this.heatmap.setDataset(dataset);
    this.heatmap.getRowPositions().setSpaces(morpheus.HeatMap.createGroupBySpaces(dataset, this.project.getGroupRows(),
      this.rowGapSize, false));
    this.heatmap.getColumnPositions()
      .setSpaces(morpheus.HeatMap.createGroupBySpaces(dataset, this.project.getGroupColumns(), this.columnGapSize, true));
    this.trigger('change', {
      name: 'updateDataset',
      source: this,
      arguments: arguments
    });
  }
  ,
  zoom: function (isZoomIn, options) {
    options = $.extend({}, {
      rows: true,
      columns: true
    }, options);
    if (isZoomIn) {
      if (options.rows) {
        this.heatmap.getRowPositions().setSize(
          this.heatmap.getRowPositions().getSize() * 1.5);
      }
      if (options.columns) {
        this.heatmap.getColumnPositions().setSize(
          this.heatmap.getColumnPositions().getSize() * 1.5);
      }
    } else {
      if (options.rows) {
        this.heatmap.getRowPositions().setSize(
          this.heatmap.getRowPositions().getSize() / 1.5);
      }
      if (options.columns) {
        this.heatmap.getColumnPositions().setSize(
          this.heatmap.getColumnPositions().getSize() / 1.5);
      }
    }
    var reval = {};
    if (options.rows && this.project.getHoverRowIndex() !== -1) {
      reval.scrollTop = this.heatmap.getRowPositions().getPosition(
        this.project.getHoverRowIndex());
    }
    if (options.columns && this.project.getHoverColumnIndex() !== -1) {
      reval.scrollLeft = this.heatmap.getColumnPositions().getPosition(
        this.project.getHoverColumnIndex());
    }
    this.revalidate(reval);
    this.trigger('change', {
      name: 'zoom',
      source: this,
      arguments: arguments
    });
  }
  ,
  getTrackIndex: function (name, isColumns) {
    var tracks = isColumns ? this.columnTracks : this.rowTracks;
    for (var i = 0, length = tracks.length; i < length; i++) {
      if (tracks[i].name !== undefined && tracks[i].name === name) {
        return i;
      }
    }
    return -1;
  }
  ,
  getNumTracks: function (isColumns) {
    return isColumns ? this.columnTracks.length : this.rowTracks.length;
  }
  ,
  moveTrack: function (index, newIndex, isColumns) {
    var tracks = isColumns ? this.columnTracks : this.rowTracks;
    var headers = isColumns ? this.columnTrackHeaders
      : this.rowTrackHeaders;
    var track = tracks[index];
    tracks.splice(index, 1);
    var header = headers[index];
    headers.splice(index, 1);
    tracks.splice(newIndex, 0, track);
    headers.splice(newIndex, 0, header);
    this.trigger('change', {
      name: 'moveTrack',
      source: this,
      arguments: arguments
    });
  }
  ,
  getTrackByIndex: function (index, isColumns) {
    return isColumns ? this.columnTracks[index] : this.rowTracks[index];
  }
  ,
  getTrackHeaderByIndex: function (index, isColumns) {
    return isColumns ? this.columnTrackHeaders[index]
      : this.rowTrackHeaders[index];
  }
  ,
  getTrack: function (name, isColumns) {
    var index = this.getTrackIndex(name, isColumns);
    if (index === -1) {
      return undefined;
    }
    return isColumns ? this.columnTracks[index] : this.rowTracks[index];
  }
  ,
  /**
   * @return true if active element is an ancestor of this heat map.
   */
  isActiveComponent: function () {
    var active = document.activeElement;
    var tagName = active.tagName;
    if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
      return false;
    }
    return this.$tabPanel[0].contains(active);
  }
  ,
  /**
   *
   * @return {string} 'rowTrack' if row track is active, 'columnTrack' if column track is active,
   * 'heatMap' if heat map is active.
   */
  getActiveComponent: function () {
    var active = document.activeElement;
    if (active.tagName === 'CANVAS') {
      for (var i = 0, ntracks = this.columnTracks.length; i < ntracks; i++) {
        if (this.columnTracks[i].canvas === active) {
          return 'columnTrack';
        }
      }
      for (var i = 0, ntracks = this.rowTracks.length; i < ntracks; i++) {
        if (this.rowTracks[i].canvas === active) {
          return 'rowTrack';
        }
      }
      if (this.heatmap.canvas === active) {
        return 'heatMap';
      }
    }
    return '';
  },
  dispose: function () {
    //this.$content.remove();
    if (this.project == null) {
      return; // failed to initialize
    }
    this.project.off();
    this.$tipInfoWindow.dialog('destroy');
    this.rowTrackHeaders.forEach(function (header) {
      header.dispose();
    });
    this.columnTrackHeaders.forEach(function (header) {
      header.dispose();
    });
    this.rowTracks.forEach(function (track) {
      track.dispose();
    });
    this.columnTracks.forEach(function (track) {
      track.dispose();
    });
    if (this.rowDendrogram != null) {
      this.rowDendrogram.dispose();
    }
    if (this.columnDendrogram != null) {
      this.columnDendrogram.dispose();
    }
    this.beforeColumnTrackDivider.dispose();
    this.afterRowDendrogramDivider.dispose();
    this.afterVerticalScrollBarDivider.dispose();
    this.hscroll.dispose();
    this.vscroll.dispose();
    this.hammer.off('swipe', this.swipe).off('panmove', this.panmove).off('panstart', this.panstart).off('tap',
      this.tap).off('pinch', this.pinch).off('panend', this.panend);
    this.hammer.destroy();
    if (typeof window !== 'undefined') {
      $(window)
        .off('paste.morpheus', this.pasteListener)
        .off('beforecopy.morpheus', this.beforeCopyListener)
        .off('copy.morpheus', this.copyListener)
        .off('orientationchange.morpheus resize.morpheus', this.resizeListener);
    }
  }
  ,
  getVisibleTrackNames: function (isColumns) {
    return this.getVisibleTracks(isColumns).map(function (track) {
      return track.name;
    });
  },
  getVisibleTracks: function (isColumns) {
    var tracks = isColumns ? this.columnTracks : this.rowTracks;
    if (tracks == null) {
      tracks = [];
    }
    return tracks.filter(function (track) {
      return track.isVisible() && !track.getFullVector().getProperties().has(morpheus.VectorKeys.IS_INDEX);
    });
  },
  isShowRowNumber: function () {
    return this.options.showRowNumber;
  },
  setShowRowNumber: function (visible) {
    this.options.showRowNumber = visible;
    if (!visible) {
      this.removeTrack('#', false);
    } else {
      var track = this.addTrack('#', false, {popupEnabled: false, display: ['text']}, 0);
      track.getVector = function (name) {
        var v = new morpheus.AbstractVector('#', this.project.getSortedFilteredDataset().getRowCount());
        v.getProperties().set(morpheus.VectorKeys.FORMATTER, {pattern: 'i'});
        v.getValue = function (index) {
          return index + 1;
        };
        return v;
      };
      track.getFullVector = function () {
        var v = new morpheus.AbstractVector('#', this.project.getFullDataset().getRowCount());
        v.getProperties().set(morpheus.VectorKeys.FORMATTER, {pattern: 'i'});
        v.getValue = function (index) {
          return index + 1;
        };
        return v;
      };

      track.showPopup = function (e, isHeader) {
        if (e.preventDefault) {
          e.preventDefault();
        }
      };
    }
  }
  ,
  resizeTrack: function (name, width, height, isColumns) {
    var index = this.getTrackIndex(name, isColumns);
    if (index === -1) {
      throw name + ' not found in resize track';
    }
    var heatMapPrefWidth = null;
    if (!isColumns) {
      var track = this.rowTracks[index];
      var header = this.rowTrackHeaders[index];
      track.setPrefWidth(width); // can only set width
      header.setPrefWidth(width);
    } else {
      var track = this.columnTracks[index];
      var header = this.columnTrackHeaders[index];
      if (height) {
        track.setPrefHeight(height);
        header.setPrefHeight(height);
      }
      if (width) {
        for (var i = 0; i < this.columnTracks.length; i++) {
          this.columnTracks[i].setPrefWidth(width);
          this.columnTrackHeaders[i].setPrefWidth(width);
        }
        // set width for all tracks
      }
    }
    this.revalidate();
    this.trigger('change', {
      name: 'resizeTrack',
      source: this,
      arguments: arguments
    });
  }
  ,
  isDendrogramVisible: function (isColumns) {
    var dendrogram = isColumns ? this.columnDendrogram : this.rowDendrogram;
    if (dendrogram !== undefined) {
      return morpheus.HeatMap.isDendrogramVisible(this.project, isColumns);
    }
  }
  ,
  /**
   *
   * Paint all the components
   *
   * @param options.paintRows
   * @param options.paintColumns
   * @param options.invalidateRows
   * @param options.invalidateColumns
   */
  paintAll: function (options) {
    var unscaledHeight = this.heatmap.getUnscaledHeight();
    var unscaledWidth = this.heatmap.getUnscaledWidth();
    var y = this.scrollTop();
    var x = this.scrollLeft();
    this.hscroll.paint();
    this.vscroll.paint(); // FIXME
    var rows = options.paintRows;
    var columns = options.paintColumns;
    var invalidateRows = options.invalidateRows;
    var invalidateColumns = options.invalidateColumns;
    // TODO double buffer search bars
    this.hSortByValuesIndicator.setInvalid(invalidateRows
      || invalidateColumns);
    this.hSortByValuesIndicator.paint({
      x: x,
      y: 0,
      width: unscaledWidth,
      height: this.hSortByValuesIndicator.getUnscaledHeight()
    });
    this.vSortByValuesIndicator.setInvalid(invalidateRows
      || invalidateColumns);
    this.vSortByValuesIndicator.paint({
      x: 0,
      y: y,
      width: this.vSortByValuesIndicator.getUnscaledWidth(),
      height: unscaledHeight
    });
    if (rows) {
      for (var i = 0, length = this.rowTracks.length; i < length; i++) {
        var track = this.rowTracks[i];
        track.setInvalid(invalidateRows);
        if (track.isVisible()) {
          track.paint({
            x: 0,
            y: y,
            height: unscaledHeight,
            width: unscaledWidth
          });
          this.rowTrackHeaders[i].paint();
        }
      }
      if (this.rowDendrogram != null) {
        this.rowDendrogram.setInvalid(invalidateRows);
        if (this.isDendrogramVisible(false)) {
          this.rowDendrogram.setVisible(true);
          this.rowDendrogram.paint({
            x: 0,
            y: y,
            height: unscaledHeight,
            width: this.rowDendrogram.getUnscaledWidth()
          });
        } else {
          this.rowDendrogram.setVisible(false);
        }
      }
    }
    if (columns) {
      for (var i = 0, length = this.columnTracks.length; i < length; i++) {
        var track = this.columnTracks[i];
        track.setInvalid(invalidateColumns);
        track.paint({
          x: x,
          y: 0,
          width: unscaledWidth,
          height: track.getUnscaledHeight()
        });
        this.columnTrackHeaders[i].paint();
      }
      if (this.columnDendrogram != null) {
        this.columnDendrogram.setInvalid(invalidateColumns);
        if (this.isDendrogramVisible(true)) {
          this.columnDendrogram.setVisible(true);
          this.columnDendrogram.paint({
            x: x,
            y: 0,
            width: unscaledWidth,
            height: this.columnDendrogram.getUnscaledHeight()
          });
        } else {
          this.columnDendrogram.setVisible(false);
        }
      }
    }
    if (invalidateRows || invalidateColumns) {
      this.heatmap.setInvalid(true);
    }
    this.heatmap.paint({
      x: x,
      y: y,
      width: unscaledWidth,
      height: unscaledHeight
    });
    this.trigger('change', {
      name: 'paintAll',
      source: this,
      arguments: arguments
    });
  }
  ,
  scrollTop: function (pos) {
    if (pos === undefined) {
      return this.vscroll.getValue();
    }
    if (isNaN(pos)) {
      pos = 0;
    }
    if (this.vscroll.getVisibleExtent() === this.vscroll.getTotalExtent()) {
      pos = 0;
    }
    pos = Math.max(pos, 0);
    pos = Math.min(this.vscroll.getMaxValue(), pos);
    if (pos !== this.vscroll.getValue()) {
      this.vscroll.setValue(pos, true);
      this.trigger('change', {
        name: 'scrollTop',
        source: this,
        arguments: arguments
      });
    }
    return pos;
  }
  ,
  scrollLeft: function (pos) {
    if (pos === undefined) {
      return this.hscroll.getValue();
    }
    if (isNaN(pos)) {
      pos = 0;
    }
    if (this.hscroll.getVisibleExtent() === this.hscroll.getTotalExtent()) {
      pos = 0;
    }
    pos = Math.max(pos, 0);
    pos = Math.min(this.hscroll.getMaxValue(), pos);
    if (pos !== this.hscroll.getValue()) {
      this.trigger('change', {
        name: 'scrollLeft',
        source: this,
        arguments: arguments
      });
      this.hscroll.setValue(pos, true);
    }
    return pos;
  }
  ,
  getSelectedTrackName: function (isColumns) {
    return isColumns ? this.selectedColumnTrackName : this.selectedRowTrackName;
  },
  getLastSelectedTrackInfo: function () {
    return this.selectedTrackInfo;
  },
  setSelectedTrack: function (name, isColumns) {
    var previousName = isColumns ? this.selectedColumnTrackName : this.selectedRowTrackName;
    if (name !== previousName) {
      var index = this.getTrackIndex(previousName, isColumns); // de-select previous
      if (index !== -1) {
        this.getTrackHeaderByIndex(index, isColumns).setSelected(false);
      }
      if (isColumns) {
        this.selectedColumnTrackName = name;
        this.selectedTrackInfo = {name: name, isColumns: true};
      } else {
        this.selectedRowTrackName = name;
        this.selectedTrackInfo = {name: name, isColumns: false};
      }

      var index = this.getTrackIndex(name, isColumns);
      if (index !== -1) {
        this.getTrackHeaderByIndex(index, isColumns).setSelected(true);
      }
      this.trigger('change', {
        name: 'setSelected',
        source: this,
        arguments: arguments
      });
    }
  }
  ,
  saveImage: function (file, format) {
    var _this = this;
    var bounds = this.getTotalSize();
    if (format === 'pdf') {
      var context = new canvas2pdf.PdfContext(blobStream(), {size: [bounds.width, bounds.height]});
      this.snapshot(context);
      context.stream.on('finish', function () {
        var blob = context.stream.toBlob('application/pdf');
        saveAs(blob, file, true);
      });
      context.end();
    } else if (format === 'svg') {
      var context = new C2S(bounds.width, bounds.height);
      this.snapshot(context);
      var svg = context.getSerializedSvg();
      var prefix = [];
      prefix.push('<?xml version="1.0" encoding="utf-8"?>\n');
      prefix.push('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"' +
        ' "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n');
      svg = prefix.join('') + svg;
      var blob = new Blob([svg], {
        type: 'text/plain;charset=utf-8'
      });
      saveAs(blob, file, true);
    } else {
      var canvas = $('<canvas></canvas>')[0];
      var height = bounds.height;
      var width = bounds.width;
      var backingScale = morpheus.CanvasUtil.BACKING_SCALE;
      canvas.height = backingScale * height;
      canvas.style.height = height + 'px';
      canvas.width = backingScale * width;
      canvas.style.width = width + 'px';
      var context = canvas.getContext('2d');
      morpheus.CanvasUtil.resetTransform(context);
      this.snapshot(context);
      var toBlob = canvas.toBlobHD ? ['toBlobHD'] : 'toBlob';
      canvas[toBlob](function (blob) {
        if (blob == null || blob.size === 0) {
          morpheus.FormBuilder.showInModal({
            title: 'Save Image',
            html: 'Image is too large to save.',
            appendTo: _this.getContentEl(),
            focus: _this.getFocusEl()
          });
          return;
        }
        saveAs(blob, file, true);
      });
    }
  }
  ,
  getTotalSize: function (options) {
    options = $.extend({}, {
      legend: true
    }, options);
    var _this = this;
    var heatmapPrefSize = this.heatmap.getPreferredSize();
    var totalSize = {
      width: heatmapPrefSize.width,
      height: heatmapPrefSize.height
    };
    if (this.isDendrogramVisible(false)) { // row dendrogram
      totalSize.width += this.rowDendrogram.getUnscaledWidth() + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
    }
    if (this.isDendrogramVisible(true)) {
      totalSize.height += this.columnDendrogram.getUnscaledHeight() + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
    }
    var maxRowHeaderHeight = 0;
    for (var i = 0, length = this.rowTracks.length; i < length; i++) {
      var track = this.rowTracks[i];
      if (track.isVisible()) {
        var headerSize = this.rowTrackHeaders[i].getPrintSize();
        totalSize.width += headerSize.width;
        maxRowHeaderHeight = Math.max(maxRowHeaderHeight, headerSize.height);
      }
    }
    var maxColumnHeaderWidth = 0;
    var columnTrackHeightSum = 0;
    for (var i = 0, length = this.columnTracks.length; i < length; i++) {
      var track = this.columnTracks[i];
      if (track.isVisible()) {
        var size = this.columnTrackHeaders[i].getPrintSize();
        columnTrackHeightSum += size.height;
        maxColumnHeaderWidth = Math.max(maxColumnHeaderWidth, size.width);
      }
    }
    totalSize.height += Math.max(columnTrackHeightSum, maxRowHeaderHeight) + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
    totalSize.width += maxColumnHeaderWidth + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
    // color legend
    if (options.legend) {
      var totalLegendWidth = 15;
      var maxLegendHeight = 0;
      var colorByValues = this.heatmap.getColorScheme().getColorByValues();
      var ntracks = colorByValues.length;
      for (var i = 0; i < ntracks; i++) {
        var value = colorByValues[i];
        if (value != null || ntracks === 1) {
          // if (value != 'null') { // values are stored as string
          //
          // }

          this.heatmap.getColorScheme().setCurrentValue(value);
          var names = this.heatmap.getColorScheme().getNames();
          maxLegendHeight = Math.max(maxLegendHeight, names != null ? names.length * 14 : 30);
          totalLegendWidth += 250;
        }
      }
      maxLegendHeight += 10; // spacer
      totalSize.height = totalSize.height + maxLegendHeight;
      totalSize.width = Math.max(totalSize.width, totalLegendWidth);
    }

    // color
    var trackLegendSize = new morpheus.HeatMapTrackColorLegend(
      _.filter(
        this.columnTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.COLOR) || track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR));
        }), this.getProject().getColumnColorModel()).getPreferredSize();
    totalSize.height += trackLegendSize.height;
    totalSize.width = Math.max(totalSize.width, trackLegendSize.width);

    trackLegendSize = new morpheus.HeatMapTrackColorLegend(
      _.filter(
        this.rowTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.COLOR) || track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR));
        }), this.getProject().getRowColorModel()).getPreferredSize();
    totalSize.height += trackLegendSize.height;
    totalSize.width = Math.max(totalSize.width, trackLegendSize.width);

    // shape
    trackLegendSize = new morpheus.HeatMapTrackShapeLegend(
      _.filter(
        this.columnTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE));
        }), this.getProject().getColumnShapeModel()).getPreferredSize();
    totalSize.height += trackLegendSize.height;
    totalSize.width = Math.max(totalSize.width, trackLegendSize.width);

    trackLegendSize = new morpheus.HeatMapTrackShapeLegend(
      _.filter(
        this.rowTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE));
        }), this.getProject().getRowShapeModel()).getPreferredSize();
    totalSize.height += trackLegendSize.height;
    totalSize.width = Math.max(totalSize.width, trackLegendSize.width);

    // font
    trackLegendSize = new morpheus.HeatMapTrackShapeLegend(
      _.filter(
        this.columnTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_FONT));
        }), this.getProject().getColumnFontModel()).getPreferredSize();
    totalSize.height += trackLegendSize.height;
    totalSize.width = Math.max(totalSize.width, trackLegendSize.width);

    trackLegendSize = new morpheus.HeatMapTrackShapeLegend(
      _.filter(
        this.rowTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_FONT));
        }), this.getProject().getRowFontModel()).getPreferredSize();
    totalSize.height += trackLegendSize.height;
    totalSize.width = Math.max(totalSize.width, trackLegendSize.width);
    return totalSize;
  }
  ,
  getHeatMapElementComponent: function () {
    return this.heatmap;
  }
  ,
  snapshot: function (context, options) {
    options = $.extend({}, {
      legend: true
    }, options);
    var heatmapPrefSize = this.heatmap.getPreferredSize();
    var totalSize = this.getTotalSize(options);
    var legendHeight = 0;
    if (options.legend) {
      var colorByValues = this.heatmap.getColorScheme().getColorByValues();
      context.save();
      context.translate(15, 0);
      var ntracks = colorByValues.length;
      for (var i = 0, ntracks = colorByValues.length; i < ntracks; i++) {
        var value = colorByValues[i];
        if (value != null || ntracks === 1) {
          if (value != 'null') { // values are stored as string
            // var $label = $('<div style="overflow:hidden;text-overflow:' +
            //   ' ellipsis;width:250px;max-width:250px;">'
            //   + value + '</div>');
            // $keyContent.append($label);
            // totalHeight += $label.height();
          }
          var trackLegend = new morpheus.ColorSupplierLegend(
            this.heatmap.getColorScheme(), value);
          trackLegend.draw({}, context);
          legendHeight = Math.max(legendHeight, trackLegend.getUnscaledHeight());
          var legendWidth = trackLegend.getUnscaledWidth();
          context.translate(legendWidth, 0);
        }
      }
      legendHeight += 10; // spacer

      // morpheus.HeatMapColorSchemeLegend.drawColorScheme(context,
      //   this.heatmap.getColorScheme(), 200, true);
      context.restore();
      // legendHeight = this.heatmap.getColorScheme().getNames() != null ? this.heatmap
      //   .getColorScheme().getNames().length * 14
      //   : 40;
    }
    var legendOffset = 15;
    var maxLegendHeight = 0;

    // color legend
    context.save();
    context.translate(legendOffset, legendHeight);
    var trackLegend = new morpheus.HeatMapTrackColorLegend(
      _.filter(
        this.columnTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.COLOR) || track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR));
        }), this.getProject().getColumnColorModel());
    trackLegend.draw({}, context);
    var legendSize = trackLegend.getPreferredSize();
    legendOffset += legendSize.width;
    maxLegendHeight = Math.max(maxLegendHeight, legendSize.height);
    context.restore();

    // shape legend
    context.save();
    context.translate(legendOffset, legendHeight);
    trackLegend = new morpheus.HeatMapTrackShapeLegend(
      _.filter(
        this.columnTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE));
        }), this.getProject().getColumnShapeModel());
    trackLegend.draw({}, context);
    legendSize = trackLegend.getPreferredSize();
    legendOffset += legendSize.width;
    maxLegendHeight = Math.max(maxLegendHeight, legendSize.height);
    context.restore();

    // font legend
    context.save();
    context.translate(legendOffset, legendHeight);
    trackLegend = new morpheus.HeatMapTrackFontLegend(
      _.filter(
        this.columnTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_FONT));
        }), this.getProject().getColumnFontModel());
    trackLegend.draw({}, context);
    legendSize = trackLegend.getPreferredSize();
    legendOffset += legendSize.width;
    maxLegendHeight = Math.max(maxLegendHeight, legendSize.height);
    context.restore();

    // row color legend
    context.save();
    context.translate(legendOffset, legendHeight);
    trackLegend = new morpheus.HeatMapTrackColorLegend(
      _.filter(
        this.rowTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.COLOR) || track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR));
        }), this.getProject().getRowColorModel());
    trackLegend.draw({}, context);
    legendSize = trackLegend.getPreferredSize();
    legendOffset += legendSize.width;
    maxLegendHeight = Math.max(maxLegendHeight, legendSize.height);
    context.restore();

    // shape legend
    context.save();
    context.translate(legendOffset, legendHeight);
    trackLegend = new morpheus.HeatMapTrackShapeLegend(
      _.filter(
        this.rowTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE));
        }), this.getProject().getRowShapeModel());
    trackLegend.draw({}, context);
    legendSize = trackLegend.getPreferredSize();
    legendOffset += legendSize.width;
    maxLegendHeight = Math.max(maxLegendHeight, legendSize.height);
    context.restore();

    // font legend
    context.save();
    context.translate(legendOffset, legendHeight);
    trackLegend = new morpheus.HeatMapTrackFontLegend(
      _.filter(
        this.rowTracks,
        function (track) {
          return track.isVisible()
            && (track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_FONT));
        }), this.getProject().getRowFontModel());
    trackLegend.draw({}, context);
    legendSize = trackLegend.getPreferredSize();
    legendOffset += legendSize.width;
    maxLegendHeight = Math.max(maxLegendHeight, legendSize.height);
    context.restore();

    legendHeight += maxLegendHeight;

    var heatmapY = this.isDendrogramVisible(true) ? (this.columnDendrogram.getUnscaledHeight() +
      morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS) : 0;
    heatmapY += legendHeight;
    var columnTrackY = heatmapY;
    var heatmapX = this.isDendrogramVisible(false) ? (this.rowDendrogram.getUnscaledWidth() +
      morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS) : 0;
    var isColumnTrackVisible = false;
    for (var i = 0, length = this.columnTracks.length; i < length; i++) {
      var track = this.columnTracks[i];
      if (track.isVisible()) {
        var header = this.columnTrackHeaders[i];
        var size = header.getPrintSize();
        heatmapX = Math.max(heatmapX, size.width);
        heatmapY += size.height;
        isColumnTrackVisible = true;
      }
    }
    if (isColumnTrackVisible) {
      heatmapY += morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
    }

    // check if row headers are taller than column tracks
    for (var i = 0, length = this.rowTracks.length; i < length; i++) {
      var track = this.rowTracks[i];
      if (track.isVisible()) {
        var header = this.rowTrackHeaders[i];
        heatmapY = Math.max(heatmapY, header.getPrintSize().height);
      }
    }
    if (this.isDendrogramVisible(true)) {
      var columnDendrogramClip = {
        x: 0,
        y: 0,
        height: this.columnDendrogram.getUnscaledHeight(),
        width: heatmapPrefSize.width
      };
      context.save();
      context.translate(heatmapX, legendHeight);
      this.columnDendrogram.prePaint(columnDendrogramClip, context);
      this.columnDendrogram.draw(columnDendrogramClip, context);
      context.restore();
    }
    if (this.isDendrogramVisible(false)) {
      var rowDendrogramClip = {
        x: 0,
        y: 0,
        width: this.rowDendrogram.getUnscaledWidth(),
        height: heatmapPrefSize.height
      };
      context.save();
      context.translate(0, heatmapY);
      this.rowDendrogram.prePaint(rowDendrogramClip, context);
      this.rowDendrogram.draw(rowDendrogramClip, context);
      context.restore();
    }

    for (var i = 0, length = this.columnTracks.length; i < length; i++) {
      var track = this.columnTracks[i];
      if (track.isVisible()) {
        context.save();
        var header = this.columnTrackHeaders[i];
        var headerSize = header.getPrintSize();
        context.translate(heatmapX, columnTrackY);
        var trackClip = {
          x: 0,
          y: 0,
          width: heatmapPrefSize.width,
          height: headerSize.height
        };
        track.print(trackClip, context);
        context.restore();
        // draw header

        context.save();

        var headerClip = {
          x: 0,
          y: 0,
          width: headerSize.width,
          height: trackClip.height
        };
        context.translate(heatmapX - 2, columnTrackY + trackClip.height);
        header.print(headerClip, context);
        context.restore();
        columnTrackY += Math.max(headerClip.height, trackClip.height);
      }
    }
    context.save();
    context.translate(heatmapX, heatmapY);

    this.heatmap.draw({
      x: 0,
      y: 0,
      width: heatmapPrefSize.width,
      height: heatmapPrefSize.height
    }, context);
    context.restore();
    var rowTrackWidthSum = 0;
    for (var i = 0, length = this.rowTracks.length; i < length; i++) {
      var track = this.rowTracks[i];
      if (track.isVisible()) {
        context.save();
        var tx = morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS + heatmapX + heatmapPrefSize.width + rowTrackWidthSum;
        var ty = heatmapY;
        var header = this.rowTrackHeaders[i];
        var headerSize = header.getPrintSize();
        var trackClip = {
          x: 0,
          y: 0,
          width: headerSize.width,
          height: heatmapPrefSize.height
        };
        context.translate(tx, ty);
        context.strokeStyle = 'white';
        context.rect(0, 0, trackClip.width, trackClip.height);
        // stroke is needed for clip to work for svg export
        context.stroke();
        context.clip();

        track.print(trackClip, context);
        context.restore();
        // draw header

        context.save();

        var headerClip = {
          x: 0,
          y: 0,
          width: headerSize.width,
          height: headerSize.height
        };
        context.translate(tx, ty - 4);
        header.print(headerClip, context);
        context.restore();
        rowTrackWidthSum += Math.max(headerSize.width, trackClip.width);
      }
    }
  }
  ,
  resetZoom: function () {
    var heatmap = this.heatmap;
    var rowSizes = heatmap.getRowPositions();
    var columnSizes = heatmap.getColumnPositions();
    rowSizes.setSize(14);
    columnSizes.setSize(14);
    var reval = {};
    if (this.project.getHoverRowIndex() !== -1) {
      reval.scrollTop = this.heatmap.getRowPositions().getPosition(
        this.project.getHoverRowIndex());
    }
    if (this.project.getHoverColumnIndex() !== -1) {
      reval.scrollLeft = this.heatmap.getColumnPositions().getPosition(
        this.project.getHoverColumnIndex());
    }
    this.revalidate(reval);
  }
  ,
  getFitColumnSize: function () {
    var heatmap = this.heatmap;
    var availablePixels = this.getAvailableWidth();
    if (availablePixels === -1) {
      return 14;
    }
    if (this.rowDendrogram) {
      availablePixels -= this.rowDendrogram.getUnscaledWidth();
    }
    var trackPixels = 12; // spacer
    for (var i = 0, length = this.rowTracks.length; i < length; i++) {
      var track = this.rowTracks[i];
      if (track.isVisible()) {
        trackPixels += track.getUnscaledWidth();
      }
    }
    for (var i = 0, length = this.columnTracks.length; i < length; i++) {
      var track = this.columnTracks[i];
      if (track.isVisible()) { // all column track headers have the
        // same width
        trackPixels += this.columnTrackHeaders[i].getUnscaledWidth();
        break;
      }
    }

    availablePixels -= trackPixels;

    var positions = heatmap.getColumnPositions();
    var totalCurrent = positions.getItemSize(positions.getLength() - 1)
      + positions.getPosition(positions.getLength() - 1);
    var size = positions.getSize();
    size = size * (availablePixels / totalCurrent);
    size = Math.min(14, size);
    return size;
  }
  ,
  getFitRowSize: function () {
    var heatmap = this.heatmap;
    var availablePixels = this.getAvailableHeight();
    if (availablePixels === -1) {
      return 14;
    }
    if (this.columnDendrogram) {
      availablePixels -= this.columnDendrogram.getUnscaledHeight();
    }
    var trackPixels = 12;
    for (var i = 0, length = this.columnTracks.length; i < length; i++) {
      var track = this.columnTracks[i];
      if (track.isVisible()) {
        trackPixels += track.getUnscaledHeight();
      }
    }
    availablePixels -= trackPixels;
    var positions = heatmap.getRowPositions();
    var totalCurrent = positions.getItemSize(positions.getLength() - 1)
      + positions.getPosition(positions.getLength() - 1);

    var size = positions.getSize();
    size = size * (availablePixels / totalCurrent);
    size = Math.min(14, size);
    return size;
  }
  ,
  /**
   * @param options.fitRows
   * @param options.fitColumns
   * @param options.repaint
   */
  fitToWindow: function (options) {
    if (options.fitRows) {
      this.heatmap.getRowPositions().setSize(this.getFitRowSize());
    }
    if (options.fitColumns) {
      this.heatmap.getColumnPositions().setSize(this.getFitColumnSize());
    }
    if (options.repaint) {
      var revalOptions = {};
      if (options.fitRows) {
        if (this.project.getHoverRowIndex() !== -1) {
          revalOptions.scrollTop = this.heatmap.getRowPositions().getPosition(
            this.project.getHoverRowIndex());
        }
      }
      if (options.fitColumns) {
        if (this.project.getHoverColumnIndex() !== -1) {
          revalOptions.scrollLeft = this.heatmap.getColumnPositions().getPosition(this.project.getHoverColumnIndex());
        }
      }
      this.revalidate(revalOptions);
    }
  }
  ,
  getAvailableHeight: function () {
    if (_.isNumber(this.options.height)) {
      return this.options.height;
    }
    var height = $(window).height() - this.$parent.offset().top - 24;
    if (this.options.height === 'window') {
      return height;
    }
    return Math.max(Math.round(screen.height * 0.7), height);
  }
  ,
  getAvailableWidth: function () {
    if (this.options.width) {
      return this.options.width;
    }
    // (this.$el.parent().outerWidth() - 30);
    // return this.$el.width() - 30;

    return this.tabManager.getWidth() - 30;
  }
  ,
  /**
   * Layout all the components
   */
  revalidate: function (options) {
    if (morpheus.Util.isHeadless()) {
      // hack to force creation of color scheme
      for (var i = 0, length = this.rowTracks.length; i < length; i++) {
        var track = this.rowTracks[i];
        track.setInvalid(true);
        if (track.isVisible()) {
          track.paint({
            x: 0,
            y: 0,
            height: 10,
            width: 10
          });
        }
      }
      for (var i = 0, length = this.columnTracks.length; i < length; i++) {
        var track = this.columnTracks[i];
        track.setInvalid(true);
        if (track.isVisible()) {
          track.paint({
            x: 0,
            y: 0,
            height: 10,
            width: 10
          });
        }
      }
      return;
    }
    options = $.extend({}, {
      paint: true
    }, options);
    this.updatingScroll = true;
    var availableHeight = this.getAvailableHeight();
    var availableWidth = this.getAvailableWidth();
    var heatmapPrefSize = this.heatmap.getPreferredSize();

    var columnDendrogramHeight = 0;
    var rowDendrogramWidth = 0;
    if (this.columnDendrogram) {
      columnDendrogramHeight = morpheus.CanvasUtil.getPreferredSize(this.columnDendrogram).height;
    }
    if (this.rowDendrogram) {
      rowDendrogramWidth = morpheus.CanvasUtil.getPreferredSize(this.rowDendrogram).width;
    }
    var rowTrackWidthSum = 0;
    for (var i = 0, length = this.rowTracks.length; i < length; i++) {
      if (this.rowTracks[i].isVisible()) {
        // was manually resized
        if (this.rowTracks[i].getPrefWidth() !== undefined) {
          this.rowTrackHeaders[i].setPrefWidth(this.rowTracks[i].getPrefWidth());
        }
        rowTrackWidthSum += Math.max(morpheus.CanvasUtil.getPreferredSize(this.rowTrackHeaders[i]).width,
          morpheus.CanvasUtil.getPreferredSize(this.rowTracks[i]).width);
      }
    }
    if (availableWidth !== -1 && (rowTrackWidthSum + rowDendrogramWidth + heatmapPrefSize.width) > availableWidth) {
      // shrink row tracks
      //var over = (rowTrackWidthSum + rowDendrogramWidth + heatmapPrefSize.width) - availableWidth;
      rowTrackWidthSum = 0;
      for (var i = 0, length = this.rowTracks.length; i < length; i++) {
        if (this.rowTracks[i].isVisible()) {
          var rowTrackHeaderSize = morpheus.CanvasUtil.getPreferredSize(this.rowTrackHeaders[i]);
          var width = Math.max(rowTrackHeaderSize.width, morpheus.CanvasUtil.getPreferredSize(this.rowTracks[i]).width);
          if (!rowTrackHeaderSize.widthSet) {
            width = Math.min(400, width);
            this.rowTracks[i].setPrefWidth(width);
            this.rowTrackHeaders[i].setPrefWidth(width);
          }
          rowTrackWidthSum += width;
        }
      }
    }

    var ypos = columnDendrogramHeight;
    var maxHeaderWidth = 0;
    // get max column header width
    for (var i = 0, length = this.columnTracks.length; i < length; i++) {
      if (this.columnTracks[i].isVisible()) {
        if (this.columnTracks[i].getPrefHeight() !== undefined) {
          this.columnTrackHeaders[i].setPrefHeight(this.columnTracks[i].getPrefHeight());
        }
        var width = morpheus.CanvasUtil.getPreferredSize(this.columnTrackHeaders[i]).width;
        maxHeaderWidth = Math.max(maxHeaderWidth, width);
      }
    }
    var xpos = Math.max(rowDendrogramWidth, maxHeaderWidth);
    var heatMapWidth = heatmapPrefSize.width;
    var maxHeatMapWidth = Math.max(50, availableWidth === -1 ? Number.MAX_VALUE : (availableWidth - rowTrackWidthSum
      - xpos
      - morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS));
    if (maxHeatMapWidth > 0 && heatMapWidth > maxHeatMapWidth) {
      heatMapWidth = maxHeatMapWidth;
      heatMapWidth = Math.min(heatMapWidth, heatmapPrefSize.width); // can't
      // go
      // bigger
      // than
      // pref
      // width
    }
    if (this.heatmap.prefWidth !== undefined) { // heat map was manually
      // resized
      heatMapWidth = Math.min(heatmapPrefSize.width,
        this.heatmap.prefWidth);
    }
    if (this.columnDendrogram !== undefined) {
      this.columnDendrogram.setBounds({
        width: heatMapWidth,
        height: columnDendrogramHeight,
        left: xpos,
        top: 0
      });
      this.columnDendrogram.$label.css('left',
        xpos + this.columnDendrogram.getUnscaledWidth() + 10).css(
        'top', 2);
      this.columnDendrogram.$squishedLabel.css('left',
        xpos + this.columnDendrogram.getUnscaledWidth() + 10).css(
        'top', 18);

      this.beforeColumnTrackDivider.setVisible(true);
      this.beforeColumnTrackDivider.setBounds({
        left: xpos - maxHeaderWidth,
        top: ypos,
        width: maxHeaderWidth
      });
      ypos++;
    } else {
      this.beforeColumnTrackDivider.setVisible(false);
    }

    for (var i = 0, length = this.columnTracks.length; i < length; i++) {
      var track = this.columnTracks[i];
      if (track.isVisible()) {
        var size = morpheus.CanvasUtil.getPreferredSize(track);
        var headerSize = morpheus.CanvasUtil.getPreferredSize(this.columnTrackHeaders[i]);
        size.height = Math.max(size.height, headerSize.height);
        track.setBounds({
          width: heatMapWidth,
          height: size.height,
          left: xpos,
          top: ypos
        });
        this.columnTrackHeaders[i].setBounds({
          width: maxHeaderWidth,
          height: size.height,
          left: xpos - maxHeaderWidth,
          top: ypos
        });
        ypos += size.height;
      }
    }
    this.$whitespace[0].style.left = Math.ceil(xpos + heatMapWidth + 10) + 'px';
    this.$whitespace[0].style.top = '0px';
    ypos += morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
    var heatMapHeight = heatmapPrefSize.height;
    if (availableHeight !== -1 && heatMapHeight > (availableHeight - ypos)) {
      heatMapHeight = Math.max(100, Math.min(heatmapPrefSize.height,
        availableHeight - ypos));
    }
    if (ypos < 0) {
      ypos = 0;
    }
    if (this.rowDendrogram) {
      this.rowDendrogram.setBounds({
        width: Math.max(rowDendrogramWidth, maxHeaderWidth),
        height: heatMapHeight,
        left: 0,
        top: ypos
      });
      this.rowDendrogram.$label.css('left', 0).css('top', 2);
      this.afterRowDendrogramDivider.setVisible(true);
      this.afterRowDendrogramDivider.setBounds({
        height: heatMapHeight,
        left: this.rowDendrogram.getUnscaledWidth(),
        top: ypos
      });
      xpos++;
    } else {
      this.afterRowDendrogramDivider.setVisible(false);
    }
    this.heatmap.setBounds({
      width: heatMapWidth,
      height: heatMapHeight,
      left: xpos,
      top: ypos
    });
    this.hSortByValuesIndicator.setBounds({
      height: 4,
      width: heatMapWidth,
      left: xpos,
      top: ypos - 4
    });
    this.hscroll.setVisible(heatMapWidth < heatmapPrefSize.width);
    this.hscroll.setExtent(heatMapWidth, heatmapPrefSize.width,
      options.scrollLeft !== undefined ? options.scrollLeft
        : (heatmapPrefSize.width === this.hscroll.getTotalExtent() ? this.hscroll.getValue()
        : heatmapPrefSize.width
        * this.hscroll.getValue()
        / this.hscroll.getMaxValue()));
    this.hscroll.setBounds({
      left: xpos,
      top: ypos + heatMapHeight + 2
    });
    xpos += heatMapWidth;
    var nvisibleRowTracks = 0;
    for (var i = 0, length = this.rowTracks.length; i < length; i++) {
      var track = this.rowTracks[i];
      if (track.isVisible()) {
        nvisibleRowTracks++;
        break;
      }
    }
    this.vSortByValuesIndicator.setBounds({
      width: 4,
      height: heatMapHeight,
      left: xpos,
      top: ypos
    });
    if (nvisibleRowTracks > 0) {
      xpos = xpos
        + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS; // leave
      // space
      // after
      // afterVerticalScrollBarDivider
    }
    var rowAnnotationXStart = xpos;
    // set row track bounds
    for (var i = 0, length = this.rowTracks.length; i < length; i++) {
      var track = this.rowTracks[i];
      if (track.isVisible()) {
        var size = morpheus.CanvasUtil.getPreferredSize(track);
        var headerSize = morpheus.CanvasUtil.getPreferredSize(this.rowTrackHeaders[i]);
        size.width = Math.max(headerSize.width, size.width);
        size.height = heatMapHeight;
        track.setBounds({
          width: size.width,
          height: size.height,
          left: xpos,
          top: ypos
        });

        this.rowTrackHeaders[i].setBounds({
          width: size.width,
          left: xpos,
          top: ypos - headerSize.height - 5,
          height: headerSize.height
        });
        xpos += size.width;
      }
    }
    this.afterVerticalScrollBarDivider.setVisible(nvisibleRowTracks > 0 ? true : false);
    this.afterVerticalScrollBarDivider.setBounds({
      left: rowAnnotationXStart - 2,
      top: ypos - 18
    });
    this.vscroll.setVisible(heatMapHeight < heatmapPrefSize.height);
    this.vscroll.setExtent(heatMapHeight, heatmapPrefSize.height,
      options.scrollTop !== undefined ? options.scrollTop
        : (heatmapPrefSize.height === this.vscroll.getTotalExtent() ? this.vscroll.getValue()
        : heatmapPrefSize.height
        * this.vscroll.getValue()
        / this.vscroll.getMaxValue()));
    xpos += 2;
    this.vscroll.setBounds({
      left: xpos,
      top: ypos
    });
    xpos += this.vscroll.getUnscaledWidth();
    if (this.hscroll.isVisible()) {
      ypos += this.hscroll.getUnscaledHeight() + 2;
    }
    var totalHeight = 2 + ypos + heatMapHeight;
    if (options.paint) {
      this.paintAll({
        paintRows: true,
        paintColumns: true,
        invalidateRows: true,
        invalidateColumns: true
      });
    }
    this.$parent.css({
      height: Math.ceil(totalHeight) + 'px',
      width: availableWidth === -1 ? (Math.ceil(xpos + 2) + 'px') : ''
    });

    this.updatingScroll = false;
    this.trigger('change', {
      name: 'revalidate',
      source: this,
      arguments: arguments
    });
  }
};
morpheus.HeatMap.copyFromParent = function (project, options) {
  // TODO persist sort order, grouping, dendrogram

  project.rowColorModel = options.parent.getProject().getRowColorModel().copy();
  project.columnColorModel = options.parent.getProject().getColumnColorModel().copy();

  project.rowShapeModel = options.parent.getProject().getRowShapeModel().copy();
  project.columnShapeModel = options.parent.getProject().getColumnShapeModel().copy();

  project.rowFontModel = options.parent.getProject().getRowFontModel().copy();
  project.columnFontModel = options.parent.getProject().getColumnFontModel().copy();

  var parentRowTracks = options.parent.rowTracks || [];
  var parentColumnTracks = options.parent.columnTracks || [];
  if (options.inheritFromParentOptions.rows) { // row similarity matrix
    project.columnShapeModel = project.rowShapeModel;
    project.columnColorModel = project.rowColorModel;
    project.columnFontModel = project.rowFontModel;
    parentColumnTracks = parentRowTracks.slice().reverse();
  }
  if (options.inheritFromParentOptions.columns) { // column similarity matrix
    project.rowShapeModel = project.columnShapeModel;
    project.rowColorModel = project.columnColorModel;
    project.rowFontModel = project.columnFontModel;
    parentRowTracks = parentColumnTracks.slice().reverse();
  }

  if (options.inheritFromParentOptions.transpose) {
    var tmp = project.rowShapeModel;
    project.rowShapeModel = project.columnShapeModel;
    project.columnShapeModel = tmp;

    tmp = project.rowColorModel;
    project.rowColorModel = project.columnColorModel;
    project.columnColorModel = tmp;

    tmp = project.rowFontModel;
    project.rowFontModel = project.columnFontModel;
    project.columnFontModel = tmp;

    tmp = parentRowTracks.slice().reverse();
    // swap tracks
    parentRowTracks = parentColumnTracks.slice().reverse();
    parentColumnTracks = tmp;
  }
  // copy track rendering options and order
  // from parent
  options.rows = options.rows || [];

  for (var i = 0; i < parentRowTracks.length; i++) {
    var track = parentRowTracks[i];
    if (track.isVisible()) {
      options.rows.push({
        order: options.rows.length,
        field: track.getName(),
        display: $.extend(true, {}, track.settings),
        force: true
      });
    }
  }
  options.columns = options.columns || [];
  for (var i = 0; i < parentColumnTracks.length; i++) {
    var track = parentColumnTracks[i];
    if (track.isVisible()) {
      options.columns.push({
        order: options.columns.length,
        field: track.getName(),
        display: $.extend(true, {}, track.settings),
        force: true
      });
    }
  }
};
morpheus.Util.extend(morpheus.HeatMap, morpheus.Events);

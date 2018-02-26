/**
 *
 * @param pageOptions.el
 * @param pageOptions.tabManager
 * @constructor
 */
morpheus.LandingPage = function (pageOptions) {
  pageOptions = $.extend({}, {
    el: $('#vis')
  }, pageOptions);
  this.pageOptions = pageOptions;
  var _this = this;

  var html = [];
  html.push('<div style="display:none;" class="container-fluid">');
  html.push('<div style="min-height:78vh" class="row">');
  html.push('<div class="col-xs-12 col-md-offset-1 col-md-7"><div' +
    ' data-name="input"></div>');
  html.push('<div class="clearfix"></div>');
  html.push('</div>'); // col
  html.push('<div data-name="desc" class="col-xs-12 col-md-3"><p><img' +
    ' src="https://software.broadinstitute.org/morpheus/css/images/morpheus_landing_img.png" style="width:100%;"></p></div>');
  html.push('</div>'); // row

  html.push('<div class="row"><div class="col-xs-12 morpheus-footer"></div></div>');
  html.push('</div>'); // container

  var $el = $(html.join(''));
  new morpheus.HelpMenu().$el.appendTo($el.find('.morpheus-footer'));
  this.$el = $el;
  var $description = $el.find('[data-name=desc]');
  morpheus.Util.createMorpheusHeader().appendTo($description);
  $('<p>Versatile matrix visualization and analysis software</p><p>View your dataset as a heat' +
    ' map,' +
    ' then explore' +
    ' the' +
    ' interactive tools in Morpheus. Cluster, create new annotations, search, filter, sort, display charts, and more.</p><p style="color:#586069;">30,000+ users <br />100,000+' +
    ' matrices analyzed</p>')
    .appendTo($description);

  var $input = $el.find('[data-name=input]');

  $('<svg width="32px" height="32px"><g><rect x="0" y="0" width="32" height="14" style="fill:#ca0020;stroke:none"/><rect x="0" y="18" width="32" height="14" style="fill:#0571b0;stroke:none"/></g></svg><h2 style="padding-left: 4px; display:inline-block;">Open</h2>')
    .appendTo($input);
  $('<div style="margin-bottom:20px;"><small>All' +
    ' data is' +
    ' processed in the' +
    ' browser and never sent to any server.</small></div>').appendTo($input);

  var filePicker = new morpheus.FilePicker({
    fileCallback: function (files) {
      _this.openFile(files);
    },
    optionsCallback: function (opt) {
      _this.open(opt);
    }
  });
  filePicker.$el.appendTo($input);

  if (pageOptions.tabManager) {
    this.tabManager = pageOptions.tabManager;
  } else {
    this.tabManager = new morpheus.TabManager({landingPage: this});
    this.tabManager.on('change rename add remove', function (e) {
      var title = _this.tabManager.getTabText(_this.tabManager.getActiveTabId());
      if (title == null || title === '') {
        title = 'Morpheus';
      }
      document.title = title;
    });

    this.tabManager.$nav.appendTo($(this.pageOptions.el));
    this.tabManager.$tabContent.appendTo($(this.pageOptions.el));
  }

}
;

morpheus.LandingPage.prototype = {
  open: function (openOptions) {
    this.dispose();
    var optionsArray = _.isArray(openOptions) ? openOptions : [openOptions];
    var _this = this;
    for (var i = 0; i < optionsArray.length; i++) {
      var options = optionsArray[i];
      options.tabManager = _this.tabManager;
      options.focus = i === 0;
      options.standalone = true;
      options.landingPage = _this;
      new morpheus.HeatMap(options);
    }

  },
  dispose: function () {
    this.$el.hide();
  },
  show: function () {
    var _this = this;
    this.$el.show();
    if (!morpheus.Util.isNode()) {
      $(window).on('beforeunload.morpheus', function () {
        if (_this.tabManager.getTabCount() > 0) {
          return 'Are you sure you want to close Morpheus?';
        }
      });
    }
  },
  openFile: function (files) {
    if (files.length !== 3) {
      var _this = this;
      var file = files[0];
      var fileName = morpheus.Util.getFileName(file);
      if (fileName.toLowerCase().indexOf('.json') === fileName.length - 5) {
        morpheus.Util.getText(file).done(function (text) {
          _this.open(JSON.parse(text));
        }).fail(function (err) {
          morpheus.FormBuilder.showMessageModal({
            title: 'Error',
            message: 'Unable to load session'
          });
        });
      } else {
        var options = {
          dataset: {
            file: file,
            options: {interactive: true}
          }
        };

        morpheus.OpenDatasetTool.fileExtensionPrompt(fileName, function (readOptions) {
          if (readOptions) {
            for (var key in readOptions) {
              options.dataset.options[key] = readOptions[key];
            }
          }
          _this.open(options);
        });
      }
    } else {
      // matrixFile, genesFile, barcodesFile
      var options = {
        dataset: {
          file: files[0],
          options: {interactive: true}
        }
      };
      var genesPromise = morpheus.Util.readLines(files[1]);
      var geneLines;
      var barcodeLines;
      genesPromise.done(function (lines) {
        geneLines = lines;
      });
      var barcodesPromise = morpheus.Util.readLines(files[2]);
      barcodesPromise.done(function (lines) {
        barcodeLines = lines;
      });
      options.promises = [genesPromise, barcodesPromise];
      options.datasetReady = function (dataset) {
        var columnIds = dataset.getColumnMetadata().add('id');
        var tab = /\t/;
        for (var j = 0, size = dataset.getColumnCount(); j < size; j++) {
          columnIds.setValue(j, barcodeLines[j].split(tab)[0]);
        }
        // var nrowTokens = geneLines[0].split(tab).length;
        var rowIds = dataset.getRowMetadata().add('id');
        var geneSymbols = dataset.getRowMetadata().add('symbol');
        for (var i = 0, size = dataset.getRowCount(); i < size; i++) {
          var tokens = geneLines[i].split(tab);
          rowIds.setValue(i, tokens[0]);
          geneSymbols.setValue(i, tokens[1]);
        }
        // var rowIndices = [];
        // var countVector = dataset.getRowMetadata().getByName('count>0');
        // for (var i = 0, nrows = dataset.getRowCount(); i < size; i++) {
        //   if (countVector.getValue(i) > 0) {
        //     rowIndices.push(i);
        //   }
        // }
        // return new morpheus.SlicedDatasetView(dataset, rowIndices, null);
      };
      this.open(options);
    }
  }
};

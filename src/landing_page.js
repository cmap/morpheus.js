morpheus.LandingPage = function (pageOptions) {
  pageOptions = $.extend({}, {
    el: $('#vis')
  }, pageOptions);
  this.pageOptions = pageOptions;
  var _this = this;

  var $el = $('<div class="container-fluid" style="display: none;"></div>');
  this.$el = $el;
  var html = [];
  html.push('<div data-name="help" class="pull-right"></div>');
  html.push('<div class="row">');

  html.push('<div class="col-xs-12 col-md-offset-1 col-md-7"><div' +
    ' data-name="input"></div>');
  html.push('<div style="height:20px;"></div>');
  html.push('<hr />');
  html.push('<div style="height:20px;"></div>');
  html.push('<a data-toggle="collapse"' +
    ' href="#morpheus-preloadedDataset" aria-expanded="false"' +
    ' aria-controls="morpheus-preloadedDataset"><h4>Preloaded datasets</h4></a>');
  html.push('<div style="padding-left:20px;" class="collapse"' +
    ' id="morpheus-preloadedDataset"></div>');
  html.push('</div>'); // col
  html.push('<div data-name="desc" class="col-xs-12 col-md-3"><p><img' +
    ' src="images/morpheus_landing_img.png" style="width:100%;"></p></div>');
  html.push('</div>'); // container
  var $html = $(html.join(''));
  $html.appendTo($el);
  var $description = $el.find('[data-name=desc]');

  morpheus.Util.createMorpheusHeader().appendTo($description);
  $('<p>Versatile heatmap analysis and visualization</p><p>View your dataset as a heat map,' +
    ' and then explore' +
    ' the' +
    ' interactive tools in Morpheus' +
    ' to analyze the data and highlight results. Find relationships between data points, create new annotations, filter or cluster your data, display charts, and more.</p>').appendTo($description);
  new morpheus.HelpMenu().$el.appendTo($el.find('[data-name=help]'));
  var formBuilder = new morpheus.FormBuilder({formStyle: 'vertical'});
  formBuilder.append({
    name: 'file',
    showLabel: false,
    value: '',
    type: 'file',
    required: true,
    help: morpheus.DatasetUtil.DATASET_AND_SESSION_FILE_FORMATS + '<br />All data is processed in the' +
    ' browser and never sent to any server.'
  });
  var $input = $el.find('[data-name=input]');
  $('<svg width="32px" height="32px"><g><rect x="0" y="0" width="32" height="14" style="fill:#ca0020;stroke:none"/><rect x="0" y="18" width="32" height="14" style="fill:#0571b0;stroke:none"/></g></svg><h2 style="padding-left: 4px; display:inline-block;">Open</h2>').appendTo($input);
  formBuilder.$form.appendTo($input);
  this.formBuilder = formBuilder;
  this.$sampleDatasetsEl = $el.find('#morpheus-preloadedDataset');

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
  // for (var i = 0; i < brands.length; i++) {
  // 	brands[i].style.color = colorScale(i);
  // }
};

morpheus.LandingPage.prototype = {
  open: function (openOptions) {
    this.dispose();
    var optionsArray = _.isArray(openOptions) ? openOptions : [openOptions];
    var _this = this;
    for (var i = 0; i < optionsArray.length; i++) {
      var options = optionsArray[i];
      options.tabManager = _this.tabManager;
      options.focus = i === 0;
      options.landingPage = _this;
      new morpheus.HeatMap(options);
    }

  },
  dispose: function () {
    this.formBuilder.setValue('file', '');
    this.$el.hide();
    $(window)
    .off(
      'paste.morpheus drop.morpheus dragover.morpheus dragenter.morpheus');
    this.formBuilder.off('change');
  },
  show: function () {
    var _this = this;
    this.$el.show();

    this.formBuilder.on('change', function (e) {
      var value = e.value;
      if (value !== '' && value != null) {
        _this.openFile(value);
      }
    });

    $(window).on('beforeunload.morpheus', function () {
      if (_this.tabManager.getTabCount() > 0) {
        return 'Are you sure you want to close Morpheus?';
      }
    });
    $(window).on('paste.morpheus', function (e) {
      var tagName = e.target.tagName;
      if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
        return;
      }

      var text = e.originalEvent.clipboardData.getData('text/plain');
      if (text != null && text.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        var url;
        if (text.indexOf('http') === 0) {
          url = text;
        } else {
          var blob = new Blob([text]);
          url = window.URL.createObjectURL(blob);
        }

        _this.openFile(url);
      }

    }).on('dragover.morpheus dragenter.morpheus', function (e) {
      e.preventDefault();
      e.stopPropagation();
    }).on(
      'drop.morpheus',
      function (e) {
        if (e.originalEvent.dataTransfer
          && e.originalEvent.dataTransfer.files.length) {
          e.preventDefault();
          e.stopPropagation();
          var files = e.originalEvent.dataTransfer.files;
          _this.openFile(files[0]);
        } else if (e.originalEvent.dataTransfer) {
          var url = e.originalEvent.dataTransfer.getData('URL');
          e.preventDefault();
          e.stopPropagation();
          _this.openFile(url);
        }
      });
    if (navigator.onLine && !this.sampleDatasets) {
      this.sampleDatasets = new morpheus.SampleDatasets({
        $el: this.$sampleDatasetsEl,
        show: true,
        callback: function (heatMapOptions) {
          _this.open(heatMapOptions);
        }
      });
    }
  },
  openFile: function (value) {
    var _this = this;
    var fileName = morpheus.Util.getFileName(value);
    if (fileName.toLowerCase().indexOf('.json') === fileName.length - 5) {
      morpheus.Util.getText(value).done(function (text) {
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
          file: value,
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
  }
};

morpheus.LandingPage = function (pageOptions) {
  pageOptions = $.extend({}, {
    el: $('#vis')
  }, pageOptions);
  this.pageOptions = pageOptions;
  var _this = this;

  var $el = $('<div class="container" style="display: none;"></div>');
  this.$el = $el;
  var html = [];
  morpheus.Util.createMorpheusHeader().appendTo($el);
  html.push('<div data-name="help" class="pull-right"></div>');

  html.push('<h4>Open your own file</h4>');
  html.push('<div data-name="formRow" class="center-block"></div>');
  html.push('<div style="display: none;" data-name="preloadedDataset"><h4>Or select a preloaded' +
    ' dataset</h4></div>');
  html.push('</div>');
  var $html = $(html.join(''));

  $html.appendTo($el);
  new morpheus.HelpMenu().$el.appendTo($el.find('[data-name=help]'));
  var formBuilder = new morpheus.FormBuilder();
  formBuilder.append({
    name: 'file',
    showLabel: false,
    value: '',
    type: 'file',
    required: true,
    help: morpheus.DatasetUtil.DATASET_AND_SESSION_FILE_FORMATS + '<br />All data is processed in the' +
    ' browser and never sent to any server'
  });
  formBuilder.$form.appendTo($el.find('[data-name=formRow]'));
  this.formBuilder = formBuilder;
  this.$sampleDatasetsEl = $el.find('[data-name=preloadedDataset]');

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

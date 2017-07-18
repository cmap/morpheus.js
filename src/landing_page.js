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
    ' src="css/images/morpheus_landing_img.png" style="width:100%;"></p></div>');
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
    ' interactive tools in Morpheus. Cluster, create new annotations, search, filter, sort, display charts, and more.</p><p style="color:#586069;">27,000+ users <br />89,000+ matrices analyzed</p>').appendTo($description);

  var $input = $el.find('[data-name=input]');

  $('<svg width="32px" height="32px"><g><rect x="0" y="0" width="32" height="14" style="fill:#ca0020;stroke:none"/><rect x="0" y="18" width="32" height="14" style="fill:#0571b0;stroke:none"/></g></svg><h2 style="padding-left: 4px; display:inline-block;">Open</h2>').appendTo($input);
  $('<div style="margin-bottom:20px;">' + morpheus.DatasetUtil.DATASET_AND_SESSION_FILE_FORMATS + '<br' +
    ' />All' +
    ' data is' +
    ' processed in the' +
    ' browser and never sent to any server.</div>').appendTo($input);

  var filePicker = new morpheus.FilePicker({
    fileCallback: function (file) {
      _this.openFile(file);
    },
    optionsCallback: function (opt) {
      _this.open(opt);
    }
  });
  filePicker.$el.appendTo($input);

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
    $(window).on('beforeunload.morpheus', function () {
      if (_this.tabManager.getTabCount() > 0) {
        return 'Are you sure you want to close Morpheus?';
      }
    });
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

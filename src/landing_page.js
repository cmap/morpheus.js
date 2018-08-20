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
  html.push('<div data-name="desc" class="col-xs-12 col-md-3"><div style="margin-top: 16px;" data-name="heatmap"></div></div>');
  html.push('</div>'); // row

  html.push('<div class="row"><div class="col-xs-12 morpheus-footer"></div></div>');
  html.push('</div>'); // container


  var $el = $(html.join(''));
  var colorScale = morpheus.LandingPage.showHeatMap($el.find('[data-name=heatmap]')[0]);
  new morpheus.HelpMenu().$el.appendTo($el.find('.morpheus-footer'));
  this.$el = $el;
  var $description = $el.find('[data-name=desc]');

  function lerpColor(a, b, amount) {

    var ah = parseInt(a.replace(/#/g, ''), 16),
      ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
      bh = parseInt(b.replace(/#/g, ''), 16),
      br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
      rr = ar + amount * (br - ar),
      rg = ag + amount * (bg - ag),
      rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
  }

  var animCb = function (f) {
    if (f === 1) {
      d3.selectAll('.morpheus-heatmap-text').remove();
      d3.selectAll('.morpheus-heatmap-elem')
        .style('fill', function (d) {
          return colorScale(d.value);
        });
    } else {
      d3.selectAll('.morpheus-heatmap-text')
        .style('opacity', function (d) {
          return 1 - f;
        });
      d3.selectAll('.morpheus-heatmap-elem')
        .style('fill', function (d) {
          return lerpColor('#FFFFFF', colorScale(d.value), f);
        });
    }


  };
  morpheus.Util.createMorpheusHeader(animCb).appendTo($description);
  $('<p>Versatile matrix visualization and analysis software</p><p>View your dataset as a heat' +
    ' map, then explore the interactive tools in Morpheus. Cluster, create new annotations, search, filter, sort, display charts, and more.</p>' +
    '<p style="color:#586069;">30,000+ users <br />100,000+' +
    ' matrices analyzed.</p><p style="font-size:12px;">If you use Morpheus for published work, please cite:<br />Morpheus, https://software.broadinstitute.org/morpheus</p>')
    .appendTo($description);


  var $input = $el.find('[data-name=input]');

  $('<svg width="32px" height="32px"><g><rect x="0" y="0" width="32" height="14" style="fill:#ca0020;stroke:none"/><rect x="0" y="18" width="32" height="14" style="fill:#0571b0;stroke:none"/></g></svg><h2 style="padding-left: 4px; display:inline-block;">Open</h2>')
    .appendTo($input);
  $('<div style="margin-bottom:20px;"><small>All' +
    ' data is' +
    ' processed on your computer and never sent to any server.</small></div>').appendTo($input);

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


morpheus.LandingPage.showHeatMap = function (id) {
  var matrix = [
    [1.34, 1.88, 0.01, 0.93, -0.09, 1.13, -0.66, -0.4, -0.91, -1.13, -0.75],
    [1.13, 1.84, 0.89, 1.38, -0.39, -0.13, -0.59, -0.74, -0.42, -0.84, -1],
    [1.1, 0.29, 0.83, -0.62, -0.59, 1.78, -1.11, 1.24, -1.15, -0.39, -0.28],
    [1.04, 1.97, -0.02, 1.46, -0.35, 0.47, -0.62, -0.96, -0.61, -0.81, -0.54],
    [-1.2, -0.66, -0.79, -0.91, -0.35, -0.93, -0.25, 0.75, 1.81, 1.48, -0.15],
    [-1.41, -1.01, -0.59, -0.9, -0.67, -0.95, 0.44, 0.87, 2.02, 0.67, 0.11],
    [-1.42, -0.71, -0.51, -1.02, -0.8, -0.92, -0.07, 0.64, 2.1, 0.76, 0.53],
    [-1.47, -1, -0.88, -1.26, -0.38, -1.02, 1.05, 0.83, 0.64, 1.31, 0.72]
  ];

  var colorScale =
    d3.scale.linear().range(['#ca0020', 'white', '#0571b0']).domain([-1.5, 0, 1.5]);
  var margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  var gridWidth = 40;
  var gridHeight = 25;
  var width = matrix.length * gridWidth - margin.left - margin.right;
  var height = matrix[0].length * gridHeight - margin.top - margin.bottom;

  var svg = d3.select(id).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var data = [];
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix[0].length; j++) {
      data.push({
        x: i,
        y: j,
        value: matrix[i][j]
      });
    }
  }
  var elements = svg.selectAll('.morpheus-heatmap-elem').data(data);
  var rects = elements.enter().append('rect');
  rects.attr('x', function (d, index) {
    return (d.x) * gridWidth;
  }).attr('y', function (d) {
    return (d.y) * gridHeight;
  }).attr('class', 'morpheus-heatmap-elem')
    .attr('width', gridWidth)
    .attr('height', gridHeight)
    .style('fill', 'white').style('stroke', '#E6E6E6');
  var labels = svg.selectAll('.text')
    .data(data)
    .enter().append('text')
    .text(function (d) {
      return '' + d.value;
    })
    .attr('x', function (d) {
      return d.x * gridWidth + gridWidth / 2;
    })
    .attr('y', function (d) {
      return d.y * gridHeight + gridHeight / 2 + 4;
    })
    .style('text-anchor', 'middle').attr('class', 'morpheus-heatmap-text');
  return colorScale;

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
        morpheus.Util.getText(file).then(function (text) {
          _this.open(JSON.parse(text));
        }).catch(function (err) {
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
      genesPromise.then(function (lines) {
        geneLines = lines;
      });
      var barcodesPromise = morpheus.Util.readLines(files[2]);
      barcodesPromise.then(function (lines) {
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

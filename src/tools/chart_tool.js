/**
 * @param chartOptions.project
 *            morpheus.Project
 * @param chartOptions.getVisibleTrackNames
 *            {Function}
 */
morpheus.ChartTool = function (chartOptions) {
  var _this = this;
  this.getVisibleTrackNames = chartOptions.getVisibleTrackNames;
  this.project = chartOptions.project;
  var project = this.project;
  this.$el = $('<div class="container-fluid">'
    + '<div class="row">'
    + '<div data-name="configPane" class="col-xs-2"></div>'
    + '<div class="col-xs-10"><div style="position:relative;" data-name="chartDiv"></div></div>'
    + '</div></div>');

  var formBuilder = new morpheus.FormBuilder({
    vertical: true
  });
  this.formBuilder = formBuilder;
  formBuilder.append({
    name: 'chart_type',
    type: 'bootstrap-select',
    options: ['boxplot', 'row scatter matrix', 'column scatter matrix', 'row' +
    ' profile', 'column' +
    ' profile']
  });
  var rowOptions = [];
  var columnOptions = [];
  var numericRowOptions = [];
  var numericColumnOptions = [];
  var options = [];
  var numericOptions = [];
  var updateOptions = function () {
    var dataset = project.getFullDataset();
    rowOptions = [{
      name: '(None)',
      value: ''
    }];
    columnOptions = [{
      name: '(None)',
      value: ''
    }];
    numericRowOptions = [{
      name: '(None)',
      value: ''
    }];
    numericColumnOptions = [{
      name: '(None)',
      value: ''
    }];
    options = [{
      name: '(None)',
      value: ''
    }];
    numericOptions = [{
      name: '(None)',
      value: ''
    }];

    morpheus.MetadataUtil.getMetadataNames(dataset.getRowMetadata())
    .forEach(
      function (name) {
        var dataType = morpheus.VectorUtil
        .getDataType(dataset.getRowMetadata()
        .getByName(name));
        if (dataType === 'number'
          || dataType === '[number]') {
          numericRowOptions.push({
            name: name + ' (row)',
            value: name + '_r'
          });
        }
        rowOptions.push({
          name: name + ' (row)',
          value: name + '_r'
        });
      });

    morpheus.MetadataUtil.getMetadataNames(dataset.getColumnMetadata())
    .forEach(
      function (name) {
        var dataType = morpheus.VectorUtil
        .getDataType(dataset.getColumnMetadata()
        .getByName(name));
        if (dataType === 'number'
          || dataType === '[number]') {
          numericColumnOptions.push({
            name: name + ' (column)',
            value: name + '_c'
          });
        }
        columnOptions.push({
          name: name + ' (column)',
          value: name + '_c'
        });
      });

    options = options.concat(rowOptions.slice(1));
    options = options.concat(columnOptions.slice(1));

    numericOptions = numericOptions.concat(numericRowOptions.slice(1));
    numericOptions = numericOptions.concat(numericColumnOptions.slice(1));
  };

  updateOptions();
  formBuilder.append({
    name: 'group_columns_by',
    type: 'bootstrap-select',
    options: options
  });
  formBuilder.append({
    name: 'group_rows_by',
    type: 'bootstrap-select',
    options: options
  });

  formBuilder.append({
    name: 'axis_label',
    type: 'bootstrap-select',
    options: rowOptions
  });
  formBuilder.append({
    name: 'show_points',
    type: 'checkbox',
    value: true
  });

  formBuilder.append({
    name: 'color',
    type: 'bootstrap-select',
    options: options
  });

  formBuilder.append({
    name: 'size',
    type: 'bootstrap-select',
    options: numericOptions
  });
  formBuilder.append({
    name: 'tooltip',
    type: 'bootstrap-select',
    multiple: true,
    search: true,
    options: options.slice(1)
  });

  formBuilder.append({
    name: 'chart_width',
    type: 'range',
    value: 400,
    min: 60,
    max: 800,
    step: 10
  });
  formBuilder.append({
    name: 'chart_height',
    type: 'range',
    value: 400,
    min: 20,
    max: 800,
    step: 10
  });

  // series filter for boxplot
  formBuilder.addSeparator();
  var boxPlotFormNames = ['series', 'lower_selector', 'lower', 'upper_selector', 'upper'];
  formBuilder.append({
    name: 'series',
    type: 'bootstrap-select',
    options: ['(None)'].concat(morpheus.DatasetUtil
    .getSeriesNames(project.getFullDataset()))
  });
  formBuilder.append({
    showLabel: false,
    name: 'lower_selector',
    type: 'bootstrap-select',
    options: [{
      value: 'gte',
      name: '&gt;='
    }, {
      value: 'gt',
      name: '&gt;'
    }]
  });
  formBuilder.append({
    showLabel: false,
    name: 'lower',
    type: 'text'
  });

  formBuilder.append({
    showLabel: false,
    name: 'upper_selector',
    type: 'bootstrap-select',
    options: [{
      value: 'lte',
      name: '&lt;='
    }, {
      value: 'lt',
      name: '&lt;='
    }]
  });
  formBuilder.append({
    showLabel: false,
    name: 'upper',
    type: 'text'
  });

  function setVisibility() {
    var chartType = formBuilder.getValue('chart_type');
    if (chartType !== 'boxplot' && chartType !== 'histogram') {
      formBuilder.setOptions('axis_label',
        (chartType === 'row scatter matrix' || chartType === 'column profile') ? rowOptions : columnOptions,
        true);
      formBuilder.setOptions('color',
        (chartType === 'row scatter matrix' || chartType === 'column profile') ? columnOptions : rowOptions,
        true);
      formBuilder.setOptions('size',
        (chartType === 'row scatter matrix' || chartType === 'row profile') ? numericColumnOptions
          : numericRowOptions, true);

    } else {
      formBuilder.setOptions('color', options, true);
      formBuilder.setOptions('size', numericOptions, true);
    }
    boxPlotFormNames.forEach(function (name) {
      formBuilder.setVisible(name, chartType === 'boxplot');
    });

    formBuilder.setVisible('chart_width', chartType !== 'row profile' && chartType !== 'column profile');
    formBuilder.setVisible('chart_height', chartType !== 'row profile' && chartType !== 'column profile');
    formBuilder.setVisible('tooltip', chartType !== 'histogram');
    formBuilder.setVisible('group_rows_by', (chartType === 'boxplot' || chartType === 'histogram' || chartType === 'ecdf'));
    formBuilder.setVisible('group_columns_by', (chartType === 'boxplot' || chartType === 'histogram' || chartType === 'ecdf'));
    formBuilder.setVisible('color', chartType !== 'histogram');
    formBuilder.setVisible('size', chartType !== 'histogram' && chartType !== 'ecdf');
    formBuilder.setVisible('axis_label', (chartType !== 'boxplot' && chartType !== 'histogram' && chartType !== 'ecdf'));

  }

  this.tooltip = [];
  var draw = function () {
    _.debounce(_this.draw(), 100);
  };
  formBuilder.$form.on('change', 'select,input[type=range]', function (e) {
    if ($(this).attr('name') === 'tooltip') {
      var tooltipVal = _this.formBuilder.getValue('tooltip');
      _this.tooltip = [];
      if (tooltipVal != null) {
        tooltipVal.forEach(function (tip) {
          _this.tooltip.push(morpheus.ChartTool.getVectorInfo(tip));
        });
      }
    } else {
      setVisibility();
      draw();
    }

  });

  formBuilder.$form.on('click', 'input[type=checkbox]', function (e) {
    draw();

  });
  formBuilder.$form.on('keypress', 'input[type=text]', function (e) {
    if (e.which === 13) {
      draw();
    }
  });

  setVisibility();

  var trackChanged = function () {
    updateOptions();
    setVisibility();
    formBuilder.setOptions('group_columns_by', options, true);
    formBuilder.setOptions('group_rows_by', options, true);
  };

  project.getColumnSelectionModel().on('selectionChanged.chart', draw);
  project.getRowSelectionModel().on('selectionChanged.chart', draw);
  project.on('trackChanged.chart', trackChanged);
  this.$chart = this.$el.find('[data-name=chartDiv]');
  var $dialog = $('<div style="background:white;" title="Chart"></div>');
  var $configPane = this.$el.find('[data-name=configPane]');
  formBuilder.$form.appendTo($configPane);
  this.$el.appendTo($dialog);
  $dialog.dialog({
    dialogClass: 'morpheus',
    close: function (event, ui) {
      project.off('trackChanged.chart', trackChanged);
      project.getRowSelectionModel().off('selectionChanged.chart', draw);
      project.getColumnSelectionModel().off('selectionChanged.chart',
        draw);
      _this.$el.empty();
    },

    resizable: true,
    height: 600,
    width: 900
  });
  this.$dialog = $dialog;
  this.draw();
};

morpheus.ChartTool.getPlotlyDefaults = function () {
  var layout = {
    hovermode: 'closest',
    autosize: true,
    paper_bgcolor: 'rgb(255,255,255)',
    plot_bgcolor: 'rgb(229,229,229)',
    showlegend: false,
    margin: {
      l: 80,
      r: 10,
      t: 8, // leave space for modebar
      b: 14,
      autoexpand: true
    },
    xaxis: {
      zeroline: false,
      titlefont: {
        size: 12
      },
      gridcolor: 'rgb(255,255,255)',
      showgrid: true,
      showline: false,
      showticklabels: true,
      tickcolor: 'rgb(127,127,127)',
      ticks: 'outside'
    },
    yaxis: {
      zeroline: false,
      titlefont: {
        size: 12
      },
      gridcolor: 'rgb(255,255,255)',
      showgrid: true,
      showline: false,
      showticklabels: true,
      tickcolor: 'rgb(127,127,127)',
      ticks: 'outside'
    }
  };
  var config = {
    showLink: false,
    displayModeBar: true, // always show modebar
    displaylogo: false,
    staticPlot: false,
    showHints: true,
    modeBarButtonsToRemove: ['sendDataToCloud', 'zoomIn2d', 'zoomOut2d', 'hoverCompareCartesian', 'hoverClosestCartesian']
  };
  return {
    layout: layout,
    config: config
  };
};

morpheus.ChartTool.getVectorInfo = function (value) {
  var field = value.substring(0, value.length - 2);
  var isColumns = value.substring(value.length - 2) === '_c';
  return {
    field: field,
    isColumns: isColumns
  };
};
morpheus.ChartTool.prototype = {
  annotate: function (options) {
    var _this = this;
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
    // formBuilder.append({
    // name : 'annotate',
    // type : 'radio',
    // required : true,
    // options : [ 'Rows', 'Columns', 'Rows And Columns' ],
    // value : 'Rows'
    // });
    morpheus.FormBuilder
    .showOkCancel({
      title: 'Annotate Selection',
      content: formBuilder.$form,
      okCallback: function () {
        var dataset = options.dataset;
        var eventData = options.eventData;
        var array = options.array;
        var value = formBuilder.getValue('annotation_value');
        var annotationName = formBuilder
        .getValue('annotation_name');
        // var annotate = formBuilder.getValue('annotate');
        var isRows = true;
        var isColumns = true;
        var existingRowVector = null;
        var rowVector = null;
        if (isRows) {
          existingRowVector = dataset.getRowMetadata()
          .getByName(annotationName);
          rowVector = dataset.getRowMetadata().add(
            annotationName);
        }
        var existingColumnVector = null;
        var columnVector = null;
        if (isColumns) {
          existingColumnVector = dataset.getColumnMetadata()
          .getByName(annotationName);
          columnVector = dataset.getColumnMetadata().add(
            annotationName);
        }

        for (var p = 0, nselected = eventData.points.length; p < nselected; p++) {
          var item = array[eventData.points[p].pointNumber];
          if (isRows) {
            if (_.isArray(item.row)) {
              item.row.forEach(function (r) {
                rowVector.setValue(r, value);
              });

            } else {
              rowVector.setValue(item.row, value);
            }

          }
          if (isColumns) {
            columnVector.setValue(item.column, value);
          }
        }
        if (isRows) {
          morpheus.VectorUtil
          .maybeConvertStringToNumber(rowVector);
          _this.project.trigger('trackChanged', {
            vectors: [rowVector],
            render: existingRowVector != null ? []
              : [morpheus.VectorTrack.RENDER.TEXT],
            columns: false
          });
        }
        if (isColumns) {
          morpheus.VectorUtil
          .maybeConvertStringToNumber(columnVector);
          _this.project.trigger('trackChanged', {
            vectors: [columnVector],
            render: existingColumnVector != null ? []
              : [morpheus.VectorTrack.RENDER.TEXT],
            columns: true
          });
        }
      }
    });

  },
  _createScatter: function (options) {
    var dataset = options.dataset;
    var colorByVector = options.colorByVector;
    var colorModel = options.colorModel;
    var sizeByVector = options.sizeByVector;
    var sizeFunction = options.sizeFunction;

    var heatmap = this.heatmap;
    var myPlot = options.myPlot;
    var isColumnChart = options.isColumnChart;
    // scatter
    var x = [];
    var y = [];
    var text = [];
    var color = colorByVector ? [] : '#1f78b4';
    var size = sizeByVector ? [] : 6;

    var array = [];
    for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
      y.push(dataset.getValue(options.rowIndexOne, j));
      x.push(dataset.getValue(options.rowIndexTwo, j));
      array.push({
        row: [options.rowIndexOne, options.rowIndexTwo],
        column: j
      });
      if (colorByVector) {
        var colorByValue = colorByVector.getValue(j);
        color.push(colorModel.getMappedValue(colorByVector,
          colorByValue));
      }
      if (sizeByVector) {
        var sizeByValue = sizeByVector.getValue(j);
        size.push(sizeFunction(sizeByValue));
      }
      var obj = {
        j: j
      };
      obj.toString = function () {
        var s = [];
        for (var tipIndex = 0; tipIndex < _this.tooltip.length; tipIndex++) {
          var tip = _this.tooltip[tipIndex];
          if (tip.isColumns) {
            morpheus.HeatMapTooltipProvider.vectorToString(dataset.getColumnMetadata().getByName(tip.field),
              this.j, s, '<br>');
          }
        }

        return s.join('');

      };
      text.push(obj);
    }

    // TODO add R^2
    var trace = {
      x: x,
      y: y,
      marker: {
        color: color,
        size: size,
        symbol: 'circle-open'
      },
      text: text,
      mode: 'markers',
      type: 'scatter' // scattergl
    };
    var selection = null;
    var _this = this;
    var config = $
    .extend(
      true,
      {},
      options.config,
      {
        modeBarButtonsToAdd: [[{
          name: 'annotate',
          title: 'Annotate Selection',
          attr: 'dragmode',
          val: 'annotate',
          icon: {
            'width': 1792,
            'path': 'M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z',
            'ascent': 1792,
            'descent': 0
          },
          click: function () {
            if (!selection) {
              morpheus.FormBuilder
              .showInModal({
                title: 'Annotate Selection',
                html: 'Please select points in the chart',
                close: 'Close'
              });
            } else {
              _this.annotate({
                array: array,
                eventData: selection,
                dataset: dataset
              });
            }
          }
        }]]
      });
    morpheus.ChartTool.newPlot(myPlot, [trace], options.layout, config);
    myPlot.on('plotly_selected', function (eventData) {
      selection = eventData;
    });

  },
  _createProfile: function (options) {
    var dataset = options.dataset;
    // only allow coloring by row
    var colorByVector = options.colorByVector;
    var colorModel = options.colorModel;
    var sizeByVector = options.sizeByVector;
    var sizeFunction = options.sizeFunction;
    var axisLabelVector = options.axisLabelVector;
    var isColumnChart = options.isColumnChart;
    var heatmap = this.heatmap;
    var myPlot = options.myPlot;

    var traces = [];
    var ticktext = [];
    var tickvals = [];
    for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
      ticktext.push(axisLabelVector != null ? axisLabelVector.getValue(j) : '' + j);
      tickvals.push(j);
    }
    for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
      // each row is a new trace
      var x = [];
      var y = [];
      var text = [];
      var size = sizeByVector ? [] : 6;
      var color = colorByVector ? colorModel.getMappedValue(colorByVector,
          colorByVector.getValue(i)) : undefined;

      for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
        x.push(j);
        y.push(dataset.getValue(i, j));

        if (sizeByVector) {
          var sizeByValue = sizeByVector.getValue(j);
          size.push(sizeFunction(sizeByValue));
        }
        var obj = {
          i: i,
          j: j
        };
        obj.toString = function () {
          var s = [];
          for (var tipIndex = 0; tipIndex < _this.tooltip.length; tipIndex++) {
            var tip = _this.tooltip[tipIndex];
            if (tip.isColumns) {
              morpheus.HeatMapTooltipProvider.vectorToString(dataset.getColumnMetadata().getByName(tip.field),
                this.j, s, '<br>');
            } else {
              morpheus.HeatMapTooltipProvider.vectorToString(dataset.getRowMetadata().getByName(tip.field),
                this.i, s, '<br>');
            }
          }

          return s.join('');

        };

        text.push(obj);
      }
      var trace = {
          x: x,
          y: y,
          name: colorByVector ? colorByVector.getValue(i) : '',
          tickmode: 'array',
          marker: {
            size: size,
            symbol: 'circle'
          },
          text: text,
          mode: 'lines' + (options.showPoints ? '+markers' : ''
          ),
          type: 'scatter' // scattergl
        }
        ;
      traces.push(trace);
    }

    var selection = null;
    var _this = this;
    options.layout.xaxis.tickvals = tickvals;
    options.layout.xaxis.ticktext = ticktext;
    options.layout.xaxis.tickmode = 'array';

    var config = $
    .extend(
      true,
      {},
      options.config,
      {
        modeBarButtonsToAdd: [[{
          name: 'annotate',
          title: 'Annotate Selection',
          attr: 'dragmode',
          val: 'annotate',
          icon: {
            'width': 1792,
            'path': 'M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z',
            'ascent': 1792,
            'descent': 0
          },
          click: function () {
            if (!selection) {
              morpheus.FormBuilder
              .showInModal({
                title: 'Annotate Selection',
                html: 'Please select points in the chart',
                close: 'Close'
              });
            } else {
              _this.annotate({
                eventData: selection,
                dataset: dataset
              });
            }
          }
        }]]
      });
    var $parent = $(myPlot).parent();
    options.layout.width = $parent.width();
    options.layout.height = this.$dialog.height() - 30;
    morpheus.ChartTool.newPlot(myPlot, traces, options.layout, config);
    myPlot.on('plotly_selected', function (eventData) {
      selection = eventData;
    });

    function resize() {
      var width = $parent.width();
      var height = _this.$dialog.height() - 30;
      Plotly.relayout(myPlot, {
        width: width,
        height: height
      });
    }

    this.$dialog.on('dialogresize', resize);
    $(myPlot).on('remove', function () {
      _this.$dialog.off('dialogresize');
    });

  },

  _createHistogram: function (options) {
    var array = options.array; // array of items
    var myPlot = options.myPlot;
    var dataset = options.dataset;
    var x = [];
    for (var k = 0, nitems = array.length; k < nitems; k++) {
      var item = array[k];
      x.push(dataset.getValue(item.row, item.column));
    }
    var trace = {
      name: '',
      type: 'histogram'
    };
    var traces = [trace];
    if (options.horizontal) {
      trace.x = x;
    } else {
      trace.y = x;
    }

    var selection = null;
    var _this = this;

    morpheus.ChartTool.newPlot(myPlot, traces, options.layout, options.config);
    // myPlot.on('plotly_selected', function (eventData) {
    // 	selection = eventData;
    // });
  },
  _createEcdf: function (options) {
    var array = options.array; // array of items
    var myPlot = options.myPlot;
    var dataset = options.dataset;
    var colorByVector = options.colorByVector;
    var colorByGetter = options.colorByGetter;
    var colorModel = options.colorModel;
    var traces = [];
    // split by color by value

    var colorByValueToArray = new morpheus.Map();
    for (var k = 0, nitems = array.length; k < nitems; k++) {
      var item = array[k];
      var val = dataset.getValue(item.row, item.column);
      if (!isNaN(val)) {
        var colorByValue = colorByVector !== null ? colorByGetter(item) : '';
        var traceArray = colorByValueToArray.get(colorByValue);
        if (traceArray === undefined) {
          traceArray = [];
          colorByValueToArray.set(colorByValue, traceArray);
        }
        traceArray.push(val);
      }
    }
    var traces = [];
    colorByValueToArray.forEach(function (traceArray, colorByValue) {
      var y = [];
      var x = [];
      // FIXME
      traces.push({
        name: colorByValue,
        x: x,
        y: y,
        type: 'line'
      });
    });
    var selection = null;
    var _this = this;

    morpheus.ChartTool.newPlot(myPlot, traces, options.layout, options.config);
    // myPlot.on('plotly_selected', function (eventData) {
    // 	selection = eventData;
    // });
  },
  _createBoxPlot: function (options) {
    var array = options.array; // array of items
    var points = options.points;
    var isHorizontal = options.horizontal;
    var colorByVector = options.colorByVector;
    var colorByGetter = options.colorByGetter;
    var colorModel = options.colorModel;
    var myPlot = options.myPlot;
    var dataset = options.dataset;
    var y = [];
    var color = points && colorByVector ? [] : '#1f78b4';
    var text = [];
    var x = [];
    var heatmap = this.heatmap;
    var sizeFunction = options.sizeFunction;
    var sizeByGetter = options.sizeByGetter;
    var size = sizeFunction ? [] : 6;
    var scale = d3.scale.linear().domain([0, 1]).range([-0.3, -1]);
    for (var k = 0, nitems = array.length; k < nitems; k++) {
      var item = array[k];
      var value = dataset.getValue(item.row, item.column);
      y.push(value);
      if (points) {
        x.push(scale(Math.random()));
        if (colorByVector) {
          var colorByValue = colorByGetter(item);
          color.push(colorModel.getMappedValue(colorByVector,
            colorByValue));
        }
        if (sizeFunction) {
          var sizeByValue = sizeByGetter(item);
          size.push(sizeFunction(sizeByValue));
        }
        var obj = {
          i: item.row,
          j: item.column
        };
        obj.toString = function () {
          var s = [];
          for (var tipIndex = 0; tipIndex < _this.tooltip.length; tipIndex++) {
            var tip = _this.tooltip[tipIndex];
            if (tip.isColumns) {
              morpheus.HeatMapTooltipProvider.vectorToString(dataset.getColumnMetadata().getByName(tip.field),
                this.j, s, '<br>');
            } else {
              morpheus.HeatMapTooltipProvider.vectorToString(dataset.getRowMetadata().getByName(tip.field),
                this.i, s, '<br>');
            }
          }

          return s.join('');

        };
        text.push(obj);
      }

    }

    var valuesField = isHorizontal ? 'x' : 'y';
    var traces = [];
    var trace = {
      name: '',
      type: 'box',
      boxpoints: false,
      hoverinfo: valuesField + '+text'
    };
    trace[valuesField] = y;
    traces.push(trace);
    if (points) {
      trace = {
        name: '',
        hoverinfo: valuesField + '+text',
        mode: 'markers',
        type: 'scatter',
        text: text,
        marker: {
          symbol: 'circle-open',
          size: size,
          color: color
        }
      };
      var xField = isHorizontal ? 'y' : 'x';
      trace[xField] = x;
      trace[valuesField] = y;
      traces.push(trace);
    }
    var selection = null;
    var _this = this;
    var config = $
    .extend(
      true,
      {},
      options.config,
      {
        modeBarButtonsToAdd: [[{
          name: 'annotate',
          title: 'Annotate Selection',
          attr: 'dragmode',
          val: 'annotate',
          icon: {
            'width': 1792,
            'path': 'M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z',
            'ascent': 1792,
            'descent': 0
          },
          click: function () {
            if (!selection) {
              morpheus.FormBuilder
              .showInModal({
                title: 'Annotate Selection',
                html: 'Please select points in the chart',
                close: 'Close'
              });
            } else {
              _this.annotate({
                array: array,
                eventData: selection,
                dataset: dataset
              });
            }
          }
        }]]
      });

    morpheus.ChartTool.newPlot(myPlot, traces, options.layout, config);
    var $span = $('<div' +
      ' style="display:none;position:absolute;font-size:10px;left:2px;top:4px;">#' +
      ' points:' + morpheus.Util.intFormat(array.length) + '</div>');

    $span.appendTo($(myPlot));
    myPlot.on('plotly_selected', function (eventData) {
      selection = eventData;
    });
    myPlot.on('plotly_hover', function (eventData) {
      if (eventData.points && eventData.points.length > 0 && eventData.points[0].curveNumber === 0) {
        $span.show();
      } else {
        $span.hide();
      }
    });
    myPlot.on('plotly_unhover', function (eventData) {
      $span.hide();
    });

  },
  draw: function () {
    var _this = this;
    this.$chart.empty();
    var plotlyDefaults = morpheus.ChartTool.getPlotlyDefaults();
    var layout = plotlyDefaults.layout;
    var config = plotlyDefaults.config;
    // 140 to 800
    var gridWidth = parseInt(this.formBuilder.getValue('chart_width'));
    var gridHeight = parseInt(this.formBuilder.getValue('chart_height'));
    var showPoints = this.formBuilder.getValue('show_points');

    var groupColumnsBy = this.formBuilder.getValue('group_columns_by');
    var axisLabel = this.formBuilder.getValue('axis_label');
    var colorBy = this.formBuilder.getValue('color');
    var sizeBy = this.formBuilder.getValue('size');
    var groupRowsBy = this.formBuilder.getValue('group_rows_by');
    var chartType = this.formBuilder.getValue('chart_type');

    var seriesName = this.formBuilder.getValue('series');
    var v1Op = this.formBuilder.getValue('lower_selector');
    var v1 = parseFloat(this.formBuilder.getValue('lower'));
    var v2Op = this.formBuilder.getValue('upper_selector');
    var v2 = parseFloat(this.formBuilder.getValue('upper'));
    var gtf = function () {
      return true;
    };
    var ltf = function () {
      return true;
    };
    if (!isNaN(v1)) {
      gtf = v1Op === 'gt' ? function (val) {
          return val > v1;
        } : function (val) {
          return val >= v1;
        };
    }

    if (!isNaN(v2)) {
      ltf = v2Op === 'lt' ? function (val) {
          return val < v2;
        } : function (val) {
          return val <= v2;
        };
    }
    var dataset = this.project.getSelectedDataset({
      emptyToAll: false
    });

    var seriesIndex = morpheus.DatasetUtil.getSeriesIndex(dataset, seriesName);
    var datasetFilter = seriesIndex === -1 ? function () {
        return true;
      } : function (ds, item) {
        var val = ds.getValue(item.row, item.column, seriesIndex);
        return gtf(val) && ltf(val);
      };

    this.dataset = dataset;
    if (dataset.getRowCount() === 0 && dataset.getColumnCount() === 0) {
      $('<h4>Please select rows and columns in the heat map.</h4>')
      .appendTo(this.$chart);
      return;
    } else if (dataset.getRowCount() === 0) {
      $('<h4>Please select rows in the heat map.</h4>')
      .appendTo(this.$chart);
      return;
    }
    if (dataset.getColumnCount() === 0) {
      $('<h4>Please select columns in the heat map.</h4>')
      .appendTo(this.$chart);
      return;
    }

    var grid = [];

    var items = [];
    var heatmap = this.heatmap;
    var colorByInfo = morpheus.ChartTool.getVectorInfo(colorBy);
    var sizeByInfo = morpheus.ChartTool.getVectorInfo(sizeBy);
    var colorModel = !colorByInfo.isColumns ? this.project.getRowColorModel()
      : this.project.getColumnColorModel();
    var axisLabelInfo = morpheus.ChartTool.getVectorInfo(axisLabel);
    var axisLabelVector = axisLabelInfo.isColumns ? dataset.getColumnMetadata().getByName(axisLabelInfo.field) : dataset.getRowMetadata().getByName(
        axisLabelInfo.field);
    var sizeByVector = sizeByInfo.isColumns ? dataset.getColumnMetadata().getByName(sizeByInfo.field) : dataset.getRowMetadata().getByName(
        sizeByInfo.field);
    var colorByVector = colorByInfo.isColumns ? dataset.getColumnMetadata().getByName(colorByInfo.field) : dataset.getRowMetadata().getByName(
        colorByInfo.field);
    var rowIds = [undefined];
    var columnIds = [undefined];
    var sizeByScale = null;
    if (sizeByVector) {
      var minMax = morpheus.VectorUtil.getMinMax(sizeByVector);
      sizeByScale = d3.scale.linear().domain(
        [minMax.min, minMax.max]).range([3, 16])
      .clamp(true);
    }

    if (chartType === 'row profile' || chartType === 'column profile') {
      showPoints = showPoints && (dataset.getRowCount() * dataset.getColumnCount()) <= 100000;
      var $chart = $('<div></div>');
      var myPlot = $chart[0];
      $chart.appendTo(this.$chart);
      if (chartType === 'column profile') {
        dataset = new morpheus.TransposedDatasetView(dataset);
      }
      this
      ._createProfile({
        showPoints: showPoints,
        isColumnChart: chartType === 'column profile',
        axisLabelVector: axisLabelVector,
        colorByVector: colorByVector,
        colorModel: colorModel,
        sizeByVector: sizeByVector,
        sizeFunction: sizeByScale,
        myPlot: myPlot,
        dataset: dataset,
        config: config,
        layout: $
        .extend(
          true,
          {},
          layout,
          {
            showlegend: true,
            width: gridWidth,
            height: gridHeight,
            margin: {
              b: 80
            },
            yaxis: {},
            xaxis: {}
          })
      });
    } else if (chartType === 'row scatter matrix' || chartType === 'column scatter matrix') {
      var transpose = chartType === 'column scatter matrix';
      showPoints = showPoints && (dataset.getRowCount() * dataset.getColumnCount()) <= 100000;
      if (transpose) {
        dataset = new morpheus.TransposedDatasetView(dataset);
      }
      if (dataset.getRowCount() > 20) {
        $('<h4>Maximum chart size exceeded.</h4>')
        .appendTo(this.$chart);
        return;
      }

      // rowIndexOne is along rows of chart (y axis), rowIndexTwo along x
      // axis

      // draw grid
      for (var rowIndexOne = 0, nrows = dataset.getRowCount(); rowIndexOne < nrows; rowIndexOne++) {
        for (var rowIndexTwo = 0; rowIndexTwo < nrows; rowIndexTwo++) {
          if (rowIndexOne > rowIndexTwo) {
            continue;
          }
          var $chart = $('<div style="position:absolute;left:'
            + (rowIndexTwo * gridWidth) + 'px;top:'
            + (rowIndexOne * gridHeight) + 'px;"></div>');
          var myPlot = $chart[0];
          $chart.appendTo(this.$chart);

          if (rowIndexOne === rowIndexTwo) { // boxplot
            var array = [];
            for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
              array.push({
                row: rowIndexTwo,
                column: j
              });
            }

            this
            ._createBoxPlot({
              array: array,
              points: showPoints,
              colorByVector: colorByVector,
              colorModel: colorModel,
              colorByGetter: function (item) {
                return colorByVector
                .getValue(item.column);
              },
              sizeByGetter: function (item) {
                return sizeByVector
                .getValue(item.column);
              },
              sizeFunction: sizeByScale,
              myPlot: myPlot,
              dataset: dataset,
              config: config,
              transposed: isColumns,
              layout: $
              .extend(
                true,
                {},
                layout,
                {
                  width: gridWidth,
                  height: gridHeight,
                  margin: {
                    b: 80
                  },
                  xaxis: {
                    title: axisLabelVector == null ? ''
                      : axisLabelVector
                      .getValue(rowIndexTwo),
                    showticklabels: false
                  }
                })
            });

          } else {
            this
            ._createScatter({
              isColumnChart: transpose,
              rowIndexOne: rowIndexOne,
              rowIndexTwo: rowIndexTwo,
              colorByVector: colorByVector,
              colorModel: colorModel,
              colorByGetter: function (item) {
                return colorByVector
                .getValue(item.column);
              },
              sizeByVector: sizeByVector,
              sizeFunction: sizeByScale,
              myPlot: myPlot,
              dataset: dataset,
              config: config,
              layout: $
              .extend(
                true,
                {},
                layout,
                {
                  width: gridWidth,
                  height: gridHeight,
                  margin: {
                    b: 80
                  },
                  yaxis: {
                    title: axisLabelVector == null ? ''
                      : axisLabelVector
                      .getValue(rowIndexOne),
                  },
                  xaxis: {
                    title: axisLabelVector == null ? ''
                      : axisLabelVector
                      .getValue(rowIndexTwo)
                  }
                })
            });

          }
        }
      }
    } else if (chartType === 'boxplot' || chartType === 'histogram') {
      for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
        for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
          var item = {
            row: i,
            column: j
          };
          if (datasetFilter(dataset, item)) {
            items.push(item);
          }

        }
      }
      showPoints = showPoints && items.length <= 100000;
      var colorByInfo = morpheus.ChartTool.getVectorInfo(colorBy);
      var colorByVector = colorByInfo.isColumns ? dataset.getColumnMetadata()
        .getByName(colorByInfo.field) : dataset.getRowMetadata()
        .getByName(colorByInfo.field);

      var colorModel = !colorByInfo.isColumns ? this.project
        .getRowColorModel() : this.project.getColumnColorModel();
      var colorByGetter = colorByInfo.isColumns ? function (item) {
          return colorByVector.getValue(item.column);
        } : function (item) {
          return colorByVector.getValue(item.row);
        };
      var sizeByVector = sizeByInfo.isColumns ? dataset.getColumnMetadata()
        .getByName(sizeByInfo.field) : dataset.getRowMetadata()
        .getByName(sizeByInfo.field);
      var sizeByGetter = sizeByInfo.isColumns ? function (item) {
          return sizeByVector.getValue(item.column);
        } : function (item) {
          return sizeByVector.getValue(item.row);
        };
      var sizeByScale = null;
      if (sizeByVector) {
        var minMax = morpheus.VectorUtil.getMinMax(sizeByVector);
        sizeByScale = d3.scale.linear().domain([minMax.min, minMax.max])
        .range([3, 16]).clamp(true);
      }
      if (groupColumnsBy || groupRowsBy) {
        var rowIdToArray = new morpheus.Map();
        if (groupRowsBy) {
          var groupRowsByInfo = morpheus.ChartTool
          .getVectorInfo(groupRowsBy);
          var vector = groupRowsByInfo.isColumns ? dataset
            .getColumnMetadata().getByName(groupRowsByInfo.field)
            : dataset.getRowMetadata().getByName(
              groupRowsByInfo.field);

          var getter = groupRowsByInfo.isColumns ? function (item) {
              return vector.getValue(item.column);
            } : function (item) {
              return vector.getValue(item.row);
            };

          var isArray = morpheus.VectorUtil.getDataType(vector)[0] === '[';
          for (var i = 0, nitems = items.length; i < nitems; i++) {
            var item = items[i];
            var value = getter(item);
            if (isArray && value != null) {
              value.forEach(function (val) {
                var array = rowIdToArray.get(val);
                if (array == undefined) {
                  array = [];
                  rowIdToArray.set(val, array);
                }
                array.push(item);
              });
            } else {
              var array = rowIdToArray.get(value);
              if (array == undefined) {
                array = [];
                rowIdToArray.set(value, array);
              }
              array.push(item);
            }
          }
        } else {
          rowIdToArray.set(undefined, items);
        }

        if (groupColumnsBy) {
          var name = groupColumnsBy.substring(0,
            groupColumnsBy.length - 2);
          var isColumns = groupColumnsBy
            .substring(groupColumnsBy.length - 2) === '_c';
          var vector = isColumns ? dataset.getColumnMetadata().getByName(
              name) : dataset.getRowMetadata().getByName(name);
          var getter = isColumns ? function (item) {
              return vector.getValue(item.column);
            } : function (item) {
              return vector.getValue(item.row);
            };
          var isArray = morpheus.VectorUtil.getDataType(vector)[0] === '[';
          var columnIdToIndex = new morpheus.Map();
          var rowIndex = 0;
          rowIdToArray.forEach(function (array, id) {
            grid[rowIndex] = [];
            for (var i = 0, nitems = array.length; i < nitems; i++) {
              var item = array[i];
              var value = getter(item);
              if (isArray && value != null) {

                value.forEach(function (val) {
                  var columnIndex = columnIdToIndex.get(val);
                  if (columnIndex === undefined) {
                    columnIndex = columnIdToIndex.size();
                    columnIdToIndex.set(val, columnIndex);
                  }
                  if (grid[rowIndex][columnIndex] === undefined) {
                    grid[rowIndex][columnIndex] = [];
                  }

                  grid[rowIndex][columnIndex].push(item);
                });

              } else {
                var columnIndex = columnIdToIndex.get(value);
                if (columnIndex === undefined) {
                  columnIndex = columnIdToIndex.size();
                  columnIdToIndex.set(value, columnIndex);
                }
                if (grid[rowIndex][columnIndex] === undefined) {
                  grid[rowIndex][columnIndex] = [];
                }
                grid[rowIndex][columnIndex].push(item);
              }
            }
            rowIds[rowIndex] = id;
            rowIndex++;
          });
          columnIdToIndex.forEach(function (index, id) {
            columnIds[index] = id;
          });
        } else {
          var rowIndex = 0;
          rowIdToArray.forEach(function (array, id) {
            grid[rowIndex] = [array];
            rowIds[rowIndex] = id;
            rowIndex++;
          });
        }

      } else {
        grid = [[items]];
      }
      var gridRowCount = rowIds.length;
      var gridColumnCount = columnIds.length;
      // sort rows and columns by median
      if (gridRowCount > 1) {
        var summary = [];
        for (var i = 0; i < gridRowCount; i++) {
          summary[i] = [];
          var gridRow = grid[i];
          for (var j = 0; j < gridColumnCount; j++) {
            var array = gridRow[j];
            var values = [];
            if (array) {
              for (var k = 0, nitems = array.length; k < nitems; k++) {
                var item = array[k];
                var value = dataset.getValue(item.row, item.column);
                if (!isNaN(value)) {
                  values.push(value);
                }

              }
            }
            summary[i][j] = morpheus.Median(morpheus.VectorUtil.arrayAsVector(values));
          }
        }
        // sort rows
        var rowMedians = [];
        for (var i = 0; i < gridRowCount; i++) {
          var values = [];
          for (var j = 0; j < gridColumnCount; j++) {
            values.push(summary[i][j]);
          }
          rowMedians.push(morpheus.Median(morpheus.VectorUtil.arrayAsVector(values)));
        }

        var newRowOrder = morpheus.Util.indexSort(rowMedians, false);
        var newRowIds = [];
        var newGrid = [];
        for (var i = 0; i < gridRowCount; i++) {
          newGrid.push(grid[newRowOrder[i]]);
          newRowIds.push(rowIds[newRowOrder[i]]);
        }
        grid = newGrid;
        rowIds = newRowIds;
      }

      if (grid.length === 0) {
        return;
      }
      // compute max text width
      var container = d3.select('body').append('svg');

      var t = container.append('text');
      t.attr({
        x: -1000,
        y: -1000
      }).style('font-family', '"Open Sans", verdana, arial, sans-serif').style('font-size', '9px');
      var node = container.node();
      var maxYAxisWidth = 0;
      for (var i = 0; i < gridRowCount; i++) {
        var rowId = rowIds[i];
        if (rowId != null) {
          t.text(rowId);
          var bbox = node.getBBox();
          maxYAxisWidth = Math.max(maxYAxisWidth, bbox.width + 2);
        }
      }
      maxYAxisWidth = Math.min(maxYAxisWidth, 200);
      container.remove();
      var horizontal = gridColumnCount === 1;
      var dataRanges = []; //
      var _gridWidth = gridWidth;
      var _gridHeight = gridHeight;
      if (horizontal) { // each xaxis in a column has the same scale
        for (var j = 0; j < gridColumnCount; j++) {
          var yrange = [Number.MAX_VALUE, -Number.MAX_VALUE];
          for (var i = 0; i < gridRowCount; i++) {
            var array = grid[i][j];
            if (array) {
              for (var k = 0, nitems = array.length; k < nitems; k++) {
                var item = array[k];
                var value = dataset.getValue(item.row, item.column);
                if (!isNaN(value)) {
                  yrange[0] = Math.min(yrange[0], value);
                  yrange[1] = Math.max(yrange[1], value);
                }

              }
            }
          }
          // increase range by 1%
          var span = yrange[1] - yrange[0];
          var delta = (span * 0.01);
          yrange[1] += delta;
          yrange[0] -= delta;
          dataRanges.push(yrange);
        }

      } else { // each yaxis in a row has the same scale
        for (var i = 0; i < gridRowCount; i++) {
          var yrange = [Number.MAX_VALUE, -Number.MAX_VALUE];

          for (var j = 0; j < gridColumnCount; j++) {
            var array = grid[i][j];
            if (array) {
              for (var k = 0, nitems = array.length; k < nitems; k++) {
                var item = array[k];

                var value = dataset.getValue(item.row, item.column);
                if (!isNaN(value)) {
                  yrange[0] = Math.min(yrange[0], value);
                  yrange[1] = Math.max(yrange[1], value);
                }

              }
            }
          }
          // increase range by 1%
          var span = yrange[1] - yrange[0];
          var delta = (span * 0.01);
          yrange[1] += delta;
          yrange[0] -= delta;
          dataRanges.push(yrange);
        }
      }
      var toppx = 0;
      for (var i = 0; i < gridRowCount; i++) {
        var rowId = rowIds[i];
        var leftpx = 0;
        var maxChartHeight = 0;
        for (var j = 0; j < gridColumnCount; j++) {
          var array = grid[i][j];
          var columnId = columnIds[j];
          if (array) {
            var xaxis = {};
            var marginLeft;
            var marginBottom;

            if (i === gridRowCount - 1) {
              xaxis.title = columnId;
              marginBottom = 30;

            } else {
              xaxis.ticks = '';
              xaxis.showticklabels = false;
              marginBottom = 0;
            }
            // only show xaxis if on bottom of grid

            var yaxis = {};
            var annotations = undefined;
            if (j === 0 && rowId != null) {
              annotations = [{
                xref: 'paper',
                yref: 'paper',
                x: 0,
                xanchor: 'right',
                y: 0.5,
                yanchor: 'middle',
                text: rowId,
                showarrow: false,
                font: {
                  size: 9
                }
              }]; // rotate axis label
              //yaxis.title = ;
              marginLeft = maxYAxisWidth;
            } else {
              yaxis.ticks = '';
              yaxis.showticklabels = false;
              marginLeft = 6;
            }

            var $chart = $('<div style="position:absolute;left:' + leftpx
              + 'px;top:' + toppx + 'px;"></div>');
            $chart.appendTo(this.$chart);
            var myPlot = $chart[0];
            yaxis.showgrid = (gridHeight - marginBottom) > 150;
            xaxis.showgrid = (gridWidth - marginLeft) > 150;
            if (chartType === 'boxplot') {
              if (horizontal) {
                yaxis.showticklabels = false;
                yaxis.ticks = '';
                xaxis.range = dataRanges[j];
              } else {
                xaxis.ticks = '';
                xaxis.showticklabels = false;
                yaxis.range = dataRanges[i];
              }
              var margin = {
                b: marginBottom,
                l: marginLeft,
                autoexpand: false
              };
              leftpx += gridWidth + margin.l;
              maxChartHeight = Math.max(maxChartHeight, gridHeight + margin.b);
              this._createBoxPlot({
                layout: $.extend(true, {}, layout, {
                  width: gridWidth + margin.l,
                  autosize: false,
                  height: gridHeight + margin.b,
                  margin: margin,
                  xaxis: xaxis,
                  yaxis: yaxis,
                  annotations: annotations
                }),
                horizontal: horizontal,
                array: array,
                points: showPoints,
                sizeByGetter: sizeByGetter,
                sizeFunction: sizeByScale,
                colorModel: colorModel,
                colorByVector: colorByVector,
                colorByGetter: colorByGetter,
                myPlot: myPlot,
                dataset: dataset,
                config: config
              });
            } else if (chartType == 'histogram') {
              this._createHistogram({
                layout: $.extend(true, {}, layout, {
                  width: gridWidth,
                  height: gridHeight,
                  horizontal: horizontal,
                  xaxis: xaxis,
                  yaxis: yaxis,
                  margin: {
                    b: 80,
                    l: 80
                  }
                }),

                array: array,
                myPlot: myPlot,
                dataset: dataset,
                config: config
              });
            }

          }
        }
        toppx += maxChartHeight;

      }
    }

  }
};

morpheus.ChartTool.newPlot = function (myPlot, traces, layout, config) {
  Plotly.newPlot(myPlot, traces, layout, config);
  var $a = $('<a data-toggle="tooltip" title="Toggle mode bar" href="#" style="fill: rgb(68,' +
    ' 122,' +
    ' 219);position:' +
    ' absolute;top:' +
    ' -2px;right:-6px;z-index:' +
    ' 1002;"><svg height="1em" width="1em" viewBox="0 0 1542 1000"><path d="m0-10h182v-140h-182v140z m228 146h183v-286h-183v286z m225 714h182v-1000h-182v1000z m225-285h182v-715h-182v715z m225 142h183v-857h-183v857z m231-428h182v-429h-182v429z m225-291h183v-138h-183v138z" transform="matrix(1 0 0 -1 0 850)"></path></svg></a>');
  var $myPlot = $(myPlot);
  $a.appendTo($myPlot);
  var $modeBar = $(myPlot).find('.modebar');
  $modeBar.css('display', 'none');
  $a.on('click', function (e) {
    e.preventDefault();
    $modeBar.toggle();
  });
};

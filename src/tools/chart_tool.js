/**
 * @param chartOptions.heatmap morpheus.HeatMap
 * @param chartOptions.project
 *            morpheus.Project
 */
morpheus.ChartTool = function (chartOptions) {
  var _this = this;
  this.project = chartOptions.project;
  this.heatmap = chartOptions.heatmap;
  var project = this.project;
  this.$el = $('<div class="container-fluid">'
    + '<div class="row">'
    + '<div data-name="configPane" class="col-xs-2"></div>'
    + '<div class="col-xs-10"><div style="position:relative;" data-name="chartDiv"></div></div>'
    + '</div></div>');

  var formBuilder = new morpheus.FormBuilder({
    formStyle: 'vertical'
  });
  this.formBuilder = formBuilder;
  formBuilder.append({
    name: 'chart_type',
    type: 'bootstrap-select',
    options: [
      'boxplot', 'embedding', 'row profile', 'column profile', 'row scatter matrix', 'column scatter' +
      ' matrix']
  });
  var rowOptions = [];
  var columnOptions = [];
  var numericRowOptions = [];
  var numericColumnOptions = [];
  var options = [];
  var numericOptions = [];
  var updateOptions = function () {
    var dataset = project.getFullDataset();
    rowOptions = [
      {
        name: '(None)',
        value: ''
      }];
    columnOptions = [
      {
        name: '(None)',
        value: ''
      }];
    numericRowOptions = [
      {
        name: '(None)',
        value: ''
      }];
    numericColumnOptions = [
      {
        name: '(None)',
        value: ''
      }];
    options = [
      {
        name: '(None)',
        value: ''
      }];
    numericOptions = [
      {
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
    name: 'group_by',
    type: 'bootstrap-select',
    options: options,
    multiple: true,
    search: true
  });

  formBuilder.append({
    name: 'axis_label',
    type: 'bootstrap-select',
    options: rowOptions
  });
  formBuilder.append({
    name: 'show_outliers',
    type: 'checkbox',
    value: true
  });

  formBuilder.append({
    name: 'color',
    type: 'bootstrap-select',
    options: options,
    search: true
  });

  // formBuilder.append({
  //   name: 'size',
  //   type: 'bootstrap-select',
  //   options: numericOptions
  // });
  formBuilder.append({
    name: 'tooltip',
    type: 'bootstrap-select',
    multiple: true,
    search: true,
    options: options.slice(1)
  });

  formBuilder.append({
    name: 'x_axis',
    type: 'bootstrap-select',
    multiple: false,
    search: true,
    options: numericColumnOptions
  });
  formBuilder.append({
    name: 'y_axis',
    type: 'bootstrap-select',
    multiple: false,
    search: true,
    options: numericColumnOptions
  });


  formBuilder.append({
    name: 'transform_values',
    type: 'bootstrap-select',
    multiple: true,
    options: ['log2', 'log2(1+x)', 'z-score', 'robust z-score']
  });

  formBuilder.append({
    name: 'symbol_size',
    type: 'text',
    value: '2',
    style: 'width:50px;'
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

  var chartTypeToParameter = {
    'row profile': {
      axis_label: 'columns',
      tooltip: 'columns',
      color: 'rows',
    },
    'embedding': {
      tooltip: 'columns',
      color: ['Selected Rows', 'columns'],
      x_axis: 'columns',
      y_axis: 'columns',
      symbol_size: true,
      transform_values: true
    },
    'column profile': {
      axis_label: 'rows',
      tooltip: 'rows',
      color: 'columns'
    },
    'row scatter matrix': {
      axis_label: 'rows',
      color: 'columns',
      tooltip: 'columns'
    },
    'column scatter matrix': {
      axis_label: 'columns',
      color: 'rows',
      tooltip: 'rows'
    },
    boxplot: {
      group_by: true,
      show_outliers: true,
      tooltip: 'both'
    }
  };

  function setVisibility() {
    var chartType = formBuilder.getValue('chart_type');
    var chartOptions = chartTypeToParameter[chartType];
    if (chartOptions.axis_label != null) {
      formBuilder.setOptions('axis_label',
        chartOptions.axis_label === 'rows' ? rowOptions : columnOptions,
        true);

    }
    formBuilder.setVisible('transform_values', chartOptions.transform_values && formBuilder.getValue('color') === 'Selected Rows');
    formBuilder.setVisible('symbol_size', chartOptions.symbol_size);
    formBuilder.setVisible('x_axis', chartOptions.x_axis != null);
    formBuilder.setVisible('y_axis', chartOptions.y_axis != null);
    formBuilder.setVisible('color', chartOptions.color != null);
    formBuilder.setVisible('axis_label', chartOptions.axis_label != null);
    formBuilder.setVisible('group_by', chartOptions.group_by);
    formBuilder.setVisible('show_outliers', chartOptions.show_outliers);
    formBuilder.setOptions('tooltip', chartOptions.tooltip === 'rows' ? rowOptions.slice(1) : (chartOptions.tooltip === 'columns' ? columnOptions.slice(1) : options));
    formBuilder.setOptions('x_axis', numericColumnOptions);
    formBuilder.setOptions('y_axis', numericColumnOptions);
    if (chartOptions.color != null) {
      if (chartOptions.color === 'rows') {
        formBuilder.setOptions('color', rowOptions);
      } else if (chartOptions.color === 'columns') {
        formBuilder.setOptions('color', columnOptions);
      } else if (_.isArray(chartOptions.color)) {
        formBuilder.setOptions('color', columnOptions.concat([chartOptions.color[0]])); // TODO hack
      }
    }
  }

  this.tooltip = [];
  var draw = function () {
    _.debounce(_this.draw(), 100);
  };
  formBuilder.$form.on('change', 'select,input[type=range]', function (e) {
    if ($(this).attr('name') === 'tooltip') {
      var tooltipVal = _this.formBuilder.getValue('tooltip');
      _this.tooltip.length = 0; // clear array
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
    formBuilder.setOptions('group_by', options, true);
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

morpheus.ChartTool.getVectorInfo = function (value) {
  var field = value.substring(0, value.length - 2);
  var isColumns = value.substring(value.length - 2) === '_c';
  return {
    field: field,
    isColumns: isColumns
  };
};
morpheus.ChartTool.prototype = {
  /**
   *
   * @param options.dataset
   * @param options.colorByVector
   * @param options.colorModel
   * @param options.transpose
   * @param options.chartWidth
   * @param options.chartHeight
   * @param options.axisLabelVector
   * @private
   */
  _createScatter: function (options) {
    var _this = this;
    var dataset = options.dataset;
    var colorByVector = options.colorByVector;
    var colorModel = options.colorModel;
    var heatmap = this.heatmap;
    var chartWidth = options.chartWidth;
    var chartHeight = options.chartHeight;
    var axisLabelVector = options.axisLabelVector; // for row scatter, row vector
    var transpose = options.transpose;
    var chart = {
      animation: false,
      toolbox: {
        feature: {
          brush: {
            title: {
              rect: 'Rectangle selection',
              polygon: 'Polygon selection',
              clear: 'Clear Selection',
              keep: 'Keep previous selection'
            }
          }
        }
      },
      brush: {
        brushLink: 'all',
        xAxisIndex: [],
        yAxisIndex: [],
        inBrush: {
          opacity: 1
        }
      },
      tooltip: {
        trigger: 'item'
      },
      grid: [],
      xAxis: [],
      yAxis: [],
      series: []
    };
    var index = 0;
    var GAP = 20;
    var BASE_LEFT = 40;
    var BASE_TOP = 40;
    // rowIndexOne on x, rowIndexTwo on y
    for (var rowIndexOne = 1, nrows = dataset.getRowCount(); rowIndexOne < nrows; rowIndexOne++) {
      for (var rowIndexTwo = 0; rowIndexTwo < rowIndexOne; rowIndexTwo++) {
        (function () {
          var data = [];
          var color = [];
          for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
            data.push([dataset.getValue(rowIndexOne, j), dataset.getValue(rowIndexTwo, j), j]);
          }

          if (colorByVector) {
            for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
              var colorByValue = colorByVector.getValue(j);
              color.push(colorModel.getMappedValue(colorByVector,
                colorByValue));
            }
          }
          chart.grid.push({
            left: GAP + (rowIndexOne - 1) * (chartWidth + GAP),
            top: BASE_TOP + rowIndexTwo * (chartHeight + GAP),
            width: chartWidth,
            height: chartHeight
          });

          chart.brush.xAxisIndex && chart.brush.xAxisIndex.push(index);
          chart.brush.yAxisIndex && chart.brush.yAxisIndex.push(index);
          chart.xAxis.push({
            splitNumber: 3,
            position: 'top',
            name: axisLabelVector != null && rowIndexTwo === 0 ? axisLabelVector.getValue(rowIndexOne) : '',
            nameGap: 25,
            nameLocation: 'middle',
            axisLine: {
              show: false,
              onZero: false
            },
            axisTick: {
              show: rowIndexTwo === 0,
              inside: true
            },
            axisLabel: {
              show: rowIndexTwo === 0
            },
            type: 'value',
            gridIndex: index,
            scale: true
          });

          chart.yAxis.push({
            splitNumber: 3,
            nameGap: 50,
            name: axisLabelVector != null && rowIndexOne === nrows - 1 ? axisLabelVector.getValue(rowIndexTwo) : '',
            nameLocation: 'middle',
            position: 'right',
            axisLine: {
              show: false,
              onZero: false
            },
            axisTick: {
              show: rowIndexOne === nrows - 1,
              inside: true
            },
            axisLabel: {
              show: rowIndexOne === nrows - 1
            },
            type: 'value',
            gridIndex: index,
            scale: true
          });

          chart.series.push({
            symbolSize: 4,
            tooltip: {
              formatter: function (obj) {
                var value = obj.value;
                var s = [];
                s.push('x: ' + _this.heatmap.getHeatMapElementComponent().getDrawValuesFormat()(value[0]));
                s.push('<br>');
                s.push('y ' + _this.heatmap.getHeatMapElementComponent().getDrawValuesFormat()(value[1]));
                if (transpose) {
                  morpheus.ChartTool.getTooltip({
                    text: s,
                    tooltip: _this.tooltip,
                    dataset: new morpheus.TransposedDatasetView(dataset),
                    rowIndex: value[2],
                    columnIndex: -1
                  });
                } else {
                  morpheus.ChartTool.getTooltip({
                    text: s,
                    tooltip: _this.tooltip,
                    dataset: dataset,
                    rowIndex: -1,
                    columnIndex: value[2]
                  });
                }
                return s.join('');
              }
            },
            itemStyle: {
              normal: {
                color: function (param) {
                  return color.length === 0 ? '#1f78b4' : color[param.dataIndex];
                }
              }
            },
            type: 'scatter',
            xAxisIndex: index,
            yAxisIndex: index,
            data: data
          });
          index++;
        })();

      }
    }
    var myChart = echarts.init(options.el);
    myChart.setOption(chart);

  },
  /**
   *
   * @param options.dataset
   * @param options.colorByVector
   * @param options.colorModel
   * @param options.transpose
   * @param options.chartWidth
   * @param options.chartHeight
   * @param options.axisLabelVector
   * @private
   */
  _createProfile: function (options) {
    var _this = this;
    var dataset = options.dataset;
    var colorByVector = options.colorByVector;
    var colorModel = options.colorModel;
    var heatmap = this.heatmap;
    var chartWidth = options.chartWidth;
    var chartHeight = options.chartHeight;
    var axisLabelVector = options.axisLabelVector; // for row scatter, row vector
    var transpose = options.transpose;
    var axisLabel = [];
    for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
      axisLabel.push(axisLabelVector != null ? axisLabelVector.getValue(j) : '' + j);
    }
    var series = [];
    var colorMap = morpheus.VectorColorModel.getColorMapForNumber(dataset.getRowCount());
    for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
      // each row is a new trace
      var colorByValue = colorByVector != null ? colorByVector.getValue(i) : '' + i;
      var color = colorByVector != null ? colorModel.getMappedValue(colorByVector, colorByValue) : colorMap[i % colorMap.length];
      var data = [];
      for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
        data.push([j, dataset.getValue(i, j), i]);
      }
      series.push({
        name: colorByValue,
        type: 'line',
        data: data,
        tooltip: {
          formatter: function (obj) {
            var value = obj.value;
            var s = [];
            s.push(_this.heatmap.getHeatMapElementComponent().getDrawValuesFormat()(value[1]));
            morpheus.ChartTool.getTooltip({
              text: s,
              tooltip: _this.tooltip,
              dataset: dataset,
              rowIndex: value[2],
              columnIndex: value[0]
            });
            return s.join('');
          }
        }
      });
    }

    var chart = {
      legend: {
        orient: 'vertical',
        left: 'right',
        top: 2,
        itemWidth: 14,
        height: dataset.getRowCount() * 20,
        data: series.map(function (s) {
          return s.name;
        })
      },
      animation: false,
      tooltip: {
        trigger: 'item'
      },
      xAxis: {
        type: 'category',
        data: axisLabel
      },
      yAxis: {
        axisLine: {
          show: true,
          onZero: false
        },
        type: 'value',
        name: ''
      },
      grid: {right: 120},
      series: series
    };

    var myChart = echarts.init(options.el);
    myChart.setOption(chart);
  },

  /**
   *
   * @param options.dataset
   * @param options.colorByVector
   * @param options.colorModel
   * @param options.transpose
   * @param options.chartWidth
   * @param options.chartHeight
   * @param options.xVector
   * @param options.yVector
   * @private
   */

  _createEmbedding: function (options) {
    var _this = this;
    var fullDataset = options.fullDataset;
    var selectedDataset = options.dataset;
    var transpose = options.transpose;
    var xVector = options.xVector;
    var yVector = options.yVector;
    var symbolSize = options.symbolSize;
    var dataTransformations = options.dataTransformations;
    if (xVector == null || yVector == null) {
      return;
    }
    var colorByVector = options.colorByVector;
    var colorModel = options.colorModel;

    var heatmap = this.heatmap;
    var chartWidth = options.chartWidth;
    var chartHeight = options.chartHeight;
    var visualMap = undefined;
    var collapsed;
    if (selectedDataset != null) {
      collapsed = new Float32Array(selectedDataset.getColumnCount());
      var summarizeFunction = morpheus.Max;
      if (dataTransformations.length > 0) {
        selectedDataset = morpheus.DatasetUtil.copy(selectedDataset);
        dataTransformations.forEach(function (f) {
          f(selectedDataset);
        });

      }


      var view = new morpheus.DatasetColumnView(selectedDataset);
      for (var j = 0, ncols = selectedDataset.getColumnCount(); j < ncols; j++) {
        collapsed[j] = summarizeFunction(view.setIndex(j));
      }
      var v = morpheus.Vector.fromArray('', collapsed);
      var stats = morpheus.VectorUtil.getMinMax(v);

      visualMap = {
        type: 'continuous',
        min: stats.min,
        max: stats.max,
        dimension: 3,
        orient: 'horizontal',
        left: 0,
        top: 'bottom',
        text: ['', ''],
        calculable: true,
        inRange: {
          color: ['#ffeda0', '#feb24c', '#f03b20']
        },
        outOfRange: {
          color: ['#d9d9d9']
        }
      };
    }

    var data = [];
    var colors = [];
    var isContinuous = false;
    if (colorByVector != null) {
      isContinuous = !colorByVector.getProperties().get(morpheus.VectorKeys.DISCRETE);
    }
    for (var j = 0, size = xVector.size(); j < size; j++) {
      if (selectedDataset != null) {
        data.push([xVector.getValue(j), yVector.getValue(j), j, collapsed[j]]);
      } else if (colorByVector != null) {
        if (isContinuous) {
          colors.push(colorModel.getContinuousMappedValue(colorByVector, colorByVector.getValue(j)));
        } else {
          colors.push(colorModel.getMappedValue(colorByVector, colorByVector.getValue(j)));
        }
        data.push([xVector.getValue(j), yVector.getValue(j), j]);
      } else {
        data.push([xVector.getValue(j), yVector.getValue(j), j]);
      }
    }


    var chart = {
      animation: false,
      tooltip: {
        trigger: 'item'
      },
      xAxis: [{
        axisTick: {show: false},
        axisLabel: {show: false},
        axisLine: {
          show: true,
          onZero: false
        },
        splitLine: {
          show: false
        },
        boundaryGap: false,
        type: 'value',
        name: ''
      }],
      visualMap: visualMap,
      yAxis: [{
        axisTick: {show: false},
        axisLabel: {show: false},
        axisLine: {
          show: true,
          onZero: false
        }, splitLine: {
          show: false
        },
        boundaryGap: false,
        type: 'value',
        name: ''
      }],
      series: [{
        type: 'scatter',
        data: data,
        large: false,
        symbolSize: symbolSize,
        tooltip: {
          formatter: function (obj) {
            var value = obj.value;
            var s = [];
            if (transpose) {
              morpheus.ChartTool.getTooltip({
                text: s,
                tooltip: _this.tooltip,
                dataset: new morpheus.TransposedDatasetView(fullDataset),
                rowIndex: value[2],
                columnIndex: -1
              });
            } else {
              morpheus.ChartTool.getTooltip({
                text: s,
                tooltip: _this.tooltip,
                dataset: fullDataset,
                rowIndex: -1,
                columnIndex: value[2]
              });
            }
            return s.join('');
          }
        },
        itemStyle: {
          color: function (param) {
            return colors.length === 0 ? '#1f78b4' : colors[param.dataIndex];
          }
        }
      }]
    };

    var myChart = echarts.init(options.el);
    myChart.setOption(chart);
  },
  /**
   *
   * @param options.datasets 1-d array of datasets
   * @param options.ids 1-d array of grouping values
   * @param options.showOutliers
   * @param options.el
   * @private
   */
  _createBoxPlot: function (options) {
    var _this = this;
    var datasets = options.datasets;
    var ids = options.ids;
    var heatmap = this.heatmap;
    var size = 6;
    var boxData = [];
    var outliers = [];

    for (var k = 0, ndatasets = datasets.length; k < ndatasets; k++) {
      var dataset = datasets[k];
      var id = ids[k];
      var values = new Float32Array(dataset.getRowCount() * dataset.getColumnCount());
      var counter = 0;
      for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
        for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
          var value = dataset.getValue(i, j);
          if (!isNaN(value)) {
            values[counter] = value;
            counter++;
          }
        }
      }
      if (counter !== values.length) {
        values = values.slice(0, counter);
      }
      values.sort();
      // [min,  Q1,  median,  Q3,  max]
      var item = morpheus.BoxPlotArrayItem(values);
      boxData.push([item.lowerAdjacentValue, item.q1, item.median, item.q3, item.upperAdjacentValue]);
      if (options.showOutliers) {
        var w = 1.5;
        var upperOutlier = item.q3 + w * (item.q3 - item.q1);
        var lowerOutlier = item.q1 - w * (item.q3 - item.q1);
        for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
          for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
            var value = dataset.getValue(i, j);
            if (value > upperOutlier || value < lowerOutlier) {
              outliers.push([id, value, i, j]);
            }
          }
        }
      }
    }
    var chart = {
      animation: false,
      tooltip: {
        trigger: 'item'
      },
      xAxis: {
        type: 'category',
        data: ids
      },
      yAxis: {
        axisLine: {
          show: true,
          onZero: false
        },
        type: 'value',
        name: ''
      },
      series: [
        {
          animationDuration: 0,
          hoverAnimation: false,
          name: 'boxplot',
          type: 'boxplot',
          data: boxData,
          tooltip: {
            formatter: function (param) {
              var text = [];
              if (param.name !== '') {
                text.push(param.name);
              }

              text = text.concat([
                'upper: ' + _this.heatmap.getHeatMapElementComponent().getDrawValuesFormat()(param.data[4]),
                'Q3: ' + _this.heatmap.getHeatMapElementComponent().getDrawValuesFormat()(param.data[3]),
                'median: ' + _this.heatmap.getHeatMapElementComponent().getDrawValuesFormat()(param.data[2]),
                'Q1: ' + _this.heatmap.getHeatMapElementComponent().getDrawValuesFormat()(param.data[1]),
                'lower: ' + _this.heatmap.getHeatMapElementComponent().getDrawValuesFormat()(param.data[0])
              ]);
              return text.join('<br/>');
            }
          }
        },
        {
          name: 'outlier',
          type: 'scatter',
          data: outliers,
          symbolSize: 5,
          itemStyle: {
            normal: {
              borderWidth: 1,
              borderColor: 'black',
              opacity: 0.8
            }
          },
          tooltip: {
            formatter: function (obj) {
              var value = obj.value;
              var s = [];
              if (value[0] !== '') {
                s.push(value[0]); // name
                s.push('<br>');
              }
              s.push(_this.heatmap.getHeatMapElementComponent().getDrawValuesFormat()(value[1]));
              morpheus.ChartTool.getTooltip({
                text: s,
                tooltip: _this.tooltip,
                dataset: dataset,
                rowIndex: value[2],
                columnIndex: value[3]
              });
              return s.join('');
            }
          }
        }
      ]
    };

    var myChart = echarts.init(options.el);
    myChart.setOption(chart);
  },
  draw: function () {
    var _this = this;
    this.$chart.empty();
    // 140 to 800
    var gridWidth = parseInt(this.formBuilder.getValue('chart_width'));
    var gridHeight = parseInt(this.formBuilder.getValue('chart_height'));
    var showOutliers = this.formBuilder.getValue('show_outliers');

    var groupBy = this.formBuilder.getValue('group_by');
    var axisLabel = this.formBuilder.getValue('axis_label');

    // var sizeBy = this.formBuilder.getValue('size');
    var chartType = this.formBuilder.getValue('chart_type');


    var dataset = chartType !== 'embedding' ? this.project.getSelectedDataset({
      emptyToAll: false
    }) : this.project.getFullDataset();

    this.dataset = dataset;
    if (chartType !== 'embedding') {
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
    }

    var heatmap = this.heatmap;
    // var sizeByInfo = morpheus.ChartTool.getVectorInfo(sizeBy);

    // var sizeByVector = sizeByInfo.isColumns ? dataset.getColumnMetadata().getByName(sizeByInfo.field) : dataset.getRowMetadata().getByName(
    //   sizeByInfo.field);

    var axisLabelInfo = morpheus.ChartTool.getVectorInfo(axisLabel);
    var axisLabelVector = axisLabelInfo.isColumns ? dataset.getColumnMetadata().getByName(axisLabelInfo.field) : dataset.getRowMetadata().getByName(
      axisLabelInfo.field);

    var rowIds = [undefined];
    var columnIds = [undefined];
    var colorBy = this.formBuilder.getValue('color');
    var colorByVector = null;
    var colorModel = null;
    if (colorBy != null && colorBy !== 'Selected Rows') {
      var colorByInfo = morpheus.ChartTool.getVectorInfo(colorBy);
      colorModel = !colorByInfo.isColumns ? this.project.getRowColorModel()
        : this.project.getColumnColorModel();
      colorByVector = colorByInfo.isColumns ? dataset.getColumnMetadata().getByName(colorByInfo.field) : dataset.getRowMetadata().getByName(
        colorByInfo.field);
    }

    if (chartType === 'embedding') {
      var xaxisInfo = morpheus.ChartTool.getVectorInfo(this.formBuilder.getValue('x_axis'));
      var xVector = xaxisInfo.isColumns ? dataset.getColumnMetadata().getByName(xaxisInfo.field) : dataset.getRowMetadata().getByName(
        xaxisInfo.field);
      var yaxisInfo = morpheus.ChartTool.getVectorInfo(this.formBuilder.getValue('y_axis'));
      var yVector = yaxisInfo.isColumns ? dataset.getColumnMetadata().getByName(yaxisInfo.field) : dataset.getRowMetadata().getByName(
        yaxisInfo.field);

      var transformValues = this.formBuilder.getValue('transform_values');
      if (transformValues == null) {
        transformValues = [];
      }
      var dataTransformations = [];
      //  options: ['log2', 'log2(1+x), z-score, robust z-score']
      if (transformValues.indexOf('log2') !== -1) {
        dataTransformations.push(morpheus.AdjustDataTool.log2);
      }
      if (transformValues.indexOf('log2(1+x)') !== -1) {
        dataTransformations.push(morpheus.AdjustDataTool.log2_plus);
      }
      if (transformValues.indexOf('z-score') !== -1) {
        dataTransformations.push(morpheus.AdjustDataTool.zScore);
      }
      if (transformValues.indexOf('robust z-score') !== -1) {
        dataTransformations.push(morpheus.AdjustDataTool.robustZScore);
      }


      var $chart = $('<div style="width: ' + (gridWidth) + 'px;height:' + (gridHeight + 120) + 'px;"></div>');
      $chart.appendTo(this.$chart);
      this._createEmbedding({
        xVector: xVector,
        yVector: yVector,
        width: gridWidth,
        dataTransformations: dataTransformations,
        symbolSize: parseFloat(this.formBuilder.getValue('symbol_size')),
        el: $chart[0],
        fullDataset: dataset,
        dataset: colorBy === 'Selected Rows' ? this.project.getSelectedDataset({
          emptyToAll: false,
          selectedColumns: false
        }) : null,
        chartWidth: gridWidth,
        chartHeight: gridHeight,
        transpose: false,
        colorModel: colorModel,
        colorByVector: colorByVector
      });
    }
    else if (chartType === 'row profile' || chartType === 'column profile') {
      var transpose = chartType === 'column profile';
      if (transpose) {
        dataset = new morpheus.TransposedDatasetView(dataset);
      }
      if (dataset.getRowCount() > 100) {
        $('<h4>Maximum chart size exceeded.</h4>')
          .appendTo(this.$chart);
        return;
      }
      // add horizontal space for legend
      var $chart = $('<div style="width: ' + (gridWidth + 120) + 'px;height:' + gridHeight + 'px;"></div>');
      $chart.appendTo(this.$chart);
      this._createProfile({
        width: gridWidth,
        el: $chart[0],
        dataset: dataset,
        chartWidth: gridWidth,
        chartHeight: gridHeight,
        transpose: transpose,
        colorModel: colorModel,
        colorByVector: colorByVector,
        axisLabelVector: axisLabelVector
      });
    } else if (chartType === 'row scatter matrix' || chartType === 'column scatter matrix') {
      var transpose = chartType === 'column scatter matrix';

      if (transpose) {
        dataset = new morpheus.TransposedDatasetView(dataset);
      }
      if (dataset.getRowCount() > 20) {
        $('<h4>Maximum chart size exceeded.</h4>')
          .appendTo(this.$chart);
        return;
      }
      var $chart = $('<div style="width:' + (80 + (dataset.getRowCount() - 1) * (gridWidth + 20)) + 'px;height:' + (80 + dataset.getRowCount() * (gridHeight + 20)) +
        'px;"></div>');
      $chart.appendTo(this.$chart);
      this._createScatter({
        el: $chart[0],
        dataset: dataset,
        chartWidth: gridWidth,
        chartHeight: gridHeight,
        transpose: transpose,
        colorModel: colorModel,
        colorByVector: colorByVector,
        axisLabelVector: axisLabelVector
      });
    } else if (chartType === 'boxplot') {
      var datasets = [];//1-d array of datasets
      var ids = []; // 1-d array of grouping values
      if (groupBy && groupBy.length > 0) {
        var columnVectors = [];
        var rowVectors = [];
        groupBy.forEach(function (name) {
          var groupByInfo = morpheus.ChartTool
            .getVectorInfo(name);
          if (groupByInfo.isColumns) {
            var vector = dataset
              .getColumnMetadata().getByName(groupByInfo.field);
            if (vector != null) {
              columnVectors.push(vector);
            } else {
              console.log(vector.getName() + ' not found');
            }
          } else {
            var vector = dataset
              .getRowMetadata().getByName(groupByInfo.field);
            if (vector != null) {
              rowVectors.push(vector);
            } else {
              console.log(vector.getName() + ' not found');
            }
          }
        });
        var columnValueToIndices;
        if (columnVectors.length === 0) {
          columnValueToIndices = new morpheus.Map();
          columnValueToIndices.set('', null);
        } else {
          columnValueToIndices = morpheus.VectorUtil.createValuesToIndicesMap(columnVectors);
        }
        var rowValueToIndices;
        if (rowVectors.length === 0) {
          rowValueToIndices = new morpheus.Map();
          rowValueToIndices.set('', null);
        } else {
          console.log(rowVectors);
          rowValueToIndices = morpheus.VectorUtil.createValuesToIndicesMap(rowVectors);
        }

        columnValueToIndices.forEach(function (columnIndices, columnValue) {
          rowValueToIndices.forEach(function (rowIndices, rowValue) {
            datasets.push(new morpheus.SlicedDatasetView(dataset, rowIndices, columnIndices));
            var id = columnValue;
            if (id !== '') {
              id += ' ';
            }
            id += rowValue;
            ids.push(id);
          });

        });
      } else {
        datasets.push(dataset);
        ids.push('');
      }
      // sort rows and columns by median
      // if (gridRowCount > 1) {
      //   var summary = [];
      //   for (var i = 0; i < gridRowCount; i++) {
      //     summary[i] = [];
      //     var gridRow = grid[i];
      //     for (var j = 0; j < gridColumnCount; j++) {
      //       var array = gridRow[j];
      //       var values = [];
      //       if (array) {
      //         for (var k = 0, nitems = array.length; k < nitems; k++) {
      //           var item = array[k];
      //           var value = dataset.getValue(item.row, item.column);
      //           if (!isNaN(value)) {
      //             values.push(value);
      //           }
      //
      //         }
      //       }
      //       summary[i][j] = morpheus.Median(morpheus.VectorUtil.arrayAsVector(values));
      //     }
      //   }
      //   // sort rows
      //   var rowMedians = [];
      //   for (var i = 0; i < gridRowCount; i++) {
      //     var values = [];
      //     for (var j = 0; j < gridColumnCount; j++) {
      //       values.push(summary[i][j]);
      //     }
      //     rowMedians.push(morpheus.Median(morpheus.VectorUtil.arrayAsVector(values)));
      //   }
      //
      //   var newRowOrder = morpheus.Util.indexSort(rowMedians, false);
      //   var newRowIds = [];
      //   var newGrid = [];
      //   for (var i = 0; i < gridRowCount; i++) {
      //     newGrid.push(grid[newRowOrder[i]]);
      //     newRowIds.push(rowIds[newRowOrder[i]]);
      //   }
      //   grid = newGrid;
      //   rowIds = newRowIds;
      // }

      var $chartEl = $('<div style="width: ' + gridWidth + 'px;height:' + gridHeight + 'px;"></div>');
      $chartEl.appendTo(this.$chart);
      this._createBoxPlot({
        showOutliers: showOutliers,
        el: $chartEl[0],
        datasets: datasets,
        ids: ids
      });
    }
  }
};

/**
 *
 * @param options.dataset
 * @param options.text
 * @param options.rowIndex
 * @param options.columnIndex
 */
morpheus.ChartTool.getTooltip = function (options) {
  for (var tipIndex = 0; tipIndex < options.tooltip.length; tipIndex++) {
    var tip = options.tooltip[tipIndex];
    var metadata;
    var index;
    if (tip.isColumns) {
      metadata = options.dataset.getColumnMetadata();
      index = options.columnIndex;
    } else {
      metadata = options.dataset.getRowMetadata();
      index = options.rowIndex;
    }
    if (index !== -1) {
      var v = metadata.getByName(tip.field);
      morpheus.HeatMapTooltipProvider.vectorToString(v,
        index, options.text, '<br>');
    }
  }
};


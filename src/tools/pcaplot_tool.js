morpheus.PcaPlotTool = function (chartOptions) {
  var _this = this;
  this.project = chartOptions.project;
  var project = this.project;


  this.$el = $('<div class="container-fluid">'
    + '<div class="row">'
    + '<div data-name="configPane" class="col-xs-2"></div>'
    + '<div class="col-xs-10"><div style="position:relative;" data-name="chartDiv"></div></div>'
    + '<div class=""'
    + '</div></div>');

  var formBuilder = new morpheus.FormBuilder({
    vertical: true
  });
  this.formBuilder = formBuilder;
  var rowOptions = [];
  var columnOptions = [];
  var numericRowOptions = [];
  var numericColumnOptions = [];
  var options = [];
  var numericOptions = [];
  var pcaOptions = [];
  var naOptions = [{
    name: 'mean',
    value: 'mean'
  }, {
    name: 'median',
    value: 'median'
  }];
  var updateOptions = function () {
    var dataset = project.getFullDataset();
    rowOptions = [{
      name: '(None)',
      value: ""
    }];
    columnOptions = [{
      name: '(None)',
      value: ""
    }];
    numericRowOptions = [{
      name: '(None)',
      value: ""
    }];
    numericColumnOptions = [{
      name: '(None)',
      value: ""
    }];
    options = [{
      name: '(None)',
      value: ""
    }];
    numericOptions = [{
      name: '(None)',
      value: ""
    }];
    pcaOptions = [];

    for (var i = 1; i <= _this.project.getSelectedDataset().getColumnCount(); i++) {
      pcaOptions.push({
        name: "PC" + String(i),
        value: i - 1
      });
    }


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
              value: name
            });
          }
          rowOptions.push({
            name: name + ' (row)',
            value: name
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
              value: name
            });
          }
          columnOptions.push({
            name: name + ' (column)',
            value: name
          });
        });
  };

  updateOptions();

  //console.log(options);
  formBuilder.append({
    name: 'size',
    type: 'bootstrap-select',
    options: numericColumnOptions
  });
  formBuilder.append({
    name: 'color',
    type: 'bootstrap-select',
    options: columnOptions
  });
  formBuilder.append({
    name: 'x-axis',
    type: 'bootstrap-select',
    options: pcaOptions,
    value: 0
  });
  formBuilder.append({
    name: 'y-axis',
    type: 'bootstrap-select',
    options: pcaOptions,
    value: 1
  });
  formBuilder.append({
    name: 'label',
    type: 'bootstrap-select',
    options: columnOptions
  });
  formBuilder.append({
    name: 'replace_NA_with',
    type: 'bootstrap-select',
    options: naOptions
  });
  formBuilder.append({
    name: 'draw',
    type: 'button'
  });


  function setVisibility() {
    formBuilder.setOptions('color', columnOptions, true);
    formBuilder.setOptions('size', numericColumnOptions, true);
    formBuilder.setOptions('label', columnOptions, true);
    formBuilder.setOptions('replace_NA_with', naOptions, true);
  }

  this.tooltip = [];
  formBuilder.$form.find('select').on('change', function (e) {
    setVisibility();

  });
  /*formBuilder.$form.find('input').on('click', function () {
   _this.draw();
   });*/
  setVisibility();

  /*var draw = function () {
   _.debounce(_this.draw(), 100);
   };*/
  var trackChanged = function () {
    //console.log("track changed");
    updateOptions();
    setVisibility();
    formBuilder.setOptions('x-axis', pcaOptions, true);
    formBuilder.setOptions('y-axis', pcaOptions, true);
  };

  project.getColumnSelectionModel().on('selectionChanged.chart', trackChanged);
  project.getRowSelectionModel().on('selectionChanged.chart', trackChanged);
  project.on('trackChanged.chart', trackChanged);
  this.$chart = this.$el.find('[data-name=chartDiv]');
  var $dialog = $('<div style="background:white;" title="Chart"></div>');
  var $configPane = this.$el.find('[data-name=configPane]');
  formBuilder.$form.appendTo($configPane);
  this.$el.appendTo($dialog);
  $dialog.dialog({
    close: function (event, ui) {
      project.off('trackChanged.chart', trackChanged);
      project.getRowSelectionModel().off('selectionChanged.chart', trackChanged);
      project.getColumnSelectionModel().off('selectionChanged.chart', trackChanged);
      _this.$el.empty();
    },

    resizable: true,
    height: 600,
    width: 950
  });
  this.$dialog = $dialog;

  this.draw();
};

morpheus.PcaPlotTool.getVectorInfo = function (value) {
  var field = value.substring(0, value.length - 2);
  var isColumns = value.substring(value.length - 2) === '_c';
  return {
    field: field,
    isColumns: isColumns
  };
};
morpheus.PcaPlotTool.prototype = {
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
  draw: function () {
    var _this = this;
    var plotlyDefaults = morpheus.ChartTool.getPlotlyDefaults();
    var layout = plotlyDefaults.layout;
    var config = plotlyDefaults.config;
    var chartWidth = 400;
    var chartHeight = 400;


    var project = this.project;
    this.formBuilder.$form.find('[name="draw"]').on('click', function () {
      _this.$chart.empty();

      var dataset = _this.project.getSelectedDataset({
        emptyToAll: false
      });

      console.log("PCAPlot :: dataset:", dataset, "trueIndices:", morpheus.Util.getTrueIndices(dataset));
      var selectedIndices = morpheus.Util.getTrueIndices(dataset);

      var fullDataset = _this.project.getSortedFilteredDataset();
      var fullIndices = morpheus.Util.getTrueIndices(fullDataset);

      _this.dataset = dataset;

      var colorBy = _this.formBuilder.getValue('color');
      var sizeBy = _this.formBuilder.getValue('size');
      var getTrueVector = function (vector) {
        while (vector && vector.indices.length == 0) {
          vector = vector.v;
        }
        return vector;
      };

      _this.colorByVector = getTrueVector(dataset.getColumnMetadata().getByName(colorBy));
      var colorByVector = _this.colorByVector;
      var sizeByVector = getTrueVector(dataset.getColumnMetadata().getByName(sizeBy));

      var pc1 = _this.formBuilder.getValue('x-axis');
      var pc2 = _this.formBuilder.getValue('y-axis');

      var label = _this.formBuilder.getValue('label');
      var textByVector = getTrueVector(dataset.getColumnMetadata().getByName(label));

      var na = _this.formBuilder.getValue('replace_NA_with');
      var color = colorByVector ? [] : '#1f78b4';
      var size = sizeByVector ? [] : 12;
      var text = [];
      var sizeFunction = null;
      var n = selectedIndices.columns.length > 0 ? selectedIndices.columns.length : fullIndices.columns.length;


      var data = [];
      if (sizeByVector) {
        var minMax = morpheus.VectorUtil.getMinMax(sizeByVector);
        sizeFunction = d3.scale.linear().domain(
          [minMax.min, minMax.max]).range([6, 19])
          .clamp(true);
      }
      if (sizeByVector) {
        for (var j = 0; j < sizeByVector.indices.length; j++) {
          var sizeByValue = sizeByVector.getValue(j);
          size.push(sizeFunction(sizeByValue));
        }
      }
      var idVector = getTrueVector(dataset.getColumnMetadata().getByName("id"));
      for (var j = 0; j < idVector.indices.length; j++) {
        text.push(idVector.getValue(j));
      }
      if (textByVector && label !== "id") {
        for (var j = 0; j < textByVector.indices.length; j++) {
          text[j] = text[j] + "<br>" + textByVector.getValue(j);
        }
      }
      var categoriesIndices;
      var categoryNameMap;
      if (colorByVector) {
        var categories = new Map();
        categoriesIndices = new Map();
        categoryNameMap = new Map();
        var catNum = 1;
        for (var j = 0; j < colorByVector.indices.length; j++) {
          var colorByValue = colorByVector.getValue(j);
          if (!categories.get(colorByValue)) {
            categories.set(colorByValue, catNum);
            categoryNameMap.set(catNum, colorByValue);
            catNum += 1;
          }
          if (!categoriesIndices.get(categories.get(colorByValue))) {
            categoriesIndices.set(categories.get(colorByValue), []);
          }
          categoriesIndices.get(categories.get(colorByValue)).push(j);

        }

        for (var cat = 1; cat < catNum; cat++) {
          var curText = [];
          var curSize = sizeByVector ? [] : size;
          var curColor = morpheus.VectorColorModel.CATEGORY_ALL[(cat - 1) % 60];
          for (var i = 0; i < categoriesIndices.get(cat).length; i++) {
            curText.push(text[categoriesIndices.get(cat)[i]]);
            if (sizeByVector) {
              curSize.push(size[categoriesIndices.get(cat)[i]]);
            }
          }
          data.push({
            marker: {
              fillcolor: curColor,
              color: curColor,
              size: curSize
            },
            text: curText,
            type: "scatter",
            mode: "markers",
            name: categoryNameMap.get(cat)
          })
        }
      } else {
        data.push({
          marker: {
            color: color,
            size: size
          },
          name: " ",
          mode: "markers",
          text: text,
          type: "scatter"
        });
      }

      _this.categoriesIndices = categoriesIndices;
      var columnIndices = selectedIndices.columns.length > 0 ? selectedIndices.columns : fullIndices.columns;
      var rowIndices = selectedIndices.rows.length > 0 ? selectedIndices.rows : fullIndices.rows;

      if (columnIndices.length == 1) {
        alert("Choose at least two columns");
        console.log("PcaPlot :: Choose at least two columns");
        return;
      }

      var expressionSetPromise = fullDataset.getESSession();

      //console.log("morpheus.PcaPlotTool.prototype.draw ::", "selected dataset", dataset, ", columnIndices", columnIndices, ", rowIndices", rowIndices);

      //console.log("morpheus.PcaPlotTool.prototype.draw ::", "color", colorBy, ", sizeBy", sizeBy, ", pc1", pc1, ", pc2", pc2, ", label", label);

      expressionSetPromise.then(function (essession) {
        var args = {
          es: essession,
          replacena: na
        };
        if (columnIndices && columnIndices.length > 0) {
          args.columns = columnIndices;
        }
        if (rowIndices && rowIndices.length > 0) {
          args.rows = rowIndices;
        }
        var drawResult = function () {
          var x = _this.pca.pca[pc1];
          var y = _this.pca.pca[pc2];
          //console.log(_this.pca);
          //console.log(_this.colorByVector, _this.categoriesIndices);
          if (_this.colorByVector) {
            for (var cat = 1; cat <= _this.categoriesIndices.size; cat++) {
              var curX = [];
              var curY = [];
              for (var j = 0; j < _this.categoriesIndices.get(cat).length; j++) {
                curX.push(x[_this.categoriesIndices.get(cat)[j]]);
                curY.push(y[_this.categoriesIndices.get(cat)[j]]);
              }
              //console.log(curX, curY);
              //console.log(data[cat]);
              data[cat - 1].x = curX;
              data[cat - 1].y = curY;
            }
          }
          else {
            data[0].x = x;
            data[0].y = y;
          }
          layout.margin = {
            b: 40,
            l: 60,
            t: 25,
            r: 10
          };
          layout.xaxis = {
            title: _this.pca.xlabs[pc1],
            zeroline: false
          };
          layout.yaxis = {
            title: _this.pca.xlabs[pc2],
            zeroline: false
          };
          layout.showlegend = true;
          layout.config = config;
          layout.data = data;
          var $chart = $('<div></div>');
          var myPlot = $chart[0];
          $chart.appendTo(_this.$chart);
          //console.log(data, layout, config);
          Plotly.newPlot(myPlot, data, layout, config);
        };

        //console.log(arguments);

        var req = ocpu.call("pcaPlot", args, function (session) {
          //console.log("morpheus.PcaPlotTool.prototype.draw ::", "successful", session);
          session.getObject(function (success) {
            //console.log(success);
            _this.pca = JSON.parse(success);
            drawResult();
            /*
             var coolUrl = success.split("\n");
             var json = JSON.parse($.parseHTML(coolUrl[1])[0].innerText);
             var data = json.x.data;
             var layout = json.x.layout;
             Plotly.newPlot(myPlot, data, layout, {showLink: false});*/
            //console.log("morpheus.PcaPlotTool.prototype.draw ::", "plot json", json);
          });
          /*var txt = session.txt.split("\n");
           var imageLocationAr = txt[txt.length - 2].split("/"0);
           var imageLocation = session.getLoc() + "files/" + imageLocationAr[imageLocationAr.length - 1];
           console.log(imageLocation);
           var img = $('<img />', {src : imageLocation, style : "width:720px;height:540px"});
           _this.$chart.prepend(img);*/
          /*var img = $('<img />', {src : session.getLoc() + 'graphics/1/png', style : "width:720px;height:540px"});*/

        }, false, "::es");
        req.fail(function () {
          alert(req.responseText);
          console.log("PcaPlot ::", req.responseText);
        });

      });


      expressionSetPromise.catch(function (reason) {
        alert("Problems occured during transforming dataset to ExpressionSet\n" + reason);
        console.log("ExpressionSetCreation ::", "Problems occured during transforming dataset to ExpressionSet\n", reason);
      });

    });
  }

};




morpheus.HeatMapElementCanvas = function (project) {
  morpheus.AbstractCanvas.call(this, true);
  var _this = this;
  this.colorScheme = null;
  this.project = project;
  this.dataset = null;
  this.columnPositions = new morpheus.Positions();
  this.rowPositions = new morpheus.Positions();
  this.lastPosition = {
    left: -1,
    right: -1,
    top: -1,
    bottom: -1
  };
  // drag to select rows and columns
  this.selectionBox = null;
  this.selectedRowElements = [];
  this.selectedColumnElements = [];
  project.getElementSelectionModel().on('selectionChanged', function (e) {
    _this.repaint();
  });
  this.gridColor = morpheus.HeatMapElementCanvas.GRID_COLOR;
  this.gridThickness = 0.1;
  this.elementDrawCallback = null;
  this.drawCallback = null;
};
morpheus.HeatMapElementCanvas.GRID_COLOR = '#808080';
morpheus.HeatMapElementCanvas.prototype = {
  drawGrid: true,
  drawValues: false,
  setPropertiesFromParent: function (parentHeatMapElementCanvas) {
    this.drawGrid = parentHeatMapElementCanvas.drawGrid;
    this.gridThickness = parentHeatMapElementCanvas.gridThickness;
    this.gridColor = parentHeatMapElementCanvas.gridColor;
    this.drawValues = parentHeatMapElementCanvas.drawValues;
  },
  updateRowSelectionCache: function (repaint) {
    this.selectedRowElements = morpheus.HeatMapElementCanvas.getSelectedSpans(this.project.getRowSelectionModel().getViewIndices());
    if (repaint) {
      this.repaint();
    }
  },
  updateColumnSelectionCache: function (repaint) {
    this.selectedColumnElements = morpheus.HeatMapElementCanvas.getSelectedSpans(this.project.getColumnSelectionModel().getViewIndices());
    if (repaint) {
      this.repaint();
    }
  },
  setGridColor: function (gridColor) {
    this.gridColor = gridColor;
  },
  getGridColor: function () {
    return this.gridColor;
  },
  setGridThickness: function (gridThickness) {
    this.gridThickness = gridThickness;
  },
  getGridThickness: function () {
    return this.gridThickness;
  },
  getColorScheme: function () {
    return this.colorScheme;
  },
  isDrawGrid: function () {
    return this.drawGrid;
  },
  setDrawGrid: function (drawGrid) {
    this.drawGrid = drawGrid;
  },
  setDrawValues: function (drawValues) {
    this.drawValues = drawValues;
  },
  isDrawValues: function () {
    return this.drawValues;
  },
  setColorScheme: function (colorScheme) {
    this.colorScheme = colorScheme;
  },
  setDataset: function (dataset) {
    this.dataset = dataset;
    this.columnPositions.setLength(this.dataset.getColumnCount());
    this.rowPositions.setLength(this.dataset.getRowCount());
    this.updateRowSelectionCache(false);
    this.updateColumnSelectionCache(false);
  },
  getColumnPositions: function () {
    return this.columnPositions;
  },
  getRowPositions: function () {
    return this.rowPositions;
  },
  getPreferredSize: function (context) {
    var w = Math.ceil(this.columnPositions.getPosition(this.columnPositions
        .getLength() - 1)
      + this.columnPositions.getItemSize(this.columnPositions
        .getLength() - 1));
    var h = Math.ceil(this.rowPositions.getPosition(this.rowPositions
        .getLength() - 1)
      + this.rowPositions
      .getItemSize(this.rowPositions.getLength() - 1));
    return {
      width: w,
      height: h
    };
  },
  prePaint: function (clip, context) {
    var lastPosition = this.lastPosition;
    var columnPositions = this.columnPositions;
    var rowPositions = this.rowPositions;
    var left = morpheus.Positions.getLeft(clip, columnPositions);
    var right = morpheus.Positions.getRight(clip, columnPositions);
    var top = morpheus.Positions.getTop(clip, rowPositions);
    var bottom = morpheus.Positions.getBottom(clip, rowPositions);
    if (this.invalid || left !== lastPosition.left
      || right !== lastPosition.right || top !== lastPosition.top
      || bottom !== lastPosition.bottom) {
      lastPosition.right = right;
      lastPosition.left = left;
      lastPosition.top = top;
      lastPosition.bottom = bottom;
      this.invalid = true;
    }
  },
  postPaint: function (clip, context) {
    // draw mouse over stuff
    morpheus.CanvasUtil.resetTransform(context);
    var project = this.project;
    context.strokeStyle = 'Grey';
    context.lineWidth = 1;
    var rowPositions = this.getRowPositions();
    var columnPositions = this.getColumnPositions();
    if (project.getHoverColumnIndex() >= 0
      || project.getHoverRowIndex() >= 0) {
      var height = rowPositions
      .getItemSize(project.getHoverColumnIndex());
      var width = columnPositions.getItemSize(project
      .getHoverColumnIndex());
      var y = (project.getHoverRowIndex() === -1 ? rowPositions
      .getPosition(rowPositions.getLength() - 1) : rowPositions
      .getPosition(project.getHoverRowIndex()));
      var x = (project.getHoverColumnIndex() === -1 ? columnPositions
      .getPosition(0) : columnPositions.getPosition(project
      .getHoverColumnIndex()));

      if (project.getHoverColumnIndex() !== -1) {
        // thin rectangle down entire column
        context.strokeRect(x - clip.x, 0, width, this
        .getUnscaledHeight());
      }
      if (project.getHoverRowIndex() !== -1) {
        // thin rectangle across entire row
        context.strokeRect(0, y - clip.y, this.getUnscaledWidth(),
          height);
      }
      if (project.getHoverColumnIndex() !== -1
        && project.getHoverRowIndex() !== -1) {
        context.strokeStyle = 'black';
        context.lineWidth = 3;
        context.strokeRect(x - clip.x + 1.5, y - clip.y + 1.5,
          width - 1.5, height - 1.5);
        if (project.isSymmetric()) {
          var y2 = rowPositions.getPosition(project.getHoverColumnIndex());
          var x2 = columnPositions.getPosition(project.getHoverRowIndex());
          context.strokeRect(x2 - clip.x + 1.5, y2 - clip.y + 1.5,
            width - 1.5, height - 1.5);
        }

      }
    }
    var left = morpheus.Positions.getLeft(clip, columnPositions);
    var right = morpheus.Positions.getRight(clip, columnPositions);
    var top = morpheus.Positions.getTop(clip, rowPositions);
    var bottom = morpheus.Positions.getBottom(clip, rowPositions);

    context.strokeStyle = 'rgb(0,0,0)';
    context.lineWidth = 2;
    // context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    context.translate(-clip.x, -clip.y);
    var selectedElements = project.getElementSelectionModel()
    .getViewIndices();

    if (selectedElements != null) {
      selectedElements.forEach(function (id) {
        var rowIndex = id.getArray()[0];
        var columnIndex = id.getArray()[1];
        if (rowIndex >= top && rowIndex < bottom && columnIndex >= left
          && columnIndex < right) {
          var rowSize = rowPositions.getItemSize(rowIndex);
          var py = rowPositions.getPosition(rowIndex);
          var columnSize = columnPositions.getItemSize(columnIndex);
          var px = columnPositions.getPosition(columnIndex);
          context.strokeRect(px + 1.5, py + 1.5, columnSize - 1.5,
            rowSize - 1.5);

        }
      });
    }
    // draw selection bounding boxes
    context.strokeStyle = 'rgb(182,213,253)';
    var selectedRowElements = this.selectedRowElements;
    var selectedColumnElements = this.selectedColumnElements;

    if (!(selectedRowElements.length === 0 &&
      selectedColumnElements.length === 0)) {
      if (selectedRowElements.length === 0) {
        selectedRowElements = [[top, bottom - 1]];
      }
      if (selectedColumnElements.length === 0) {
        selectedColumnElements = [[left, right - 1]];
      }
    }
    var nrows = selectedRowElements.length;
    var ncols = selectedColumnElements.length;

    if (nrows !== 0 || ncols !== 0) {
      for (var i = 0; i < nrows; i++) {
        var r = selectedRowElements[i];
        var y1 = rowPositions.getPosition(r[0]);
        var y2 = rowPositions.getPosition(r[1]) + rowPositions.getItemSize(i);
        for (var j = 0; j < ncols; j++) {
          var c = selectedColumnElements[j];
          var x1 = columnPositions.getPosition(c[0]);
          var x2 = columnPositions.getPosition(c[1]) + columnPositions.getItemSize(j);
          context.strokeRect(x1, y1, x2 - x1, y2 - y1);
        }
      }
    }
    if (this.selectionBox) {
      context.strokeStyle = 'rgb(0,0,0)';
      context.lineWidth = 2;
      if (context.setLineDash) {
        context.setLineDash([5]);
      }
      var x1 = columnPositions.getPosition(this.selectionBox.x[0]);
      var x2 = columnPositions.getPosition(this.selectionBox.x[1]);
      if (x2 < x1) {
        var tmp = x1;
        x1 = x2;
        x2 = tmp + columnPositions.getItemSize(this.selectionBox.x[0]);
      } else {
        x2 += columnPositions.getItemSize(this.selectionBox.x[1]);
      }
      var y1 = rowPositions.getPosition(this.selectionBox.y[0]);
      var y2 = rowPositions.getPosition(this.selectionBox.y[1]);
      if (y2 < y1) {
        var tmp = y1;
        y1 = y2;
        y2 = tmp + rowPositions.getItemSize(this.selectionBox.y[0]);
      } else {
        y2 += rowPositions.getItemSize(this.selectionBox.y[1]);
      }

      context.strokeRect(x1, y1, x2 - x1, y2 - y1);
      if (context.setLineDash) {
        context.setLineDash([]);
      }
      context.lineWidth = 1;
    }
  },
  setElementDrawCallback: function (elementDrawCallback) {
    this.elementDrawCallback = elementDrawCallback;
  },
  setSelectionBox: function (selectionBox) {
    this.selectionBox = selectionBox;
  },
  setDrawCallback: function (drawCallback) {
    this.drawCallback = drawCallback;
  },
  draw: function (clip, context) {
    var columnPositions = this.columnPositions;
    var rowPositions = this.rowPositions;
    var left = morpheus.Positions.getLeft(clip, columnPositions);
    var right = morpheus.Positions.getRight(clip, columnPositions);
    var top = morpheus.Positions.getTop(clip, rowPositions);
    var bottom = morpheus.Positions.getBottom(clip, rowPositions);

    context.translate(-clip.x, -clip.y);
    this._draw({
      left: left,
      right: right,
      top: top,
      bottom: bottom,
      context: context
    });
    context.translate(clip.x, clip.y);

    if (this.drawCallback) {
      this.drawCallback({
        clip: clip,
        context: context
      });
    }

  },
  _draw: function (options) {
    var left = options.left;
    var right = options.right;
    var top = options.top;
    var bottom = options.bottom;
    var context = options.context;

    var columnPositions = this.columnPositions;
    var rowPositions = this.rowPositions;
    //if (rowPositions.getSize() < 1 || columnPositions.getSize() < 1) {
    //force sub-pixel rendering
    morpheus.CanvasUtil.forceSubPixelRendering(context);
    //}

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    var dataset = this.dataset;

    var colorScheme = this.colorScheme;
    var drawGrid = this.drawGrid;
    var elementDrawCallback = this.elementDrawCallback;
    var hasElementDrawCallback = elementDrawCallback != null;
    var drawValues = this.drawValues && columnPositions.getSize() > 7 && rowPositions.getSize() > 7;
    var nf;
    if (drawValues) {
      nf = typeof d3 !== 'undefined' ? d3.format('.1f') : function (d) {
        return '' + d;
      };
      var fontSize = columnPositions.getSize();
      context.font = fontSize + 'px ' + morpheus.CanvasUtil.FONT_NAME;
      var textWidth = context.measureText('-99.9').width;
      fontSize = ( (columnPositions.getSize() - 1) / textWidth) * fontSize;
      fontSize = Math.min(fontSize, 17);
      context.font = fontSize + 'px ' + morpheus.CanvasUtil.FONT_NAME;
    }
    var seriesNameToIndex = {};
    for (var i = 0; i < dataset.getSeriesCount(); i++) {
      seriesNameToIndex[dataset.getName(i)] = i;
    }
    var sizer;
    var sizeBySeriesName;
    var sizeBySeriesIndex;

    var conditions;
    var conditionSeriesIndices;
    var minSize = 2;
    for (var row = top; row < bottom; row++) {
      var rowSize = rowPositions.getItemSize(row);
      var py = rowPositions.getPosition(row);
      for (var column = left; column < right; column++) {
        var columnSize = columnPositions.getItemSize(column);
        var px = columnPositions.getPosition(column);
        var value = dataset.getValue(row, column);
        context.fillStyle = colorScheme.getColor(row, column, value);
        if (column === left) { // check if the color scheme for this
          // row is sizing
          sizer = colorScheme.getSizer();
          sizeBySeriesName = sizer.getSeriesName();
          sizeBySeriesIndex = sizeBySeriesName != null ? seriesNameToIndex[sizeBySeriesName]
            : undefined;
          conditionSeriesIndices = [];
          conditions = colorScheme.getConditions().getConditions();
          for (var ci = 0, nconditions = conditions.length; ci < nconditions; ci++) {
            conditionSeriesIndices
            .push(seriesNameToIndex[conditions[ci].series]);
          }

        }
        var yoffset = 0;
        var xoffset = 0;
        var cellRowSize = rowSize;
        var cellColumnSize = columnSize;
        if (sizeBySeriesIndex !== undefined) {
          var sizeByValue = dataset.getValue(row, column,
            sizeBySeriesIndex);
          if (!isNaN(sizeByValue)) {
            var f = sizer.valueToFraction(sizeByValue);
            cellRowSize = Math.min(rowSize, Math.max(minSize, cellRowSize * f));
            yoffset = rowSize - cellRowSize;

          }
        }
        if (conditions.length > 0) {
          var condition = null;
          for (var ci = 0, nconditions = conditions.length; ci < nconditions; ci++) {
            var cond = conditions[ci];
            var condValue = dataset.getValue(row, column,
              conditionSeriesIndices[ci]);

            if (!isNaN(condValue) && cond.accept(condValue)) {
              condition = cond;
              break;
            }

          }
          if (condition !== null) {
            if (condition.shape != null) {
              if (condition.inheritColor) {
                var x = px + xoffset + cellRowSize / 2;
                var y = py + yoffset + cellColumnSize / 2;
                morpheus.CanvasUtil.drawShape(context, condition.shape,
                  x, y, Math.min(cellColumnSize, cellRowSize) / 2);
                context.fill();
              } else {
                context.fillRect(px + xoffset, py + yoffset, cellColumnSize,
                  cellRowSize);
                // x and y are at center
                var x = px + xoffset + cellRowSize / 2;
                var y = py + yoffset + cellColumnSize / 2;
                context.fillStyle = condition.color;
                morpheus.CanvasUtil.drawShape(context, condition.shape,
                  x, y, Math.min(cellColumnSize, cellRowSize) / 4);
                context.fill();
              }

            } else {
              context.fillRect(px + xoffset, py + yoffset, cellColumnSize,
                cellRowSize);
            }
          } else {
            context.fillRect(px + xoffset, py + yoffset, cellColumnSize,
              cellRowSize);
          }
        } else {
          context.fillRect(px + xoffset, py + yoffset, cellColumnSize, cellRowSize);
        }
        if (drawValues && cellColumnSize > 7 && cellRowSize > 7 && !isNaN(value)) {
          context.fillStyle = 'rgb(0,0,0)';
          context.fillText(nf(value), px + xoffset + cellColumnSize / 2, py + yoffset + cellRowSize / 2, cellColumnSize);
        }
        if (hasElementDrawCallback) {
          elementDrawCallback(context, dataset, row, column, px, py,
            columnSize, rowSize);
        }
      }
    }
    if (drawGrid && rowPositions.getSize() > 10 && columnPositions.getSize() > 10) {
      context.strokeStyle = this.gridColor;
      context.lineWidth = this.gridThickness;
      context.beginPath();

      for (var row = top; row < bottom; row++) {
        var rowSize = rowPositions.getItemSize(row);
        var py = rowPositions.getPosition(row);
        for (var column = left; column < right; column++) {
          var columnSize = columnPositions.getItemSize(column);
          var px = columnPositions.getPosition(column);
          var grid = columnSize > 10 && rowSize > 10;
          if (grid) {
            context.rect(px, py, columnSize, rowSize);
          }
        }
      }
      context.stroke();

    }
    context.lineWidth = 1;
  }
};
morpheus.Util.extend(morpheus.HeatMapElementCanvas, morpheus.AbstractCanvas);

morpheus.HeatMapElementCanvas.getSelectedSpans = function (set) {
  var array = [];
  if (set.size() > 0) {
    var index = 0;
    var start = index;
    var viewIndices = set.values();
    viewIndices.sort(function (a, b) {
      return (a === b ? 0 : (a < b ? -1 : 1));
    });
    var length = viewIndices.length;
    while (index < length) {
      var prior = index === 0 ? viewIndices[0] : viewIndices[index - 1];
      var current = viewIndices[index];
      if ((current - prior) > 1) {
        array.push([viewIndices[start], viewIndices[index - 1]]);
        start = index;
      }
      index++;
    }
    if (start == 0) {
      array.push([viewIndices[0], viewIndices[viewIndices.length - 1]]);
    } else {
      array.push([viewIndices[start], viewIndices[index - 1]]);
    }
  }
  return array;
};

morpheus.VectorTrackHeader = function (project, name, isColumns, heatMap) {
  morpheus.AbstractCanvas.call(this);
  this.project = project;
  this.name = name;
  this.isColumns = isColumns;
  var canvas = this.canvas;
  this.heatMap = heatMap;
  var vector = (isColumns ? project.getFullDataset().getColumnMetadata()
    : project.getFullDataset().getRowMetadata()).getByName(name);
  if (vector && vector.getProperties().has(morpheus.VectorKeys.TITLE)) {
    this.canvas.setAttribute('title', vector.getProperties().get(
      morpheus.VectorKeys.TITLE));
    $(this.canvas).tooltip();
  }

  var _this = this;

  this.setBounds({
    height: this.defaultFontHeight
    + morpheus.VectorTrackHeader.FONT_OFFSET
  });

  function getResizeCursor(pos) {
    if (isColumns) {
      if (pos.y < 3) {
        return {
          cursor: 'ns-resize',
          isPrevious: true
        };
      }
      if (pos.y >= (_this.getUnscaledHeight() - 3)) {
        return {
          cursor: 'ns-resize',
          isPrevious: false
        };
      }
      if (pos.x >= (_this.getUnscaledWidth() - 3)) { // change change column width
        return {
          isPrevious: false,
          cursor: 'ew-resize'
        };
      }
    } else {
      if (pos.x < 3 && heatMap.getTrackIndex(name, isColumns) > 0) { // can't drag left on 1st
        // row header
        return {
          cursor: 'ew-resize',
          isPrevious: true
        };
      }
      if (pos.x >= (_this.getUnscaledWidth() - 3)) {
        return {
          cursor: 'ew-resize',
          isPrevious: false
        };
      }
    }
  }

  var mouseMove = function (event) {
    if (!morpheus.CanvasUtil.dragging) {
      var pos = morpheus.CanvasUtil.getMousePos(event.target, event);
      var resizeCursor = getResizeCursor(pos);
      canvas.style.cursor = resizeCursor == null ? 'default' : resizeCursor.cursor;
      //document.body.style.cursor = !cursor ? 'default' : cursor;
      _this.isMouseOver = true;
      _this.repaint();
    }

  };
  var mouseExit = function (e) {
    if (!morpheus.CanvasUtil.dragging) {
      canvas.style.cursor = 'default';
    }
    _this.isMouseOver = false;
    _this.repaint();
  };
  var showPopup = function (e) {
    heatMap.setSelectedTrack(_this.name, isColumns);
    var track = heatMap.getTrack(_this.name, isColumns);
    if (!track) {
      throw _this.name + ' track not found';
    }
    e.preventDefault();
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    if (e.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }
    track.showPopup(e, true);
    return false;
  };
  this.selectedBackgroundColor = '#c8c8c8';
  this.backgroundColor = 'rgb(255,255,255)';
  $(this.canvas).css({'background-color': this.backgroundColor}).on(
    'mousemove.morpheus', mouseMove).on('mouseout.morpheus', mouseExit)
    .on('mouseenter.morpheus', mouseMove).on('contextmenu.morpheus', showPopup).addClass('morpheus-track-header ' + (isColumns ? 'morpheus-columns' : 'morpheus-rows'));

  var resizeCursor;
  var dragStartWidth = 0;
  var dragStartHeight = 0;
  var reorderingTrack = false;
  var dragStartPosition;
  var resizeTrackName;
  // var throttled = _.throttle(function(event) {
  //
  // if (event.type === 'mouseout') {
  // } else {
  // }
  // }, 100);
  // $(canvas).on('mouseout', throttled).on('mousemove', throttled);
  this.hammer = morpheus.Util
    .hammer(canvas, ['pan', 'tap', 'longpress'])
    .on('longpress', this.longpress = function (event) {
      event.preventDefault();
      heatMap.setSelectedTrack(_this.name, isColumns);
      var track = heatMap.getTrack(_this.name, isColumns);
      track.showPopup(event.srcEvent, true);
    })
    .on(
      'panend',
      this.panend = function (event) {
        _this.isMouseOver = false;
        morpheus.CanvasUtil.dragging = false;
        canvas.style.cursor = 'default';
        var index = heatMap.getTrackIndex(_this.name,
          isColumns);
        var header = heatMap.getTrackHeaderByIndex(index,
          isColumns);
        var track = heatMap
          .getTrackByIndex(index, isColumns);
        var $canvas = $(track.canvas);
        $canvas.css('z-index', '0');
        $(header.canvas).css('z-index', '0');
        heatMap.revalidate();
      })
    .on(
      'panstart',
      this.panstart = function (event) {
        _this.isMouseOver = false;

        if (morpheus.CanvasUtil.dragging) {
          return;
        }
        if (resizeCursor != null) { // resize
          morpheus.CanvasUtil.dragging = true;
          canvas.style.cursor = resizeCursor.cursor;
          if (resizeCursor.isPrevious) {
            var index = heatMap.getTrackIndex(_this.name,
              isColumns);
            index--; // FIXME index = -1
            if (index === -1) {
              index = 0;
            }
            var header = heatMap.getTrackHeaderByIndex(
              index, isColumns);
            dragStartWidth = header.getUnscaledWidth();
            dragStartHeight = header.getUnscaledHeight();
            resizeTrackName = header.name;
          } else {
            resizeTrackName = null;
            dragStartWidth = _this.getUnscaledWidth();
            dragStartHeight = _this.getUnscaledHeight();
          }
          event.preventDefault();
          reorderingTrack = false;
        } else { // move track
          var index = heatMap.getTrackIndex(_this.name,
            isColumns);
          if (index == -1) {
            throw _this.name + ' not found';
          }
          var header = heatMap.getTrackHeaderByIndex(
            index, isColumns);
          var track = heatMap.getTrackByIndex(index,
            isColumns);
          heatMap.setSelectedTrack(_this.name, isColumns);
          var $canvas = $(track.canvas);
          dragStartPosition = $canvas.position();
          $canvas.css('z-index', '100');
          $(header.canvas).css('z-index', '100');
          morpheus.CanvasUtil.dragging = true;
          resizeCursor = undefined;
          reorderingTrack = true;
        }
      })
    .on(
      'panmove',
      this.panmove = function (event) {
        _this.isMouseOver = false;
        if (resizeCursor != null) {
          var width;
          var height;
          if (resizeCursor.cursor === 'ew-resize') {
            var dx = event.deltaX;
            width = Math.max(8, dragStartWidth + dx);
          }

          if (resizeCursor.cursor === 'ns-resize') {
            var dy = event.deltaY;
            height = Math.max(8, dragStartHeight + dy);
          }

          heatMap.resizeTrack(resizeTrackName == null ? _this.name : resizeTrackName, width, height,
            isColumns);
        } else if (reorderingTrack) { // reorder
          var index = heatMap.getTrackIndex(_this.name,
            isColumns);
          var header = heatMap.getTrackHeaderByIndex(
            index, isColumns);
          var track = heatMap.getTrackByIndex(index,
            isColumns);
          var ntracks = heatMap.getNumTracks(isColumns);
          var delta = isColumns ? event.deltaY : event.deltaX;
          var newIndex = index + (delta > 0 ? 1 : -1);
          newIndex = Math.min(Math.max(0, newIndex),
            ntracks - 1);
          var prop = isColumns ? 'top' : 'left';
          var w = isColumns ? 'getUnscaledHeight'
            : 'getUnscaledWidth';
          var trackBounds = {};
          trackBounds[prop] = dragStartPosition[prop] + delta;
          track.setBounds(trackBounds);
          header.setBounds(trackBounds);
          var dragOverTrack = heatMap.getTrackByIndex(
            newIndex, isColumns);
          var dragOverWidth = dragOverTrack[w]();
          var dragOverLeft = $(dragOverTrack.canvas)
            .position()[prop];
          var dragleft = dragStartPosition[prop] + delta;
          var dragright = dragleft + track[w]();
          if ((delta > 0 && dragright >= dragOverLeft
              + dragOverWidth / 2)
            || (delta < 0 && dragleft <= dragOverLeft
              + dragOverWidth / 2)) {
            if (index !== newIndex) {
              heatMap.moveTrack(index, newIndex,
                isColumns);
              var otherHeader = heatMap
                .getTrackHeaderByIndex(index,
                  isColumns);
              var otherTrack = heatMap
                .getTrackByIndex(index, isColumns);
              var $movedCanvas = $(otherTrack.canvas);
              var newLeft = $movedCanvas.position()[prop];
              if (delta < 0) {
                newLeft += track[w]();
              } else {
                newLeft -= track[w]();
              }
              var otherBounds = {};
              otherBounds[prop] = newLeft;
              otherTrack.setBounds(otherBounds);
              otherHeader.setBounds(otherBounds);
            }
          }
        }
      })
    .on(
      'tap',
      this.tap = function (event) {
        if (morpheus.Util.IS_MAC && event.srcEvent.ctrlKey) { // right-click
          return;
        }
        _this.isMouseOver = false;
        heatMap.setSelectedTrack(_this.name, isColumns);
        var vector = (isColumns ? project.getFullDataset().getColumnMetadata()
          : project.getFullDataset().getRowMetadata()).getByName(name);
        // vector will be null for row #
        if ((isColumns && !heatMap.options.columnsSortable) || vector == null) {
          return;
        }
        if ((!isColumns && !heatMap.options.rowsSortable) || vector == null) {
          return;
        }

        var additionalSort = event.srcEvent.shiftKey;
        var isGroupBy = false; // event.srcEvent.altKey;

        var existingSortKeyIndex = _this
          .getSortKeyIndexForColumnName(_this
            .getSortKeys(), _this.name);
        var sortOrder;
        var sortKey;

        var dataType = morpheus.VectorUtil.getDataType(vector);
        if (existingSortKeyIndex != null) {
          sortKey = _this.getSortKeys()[existingSortKeyIndex.index];
          if (sortKey.getSortOrder() === morpheus.SortKey.SortOrder.UNSORTED) {
            sortOrder = morpheus.SortKey.SortOrder.ASCENDING; // 1st
            // click
          } else if (sortKey.getSortOrder() === morpheus.SortKey.SortOrder.ASCENDING) {
            sortOrder = morpheus.SortKey.SortOrder.DESCENDING; // 2nd
            // click
          } else if (sortKey.getSortOrder() === morpheus.SortKey.SortOrder.TOP_N) {
            sortOrder = morpheus.SortKey.SortOrder.UNSORTED;
          } else {
            sortOrder = dataType === 'number' || dataType === '[number]' ? morpheus.SortKey.SortOrder.TOP_N : morpheus.SortKey.SortOrder.UNSORTED; // 3rd
            // click
          }

        } else {
          sortKey = new morpheus.SortKey(_this.name,
            morpheus.SortKey.SortOrder.ASCENDING);
          sortOrder = morpheus.SortKey.SortOrder.ASCENDING;
        }
        if (sortKey != null) {
          sortKey.setSortOrder(sortOrder);
          _this.setSortingStatus(_this.getSortKeys(),
            sortKey, additionalSort, isGroupBy);
        }
      });
  $(this.canvas).on('mousedown', function (event) {
    resizeCursor = getResizeCursor(morpheus.CanvasUtil
      .getMousePos(event.target, event, true));
  });
};
morpheus.VectorTrackHeader.FONT_OFFSET = 2;
morpheus.VectorTrackHeader.prototype = {
  selected: false,
  isMouseOver: false,
  defaultFontHeight: 11,
  dispose: function () {
    morpheus.AbstractCanvas.prototype.dispose.call(this);
    this.hammer.off('longpress', this.longpress).off('panend', this.panend).off('panstart',
      this.panstart).off('panmove', this.panmove).off('tap', this.tap);
    this.hammer.destroy();
  },
  getPreferredSize: function () {
    var size = this.getPrintSize();
    size.width += 22; // leave space for sort, drag icon

    if (!this.isColumns) {
      size.height = this.defaultFontHeight
        + morpheus.VectorTrackHeader.FONT_OFFSET;
    }
    // var vector = (this.isColumns ? this.project.getFullDataset()
    // .getColumnMetadata() : this.project.getFullDataset()
    // .getRowMetadata()).getByName(this.name);
    // if (vector
    // && vector.getProperties().get(
    // morpheus.VectorKeys.SHOW_HEADER_SUMMARY)) {
    // if (isNaN(size.height)) {
    // size.height = 0;
    // }
    // if (!this.isColumns) {
    // size.height += 50;
    // } else {
    // size.width += 50;
    // }
    //
    // }
    return size;
  },
  getPrintSize: function () {
    var context = this.canvas.getContext('2d');
    context.font = this.defaultFontHeight + 'px '
      + morpheus.CanvasUtil.getFontFamily(context);
    var textWidth = 4 + context.measureText(this.name).width;
    return {
      width: textWidth,
      height: this.defaultFontHeight
      + morpheus.VectorTrackHeader.FONT_OFFSET
    };
  },
  getSortKeys: function () {
    return this.isColumns ? this.project.getColumnSortKeys() : this.project
      .getRowSortKeys();
  },
  setOrder: function (sortKeys) {
    if (this.isColumns) {
      this.project.setColumnSortKeys(morpheus.SortKey
        .keepExistingSortKeys(sortKeys, this.project
          .getColumnSortKeys()), false);
    } else {
      this.project.setRowSortKeys(morpheus.SortKey.keepExistingSortKeys(
        sortKeys, this.project.getRowSortKeys()), false);
    }
  },
  setGroupBy: function (groupBy) {
    var existingGroupBy = this.isColumns ? this.project.groupColumns
      : this.project.groupRows;
    // see if already exists, if so remove it
    var index = -1;
    for (var i = 0, length = existingGroupBy.length; i < length; i++) {
      if (existingGroupBy[i].toString() === groupBy.toString()) {
        index = i;
        break;
      }
    }
    var newGroupBy = [groupBy];
    if (index !== -1) {
      newGroupBy = existingGroupBy;
      newGroupBy.splice(index, 1);
    }
    if (this.isColumns) {
      this.project.setGroupColumns(newGroupBy, true);
    } else {
      this.project.setGroupRows(newGroupBy, true);
    }
  },
  setSelected: function (selected) {
    if (selected != this.selected) {
      this.selected = selected;
      $(this.canvas)
        .css(
          {
            'background-color': this.selected ? this.selectedBackgroundColor
              : this.backgroundColor
          });
    }
  },
  setSortingStatus: function (sortKeys, sortKey, additionalSort, isGroupBy) {
    if (!isGroupBy) {
      if (sortKey.getSortOrder() == morpheus.SortKey.SortOrder.UNSORTED
        && !additionalSort) {
        this.setOrder([]);
      } else {
        if (additionalSort && sortKeys.length == 0) {
          additionalSort = false;
        }
        if (!additionalSort) {
          sortKeys = [sortKey];
        } else {
          var sortKeyIndex = this.getSortKeyIndexForColumnName(
            sortKeys, sortKey.toString());
          if (sortKeyIndex === null) { // new sort column
            sortKeys.push(sortKey);
          } else { // change sort order of existing sort column
            sortKeys[sortKeyIndex.index] = sortKey;
          }
        }
        this.setOrder(sortKeys);
      }
    }
    if (isGroupBy) {
      this.setGroupBy(sortKey);
    } else {
      if (this.isColumns) {
        this.project.trigger('columnSortOrderChanged');
      } else {
        this.project.trigger('rowSortOrderChanged');
      }
    }
  },
  getSortKeyIndexForColumnName: function (sortKeys, columnName) {
    if (sortKeys != null) {
      var counter = 0;
      for (var i = 0, size = sortKeys.length; i < size; i++) {
        if (sortKeys[i].getLockOrder() === 0) {
          counter++;
        }
        if (sortKeys[i].getLockOrder() === 0 && sortKeys[i] instanceof morpheus.SortKey && columnName === sortKeys[i].toString()) {
          return {
            index: i,
            number: counter
          };
        }
      }
    }
    return null;
  },
  print: function (clip, context) {
    if (clip.height <= 6) {
      return;
    }
    context.textBaseline = 'bottom';
    if (this.isColumns) {
      context.textAlign = 'right';
      context.font = Math.min(this.defaultFontHeight, clip.height
        - morpheus.VectorTrackHeader.FONT_OFFSET)
        + 'px ' + morpheus.CanvasUtil.getFontFamily(context);
    } else {
      context.textAlign = 'left';
      context.font = (clip.height - morpheus.VectorTrackHeader.FONT_OFFSET)
        + 'px ' + morpheus.CanvasUtil.getFontFamily(context);
    }
    context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
    context.fillText(this.name, 0, 0);
  },
  draw: function (clip, context) {
    var sortKeys = this.getSortKeys();
    var name = this.name;
    var existingSortKeyIndex = this.getSortKeyIndexForColumnName(sortKeys,
      name);
    var unlockedSortKeys = sortKeys.filter(function (key) {
      return key.getLockOrder() === 0;
    });
    morpheus.CanvasUtil.resetTransform(context);
    context.clearRect(0, 0, this.getUnscaledWidth(), this
      .getUnscaledHeight());

    if (this.getUnscaledHeight() < 5) {
      return;
    }

    context.strokeStyle = '#ddd';
    if (this.isColumns) {
      context.beginPath();
      context.moveTo(0, this.getUnscaledHeight());
      context.lineTo(this.getUnscaledWidth(), this.getUnscaledHeight());
      context.stroke();
      context.textAlign = 'right';
    } else {
      context.beginPath();
      context.moveTo(this.getUnscaledWidth(), 0);
      context.lineTo(this.getUnscaledWidth(), this.getUnscaledHeight());
      context.stroke();
      context.textAlign = 'left';
    }
    var fontHeight = Math.min(this.defaultFontHeight, this
        .getUnscaledHeight()
      - morpheus.VectorTrackHeader.FONT_OFFSET);
    fontHeight = Math.min(fontHeight, morpheus.VectorTrack.MAX_FONT_SIZE);
    context.font = fontHeight + 'px ' + morpheus.CanvasUtil.getFontFamily(context);
    var textWidth = context.measureText(name).width;
    var isColumns = this.isColumns;
    var xpix = this.isColumns ? this.getUnscaledWidth() - 2 : 10;
    if (isColumns) {
      if (existingSortKeyIndex != null) {
        xpix -= 6;
      }
      if (sortKeys.length > 1) {
        xpix -= 6;
      }
    }
    context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
    var ypix = this.isColumns ? (this.getUnscaledHeight() / 2)
      : (this.getUnscaledHeight() - (this.defaultFontHeight + morpheus.VectorTrackHeader.FONT_OFFSET) / 2);
    context.textBaseline = 'middle';
    if (this.isMouseOver) {
      var xdot = xpix - (isColumns ? textWidth + 4 : 4);
      var ydot = ypix - 3;
      for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 3; j++) {
          context.fillRect(xdot - i * 3, ydot + j * 3, 1.5, 1.5);
        }
      }
    }

    context.fillText(name, xpix, ypix);
    // var vector = (this.isColumns ? this.project.getFullDataset()
    // .getColumnMetadata() : this.project.getFullDataset()
    // .getRowMetadata()).getByName(this.name);
    // if (vector
    // && vector.getProperties().get(
    // morpheus.VectorKeys.SHOW_HEADER_SUMMARY)) {
    // var summary = vector.getProperties().get(
    // morpheus.VectorKeys.HEADER_SUMMARY);
    // var track = this.heatMap.getTrack(this.name, this.isColumns);
    // if (summary == null) {
    // var visibleFieldIndices = vector.getProperties().get(
    // morpheus.VectorKeys.VISIBLE_FIELDS);
    //
    // if (visibleFieldIndices == null) {
    // visibleFieldIndices = morpheus.Util
    // .seq(vector.getProperties().get(
    // morpheus.VectorKeys.FIELDS).length);
    // }
    // var bigArray = [];
    // var min = Number.MAX_VALUE;
    // var max = Number.MAX_VALUE;
    // for (var i = 0, size = vector.size(); i < size; i++) {
    // var array = vector.getValue(i);
    // if (array != null) {
    // for (var j = 0, length = visibleFieldIndices.length; j < length; j++)
    // {
    // var value = array[visibleFieldIndices[j]];
    // if (!isNaN(value)) {
    // bigArray.push(value);
    // min = value < min ? value : min;
    // max = value > max ? value : max;
    // }
    // }
    // }
    // }
    // var nbins = Math.ceil(morpheus.Log2(bigArray.length) + 1);
    // var binSize = (max - min) / nbins;
    // var binNumberToOccurences = new Uint32Array(nbins);
    // var maxOccurences = 0;
    // for (var i = 0, size = bigArray.length; i < size; i++) {
    // var value = bigArray[i];
    // var bin = Math.floor((value - min) / binSize);
    // if (bin < 0) {
    // bin = 0;
    // } else if (bin >= binNumberToOccurences.length) {
    // bin = binNumberToOccurences.length - 1;
    // }
    // binNumberToOccurences[bin]++;
    // maxOccurences = Math.max(maxOccurences,
    // binNumberToOccurences[bin]);
    // }
    // summary = {
    // box : morpheus.BoxPlotItem(morpheus.VectorUtil
    // .arrayAsVector(bigArray)),
    // histogram : {
    // binSize : binSize,
    // total : bigArray.length,
    // binNumberToOccurences : binNumberToOccurences,
    // maxOccurences : maxOccurences,
    // min : min,
    // max : max
    // }
    //
    // };
    //
    // vector.getProperties().set(morpheus.VectorKeys.HEADER_SUMMARY,
    // summary);
    // }
    // var box = summary.box;
    // context.save();
    // context.translate(1, 0);
    //
    // var scale = track.createChartScale(this.getUnscaledWidth() - 2); //
    // TODO
    // // make
    // // sure
    // // scale
    // // is
    // // the
    // // same
    // // as
    // // track
    // var itemSize = 12;
    // var pix = 1;
    // var start = pix + 1;
    // var end = pix + itemSize - 1;
    // var center = (start + end) / 2;
    // var _itemSize = itemSize - 2;
    // var lineHeight = Math.max(2, _itemSize - 8);
    // context.fillStyle = 'black';
    // // box from q1 (25th q) to q3
    // context.fillRect(Math.min(scale(box.q1), scale(box.q3)), start,
    // Math.abs(scale(box.q1) - scale(box.q3)), _itemSize);
    // // draw line from q1 to lav
    // context.fillRect(Math.min(scale(box.q1),
    // scale(box.lowerAdjacentValue)), center - lineHeight / 2,
    // Math.abs(scale(box.q1) - scale(box.lowerAdjacentValue)),
    // lineHeight);
    // // draw line from q3 to uav
    // context.fillRect(Math.min(scale(box.q3),
    // scale(box.upperAdjacentValue)), center - lineHeight / 2,
    // Math.abs(scale(box.q3) - scale(box.upperAdjacentValue)),
    // lineHeight);
    // var histogram = summary.histogram;
    // var yscale = d3.scale.linear().domain([ 0, 1 ]).range([ 48, 14 ])
    // .clamp(true);
    // var xscale = d3.scale.linear().domain(
    // [ histogram.min, histogram.max + histogram.binSize ])
    // .range([ 1, this.getUnscaledWidth() - 2 ]).clamp(true);
    // // context.beginPath();
    // // context.moveTo(xscale(0), yscale(0));
    //
    // for (var i = 0, nbins = histogram.binNumberToOccurences.length; i <
    // nbins; i++) {
    // var n = histogram.binNumberToOccurences[i];
    // if (n > 0) {
    // var x = histogram.min + (i * histogram.binSize);
    // var xend = histogram.min + (i * histogram.binSize)
    // + histogram.binSize;
    // var xstart = histogram.min + (i * histogram.binSize);
    // var ypix = yscale(n / histogram.total);
    // context.fillRect(xscale(xstart), ypix, xscale(xend)
    // - xscale(xstart), Math.abs(ypix - yscale(0)));
    // }
    // }
    //
    // context.restore();
    // }
    context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
    if (existingSortKeyIndex !== null && sortKeys[existingSortKeyIndex.index].getLockOrder() === 0) {
      // draw arrow
      context.beginPath();
      var x = this.isColumns ? xpix + 4 : xpix + textWidth + 6;
      var arrowHeight = Math.min(8, this.getUnscaledHeight() / 2 - 1);
      var arrowWidth = 3;
      if (sortKeys[existingSortKeyIndex.index].getSortOrder() === morpheus.SortKey.SortOrder.ASCENDING) {
        // up arrow
        context.translate(x, ypix - arrowHeight);
        context.moveTo(0, 0);
        context.lineTo(arrowWidth, arrowHeight);
        context.lineTo(-arrowWidth, arrowHeight);
      } else if (sortKeys[existingSortKeyIndex.index].getSortOrder() === morpheus.SortKey.SortOrder.DESCENDING) { // down
        // arrow
        context.translate(x, ypix);
        context.moveTo(0, arrowHeight);
        context.lineTo(arrowWidth, 0);
        context.lineTo(-arrowWidth, 0);
      } else { // diamond
        context.translate(x, ypix - arrowHeight / 2);
        context.moveTo(0, 0);
        context.lineTo(arrowWidth, arrowHeight / 2);
        context.lineTo(0, arrowHeight);
        context.lineTo(-arrowWidth, arrowHeight / 2);
      }
      context.fill();
      morpheus.CanvasUtil.resetTransform(context);
      if (sortKeys[existingSortKeyIndex.index].getLockOrder() === 0 && unlockedSortKeys.length > 1) {
        context.textAlign = 'left';
        context.font = '8px ' + morpheus.CanvasUtil.getFontFamily(context);
        context.fillText('' + (existingSortKeyIndex.number), x + 4,
          ypix - 3);
      }
    }
  }
};
morpheus.Util.extend(morpheus.VectorTrackHeader, morpheus.AbstractCanvas);

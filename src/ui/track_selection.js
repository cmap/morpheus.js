morpheus.TrackSelection = function (track, positions, selectionModel, isColumns,
                                    heatMap) {
  var canvas = track.canvas;
  var startIndex = -1;
  var coord = isColumns ? 'x' : 'y';

  function getPosition(event, useDelta) {
    if (track.settings.squished) {
      var total = positions.getPosition(positions.getLength() - 1)
        + positions.getItemSize(positions.getLength() - 1);
      var squishFactor = total
        / (isColumns ? track.getUnscaledWidth() : track
          .getUnscaledHeight());
      var clientXY = morpheus.CanvasUtil.getClientXY(event, useDelta);
      var p = morpheus.CanvasUtil.getMousePosWithScroll(event.target,
        event, 0, 0, useDelta);
      p[coord] *= squishFactor;
      return p;

    } else {
      return morpheus.CanvasUtil.getMousePosWithScroll(event.target,
        event, heatMap.scrollLeft(), heatMap.scrollTop(),
        useDelta);
    }

  }

  var panning = false;
  var scrollIntervalId;
  var lastScrollTime = new Date().getTime();
  var _this = this;
  var mouseHoldTimeout = 50;

  function mouseleave(e) {

    // listen for mouse hold events
    var scroll = function () {
      var now = new Date().getTime();
      if (now - lastScrollTime >= mouseHoldTimeout) {
        var rect = canvas.getBoundingClientRect();
        var doPan = false;
        if (!isColumns) {
          if (e.clientY > rect.bottom || e.clientY < rect.top) {
            doPan = true;
          }
        } else {
          if (e.clientX > rect.right || e.clientX < rect.left) {
            doPan = true;
          }
        }
        if (doPan) {
          _this.panmove(e);
        }
      }
    };
    scrollIntervalId = setInterval(scroll, mouseHoldTimeout);
    $(canvas).one('mouseover', mouseover);
  }

  function mouseover() {
    // on mouse exit, see if mouse held
    // on mouse enter, stop listening
    clearInterval(scrollIntervalId);
    $(canvas).one('mouseleave', mouseleave);
  }

  this.hammer = morpheus.Util
    .hammer(canvas, ['pan', 'tap', 'longpress'])
    .on('longpress', this.longpress = function (event) {
      event.preventDefault();
      event.srcEvent.stopImmediatePropagation();
      event.srcEvent.stopPropagation();
      heatMap.setSelectedTrack(track.name, isColumns);
      track.showPopup(event.srcEvent);
    }).on('panend', this.panend = function (event) {
      panning = false;
      clearInterval(scrollIntervalId);
      $(canvas).off('mouseover mouseleave');
    })
    .on(
      'panmove',
      this.panmove = function (event) {
        if (event.srcEvent != null) {
          lastScrollTime = new Date().getTime();
        }
        var position = getPosition(event);
        var endIndex = positions.getIndex(position[coord],
          false);
        var commandKey = (event.srcEvent == null) ? false : (morpheus.Util.IS_MAC ? event.srcEvent.metaKey
          : event.srcEvent.ctrlKey);
        var viewIndices = commandKey ? selectionModel
          .getViewIndices() : new morpheus.Set();
        var _startIndex = startIndex;
        if (startIndex > endIndex) {
          var tmp = endIndex;
          endIndex = _startIndex;
          _startIndex = tmp;
        }
        for (var i = _startIndex; i <= endIndex; i++) {
          viewIndices.add(i);
        }
        selectionModel.setViewIndices(viewIndices, true);
        if (!isColumns) {
          var scrollTop = heatMap.scrollTop();
          var scrollBottom = scrollTop
            + heatMap.heatmap.getUnscaledHeight();
          if (position.y > scrollBottom) {
            heatMap.scrollTop(scrollTop + 8);
          } else if (position.y < scrollTop) {
            heatMap.scrollTop(scrollTop - 8);
          }
        } else {
          var scrollLeft = heatMap.scrollLeft();
          var scrollRight = scrollLeft
            + heatMap.heatmap.getUnscaledWidth();
          if (position.x > scrollRight) {
            heatMap.scrollLeft(scrollLeft + 8);
          } else if (position.x < scrollLeft) {
            heatMap.scrollLeft(scrollLeft - 8);
          }
        }
        event.preventDefault();
        if (event.srcEvent != null) {
          event.srcEvent.stopPropagation();
          event.srcEvent.stopImmediatePropagation();
        }
      })
    .on('panstart', this.panstart = function (event) {
      heatMap.setSelectedTrack(track.name, isColumns);
      var position = getPosition(event, true);
      startIndex = positions.getIndex(position[coord], false);
      panning = true;

      $(canvas).one('mouseleave.morpheus', mouseleave);

    })
    .on(
      'tap doubletap',
      this.tap = function (event) {
        var position = getPosition(event);
        var index = positions.getIndex(position[coord], false);
        if (event.tapCount > 1) {
          if ((isColumns && !heatMap.options.columnsSortable)
            || (!isColumns && !heatMap.options.rowsSortable)) {
            return;
          }
          heatMap.sortBasedOnSelection(null, isColumns,
            event.srcEvent.shiftKey);
        } else {
          heatMap.setSelectedTrack(track.name, isColumns);
          var commandKey = morpheus.Util.IS_MAC ? event.srcEvent.metaKey
            : event.srcEvent.ctrlKey;
          if (morpheus.Util.IS_MAC && event.srcEvent.ctrlKey) { // right-click
            // on
            // Mac
            return;
          }
          var viewIndices;
          if (commandKey) { // toggle selection
            viewIndices = selectionModel.getViewIndices();
            if (viewIndices.has(index)) {
              viewIndices.remove(index);
            } else {
              viewIndices.add(index);
            }
          } else if (event.srcEvent.shiftKey) { // add to
            // selection
            viewIndices = selectionModel.getViewIndices();
            var min = Number.MAX_VALUE;
            var max = -Number.MAX_VALUE;
            viewIndices.forEach(function (viewIndex) {
              min = Math.min(viewIndex, min);
              max = Math.max(viewIndex, max);
            });

            if (index >= max) { // select from index to max
              for (var i = max; i <= index; i++) {
                viewIndices.add(i);
              }
            } else {// select from index to min
              for (var i = Math.min(index, min), max = Math
                .max(index, min); i <= max; i++) {
                viewIndices.add(i);
              }
            }
          } else {
            viewIndices = new morpheus.Set();
            viewIndices.add(index);
          }
          selectionModel.setViewIndices(viewIndices, true);
        }
      });
};
morpheus.TrackSelection.prototype = {
  dispose: function () {
    this.hammer.off('longpress', this.longpress).off('panstart',
      this.panstart).off('panmove', this.panmove).off('panend', this.panend).off('tap', this.tap).off('doubletap', this.tap);
    this.hammer.destroy();
  }
};

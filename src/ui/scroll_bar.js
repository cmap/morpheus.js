morpheus.ScrollBar = function (isVertical) {
  morpheus.AbstractCanvas.call(this);
  this.isVertical = isVertical;
  $(this.canvas).css('border', '1px solid #d8d8d8');
  if (isVertical) {
    this.setBounds({
      width: 12
    });
  } else {
    this.setBounds({
      height: 12
    });
  }
  this.field = this.isVertical ? 'y' : 'x';
  var that = this;
  var mouseMove = function (event) {
    if (!morpheus.CanvasUtil.dragging) {
      var position = morpheus.CanvasUtil.getMousePos(event.target, event,
        true);
      var mouseOver = (position[that.field] >= that.thumbPos && position[that.field] <= (that.thumbPos + that.thumbExtent));
      if (that.thumbMouseOver !== mouseOver) {
        that.thumbMouseOver = mouseOver;
        that.repaint();
      }
    }
  };
  var mouseExit = function (e) {
    if (!morpheus.CanvasUtil.dragging && that.thumbMouseOver) {
      that.thumbMouseOver = false;
      that.repaint();
    }
  };
  $(this.canvas).on('mousemove', mouseMove).on('mouseout', mouseExit).on(
    'mouseenter', mouseMove);
  this.hammer = morpheus.Util
    .hammer(this.canvas, [this.isVertical ? 'panv' : 'panh', 'tap'])
    .on(
      'panstart',
      this.panstart = function (event) {
        var position = morpheus.CanvasUtil.getMousePos(
          event.target, event, true);
        if (position[that.field] >= that.thumbPos
          && position[that.field] <= (that.thumbPos + that.thumbExtent)) {
          that.draggingThumb = true;
          that.dragStartThumbPos = that.thumbPos;
        } else {
          that.draggingThumb = false;
        }
      })
    .on('panend', this.panend = function (event) {
      that.draggingThumb = false;
    })
    .on(
      'panmove',
      this.panmove = function (event) {
        if (that.draggingThumb) {
          var position = morpheus.CanvasUtil.getMousePos(
            event.target, event);
          var thumbPosPix = that.dragStartThumbPos
            + (that.isVertical ? event.deltaY
              : event.deltaX);
          var f = thumbPosPix
            / (that.visibleExtent - that.thumbExtent);
          var value = f * that.maxValue;
          // convert pix to value
          that.setValue(value, true);
          event.preventDefault();
          event.srcEvent.stopPropagation();
          event.srcEvent.stopImmediatePropagation();
        }
      })
    .on(
      'tap doubletap',
      this.tap = function (event) {
        // ensure not clicked on the thumb
        if (!that.draggingThumb) {
          var position = morpheus.CanvasUtil.getMousePos(
            event.target, event);
          if (!that.decorator.tap(position)) {
            // scroll up or down by thumbExtent
            var thumbExtentToValue = (that.thumbExtent / that.totalExtent)
              * that.totalExtent;
            that.scrollToTop = position[that.field] < that.thumbPos;
            that.setValue(that.scrollToTop ? that.value
            - thumbExtentToValue : that.value
            + thumbExtentToValue, true);
          }
        }
      });
};
morpheus.ScrollBar.prototype = {
  thumbPos: 0, // the top of the thumb, from 0 to visibleExtent-thumbExtent
  thumbExtent: 0,
  extent: 0,
  value: 0, // from 0 to totalExtent-extent
  maxValue: 0, // totalExtent-extent
  totalExtent: 0,
  visibleExtent: 0,
  dragStartThumbPos: 0,
  draggingThumb: false,
  thumbMouseOver: false,
  dispose: function () {
    morpheus.AbstractCanvas.prototype.dispose.call(this);
    this.hammer.off('panend', this.panend).off('panstart',
      this.panstart).off('panmove', this.panmove).off('tap', this.tap).off('doubletap', this.tap);
    this.hammer.destroy();
  },
  draw: function (clip, context) {
    var width = this.getUnscaledWidth();
    var height = this.getUnscaledHeight();
    if (this.visibleExtent === this.totalExtent) {
      context.clearRect(0, 0, width, height);
    } else {
      context.fillStyle = 'rgb(241,241,241)';
      context.fillRect(0, 0, width, height);
      context.fillStyle = !this.thumbMouseOver ? 'rgb(137,137,137)'
        : 'rgb(100,100,100)';
      if (this.isVertical) {
        context.fillRect(0, this.thumbPos, width, this.thumbExtent);
      } else {
        context.fillRect(this.thumbPos, 0, this.thumbExtent, height);
      }
    }
    this.decorator.draw(clip, context);
  },
  setThumbPosFromValue: function () {
    // value is thumb top position
    var f = this.maxValue == 0 ? 0 : this.value / this.maxValue;
    this.thumbPos = f * (this.visibleExtent - this.thumbExtent);
    this.thumbPos = Math.max(0, this.thumbPos);
  },
  getValue: function () {
    return this.value;
  },
  getMaxValue: function () {
    return this.maxValue;
  },
  setValue: function (value, trigger) {
    if (isNaN(value)) {
      value = 0;
    }
    if (this.visibleExtent === this.totalExtent) {
      value = 0;
    }
    value = Math.max(value, 0);
    value = Math.min(this.maxValue, value);
    this.value = value;
    this.setThumbPosFromValue();
    if (trigger) {
      this.trigger('scroll', {value: this.value});
      this.repaint();
    }
    return this.value;
  },
  setTotalExtent: function (totalExtent) {
    this.totalExtent = totalExtent;
    this._setRange();
  },
  getTotalExtent: function () {
    return this.totalExtent;
  },
  getVisibleExtent: function () {
    return this.visibleExtent;
  },
  _setRange: function () {
    this.thumbExtent = Math.max(10, this.visibleExtent
      * (this.visibleExtent / this.totalExtent));
    this.maxValue = this.totalExtent - this.visibleExtent;
    this.maxValue = Math.max(0, this.maxValue);
    if (this.isVertical) {
      this.setBounds({
        height: this.visibleExtent
      });
    } else {
      this.setBounds({
        width: this.visibleExtent
      });
    }
  },
  setExtent: function (visibleExtent, totalExtent, value) {
    this.visibleExtent = visibleExtent;
    this.totalExtent = totalExtent;
    this._setRange();
    this.setValue(value, false);
  }
};
morpheus.Util.extend(morpheus.ScrollBar, morpheus.AbstractCanvas);
morpheus.Util.extend(morpheus.ScrollBar, morpheus.Events);

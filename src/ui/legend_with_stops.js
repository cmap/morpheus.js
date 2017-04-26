morpheus.LegendWithStops = function () {
  morpheus.AbstractCanvas.call(this, false);
  this.setBounds({
    width: 300,
    height: 40
  });
  var _this = this;
  $(this.canvas).on('mousedown', function (event) {
    var position = morpheus.CanvasUtil.getMousePos(
      event.target, event);
    _this.selectedIndex = _this
    .findIndexForPosition(position);
    _this.trigger('selectedIndex', {
      selectedIndex: _this.selectedIndex
    });
  });
  this.hammer = morpheus.Util.hammer(this.canvas, ['pan'])
  .on(
    'panmove',
    this.panmove = function (event) {
      if (_this.selectedIndex !== -1) {
        var position = morpheus.CanvasUtil.getMousePos(
          event.target, event);
        var fraction = _this.fractionToStopPix
        .invert(position.x);
        fraction = Math.max(0, fraction);
        fraction = Math.min(1, fraction);
        _this.trigger('moved', {
          fraction: fraction
        });
      }
    }).on(
    'panstart',
    this.panstart = function (event) {
      // _this.selectedIndex = _this
      // .findIndexForPosition(morpheus.CanvasUtil
      // .getMousePos(event.target, event, true));
    }).on('panend', this.panend = function (event) {
    _this.selectedIndex = -1;
  });
  $(this.canvas).on('keydown', function (e) {
    // 8=backspace, 46=delete
    if ((e.which == 8 || e.which == 46) && _this.selectedIndex !== -1) {
      _this.trigger('delete');
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  });
};
morpheus.LegendWithStops.prototype = {
  border: 7,
  stopHalfSize: 5,
  selectedIndex: -1,
  destroy: function () {
    $(this.canvas).off('keyup').off('mousedown');
    this.hammer.off('panstart',
      this.panstart).off('panmove', this.panmove);
    this.hammer.destroy();
  },
  setSelectedIndex: function (index) {
    this.selectedIndex = -1;
  },
  findIndexForPosition: function (position) {
    // pix - stopHalfSize to pix + stopHalfSize
    if (position.y >= 22) {
      for (var i = 0, length = this.fractions.length; i < length; i++) {
        var pix = this.fractionToStopPix(this.fractions[i]);
        var start = pix - this.stopHalfSize;
        var end = pix + this.stopHalfSize;
        if (position.x >= start && position.x <= end) {
          return i;
        }
      }
    }
    return -1;
  },
  draw: function (fractions, colors, stepped, fractionToStopPix) {
    this.fractions = fractions;
    this.colors = colors;
    this.stepped = stepped;
    this.fractionToStopPix = fractionToStopPix;
    var context = this.canvas.getContext('2d');
    morpheus.CanvasUtil.resetTransform(context);
    context.clearRect(0, 0, this.getUnscaledWidth(), this
    .getUnscaledHeight());
    context.translate(this.border, 0);
    morpheus.HeatMapColorSchemeLegend.draw(context, fractions, colors, this
      .getUnscaledWidth()
      - 2 * this.border, this.getUnscaledHeight() - 20, stepped);
    context.translate(-this.border, 0);
    context.lineWidth = 1;
    context.strokeStyle = 'Grey';
    context.strokeRect(this.border, 0, this.getUnscaledWidth() - 2
      * this.border, this.getUnscaledHeight() - 20);
    for (var i = 0; i < fractions.length; i++) {
      if (i > 0 && fractions[i] === fractions[i - 1]) {
        continue;
      }
      context.fillStyle = colors[i];
      var pix = fractionToStopPix(fractions[i]);
      context.fillRect(pix - this.stopHalfSize, 22,
        this.stopHalfSize * 2, this.stopHalfSize * 2);
      if (this.selectedIndex === i) {
        context.lineWidth = 2;
        context.strokeStyle = 'black';
      } else {
        context.lineWidth = 1;
        context.strokeStyle = 'Grey';
      }
      context.strokeRect(pix - this.stopHalfSize, 22,
        this.stopHalfSize * 2, this.stopHalfSize * 2);
    }
  }
};
morpheus.Util.extend(morpheus.LegendWithStops, morpheus.AbstractCanvas);
morpheus.Util.extend(morpheus.LegendWithStops, morpheus.Events);

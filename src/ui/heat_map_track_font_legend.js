morpheus.HeatMapTrackFontLegend = function (tracks, model) {
  morpheus.AbstractCanvas.call(this, false);
  this.tracks = tracks;
  this.model = model;
  this.canvas.style.position = '';
};
morpheus.HeatMapTrackFontLegend.prototype = {
  getPreferredSize: function () {
    var tracks = this.tracks;
    var model = this.model;
    var canvas = this.canvas;
    var context = canvas.getContext('2d');
    context.font = '900 12px ' + morpheus.CanvasUtil.getFontFamily(context);
    var xpix = 0;
    var ypix = 0;
    var maxYPix = 0;
    for (var i = 0; i < tracks.length; i++) {
      ypix = 0;
      var maxWidth = 0;
      var vector = tracks[i].getVector(tracks[i].settings.fontField);
      var map = model.getMap(vector.getName());

      map.forEach(function (font, key) {
        // skip normal font weight
        if (font != null && font.weight != '400') {
          var width = context.measureText(key).width;
          if (!isNaN(width)) {
            maxWidth = Math.max(maxWidth, width);
          }
          ypix += 14;
        }
      });

      xpix += maxWidth + 6;
      maxYPix = Math.max(maxYPix, ypix);
    }
    return {
      width: xpix,
      height: maxYPix > 0 ? (maxYPix + 30) : 0
    };
  },
  draw: function (clip, context) {
    // draw legends horizontally
    var tracks = this.tracks;
    var model = this.model;
    var xpix = 0;
    var ypix = 0;
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.font = '12px ' + morpheus.CanvasUtil.getFontFamily(context);
    context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
    context.strokeStyle = 'black';
    var font = context.font;
    for (var i = 0; i < tracks.length; i++) {
      ypix = 0;
      var maxWidth = 0;
      var textVector = tracks[i].getVector();
      var fontVector = tracks[i].getVector(tracks[i].settings.fontField);
      context.font = font;
      context.fillText(textVector.getName(), xpix, ypix); // vector name
      maxWidth = Math.max(maxWidth,
        context.measureText(textVector.getName()).width);
      ypix += 14;
      var map = model.getMap(fontVector.getName());
      var values = map.keys().sort(morpheus.SortKey.ASCENDING_COMPARATOR);
      values.forEach(function (key) {
        var mappedFont = model.getMappedValue(fontVector, key);
        if (mappedFont != null && mappedFont.weight != '400') {
          context.font = mappedFont.weight + ' ' + font;
          var width = context.measureText(key).width;
          if (!isNaN(width)) {
            maxWidth = Math.max(maxWidth, width);
          }
          context.fillText(key, xpix, ypix);
          ypix += 14;
        }
      });

      xpix += maxWidth + 6; // space between tracks
    }
  }
};
morpheus.Util.extend(morpheus.HeatMapTrackFontLegend, morpheus.AbstractCanvas);

morpheus.HeatMapColorSchemeLegend = function (controller, $keyContent) {
  var colorScheme = controller.heatmap.getColorScheme();

  var tracks = colorScheme.getColorByValues();
  var totalHeight;
  $keyContent.empty();
  var ntracks = tracks.length;
  tracks
  .forEach(function (value) {
    if (value != null || ntracks === 1) {
      if (value != 'null') { // values are stored as string
        var $label = $('<div style="overflow:hidden;text-overflow:' +
          ' ellipsis;width:250px;max-width:250px;">'
          + value + '</div>');
        $keyContent.append($label);
        totalHeight += $label.height();
      }
      var trackLegend = new morpheus.HeatMapColorSchemeLegendTrack(
        colorScheme, value);
      $(trackLegend.canvas).css('position', '');
      trackLegend.repaint();
      trackLegend.on('selectionChanged', function () {
        controller.heatmap.setInvalid(true);
        controller.heatmap.repaint();
      });
      $keyContent.append($(trackLegend.canvas));
      totalHeight += trackLegend.getUnscaledHeight();
    }
  });
  if (controller.options.$key) {
    $keyContent.append(controller.options.$key);
    totalHeight += controller.options.$key.height();

  }
  var $edit = $('<div style="padding-left:4px; display:inline;"><a data-name="options"' +
    ' href="#">Edit</a></div>');

  $edit.find('[data-name=options]').on('click', function (e) {
    e.preventDefault();
    controller.showOptions();
    morpheus.Util.trackEvent({
      eventCategory: 'ToolBar',
      eventAction: 'options'
    });
  });
  totalHeight += $edit.height();
  $keyContent.append($edit);
  $keyContent.css({
    'text-overflow': 'ellipsis',
    overflow: 'hidden',
    width: 250 + 'px',
    height: totalHeight + 'px'
  });
};

morpheus.HeatMapColorSchemeLegendTrack = function (colorScheme, value) {
  morpheus.AbstractCanvas.call(this, false);
  var _this = this;
  this.value = value;
  this.colorScheme = colorScheme;
  colorScheme.setCurrentValue(value);
  var hiddenValues = colorScheme.getHiddenValues();

  var names = colorScheme.getNames();
  var hasNames = names != null;
  var legendHeight = hasNames ? names.length * 14 : 30;
  var bounds = {
    width: 250,
    height: legendHeight
  };
  this.hasNames = hasNames;
  this.setBounds(bounds);
  if (hasNames && hiddenValues) {
    $(this.canvas)
    .on(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        var clickedRow = Math
        .floor((e.clientY - _this.canvas
          .getBoundingClientRect().top) / 14);
        var fractionToValue = d3.scale.linear().domain(
          [0, 1]).range(
          [colorScheme.getMin(),
            colorScheme.getMax()]).clamp(true);
        var fractions = colorScheme.getFractions();
        var value = fractionToValue(fractions[clickedRow]);
        if (!hiddenValues.has(value)) {
          hiddenValues.add(value);
        } else {
          hiddenValues.remove(value);

        }
        _this.trigger('selectionChanged');
        _this.repaint();
      });
  }
};

morpheus.HeatMapColorSchemeLegendTrack.prototype = {
  draw: function (clip, context) {
    var colorScheme = this.colorScheme;
    colorScheme.setCurrentValue(this.value);
    context.fillStyle = 'white';
    context.fillRect(0, 0, this.getUnscaledWidth(), this
    .getUnscaledHeight());
    context.translate(this.hasNames ? 14
      : (this.getUnscaledWidth() - 200) / 2, 0);
    morpheus.HeatMapColorSchemeLegend.drawColorScheme(context, colorScheme,
      200);

  }

};

morpheus.Util.extend(morpheus.HeatMapColorSchemeLegendTrack,
  morpheus.AbstractCanvas);
morpheus.Util.extend(morpheus.HeatMapColorSchemeLegendTrack, morpheus.Events);
morpheus.HeatMapColorSchemeLegend.drawColorScheme = function (context,
                                                              colorScheme, width, printing, hideText) {
  var names = colorScheme.getNames();
  var hasNames = names != null;
  // if hasNames that we draw vertically to ensure space for names
  if (hasNames) {
    morpheus.HeatMapColorSchemeLegend.drawColorSchemeVertically(context,
      colorScheme, colorScheme.getHiddenValues(), printing);
  } else {
    morpheus.HeatMapColorSchemeLegend.draw(context, colorScheme
      .getFractions(), colorScheme.getColors(), width, 12,
      colorScheme.isStepped());
    context.strokeStyle = 'LightGrey';
    context.strokeRect(0, 0, width, 12);
    if (hideText) {
      return;
    }
    var map = d3.scale.linear().domain([0, 1]).range([0, width]).clamp(
      true);
    var fractionToValue = d3.scale.linear().domain([0, 1]).range(
      [colorScheme.getMin(), colorScheme.getMax()]).clamp(true);
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillStyle = 'black';
    context.font = '12px ' + morpheus.CanvasUtil.FONT_NAME;
    if (colorScheme.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
      context.fillText('row min', 0, 14);
      context.fillText('row max', width, 14);
    } else {
      var fractions = colorScheme.getFractions();
      var lastTextPixEnd = -1;
      // draw from left to middle and then from right to middle to avoid
      // text overlap
      var halfway = parseInt(fractions.length / 2);
      for (var i = 0; i < halfway; i++) {
        var pix = map(fractions[i]);
        var text = '';
        if (hasNames) {
          text = names[i] != '' ? (names[i] + ' ('
            + fractionToValue(fractions[i]) + ')') : names[i];
        } else {
          text = morpheus.Util.nf(fractionToValue(fractions[i]));
        }
        var textWidth = context.measureText(text).width;
        if (pix > lastTextPixEnd) {
          context.fillText(text, pix, 14);
        }
        lastTextPixEnd = pix + textWidth / 2;
      }
      var lastTextPixStart = 10000;
      for (var i = fractions.length - 1; i >= halfway; i--) {
        var pix = map(fractions[i]);
        var text = '';
        if (hasNames) {
          text = names[i] != '' ? (names[i] + ' ('
            + fractionToValue(fractions[i]) + ')') : names[i];
        } else {
          text = morpheus.Util.nf(fractionToValue(fractions[i]));
        }

        var textWidth = context.measureText(text).width;
        var textPixEnd = pix + textWidth / 2;
        if (pix < lastTextPixStart) {

          context.fillText(text, pix, 14);
          lastTextPixStart = pix - textWidth / 2;
        }
      }
    }
  }
};
morpheus.HeatMapColorSchemeLegend.drawColorSchemeVertically = function (context,
                                                                        colorScheme, hiddenValues, printing) {
  var fractionToValue = d3.scale.linear().domain([0, 1]).range(
    [colorScheme.getMin(), colorScheme.getMax()]).clamp(true);
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillStyle = 'black';
  var fractions = colorScheme.getFractions();
  var colors = colorScheme.getColors();
  var names = colorScheme.getNames();
  context.strokeStyle = 'LightGrey';
  var xpix = 0;
  var ypix = 0;

  context.font = '12px ' + morpheus.CanvasUtil.FONT_NAME;
  for (var i = 0; i < colors.length; i++) {
    var name = names[i];
    if (name != null) {
      context.fillStyle = colors[i];
      context.fillRect(xpix, ypix, 12, 12);
      context.strokeRect(xpix, ypix, 12, 12);
      context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
      if (hiddenValues && !printing) {
        var value = fractionToValue(fractions[i]);
        context.font = '12px FontAwesome';
        if (!hiddenValues.has(value)) {
          context.fillText('\uf00c', -14, ypix); // checked
        }
        // else {
        // context.fillText("\uf096", -14, ypix); // unchecked
        // }
        context.font = '12px ' + morpheus.CanvasUtil.FONT_NAME;
      }
      context.fillText(name, xpix + 16, ypix);
    }
    ypix += 14;
  }
};
morpheus.HeatMapColorSchemeLegend.draw = function (context, fractions, colors,
                                                   width, height, stepped) {
  if (!stepped) {
    var gradient = context.createLinearGradient(0, 0, width, height);
    for (var i = 0, length = fractions.length; i < length; i++) {
      gradient.addColorStop(fractions[i], colors[i]);
    }
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  } else {
    // intervals include left end point, exclude right end point, except for
    // the highest interval
    // TODO right-most endpoint is not shown
    var map = d3.scale.linear().domain([0, 1]).range([0, width]).clamp(
      true);
    for (var i = 0, length = fractions.length; i < length; i++) {
      context.fillStyle = colors[i];
      var x1 = map(fractions[i]);
      var x2 = i === length - 1 ? width : map(fractions[i + 1]);
      context.fillRect(Math.min(x1, x2), 0, Math.abs(x2 - x1), height);
    }
  }
};
morpheus.HeatMapColorSchemeLegend.prototype = {};

morpheus.SortByValuesIndicator = function (project, isVertical, positions) {
  morpheus.AbstractCanvas.call(this, true);
  this.project = project;
  this.isVertical = isVertical;
  this.positions = positions;
  this.lastPosition = {
    start: -1,
    end: -1
  };
};
morpheus.SortByValuesIndicator.prototype = {
  prePaint: function (clip, context) {
    var positions = this.positions;
    var start = 0;
    var end = positions.getLength();
    if (!this.isVertical) {
      start = morpheus.Positions.getLeft(clip, positions);
      end = morpheus.Positions.getRight(clip, positions);
    } else {
      start = morpheus.Positions.getTop(clip, positions);
      end = morpheus.Positions.getBottom(clip, positions);
    }
    if (this.invalid || start !== this.lastPosition.start
      || end !== this.lastPosition.end) {
      this.lastPosition.start = start;
      this.lastPosition.end = end;
      this.invalid = true;
    }
  },
  draw: function (clip, context) {
    var project = this.project;
    var isVertical = this.isVertical;
    var positions = this.positions;
    var sortKeys = isVertical ? project.getColumnSortKeys() : project
      .getRowSortKeys();
    context.translate(-clip.x, -clip.y);
    context.fillStyle = 'black';
    context.textBaseline = 'top';
    context.textAlign = 'left';
    context.font = '8px ' + morpheus.CanvasUtil.FONT_NAME;
    var start = 0;
    var end = positions.getLength();
    if (!isVertical) {
      start = morpheus.Positions.getLeft(clip, positions);
      end = morpheus.Positions.getRight(clip, positions);
    } else {
      start = morpheus.Positions.getTop(clip, positions);
      end = morpheus.Positions.getBottom(clip, positions);
    }
    var arrowWidth = 3;
    var arrowHeight = 4;
    for (var i = 0; i < sortKeys.length; i++) {
      var key = sortKeys[i];
      if (key instanceof morpheus.SortByValuesKey) { // are we sorting
        // columns by the
        // values in a row?

        var modelIndices = key.modelIndices;
        for (var j = 0; j < modelIndices.length; j++) {
          var modelIndex = modelIndices[j];
          var view = isVertical ? project
            .convertModelRowIndexToView(modelIndex) : project
            .convertModelColumnIndexToView(modelIndex);
          if (view !== -1 && view >= start && view < end) {
            context.save();
            var pix = positions.getPosition(view);
            var size = positions.getItemSize(view);
            if (!isVertical) {
              context.translate(pix + size / 2, 0);
            } else {
              context.translate(2, pix + size / 2);
            }
            context.beginPath();
            // if (!isVertical) {
            if (key.getSortOrder() === morpheus.SortKey.SortOrder.ASCENDING) {
              // up arrow
              context.moveTo(0, 0);
              context.lineTo(arrowWidth, arrowHeight);
              context.lineTo(-arrowWidth, arrowHeight);
            } else if (key.getSortOrder() === morpheus.SortKey.SortOrder.DESCENDING) { // down
              // arrow
              context.moveTo(0, arrowHeight);
              context.lineTo(arrowWidth, 0);
              context.lineTo(-arrowWidth, 0);
            } else { // diamond
              context.moveTo(0, 0);
              context.lineTo(arrowWidth, arrowHeight / 2);
              context.lineTo(0, arrowHeight);
              context.lineTo(-arrowWidth, arrowHeight / 2);

            }
            // } else {
            // if (!ascending) { // left arrow
            // context.moveTo(0, 0);
            // context.lineTo(arrowWidth, arrowHeight);
            // context.lineTo(arrowWidth, -arrowHeight);
            // } else {
            // context.moveTo(arrowWidth, 0); // right arrow
            // context.lineTo(0, arrowHeight);
            // context.lineTo(0, -arrowHeight);
            // }
            // }
            context.fill();

            // don't indicate sort priority b/c of limited space
//						if (sortKeys.length > 1) {
//							context.fillText('' + (i + 1), 0, 0);
//						}
            context.restore();
          }
        }
      }
    }
  }
};
morpheus.Util.extend(morpheus.SortByValuesIndicator, morpheus.AbstractCanvas);

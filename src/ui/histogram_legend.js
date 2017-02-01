morpheus.HistogramLegend = function (dataset, colorScheme, metadataValue) {
  morpheus.AbstractCanvas.call(this, true);
  this.colorScheme = colorScheme;
  this.metadataValue = metadataValue;
  this.dataset = dataset;
  this.binNumberToOccurences = null;
  this.setBounds({
    width: 250,
    height: 80
  });
  this.name = null;
  this.canvas.style.position = '';
  this.canvas.style.border = '1px solid LightGrey';
};

morpheus.HistogramLegend.prototype = {
  binSize: 0,
  maxCount: 0,
  total: 0,
  setName: function (name) {
    this.name = name;
  },
  setBinSize: function (binSize) {
    this.binSize = binSize;
  },
  buildHistogram: function () {
    var binSize = this.binSize;
    var dataset = this.dataset;
    var metadataValue = this.metadataValue;
    var colorScheme = this.colorScheme;

    var min = colorScheme.getMin();
    var max = colorScheme.getMax();

    if (min === max) {
      min -= 0.5;
      max += 0.5;
    }
    var vector =
      dataset.getRowMetadata().getByName(colorScheme.getSeparateColorSchemeForRowMetadataField());
    // var numberOfBins = Math.ceil(morpheus.Log2(dataset.getRowCount() * dataset.getColumnCount()) + 1);
    // var binSize = (max - min) / numberOfBins;
    var numberOfBins = Math.ceil((max - min) / binSize);
    var binNumberToOccurences = new Uint32Array(numberOfBins);
    this.binNumberToOccurences = binNumberToOccurences;
    var values = new Float32Array(dataset.getRowCount() * dataset.getColumnCount());
    var index = 0;
    for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
      if (vector == null || vector.getValue(i) === metadataValue) {
        for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
          var value = dataset.getValue(i, j);
          if (isNaN(value)) {
            continue;
          }
          values[index++] = value;
          var bin = Math.floor(((value - min) / binSize));
          if (bin < 0) {
            bin = 0;
          } else if (bin >= numberOfBins) {
            bin = numberOfBins - 1;
          }
          binNumberToOccurences[bin]++;
        }
      }
    }
    values = values.slice(0, index);
    values.sort();
    this.median = morpheus.ArrayPercentile(values, 50, true);
    this.q25 = morpheus.ArrayPercentile(values, 25, true);
    this.q75 = morpheus.ArrayPercentile(values, 75, true);
    var upperOutlier = this.q75 + 1.5 * (this.q75 - this.q25);
    var lowerOutlier = this.q25 - 1.5 * (this.q75 - this.q25);
    var upperAdjacentValue = -Number.MAX_VALUE;
    var lowerAdjacentValue = Number.MAX_VALUE;
    for (var i = 0, n = values.length; i < n; i++) {
      var value = values[i];
      if (value <= upperOutlier) {
        upperAdjacentValue = Math.max(upperAdjacentValue, value);
      }
      if (value >= lowerOutlier) {
        lowerAdjacentValue = Math.min(lowerAdjacentValue, value);
      }
    }
    this.upperAdjacentValue = upperAdjacentValue;
    this.lowerAdjacentValue = lowerAdjacentValue;
    var maxCount = 0;
    var total = 0;
    for (var i = 0; i < numberOfBins; i++) {
      var count = binNumberToOccurences[i];
      maxCount = count >= maxCount ? count : maxCount;
      total += count;
    }
    this.maxCount = maxCount;
    this.total = total;
  },
  draw: function (clip, context) {
    this.buildHistogram();
    var colorScheme = this.colorScheme;
    var canvasWidth = this.getUnscaledWidth() - 50;
    var valueToPosition = d3.scale.linear().domain([colorScheme.getMin(), colorScheme.getMax()]).range([0, canvasWidth]).clamp(
      true);
    var histogramHeight = 30;
    var countToPosition = d3.scale.linear().domain([0, this.maxCount / this.total]).range([histogramHeight, 0]).clamp(
      true);
    var binNumberToOccurences = this.binNumberToOccurences;
    var min = colorScheme.getMin();
    var binSize = this.binSize;
    var y0 = countToPosition(0);
    context.font = '11px ' + morpheus.CanvasUtil.FONT_NAME;
    if (this.name != null) {
      context.textBaseline = 'top';
      context.fillText(this.name, 0, 0);
      context.translate(0, 14);
    }
    context.lineWidth = 0.2;
    context.strokeStyle = '#D3D2C2';
    context.fillStyle = '#D3D2C2'; //'#d9d9d9';
    context.translate(25, 0);
    context.beginPath();
    context.moveTo(0, y0);
    context.lineTo(canvasWidth, y0);
    context.stroke();
    for (var i = 0, numberOfBins = binNumberToOccurences.length; i < numberOfBins; i++) {
      var count = binNumberToOccurences[i];
      if (count > 0) {
        count /= this.total;
        var start = min + (i * binSize);
        var end = start + binSize;
        var x = valueToPosition(start);
        var width = valueToPosition(end) - x;
        var y = countToPosition(count);
        context.fillRect(x, y0, width, y - y0);
      }
    }

    var q25 = valueToPosition(this.q25);
    var q75 = valueToPosition(this.q75);
    var median = valueToPosition(this.median);
    var lav = valueToPosition(this.lowerAdjacentValue);
    var uav = valueToPosition(this.upperAdjacentValue);
    context.translate(0, histogramHeight + 1);
    context.fillStyle = 'black';
    //'#43a2ca';
    var boxPlotHeight = 8;
    context.fillRect(q25, 0, q75 - q25, boxPlotHeight);

    context.fillRect(lav, boxPlotHeight / 2 - 1, q25 - lav, 2);

    context.fillRect(q75, boxPlotHeight / 2 - 1, uav - q75, 2);

    context.fillStyle = 'white';
    context.fillRect(median - 1, 0.5, 2, boxPlotHeight - 0.5);

    context.translate(0, boxPlotHeight + 1);
    morpheus.HeatMapColorSchemeLegend.drawColorScheme(context,
      this.colorScheme, canvasWidth, false, false, 6);
  }

}
;

morpheus.Util.extend(morpheus.HistogramLegend, morpheus.AbstractCanvas);

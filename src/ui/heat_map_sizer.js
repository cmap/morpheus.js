morpheus.HeatMapSizer = function () {
  this.seriesName = null;
  this.sizeByScale = d3.scale.linear().domain([this.min, this.max])
  .range([0, 1]).clamp(true);
};
morpheus.HeatMapSizer.prototype = {
  min: 0,
  max: 1,
  copy: function () {
    var sizer = new morpheus.HeatMapSizer();
    sizer.seriesName = this.seriesName;
    sizer.min = this.min;
    sizer.max = this.max;
    sizer.sizeByScale = this.sizeByScale.copy();
    return sizer;
  },
  valueToFraction: function (value) {
    return this.sizeByScale(value);
  },
  setMin: function (min) {
    this.min = min;
    this.sizeByScale = d3.scale.linear().domain([this.min, this.max])
    .range([0, 1]).clamp(true);
  },
  setMax: function (max) {
    this.max = max;
    this.sizeByScale = d3.scale.linear().domain([this.min, this.max])
    .range([0, 1]).clamp(true);
  },
  getMin: function () {
    return this.min;
  },
  getMax: function () {
    return this.max;
  },
  getSeriesName: function () {
    return this.seriesName;
  },
  setSeriesName: function (name) {
    this.seriesName = name;
  }
};

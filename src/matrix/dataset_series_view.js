morpheus.DatasetSeriesView = function (dataset, seriesIndices) {
  morpheus.DatasetAdapter.call(this, dataset);
  this.seriesIndices = seriesIndices;
};
morpheus.DatasetSeriesView.prototype = {
  getValue: function (i, j, seriesIndex) {
    seriesIndex = seriesIndex || 0;
    return this.dataset.getValue(i, j, this.seriesIndices[seriesIndex]);
  },
  setValue: function (i, j, value, seriesIndex) {
    seriesIndex = seriesIndex || 0;
    this.dataset.setValue(i, j, value, this.seriesIndices[seriesIndex]);
  },
  getName: function (seriesIndex) {
    seriesIndex = seriesIndex || 0;
    return this.dataset.getName(this.seriesIndices[seriesIndex]);
  },
  setName: function (seriesIndex, name) {
    seriesIndex = seriesIndex || 0;
    this.dataset.setName(this.seriesIndices[seriesIndex], name);
  },
  addSeries: function (options) {
    var index = this.dataset.addSeries(options);
    this.seriesIndices.push(index);
    return index;
  },
  getSeriesCount: function () {
    return this.seriesIndices.length;
  },
  toString: function () {
    return this.getName();
  }
};
morpheus.Util.extend(morpheus.DatasetSeriesView, morpheus.DatasetAdapter);

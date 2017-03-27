morpheus.DatasetColumnView = function (dataset) {
  this.dataset = dataset;
  this.columnIndex = 0;
  this.seriesIndex = 0;
};
morpheus.DatasetColumnView.prototype = {
  columnIndex: -1,
  size: function () {
    return this.dataset.getRowCount();
  },
  getValue: function (rowIndex) {
    return this.dataset.getValue(rowIndex, this.columnIndex,
      this.seriesIndex);
  },
  setIndex: function (newColumnIndex) {
    this.columnIndex = newColumnIndex;
    return this;
  },
  setSeriesIndex: function (seriesIndex) {
    this.seriesIndex = seriesIndex;
    return this;
  }
};

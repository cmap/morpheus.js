morpheus.DatasetRowView = function (dataset) {
    this.dataset = dataset;
    this.index = 0;
    this.seriesIndex = 0;
};
morpheus.DatasetRowView.prototype = {
    size: function () {
        return this.dataset.getColumnCount();
    },
    getIndex: function () {
        return this.index;
    },
    getValue: function (columnIndex) {
        return this.dataset.getValue(this.index, columnIndex, this.seriesIndex);
    },
    setIndex: function (newRowIndex) {
        this.index = newRowIndex;
        return this;
    },
    setSeriesIndex: function (seriesIndex) {
        this.seriesIndex = seriesIndex;
        return this;
    },
    setDataset: function (dataset) {
        this.dataset = dataset;
        return this;
    }
};

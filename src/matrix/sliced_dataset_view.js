morpheus.SlicedDatasetView = function (dataset, rowIndices, columnIndices) {
  morpheus.DatasetAdapter.call(this, dataset);
  if (rowIndices == null) {
    rowIndices = null;
  }
  if (columnIndices == null) {
    columnIndices = null;
  }
  this.rowIndices = rowIndices;
  this.columnIndices = columnIndices;
  //morpheus.DatasetUtil.toESSessionPromise(this);
};
morpheus.SlicedDatasetView.prototype = {
	setESSession : function (session) {
		//console.log("morpheus.SlicedDatasetView.prototype.setESSession ::", this, session);
		this.dataset.setESSession(session);
	},
	getESSession : function() {
		//console.log("morpheus.SlicedDatasetView.prototype.getESSession ::", this);
		return this.dataset.getESSession();
	},
    getRowCount: function () {
        return this.rowIndices !== null ? this.rowIndices.length : this.dataset
            .getRowCount();
    },
    getColumnCount: function () {
        return this.columnIndices !== null ? this.columnIndices.length
            : this.dataset.getColumnCount();
    },
    getValue: function (i, j, seriesIndex) {
        return this.dataset.getValue(
            this.rowIndices !== null ? this.rowIndices[i] : i,
            this.columnIndices !== null ? this.columnIndices[j] : j,
            seriesIndex);
    },
    setValue: function (i, j, value, seriesIndex) {
        this.dataset.setValue(
            this.rowIndices !== null ? this.rowIndices[i] : i,
            this.columnIndices !== null ? this.columnIndices[j] : j, value,
            seriesIndex);
    },
    getRowMetadata: function () {
        return this.rowIndices !== null ? new morpheus.MetadataModelItemView(
            this.dataset.getRowMetadata(), this.rowIndices) : this.dataset
            .getRowMetadata();
    },
    getColumnMetadata: function () {
        return this.columnIndices !== null ? new morpheus.MetadataModelItemView(
            this.dataset.getColumnMetadata(), this.columnIndices)
            : this.dataset.getColumnMetadata();
    },
    toString: function () {
        return this.getName();
    }
};
morpheus.Util.extend(morpheus.SlicedDatasetView, morpheus.DatasetAdapter);

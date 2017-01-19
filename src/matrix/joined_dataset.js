/**
 * Adds rows in dataset2 to dataset1
 */
morpheus.JoinedDataset = function (dataset1, dataset2, dataset1Field,
                                   dataset2Field, sourceFieldName) {
  sourceFieldName = sourceFieldName || 'Source';
  this.dataset1Field = dataset1Field;
  this.dataset2Field = dataset2Field;
  if (dataset1 == null) {
    throw 'dataset1 is null';
  }
  if (dataset2 == null) {
    throw 'dataset2 is null';
  }
  if (dataset1Field) { // reorder dataset 2 to match dataset 1
    var v1 = dataset1.getColumnMetadata().getByName(dataset1Field);
    var dataset2ValueToIndex = morpheus.VectorUtil
    .createValueToIndexMap(dataset2.getColumnMetadata().getByName(
      dataset2Field));
    var dataset2ColumnIndices = [];
    for (var i = 0; i < v1.size(); i++) {
      dataset2ColumnIndices[i] = dataset2ValueToIndex.get(v1.getValue(i));
      // undefined indices are handles in SlicedDatasetWithNulls
    }
    dataset2 = new morpheus.SlicedDatasetWithNulls(dataset2,
      dataset2ColumnIndices, dataset1.getColumnCount(), dataset1
      .getColumnMetadata());
  }

  if (!dataset1.getRowMetadata().getByName(sourceFieldName)) {
    var sourceVector = dataset1.getRowMetadata().add(sourceFieldName);
    var name = dataset1.getName();
    for (var i = 0, nrows = sourceVector.size(); i < nrows; i++) {
      sourceVector.setValue(i, name);
    }
  }
  if (!dataset2.getRowMetadata().getByName(sourceFieldName)) {
    var sourceVector = dataset2.getRowMetadata().add(sourceFieldName);
    var name = dataset2.getName();
    for (var i = 0, nrows = sourceVector.size(); i < nrows; i++) {
      sourceVector.setValue(i, name);
    }

  }

  // make sure dataset1 and dataset2 have the same row metadata fields in the
  // same order
  for (var i = 0, count = dataset1.getRowMetadata().getMetadataCount(); i < count; i++) {
    var name = dataset1.getRowMetadata().get(i).getName();
    if (dataset2.getRowMetadata().getByName(name) == null) {
      dataset2.getRowMetadata().add(name);
    }
  }
  for (var i = 0, count = dataset2.getRowMetadata().getMetadataCount(); i < count; i++) {
    var name = dataset2.getRowMetadata().get(i).getName();
    if (dataset1.getRowMetadata().getByName(name) == null) {
      dataset1.getRowMetadata().add(name);
    }
  }

  // put dataset2 row metadata names in same order as dataset1
  var dataset2RowMetadataOrder = [];
  var metadataInDifferentOrder = false;
  for (var i = 0, count = dataset1.getRowMetadata().getMetadataCount(); i < count; i++) {
    var name = dataset1.getRowMetadata().get(i).getName();
    var index = morpheus.MetadataUtil.indexOf(dataset2.getRowMetadata(),
      name);
    dataset2RowMetadataOrder.push(index);
    if (index !== i) {
      metadataInDifferentOrder = true;
    }
  }
  this.dataset1 = dataset1;
  this.dataset2 = dataset2;
  // TODO put series in same order
  var maxSeriesCount = Math.max(this.dataset1.getSeriesCount(), this.dataset2
  .getSeriesCount());
  for (var i = this.dataset1.getSeriesCount(); i < maxSeriesCount; i++) {
    this.dataset1.addSeries({
      name: this.dataset2.getName(i)
    });
  }
  for (var i = this.dataset2.getSeriesCount(); i < maxSeriesCount; i++) {
    this.dataset2.addSeries({
      name: this.dataset1.getName(i)
    });
  }

  this.rowMetadata = new morpheus.JoinedMetadataModel(this.dataset1
  .getRowMetadata(), !metadataInDifferentOrder ? this.dataset2
    .getRowMetadata() : new morpheus.MetadataModelColumnView(
      this.dataset2.getRowMetadata(), dataset2RowMetadataOrder));
};
morpheus.JoinedDataset.prototype = {
  getName: function (seriesIndex) {
    return this.dataset1.getName(seriesIndex);
  },
  setName: function (seriesIndex, name) {
    this.dataset1.setName(seriesIndex, name);
  },
  getDataType: function (seriesIndex) {
    return this.dataset1.getDataType(seriesIndex);
  },
  getDatasets: function () {
    return [this.dataset1, this.dataset2];
  },
  getDataset1: function () {
    return this.dataset1;
  },
  getRowMetadata: function () {
    return this.rowMetadata;
  },
  getColumnMetadata: function () {
    return this.dataset1.getColumnMetadata();
  },
  getRowCount: function () {
    return this.dataset1.getRowCount() + this.dataset2.getRowCount();
  },
  getColumnCount: function () {
    return this.dataset1.getColumnCount();
  },
  getValue: function (i, j, seriesIndex) {
    return i < this.dataset1.getRowCount() ? this.dataset1.getValue(i, j,
        seriesIndex) : this.dataset2.getValue(i
        - this.dataset1.getRowCount(), j, seriesIndex);
  },
  setValue: function (i, j, value, seriesIndex) {
    i < this.dataset1.getRowCount() ? this.dataset1.setValue(i, j, value,
        seriesIndex) : this.dataset2.setValue(i
        - this.dataset1.getRowCount(), j, value, seriesIndex);
  },
  getSeriesCount: function () {
    return this.dataset1.getSeriesCount();
  },
  addSeries: function (options) {
    this.dataset1.addSeries(options);
    return this.dataset2.addSeries(options);
  },
  removeSeries: function (seriesIndex) {
    this.dataset1.removeSeries(seriesIndex);
    this.dataset2.removeSeries(seriesIndex);
  },
  toString: function () {
    return this.getName();
  }
};
morpheus.SlicedDatasetWithNulls = function (dataset, columnIndices, columnCount,
                                            columnMetadata) {
  morpheus.DatasetAdapter.call(this, dataset);
  this.columnIndices = columnIndices;
  this.columnCount = columnCount;
  this.columnMetadata = columnMetadata;
};
morpheus.SlicedDatasetWithNulls.prototype = {
  getColumnMetadata: function () {
    return this.columnMetadata;
  },
  getColumnCount: function () {
    return this.columnCount;
  },
  getValue: function (i, j, seriesIndex) {
    var index = this.columnIndices[j];
    return index === undefined ? undefined : this.dataset.getValue(i,
        index, seriesIndex);
  },
  setValue: function (i, j, value, seriesIndex) {
    var index = this.columnIndices[j];
    if (index !== undefined) {
      this.dataset.setValue(i, index, value, seriesIndex);
    } else {
      console.log(j + ' out of range');
    }
  }
};
morpheus.Util.extend(morpheus.SlicedDatasetWithNulls, morpheus.DatasetAdapter);
morpheus.JoinedVector = function (v1, v2) {
  this.v1 = v1;
  this.v2 = v2;
  morpheus.VectorAdapter.call(this, v1);
  this.properties = new morpheus.Map();
};
morpheus.JoinedVector.prototype = {
  setValue: function (i, value) {
    i < this.v1.size() ? this.v1.setValue(i, value) : this.v2.setValue(i
        - this.v1.size(), value);
  },
  getValue: function (i) {
    return i < this.v1.size() ? this.v1.getValue(i) : this.v2.getValue(i
        - this.v1.size());
  },
  size: function () {
    return this.v1.size() + this.v2.size();
  },
  getProperties: function () {
    return this.properties;
  }
};
morpheus.Util.extend(morpheus.JoinedVector, morpheus.VectorAdapter);
morpheus.JoinedMetadataModel = function (m1, m2) {
  this.m1 = m1;
  this.m2 = m2;
  this.vectors = [];
  for (var i = 0, count = m1.getMetadataCount(); i < count; i++) {
    var v1 = this.m1.get(i);
    var v2 = this.m2.get(i);
    var v = new morpheus.JoinedVector(v1, v2);
    // copy properties
    v1.getProperties().forEach(function (val, key) {
      if (!morpheus.VectorKeys.COPY_IGNORE.has(key)) {
        v.properties.set(key, val);
      }
    });
    v2.getProperties().forEach(function (val, key) {
      if (!morpheus.VectorKeys.COPY_IGNORE.has(key)) {
        v.properties.set(key, val);
      }
    });

    this.vectors.push(v);
  }
};
morpheus.JoinedMetadataModel.prototype = {
  add: function (name) {
    var index = morpheus.MetadataUtil.indexOf(this, name);
    var oldVector;
    if (index !== -1) {
      oldVector = this.remove(index);
    }
    var v = new morpheus.Vector(name, this.getItemCount());
    if (oldVector != null) {
      // copy properties
      oldVector.getProperties().forEach(function (val, key) {
        v.getProperties().set(key, val);
      });
      // copy values
      for (var i = 0, size = oldVector.size(); i < size; i++) {
        v.setValue(i, oldVector.getValue(i));
      }
    }
    this.vectors.push(v);
    return v;
  },
  getItemCount: function () {
    return this.m1.getItemCount() + this.m2.getItemCount();
  },
  get: function (index) {
    return this.vectors[index];
  },
  remove: function (index) {
    return this.vectors.splice(index, 1)[0];
  },
  getByName: function (name) {
    for (var i = 0, length = this.vectors.length; i < length; i++) {
      if (name === this.vectors[i].getName()) {
        return this.vectors[i];
      }
    }
  },
  getMetadataCount: function () {
    return this.vectors.length;
  }
};

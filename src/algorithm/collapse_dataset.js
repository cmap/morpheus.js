morpheus.CollapseDataset = function (dataset, collapseToFields,
                                     summarizeFunction, shallowCopy) {
  var vectors = [];
  for (var i = 0; i < collapseToFields.length; i++) {
    var v = dataset.getRowMetadata().getByName(collapseToFields[i]);
    if (!v) {
      throw collapseToFields[i]
      + ' not found. Available fields are '
      + morpheus.MetadataUtil.getMetadataNames(dataset
      .getRowMetadata());
    }
    vectors.push(v);
  }
  var idToIndices = morpheus.VectorUtil.createValuesToIndicesMap(vectors);
  var collapsedDataset = new morpheus.Dataset({
    name: dataset.getName(),
    rows: idToIndices.size(),
    columns: dataset.getColumnCount(),
    dataType: 'Float32'
  });
  var nseries = dataset.getSeriesCount();
  for (var series = 1; series < nseries; series++) {
    collapsedDataset.addSeries({
      name: dataset.getName(i),
      dataType: 'Float32'
    });
  }
  if (shallowCopy) {
    collapsedDataset.setColumnMetadata(dataset.getColumnMetadata());
  } else {
    morpheus.MetadataUtil.copy(dataset.getColumnMetadata(),
      collapsedDataset.getColumnMetadata());
  }
  var nfields = collapseToFields.length;
  var collapseToVectors = [];
  for (var i = 0; i < nfields; i++) {
    collapseToVectors.push(collapsedDataset.getRowMetadata().add(
      collapseToFields[i]));
  }
  var counter = 0;
  idToIndices
  .forEach(function (rowIndices, key) {
    // collapse each column separately
    var slice = morpheus.DatasetUtil.slicedView(dataset,
      rowIndices, null);
    var view = new morpheus.DatasetColumnView(slice);
    for (var series = 0; series < nseries; series++) {
      view.setSeriesIndex(series);
      for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
        view.setIndex(j);
        collapsedDataset.setValue(counter, j,
          summarizeFunction(view), series);
      }
    }
    for (var i = 0; i < nfields; i++) {
      var collapsedToVector = collapseToVectors[i];
      var vector = vectors[i];
      collapsedToVector.setValue(counter, vector
      .getValue(rowIndices[0]));
    }
    counter++;
  });
  if (nfields === 1) {
    var newVector = collapseToVectors[0];
    vectors[0].getProperties().forEach(function (val, key) {
      if (!morpheus.VectorKeys.COPY_IGNORE.has(key)) {
        newVector.properties.set(key, val);
      }
    });
  }
  return collapsedDataset;
};


morpheus.SelectRow = function (dataset, collapseToFields,
                                summarizeFunction, shallowCopy) {
  var vectors = [];
  var nfields = collapseToFields.length;

  for (var i = 0; i < nfields; i++) {
    var v = dataset.getRowMetadata().getByName(collapseToFields[i]);
    if (!v) {
      throw collapseToFields[i]
      + ' not found. Available fields are '
      + morpheus.MetadataUtil.getMetadataNames(dataset
        .getRowMetadata());
    }
    vectors.push(v);
  }

  var idToIndices = morpheus.VectorUtil.createValuesToIndicesMap(vectors);

  var collapsedDataset = new morpheus.Dataset({
    name: dataset.getName(),
    rows: idToIndices.size(),
    columns: dataset.getColumnCount(),
    dataType: 'Float32'
  });


  var nseries = dataset.getSeriesCount();
  for (var series = 1; series < nseries; series++) {
    collapsedDataset.addSeries({
      name: dataset.getName(i),
      dataType: 'Float32'
    });
  }
  if (shallowCopy) {
    collapsedDataset.setColumnMetadata(dataset.getColumnMetadata());
  } else {
    morpheus.MetadataUtil.copy(dataset.getColumnMetadata(),
      collapsedDataset.getColumnMetadata());
  }

  var names = morpheus.MetadataUtil.getMetadataNames(dataset.getRowMetadata());
  var collapseToVectors = [];
  var allvectors = [];
  for (var i = 0; i < names.length; i++) {
    var v = dataset.getRowMetadata().getByName(names[i]);
    collapseToVectors.push(collapsedDataset.getRowMetadata().add(names[i]));
    allvectors.push(v);
  }

  var counter = 0;

  idToIndices
    .forEach(function (rowIndices, key) {
      var slice = morpheus.DatasetUtil.slicedView(dataset,
        rowIndices, null);
      var view = new morpheus.DatasetRowView(slice);
      var indexInDataset;
      for (var series = 0; series < nseries; series++) {
        view.setSeriesIndex(series);
        var chosenIndex = summarizeFunction(view).index;
        view.setIndex(chosenIndex);
        indexInDataset = view.dataset.rowIndices[chosenIndex];

        for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
          collapsedDataset.setValue(counter, j,
            view.getValue(j), series);
        }
      }
      for (var i = 0; i < names.length; i++) {
        var collapsedToVector = collapseToVectors[i];
        var vector = allvectors[i];
        collapsedToVector.setValue(counter, vector
          .getValue(indexInDataset));
      }
      counter++;
    });
  return collapsedDataset;
};

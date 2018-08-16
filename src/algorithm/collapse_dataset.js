morpheus.CollapseDataset = function (dataset, collapseToFields,
                                     summarizeFunction, shallowCopy, filterFunction) {
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
  // var nseries = dataset.getSeriesCount();
  // for (var series = 1; series < nseries; series++) {
  //   collapsedDataset.addSeries({
  //     name: dataset.getName(i),
  //     dataType: 'Float32'
  //   });
  // }
  var percentPassedSeriesIndex;
  if (filterFunction != null) {
    percentPassedSeriesIndex = collapsedDataset.addSeries({name: 'percent'});
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
      var slice = new morpheus.SlicedDatasetView(dataset,
        rowIndices, null);
      var view = new morpheus.DatasetColumnView(slice);
      // for (var series = 0; series < nseries; series++) {
      //   view.setSeriesIndex(series);
      for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
        view.setIndex(j);
        if (filterFunction != null) {
          var npass = 0;
          for (var i = 0, size = view.size(); i < size; i++) {
            if (filterFunction(view.getValue(i))) {
              npass++;
            }
          }
          collapsedDataset.setValue(counter, j, (npass / view.size()) * 100, percentPassedSeriesIndex);
        }
        collapsedDataset.setValue(counter, j, summarizeFunction(view));

      }
      // }
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

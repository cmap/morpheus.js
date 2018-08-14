jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 50; // 50 seconds
describe('nearest_neighbors_test', function () {
  it('all_aml', function (done) {
    var dataset;
    var referenceDataset;
    var promises = [];
    promises.push(morpheus.DatasetUtil.read('test_files/all_aml_train.gct').then(function (d) {
      dataset = d;
    }));

    promises.push(morpheus.DatasetUtil.read('test_files/aml_aml_train_nearest_neighbors_D50692_at.gct').then(function (d) {
      referenceDataset = d;
    }));
    Promise.all(promises).then(function () {
      var project = new morpheus.Project(dataset);
      var set = new morpheus.Set();
      set.add(morpheus.VectorUtil.createValueToIndexMap(dataset.getRowMetadata().getByName('id')).get('D50692_at'));
      project.getRowSelectionModel().setViewIndices(set, true);
      new morpheus.NearestNeighbors().execute({
        project: project,
        input: {
          name: 'test',
          background: false,
          permutations: 1000,
          number_of_markers: 0,
          compute_nearest_neighbors_of: 'selected rows',
          metric: morpheus.Pearson.toString()
        }
      });
      // compare metadata fields
      var vector = dataset.getRowMetadata().getByName('p_value');
      var referenceVector = referenceDataset.getRowMetadata().getByName('p-value');
      for (var i = 0, size = vector.size(); i < size; i++) {
        expect(vector.getValue(i)).toBeCloseTo(referenceVector.getValue(i), 0.001);
      }

      var vector = dataset.getRowMetadata().getByName('FDR(BH)');
      var referenceVector = referenceDataset.getRowMetadata().getByName('FDR(BH)');
      for (var i = 0, size = vector.size(); i < size; i++) {
        expect(vector.getValue(i)).toBeCloseTo(referenceVector.getValue(i), 0.001);
      }

      var vector = dataset.getRowMetadata().getByName('Pearson correlation');
      var referenceVector = referenceDataset.getRowMetadata().getByName('Pearson correlation');
      for (var i = 0, size = vector.size(); i < size; i++) {
        expect(vector.getValue(i)).toBeCloseTo(referenceVector.getValue(i), 0.001);
      }
      done();
    });
  });
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 50; // 50 seconds
describe('marker_selection_test', function () {
  it('all_aml', function (done) {
    var dataset;
    var referenceDataset;
    var promises = [];
    promises.push(morpheus.DatasetUtil.read('test_files/all_aml_train.gct').done(function (d) {
      dataset = d;
    }));

    promises.push(morpheus.DatasetUtil.read('test_files/aml_aml_train_marker_selection.gct').done(function (d) {
      referenceDataset = d;
    }));
    Promise.all(promises).then(function () {
      var project = new morpheus.Project(dataset);

      new morpheus.MarkerSelection().execute({
        project: project,
        input: {
          background: false,
          permutations: 1000,
          number_of_markers: 0,
          field: 'id',
          metric: morpheus.SignalToNoise.toString(),
          class_a: ['AML_12', 'AML_13', 'AML_14', 'AML_16', 'AML_20', 'AML_1', 'AML_2', 'AML_3', 'AML_5', 'AML_6', 'AML_7'],
          class_b: ['ALL_19769_B-cell', 'ALL_23953_B-cell', 'ALL_28373_B-cell', 'ALL_9335_B-cell', 'ALL_9692_B-cell', 'ALL_14749_B-cell', 'ALL_17281_B-cell', 'ALL_19183_B-cell', 'ALL_20414_B-cell', 'ALL_21302_B-cell', 'ALL_549_B-cell', 'ALL_17929_B-cell', 'ALL_20185_B-cell', 'ALL_11103_B-cell', 'ALL_18239_B-cell', 'ALL_5982_B-cell', 'ALL_7092_B-cell', 'ALL_R11_B-cell', 'ALL_R23_B-cell', 'ALL_16415_T-cell', 'ALL_19881_T-cell', 'ALL_9186_T-cell', 'ALL_9723_T-cell', 'ALL_17269_T-cell', 'ALL_14402_T-cell', 'ALL_17638_T-cell', 'ALL_22474_T-cell']
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

      var vector = dataset.getRowMetadata().getByName('Signal to noise');
      var referenceVector = referenceDataset.getRowMetadata().getByName('Signal to noise');
      for (var i = 0, size = vector.size(); i < size; i++) {
        expect(vector.getValue(i)).toBeCloseTo(referenceVector.getValue(i), 0.001);
      }
      done();
    });
  });
});

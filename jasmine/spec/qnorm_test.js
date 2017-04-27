describe('qnorm_test', function () {
  // tested against preprocessCore 1.12.0
  it('all_aml', function (done) {
    var dataset;
    var normalizedUsingRFunctionNormalizeQuantiles;
    var promises = [];
    promises.push(morpheus.DatasetUtil.read('test_files/all_aml_train.gct').done(function (d) {
      dataset = d;
    }));

    promises.push(morpheus.DatasetUtil.read('test_files/qnorm.gct').done(function (d) {
      normalizedUsingRFunctionNormalizeQuantiles = d;
    }));
    $.when.apply($, promises).done(function () {
      morpheus.QNorm.execute(dataset);
      expect(dataset).toBeDatasetValues(normalizedUsingRFunctionNormalizeQuantiles, 0.001);
      done();
    });
  });
});

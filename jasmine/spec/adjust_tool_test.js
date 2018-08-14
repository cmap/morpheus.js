describe('adjust_tool_test', function () {

  it('log_then_inverse_log', function (done) {
    var project = new morpheus.Project(
      new morpheus.Dataset({
        array: [[1, 2], [3, 4]],
        rows: 2,
        columns: 2
      }));
    var logHeatMap = new morpheus.AdjustDataTool().execute({
      project: project,
      input: {
        name: 'test',
        log_2: true
      }
    });
    logHeatMap.promise.then(function () {
      expect(logHeatMap.getProject().getFullDataset()).toBeDatasetValues(
        new morpheus.Dataset({
          array: [[0, 1], [1.584963, 2]],
          rows: 2,
          columns: 2
        }), 0.00001);
    }).then(function () {
      var inverseLogHeatMap = new morpheus.AdjustDataTool().execute({
        project: logHeatMap.getProject(),
        input: {
          name: 'test',
          inverse_log_2: true
        }
      });
      inverseLogHeatMap.promise.then(function () {
        expect(inverseLogHeatMap.getProject().getFullDataset()).toBeDatasetValues(
          new morpheus.Dataset({
            array: [[1, 2], [3, 4]],
            rows: 2,
            columns: 2
          }), 0.00001);
        done();
      });
    });


  });
  it('log', function (done) {
    var project = new morpheus.Project(
      new morpheus.Dataset({
        array: [[1, 2], [3, 4]],
        rows: 2,
        columns: 2
      })
    );

    var newHeatMap = new morpheus.AdjustDataTool().execute({
      project: project,
      input: {
        name: 'test',
        log_2: true
      }
    });
    newHeatMap.promise.then(function () {
      expect(newHeatMap.getProject().getFullDataset()).toBeDatasetValues(
        new morpheus.Dataset({
          array: [[0, 1], [1.584963, 2]],
          rows: 2,
          columns: 2
        }), 0.00001);
      done();
    });


  });
  it('z-score', function (done) {
    // v = (v-m)/u
    var project = new morpheus.Project(
      new morpheus.Dataset({
        array: [[1, 2, 10], [3, 4, 15]],
        rows: 2,
        columns: 3
      })
    );

    // var r_sd = [ 4.932883, 6.658328 ];
    // var r_mean = [ 4.333333, 7.333333 ];
    var newHeatMap = new morpheus.AdjustDataTool().execute({
      project: project,
      input: {
        name: 'test',
        'z-score': true
      }
    });
    newHeatMap.promise.then(function () {
      expect(newHeatMap.getProject().getFullDataset()).toBeDatasetValues(
        new morpheus.Dataset({
          array: [[-0.6757374, -0.4730162, 1.1487535],
            [-0.6508140, -0.5006262, 1.1514402]],
          rows: 2,
          columns: 3
        }), 0.00001);
      done();
    });

  });

  it('robust z-score', function (done) {
    // v = (v-m)/u
    var project = new morpheus.Project(
      new morpheus.Dataset({
        array: [[1, 2, 10], [3, 4, 15]],
        rows: 2,
        columns: 3
      })
    );

    // var r_mad = [ 1.4826, 1.4826 ];
    // var r_median = [ 2, 4];
    var newHeatMap = new morpheus.AdjustDataTool().execute({
      project: project,
      input: {
        name: 'test',
        'robust_z-score': true
      }
    });
    newHeatMap.promise.then(function () {
      expect(newHeatMap.getProject().getFullDataset()).toBeDatasetValues(
        new morpheus.Dataset({
          array: [[-0.6744908, 0.0000000, 5.3959261],
            [-0.6744908, 0.0000000, 7.4193984]],
          rows: 2,
          columns: 3
        }), 0.00001);
      done();
    });

  });

});

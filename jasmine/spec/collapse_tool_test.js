describe('collapse_tool_test', function () {
  it('mean',
    function (done) {
      var project = new morpheus.Project(
        new morpheus.Dataset({
          array: [[1, 2], [3, 4], [5, 6], [7, 8]],
          rows: 4,
          columns: 2
        })
      );

      project.getFullDataset().getRowMetadata()
        .add('id').array = ['a', 'b', 'a', 'a'];
      var newHeatMap = new morpheus.CollapseDatasetTool().execute({
        project: project,
        input: {
          name: 'test',
          collapse_method: 'Mean',
          collapse: 'Rows',
          collapse_to_fields: ['id']
        }
      });
      newHeatMap.promise.then(function () {
        expect(newHeatMap.getProject().getFullDataset())
          .toBeDatasetValues(new morpheus.Dataset({
            array: [[13 / 3, 16 / 3], [3, 4]],
            rows: 2,
            columns: 2
          }), 0.00001);
        done();

      });
    });

  it('median',
    function (done) {
      var project = new morpheus.Project(
        new morpheus.Dataset({
          array: [[1, 2], [3, 4], [5, 6], [7, 8]],
          rows: 4,
          columns: 2
        })
      );

      project.getFullDataset().getRowMetadata()
        .add('id').array = ['a', 'b', 'a', 'a'];
      var newHeatMap = new morpheus.CollapseDatasetTool().execute({
        project: project,
        input: {
          name: 'test',
          collapse_method: 'Percentile',
          collapse: 'Rows',
          percentile: '50',
          collapse_to_fields: ['id']
        }
      });
      newHeatMap.promise.then(function () {
        expect(newHeatMap.getProject().getFullDataset())
          .toBeDatasetValues(new morpheus.Dataset({
            array: [[5, 6], [3, 4]],
            rows: 2,
            columns: 2
          }), 0.00001);
        done();
      });


    });

});

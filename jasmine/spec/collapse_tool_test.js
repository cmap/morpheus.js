describe('collapse_tool_test', function () {
  it('maxmeanprobe',
    function () {
      var heatmap = new morpheus.HeatMap({
        dataset: new morpheus.Dataset({
          array: [[1, 3], [4, 6], [7, 9], [10, 12]],
          rows: 4,
          columns: 2
        })
      });
      heatmap.getProject().getFullDataset().getRowMetadata()
        .add('id').array = ['a', 'b', 'a', 'a'];
      var newHeatMap = new morpheus.CollapseDatasetTool().execute({
        heatMap: heatmap,
        project: heatmap.getProject(),
        input: {
          collapse_method: 'Maximum Mean Probe',
          collapse: 'Rows',
          collapse_to_fields: ['id']
        }
      });
      expect(newHeatMap.getProject().getFullDataset())
        .toBeDatasetValues(new morpheus.Dataset({
          array: [[10, 12], [4, 6]],
          rows: 2,
          columns: 2
        }), 0.00001);
    });
  it('maxmedianprobe',
    function () {
      var heatmap = new morpheus.HeatMap({
        dataset: new morpheus.Dataset({
          array: [[1, 3], [4, 6], [7, 9], [10, 12]],
          rows: 4,
          columns: 2
        })
      });
      heatmap.getProject().getFullDataset().getRowMetadata()
        .add('id').array = ['a', 'b', 'a', 'a'];
      var newHeatMap = new morpheus.CollapseDatasetTool().execute({
        heatMap: heatmap,
        project: heatmap.getProject(),
        input: {
          collapse_method: 'Maximum Median Probe',
          collapse: 'Rows',
          collapse_to_fields: ['id']
        }
      });
      expect(newHeatMap.getProject().getFullDataset())
        .toBeDatasetValues(new morpheus.Dataset({
          array: [[10, 12], [4, 6]],
          rows: 2,
          columns: 2
        }), 0.00001);
    });
  it('mean',
    function () {
      var heatmap = new morpheus.HeatMap({
        dataset: new morpheus.Dataset({
          array: [[1, 2], [3, 4], [5, 6], [7, 8]],
          rows: 4,
          columns: 2
        })
      });

      heatmap.getProject().getFullDataset().getRowMetadata()
      .add('id').array = ['a', 'b', 'a', 'a'];
      var newHeatMap = new morpheus.CollapseDatasetTool().execute({
        heatMap: heatmap,
        project: heatmap.getProject(),
        input: {
          collapse_method: 'Mean',
          collapse: 'Rows',
          collapse_to_fields: ['id']
        }
      });
      expect(newHeatMap.getProject().getFullDataset())
      .toBeDatasetValues(new morpheus.Dataset({
        array: [[13 / 3, 16 / 3], [3, 4]],
        rows: 2,
        columns: 2
      }), 0.00001);

    });
  it('median',
    function () {
      var heatmap = new morpheus.HeatMap({
        dataset: new morpheus.Dataset({
          array: [[1, 2], [3, 4], [5, 6], [7, 8]],
          rows: 4,
          columns: 2
        })
      });

      heatmap.getProject().getFullDataset().getRowMetadata()
      .add('id').array = ['a', 'b', 'a', 'a'];
      var newHeatMap = new morpheus.CollapseDatasetTool().execute({
        heatMap: heatmap,
        project: heatmap.getProject(),
        input: {
          collapse_method: 'Percentile',
          collapse: 'Rows',
          percentile: '50',
          collapse_to_fields: ['id']
        }
      });
      expect(newHeatMap.getProject().getFullDataset())
      .toBeDatasetValues(new morpheus.Dataset({
        array: [[5, 6], [3, 4]],
        rows: 2,
        columns: 2
      }), 0.00001);

    });

});

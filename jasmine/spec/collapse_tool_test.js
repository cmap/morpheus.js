describe("collapse_tool_test", function() {

	it("mean",
			function() {
				var heatmap = new morpheus.HeatMap({
					dataset : new morpheus.Dataset({
						array : [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ],
						rows : 3,
						columns : 2
					})
				});

				heatmap.getProject().getFullDataset().getRowMetadata()
						.add('id').array = [ 'a', 'b', 'a' ];
				new morpheus.CollapseDatasetTool().execute({
					controller : heatmap,
					project : heatmap.getProject(),
					input : {
						collapse_method : 'Mean',
						collapse : 'Rows',
						collapse_to_fields : [ 'id' ]
					}
				});
				expect(heatmap.getProject().getFullDataset())
						.toBeDatasetValues(new morpheus.Dataset({
							array : [ [ 3, 4 ], [ 3, 4 ] ],
							rows : 2,
							columns : 2
						}), 0.00001);

			});

});

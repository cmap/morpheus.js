describe("adjust_tool_test", function() {

	it("log", function() {
		var heatmap = new morpheus.HeatMap({
			dataset : new morpheus.Dataset({
				array : [ [ 1, 2 ], [ 3, 4 ] ],
				rows : 2,
				columns : 2
			})
		});

		new morpheus.AdjustDataTool().execute({
			controller : heatmap,
			project : heatmap.getProject(),
			input : {
				log_2 : true
			}
		});
		expect(heatmap.getProject().getFullDataset()).toBeDatasetValues(
				new morpheus.Dataset({
					array : [ [ 0, 1 ], [ 1.584963, 2 ] ],
					rows : 2,
					columns : 2
				}), 0.00001);

		new morpheus.AdjustDataTool().execute({
			controller : heatmap,
			project : heatmap.getProject(),
			input : {
				inverse_log_2 : true
			}
		});

		expect(heatmap.getProject().getFullDataset()).toBeDatasetValues(
				new morpheus.Dataset({
					array : [ [ 1, 2 ], [ 3, 4 ] ],
					rows : 2,
					columns : 2
				}), 0.00001);

	});
	it('z-score', function() {
		// v = (v-m)/u
		var heatmap = new morpheus.HeatMap({
			dataset : new morpheus.Dataset({
				array : [ [ 1, 2, 10 ], [ 3, 4, 15 ] ],
				rows : 2,
				columns : 3
			})
		});

		// var r_sd = [ 4.932883, 6.658328 ];
		// var r_mean = [ 4.333333, 7.333333 ];
		new morpheus.AdjustDataTool().execute({
			controller : heatmap,
			project : heatmap.getProject(),
			input : {
				'z-score' : true
			}
		});
		expect(heatmap.getProject().getFullDataset()).toBeDatasetValues(
				new morpheus.Dataset({
					array : [ [ -0.6757374, -0.4730162, 1.1487535 ],
							[ -0.6508140, -0.5006262, 1.1514402 ] ],
					rows : 2,
					columns : 3
				}), 0.00001);
	});

	it('robust z-score', function() {
		// v = (v-m)/u
		var heatmap = new morpheus.HeatMap({
			dataset : new morpheus.Dataset({
				array : [ [ 1, 2, 10 ], [ 3, 4, 15 ] ],
				rows : 2,
				columns : 3
			})
		});

		// var r_mad = [ 1.4826, 1.4826 ];
		// var r_median = [ 2, 4];
		new morpheus.AdjustDataTool().execute({
			controller : heatmap,
			project : heatmap.getProject(),
			input : {
				'robust_z-score' : true
			}
		});
		expect(heatmap.getProject().getFullDataset()).toBeDatasetValues(
				new morpheus.Dataset({
					array : [ [ -0.6744908, 0.0000000, 5.3959261 ],
							[ -0.6744908, 0.0000000, 7.4193984 ] ],
					rows : 2,
					columns : 3
				}), 0.00001);
	});

});

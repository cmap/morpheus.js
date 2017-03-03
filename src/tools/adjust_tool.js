morpheus.AdjustDataTool = function () {
};
morpheus.AdjustDataTool.prototype = {
    toString: function () {
        return 'Adjust';
    },
    gui: function () {
        // z-score, robust z-score, log2, inverse log2
        return [{
            name: 'log_2',
            type: 'checkbox'
        }, {
            name: 'inverse_log_2',
            type: 'checkbox'
        }, {
            name: 'z-score',
            type: 'checkbox',
            help: 'Subtract mean, divide by standard deviation'
        }, {
            name: 'robust_z-score',
            type: 'checkbox',
            help: 'Subtract median, divide by median absolute deviation'
        }, {
        	name: 'quantile_normalization',
			type: 'checkbox'
		}, {
            name: 'use_selected_rows_and_columns_only',
            type: 'checkbox'
        }];
    },
	execute: function (options) {
		var project = options.project;
		var controller = options.controller;

		if (options.input.log_2 || options.input.inverse_log_2
				|| options.input['z-score'] || options.input['robust_z-score']
				|| options.input['quantile_normalization']) {
			var selectedColumnIndices = project.getColumnSelectionModel()
					.getViewIndices();
			var selectedRowIndices = project.getRowSelectionModel()
					.getViewIndices();
			project.setFullDataset(morpheus.DatasetUtil.copy(project
					.getFullDataset()));
			project.getColumnSelectionModel().setViewIndices(
					selectedColumnIndices);
			project.getRowSelectionModel().setViewIndices(selectedRowIndices);
			// clone the values 1st
			var dataset = options.input.use_selected_rows_and_columns_only ? project
					.getSelectedDataset()
					: project.getSortedFilteredDataset();
			var rowView = new morpheus.DatasetRowView(dataset);
			var functions = [];
			var changed = false;
			if (options.input.log_2) {
				for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
					for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
						dataset.setValue(i, j, morpheus.Log2(dataset.getValue(
								i, j)));
					}
				}
				changed = true;
			}
			if (options.input.inverse_log_2) {
				for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
					for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
						var value = dataset.getValue(i, j);
						if (value >= 0) {
							dataset.setValue(i, j, Math.pow(2, value));
						}
					}
				}
                changed = true;
			}
			if (options.input['z-score']) {
				for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
					rowView.setIndex(i);
					var mean = morpheus.Mean(rowView);
					var stdev = Math.sqrt(morpheus.Variance(rowView));
					for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
						dataset.setValue(i, j, (dataset.getValue(i, j) - mean)
								/ stdev);
					}
				}
                changed = true;
			}
			if (options.input['robust_z-score']) {
				for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
					rowView.setIndex(i);
					var median = morpheus.Median(rowView);
					var mad = morpheus.MAD(rowView, median);
					for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
						dataset.setValue(i, j,
								(dataset.getValue(i, j) - median) / mad);
					}
				}
                changed = true;
			}
			if (changed) {
                morpheus.DatasetUtil.toESSessionPromise(project.getFullDataset());
            }
			if (options.input['quantile_normalization']) {
				var es = dataset.getESSession();
				es.then(function(session) {
					var args = {
						es : session
					};
					if (selectedRowIndices.size()) {
						args.rows = selectedRowIndices.values();
					}
					if (selectedColumnIndices.size()) {
						args.cols = selectedColumnIndices.values();
					}
					var req = ocpu.call('quantileNormalization', args, function(resSession) {
						resSession.getObject(function(success) {
							console.log("Quantile Normalization :: ", success);
							var r = new FileReader();
							var filePath = morpheus.Util.getFilePath(resSession, success);
							r.onload = function (e) {
								var contents = e.target.result;
								var ProtoBuf = dcodeIO.ProtoBuf;
								ProtoBuf.protoFromFile("./message.proto", function(error, success) {
                                    if (error) {
                                        alert(error);
                                        console.log("Quantile Normalization ::", "ProtoBuilder failed", error);
                                    }
                                    var builder = success,
										rexp = builder.build("rexp"),
										REXP = rexp.REXP,
										rclass = REXP.RClass;
                                    var res = REXP.decode(contents);
                                    var data = morpheus.Util.getRexpData(res, rclass).data;
                                    console.log(data);

                                    for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
                                        for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
                                            var value = data.values[i + j * data.dim[0]];
                                            dataset.setValue(i, j, value);

                                        }
                                    }
                                })
							};
                            morpheus.BlobFromPath.getFileObject(filePath, function (file) {
                                r.readAsArrayBuffer(file);
                            });
						});
						dataset.setESSession(new Promise(function(resolve, reject) {
							resolve(resSession);
						}));
					}, false, "::es");
					req.fail(function() {
						console.log(req.responseText);
					})
				})

			}
			project.trigger(morpheus.Project.Events.DATASET_CHANGED);
			project.getColumnSelectionModel().setViewIndices(
					selectedColumnIndices, true);
			project.getRowSelectionModel().setViewIndices(selectedRowIndices,
					true);
		}
	}
};
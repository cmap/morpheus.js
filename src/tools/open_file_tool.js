morpheus.OpenFileTool = function (options) {
	this.options = options || {};
};
morpheus.OpenFileTool.prototype = {
	toString: function () {
		return 'Open File';
	},
	gui: function () {
		var array = [{
			name: 'open_file_action',
			value: 'open',
			type: 'bootstrap-select',
			options: [{
				name: 'Annotate columns',
				value: 'Annotate Columns'
			}, {
				name: 'Annotate rows',
				value: 'Annotate Rows'
			}, {
				divider: true
			}, {
				name: 'Append rows to current dataset',
				value: 'append'
			}, {
				name: 'Append columns to current dataset',
				value: 'append columns'
			}, {
				name: 'Overlay onto current dataset',
				value: 'overlay'
			}, {
				name: 'Open dataset in new tab',
				value: 'open'
			}, {
				divider: true
			}, {
				name: 'Open dendrogram',
				value: 'Open dendrogram'
			}]
		}];
		if (this.options.file == null) {
			array.push({
				name: 'file',
				showLabel: false,
				placeholder: 'Open your own file',
				value: '',
				type: 'file',
				required: true,
				help: morpheus.DatasetUtil.DATASET_FILE_FORMATS
			});
		}
		array.options = {
			ok: this.options.file != null,
			size: 'modal-lg'
		};
		return array;
	},
	init: function (project, form, initOptions) {
		form.$form.find('[name=open_file_action]').on(
			'change',
			function (e) {
				var action = $(this).val();
				if (action === 'append columns' || action === 'append'
					|| action === 'open' || action === 'overlay') {
					form.setHelpText('file',
						morpheus.DatasetUtil.DATASET_FILE_FORMATS);
				} else if (action === 'Open dendrogram') {
					form.setHelpText('file',
						morpheus.DatasetUtil.DENDROGRAM_FILE_FORMATS);
				} else {
					form.setHelpText('file',
						morpheus.DatasetUtil.ANNOTATION_FILE_FORMATS);
				}
			});
		if (this.options.file == null) {
			$('<h4>Use your own file</h4>').insertAfter(
				form.$form.find('.form-group:first'));
			var _this = this;
			var id = _.uniqueId('morpheus');
			form.$form
			.append('<h4><a role="button" data-toggle="collapse" href="#'
				+ id
				+ '" aria-expanded="false" aria-controls="'
				+ id + '">Or select a preloaded dataset</a></h4>');
			var $sampleDatasets = $('<div class="collapse" id="' + id
				+ '" style="overflow:auto;"></div>');
			form.$form.append($sampleDatasets);
			var sampleDatasets = new morpheus.SampleDatasets({
				$el: $sampleDatasets,
				callback: function (heatMapOptions) {
					form.setValue('file', heatMapOptions.dataset);
					_this.ok();

				}
			});
		}
		form.on('change', function (e) {
			var value = e.value;
			if (value !== '' && value != null) {
				form.setValue('file', value);
				_this.ok();
			}
		});

	},

	execute: function (options) {
		var that = this;
		var isInteractive = this.options.file == null;
		if (!isInteractive) {
			options.input.file = this.options.file;
		}

		var project = options.project;
		if (options.input.open_file_action === 'append columns'
			|| options.input.open_file_action === 'append'
			|| options.input.open_file_action === 'open'
			|| options.input.open_file_action === 'overlay') {
			new morpheus.OpenDatasetTool().execute(options);
		} else if (options.input.open_file_action === 'Open dendrogram') {
			morpheus.HeatMap.showTool(new morpheus.OpenDendrogramTool(
				options.input.file), options.controller);
		} else { // annotate rows or columns
			var controller = options.controller;
			var isAnnotateColumns = options.input.open_file_action == 'Annotate Columns';
			var fileOrUrl = options.input.file;
			var dataset = project.getFullDataset();
			var fileName = morpheus.Util.getFileName(fileOrUrl);
			if (morpheus.Util.endsWith(fileName, '.cls')) {
				var result = morpheus.Util.readLines(fileOrUrl);
				result.done(function (lines) {
					that.annotateCls(controller, dataset, fileName,
						isAnnotateColumns, lines);
				});
			} else if (morpheus.Util.endsWith(fileName, '.gmt')) {
				morpheus.ArrayBufferReader.getArrayBuffer(fileOrUrl, function (err,
																			   buf) {
					if (err) {
						throw new Error('Unable to read ' + fileOrUrl);
					}
					var sets = new morpheus.GmtReader()
					.read(new morpheus.ArrayBufferReader(new Uint8Array(
						buf)));
					that.promptSets(dataset, controller, isAnnotateColumns,
						sets, morpheus.Util.getBaseFileName(morpheus.Util.getFileName(fileOrUrl)));
				});

			} else {
				var result = morpheus.Util.readLines(fileOrUrl);
				result.done(function (lines) {
					that.prompt(lines, dataset, controller, isAnnotateColumns);
				});

			}

		}
	},
	annotateCls: function (controller, dataset, fileName, isColumns, lines) {
		if (isColumns) {
			dataset = morpheus.DatasetUtil.transposedView(dataset);
		}
		var assignments = new morpheus.ClsReader().read(lines);
		if (assignments.length !== dataset.getRowCount()) {
			throw new Error(
				'Number of samples in cls file does not match dataset.');
		}
		var vector = dataset.getRowMetadata().add(
			morpheus.Util.getBaseFileName(fileName));
		for (var i = 0; i < assignments.length; i++) {
			vector.setValue(i, assignments[i]);
		}
		if (controller) {
			controller.getProject().trigger('trackChanged', {
				vectors: [vector],
				render: ['color'],
				columns: isColumns
			});
		}
	},

	annotateSets: function (dataset, isColumns, sets,
							datasetMetadataName, setSourceFileName) {
		if (isColumns) {
			dataset = morpheus.DatasetUtil.transposedView(dataset);
		}
		var vector = dataset.getRowMetadata().getByName(datasetMetadataName);
		var idToIndices = morpheus.VectorUtil.createValueToIndicesMap(vector);
		var setVector = dataset.getRowMetadata().add(setSourceFileName);
		sets.forEach(function (set) {
			var name = set.name;
			var members = set.ids;
			members.forEach(function (id) {
				var indices = idToIndices.get(id);
				if (indices !== undefined) {
					for (var i = 0, nIndices = indices.length; i < nIndices; i++) {
						var array = setVector.getValue(indices[i]);
						if (array === undefined) {
							array = [];
						}
						array.push(name);
						setVector.setValue(indices[i], array);
					}
				}
			});
		});
		return setVector;
	},
	/**
	 *
	 * @param lines
	 *            Lines of text in annotation file or null if a gmt file
	 * @param dataset
	 *            Current dataset
	 * @param isColumns
	 *            Whether annotating columns
	 * @param sets
	 *            Sets if a gmt file or null
	 * @param metadataName
	 *            The dataset metadata name to match on
	 * @param fileColumnName
	 *            The metadata file name to match on
	 * @param fileColumnNamesToInclude
	 *            An array of column names to include from the metadata file or
	 *            null to include all
	 */
	annotate: function (lines, dataset, isColumns, sets, metadataName,
						fileColumnName, fileColumnNamesToInclude) {
		if (isColumns) {
			dataset = morpheus.DatasetUtil.transposedView(dataset);
		}
		var vector = dataset.getRowMetadata().getByName(metadataName);
		if (!vector) {
			throw new Error('vector ' + metadataName + ' not found.');
		}
		var vectors = [];
		var idToIndices = morpheus.VectorUtil.createValueToIndicesMap(vector);
		if (!lines) {
			_
			.each(
				sets,
				function (set) {
					var name = set.name;
					var members = set.ids;

					var v = dataset.getRowMetadata().add(name);
					vectors.push(v);
					_
					.each(
						members,
						function (id) {
							var indices = idToIndices
							.get(id);
							if (indices !== undefined) {
								for (var i = 0, nIndices = indices.length; i < nIndices; i++) {
									v.setValue(
										indices[i],
										name);
								}
							}
						});
				});
		} else {
			var tab = /\t/;
			var header = lines[0].split(tab);
			var fileMatchOnColumnIndex = _.indexOf(header, fileColumnName);
			if (fileMatchOnColumnIndex === -1) {
				throw new Error(fileColumnName + ' not found in header:'
					+ header);
			}
			var columnIndices = [];
			var nheaders = header.length;
			for (var j = 0; j < header.length; j++) {
				var name = header[j];
				if (j === fileMatchOnColumnIndex) {
					continue;
				}
				if (fileColumnNamesToInclude
					&& _.indexOf(fileColumnNamesToInclude, name) === -1) {
					continue;
				}
				var v = dataset.getRowMetadata().getByName(name);
				if (!v) {
					v = dataset.getRowMetadata().add(name);
				}
				columnIndices.push(j);
				vectors.push(v);
			}
			var nheaders = columnIndices.length;
			for (var i = 1, nrows = lines.length; i < nrows; i++) {
				var line = lines[i].split(tab);
				var id = line[fileMatchOnColumnIndex];
				var indices = idToIndices.get(id);
				if (indices !== undefined) {
					var nIndices = indices.length;
					for (var j = 0; j < nheaders; j++) {
						var token = line[columnIndices[j]];
						var v = vectors[j];
						for (var r = 0; r < nIndices; r++) {
							v.setValue(indices[r], token);
						}
					}
				}
			}
		}
		for (var i = 0; i < vectors.length; i++) {
			morpheus.VectorUtil.maybeConvertStringToNumber(vectors[i]);
		}
		return vectors;
	},
	// prompt for metadata field name in dataset
	promptSets: function (dataset, controller, isColumns, sets, setSourceFileName) {
		var promptTool = {};
		var _this = this;
		promptTool.execute = function (options) {
			var metadataName = options.input.dataset_field_name;
			var vector = _this.annotateSets(dataset, isColumns, sets,
				metadataName, setSourceFileName);

			controller.getProject().trigger('trackChanged', {
				vectors: [vector],
				render: ['text'],
				columns: isColumns
			});
		};
		promptTool.toString = function () {
			return 'Select Fields To Match On';
		};
		promptTool.gui = function () {
			return [{
				name: 'dataset_field_name',
				options: morpheus.MetadataUtil
				.getMetadataNames(isColumns ? dataset
				.getColumnMetadata() : dataset.getRowMetadata()),
				type: 'select',
				required: true
			}];

		};
		morpheus.HeatMap.showTool(promptTool, controller);

	},
	prompt: function (lines, dataset, controller, isColumns) {
		var promptTool = {};
		var _this = this;
		var header = lines != null ? lines[0].split('\t') : null;
		promptTool.execute = function (options) {
			var metadataName = options.input.dataset_field_name;
			var fileColumnName = options.input.file_field_name;
			var vectors = _this.annotate(lines, dataset, isColumns, sets,
				metadataName, fileColumnName);

			var nameToIndex = new morpheus.Map();
			var render = [];
			for (var i = 0; i < vectors.length; i++) {
				render.push(isColumns ? 'color' : 'text');
				nameToIndex.set(vectors[i].getName(), i);
			}
			if (lines.colors) {
				var colorModel = isColumns ? controller.getProject().getColumnColorModel() : controller.getProject().getRowColorModel();
				lines.colors.forEach(function (item) {
					var index = nameToIndex.get(item.header);
					var vector = vectors[index];
					render[index] = 'color';
					colorModel.setMappedValue(vector, item.value, item.color);
				});
			}
			controller.getProject().trigger('trackChanged', {
				vectors: vectors,
				render: render,
				columns: isColumns
			});
		};
		promptTool.toString = function () {
			return 'Select Fields To Match On';
		};
		promptTool.gui = function () {
			var items = [{
				name: 'dataset_field_name',
				options: morpheus.MetadataUtil
				.getMetadataNames(isColumns ? dataset
				.getColumnMetadata() : dataset.getRowMetadata()),
				type: 'select',
				required: true
			}];
			if (lines) {
				items.push({
					name: 'file_field_name',
					type: 'select',
					options: _.map(header, function (item) {
						return {
							name: item,
							value: item
						};
					}),
					required: true
				});
			}
			return items;
		};
		morpheus.HeatMap.showTool(promptTool, controller);
	}
};

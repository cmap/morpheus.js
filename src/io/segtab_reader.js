morpheus.SegTabReader = function () {
	this.regions = null;
};
morpheus.SegTabReader.binByRegion = function (dataset, regions) {

	var chromosomeVector = dataset.getRowMetadata().getByName('Chromosome');
	var startVector = dataset.getRowMetadata().getByName('Start_bp');
	var endVector = dataset.getRowMetadata().getByName('End_bp');

	var collapsedDataset = new morpheus.Dataset({
		name: dataset.getName(),
		rows: regions.length,
		columns: dataset.getColumnCount(),
		dataType: 'Float32'
	});
	morpheus.DatasetUtil.fill(collapsedDataset, NaN);
	var regionIdVector = collapsedDataset.getRowMetadata().add('id');
	var newChromosomeVector = collapsedDataset.getRowMetadata().add(
		'chromosome');
	var newStartVector = collapsedDataset.getRowMetadata().add('start');
	var newEndVector = collapsedDataset.getRowMetadata().add('end');
	var nsegmentsVector = collapsedDataset.getRowMetadata().add('nsegments');
	var nseries = dataset.getSeriesCount();

	for (var series = 1; series < nseries; series++) {
		collapsedDataset.addSeries({
			name: dataset.getName(series),
			dataType: 'Float32'
		});

	}

	var summarizeFunction = morpheus.Mean;
	collapsedDataset.setColumnMetadata(dataset.getColumnMetadata());
	for (var regionIndex = 0; regionIndex < regions.length; regionIndex++) {
		var region = regions[regionIndex];
		var rowIndices = [];
		for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
			var chromosome = chromosomeVector.getValue(i);
			var start = startVector.getValue(i);
			var end = endVector.getValue(i);
			if (region.chromosome == chromosome && start >= region.start
				&& end <= region.end) {
				rowIndices.push(i);
			}
		}
		if (rowIndices.length > 0) {
			var slice = morpheus.DatasetUtil.slicedView(dataset, rowIndices,
				null);
			var columnView = new morpheus.DatasetColumnView(slice);
			for (var j = 0; j < dataset.getColumnCount(); j++) {
				columnView.setIndex(j);
				for (var series = 0; series < nseries; series++) {
					columnView.setSeriesIndex(series);
					collapsedDataset.setValue(regionIndex, j,
						summarizeFunction(columnView), series);
				}

			}
		}
		nsegmentsVector.setValue(regionIndex, rowIndices.length);
		regionIdVector.setValue(regionIndex, region.id);
		newChromosomeVector.setValue(regionIndex, region.chromosome);
		newStartVector.setValue(regionIndex, region.start);
		newEndVector.setValue(regionIndex, region.end);
	}
	return collapsedDataset;
};

morpheus.SegTabReader.prototype = {
	getFormatName: function () {
		return 'seg';
	},
	setRegions: function (regions) {
		this.regions = regions;
	},
	_read: function (datasetName, reader) {
		var tab = /\t/;
		var header = reader.readLine().split(tab);
		var fieldNameToIndex = {};
		for (var i = 0, length = header.length; i < length; i++) {
			var name = header[i].toLowerCase();
			fieldNameToIndex[name] = i;
		}

		var sampleField = morpheus.MafFileReader.getField(['pair_id',
			'Tumor_Sample_Barcode', 'tumor_name', 'Tumor_Sample_UUID',
			'Sample'], fieldNameToIndex, {
				remove: false,
				lc: true
			});
		var sampleColumnName = sampleField.name;
		var sampleIdColumnIndex = sampleField.index;
		var tumorFractionField = morpheus.MafFileReader.getField(['ccf_hat',
			'tumor_f', 'i_tumor_f'], fieldNameToIndex, {
				remove: false,
				lc: true
			});
		var ccfColumnName;
		var ccfColumnIndex;
		if (tumorFractionField !== undefined) {
			ccfColumnName = tumorFractionField.name;
			ccfColumnIndex = tumorFractionField.index;
		}
		var chromosomeColumn = fieldNameToIndex.Chromosome;
		var startPositionColumn = morpheus.MafFileReader.getField(['Start_bp',
			'Start'], fieldNameToIndex, {
				remove: false,
				lc: true
			}).index;
		var endPositionColumn = morpheus.MafFileReader.getField(['End_bp',
			'End'], fieldNameToIndex, {
				remove: false,
				lc: true
			}).index;
		var valueField = morpheus.MafFileReader.getField(['tau',
			'Segment_Mean'], fieldNameToIndex, {
				remove: false,
				lc: true
			}).index;

		var s;
		var matrix = [];
		var ccfMatrix = [];
		var sampleIdToIndex = new morpheus.Map();
		var chromosomeStartEndToIndex = new morpheus.Map();
		while ((s = reader.readLine()) !== null) {
			if (s === '') {
				continue;
			}
			var tokens = s.split(tab);
			var sample = String(tokens[sampleIdColumnIndex]);
			var columnIndex = sampleIdToIndex.get(sample);
			if (columnIndex === undefined) {
				columnIndex = sampleIdToIndex.size();
				sampleIdToIndex.set(sample, columnIndex);
			}
			var rowId = new morpheus.Identifier([
				String(tokens[chromosomeColumn]),
				String(tokens[startPositionColumn]),
				String(tokens[endPositionColumn])]);

			var rowIndex = chromosomeStartEndToIndex.get(rowId);
			if (rowIndex === undefined) {
				rowIndex = chromosomeStartEndToIndex.size();
				chromosomeStartEndToIndex.set(rowId, rowIndex);
			}
			var value = parseFloat(String(tokens[valueField]));
			value = isNaN(value) ? value : (morpheus.Log2(value) - 1);
			var matrixRow = matrix[rowIndex];
			if (matrixRow === undefined) {
				matrixRow = [];
				matrix[rowIndex] = matrixRow;
				if (ccfColumnIndex !== undefined) {
					ccfMatrix[rowIndex] = [];
				}
			}
			matrixRow[columnIndex] = value;
			if (ccfColumnIndex !== undefined) {
				ccfMatrix[rowIndex][columnIndex] = parseFloat(tokens[ccfColumnIndex]);
			}
		}
		var dataset = new morpheus.Dataset({
			name: datasetName,
			array: matrix,
			dataType: 'number',
			rows: chromosomeStartEndToIndex.size(),
			columns: sampleIdToIndex.size()
		});

		var columnIds = dataset.getColumnMetadata().add('id');
		sampleIdToIndex.forEach(function (index, id) {
			columnIds.setValue(index, id);
		});

		var chromosomeVector = dataset.getRowMetadata().add('Chromosome');
		var startVector = dataset.getRowMetadata().add('Start_bp');
		var endVector = dataset.getRowMetadata().add('End_bp');
		chromosomeStartEndToIndex.forEach(function (index, id) {
			chromosomeVector.setValue(index, id.getArray()[0]);
			startVector.setValue(index, id.getArray()[1]);
			endVector.setValue(index, id.getArray()[2]);
		});

		if (ccfColumnIndex !== undefined) {
			dataset.addSeries({
				dataType: 'number',
				name: 'ccf',
				array: ccfMatrix
			});
		}

		if (this.regions != null && this.regions.length > 0) {
			dataset = morpheus.SegTabReader.binByRegion(dataset, this.regions);
		}
		return dataset;
	},
	read: function (fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util
		.getFileName(fileOrUrl));
		morpheus.ArrayBufferReader.getArrayBuffer(fileOrUrl, function (err,
																	   arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				// try {
				callback(null, _this._read(name, new morpheus.ArrayBufferReader(
					new Uint8Array(arrayBuffer))));
				// } catch (err) {
				// callback(err);
				// }
			}
		});

	}
};

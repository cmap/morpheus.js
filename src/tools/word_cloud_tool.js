morpheus.WordCloudTool = function() {

};

/**
 * @param options
 * @param options.el
 *            Element to append svg to
 * @param options.width
 *            svg width
 * @param options.height
 *            svg height
 * @param options.words
 *            Array of words to draw
 * @param options.fontSizeScale
 *            scale for font size
 * @param options.fill
 *            Scale for font color
 * @param options.minSize
 *            min word size
 * @param options.maxSize
 *            max word size
 */
morpheus.WordCloudTool.draw = function(options) {
	var width = options.width;
	var height = options.height;
	var words = options.words;
	var maxSize = options.maxSize;
	var minSize = options.minSize;

	var fill = options.fill || d3.scale.category20b();

	var fontSizeScale = d3.scale.linear().range([ 12, 24 ]).domain(
			[ minSize, maxSize ]).clamp(true);
	var g = d3.select(options.el).append('svg').attr('width', width).attr(
			'height', height).append('g');
	g.attr('transform', 'translate(' + [ width / 2, height / 2 ] + ')');
	g.style('font-weight', '900');
	var angle = d3.scale.linear().domain([ 0, 0 ]).range([ 0, 0 ]).clamp(true);
	d3.layout.cloud().spiral('archimedean').size([ width, height ])
			.words(words).rotate(function() {
				return angle(~~(Math.random() * 5));
			}).fontSize(function(d) {
				return d.size;
			}).on('end', draw).start();
	function draw(words) {
		var text = g.selectAll('text').data(words).enter().append('text')
				.style('font-family', 'Impact').on(
						'mouseover',
						function(d) {
							d3.select(this).transition().style('font-size',
									2 * fontSizeScale(d.size) + 'px');
						}).on(
						'mouseout',
						function(d) {
							d3.select(this).transition().style('font-size',
									fontSizeScale(d.size) + 'px');
						}).on(
						'click',
						function(d) {
							options.heatMap.getToolbar().setSearchText(
								{
									isColumns : options.isColumns,
									text : d.text.indexOf(' ') ? ('"'
												+ d.text + '"') : d.text
								});

						}).style('fill', function(d, i) {
							return fill(i);
						}).attr('text-anchor', 'middle').attr(
						'transform',
						function(d) {
							return 'translate(' + [ d.x, d.y ] + ')rotate('
									+ d.rotate + ')';
						}).text(function(d) {
							return d.text;
						}).style('font-size', function(d) {
							return '1px';
						}).transition().duration(1000).style('font-size', function(d) {
							return fontSizeScale(d.size) + 'px';
						});

	}
};
morpheus.WordCloudTool.drawTable = function(options) {
	var width = options.width;
	var maxSize = options.maxSize;
	var minSize = options.minSize;
	var words = options.words;
	words.sort(function(a, b) {
		return (a.size === b.size ? 0 : (a.size < b.size ? 1 : -1));
	});
	var barHeight = 20;
	var height = words.length * barHeight;
	var scale = d3.scale.linear().domain([ minSize, maxSize ]).range([ 0, 50 ]);
	var g = d3.select(options.el).append('svg').attr('width', width).attr(
			'height', height).append('g');
	var sub = g.selectAll('text').data(words).enter().append('g').attr(
			'transform', function(d, i) {
				return 'translate(0,' + (barHeight + i * barHeight) + ')';
			}).on('click', function(d) {
				options.heatMap.getToolbar().setSearchText({
					isColumns : options.isColumns,
					text : d.text.indexOf(' ') ? ('"' + d.text + '"') : d.text
				});
			});

	sub.append('text').text(function(d) {
		return d.text;
	});
	sub.append('rect').style('fill', '#bdbdbd').attr('width', function(d) {
		return scale(d.size) + 'px';
	}).attr('height', function(d) {
		return '18px';
	}).attr('x', function(d) {
		return '300';
	}).attr('y', function(d) {
		return '-' + barHeight / 2 + 'px';
	});
	sub.append('title').text(
			function(d) {
				return d.text + ' p value: ' + morpheus.Util.nf(d.p)
						+ ', selected count: ' + d.count
						+ ' selected, total count: ' + d.fullCount;
			});

};
morpheus.WordCloudTool.prototype = {
	toString : function() {
		return 'Word Cloud';
	},
	init : function(project, form) {
		form.setOptions('field', morpheus.MetadataUtil.getMetadataNames(project
				.getFullDataset().getRowMetadata()));
		form.$form.find('[name=generate_word_cloud_for]').on(
				'change',
				function(e) {
					var val = $(this).val();
					form.setOptions('field',
							val === 'selected rows' ? morpheus.MetadataUtil
									.getMetadataNames(project.getFullDataset()
											.getRowMetadata())
									: morpheus.MetadataUtil
											.getMetadataNames(project
													.getFullDataset()
													.getColumnMetadata()));
				});

	},
	gui : function() {
		return [ {
			name : 'field',
			type : 'select'
		}, {
			name : 'generate_word_cloud_for',
			options : [ 'selected rows', 'selected columns' ],
			value : 'selected rows',
			type : 'radio'
		} ];
	},
	execute : function(options) {
		var project = options.project;
		var isColumns = options.input.generate_word_cloud_for == 'selected columns';
		var controller = options.controller;
		var field = options.input.field;
		var selectedDataset = project.getSortedFilteredDataset();
		var fullDataset = project.getFullDataset();
		if (isColumns) {
			selectedDataset = morpheus.DatasetUtil
					.transposedView(selectedDataset);
			fullDataset = morpheus.DatasetUtil.transposedView(fullDataset);
		}
		var selectedIndices = (isColumns ? project.getColumnSelectionModel()
				: project.getRowSelectionModel()).getViewIndices().values();
		if (selectedIndices.length === 0) {
			throw new Error('No ' + (isColumns ? 'columns' : 'rows')
					+ ' selected');
		}
		selectedDataset = new morpheus.SlicedDatasetView(selectedDataset,
				selectedIndices, null);
		var vector = selectedDataset.getRowMetadata().getByName(field);
		var valueToCount = morpheus.VectorUtil.createValueToCountMap(vector);
		var totalSelected = 0;
		valueToCount.forEach(function(count, value) {
			totalSelected += count;
		});
		var fullValueToCount = morpheus.VectorUtil
				.createValueToCountMap(fullDataset.getRowMetadata().getByName(
						field));
		var fullTotal = 0;
		fullValueToCount.forEach(function(count, value) {
			fullTotal += count;
		});
		var colorModel = isColumns ? project.getColumnColorModel() : project
				.getRowColorModel();

		var words = [];
		valueToCount.forEach(function(count, value) {
			var fullCount = fullValueToCount.get(value);
			var p = morpheus.FisherExact.fisherTest(count, totalSelected,
					fullCount, fullTotal);
			words.push({
				count : count,
				fullCount : fullCount,
				p : p,
				text : value,
				size : -morpheus.Log2(p)
			});
		});
		var maxSize = -Number.MAX_VALUE;
		var minSize = Number.MAX_VALUE;
		for (var i = 0, length = words.length; i < length; i++) {
			minSize = Math.min(minSize, words[i].size);
			maxSize = Math.max(maxSize, words[i].size);
		}
		var fill = function(value) {
			return colorModel.getMappedValue(vector, words[value].text);
		};
		var $dialog = $('<div style="background-color:white;" title="Word Cloud"></div>');

		var width = 960;
		var height = 600;
		$dialog.dialog({
			resizable : true,
			height : height + 30,
			width : width + 30
		});
		morpheus.WordCloudTool.draw({
			minSize : minSize,
			maxSize : maxSize,
			isColumns : isColumns,
			heatMap : controller,
			el : $dialog[0],
			width : width,
			height : height,
			words : words,
			fill : fill
		});
		morpheus.WordCloudTool.drawTable({
			minSize : minSize,
			maxSize : maxSize,
			isColumns : isColumns,
			heatMap : controller,
			el : $dialog[0],
			width : width,
			words : words
		});

	}
};
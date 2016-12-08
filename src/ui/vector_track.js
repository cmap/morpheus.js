morpheus.VectorTrack = function (project, name, positions, isColumns, heatmap) {
	morpheus.AbstractCanvas.call(this, true);
	this.preferredSize = {
		width: 0,
		height: 0
	};
	this.project = project;
	this.positions = positions;
	this.isColumns = isColumns;
	this.name = name;
	this.visible = true;
	this.heatmap = heatmap;

	// this.highlightColor = 'rgb(255,255,0)';
	this.id = _.uniqueId();
	var _this = this;
	this.updateSpanMapFunction = function () {
		_this.spanMap = morpheus.VectorUtil.createSpanMap(_this.getVector());
	};

	this.lastPosition = {
		start: -1,
		end: -1
	};
	// for molecule span
	this.events = 'rowSortOrderChanged rowFilterChanged datasetChanged';
	var isTruncated = function (index) {
		if (index !== -1) {
			var size = _this.positions.getItemSize(index);
			if (size < 6) {
				return true;
			}
			var vector = _this.getVector();
			var val = vector.getValue(index);
			if (val != null && val !== '') {
				var toString = morpheus.VectorTrack.vectorToString(vector);
				var fontSize = Math.min(24, _this.positions.getSize() - 2);
				var context = _this.canvas.getContext('2d');
				context.font = fontSize + 'px ' + morpheus.CanvasUtil.FONT_NAME;
				return context.measureText(toString(val)).width > this.textWidth;
			}
		}
	};
	var mouseMoved = function (event) {
		var index = -1;
		if (event.type !== 'mouseout') {
			var position = morpheus.CanvasUtil.getMousePosWithScroll(
				event.target, event, heatmap.scrollLeft(), heatmap
				.scrollTop());
			if (_this.settings.squished) {
				var total = positions.getPosition(positions.getLength() - 1)
					+ positions.getItemSize(positions.getLength() - 1);
				var squishFactor = total
					/ (isColumns ? _this.getUnscaledWidth() : _this
					.getUnscaledHeight());
				position[isColumns ? 'x' : 'y'] *= squishFactor;
			}
			index = !isColumns ? _this.positions.getIndex(position.y, false)
				: _this.positions.getIndex(position.x, false);

		}

		if (isColumns) {
			heatmap.setMousePosition(-1, index, {
				name: _this.name,
				event: event
			});
		} else {
			heatmap.setMousePosition(index, -1, {
				name: _this.name,
				event: event

			});
		}
	};

	$(this.canvas).on('contextmenu.morpheus', function (e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		heatmap.setSelectedTrack(_this.name, isColumns);
		_this.showPopup(e);
		return false;

	});
	// display options:
	// - text and color, shape, bar (stacked or not), highlight matching (any
	// except arrays)
	// - color and bar-discrete or contin
	// - color by for bar plots
	this.settings = {
		maxTextWidth: undefined,
		squished: false,
		inlineTooltip: false,
		tooltip: true,
		discrete: true, // will be set automatically if
		// discreteAutoDetermined is false
		highlightMatchingValues: false,
		discreteAutoDetermined: false,
		colorBarSize: 12,
		stackedBar: false,
		renderMethod: {},
		selectionColor: 'rgb(182,213,253)',
		colorByField: null, // color this vector by another vector
		barColor: '#bdbdbd',
		barSize: 40,
		arcSize: 60,
		min: undefined,
		mid: undefined,
		max: undefined,
		autoscaleAlways: false, // autoscale on every repaint
		minMaxReversed: false
		// whether to reverse min and max when auto-setting min and max
	};
	$(this.canvas).on('mousemove.morpheus mouseout.morpheus', mouseMoved);
};
morpheus.VectorTrack.RENDER = {
	TEXT: 0,
	COLOR: 1,
	BAR: 2,
	MOLECULE: 3,
	TEXT_AND_COLOR: 4,
	SHAPE: 5,
	ARC: 6,
	BOX_PLOT: 7
};
morpheus.VectorTrack.vectorToString = function (vector) {
	var formatter = function (v) {
		return '' + v;
	};
	var dataType = morpheus.VectorUtil.getDataType(vector);
	if (dataType === 'number') {
		formatter = morpheus.Util.nf;
	} else if (dataType === '[number]') {
		formatter = function (v) {
			var s = [];
			if (v != null) {
				for (var i = 0, arrayLength = v.length; i < arrayLength; i++) {
					s.push(morpheus.Util.nf(v[i]));
				}
			}
			return s.join(', ');
		};
	} else if (dataType === '[string]') {
		formatter = function (v) {
			var s = [];
			if (v != null) {
				for (var i = 0, arrayLength = v.length; i < arrayLength; i++) {
					s.push(v[i]);
				}
			}
			return s.join(', ');
		};
	}
	return formatter;
};

morpheus.VectorTrack.prototype = {
	settingFromConfig: function (conf) {
		var settings = this.settings;
		if (_.isString(conf)) {
			settings.renderMethod = {};
			var tokens = conf.split(',');
			for (var i = 0, length = tokens.length; i < length; i++) {
				var method = $.trim(tokens[i]);
				method = method.toUpperCase();
				var mapped = morpheus.VectorTrack.RENDER[method];
				if (mapped !== undefined) {
					settings.renderMethod[mapped] = true;
				} else if (method === 'DISCRETE') {
					settings.discrete = true;
					settings.discreteAutoDetermined = true;
				} else if (method === 'CONTINUOUS') {
					settings.discrete = false;
					settings.discreteAutoDetermined = true;
				} else if (method === 'HIGHLIGHT') {
					settings.highlightMatchingValues = true;
				} else if (method === 'STACKED_BAR') {
					settings.stackedBar = true;
					settings.renderMethod[morpheus.VectorTrack.RENDER.BAR] = true;
				} else if (method === 'BOX_PLOT') {
					settings.renderMethod[morpheus.VectorTrack.RENDER.BOX_PLOT] = true;
				} else if (method === 'TOOLTIP') {
					settings.inlineTooltip = true;
				} else {
					console.log(method + ' not found.');
				}
			}
		} else if (_.isNumber(conf)) {
			settings.renderMethod = {};
			settings.renderMethod[conf] = true;
		} else if (_.isObject(conf)) {
			conf.maxTextWidth = undefined;
			this.settings = $.extend({}, this.settings, conf);
			if (conf.renderMethod) {
				for (var method in conf.renderMethod) {
					method = method.toUpperCase();
					var mapped = morpheus.VectorTrack.RENDER[method];
					if (mapped !== undefined) {
						this.settings.renderMethod[mapped] = true;
					}
				}

			}
		}
		this._update();

	},
	isDiscrete: function () {
		return this.settings.discrete;
	},
	setShowTooltip: function (value) {
		this.settings.tooltip = value;
	},
	isShowTooltip: function () {
		return this.settings.tooltip;
	},
	isRenderAs: function (value) {
		return this.settings.renderMethod[value];
	},
	dispose: function () {
		morpheus.AbstractCanvas.prototype.dispose.call(this);
		$(this.canvas).off();
		this._selection.dispose();
		this.project.off(this.events, this.updateSpanMapFunction);
	},
	getName: function () {
		return this.name;
	},
	getVector: function (name) {
		name = name == null ? this.name : name;
		var vector = this.isColumns ? this.project.getSortedFilteredDataset()
		.getColumnMetadata().getByName(name) : this.project
		.getSortedFilteredDataset().getRowMetadata().getByName(name);
		return !vector ? new morpheus.Vector(name, 0) : vector;
	},
	getFullVector: function () {
		var vector = this.isColumns ? this.project.getFullDataset()
		.getColumnMetadata().getByName(this.name) : this.project
		.getFullDataset().getRowMetadata().getByName(this.name);
		return !vector ? new morpheus.Vector(this.name, 0) : vector;
	},
	_updatePreferredSize: function () {
		var size = this._computePreferredSize();
		this.preferredSize.width = size.width;
		this.preferredSize.height = size.height;

	},
	_computePreferredSize: function (forPrint) {
		var width = 0;
		var height = 0;
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)) {
			if (this.positions.getSize() >= 6) {
				var context = this.canvas.getContext('2d');
				var textWidth = morpheus.CanvasUtil.getVectorStringWidth(
					context, this.getVector(), this.positions,
					forPrint ? -1 : (this.isColumns ? 120 : 100));
				if (!forPrint) {
					textWidth = Math.min(textWidth, this.isColumns ? 100 : 500);
					this.settings.maxTextWidth = textWidth;
				}
				width += textWidth;
			} else if (!forPrint) {
				this.settings.maxTextWidth = 0; // text not drawn
			}
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)) {
			width += this.settings.barSize;
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)) {
			width += this.settings.colorBarSize;
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)) {
			width += this.settings.colorBarSize;
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
			width += 300;
		}
		if (!forPrint && !this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
			width = Math.min(300, width);
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.ARC)) {
			width += this.settings.arcSize;
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)) {
			width += 100;
		}
		// 2 pixel spacing between display types
		var nkeys = _.keys(this.settings.renderMethod).length;

		if (nkeys > 0) {
			width += (nkeys - 1) * 2;
		}
		width = Math.max(0, width);
		return this.isColumns ? {
			width: height,
			height: width
		} : {
			width: width,
			height: height
		};

	},
	getPreferredSize: function () {
		return this.preferredSize;
	},
	getPrintSize: function () {
		return this._computePreferredSize(true);
	},
	_createDiscreteValueMap: function () {
		var values = morpheus.VectorUtil.getValues(this.getFullVector());
		values.sort(morpheus.SortKey.ASCENDING_COMPARATOR);
		this.discreteValueMap = new morpheus.Map();
		for (var i = 0, length = values.length; i < length; i++) {
			this.discreteValueMap.set(values[i], i + 1);
		}
		this.settings.min = 0;
		this.settings.mid = 0;
		this.settings.max = values.length;
	},
	_setChartMinMax: function () {
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)) {
			if (!this.settings.stackedBar && this.settings.discrete
				&& !this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)) {
				if (!this.discreteValueMap) {
					this._createDiscreteValueMap();
				}
			} else {
				if (this.settings.autoscaleAlways || this.settings.min == null || this.settings.max == null
					|| this.settings.mid == null) {
					var vector = this.getFullVector();

					var minMax = morpheus.VectorUtil.getMinMax(vector);
					var min = minMax.min;
					var max = minMax.max;
					if (this.settings.minMaxReversed) {
						var tmp = max;
						max = min;
						min = tmp;
					}
					if (this.settings.autoscaleAlways || this.settings.min == null) {
						this.settings.min = Math.min(0, min);
					}
					if (this.settings.autoscaleAlways || this.settings.max == null) {
						this.settings.max = Math.max(0, max);
					}
					if (this.settings.autoscaleAlways || this.settings.mid == null) {
						this.settings.mid = this.settings.min < 0 ? 0
							: this.settings.min;
					}
				}

			}
		}
	},

	_update: function () {
		if (!this.settings.discreteAutoDetermined
			&& (this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR) || this
			.isRenderAs(morpheus.VectorTrack.RENDER.BAR))) {
			if (this.getFullVector().getProperties().has(
					morpheus.VectorKeys.FIELDS)
				|| morpheus.VectorUtil.getDataType(this.getFullVector()) === 'number' || morpheus.VectorUtil.getDataType(this.getFullVector()) === '[number]') {
				this.settings.discrete = false;
				this.settings.highlightMatchingValues = false;
			}
			this.settings.discreteAutoDetermined = true;
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
			this.project.off(this.events, this.updateSpanMapFunction);
		}
		this._setChartMinMax();
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
			this.project.on(this.events, this.updateSpanMapFunction);
			if (!this.moleculeCache) {
				this.moleculeCache = {};
				var _this = this;

				var valueToModelIndices = this.getFullVector().getProperties()
				.get(morpheus.VectorKeys.VALUE_TO_INDICES);
				if (!valueToModelIndices) {
					var fullVector = this.getFullVector();
					valueToModelIndices = morpheus.VectorUtil
					.createValueToIndicesMap(fullVector);
					fullVector.getProperties().set(
						morpheus.VectorKeys.VALUE_TO_INDICES,
						valueToModelIndices);

				}

				if (_this.heatmap.options.structureUrlProvider !== undefined) {
					valueToModelIndices.forEach(function (indices, value) {
						var url = _this.heatmap.options
						.structureUrlProvider(value);
						var image = new Image();
						image.src = url;
						_this.moleculeCache[value] = image;
					});

					setTimeout(function () {
						_this.setInvalid(true);
						_this.repaint();
					}, 2000);
				} else {
					var values = valueToModelIndices.keys();
					var doRequest = function (smile) {
						$
						.ajax(
							{
								contentType: 'text/plain',
								context: {
									smile: smile
								},
								data: {
									'string': smile,
									'representation': 'sdf'
								},
								url: 'http://cactus.nci.nih.gov/chemical/structure',
							}).done(function (text) {
							_this.moleculeCache[this.smile] = text;
							if (values.length > 0) {
								doRequest(values.pop());
							}
							_this.invalid = true;
							_this.repaint();
						});
					};
					for (var i = 0; i < 6; i++) {
						doRequest(values.pop());
					}
				}
				this.updateSpanMapFunction();
			}
		}
		this._updatePreferredSize();
	},
	postPaint: function (clip, context) {
		// draw hover, matching values
		context.lineWidth = 1;
		context.strokeStyle = 'Grey';
		var project = this.project;
		var setup = this._setup(context, clip);
		var vector = setup.vector;
		var start = setup.start;
		var end = setup.end;

		// hover
		if (this.isColumns) {
			if (project.getHoverColumnIndex() !== -1) {
				this.drawColumnBorder(context, this.positions, project
				.getHoverColumnIndex(), this.getUnscaledHeight());

			}
		} else {
			if (project.getHoverRowIndex() !== -1) {
				this.drawRowBorder(context, this.positions, project
				.getHoverRowIndex(), this.getUnscaledWidth());
			}
		}
		this._highlightMatchingValues(context, vector, start, end);
	},
	_highlightMatchingValues: function (context, viewVector, start, end) {
		var project = this.project;
		var positions = this.positions;
		context.strokeStyle = 'black';
		context.lineWidth = 3;
		var hoverIndex = this.isColumns ? project.getHoverColumnIndex()
			: project.getHoverRowIndex();
		var value = viewVector.getValue(hoverIndex);

		if (this.settings.highlightMatchingValues
			&& hoverIndex !== -1
			&& this.heatmap.mousePositionOptions
			&& this.heatmap.mousePositionOptions.name === viewVector
			.getName()) {
			var valueToModelIndices = this.getFullVector().getProperties().get(
				morpheus.VectorKeys.VALUE_TO_INDICES);
			if (!valueToModelIndices) {
				var fullVector = this.getFullVector();
				valueToModelIndices = morpheus.VectorUtil
				.createValueToIndicesMap(fullVector);
				fullVector.getProperties().set(
					morpheus.VectorKeys.VALUE_TO_INDICES,
					valueToModelIndices);

			}
			var indices = valueToModelIndices.get(value);
			if (indices == null) {
				console.log('valueToModelIndices error');
				return;
			}
			if (indices.length <= 1) {
				return;
			}
			if (this.isColumns) {
				if (project.getHoverColumnIndex() !== -1) {
					var height = this.getUnscaledHeight();
					// context.fillStyle = '#ffffb3';
					context.beginPath();
					for (var i = 0, nindices = indices.length; i < nindices; i++) {
						var viewIndex = project
						.convertModelColumnIndexToView(indices[i]);
						if (viewIndex >= start && viewIndex < end) {
							var size = positions.getItemSize(viewIndex);
							var pix = positions.getPosition(viewIndex);
							context.rect(pix, 0, size, height);
						}
					}
					context.stroke();

				}
			} else {
				context.beginPath();
				var width = this.getUnscaledWidth();
				var indices = valueToModelIndices.get(value);
				for (var i = 0, nindices = indices.length; i < nindices; i++) {
					var viewIndex = project
					.convertModelRowIndexToView(indices[i]);
					if (viewIndex >= start && viewIndex < end) {
						var size = positions.getItemSize(viewIndex);
						var pix = positions.getPosition(viewIndex);
						context.rect(0, pix, width, size);
					}
				}
				context.stroke();
			}

		}

	},
	drawSelection: function (options) {
		var project = this.project;
		var positions = this.positions;
		var context = options.context;
		var start = options.start;
		var end = options.end;
		context.lineWidth = 1;
		context.fillStyle = this.settings.selectionColor;
		if (this.isColumns) {
			var height = this.getUnscaledHeight();
			var viewIndices = project.getColumnSelectionModel()
			.getViewIndices();
			viewIndices.forEach(function (i) {
				if (i >= start && i <= end) {
					var size = positions.getItemSize(i);
					var pix = positions.getPosition(i);
					context.fillRect(pix, 0, size, height);
				}
			});
		} else {
			var width = this.getUnscaledWidth();
			if (!this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
				var viewIndices = project.getRowSelectionModel()
				.getViewIndices();
				viewIndices.forEach(function (i) {
					if (i >= start && i <= end) {
						var size = positions.getItemSize(i);
						var pix = positions.getPosition(i);
						context.fillRect(0, pix, width, size);
					}
				});
			}
		}

	},
	prePaint: function (clip, context) {
		// draw selection
		var project = this.project;
		var positions = this.positions;
		var setup = this._setup(context, clip);
		var start = setup.start;
		var end = setup.end;
		this.drawSelection({
			context: context,
			start: start,
			end: end
		});
		if (this.invalid || start !== this.lastPosition.start
			|| end !== this.lastPosition.end) {
			this.lastPosition.start = start;
			this.lastPosition.end = end;
			this.invalid = true;
		}
	},
	drawRowBorder: function (context, positions, index, gridSize) {
		var size = positions.getItemSize(index);
		var pix = positions.getPosition(index);
		// top and bottom lines
		context.beginPath();
		context.moveTo(0, pix + size);
		context.lineTo(gridSize, pix + size);
		context.stroke();
		context.beginPath();
		context.moveTo(0, pix);
		context.lineTo(gridSize, pix);
		context.stroke();
	},
	drawColumnBorder: function (context, positions, index, gridSize) {
		var size = positions.getItemSize(index);
		var pix = positions.getPosition(index);
		// top and bottom lines
		context.beginPath();
		context.moveTo(pix + size, 0);
		context.lineTo(pix + size, gridSize);
		context.stroke();
		context.beginPath();
		context.moveTo(pix, 0);
		context.lineTo(pix, gridSize);
		context.stroke();
	},
	isSquished: function () {
		return this.settings.squished;
	},
	_setup: function (context, clip) {
		var start = 0;
		var vector = this.getVector();
		var end = vector.size();
		var settings = this.settings;
		var positions = this.positions;
		var width = clip.width;
		var height = clip.height;
		if (!settings.squished) {
			if (this.isColumns) {
				start = morpheus.Positions.getLeft(clip, positions);
				end = morpheus.Positions.getRight(clip, positions);
			} else {
				start = morpheus.Positions.getTop(clip, positions);
				end = morpheus.Positions.getBottom(clip, positions);
			}
		}
		if (settings.squished) {

			var total = positions.getPosition(positions.getLength() - 1)
				+ positions.getItemSize(positions.getLength() - 1);
			if (!this.isColumns) {
				var squishFactor = height / total;
				context.scale(1, squishFactor);
			} else {
				var squishFactor = width / total;
				context.scale(squishFactor, 1);
			}

		} else {
			context.translate(-clip.x, -clip.y);
		}
		return {
			start: start,
			end: end,
			vector: vector
		};
	},
	draw: function (clip, context) {
		var setup = this._setup(context, clip);
		this._draw({
			start: setup.start,
			end: setup.end,
			vector: setup.vector,
			context: context,
			availableSpace: this.isColumns ? this.getUnscaledHeight()
				: this.getUnscaledWidth(),
			clip: clip
		});
	},
	print: function (clip, context) {
		var vector = this.getVector();
		this._draw({
			start: 0,
			end: vector.size(),
			vector: vector,
			context: context,
			availableSpace: this.isColumns ? clip.height
				: clip.width,
			clip: clip
		});
	},
	/**
	 * @param options.vector
	 * @param options.context
	 * @param options.start
	 * @param options.end
	 * @param options.availableSpace
	 */
	_draw: function (options) {
		var _this = this;
		var context = options.context;
		var vector = options.vector;
		var availableSpace = options.availableSpace;
		var fullAvailableSpace = options.availableSpace;
		var start = options.start;
		var end = options.end;
		var clip = options.clip;
		var positions = this.positions;
		if (this.settings.autoscaleAlways) {
			this._setChartMinMax();
		}
		context.textAlign = 'left';
		context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;

		var fontSize = Math.min(24, positions.getSize() - 2);
		var size = 0;
		context.font = fontSize + 'px ' + morpheus.CanvasUtil.FONT_NAME;
		context.strokeStyle = morpheus.HeatMapElementCanvas.GRID_COLOR;
		context.lineWidth = 0.1;
		// grid lines
		if (this.heatmap.heatmap.isDrawGrid() && !this.settings.squished) {
			if (this.isColumns) {
				var gridSize = availableSpace;
				context.beginPath();
				for (var i = start; i < end; i++) {
					var size = positions.getItemSize(i);
					var pix = positions.getPosition(i);
					if (size > 7) {
						context.moveTo(pix + size, 0);
						context.lineTo(pix + size, gridSize);
					}
				}
				context.stroke();
			} else {
				if (!this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
					var gridSize = availableSpace;
					context.beginPath();
					for (var i = start; i < end; i++) {
						var size = positions.getItemSize(i);
						var pix = positions.getPosition(i);
						if (size > 7) {

							context.moveTo(0, pix + size);
							context.lineTo(gridSize, pix + size);

						}
					}
					context.stroke();
				}
			}
		}
		context.lineWidth = 1;
		var offset = 1;

		if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)) {
			this.renderColor(context, vector, start, end, clip,
				this.isColumns ? availableSpace : 0,
				!this.settings.discrete);
			offset += this.settings.colorBarSize + 2;
			availableSpace -= offset;
		}
		if (!this.settings.squished
			&& this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)) {
			this.renderShape(context, vector, start, end, clip,
				this.isColumns ? availableSpace - offset : offset);
			offset += this.settings.colorBarSize + 2;
			availableSpace -= offset;
		}

		if (this.isRenderAs(morpheus.VectorTrack.RENDER.ARC)) {
			this.renderArc(context, vector, start, end, clip,
				this.settings.arcSize);
			offset += this.settings.arcSize + 2;
			availableSpace -= offset;
		}
		if (!this.settings.squished
			&& this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
			this.renderMolecule(context, vector, start, end, clip, offset,
				availableSpace);
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)) {
			var barSize = !this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT) ? (availableSpace - 2)
				: this.settings.barSize;
			offset++;
			this.renderBoxPlot(context, vector, start, end, clip, offset,
				barSize);
			offset += barSize + 2;
			availableSpace -= offset;
		}

		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)) {
			var barSize = !this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT) ? (availableSpace - 1)
				: this.settings.barSize;
			if (this.settings.stackedBar) {
				this.renderStackedBar(context, vector, start, end, clip,
					offset, barSize);
			} else {
				var fields = vector.getProperties().get(
					morpheus.VectorKeys.FIELDS);
				var visibleFieldIndices = vector.getProperties().get(
					morpheus.VectorKeys.VISIBLE_FIELDS);
				if (fields != null && visibleFieldIndices == null) {
					visibleFieldIndices = morpheus.Util.seq(fields.length);
				}

				if (fields != null) {
					this.renderUnstackedBar(context, vector, start, end, clip,
						offset, barSize, visibleFieldIndices);
				} else {
					this.renderBar(context, vector, start, end, clip, offset,
						barSize);
				}
			}
			offset += barSize + 2;
			availableSpace -= offset;
		}

		if (!this.settings.squished
			&& this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)) {
			context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
			this.renderText(context, vector, true, start, end, clip, offset,
				this.isColumns ? fullAvailableSpace : 0);
			offset += this.settings.maxTextWidth + 2;
			availableSpace -= offset;
		}
		this.textWidth = 0;
		if (!this.settings.squished
			&& this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT)) {
			this.textWidth = availableSpace;
			context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
			var dataType = morpheus.VectorUtil.getDataType(vector);
			if (dataType === 'url') {
				context.fillStyle = 'blue';
				this.canvas.style.cursor = 'pointer';
			}
			this.renderText(context, vector, false, start, end, clip, offset,
				this.isColumns ? fullAvailableSpace : 0);
			offset += this.settings.textWidth + 2;
			availableSpace -= offset;
		}

	},
	showPopup: function (e, isHeader) {
		if (!this.heatmap.options.popupEnabled) {
			return;
		}
		var _this = this;
		var project = this.project;
		var isColumns = this.isColumns;
		var hasSelection = isColumns ? project.getColumnSelectionModel()
		.count() > 0 : project.getRowSelectionModel().count() > 0;
		var ANNOTATE_SELECTION = 'Annotate Selection';
		var INVERT_SELECTION = 'Invert Selection';
		var SELECT_ALL = 'Select All';
		var SHOW_SELECTION_ONLY = 'Show Selection Only';
		var CLEAR_SELECTION = 'Clear Selection';
		var HIGHLIGHT_MATCHING_VALUES = 'Highlight Matching Values';
		var FIELDS = 'Choose Fields...';
		var DELETE = 'Delete...';
		var TOOLTIP = 'Show In Tooltip';
		var HIDE = 'Hide';
		var HIDE_OTHERS = 'Hide Others';
		var REMOVE_SHOW_SELECTION_ONLY = 'Show All';
		var SORT_ASC = 'Sort Ascending';
		var SORT_DESC = 'Sort Descending';
		var FILTER = 'Filter...';
		var SORT_SEL_ASC = 'Sort Heat Map Ascending \u2191';
		var SORT_SEL_DESC = 'Sort Heat Map Descending \u2193';
		var SORT_SEL_TOP_N = 'Sort Heat Map Descending/Ascending';
		var DISPLAY_BAR = 'Show Bar Chart';
		var DISPLAY_STACKED_BAR = 'Show Stacked Bar Chart';
		var DISPLAY_BOX_PLOT = 'Show Box Plot';
		var DISPLAY_COLOR = 'Show Color';
		var COLOR_BAR_SIZE = 'Color Bar Size...';
		var DISPLAY_TEXT = 'Show Text';
		var DISPLAY_SHAPE = 'Show Shape';
		var DISPLAY_ARC = 'Show Arc';
		var DISPLAY_TEXT_AND_COLOR = 'Show Colored Text';
		var DISPLAY_STRUCTURE = 'Show Chemical Structure';
		var DISPLAY_CONTINUOUS = 'Continuous';
		var positions = this.positions;
		var heatmap = this.heatmap;

		var sectionToItems = {
			'Sort': [],
			'Selection': [],
			'Display': []
		};
		if (isHeader) {
			sectionToItems.Sort.push({
				name: FILTER
			});
			// sectionToItems['Sort'].push({
			// name : SORT_ASC
			// });
			// sectionToItems['Sort'].push({
			// name : SORT_DESC
			// });
		}

		var customItems = this.heatmap.getPopupItems();
		if (customItems && customItems.length > 0) {
			customItems.forEach(function (item) {
				if (item.columns === isColumns) {
					sectionToItems[item.section].push(item);
				}
			});
		}
		if (sectionToItems.Selection.length > 0) {
			sectionToItems.Selection.push({
				separator: true
			});
		}

		sectionToItems.Selection.push({
			name: 'Copy',
			class: 'copy'
		});
		sectionToItems.Selection.push({
			separator: true
		});
		sectionToItems.Selection.push({
			name: ANNOTATE_SELECTION
		});

		sectionToItems.Selection.push({
			name: INVERT_SELECTION
		});
		sectionToItems.Selection.push({
			name: SELECT_ALL
		});
		sectionToItems.Selection.push({
			name: CLEAR_SELECTION
		});
		// sectionToItems.Selection.push({
		// name : SHOW_SELECTION_ONLY
		// });
		var combinedFilter = isColumns ? project.getColumnFilter() : project
		.getRowFilter();
		var showSelectionOnlyIndex = combinedFilter
		.indexOf(SHOW_SELECTION_ONLY);
		if (showSelectionOnlyIndex !== -1) {
			sectionToItems.Selection.push({
				name: REMOVE_SHOW_SELECTION_ONLY
			});
		}

		if (!isHeader) {
			sectionToItems['Sort'].push({
				name: SORT_SEL_ASC,
				disabled: !hasSelection
			});
			sectionToItems['Sort'].push({
				name: SORT_SEL_DESC,
				disabled: !hasSelection
			});

			sectionToItems['Sort'].push({
				name: SORT_SEL_TOP_N,
				disabled: !hasSelection
			});
		}
		var dataType = morpheus.VectorUtil.getDataType(this.getFullVector());
		var arrayFields = this.getFullVector().getProperties().get(
			morpheus.VectorKeys.FIELDS);
		var isArray = arrayFields !== undefined;
		var isNumber = dataType === 'number' || dataType === '[number]';
		if (isNumber || isArray) {
			sectionToItems.Display.push({
				name: DISPLAY_BAR,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)
			});

		}
		if (isArray) {
			sectionToItems.Display.push({
				name: DISPLAY_STACKED_BAR,
				checked: this.settings.stackedBar
			});
			sectionToItems.Display.push({
				name: DISPLAY_BOX_PLOT,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)
			});
			sectionToItems.Display.push({
				name: FIELDS,
			});

		}
		if (dataType !== 'url') {
			sectionToItems.Display.push({
				name: DISPLAY_TEXT,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT)
			});
			sectionToItems.Display.push({
				name: DISPLAY_COLOR,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)
			});
			if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)) {
				sectionToItems.Display.push({
					name: COLOR_BAR_SIZE
				});
			}
		}
		if (!isArray && dataType !== 'url') {
			sectionToItems.Display.push({
				name: DISPLAY_SHAPE,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)
			});
			// sectionToItems.Display.push({
			// name : DISPLAY_ARC,
			// checked : this.isRenderAs(morpheus.VectorTrack.RENDER.ARC)
			// });

		}

		if (!isArray && !isNumber && !this.isColumns
			&& name.toLowerCase().indexOf('smile') !== -1) {
			sectionToItems.Display.push({
				name: DISPLAY_STRUCTURE,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)
			});
		}

		sectionToItems.Display.push({
			name: TOOLTIP,
			checked: this.settings.inlineTooltip
		});
		if (!isArray && dataType !== 'url') {
			sectionToItems.Display.push({
				name: HIGHLIGHT_MATCHING_VALUES,
				checked: this.settings.highlightMatchingValues
			});
		}
		if (dataType !== 'url') {
			sectionToItems.Display.push({
				name: 'Squished',
				checked: this.settings.squished
			});
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)) {
			sectionToItems.Display.push({
				separator: true
			});
			if (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)) {
				sectionToItems.Display.push({
					name: 'Edit Bar Color...'
				});
			}
			sectionToItems.Display.push({
				name: 'Auto Range'
			});
			sectionToItems.Display.push({
				name: 'Custom Range...'
			});
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)) {
			sectionToItems.Display.push({
				separator: true
			});
			if (isNumber) {
				sectionToItems.Display.push({
					name: DISPLAY_CONTINUOUS,
					checked: !this.settings.discrete
				});
			}
			if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)
				|| this
				.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)
				|| (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR) && isArray)) {
				sectionToItems.Display.push({
					name: 'Edit Colors...'
				});

			}
			if (this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)) {
				sectionToItems.Display.push({
					name: 'Edit Shapes...'
				});

			}
			if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)
				|| this
				.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)
				|| (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR) && isArray)) {
				sectionToItems.Display.push({
					name: 'Color Key',
					icon: 'fa fa-key'
				});
			}

		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)) {
			sectionToItems.Display.push({
				name: 'Shape Key',
				icon: 'fa fa-key'
			});
		}

		sectionToItems.Display.push({
			separator: true
		});
		sectionToItems.Display.push({
			name: HIDE
		});
		sectionToItems.Display.push({
			name: HIDE_OTHERS,
			disabled: heatmap.getVisibleTrackNames(this.isColumns).length <= 1

		});
		sectionToItems.Display.push({
			separator: true
		});
		sectionToItems.Display.push({
			name: DELETE
		});

		var items = [];

		function addSection(name) {
			if (items.length > 0) {
				items.push({
					separator: true
				});
			}
			items = items.concat(sectionToItems[name]);
		}

		addSection('Sort');
		_.each(sectionToItems.Selection, function (item) {
			if (item.name !== REMOVE_SHOW_SELECTION_ONLY
				&& item.name !== SELECT_ALL) {
				item.disabled = !hasSelection;
			}
		});
		if (!isHeader) {
			addSection('Selection');
		} else {
			addSection('Display');
		}
		if (e.preventDefault) {
			e.preventDefault();
		}

		morpheus.Popup
		.showPopup(
			items,
			{
				x: e.pageX,
				y: e.pageY
			},
			e.target,
			function (event, item) {
				var customItem;
				if (item === 'Copy') {
					var dataset = project
					.getSortedFilteredDataset();
					var v = isColumns ? dataset.getColumnMetadata()
					.getByName(_this.name) : dataset
					.getRowMetadata().getByName(_this.name);
					var selectionModel = isColumns ? project
					.getColumnSelectionModel() : project
					.getRowSelectionModel();
					var text = [];
					selectionModel.getViewIndices().forEach(
						function (index) {
							text.push(morpheus.Util.toString(v
							.getValue(index)));
						});
					event.clipboardData.setData('text/plain', text
					.join('\t'));
				} else if (item === FIELDS) {
					var visibleFieldIndices = _this
					.getFullVector()
					.getProperties()
					.get(morpheus.VectorKeys.VISIBLE_FIELDS);
					var visibleFields;
					if (visibleFieldIndices == null) {
						visibleFields = arrayFields.slice(0);
					} else {
						visibleFields = [];
						for (var i = 0; i < visibleFieldIndices.length; i++) {
							visibleFields
							.push(arrayFields[visibleFieldIndices[i]]);
						}

					}
					var availableFields = [];
					for (var i = 0; i < arrayFields.length; i++) {
						if (visibleFields.indexOf(arrayFields[i]) === -1) {
							availableFields.push(arrayFields[i]);
						}
					}

					var leftOptions = [];
					var rightOptions = [];
					for (var i = 0; i < availableFields.length; i++) {
						leftOptions.push(new Option(
							availableFields[i],
							availableFields[i]));
					}
					for (var i = 0; i < visibleFields.length; i++) {
						rightOptions
						.push(new Option(visibleFields[i],
							visibleFields[i]));
					}

					var list = new morpheus.DualList(leftOptions,
						rightOptions);

					morpheus.FormBuilder
					.showOkCancel({
						title: 'Fields',
						okCallback: function () {
							var visibleFields = list
							.getOptions(false);
							var visibleFieldIndices = [];
							for (var i = 0; i < visibleFields.length; i++) {
								visibleFieldIndices
								.push(arrayFields
								.indexOf(visibleFields[i]));
							}
							var fullVector = _this
							.getFullVector();
							fullVector
							.getProperties()
							.set(
								morpheus.VectorKeys.VISIBLE_FIELDS,
								visibleFieldIndices);

							var summaryFunction = fullVector
							.getProperties()
							.get(
								morpheus.VectorKeys.ARRAY_SUMMARY_FUNCTION);
							if (summaryFunction) {
								summaryFunction.indices = visibleFieldIndices;
							}
							var updatedVector = _this.isColumns ? _this.project
							.getFullDataset()
							.getColumnMetadata()
							.add(_this.name)
								: _this.project
							.getFullDataset()
							.getRowMetadata()
							.add(_this.name);
							// remove cached summary field
							for (var i = 0; i < updatedVector
							.size(); i++) {
								var array = fullVector
								.getValue(i);
								if (array != null) {
									array.summary = undefined;
								}

							}

							_this.setInvalid(true);
							_this.repaint();
						},
						content: list.$el
					});
				} else if (item === 'Edit Bar Color...') {
					var formBuilder = new morpheus.FormBuilder();
					formBuilder.append({
						name: 'bar_color',
						type: 'color',
						value: _this.settings.barColor,
						required: true,
						col: 'col-xs-2'
					});
					formBuilder.find('bar_color').on(
						'change',
						function () {
							_this.settings.barColor = $(this)
							.val();
							_this.setInvalid(true);
							_this.repaint();
						});
					morpheus.FormBuilder.showInModal({
						title: 'Bar Color',
						close: 'Close',
						html: formBuilder.$form
					});
				} else if (item === COLOR_BAR_SIZE) {
					var formBuilder = new morpheus.FormBuilder();
					formBuilder.append({
						name: 'size',
						type: 'text',
						value: _this.settings.colorBarSize,
						required: true,
						col: 'col-xs-2'
					});
					formBuilder.find('size').on(
						'change',
						function () {
							var val = parseFloat($(this)
							.val());
							if (val > 0) {
								_this.settings.colorBarSize = val;
								_this.setInvalid(true);
								_this.repaint();
							}
						});
					morpheus.FormBuilder.showInModal({
						title: 'Color Bar Size',
						close: 'Close',
						html: formBuilder.$form
					});
				} else if (item === ANNOTATE_SELECTION) {
					var formBuilder = new morpheus.FormBuilder();
					formBuilder.append({
						name: 'annotation_name',
						type: 'text',
						required: true
					});
					formBuilder.append({
						name: 'annotation_value',
						type: 'text',
						required: true
					});
					morpheus.FormBuilder
					.showOkCancel({
						title: ANNOTATE_SELECTION,
						content: formBuilder.$form,
						okCallback: function () {
							var value = formBuilder
							.getValue('annotation_value');
							var annotationName = formBuilder
							.getValue('annotation_name');
							var dataset = project
							.getSortedFilteredDataset();
							var fullDataset = project
							.getFullDataset();
							if (isColumns) {
								dataset = morpheus.DatasetUtil
								.transposedView(dataset);
								fullDataset = morpheus.DatasetUtil
								.transposedView(fullDataset);
							}

							var existingVector = fullDataset
							.getRowMetadata()
							.getByName(
								annotationName);
							var v = dataset
							.getRowMetadata().add(
								annotationName);

							var selectionModel = isColumns ? project
							.getColumnSelectionModel()
								: project
							.getRowSelectionModel();
							selectionModel
							.getViewIndices()
							.forEach(
								function (index) {
									v
									.setValue(
										index,
										value);
								});
							morpheus.VectorUtil
							.maybeConvertStringToNumber(v);
							project
							.trigger(
								'trackChanged',
								{
									vectors: [v],
									render: existingVector != null ? []
										: [morpheus.VectorTrack.RENDER.TEXT],
									columns: isColumns
								});
						}
					});
				} else if (item === DELETE) {
					morpheus.FormBuilder
					.showOkCancel({
						title: 'Delete',
						content: 'Are you sure you want to delete '
						+ _this.name + '?',
						okCallback: function () {
							var metadata = isColumns ? project
							.getFullDataset()
							.getColumnMetadata()
								: project
							.getFullDataset()
							.getRowMetadata();
							metadata
							.remove(morpheus.MetadataUtil
							.indexOf(
								metadata,
								_this.name));
							var sortKeys = isColumns ? project
							.getColumnSortKeys()
								: project
							.getRowSortKeys();
							var sortKeyIndex = _.indexOf(
								sortKeys.map(function (key) {
									return key.field;
								}), _this.name);
							if (sortKeyIndex !== -1) {
								sortKeys.splice(
									sortKeyIndex, 1);
								if (isColumns) {
									project
									.setColumnSortKeys(
										sortKeys,
										true);
								} else {
									project.setRowSortKeys(
										sortKeys, true);
								}
							}
							var groupByKeys = isColumns ? project
							.getGroupColumns()
								: project
							.getGroupRows();
							var groupByKeyIndex = _
							.indexOf(
								groupByKeys
								.map(function (key) {
									return key.field;
								}),
								_this.name);
							if (groupByKeyIndex !== -1) {
								groupByKeys.splice(
									groupByKeyIndex, 1);
								if (isColumns) {
									project
									.setGroupColumns(
										groupByKeys,
										true);
								} else {
									project.setGroupRows(
										groupByKeys,
										true);
								}
							}
							if (!isColumns) {
								// remove from any group
								// by or sort by
								project
								.trigger(
									'rowTrackRemoved',
									{
										vector: _this
										.getFullVector()
									});
							} else {
								project
								.trigger(
									'columnTrackRemoved',
									{
										vector: _this
										.getFullVector()
									});
							}
						}
					});
				} else if (item === CLEAR_SELECTION) {
					var model = isColumns ? project
					.getColumnSelectionModel() : project
					.getRowSelectionModel();
					model.setViewIndices(new morpheus.Set(), true);
				} else if (item === INVERT_SELECTION) {
					var model = isColumns ? project
					.getColumnSelectionModel() : project
					.getRowSelectionModel();
					var viewIndices = model.getViewIndices();
					var inverse = new morpheus.Set();
					for (var i = 0, n = positions.getLength(); i < n; i++) {
						if (!viewIndices.has(i)) {
							inverse.add(i);
						}
					}
					model.setViewIndices(inverse, true);
				} else if (item === FILTER) {
					var vector = _this.getFullVector();
					var filter;
					var index = _this.isColumns ? _this.project
					.getColumnFilter().indexOf(
						vector.getName())
						: _this.project.getRowFilter().indexOf(
						vector.getName());
					if (index === -1) {
						if (morpheus.VectorUtil.isNumber(vector)
							&& morpheus.VectorUtil
							.containsMoreThanNValues(
								vector, 9)) {
							filter = new morpheus.RangeFilter(NaN,
								NaN, vector.getName());

						} else {
							var set = morpheus.VectorUtil
							.getSet(vector);
							var array = set.values();
							array
							.sort(morpheus.SortKey.ASCENDING_COMPARATOR);
							filter = new morpheus.VectorFilter(set,
								set.size(), vector.getName());
						}
						if (filter) {
							if (_this.isColumns) {
								_this.project.getColumnFilter()
								.add(filter, true);
							} else {
								_this.project.getRowFilter().add(
									filter, true);
							}
						}

					}

					if (_this.isColumns) {
						_this.project.getColumnFilter().trigger(
							'focus', {});
					} else {
						_this.project.getRowFilter().trigger(
							'focus', {});
					}

				} else if (item === SORT_ASC || item === SORT_DESC) {
					var sortKey = new morpheus.SortKey(
						_this.name,
						item === SORT_ASC ? morpheus.SortKey.SortOrder.ASCENDING
							: morpheus.SortKey.SortOrder.DESCENDING);
					if (_this.isColumns) {
						_this.project
						.setColumnSortKeys(
							morpheus.SortKey
							.keepExistingSortKeys(
								[sortKey],
								project
								.getColumnSortKeys()),
							true);
					} else {
						_this.project
						.setRowSortKeys(
							morpheus.SortKey
							.keepExistingSortKeys(
								[sortKey],
								project
								.getRowSortKeys()),
							true);
					}
				} else if (item == SORT_SEL_ASC
					|| item == SORT_SEL_DESC
					|| item === SORT_SEL_TOP_N) {
					var sortOrder;
					if (item === SORT_SEL_ASC) {
						sortOrder = morpheus.SortKey.SortOrder.ASCENDING;
					} else if (item === SORT_SEL_DESC) {
						sortOrder = morpheus.SortKey.SortOrder.DESCENDING;
					} else {
						sortOrder = morpheus.SortKey.SortOrder.TOP_N;
					}
					heatmap.sortBasedOnSelection(sortOrder,
						isColumns, e && e.shiftKey);
				} else if (item === SELECT_ALL) {
					var selectionModel = !isColumns ? heatmap
					.getProject().getRowSelectionModel()
						: heatmap.getProject()
					.getColumnSelectionModel();
					var count = !isColumns ? heatmap.getProject()
					.getSortedFilteredDataset()
					.getRowCount() : heatmap.getProject()
					.getSortedFilteredDataset()
					.getColumnCount();
					var indices = new morpheus.Set();
					for (var i = 0; i < count; i++) {
						indices.add(i);
					}
					selectionModel.setViewIndices(indices, true);
				} else if (item === 'Auto Range') {
					delete _this.settings.min;
					delete _this.settings.max;
					delete _this.settings.mid;
					_this._update();
					heatmap.revalidate();
				} else if (item === 'Custom Range...') {
					var formBuilder = new morpheus.FormBuilder();
					var items = [{
						name: 'min',
						required: true,
						type: 'number',
						value: _this.settings.min
					}, {
						name: 'mid',
						required: true,
						type: 'number',
						value: _this.settings.mid
					}, {
						name: 'max',
						required: true,
						type: 'number',
						value: _this.settings.max
					}];
					_.each(items, function (item) {
						formBuilder.append(item);
					});
					morpheus.FormBuilder
					.showOkCancel({
						title: 'Range',
						content: formBuilder.$form,
						okCallback: function () {
							_this.settings.min = parseFloat(formBuilder
							.getValue('min'));
							_this.settings.mid = parseFloat(formBuilder
							.getValue('mid'));
							_this.settings.max = parseFloat(formBuilder
							.getValue('max'));
							_this._update();
							heatmap.revalidate();
						}
					});
				} else if (item === 'Squished') {
					_this.settings.squished = !_this.settings.squished;
					heatmap.revalidate();
				} else if (item === 'Color Key') {

					var legend = new morpheus.HeatMapTrackColorLegend(
						[_this], isColumns ? _this.project
						.getColumnColorModel()
							: _this.project
						.getRowColorModel());
					var size = legend.getPreferredSize();
					legend.setBounds(size);
					legend.repaint();

					morpheus.FormBuilder.showInModal({
						title: 'Color Key',
						html: legend.canvas
					});
				} else if (item === 'Shape Key') {
					var legend = new morpheus.HeatMapTrackShapeLegend(
						[_this], isColumns ? _this.project
						.getColumnShapeModel()
							: _this.project
						.getRowShapeModel());
					var size = legend.getPreferredSize();
					legend.setBounds(size);
					legend.repaint();

					morpheus.FormBuilder.showInModal({
						title: 'Shape Key',
						html: legend.canvas
					});
				} else if (item === 'Edit Shapes...') {
					var shapeFormBuilder = new morpheus.FormBuilder();
					var shapeModel = isColumns ? _this.project
					.getColumnShapeModel() : _this.project
					.getRowShapeModel();
					var chooser = new morpheus.ShapeChooser({
						map: shapeModel.getMap(_this.name)
					});

					chooser.on('change', function (event) {
						shapeModel.setMappedValue(_this
							.getFullVector(), event.value,
							event.shape);
						_this.setInvalid(true);
						_this.repaint();
					});
					morpheus.FormBuilder.showInModal({
						title: 'Edit Shapes',
						html: chooser.$div,
						close: 'Close'
					});
				} else if (item === 'Edit Colors...') {
					var colorSchemeChooser;
					var colorModel = isColumns ? _this.project
					.getColumnColorModel() : _this.project
					.getRowColorModel();
					if (_this.settings.discrete) {
						colorSchemeChooser = new morpheus.DiscreteColorSchemeChooser(
							{
								colorScheme: {
									scale: colorModel
									.getDiscreteColorScheme(_this
									.getFullVector())
								}
							});
						colorSchemeChooser.on('change', function (event) {
							colorModel.setMappedValue(_this
								.getFullVector(), event.value,
								event.color);
							_this.setInvalid(true);
							_this.repaint();
						});
					} else {
						colorSchemeChooser = new morpheus.HeatMapColorSchemeChooser(
							{
								showRelative: false,
							});
						colorSchemeChooser
						.setColorScheme(colorModel
						.getContinuousColorScheme(_this
						.getFullVector()));
						colorSchemeChooser.on('change', function (event) {
							_this.setInvalid(true);
							_this.repaint();
						});
					}
					morpheus.FormBuilder.showInModal({
						title: 'Edit Colors',
						html: colorSchemeChooser.$div,
						close: 'Close',
						callback: function () {
							colorSchemeChooser.dispose();
						}
					});
				} else if (item === TOOLTIP) {
					_this.settings.inlineTooltip = !_this.settings.inlineTooltip;
				} else if (item === HIGHLIGHT_MATCHING_VALUES) {
					_this.settings.highlightMatchingValues = !_this.settings.highlightMatchingValues;
				} else if ((customItem = _
					.find(
						customItems,
						function (customItem) {
							return customItem.name === item
								&& customItem.columns === isColumns;
						}))) {
					if (customItem.task) {
						// add task
						var task = {
							tabId: _this.heatmap.getTabManager()
							.getActiveTabId()
						};

						_this.heatmap.getTabManager().addTask(task);
						setTimeout(function () {
							try {
								customItem.callback(heatmap);
							} catch (x) {

							}
							_this.heatmap.getTabManager()
							.removeTask(task);
						}, 1);
					} else {
						customItem.callback(heatmap);
					}

				} else if (item === DISPLAY_CONTINUOUS) {
					_this.settings.discrete = !_this.settings.discrete;
					_this._setChartMinMax();
					_this.setInvalid(true);
					_this.repaint();
				} else if (item === HIDE) {
					heatmap.setTrackVisible(_this.name, false,
						_this.isColumns);
					heatmap.revalidate();
				} else if (item === HIDE_OTHERS) {
					var names = heatmap.getVisibleTrackNames(_this.isColumns);
					for (var i = 0; i < names.length; i++) {
						if (names[i] !== _this.name) {
							heatmap.setTrackVisible(names[i], false,
								_this.isColumns);
						}
					}

					heatmap.revalidate();

				} else if (item === DISPLAY_STACKED_BAR) {
					_this.settings.stackedBar = !_this.settings.stackedBar;
					_this._update();
					heatmap.revalidate();
				} else {
					if (item === DISPLAY_BAR) {
						item = morpheus.VectorTrack.RENDER.BAR;
					} else if (item === DISPLAY_COLOR) {
						item = morpheus.VectorTrack.RENDER.COLOR;
					} else if (item === DISPLAY_TEXT) {
						item = morpheus.VectorTrack.RENDER.TEXT;
					} else if (item === DISPLAY_TEXT_AND_COLOR) {
						item = morpheus.VectorTrack.RENDER.TEXT_AND_COLOR;
					} else if (item === DISPLAY_STRUCTURE) {
						item = morpheus.VectorTrack.RENDER.MOLECULE;
					} else if (item === DISPLAY_SHAPE) {
						item = morpheus.VectorTrack.RENDER.SHAPE;
					} else if (item === DISPLAY_ARC) {
						item = morpheus.VectorTrack.RENDER.ARC;
					} else if (item === DISPLAY_BOX_PLOT) {
						item = morpheus.VectorTrack.RENDER.BOX_PLOT;
					} else {
						console.log('Unknown item ' + item);
					}
					var show = !_this.isRenderAs(item);
					if (!show) {
						delete _this.settings.renderMethod[item];
					} else {
						_this.settings.renderMethod[item] = true;
					}
					_this._update();
					heatmap.revalidate();
				}
			});
	},
	renderColor: function (context, vector, start, end, clip, offset,
						   continuous) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		var colorModel = isColumns ? this.project.getColumnColorModel()
			: this.project.getRowColorModel();
		var settings = this.settings;
		var canvasSize = isColumns ? this.getUnscaledHeight() : this
		.getUnscaledWidth();
		var colorBarSize = settings.colorBarSize;
		if (colorBarSize > canvasSize) {
			colorBarSize = canvasSize >= 5 ? (canvasSize - 1)
				: canvasSize;
		}
		var getColor;
		if (!continuous) {
			getColor = _.bind(colorModel.getMappedValue, colorModel);
		} else {
			getColor = _.bind(colorModel.getContinuousMappedValue, colorModel);
		}

		if (vector.getProperties().get(
				morpheus.VectorKeys.FIELDS) != null) {
			var visibleFieldIndices = vector.getProperties().get(
				morpheus.VectorKeys.VISIBLE_FIELDS);
			if (visibleFieldIndices == null) {
				visibleFieldIndices = morpheus.Util.seq(vector.getProperties().get(
					morpheus.VectorKeys.FIELDS).length);
			}
			colorBarSize /= visibleFieldIndices.length;
			var nvisibleFieldIndices = visibleFieldIndices.length;

			for (var i = start; i < end; i++) {
				var array = vector.getValue(i);
				var position = positions.getPosition(i);
				var size = positions.getItemSize(i);
				var _offset = offset;
				if (array != null) {
					for (var j = 0; j < nvisibleFieldIndices; j++) {
						var value = array[visibleFieldIndices[j]];
						var color = getColor(vector, value);
						context.fillStyle = color;
						if (isColumns) {
							context.beginPath();
							context.rect(position, _offset - colorBarSize, size,
								colorBarSize);
							context.fill();
						} else {
							context.beginPath();
							context.rect(_offset, position, colorBarSize, size);
							context.fill();
						}
						_offset += colorBarSize;
					}
				}

			}

		} else {
			for (var i = start; i < end; i++) {
				var value = vector.getValue(i);
				var position = positions.getPosition(i);
				var size = positions.getItemSize(i);
				var color = getColor(vector, value);
				context.fillStyle = color;
				if (isColumns) {
					context.beginPath();
					context.rect(position, offset - colorBarSize, size,
						settings.colorBarSize);
					context.fill();
				} else {
					context.beginPath();
					context.rect(offset, position, colorBarSize, size);
					context.fill();
				}
			}
		}
	},
	renderShape: function (context, vector, start, end, clip, offset) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		var shapeModel = isColumns ? this.project.getColumnShapeModel()
			: this.project.getRowShapeModel();
		var settings = this.settings;
		var canvasSize = isColumns ? this.getUnscaledHeight() : this
		.getUnscaledWidth();
		var colorBarSize = settings.colorBarSize;
		if (colorBarSize > canvasSize) {
			colorBarSize = canvasSize >= 5 ? (canvasSize - 1)
				: canvasSize;
		}
		context.fillStyle = 'black';
		context.strokeStyle = 'black';

		var lineWidth = context.lineWidth;
		context.lineWidth = 1;
		for (var i = start; i < end; i++) {

			var value = vector.getValue(i);
			var position = positions.getPosition(i);
			var itemSize = positions.getItemSize(i);
			var minSize = Math.min(colorBarSize, itemSize);
			var size2 = minSize / 2;
			var shape = shapeModel.getMappedValue(vector, value);
			// x and y are at center
			var x = isColumns ? position + itemSize / 2 : offset + size2;
			var y = isColumns ? offset - size2 : position + itemSize / 2;
			size2 -= 0.5; // small border between cells
			morpheus.CanvasUtil.drawShape(context, shape, x, y, size2);
		}
		context.lineWidth = lineWidth;
	},
	renderArc: function (context, vector, start, end, clip, size) {

		var isColumns = this.isColumns;
		var positions = this.positions;
		var project = this.project;
		context.save();
		context.lineWidth = 1;
		// var scale = d3.scale.linear().domain([1, size]).range([0.8, 1])
		// .clamp(true);
		// var fill = d3.scale.category20b();

		var total = positions.getPosition(positions.getLength() - 1)
			+ positions.getItemSize(positions.getLength() - 1);
		context.translate(clip.x, clip.y);
		var width = clip.width;
		var height = clip.height;
		// if (!isColumns) {
		// 	var squishFactor = height / total;
		// 	context.scale(1, squishFactor);
		// } else {
		// 	var squishFactor = width / total;
		// 	context.scale(squishFactor, 1);
		// }

		for (var i = start; i < end; i++) {
			var value = vector.getValue(i); // value is an array of other indices to link to
			if (value != null) {
				var startPix = positions.getPosition(i) + positions.getItemSize(i)
					/ 2;
				for (var j = 0, nindices = value.length; j < nindices; j++) {
					var viewIndex = value[j];
					var endPix = positions.getPosition(viewIndex)
						+ positions.getItemSize(viewIndex) / 2;
					var midPix = (endPix + startPix) / 2;
					var distance = Math.abs(i - viewIndex);
					var arcRadius = size; // scale(distance) * size;
					if (isColumns) {
						context.beginPath();
						context.moveTo(startPix, arcRadius);
						context.quadraticCurveTo(midPix, 1, endPix, arcRadius);
					} else {
						console.log(i, viewIndex, startPix, endPix);
						context.beginPath();
						context.moveTo(1, startPix);
						context.quadraticCurveTo(arcRadius, midPix, 1, endPix);
					}

					context.stroke();

				}
			}

		}
		context.restore();
	},
	sdfToSvg: function (sdf, width, height) {
		if (!this.jsme && typeof JSApplet !== 'undefined') {
			this.jsmeId = _.uniqueId('m');
			this.$jsmeDiv = $(
				'<div id="'
				+ this.jsmeId
				+ '" style="position:absolute;left:-10000px;top:-10000px;"></div>')
			.appendTo($(document.body));
			this.jsme = new JSApplet.JSME(this.jsmeId, '380px', '340px', {});
		}
		// this.$jsmeDiv.css('width', width + 'px').css('height', height +
		// 'px');
		// this.jsme.setSize(width + 'px', height + 'px');
		this.jsme.readMolFile(sdf);
		var svg = $('#' + this.jsmeId + ' > div > div > div:nth-child(2) > svg');
		var svgWidth = svg.width.baseVal.value;
		var svgHeight = svg.height.baseVal.value;
		var scale = Math.min(width / svgWidth, height / svgHeight);
		var text = '<svg><g transform="scale(' + scale + ')">' + svg.innerHTML
			+ '</g></svg>';
		return text;
	},
	renderMolecule: function (context, vector, start, end, clip, offset) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
		context.strokeStyle = 'black';
		var width = this.getUnscaledWidth();
		var customUrlProvider = this.heatmap.options.structureUrlProvider !== undefined;
		var dummyTarget = {
			childNodes: [],
			getContext: function () {
				return context;
			}
		};
		for (var i = start; i < end; i++) {
			var spanEnd = this.spanMap.get(i);
			if (spanEnd !== undefined) {
				var startPix = positions.getPosition(i);
				var endPix = positions.getPosition(spanEnd - 1)
					+ positions.getSize();
				var size = endPix - startPix;
				var value = vector.getValue(i);
				var cache = this.moleculeCache[value];
				if (cache) {
					if (customUrlProvider) {
						if (cache.complete) {
							// 800 x 400
							var scaleFactor = Math.min(size / cache.height,
								width / cache.width);
							var scaledWidth = cache.width * scaleFactor;
							var scaledHeight = cache.height * scaleFactor;
							var diff = cache.height - scaledHeight;
							startPix += diff / 2;
							try {
								context.drawImage(cache, offset, startPix,
									scaledWidth, scaledHeight);
							} catch (x) {

							}
						}
					} else {
						var text = this.sdfToSvg(cache, width, size);
						canvg(dummyTarget, text, {
							ignoreMouse: true,
							ignoreAnimation: true,
							offsetY: startPix,
							ignoreClear: true,
							ignoreDimensions: true
						});
					}
				}
			}
		}
	},
	createChartScale: function (availableSpace) {
		var domain;
		var range;
		if (this.settings.mid !== this.settings.min
			&& this.settings.mid !== this.settings.max) {
			domain = [this.settings.min, this.settings.mid, this.settings.max];
			range = this.isColumns ? [availableSpace, availableSpace / 2, 0]
				: [0, availableSpace / 2, availableSpace];
		} else {
			domain = [this.settings.min, this.settings.max];
			range = this.isColumns ? [availableSpace, 0] : [0,
				availableSpace];
		}
		var scale = d3.scale.linear().domain(domain).range(range).clamp(true);
		return scale;
	},
	renderBar: function (context, vector, start, end, clip, offset,
						 availableSpace) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		context.fillStyle = this.settings.barColor;
		var scale = this.createChartScale(availableSpace);
		var midPix = scale(this.settings.mid);
		var settings = this.settings;
		var discrete = settings.discrete && this.discreteValueMap != null;
		for (var i = start; i < end; i++) {
			var value = vector.getValue(i);
			if (discrete) {
				value = this.discreteValueMap.get(value);
			}
			var position = positions.getPosition(i);
			var size = positions.getItemSize(i);
			var scaledValue = scale(value);
			if (isColumns) {
				context.beginPath();
				context.rect(position, Math.min(midPix, scaledValue), size,
					Math.abs(midPix - scaledValue));
				context.fill();
			} else {
				context.beginPath();
				context.rect(offset + Math.min(midPix, scaledValue), position,
					Math.abs(midPix - scaledValue), size);
				context.fill();
			}
		}
	},
	renderBoxPlot: function (context, vector, start, end, clip, offset,
							 availableSpace) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		context.strokeStyle = 'black';
		context.save();
		context.translate(offset, 0);
		var scale = this.createChartScale(availableSpace);
		var visibleFieldIndices = vector.getProperties().get(
			morpheus.VectorKeys.VISIBLE_FIELDS);

		var colorByVector = this.settings.colorByField != null ? this
		.getVector(this.settings.colorByField) : null;
		var colorModel = isColumns ? this.project.getColumnColorModel()
			: this.project.getRowColorModel();
		for (var i = start; i < end; i++) {
			var array = vector.getValue(i);
			if (array != null) {
				var itemSize = positions.getItemSize(i);
				if (itemSize <= 3) {
					continue;
				}
				var radius = 2;
				var pix = positions.getPosition(i);
				var start = pix + 1;
				var end = pix + itemSize - 1;
				var center = (start + end) / 2;
				var _itemSize = itemSize - 2;
				var lineHeight = Math.max(2, _itemSize - 8);
				var box = array.summary;
				if (box == null) {
					var v = morpheus.VectorUtil.arrayAsVector(array);
					box = morpheus
					.BoxPlotItem(visibleFieldIndices != null ? new morpheus.SlicedVector(
						v, visibleFieldIndices)
						: v);
					array.summary = box;
				}
				context.fillStyle = '#bdbdbd';

				if (!isColumns) {
					// box from q1 (25th q) to q3
					context.fillRect(Math.min(scale(box.q1), scale(box.q3)),
						start, Math.abs(scale(box.q1) - scale(box.q3)),
						_itemSize);
					// draw line from q1 to lav
					context.fillRect(Math.min(scale(box.q1),
						scale(box.lowerAdjacentValue)), center - lineHeight
						/ 2, Math.abs(scale(box.q1)
						- scale(box.lowerAdjacentValue)), lineHeight);
					// draw line from q3 to uav
					context.fillRect(Math.min(scale(box.q3),
						scale(box.upperAdjacentValue)), center - lineHeight
						/ 2, Math.abs(scale(box.q3)
						- scale(box.upperAdjacentValue)), lineHeight);
					context.fillStyle = '#31a354';
					// highlight median
					context.fillRect(scale(box.median) - 3, start, 3, end - start);
					context.fillStyle = '#636363';

					// draw individual points
					// for (var j = 0, length = visibleFieldIndices == null ? array.length : visibleFieldIndices.length; j < length; j++) {
					// 	var index = visibleFieldIndices == null ? j : visibleFieldIndices[j];
					// 	var value = array[index];
					// 	if (value != null) {
					// 		if (colorByVector != null) {
					// 			var colorByArray = colorByVector.getValue(i);
					// 			if (colorByArray != null) {
					// 				var color = colorModel
					// 				.getMappedValue(
					// 					colorByVector,
					// 					colorByArray[index]);
					// 				context.fillStyle = color;
					// 			} else {
					// 				context.fillStyle = '#636363';
					// 			}
					//
					// 		}
					// 		var pix = scale(value);
					// 		context.beginPath();
					// 		context
					// 		.arc(pix, center, radius, Math.PI * 2,
					// 			false);
					// 		context.fill();
					// 	}
					// }

				} else { // TOD implement for columns

				}

			}
		}
		context.restore();
	},
	renderStackedBar: function (context, vector, start, end, clip, offset,
								availableSpace) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		var scale = this.createChartScale(availableSpace);
		var midPix = scale(this.settings.mid);
		var settings = this.settings;
		var colorModel = isColumns ? this.project.getColumnColorModel()
			: this.project.getRowColorModel();
		context.strokeStyle = 'black';
		context.lineWidth = 2;
		for (var i = start; i < end; i++) {
			var array = vector.getValue(i);
			if (array != null) {
				var position = positions.getPosition(i);
				var size = positions.getItemSize(i);
				var positivePairs = [];
				var negativePairs = [];
				for (var j = 0, length = array.length; j < length; j++) {
					var value = array[j];
					if (value >= this.settings.mid) {
						positivePairs.push({
							value: value,
							index: j
						});
					} else if (value < 0) {
						negativePairs.push({
							value: value,
							index: j
						});
					}
				}

				// array.sort(function (a, b) {
				// 	return (a.value < b.value ? 1 : (a.value === b.value ? 0 : -1));
				// });
				// var positiveIndices = [];
				// positivePairs.forEach(function (item) {
				// 	positiveIndices.push(item.index);
				// });
				//
				var positiveIndices = morpheus.Util.indexSortPairs(
					positivePairs, false);
				for (var j = 0, length = positiveIndices.length; j < length; j++) {
					var index = positiveIndices[j];
					var value = array[index];
					var color = colorModel.getMappedValue(vector, index);
					context.fillStyle = color;
					var scaledValue = scale(value);
					var nextScaledValue = j === (length - 1) ? midPix
						: scale(array[positiveIndices[j + 1]]);
					if (isColumns) {
						context.beginPath();
						context.rect(position, Math.min(nextScaledValue,
							scaledValue), size, Math.abs(nextScaledValue
							- scaledValue));
						context.fill();
					} else {
						context.beginPath();
						context.rect(offset
							+ Math.min(nextScaledValue, scaledValue),
							position, Math.abs(nextScaledValue
								- scaledValue), size);
						context.fill();
					}
				}
				var negativeIndices = morpheus.Util.indexSortPairs(
					negativePairs, true); // draw smaller (more negative)
				// values 1st
				for (var j = 0, length = negativeIndices.length; j < length; j++) {
					var index = negativeIndices[j];
					var value = array[index];
					var color = colorModel.getMappedValue(vector, index);
					context.fillStyle = color;
					var scaledValue = scale(value);
					var nextScaledValue = j === (length - 1) ? midPix
						: scale(array[negativeIndices[j + 1]]);
					if (isColumns) {
						context.beginPath();
						context.rect(position, Math.min(nextScaledValue,
							scaledValue), size, Math.abs(nextScaledValue
							- scaledValue));
						context.fill();
					} else {
						context.beginPath();
						context.rect(offset
							+ Math.min(nextScaledValue, scaledValue),
							position, Math.abs(nextScaledValue
								- scaledValue), size);
						context.fill();
					}

				}
			}
		}
		context.lineWidth = 1;
	},
	renderUnstackedBar: function (context, vector, start, end, clip, offset,
								  availableSpace, fieldIndices) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		var nvalues = fieldIndices.length;
		var settings = this.settings;
		var colorModel = isColumns ? this.project.getColumnColorModel()
			: this.project.getRowColorModel();
		context.fillStyle = this.settings.barColor;
		// context.strokeStyle = '0000f0';
		var barSpacer = 0;
		var barWidth = (availableSpace - (nvalues - 1) * barSpacer) / nvalues;
		var colorByVector = this.settings.colorByField != null ? this
		.getVector(this.settings.colorByField) : null;
		context.strokeStyle = 'white';
		for (var i = start; i < end; i++) {
			var array = vector.getValue(i);
			if (array != null) {
				var position = positions.getPosition(i);
				var itemSize = positions.getItemSize(i);
				var scale = this.createChartScale(itemSize - 1);
				var midPix = scale(this.settings.mid); // need to set mid pix
				// for each item
				var xpix = 0;
				for (var j = 0; j < nvalues; j++) {
					var value = array[fieldIndices[j]];
					if (colorByVector != null) {
						var colorByArray = colorByVector.getValue(i);
						var color = colorModel
						.getMappedValue(
							colorByVector,
							colorByArray != null ? colorByArray[fieldIndices[j]]
								: null);
						context.fillStyle = color;
					}

					var scaledValue = scale(value);

					if (isColumns) {
						context.beginPath();
						context.rect(Math.min(midPix, scaledValue), offset
							+ xpix, Math.abs(midPix - scaledValue),
							barWidth);
						context.fill();
					} else {
						// bar always goes to midpix
						context.beginPath();
						var barHeight = Math.abs(midPix - scaledValue);
						var ypix = position + itemSize
							- Math.max(midPix, scaledValue);
						context.rect(offset + xpix, ypix, barWidth, barHeight);
						context.fill();

					}

					xpix += barWidth + barSpacer;
				}

			}

		}
	},
	renderText: function (context, vector, isColor, start, end, clip, offset,
						  canvasSize) {

		context.textBaseline = 'middle';
		var positions = this.positions;
		var isColumns = this.isColumns;

		var colorModel = isColumns ? this.project.getColumnColorModel()
			: this.project.getRowColorModel();

		if (isColumns) {
			context.translate(clip.x, clip.y); // reset transform, needed for export to svg
		}
		var toStringFunction = morpheus.VectorTrack.vectorToString(vector);
		for (var i = start; i < end; i++) {
			var size = this.positions.getItemSize(i);
			if (size < 6) {
				continue;
			}
			var value = vector.getValue(i);
			if (value != null) {
				value = toStringFunction(value);
				var position = positions.getPosition(i);
				if (isColor) {
					context.fillStyle = colorModel
					.getMappedValue(vector, value);
				}
				if (isColumns) {
					context.save();
					context.translate(position + size / 2 - clip.x, canvasSize
						- clip.y - offset);
					context.rotate(-Math.PI / 2);
					context.fillText(value, 0, 0);
					context.restore();
				} else {
					context.fillText(value, offset, position + size / 2);
				}
			}
		}
	}
};
morpheus.Util.extend(morpheus.VectorTrack, morpheus.AbstractCanvas);

morpheus.AbstractCanvas = function(offscreen) {
	this.canvas = morpheus.CanvasUtil.createCanvas();
	this.lastClip = null;
	if (offscreen) {
		this.offscreenCanvas = morpheus.CanvasUtil.createCanvas();
	}
	this.offset = {
		x : 0,
		y : 0
	};
};

morpheus.AbstractCanvas.prototype = {
	visible : true,
	invalid : true,
	scrollX : 0,
	scrollY : 0,
	prefWidth : undefined,
	prefHeight : undefined,
	getCanvas : function() {
		return this.canvas;
	},
	scrollTop : function(pos) {
		if (pos === undefined) {
			return this.offset.y;
		}
		this.offset.y = pos;
	},
	appendTo : function($el) {
		// if (this.offscreenCanvas) {
		// $(this.offscreenCanvas).appendTo($el);
		// }
		$(this.canvas).appendTo($el);
	},
	scrollLeft : function(pos) {
		if (pos === undefined) {
			return this.offset.x;
		}
		this.offset.x = pos;
	},
	dispose : function() {
		$(this.canvas).remove();
		this.offscreenCanvas = undefined;
	},
	getPrefWidth : function() {
		return this.prefWidth;
	},
	/**
	 * Tells this canvas to invalidate any offscreen cached images
	 */
	setInvalid : function(invalid) {
		this.invalid = invalid;
	},
	setBounds : function(bounds) {
		var backingScale = morpheus.CanvasUtil.BACKING_SCALE;
		var canvases = [ this.canvas ];
		if (this.offscreenCanvas) {
			canvases.push(this.offscreenCanvas);
		}
		if (bounds.height != null) {
			_.each(canvases, function(canvas) {
				canvas.height = bounds.height * backingScale;
				canvas.style.height = bounds.height + 'px';
			});
		}
		if (bounds.width != null) {
			_.each(canvases, function(canvas) {
				canvas.width = bounds.width * backingScale;
				canvas.style.width = bounds.width + 'px';
			});
		}
		if (bounds.left != null) {
			_.each(canvases, function(canvas) {
				canvas.style.left = bounds.left + 'px';
			});
		}
		if (bounds.top != null) {
			_.each(canvases, function(canvas) {
				canvas.style.top = bounds.top + 'px';
			});
		}
	},
	/**
	 * Paint this canvas using the specified clip.
	 */
	paint : function(clip) {
		var canvas = this.canvas;
		var context = canvas.getContext('2d');
		morpheus.CanvasUtil.resetTransform(context);
		var width = this.getUnscaledWidth();
		var height = this.getUnscaledHeight();
		context.clearRect(0, 0, width, height);
		if (this.prePaint) {
			morpheus.CanvasUtil.resetTransform(context);
			context.translate(this.offset.x, this.offset.y);
			this.prePaint(clip, context);
		}
		morpheus.CanvasUtil.resetTransform(context);
		if (this.offscreenCanvas) {
			if (this.invalid) {
				var oc = this.offscreenCanvas.getContext('2d');
				morpheus.CanvasUtil.resetTransform(oc);
				context.translate(this.offset.x, this.offset.y);
				oc.clearRect(0, 0, width, height);
				this.draw(clip, oc);
			}
			context.drawImage(this.offscreenCanvas, 0, 0, width, height);
		} else {
			this.draw(clip, context);
		}
		if (this.postPaint) {
			morpheus.CanvasUtil.resetTransform(context);
			context.translate(this.offset.x, this.offset.y);
			this.postPaint(clip, context);
		}
		this.lastClip = clip;
		this.invalid = false;
	},
	repaint : function() {
		if (!this.lastClip) {
			this.lastClip = {
				x : 0,
				y : 0,
				width : this.getUnscaledWidth(),
				height : this.getUnscaledHeight()
			};
		}
		this.paint(this.lastClip);
	},
	/**
	 * Draw this canvas into the specified context.
	 */
	draw : function(clip, context) {
		console.log('Not implemented');
	},
	getPrefHeight : function() {
		return this.prefHeight;
	},
	setPrefWidth : function(prefWidth) {
		this.prefWidth = prefWidth;
	},
	setPrefHeight : function(prefHeight) {
		this.prefHeight = prefHeight;
	},
	isVisible : function() {
		return this.visible;
	},
	setVisible : function(visible) {
		if (this.visible !== visible) {
			this.visible = visible;
			this.canvas.style.display = visible ? '' : 'none';
		}
	},
	getUnscaledWidth : function() {
		return this.canvas.width / morpheus.CanvasUtil.BACKING_SCALE;
	},
	getUnscaledHeight : function() {
		return this.canvas.height / morpheus.CanvasUtil.BACKING_SCALE;
	},
	getWidth : function() {
		return this.canvas.width;
	},
	getHeight : function() {
		return this.canvas.height;
	}
};
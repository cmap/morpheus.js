morpheus.Divider = function (vertical) {
	morpheus.AbstractCanvas.call(this, false);
	this.vertical = vertical;
	var that = this;
	var canvas = this.canvas;
	canvas.style.cursor = vertical ? 'ew-resize' : 'ns-resize';

	if (vertical) {
		this.setBounds({
			height: 15,
			width: 4
		});

	} else {
		this.setBounds({
			height: 4,
			width: 15
		});
	}
	this.hammer = morpheus.Util.hammer(canvas, ['pan']).on('panstart',
		this.panstart = function (event) {
			that.trigger('resizeStart');
			morpheus.CanvasUtil.dragging = true;
		}).on('panmove', this.panmove = function (event) {
			if (that.vertical) {
				that.trigger('resize', {
					delta: event.deltaX
				});
			} else {
				that.trigger('resize', {
					delta: event.deltaY
				});
			}
		}).on('panend', this.panend = function (event) {
			morpheus.CanvasUtil.dragging = false;
			that.trigger('resizeEnd');
		});
	this.paint();

};
morpheus.Divider.prototype = {
	dispose: function () {
		morpheus.AbstractCanvas.prototype.dispose.call(this);
		this.hammer.off('panstart', this.panstart).off('panmove', this.panmove).off('panend', this.panend);
		this.hammer.destroy();
	},
	getPreferredSize: function () {
		return {
			width: 3,
			height: this.getUnscaledHeight()
		};
	},
	draw: function (clip, context) {
		var width = this.getUnscaledWidth();
		var height = this.getUnscaledHeight();
		context.clearRect(0, 0, width, height);
		context.strokeStyle = 'black';
		if (!this.vertical) {// horizontal line at top
			context.beginPath();
			context.moveTo(0, 1.5);
			context.lineTo(width, 1.5);
			context.stroke();
		} else { // vertical line at left
			context.beginPath();
			context.moveTo(0, 0);
			context.lineTo(0, height);
			context.stroke();
		}
	}
};
morpheus.Util.extend(morpheus.Divider, morpheus.AbstractCanvas);
morpheus.Util.extend(morpheus.Divider, morpheus.Events);

morpheus.HeatMapTrackColorLegend = function(tracks, colorModel) {
	morpheus.AbstractCanvas.call(this, false);
	this.tracks = tracks;
	this.colorModel = colorModel;
	this.canvas.style.position = '';
};
morpheus.HeatMapTrackColorLegend.prototype = {
	getPreferredSize : function() {
		var tracks = this.tracks;
		var colorModel = this.colorModel;
		var xpix = 0;
		var ypix = 0;
		var maxYPix = 0;
		var canvas = this.canvas;
		var context = canvas.getContext('2d');
		context.font = '12px ' + morpheus.CanvasUtil.FONT_NAME;
		for (var i = 0; i < tracks.length; i++) {
			ypix = 0;
			var maxWidth = 0;
			var vector = tracks[i].getVector();
			var map = colorModel.getDiscreteColorScheme(vector);
			if (map == null) { // continuous
				maxWidth = 220;
				ypix += 40;
			} else {
				map.forEach(function(color, key) {
					var width = context.measureText(key).width;
					if (!isNaN(width)) {
						maxWidth = Math.max(maxWidth, width);
					}
					ypix += 14;
				});
			}
			maxWidth = Math.max(maxWidth,
					context.measureText(vector.getName()).width);
			xpix += maxWidth + 10 + 14;
			maxYPix = Math.max(maxYPix, ypix);
		}
		return {
			width : xpix,
			height : maxYPix > 0 ? (maxYPix + 30) : 0
		};
	},
	draw : function(clip, context) {
		var tracks = this.tracks;
		var colorModel = this.colorModel;
		var xpix = 0;
		// legends are placed side by side
		for (var i = 0; i < tracks.length; i++) {
			var ypix = 0;
			var vector = tracks[i].getVector();
			context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
			context.font = '12px ' + morpheus.CanvasUtil.FONT_NAME;
			context.textAlign = 'left';
			// draw name
			context.textBaseline = 'top';
			context.fillText(vector.getName(), xpix, ypix);

			context.strokeStyle = 'LightGrey';
			var maxWidth = 0;
			var textWidth = context.measureText(vector.getName()).width;
			if (!isNaN(textWidth)) {
				maxWidth = Math.max(0, textWidth);
			}
			ypix += 14;

			var scheme = colorModel.getContinuousColorScheme(vector);
			if (scheme != null) { // draw continuous color legend
				context.save();
				context.translate(xpix, ypix);
				morpheus.HeatMapColorSchemeLegend.drawColorScheme(context,
						scheme, 200);
				context.restore();
				maxWidth = Math.max(maxWidth, 220);
				ypix += 40;
			} else {
				var map = colorModel.getDiscreteColorScheme(vector);
				var values = map.keys().sort(
						morpheus.SortKey.ASCENDING_COMPARATOR);
				values.forEach(function(key) {
					if (key != null) {
						var color = colorModel.getMappedValue(vector, key);
						var textWidth = context.measureText(key).width;
						if (!isNaN(textWidth)) {
							maxWidth = Math.max(maxWidth, textWidth);
						}
						context.fillStyle = color;
						context.fillRect(xpix, ypix, 12, 12);
						context.strokeRect(xpix, ypix, 12, 12);
						context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
						context.fillText(key, xpix + 16, ypix);
						ypix += 14;
					}
				});
			}
			xpix += maxWidth + 10 + 14; // space between tracks + color chip
		}
	}
};
morpheus.Util.extend(morpheus.HeatMapTrackColorLegend, morpheus.AbstractCanvas);

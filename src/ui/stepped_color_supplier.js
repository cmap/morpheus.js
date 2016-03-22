morpheus.SteppedColorSupplier = function() {
	morpheus.AbstractColorSupplier.call(this);
	this.hiddenValue = 0;
	this.hiddenValues = new morpheus.Set();
	this.stepped = true;
};
/**
 * Convert value from input data range of input0 to input1 to pixel range of
 * pix0, pix1.
 * 
 * @return The converted value.
 */
morpheus.SteppedColorSupplier.linearScale = function(value, input0, input1,
		pix0, pix1) {
	return (value - input0) / (input1 - input0) * (pix1 - pix0) + pix0;
};
morpheus.SteppedColorSupplier.prototype = {
	createInstance : function() {
		return new morpheus.SteppedColorSupplier();
	},
	isStepped : function() {
		return true;
	},
	getHiddenValues : function() {
		return this.hiddenValues;
	},
	getIndexForFraction : function(f) {
		var fractions = this.fractions;
		if (f <= fractions[0]) {
			return 0;
		}
		if (f >= fractions[fractions.length - 1]) {
			return fractions.length - 1;
		}
		// Intervals exclude right end point and include left end point except
		// for the highest interval which includes everything > min
		for (var i = 0; i < fractions.length - 1; i++) {
			var left = fractions[i];
			var right = fractions[i + 1];
			if (f >= left && f < right) {
				return i;
			}
		}
		return fractions.length - 1;
	},
	getColor : function(row, column, value) {
		if (this.hiddenValues.has(value)) {
			value = this.hiddenValue;
		}
		if (isNaN(value)) {
			return this.missingColor;
		}
		var min = this.min;
		var max = this.max;
		var colors = this.colors;
		if (value <= min) {
			return colors[0];
		} else if (value >= max) {
			return colors[colors.length - 1];
		}
		var fraction = morpheus.SteppedColorSupplier.linearScale(value, min,
				max, 0, 100) / 100;
		return colors[this.getIndexForFraction(fraction)];
	}
};
morpheus.Util.extend(morpheus.SteppedColorSupplier,
		morpheus.AbstractColorSupplier);
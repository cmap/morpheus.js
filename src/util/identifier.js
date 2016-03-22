morpheus.Identifier = function(array) {
	this.array = array;
};
morpheus.Identifier.prototype = {
	toString : function() {
		return this.array.join(',');
	},
	equals : function(otherId) {
		var other = otherId.getArray();
		for (var i = 0, length = this.array; i < length; i++) {
			if (this.array[i] !== other[i]) {
				return false;
			}
		}
		return true;
	},
	getArray : function() {
		return this.array;
	}
};
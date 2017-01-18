/**
 *
 * Creates a new vector with the given name and size. Subclasses must implement getValue
 *
 * @param {string} name
 *            the vector name
 * @param size {number}
 *            the number of elements in this vector
 * @implements {morpheus.VectorProtocol}
 * @constructor
 */
morpheus.AbstractVector = function (name, size) {
	this.name = name;
	this.n = size;
	this.properties = new morpheus.Map();
};

morpheus.AbstractVector.prototype = {
	getValue: function (index) {
		throw new Error('Not implemented');
	},
	getProperties: function () {
		return this.properties;
	},
	size: function () {
		return this.n;
	},
	getName: function () {
		return this.name;
	}
};

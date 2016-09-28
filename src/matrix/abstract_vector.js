/**
 * @fileOverview A collection of values.
 *
 * Creates a new vector with the given name and size.
 *
 * @param name
 *            the vector name
 * @param size
 *            the number of elements in this vector
 * @constructor
 */
morpheus.AbstractVector = function (name, size) {
	this.name = name;
	this.n = size;
	this.properties = new morpheus.Map();
};

morpheus.AbstractVector.prototype = {

	/**
	 * Returns the value at the specified index.
	 *
	 * @param index the index
	 * @abstract
	 * @return the value
	 */
	getValue: function (index) {
		throw new Error('Not implemented');
	},
	getProperties: function () {
		return this.properties;
	},
	/**
	 * Returns the number of elements in this vector.
	 *
	 * @return the size.
	 */
	size: function () {
		return this.n;
	},
	/**
	 * Returns the name of this vector.
	 *
	 * @return the name
	 */
	getName: function () {
		return this.name;
	}
};

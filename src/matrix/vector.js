/**
 * @fileOverview A collection of values.
 */
/**
 * Creates a new vector with the given name and size.
 * 
 * @param name
 *            the vector name
 * @param size
 *            the number of elements in this vector
 * @constructor
 */
morpheus.Vector = function(name, size) {
	this.name = name;
	this.array = [];
	this.n = size;
	this.properties = new morpheus.Map();
};
/**
 * @static
 */
morpheus.Vector.fromArray = function(name, array) {
	var v = new morpheus.Vector(name, array.length);
	v.array = array;
	return v;
};
morpheus.Vector.prototype = {
	/**
	 * @ignore
	 * @param value
	 */
	push : function(value) {
		this.array.push(value);
	},
	/**
	 * Morpheus specific keys are morpheus.fields, morpheus.visibleFields,
	 * morpheus.function, morpheus.title, morpheus.histogram, morpheus.dataType.
	 * Recognized values for morpheus.dataType are string, number, [string], [number]
	 */
	getProperties : function() {
		return this.properties;
	},
	/**
	 * Sets the value at the specified index.
	 * 
	 * @param index
	 *            the index
	 * @param value
	 *            the value
	 */
	setValue : function(index, value) {
		this.array[index] = value;
	},
	/**
	 * Returns the value at the specified index.
	 * 
	 * @param index
	 *            the index
	 * @return the value
	 */
	getValue : function(index) {
		return this.array[index];
	},
	/**
	 * Returns the number of elements in this vector.
	 * 
	 * @return the size.
	 */
	size : function() {
		return this.n;
	},
	/**
	 * Returns the name of this vector.
	 * 
	 * @return the name
	 */
	getName : function() {
		return this.name;
	},
	/**
	 * @ignore
	 * @param name
	 */
	setName : function(name) {
		this.name = name;
	},
	/**
	 * @ignore
	 * @param array
	 * @returns {morpheus.Vector}
	 */
	setArray : function(array) {
		this.array = array;
		return this;
	}
};
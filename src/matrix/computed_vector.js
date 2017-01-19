/**
 * Creates a new computed vector with the given name and size.
 *
 * @param name
 *            the vector name
 * @param size
 *            the number of elements in this vector
 * @param callback {Function} that takes an index and returns the value at the specified index
 * @constructor
 */
morpheus.ComputedVector = function (name, size, callback) {
  morpheus.AbstractVector.call(this, name, size);
  this.callback = callback;
};

morpheus.ComputedVector.prototype = {
  getValue: function (index) {
    return this.callback(index);
  }
};
morpheus.Util.extend(morpheus.ComputedVector, morpheus.AbstractVector);

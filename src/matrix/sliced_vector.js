morpheus.SlicedVector = function (v, indices) {
  morpheus.VectorAdapter.call(this, v);
  this.indices = indices;
};
morpheus.SlicedVector.prototype = {
  setValue: function (i, value) {
    this.v.setValue(this.indices[i], value);
  },
  getValue: function (i) {
    return this.v.getValue(this.indices[i]);
  },
  size: function () {
    return this.indices.length;
  }
};
morpheus.Util.extend(morpheus.SlicedVector, morpheus.VectorAdapter);

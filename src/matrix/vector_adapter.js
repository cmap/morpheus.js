morpheus.VectorAdapter = function (v) {
  if (v == null) {
    throw 'vector is null';
  }
  this.v = v;
};
morpheus.VectorAdapter.prototype = {
  setValue: function (i, value) {
    this.v.setValue(i, value);
  },
  getValue: function (i) {
    return this.v.getValue(i);
  },
  getProperties: function () {
    return this.v.getProperties();
  },
  size: function () {
    return this.v.size();
  },
  getName: function () {
    return this.v.getName();
  },
  setName: function (name) {
    this.v.setName(name);
  }
};

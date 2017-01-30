morpheus.Identifier = function (array) {
  this.array = array;
};
morpheus.Identifier.prototype = {
  toString: function () {
    return this.array.join(',');
  },
  equals: function (otherId) {
    var other = otherId.getArray();
    var length = this.array.length;
    if (other.length !== length) {
      return false;
    }
    for (var i = 0; i < length; i++) {
      if (this.array[i] !== other[i]) {
        return false;
      }
    }
    return true;
  },
  getArray: function () {
    return this.array;
  }
};

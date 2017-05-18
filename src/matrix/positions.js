morpheus.Positions = function () {
  this.spaces = undefined;
  this.defaultPositionFunction = function (index) {
    return (this.size * index);
  };
  this.squishedPositionFunction = function (index) {
    return this.positions[index];
  };
  this.positionFunction = this.defaultPositionFunction;
  this.squishedIndices = {};
  this.isSquished = false;
};
morpheus.Positions.getBottom = function (rect, rowPositions) {
  var bottom = rowPositions.getLength();
  if (rect != null) {
    bottom = 1 + rowPositions.getIndex(rect.y + rect.height, false);
    bottom = Math.max(0, bottom);
    bottom = Math.min(rowPositions.getLength(), bottom);
  }
  return bottom;
};
morpheus.Positions.getTop = function (rect, rowPositions) {
  var top = 0;
  if (rect != null) {
    top = rowPositions.getIndex(rect.y, false) - 1;
    top = Math.max(0, top);
    top = Math.min(rowPositions.getLength(), top);
  }
  return top;
};
morpheus.Positions.getLeft = function (rect, columnPositions) {
  var left = 0;
  if (rect != null) {
    left = columnPositions.getIndex(rect.x, false) - 1;
    left = Math.max(0, left);
    left = Math.min(columnPositions.getLength(), left);
  }
  return left;
};
morpheus.Positions.getRight = function (rect, columnPositions) {
  var right = columnPositions.getLength();
  if (rect != null) {
    right = 1 + columnPositions.getIndex(rect.x + rect.width, false);
    right = Math.min(columnPositions.getLength(), right);
  }
  return right;
};
morpheus.Positions.prototype = {
  length: 0,
  size: 13,
  squishFactor: 0.1,
  compress: true,
  copy: function () {
    var copy = new morpheus.Positions();
    if (this.spaces) {
      copy.spaces = this.spaces.slice();
    }
    copy.compress = this.compress;
    copy.squishFactor = this.squishFactor;
    copy.size = this.size;
    copy.length = this.length;
    if (this.isSquished) {
      copy.positionFunction = copy.squishedPositionFunction;
      copy.squishedIndices = _.clone(this.squishedIndices);
      copy.isSquished = true;
    }
    return copy;
  },
  getIndex: function (position, exact) {
    if (this.getLength() === 0) {
      return -1;
    }
    if (exact) {
      return this.binaryExactSearch(position);
    } else {
      return this.binaryInExactSearch(position);
    }
  },
  getLength: function () {
    return this.length;
  },
  getPosition: function (index) {
    return this.positionFunction(index)
      + (this.spaces !== undefined ? this.spaces[index] : 0);
  },
  getItemSize: function (index) {
    return this.squishedIndices[index] === true ? this.size
      * this.squishFactor : this.size;
  },
  getSize: function () {
    return this.size;
  },
  setSpaces: function (spaces) {
    this.spaces = spaces;
  },
  setLength: function (length) {
    this.length = length;
    this.trigger('change', {
      source: this,
      value: 'length'
    });
  },
  setSize: function (size) {
    this.size = size;
    if (this.isSquished) {
      this.setSquishedIndices(this.squishedIndices);
    }
    this.trigger('change', {
      source: this,
      value: 'size'
    });
  },
  setSquishedIndices: function (squishedIndices) {
    if (squishedIndices != null) {
      var compress = this.compress;
      this.squishedIndices = squishedIndices;
      var positions = [];
      var squishFactor = this.squishFactor;
      var size = this.size;
      var position = 0;
      for (var i = 0, length = this.getLength(); i < length; i++) {
        var itemSize;
        if (squishedIndices[i] === true) {
          positions.push(position);
          itemSize = size * squishFactor;
          position += itemSize;
        } else {
          if (!compress) {
            position = size * i;
          }
          positions.push(position);
          position += size;
        }
      }
      this.isSquished = true;
      this.positions = positions;
      this.positionFunction = this.squishedPositionFunction;
    } else {
      this.squishedIndices = {};
      this.isSquished = false;
      this.positionFunction = this.defaultPositionFunction;
    }
    this.trigger('change', {
      source: this,
      value: 'squishedIndices'
    });
  },
  setSquishFactor: function (f) {
    if (this.squishFactor !== f) {
      this.squishFactor = f;
      if (this.isSquished) {
        this.setSquishedIndices(this.squishedIndices);
      }
      this.trigger('change', {
        source: this,
        value: 'squishFactor'
      });
    }
  },
  getSquishFactor: function () {
    return this.squishFactor;
  },
  binaryExactSearch: function (position) {
    var low = 0;
    var high = this.length - 1;
    while (low <= high) {
      var mid = (low + high) >> 1;
      var midVal = this.getPosition(mid);
      var size = this.getItemSize(mid);
      if (midVal <= position && position < (midVal + size)) {
        return mid;
      }
      if (midVal < position) {
        low = mid + 1;
      } else if (midVal > position) {
        high = mid - 1;
      } else {
        return mid;
        // key found
      }
    }
    return -1;
    // key not found
  },
  binaryInExactSearch: function (position) {
    var low = 0;
    var high = this.getLength() - 1;
    var maxIndex = this.getLength() - 1;
    if (position <= this.getPosition(0)) {
      return 0;
    }
    while (low <= high) {
      var mid = (low + high) >> 1;
      var midVal = this.getPosition(mid);
      var size = this.getItemSize(mid);
      var nextStart = maxIndex === mid ? midVal + size : this
      .getPosition(mid + 1);
      if (midVal <= position && position < nextStart) {
        return mid;
      }
      if (midVal < position) {
        low = mid + 1;
      } else if (midVal > position) {
        high = mid - 1;
      } else {
        return mid;
        // key found
      }
    }
    return low - 1;
    // key not found
  }
};

morpheus.Util.extend(morpheus.Positions, morpheus.Events);

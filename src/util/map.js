morpheus.Map = function () {
  this.map = {}; // object string -> key, value
  // the key field is stored to get the original key object back
  this.n = 0;
};
morpheus.Map.prototype = {
  toString: function () {
    var s = [];
    this.forEach(function (value, key) {
      if (s.length > 0) {
        s.push(', ');
      }
      s.push(key);
      s.push('=');
      s.push(value);
    });
    return s.join('');
  },
  keys: function () {
    var keys = [];
    for (var key in this.map) {
      var pair = this.map[key];
      keys.push(pair.key);
    }
    return keys;
  },
  size: function () {
    return this.n;
  },
  equals: function (m) {
    if (m.size() !== this.size()) {
      return false;
    }
    var ret = true;
    try {
      this.forEach(function (value, key) {
        if (value !== m.get(key)) {
          ret = false;
          throw 'break'; // break out of loop
        }
      });
    }
    catch (e) {
    }
    return ret;
  },
  setAll: function (map) {
    var _this = this;
    map.forEach(function (value, key) {
      _this.set(key, value);
    });
  },
  set: function (key, value) {
    var skey = '\0' + key;
    var previous = this.map[skey];
    if (previous === undefined) { // only increment size when this is a
      // new key
      this.n++;
    }
    this.map[skey] = {
      key: key,
      value: value
    };
  },
  forEach: function (callback) {
    for (var key in this.map) {
      var pair = this.map[key];
      callback(pair.value, pair.key);
    }
  },
  entries: function () {
    var array = [];
    this.forEach(function (value, key) {
      array.push({
        value: value,
        key: key
      });
    });
    return array;
  },
  values: function () {
    var values = [];
    for (var key in this.map) {
      var pair = this.map[key];
      values.push(pair.value);
    }
    return values;
  },
  get: function (key) {
    var skey = '\0' + key;
    var pair = this.map[skey];
    return pair !== undefined ? pair.value : undefined;
  },
  clear: function () {
    this.map = {};
    this.n = 0;
  },
  remove: function (key) {
    var skey = '\0' + key;
    var pair = this.map[skey];
    if (pair !== undefined) {
      delete this.map[skey];
      this.n--;
      return pair.value;
    }
  },
  has: function (key) {
    var skey = '\0' + key;
    return this.map[skey] !== undefined;
  }
};

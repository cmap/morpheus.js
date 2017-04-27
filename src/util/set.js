morpheus.Set = function () {
  this._map = new morpheus.Map();
};
morpheus.Set.prototype = {
  toJSON: function () {
    var json = [];
    this.forEach(function (value) {
      json.push(value);
    });
    return json;
  },
  toString: function () {
    var s = [];
    this.forEach(function (key) {
      if (s.length > 0) {
        s.push(', ');
      }
      s.push(key);
    });
    return s.join('');
  },
  size: function () {
    return this._map.size();
  },
  equals: function (m) {
    return this._map.equals(m);
  },
  forEach: function (callback) {
    this._map.forEach(function (value, key) {
      callback(key);
    });
  },
  add: function (value) {
    this._map.set(value, true);
  },
  values: function () {
    var values = [];
    this._map.forEach(function (value, key) {
      values.push(key);
    });
    return values;
  },
  clear: function () {
    this._map.clear();
  },
  remove: function (key) {
    this._map.remove(key);
  },
  has: function (key) {
    return this._map.has(key);
  }
};

morpheus.Set.fromJSON = function (json) {
  var set = new morpheus.Set();
  for (var i = 0, length = json.length; i < length; i++) {
    set.add(json[i]);
  }
  return set;
};

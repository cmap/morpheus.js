morpheus.VectorFontModel = function () {
  this.vectorNameToMappedValue = new morpheus.Map();
  this.fonts = morpheus.VectorFontModel.FONTS;

};

morpheus.VectorFontModel.FONTS = [{weight: 400}, {weight: 700}, {weight: 900}];
// 400 (normal), 700 (bold), 900 (bolder)

morpheus.VectorFontModel.prototype = {
  toJSON: function (tracks) {
    var _this = this;
    var json = {};
    tracks.forEach(function (track) {
      if (track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT) && track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_FONT)) {
        var map = _this.vectorNameToMappedValue.get(track.getName());
        if (map != null) {
          json[track.getName()] = map;
        }
      }
    });
    return json;
  },
  fromJSON: function (json) {
    for (var name in json) {
      var obj = json[name];
      this.vectorNameToMappedValue.set(name, morpheus.Map.fromJSON(obj));
    }
  },
  clear: function (vector) {
    this.vectorNameToMappedValue.remove(vector.getName());
  },
  copy: function () {
    var c = new morpheus.VectorFontModel();
    c.fonts = this.fonts.slice(0);
    this.vectorNameToMappedValue.forEach(function (fontMap, name) {
      var newFontMap = new morpheus.Map();
      newFontMap.setAll(fontMap); // copy existing values
      c.vectorNameToMappedValue.set(name, newFontMap);
    });
    return c;
  },
  clearAll: function () {
    this.vectorNameToMappedValue = new morpheus.Map();
  },
  _getFontForValue: function (value) {
    if (value == null) {
      return morpheus.VectorFontModel.FONTS[0];
    }
    // try to reuse existing map
    var existingMetadataValueToFontMap = this.vectorNameToMappedValue
      .values();
    for (var i = 0, length = existingMetadataValueToFontMap.length; i < length; i++) {
      var font = existingMetadataValueToFontMap[i].get(value);
      if (font !== undefined) {
        return font;
      }
    }
  },
  getMap: function (name) {
    return this.vectorNameToMappedValue.get(name);
  },
  getMappedValue: function (vector, value) {
    var metadataValueToFontMap = this.vectorNameToMappedValue.get(vector
      .getName());
    if (metadataValueToFontMap === undefined) {
      metadataValueToFontMap = new morpheus.Map();
      this.vectorNameToMappedValue.set(vector.getName(),
        metadataValueToFontMap);
      // set all possible values
      var values = morpheus.VectorUtil.getValues(vector);
      for (var i = 0, nvalues = values.length; i < nvalues; i++) {
        var font = this._getFontForValue(values[i]);
        if (font == null) {
          font = this.fonts[0]; // default is normal
        }
        metadataValueToFontMap.set(values[i], font);
      }
    }
    var font = metadataValueToFontMap.get(value);
    if (font == null) {
      font = this._getFontForValue(value);
      if (font == null) {
        font = this.fonts[0]; // default is normal
      }
      metadataValueToFontMap.set(value, font);
    }
    return font;
  },
  setMappedValue: function (vector, value, font) {
    var metadataValueToFontMap = this.vectorNameToMappedValue.get(vector
      .getName());
    if (metadataValueToFontMap === undefined) {
      metadataValueToFontMap = new morpheus.Map();
      this.vectorNameToMappedValue.set(vector.getName(),
        metadataValueToFontMap);
    }
    metadataValueToFontMap.set(value, font);
  }
};

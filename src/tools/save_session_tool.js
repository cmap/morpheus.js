morpheus.SaveSessionTool = function () {
};
morpheus.SaveSessionTool.prototype = {
  toString: function () {
    return 'Save Session';
  },
  init: function (project, form) {
    form.find('file_name').prop('autofocus', true).focus();
  },
  gui: function () {
    return [
      {
        name: 'file_name',
        type: 'text',
        required: true
      }];
  },
  execute: function (options) {
    var fileName = options.input.file_name;
    if (fileName === '') {
      fileName = 'session.json';
    }
    if (!morpheus.Util.endsWith(fileName.toLowerCase(), '.json')) {
      fileName += '.json';
    }
    var heatMap = options.heatMap;
    // var options = {dataset: options.input.include_dataset};
    var options = {dataset: true};
    var json = heatMap.toJSON(options);
    var nativeArrayToArray = Array.from || function (typedArray) {
        var normalArray = Array.prototype.slice.call(typedArray);
        normalArray.length === typedArray.length;
        normalArray.constructor === Array;
      };
    var blob = new Blob([JSON.stringify(json, function (key, value) {
      if (morpheus.Util.isArray(value)) {
        return value instanceof Array ? value : nativeArrayToArray(value);
      }
      return value;
    })], {type: 'application/json;charset=charset=utf-8'});
    saveAs(blob, fileName, true);
  }
};

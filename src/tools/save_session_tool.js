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
        name: 'include_dataset',
        type: 'checkbox',
        value: true
      }, {
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
    var controller = options.controller;
    var options = {dataset: options.input.include_dataset};
    var json = controller.toJson(options);
    var blob = new Blob([JSON.stringify(json)], {type: 'application/json;charset=charset=utf-8'});
    saveAs(blob, fileName, true);
  }
};

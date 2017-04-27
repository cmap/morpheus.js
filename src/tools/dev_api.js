morpheus.DevAPI = function () {
};
morpheus.DevAPI.prototype = {
  toString: function () {
    return 'API';
  },
  gui: function () {
    return [{
      name: 'code',
      value: '',
      type: 'textarea',
      required: true,
      help: 'Enter your code'
    }];
  },
  execute: function (options) {
    var heatMap = options.heatMap;
    var code = options.input.code;
    eval(code);
    // force a repaint of everything
    heatMap.getProject().setFullDataset(heatMap.getProject().getFullDataset(), true);
  }
};

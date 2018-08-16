morpheus.DialogUtil = function () {

};

morpheus.DialogUtil.DIALOGS = [];

morpheus.DialogUtil.add = function (d) {
  morpheus.DialogUtil.DIALOGS.push(d);
};

morpheus.DialogUtil.remove = function (d) {
  var found = false;
  for (var i = 0, n = morpheus.DialogUtil.DIALOGS.length; i < n; i++) {
    if (d === morpheus.DialogUtil.DIALOGS[i]) {
      morpheus.DialogUtil.DIALOGS.splice(i, 1);
      found = true;
      break;
    }
  }
  if (!found) {
    console.log('Dialog not found.');
  }
};

morpheus.DialogUtil.clear = function () {
  morpheus.DialogUtil.DIALOGS.forEach(function (d) {
    d.remove();
  });
  morpheus.DialogUtil.DIALOGS = [];
};

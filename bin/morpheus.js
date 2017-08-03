var fs = require('fs');
var system = require('system');
var webPage = require('webpage');
var args = system.args;
if (args.length !== 4) {
  console.log('Usage phantomjs morpheus.js options outputFile outputFormat');
  phantom.exit();
}

var page = webPage.create();
page.settings.localToRemoteUrlAccessEnabled = true;
//page.settings.webSecurityEnabled = false;
page.onError = function (msg, trace) {
  var msgStack = ['ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function (t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
    });
  }
  console.error(msgStack.join('\n'));

};
page.onConsoleMessage = function (msg) {
  console.log(msg);
};
var options = args[1];
var outputFile = args[2];
var outputFormat = args[3];

var createImage = function () {

  page.open('index.html', function (status) {
    page.evaluate(function (data) {
      var options = data.options;
      options.interactive = false;
      options.loadedCallback = function (heatMap) {
        window.saveAs = function (blob) {
          var reader = new FileReader();
          reader.onloadend = function () {
            window.callPhantom(reader.result);
          };
          reader.readAsBinaryString(blob);
        };
        heatMap.saveImage('tmp', data.outputFormat);
      };
      new morpheus.HeatMap(options);
    }, {outputFormat: outputFormat, options: options});
    page.onCallback = function (binaryStr) {
      var out = fs.open(outputFile, 'wb');
      out.write(binaryStr);
      out.close();
      phantom.exit();
    };
  });
};

if (fs.exists(options)) {
  var content = fs.read(options).trim();
  options = JSON.parse(content);
}
createImage();







morpheus.BufferedReader = function (reader, callback, doneCallback) {
  var textDecoder = morpheus.Util.createTextDecoder();
  var skipLF = false;
  var text = '';
  reader.read().then(function processResult(result) {
    // result contains a value which is an array of Uint8Array
    text += (result.then ? '' : textDecoder(result.value, 0, result.value.length));
    var start = 0;
    // TODO no need to search previous chunk of text
    for (var i = 0, length = text.length; i < length; i++) {
      var c = text[i];
      if (skipLF && c === '\n') {
        start++;
        skipLF = false;
      } else if (c === '\n' || c === '\r') {
        skipLF = c === '\r'; // \r\n windows line ending
        var s = morpheus.Util.copyString(text.substring(start, i));
        callback(s);
        start = i + 1;
      } else {
        skipLF = false;
      }
    }
    text = start < text.length ? text.substring(start) : '';
    if (!result.then) {
      return reader.read().then(processResult);
    } else {
      if (text !== '' && text !== '\r') {
        callback(text);
      }
      doneCallback();
    }
  });
};

morpheus.BufferedReader.parse = function (url, options) {
  var delim = options.delimiter;
  var regex = new RegExp(delim);
  var handleTokens = options.handleTokens;
  var complete = options.complete;

  var fetchOptions = {};
  if (url.headers) {
    fetchOptions.headers = new Headers();
    for (var header in url.headers) {
      fetchOptions.headers.append(header, url.headers[header]);
    }
  }
  fetch(url, fetchOptions).then(function (response) {
    if (response.ok) {
      var reader = response.body.getReader();
      new morpheus.BufferedReader(reader, function (line) {
        handleTokens(line.split(regex));
      }, function () {
        complete();
      });
    } else {
      options.error('Network error');
    }
  }).catch(function (error) {
    options.error(error);
  });
};


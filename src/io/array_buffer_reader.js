morpheus.ArrayBufferReader = function (buffer) {
  this.buffer = buffer;
  this.bufferLength = buffer.length;
  this.index = 0;
  this.decoder = morpheus.Util.createTextDecoder();
};

morpheus.ArrayBufferReader.prototype = {
  readLine: function () {
    var index = this.index;
    var bufferLength = this.bufferLength;
    if (index >= bufferLength) {
      return null;
    }
    var buffer = this.buffer;
    var start = index;
    var end = start;
    // dos: \r\n, old mac:\r
    for (; index < bufferLength; index++) {
      var c = buffer[index];
      if (c === 10 || c === 13) { // \n or \r
        end = index;
        if ((index !== bufferLength - 1) && buffer[index + 1] === 10) { // skip
          // ahead
          index++;
        }
        index++;
        break;
      }
    }
    this.index = index;
    if (start === end && index === bufferLength) { // eof
      return this.decoder(this.buffer, start, bufferLength);
    }

    return this.decoder(this.buffer, start, end);

  }
};

morpheus.ArrayBufferReader.getArrayBuffer = function (fileOrUrl, callback) {
  var isString = typeof fileOrUrl === 'string' || fileOrUrl instanceof String;
  if (isString) { // URL
    var fetchOptions = {};
    if (fileOrUrl.headers) {
      fetchOptions.headers = new Headers();
      for (var header in fileOrUrl.headers) {
        fetchOptions.headers.append(header, fileOrUrl.headers[header]);
      }
    }
    fetch(fileOrUrl, fetchOptions).then(function (response) {
      if (response.ok) {
        return response.arrayBuffer();
      } else {
        callback(new Error(fileOrUrl + ' status: ' + response.status));
      }
    }).then(function (buf) {
      callback(null, buf);
    }).catch(function (error) {
      console.log('Fetch error');
      callback(error);
    });

  } else {
    var reader = new FileReader();
    reader.onload = function (event) {
      callback(null, event.target.result);
    };
    reader.onerror = function (event) {
      callback(event);
    };
    reader.readAsArrayBuffer(fileOrUrl);
  }
};

morpheus.BufferedReader = function (buffer) {
	this.buffer = buffer;
	this.bufferLength = buffer.length;
	this.index = 0;
	if (typeof TextDecoder !== 'undefined') {
		var textDecoder = new TextDecoder();
		this.decoder = function (buf, start, end) {
			return textDecoder.decode(buf.subarray(start, end));
		};
	} else {
		this.decoder = function (buf, start, end) {
			// TODO convert in chunks
			var s = [];
			for (var i = start; i < end; i++) {
				s.push(String.fromCharCode(buffer[i]));
			}
			return s.join('');
		};
	}
};

morpheus.BufferedReader.prototype = {
	readLine: function () {
		var index = this.index;
		var bufferLength = this.bufferLength;
		if (index >= bufferLength) {

			return null;
		}
		var buffer = this.buffer;
		var start = index;
		var end = start;
		for (; index < bufferLength; index++) {
			var c = buffer[index];
			if (c === 10 || c === 13) { // \n or \r
				end = index;
				if ((index !== bufferLength - 1)
					&& (buffer[index + 1] === 10 || buffer[index + 1] === 13)) { // skip
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

morpheus.BufferedReader.getArrayBuffer = function (fileOrUrl, callback) {
	var isString = typeof fileOrUrl === 'string' || fileOrUrl instanceof String;
	if (isString) { // URL
		var oReq = new XMLHttpRequest();
		oReq.open('GET', fileOrUrl, true);
		oReq.responseType = 'arraybuffer';
		oReq.onload = function (oEvent) {
			callback(null, oReq.response);
		};

		// oReq.onprogress = function(oEvent) {
		// if (oEvent.lengthComputable) {
		// var percentComplete = oEvent.loaded / oEvent.total;
		// console.log(percentComplete + '%')
		// } else {
		// console.log(oEvent.loaded + ' loaded')
		// }
		// };

		oReq.onerror = function (oEvent) {
			callback(oEvent);
		};
		oReq.onreadystatechange = function (oEvent) {
			if (oReq.readyState === 4 && oReq.status !== 200) {
				oReq.onload = null;
				oReq.onerror = null;
				if (oReq.status === 404) {
					callback(new Error(fileOrUrl + ' not found.'));
				} else {
					callback(new Error('Unable to read ' + fileOrUrl + '.'));
				}
			}
		};

		oReq.send(null);
		return oReq;
	} else {
		var reader = new FileReader();
		reader.onload = function (event) {
			callback(null, event.target.result);
		};
		reader.onerror = function (event) {
			callback(event);
		};
		reader.readAsArrayBuffer(fileOrUrl);
		return reader;
	}
};

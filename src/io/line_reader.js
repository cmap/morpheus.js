morpheus.LineReader = function(fileOrUrl, options) {
	var _this = this;
	this.str = '';
	var isString = _.isString(fileOrUrl);
	if (typeof TextDecoder !== 'undefined') {
		var textDecoder = new TextDecoder();
		this.decoder = function(buf, start, end) {
			return textDecoder.decode(buf.subarray(start, end));
		};
	} else {
		this.decoder = function(buf, start, end) {
			// TODO convert in chunks
			var s = '';
			for (var i = start; i < end; i++) {
				s += String.fromCharCode(buf[i]);
			}
			return s;
		};
	}
	var inputStreamOptions = {
		bytes : function(buf) {
			_this.str += _this.decoder(buf, 0, buf.length);
			var split = morpheus.LineReader._split(_this.str);
			if (split.lines.length > 0) {
				var lines = split.lines;
				for (var i = 0, nlines = lines.length; i < nlines; i++) {
					var line = lines[i];
					if (line !== '') {
						options.line(line);
					}
				}
				_this.str = split.remainder;
			}
		},
		complete : function() {
			options.complete();
		}
	};
	isString ? new morpheus.FetchNetworkInputStream(fileOrUrl,
			inputStreamOptions) : new morpheus.FileInputStream(fileOrUrl,
			inputStreamOptions);

};

morpheus.LineReader._split = function(str) {
	var lines = [];
	var start = 0;
	var length = str.length;
	for (var i = 0; i < length; i++) {
		var c = str[i];
		if (c === '\n' || c === '\r') {
			var end = i;
			if ((i < length - 1) && (str[i + 1] === '\n')) { // check for
				// \r\n

				i++;
			}

			lines.push(str.substring(start, end));
			start = i + 1;
		}
	}

	return {
		lines : lines,
		remainder : start <= length ? str.substring(start, length) : ''
	};
};

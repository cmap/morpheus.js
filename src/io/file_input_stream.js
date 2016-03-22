morpheus.FileInputStream = function(file, options) {
	var _this = this;
	this.options = options || {};
	this.reader = new FileReader();
	this.reader.onloadend = function(evt) {
		if (evt.target.readyState === FileReader.DONE) {

			var arrayBuffer = evt.target.result;
			var byteArray = new Uint8Array(arrayBuffer);
			_this.bytePosition += byteArray.length;
			_this.bytesRead += byteArray.length;
			_this.options.bytes(byteArray);
			if (_this.bytesRead < _this.fileSize) {
				_this.read();
			} else {
				options.complete();
			}
		}
	};
	this.file = file;
	this.bytePosition = 0;
	this.chunkSize = options.chunkSize || 1024 * 1024 * 10; // 10 MB
	this.bytesRead = 0;
	this.fileSize = file.size;
	this.read();
};

morpheus.FileInputStream.prototype = {
	read : function() {
		var _this = this;
		var end = this.bytePosition + this.chunkSize;
		end = Math.min(end, this.fileSize);
		// byte
		// range is
		// exclusive
		var blob = this.file.slice(this.bytePosition, end);
		this.reader.readAsArrayBuffer(blob);
	}
};
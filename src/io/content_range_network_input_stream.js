morpheus.ContentRangeNetworkInputStream = function(url, options) {
	var _this = this;
	this.options = options || {};
	this.url = url;
	this.bytePosition = 0;
	this.chunkSize = options.chunkSize || 1024 * 1024 * 10; // 50 MB
	this.bytesRead = 0;
	this.fileSize = -1;
	this.read();
};

morpheus.ContentRangeNetworkInputStream.prototype = {
	read : function() {

		var _this = this;
		var oReq = new XMLHttpRequest();
		oReq.open('GET', this.url, true);
		oReq.responseType = 'arraybuffer';

		oReq.onload = function(oEvent) {
			var arrayBuffer = oReq.response;
			var byteArray = new Uint8Array(arrayBuffer);
			var contentRange = oReq.getResponseHeader('Content-Range');
			var index = contentRange.lastIndexOf('/');
			_this.fileSize = parseInt(contentRange.substring(index + 1));
			_this.bytePosition += byteArray.length;
			_this.bytesRead += byteArray.length;
			_this.options.bytes(byteArray);
			if (_this.bytesRead < _this.fileSize) {
				_this.read();
			} else {
				_this.options.complete();
			}
		};
		var end = this.bytePosition + this.chunkSize - 1;
		if (this.fileSize !== -1) {
			end = Math.min(end, this.fileSize - 1);
		}
		// byte range is inclusive
		oReq
				.setRequestHeader('Range', 'bytes=' + this.bytePosition + '-'
						+ end);
		oReq.setRequestHeader('If-None-Match', 'webkit-no-cache'); //
		// https://bugs.webkit.org/show_bug.cgi?id=82672

		oReq.onerror = function() {
			console.log('error');
		};
		oReq.send(null);

	}
};

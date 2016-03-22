morpheus.FetchNetworkInputStream = function(url, options) {
	var bytesRead = 0;
	var fileSize = 0;

	function pump(reader) {
		return reader.read().then(function(result) {
			if (result.done) {
				options.complete();
				return;
			}
			var chunk = result.value;
			bytesRead += chunk.byteLength;
			options.bytes(chunk);
			return pump(reader);

		});
	}
	fetch(url).then(function(res) {
		// _this.fileSize = res.headers.get('Content-Length');
		return pump(res.body.getReader());
	});
};

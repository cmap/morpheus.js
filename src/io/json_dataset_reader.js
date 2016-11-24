morpheus.JsonDatasetReader = function () {

};

morpheus.JsonDatasetReader.prototype = {
	read: function (fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util.getFileName(fileOrUrl));
		var isString = typeof fileOrUrl === 'string' || fileOrUrl instanceof String;
		if (isString) {
			$.ajax(fileOrUrl).done(function (json) {
				callback(null, morpheus.Dataset.fromJson(json));
			}).fail(function (err) {
				callback(err);
			});
		} else {
			var reader = new FileReader();
			reader.onload = function (event) {
				callback(null, morpheus.Dataset.fromJson(JSON.parse(event.target.result)));
			};
			reader.onerror = function (event) {
				callback(event);
			};
			reader.readAsText(fileOrUrl);
		}

	},
};

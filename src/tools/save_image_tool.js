morpheus.SaveImageTool = function () {
};
morpheus.SaveImageTool.prototype = {
	toString: function () {
		return 'Save Image';
	},
	init: function (project, form) {
		form.find('file_name').prop('autofocus', true);
	},
	gui: function () {
		return [{
			name: 'file_name',
			type: 'text',
			required: true
		}, {
			name: 'format',
			type: 'select',
			options: ['png', 'svg'],
			value: 'png',
			required: true
		}];
	},
	execute: function (options) {
		var fileName = options.input.file_name;
		var format = options.input.format;
		if (!morpheus.Util.endsWith(fileName.toLowerCase(), '.' + format)) {
			fileName += '.' + format;
		}
		var controller = options.controller;
		controller.saveImage(fileName, format);
	}
};

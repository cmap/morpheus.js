morpheus.DevAPI = function() {
};
morpheus.DevAPI.prototype = {
	toString : function() {
		return 'API';
	},
	gui : function() {
		return [ {
			name : 'code',
			value : '',
			type : 'textarea',
			required : true,
			help : 'Enter your code'
		} ];
	},
	execute : function(options) {
		var project = options.project;
		var controller = options.controller;
		var code = options.input.code;
		var dataset = project.getSortedFilteredDataset();
		eval(code);
		project.setFullDataset(project.getFullDataset(), true);
	}
};
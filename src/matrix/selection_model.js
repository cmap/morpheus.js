morpheus.SelectionModel = function (project, isColumns) {
	this.viewIndices = new morpheus.Set();
	this.project = project;
	this.isColumns = isColumns;
};
morpheus.SelectionModel.prototype = {
	setViewIndices: function (indices, notify) {
		this.viewIndices = indices;
		if (notify) {
			this.trigger('selectionChanged');
		}
	},
	isViewIndexSelected: function (index) {
		return this.viewIndices.has(index);
	},
	clear: function () {
		this.viewIndices = new morpheus.Set();
	},
	/**
	 *
	 * @returns {morpheus.Set}
	 */
	getViewIndices: function () {
		return this.viewIndices;
	},
	count: function () {
		return this.viewIndices.size();
	},
	toModelIndices: function () {
		var project = this.project;
		var f = this.isColumns ? project.convertViewColumnIndexToModel
			: project.convertViewRowIndexToModel;
		f = _.bind(f, project);
		var modelIndices = [];
		this.viewIndices.forEach(function (index) {
			var m = f(index);
			modelIndices.push(m);
		});
		return modelIndices;
	},
	save: function () {
		this.modelIndices = this.toModelIndices();
	},
	restore: function () {
		var project = this.project;
		this.viewIndices = new morpheus.Set();
		var f = this.isColumns ? project.convertModelColumnIndexToView
			: project.convertModelRowIndexToView;
		f = _.bind(f, project);
		for (var i = 0, length = this.modelIndices.length; i < length; i++) {
			var index = f(this.modelIndices[i]);
			if (index !== -1) {
				this.viewIndices.add(index);
			}
		}
	},
};
morpheus.Util.extend(morpheus.SelectionModel, morpheus.Events);

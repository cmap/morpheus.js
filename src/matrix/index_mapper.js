morpheus.IndexMapper = function (project, isRows) {
	this.project = project;
	this.isRows = isRows;
	this.sortKeys = [];
	/**
	 * {morpheus.Map} Maps from model index to view index. Note that not all
	 * model indices are contained in the map because they might have been
	 * filtered from the view.
	 */
	this.modelToView = null;
	/** {Array} filtered model indices */
	this.filteredModelIndices = null;
	/** {Array} sorted and filtered model indices */
	this.filteredSortedModelIndices = null;
	this.filter = new morpheus.CombinedFilter(true);
	this._filter();
	this._sort();
};

morpheus.IndexMapper.prototype = {
	convertModelIndexToView: function (modelIndex) {
		var index = this.modelToView.get(modelIndex);
		return index !== undefined ? index : -1;
	},
	convertViewIndexToModel: function (viewIndex) {
		return (viewIndex < this.filteredSortedModelIndices.length
		&& viewIndex >= 0 ? this.filteredSortedModelIndices[viewIndex]
			: -1);
	},
	convertToView: function () {
		return this.filteredSortedModelIndices;
	},
	setFilter: function (filter) {
		this.filter = filter;
		this._filter();
		this._sort();
	},
	_filter: function () {
		var filter = this.filter;
		var dataset = this.project.getFullDataset();
		var count = this.isRows ? dataset.getRowCount() : dataset.getColumnCount();
		var filteredModelIndices;
		if (filter != null) {
			filter.init(dataset); // filter needs to transpose if columns
			if (filter.isEnabled()) {
				filteredModelIndices = [];

				for (var i = 0; i < count; i++) {
					if (filter.accept(i)) {
						filteredModelIndices.push(i);
					}
				}
			}
		}

		this.filteredModelIndices = filteredModelIndices != null ? filteredModelIndices
			: morpheus.Util.seq(count);
	},
	_sort: function () {
		var sortKeys = this.sortKeys;
		if (sortKeys.length > 0) {
			var dataset = this.project.getFullDataset();

			var nkeys = sortKeys.length;
			for (var i = 0; i < nkeys; i++) {
				sortKeys[i].init(sortKeys[i].isColumns() ? new morpheus.TransposedDatasetView(dataset) : dataset, this.filteredSortedModelIndices);
			}
			this.filteredSortedModelIndices = this.filteredModelIndices
			.slice(0);
			this.filteredSortedModelIndices.sort(function (a, b) {
				for (var i = 0; i < nkeys; i++) {
					var key = sortKeys[i];
					var comparator = key.getComparator();
					var val1 = key.getValue(a);
					var val2 = key.getValue(b);
					var c = comparator(val1, val2);
					if (c !== 0) {
						return c;
					}
				}
				return 0;
			});
		} else {
			this.filteredSortedModelIndices = this.filteredModelIndices;
		}

		var modelToView = new morpheus.Map();
		for (var i = 0, length = this.filteredSortedModelIndices.length; i < length; i++) {
			modelToView.set(this.filteredSortedModelIndices[i], i);
		}
		this.modelToView = modelToView;
	},
	getFilter: function () {
		return this.filter;
	},
	getViewCount: function () {
		if (this.project.getFullDataset() == null) {
			return 0;
		}
		return this.filteredSortedModelIndices.length;
	},
	setSelectedModelIndices: function (selectedModelIndices) {
		this.selectionModel.setSelectedModelIndices(selectedModelIndices);
	},
	setSortKeys: function (sortKeys) {
		if (sortKeys == null) {
			sortKeys = [];
		}
		this.sortKeys = sortKeys;
		this._sort();
	}
};

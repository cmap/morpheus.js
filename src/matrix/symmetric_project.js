morpheus.SymmetricProject = function(dataset) {
	this.originalDataset = dataset;
	this.indexMapper = new morpheus.IndexMapper(this, true);
	this.groups = [];
	this.colorModel = new morpheus.VectorColorModel();
	this.shapeModel = new morpheus.VectorShapeModel();
	this.hoverRowIndex = -1;
	this.hoverColumnIndex = -1;
	this.selectionModel = new morpheus.SelectionModel(this, false);
	this.elementSelectionModel = new morpheus.ElementSelectionModel(this);
};

morpheus.SymmetricProject.prototype = {
	getHoverColumnIndex : function() {
		return this.hoverColumnIndex;
	},
	setHoverColumnIndex : function(index) {
		this.hoverColumnIndex = index;
	},
	getHoverRowIndex : function() {
		return this.hoverRowIndex;
	},
	setHoverRowIndex : function(index) {
		this.hoverRowIndex = index;
	},
	getRowColorModel : function() {
		return this.colorModel;
	},
	getRowShapeModel : function() {
		return this.shapeModel;
	},
	getColumnShapeModel : function() {
		return this.shapeModel;
	},
	getGroupRows : function() {
		return this.groups;
	},
	getGroupColumns : function() {
		return this.groups;
	},
	getFullDataset : function() {
		return this.originalDataset;
	},
	getColumnSelectionModel : function() {
		return this.selectionModel;
	},
	getRowSelectionModel : function() {
		return this.selectionModel;
	},
	getElementSelectionModel : function() {
		return this.elementSelectionModel;
	},
	getFilteredSortedRowIndices : function() {
		return this.indexMapper.convertToView();
	},
	getFilteredSortedColumnIndices : function() {
		return this.indexMapper.convertToView();
	},
	setFullDataset : function(dataset, notify) {
		this.originalDataset = dataset;
		this.indexMapper.setFilter(this.indexMapper.getFilter());
		this.selectionModel.clear();
		this.elementSelectionModel.clear();
		if (notify) {
			this.trigger(morpheus.Project.Events.DATASET_CHANGED);
		}
	},
	setGroupRows : function(keys, notify) {
		this.groups = keys;
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_GROUP_BY_CHANGED);
			this.trigger(morpheus.Project.Events.COLUMN_GROUP_BY_CHANGED);
		}
	},
	setGroupColumns : function(keys, notify) {
		this.groups = keys;
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_GROUP_BY_CHANGED);
			this.trigger(morpheus.Project.Events.COLUMN_GROUP_BY_CHANGED);
		}
	},
	setRowFilter : function(filter, notify) {
		this._saveSelection(false);
		this.indexMapper.setFilter(filter);
		this._restoreSelection(false);
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_FILTER_CHANGED);
		}
	},
	getRowFilter : function() {
		return this.indexMapper.getFilter();
	},
	getColumnFilter : function() {
		return this.indexMapper.getFilter();
	},
	setColumnFilter : function(filter, notify) {
		this._saveSelection(true);
		this.indexMapper.setFilter(filter);
		this._restoreSelection(true);
		if (notify) {
			this.trigger(morpheus.Project.Events.COLUMN_FILTER_CHANGED);
		}
	},
	getColumnColorModel : function() {
		return this.colorModel;
	},
	getSortedFilteredDataset : function() {
		return morpheus.DatasetUtil.slicedView(this.getFullDataset(),
				this.indexMapper.convertToView(), this.indexMapper
						.convertToView());
	},
	getSelectedDataset : function(options) {
		options = $.extend({}, {
			selectedRows : true,
			selectedColumns : true,
			emptyToAll : true
		}, options);
		var dataset = this.getSortedFilteredDataset();
		var rows = null;
		if (options.selectedRows) {
			rows = this.selectionModel.getViewIndices().values().sort(
					function(a, b) {
						return (a === b ? 0 : (a < b ? -1 : 1));
					});
			if (rows.length === 0 && options.emptyToAll) {
				rows = null;
			}
		}
		var columns = null;
		if (options.selectedColumns) {
			columns = this.selectionModel.getViewIndices().values().sort(
					function(a, b) {
						return (a === b ? 0 : (a < b ? -1 : 1));
					});
			if (columns.length === 0 && options.emptyToAll) {
				columns = null;
			}
		}
		return morpheus.DatasetUtil.slicedView(dataset, rows, columns);
	},
	_saveSelection : function(isColumns) {
		this.elementSelectionModel.save();
		if (isColumns) {
			this.selectionModel.save();
		} else {
			this.selectionModel.save();
		}
	},
	_restoreSelection : function(isColumns) {
		if (isColumns) {
			this.selectionModel.restore();
		} else {
			this.selectionModel.restore();
		}
		this.elementSelectionModel.restore();
	},
	setRowSortKeys : function(keys, notify) {
		this._saveSelection(false);
		this.indexMapper.setSortKeys(keys);
		this._restoreSelection(false);
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_SORT_ORDER_CHANGED);
		}
	},
	setColumnSortKeys : function(keys, notify) {
		this._saveSelection(true);
		this.indexMapper.setSortKeys(keys);
		this._restoreSelection(true);
		if (notify) {
			this.trigger(morpheus.Project.Events.COLUMN_SORT_ORDER_CHANGED);
		}
	},
	getRowSortKeys : function() {
		return this.indexMapper.sortKeys;
	},
	getColumnSortKeys : function() {
		return this.indexMapper.sortKeys;
	},
	convertViewColumnIndexToModel : function(viewIndex) {
		return this.indexMapper.convertViewIndexToModel(viewIndex);
	},
	convertViewRowIndexToModel : function(viewIndex) {
		return this.indexMapper.convertViewIndexToModel(viewIndex);
	},
	convertModelRowIndexToView : function(modelIndex) {
		return this.indexMapper.convertModelIndexToView(modelIndex);
	},
	convertModelColumnIndexToView : function(modelIndex) {
		return this.indexMapper.convertModelIndexToView(modelIndex);
	},

	isColumnViewIndexSelected : function(index) {
		return this.selectionModel.isViewIndexSelected(index);
	},
	isRowViewIndexSelected : function(index) {
		return this.selectionModel.isViewIndexSelected(index);
	}
};
morpheus.Util.extend(morpheus.SymmetricProject, morpheus.Events);
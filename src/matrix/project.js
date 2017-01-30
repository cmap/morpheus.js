/**
 *
 * @param dataset
 * @constructor
 */
morpheus.Project = function (dataset) {
	this.originalDataset = dataset;
    this.rowIndexMapper = new morpheus.IndexMapper(this, true);
    this.columnIndexMapper = new morpheus.IndexMapper(this, false);
    this.groupRows = [];
    this.groupColumns = [];
    this.rowColorModel = new morpheus.VectorColorModel();
    this.columnColorModel = new morpheus.VectorColorModel();
    this.rowShapeModel = new morpheus.VectorShapeModel();
    this.columnShapeModel = new morpheus.VectorShapeModel();
    this.hoverColumnIndex = -1;
    this.hoverRowIndex = -1;
    this.columnSelectionModel = new morpheus.SelectionModel(this, true);
    this.rowSelectionModel = new morpheus.SelectionModel(this, false);
    this.elementSelectionModel = new morpheus.ElementSelectionModel(this);
    morpheus.Project._recomputeCalculatedFields(this.originalDataset);
    morpheus.Project
        ._recomputeCalculatedFields(new morpheus.TransposedDatasetView(
            this.originalDataset));
};
morpheus.Project.Events = {
	DATASET_CHANGED: 'datasetChanged',
	ROW_GROUP_BY_CHANGED: 'rowGroupByChanged',
	COLUMN_GROUP_BY_CHANGED: 'columnGroupByChanged',
	ROW_FILTER_CHANGED: 'rowFilterChanged',
	COLUMN_FILTER_CHANGED: 'columnFilterChanged',
	ROW_SORT_ORDER_CHANGED: 'rowSortOrderChanged',
	COLUMN_SORT_ORDER_CHANGED: 'columnSortOrderChanged',
	ROW_TRACK_REMOVED: 'rowTrackRemoved',
	COLUMN_TRACK_REMOVED: 'columnTrackRemoved'
};

morpheus.Project._recomputeCalculatedFields = function (dataset) {
    var metadata = dataset.getRowMetadata();
    var view = new morpheus.DatasetRowView(dataset);
    for (var metadataIndex = 0, count = metadata.getMetadataCount(); metadataIndex < count; metadataIndex++) {
        var v = metadata.get(metadataIndex);
        var f = v.getProperties().get(morpheus.VectorKeys.FUNCTION);
        if (f != null
            && v.getProperties().get(morpheus.VectorKeys.RECOMPUTE_FUNCTION)) {
            for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
                v.setValue(i, f(view.setIndex(i)));
            }
        }
    }

};
morpheus.Project.prototype = {
	getHoverColumnIndex: function () {
		return this.hoverColumnIndex;
	},
	setHoverColumnIndex: function (index) {
		this.hoverColumnIndex = index;
	},
	getHoverRowIndex: function () {
		return this.hoverRowIndex;
	},
	setHoverRowIndex: function (index) {
		this.hoverRowIndex = index;
	},
	getRowColorModel: function () {
		return this.rowColorModel;
	},
	getRowShapeModel: function () {
		return this.rowShapeModel;
	},
	getColumnShapeModel: function () {
		return this.columnShapeModel;
	},
	getGroupRows: function () {
		return this.groupRows;
	},
	getGroupColumns: function () {
		return this.groupColumns;
	},
	getFullDataset: function () {
		return this.originalDataset;
	},
	getColumnSelectionModel: function () {
		return this.columnSelectionModel;
	},
	getRowSelectionModel: function () {
		return this.rowSelectionModel;
	},
	getFilteredSortedRowIndices: function () {
		return this.rowIndexMapper.convertToView();
	},
	getFilteredSortedColumnIndices: function () {
		return this.columnIndexMapper.convertToView();
	},
	getElementSelectionModel: function () {
		return this.elementSelectionModel;
	},
	setFullDataset: function (dataset, notify) {
		this.originalDataset = dataset;
		this.rowIndexMapper.setFilter(this.rowIndexMapper.getFilter());
		this.columnIndexMapper.setFilter(this.columnIndexMapper.getFilter());
		this.columnSelectionModel.clear();
		this.rowSelectionModel.clear();
		this.elementSelectionModel.clear();
		if (notify) {
			this.trigger(morpheus.Project.Events.DATASET_CHANGED);
		}
	},
    setGroupRows: function (keys, notify) {
        this.groupRows = keys;
        for (var i = 0, nkeys = keys.length; i < nkeys; i++) {
            if (keys[i].isColumns() === undefined) {
                keys[i].setColumns(false);
            }
        }
        if (notify) {
            this.trigger(morpheus.Project.Events.ROW_GROUP_BY_CHANGED);
        }
    },
    setGroupColumns: function (keys, notify) {
        this.groupColumns = keys;
        for (var i = 0, nkeys = keys.length; i < nkeys; i++) {
            if (keys[i].isColumns() === undefined) {
                keys[i].setColumns(true);
            }
        }
        if (notify) {
            this.trigger(morpheus.Project.Events.COLUMN_GROUP_BY_CHANGED);
        }
    },
	setRowFilter: function (filter, notify) {
		this._saveSelection(false);
		this.rowIndexMapper.setFilter(filter);
		this._restoreSelection(false);
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_FILTER_CHANGED);
		}
	},
	getRowFilter: function () {
		return this.rowIndexMapper.getFilter();
	},
	getColumnFilter: function () {
		return this.columnIndexMapper.getFilter();
	},
	setColumnFilter: function (filter, notify) {
		this._saveSelection(true);
		this.columnIndexMapper.setFilter(filter);
		this._restoreSelection(true);
		if (notify) {
			this.trigger(morpheus.Project.Events.COLUMN_FILTER_CHANGED);
		}
	},
	getColumnColorModel: function () {
		return this.columnColorModel;
	},
	getSortedFilteredDataset: function () {
		return morpheus.DatasetUtil.slicedView(this.getFullDataset(),
				this.rowIndexMapper.convertToView(), this.columnIndexMapper
						.convertToView());
	},
	getSelectedDataset: function (options) {
        options = $.extend({}, {
            selectedRows: true,
            selectedColumns: true,
            emptyToAll: true
        }, options);
        var dataset = this.getSortedFilteredDataset();
        var rows = null;
        if (options.selectedRows) {
            rows = this.rowSelectionModel.getViewIndices().values().sort(
                function (a, b) {
                    return (a === b ? 0 : (a < b ? -1 : 1));
                });
            if (rows.length === 0 && options.emptyToAll) {
                rows = null;
            }
        }
        var columns = null;
        if (options.selectedColumns) {
            columns = this.columnSelectionModel.getViewIndices().values().sort(
                function (a, b) {
                    return (a === b ? 0 : (a < b ? -1 : 1));
                });
            if (columns.length === 0 && options.emptyToAll) {
                columns = null;
            }
        }
        return morpheus.DatasetUtil.slicedView(dataset, rows, columns);
    },
    _saveSelection: function (isColumns) {
        this.elementSelectionModel.save();
        if (isColumns) {
            this.columnSelectionModel.save();
        } else {
            this.rowSelectionModel.save();
        }
    },
    _restoreSelection: function (isColumns) {
        if (isColumns) {
            this.columnSelectionModel.restore();
        } else {
            this.rowSelectionModel.restore();
        }
        this.elementSelectionModel.restore();
    },
    setRowSortKeys: function (keys, notify) {
        this._saveSelection(false);
        for (var i = 0, nkeys = keys.length; i < nkeys; i++) {
            if (keys[i].isColumns() === undefined) {
                keys[i].setColumns(false);
            }
        }
        this.rowIndexMapper.setSortKeys(keys);
        this._restoreSelection(false);
        if (notify) {
            this.trigger(morpheus.Project.Events.ROW_SORT_ORDER_CHANGED);
        }
    },
    setColumnSortKeys: function (keys, notify) {
        this._saveSelection(true);
        for (var i = 0, nkeys = keys.length; i < nkeys; i++) {
            if (keys[i].isColumns() === undefined) {
                keys[i].setColumns(true);
            }
        }
        this.columnIndexMapper.setSortKeys(keys);
        this._restoreSelection(true);
        if (notify) {
            this.trigger(morpheus.Project.Events.COLUMN_SORT_ORDER_CHANGED);
        }
    },
	getRowSortKeys: function () {
		return this.rowIndexMapper.sortKeys;
	},
	getColumnSortKeys: function () {
		return this.columnIndexMapper.sortKeys;
	},
	convertViewColumnIndexToModel: function (viewIndex) {
		return this.columnIndexMapper.convertViewIndexToModel(viewIndex);
	},
	convertViewRowIndexToModel: function (viewIndex) {
		return this.rowIndexMapper.convertViewIndexToModel(viewIndex);
	},
	convertModelRowIndexToView: function (modelIndex) {
		return this.rowIndexMapper.convertModelIndexToView(modelIndex);
	},
	convertModelColumnIndexToView: function (modelIndex) {
		return this.columnIndexMapper.convertModelIndexToView(modelIndex);
	},
	isColumnViewIndexSelected: function (index) {
		return this.columnSelectionModel.isViewIndexSelected(index);
	},
	isRowViewIndexSelected: function (index) {
		return this.rowSelectionModel.isViewIndexSelected(index);
	}
};
morpheus.Util.extend(morpheus.Project, morpheus.Events);
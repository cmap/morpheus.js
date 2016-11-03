morpheus.MatchesOnTopSortKey = function (project, modelIndices, name, columns) {
	var modelHighlight = {};
	var p = project;
	var viewIndices = [];
	for (var i = 0, j = modelIndices.length, length = modelIndices.length; i < length; i++, j--) {
		modelHighlight[modelIndices[i]] = j;
		viewIndices.push(i);
	}
	this.comparator = function (i1, i2) {
		var a = modelHighlight[i1];
		if (a === undefined) {
			a = 0;
		}
		var b = modelHighlight[i2];
		if (b === undefined) {
			b = 0;
		}
		return (a > b ? -1 : (a === b ? 0 : 1));
	};
	this.indices = viewIndices;
	this.name = name;
	this.columns = columns;
};
morpheus.MatchesOnTopSortKey.prototype = {
	isColumns: function () {
		return this.columns;
	},
	setColumns: function (columns) {
		this.columns = columns;
	},
	init: function () {
	},
	getSortOrder: function () {
		return 2;
	},
	getComparator: function () {
		return this.comparator;
	},
	getValue: function (i) {
		return i;
	},
	toString: function (i) {
		return this.name;
	}
};
morpheus.SortKey = function (field, sortOrder, columns) {
	if (typeof sortOrder === 'string') {
		sortOrder = morpheus.SortKey.SortOrder[sortOrder.toUpperCase()];
	}
	this.field = field;
	this.sortOrder = sortOrder;
	this.v = null;
	this.c = null;
	this.setSortOrder(sortOrder);
	this.columns = columns;
};

morpheus.SortKey.prototype = {
	isColumns: function () {
		return this.columns;
	},
	setColumns: function (columns) {
		this.columns = columns;
	},
	init: function (dataset) {
		this.v = dataset.getRowMetadata().getByName(this.field);
		if (!this.v) {
			this.v = {};
			this.v.getValue = function () {
				return 0;
			};
			this.c = this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING ? morpheus.SortKey.ASCENDING_COMPARATOR
				: morpheus.SortKey.DESCENDING_COMPARATOR;
		} else {
			var dataType = morpheus.VectorUtil.getDataType(this.v);
			if (dataType === 'number') {
				this.c = this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING ? morpheus.SortKey.NUMBER_ASCENDING_COMPARATOR
					: morpheus.SortKey.NUMBER_DESCENDING_COMPARATOR;
			} else if (dataType === '[number]') {
				var summary = this.v.getProperties().get(
						morpheus.VectorKeys.ARRAY_SUMMARY_FUNCTION)
					|| morpheus.SortKey.ARRAY_MAX_SUMMARY_FUNCTION;

				this.c = this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING ? morpheus.SortKey
				.ARRAY_ASCENDING_COMPARATOR(summary)
					: morpheus.SortKey.ARRAY_DESCENDING_COMPARATOR(summary);
			} else {
				this.c = this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING ? morpheus.SortKey.ASCENDING_COMPARATOR
					: morpheus.SortKey.DESCENDING_COMPARATOR;
			}
		}
	},
	getComparator: function () {
		return this.c;
	},
	getValue: function (i) {
		return this.v.getValue(i);
	},
	setSortOrder: function (sortOrder) {
		this.sortOrder = sortOrder;
	},
	getSortOrder: function () {
		return this.sortOrder;
	},
	toString: function () {
		return this.field;
	}
};
/**
 * @param modelIndices
 *            Selected rows or columns
 * @param isColumnSort -
 *            sort columns by selected rows.
 */
morpheus.SortByValuesKey = function (modelIndices, sortOrder, isColumnSort) {
	this.field = 'selection';
	this.bothCount = 10;
	this.modelIndices = modelIndices;
	this.sortOrder = sortOrder;
	this.isColumnSort = isColumnSort;
	this.setSortOrder(sortOrder);

};
morpheus.SortByValuesKey.prototype = {
	isColumns: function () {
		return this.isColumnSort;
	},
	setColumns: function (columns) {
		this.isColumnSort = columns;
	},
	init: function (dataset, visibleModelIndices) {
		// isColumnSort-sort columns by selected rows
		// dataset is transposed if !isColumnSort
		this.dataset = morpheus.DatasetUtil.slicedView(dataset, null,
			this.modelIndices);
		this.rowView = new morpheus.DatasetRowView(this.dataset);
		this.summaryFunction = this.modelIndices.length > 1 ? morpheus.Median
			: function (row) {
			return row.getValue(0);
		};
		if (this.sortOrder === morpheus.SortKey.SortOrder.TOP_N) {
			var pairs = [];

			var missingIndices = [];
			for (var i = 0, nrows = visibleModelIndices.length; i < nrows; i++) {
				var index = visibleModelIndices[i];
				var value = this.summaryFunction(this.rowView.setIndex(index));
				if (!isNaN(value)) {
					pairs.push({
						index: index,
						value: value
					});
				} else {
					missingIndices.push(index);
				}
			}
			// sort values in descending order
			pairs
			.sort(function (a, b) {
				return (a.value < b.value ? 1
					: (a.value === b.value ? 0 : -1));
			});

			var modelIndexToValue = [];
			var nInGroup = Math.min(pairs.length, this.bothCount);
			var counter = 0;
			var topIndex = 0;

			var half = Math.floor(pairs.length / 2);
			var topPairs = pairs.slice(0, half);
			var bottomPairs = pairs.slice(half);
			var bottomIndex = bottomPairs.length - 1;
			var ntop = topPairs.length;
			var npairs = pairs.length;
			while (counter < npairs) {
				for (var i = 0; i < nInGroup && topIndex < ntop; i++, topIndex++, counter++) {
					modelIndexToValue[topPairs[topIndex].index] = counter;
				}
				var indexCounterPairs = [];
				for (var i = 0; i < nInGroup && bottomIndex >= 0; i++, bottomIndex--, counter++) {
					indexCounterPairs.push([bottomPairs[bottomIndex].index,
						counter]);
				}
				for (var i = indexCounterPairs.length - 1, j = 0; i >= 0; i--, j++) {
					var item_i = indexCounterPairs[i];
					var item_j = indexCounterPairs[j];
					modelIndexToValue[item_i[0]] = item_j[1];
				}

			}

			// add on missing
			for (var i = 0, length = missingIndices.length; i < length; i++, counter++) {
				modelIndexToValue[missingIndices[i]] = counter;
			}
			this.modelIndexToValue = modelIndexToValue;

		} else {
			delete this.modelIndexToValue;
		}
	},
	getComparator: function () {
		return this.c;
	},
	getValue: function (i) {
		return this.modelIndexToValue ? this.modelIndexToValue[i] : this
		.summaryFunction(this.rowView.setIndex(i));
	},
	setSortOrder: function (sortOrder) {
		if (typeof sortOrder === 'string') {
			sortOrder = morpheus.SortKey.SortOrder[sortOrder.toUpperCase()];
		}
		this.sortOrder = sortOrder;
		if (this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING) {
			this.c = morpheus.SortKey.ELEMENT_ASCENDING_COMPARATOR;
		} else if (this.sortOrder === morpheus.SortKey.SortOrder.DESCENDING) {
			this.c = morpheus.SortKey.ELEMENT_DESCENDING_COMPARATOR;
		} else {
			this.c = morpheus.SortKey.NUMBER_ASCENDING_COMPARATOR;
		}

	},
	getSortOrder: function () {
		return this.sortOrder;
	},
	toString: function () {
		return 'values';
	}
};
/**
 * @param modelIndices
 *            Array of model indices
 * @param nvisible
 *            The number of visible indices at the time this sort key was
 *            created. Used by dendrogram to determine if dendrogram should be
 *            shown.
 * @param name
 *            This sort key name
 */
morpheus.SpecifiedModelSortOrder = function (modelIndices, nvisible, name, columns) {
	this.nvisible = nvisible;
	var modelIndexToValue = [];
	for (var i = 0, length = modelIndices.length; i < length; i++) {
		modelIndexToValue[modelIndices[i]] = i;
	}
	this.modelIndexToValue = modelIndexToValue;
	this.name = name;
	this.c = morpheus.SortKey.ASCENDING_COMPARATOR;
	this.columns = columns;

};
morpheus.SpecifiedModelSortOrder.prototype = {
	isColumns: function () {
		return this.columns;
	},
	setColumns: function (columns) {
		this.columns;
	},
	init: function (dataset) {
	},
	getComparator: function (a, b) {
		return this.c;
	},
	getValue: function (i) {
		return this.modelIndexToValue[i];
	},
	setSortOrder: function (sortOrder) {
		this.sortOrder = sortOrder;
		this.c = this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING ? morpheus.SortKey.NUMBER_ASCENDING_COMPARATOR
			: morpheus.SortKey.NUMBER_DESCENDING_COMPARATOR;
	},
	getSortOrder: function () {
		return this.sortOrder;
	},
	getName: function () {
		return this.name;
	}
};

/**
 * Group by key
 *
 * @param values
 */
morpheus.SpecifiedGroupByKey = function (clusterIds, columns) {
	this.clusterIds = clusterIds;
	this.c = function (a, b) {
		return (a === b ? 0 : // Values are equal
			(a < b ? -1 : // (-0.0, 0.0) or (!NaN, NaN)
				1));
	};
	this.columns = columns;
};
morpheus.SpecifiedGroupByKey.prototype = {
	isColumns: function () {
		return this.columns;
	},
	setColumns: function (columns) {
		this.columns;
	},
	init: function (dataset) {
	},
	getComparator: function (a, b) {
		return this.c;
	},
	getValue: function (i) {
		return this.clusterIds[i];
	},
	setSortOrder: function (sortOrder) {
	},
	getSortOrder: function () {
	},
	getName: function () {
		return 'Dendrogram Cut';
	}
};
morpheus.SortKey.SortOrder = {
	ASCENDING: 0,
	DESCENDING: 1,
	UNSORTED: 2,
	CUSTOM: 3,
	TOP_N: 4
};
morpheus.SortKey.ASCENDING_COMPARATOR = function (a, b) {
	// we want NaNs to end up at the bottom
	var aNaN = (a == null || _.isNumber(a) && isNaN(a) || a.length === 0);
	var bNaN = (b == null || _.isNumber(b) && isNaN(b) || b.length === 0);
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}
	if (a.toLowerCase) {
		a = a.toLowerCase();
	}
	if (b.toLowerCase) {
		b = b.toLowerCase();
	}

	return (a === b ? 0 : (a < b ? -1 : 1));
};

morpheus.SortKey.DESCENDING_COMPARATOR = function (a, b) {

	var aNaN = (a == null || _.isNumber(a) && isNaN(a) || a.length === 0);
	var bNaN = (b == null || _.isNumber(b) && isNaN(b)) || b.length === 0;
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}
	if (a.toLowerCase) {
		a = a.toLowerCase();
	}
	if (b.toLowerCase) {
		b = b.toLowerCase();
	}
	return (a === b ? 0 : (a < b ? 1 : -1));
};

morpheus.SortKey.NUMBER_ASCENDING_COMPARATOR = function (a, b) {
	// we want NaNs to end up at the bottom
	var aNaN = (a == null || isNaN(a));
	var bNaN = (b == null || isNaN(b));
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}
	return (a === b ? 0 : (a < b ? -1 : 1));
};

morpheus.SortKey.NUMBER_DESCENDING_COMPARATOR = function (a, b) {
	var aNaN = (a == null || isNaN(a));
	var bNaN = (b == null || isNaN(b));
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}
	return (a === b ? 0 : (a < b ? 1 : -1));
};

morpheus.SortKey.STRING_ASCENDING_COMPARATOR = function (a, b) {
	a = (a == null || a.toLowerCase === undefined) ? null : a.toLowerCase();
	b = (b == null || b.toLowerCase === undefined) ? null : b.toLowerCase();
	return (a === b ? 0 : (a < b ? -1 : 1));
};
morpheus.SortKey.STRING_DESCENDING_COMPARATOR = function (a, b) {
	a = (a == null || a.toLowerCase === undefined) ? null : a.toLowerCase();
	b = (b == null || b.toLowerCase === undefined) ? null : b.toLowerCase();
	return (a === b ? 0 : (a < b ? 1 : -1));
};

morpheus.SortKey.ELEMENT_ASCENDING_COMPARATOR = function (obj1, obj2) {
	var a = +obj1;
	var b = +obj2;
	var aNaN = isNaN(a);
	var bNaN = isNaN(b);
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}

	if (a === b) {
		if (obj1.toObject && obj2.toObject) {
			var a1 = obj1.toObject();
			var b1 = obj2.toObject();
			for (var name in a1) {
				a = a1[name];
				b = b1[name];

				var c = (a === b ? 0 : (a < b ? -1 : 1));
				if (c !== 0) {
					return c;
				}
			}
		}
	}
	return (a === b ? 0 : (a < b ? -1 : 1));
};

morpheus.SortKey.ELEMENT_DESCENDING_COMPARATOR = function (obj1, obj2) {
	// we want NaNs to end up at the bottom
	var a = +obj1;
	var b = +obj2;
	var aNaN = isNaN(a);
	var bNaN = isNaN(b);
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}
	if (a === b) {
		if (obj1.toObject && obj2.toObject) {
			var a1 = obj1.toObject();
			var b1 = obj2.toObject();
			for (var name in a1) {
				a = a1[name];
				b = b1[name];
				var c = (a === b ? 0 : (a < b ? 1 : -1));
				if (c !== 0) {
					return c;
				}
			}
		}
	}
	return (a === b ? 0 : (a < b ? 1 : -1));
};
morpheus.SortKey.BOX_PLOT_SUMMARY_FUNCTION = function (array) {
	var box = array.box;
	if (box == null) {
		var v = morpheus.VectorUtil.arrayAsVector(array);
		box = morpheus
		.BoxPlotItem(this.indices != null ? new morpheus.SlicedVector(
			v, this.indices) : v);
		array.box = box;
	}

	return box.q3;
};

morpheus.SortKey.ARRAY_MAX_SUMMARY_FUNCTION = function (array) {
	var a = 0;
	if (array != null) {
		var aPosMax = -Number.MAX_VALUE;
		var aNegMax = Number.MAX_VALUE;
		for (var i = 0, length = array.length; i < length; i++) {
			var value = array[i];
			if (!isNaN(value)) {
				if (value >= 0) {
					aPosMax = value > aPosMax ? value : aPosMax;
				} else {
					aNegMax = value < aNegMax ? value : aNegMax;
				}
			}
		}

		if (aPosMax !== -Number.MAX_VALUE) {
			a = aPosMax;
		}
		if (aNegMax !== Number.MAX_VALUE) {
			a = Math.abs(aNegMax) > a ? aNegMax : a;
		}
	}
	return a;
};
morpheus.SortKey.ARRAY_ASCENDING_COMPARATOR = function (summary) {
	return function (a, b) {
		var aNaN = a == null;
		var bNaN = b == null;
		if (aNaN && bNaN) {
			return 0;
		}
		if (aNaN) {
			return 1;
		}
		if (bNaN) {
			return -1;
		}
		a = summary(a);
		b = summary(b);
		aNaN = isNaN(a);
		bNaN = isNaN(b);
		if (aNaN && bNaN) {
			return 0;
		}
		if (aNaN) {
			return 1;
		}
		if (bNaN) {
			return -1;
		}
		return (a === b ? 0 : (a < b ? -1 : 1));
	};
};

morpheus.SortKey.ARRAY_DESCENDING_COMPARATOR = function (summary) {
	return function (a, b) {
		var aNaN = a == null;
		var bNaN = b == null;
		if (aNaN && bNaN) {
			return 0;
		}
		if (aNaN) {
			return 1;
		}
		if (bNaN) {
			return -1;
		}
		a = summary(a);
		b = summary(b);
		aNaN = isNaN(a);
		bNaN = isNaN(b);
		if (aNaN && bNaN) {
			return 0;
		}
		if (aNaN) {
			return 1;
		}
		if (bNaN) {
			return -1;
		}
		return (a === b ? 0 : (a < b ? 1 : -1));
	};
};

morpheus.SortKey.reverseComparator = function (c) {
	return function (a, b) {
		return c(b, a);
	};
};
morpheus.SortKey.keepExistingSortKeys = function (newSortKeys, existingSortKeys) {
	// keep MatchesOnTopSortKey and dendrogram
	// var existingOnTopSortKey = null;
	var existingSpecifiedSortKey = null;
	for (var i = 0, length = existingSortKeys.length; i < length; i++) {
		var key = existingSortKeys[i];
		// if (key instanceof morpheus.MatchesOnTopSortKey) {
		// existingOnTopSortKey = key;
		// }
		if (key instanceof morpheus.SpecifiedModelSortOrder
			&& key.name === 'dendrogram') {
			existingSpecifiedSortKey = key;
		}
	}
	if (existingSpecifiedSortKey) {
		var newSortKeysHasTopSortKey = false;
		var newSortKeysHasSpecifiedSortKey = false;
		for (var i = 0, length = newSortKeys.length; i < length; i++) {
			var key = newSortKeys[i];
			// if (key instanceof morpheus.MatchesOnTopSortKey) {
			// newSortKeysHasTopSortKey = true;
			// }
			if (key instanceof morpheus.SpecifiedModelSortOrder
				&& key.name === 'dendrogram') {
				newSortKeysHasSpecifiedSortKey = true;
			}
		}
		// if (existingOnTopSortKey && !newSortKeysHasTopSortKey) {
		// newSortKeys.splice(0, 0, existingOnTopSortKey);
		// }
		if (existingSpecifiedSortKey && !newSortKeysHasSpecifiedSortKey) {
			newSortKeys.splice(newSortKeys.length, 0, existingSpecifiedSortKey);
		}
	}
	return newSortKeys;
};


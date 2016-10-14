/**
 * @fileOverview The interface for a dataset consisting of a two-dimensional matrix of
 * values. A dataset may also optionally contain one or more series of
 * two-dimensional matrices. A dataset also has metadata associated with each
 * row and column.
 */
/**
 * Creates a new dataset with the specified dimensions.
 *
 * @constructor
 */
morpheus.AbstractDataset = function (rows, columns) {
	this.seriesNames = [];
	this.seriesArrays = [];
	this.seriesDataTypes = [];
	this.rows = rows;
	this.columns = columns;
	this.rowMetadataModel = new morpheus.MetadataModel(rows);
	this.columnMetadataModel = new morpheus.MetadataModel(columns);

};
morpheus.AbstractDataset.prototype = {
	/**
	 * @ignore
	 * @param metadata
	 */
	setRowMetadata: function (metadata) {
		this.rowMetadataModel = metadata;
	},
	/**
	 * @ignore
	 * @param metadata
	 */
	setColumnMetadata: function (metadata) {
		this.columnMetadataModel = metadata;
	},
	/**
	 * Returns the name for the given series. Series can be used to store
	 * standard error of data points for example.
	 *
	 * @param seriesIndex
	 *            the series
	 * @return the series name
	 */
	getName: function (seriesIndex) {
		return this.seriesNames[seriesIndex || 0];
	},
	/**
	 * Sets the name for the given series. Series can be used to store standard
	 * error of data points for example.
	 *
	 * @param seriesIndex
	 *            the series *
	 * @param name
	 *            the series name
	 */
	setName: function (seriesIndex, name) {
		this.seriesNames[seriesIndex || 0] = name;
	},
	/**
	 * Gets the row metadata for this dataset.
	 *
	 * @return the row metadata
	 */
	getRowMetadata: function () {
		return this.rowMetadataModel;
	},
	/**
	 * Gets the column metadata for this dataset.
	 *
	 * @return The column metadata
	 */
	getColumnMetadata: function () {
		return this.columnMetadataModel;
	},
	/**
	 * Returns the number of rows in the dataset.
	 *
	 * @return the number of rows
	 */
	getRowCount: function () {
		return this.rows;
	},
	/**
	 * Returns the number of columns in the dataset.
	 *
	 * @return the number of columns
	 */
	getColumnCount: function () {
		return this.columns;
	},
	/**
	 * Returns the value at the given row and column for the given series.
	 * Series can be used to store standard error of data points for example.
	 *
	 * @param rowIndex
	 *            the row index
	 * @param columnIndex
	 *            the column index
	 * @param seriesIndex
	 *            the series index
	 * @return the value
	 */
	getValue: function (rowIndex, columnIndex, seriesIndex) {
		// not implemented
	},
	/**
	 * Sets the value at the given row and column for the given series.
	 *
	 * @param rowIndex
	 *            the row index
	 *
	 * @param columnIndex
	 *            the column index
	 * @param value
	 *            the value
	 * @param seriesIndex
	 *            the series index
	 *
	 */
	setValue: function (rowIndex, columnIndex, value, seriesIndex) {
		// not implemented
	},
	/**
	 * Adds the specified series.
	 *
	 * @param options
	 * @param options.name
	 *            the series name
	 * @param options.dataType
	 *            the series data type (e.g. object, Float32, Int8)
	 * @return the series index
	 */
	addSeries: function (options) {
		// not implemented
	},
	/**
	 * Returns the number of matrix series. Series can be used to store standard
	 * error of data points for example.
	 *
	 * @return the number of series
	 */
	getSeriesCount: function () {
		return this.seriesArrays.length;
	},
	/**
	 * Returns the data type at the specified series index.
	 *
	 * @param seriesIndex
	 *            the series index
	 * @return the series data type (e.g. Number, Float32, Int8)
	 */
	getDataType: function (seriesIndex) {
		return this.seriesDataTypes[seriesIndex || 0];
	},
	toString: function () {
		return this.getName();
	}
};

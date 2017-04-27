/**
 * The interface for a dataset consisting of a two-dimensional matrix of
 * values. A dataset may also optionally contain one or more series of
 * two-dimensional matrices. A dataset also has metadata associated with each
 * row and column.
 *
 * @interface morpheus.DatasetInterface
 */

/**
 * Returns the name for the given series. Series can be used to store
 * standard error of data points for example.
 *
 * @function
 * @name morpheus.DatasetInterface#getName
 * @param seriesIndex {number} the series
 * @return {string} the series name
 */

/**
 * Sets the name for the given series. Series can be used to store standard
 * error of data points for example.
 *
 * @function
 * @name morpheus.DatasetInterface#setName
 * @param seriesIndex {number} the series
 * @param name {string} the series name
 */

/**
 * Gets the row metadata for this dataset.
 *
 * @function
 * @name morpheus.DatasetInterface#getRowMetadata
 * @return {morpheus.MetadataModelInterface} the row metadata
 */

/**
 * Gets the column metadata for this dataset.
 *
 * @function
 * @name morpheus.DatasetInterface#getColumnMetadata
 * @return {morpheus.MetadataModelInterface} The column metadata
 */

/**
 * Returns the number of rows in the dataset.
 *
 * @function
 * @name morpheus.DatasetInterface#getRowCount
 * @return {number} the number of rows
 */

/**
 * Returns the number of columns in the dataset.
 *
 * @function
 * @name morpheus.DatasetInterface#getColumnCount
 * @return {number} the number of columns
 */

/**
 * Returns the value at the given row and column for the given series.
 * Series can be used to store standard error of data points for example.
 *
 * @function
 * @name morpheus.DatasetInterface#getValue
 * @param rowIndex {number} the row index
 * @param columnIndex {number} the column index
 * @param seriesIndex {number} the series index
 * @return the value
 */

/**
 * Sets the value at the given row and column for the given series.
 *
 * @function
 * @name morpheus.DatasetInterface#setValue
 * @param rowIndex {number} the row index
 * @param columnIndex {number} the column index
 * @param value the value
 * @param seriesIndex {number} the series index
 */

/**
 * Adds the specified series.
 *
 * @function
 * @name morpheus.DatasetInterface#addSeries
 * @param options.name {string} the series name
 * @param options.dataType {string} the series data type (e.g. object, Float32, Int8)
 * @return {number} the series index
 */

/**
 * Removes the specified series.
 *
 * @function
 * @name morpheus.DatasetInterface#removeSeries
 * @param seriesIndex {number} The series index.
 */

/**
 * Returns the number of matrix series. Series can be used to store standard
 * error of data points for example.
 *
 * @function
 * @name morpheus.DatasetInterface#getSeriesCount
 * @return {number} the number of series
 */

/**
 * Returns the data type at the specified series index.
 *
 * @function
 * @name morpheus.DatasetInterface#getDataType
 * @param seriesIndex {number} the series index
 * @return {string} the series data type (e.g. Number, Float32, Int8)
 */


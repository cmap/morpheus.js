/**
 * The interface for a dataset consisting of a two-dimensional matrix of
 * values. A dataset may also optionally contain one or more series of
 * two-dimensional matrices. A dataset also has metadata associated with each
 * row and column.
 *
 * @interface morpheus.DatasetProtocol
 */

/**
 * Returns the name for the given series. Series can be used to store
 * standard error of data points for example.
 *
 * @function
 * @name morpheus.DatasetProtocol#getName
 * @param seriesIndex {number} the series
 * @return {string} the series name
 */

/**
 * Sets the name for the given series. Series can be used to store standard
 * error of data points for example.
 *
 * @function
 * @name morpheus.DatasetProtocol#setName
 * @param seriesIndex {number} the series
 * @param name {string} the series name
 */

/**
 * Gets the row metadata for this dataset.
 *
 * @function
 * @name morpheus.DatasetProtocol#getRowMetadata
 * @return {morpheus.MetadataModelProtocol} the row metadata
 */

/**
 * Gets the column metadata for this dataset.
 *
 * @function
 * @name morpheus.DatasetProtocol#getColumnMetadata
 * @return {morpheus.MetadataModelProtocol} The column metadata
 */

/**
 * Returns the number of rows in the dataset.
 *
 * @function
 * @name morpheus.DatasetProtocol#getRowCount
 * @return {number} the number of rows
 */

/**
 * Returns the number of columns in the dataset.
 *
 * @function
 * @name morpheus.DatasetProtocol#getColumnCount
 * @return {number} the number of columns
 */

/**
 * Returns the value at the given row and column for the given series.
 * Series can be used to store standard error of data points for example.
 *
 * @function
 * @name morpheus.DatasetProtocol#getValue
 * @param rowIndex {number} the row index
 * @param columnIndex {number} the column index
 * @param seriesIndex {number} the series index
 * @return the value
 */

/**
 * Sets the value at the given row and column for the given series.
 *
 * @function
 * @name morpheus.DatasetProtocol#setValue
 * @param rowIndex {number} the row index
 * @param columnIndex {number} the column index
 * @param value the value
 * @param seriesIndex {number} the series index
 */

/**
 * Adds the specified series.
 *
 * @function
 * @name morpheus.DatasetProtocol#addSeries
 * @param options.name {string} the series name
 * @param options.dataType {string} the series data type (e.g. object, Float32, Int8)
 * @return {number} the series index
 */

/**
 * Removes the specified series.
 *
 * @function
 * @name morpheus.DatasetProtocol#removeSeries
 * @param seriesIndex {number} The series index.
 */

/**
 * Returns the number of matrix series. Series can be used to store standard
 * error of data points for example.
 *
 * @function
 * @name morpheus.DatasetProtocol#getSeriesCount
 * @return {number} the number of series
 */

/**
 * Returns the data type at the specified series index.
 *
 * @function
 * @name morpheus.DatasetProtocol#getDataType
 * @param seriesIndex {number} the series index
 * @return {string} the series data type (e.g. Number, Float32, Int8)
 */


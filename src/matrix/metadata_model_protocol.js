/**
 * Stores annotations for the rows or columns of a dataset.
 * @interface morpheus.MetadataModelProtocol
 *
 */

/**
 * Appends the specified vector to this meta data. If an existing vector
 * with the same name already exists, it is removed and existing properties
 * and values copied to the new vector before appending the new vector.
 * @function
 * @name morpheus.MetadataModelProtocol#add
 * @param name {String} The vector name to be inserted into this meta data instance.
 * @param options {object}
 * @return {morpheus.VectorProtocol} the added vector.
 */

/**
 * Returns the number of items that a vector in this meta data model
 * contains.
 *
 * @function
 * @name morpheus.MetadataModelProtocol#getItemCount
 * @return {number} the item count
 */

/**
 * Returns the vector at the specified metadata index.
 *
 * @function
 * @name morpheus.MetadataModelProtocol#get
 * @param index {number} the metadata index
 * @return {morpheus.VectorProtocol} the vector
 */

/**
 * Removes the column at the specified position in this meta data instance
 * Shifts any subsequent columns to the left (subtracts one from their
 * indices).
 *
 * @function
 * @name morpheus.MetadataModelProtocol#remove
 * @param index {number} the meta data index to remove.
 * @return {morpheus.VectorProtocol} the removed vector
 * @throws Error if index < 0 or >= getMetadataCount
 */

/**
 * Returns the vector witht the specified name.
 *
 * @function
 * @name morpheus.MetadataModelProtocol#getByName
 * @param name {string} the vector name
 * @return {morpheus.VectorProtocol} the vector
 */

/**
 * Returns the number of vectors in this meta data instance.
 *
 * @function
 * @name morpheus.MetadataModelProtocol#getMetadataCount
 * @return {number} the number of vectors.
 */



/**
 * Stores annotations for the rows or columns of a dataset.
 * @interface morpheus.MetadataModelInterface
 *
 */

/**
 * Appends the specified vector to this meta data. If an existing vector
 * with the same name already exists, it is removed and existing properties
 * and values copied to the new vector before appending the new vector.
 * @function
 * @name morpheus.MetadataModelInterface#add
 * @param name {String} The vector name to be inserted into this meta data instance.
 * @param options {object}
 * @return {morpheus.VectorInterface} the added vector.
 */

/**
 * Returns the number of items that a vector in this meta data model
 * contains.
 *
 * @function
 * @name morpheus.MetadataModelInterface#getItemCount
 * @return {number} the item count
 */

/**
 * Returns the vector at the specified metadata index.
 *
 * @function
 * @name morpheus.MetadataModelInterface#get
 * @param index {number} the metadata index
 * @return {morpheus.VectorInterface} the vector
 */

/**
 * Removes the column at the specified position in this meta data instance
 * Shifts any subsequent columns to the left (subtracts one from their
 * indices).
 *
 * @function
 * @name morpheus.MetadataModelInterface#remove
 * @param index {number} the meta data index to remove.
 * @return {morpheus.VectorInterface} the removed vector
 * @throws Error if index < 0 or >= getMetadataCount
 */

/**
 * Returns the vector witht the specified name.
 *
 * @function
 * @name morpheus.MetadataModelInterface#getByName
 * @param name {string} the vector name
 * @return {morpheus.VectorInterface} the vector
 */

/**
 * Returns the number of vectors in this meta data instance.
 *
 * @function
 * @name morpheus.MetadataModelInterface#getMetadataCount
 * @return {number} the number of vectors.
 */



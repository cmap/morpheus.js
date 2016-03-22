/**
 * @fileOverview Stores annotations for the rows or columns of a dataset.
 */

/**
 * Creates a new meta data model instance.
 * 
 * @param itemCount
 *            the number of items that vectors in this instances will hold.
 * @constructor
 */
morpheus.MetadataModel = function(itemCount) {
	this.itemCount = itemCount;
	this.vectors = [];
};
morpheus.MetadataModel.prototype = {
	/**
	 * Appends the specified vector to this meta data. If an existing vector
	 * with the same name already exists, it is removed and existing properties
	 * and values copied to the new vector before appending the new vector.
	 * 
	 * @param name
	 *            The vector name to be inserted into this meta data instance.
	 * @return the added vector.
	 */
	add : function(name) {
		var index = morpheus.MetadataUtil.indexOf(this, name);
		var oldVector;
		if (index !== -1) {
			oldVector = this.remove(index);
		}
		var v = new morpheus.Vector(name, this.getItemCount());
		if (oldVector != null) {
			// copy properties?
//			oldVector.getProperties().forEach(function(val, key) {
//				if (!morpheus.VectorKeys.COPY_IGNORE.has(key)) {
//					v.getProperties().set(key, val);
//				}
//
//			});
			// copy values
			for (var i = 0, size = oldVector.size(); i < size; i++) {
				var val = oldVector.getValue(i);
				v.setValue(i, val);
			}
		}
		this.vectors.push(v);
		return v;
	},
	/**
	 * Returns the number of items that a vector in this meta data model
	 * contains.
	 * 
	 * @return the item count
	 */
	getItemCount : function() {
		return this.itemCount;
	},
	/**
	 * Returns the vector at the specified metadata index.
	 * 
	 * @param index
	 *            the metadata index
	 * @return the vector
	 */
	get : function(index) {
		if (index < 0 || index >= this.vectors.length) {
			throw 'index ' + index + ' out of range';
		}
		return this.vectors[index];
	},
	/**
	 * Removes the column at the specified position in this meta data instance
	 * Shifts any subsequent columns to the left (subtracts one from their
	 * indices).
	 * 
	 * @param index
	 *            the meta data index to remove.
	 */
	remove : function(index) {
		if (index < 0 || index >= this.vectors.length) {
			throw 'index ' + index + ' out of range';
		}
		return this.vectors.splice(index, 1)[0];
	},
	/**
	 * Returns the vector witht the specified name.
	 * 
	 * @param name
	 *            the vector name
	 * @return the vector
	 */
	getByName : function(name) {
		var index = morpheus.MetadataUtil.indexOf(this, name);
		return index !== -1 ? this.get(index) : undefined;
	},
	/**
	 * Returns the number of vectors in this meta data instance.
	 * 
	 * @return the number of vectors.
	 */
	getMetadataCount : function() {
		return this.vectors.length;
	}
};
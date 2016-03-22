morpheus.MetadataModelColumnView = function(model, indices) {
	this.model = model;
	this.indices = indices;
};
morpheus.MetadataModelColumnView.prototype = {
	add : function(name) {
		var vector = this.model.add(name);
		var index = morpheus.MetadataUtil.indexOf(this.model, name);
		this.indices.push(index);
		return vector;
	},
	getMetadataCount : function() {
		return this.indices.length;
	},
	get : function(index) {
		if (index < 0 || index >= this.indices.length) {
			throw 'index out of bounds';
		}
		return this.model.get(this.indices[index]);
	},
	remove : function(index) {
		if (index < 0 || index >= this.indices.length) {
			throw 'index out of bounds';
		}
		var v = this.model.remove(this.indices[index]);
		this.indices.splice(index, 1);
		return v;
	},
	getByName : function(name) {
		var index = morpheus.MetadataUtil.indexOf(this, name);
		return index !== -1 ? this.get(index) : undefined;
	}
};
morpheus.Util.extend(morpheus.MetadataModelColumnView,
		morpheus.MetadataModelAdapter);
morpheus.MetadataModelItemView = function (model, indices) {
    this.model = model;
    this.indices = indices;
};
morpheus.MetadataModelItemView.prototype = {
    add: function (name) {
        var v = this.model.add(name);
        return new morpheus.SlicedVector(v, this.indices);
    },
    getItemCount: function () {
        return this.indices.length;
    },
    get: function (index) {
        var v = this.model.get(index);
        if (v === undefined) {
            return undefined;
        }
        return new morpheus.SlicedVector(v, this.indices);
    },
    getByName: function (name) {
        var v = this.model.getByName(name);
        if (v === undefined) {
            return undefined;
        }
        return new morpheus.SlicedVector(v, this.indices);
    },
    getMetadataCount: function () {
        return this.model.getMetadataCount();
    }
};
morpheus.Util.extend(morpheus.MetadataModelItemView,
    morpheus.MetadataModelAdapter);

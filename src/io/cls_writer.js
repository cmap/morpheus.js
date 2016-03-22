morpheus.ClsWriter = function() {

};
morpheus.ClsWriter.prototype = {
	write : function(vector) {
		var pw = [];
		var size = vector.size();
		pw.push(size);
		pw.push(' ');
		var set = morpheus.VectorUtil.getSet(vector);
		pw.push(set.size());
		pw.push(' ');
		pw.push('1\n');
		pw.push('#');
		var valueToIndex = new morpheus.Map();
		var index = 0;
		set.forEach(function(name) {
			pw.push(' ');
			pw.push(name);
			valueToIndex.set(name, index++);
		});
		pw.push('\n');
		for (var i = 0; i < size; i++) {
			if (i > 0) {
				pw.push(' ');
			}
			pw.push(valueToIndex.get(vector.getValue(i)));
		}
		pw.push('\n');
		return pw.join('');
	}
};

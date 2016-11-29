morpheus.GmtReader = function () {
};
morpheus.GmtReader.prototype = {
	read: function (reader) {
		var sets = [];
		var tab = /\t/;
		var s;
		while ((s = reader.readLine()) != null) {
			if (s === '' || s[0] === '#') {
				continue;
			}
			var tokens = s.split(tab);
			var name = tokens[0].trim();
			var description = tokens.length > 1 ? tokens[1].trim() : '';
			if ('BLANK' === description) {
				description = '';
			}
			var ids = [];
			for (var i = 2; i < tokens.length; i++) {
				var geneName = tokens[i].trim();
				if (geneName !== '') {
					ids.push(geneName);
				}
			}
			var set = {
				name: name,
				description: description,
				ids: ids
			};
			set.toString = function () {
				return this.name;
			};
			sets.push(set);
		}
		return sets;
	}
};

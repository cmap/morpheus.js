morpheus.Ranking = function (values) {
	var ranks = [];
	for (var i = 0, length = values.length; i < length; i++) {
		ranks.push({
			value: values[i],
			position: i
		});
	}
	if (ranks.length === 0) {
		return [];
	}
	ranks.sort(function (a, b) {
		return (a.value < b.value ? -1 : (a.value === b.value ? 0 : 1));
	});

	var out = [];
	var pos = 1; // position in sorted array
	out[ranks[0].position] = pos;
	var tiesTrace = [];
	tiesTrace.push(ranks[0].position);
	for (var i = 1; i < ranks.length; i++) {
		if (ranks[i].value > ranks[i - 1].value) {
			// tie sequence has ended (or had length 1)
			pos = i + 1;
			if (tiesTrace.length > 1) { // if seq is nontrivial, resolve
				morpheus.Ranking.fillAverage(out, tiesTrace);
			}
			tiesTrace = [];
			tiesTrace.push(ranks[i].position);
		} else {
			// tie sequence continues
			tiesTrace.push(ranks[i].position);
		}
		out[ranks[i].position] = pos;
	}
	if (tiesTrace.length > 1) { // handle tie sequence at end
		morpheus.Ranking.fillAverage(out, tiesTrace);
	}
	return out;
};
morpheus.Ranking.fill = function (data, tiesTrace, value) {
	for (var i = 0, length = tiesTrace.length; i < length; i++) {
		data[tiesTrace[i]] = value;
	}
};
morpheus.Ranking.fillAverage = function (ranks, tiesTrace) {
	var c = ranks[tiesTrace[0]];
	// length of sequence of tied ranks
	var length = tiesTrace.length;
	morpheus.Ranking.fill(ranks, tiesTrace, (2 * c + length - 1) / 2);
};

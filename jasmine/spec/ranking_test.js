describe("ranking_test", function() {
	it("R ties", function() {
		var x2 = [ 3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5 ];
		expect(morpheus.Ranking(x2)).toEqual(
				[ 4.5, 1.5, 6.0, 1.5, 8.0, 11.0, 3.0, 10.0, 8.0, 4.5, 8.0 ]);

	});
	it("R no ties", function() {
		expect(morpheus.Ranking([ 3, 1, 4, 15, 92 ]))
				.toEqual([ 2, 1, 3, 4, 5 ]);

	});
});

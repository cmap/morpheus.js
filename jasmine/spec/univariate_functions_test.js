describe("univariate_functions_test", function() {

	describe("mean", function() {
		it("returns the mean value for numbers", function() {
			expect(morpheus.Mean(morpheus.VectorUtil.arrayAsVector([ 1 ])))
					.toEqual(1);
			expect(
					morpheus.Mean(morpheus.VectorUtil.arrayAsVector([ 5, 1, 2,
							3, 4 ]))).toEqual(3);
			expect(morpheus.Mean(morpheus.VectorUtil.arrayAsVector([ 20, 3 ])))
					.toEqual(11.5);
			expect(morpheus.Mean(morpheus.VectorUtil.arrayAsVector([ 3, 20 ])))
					.toEqual(11.5);
		});

		it("ignores undefined and NaN", function() {
			expect(
					morpheus.Mean(morpheus.VectorUtil.arrayAsVector([ NaN, 1,
							2, 3, 4, 5 ]))).toEqual(3);
			expect(
					morpheus.Mean(morpheus.VectorUtil.arrayAsVector([ 1, 2, 3,
							4, 5, NaN ]))).toEqual(3);
			expect(
					morpheus.Mean(morpheus.VectorUtil.arrayAsVector([ 10, NaN,
							3, undefined, 5, NaN ]))).toEqual(6);

		});

		it("returns NaN for empty array", function() {
			expect(morpheus.Mean(morpheus.VectorUtil.arrayAsVector([])))
					.toEqual(NaN);
			expect(morpheus.Mean(morpheus.VectorUtil.arrayAsVector([ NaN ])))
					.toEqual(NaN);

		});
	});

	it("returns the variance value for numbers", function() {
		expect(morpheus.Variance(morpheus.VectorUtil.arrayAsVector([ 1 ])))
				.toEqual(NaN);
		expect(
				morpheus.Variance(morpheus.VectorUtil.arrayAsVector([ 5, 1, 2,
						3, 4 ]))).toEqual(2.5);
		expect(morpheus.Variance(morpheus.VectorUtil.arrayAsVector([ 20, 3 ])))
				.toEqual(144.5);
		expect(morpheus.Variance(morpheus.VectorUtil.arrayAsVector([ 3, 20 ])))
				.toEqual(144.5);

	});

	describe("percentile", function() {
		it("uses the R-7 algorithm", function() {
			var v = morpheus.VectorUtil.arrayAsVector([ 3, 6, 7, 8, 8, 10, 13,
					15, 16, 20 ]);
			expect(morpheus.Percentile(v, 0)).toEqual(3);
			expect(morpheus.Percentile(v, 25)).toEqual(7.25);
			expect(morpheus.Percentile(v, 50)).toEqual(9);
			expect(morpheus.Percentile(v, 75)).toEqual(14.5);
			expect(morpheus.Percentile(v, 100)).toEqual(20);

			var v = morpheus.VectorUtil.arrayAsVector([ 3, 6, 7, 8, 8, 9, 10,
					13, 15, 16, 20 ]);
			expect(morpheus.Percentile(v, 0)).toEqual(3);
			expect(morpheus.Percentile(v, 25)).toEqual(7.5);
			expect(morpheus.Percentile(v, 50)).toEqual(9);
			expect(morpheus.Percentile(v, 75)).toEqual(14);
			expect(morpheus.Percentile(v, 100)).toEqual(20);
		});
	});

	describe("mad", function() {
		it("equals R", function() {
			var v = morpheus.VectorUtil.arrayAsVector([ 1, 2, 3, 4, 5, 6, 7, 8,
					9 ]);
			expect(morpheus.MAD(v)).toEqual(2.9652);
			v = morpheus.VectorUtil
					.arrayAsVector([ 1, 3, 4, 5, 6, 8, 9, 2, 7 ]);
			expect(morpheus.MAD(v)).toEqual(2.9652);

		});
	});

});

describe("bivariate_functions_test", function() {

	describe("fisher exact", function() {
		it("R", function() {
			expect(morpheus.FisherExact.fisherTest(3, 1, 1, 3)).toBeCloseTo(
					0.4857, 0.0001);
			expect(morpheus.FisherExact.fisherTest(2, 15, 10, 3)).toBeCloseTo(
					0.0005367, 0.0001);

			expect(morpheus.FisherExact.fisherTest(30, 28, 4, 15)).toBeCloseTo(
					0.03176, 0.0001);

		});
	});

	describe("distance", function() {
		var x = [ [ -0.1820998, 0.5415669, -0.5733746, -1.0036722 ],
				[ 0.5544853, 0.5796843, -1.1233269, -0.9878692 ],
				[ 0.8157908, -0.2502708, 0.2957403, 0.3238394 ],
				[ 0.4107834, 0.2916730, 0.3306524, -0.3502162 ],
				[ 0.1891520, -0.7958767, 1.0416021, 0.8332562 ] ];
		it("euclidean", function() {
			var x = [ [ -0.1820998, 0.5415669, -0.5733746, -1.0036722 ],
					[ 0.5544853, 0.5796843, -1.1233269, -0.9878692 ],
					[ 0.8157908, -0.2502708, 0.2957403, 0.3238394 ],
					[ 0.4107834, 0.2916730, 0.3306524, -0.3502162 ],
					[ 0.1891520, -0.7958767, 1.0416021, 0.8332562 ] ];
			var r_result = [ [], [ 0.9201673 ], [ 2.0348072, 2.1193011 ],
					[ 1.2877216, 1.6199561, 0.9556693 ],
					[ 2.8123014, 3.1668678, 1.2272642, 1.7714236 ] ];
			var result = [ [] ];
			for (var i = 1; i < x.length; i++) {
				var array = [];
				for (var j = 0; j < i; j++) {
					array.push(morpheus.Euclidean(morpheus.VectorUtil
							.arrayAsVector(x[i]), morpheus.VectorUtil
							.arrayAsVector(x[j])));
				}
				result.push(array);
			}
			for (var i = 1; i < result.length; i++) {
				for (var j = 0; j < i; j++) {
					expect(result[i][j]).toBeCloseTo(r_result[i][j], 0.0001);
				}
			}
		});
		it("pearson",
				function() {

					var r_result = [
							[ 1.0000000, 0.83949100, -0.48731451, 0.65581369,
									-0.9305064 ],
							[ 0.8394910, 1.00000000, -0.04515611, 0.54485627,
									-0.8772123 ],
							[ -0.4873145, -0.04515611, 1.00000000, 0.09632703,
									0.5147751 ],
							[ 0.6558137, 0.54485627, 0.09632703, 1.00000000,
									-0.3662399 ],
							[ -0.9305064, -0.87721233, 0.51477514, -0.36623988,
									1.0000000 ] ];
					var result = [];
					for (var i = 0; i < x.length; i++) {
						var array = [];
						for (var j = 0; j < x.length; j++) {
							array.push(morpheus.Pearson(morpheus.VectorUtil
									.arrayAsVector(x[i]), morpheus.VectorUtil
									.arrayAsVector(x[j])));
						}
						result.push(array);
					}
					for (var i = 0; i < x.length; i++) {
						for (var j = 0; j < x.length; j++) {
							expect(result[i][j]).toBeCloseTo(r_result[i][j],
									0.0001);
						}
					}
				});
		it("spearman", function() {
			var r_result = [ [ 1.0, 0.8, -0.4, 0.4, -0.8 ],
					[ 0.8, 1.0, -0.2, 0.0, -1.0 ],
					[ -0.4, -0.2, 1.0, 0.4, 0.2 ], [ 0.4, 0.0, 0.4, 1.0, 0.0 ],
					[ -0.8, -1.0, 0.2, 0.0, 1.0 ] ];
			var result = [];
			for (var i = 0; i < x.length; i++) {
				var array = [];
				for (var j = 0; j < x.length; j++) {
					array.push(morpheus.Spearman(morpheus.VectorUtil
							.arrayAsVector(x[i]), morpheus.VectorUtil
							.arrayAsVector(x[j])));
				}
				result.push(array);
			}
			for (var i = 0; i < x.length; i++) {
				for (var j = 0; j < x.length; j++) {
					expect(result[i][j]).toBeCloseTo(r_result[i][j], 0.0001);
				}
			}
		});
	});

});

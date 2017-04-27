describe('bivariate_functions_test', function () {

	describe('fisher exact', function () {
		it('R', function () {
			expect(morpheus.FisherExact.fisherTest(3, 1, 1, 3)).toBeCloseTo(
				0.4857, 0.0001);
			expect(morpheus.FisherExact.fisherTest(2, 15, 10, 3)).toBeCloseTo(
				0.0005367, 0.0001);

			expect(morpheus.FisherExact.fisherTest(30, 28, 4, 15)).toBeCloseTo(
				0.03176, 0.0001);

		});
	});

	describe('distance', function () {
		var x = [[-0.1820998, 0.5415669, -0.5733746, -1.0036722],
			[0.5544853, 0.5796843, -1.1233269, -0.9878692],
			[0.8157908, -0.2502708, 0.2957403, 0.3238394],
			[0.4107834, 0.2916730, 0.3306524, -0.3502162],
			[0.1891520, -0.7958767, 1.0416021, 0.8332562]];
		describe('kendalls', function () {

			function createRealMatrix(data, nRows, nCols) {
				var matrixData = [];
				for (var i = 0, counter = 0; i < nRows; i++) {
					var row = [];
					matrixData.push(row);
					for (var j = 0; j < nCols; j++) {
						row.push(data[counter++]);
					}
				}
				return matrixData;
			}

			function getColumn(data, index) {
				var c = [];
				for (var i = 0, nrows = data.length; i < nrows; i++) {
					c.push(data[i][index]);
				}
				return morpheus.VectorUtil.arrayAsVector(c);
			}

			it('longley', function () {
				var longleyData = [
					60323, 83.0, 234289, 2356, 1590, 107608, 1947,
					61122, 88.5, 259426, 2325, 1456, 108632, 1948,
					60171, 88.2, 258054, 3682, 1616, 109773, 1949,
					61187, 89.5, 284599, 3351, 1650, 110929, 1950,
					63221, 96.2, 328975, 2099, 3099, 112075, 1951,
					63639, 98.1, 346999, 1932, 3594, 113270, 1952,
					64989, 99.0, 365385, 1870, 3547, 115094, 1953,
					63761, 100.0, 363112, 3578, 3350, 116219, 1954,
					66019, 101.2, 397469, 2904, 3048, 117388, 1955,
					67857, 104.6, 419180, 2822, 2857, 118734, 1956,
					68169, 108.4, 442769, 2936, 2798, 120445, 1957,
					66513, 110.8, 444546, 4681, 2637, 121950, 1958,
					68655, 112.6, 482704, 3813, 2552, 123366, 1959,
					69564, 114.2, 502601, 3931, 2514, 125368, 1960,
					69331, 115.7, 518173, 4806, 2572, 127852, 1961,
					70551, 116.9, 554894, 4007, 2827, 130081, 1962
				];
				var matrix = createRealMatrix(longleyData, 16, 7);
				var nVars = matrix[0].length;
				var result = [];
				for (var i = 0; i < nVars; i++) {
					result.push([]);
				}
				for (var i = 0; i < nVars; i++) {
					for (var j = 0; j < i; j++) {
						var corr = morpheus.KendallsCorrelation(getColumn(matrix, i), getColumn(matrix, j));
						result[i][j] = corr;
						result[j][i] = corr;
					}
					result[i][i] = 1;
				}

				var rData = [
					1, 0.9166666666666666, 0.9333333333333332, 0.3666666666666666, 0.05, 0.8999999999999999,
					0.8999999999999999, 0.9166666666666666, 1, 0.9833333333333333, 0.45, 0.03333333333333333,
					0.9833333333333333, 0.9833333333333333, 0.9333333333333332, 0.9833333333333333, 1,
					0.4333333333333333, 0.05, 0.9666666666666666, 0.9666666666666666, 0.3666666666666666,
					0.45, 0.4333333333333333, 1, -0.2166666666666666, 0.4666666666666666, 0.4666666666666666, 0.05,
					0.03333333333333333, 0.05, -0.2166666666666666, 1, 0.05, 0.05, 0.8999999999999999, 0.9833333333333333,
					0.9666666666666666, 0.4666666666666666, 0.05, 1, 0.9999999999999999, 0.8999999999999999,
					0.9833333333333333, 0.9666666666666666, 0.4666666666666666, 0.05, 0.9999999999999999, 1
				];
				var rMatrix = createRealMatrix(rData, 7, 7);
				for (var i = 0; i < nVars; i++) {
					for (var j = 0; j < i; j++) {
						expect(result[i][j]).toBeCloseTo(rMatrix[i][j], 10E-15);
					}
				}
			});


		});
		it('euclidean', function () {
			var x = [[-0.1820998, 0.5415669, -0.5733746, -1.0036722],
				[0.5544853, 0.5796843, -1.1233269, -0.9878692],
				[0.8157908, -0.2502708, 0.2957403, 0.3238394],
				[0.4107834, 0.2916730, 0.3306524, -0.3502162],
				[0.1891520, -0.7958767, 1.0416021, 0.8332562]];
			var r_result = [[], [0.9201673], [2.0348072, 2.1193011],
				[1.2877216, 1.6199561, 0.9556693],
				[2.8123014, 3.1668678, 1.2272642, 1.7714236]];
			var result = [[]];
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
		it('pearson',
			function () {

				var r_result = [
					[1.0000000, 0.83949100, -0.48731451, 0.65581369,
						-0.9305064],
					[0.8394910, 1.00000000, -0.04515611, 0.54485627,
						-0.8772123],
					[-0.4873145, -0.04515611, 1.00000000, 0.09632703,
						0.5147751],
					[0.6558137, 0.54485627, 0.09632703, 1.00000000,
						-0.3662399],
					[-0.9305064, -0.87721233, 0.51477514, -0.36623988,
						1.0000000]];
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
		it('spearman', function () {
			var r_result = [[1.0, 0.8, -0.4, 0.4, -0.8],
				[0.8, 1.0, -0.2, 0.0, -1.0],
				[-0.4, -0.2, 1.0, 0.4, 0.2], [0.4, 0.0, 0.4, 1.0, 0.0],
				[-0.8, -1.0, 0.2, 0.0, 1.0]];
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

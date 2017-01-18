/**
 * Performs clustering using pairwise average linking on the given distance
 * matrix.
 *
 * @return array of nodes. Each node object contains a left, right, and
 *         distance.
 */
morpheus.AverageLinkage = function (nelements, distmatrix) {
	var j;
	var n;
	var clusterid;
	var number;
	var result;
	clusterid = []; // nelements;
	number = []; // nelements;
	result = []; // nelements - 1;
	for (var i = 0; i < nelements - 1; i++) {
		result[i] = {
			left: 0,
			right: 0,
			distance: 0
		};
	}
	/*
	 * Setup a list specifying to which cluster an element belongs, and keep
	 * track of the number of elements in each cluster (needed to calculate the
	 * average).
	 */
	for (j = 0; j < nelements; j++) {
		number[j] = 1;
		clusterid[j] = j;
	}
	// ip, jp, and distance;
	var r = {};
	// result array contains array of int left, int right, float distance;
	for (n = nelements; n > 1; n--) {
		morpheus.HCluster.findClosestPair(n, distmatrix, r);
		result[nelements - n] = {};
		result[nelements - n].distance = r.distance;
		var is = r.ip;
		var js = r.jp;
		/* Save result */
		result[nelements - n].left = clusterid[is];
		result[nelements - n].right = clusterid[js];
		/* Fix the distances */
		var sum = number[is] + number[js];
		for (j = 0; j < js; j++) {
			distmatrix[js][j] = distmatrix[is][j] * number[is]
				+ distmatrix[js][j] * number[js];
			distmatrix[js][j] /= sum;
		}
		for (j = js + 1; j < is; j++) {
			distmatrix[j][js] = distmatrix[is][j] * number[is]
				+ distmatrix[j][js] * number[js];
			distmatrix[j][js] /= sum;
		}
		for (j = is + 1; j < n; j++) {
			distmatrix[j][js] = distmatrix[j][is] * number[is]
				+ distmatrix[j][js] * number[js];
			distmatrix[j][js] /= sum;
		}
		for (j = 0; j < is; j++)
			distmatrix[is][j] = distmatrix[n - 1][j];
		for (j = is + 1; j < n - 1; j++)
			distmatrix[j][is] = distmatrix[n - 1][j];
		/* Update number of elements in the clusters */
		number[js] = sum;
		number[is] = number[n - 1];
		/* Update clusterids */
		clusterid[js] = n - nelements - 1;
		clusterid[is] = clusterid[n - 1];
	}
	return result;
};

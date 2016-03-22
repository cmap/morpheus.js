morpheus.SingleLinkage = function(nelements, distmatrix) {
	var i, j, k;
	var nnodes = nelements - 1;
	var temp = []; // var[nnodes];
	var index = []; // new var[nelements];
	var vector = []; // var[nnodes];
	var result = []; // new Node[nelements];
	for (i = 0; i < nelements; i++) {
		result[i] = {
			left : 0,
			right : 0,
			distance : 0
		};
	}
	for (i = 0; i < nnodes; i++)
		vector[i] = i;
	for (i = 0; i < nelements; i++) {
		result[i].distance = Number.MAX_VALUE;
		for (j = 0; j < i; j++) {
			temp[j] = distmatrix[i][j];
		}
		for (j = 0; j < i; j++) {
			k = vector[j];
			if (result[j].distance >= temp[j]) {
				if (result[j].distance < temp[k]) {
					temp[k] = result[j].distance;
				}
				result[j].distance = temp[j];
				vector[j] = i;
			} else if (temp[j] < temp[k]) {
				temp[k] = temp[j];
			}
		}
		for (j = 0; j < i; j++) {
			if (result[j].distance >= result[vector[j]].distance) {
				vector[j] = i;
			}
		}
	}
	for (i = 0; i < nnodes; i++) {
		result[i].left = i;
	}
	result.sort(function(node1, node2) {
		var term1 = node1.distance;
		var term2 = node2.distance;
		if (term1 < term2)
			return -1;
		if (term1 > term2)
			return +1;
		return 0;
	});
	for (i = 0; i < nelements; i++)
		index[i] = i;
	for (i = 0; i < nnodes; i++) {
		j = result[i].left;
		k = vector[j];
		result[i].left = index[j];
		result[i].right = index[k];
		index[k] = -i - 1;
	}
	var result2 = []; // new Node[nelements - 1];
	for (i = 0; i < nelements - 1; i++) {
		result2[i] = result[i];
	}
	return result2;
};

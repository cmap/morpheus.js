morpheus.CompleteLinkage = function (nelements, distmatrix) {
  var j;
  var n;
  var clusterid = []; // new var[nelements];
  var result = [];// new Node[nelements - 1];
  for (var i = 0; i < nelements - 1; i++) {
    result[i] = {
      left: 0,
      right: 0,
      distance: 0
    };
  }
  /* Setup a list specifying to which cluster a gene belongs */
  for (j = 0; j < nelements; j++) {
    clusterid[j] = j;
  }
  var r = {};
  for (n = nelements; n > 1; n--) {
    morpheus.HCluster.findClosestPair(n, distmatrix, r);
    result[nelements - n].distance = r.distance;
    var is = r.ip;
    var js = r.jp;
    /* Fix the distances */
    for (j = 0; j < js; j++) {
      distmatrix[js][j] = Math.max(distmatrix[is][j], distmatrix[js][j]);
    }
    for (j = js + 1; j < is; j++) {
      distmatrix[j][js] = Math.max(distmatrix[is][j], distmatrix[j][js]);
    }
    for (j = is + 1; j < n; j++) {
      distmatrix[j][js] = Math.max(distmatrix[j][is], distmatrix[j][js]);
    }
    for (j = 0; j < is; j++) {
      distmatrix[is][j] = distmatrix[n - 1][j];
    }
    for (j = is + 1; j < n - 1; j++) {
      distmatrix[j][is] = distmatrix[n - 1][j];
    }
    /* Update clusterids */
    result[nelements - n].left = clusterid[is];
    result[nelements - n].right = clusterid[js];
    clusterid[js] = n - nelements - 1;
    clusterid[is] = clusterid[n - 1];
  }
  return result;
};

morpheus.QNorm = function () {

};
/**
 * Performs quantile normalization.
 */
morpheus.QNorm.execute = function (data) {
  var rows = data.getRowCount();
  var cols = data.getColumnCount();
  var i, j, ind;
  var dimat;
  var row_mean = new Float32Array(rows);
  var ranks = new Float32Array(rows);
  /* # sort original columns */
  dimat = morpheus.QNorm.get_di_matrix(data);
  for (j = 0; j < cols; j++) {
    dimat[j].sort(function (s1, s2) {
      if (s1.data < s2.data) {
        return -1;
      }
      if (s1.data > s2.data) {
        return 1;
      }
      return 0;
    });

  }
  /* # calculate means */
  for (i = 0; i < rows; i++) {
    var sum = 0.0;
    var numNonMissing = 0;
    for (j = 0; j < cols; j++) {
      var f = dimat[j][i].data;
      if (!isNaN(f)) {
        sum += f;
        numNonMissing++;
      }
    }
    row_mean[i] = sum / numNonMissing;
  }

  /* # unsort mean columns */
  for (j = 0; j < cols; j++) {
    morpheus.QNorm.get_ranks(ranks, dimat[j], rows);
    for (i = 0; i < rows; i++) {
      ind = dimat[j][i].rank;
      if (ranks[i] - Math.floor(ranks[i]) > 0.4) {
        data.setValue(ind, j, 0.5 * (row_mean[Math.floor(ranks[i]) - 1] + row_mean[Math.floor(ranks[i])]));
      } else {
        data.setValue(ind, j, row_mean[Math.floor(ranks[i]) - 1]);
      }
    }
  }
};

/**
 * ************************************************************************
 * * * dataitem **get_di_matrix(var *data, var rows, var cols) * * given
 * data form a matrix of dataitems, each element of * matrix holds datavalue
 * and original index so that * normalized data values can be resorted to
 * the original order *
 * ************************************************************************
 */

morpheus.QNorm.get_di_matrix = function (data) {
  var i, j;
  var rows = data.getRowCount();
  var cols = data.getColumnCount();
  var dimat = [];
  for (j = 0; j < cols; j++) {
    dimat.push([]);
    for (i = 0; i < rows; i++) {
      dimat[j][i] = {};
      dimat[j][i].data = data.getValue(i, j);
      dimat[j][i].rank = i;
    }
  }
  return dimat;
};

/**
 * ************************************************************************
 * * * var *get_ranks(dataitem *x,var n) * * getParameterValue ranks in
 * the same manner as R does. Assume that *x is * already sorted *
 * ************************************************************************
 */

morpheus.QNorm.get_ranks = function (rank, x, n) {
  var i, j, k;
  i = 0;
  while (i < n) {
    j = i;
    while ((j < n - 1) && (x[j].data == x[j + 1].data)) {
      j++;
    }
    if (i != j) {
      for (k = i; k <= j; k++) {
        rank[k] = (i + j + 2) / 2.0;
      }
    } else {
      rank[i] = i + 1;
    }
    i = j + 1;
  }
};


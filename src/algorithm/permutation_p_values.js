morpheus.PermutationPValues = function (dataset, aIndices, bIndices,
                                        numPermutations, f, continuousList) {
  var numRows = dataset.getRowCount();
  /** unpermuted scores */
  var scores = new Float32Array(numRows);
  /** Whether to smooth p values */
  var smoothPValues = true;
  var permuter;
  var permutationScore;
  if (aIndices != null) {
    var list1 = new morpheus.DatasetRowView(new morpheus.SlicedDatasetView(
      dataset, null, aIndices));
    var list2 = new morpheus.DatasetRowView(new morpheus.SlicedDatasetView(
      dataset, null, bIndices));
    dataset = new morpheus.SlicedDatasetView(dataset, null, aIndices
    .concat(bIndices));
    permuter = new morpheus.UnbalancedPermuter(aIndices.length,
      bIndices.length);
    permutationScore = new morpheus.TwoClassPermutationScore();
    permutationScore.init(dataset, f);
    for (var i = 0; i < numRows; i++) {
      scores[i] = f(list1.setIndex(i), list2.setIndex(i));
    }
  } else { // continuous
    permuter = new morpheus.UnbalancedContinuousPermuter(continuousList.size());
    permutationScore = new morpheus.ContinuousPermutationScore(continuousList);
    permutationScore.init(dataset, f);
    var list = new morpheus.DatasetRowView(dataset);
    for (var i = 0; i < numRows; i++) {
      scores[i] = f(continuousList, list.setIndex(i));
    }
  }

  var rowSpecificPValues = new Float32Array(numRows);

  for (var permutationIndex = 0; permutationIndex < numPermutations; permutationIndex++) {
    permutationScore.setPermutation(permuter.next());
    for (var i = 0; i < numRows; i++) {
      var permutedScore = permutationScore.getScore(i);
      var score = scores[i];
      if (permutedScore >= score) {
        rowSpecificPValues[i]++;
      }
    }
  }
  var N = numPermutations;
  var kArray = new Uint32Array(numRows);
  for (var i = 0; i < numRows; i++) {
    var k = rowSpecificPValues[i];
    kArray[i] = k;
    var p;
    if (smoothPValues) {
      p = (k + 1) / (N + 2);
    } else {
      p = k / N;

    }
    // 2-sided p-value
    var oneMinusP = 1 - p;
    if (oneMinusP < p) {
      p = oneMinusP;
    }
    p *= 2;
    if (p === 0) {
      // ensure not degenerate case where profile is
      // completely
      // flat
      // TODO handle cases where profile is flat (but not
      // completely)

      var val = dataset.getValue(i, 0);
      var flat = true;
      for (var j = 1, cols = dataset.getColumnCount(); j < cols && flat; j++) {
        if (dataset.getValue(i, j) != val) {
          flat = false;
        }
      }
      if (flat) {
        p = 1;
      }
    }
    rowSpecificPValues[i] = p;

  }
  this.rowSpecificPValues = rowSpecificPValues;
  this.k = kArray;
  this.fdr = morpheus.FDR_BH(rowSpecificPValues);
  this.scores = scores;
};
morpheus.PermutationPValues.prototype = {
  getBonferroni: function (index) {
    return Math.min(this.rowSpecificPValues[index] * this.numRows, 1);
  }
};

morpheus.UnbalancedContinuousPermuter = function (size) {
  var indices = new Uint32Array(size);
  for (var i = 0; i < indices.length; i++) {
    indices[i] = i;
  }
  var n = indices.length;
  // Returns a random integer between min (included) and max (included)
  // Using Math.round() will give you a non-uniform distribution!
  function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  this.next = function () {
    // shuffle indices array
    for (var i = n - 1; i >= 1; i--) {
      var j = getRandomIntInclusive(0, i); // random integer such that
      // 0 ≤ j ≤ i
      // exchange a[j] and a[i]
      var tmp = indices[j];
      indices[j] = indices[i];
      indices[i] = tmp;
    }

    return indices;
  };
};

morpheus.UnbalancedPermuter = function (numClassZero, numClassOne) {
  var assignments = new Uint32Array(numClassZero + numClassOne);
  var indices = new Uint32Array(numClassZero + numClassOne);
  for (var i = 0; i < indices.length; i++) {
    indices[i] = i;
  }
  var n = indices.length;
  // Returns a random integer between min (included) and max (included)
  // Using Math.round() will give you a non-uniform distribution!
  function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  this.next = function () {
    // shuffle indices array
    for (var i = n - 1; i >= 1; i--) {
      var j = getRandomIntInclusive(0, i); // random integer such that
      // 0 ≤ j ≤ i
      // exchange a[j] and a[i]
      var tmp = indices[j];
      indices[j] = indices[i];
      indices[i] = tmp;
    }

    // pick 1st numClassOne indices to be class one
    for (var i = 0; i < n; i++) {
      assignments[i] = 0;
    }
    for (var i = 0; i < numClassOne; i++) {
      assignments[indices[i]] = 1;
    }

    return assignments;
  };
};

morpheus.TwoClassPermutationScore = function () {
  this.classZeroView = null;
  this.classOneView = null;

};
morpheus.TwoClassPermutationScore.prototype = {
  getScore: function (index) {
    this.classZeroView.setIndex(index);
    this.classOneView.setIndex(index);
    return this.f(this.classZeroView, this.classOneView);
  },
  init: function (dataset, f) {
    this.dataset = dataset;
    this.classZeroView = new morpheus.DatasetRowView(dataset);
    this.classOneView = new morpheus.DatasetRowView(dataset);
    this.f = f;
  },
  setPermutation: function (permutedAssignments) {
    var zeroIndices = [];
    var oneIndices = [];
    for (var i = 0, length = permutedAssignments.length; i < length; i++) {
      if (permutedAssignments[i] === 0) {
        zeroIndices.push(i);
      } else {
        oneIndices.push(i);
      }
    }

    this.classZeroView.setDataset(new morpheus.SlicedDatasetView(
      this.dataset, null, zeroIndices));
    this.classOneView.setDataset(new morpheus.SlicedDatasetView(
      this.dataset, null, oneIndices));

  }

};

morpheus.ContinuousPermutationScore = function (referenceList) {
  this.referenceList = referenceList;
};
morpheus.ContinuousPermutationScore.prototype = {
  getScore: function (index) {
    this.datasetRowView.setIndex(index);
    return this.f(this.referenceListView, this.datasetRowView);
  },
  init: function (dataset, f) {
    this.dataset = dataset;
    this.referenceListView = null;
    this.datasetRowView = new morpheus.DatasetRowView(dataset);
    this.f = f;
  },
  setPermutation: function (indices) {
    this.referenceListView = new morpheus.SlicedVector(this.referenceList, indices);
  }

};

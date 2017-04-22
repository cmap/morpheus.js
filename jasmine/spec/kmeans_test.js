describe('k_means_test', function () {

  function CloseDistance(a, b) {
    return morpheus.Euclidean(a, b) * 0.001;
  }

  it('testPerformClusterAnalysisDegenerate', function () {
    var clusterer = new morpheus.KMeansPlusPlusClusterer(1, 1, morpheus.Euclidean);
    var points = [morpheus.VectorUtil.arrayAsVector([1959, 325100]), morpheus.VectorUtil.arrayAsVector([1960, 373200])];
    var clusters = clusterer.execute(points);

    expect(1).toEqual(clusters.length);
    expect(2).toEqual(clusters[0].getPoints().length);
    var pt1 = morpheus.VectorUtil.arrayAsVector([1959, 325100]);
    var pt2 = morpheus.VectorUtil.arrayAsVector([1960, 373200]);

    expect(clusters[0].getPoints().indexOf(pt1) !== -1).not.toEqual(-1);
    expect(clusters[0].getPoints().indexOf(pt2) !== -1).not.toEqual(-1);
  });

  it('testTwoClusters', function () {
    var data = [
      [1, 1, 1],
      [2, 2, 2],
      [3, 3, 3],
      [4, 4, 4],
      [5, 5, 5],
      [20, 20, 20],
      [200, 200, 200]
    ];
    var points = [];
    for (var i = 0; i < data.length; i++) {
      points.push(morpheus.VectorUtil.arrayAsVector(data[i]));
    }

    var clusterer = new morpheus.KMeansPlusPlusClusterer(2, 20, morpheus.Euclidean);
    var clusters = clusterer.execute(points);
    var expectedAssignments = [0, 0, 0, 0, 0, 1, 1];
    for (var i = 0; i < data.length; i++) {
      expect(clusters[expectedAssignments[i]].getPoints().indexOf(points[i]) !== -1).not.toEqual(-1);
    }
  });

  it('testThreeClusters', function () {
    var data = [
      [1, 1, 1],
      [2, 2, 2],
      [3, 3, 3],
      [4, 4, 4],
      [5, 5, 5],
      [20, 20, 20],
      [200, 200, 200]
    ];
    var points = [];
    for (var i = 0; i < data.length; i++) {
      points.push(morpheus.VectorUtil.arrayAsVector(data[i]));
    }
    var clusterer = new morpheus.KMeansPlusPlusClusterer(3, 20, morpheus.Euclidean);
    var clusters = clusterer.execute(points);
    var expectedAssignments = [0, 0, 0, 0, 1, 2, 2];
    for (var i = 0; i < data.length; i++) {
      expect(clusters[expectedAssignments[i]].getPoints().indexOf(points[i]) !== -1).not.toEqual(-1);
    }
  })

  it('testCertainSpace', function () {
    var numberOfVariables = 27;
    // initialise testvalues
    var position1 = 1;
    var position2 = position1 + numberOfVariables;
    var position3 = position2 + numberOfVariables;
    var position4 = position3 + numberOfVariables;
    // testvalues will be multiplied
    var multiplier = 1000000;

    var breakingPoints = [];
    // define the space which will break the cluster algorithm
    for (var i = 0; i < numberOfVariables; i++) {
      var points = [position1, position2, position3, position4];
      // multiply the values
      for (var j = 0; j < points.length; j++) {
        points[j] *= multiplier;
      }
      var p = morpheus.VectorUtil.arrayAsVector(points);
      breakingPoints[i] = p;
      position1 += numberOfVariables;
      position2 += numberOfVariables;
      position3 += numberOfVariables;
      position4 += numberOfVariables;
    }

    for (var n = 2; n < 27; ++n) {
      var transformer =
        new morpheus.KMeansPlusPlusClusterer(n, 100, morpheus.Euclidean);
      var clusters = transformer.execute(breakingPoints);
      expect(n).toEqual(clusters.length);

      var sum = 0;
      clusters.forEach(function (cluster) {
        sum += cluster.getPoints().length;
      });
      expect(numberOfVariables).toEqual(sum);
    }
  });

  it('testSmallDistances', function () {
    var repeatedArray = [0];
    var uniqueArray = [1];
    var repeatedPoint = morpheus.VectorUtil.arrayAsVector(repeatedArray, 'repeat');
    var uniquePoint = morpheus.VectorUtil.arrayAsVector(uniqueArray, 'unique');
    var points = [];
    var NUM_REPEATED_POINTS = 10 * 1000;
    for (var i = 0; i < NUM_REPEATED_POINTS; ++i) {
      points.push(repeatedPoint);
    }
    points.push(uniquePoint);

    // Ask a KMeansPlusPlusClusterer to run zero iterations (i.e., to simply choose initial
    // cluster centers).
    var NUM_CLUSTERS = 2;
    var NUM_ITERATIONS = 0;

    var clusterer = new morpheus.KMeansPlusPlusClusterer(NUM_CLUSTERS, NUM_ITERATIONS, CloseDistance);
    var clusters = clusterer.execute(points);

    // Check that one of the chosen centers is the unique point.
    var uniquePointIsCenter = false;
    clusters.forEach(function (cluster) {
      var center = cluster.getCenter().getPoint();
      var allEqual = true;
      for (var i = 0; i < center.size(); i++) {
        if (center.getValue(i) !== uniquePoint.getValue(i)) {
          allEqual = false;
        }
      }
      if (allEqual) {
        uniquePointIsCenter = true;
      }
    });
    expect(uniquePointIsCenter).toEqual(true);
  });
});

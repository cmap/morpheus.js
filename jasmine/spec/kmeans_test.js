describe('k_means_test', function () {
  function DoublePoint(point) {
    this.getPoint = function () {
      return point;
    };
  }

  function CloseDistance(a, b) {
    return morpheus.Euclidean(a, b) * 0.001;
  }

  it('testPerformClusterAnalysisDegenerate', function () {
    var transformer = new morpheus.KMeansPlusPlusClusterer(1, 1, morpheus.Euclidean);

    var points = [new DoublePoint([1959, 325100]), new DoublePoint([1960, 373200])];
    var clusters = transformer.cluster(points);

    expect(1).toEqual(clusters.length);
    expect(2).toEqual(clusters[0].getPoints().length);
    var pt1 = new DoublePoint([1959, 325100]);
    var pt2 = new DoublePoint([1960, 373200]);

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

    var clusterer = new morpheus.KMeansPlusPlusClusterer(2, 20, morpheus.Euclidean);
    var clusters = clusterer.execute(data);
    var expectedAssignments = [0, 0, 0, 0, 0, 1, 1];
    for (var i = 0; i < data.length; i++) {
      expect(clusters[expectedAssignments[i]].getPoints().indexOf(data[i]) !== -1).not.toEqual(-1);
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

    var clusterer = new morpheus.KMeansPlusPlusClusterer(3, 20, morpheus.Euclidean);
    var clusters = clusterer.execute(data);
    var expectedAssignments = [0, 0, 0, 0, 1, 2, 2];
    for (var i = 0; i < data.length; i++) {
      expect(clusters[expectedAssignments[i]].getPoints().indexOf(data[i]) !== -1).not.toEqual(-1);
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
      var p = new DoublePoint(points);
      breakingPoints[i] = p;
      position1 += numberOfVariables;
      position2 += numberOfVariables;
      position3 += numberOfVariables;
      position4 += numberOfVariables;
    }

    for (var n = 2; n < 27; ++n) {
      var transformer =
        new morpheus.KMeansPlusPlusClusterer(n, 100, morpheus.Euclidean);
      var clusters = transformer.cluster(breakingPoints);
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
    var repeatedPoint = new DoublePoint(repeatedArray);
    var uniquePoint = new DoublePoint(uniqueArray);

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

    var clusterer =
      new morpheus.KMeansPlusPlusClusterer(NUM_CLUSTERS, NUM_ITERATIONS, CloseDistance);
    var clusters = clusterer.cluster(points);

    // Check that one of the chosen centers is the unique point.
    var uniquePointIsCenter = false;
    clusters.forEach(function (cluster) {
      if (cluster.getCenter() === uniquePoint) {
        uniquePointIsCenter = true;
      }
    });
    expect(uniquePointIsCenter).toEqual(true);
  });
});

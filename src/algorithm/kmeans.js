/**
 * Clustering algorithm based on David Arthur and Sergei Vassilvitski k-means++ algorithm.
 * @param <T> type of the points to cluster
 * @see <a href="http://en.wikipedia.org/wiki/K-means%2B%2B">K-means++ (wikipedia)</a>
 * @since 3.2
 */

/**
 * @param dataset The dataset to cluster the rows of
 * @param distance
 * @param k The number of clusters
 * @param maxIterations The maximum number of iterations
 * @constructor
 */
morpheus.KMeansPlusPlusClusterer = function (k, maxIterations, distanceFunction) {

  var distance = function (points1, points2) {
    return distanceFunction(morpheus.VectorUtil.arrayAsVector(points1.getPoint()), morpheus.VectorUtil.arrayAsVector(points2.getPoint()));
  };

  function nextInt(upperBound) {
    return (Math.floor(Math.random() * upperBound)) | 0;
  }

  function nextDouble() {
    return Math.random();
  }

  function DoublePoint(point) {
    this.getPoint = function () {
      return point;
    };
  }

  function CentroidCluster(center) {
    var centroidPoints = [];
    this.addPoint = function (p) {
      centroidPoints.push(p);
    };
    this.getPoints = function () {
      return centroidPoints;
    };
    this.getCenter = function () {
      return center;
    };
  }

  /**
   * Runs the K-means++ clustering algorithm.
   *
   * @param points the points to cluster
   * @return a list of clusters containing the points
   */
  function cluster(points) {
    // number of clusters has to be smaller or equal the number of data points
    if (points.length < k) {
      throw 'Too many clusters';
    }

    // create the initial clusters
    var clusters = chooseInitialCenters(points);

    // create an array containing the latest assignment of a point to a cluster
    // no need to initialize the array, as it will be filled with the first assignment
    var assignments = new Int32Array(points.length);
    assignPointsToClusters(clusters, points, assignments);
    // iterate through updating the centers until we're done
    var max = (maxIterations < 0) ? Number.MAX_VALUE : maxIterations;
    for (var count = 0; count < max; count++) {
      var emptyCluster = false;
      var newClusters = [];
      for (var clusterIndex = 0; clusterIndex < clusters.length; clusterIndex++) {
        var cluster = clusters[clusterIndex];
        var newCenter;
        if (cluster.getPoints().length === 0) {
          newCenter = getPointFromLargestVarianceCluster(clusters);
          emptyCluster = true;
        } else {
          newCenter = centroidOf(cluster.getPoints(), cluster.getCenter().getPoint().length);
        }
        newClusters.push(new CentroidCluster(newCenter));
      }
      var changes = assignPointsToClusters(newClusters, points, assignments);
      clusters = newClusters;

      // if there were no more changes in the point-to-cluster assignment
      // and there are no empty clusters left, return the current clusters
      if (changes === 0 && !emptyCluster) {
        return clusters;
      }
    }
    return clusters;
  }

  /**
   * Adds the given points to the closest {@link Cluster}.
   *
   * @param clusters the {@link Cluster}s to add the points to
   * @param points the points to add to the given {@link Cluster}s
   * @param assignments points assignments to clusters
   * @return the number of points assigned to different clusters as the iteration before
   */
  function assignPointsToClusters(clusters, points, assignments) {
    var assignedDifferently = 0;
    var pointIndex = 0;
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      var clusterIndex = getNearestCluster(clusters, p);
      if (clusterIndex != assignments[pointIndex]) {
        assignedDifferently++;
      }

      var cluster = clusters[clusterIndex];
      cluster.addPoint(p);
      assignments[pointIndex++] = clusterIndex;
    }

    return assignedDifferently;
  }

  /**
   * Use K-means++ to choose the initial centers.
   *
   * @param points the points to choose the initial centers from
   * @return the initial centers
   */
  function chooseInitialCenters(points) {

    // Convert to list for indexed access. Make it unmodifiable, since removal of items
    // would screw up the logic of this method.
    var pointList = points.slice(0);

    // The number of points in the list.
    var numPoints = pointList.length;

    // Set the corresponding element in this array to indicate when
    // elements of pointList are no longer available.
    var taken = new Array(numPoints);
    for (var i = 0; i < taken.length; i++) {
      taken[i] = false;
    }

    // The resulting list of initial centers.
    var resultSet = [];

    // Choose one center uniformly at random from among the data points.
    var firstPointIndex = nextInt(numPoints);
    var firstPoint = pointList[firstPointIndex];
    resultSet.push(new CentroidCluster(firstPoint));
    // Must mark it as taken
    taken[firstPointIndex] = true;

    // To keep track of the minimum distance squared of elements of
    // pointList to elements of resultSet.

    var minDistSquared = new Float64Array(numPoints);

    // Initialize the elements.  Since the only point in resultSet is firstPoint,
    // this is very easy.
    for (var i = 0; i < numPoints; i++) {
      if (i !== firstPointIndex) { // That point isn't considered
        var d = distance(firstPoint, pointList[i]);
        minDistSquared[i] = d * d;
      }
    }

    while (resultSet.length < k) {
      // Sum up the squared distances for the points in pointList not
      // already taken.
      var distSqSum = 0.0;

      for (var i = 0; i < numPoints; i++) {
        if (!taken[i]) {
          distSqSum += minDistSquared[i];
        }
      }

      // Add one new data point as a center. Each point x is chosen with
      // probability proportional to D(x)2
      var r = nextDouble() * distSqSum;

      // The index of the next point to be added to the resultSet.
      var nextPointIndex = -1;

      // Sum through the squared min distances again, stopping when
      // sum >= r.
      var sum = 0.0;
      for (var i = 0; i < numPoints; i++) {
        if (!taken[i]) {
          sum += minDistSquared[i];
          if (sum >= r) {
            nextPointIndex = i;
            break;
          }
        }
      }

      // If it's not set to >= 0, the point wasn't found in the previous
      // for loop, probably because distances are extremely small.  Just pick
      // the last available point.
      if (nextPointIndex === -1) {
        for (var i = numPoints - 1; i >= 0; i--) {
          if (!taken[i]) {
            nextPointIndex = i;
            break;
          }
        }
      }

      // We found one.
      if (nextPointIndex >= 0) {

        var p = pointList[nextPointIndex];

        resultSet.push(new CentroidCluster(p));

        // Mark it as taken.
        taken[nextPointIndex] = true;

        if (resultSet.length < k) {
          // Now update elements of minDistSquared.  We only have to compute
          // the distance to the new center to do this.
          for (var j = 0; j < numPoints; j++) {
            // Only have to worry about the points still not taken.
            if (!taken[j]) {
              var d = distance(p, pointList[j]);
              var d2 = d * d;
              if (d2 < minDistSquared[j]) {
                minDistSquared[j] = d2;
              }
            }
          }
        }

      } else {
        // None found --
        // Break from the while loop to prevent
        // an infinite loop.
        break;
      }
    }
    return resultSet;
  }

  /**
   * Get a random point from the {@link Cluster} with the largest distance variance.
   *
   * @param clusters the {@link Cluster}s to search
   * @return a random point from the selected cluster
   * @throws ConvergenceException if clusters are all empty
   */
  function getPointFromLargestVarianceCluster(clusters) {
    var maxVariance = -Number.MAX_VALUE;
    var selected = null;
    for (var clusterIndex = 0; clusterIndex < clusters.length; clusterIndex++) {
      var cluster = clusters[clusterIndex];
      if (cluster.getPoints().length > 0) {
        // compute the distance variance of the current cluster
        var center = cluster.getCenter();
        var points = cluster.getPoints();
        var distances = new Float32Array(points.length);
        for (var i = 0; i < points.length; i++) {
          distances[i] = distance(points[i], center);
        }

        var variance = morpheus.Variance(morpheus.VectorUtil.arrayAsVector(distances));
        // select the cluster with the largest variance
        if (variance > maxVariance) {
          maxVariance = variance;
          selected = cluster;
        }
      }
    }

    // did we find at least one non-empty cluster ?
    if (selected == null) {
      throw 'Empty cluster';
    }

    // extract a random point from the cluster
    var selectedPoints = selected.getPoints();
    return selectedPoints.splice(nextInt(selectedPoints.length), 1);

  }

  // /**
  //  * Get the point farthest to its cluster center
  //  *
  //  * @param clusters the {@link Cluster}s to search
  //  * @return point farthest to its cluster center
  //  * @throws ConvergenceException if clusters are all empty
  //  */
  // function getFarthestPoint(clusters) {
  //
  //   var maxDistance = Number.NEGATIVE_INFINITY;
  //   var selectedCluster = null;
  //   var selectedPoint = -1;
  //   for (var clusterIndex = 0; clusterIndex < clusters.length; clusterIndex++) {
  //     var c = clusters[clusterIndex];
  //     // get the farthest point
  //     var center = cluster.getCenter();
  //     var points = cluster.getPoints();
  //     for (var i = 0; i < points.length; ++i) {
  //       var d = distance(points[i], center);
  //       if (d > maxDistance) {
  //         maxDistance = d;
  //         selectedCluster = cluster;
  //         selectedPoint = i;
  //       }
  //     }
  //
  //   }
  //
  //   // did we find at least one non-empty cluster ?
  //   if (selectedCluster == null) {
  //     throw 'Empty cluster';
  //   }
  //
  //   return selectedCluster.getPoints().splice(selectedPoint, 1);
  //
  // }

  /**
   * Returns the nearest {@link Cluster} to the given point
   *
   * @param clusters the {@link Cluster}s to search
   * @param point the point to find the nearest {@link Cluster} for
   * @return the index of the nearest {@link Cluster} to the given point
   */
  function getNearestCluster(clusters, point) {
    var minDistance = Number.MAX_VALUE;
    var clusterIndex = 0;
    var minCluster = 0;
    for (var i = 0; i < clusters.length; i++) {
      var c = clusters[i];
      var d = distance(point, c.getCenter());
      if (d < minDistance) {
        minDistance = d;
        minCluster = clusterIndex;
      }
      clusterIndex++;
    }
    return minCluster;
  }

  /**
   * Computes the centroid for a set of points.
   *
   * @param points the set of points
   * @param dimension the point dimension
   * @return the computed centroid for the set of points
   */
  function centroidOf(points, dimension) {
    var centroid = new Float32Array(dimension);
    for (var pointIndex = 0; pointIndex < points.length; pointIndex++) {
      var p = points[pointIndex];
      var point = p.getPoint();
      for (var i = 0; i < centroid.length; i++) {
        centroid[i] += point[i];
      }
    }
    for (var i = 0; i < centroid.length; i++) {
      centroid[i] /= points.length;
    }
    return new DoublePoint(centroid);
  }

  this.execute = function (arrayOfArraysToCluster) {
    var points = [];
    // cluster rows
    var npoints = arrayOfArraysToCluster.length;
    for (var i = 0; i < npoints; i++) {
      var p = new DoublePoint(arrayOfArraysToCluster[i]);
      p.i = i;
      points.push(p);
    }
    return cluster(points);
  };
  this.cluster = cluster;
};

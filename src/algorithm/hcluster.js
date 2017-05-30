/**
 *
 * @param distmatrix
 * @param linkageAlgorithm {Function}
 * @constructor
 */
morpheus.HCluster = function (distmatrix, linkageAlgorithm) {
  var nelements = distmatrix.length;
  var nNodes = nelements - 1;
  if (nNodes === -1) {

    var root = {
      id: 0,
      height: 0,
      index: 0,
      minIndex: 0,
      maxIndex: 0,
      depth: 0
    };

    this.tree = {
      maxHeight: 0,
      rootNode: root,
      leafNodes: [],
      nLeafNodes: 0
    };
    this.reorderedIndices = [0];
    return;
  }
  // tree array contains array of int left, int right, float distance;
  var tree = linkageAlgorithm(nelements, distmatrix);
  var nodeorder = []; // nNodes;
  var nodecounts = [];// nNodes;
  var order = []; // nelements;
  var nodeID = []; // nNodes;
  for (var i = 0; i < nelements; i++) {
    order[i] = i;
  }
  var leftIds = []; // nNodes
  var rightIds = []; // nNodes
  for (var i = 0; i < nNodes; i++) {
    var min1 = tree[i].left;
    var min2 = tree[i].right;
    /* min1 and min2 are the elements that are to be joined */
    var order1;
    var order2;
    var counts1;
    var counts2;
    var ID1;
    var ID2;
    nodeID[i] = nNodes + (i + 2);
    if (min1 < 0) {
      var index1 = -min1 - 1;
      order1 = nodeorder[index1];
      counts1 = nodecounts[index1];
      ID1 = nodeID[index1];
      tree[i].distance = Math
      .max(tree[i].distance, tree[index1].distance);
    } else {
      order1 = order[min1];
      counts1 = 1;
      ID1 = min1;
    }
    if (min2 < 0) {
      var index2 = -min2 - 1;
      order2 = nodeorder[index2];
      counts2 = nodecounts[index2];
      ID2 = nodeID[index2];
      tree[i].distance = Math
      .max(tree[i].distance, tree[index2].distance);
    } else {
      order2 = order[min2];
      counts2 = 1;
      ID2 = min2;
    }
    leftIds[i] = ID1;
    rightIds[i] = ID2;
    nodecounts[i] = counts1 + counts2;
    nodeorder[i] = (counts1 * order1 + counts2 * order2)
      / (counts1 + counts2);
  }
  var reorderedIndices = morpheus.HCluster.treeSort(nNodes, order, nodeorder,
    nodecounts, tree);
  var idToIndex = {};
  for (var i = 0, length = reorderedIndices.length; i < length; i++) {
    var index = reorderedIndices[i];
    idToIndex[index] = i;
  }
  var nodeIdToNode = {};
  var node;
  for (var i = 0, length = nodeID.length; i < length; i++) {
    var id = nodeID[i];
    var leftId = leftIds[i];
    var lnode = nodeIdToNode[leftId];
    if (lnode === undefined) {
      lnode = {
        id: leftId
      };
      var index = idToIndex[leftId];
      lnode.index = index;
      lnode.minIndex = index;
      lnode.maxIndex = index;
      nodeIdToNode[lnode.id] = lnode;
    }
    var rightId = rightIds[i];
    var rnode = nodeIdToNode[rightId];
    if (rnode === undefined) {
      rnode = {
        id: rightId
      };
      var index = idToIndex[rightId];
      rnode.index = index;
      rnode.minIndex = index;
      rnode.maxIndex = index;
      nodeIdToNode[rnode.id] = rnode;
    }
    node = {
      id: id,
      children: lnode.index < rnode.index ? [lnode, rnode] : [rnode, lnode],
      height: tree[i].distance,
      index: (rnode.index + lnode.index) / 2.0
    };

    node.minIndex = Math.min(rnode.minIndex, lnode.minIndex);
    node.maxIndex = Math.max(rnode.maxIndex, lnode.maxIndex);
    lnode.parent = node;
    rnode.parent = node;
    nodeIdToNode[node.id] = node;
  }
  this.reorderedIndices = reorderedIndices;
  var leafNodes = [];
  for (var i = 0, length = reorderedIndices.length; i < length; i++) {
    var leaf = nodeIdToNode[reorderedIndices[i]];
    leaf.height = 0;
    leafNodes.push(leaf);
  }

  morpheus.DendrogramUtil.setNodeDepths(node);

  this.tree = {
    maxHeight: node.height,
    rootNode: node,
    leafNodes: leafNodes,
    nLeafNodes: leafNodes.length
  };
};
/*
 * Searches the distance matrix to find the pair with the shortest distance
 * between them. The indices of the pair are returned in ip and jp; the distance
 * itself is returned by the function.
 * 
 * @param n The number of elements in the distance matrix.
 * 
 * @param distmatrix. A ragged array containing the distance matrix. The number
 * of columns in each row is one less than the row index.
 * 
 * @return The first and second indices of the pair with the shortest distance.
 */
morpheus.HCluster.findClosestPair = function (n, distmatrix, r) {
  var i, j;
  var temp;
  var distance = distmatrix[1][0];
  var ip = 1;
  var jp = 0;
  for (i = 1; i < n; i++) {
    for (j = 0; j < i; j++) {
      temp = distmatrix[i][j];
      if (temp < distance) {
        distance = temp;
        ip = i;
        jp = j;
      }
    }
  }
  r.distance = distance;
  r.ip = ip;
  r.jp = jp;
};
/**
 * Creates a ragged array with the number of rows equal to the number of rows in
 * the dataset. Each row in the array has n columns where n is the row index.
 *
 * @param dataset
 * @param distanceFunction
 *            The distance function. Use 0 to assume dataset is already a
 *            distance matrix, 1 to assume dataset is already a similarity
 *            matrix.
 * @return the distance matrix
 */
morpheus.HCluster.computeDistanceMatrix = function (dataset, distanceFunction) {
  /* Set up the ragged array */
  var matrix = [];
  var n = dataset.getRowCount();
  for (var i = 1; i < n; i++) {
    matrix[i] = new Float32Array(i);
  }
  // assume dataset is already a distance matrix
  if (distanceFunction === 0) {
    for (var i = 1; i < n; i++) {
      for (var j = 0; j < i; j++) {
        matrix[i][j] = dataset.getValue(i, j);
      }
    }
  } else if (distanceFunction === 1) { // already a similarity matrix
    var max = -Number.MAX_VALUE;
    for (var i = 1; i < n; i++) {
      for (var j = 0; j < i; j++) {
        var value = dataset.getValue(i, j);
        if (!isNaN(value)) {
          max = Math.max(value, max);
        }
      }
    }
    for (var i = 1; i < n; i++) {
      for (var j = 0; j < i; j++) {
        matrix[i][j] = max - dataset.getValue(i, j);
      }
    }
  } else {
    var list1 = new morpheus.DatasetRowView(dataset);
    var list2 = new morpheus.DatasetRowView(dataset);
    /* Calculate the distances and save them in the ragged array */
    for (var i = 1; i < n; i++) {
      list1.setIndex(i);
      for (var j = 0; j < i; j++) {
        matrix[i][j] = distanceFunction(list1, list2.setIndex(j));
      }
    }
  }

  return matrix;
};
morpheus.HCluster.treeSort = function (nNodes, order, nodeorder, nodecounts,
                                       tree) {
  var nElements = nNodes + 1;
  var i;
  var neworder = []; // nElements;
  var clusterids = []; // nElements;
  for (i = 0; i < nElements; i++) {
    clusterids[i] = i;
    neworder[i] = 0;
  }
  for (i = 0; i < nNodes; i++) {
    var i1 = tree[i].left;
    var i2 = tree[i].right;
    var order1 = (i1 < 0) ? nodeorder[-i1 - 1] : order[i1];
    var order2 = (i2 < 0) ? nodeorder[-i2 - 1] : order[i2];
    var count1 = (i1 < 0) ? nodecounts[-i1 - 1] : 1;
    var count2 = (i2 < 0) ? nodecounts[-i2 - 1] : 1;
    /*
     * If order1 and order2 are equal, their order is determined by the
     * order in which they were clustered
     */
    if (i1 < i2) {
      var increase = (order1 < order2) ? count1 : count2;
      var j;
      for (j = 0; j < nElements; j++) {
        var clusterid = clusterids[j];
        if ((clusterid == i1) && (order1 >= order2)) {
          neworder[j] += increase;
        }
        if ((clusterid == i2) && (order1 < order2)) {
          neworder[j] += increase;
        }
        if ((clusterid == i1) || (clusterid == i2)) {
          clusterids[j] = -i - 1;
        }
      }
    } else {
      var increase = (order1 <= order2) ? count1 : count2;
      var j;
      for (j = 0; j < nElements; j++) {
        var clusterid = clusterids[j];
        if ((clusterid == i1) && (order1 > order2)) {
          neworder[j] += increase;
        }
        if ((clusterid == i2) && (order1 <= order2)) {
          neworder[j] += increase;
        }
        if ((clusterid == i1) || (clusterid == i2)) {
          clusterids[j] = -i - 1;
        }
      }
    }
  }
  return morpheus.Util.indexSort(neworder, true);
};

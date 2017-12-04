/**
 * Default implementation of a dataset.
 *
 * @extends {morpheus.AbstractDataset}
 * @param options.rows {number} Number of rows
 * @param options.columns {number} Number of columns
 * @param options.name {string} Dataset name
 * @param options.dataType {string=} Data type that 1st series holds.
 * @constructor
 */
morpheus.Dataset = function (options) {
  morpheus.AbstractDataset.call(this, options.rows,
    options.columns);

  if (options.dataType == null) {
    options.dataType = 'Float32';
  }

  this.seriesNames.push(options.name);
  this.seriesArrays.push(morpheus.Dataset.createMatrix(options));
  this.seriesDataTypes.push(options.dataType);
};
/**
 *
 * @param dataset
 * @param options.rowFields
 * @param options.columnFields
 * @param options.seriesIndices
 * @return JSON representation of a dataset
 */
morpheus.Dataset.toJSON = function (dataset, options) {
  options = options || {};
  var seriesArrays = [];
  var seriesDataTypes = [];
  var seriesNames = [];
  var seriesIndices = options.seriesIndices;
  if (seriesIndices == null) {
    seriesIndices = morpheus.Util.sequ32(dataset.getSeriesCount());
  }
  for (var series = 0; series < seriesIndices.length; series++) {
    var seriesIndex = seriesIndices[series];
    seriesNames.push(dataset.getName(seriesIndex));
    seriesDataTypes.push(dataset.getDataType(seriesIndex));
    var data = [];
    seriesArrays.push(data);
    for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
      var row = [];
      data.push(row);
      for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
        row[j] = dataset.getValue(i, j, seriesIndex);
      }
    }
  }
  var vectorToJSON = function (vector) {
    var array = [];
    for (var i = 0, size = vector.size(); i < size; i++) {
      array[i] = vector.getValue(i);
    }
    var properties = new morpheus.Map();
    vector.getProperties().forEach(function (value, key) {
      if (morpheus.VectorKeys.JSON_WHITELIST.has(key)) {
        properties.set(key, value);
      }
    });
    return {
      properties: properties,
      name: vector.getName(),
      array: array
    };
  };
  var metadatatoJSON = function (metadata, fields) {
    var vectors = [];
    var filter;
    if (fields) {
      filter = new morpheus.Set();
      fields.forEach(function (field) {
        filter.add(field);
      });
    }
    for (var i = 0, count = metadata.getMetadataCount(); i < count; i++) {
      var v = metadata.get(i);
      if (!v.getProperties().has(morpheus.VectorKeys.IS_INDEX)) {
        if (filter) {
          if (filter.has(v.getName())) {
            vectors.push(vectorToJSON(v));
          }
        } else {
          vectors.push(vectorToJSON(v));
        }
      }
    }
    return vectors;
  };
  return {
    rows: dataset.getRowCount(),
    columns: dataset.getColumnCount(),
    seriesArrays: seriesArrays,
    seriesDataTypes: seriesDataTypes,
    seriesNames: seriesNames,
    rowMetadataModel: {
      vectors: metadatatoJSON(dataset.getRowMetadata(),
        options.rowFields)
    },
    columnMetadataModel: {
      vectors: metadatatoJSON(dataset.getColumnMetadata(),
        options.columnFields)
    }
  };
};
morpheus.Dataset.fromJSON = function (options) {
  // Object {seriesNames:
  // Array[1], seriesArrays:
  // Array[1], rows:
  // 6238, columns: 7251,
  // rowMetadataModel: Object…}
  // columnMetadataModel: Object
  // itemCount: 7251
  // vectors: Array[3]
  // array: Array[7251]
  // n: 7251
  // name: "pert_id"
  // properties: Object
  // columns: 7251
  // rowMetadataModel: Object
  // rows: 6238
  // seriesArrays: Array[1]
  // seriesNames: Array[1]
  // var array = morpheus.Dataset.createArray(options);
  // for (var i = 0; i < options.rows; i++) {
  // var row = array[i];
  // var jsonRow = options.array[i];
  // for (var j = 0; j < options.columns; j++) {
  // row[j] = jsonRow[j];
  // }
  // }

  for (var seriesIndex = 0; seriesIndex < options.seriesArrays.length; seriesIndex++) {
    var array = options.seriesArrays[seriesIndex];
    for (var i = 0; i < options.rows; i++) {
      for (var j = 0; j < options.columns; j++) {
        var value = array[i][j];
        if (value == null) {
          array[i][j] = NaN;
        }
      }
    }
  }
  var dataset = new morpheus.Dataset({
    name: options.seriesNames[0],
    dataType: options.seriesDataTypes[0],
    array: options.seriesArrays[0],
    rows: options.rows,
    columns: options.columns
  });

  if (options.rowMetadataModel) {
    options.rowMetadataModel.vectors.forEach(function (v) {
      var vector = new morpheus.Vector(v.name, dataset.getRowCount());
      vector.array = v.array;
      vector.properties = morpheus.Map.fromJSON(v.properties);
      dataset.rowMetadataModel.vectors.push(vector);
    });
  }
  if (options.columnMetadataModel) {
    options.columnMetadataModel.vectors.forEach(function (v) {
      var vector = new morpheus.Vector(v.name, dataset.getColumnCount());
      vector.array = v.array;
      vector.properties = morpheus.Map.fromJSON(v.properties);
      dataset.columnMetadataModel.vectors.push(vector);

    });
  }
  for (var i = 1; i < options.seriesArrays.length; i++) {
    dataset.addSeries({
      name: options.seriesNames[i],
      dataType: options.seriesDataTypes[i],
      array: options.seriesArrays[i]
    });
  }
  return dataset;
};

morpheus.RowMajorMatrix = function (options) {
  this.options = options;
};
morpheus.RowMajorMatrix.prototype = {
  getValue: function (i, j) {
    return this.options.array[i][j];
  },
  setValue: function (i, j, value) {
    this.options.array[i][j] = value;
  },
  toJSON: function () {
    var data = [];
    var nrows = this.options.rows;
    var ncols = this.options.columns;
    var array = this.options.array;
    for (var i = 0; i < nrows; i++) {
      var row = [];
      data.push(row);
      for (var j = 0; j < ncols; j++) {
        row[j] = array[i][j];
      }
    }
    return data;
  }
};

morpheus.SparseMatrix = function (options) {
  this.options = options;
};

morpheus.SparseMatrix.binarySearch = function (array, value, minIndex, maxIndex) {
  var index;
  var v;
  while (minIndex <= maxIndex) {
    index = (minIndex + maxIndex) / 2 | 0;
    v = array[index];

    if (v < value) {
      minIndex = index + 1;
    }
    else if (v > value) {
      maxIndex = index - 1;
    }
    else {
      return index;
    }
  }

  return -1;
};

morpheus.SparseMatrix.prototype = {
  getValue: function (i, j) {
    var obj = this.options.array[i];
    if (obj.values === undefined) {
      return this.options.defaultValue;
    }
    var k = morpheus.SparseMatrix.binarySearch(obj.indices, j, 0, obj.values.length - 1);
    return k >= 0 ? obj.values[k] : this.options.defaultValue;
  },
  setValue: function (i, j, value) {
    var obj = this.options.array[i];
    if (obj.values === undefined) {
      throw 'Invalid index';
    }
    var k = morpheus.SparseMatrix.binarySearch(obj.indices, j, 0, obj.values.length - 1);
    if (k < 0) {
      throw 'Invalid index';
    }
    obj.values[k] = value;
  }
};
morpheus.Dataset.createMatrix = function (options) {
  if (options.array) {
    return options.defaultValue != null ? new morpheus.SparseMatrix(options) : new morpheus.RowMajorMatrix(options);
  }
  var array = [];
  if (options.dataType == null || options.dataType === 'Float32') {
    for (var i = 0; i < options.rows; i++) {
      array.push(new Float32Array(options.columns));
    }
  } else if (options.dataType === 'Int8') {
    for (var i = 0; i < options.rows; i++) {
      array.push(new Int8Array(options.columns));
    }
  } else if (options.dataType === 'Int16') {
    for (var i = 0; i < options.rows; i++) {
      array.push(new Int16Array(options.columns));
    }
  } else { // [object, number, Number] array of arrays
    for (var i = 0; i < options.rows; i++) {
      array.push([]);
    }
  }
  options.array = array;
  return new morpheus.RowMajorMatrix(options);
};
morpheus.Dataset.prototype = {
  getValue: function (i, j, seriesIndex) {
    seriesIndex = seriesIndex || 0;
    return this.seriesArrays[seriesIndex].getValue(i, j);
  },
  toString: function () {
    return this.getName();
  },
  setValue: function (i, j, value, seriesIndex) {
    seriesIndex = seriesIndex || 0;
    this.seriesArrays[seriesIndex].setValue(i, j, value);
  },
  addSeries: function (options) {
    options = $.extend({}, {
      rows: this.getRowCount(),
      columns: this.getColumnCount(),
      dataType: 'Float32'
    }, options);
    this.seriesDataTypes.push(options.dataType);
    this.seriesNames.push(options.name);
    this.seriesArrays.push(morpheus.Dataset.createMatrix(options));
    return this.seriesNames.length - 1;
  }
};
morpheus.Util.extend(morpheus.Dataset, morpheus.AbstractDataset);

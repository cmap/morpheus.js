morpheus.GctWriter12 = function () {
  this.options = {
    rowDescription: 'Description',
    rowId: 'id',
    columnId: 'id'
  };
};
morpheus.GctWriter12.prototype = {
  toString: function (value) {
    return morpheus.Util.toString(value);
  },
  write: function (dataset, pw) {
    if (pw == null) {
      pw = [];
    }
    var rows = dataset.getRowCount();
    var columns = dataset.getColumnCount();
    var version = '#1.2';
    pw.push(version);
    pw.push('\n');
    pw.push(rows + '\t' + columns);
    pw.push('\n');
    var rowMetadata = morpheus.GctWriter.idFirst(dataset.getRowMetadata());
    var columnMetadata = morpheus.GctWriter.idFirst(dataset
    .getColumnMetadata());
    pw.push('Name');
    pw.push('\t');
    pw.push('Description');
    var columnIds = columnMetadata.getByName(this.options.columnId);
    if (!columnIds) {
      columnIds = columnMetadata.get(0);
    }
    for (var j = 0; j < columns; j++) {
      pw.push('\t');
      pw.push(this.toString(columnIds.getValue(j)));
    }
    var rowIds = rowMetadata.get(this.options.rowId);
    if (!rowIds) {
      rowIds = rowMetadata.get(0);
    }
    var rowDescriptions = rowMetadata
    .getByName(this.options.rowDescription);
    if (rowDescriptions == null && rowMetadata.getMetadataCount() > 1) {
      rowDescriptions = rowMetadata.get(1);
    }

    for (var i = 0; i < rows; i++) {
      pw.push('\n');
      pw.push(this.toString(rowIds.getValue(i)));
      pw.push('\t');
      var rowDescription = rowDescriptions != null ? rowDescriptions
        .getValue(i) : null;
      if (rowDescription != null) {
        pw.push(this.toString(rowDescription));
      }
      for (var j = 0; j < columns; j++) {
        pw.push('\t');
        pw.push(morpheus.Util.nf(dataset.getValue(i, j)));
      }
    }
    pw.push('\n');
    return pw.join('');
  }
};

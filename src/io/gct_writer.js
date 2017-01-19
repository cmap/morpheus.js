morpheus.GctWriter = function () {
};

morpheus.GctWriter.idFirst = function (model) {
  var fields = ['id', 'Id', 'pr_id'];
  var idIndex = -1;
  for (var i = 0; i < fields.length; i++) {
    idIndex = morpheus.MetadataUtil.indexOf(model, fields[i]);
    if (idIndex !== -1) {
      break;
    }
  }
  if (idIndex !== -1) {
    var order = [];
    order[0] = idIndex;
    for (var i = 0, j = 1, count = model.getMetadataCount(); i < count; i++) {
      if (i !== idIndex) {
        order[j++] = i;
      }
    }
    return new morpheus.MetadataModelColumnView(model, order);
  }
  return model;
};

morpheus.GctWriter.prototype = {
  toString: function (value) {
    return morpheus.Util.toString(value);
  },
  write: function (dataset, pw) {
    if (pw == null) {
      pw = [];
    }
    var rowMetadata = morpheus.GctWriter.idFirst(dataset.getRowMetadata());
    var columnMetadata = morpheus.GctWriter.idFirst(dataset
    .getColumnMetadata());
    this.writeHeader(rowMetadata, columnMetadata, pw);
    this.writeData(dataset, rowMetadata, pw);
    return pw.join('');
  },
  writeData: function (dataset, rowMetadata, pw) {
    var ncols = dataset.getColumnCount();
    var rowMetadataCount = rowMetadata.getMetadataCount();
    for (var i = 0, rows = dataset.getRowCount(); i < rows; i++) {
      for (var rowMetadataIndex = 0; rowMetadataIndex < rowMetadataCount; rowMetadataIndex++) {
        if (rowMetadataIndex > 0) {
          pw.push('\t');
        }
        var value = rowMetadata.get(rowMetadataIndex).getValue(i);
        if (value !== null) {
          pw.push(this.toString(value));
        }
      }
      for (var j = 0; j < ncols; j++) {
        pw.push('\t');
        var value = dataset.getValue(i, j);
        // pw.push((value != null && value.toObject) ? JSON
        // .stringify(value.toObject()) : morpheus.Util.nf(value));
        pw.push(morpheus.Util.nf(value));
      }
      pw.push('\n');
    }
  },
  writeHeader: function (rowMetadata, columnMetadata, pw) {
    var rows = rowMetadata.getItemCount();
    var ncols = columnMetadata.getItemCount();
    pw.push('#1.3\n');
    var rowMetadataCount = rowMetadata.getMetadataCount();
    pw.push(rows + '\t' + ncols + '\t' + (rowMetadataCount - 1) + '\t'
      + (columnMetadata.getMetadataCount() - 1));
    pw.push('\n');
    for (var i = 0; i < rowMetadataCount; i++) {
      if (i > 0) {
        pw.push('\t');
      }
      var name = rowMetadata.get(i).getName();
      if (i === 0 && name !== columnMetadata.get(0).getName()) {
        name = name + '/' + columnMetadata.get(0).getName();
      }
      pw.push(name);
    }
    for (var j = 0; j < ncols; j++) {
      pw.push('\t');
      pw.push(this.toString(columnMetadata.get(0).getValue(j)));
    }
    pw.push('\n');
    for (var columnMetadataIndex = 1, metadataSize = columnMetadata
    .getMetadataCount(); columnMetadataIndex < metadataSize; columnMetadataIndex++) {
      pw.push(columnMetadata.get(columnMetadataIndex).getName());
      for (var i = 1; i < rowMetadataCount; i++) {
        pw.push('\t');
        pw.push('na');
      }
      for (var j = 0; j < ncols; j++) {
        pw.push('\t');
        var value = columnMetadata.get(columnMetadataIndex).getValue(j);
        if (value != null) {
          pw.push(this.toString(value));
        }
      }
      pw.push('\n');
    }
  }
};

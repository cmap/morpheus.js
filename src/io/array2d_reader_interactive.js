morpheus.Array2dReaderInteractive = function () {

};

morpheus.Array2dReaderInteractive.prototype = {

  _getReader: function (fileOrUrl, callback) {
    var name = morpheus.Util.getFileName(fileOrUrl);
    var ext = morpheus.Util.getExtension(name);
    morpheus.ArrayBufferReader.getArrayBuffer(fileOrUrl, function (err, arrayBuffer) {
      // show 1st 100 lines in table
      if (err) {
        console.log(err);
        return callback(err);
      }
      var dataArray = new Uint8Array(arrayBuffer);
      if (ext === 'xls' || ext === 'xlsx') {
        var arr = [];
        for (var i = 0; i != dataArray.length; ++i) {
          arr[i] = String.fromCharCode(dataArray[i]);
        }
        var bstr = arr.join('');
        morpheus.Util
          .xlsxTo1dArray({
            data: bstr,
            prompt: true
          }, function (err, lines) {
            callback(err, new morpheus.LineReader(lines));
          });

      } else {
        callback(null, new morpheus.ArrayBufferReader(dataArray));
      }

    });
  },
  read: function (fileOrUrl, callback) {
    var _this = this;
    var name = morpheus.Util.getBaseFileName(morpheus.Util.getFileName(fileOrUrl));
    var html = [];
    html.push('<div>');
    html.push('<label>Click the table cell containing the first data row and column.</label>');
    // html.push('<div class="checkbox"> <label> <input name="transpose" type="checkbox">' +
    //   ' Tranpose </label>' +
    //   ' </div>');

    html.push('<div' +
      ' style="display:inline-block;width:10px;height:10px;background-color:#b3cde3;"></div><span> Data Matrix</span>');
    html.push('<br /><div' +
      ' style="display:inline-block;width:10px;height:10px;background-color:#fbb4ae;"></div><span> Column' +
      ' Annotations</span>');
    html.push('<br /><div' +
      ' style="display:inline-block;' +
      ' width:10px;height:10px;background-color:#ccebc5;"></div><span> Row' +
      ' Annotations</span>');

    html.push('<div class="slick-bordered-table" style="width:550px;height:300px;"></div>');
    html.push('</div>');
    var $el = $(html.join(''));
    this._getReader(fileOrUrl, function (err, br) {
      // show 1st 100 lines in table
      if (err) {
        console.log(err);
        return callback(err);
      }

      var s;
      var lines = [];
      // show in table
      var tab = /\t/;
      while ((s = br.readLine()) !== null && lines.length < 100) {
        lines.push(s.split(tab));
      }

      var grid;
      var columns = [];
      for (var j = 0, ncols = lines[0].length; j < ncols; j++) {
        columns.push({
          id: j,
          field: j
        });
      }

      var dataRowStart = 1;
      var dataColumnStart = 1;
      var _lines = lines;
      var grid = new Slick.Grid($el.find('.slick-bordered-table')[0], lines, columns, {
        enableCellNavigation: true,
        headerRowHeight: 0,
        showHeaderRow: false,
        multiColumnSort: false,
        multiSelect: false,
        topPanelHeight: 0,
        enableColumnReorder: false,
        enableTextSelectionOnCells: true,
        forceFitColumns: false,
        defaultFormatter: function (row, cell, value, columnDef, dataContext) {
          var color = 'white';
          if (cell >= dataColumnStart && row >= dataRowStart) {
            color = '#b3cde3'; // data
          } else if (row <= (dataRowStart - 1) && cell >= dataColumnStart) {
            color = '#fbb4ae'; // column
          } else if (cell < dataColumnStart && row >= dataRowStart) {
            color = '#ccebc5'; // row
          }
          var html = ['<div style="width:100%;height:100%;background-color:' + color + '">'];
          if (_.isNumber(value)) {
            html.push(morpheus.Util.nf(value));
          } else if (morpheus.Util.isArray(value)) {
            var s = [];
            for (var i = 0, length = value.length; i < length; i++) {
              if (i > 0) {
                s.push(', ');
              }
              var val = value[i];
              s.push(value[i]);
            }
            html.push(s.join(''));
          } else {
            html.push(value);
          }
          html.push('</div>');
          return html.join('');
        }
      });
      var transposedLines;
      var transposedColumns;
      $el.find('[name=transpose]').on('click', function (e) {
        if ($(this).prop('checked')) {
          if (transposedLines == null) {
            transposedLines = [];
            for (var j = 0, ncols = lines[0].length; j < ncols; j++) {
              var row = [];
              transposedLines.push(row);
              for (var i = 0, nrows = lines.length; i < nrows; i++) {
                row.push(lines[i][j]);
              }
            }

            transposedColumns = [];
            for (var j = 0, ncols = transposedLines[0].length; j < ncols; j++) {
              transposedColumns.push({
                id: j,
                field: j
              });
            }

          }
          lines = transposedLines;
          grid.setData(transposedLines);
          grid.setColumns(transposedColumns);
          grid.resizeCanvas();
          grid.invalidate();
        } else {
          grid.setData(_lines);
          grid.setColumns(columns);
          grid.resizeCanvas();
          grid.invalidate();
          lines = _lines;
        }
      });
      grid.onClick.subscribe(function (e, args) {
        dataRowStart = args.row;
        dataColumnStart = args.cell;
        grid.invalidate();
      });

      $el.find('.slick-header').remove();
      var footer = [];
      footer
        .push('<button name="ok" type="button" class="btn btn-default">OK</button>');
      footer
        .push('<button name="cancel" type="button" data-dismiss="modal" class="btn btn-default">Cancel</button>');
      var $footer = $(footer.join(''));

      morpheus.FormBuilder.showOkCancel({
        title: 'Open',
        content: $el,
        close: false,
        focus: document.activeElement,
        cancelCallback: function () {
          callback(null);
        },
        okCallback: function () {
          br.reset();
          _this._read(name, br, dataColumnStart, dataRowStart, callback);
        }
      });
      grid.resizeCanvas();

    });

  },
  _read: function (datasetName, bufferedReader, dataColumnStart, dataRowStart, cb) {
    var dataset = new morpheus.TxtReader({columnMetadata: true, dataRowStart: dataRowStart, dataColumnStart: dataColumnStart})._read(datasetName, bufferedReader);
    cb(null, dataset);
  }
};

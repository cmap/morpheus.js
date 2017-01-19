morpheus.SaveDatasetTool = function () {
};
morpheus.SaveDatasetTool.prototype = {
  toString: function () {
    return 'Save Dataset';
  },
  init: function (project, form) {
    form.find('file_name').prop('autofocus', true);
    var seriesNames = [];
    var dataset = project.getFullDataset();
    for (var i = 0, nseries = dataset.getSeriesCount(); i < nseries; i++) {
      seriesNames.push(dataset.getName(i)); // TODO check data type
    }
    form.setOptions('series', seriesNames.length > 1 ? seriesNames : null);
    form.setVisible('series', seriesNames.length > 1);
  },
  gui: function () {
    return [
      {
        name: 'file_name',
        type: 'text',
        help: '<a target="_blank" href="http://support.lincscloud.org/hc/en-us/articles/202105453-GCT-Gene-Cluster-Text-Format-">GCT 1.3</a>'
        + ' or <a target="_blank" href="http://www.broadinstitute.org/cancer/software/genepattern/gp_guides/file-formats/sections/gct">GCT 1.2</a> file name',
        required: true
      }, {
        name: 'file_format',
        type: 'radio',
        options: [{
          name: 'GCT version 1.2',
          value: '1.2'
        }, {
          name: 'GCT version 1.3',
          value: '1.3'
        }],
        value: '1.3',
        required: true
      }, {
        name: 'series',
        type: 'select',
        options: [],
        required: true
      }];
  },
  execute: function (options) {
    var project = options.project;
    var format = options.input.file_format;
    var fileName = options.input.file_name;
    var series = options.input.series;
    var controller = options.controller;
    var dataset = project.getSortedFilteredDataset();
    if (series != null) {
      var seriesIndex = morpheus.DatasetUtil.getSeriesIndex(dataset, series);
      if (seriesIndex === -1) {
        seriesIndex = 0;
      }
      dataset = seriesIndex === 0 ? dataset : new morpheus.DatasetSeriesView(dataset, [seriesIndex]);
    }
    if (!morpheus.Util.endsWith(fileName.toLowerCase(), '.gct')) {
      fileName += '.gct';
    }
    var writer = (format === '1.2') ? new morpheus.GctWriter12()
      : new morpheus.GctWriter();

    if (typeof streamSaver !== 'undefined' && streamSaver.supported) {
      var fileStream = streamSaver.createWriteStream(fileName);
      var fileStreamWriter = fileStream.getWriter();
      var encoder = new TextEncoder();
      fileStreamWriter.push = function (text) {
        this.write(encoder.encode(text));
      };
      fileStreamWriter.join = function () {
      };
      writer.write(dataset, fileStreamWriter);
      fileStreamWriter.close();
    } else {
      var text = writer.write(dataset);
      var blob = new Blob([text], {
        type: 'text/plain;charset=charset=utf-8'
      });

      saveAs(blob, fileName, true);
    }

  }
};

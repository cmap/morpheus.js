morpheus.OpenDatasetTool = function () {
  this.customUrls = [];
};

morpheus.OpenDatasetTool.fileExtensionPrompt = function (file, callback) {
  var ext = morpheus.Util.getExtension(morpheus.Util.getFileName(file));
  var deferred;
  if (ext === 'seg' || ext === 'segtab') {
    this._promptSegtab(function (regions) {
      callback(regions);
    });

  } else {
    callback(null);
  }

};
morpheus.OpenDatasetTool._promptMaf = function (promptCallback) {
  var formBuilder = new morpheus.FormBuilder();
  formBuilder
    .append({
      name: 'MAF_gene_symbols',
      value: '',
      type: 'textarea',
      required: true,
      help: 'Enter one gene symbol per line to filter genes. Leave blank to show all genes.'
    });
  morpheus.FormBuilder
    .showInModal({
      title: 'Gene Symbols',
      html: formBuilder.$form,
      close: 'OK',
      onClose: function () {
        var text = formBuilder.getValue('MAF_gene_symbols');
        var lines = morpheus.Util.splitOnNewLine(text);
        var mafGeneFilter = new morpheus.Map();
        for (var i = 0, nlines = lines.length, counter = 0; i < nlines; i++) {
          var line = lines[i];
          if (line !== '') {
            mafGeneFilter.set(line, counter++);
          }
        }
        var readOptions = mafGeneFilter.size() > 0 ? {
          mafGeneFilter: mafGeneFilter
        } : null;
        promptCallback(readOptions);
      }
    });
};
morpheus.OpenDatasetTool._promptSegtab = function (promptCallback) {
  var formBuilder = new morpheus.FormBuilder();
  formBuilder
    .append({
      name: 'regions',
      value: '',
      type: 'textarea',
      required: true,
      help: 'Define the regions over which you want to define the CNAs. Enter one region per line. Each line should contain region_id, chromosome, start, and end separated by a tab. Leave blank to use all unique segments in the segtab file as regions.'
    });
  morpheus.FormBuilder
    .showInModal({
      title: 'Regions',
      html: formBuilder.$form,
      close: 'OK',
      onClose: function () {
        var text = formBuilder.getValue('regions');
        var lines = morpheus.Util.splitOnNewLine(text);
        var regions = [];
        var tab = /\t/;
        for (var i = 0, nlines = lines.length, counter = 0; i < nlines; i++) {
          var line = lines[i];

          if (line !== '') {
            var tokens = line.split(tab);
            if (tokens.length >= 4) {
              regions.push({
                id: tokens[0],
                chromosome: tokens[1],
                start: parseInt(tokens[2]),
                end: parseInt(tokens[3])
              });
            }
          }
        }
        var readOptions = regions.length > 0 ? {
          regions: regions
        } : null;
        promptCallback(readOptions);
      }
    });
};
morpheus.OpenDatasetTool.prototype = {
  toString: function () {
    return 'Open Dataset';
  },
  _read: function (options, deferred) {
    var _this = this;
    var project = options.project;
    var heatMap = options.heatMap;
    var file = options.input.file;
    var action = options.input.open_file_action;
    var dataset = project.getSortedFilteredDataset();
    deferred.fail(function (err) {
      var message = [
        'Error opening ' + morpheus.Util.getFileName(file)
        + '.'];
      if (err.message) {
        message.push('<br />Cause: ');
        message.push(err.message);
      }
      morpheus.FormBuilder.showInModal({
        title: 'Error',
        html: message.join(''),
        focus: document.activeElement
      });
    });
    deferred
      .done(function (newDataset) {

        var extension = morpheus.Util.getExtension(morpheus.Util
          .getFileName(file));
        var filename = morpheus.Util.getBaseFileName(morpheus.Util
          .getFileName(file));
        if (action === 'append' || action === 'append columns') {

          // "append": append rows to current dataset
          var appendRows = action === 'append';
          // rename fields?
          _.each(heatMap.options.rows, function (item) {
            if (item.renameTo) {
              var v = newDataset.getRowMetadata().getByName(
                item.field);
              if (v) {
                v.setName(item.renameTo);
              }
            }
          });
          _.each(heatMap.options.columns, function (item) {
            if (item.renameTo) {
              var v = newDataset.getColumnMetadata()
                .getByName(item.field);
              if (v) {
                v.setName(item.renameTo);
              }
            }
          });

          if (heatMap.options.datasetReady) {
            heatMap.options.datasetReady(newDataset);
          }
          var currentDatasetMetadataNames = morpheus.MetadataUtil
            .getMetadataNames(!appendRows ? dataset
              .getRowMetadata() : dataset
              .getColumnMetadata());
          var newDatasetMetadataNames = morpheus.MetadataUtil
            .getMetadataNames(!appendRows ? newDataset
              .getRowMetadata() : newDataset
              .getColumnMetadata());

          if (currentDatasetMetadataNames.length > 1
            || newDatasetMetadataNames.length > 1) {

            _this
              ._matchAppend(
                newDatasetMetadataNames,
                currentDatasetMetadataNames,
                heatMap,
                function (appendOptions) {
                  heatMap
                    .getProject()
                    .setFullDataset(
                      appendRows ? new morpheus.JoinedDataset(
                        dataset,
                        newDataset,
                        appendOptions.current_dataset_annotation_name,
                        appendOptions.new_dataset_annotation_name)
                        : new morpheus.TransposedDatasetView(
                        new morpheus.JoinedDataset(
                          new morpheus.TransposedDatasetView(
                            dataset),
                          new morpheus.TransposedDatasetView(
                            newDataset),
                          appendOptions.current_dataset_annotation_name,
                          appendOptions.new_dataset_annotation_name)),
                      true);

                  if (heatMap.options.renderReady) {
                    heatMap.options
                      .renderReady(heatMap);
                    heatMap.updateDataset();
                  }
                  if (appendRows) {
                    heatMap
                      .getHeatMapElementComponent()
                      .getColorScheme()
                      .setSeparateColorSchemeForRowMetadataField(
                        'Source');

                    var sourcesSet = morpheus.VectorUtil
                      .getSet(heatMap
                        .getProject()
                        .getFullDataset()
                        .getRowMetadata()
                        .getByName(
                          'Source'));
                    sourcesSet
                      .forEach(function (source) {
                        heatMap
                          .autoDisplay({
                            extension: morpheus.Util
                              .getExtension(source),
                            filename: source
                          });
                      });
                  }

                  heatMap.tabManager
                    .setTabTitle(
                      heatMap.tabId,
                      heatMap
                        .getProject()
                        .getFullDataset()
                        .getRowCount()
                      + ' row'
                      + morpheus.Util
                        .s(heatMap
                          .getProject()
                          .getFullDataset()
                          .getRowCount())
                      + ' x '
                      + heatMap
                        .getProject()
                        .getFullDataset()
                        .getColumnCount()
                      + ' column'
                      + morpheus.Util
                        .s(heatMap
                          .getProject()
                          .getFullDataset()
                          .getColumnCount()));
                  heatMap.revalidate();
                });
          } else { // no need to prompt
            heatMap
              .getProject()
              .setFullDataset(
                appendRows ? new morpheus.JoinedDataset(
                  dataset,
                  newDataset,
                  currentDatasetMetadataNames[0],
                  newDatasetMetadataNames[0])
                  : new morpheus.TransposedDatasetView(
                  new morpheus.JoinedDataset(
                    new morpheus.TransposedDatasetView(
                      dataset),
                    new morpheus.TransposedDatasetView(
                      newDataset),
                    currentDatasetMetadataNames[0],
                    newDatasetMetadataNames[0])),
                true);
            if (heatMap.options.renderReady) {
              heatMap.options.renderReady(heatMap);
              heatMap.updateDataset();
            }
            if (appendRows) {
              heatMap
                .getHeatMapElementComponent()
                .getColorScheme()
                .setSeparateColorSchemeForRowMetadataField(
                  'Source');
              var sourcesSet = morpheus.VectorUtil
                .getSet(heatMap.getProject()
                  .getFullDataset()
                  .getRowMetadata().getByName(
                    'Source'));
              sourcesSet.forEach(function (source) {
                heatMap.autoDisplay({
                  extension: morpheus.Util
                    .getExtension(source),
                  filename: source
                });
              });
            }
            heatMap.tabManager.setTabTitle(heatMap.tabId,
              heatMap.getProject().getFullDataset()
                .getRowCount()
              + ' row'
              + morpheus.Util.s(heatMap
                .getProject()
                .getFullDataset()
                .getRowCount())
              + ' x '
              + heatMap.getProject()
                .getFullDataset()
                .getColumnCount()
              + ' column'
              + morpheus.Util.s(heatMap
                .getProject()
                .getFullDataset()
                .getColumnCount()));
            heatMap.revalidate();
          }

        } else if (action === 'overlay') {
          _this
            ._matchOverlay(
              morpheus.MetadataUtil
                .getMetadataNames(newDataset
                  .getColumnMetadata()),
              morpheus.MetadataUtil
                .getMetadataNames(dataset
                  .getColumnMetadata()),
              morpheus.MetadataUtil
                .getMetadataNames(newDataset
                  .getRowMetadata()),
              morpheus.MetadataUtil
                .getMetadataNames(dataset
                  .getRowMetadata()),
              heatMap,
              function (appendOptions) {
                morpheus.DatasetUtil.overlay({
                  dataset: dataset,
                  newDataset: newDataset,
                  rowAnnotationName: appendOptions.current_dataset_row_annotation_name,
                  newRowAnnotationName: appendOptions.new_dataset_row_annotation_name,
                  columnAnnotationName: appendOptions.current_dataset_column_annotation_name,
                  newColumnAnnotationName: appendOptions.new_dataset_column_annotation_name
                });
              });
        } else if (action === 'open') { // new tab
          new morpheus.HeatMap({
            dataset: newDataset,
            parent: heatMap,
            inheritFromParent: false
          });

        } else {
          console.log('Unknown action: ' + action);
        }

        heatMap.revalidate();
      });
  },
  execute: function (options) {
    var file = options.input.file;
    var _this = this;
    var d = $.Deferred();
    morpheus.OpenDatasetTool
      .fileExtensionPrompt(file,
        function (readOptions) {
          if (!readOptions) {
            readOptions = {};
          }
          readOptions.interactive = true;
          var deferred = morpheus.DatasetUtil.read(file,
            readOptions);
          deferred.always(function () {
            d.resolve();
          });
          _this._read(options, deferred);

        });
    return d;

  }, // prompt for metadata field name in dataset and in file
  _matchAppend: function (newDatasetMetadataNames,
                          currentDatasetMetadataNames, heatMap, callback) {
    var tool = {};
    tool.execute = function (options) {
      return options.input;
    };
    tool.toString = function () {
      return 'Select Fields';
    };
    tool.gui = function () {
      var items = [
        {
          name: 'current_dataset_annotation_name',
          options: currentDatasetMetadataNames,
          type: 'select',
          value: 'id',
          required: true
        }];
      items.push({
        name: 'new_dataset_annotation_name',
        type: 'select',
        value: 'id',
        options: newDatasetMetadataNames,
        required: true
      });
      return items;
    };
    morpheus.HeatMap.showTool(tool, heatMap, callback);
  },
  _matchOverlay: function (newDatasetColumnMetadataNames,
                           currentDatasetColumnMetadataNames, newDatasetRowMetadataNames,
                           currentDatasetRowMetadataNames, heatMap, callback) {
    var tool = {};
    tool.execute = function (options) {
      return options.input;
    };
    tool.toString = function () {
      return 'Select Fields';
    };
    tool.gui = function () {
      var items = [];
      items.push({
        name: 'current_dataset_column_annotation_name',
        options: currentDatasetColumnMetadataNames,
        type: 'select',
        value: 'id',
        required: true
      });
      items.push({
        name: 'new_dataset_column_annotation_name',
        type: 'select',
        value: 'id',
        options: newDatasetColumnMetadataNames,
        required: true
      });
      items.push({
        name: 'current_dataset_row_annotation_name',
        options: currentDatasetRowMetadataNames,
        type: 'select',
        value: 'id',
        required: true
      });
      items.push({
        name: 'new_dataset_row_annotation_name',
        type: 'select',
        value: 'id',
        options: newDatasetRowMetadataNames,
        required: true
      });
      return items;
    };
    morpheus.HeatMap.showTool(tool, heatMap, callback);
  }
};

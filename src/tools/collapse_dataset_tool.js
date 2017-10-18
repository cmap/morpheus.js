morpheus.CollapseDatasetTool = function () {
};
morpheus.CollapseDatasetTool.Functions = [morpheus.Mean, morpheus.Median,
  new morpheus.MaxPercentiles([25, 75]), morpheus.Min, morpheus.Max, morpheus.Percentile, morpheus.Sum,
  morpheus.MaximumMeanProbe, morpheus.MaximumMedianProbe];
morpheus.CollapseDatasetTool.Functions.fromString = function (s) {
  for (var i = 0; i < morpheus.CollapseDatasetTool.Functions.length; i++) {
    if (morpheus.CollapseDatasetTool.Functions[i].toString() === s) {
      return morpheus.CollapseDatasetTool.Functions[i];
    }
  }
  throw new Error(s + ' not found');
};
morpheus.CollapseDatasetTool.prototype = {
  toString: function () {
    return 'Collapse';
  },
  init: function (project, form) {
    var setValue = function (val) {
      var isRows = val === 'Rows';
      var names = morpheus.MetadataUtil.getMetadataNames(isRows ? project
      .getFullDataset().getRowMetadata() : project
      .getFullDataset().getColumnMetadata());
      form.setOptions('collapse_to_fields', names);
    };
    form.$form.find('[name=collapse]').on('change', function (e) {
      setValue($(this).val());
    });
    form.setVisible('percentile', false);
    form.$form.find('[name=collapse_method]').on('change', function (e) {
      form.setVisible('percentile', $(this).val() === morpheus.Percentile.toString());
      form.setVisible('collapse', !morpheus.CollapseDatasetTool.Functions.fromString($(this).val()).selectOne);
    });

    setValue('Rows');
  },
  gui: function () {
    return [{
      name: 'collapse_method',
      options: morpheus.CollapseDatasetTool.Functions,
      value: morpheus.CollapseDatasetTool.Functions[1].toString(),
      type: 'select'
    }, {
      name: 'percentile',
      value: 75,
      type: 'text'
    }, {
      name: 'collapse',
      options: ['Columns', 'Rows'],
      value: 'Rows',
      type: 'radio'
    }, {
      name: 'collapse_to_fields',
      options: [],
      type: 'select',
      multiple: true
    }];
  },
  execute: function (options) {
    var project = options.project;
    var heatMap = options.heatMap;
    var f = morpheus.CollapseDatasetTool.Functions
    .fromString(options.input.collapse_method);
    if (f.toString() === morpheus.Percentile.toString()) {
      var p = parseFloat(options.input.percentile);
      f = function (vector) {
        return morpheus.Percentile(vector, p);
      };
    }
    var collapseToFields = options.input.collapse_to_fields;
    if (collapseToFields.length === 0) {
      throw new Error('Please select one or more fields to collapse to');
    }
    var dataset = project.getFullDataset();
    var rows = options.input.collapse == 'Rows';
    if (!rows) {
      dataset = new morpheus.TransposedDatasetView(dataset);
    }
    var allFields = morpheus.MetadataUtil.getMetadataNames(dataset
    .getRowMetadata());
    var collapseMethod = f.selectOne ? morpheus.SelectRow : morpheus.CollapseDataset;
    dataset = collapseMethod(dataset, collapseToFields, f, true);
    if (!rows) {
      dataset = new morpheus.TransposedDatasetView(dataset);
    }
    var set = new morpheus.Map();
    _.each(allFields, function (field) {
      set.set(field, true);
    });
    _.each(collapseToFields, function (field) {
      set.remove(field);
    });
    // hide fields that were not part of collapse to
    // set.forEach(function (val, name) {
    //   heatMap.setTrackVisible(name, false, !rows);
    // });
    return new morpheus.HeatMap({
      name: heatMap.getName(),
      dataset: dataset,
      parent: heatMap,
      symmetric: false
    });
  }
};

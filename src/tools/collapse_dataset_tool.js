morpheus.CollapseDatasetTool = function () {
};
morpheus.CollapseDatasetTool.Functions = [morpheus.Mean, morpheus.Median,
  new morpheus.MaxPercentiles([25, 75]), morpheus.Min, morpheus.Max, morpheus.Sum];
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
    setValue('Rows');
  },
  gui: function () {
    return [{
      name: 'collapse_method',
      options: morpheus.CollapseDatasetTool.Functions,
      value: morpheus.CollapseDatasetTool.Functions[1].toString(),
      type: 'select'
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
    var controller = options.controller;
    var f = morpheus.CollapseDatasetTool.Functions
    .fromString(options.input.collapse_method);
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
    dataset = morpheus.CollapseDataset(dataset, collapseToFields, f, true);
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
    set.forEach(function (val, name) {
      controller.setTrackVisible(name, false, !rows);
    });
    project.setFullDataset(dataset, true);
  }
};

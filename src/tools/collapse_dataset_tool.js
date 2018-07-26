morpheus.CollapseDatasetTool = function () {
};
morpheus.CollapseDatasetTool.Functions = [
  morpheus.Mean, morpheus.Median,
  new morpheus.MaxPercentiles([25, 75]), morpheus.Min, morpheus.Max, morpheus.Percentile, morpheus.Sum];
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
    });

    setValue('Rows');

    form.setVisible('percentile', false);
    form.$form.find('[name=collapse_method]').on('change', function (e) {
      form.setVisible('percentile', $(this).val() === morpheus.Percentile.toString());
    });
    form.$form.find('[name=compute_percent]').on('change', function (e) {
      form.setVisible('pass_expression', form.getValue('compute_percent'));
      form.setVisible('pass_value', form.getValue('compute_percent'));
    });
    form.setVisible('pass_expression', false);
    form.setVisible('pass_value', false);
  },

  gui: function (project) {
    return [
      {
        name: 'collapse_method',
        options: morpheus.CollapseDatasetTool.Functions,
        value: morpheus.CollapseDatasetTool.Functions[1].toString(),
        type: 'select',
      }, {
        name: 'percentile',
        value: 75,
        type: 'text',
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
      },
      {
        name: 'compute_percent',
        type: 'checkbox',
        help: 'Whether to calculate the percentage of items in a collapsed group that passed an expression'
      },
      {
        name: 'pass_expression',
        options: ['>=', '>', '<', '<='],
        type: 'bootstrap-select'
      }, {
        name: 'pass_value',
        type: 'text',
        help: 'The corresponding value for "percent operator"'
      }];
  },
  execute: function (options) {
    var project = options.project;
    var collapseToFunction = morpheus.CollapseDatasetTool.Functions.fromString(options.input.collapse_method);
    if (collapseToFunction.toString() === morpheus.Percentile.toString()) {
      var p = parseFloat(options.input.percentile);
      collapseToFunction = function (vector) {
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
    var allFields = morpheus.MetadataUtil.getMetadataNames(dataset.getRowMetadata());
    var filterFunction = null;
    if (options.input.compute_percent) {
      var filterValue = parseFloat(options.input.pass_value);
      if (!isNaN(filterValue)) {
        var op = options.input.pass_expression;
        if (op === '>=') {
          filterFunction = function (value) {
            return value >= filterValue;
          };
        } else if (op === '>') {
          filterFunction = function (value) {
            return value > filterValue;
          };
        } else if (op === '<=') {
          filterFunction = function (value) {
            return value <= filterValue;
          };
        } else if (op === '<') {
          filterFunction = function (value) {
            return value < filterValue;
          };
        }
      }
    }
    dataset = morpheus.CollapseDataset(dataset, collapseToFields, collapseToFunction, true, filterFunction);
    if (!rows) {
      dataset = new morpheus.TransposedDatasetView(dataset);
    }

    var heatMap = new morpheus.HeatMap({
      name: options.heatMap.getName(),
      dataset: dataset,
      parent: options.heatMap,
      symmetric: false,
      shape: filterFunction != null ? 'circle' : null
    });

    var set = new morpheus.Map();
    _.each(allFields, function (field) {
      set.set(field, true);
    });
    _.each(collapseToFields, function (field) {
      set.remove(field);
    });
    // hide fields that were not part of collapse to
    set.forEach(function (val, name) {
      heatMap.setTrackVisible(name, false, false);
    });

    if (options.input.compute_percent) {
      heatMap.heatmap.colorScheme.getSizer()
        .setSeriesName('percent');
      heatMap.heatmap.colorScheme.getSizer()
        .setMin(0);
      heatMap.heatmap.colorScheme.getSizer()
        .setMax(75);
      heatMap.heatmap.setShape('circle');
      heatMap.heatmap.setInvalid(true);
      heatMap.heatmap.repaint();
    }
    return heatMap;
  },
};

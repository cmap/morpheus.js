morpheus.CreateAnnotation = function () {
};
morpheus.CreateAnnotation.prototype = {
  toString: function () {
    return 'Create Calculated Annotation';
  },
  gui: function () {
    return [
      {
        name: 'annotate',
        options: ['Columns', 'Rows'],
        value: 'Rows',
        type: 'radio'
      },
      {
        name: 'annotation_name',
        value: '',
        type: 'text',
        required: true,
        autocomplete: 'off'
      },
      {
        name: 'formula',
        value: '',
        type: 'textarea',
        placeholder: 'e.g MAD()',
        required: true,
        help: 'JavaScript formula. Built-in functions (case-sensitive): COUNTIF(expression),' +
        ' MAD(), MAX(),' +
        ' MEAN(), MEDIAN(), MIN(), PERCENTILE(p), SUM(), VARIANCE(). Refer to a field using FIELD(name)'
      }, {
        name: 'use_selected_rows_and_columns_only',
        type: 'checkbox'
      }];
  },
  execute: function (options) {
    var __project = options.project;
    var isColumns = options.input.annotate == 'Columns';
    var __formula = options.input.formula;
    var __dataset = options.input.use_selected_rows_and_columns_only ? __project
    .getSelectedDataset()
      : __project.getSortedFilteredDataset();
    if (isColumns) {
      __dataset = morpheus.DatasetUtil.transposedView(__dataset);
    }
    var __rowView = new morpheus.DatasetRowView(__dataset);
    var __vector = __dataset.getRowMetadata().add(
      options.input.annotation_name);

    var COUNTIF = function (val) {
      return morpheus.CountIf(__rowView, val);
    };
    var MAD = function () {
      return morpheus.MAD(__rowView);
    };
    var MAX = function () {
      return morpheus.Max(__rowView);
    };
    var MEAN = function () {
      return morpheus.Mean(__rowView);
    };
    var MEDIAN = function (p) {
      return morpheus.Percentile(__rowView, 50);
    };
    var MIN = function () {
      return morpheus.Min(__rowView);
    };
    var PERCENTILE = function (p) {
      return morpheus.Percentile(__rowView, p);
    };
    var SUM = function () {
      return morpheus.Sum(__rowView);
    };
    var VARIANCE = function () {
      return morpheus.Variance(__rowView);
    };
    var __index = 0;
    var FIELD = function (field) {
      var vector = __dataset.getRowMetadata().getByName(field);
      return vector ? vector.getValue(__index) : undefined;
    };

    for (var size = __dataset.getRowCount(); __index < size; __index++) {
      __rowView.setIndex(__index);
      var __val = eval(__formula);
      if (typeof __val === 'function') {
        __val = '';
      }
      __vector.setValue(__index, __val);
    }
    __project.trigger('trackChanged', {
      vectors: [__vector],
      display: ['text'],
      columns: isColumns
    });
  }
};

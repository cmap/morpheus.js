/**
 *
 * @param options.heatMap
 * @param options.isColumns
 * @constructor
 */
morpheus.ColorSchemeChooser = function (options) {
  this.options = options;
  this.init();
};

morpheus.ColorSchemeChooser.prototype = {
  init: function () {
    var heatMap = this.options.heatMap;
    var isColumns = this.options.isColumns;
    var colorModel = isColumns ? heatMap.getProject().getColumnColorModel() : heatMap.getProject().getRowColorModel();
    var metadataModel = isColumns ? heatMap.getProject().getFullDataset().getColumnMetadata() : heatMap.getProject().getFullDataset().getRowMetadata();
    var annotationName;
    this.setAnnotationName = function (name) {
      annotationName = name;
      updateChooser();
    };

    var _this = this;
    var formBuilder = new morpheus.FormBuilder();
    // if (track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)) {
    //   formBuilder.append({
    //     value: track.settings.colorByField != null,
    //     type: 'checkbox',
    //     name: 'use_another_annotation_to_determine_color'
    //   });
    //   var annotationNames = morpheus.MetadataUtil.getMetadataNames(metadataModel);
    //   annotationNames.splice(annotationNames.indexOf(vector.getName()), 1);
    //   formBuilder.append({
    //     name: 'annotation_name',
    //     type: 'bootstrap-select',
    //     options: annotationNames,
    //     search: annotationNames.length > 10,
    //     value: track.settings.colorByField
    //   });
    // }


    var $chooser = $('<div></div>');
    $chooser.appendTo(formBuilder.$form);
    formBuilder.append({
      name: 'discrete',
      type: 'checkbox'
    });
    var updateChooser = function () {
      var colorSchemeChooser;
      var v = metadataModel.getByName(annotationName);
      if (v == null) {
        console.log(annotationName + ' not found.');
        return;
      }
      var dataType = morpheus.VectorUtil.getDataType(metadataModel.getByName(annotationName));
      var isNumber = dataType === 'number' || dataType === '[number]';
      formBuilder.setVisible('discrete', isNumber);
      formBuilder.setValue('discrete', v.getProperties().get(morpheus.VectorKeys.DISCRETE));
      if (v.getProperties().get(morpheus.VectorKeys.DISCRETE)) {
        colorModel.getMappedValue(v, v.getValue(0)); // make sure color map exists
        colorSchemeChooser = new morpheus.DiscreteColorSchemeChooser(
          {
            colorScheme: {
              scale: colorModel
                .getDiscreteColorScheme(metadataModel.getByName(annotationName))
            }
          });
        colorSchemeChooser.on('change', function (event) {
          colorModel.setMappedValue(metadataModel.getByName(annotationName), event.value,
            event.color);

          _this.trigger('change');
        });
      } else {
        colorModel.getContinuousMappedValue(v, v.getValue(0)); // make sure color map exists
        colorSchemeChooser = new morpheus.HeatMapColorSchemeChooser(
          {
            showRelative: false
          });

        colorSchemeChooser
          .setColorScheme(colorModel
            .getContinuousColorScheme(v));
        colorSchemeChooser.on('change', function (event) {
          _this.trigger('change');
        });
      }
      $chooser.html(colorSchemeChooser.$div);

    };

    formBuilder.find('discrete').on('change', function () {
      metadataModel.getByName(annotationName).getProperties().set(morpheus.VectorKeys.DISCRETE, $(this).prop('checked'));
      updateChooser();
      _this.trigger('change');
    });
    this.$div = formBuilder.$form;
  }
};
morpheus.Util.extend(morpheus.ColorSchemeChooser, morpheus.Events);

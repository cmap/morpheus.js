/**
 *
 * @param options.colorModel
 * @param options.track
 * @param options.heatMap
 * @constructor
 */
morpheus.ColorSchemeChooser = function (options) {
  var colorModel = options.colorModel;
  var track = options.track;
  var heatMap = options.heatMap;
  // ensure map exists
  colorModel.getMappedValue(track.getVector(track.settings.colorByField), track.getVector(track.settings.colorByField).getValue(0));
  var formBuilder = new morpheus.FormBuilder();
  if (track.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)) {
    formBuilder.append({
      value: track.settings.colorByField != null,
      type: 'checkbox',
      name: 'use_another_annotation_to_determine_color'
    });
    var annotationNames = morpheus.MetadataUtil.getMetadataNames(
      track.isColumns ? heatMap.getProject().getFullDataset().getColumnMetadata() : heatMap.getProject().getFullDataset().getRowMetadata());
    annotationNames.splice(annotationNames.indexOf(track.getName()), 1);
    formBuilder.append({
      name: 'annotation_name',
      type: 'bootstrap-select',
      options: annotationNames,
      search: annotationNames.length > 10,
      value: track.settings.colorByField
    });
  }
  formBuilder.append({
    name: 'discrete',
    type: 'checkbox',
    value: track.getVector(track.settings.colorByField).getProperties().get(morpheus.VectorKeys.DISCRETE)
  });
  var dataType = morpheus.VectorUtil.getDataType(track.getVector(track.settings.colorByField));
  var isNumber = dataType === 'number' || dataType === '[number]';
  formBuilder.setVisible('discrete', isNumber);
  formBuilder.setVisible('annotation_name', track.settings.colorByField != null);

  var $chooser = $('<div></div>');
  $chooser.appendTo(formBuilder.$form);
  var updateChooser = function () {
    var colorSchemeChooser;
    var v = track
      .getVector(track.settings.colorByField);
    formBuilder.setValue('discrete', v.getProperties().get(morpheus.VectorKeys.DISCRETE));
    if (v.getProperties().get(morpheus.VectorKeys.DISCRETE)) {
      colorModel.getMappedValue(v, v.getValue(0)); // make sure color map exists
      colorSchemeChooser = new morpheus.DiscreteColorSchemeChooser(
        {
          colorScheme: {
            scale: colorModel
              .getDiscreteColorScheme(track
                .getVector(track.settings.colorByField))
          }
        });
      colorSchemeChooser.on('change', function (event) {
        colorModel.setMappedValue(track
            .getVector(track.settings.colorByField), event.value,
          event.color);
        track.setInvalid(true);
        track.repaint();
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
        track.setInvalid(true);
        track.repaint();
      });
    }
    $chooser.html(colorSchemeChooser.$div);
    track.setInvalid();
    track.repaint();
  };
  formBuilder.find('use_another_annotation_to_determine_color').on('change', function () {
    var checked = $(this).prop('checked');
    formBuilder.setValue('annotation_name', null);
    formBuilder.setVisible('annotation_name', checked);
    if (!checked) {
      track.settings.colorByField = null;
      updateChooser();
    } else {
      $chooser.empty();
    }

    formBuilder.setVisible('discrete', false);
  });
  formBuilder.find('annotation_name').on('change', function () {
    var annotationName = $(this).val();
    // ensure map exists
    colorModel.getMappedValue(track.getVector(annotationName), track.getVector(annotationName).getValue(0));
    track.settings.colorByField = annotationName;
    var dataType = morpheus.VectorUtil.getDataType(track.getVector(track.settings.colorByField));
    var isNumber = dataType === 'number' || dataType === '[number]';
    formBuilder.setVisible('discrete', isNumber);
    updateChooser();
    track.setInvalid(true);
    track.repaint();
  });

  formBuilder.find('discrete').on('change', function () {
    track.getVector(track.settings.colorByField).getProperties().set(morpheus.VectorKeys.DISCRETE, $(this).prop('checked'));
    updateChooser();
    track.setInvalid(true);
    track.repaint();
  });
  updateChooser();
  this.$div = formBuilder.$form;
};

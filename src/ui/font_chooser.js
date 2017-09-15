/**
 *
 * @param options.fontModel
 * @param options.track
 * @param options.heatMap
 * @constructor
 */
morpheus.FontChooser = function (options) {
  var _this = this;
  var fontModel = options.fontModel;
  var track = options.track;
  var heatMap = options.heatMap;
  // ensure map exists
  fontModel.getMappedValue(track.getVector(track.settings.fontField), track.getVector(track.settings.fontField).getValue(0));
  var formBuilder = new morpheus.FormBuilder();
  formBuilder.append({
    value: track.settings.fontField != null,
    type: 'checkbox',
    name: 'use_another_annotation_to_determine_font'
  });
  var annotationNames = morpheus.MetadataUtil.getMetadataNames(
    track.isColumns ? heatMap.getProject().getFullDataset().getColumnMetadata() : heatMap.getProject().getFullDataset().getRowMetadata());
  annotationNames.splice(annotationNames.indexOf(track.getName()), 1);
  formBuilder.append({
    name: 'annotation_name',
    type: 'bootstrap-select',
    options: annotationNames,
    search: annotationNames.length > 10,
    value: track.settings.fontField
  });
  formBuilder.setVisible('annotation_name', track.settings.fontField != null);
  formBuilder.append({
    name: 'selected_value',
    type: 'bootstrap-select',
    search: true,
    options: fontModel.getMap(track.settings.fontField != null ? track.settings.fontField : track.getName()).keys()
  });
  var $selectedValue = formBuilder.find('selected_value');
  formBuilder.append({
    name: 'selected_font',
    type: 'bootstrap-select',
    options: [{name: 'normal', value: 400}, {name: 'bold', value: 700}, {name: 'bolder', value: 900}]
  });

  var repaint = function () {
    track.setInvalid(true);
    track.repaint();
  };
  formBuilder.find('use_another_annotation_to_determine_font').on('change', function () {
    var checked = $(this).prop('checked');
    formBuilder.setValue('annotation_name', null);
    formBuilder.setValue('selected_value', null);
    formBuilder.setVisible('annotation_name', checked);
    if (!checked) {
      track.settings.fontField = null;
    }
    repaint();
  });
  formBuilder.find('annotation_name').on('change', function () {
    var annotationName = $(this).val();
    fontModel.getMappedValue(track.getVector(annotationName), track.getVector(annotationName).getValue(0));
    track.settings.fontField = annotationName;
    // ensure map exists
    formBuilder.setOptions('selected_value', fontModel.getMap(track.settings.fontField != null ? track.settings.fontField : track.getName()).keys());
    formBuilder.setValue('selected_value', null);
    repaint();
  });

  var $selectedFont = formBuilder.find('selected_font');
  $selectedFont.on('change', function (e) {
    fontModel.setMappedValue(track.getVector(track.settings.fontField), $selectedValue.val(), {weight: $(this).val()});
    repaint();
  });

  var updateMappedValue = function () {
    var selectedVal = $selectedValue.val();
    var mappedValue = fontModel.getMappedValue(track.getVector(track.settings.fontField), selectedVal);
    formBuilder.setValue('selected_font', mappedValue.weight);
  };
  $selectedValue.on('change', function () {
    // update displayed value
    updateMappedValue();
  });
  updateMappedValue();
  this.$div = formBuilder.$form;

};
morpheus.Util.extend(morpheus.FontChooser, morpheus.Events);

morpheus.HeatMapOptions = function (heatMap) {
  var items = [
    {
      name: 'color_by',
      required: true,
      help: 'Use a different color scheme for distinct row annotation values',
      type: 'select',
      options: ['(None)'].concat(morpheus.MetadataUtil
        .getMetadataNames(heatMap.getProject()
          .getFullDataset().getRowMetadata())),
      value: heatMap.heatmap.getColorScheme()
        .getSeparateColorSchemeForRowMetadataField()
    }, {
      name: 'color_by_value',
      required: true,
      type: 'select',
      options: []
    }];

  items.push({
    name: 'size_by',
    required: true,
    type: 'select',
    options: ['(None)'].concat(morpheus.DatasetUtil
      .getSeriesNames(heatMap.getProject().getFullDataset()))
  });
  items.push({
    name: 'size_by_minimum',
    title: 'Size by minimum',
    required: true,
    type: 'text',
    style: 'max-width: 100px;'
  });
  items.push({
    name: 'size_by_maximum',
    title: 'Size by maximum',
    required: true,
    type: 'text',
    style: 'max-width: 100px;'
  });

  items.push({
    name: 'conditional_rendering',
    required: true,
    type: 'button'
  });

  items.push({type: 'separator'});

  var createColorSchemeOptions = function () {
    var colorSchemeOptions = [
      {
        name: 'relative',
        value: 'relative'
      }, {
        name: 'binary',
        value: 'binary'
      }, {
        name: 'MAF',
        value: 'MAF'
      }, {
        name: 'fixed (-1.5, -0.1, 0.1, 1.5)',
        value: 'cn'
      }];
    var savedColorSchemeKeys = [];
    if (localStorage.getItem('morpheus-colorScheme') != null) {
      savedColorSchemeKeys = _.keys(JSON.parse(localStorage.getItem('morpheus-colorScheme')));
    }
    if (savedColorSchemeKeys.length > 0) {
      colorSchemeOptions.push({divider: true});
      colorSchemeOptions = colorSchemeOptions.concat(savedColorSchemeKeys);
    }
    colorSchemeOptions.push({divider: true});
    colorSchemeOptions.push('My Computer...');
    return colorSchemeOptions;
  };

  items.push([
    {
      name: 'saved_color_scheme',
      required: true,
      type: 'bootstrap-select',
      options: createColorSchemeOptions()
    }, {name: 'load_color_scheme', type: 'button'}, {name: 'delete_color_scheme', type: 'button'}]);
  items.push({
    name: 'save_color_scheme',
    type: 'button'
  });

  var displayItems = [
    {
      disabled: heatMap.getProject().getFullDataset().getColumnCount() !== heatMap.getProject().getFullDataset().getRowCount(),
      name: 'link_rows_and_columns',
      help: 'For square matrices',
      required: true,
      type: 'checkbox',
      style: 'max-width: 100px;',
      value: heatMap.getProject().isSymmetric()
    },
    {
      name: 'show_row_number',
      required: true,
      type: 'checkbox',
      value: heatMap.isShowRowNumber()
    },
    {
      name: 'show_grid',
      required: true,
      type: 'checkbox',
      value: heatMap.heatmap.isDrawGrid()
    },
    {
      name: 'grid_thickness',
      required: true,
      type: 'text',
      style: 'max-width: 100px;',
      value: morpheus.Util.nf(heatMap.heatmap.getGridThickness())
    },
    {
      name: 'grid_color',
      required: true,
      type: 'color',
      style: 'max-width: 50px;',
      value: heatMap.heatmap.getGridColor()
    },
    {
      name: 'row_size',
      required: true,
      type: 'text',
      style: 'max-width: 100px;',
      value: morpheus.Util.nf(heatMap.heatmap.getRowPositions()
        .getSize())
    },
    {
      name: 'column_size',
      required: true,
      type: 'text',
      style: 'max-width: 100px;',
      value: morpheus.Util.nf(heatMap.heatmap
        .getColumnPositions().getSize())
    }, {
      name: 'show_values',
      required: true,
      type: 'checkbox',
      value: heatMap.heatmap.isDrawValues()
    }, {
      name: 'number_of_fraction_digits',
      required: true,
      type: 'number',
      min: 0,
      step: 1,
      style: 'max-width: 100px;',
      value: morpheus.Util.getNumberFormatPatternFractionDigits(heatMap.heatmap.getDrawValuesFormat().toJSON().pattern)
    }];
  if (heatMap.rowDendrogram) {
    displayItems
      .push({
        name: 'row_dendrogram_line_thickness',
        required: true,
        type: 'text',
        style: 'max-width: 100px;',
        value: morpheus.Util
          .nf(heatMap.rowDendrogram ? heatMap.rowDendrogram.lineWidth
            : 1)
      });
  }
  if (heatMap.columnDendrogram) {
    displayItems
      .push({
        name: 'column_dendrogram_line_thickness',
        required: true,
        type: 'text',
        style: 'max-width: 100px;',
        value: morpheus.Util
          .nf(heatMap.columnDendrogram ? heatMap.columnDendrogram.lineWidth
            : 1)
      });
  }

  displayItems.push({
    name: 'info_window',
    required: true,
    type: 'select',
    style: 'max-width:130px;',
    options: [
      {
        name: 'Fixed To Top',
        value: 0
      }, {
        name: 'New Window',
        value: 1
      }],
    value: heatMap.tooltipMode
  });

  displayItems.push({
    name: 'inline_tooltip',
    required: true,
    type: 'checkbox',
    value: heatMap.options.inlineTooltip
  });

  var colorSchemeFormBuilder = new morpheus.FormBuilder();
  _.each(items, function (item) {
    colorSchemeFormBuilder.append(item);
  });
  var displayFormBuilder = new morpheus.FormBuilder();
  _.each(displayItems, function (item) {
    displayFormBuilder.append(item);
  });
  var colorSchemeChooser = new morpheus.HeatMapColorSchemeChooser({
    showRelative: true,
    colorScheme: heatMap.heatmap
      .getColorScheme()
  });
  var updatingSizer = false;

  function colorSchemeChooserUpdated() {
    if (heatMap.heatmap.getColorScheme().getSizer
      && heatMap.heatmap.getColorScheme().getSizer() != null) {
      colorSchemeFormBuilder.setValue('size_by', heatMap.heatmap
        .getColorScheme().getSizer().getSeriesName());
      colorSchemeFormBuilder.setEnabled('size_by_minimum',
        heatMap.heatmap.getColorScheme().getSizer()
          .getSeriesName() != null);
      colorSchemeFormBuilder.setEnabled('size_by_maximum',
        heatMap.heatmap.getColorScheme().getSizer()
          .getSeriesName() != null);

      if (!updatingSizer) {
        colorSchemeFormBuilder.setValue('size_by_minimum',
          heatMap.heatmap.getColorScheme().getSizer().getMin());
        colorSchemeFormBuilder.setValue('size_by_maximum',
          heatMap.heatmap.getColorScheme().getSizer().getMax());
      }
    }
  }

  colorSchemeChooser.on('change', function () {
    colorSchemeChooserUpdated();
    // repaint the heat map when color scheme changes
    heatMap.heatmap.setInvalid(true);
    heatMap.heatmap.repaint();
    colorSchemeChooser.restoreCurrentValue();
  });

  function createMetadataField(isColumns) {
    var options = [];
    var value = {};
    _.each(heatMap.getVisibleTrackNames(isColumns), function (name) {
      value[name] = true;
    });
    _.each(morpheus.MetadataUtil.getMetadataNames(isColumns ? heatMap
        .getProject().getFullDataset().getColumnMetadata() : heatMap
        .getProject().getFullDataset().getRowMetadata()),
      function (name) {
        options.push(name);
      });
    var field = {
      type: 'bootstrap-select',
      search: options.length > 10,
      name: isColumns ? 'column_annotations' : 'row_annotations',
      multiple: true,
      value: value,
      options: options,
      toggle: true
    };

    return field;
  }

  var annotationsBuilder = new morpheus.FormBuilder();
  annotationsBuilder.append(createMetadataField(false));
  annotationsBuilder.append(createMetadataField(true));

  function annotationsListener($select, isColumns) {
    var names = [];
    _.each(heatMap.getVisibleTrackNames(isColumns), function (name) {
      names.push(name);
    });
    var values = $select.val();
    var selectedNow = _.difference(values, names);
    var unselectedNow = _.difference(names, values);
    var tracks = [];
    _.each(selectedNow, function (name) {
      tracks.push({
        name: name,
        isColumns: isColumns,
        visible: true
      });
    });
    _.each(unselectedNow, function (name) {
      tracks.push({
        name: name,
        isColumns: isColumns,
        visible: false
      });
    });
    heatMap.setTrackVisibility(tracks);
    colorSchemeChooser.restoreCurrentValue();
  }

  var $ca = annotationsBuilder.$form.find('[name=column_annotations]');
  $ca.on('change', function (e) {
    annotationsListener($(this), true);
  });
  var $ra = annotationsBuilder.$form.find('[name=row_annotations]');
  $ra.on('change', function (e) {
    annotationsListener($(this), false);
  });
  var annotationOptionsTabId = _.uniqueId('morpheus');
  var heatMapOptionsTabId = _.uniqueId('morpheus');
  var displayOptionsTabId = _.uniqueId('morpheus');

  var $metadataDiv = $('<div class="tab-pane" id="' + annotationOptionsTabId
    + '"></div>');
  $metadataDiv.append($(annotationsBuilder.$form));
  var $heatMapDiv = $('<div class="tab-pane active" id="'
    + heatMapOptionsTabId + '"></div>');
  $heatMapDiv.append(colorSchemeChooser.$div);
  $heatMapDiv.append($(colorSchemeFormBuilder.$form));
  var $displayDiv = $('<div class="tab-pane" id="' + displayOptionsTabId
    + '"></div>');
  $displayDiv.append($(displayFormBuilder.$form));
  displayFormBuilder.setEnabled('grid_thickness', heatMap.heatmap.isDrawGrid());
  displayFormBuilder.setEnabled('grid_color', heatMap.heatmap.isDrawGrid());

  displayFormBuilder.$form.find('[name=show_grid]').on('click', function (e) {
    var grid = $(this).prop('checked');
    displayFormBuilder.setEnabled('grid_thickness', grid);
    displayFormBuilder.setEnabled('grid_color', grid);
    heatMap.heatmap.setDrawGrid(grid);
    heatMap.revalidate();
    colorSchemeChooser.restoreCurrentValue();
  });
  var $fractionDigits = displayFormBuilder.$form.find('[name=number_of_fraction_digits]');
  displayFormBuilder.$form.find('[name=show_values]').on('click', function (e) {
    var drawValues = $(this).prop('checked');
    heatMap.heatmap.setDrawValues(drawValues);
    // $fractionDigits.prop('disabled', !drawValues);
    heatMap.revalidate();
    colorSchemeChooser.restoreCurrentValue();
  });

  $fractionDigits.on(
    'keyup input', _.debounce(
      function () {
        var n = parseInt($(this)
          .val());
        if (n >= 0) {
          heatMap.heatmap.setDrawValuesFormat(morpheus.Util.createNumberFormat('.' + n + 'f'));
          heatMap.heatmap.setInvalid(true);
          heatMap.heatmap.repaint();
        }
      }, 100));

  displayFormBuilder.$form.find('[name=inline_tooltip]').on('click',
    function (e) {
      heatMap.options.inlineTooltip = $(this).prop('checked');
    });

  displayFormBuilder.$form.find('[name=grid_color]').on(
    'change',
    function (e) {
      var value = $(this).val();
      heatMap.heatmap.setGridColor(value);
      heatMap.heatmap.setInvalid(true);
      heatMap.heatmap.repaint();
    });

  displayFormBuilder.$form.find('[name=grid_thickness]').on(
    'keyup',
    _.debounce(function (e) {
      var value = parseFloat($(this).val());
      if (!isNaN(value)) {
        heatMap.heatmap.setGridThickness(value);
        heatMap.heatmap.setInvalid(true);
        heatMap.heatmap.repaint();
      }
    }, 100));

  displayFormBuilder.$form.find('[name=row_size]').on(
    'keyup',
    _.debounce(function (e) {
      var value = parseFloat($(this).val());
      if (!isNaN(value)) {
        heatMap.heatmap.getRowPositions().setSize(
          value);
        heatMap.revalidate();
        colorSchemeChooser.restoreCurrentValue();
      }

    }, 100));
  displayFormBuilder.$form.find('[name=info_window]').on('change',
    function (e) {
      heatMap.setTooltipMode(parseInt($(this).val()));
    });
  displayFormBuilder.find('link_rows_and_columns').on('click',
    function (e) {
      var checked = $(this).prop('checked');
      if (checked) {
        heatMap.getProject().setSymmetric(heatMap);
      } else {
        heatMap.getProject().setSymmetric(null);
      }
    });
  displayFormBuilder.find('show_row_number').on('click',
    function (e) {
      var checked = $(this).prop('checked');
      heatMap.setShowRowNumber(checked);
      heatMap.revalidate();
    });

  var $colorByValue = colorSchemeFormBuilder.$form
    .find('[name=color_by_value]');
  var separateSchemesField = heatMap.heatmap.getColorScheme()
    .getSeparateColorSchemeForRowMetadataField();
  if (separateSchemesField != null) {
    var v = heatMap.project.getFullDataset().getRowMetadata()
      .getByName(separateSchemesField);
    if (v != null) {
      $colorByValue.html(morpheus.Util.createOptions(morpheus.VectorUtil
        .createValueToIndexMap(
          v).keys()));
    }
  }

  if (separateSchemesField != null) {
    colorSchemeChooser.setCurrentValue($colorByValue.val());
  }
  if (heatMap.heatmap.getColorScheme().getSizer
    && heatMap.heatmap.getColorScheme().getSizer() != null
    && heatMap.heatmap.getColorScheme().getSizer().getSeriesName()) {
    colorSchemeFormBuilder.setValue('size_by', heatMap.heatmap
      .getColorScheme().getSizer().getSeriesName());
  }
  colorSchemeFormBuilder.$form.find('[name=size_by]')
    .on(
      'change',
      function (e) {
        var series = $(this).val();
        if (series == '(None)') {
          series = null;
        }
        colorSchemeChooser.colorScheme.getSizer()
          .setSeriesName(series);
        colorSchemeChooser.fireChanged();
      });
  colorSchemeFormBuilder.$form.find('[name=size_by_minimum]').on(
    'keyup',
    _.debounce(function (e) {
      updatingSizer = true;
      colorSchemeChooser.colorScheme.getSizer().setMin(
        parseFloat($(this).val()));
      colorSchemeChooser.fireChanged(true);
      updatingSizer = false;
    }, 100));
  colorSchemeFormBuilder.$form.find('[name=size_by_maximum]').on(
    'keyup',
    _.debounce(function (e) {
      updatingSizer = true;
      colorSchemeChooser.colorScheme.getSizer().setMax(
        parseFloat($(this).val()));
      colorSchemeChooser.fireChanged(true);
      updatingSizer = false;
    }, 100));
  colorSchemeFormBuilder.$form
    .find('[name=conditional_rendering]')
    .on(
      'click',
      function (e) {
        e.preventDefault();
        var conditionalRenderingUI = new morpheus.ConditionalRenderingUI(
          heatMap);
        morpheus.FormBuilder.showInModal({
          title: 'Conditional Rendering',
          html: conditionalRenderingUI.$div,
          close: 'Close',
          modalClass: 'morpheus-sub-modal'
        });
      });

  colorSchemeFormBuilder.find('save_color_scheme').on('click', function (e) {
    e.preventDefault();
    // prompt to save to file or local storage
    var saveColorSchemeFormBuilder = new morpheus.FormBuilder();
    saveColorSchemeFormBuilder.append({name: 'save_to', type: 'radio', value: 'Browser Storage', options: ['Browser Storage', 'File']});
    saveColorSchemeFormBuilder.append({name: 'color_scheme_name', type: 'text'});
    saveColorSchemeFormBuilder.append({name: 'file_name', type: 'text'});
    saveColorSchemeFormBuilder.setVisible('file_name', false);
    saveColorSchemeFormBuilder.find('save_to').on('change', function () {
      var isBrowser = $(this).val() === 'Browser Storage';
      saveColorSchemeFormBuilder.setVisible('file_name', !isBrowser);
      saveColorSchemeFormBuilder.setVisible('color_scheme_name', isBrowser);
    });
    morpheus.FormBuilder.showOkCancel({
      title: 'Save Color Scheme',
      ok: true,
      cancel: true,
      draggable: true,
      content: saveColorSchemeFormBuilder.$form,
      appendTo: heatMap.getContentEl(),
      align: 'right',
      okCallback: function () {
        var colorSchemeText = JSON.stringify(heatMap.heatmap.getColorScheme().toJSON());
        if (saveColorSchemeFormBuilder.getValue('save_to') === 'Browser Storage') {
          var name = saveColorSchemeFormBuilder.getValue('color_scheme_name').trim();
          if (name === '') {
            name = 'my color scheme';
          }
          var colorSchemeObject = localStorage.getItem('morpheus-colorScheme');
          if (colorSchemeObject == null) {
            colorSchemeObject = {};
          } else {
            colorSchemeObject = JSON.parse(colorSchemeObject);
          }
          colorSchemeObject[name] = colorSchemeText;
          localStorage.setItem('morpheus-colorScheme', JSON.stringify(colorSchemeObject));
          colorSchemeFormBuilder.setOptions('saved_color_scheme', createColorSchemeOptions());
        } else {
          var name = saveColorSchemeFormBuilder.getValue('file_name').trim();
          if (name === '') {
            name = 'color_scheme.json';
          }
          var blob = new Blob([colorSchemeText], {
            type: 'application/json'
          });
          saveAs(blob, name);
        }
      },
      focus: heatMap.getFocusEl()
    });
  });

  colorSchemeFormBuilder.setEnabled('delete_color_scheme', false);
  colorSchemeFormBuilder.find('delete_color_scheme').on('click', function () {
    var key = colorSchemeFormBuilder.getValue('saved_color_scheme');
    var savedColorSchemes = JSON.parse(localStorage.getItem('morpheus-colorScheme'));
    delete savedColorSchemes[key];
    localStorage.setItem('morpheus-colorScheme', JSON.stringify(savedColorSchemes));
    colorSchemeFormBuilder.setOptions('saved_color_scheme', createColorSchemeOptions());

  });
  colorSchemeFormBuilder.find('saved_color_scheme').on('change', function () {
    colorSchemeFormBuilder.setEnabled('delete_color_scheme', ['relative', 'cn', 'MAF', 'binary', 'My Computer...'].indexOf(
      colorSchemeFormBuilder.getValue('saved_color_scheme')) === -1);
  });
  colorSchemeFormBuilder.find('load_color_scheme').on('click',
    function (e) {
      var val = colorSchemeFormBuilder.getValue('saved_color_scheme');
      var repaint = true;
      if (val === 'relative') {
        heatMap.heatmap
          .getColorScheme()
          .setColorSupplierForCurrentValue(
            morpheus.AbstractColorSupplier.fromJSON(morpheus.HeatMapColorScheme.Predefined
              .RELATIVE()));
      } else if (val === 'cn') {
        heatMap.heatmap
          .getColorScheme()
          .setColorSupplierForCurrentValue(
            morpheus.AbstractColorSupplier.fromJSON(morpheus.HeatMapColorScheme.Predefined
              .CN()));
      } else if (val === 'MAF') {
        heatMap.heatmap
          .getColorScheme()
          .setColorSupplierForCurrentValue(
            morpheus.AbstractColorSupplier.fromJSON(morpheus.HeatMapColorScheme.Predefined
              .MAF()));
      } else if (val === 'binary') {
        heatMap.heatmap
          .getColorScheme()
          .setColorSupplierForCurrentValue(
            morpheus.AbstractColorSupplier.fromJSON(morpheus.HeatMapColorScheme.Predefined
              .BINARY()));
      } else if (val === 'My Computer...') {
        repaint = false;
        var $file = $('<input style="display:none;" type="file">');
        $file.appendTo(heatMap.getContentEl());
        $file.click();
        $file.on('change', function (evt) {
          var files = evt.target.files;
          morpheus.Util.getText(evt.target.files[0]).done(
            function (text) {
              var json = JSON.parse($.trim(text));
              heatMap.heatmap.getColorScheme().fromJSON(json);
              colorSchemeChooser
                .setColorScheme(heatMap.heatmap
                  .getColorScheme());
              heatMap.heatmap.setInvalid(true);
              heatMap.heatmap.repaint();

            }).fail(function () {
            morpheus.FormBuilder.showInModal({
              title: 'Error',
              html: 'Unable to read color scheme.'
            });
          }).always(function () {
            $file.remove();
          });

        });
      } else {
        var savedColorSchemes = JSON.parse(localStorage.getItem('morpheus-colorScheme'));
        var scheme = JSON.parse(savedColorSchemes[val]);
        heatMap.heatmap.getColorScheme().fromJSON(scheme);
        // saved in local storage
      }
      if (repaint) {
        colorSchemeChooser
          .setColorScheme(heatMap.heatmap
            .getColorScheme());
        heatMap.heatmap.setInvalid(true);
        heatMap.heatmap.repaint();
      }
      colorSchemeChooser.restoreCurrentValue();
    });
  colorSchemeFormBuilder.$form
    .find('[name=color_by]')
    .on(
      'change',
      function (e) {
        var colorByField = $(this).val();
        if (colorByField == '(None)') {
          colorByField = null;
        }
        var colorByValue = null;
        heatMap.heatmap.getColorScheme()
          .setSeparateColorSchemeForRowMetadataField(
            colorByField);
        if (colorByField != null) {
          $colorByValue
            .html(morpheus.Util
              .createOptions(morpheus.VectorUtil
                .createValueToIndexMap(
                  heatMap.project
                    .getFullDataset()
                    .getRowMetadata()
                    .getByName(
                      colorByField))
                .keys()));
          colorByValue = $colorByValue.val();
        } else {
          $colorByValue.html('');
        }

        heatMap.heatmap.getColorScheme().setCurrentValue(
          colorByValue);
        colorSchemeChooser.setCurrentValue(colorByValue);
        heatMap.heatmap.setInvalid(true);
        heatMap.heatmap.repaint();
        colorSchemeChooser.setColorScheme(heatMap.heatmap
          .getColorScheme());
      });
  $colorByValue.on('change', function (e) {
    if (heatMap.heatmap.getColorScheme()
        .getSeparateColorSchemeForRowMetadataField() == null) {
      colorSchemeChooser.setCurrentValue(null);
      heatMap.heatmap.getColorScheme().setCurrentValue(null);
      colorSchemeChooser.setColorScheme(heatMap.heatmap
        .getColorScheme());
    } else {
      colorSchemeChooser.setCurrentValue($colorByValue.val());
      colorSchemeChooser.setColorScheme(heatMap.heatmap
        .getColorScheme());
    }
  });
  displayFormBuilder.$form.find('[name=column_size]').on(
    'keyup',
    _.debounce(function (e) {
      heatMap.heatmap.getColumnPositions().setSize(
        parseFloat($(this).val()));
      heatMap.revalidate();
      colorSchemeChooser.restoreCurrentValue();

    }, 100));
  displayFormBuilder.$form.find('[name=row_gap_size]').on('keyup',
    _.debounce(function (e) {
      heatMap.rowGapSize = parseFloat($(this).val());
      heatMap.revalidate();
      colorSchemeChooser.restoreCurrentValue();
    }, 100));
  displayFormBuilder.$form.find('[name=column_gap_size]').on('keyup',
    _.debounce(function (e) {
      heatMap.columnGapSize = parseFloat($(this).val());
      heatMap.revalidate();
      colorSchemeChooser.restoreCurrentValue();
    }, 100));
  displayFormBuilder.$form.find('[name=squish_factor]').on('keyup',
    _.debounce(function (e) {
      var f = parseFloat($(this).val());
      heatMap.heatmap.getColumnPositions().setSquishFactor(f);
      heatMap.heatmap.getRowPositions().setSquishFactor(f);
      heatMap.revalidate();
      colorSchemeChooser.restoreCurrentValue();
    }, 100));
  displayFormBuilder.$form.find('[name=row_dendrogram_line_thickness]').on(
    'keyup', _.debounce(function (e) {
      heatMap.rowDendrogram.lineWidth = parseFloat($(this).val());
      heatMap.revalidate();
      colorSchemeChooser.restoreCurrentValue();

    }, 100));
  displayFormBuilder.$form.find('[name=column_dendrogram_line_thickness]')
    .on(
      'keyup',
      _.debounce(function (e) {
        heatMap.columnDendrogram.lineWidth = parseFloat($(
          this).val());
        heatMap.revalidate();
        colorSchemeChooser.restoreCurrentValue();
      }, 100));
  var $tab = $('<div class="tab-content"></div>');
  $metadataDiv.appendTo($tab);
  $heatMapDiv.appendTo($tab);
  $displayDiv.appendTo($tab);
  var $div = $('<div></div>');
  var $ul = $('<ul class="nav nav-tabs" role="tablist">' + '<li><a href="#'
    + annotationOptionsTabId
    + '" role="tab" data-toggle="tab">Annotations</a></li>'
    + '<li><a href="#' + heatMapOptionsTabId
    + '" role="tab" data-toggle="tab">Color Scheme</a></li>'
    + '<li><a href="#' + displayOptionsTabId
    + '" role="tab" data-toggle="tab">Display</a></li>' + '</ul>');
  $ul.appendTo($div);
  $tab.appendTo($div);
  // set current scheme
  colorSchemeChooser.setColorScheme(heatMap.heatmap.getColorScheme());
  colorSchemeChooserUpdated();
  $ul.find('[role=tab]:eq(1)').tab('show');
  morpheus.FormBuilder.showInModal({
    title: 'Options',
    html: $div,
    close: 'Close',
    focus: heatMap.getFocusEl(),
    onClose: function () {
      $div.find('input').off('keyup');
      $ca.off('change');
      $ra.off('change');
      $div.remove();
      colorSchemeChooser.dispose();
    }
  });
};

morpheus.HeatMapTooltipProvider = function (heatMap, rowIndex, columnIndex, options, separator, quick, tipText) {
  var dataset = heatMap.project.getSortedFilteredDataset();
  if (!quick) {
    if (options.value) { // key value pairs for custom tooltip
      _.each(options.value, function (pair) {
        if (tipText.length > 0) {
          tipText.push(separator);
        }
        tipText.push(pair.name);
        tipText.push(': <b>');
        if (_.isArray(pair.value)) {
          for (var i = 0; i < pair.value.length; i++) {
            if (i > 0) {
              tipText.push(', ');
            }
            tipText.push(pair.value[i]);
          }
        } else {
          tipText.push(pair.value);
        }
        tipText.push('</b>');
      });
    }
  }
  if (rowIndex !== -1 && columnIndex !== -1) {
    var tooltipSeriesIndices = options.tooltipSeriesIndices ? options.tooltipSeriesIndices : morpheus.Util.sequ32(dataset.getSeriesCount());
    for (var i = 0, nseries = tooltipSeriesIndices.length; i < nseries; i++) {
      morpheus.HeatMapTooltipProvider._matrixValueToString(heatMap, dataset,
        rowIndex, columnIndex, tooltipSeriesIndices[i], tipText, separator,
        options.showSeriesNameInTooltip || i > 0);
      if (heatMap.options.symmetric && dataset.getValue(rowIndex, columnIndex, tooltipSeriesIndices[i]) !== dataset.getValue(columnIndex, rowIndex, tooltipSeriesIndices[i])) {
        morpheus.HeatMapTooltipProvider._matrixValueToString(heatMap, dataset,
          columnIndex, rowIndex, tooltipSeriesIndices[i], tipText, separator, false);
      }
    }

    if (quick) {
      var quickRowTracks = heatMap.rowTracks.filter(function (t) {
        return t.settings.inlineTooltip;
      });
      morpheus.HeatMapTooltipProvider._tracksToString(quickRowTracks, dataset.getRowMetadata(), rowIndex, tipText, separator);
      morpheus.HeatMapTooltipProvider._tracksToString(heatMap.columnTracks.filter(function (t) {
        return t.settings.inlineTooltip;
      }), dataset.getColumnMetadata(), columnIndex, tipText, separator);

    }
  } else if (quick) {
    if (rowIndex !== -1) {
      morpheus.HeatMapTooltipProvider._tracksToString(heatMap.rowTracks.filter(function (t) {
        return t.settings.inlineTooltip && options.name !== t.getName();
      }), dataset.getRowMetadata(), rowIndex, tipText, separator);
    }
    if (columnIndex !== -1) {
      morpheus.HeatMapTooltipProvider._tracksToString(heatMap.columnTracks.filter(function (t) {
        return t.settings.inlineTooltip && options.name !== t.getName();
      }), dataset.getColumnMetadata(), columnIndex, tipText, separator);
    }
  }

  if (!quick) {
    if (rowIndex !== -1) {
      morpheus.HeatMapTooltipProvider._metadataToString(options,
        heatMap.rowTracks, dataset.getRowMetadata(), rowIndex,
        tipText, separator);
    }
    if (columnIndex !== -1) {
      morpheus.HeatMapTooltipProvider._metadataToString(options,
        heatMap.columnTracks, dataset.getColumnMetadata(),
        columnIndex, tipText, separator);
    }
  } else if (options.name != null) {
    var metadata = (rowIndex !== -1 ? dataset.getRowMetadata() : dataset.getColumnMetadata());
    var vector = metadata.getByName(options.name);
    var track = heatMap.getTrack(options.name, columnIndex !== -1);
    var colorByName = track != null ? track.settings.colorByField : null;
    var additionalVector = colorByName != null ? metadata
    .getByName(colorByName) : null;
    morpheus.HeatMapTooltipProvider.vectorToString(vector,
      rowIndex !== -1 ? rowIndex : columnIndex, tipText, separator,
      additionalVector);

  }
  var rowNodes = [];
  var columnNodes = [];
  var selectedRowNodes = [];
  var selectedColumnNodes = [];

  if (options.rowNodes) {
    rowNodes = options.rowNodes;
  }
  if (options.columnNodes) {
    columnNodes = options.columnNodes;
  }
  if (!quick) {
    if (heatMap.rowDendrogram) {
      selectedRowNodes = _
      .values(heatMap.rowDendrogram.selectedRootNodeIdToNode);
    }
    if (heatMap.columnDendrogram) {
      selectedColumnNodes = _
      .values(heatMap.columnDendrogram.selectedRootNodeIdToNode);
    }
    if (selectedRowNodes.length > 0 && rowNodes.length > 0) {
      var nodeIds = {};
      _.each(selectedRowNodes, function (n) {
        nodeIds[n.id] = true;
      });
      rowNodes = _.filter(rowNodes, function (n) {
        return nodeIds[n.id] === undefined;
      });
    }
    if (selectedColumnNodes.length > 0 && columnNodes.length > 0) {
      var nodeIds = {};
      _.each(selectedColumnNodes, function (n) {
        nodeIds[n.id] = true;
      });
      columnNodes = _.filter(columnNodes, function (n) {
        return nodeIds[n.id] === undefined;
      });
    }
  }
  morpheus.HeatMapTooltipProvider._nodesToString(tipText, rowNodes, null, separator);
  morpheus.HeatMapTooltipProvider._nodesToString(tipText, columnNodes, null, separator);
  if (!quick) {
    if (selectedRowNodes.length > 0) {
      morpheus.HeatMapTooltipProvider._nodesToString(tipText,
        selectedRowNodes, heatMap.rowDendrogram._selectedNodeColor,
        separator);
    }
    if (selectedColumnNodes.length > 0) {
      morpheus.HeatMapTooltipProvider._nodesToString(tipText,
        selectedColumnNodes,
        heatMap.columnDendrogram._selectedNodeColor, separator);
    }
  }

};

morpheus.HeatMapTooltipProvider._matrixValueToString = function (heatMap, dataset, rowIndex, columnIndex, seriesIndex, tipText, separator, showSeriesNameInTooltip) {
  var val = dataset.getValue(rowIndex, columnIndex, seriesIndex);
  if (val != null) {
    var nf = heatMap.getHeatMapElementComponent().getDrawValuesFormat();
    if (val.toObject || !_.isNumber(val)) {
      var obj = val.toObject ? val.toObject() : val;
      if (morpheus.Util.isArray(obj)) {
        var v = morpheus.Util.toString(obj);
        if (tipText.length > 0) {
          tipText.push(separator);
        }
        if (showSeriesNameInTooltip) {
          tipText.push(dataset.getName(seriesIndex));
          tipText.push(': ');
        }
        tipText.push('<b>');
        tipText.push(v);
        tipText.push('</b>');
      } else {
        var keys = _.keys(obj);
        if (keys.length === 0) {
          var v = morpheus.Util.toString(obj);
          if (tipText.length > 0) {
            tipText.push(separator);
          }
          if (showSeriesNameInTooltip) {
            tipText.push(dataset.getName(seriesIndex));
            tipText.push(': ');
          }
          tipText.push('<b>');
          tipText.push(v);
          tipText.push('</b>');
        } else {
          for (var i = 0, nkeys = keys.length; i < nkeys; i++) {
            var key = keys[i];
            if (key !== '__v') { // special value key
              var objVal = obj[key];
              var v;
              if (morpheus.Util.isArray(objVal)) {
                v = morpheus.Util.arrayToString(objVal, ', ');
              } else {
                v = morpheus.Util.toString(objVal);
              }
              if (tipText.length > 0) {
                tipText.push(separator);
              }
              tipText.push(key);
              tipText.push(': <b>');
              tipText.push(v);
              tipText.push('</b>');
            }
          }
          if (_.isNumber(val)) {
            tipText.push(separator);
            tipText.push('Value: <b>');
            tipText.push(nf(val));
            tipText.push('</b>');
          }
        }
      }
    } else {
      if (tipText.length > 0) {
        tipText.push(separator);
      }

      if (showSeriesNameInTooltip) {
        tipText.push(dataset.getName(seriesIndex));
        tipText.push(': ');
      }
      tipText.push('<b>');
      tipText.push(nf(val));
      tipText.push('</b>');
    }
  }
};

morpheus.HeatMapTooltipProvider.vectorToString = function (vector, index, tipText, separator, additionalVector) {
  var arrayValueToString = function (arrayFieldName, arrayVal) {
    if (arrayVal != null) {
      if (arrayFieldName != null) {
        if (tipText.length > 0) {
          tipText.push(separator);
        }
        tipText.push(arrayFieldName); // e.g. PC3
      }
      if (arrayVal.toObject) {
        tipText.push(' ');
        var obj = arrayVal.toObject();
        var keys = _.keys(obj);
        _.each(keys, function (key) {
          var subVal = obj[key];
          if (subVal != null && subVal != '') {
            if (tipText.length > 0) {
              tipText.push(separator);
            }
            tipText.push(key);
            tipText.push(': <b>');
            tipText.push(morpheus.Util.toString(subVal));
            tipText.push('</b>');
          }
        });
      } else {
        tipText.push(': <b>');
        tipText.push(morpheus.Util.toString(arrayVal));
        tipText.push('</b>');
      }

    }
  };
  if (vector != null) {
    var primaryVal = vector.getValue(index);
    if (primaryVal != null && primaryVal != '') {
      var primaryFields = vector.getProperties().get(
        morpheus.VectorKeys.FIELDS);
      if (primaryFields != null) {
        var visibleFieldIndices = vector.getProperties().get(
          morpheus.VectorKeys.VISIBLE_FIELDS);
        if (visibleFieldIndices === undefined) {
          visibleFieldIndices = morpheus.Util
          .seq(primaryFields.length);
        }
        var additionalFieldNames = additionalVector != null ? additionalVector
        .getProperties().get(morpheus.VectorKeys.FIELDS)
          : null;
        var additionalVal = additionalFieldNames != null ? additionalVector
        .getValue(index)
          : null;
        if (tipText.length > 0) {
          tipText.push(separator);
        }
        tipText.push(vector.getName());
        for (var j = 0; j < visibleFieldIndices.length; j++) {
          arrayValueToString(primaryFields[visibleFieldIndices[j]],
            primaryVal[visibleFieldIndices[j]]);
        }

        if (additionalVal != null) {
          if (tipText.length > 0) {
            tipText.push(separator);
          }
          tipText.push(additionalVector.getName());
          for (var j = 0; j < visibleFieldIndices.length; j++) {
            arrayValueToString(
              additionalFieldNames[visibleFieldIndices[j]],
              additionalVal[visibleFieldIndices[j]]);
          }

        }
      } else if (primaryVal.summary) {
        if (tipText.length > 0) {
          tipText.push(separator);
        }
        tipText.push(vector.getName());
        tipText.push(': ');
        var obj = primaryVal.summary;
        var keys = _.keys(obj);
        for (var i = 0, nkeys = keys.length; i < nkeys; i++) {
          var key = keys[i];
          if (key !== '__v') { // special value key
            var objVal = obj[key];
            var v;
            if (morpheus.Util.isArray(objVal)) {
              v = morpheus.Util.arrayToString(objVal, ', ');
            } else {
              v = morpheus.Util.toString(objVal);
            }
            if (tipText.length > 0) {
              tipText.push(separator);
            }
            tipText.push(key);
            tipText.push(': <b>');
            tipText.push(v);
            tipText.push('</b>');
          }
        }

      } else {
        if (tipText.length > 0) {
          tipText.push(separator);
        }
        tipText.push(vector.getName());
        tipText.push(': <b>');
        tipText.push(morpheus.Util.toString(primaryVal));
        tipText.push('</b>');
      }

    }
  }
};
morpheus.HeatMapTooltipProvider._tracksToString = function (tracks, metadata, index, tipText, separator) {
  for (var i = 0; i < tracks.length; i++) {
    morpheus.HeatMapTooltipProvider.vectorToString(metadata.getByName(tracks[i].name), index, tipText,
      separator);

  }
};
morpheus.HeatMapTooltipProvider._metadataToString = function (options, tracks, metadata, index,
                                                              tipText, separator) {
  var filtered = [];
  for (var i = 0, ntracks = tracks.length; i < ntracks; i++) {
    var track = tracks[i];
    if ((track.isVisible() && track.isShowTooltip())) {
      if (tracks[i].name === options.name) { // show the vector that we're mousing over 1st
        filtered.splice(0, 0, track);
      } else {
        filtered.push(track);
      }
    }
  }

  morpheus.HeatMapTooltipProvider._tracksToString(filtered, metadata, index, tipText, separator);

};
morpheus.HeatMapTooltipProvider._nodesToString = function (tipText, nodes, color, separator) {
  var renderField = function (name, value) {
    if (value != null) {
      if (tipText.length > 0) {
        tipText.push(separator);
      }
      if (color) {
        tipText.push('<span style="color:' + color + '">');
      }
      tipText.push(name);
      tipText.push(': <b>');
      if (_.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
          if (i > 0) {
            tipText.push(', ');
          }
          tipText.push(morpheus.Util.toString(value[i]));
        }
      } else {
        tipText.push(morpheus.Util.toString(value));
      }
      tipText.push('</b>');
      if (color) {
        tipText.push('</span>');
      }
    }
  };
  _.each(nodes, function (node) {
    if (node.info) {
      for (var name in node.info) {
        var value = node.info[name];
        renderField(name, value);
      }
    }
    renderField('height', node.height);
    renderField('depth', node.depth);
    var nLeafNodes = 1 + Math.abs(node.maxIndex - node.minIndex);
    if (nLeafNodes > 0) {
      renderField('# of leaf nodes', nLeafNodes);
      // renderField('height', node.height);
    }
  });
};

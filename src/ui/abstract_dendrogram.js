/*
 * 
 * @param tree An object with maxHeight, rootNode, leafNodes, nLeafNodes. Each node has an id
 * (integer), name (string), children, depth, height, minIndex, maxIndex, parent. Leaf nodes also
 * have an index.
 The root has the largest height, leaves the smallest height.

 */
morpheus.AbstractDendrogram = function (heatMap, tree, positions, project,
                                        type) {
  morpheus.AbstractCanvas.call(this, true);

  this._overviewHighlightColor = '#d8b365';
  this._searchHighlightColor = '#e41a1c';
  this._selectedNodeColor = type === morpheus.AbstractDendrogram.Type.COLUMN ? '#377eb8'
    : '#984ea3';
  this.tree = tree;
  this.type = type;
  this.squishEnabled = false;
  this.heatMap = heatMap;
  this.positions = positions;
  this.project = project;
  var $label = $('<span></span>');
  $label.addClass('label label-info');
  $label.css('position', 'absolute');
  this.$label = $label;
  var $squishedLabel = $('<span></span>');
  $squishedLabel.addClass('label label-default');
  $squishedLabel.css('position', 'absolute').css('top', 18);
  this.$squishedLabel = $squishedLabel;
  this.$label = $label;
  this.cutHeight = this.tree.maxHeight;
  this.drawLeafNodes = true;
  this.lineWidth = 0.7;
  this.selectedNodeIds = {};
  this.selectedRootNodeIdToNode = {};
  this.nodeIdToHighlightedPathsToRoot = {};
  var _this = this;
  this.defaultStroke = 'rgb(0,0,0)';
  this.mouseMoveNodes = null;
  var mouseMove = function (event) {
    if (!morpheus.CanvasUtil.dragging) {
      var position = morpheus.CanvasUtil.getMousePosWithScroll(
        event.target, event, _this.lastClip.x, _this.lastClip.y);
      if (_this.isDragHotSpot(position)) { // dendrogram cutter
        _this.canvas.style.cursor = _this.getResizeCursor();
      } else {
        var nodes;
        if (_this.getNodes) {
          nodes = _this.getNodes(position);
        } else {
          var node = _this.getNode(position);
          if (node) {
            nodes = [node];
          }
        }
        _this.mouseMoveNodes = nodes;
        if (nodes != null) {
          nodes.sort(function (a, b) {
            return a.name < b.name;
          });
          var tipOptions = {
            event: event
          };
          tipOptions[type === morpheus.AbstractDendrogram.Type.COLUMN ? 'columnNodes'
            : 'rowNodes'] = nodes;
          _this.heatMap.setToolTip(-1, -1, tipOptions);
          _this.canvas.style.cursor = 'pointer';
        } else {
          _this.heatMap.setToolTip(-1, -1);
          _this.canvas.style.cursor = 'default';
        }
      }
    }
  };
  var mouseExit = function (e) {
    if (!morpheus.CanvasUtil.dragging) {
      _this.mouseMoveNodes = null;
      _this.canvas.style.cursor = 'default';
    }
  };
  if (type !== morpheus.AbstractDendrogram.Type.RADIAL) {

    $(this.canvas)
    .on(
      'contextmenu',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        var position = morpheus.CanvasUtil
        .getMousePosWithScroll(e.target,
          e, _this.lastClip.x,
          _this.lastClip.y);
        var selectedNode = _this.getNode(position);
        morpheus.Popup
        .showPopup(
          [{
            name: 'Flip',
            disabled: selectedNode == null
          }, {
            name: 'Branch Color',
            disabled: selectedNode == null
          }, {
            separator: true
          },
            {
              name: 'Annotate...'
            }, {
            name: 'Save'
          }, {
            separator: true
          }, {
            name: 'Enrichment...'
          }, {
            separator: true
          }, {
            name: 'Squish Singleton Clusters',
            checked: _this.squishEnabled
          }, {
            separator: true
          }, {
            name: 'Delete'
          }],
          {
            x: e.pageX,
            y: e.pageY
          },
          e.target,
          function (menuItem, item) {
            if (item === 'Save') {
              var formBuilder = new morpheus.FormBuilder();
              formBuilder.append({
                name: 'file_name',
                type: 'text',
                required: true,
              });
              morpheus.FormBuilder.showOkCancel({
                title: 'Save Dendrogram',
                content: formBuilder.$form,
                focus: document.activeElement,
                okCallback: function () {
                  var fileName = formBuilder.getValue('file_name');
                  if (fileName === '') {
                    fileName = 'dendrogram.txt';
                  }
                  var out = [];
                  morpheus.DendrogramUtil.writeNewick(tree.rootNode, out);
                  var blob = new Blob([out.join('')], {type: 'text/plain;charset=charset=utf-8'});
                  saveAs(blob, fileName, true);
                }
              });
            } else if (item === 'Flip') {
              if (selectedNode != null) {
                var isColumns = morpheus.AbstractDendrogram.Type.COLUMN === _this.type;
                var min = selectedNode.minIndex;
                var max = selectedNode.maxIndex;

                // morpheus.DendrogramUtil.dfs(selectedNode, function (n) {
                //   if (n.children) {
                //     n.children.reverse();
                //   }
                //   return true;
                // });

                var leafNodes = tree.leafNodes;
                for (var i = min, index = max; i <= max; i++, index--) {
                  var n = leafNodes[i];
                  n.index = index;
                  n.maxIndex = index;
                  n.minIndex = index;
                }

                leafNodes.sort(function (a, b) {
                  return (a.index < b.index ? -1 : 1);
                });
                var setIndex = function (n) {
                  if (n.children != null && n.children.length > 0) {
                    for (var i = 0; i < n.children.length; i++) {
                      setIndex(n.children[i]);
                    }
                    var sum = 0;
                    for (var i = 0; i < n.children.length; i++) {
                      sum += n.children[i].index;
                    }
                    n.index = sum / n.children.length;
                    var maxIndex = -Number.MAX_VALUE;
                    var minIndex = Number.MAX_VALUE;
                    for (var i = 0; i < n.children.length; i++) {
                      maxIndex = Math.max(maxIndex, n.children[i].maxIndex);
                      minIndex = Math.min(minIndex, n.children[i].minIndex);
                    }
                    n.minIndex = minIndex;
                    n.maxIndex = maxIndex;
                  }
                };

                setIndex(selectedNode);

                var currentOrder = [];
                var count = isColumns ? heatMap.getProject().getSortedFilteredDataset().getColumnCount() : heatMap.getProject().getSortedFilteredDataset().getRowCount();
                for (var i = 0; i < count; i++) {
                  currentOrder.push(isColumns ? project.convertViewColumnIndexToModel(i) : project.convertViewRowIndexToModel(i));
                }
                for (var i = min, j = max; i < j; i++, j--) {
                  var tmp = currentOrder[j];
                  currentOrder[j] = currentOrder[i];
                  currentOrder[i] = tmp;
                }
                var key = new morpheus.SpecifiedModelSortOrder(currentOrder, currentOrder.length, 'dendrogram', isColumns);
                key.setLockOrder(2);
                if (isColumns) {
                  heatMap.getProject().setColumnSortKeys([key], true);
                } else {
                  heatMap.getProject().setRowSortKeys([key], true);
                }
                heatMap.revalidate();
              }

            } else if (item === 'Branch Color') {
              if (selectedNode != null) {
                var formBuilder = new morpheus.FormBuilder();
                formBuilder.append({
                  name: 'color',
                  type: 'color',
                  value: selectedNode.color,
                  required: true,
                  style: 'max-width:50px;'
                });
                formBuilder.find('color').on(
                  'change',
                  function () {
                    var color = $(this).val();
                    morpheus.DendrogramUtil.dfs(selectedNode, function (n) {
                      n.color = color;
                      return true;
                    });
                    _this.setSelectedNode(null);
                  });
                morpheus.FormBuilder.showInModal({
                  title: 'Color',
                  close: 'Close',
                  html: formBuilder.$form,
                  focus: document.activeElement
                });

              }
            } else if (item === 'Annotate...') {
              morpheus.HeatMap
              .showTool(
                new morpheus.AnnotateDendrogramTool(
                  type === morpheus.AbstractDendrogram.Type.COLUMN),
                _this.heatMap);
            } else if (item === 'Enrichment...') {
              morpheus.HeatMap
              .showTool(
                new morpheus.DendrogramEnrichmentTool(
                  type === morpheus.AbstractDendrogram.Type.COLUMN),
                _this.heatMap);
            } else if (item === 'Squish Singleton Clusters') {
              _this.squishEnabled = !_this.squishEnabled;
              if (!_this.squishEnabled) {
                _this.positions
                .setSquishedIndices(null);
              }
            } else if (item === 'Delete') {
              _this.resetCutHeight();
              _this.heatMap
              .setDendrogram(
                null,
                type === morpheus.AbstractDendrogram.Type.COLUMN);
            }
          });
        return false;
      });

    $(this.canvas).on('mousemove', _.throttle(mouseMove, 100)).on(
      'mouseout', _.throttle(mouseExit, 100)).on('mouseenter',
      _.throttle(mouseMove, 100));
  }
  var dragStartScaledCutHeight = 0;
  this.cutTreeHotSpot = false;
  if (type !== morpheus.AbstractDendrogram.Type.RADIAL) {
    this.hammer = morpheus.Util
    .hammer(this.canvas, ['pan', 'tap'])
    .on(
      'tap',
      this.tap = function (event) {
        if (!morpheus.CanvasUtil.dragging) {
          var position = morpheus.CanvasUtil
          .getMousePosWithScroll(event.target,
            event, _this.lastClip.x,
            _this.lastClip.y);
          _this.cutTreeHotSpot = _this
          .isDragHotSpot(position);
          if (_this.cutTreeHotSpot) {
            return;
          }
          var node = _this.getNode(position);
          if (node != null && node.parent === undefined) {
            node = null; // can't select root
          }
          var commandKey = morpheus.Util.IS_MAC ? event.srcEvent.metaKey
            : event.srcEvent.ctrlKey;
          _this.setSelectedNode(node,
            event.srcEvent.shiftKey || commandKey);
        }
      })
    .on('panend', this.panend = function (event) {
      morpheus.CanvasUtil.dragging = false;
      _this.canvas.style.cursor = 'default';
      _this.cutTreeHotSpot = true;
    })
    .on(
      'panstart',
      this.panstart = function (event) {
        var position = morpheus.CanvasUtil
        .getMousePosWithScroll(event.target, event,
          _this.lastClip.x, _this.lastClip.y,
          true);
        _this.cutTreeHotSpot = _this
        .isDragHotSpot(position);
        if (_this.cutTreeHotSpot) { // make sure start event
          // was on hotspot
          morpheus.CanvasUtil.dragging = true;
          _this.canvas.style.cursor = _this
          .getResizeCursor();
          dragStartScaledCutHeight = _this
          .scale(_this.cutHeight);
        }
      })
    .on(
      'panmove',
      this.panmove = function (event) {
        if (_this.cutTreeHotSpot) {
          var cutHeight;
          if (_this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
            var delta = event.deltaY;
            cutHeight = Math
            .max(
              0,
              Math
              .min(
                _this.tree.maxHeight,
                _this.scale
                .invert(dragStartScaledCutHeight
                  + delta)));
          } else if (_this.type === morpheus.AbstractDendrogram.Type.ROW) {
            var delta = event.deltaX;
            cutHeight = Math
            .max(
              0,
              Math
              .min(
                _this.tree.maxHeight,
                _this.scale
                .invert(dragStartScaledCutHeight
                  + delta)));
          } else {
            var point = morpheus.CanvasUtil
            .getMousePos(event.target, event);
            point.x = _this.radius - point.x;
            point.y = _this.radius - point.y;
            var radius = Math.sqrt(point.x * point.x
              + point.y * point.y);
            if (radius <= 4) {
              cutHeight = _this.tree.maxHeight;
            } else {
              cutHeight = Math.max(0, Math.min(
                _this.tree.maxHeight,
                _this.scale.invert(radius)));
            }
          }
          if (cutHeight >= _this.tree.maxHeight) {
            _this.resetCutHeight();
          } else {
            _this.setCutHeight(cutHeight);
          }
          event.preventDefault();
        }
      });
  }
};
morpheus.AbstractDendrogram.Type = {
  COLUMN: 0,
  ROW: 1,
  RADIAL: 2
};
morpheus.AbstractDendrogram.prototype = {
  setSelectedNode: function (node, add) {
    var _this = this;
    var viewIndices;
    var selectionModel = this.type === morpheus.AbstractDendrogram.Type.COLUMN ? this.project
    .getColumnSelectionModel()
      : this.project.getRowSelectionModel();
    if (node == null) {
      // clear selection
      _this.selectedNodeIds = {};
      _this.selectedRootNodeIdToNode = {};
      viewIndices = new morpheus.Set();
    } else {
      if (add) { // add to selection
        viewIndices = selectionModel.getViewIndices();
      } else {
        viewIndices = new morpheus.Set();
        _this.selectedNodeIds = {};
        _this.selectedRootNodeIdToNode = {};
      }
      if (node != null) {
        if (node.children === undefined) { // leaf node
          var contains = _this.nodeIdToHighlightedPathsToRoot[node.id];
          if (!add) {
            _this.nodeIdToHighlightedPathsToRoot = {};
          }
          if (contains) {
            delete _this.nodeIdToHighlightedPathsToRoot[node.id];
            // toggle
          } else {
            _this.nodeIdToHighlightedPathsToRoot[node.id] = node;
          }
        } else {
          _this.selectedRootNodeIdToNode[node.id] = node;
          morpheus.DendrogramUtil.dfs(node, function (d) {
            _this.selectedNodeIds[d.id] = true;
            return true;
          });
        }
        for (var i = node.minIndex; i <= node.maxIndex; i++) {
          viewIndices.add(i);
        }
      }
    }
    _this.trigger('nodeSelectionChanged', _this.selectedRootNodeIdToNode);
    selectionModel.setViewIndices(viewIndices, true);
    _this.repaint();
  },
  getPathStroke: function (node) {
    if (this.selectedNodeIds[node.id]) {
      return this._selectedNodeColor;
    }
    if (node.color !== undefined) {
      return node.color;
    }
    // if (node.search) {
    // return this._searchHighlightColor;
    // }
    return this.defaultStroke;
  },
  /**
   *
   * @param node
   * @return The color, if any, to draw a circle for a node in the dendrogram
   */
  getNodeFill: function (node) {
    if (this.selectedRootNodeIdToNode[node.id]) {
      return this._selectedNodeColor;
    }
    if (node.search) {
      return this._searchHighlightColor;
    }
    if (node.info !== undefined) {
      return this._overviewHighlightColor;
    }

  },
  resetCutHeight: function () {
    this.positions.setSquishedIndices(null);
    if (this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
      this.project.setGroupColumns([], true);
    } else {
      this.project.setGroupRows([], true);
    }
    this.$label.text('');
    this.$squishedLabel.text('');
    var dataset = this.project.getSortedFilteredDataset();
    var clusterIdVector = this.type === morpheus.AbstractDendrogram.Type.COLUMN ? dataset
    .getColumnMetadata().getByName('dendrogram_cut')
      : dataset.getRowMetadata().getByName('dendrogram_cut');
    if (clusterIdVector) {
      for (var i = 0, size = clusterIdVector.size(); i < size; i++) {
        clusterIdVector.setValue(i, NaN);
      }
    }
  },
  setCutHeight: function (height) {
    this.cutHeight = height;
    var squishedIndices = {};
    var clusterNumber = 0;
    var nsquished = 0;

    var squishEnabled = this.squishEnabled;
    var roots = morpheus.DendrogramUtil.cutAtHeight(this.tree.rootNode,
      this.cutHeight);
    var dataset = this.project.getSortedFilteredDataset();
    var clusterIdVector = this.type === morpheus.AbstractDendrogram.Type.COLUMN ? dataset
    .getColumnMetadata().add('dendrogram_cut')
      : dataset.getRowMetadata().add('dendrogram_cut');
    for (var i = 0, nroots = roots.length; i < nroots; i++) {
      var root = roots[i];
      var minChild = morpheus.DendrogramUtil.getDeepestChild(root,
        true);
      var maxChild = morpheus.DendrogramUtil.getDeepestChild(root,
        false);
      var clusterId;
      if (squishEnabled && minChild.index === maxChild.index) {
        squishedIndices[minChild.index] = true;
        clusterId = -2;
        nsquished++;
      } else {
        clusterNumber++;
        clusterId = clusterNumber;
      }
      for (var j = minChild.index; j <= maxChild.index; j++) {
        clusterIdVector.setValue(j, clusterId);
      }

    }
    this.$label.text((clusterNumber) + ' cluster'
      + morpheus.Util.s(clusterNumber));
    if (nsquished > 0) {
      this.$squishedLabel.text(nsquished + ' squished');
    } else {
      this.$squishedLabel.text('');
    }
    if (squishEnabled) {
      this.positions.setSquishedIndices(squishedIndices);
    }
    if (this.heatMap.getTrackIndex(clusterIdVector.getName(),
        this.type === morpheus.AbstractDendrogram.Type.COLUMN) === -1) {
      var settings = {
        discrete: true,
        discreteAutoDetermined: true,
        render: {}
      };
      settings.render[morpheus.VectorTrack.RENDER.COLOR] = true;
      this.heatMap.addTrack(clusterIdVector.getName(),
        this.type === morpheus.AbstractDendrogram.Type.COLUMN,
        settings);
    }

    if (this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
      this.project.setGroupColumns([new morpheus.SortKey(clusterIdVector
      .getName(), morpheus.SortKey.SortOrder.UNSORTED)], true);
    } else {
      this.project.setGroupRows([new morpheus.SortKey(clusterIdVector
      .getName(), morpheus.SortKey.SortOrder.UNSORTED)], true);
    }
  },
  dispose: function () {
    morpheus.AbstractCanvas.prototype.dispose.call(this);
    this.$label.remove();
    this.$squishedLabel.remove();
    this.hammer.off('panend', this.panend).off('panstart',
      this.panstart).off('panmove', this.panmove).off('tap', this.tap);
    this.hammer.destroy();
    this.$label = null;
    this.$squishedLabel = null;
  },
  isCut: function () {
    return this.cutHeight < this.tree.maxHeight;
  },
  getMinIndex: function () {
    return 0;
  },
  getMaxIndex: function () {
    return this.positions.getLength() - 1;
  },
  getNode: function (p) {
    var _this = this;
    if (this.lastNode) {
      var xy = _this.toPix(this.lastNode);
      if (Math.abs(xy[0] - p.x) < 4 && Math.abs(xy[1] - p.y) < 4) {
        return this.lastNode;
      }
    }
    this.lastNode = this._getNode(p);
    return this.lastNode;
  },
  // getNode : function(p) {
  // var x = p.x;
  // var y = p.y;
  // var leafIndex = this.positions.getIndex(x, true);
  // if (leafIndex >= 0 && leafIndex < leafNodeIds.length) {
  // leafid = leafNodeIds[leafIndex];
  // } else {
  // return null;
  // }
  // var n = leafNodes.get(leafid);
  // if (n != null) {
  // while (!n.isRoot()) {
  // var parent = n.getParent();
  // getNodePosition(parent, p);
  // if (Math.abs(p.x - x) < 4 && Math.abs(p.y - y) < 4) {
  // return parent;
  // }
  // n = parent;
  // }
  // }
  // return null;
  // },
  _getNode: function (p) {
    var _this = this;
    // brute force search
    var hit = null;
    try {
      morpheus.DendrogramUtil.dfs(this.tree.rootNode, function (node) {
        var xy = _this.toPix(node);
        if (Math.abs(xy[0] - p.x) < 4 && Math.abs(xy[1] - p.y) < 4) {
          hit = node;
          throw 'break';
        }
        return hit === null;
      });
    }
    catch (x) {
      // break of out dfs
    }
    return hit;
  },
  getResizeCursor: function () {
    if (this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
      return 'ns-resize';
    } else if (this.type === morpheus.AbstractDendrogram.Type.ROW) {
      return 'ew-resize';
    }
    return 'nesw-resize';
  },
  isDragHotSpot: function (p) {
    return false;
  },
  preDraw: function (context, clip) {
  },
  postDraw: function (context, clip) {
  },
  prePaint: function (clip, context) {
    this.scale = this.createScale();
    var min = this.getMinIndex(clip);
    var max = this.getMaxIndex(clip);
    if (min !== this.lastMinIndex || max !== this.lastMinIndex) {
      this.lastMinIndex = min;
      this.lastMaxIndex = max;
    }
    this.invalid = true;
  },
  draw: function (clip, context) {
    context.translate(-clip.x, -clip.y);
    context.strokeStyle = 'black';
    context.fillStyle = 'black';
    this.scale = this.createScale();
    var min = this.lastMinIndex;
    var max = this.lastMaxIndex;
    context.lineWidth = this.lineWidth;
    this.preDraw(context, clip);
    context.strokeStyle = this.defaultStroke;
    context.fillStyle = 'rgba(166,206,227,0.5)';
    this.drawDFS(context, this.tree.rootNode, min, max, 0);
    context.strokeStyle = 'black';
    context.fillStyle = 'black';
    this.postDraw(context, clip);
  },
  /**
   * @abstract
   */
  drawCutSlider: function () {
    throw new Error();
  },
  postPaint: function (clip, context) {
    context.strokeStyle = 'black';
    this.paintMouseOver(clip, context);
    this.drawCutSlider(clip, context);
    // this.drawHighlightedPathsToRoot(context, this.lastMinIndex,
    // this.lastMaxIndex);
  },
  // drawHighlightedPathsToRoot : function(context, minIndex, maxIndex) {
  // context.lineWidth = 1;
  // context.strokeStyle = 'black';
  // context.textAlign = 'left';
  // var i = 0;
  // for ( var key in this.nodeIdToHighlightedPathsToRoot) {
  // context.fillStyle = '#99d594';
  // context.strokeStyle = context.fillStyle;
  // var node = this.nodeIdToHighlightedPathsToRoot[key];
  // if (node.collapsed) {
  // for (var node = node.parent; node.collapsedChildren != null; node =
  // node.parent) {
  // node = node.parent;
  // }
  // }
  // // var pix = this.toPix(node);
  // // context.globalAlpha = 0.5;
  // // context.beginPath();
  // // context.arc(pix[0], pix[1], 8, Math.PI * 2, false);
  // // context.fill();
  // // context.globalAlpha = 1;
  // for (var root = node; root.parent !== undefined; root = root.parent) {
  // this
  // .drawPathFromNodeToParent(context, root, minIndex,
  // maxIndex);
  // }
  // i++;
  // }
  // },
  getNodeRadius: function (node) {
    // if (this._nodeRadiusScaleField != null) {
    // var vals = node.info[this._nodeRadiusScaleField];
    // if (vals === undefined) {
    // return 4;
    // }
    // // TODO get max or min
    // return this._nodeRadiusScale(vals[0]) * 8;
    // }
    return 4;
  },

  drawNode: function (context, node) {
  },
  drawDFS: function (context, node, minIndex, maxIndex) {
    if (this.type !== morpheus.AbstractDendrogram.Type.RADIAL) {
      if ((node.maxIndex < minIndex) || (node.minIndex > maxIndex)) {
        return;
      }
    }
    var nodeFill = this.getNodeFill(node);
    if (nodeFill !== undefined) {
      context.fillStyle = nodeFill;
      this.drawNode(context, node);
    }
    context.strokeStyle = this.getPathStroke(node);
    var children = node.children;
    if (children !== undefined) {
      this.drawNodePath(context, node, minIndex, maxIndex);
      for (var i = 0, nchildren = children.length; i < nchildren; i++) {
        this.drawDFS(context, children[i], minIndex, maxIndex);
      }

    }
  }
};

morpheus.Util.extend(morpheus.AbstractDendrogram, morpheus.AbstractCanvas);
morpheus.Util.extend(morpheus.AbstractDendrogram, morpheus.Events);

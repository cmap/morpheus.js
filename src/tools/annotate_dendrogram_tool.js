morpheus.AnnotateDendrogramTool = function (isColumns) {
  this._isColumns = isColumns;
};
morpheus.AnnotateDendrogramTool.prototype = {
  toString: function () {
    return 'Annotate Dendrogram';
  },
  gui: function () {
    return [{
      name: 'file',
      value: '',
      type: 'file',
      required: true,
      help: 'an xlsx file or a tab-delimitted text file'
    }];
  },
  execute: function (options) {
    var fileOrUrl = options.input.file;
    var isColumns = this._isColumns;
    var heatMap = options.heatMap;
    var result = morpheus.Util.readLines(fileOrUrl);
    var fileName = morpheus.Util.getFileName(fileOrUrl);
    var dendrogram = isColumns ? heatMap.columnDendrogram
      : heatMap.rowDendrogram;
    var nameToNode = new morpheus.Map();
    morpheus.DendrogramUtil.dfs(dendrogram.tree.rootNode,
      function (node) {
        nameToNode.set(node.name, node);
        return true;
      });
    var tab = /\t/;
    result.then(function (lines) {
      var header = lines[0].split(tab);
      var promptTool = {};
      // node.info = {foo:['a', 'b'], bar:[3]}
      promptTool.execute = function (options) {
        var nodeIdField = options.input.node_id_field;
        var nodeIdIndex = _.indexOf(header, nodeIdField);
        var numberOfMatchingNodes = 0;
        for (var i = 1; i < lines.length; i++) {
          var array = lines[i].split(tab);
          var nodeName = array[nodeIdIndex];
          var node = nameToNode.get(nodeName);
          if (node !== undefined) {
            numberOfMatchingNodes++;
            var info = node.info || (node.info = {});
            for (var j = 0; j < array.length; j++) {
              if (j === nodeIdIndex) {
                continue;
              }
              var vals = info[header[j]];
              if (vals === undefined) {
                vals = [];
                info[header[j]] = vals;
              }
              vals.push(array[j]);
            }
          }
        }
        heatMap.trigger('dendrogramAnnotated', {
          isColumns: isColumns
        });
        dendrogram.setInvalid(true);
        dendrogram.repaint();
      };
      promptTool.toString = function () {
        return 'Select Node Id Field';
      };
      promptTool.gui = function () {
        return [{
          name: 'node_id_field',
          type: 'select',
          options: _.map(header, function (item) {
            return {
              name: item,
              value: item
            };
          }),
          required: true
        }];
      };
      morpheus.HeatMap.showTool(promptTool, heatMap);
    });
  }
};

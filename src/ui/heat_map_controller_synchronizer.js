morpheus.HeatMapSynchronizer = function () {
  this.controllers = [];
};
morpheus.HeatMapSynchronizer.prototype = {
  firing: false,
  getProject: function () {
    return this.controllers[0].getProject();
  },
  zoom: function () {
    this.controllers[0].zoom.apply(this.controllers[0], arguments);
  },
  setTrackVisible: function () {
    this.controllers[0].setTrackVisible.apply(this.controllers[0],
      arguments);
  },
  revalidate: function () {
    this.controllers[0].revalidate.apply(this.controllers[0], arguments);
  },
  add: function (heatMap) {
    var that = this;
    this.controllers.push(heatMap);
    // setQuickSearchField, setTrackVisible, removeTrack, updateDataset, zoom, moveTrack, resizeTrack, paintAll, fitToWindow, revalidate, setToolTip, setMousePosition
    heatMap.on('change', function (event) {
      if (!that.firing) {
        var source = event.source;
        var method = event.name;
        that.firing = true;
        _.each(that.controllers, function (c) {
          if (c !== source) {
            c[method].apply(c, event.arguments);
          }
        });
        that.firing = false;
      }
    });
  }
};

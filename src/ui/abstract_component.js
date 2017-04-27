morpheus.AbstractComponent = function () {
  this.lastClip = null;
  var c = document.createElement('div');
  c.setAttribute('tabindex', '0');
  c.style.outline = 0;
  c.style.overflow = 'hidden';
  c.style.position = 'absolute';
  this.el = c;
  this.$el = $(c);
};
morpheus.AbstractComponent.prototype = {
  visible: true,
  invalid: true,
  prefWidth: undefined,
  prefHeight: undefined,
  appendTo: function ($el) {
    $(this.el).appendTo($el);
  },
  dispose: function () {
    $(this.el).remove();
  },
  getPrefWidth: function () {
    return this.prefWidth;
  },
  /**
   * Tells this component to invalidate
   */
  setInvalid: function (invalid) {
    this.invalid = invalid;
  },
  setBounds: function (bounds) {
//		if (bounds.height != null) {
//			this.el.style.height = bounds.height + 'px';
//		}
//		if (bounds.width != null) {
//			this.el.style.width = bounds.width + 'px';
//		}
    if (bounds.left != null) {
      this.$el.css('left', bounds.left + 'px');
    }
    if (bounds.top != null) {
      this.$el.css('top', bounds.top + 'px');
    }
  },
  /**
   * Paint this canvas using the specified clip.
   */
  paint: function (clip) {
    var width = this.getUnscaledWidth();
    var height = this.getUnscaledHeight();
    this.draw(clip);
    this.lastClip = clip;
    this.invalid = false;
  },
  repaint: function () {
    if (!this.lastClip) {
      this.lastClip = {
        x: 0,
        y: 0,
        width: this.getUnscaledWidth(),
        height: this.getUnscaledHeight()
      };
    }
    this.paint(this.lastClip);
  },
  /**
   * Draw this canvas into the specified context.
   */
  draw: function (clip) {
  },
  getPrefHeight: function () {
    return this.prefHeight;
  },
  setPrefWidth: function (prefWidth) {
    this.prefWidth = prefWidth;
  },
  setPrefHeight: function (prefHeight) {
    this.prefHeight = prefHeight;
  },
  isVisible: function () {
    return this.visible;
  },
  setVisible: function (visible) {
    if (this.visible !== visible) {
      this.visible = visible;
      this.el.style.display = visible ? '' : 'none';
    }
  },
  getUnscaledWidth: function () {
    return this.$el.width();
  },
  getUnscaledHeight: function () {
    return this.$el.height();
  },
  getWidth: function () {
    return this.$el.width();
  },
  getHeight: function () {
    return this.$el.height();
  }
};

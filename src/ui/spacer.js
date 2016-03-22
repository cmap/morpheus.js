morpheus.Spacer = function(width, height) {
	this.width = width;
	this.height = height;
};
morpheus.Spacer.prototype = {
	prefWidth : undefined,
	prefHeight : undefined,
	visible : true,
	dispose : function() {
	},
	getPrefWidth : function() {
		return this.prefWidth;
	},
	draw : function(clip) {
	},
	getPreferredSize : function() {
		return {
			width : this.width,
			height : this.height
		};
	},
	setBounds : function() {
	},
	getPrefHeight : function() {
		return this.prefHeight;
	},
	setPrefWidth : function(prefWidth) {
		this.prefWidth = prefWidth;
	},
	setPrefHeight : function(prefHeight) {
		this.prefHeight = prefHeight;
	},
	isVisible : function() {
		return this.visible;
	},
	setVisible : function(visible) {
		this.visible = visible;
	},
	getWidth : function() {
		return this.width;
	},
	getHeight : function() {
		return this.height;
	}
};
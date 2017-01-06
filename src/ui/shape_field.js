morpheus.ShapeField = function(shapes) {
	shapes = shapes || morpheus.VectorShapeModel.SHAPES;
	var _this = this;
	var html = [];
	var size2 = 8;
	var x = 4;
	var y = 4;
	html
			.push('<div style="margin-bottom:1em;" class="btn-group">');
	html
			.push('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span data-name="selection"></span> <span class="fa fa-caret-down"></span></button>');
	html.push('<ul class="dropdown-menu" role="menu">');
	for (var i = 0; i < shapes.length; i++) {
		var context = new C2S(size2 * 2, size2 * 2);
		context.translate(4, 4);
		morpheus.CanvasUtil.drawShape(context, shapes[i], x, y, size2);
		var svg = context.getSerializedSvg();
		html.push('<li><a data-name="' + shapes[i] + '" href="#">' + svg
				+ '</a></li>');
	}
	html.push('<li><a data-name="none" href="#">(None)</a></li>');
	html.push('</ul></div>');
	var $el = $(html.join(''));
	var $header = $el.find('[data-name=selection]');
	$el.on('click', 'li > a', function(e) {
		var shape = $(this).data('name');
		setShapeValue(shape);
		_this.trigger('change', {
			shape : shape
		});
	});
	var setShapeValue = function(val) {
		if (val === 'none') {
			$header.html('(None)');
		} else {
			var context = new C2S(size2 * 2, size2 * 2);
			context.translate(4, 4);
			morpheus.CanvasUtil.drawShape(context, val, x, y, size2);
			$header.html(context.getSerializedSvg());
		}
	};
	this.setShapeValue = setShapeValue;
	this.$el = $el;
};
morpheus.ShapeField.prototype = {};
morpheus.Util.extend(morpheus.ShapeField, morpheus.Events);

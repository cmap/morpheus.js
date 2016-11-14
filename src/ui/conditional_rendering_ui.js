morpheus.ConditionalRenderingUI = function (heatmap) {
	var _this = this;
	this.heatmap = heatmap;
	var $div = $('<div class="container-fluid" style="min-width:180px;"></div>');
	$div.on('click', '[data-name=add]', function (e) {
		var $this = $(this);
		var $row = $this.closest('.morpheus-entry');
		// add after
		var index = $row.index();
		var condition = {
			series: null,
			color: 'rgb(0,0,0)',
			shape: null,
			inheritColor: true,
			accept: function (val) {
				return false;
			}

		};

		heatmap.heatmap.getColorScheme().getConditions().insert(index,
			condition);

		$row.after(_this.add(condition));
		e.preventDefault();
	});
	$div.on('click', '[data-name=delete]', function (e) {
		var $this = $(this);
		var $row = $this.closest('.morpheus-entry');
		var index = $row.index() - 1;
		heatmap.heatmap.getColorScheme().getConditions().remove(index);
		heatmap.revalidate();
		$row.remove();
		e.preventDefault();
	});
	var html = [];
	html
	.push('<div class="morpheus-entry">');
	html.push('<div class="row">');
	html
	.push('<div style="padding-bottom:20px;" class="col-xs-8"><a class="btn btn-default btn-xs"' +
		' role="button"' +
		' data-name="add" href="#">Add Condition</a></div>');

	html.push('</div>');
	html.push('</div>');

	$div.append(html.join(''));
	this.$div = $div;
	heatmap.heatmap.getColorScheme().getConditions().getConditions().forEach(
		function (c) {
			_this.add(c).appendTo($div);
		});

};

morpheus.ConditionalRenderingUI.prototype = {
	add: function (condition) {
		var _this = this;
		// shape: shapes and line
		// color: if no color cell is drawn using this shape, otherwise draw
		// shape on top of cell
		// series name
		// value >= x and <= x
		var html = [];
		html.push('<div style="border-top:1px solid LightGrey;padding-bottom:6px;padding-top:6px;"' +
			' class="morpheus-entry">');
		html.push('<form class="form-horizontal">');
		// series
		html.push('<div class="form-group">');
		html
		.push('<label class="col-xs-2">Series</label>');
		html.push('<div class="col-xs-6">');
		html
		.push('<select class="form-control morpheus-form-control-inline" name="cond_series">');
		html.push(morpheus.Util.createOptions(morpheus.DatasetUtil
		.getSeriesNames(this.heatmap.getProject().getFullDataset())));
		html.push('</select>');
		html.push('</div>');
		html.push('</div>');

		// condition
		html.push('<div class="form-group">');
		html.push('<label class="col-xs-2">Condition</label>');
		html.push('<div class="col-xs-6">');
		html
		.push('<select class="form-control morpheus-form-control-inline" name="lower"><option value="gte">&gt;=</option><option value="gt">&gt;</option></select>');
		html
		.push('<input class="form-control morpheus-form-control-inline" name="v1" size="5" type="text">');
		html.push('<span style="margin-right:1em;">and</span>');
		html
		.push('<select class="form-control morpheus-form-control-inline" name="upper"><option value="lte">&lt;=</option><option value="lt">&lt;</option></select>');
		html
		.push('<input class="form-control morpheus-form-control-inline" name="v2" size="5" type="text">');
		html.push('</div>');
		html.push('</div>');

		// shape
		html.push('<div class="form-group">');
		html.push('<label class="col-xs-2">Shape</label>');
		var shapeField = new morpheus.ShapeField(['circle', 'square',
			'diamond', 'triangle-up', 'triangle-down', 'triangle-left',
			'triangle-right']);
		html.push('<div class="col-xs-4">');
		html.push('<div style="display:inline;" data-name="shapeHolder"></div>');
		html.push('</div>');
		html.push('</div>');

		// color
		html.push('<div class="form-group">');
		html.push('<label class="col-xs-offset-2 col-xs-4"><input name="inherit_color"' +
			' type="checkbox" checked> Inherit' +
			' color</label>');
		html.push('</div>');

		html.push('<div class="form-group">');
		html.push('<label class="col-xs-2">Color</label>');
		html.push('<div class="col-xs-4">');
		html
		.push('<input class="form-control" type="color" name="color" style="display:inline;' +
			' width:6em;" disabled>');
		html.push('</div>');
		html.push('</div>');

		html.push('<div class="row"><div class="col-xs-11">');
		html
		.push('<a class="btn btn-default btn-xs" role="button" data-name="delete"' +
			' href="#">Delete Condition</a>');
		html.push('</div></div>');
		html.push('</div>'); // morpheus-entry
		var $el = $(html.join(''));
		shapeField.$el.appendTo($el.find('[data-name=shapeHolder]'));
		var $color = $el.find('[name=color]');
		var $series = $el.find('[name=cond_series]');
		var $v1 = $el.find('[name=v1]');
		var $v2 = $el.find('[name=v2]');
		var $v1Op = $el.find('[name=lower]');
		var $v2Op = $el.find('[name=upper]');
		var $inherit_color = $el.find('[name=inherit_color]');
		$color.prop('disabled', condition.inheritColor);
		$color.val(condition.color);
		$series.val(condition.series);
		shapeField.setShapeValue(condition.shape);
		if (condition.v1 != null && !isNaN(condition.v1)) {
			$v1.val(condition.v1);
		}
		if (condition.v2 != null && !isNaN(condition.v2)) {
			$v2.val(condition.v2);
		}
		$v1Op.val(condition.v1Op);
		$v2Op.val(condition.v2Op);
		function updateAccept() {
			var v1 = parseFloat($($v1).val());
			var v2 = parseFloat($($v2).val());
			var v1Op = $v1Op.val();
			var v2Op = $v2Op.val();
			condition.v1 = v1;
			condition.v2 = v2;
			condition.v1Op = v1Op;
			condition.v2Op = v2Op;
			var gtf = function () {
				return true;
			};
			var ltf = function () {
				return true;
			};
			if (!isNaN(v1)) {
				gtf = v1Op === 'gt' ? function (val) {
					return val > v1;
				} : function (val) {
					return val >= v1;
				};
			}

			if (!isNaN(v2)) {
				ltf = v2Op === 'lt' ? function (val) {
					return val < v2;
				} : function (val) {
					return val <= v2;
				};
			}
			condition.accept = function (val) {
				return gtf(val) && ltf(val);
			};
			_this.heatmap.revalidate();
		}

		$v1Op.on('change', function (e) {
			updateAccept();

		});
		$v2Op.on('change', function (e) {
			updateAccept();
		});
		$v1.on('keyup', _.debounce(function (e) {
			updateAccept();
		}, 100));
		$v2.on('keyup', _.debounce(function (e) {
			updateAccept();
		}, 100));
		$inherit_color.on('click', function (e) {
			condition.inheritColor = $(this).prop('checked');
			$color.prop('disabled', condition.inheritColor);
			_this.heatmap.revalidate();
		});
		$color.on('change', function (e) {
			condition.color = $(this).val();
			_this.heatmap.revalidate();
		});
		shapeField.on('change', function (e) {
			condition.shape = e.shape;
			_this.heatmap.revalidate();
		});
		$series.on('change', function (e) {
			condition.series = $(this).val();
			_this.heatmap.revalidate();
		});
		condition.series = $series.val();
		return $el;

	}
};

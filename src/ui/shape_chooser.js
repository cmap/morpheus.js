morpheus.ShapeChooser = function(options) {
	var formBuilder = new morpheus.FormBuilder();
	var map = options.map;
	var html = [ '<select name="valuePicker" class="selectpicker" data-live-search="true">' ];
	map.forEach(function(val, key) {
		html.push('<option');
		html.push(' value="');
		html.push(key);
		html.push('">');
		html.push(key);
		html.push('</option>');
	});
	html.push('</select>');
	formBuilder.append({
		name : 'selected_value',
		type : 'custom',
		value : html.join('')
	});

	var shapeField = new morpheus.ShapeField();

	formBuilder.append({
		col : 'col-xs-2',
		name : 'selected_shape',
		type : 'custom',
		value : '<div data-name="shape"></div>'
	});
	shapeField.$el.appendTo(formBuilder.$form.find('[data-name=shape]'));

	var $valuePicker = formBuilder.$form.find('[name=valuePicker]');
	var selectedVal = $valuePicker.val();
	var _this = this;

	shapeField.setShapeValue(map.get(selectedVal));
	shapeField.on('change', function(e) {
		map.set(selectedVal, e.shape);
		_this.trigger('change', {
			value : selectedVal,
			shape : e.shape
		});

	});
	$valuePicker.selectpicker().change(function() {
		selectedVal = $valuePicker.val();
		shapeField.setShapeValue(map.get(selectedVal));
	});
	this.$div = formBuilder.$form;
};

morpheus.ShapeChooser.prototype = {};

morpheus.Util.extend(morpheus.ShapeChooser, morpheus.Events);

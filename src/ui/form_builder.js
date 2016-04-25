morpheus.FormBuilder = function(options) {
	var that = this;
	this.prefix = _.uniqueId('form');
	this.$form = $('<form></form>');
	this.$form.attr('role', 'form').attr('id', this.prefix);
	this.vertical = options && options.vertical;
	if (!this.vertical) {
		this.titleClass = 'col-xs-12 control-label';
		this.labelClass = 'col-xs-4 control-label';
		this.$form.addClass('form-horizontal');
	} else {
		this.labelClass = 'control-label';
		this.titleClass = 'control-label';
	}
	this.$form.on('submit', function(e) {
		e.preventDefault();
	});
	this.$form.on(
			'dragover',
			function(e) {
				var node = $(e.originalEvent.srcElement).parent().parent()
						.prev();
				if (node.is('select') && node.hasClass('file-input')) {
					$(e.originalEvent.srcElement).parent().css('border',
							'1px solid black');
					e.preventDefault();
					e.stopPropagation();
				}
			}).on(
			'dragenter',
			function(e) {
				var node = $(e.originalEvent.srcElement).parent().parent()
						.prev();
				if (node.is('select') && node.hasClass('file-input')) {
					$(e.originalEvent.srcElement).parent().css('border',
							'1px solid black');
					e.preventDefault();
					e.stopPropagation();
				}
			}).on('dragleave', function(e) {
		var node = $(e.originalEvent.srcElement).parent().parent().prev();
		if (node.is('select') && node.hasClass('file-input')) {
			$(e.originalEvent.srcElement).parent().css('border', '');
			e.preventDefault();
			e.stopPropagation();
		}
	}).on('drop', function(e) {
		var node = $(e.originalEvent.srcElement).parent().parent().prev();
		if (node.is('select') && node.hasClass('file-input')) {
			var isMultiple = node.data('multiple');
			$(e.originalEvent.srcElement).parent().css('border', '');
			var name = node.attr('name');
			name = name.substring(0, name.length - '_picker'.length);
			if (e.originalEvent.dataTransfer) {
				if (e.originalEvent.dataTransfer.files.length) {
					e.preventDefault();
					e.stopPropagation();
					var files = e.originalEvent.dataTransfer.files;
					that.setValue(name, isMultiple ? files : files[0]);
					that.trigger('change', {
						name : name,
						value : files[0]
					});
				} else {
					var url = e.originalEvent.dataTransfer.getData('URL');
					e.preventDefault();
					e.stopPropagation();
					that.setValue(name, url);
					that.trigger('change', {
						name : name,
						value : url
					});
				}
			}
		}
	});
	// this.labelColumnDef = '4';
	// this.fieldColumnDef = '8';
};

morpheus.FormBuilder.showProgressBar = function(options) {
	var content = [];
	content.push('<div class="container-fluid">');
	content.push('<div class="row">');
	content.push('<div class="col-xs-8">');
	content
			.push('<div class="progress progress-striped active"><div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div>');
	content.push('</div>'); // col
	content.push('<div class="col-xs-2">');
	content
			.push('<input class="btn btn-default" type="button" name="stop" value="Cancel">');
	content.push('</div>'); // col
	content.push('</div>'); // row
	if (options.subtitle) {
		content.push('<div class="row"><div class="col-xs-8">');
		content.push('<p class="text-muted">');
		content.push(options.subtitle);
		content.push('</p>');
		content.push('</div></div>');
	}
	content.push('</div>');
	var $content = $(content.join(''));
	$content.find('[name=stop]').on('click', function(e) {
		options.stop();
		e.preventDefault();
	});
	return morpheus.FormBuilder.showInDraggableDiv({
		title : options.title,
		$content : $content
	});
};
morpheus.FormBuilder.showInDraggableDiv = function(options) {
	var width = options.width || '300px';
	var html = [];
	html
			.push('<div style="top: 100px; position:absolute; padding-left:10px; padding-right:10px; width:'
					+ width
					+ ' ; background:white; box-shadow: 0 5px 15px rgba(0,0,0,0.5); border: 1px solid rgba(0,0,0,0.2); border-radius: 6px;">');

	html
			.push('<h4 style="cursor:move; border-bottom: 1px solid #e5e5e5;" name="header">'
					+ options.title + '</h4>');
	html.push('<div name="content"></div>');
	html.push('</div>');

	var $div = $(html.join(''));
	var $content = $div.find('[name=content]');
	$div.find('[name=header]').on('dblclick', function() {
		if ($content.css('display') === 'none') {
			$content.css('display', '');
		} else {
			$content.css('display', 'none');
		}
	});

	options.$content.appendTo($content);
	$div.css('left', ($(window).width() / 2) - $content.outerWidth() / 2);
	$div.draggable({
		handle : '[name=header]',
		containment : 'document'
	});
	// $div.resizable();
	$div.appendTo($(document.body));
	return $div;
};

morpheus.FormBuilder.promptForDataset = function(cb) {
	var formBuilder = new morpheus.FormBuilder();
	formBuilder.append({
		name : 'file',
		value : '',
		type : 'file',
		required : true,
		help : morpheus.DatasetUtil.DATASET_FILE_FORMATS
	});
	var $modal;
	formBuilder.on('change', function(e) {
		var value = e.value;
		if (value !== '' && value != null) {
			$modal.modal('hide');
			$modal.remove();
			cb(value);
		}
	});
	$modal = morpheus.FormBuilder.showInModal({
		title : 'Dataset',
		html : formBuilder.$form,
		close : false
	});
};

morpheus.FormBuilder.showInModal = function(options) {
	var $div = morpheus.FormBuilder
			._showInModal({
				z : options.z,
				title : options.title,
				html : options.html,
				footer : options.close ? ('<button type="button" class="btn btn-default" data-dismiss="modal">'
						+ options.close + '</button>')
						: null,
				onClose : options.callback,
				backdrop : options.backdrop,
				size : options.size
			});
	return $div;
	// if (options.draggable) {
	// $div.draggable({
	// handle : $div.find(".modal-header")
	// });
	// }
};

morpheus.FormBuilder.showOkCancel = function(options) {
	options = $.extend({}, {
		ok : true
	}, options);
	var footer = [];
	if (options.ok) {
		footer
				.push('<button name="ok" type="button" class="btn btn-default">OK</button>');
	}
	if (options.apply) {
		footer
				.push('<button name="apply" type="button" class="btn btn-default">Apply</button>');
	}
	footer
			.push('<button name="cancel" type="button" data-dismiss="modal" class="btn btn-default">Cancel</button>');
	var $div = morpheus.FormBuilder._showInModal({
		title : options.title,
		html : options.content,
		footer : footer.join(''),
		onClose : options.hiddenCallback,
		size : options.size
	});
	// if (options.align === 'right') {
	// $div.css('left', $(window).width()
	// - $div.find('.modal-content').width() - 60);
	// }
	var $ok = $div.find('[name=ok]');
	$ok.on('click', function(e) {
		options.okCallback();
		$div.modal('hide');
	});
	if (options.focus) {
		$ok.focus();
	}

	if (options.draggable) {
		$div.draggable({
			handle : '.modal-header',
			containment : 'document'
		});
	}
	// $div.on('click', '[name=apply]', function(e) {
	// options.okCallback();
	// });
	return $div;
};

morpheus.FormBuilder.hasChanged = function(object, keyToUIElement) {
	var keys = _.keys(keyToUIElement);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = object[key];
		var $element = keyToUIElement[key];
		if (value !== morpheus.FormBuilder.getValue($element)) {
			return true;
		}
	}
	return false;
};
morpheus.FormBuilder.getValue = function($element) {
	var list = $element.data('morpheus.checkbox-list');
	if (list != null) {
		return list.val();
	}
	if ($element.attr('type') === 'radio') {
		return $element.filter(':checked').val();
	}
	if ($element.attr('type') === 'file') {
		return $element.data('files');
	}
	return $element.attr('type') === 'checkbox' ? $element.prop('checked') ? true
			: false
			: $element.val();
};

morpheus.FormBuilder._showInModal = function(options) {
	var html = [];
	options = $.extend({}, {
		size : ''
	}, options);
	html.push('<div class="modal" role="dialog" aria-hidden="false"');
	if (options.z) {
		html.push(' style="z-index: ' + options.z + ' !important;"');
	}
	html.push('>');
	html.push('<div class="modal-dialog ' + options.size + '">');
	html.push('<div class="modal-content">');
	html.push(' <div class="modal-header">');
	html
			.push('  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>');
	if (options.title != null) {
		html.push('<h4 class="modal-title">' + options.title + '</h4>');
	}
	html.push('</div>');
	html.push('<div class="modal-body">');
	html.push('</div>');
	if (options.footer) {
		html.push('<div class="modal-footer">');
		html.push(options.footer);
	}
	html.push('</div>');
	html.push('</div>');
	html.push('</div>');
	html.push('</div>');
	var $div = $(html.join(''));
	$div.on('mousewheel', function(e) {
		e.stopPropagation();
	});
	$div.find('.modal-body').html(options.html);
	$div.prependTo($(document.body));
	$div.modal({
		backdrop : options.backdrop === true ? true : false,
	}).on('hidden.bs.modal', function(e) {
		$div.remove();
		if (options.onClose) {
			options.onClose();
		}
	});
	return $div;
};
// morpheus.FormBuilder._showInModal = function(title, stuff, footer,
// hiddenCallback) {
// var html = [];
// var id = _.uniqueId('dialog');
// html.push('<div id="' + id + '">');
// $(document.body).prepend(html.join(''));
// $('#' + id).html(stuff);
// $('#' + id).dialog({
// modal : true,
// resizable : true,
// height : 'auto',
// width : 400
// }).on('close', function(e) {
// $(this).dialog('destroy');
// $(this).remove();
// if (hiddenCallback) {
// hiddenCallback();
// }
// });
// return id;
// };
morpheus.FormBuilder.prototype = {
	appendContent : function($content) {
		this.$form.append($content);
	},
	addSeparator : function() {
		var html = [];
		html.push('<div class="form-group">');
		if (!this.vertical) {
			html.push('<div class="col-xs-12">');
		}
		html.push('<hr />');
		if (!this.vertical) {
			html.push('</div>');
		}
		html.push('</div>');
		this.$form.append(html.join(''));
	},
	_append : function(html, field, isFieldStart) {
		var that = this;
		var required = field.required;
		var name = field.name;
		var type = field.type;
		if (type == 'separator') {
			html.push(this.vertical ? '<div class="form-group"></div>'
					: '<div class="col-xs-12">');
			html.push('<hr />');
			html.push('</div>');
			return;
		}
		var title = field.title;
		var disabled = field.disabled;
		var help = field.help;
		var value = field.value;
		var showLabel = field.showLabel;
		var col = '';
		var labelColumn = '';
		if (!this.vertical) {
			col = field.col || 'col-xs-8';
		}
		if (showLabel === undefined) {
			showLabel = 'checkbox' !== type && 'button' !== type
					&& 'radio' !== type;
			showLabel = showLabel || field.options !== undefined;
		}
		var id = that.prefix + '_' + name;
		if (title === undefined) {
			title = name.replace(/_/g, ' ');
			title = title[0].toUpperCase() + title.substring(1);
		}
		if (showLabel) {
			html.push('<label for="' + id + '" class="' + this.labelClass
					+ '">');
			html.push(title);
			html.push('</label>');
			if (isFieldStart) {
				html.push('<div class="' + col + '">');
			}
		} else if (isFieldStart && !this.vertical) {
			html.push('<div class="col-xs-offset-4 ' + col + '">');
		}
		if ('radio' === type) {
			if (field.options) {
				_.each(field.options,
						function(choice) {
							var isChoiceObject = _.isObject(choice)
									&& choice.value !== undefined;
							var optionValue = isChoiceObject ? choice.value
									: choice;
							var optionText = isChoiceObject ? choice.name
									: choice;
							var selected = value === optionValue;
							html.push('<div class="radio"><label>');
							html.push('<input value="' + optionValue
									+ '" name="' + field.name
									+ '" type="radio"');
							if (selected) {
								html.push(' checked');
							}
							html.push('> ');
							if (choice.icon) {
								html.push('<span class="' + choice.icon
										+ '"></span> ');
							}
							optionText = optionText[0].toUpperCase()
									+ optionText.substring(1);
							html.push(optionText);
							html.push('</label></div>');
						});
			} else {
				html.push('<div class="radio"><label>');
				html.push('<input value="' + value + '" name="' + name
						+ '" id="' + id + '" type="radio"');
				if (field.checked) {
					html.push(' checked');
				}
				html.push('> ');
				html.push(value[0].toUpperCase() + value.substring(1));
				html.push('</label></div>');
			}
		} else if ('checkbox' === type) {
			html.push('<div class="checkbox"><label>');
			html.push('<input name="' + name + '" id="' + id
					+ '" type="checkbox"');
			if (value) {
				html.push(' checked');
			}
			html.push('> ');
			html.push(title);
			html.push('</label></div>');
		} else if ('checkbox-list' === type) {
			html.push('<div name="' + name + '" class="checkbox-list"><div>');
		} else if ('select' == type || type == 'bootstrap-select') {
			// if (field.multiple) {
			// field.type = 'bootstrap-select';
			// type = 'bootstrap-select';
			// }
			if (type == 'bootstrap-select') {
				html.push('<select data-selected-text-format="count" name="'
						+ name + '" id="' + id
						+ '" class="selectpicker form-control"');
			} else {
				html.push('<select name="' + name + '" id="' + id
						+ '" class="form-control"');
			}
			if (disabled) {
				html.push(' disabled');
			}
			if (field.multiple) {
				html.push(' multiple');
			}
			html.push('>');
			_.each(field.options, function(choice) {
				if (choice && choice.divider) {
					html.push('<option data-divider="true"></option>');
				} else {
					html.push('<option value="');
					var isChoiceObject = _.isObject(choice)
							&& choice.value !== undefined;
					var optionValue = isChoiceObject ? choice.value : choice;
					var optionText = isChoiceObject ? choice.name : choice;
					html.push(optionValue);
					html.push('"');
					var selected = false;
					if (_.isObject(value)) {
						selected = value[optionValue];
					} else {
						selected = value == optionValue;
					}
					if (selected) {
						html.push(' selected');
					}
					html.push('>');
					html.push(optionText);
					html.push('</option>');
				}
			});
			html.push('</select>');
			if (field.type == 'bootstrap-select' && field.toggle) {
				html.push('<p class="help-block"><a name="' + name
						+ '_all" href="#">All</a>&nbsp;|&nbsp;<a name="' + name
						+ '_none" href="#">None</a></p>');
				that.$form.on('click', '[name=' + name + '_all]',
						function(evt) {
							evt.preventDefault();
							var $select = that.$form
									.find('[name=' + name + ']');
							$select.selectpicker('val', $.map($select
									.find('option'), function(o) {
								return $(o).val();
							}));
							$select.trigger('change');
						});
				that.$form.on('click', '[name=' + name + '_none]',
						function(evt) {
							evt.preventDefault();
							var $select = that.$form
									.find('[name=' + name + ']');
							$select.selectpicker('val', []);
							$select.trigger('change');
						});
			}
		} else if ('textarea' == type) {
			html.push('<textarea id="' + id + '" class="form-control" name="'
					+ name + '"');
			if (required) {
				html.push(' required');
			}
			if (field.placeholder) {
				html.push(' placeholder="' + field.placeholder + '"');
			}
			if (disabled) {
				html.push(' disabled');
			}
			html.push('>');
			if (value != null) {
				html.push(value);
			}
			html.push('</textarea>');
		} else if ('button' == type) {
			html.push('<button id="' + id + '" name="' + name
					+ '" type="button" class="btn btn-default btn-sm">');
			if (field.icon) {
				html.push('<span class="' + field.icon + '"></span> ');
			}
			html.push(value ? value : title);
			html.push('</button>');
		} else if ('custom' === type) {
			html.push(value);
		} else if ('file' === type) {
			var isMultiple = field.multiple;
			html
					.push('<select data-multiple="'
							+ isMultiple
							+ '" type="file" title="'
							+ (field.placeholder || (isMultiple ? 'Choose one or more files...'
									: 'Choose a file...'))
							+ '" name="'
							+ name
							+ '_picker" data-width="35%" class="file-input selectpicker form-control">');
			var npre = 1;
			var options = [];

			if (field.options) {
				options = options.concat(field.options);
				npre = 1 + field.options.length;
			}
			// data types are file, dropbox, url, and predefined
			options.push('My Computer');
			options.push('URL');
			if (typeof Dropbox !== 'undefined') {
				options.push('Dropbox');
			}
			_.each(options, function(choice, index) {
				var isChoiceObject = _.isObject(choice)
						&& choice.value !== undefined;
				var optionValue = isChoiceObject ? choice.value : choice;
				var optionText = isChoiceObject ? choice.name : choice;
				html.push('<option value="');
				html.push(optionValue);
				html.push('"');
				if (isChoiceObject && choice.disabled) {
					html.push(' disabled');
				}
				if (optionValue === 'Dropbox') {
					html.push(' data-icon="fa fa-dropbox"');
				} else if (optionValue === 'My Computer') {
					html.push(' data-icon="fa fa-desktop"');
				} else if (optionValue === 'URL') {
					html.push(' data-icon="fa fa-external-link"');
				} else if (index > 0) {
					html.push(' data-icon="fa fa-star"');
				}
				html.push('>');
				html.push(optionText);
				html.push('</option>');
			});
			html.push('</select>');
			if (field.url !== false) {
				html.push('<div>');
				html
						.push('<input placeholder="'
								+ (isMultiple ? 'Enter one or more URLs'
										: 'Enter a URL')
								+ '" class="form-control" style="width:50%; display:none;" type="text" name="'
								+ name + '_text">');
				html.push('</div>');
			}
			html.push('<input style="display:none;" type="file" name="' + name
					+ '_file"' + (isMultiple ? ' multiple' : '') + '>');
			// browse button clicked
			// select change
			that.$form
					.on(
							'change',
							'[name=' + name + '_picker]',
							function(evt) {
								var $this = $(this);
								var val = $this.val();

								var showTextInput = val === 'URL';
								if ('Dropbox' === val) {
									var options = {
										success : function(results) {
											var val = !isMultiple ? results[0].link
													: results.map(function(
															result) {
														return result.link;
													});
											that.setValue(name, val);
											that.trigger('change', {
												name : name,
												value : val
											});
										},
										linkType : 'direct',
										multiselect : isMultiple
									};
									Dropbox.choose(options);
								} else if ('My Computer' === val) {
									that.$form.find('[name=' + name + '_file]')
											.click();
								}
								that.$form.find('[name=' + name + '_text]')
										.css('display',
												showTextInput ? '' : 'none');
							});
			// URL
			that.$form.on('keyup', '[name=' + name + '_text]', function(evt) {
				var text = $.trim($(this).val());
				that.setValue(name, text);
				if (evt.which === 13) {
					that.trigger('change', {
						name : name,
						value : text
					});
				}
			});
			// browse file selected
			that.$form.on('change', '[name=' + name + '_file]', function(evt) {
				var files = evt.target.files; // FileList object
				that.setValue(name, isMultiple ? files : files[0]);
				that.trigger('change', {
					name : name,
					value : files[0]
				});
			});
		} else {
			type = type == null ? 'text' : type;
			if (type === 'div') {
				html.push('<div name="' + name + '" id="' + id + '"');
			} else {
				html.push('<input type="' + type
						+ '" class="form-control" name="' + name + '" id="'
						+ id + '"');
			}
			if (value != null) {
				html.push(' value="' + value + '"');
			}
			if (field.placeholder) {
				html.push(' placeholder="' + field.placeholder + '"');
			}
			if (required) {
				html.push(' required');
			}
			if (disabled) {
				html.push(' disabled');
			}
			html.push('>');
			if (type === 'div') {
				html.push('</div>');
			}
		}
		if (help !== undefined) {
			html.push('<span name="' + name + '_help" class="help-block">');
			html.push(help);
			html.push('</span>');
		}
	},
	append : function(fields) {
		var html = [];
		var that = this;
		var isArray = morpheus.Util.isArray(fields);
		if (!isArray) {
			fields = [ fields ];
		}
		html.push('<div class="form-group">');
		_.each(fields, function(field, index) {
			that._append(html, field, index === 0);
		});
		html.push('</div>');
		html.push('</div>');
		var $div = $(html.join(''));
		this.$form.append($div);
		var checkBoxLists = $div.find('.checkbox-list');
		if (checkBoxLists.length > 0) {
			var checkBoxIndex = 0;
			_.each(fields, function(field) {
				// needs to already be in dom
				if (field.type === 'checkbox-list') {
					var list = new morpheus.CheckBoxList({
						responsive : false,
						$el : $(checkBoxLists[checkBoxIndex]),
						items : field.options
					});

					$(checkBoxLists[checkBoxIndex]).data(
							'morpheus.checkbox-list', list);
					checkBoxIndex++;
				}
			});
		}
		$div.find('.selectpicker').selectpicker({
			iconBase : 'fa',
			tickIcon : 'fa-check',
			style : 'btn-default btn-sm'
		});
	},
	clear : function() {
		this.$form.empty();
	},
	getValue : function(name) {
		var $v = this.$form.find('[name=' + name + ']');
		if ($v.length === 0) {
			$v = this.$form.find('[name=' + name + '_picker]');
		}
		return morpheus.FormBuilder.getValue($v);
	},
	setOptions : function(name, options, selectFirst) {
		var $select = this.$form.find('[name=' + name + ']');
		var checkBoxList = $select.data('morpheus.checkbox-list');
		if (checkBoxList) {
			checkBoxList.setItems(options);
		} else {
			var html = [];
			var selection = $select.val();
			_.each(options, function(choice) {
				html.push('<option value="');
				var isChoiceObject = _.isObject(choice)
						&& choice.value !== undefined;
				var optionValue = isChoiceObject ? choice.value : choice;
				var optionText = isChoiceObject ? choice.name : choice;
				html.push(optionValue);
				html.push('"');

				html.push('>');
				html.push(optionText);
				html.push('</option>');
			});
			$select.html(html.join(''));
			$select.val(selection);
			if (selectFirst && $select.val() == null) {
				if ($select[0].options.length > 0) {
					$select.val($select[0].options[0].value);
				}

			}
			if ($select.hasClass('selectpicker')) {
				$select.selectpicker('refresh');
				$select.selectpicker('render');
			}
		}
	},
	find : function(name) {
		return this.$form.find('[name=' + name + ']');
	},
	setHelpText : function(name, value) {
		var v = this.$form.find('[name=' + name + '_help]');
		v.html(value);
	},
	setValue : function(name, value) {
		var v = this.$form.find('[name=' + name + ']');
		if (v.length === 0) {
			v = this.$form.find('[name=' + name + '_picker]');
			if (v.attr('type') === 'file') {
				v.val(value);
				v.selectpicker('render');
				return v.data('files', value);
			}
		}
		var type = v.attr('type');
		var list = v.data('morpheus.checkbox-list');
		if (list) {
			list.setValue(value);
		} else {
			if (type === 'radio') {
				v.filter('[value=' + value + ']').prop('checked', true);
			} else if (type === 'checkbox') {
				v.prop('checked', value);
			} else {
				v.val(value);
			}
			if (v.hasClass('selectpicker')) {
				v.selectpicker('render');
			}
		}

	},
	setVisible : function(name, visible) {
		var $div = this.$form.find('[name=' + name + ']')
				.parents('.form-group');
		if (visible) {
			$div.show();
		} else {
			$div.hide();
		}
	},
	remove : function(name) {
		var $div = this.$form.find('[name=' + name + ']')
				.parents('.form-group');
		$div.remove();
	},
	setEnabled : function(name, enabled) {
		var $div = this.$form.find('[name=' + name + ']');
		$div.attr('disabled', !enabled);
		if (!enabled) {
			$div.parents('.form-group').find('label').addClass('text-muted');
		} else {
			$div.parents('.form-group').find('label').removeClass('text-muted');
		}
	}
};
morpheus.Util.extend(morpheus.FormBuilder, morpheus.Events);
morpheus.LandingPage = function (pageOptions) {
	pageOptions = $.extend({}, {
		el: $('#vis')
	}, pageOptions);
	this.pageOptions = pageOptions;
	var _this = this;

	var $el = $('<div class="container" style="display: none;"></div>');
	this.$el = $el;
	var html = [];
	html.push('<div data-name="help" class="pull-right"></div>');

	html
	.push('<div style="margin-bottom:10px;"><svg width="32px" height="32px"><g><rect x="0" y="0" width="32" height="14" style="fill:#ca0020;stroke:none"/><rect x="0" y="18" width="32" height="14" style="fill:#0571b0;stroke:none"/></g></svg> <div data-name="brand" style="display:inline-block; vertical-align: top;font-size:24px;font-family:Roboto,sans-serif;">');
	html.push('<span>M</span>');
	html.push('<span>o</span>');
	html.push('<span>r</span>');
	html.push('<span>p</span>');
	html.push('<span>h</span>');
	html.push('<span>e</span>');
	html.push('<span>u</span>');
	html.push('<span>s</span>');
	html.push('</span>');
	html.push('</div>');

	html.push('<h4>Open your own file</h4>');
	html.push('<div data-name="formRow" class="center-block"></div>');
	html.push('<h4>Or select a preloaded dataset</h4>');
	html.push('<div data-name="exampleRow"></div>');
	html.push('</div>');
	var $html = $(html.join(''));
	var colorScale = d3.scale.linear().domain([0, 4, 7]).range(['#ca0020', '#999999', '#0571b0']).clamp(true);
	var brands = $html.find('[data-name="brand"] > span');

	$html.appendTo($el);

	new morpheus.HelpMenu().$el.appendTo($el.find('[data-name=help]'));
	var formBuilder = new morpheus.FormBuilder();
	formBuilder.append({
		name: 'file',
		showLabel: false,
		value: '',
		type: 'file',
		required: true,
		help: morpheus.DatasetUtil.DATASET_FILE_FORMATS
	});
	formBuilder.$form.appendTo($el.find('[data-name=formRow]'));
	this.formBuilder = formBuilder;
	this.$sampleDatasetsEl = $el.find('[data-name=exampleRow]');
	var index = 0;
	var step = function () {
		brands[index].style.color = colorScale(index);
		index++;
		if (index < brands.length) {
			setTimeout(step, 200);
		}
	}
	setTimeout(step, 300);

	// for (var i = 0; i < brands.length; i++) {
	// 	brands[i].style.color = colorScale(i);
	// }
};

morpheus.LandingPage.prototype = {
	dispose: function () {
		this.formBuilder.setValue('file', '');
		this.$el.hide();
		$(window)
		.off(
			'paste.morpheus drop.morpheus dragover.morpheus dragenter.morpheus beforeunload.morpheus');
		$(window).on('beforeunload.morpheus', function () {
			return 'Are you sure you want to close Morpheus?';
		});
		this.formBuilder.off('change');
	},
	show: function () {
		var _this = this;
		if (!this.sampleDatasets) {
			this.sampleDatasets = new morpheus.SampleDatasets({
				$el: this.$sampleDatasetsEl,
				callback: function (heatMapOptions) {
					_this.open(heatMapOptions);
				}
			});
		}

		this.$el.show();

		this.formBuilder.on('change', function (e) {
			var value = e.value;
			if (value !== '' && value != null) {
				_this.openFile(value);
			}
		});
		$(window).on('paste.morpheus', function (e) {
			var tagName = e.target.tagName;
			if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
				return;
			}

			var text = e.originalEvent.clipboardData.getData('text/plain');
			if (text != null && text.length > 0) {
				var blob = new Blob([text]);
				var url = window.URL.createObjectURL(blob);
				e.preventDefault();
				e.stopPropagation();
				_this.openFile(url);
			}

		}).on('dragover.morpheus dragenter.morpheus', function (e) {
			e.preventDefault();
			e.stopPropagation();
		}).on(
			'drop.morpheus',
			function (e) {
				if (e.originalEvent.dataTransfer
					&& e.originalEvent.dataTransfer.files.length) {
					e.preventDefault();
					e.stopPropagation();
					var files = e.originalEvent.dataTransfer.files;
					_this.openFile(files[0]);
				} else if (e.originalEvent.dataTransfer) {
					var url = e.originalEvent.dataTransfer.getData('URL');
					e.preventDefault();
					e.stopPropagation();
					_this.openFile(url);
				}
			});
	},
	open: function (openOptions) {
		this.dispose();
		var heatmap;
		var optionsArray = _.isArray(openOptions) ? openOptions : [openOptions];
		var _this = this;
		optionsArray.forEach(function (options) {
			if (_this.heatmap == null) { // first tab
				options.landingPage = _this;
				options.el = _this.pageOptions.el;

			} else { // more tabs
				options.focus = false;
				options.inheritFromParent = false;
				options.parent = _this.heatmap;
			}
			heatmap = new morpheus.HeatMap(options);
			if (_this.heatmap == null) {
				_this.heatmap = heatmap;
			}
		});

	},
	openFile: function (value) {
		var _this = this;
		var options = {
			dataset: value
		};
		var fileName = morpheus.Util.getFileName(value);
		morpheus.OpenDatasetTool.fileExtensionPrompt(fileName, function (readOptions) {
			if (readOptions) {
				var dataset = options.dataset;
				options.dataset = {
					file: dataset,
					options: {}
				};
				for (var key in readOptions) {
					options.dataset.options[key] = readOptions[key];
				}
			}
			_this.open(options);
		});

	}
};

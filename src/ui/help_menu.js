morpheus.HelpMenu = function () {
	var html = [];
	html.push('<div class="btn-group">');
	html.push('<button type="button" class="btn btn-default btn-xxs' +
		' dropdown-toggle"' +
		' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">');
	html.push('<svg width="14px" height="14px" style="inline-block;vertical-align:middle;"><g><rect x="0" y="0" width="14" height="6" style="fill:#ca0020;stroke:none"></rect><rect x="0" y="7" width="14" height="6" style="fill:#0571b0;stroke:none"></rect></g></svg>');
	html.push(' <span class="fa fa-caret-down"></span>');
	html.push('</button>');
	html
	.push('<ul class="dropdown-menu dropdown-menu-right" role="menu">');
	html.push('<li><a data-name="contact" href="#">Contact</a></li>');

	html.push('<li><a data-name="linking" href="#">Linking</a></li>');
	html.push('<li><a data-name="tutorial" href="#">Tutorial</a></li>');
	html.push('<li><a data-name="source" href="#">Source Code</a></li>');
	html.push('<li role="presentation" class="divider"></li>');
	html.push('<li><a data-name="keymap" href="#">Keymap Reference</a></li>');

	html.push('</ul>');
	html.push('</div>');
	this.$el = $(html.join(''));

	this.$el.find('[data-name=contact]').on('click', function (e) {
		morpheus.FormBuilder.showInModal({
			title: 'Contact',
			html: 'Please email us at morpheus@broadinstitute.org'
		});
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'contact'
		});
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	});
	this.$el.find('[data-name=tutorial]').on('click', function (e) {
		window.open(morpheus.Util.URL + 'tutorial.html');
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'tutorial'
		});
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

	});

	this.$el.find('[data-name=linking]').on('click', function (e) {
		window.open(morpheus.Util.URL + 'linking.html');
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'linking'
		});
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	});
	this.$el.find('[data-name=source]').on('click', function (e) {
		window.open('https://github.com/cmap/morpheus.js');
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'source'
		});
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	});
	this.$el.find('[data-name=keymap]').on('click', function (e) {
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'keymap_reference'
		});
		new morpheus.HeatMapKeyListener({
			$tabPanel: $()
		}).showKeyMapReference();
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	});
};

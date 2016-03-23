morpheus.HelpMenu = function() {
	var html = [];
	html.push('<div style="margin-left:2px;" class="btn-group">');
	html
			.push('<span style="color:#ca0020;" data-toggle="dropdown" class="fa fa-lg fa-border fa-question-circle"></span>');
	html
			.push('<ul name="info" class="dropdown-menu dropdown-menu-right" role="menu">');
	html.push('<li><a name="contact" href="#">Contact</a></li>');
	// <li role="presentation" class="divider"></li>

	html.push('<li><a name="linking" href="#">Linking</a></li>');
	html.push('<li><a name="tutorial" href="#">Tutorial</a></li>');

	html.push('</ul>');
	html.push('</div>');
	this.$el = $(html.join(''));
	this.$el.find('button').on('click', function(e) {
		e.stopImmediatePropagation();
	});
	this.$el.find('[name=contact]').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		window.open('mailto:morpheus@broadinstitute.org');
	});
	this.$el.find('[name=tutorial]').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		window.open(morpheus.Util.URL + 'tutorial.html');

	});

	this.$el.find('[name=linking]').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		window.open(morpheus.Util.URL + 'linking.html');
	});
	this.$el.find('[name=source]').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		window.open('https://github.com/joshua-gould/morpheus.js');
	});
};
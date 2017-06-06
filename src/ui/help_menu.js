morpheus.HelpMenu = function () {
  var html = [];
  html
  .push('<ul class="morpheus-footer-links">');
  html.push('<li><a data-name="contact" href="#">Contact</a></li>');
  html.push('<li><a data-name="configuration" href="#">Configuration</a></li>');
  html.push('<li><a data-name="tutorial" href="#">Tutorial</a></li>');
  html.push('<li><a data-name="source" href="#">Source Code</a></li>');
  html.push('</ul>');
  html.push('<p>Created and developed by Joshua Gould</p>');
  this.$el = $(html.join(''));
  this.$el.find('[data-name=contact]').on('click', function (e) {
    morpheus.FormBuilder.showInModal({
      title: 'Contact',
      html: 'Please email us at morpheus@broadinstitute.org',
      focus: document.activeElement
    });
    e.preventDefault();

  });
  this.$el.find('[data-name=tutorial]').on('click', function (e) {
    window
    .open('https://clue.io/morpheus/tutorial.html');
    e.preventDefault();

  });

  this.$el.find('[data-name=configuration]').on('click', function (e) {
    window
    .open('https://clue.io/morpheus/configuration.html');
    e.preventDefault();

  });
  this.$el.find('[data-name=source]').on('click', function (e) {
    window.open('https://github.com/cmap/morpheus.js');
    e.preventDefault();

  });

};

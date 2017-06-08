morpheus.HelpMenu = function () {
  var html = [];
  html.push('<ul class="morpheus-footer-links">');
  html.push('<li><a data-name="contact" href="#">Contact</a></li>');
  html.push(
    '<li><a target="_blank" href="configuration.html">Configuration</a></li>');
  html.push('<li><a target="_blank" href="tutorial.html">Tutorial</a></li>');
  html.push(
    '<li><a target="_blank" href="https://github.com/cmap/morpheus.js">Source Code</a></li>');
  html.push(
    '<li><a target="_blank" href="https://github.com/cmap/morpheus.R">R Interface</a></li>');

  html.push('</ul>');
  this.$el = $(html.join(''));
  this.$el.find('[data-name=contact]').on('click', function (e) {
    morpheus.FormBuilder.showInModal({
      title: 'Contact',
      html: 'Please email us at morpheus@broadinstitute.org',
      focus: document.activeElement,
    });
    e.preventDefault();

  });

};

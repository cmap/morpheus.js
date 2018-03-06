morpheus.HelpMenu = function () {
  var html = [];
  html.push('<ul class="morpheus-footer-links">');
  // html.push('<li><a href="index.html">Home</a></li>');
  html.push('<li><a data-name="contact" href="#">Contact</a></li>');
  html.push('<li><a target="_blank" href="documentation.html">Documentation</a></li>');
  html.push('<li><a target="_blank" href="tutorial.html">Tutorial</a></li>');
  html.push(
    '<li><a href="configuration.html">Configuration</a></li>');

  html.push('<li><a target="_blank" href="app.html">App</a></li>');


  html.push(
    '<li><a target="_blank" href="https://github.com/cmap/morpheus.R">R Interface</a></li>');
  html.push('<li><a target="_blank" href="https://github.com/cmap/morpheus-export">Command Line</a></li>');
  html.push(
    '<li><a target="_blank" href="https://github.com/cmap/morpheus.js">Source Code</a></li>');
  html.push('</ul>');
  this.$el = $(html.join(''));
  this.$el.find('[data-name=contact]').on('click', function (e) {
    morpheus.FormBuilder.showInModal({
      title: 'Contact',
      html: 'Please email us at morpheus@broadinstitute.org',
      focus: document.activeElement
    });
    e.preventDefault();
  });

};

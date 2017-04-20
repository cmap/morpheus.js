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

};

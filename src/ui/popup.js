morpheus.Popup = {};
morpheus.Popup.initted = false;
morpheus.Popup.init = function () {
  if (morpheus.Popup.initted) {
    return;
  }

  morpheus.Popup.initted = true;
  morpheus.Popup.$popupDiv = $(document.createElement('div'));
  morpheus.Popup.$popupDiv.css('position', 'absolute').css('zIndex', 1050).css('overflow', 'auto').addClass('dropdown clearfix');
  morpheus.Popup.$contextMenu = $(document.createElement('ul'));
  morpheus.Popup.$contextMenu.addClass('dropdown-menu').css('display',
    'block').css('position', 'static').css('margin-bottom', '5px');
  morpheus.Popup.$contextMenu.appendTo(morpheus.Popup.$popupDiv);
  morpheus.Popup.$contextMenu.on('click', 'a', function (e) {
    e.preventDefault();
    var $this = $(this);
    // if (!$this.hasClass('copy')) {
    morpheus.Popup.popupCallback(e, $this.data('name'));
    morpheus.Popup.hide();
    // }

  });
};

morpheus.Popup.popupInDom = false;
morpheus.Popup.hidePopupMenu = function (e) {
  if (morpheus.Popup.component == e.target) {
    e.preventDefault();
    e.stopPropagation();
  }
  morpheus.Popup.hide();
};
morpheus.Popup.hide = function () {
  morpheus.Popup.$popupDiv.hide();
  $(document.body).off('mousedown', morpheus.Popup.hidePopupMenu);
  morpheus.Popup.popupCallback = null;
  morpheus.Popup.component = null;
};

morpheus.Popup.showPopup = function (menuItems, position, component, callback) {
  morpheus.Popup.init();
  if (morpheus.Popup.component == component) {
    morpheus.Popup.hide();
    return;
  }
  morpheus.Popup.popupCallback = callback;
  morpheus.Popup.component = component;
  var html = [];
  for (var i = 0, length = menuItems.length; i < length; i++) {
    var item = menuItems[i];
    if (item.header) {
      html.push('<li role="presentation" class="dropdown-header">'
        + item.name + '</li>');
    } else if (item.separator) {
      html.push('<li class="divider"></li>');
    } else {
      html.push('<li role="presentation"');
      if (item.disabled) {
        html.push('class="disabled"');
      }
      html.push('><a data-name="' + item.name
        + '" data-type="popup-item" tabindex="-1" href="#"');
      if (item.class) {
        html.push(' class="' + item.class + '"');
      }
      html.push('>');
      if (item.checked) {
        html
          .push('<span class="dropdown-checkbox fa fa-check"></span>');
      }

      html.push(item.name);
      if (item.icon) {
        html.push('<span class="pull-right ' + item.icon + '"></span>');
      }
      html.push('</a>');

      html.push('</li>');
    }
  }
  morpheus.Popup.$contextMenu.html(html.join(''));
  if (!morpheus.Popup.popupInDom) {
    morpheus.Popup.popupInDom = true;
    morpheus.Popup.$popupDiv.appendTo($(document.body));
  }
  var $body = $(document.body);
  var $window = $(window);
  var windowWidth = $window.width();
  var windowHeight = $window.height();
  var popupWidth = morpheus.Popup.$popupDiv.width();
  var popupHeight = morpheus.Popup.$popupDiv.height();
  var left = position.x;
  var top = position.y;
  // default is bottom-right
  if ((left + popupWidth) >= windowWidth) { // offscreen right
    left -= popupWidth;
    left = Math.max(4, left);
  }
  if ((top + popupHeight) >= (windowHeight)) { // offscreen bottom
    top -= popupHeight;
    top = Math.max(4, top);
  }

  morpheus.Popup.$popupDiv.css({
    height: popupHeight + 'px',
    display: 'block',
    left: left,
    top: top
  });

  morpheus.Popup.$popupDiv.show();

  $body.off('mousedown', morpheus.Popup.hidePopupMenu);
  window.setTimeout(function () {
    $body.on('mousedown', function (e) {
      var $target = $(e.target);
      if ($target[0] !== morpheus.Popup.$popupDiv[0] && $target.data('type') !== 'popup-item') {
        morpheus.Popup.hidePopupMenu(e);
      }
    });
  }, 1);
};

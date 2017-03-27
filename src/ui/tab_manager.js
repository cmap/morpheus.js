/**
 * @param options.autohideTabBar
 *            Whether to autohide the tab bar when only 1 tab showing
 * @param options.landingPage Landing page to show when all tabs are closed
 */
morpheus.TabManager = function (options) {
  this.options = $.extend({}, {
    autohideTabBar: false,
    rename: true
  }, options);
  var _this = this;
  this.activeTabObject = null;
  this.activeTabId = null;
  this.idToTabObject = new morpheus.Map();
  this.$nav = $('<ul class="nav nav-tabs compact morpheus-nav"></ul>');
  this.$nav.sortable({
    containment: 'parent',
    axis: 'x',
    helper: 'clone',
    cancel: 'li:not(.morpheus-sortable)',
    items: 'li.morpheus-sortable'
  });
  this.$nav.sortable('disable');
  this.$nav.on('click', 'li > a', function (e) {
    var tabId = $(this).data('link');
    if (tabId != null) {
      e.preventDefault();
      if (_this.activeTabId !== tabId) {
        $(this).tab('show');
      }
    }
  });
  if (this.options.autohideTabBar) {
    this.$nav.css('display', 'none');
  }
  if (options.dropTab) {
    var html = [];
    html.push('<li class="morpheus-tab-addon dropdown pull-right tabdrop">');
    html.push('<div class="btn-group">');
    html.push('<button type="button" class="morpheus-drop-tab-toggle btn btn-link' +
      ' dropdown-toggle"' +
      ' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">');
    html.push(' <span class="fa fa-angle-double-down"></span>');
    html.push('</button>');
    html
    .push('<ul class="dropdown-menu dropdown-menu-right" role="menu">');
    html.push('</ul>');
    html.push('</div>');
    html.push('</li>');
    var $tabDrop = $(html.join(''));
    // $tabDrop.css('display', 'none');
    var $tabDropMenu = $tabDrop.find('.dropdown-menu');
    $tabDrop.appendTo(this.$nav);
    var updateDropTab = function () {
      var totalWith = _this.$nav.width() - 17; // 17=width of dropdown
      var sum = 0;
      var tabDropItems = [];
      _this.$nav.find('> li').each(function () {
        var $li = $(this);
        var $a = $li.find('a');
        if (!$li.hasClass('morpheus-tab-addon')) {
          var title = $a.contents().first().text();
          var isActive = $li.hasClass('active');
          var href = $a.attr('href');
          tabDropItems.push('<li class="' + (isActive ? 'active' : '') + '"><a data-link="' + href.substring(1) + '" data-toggle="tab"' +
            ' href="' + href + '">' + title + '</a></li>');
          sum += $li.outerWidth();
          if (sum >= totalWith) {
            $li.css('display', 'none');
          } else {
            $li.css('display', '');
          }
        }
      });
      $tabDrop.css('display', tabDropItems.length > 0 ? '' : 'none');
      $tabDropMenu.html(tabDropItems.join(''));
    };
    $tabDrop.css('display', 'none');
    this.$nav.on('sortstop', function (event, ui) {
      updateDropTab();
    });
    $(window).on('resize', updateDropTab);
    this.$nav.on('remove', function () {
      $(window).off('resize', updateDropTab);
    });
    this.on('add remove rename reorder change', function () {
      updateDropTab();

    });
  }
  function rename($a) {
    var builder = new morpheus.FormBuilder();
    builder.append({
      name: 'name',
      type: 'text',
      value: $.trim($a.contents().first().text())
    });
    morpheus.FormBuilder.showOkCancel({
      title: 'Rename Tab',
      content: builder.$form,
      okCallback: function () {
        var name = $.trim(builder.getValue('name'));
        if (name !== '') {
          if (_this.activeTabObject != null && _this.activeTabObject.setName) {
            _this.activeTabObject.setName(name);
          }
          $a.contents().first().replaceWith(name + '&nbsp;');
          _this.trigger('rename');
        }
      }
    });
    // edit tab name
  }

  // rename

  this.$nav.on('dblclick', 'li > a', function (e) {
    e.preventDefault();
    if ($(this).data('morpheus-rename') && _this.options.rename) {
      rename($(this));
    }

  });
  this.$nav.on('contextmenu.morpheus', 'li > a', function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    var $a = $(this);
    var $li = $a.parent('li');
    if ($li.hasClass('morpheus-tab-addon')) {
      return;
    }
    var menuItems = [];
    if ($a.data('morpheus-rename') && _this.options.rename) {
      menuItems.push({name: 'Rename'});
    }
    if ($a.data('morpheus-pin')) { // pinned
      menuItems.push({name: 'Unpin tab'});
    } else {
      menuItems.push({name: 'Pin tab'});
    }

    if (menuItems.length > 0) {
      morpheus.Popup.showPopup(menuItems, {
        x: e.pageX,
        y: e.pageY
      }, e.target, function (event, item) {
        if (item === 'Rename') {
          rename($a);
        } else if (item === 'Pin tab') {
          $a.data('morpheus-pin', true);
          $li.removeClass('morpheus-sortable');
          $li.detach();
          _this.$nav.prepend($li);
          $a.find('.close').hide();    // hide close button
          _this.$nav.sortable('option', 'items', 'li.morpheus-sortable');
          _this.$nav.sortable('refresh');

        } else if (item === 'Unpin tab') {
          $a.data('morpheus-pin', false);
          $li.addClass('morpheus-sortable');
          $a.find('.close').show(); // show close button
          _this.$nav.sortable('option', 'items', 'li.morpheus-sortable');
          _this.$nav.sortable('refresh');

        }
      });
    }
    return false;

  });

  this.$nav.on('click', 'button', function (e) { // close a tab
    // remove the link and tab content
    e.preventDefault();
    var target = $(this).attr('data-target');

    if (target != null) {
      target = target.substring(1); // remove #
      _this.remove(target);
    }
  });

  this.$tabContent = $('<div class="tab-content"></div>');
  this.$nav.on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    // triggered when clicking tab
    var previous = _this.activeTabId;
    _this.activeTabId = $(e.target).data('link');
    _this.activeTabObject = _this.idToTabObject.get(_this.activeTabId);
    _this.$nav.find('li').removeClass('active');
    _this.$nav.find('[data-link=' + _this.activeTabId + ']').each(function () {
      $(this).parent().addClass('active');// not added via droptab
    });
    if (_this.adding) {
      return;
    }

    _this.trigger('change', {
      tab: _this.activeTabId,
      previous: previous
    });
  });

};
morpheus.TabManager.prototype = {
  getTabCount: function () {
    return this.idToTabObject.size();
  },
  setTabText: function (id, text) {
    this.$nav.find('> li > a').filter('[data-link=' + id + ']').contents().first()
    .replaceWith(text + '&nbsp;');
    this.idToTabObject.get(id).setName(name);
  },
  /**
   * @param id
   *            Tab id
   * @param task
   * @param task.worker
   *            Optional worker that the task is run in.
   * @param task.name
   * @param task.tabId
   *            Tab id for task
   */
  addTask: function (task) {
    var $a = this.$nav.find('> li > a[data-link=' + task.tabId + ']');
    if ($a.length === 0) {
      console.log(task.tabId + ' not found.');
      return;

    }
    var $i = $a.find('i');
    var tasks = $i.data('tasks');
    if (!tasks) {
      tasks = [];
    }
    task.id = _.uniqueId('task');
    tasks.push(task);
    $i.data('tasks', tasks);
    $a
    .removeClass('animated flash')
    .addClass('animated flash')
    .one(
      'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
      function () {
        $(this).removeClass('animated flash');
      });

    $i.addClass('fa fa-spinner fa-spin');
  },
  removeTask: function (task) {
    var $a = this.$nav.find('> li > a[data-link=' + task.tabId + ']');
    var $i = $a.find('i');
    var tasks = $i.data('tasks');
    if (!tasks) {
      tasks = [];
    }
    var index = -1;
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === task.id) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      tasks.splice(index, 1);
      $i.data('tasks', tasks);
      if (tasks.length === 0) {
        $i.removeClass('fa fa-spinner fa-spin');
      }
    }
  },
  getWidth: function () {
    return this.$tabContent.outerWidth() || $(window).width();
  },
  getActiveTab: function () {
    return this.activeTabObject;
  },
  getActiveTabId: function () {
    return this.activeTabId;
  },

  /**
   *
   * @param options.object The object that stores the tab content state and has a setName if
   * function if rename is true.
   * @param options.$el
   *            the tab element
   * @param options.title
   *            the tab title
   * @param options.closeable
   *            Whether tab can be closed
   * @param options.rename
   *            Whether tab can be renamed
   * @param options.focus
   *            Whether new tab should be focused-note the change event is not
   *            triggered when true
   * @param options.enabled
   *            Whether new tab is enabled
   *
   */
  add: function (options) {
    this.adding = true;
    var id = _.uniqueId('morpheus-tab');

    this.idToTabObject.set(id, options.object);
    var li = [];
    li.push('<li class="morpheus-sortable" role="presentation">');
    li.push('<a data-morpheus-rename="' + options.rename
      + '" data-toggle="tab" data-link="' + id + '" href="#' + id + '">');
    li.push(options.title);
    li.push('&nbsp;<i style="color:black;"></i>');
    if (options.closeable) {
      li
      .push('&nbsp<button style="font-size: 18px;" type="button" class="close"' +
        ' aria-label="Close"' +
        ' data-target="#'
        + id
        + '"><span aria-hidden="true">×</span></button>');

    }
    li.push('</a></li>');
    var $link = $(li.join(''));
    $link.appendTo(this.$nav);
    var $panel = $('<div tabIndex="-1" style="outline:0;cursor:default;" role="tabpanel" class="tab-pane" id="'
      + id + '"></div>');
    options.$el.appendTo($panel);
    $panel.appendTo(this.$tabContent);
    if (options.enabled === false) {
      $link.addClass('disabled');
      $link.find('a').addClass('btn disabled');
    }
    if (options.focus) {
      // update active tab, but don't fire event
      this.$nav.find('> li > a[data-toggle="tab"]:last').tab('show');
      this.activeTabId = id;
      this.activeTabObject = options.object;
      $panel.focus();
    }

    if (this.options.autohideTabBar) {
      this.$nav.css('display', this.idToTabObject.size() > 1 ? ''
        : 'none');
    }
    this.getTabCount() <= 1 ? this.$nav.sortable('disable') : this.$nav.sortable('enable');
    this.adding = false;
    this.trigger('add');
    return {
      $panel: $panel,
      id: id
    };
  },
  appendTo: function ($target) {
    this.$nav.appendTo($target);
    this.$tabContent.appendTo($target);
  },
  remove: function (target) {
    if (target === undefined) {
      target = this.activeTabId;
    }
    var obj = this.idToTabObject.remove(target);
    $('#' + target).remove(); // remove tab-pane
    this.activeTabObject = null;
    this.$nav.find('> li > a[data-link=' + target + ']:first').parent().remove();
    this.$tabContent.find(target).remove();
    var $a = this.$nav.find('> li > a[data-toggle="tab"]:last');
    if ($a.length === 0) {
      // no content
      if (this.options.landingPage) {
        this.options.landingPage.show();
      }
    }

    $a.tab('show');
    if (this.options.autohideTabBar) {
      this.$nav.css('display', this.idToTabObject.size() > 1 ? ''
        : 'none');
    }
    this.getTabCount() <= 1 ? this.$nav.sortable('disable') : this.$nav.sortable('enable');
    if (this.idToTabObject.size() > 0) {
      $($a.attr('href')).focus();
    }
    if (obj != null && obj.onRemove) {
      obj.onRemove();
    }
    this.trigger('remove', {
      tab: target
    });
  },
  setOptions: function (options) {
    this.options = options;
    if (this.options.autohideTabBar) {
      this.$nav.css('display', this.idToTabObject.size() > 1 ? ''
        : 'none');
    }
  },
  getOptions: function () {
    return this.options;
  },
  setActiveTab: function (id) {
    if (id !== this.activeTabId) {
      var $a = this.$nav.find('> li > a[data-link=' + id + ']');
      // make sure it's enabled
      $a.parent().removeClass('disabled');
      $a.removeClass('btn disabled');
      $a.tab('show');
      var previous = this.activeTabId;
      this.activeTabId = id;
      this.activeTabObject = this.idToTabObject.get(this.activeTabId);
      this.trigger('change', {
        tab: this.activeTabId,
        previous: previous
      });
    }

  },
  /**
   *
   * @param id
   *            The tab id
   * @param title
   *            The title (used to show tooltip)
   */
  setTabTitle: function (id, title) {
    this.$nav.find('> li > a').filter('a[data-link=' + id + ']').attr('title', title);
  },
  setTabEnabled: function (id, enabled) {
    var $a = this.$nav.find('> li > a').filter('a[data-link=' + id + ']');
    if (enabled) {
      $a.parent().removeClass('disabled');
      $a.removeClass('btn disabled');
    } else {
      $a.parent().addClass('disabled');
      $a.addClass('btn disabled');
    }

  },
  getIdToTabObject: function () {
    return this.idToTabObject;
  },
  getTabObject: function (id) {
    return this.idToTabObject.get(id);
  }
};
morpheus.Util.extend(morpheus.TabManager, morpheus.Events);

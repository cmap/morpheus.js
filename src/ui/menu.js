morpheus.HeatMapMenu = function (heatMap) {

  var isNode = morpheus.Util.isNode();
  var menuTemplate;
  if (isNode) {
    var remote = require('electron').remote;
    var Menu = remote.Menu;
    var MenuItem = remote.MenuItem;
    menuTemplate = [];
  }
  var $menus = $(
    '<div style="display: inline-block;margin-right:14px;"></div>');

  function createMenu(menuName, actions, minWidth) {
    if (isNode) {

      var submenu = []
      actions.forEach(function (name) {
        if (name == null) {
          submenu.push({type: 'separator'});
        } else {
          var action = heatMap.getActionManager().getAction(name);
          if (action != null) {
            var name = action.name;

            if (action.ellipsis) {
              name += '...';
            }
            // if (action.icon) {
            //   menu.push('<span class="' + action.icon +
            //     ' morpheus-menu-item-icon"></span> ');
            // }
            var accel = null;
            if (action.which) {
              accel = '';

              if (action.commandKey) {
                accel += 'CmdOrCtrl';
              }
              if (action.shiftKey) {
                if (accel.length > 0) {
                  accel += '+';
                }
                accel += 'Shift';
              }
              if (accel.length > 0) {
                accel += '+';
              }
              var key = morpheus.KeyboardCharMap[action.which[0]];
              if (key === '+') {
                key = 'Plus';
              }
              accel += key;

            }
            submenu.push({
              accelerator: accel,
              label: name,
              click: function (menuItem, browserWindow, event) {
                heatMap.getActionManager().execute(action.name);
              }
            });

          }
        }

      });
      menuTemplate.push({label: menuName, submenu: submenu});
    } else {
      if (!minWidth) {
        minWidth = '0px';
      }
      var menu = [];
      var dropdownId = _.uniqueId('morpheus');
      menu.push('<div class="dropdown morpheus-menu">');
      menu.push(
        '<a class="dropdown-toggle morpheus-black-link morpheus-black-link-background" type="button"' +
        ' id="' + dropdownId +
        '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">');
      menu.push(menuName);

      menu.push('</a>');
      menu.push('<ul style="min-width:' + minWidth +
        ';" class="dropdown-menu" aria-labelledby="' + dropdownId + '">');
      actions.forEach(function (name) {
        if (name == null) {
          menu.push('<li role="separator" class="divider"></li>');
        } else {
          var action = heatMap.getActionManager().getAction(name);
          if (action != null) {
            menu.push('<li>');
            menu.push(
              '<a class="morpheus-menu-item" data-action="' + action.name +
              '" href="#">');
            menu.push(action.name);
            if (action.ellipsis) {
              menu.push('...');
            }
            if (action.icon) {
              menu.push('<span class="' + action.icon +
                ' morpheus-menu-item-icon"></span> ');
            }
            if (action.which) {
              menu.push('<span class="pull-right">');
              if (action.commandKey) {
                menu.push(morpheus.Util.COMMAND_KEY);
              }
              if (action.shiftKey) {
                menu.push('Shift+');
              }
              menu.push(morpheus.KeyboardCharMap[action.which[0]]);
              menu.push('</span>');
            }

            menu.push('</a>');
            menu.push('</li>');
          }
        }
      });

      menu.push('</ul>');
      menu.push('</div>');
      $(menu.join('')).appendTo($menus);
    }
  }


  if (heatMap.options.menu) {
    if (heatMap.options.menu.File) {
      createMenu('File', heatMap.options.menu.File, '240px');
    }

    if (heatMap.options.menu.View) {
      createMenu('Edit', heatMap.options.menu.Edit);
    }
    if (heatMap.options.menu.View) {
      createMenu('View', heatMap.options.menu.View, '170px');
    }
    if (heatMap.options.menu.Tools) {
      createMenu('Tools', heatMap.options.menu.Tools);
    }
    if (heatMap.options.menu.Help) {
      createMenu('Help', heatMap.options.menu.Help, '220px');
    }


  }
  if (isNode) {
    if (global.process.platform === 'darwin') {
      menuTemplate.unshift({
        label: 'Morpheus',
        submenu: [
          {role: 'about'},
          {type: 'separator'},
          {role: 'services', submenu: []},
          {type: 'separator'},
          {role: 'hide'},
          {role: 'hideothers'},
          {role: 'unhide'},
          {type: 'separator'},
          {role: 'quit'}
        ]
      });
    }
    this.applicationMenu = Menu.buildFromTemplate(menuTemplate);

    if (!morpheus.HeatMapMenu.TAB_MANAGER_LISTENER_ADDED) {
      morpheus.HeatMapMenu.TAB_MANAGER_LISTENER_ADDED = true;
      heatMap.tabManager.on('add change remove', function (e) {
        var activeTab = heatMap.tabManager.getTabObject(heatMap.tabManager.getActiveTabId());
        if (activeTab == null) {
          var template = []
          if (process.platform === 'darwin') {
            template.unshift({
              label: 'Morpheus',
              submenu: [
                {
                  role: 'about'
                },
                {
                  role: 'quit',
                }
              ]
            });
          }
          Menu.setApplicationMenu(Menu.buildFromTemplate(template));
        } else if (activeTab.menu != null) {
          Menu.setApplicationMenu(activeTab.menu.applicationMenu);
        } else {
          var template = []
          if (process.platform === 'darwin') {
            template.unshift({
              label: 'Morpheus',
              submenu: [
                {
                  role: 'about'
                },
                {
                  role: 'quit',
                }
              ]
            });
          }
          Menu.setApplicationMenu(Menu.buildFromTemplate(template));
        }
      });
    }
  } else {
    this.applicationMenu = $menus;
  }
};

morpheus.HeatMapMenu.TAB_MANAGER_LISTENER_ADDED = false;



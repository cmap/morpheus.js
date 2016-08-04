/**
 * @param options.autohideTabBar
 *            Whether to autohide the tab bar when only 1 tab showing
 */
morpheus.TabManager = function (options) {
	this.options = $.extend({}, {
		autohideTabBar: false
	}, options);
	var _this = this;
	this.activeTabObject = null;
	this.activeTabId = null;
	this.idToTabObject = new morpheus.Map();
	this.$nav = $('<ul class="nav nav-tabs compact"></ul>');
	this.$nav.on('click', 'li > a', function (e) {
		var tabId = $(this).attr('href');
		e.preventDefault();
		if (_this.activeTabId !== tabId) {
			$(this).tab('show');
		}
	});

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
					_this.activeTabObject.setName(name);
					$a.contents().first().replaceWith(name + '&nbsp;');
				}
			}
		});
		// edit tab name
	}

	// rename

	this.$nav.on('dblclick', 'li > a', function (e) {
		e.preventDefault();
		if ($(this).data('morpheus-rename')) {
			rename($(this));
		}

	});
	this.$nav.on('contextmenu.morpheus', 'li > a', function (e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		var $a = $(this);
		if ($a.data('morpheus-rename')) {
			morpheus.Popup.showPopup([{
				name: 'Rename'
			}], {
				x: e.pageX,
				y: e.pageY
			}, e.target, function (event, item) {
				rename($a);
			});
		}
		return false;

	});

	this.$nav.on('click', 'button', function (e) { // close a tab
		// remove the link and tab content
		e.preventDefault();
		var target = $(this).attr('data-target');
		_this.remove(target);
	});

	this.$tabContent = $('<div class="tab-content"></div>');
	this.$nav.on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
		if (_this.adding) {
			return;
		}
		// triggered when clicking tab
		var previous = _this.activeTabObject;
		_this.activeTabId = $(e.target).attr('href');
		_this.activeTabObject = _this.idToTabObject.get(_this.activeTabId);
		_this.trigger('change', {
			tab: _this.activeTabObject,
			previous: previous
		});
	});

};
morpheus.TabManager.prototype = {
	setTabText: function (id, text) {
		this.$nav.find('a').filter('[href=' + id + ']').contents().first()
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
		var $a = this.$nav.find('a[href=' + task.tabId + ']');
		if ($a.length === 0) {
			throw new Error(task.tabId + ' not found.');
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
		var $a = this.$nav.find('a[href=' + task.tabId + ']');
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
		if (index === -1) {
			throw new Error(task.id + ' not found in ' + tasks.map(function (t) {
					return t.id;
				}));
		}
		tasks.splice(index, 1);
		$i.data('tasks', tasks);
		if (tasks.length === 0) {
			$i.removeClass('fa fa-spinner fa-spin');
		}
	},
	getWidth: function () {
		return this.$nav.outerWidth() || $(window).width();
	},
	getActiveTab: function () {
		return this.activeTabObject;
	},
	getActiveTabId: function () {
		return this.activeTabId;
	},

	/**
	 *
	 * @param options
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
		var id = _.uniqueId('tab');
		this.idToTabObject.set('#' + id, options.object);
		var li = [];
		li.push('<li role="presentation">');
		li.push('<a data-morpheus-rename="' + options.rename
			+ '" data-toggle="tab" href="#' + id + '">');
		li.push(options.title);
		li.push('&nbsp;<i style="color:black;"></i>');
		if (options.closeable) {
			li
			.push('&nbsp<button type="button" class="close" aria-label="Close" data-target="#'
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
			this.$nav.find('a[data-toggle="tab"]:last').tab('show');
			this.activeTabId = '#' + id;
			this.activeTabObject = options.object;
			$panel.focus();
		}

		if (this.options.autohideTabBar) {
			this.$nav.css('display', this.idToTabObject.size() > 1 ? ''
				: 'none');
		}
		this.adding = false;
		return {
			$panel: $panel,
			id: '#' + id
		};
	},
	remove: function (target) {
		if (target === undefined) {
			target = this.activeTabId;
		}
		this.idToTabObject.remove(target);
		this.$nav.find('[href=' + target + ']').parent().remove();
		this.$tabContent.find(target).remove();
		var $a = this.$nav.find('a[data-toggle="tab"]:last');
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
		if (id === this.activeTabId) {
			this.trigger('change', {
				tab: this.activeTabObject,
				previous: null
			});
		}
		var $a = this.$nav.find('[href=' + id + ']');
		// make sure it's enabled
		$a.parent().removeClass('disabled');
		$a.removeClass('btn disabled');
		$a.tab('show');

	},
	/**
	 *
	 * @param id
	 *            The tab id
	 * @param title
	 *            The title (used to show tooltip)
	 */
	setTabTitle: function (id, title) {
		this.$nav.find('a').filter('[href=' + id + ']').attr('title', title);
	},
	setTabEnabled: function (id, enabled) {
		var $a = this.$nav.find('a').filter('[href=' + id + ']');
		if (enabled) {
			$a.parent().removeClass('disabled');
			$a.removeClass('btn disabled');
		} else {
			$a.parent().addClass('disabled');
			$a.addClass('btn disabled');
		}

	}
};
morpheus.Util.extend(morpheus.TabManager, morpheus.Events);

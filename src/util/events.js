// code taken from KineticJS
morpheus.Events = function() {
};
morpheus.Events.prototype = {
	/**
	 * Pass in a string of events delimmited by a space to bind multiple events
	 * at once such as 'mousedown mouseup mousemove'. Include a namespace to
	 * bind an event by name such as 'click.foobar'.
	 * 
	 * @param {String}
	 *            evtStr e.g. 'click', 'mousedown touchstart', 'mousedown.foo
	 *            touchstart.foo'
	 * @param {Function}
	 *            handler The handler function is passed an event object
	 */
	on : function(evtStr, handler) {
		if (!handler) {
			throw Error('Handler not specified');
		}
		if (!this.eventListeners) {
			this.eventListeners = {};
		}
		var events = evtStr.split(' '), len = events.length, n, event, parts, baseEvent, name;
		/*
		 * loop through types and attach event listeners to each one. eg. 'click
		 * mouseover.namespace mouseout' will create three event bindings
		 */
		for (n = 0; n < len; n++) {
			event = events[n];
			parts = event.split('.');
			baseEvent = parts[0];
			name = parts[1] || '';
			// create events array if it doesn't exist
			if (!this.eventListeners[baseEvent]) {
				this.eventListeners[baseEvent] = [];
			}
			this.eventListeners[baseEvent].push({
				name : name,
				handler : handler
			});
		}
		return this;
	},
	/**
	 * Fire an event.
	 * 
	 * @param eventType
	 * @param evt
	 */
	trigger : function(eventType, evt) {
		if (!this.eventListeners) {
			this.eventListeners = {};
		}
		if (!evt) {
			evt = {};
		}
		evt.type = eventType;
		if (!evt.source) {
			evt.source = this;
		}
		var events = this.eventListeners[eventType];
		if (events) {
			var len = events.length;
			for (var i = 0; i < len; i++) {
				events[i].handler.apply(this, [ evt ]);
			}
		}
		return this;
	},
	/**
	 * Remove event bindings. Pass in a string of event types delimmited by a
	 * space to remove multiple event bindings at once such as 'mousedown
	 * mouseup mousemove'. include a namespace to remove an event binding by
	 * name such as 'click.foobar'. If you only give a name like '.foobar', all
	 * events in that namespace will be removed.
	 * 
	 * @param {String}
	 *            evtStr e.g. 'click', 'mousedown.foo touchstart', '.foobar'
	 */
	off : function(evtStr, handler) {
		if (!this.eventListeners) {
			this.eventListeners = {};
		}
		var events = (evtStr || '').split(' '), len = events.length, n, t, event, parts, baseEvent, name;
		if (!evtStr) {
			// remove all events
			for (t in this.eventListeners) {
				this._off(t, null, handler);
			}
		}
		for (n = 0; n < len; n++) {
			event = events[n];
			parts = event.split('.');
			baseEvent = parts[0];
			name = parts[1];
			if (baseEvent) {
				if (this.eventListeners[baseEvent]) {
					this._off(baseEvent, name, handler);
				}
			} else {
				for (t in this.eventListeners) {
					this._off(t, name, handler);
				}
			}
		}
		return this;
	},
	_off : function(type, name, handler) {
		var evtListeners = this.eventListeners[type], i, evtName;
		for (i = 0; i < evtListeners.length; i++) {
			evtName = evtListeners[i].name;
			// check if an event name is not specified, or if one is specified,
			// it matches the current event name
			if ((!name || evtName === name)
					&& (handler == null || handler == evtListeners[i].handler)) {
				evtListeners.splice(i, 1);
				if (evtListeners.length === 0) {
					delete this.eventListeners[type];
					break;
				}
				i--;
			}
		}
	},
};
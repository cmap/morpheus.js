if (typeof morpheus === 'undefined') {
	morpheus = {};
}
morpheus.Util = function () {
};

morpheus.Util.URL = 'https://www.broadinstitute.org/cancer/software/morpheus/';
morpheus.Util.RIGHT_ARROW = String.fromCharCode(8594);
/**
 * Add properties in c2 to c1
 *
 * @param {Object}
 *            c1 The object that will inherit from obj2
 * @param {Object}
 *            c2 The object that obj1 inherits from
 */
morpheus.Util.extend = function (c1, c2) {
	for (var key in c2.prototype) {
		if (!(key in c1.prototype)) {
			c1.prototype[key] = c2.prototype[key];
		}
	}
};

morpheus.Util.viewPortSize = function () {
	return window.getComputedStyle(document.body, ':before').content.replace(
		/"/g, '');
};

morpheus.Util.TRACKING_CODE_LOADED = false;
morpheus.Util.loadTrackingCode = function () {
	if (typeof window !== 'undefined') {
		if (morpheus.Util.TRACKING_CODE_LOADED) {
			return;
		} else if (typeof ga === 'undefined') {
			morpheus.Util.TRACKING_CODE_LOADED = true;
			(function (i, s, o, g, r, a, m) {
				i['GoogleAnalyticsObject'] = r;
				i[r] = i[r] || function () {
						(i[r].q = i[r].q || []).push(arguments)
					}, i[r].l = 1 * new Date();
				a = s.createElement(o),
					m = s.getElementsByTagName(o)[0];
				a.async = 1;
				a.src = g;
				m.parentNode.insertBefore(a, m)
			})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
		}
		ga('create', 'UA-53973555-1', 'auto', 'morpheus');
		ga('morpheus.send', 'pageview');
		morpheus.Util.TRACKING_CODE_LOADED = true;
	}
};

morpheus.Util.measureScrollbar = function () {
	var $c = $(
		'<div style=\'position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;\'></div>')
	.appendTo('body');
	var dim = {
		width: Math.max(0, $c.width() - $c[0].clientWidth),
		height: $c.height() - $c[0].clientHeight
	};
	$c.remove();
	return dim;
};
morpheus.Util.trackEvent = function (options) {
	if (typeof window !== 'undefined') {
		if (!morpheus.Util.TRACKING_CODE_LOADED) {
			morpheus.Util.loadTrackingCode();
		}
		if (morpheus.Util.TRACKING_CODE_LOADED) {
			ga('morpheus.send', {
				hitType: 'event',
				eventCategory: options.eventCategory,
				eventAction: options.eventAction,
				eventLabel: options.eventLabel
			});
		}
	}

};

morpheus.Util.getDataType = function (firstNonNull) {
	var dataType;
	var isArray = morpheus.Util.isArray(firstNonNull);
	if (isArray && firstNonNull.length > 0) {
		firstNonNull = firstNonNull[0];
	}
	if (_.isString(firstNonNull)) {
		dataType = 'string';
	} else if (_.isNumber(firstNonNull)) {
		dataType = 'number';
	} else {
		dataType = 'object';
	}
	if (isArray) {
		dataType = '[' + dataType + ']';
	}
	return dataType;
};
/**
 * Trims leading and trailing whitespace from a string.
 */
morpheus.Util.trim = function (val) {
	var len = val.length;
	var st = 0;

	while ((st < len) && (val[st] <= ' ')) {
		st++;
	}
	while ((st < len) && (val[len - 1] <= ' ')) {
		len--;
	}
	return ((st > 0) || (len < val.length)) ? val.substring(st, len) : val;
};

/**
 * Checks whether supplied argument is an array
 */
morpheus.Util.isArray = function (array) {
	var types = [Array, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array,
		Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array,];
	// handle native arrays
	for (var i = 0, length = types.length; i < length; i++) {
		if (array instanceof types[i]) {
			return true;
		}
	}
	return false;
};
morpheus.Util.getWindowSearchObject = function () {
	var searchObject = {};
	var hashObject = {};
	if (window.location.search.length > 0) {
		searchObject = morpheus.Util.getQueryParams(window.location.search
		.substring(1));
	}
	if (window.location.hash.length > 0) {
		hashObject = morpheus.Util.getQueryParams(window.location.hash
		.substring(1));
	}
	return _.extend(hashObject, searchObject);
};

morpheus.Util.copyString = function (s) {
	//return (' ' + s).slice(1);
	// return (' ' + s).substr(1);
	var copy = [];
	for (var i = 0, end = s.length; i < end; i++) {
		copy.push(s[i]);
	}
	return copy.join('');
};
morpheus.Util.getQueryParams = function (s) {
	var params = {};
	if (!s) {
		return params;
	}
	var search = unescape(s);
	var keyValuePairs = search.split('&');
	for (var i = 0; i < keyValuePairs.length; i++) {
		var pair = keyValuePairs[i].split('=');
		if (pair[1] != null && pair[1] !== '') {
			var array = params[pair[0]];
			if (array === undefined) {
				array = [];
				params[pair[0]] = array;
			}
			array.push(pair[1]);
		}
	}
	return params;
};
morpheus.Util.getScriptPath = function () {
	var scripts = document.getElementsByTagName('script');
	for (var i = scripts.length - 1; i >= 0; i--) {
		var src = scripts[i].src;
		var index = src.lastIndexOf('/');
		if (index !== -1) {
			src = src.substring(index);
		}
		if (src.indexOf('morpheus') !== -1 && src.indexOf('external') === -1) {
			return scripts[i].src;
		}
	}
	return scripts.length > 0 ? scripts[0].src : '';
};

morpheus.Util.forceDelete = function (obj) {
	try {
		var _garbageCollector = (function () {
			var ef = URL.createObjectURL(new Blob([''], {
				type: 'text/javascript'
			})), w = new Worker(ef);

			URL.revokeObjectURL(ef);
			return w;
		})();

		_garbageCollector.postMessage(obj, [obj]);
	} catch (x) {
		console.log('Unable to delete');
	}
};
morpheus.Util.getFileName = function (fileOrUrl) {
	if (fileOrUrl instanceof File) {
		return fileOrUrl.name;
	}
	var name = '' + fileOrUrl;
	var question = name.indexOf('?');
	if (question !== -1) {
		var params = name.substring(question + 1);
		var keyValuePairs = decodeURIComponent(params).split('&');

		// check for parameters in name
		for (var i = 0; i < keyValuePairs.length; i++) {
			var pair = keyValuePairs[i].split('=');
			if (pair[0] === 'file' || pair[0] === 'name') {
				name = pair[1];
				break;
			}
		}
	} else {
		var slash = name.lastIndexOf('/');
		if (slash === name.length - 1) {
			name = name.substring(0, name.length - 1);
			slash = name.lastIndexOf('/');
		}
		if (slash !== -1) {
			name = name.substring(slash + 1); // get stuff after slash
			// https://s3.amazonaws.com/data.clue.io/icv/dosval/BRD-K45711268_10_UM_24_H/pcl_cell.gct?AWSAccessKeyId=AKIAJZQISWLUKFS3VUKA&Expires=1455761050&Signature=HVle9MvXV3OGRZHOngdm2frqER8%3D

		}
	}
	return name;
};
morpheus.Util.prefixWithZero = function (value) {
	return value < 10 ? '0' + value : value;
};
morpheus.Util.getExtension = function (name) {
	var dotIndex = name.lastIndexOf('.');
	if (dotIndex > 0) {
		var suffix = name.substring(dotIndex + 1).toLowerCase();
		if (suffix === 'txt' || suffix === 'gz') { // see if file is in
			// the form
			// name.gct.txt
			var newPath = name.substring(0, dotIndex);
			var secondDotIndex = newPath.lastIndexOf('.');
			if (secondDotIndex > 0) {// see if file has another suffix
				var secondSuffix = newPath.substring(secondDotIndex + 1,
					newPath.length).toLowerCase();
				if (secondSuffix === 'segtab' || secondSuffix === 'seg'
					|| secondSuffix === 'maf' || secondSuffix === 'gct'
					|| secondSuffix === 'txt' || secondSuffix === 'gmt') {
					return secondSuffix;
				}
			}
		}
		return suffix;
	}
	return '';
};
/**
 * Gets the base file name. For example, if name is 'test.txt' the method
 * returns the string 'test'. If the name is 'test.txt.gz', the method also
 * returns the string 'test'.
 *
 * @param name
 *            The file name.
 * @return The base file name.
 */
morpheus.Util.getBaseFileName = function (name) {
	var dotIndex = name.lastIndexOf('.');
	if (dotIndex > 0) {
		var suffix = name.substring(dotIndex + 1, name.length);
		if (suffix === 'gz' || suffix === 'zip' || suffix === 'bz2') {
			return morpheus.Util.getBaseFileName(name.substring(0, dotIndex));
		}
		return name.substring(0, dotIndex);
	}
	return name;
};
morpheus.Util.seq = function (length) {
	var array = [];
	for (var i = 0; i < length; i++) {
		array.push(i);
	}
	return array;
};

morpheus.Util.sequ32 = function (length) {
	var array = new Uint32Array(length);
	for (var i = 0; i < length; i++) {
		array[i] = i;
	}
	return array;
};

/**
 * Converts window hash or search to an object that maps keys to an array of
 * values. For example ?foo=bar returns {foo:[bar]}
 */
morpheus.Util.paramsToObject = function (hash) {
	var search = hash ? window.location.hash : window.location.search;
	if (search.length <= 1) {
		return {};
	}
	search = unescape(search);
	var keyValuePairs = search.substring(1).split('&');
	var result = {};
	for (var i = 0, length = keyValuePairs.length; i < length; i++) {
		var pair = keyValuePairs[i].split('=');
		var values = result[pair[0]];
		if (values === undefined) {
			values = [];
			result[pair[0]] = values;
		}
		values.push(pair[1]);
	}
	return result;
};
morpheus.Util.endsWith = function (string, suffix) {
	return string.length >= suffix.length
		&& string.substr(string.length - suffix.length) === suffix;
};
morpheus.Util.measureSvgText = function (text, classname) {
	if (!text || text.length === 0)
		return {
			height: 0,
			width: 0
		};
	var container = d3.select('body').append('svg');
	if (classname) {
		container.attr('class', classname);
	}
	container.append('text').attr({
		x: -1000,
		y: -1000
	}).text(text);
	var bbox = container.node().getBBox();
	container.remove();
	return {
		height: bbox.height,
		width: bbox.width
	};
};
morpheus.Util.IS_MAC = false;
if (typeof navigator !== 'undefined') {
	morpheus.Util.IS_MAC = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true
		: false;
}
morpheus.Util.COMMAND_KEY = morpheus.Util.IS_MAC ? '&#8984;' : 'Ctrl+';

morpheus.Util.hammer = function (el, recognizers) {
	var hammer = new Hammer(el, {
		recognizers: []
	});

	if (_.indexOf(recognizers, 'pan') !== -1) {
		hammer.add(new Hammer.Pan({
			threshold: 1,
			direction: Hammer.DIRECTION_ALL
		}));
	} else if (_.indexOf(recognizers, 'panh') !== -1) {
		hammer.add(new Hammer.Pan({
			threshold: 1,
			direction: Hammer.DIRECTION_HORIZONTAL
		}));
	} else if (_.indexOf(recognizers, 'panv') !== -1) {
		hammer.add(new Hammer.Pan({
			threshold: 1,
			direction: Hammer.DIRECTION_VERTICAL
		}));
	}
	if (_.indexOf(recognizers, 'tap') !== -1) {
		// var singleTap = new Hammer.Tap({
		// event : 'singletap',
		// interval : 50
		// });
		// var doubleTap = new Hammer.Tap({
		// event : 'doubletap',
		// taps : 2
		// });
		// doubleTap.recognizeWith(singleTap);
		// singleTap.requireFailure([ doubleTap ]);
		// hammer.add([ doubleTap, singleTap ]);
		hammer.add(new Hammer.Tap());
	}
	if (_.indexOf(recognizers, 'pinch') !== -1) {
		hammer.add(new Hammer.Pinch());
	}
	if (_.indexOf(recognizers, 'longpress') !== -1) {
		hammer.add(new Hammer.Press({
			event: 'longpress',
			time: 1000
		}));
	}
	if (_.indexOf(recognizers, 'press') !== -1) {
		hammer.add(new Hammer.Press());
	}
	// $(el).on('mousedown', function(e) {
	// // e.preventDefault();
	// // e.stopPropagation();
	// // e.stopImmediatePropagation();
	// });
	return hammer;
};
morpheus.Util.autocompleteArrayMatcher = function (q, cb, array, fields, max) {
	var filteredSet = new morpheus.Set();
	// an array that will be populated with substring matches
	// regex used to determine if a string starts with substring `q`
	var substrRegex = new RegExp('^' + q, 'i');
	// iterate through the pool of strings and for any string that
	// contains the substring `q`, add it to the `matches` array
	if (fields) {
		var nfields = fields.length;
		for (var i = 0, n = array.length; i < n; i++) {
			var item = array[i];
			for (var j = 0; j < nfields; j++) {
				var field = fields[j];
				var value = item[field];
				if (substrRegex.test(value)) {
					filteredSet.add(value);
					break;
				}
			}
			if (filteredSet.size() === max) {
				break;
			}
		}
	} else {
		for (var i = 0, n = array.length; i < n; i++) {
			var value = array[i];
			if (substrRegex.test(value)) {
				filteredSet.add(value);
			}
			if (filteredSet.size() === max) {
				break;
			}
		}
	}
	cb(filteredSet.values());
};

/**
 * @param {Number}
 *            [options.delay=500] - Delay to short autosuggestions.
 * @param {jQuery}
 *            options.$el - Text box to apply autosuggest to.
 * @param {Function}
 *            options.filter - Callback to invoke to filter a suggested term.
 *            Invoked with array of tokens and response.
 * @param {Function}
 *            options.select - Callback to invoke when a suggested term is
 *            selected.
 * @param {Boolean}
 *            [options.multi=true] - Whether to allow more than one search term.
 * @param {Boolean}
 *            [options.suggestWhenEmpty=true] - Whether to autosuggest terms
 *            when text field is empty.
 *
 */
morpheus.Util.autosuggest = function (options) {
	var fieldRegExp = /:/g;
	options = $.extend({}, {
		multi: true,
		delay: 500,
		suggestWhenEmpty: true,
	}, options);
	options.$el
	// don't navigate away from the field on tab when selecting an item
	.on(
		'keydown',
		function (event) {
			if ((event.keyCode === $.ui.keyCode.TAB)
				&& $(this).data('ui-autocomplete').menu.active) {
				event.preventDefault();
			}
		})
	.autocomplete(
		{
			minLength: 0,
			delay: options.delay,
			source: function (request, response) {
				// delegate back to autocomplete, but extract the
				// autocomplete term
				var terms = morpheus.Util
				.getAutocompleteTokens(
					request.term,
					{
						trim: false,
						selectionStart: options.$el[0].selectionStart
					});

				if (terms.selectionStartIndex === undefined
					|| terms.selectionStartIndex === -1) {
					terms.selectionStartIndex = terms.length - 1;
				}
				if (options.suggestWhenEmpty || terms.length > 0) {
					options.filter(terms, response);
				}
			},
			focus: function () {
				// prevent value inserted on focus
				return false;
			},
			select: function (event, ui) {
				if (ui.item.skip) {
					return false;
				}

				if (options.multi) {
					var terms = morpheus.Util
					.getAutocompleteTokens(
						this.value,
						{
							trim: false,
							selectionStart: options.$el[0].selectionStart
						});

					var field = (event.toElement && event.toElement.dataset) ? event.toElement.dataset.autocomplete : null;
					var value = field ? ui.item[field] : ui.item.value;
					var show = ui.item.show;

					// replace the current input
					if (terms.length === 0) {
						terms.push(value);
					} else {
						terms[terms.selectionStartIndex === -1
						|| terms.selectionStartIndex === undefined ? terms.length - 1
							: terms.selectionStartIndex] = value;
					}
					// add the selected item
					this.value = terms.join(' ');
					if (show) { // did
						// we
						// select
						// just a
						// field name?
						setTimeout(function () {
							options.$el.autocomplete('search',
								options.$el.val());
						}, 20);

					}
					if (options.select) {
						options.select();
					}
					return false;
				}
				if (options.select) {
					options.select();
				}
				if (event.which === 13) {
					event.stopImmediatePropagation();
				}
			}
		});

	// use html for label instead of default text
	var instance = options.$el.autocomplete('instance');
	instance._renderItem = function (ul, item) {
		return $('<li class="' + (item.class ? item.class : 'ui-menu-item') + ' search-item">').html(item.label).appendTo(ul);
	};
	instance._normalize = function (items) {
		return items;
	};

	instance._resizeMenu = function () {
		var ul = this.menu.element;
		ul.outerWidth(instance.element.outerWidth());
	};

	var menu = options.$el.autocomplete('widget');
	if (menu) {
		menu.addClass("search-menu")
	}
	if (options.suggestWhenEmpty) {
		options.$el.on('focus', function () {
			options.$el.autocomplete('search', options.$el.val());
		});
	}

	options.$el.on('keyup', function (e) {
		if (e.which === 13) {
			options.$el.autocomplete('close');
		} else if (options.suggestWhenEmpty) {
			if (options.$el.val() === '') {
				options.$el.autocomplete('search', '');
			}

		}
	});

};

morpheus.Util.getAutocompleteTokens = function (text, options) {
	options = $.extend({}, {
		trim: true
	}, options);
	if (options.trim) {
		text = $.trim(text);
	}
	if (text === '') {
		return [];
	}
	var inQuote = false;
	var inSelectionStart = false;
	var tokens = [];
	var currentToken = [];

	for (var i = 0, n = text.length; i < n; i++) {
		var c = text[i];
		if (c === '"') {
			inQuote = !inQuote;
			currentToken.push(c);
		} else {
			if ((c === ' ' || c === '\t') && !inQuote) {
				tokens.push({
					s: currentToken.join(''),
					inSelectionStart: currentToken.inSelectionStart
				});
				currentToken = []; // start new token
			} else { // add to current token
				currentToken.push(c);
			}
		}
		if (i === options.selectionStart - 1) {
			currentToken.inSelectionStart = true;
		}

	}

	tokens.push({
		s: currentToken.join(''),
		inSelectionStart: currentToken.inSelectionStart
	});
	// add trailing token
	if (!options.trim && !inQuote && text[text.length - 1] === ' ') {
		tokens.push({
			s: ' ',
			inSelectionStart: false
		});
	}
	// remove empty tokens
	// keep spaces at end of input "field:value" for next autocomplete
	var filteredTokens = [];
	var selectionStartIndex = -1;
	for (var i = 0, ntokens = tokens.length; i < ntokens; i++) {
		var token = tokens[i];
		var s = token.s;
		if (options.trim || i < (ntokens - 1)) {
			s = $.trim(s);
		}
		if (s !== '') {
			if (token.inSelectionStart) {
				selectionStartIndex = filteredTokens.length;
			}
			filteredTokens.push(s);
		}
	}
	filteredTokens.selectionStartIndex = selectionStartIndex;
	return filteredTokens;
};

/**
 * @deprecated
 */
morpheus.Util.autocomplete = function ($el, filterFunction, selectCb,
									   singleTerm, autoclose) {
	var fieldRegExp = /:/g;
	$el
	// don't navigate away from the field on tab when selecting an item
	.on(
		'keydown',
		function (event) {
			if ((event.keyCode === $.ui.keyCode.TAB)
				&& $(this).data('ui-autocomplete').menu.active) {
				event.preventDefault();
			}
		}).autocomplete({
		minLength: 1,
		delay: 1200,
		source: function (request, response) {
			// delegate back to autocomplete, but extract the last term
			var terms = morpheus.Util.getAutocompleteTokens(request.term);
			if (terms.length > 0) {
				filterFunction(terms.pop(), response);
			}
		},
		focus: function () {
			// prevent value inserted on focus
			return false;
		},
		select: function (event, ui) {
			if (!singleTerm) {
				var terms = morpheus.Util.getAutocompleteTokens(this.value);
				// remove the current input
				terms.pop();
				// add the selected item
				var val = ui.item.value;
				if (val.indexOf(' ') > 0 && val[0] !== '"') {
					val = '"' + val + '"'; // quote
				}
				// val = val.replace(fieldRegExp, '\\:'); // escape field
				// separators
				terms.push(val);

				this.value = terms.join(' ');
				if (selectCb) {
					selectCb();
				}
				$(this).autocomplete('close');
				return false;
			} else if (selectCb) {
				selectCb();
				$(this).autocomplete('close');
			}
		}
	});

	// use html for label instead of default text
	$el.autocomplete('instance')._renderItem = function (ul, item) {
		return $('<li>').html(item.label).appendTo(ul);
	};

	if (autoclose) {
		$el.on('keyup', function (e) {
			if (e.which === 13) {
				$el.autocomplete('close');
			}
		});
	}
};
morpheus.Util.showDialog = function ($el, title, options) {
	var $dialog = $('<div></div>');
	$el.appendTo($dialog);
	$dialog.appendTo($(document.body));
	if (!options) {
		options = {};
	}
	$dialog.dialog({
		width: 670,
		height: 590,
		title: title,
		// resizeStop : function(event, ui) {
		// var w = parseInt($dialog.width());
		// var h = parseInt($dialog.height());
		// //var d = Math.min(w, h);
		// svg.attr("width", w - 50);
		// svg.attr("height", h - 50);
		// chart.update();
		// },
		close: function (event, ui) {
			$dialog.remove();
			if (options.close) {
				options.close();
			}
		}
	});
};
/**
 * @param sheet
 *            An xlsx sheet
 * @param delim
 *            If a delim is specified each row, will contain a string separated
 *            by delim. Otherwise each row will contain an array.
 */
morpheus.Util.sheetToArray = function (sheet, delim) {
	var r = XLSX.utils.decode_range(sheet['!ref']);
	var rows = [];
	for (var R = r.s.r; R <= r.e.r; ++R) {
		var row = [];
		for (var C = r.s.c; C <= r.e.c; ++C) {
			var val = sheet[XLSX.utils.encode_cell({
				c: C,
				r: R
			})];
			if (!val) {
				row.push('');
				continue;
			}
			var txt = String(XLSX.utils.format_cell(val));
			row.push(txt);
		}
		rows.push(delim ? row.join(delim) : row);
	}
	return rows;
};
morpheus.Util.linesToObjects = function (lines) {
	var header = lines[0];
	var array = [];
	var nfields = header.length;
	for (var i = 1, length = lines.length; i < length; i++) {
		var line = lines[i];
		var obj = {};
		for (var f = 0; f < nfields; f++) {
			var value = line[f];
			var field = header[f];
			obj[field] = value;
		}
		array.push(obj);
	}
	return array;
};
morpheus.Util.xlsxTo2dArray = function (data) {
	var workbook = XLSX.read(data, {
		type: 'binary',
		cellFormula: false,
		cellHTML: false
	});
	var sheetNames = workbook.SheetNames;
	var worksheet = workbook.Sheets[sheetNames[0]];
	var lines = morpheus.Util.sheetToArray(worksheet);
	return lines;
};
morpheus.Util.xlsxTo1dArray = function (data) {
	var workbook = XLSX.read(data, {
		type: 'binary',
		cellFormula: false,
		cellHTML: false
	});
	var sheetNames = workbook.SheetNames;
	var worksheet = workbook.Sheets[sheetNames[0]];
	var lines = morpheus.Util.sheetToArray(worksheet, '\t');
	return lines;
};
morpheus.Util.hashCode = function (val) {
	var h = 0;
	if (val.length > 0) {
		for (var i = 0; i < val.length; i++) {
			h = 31 * h + val.charCodeAt(i);
		}
	}
	return h;
};
/**
 * Returns a promise that resolves to a string
 */
morpheus.Util.getText = function (urlOrFile) {
	var deferred = $.Deferred();
	if (_.isString(urlOrFile)) {
		$.ajax({
			contentType: 'text/plain',
			url: urlOrFile,
		}).done(function (text, status, xhr) {
			// var type = xhr.getResponseHeader('Content-Type');
			deferred.resolve(text);
		});
	} else if (urlOrFile instanceof File) {
		var reader = new FileReader();
		reader.onload = function (event) {
			deferred.resolve(event.target.result);
		};
		reader.readAsText(urlOrFile);
	} else {
		// what is urlOrFile?
		deferred.resolve(urlOrFile);
	}
	return deferred.promise();
};
morpheus.Util.createOptions = function (values, none) {
	var html = [];
	if (none) {
		html.push('<option value="">(None)</option>');
	}
	_.each(values, function (val) {
		html.push('<option value="');
		html.push(val);
		html.push('">');
		html.push(val);
		html.push('</option>');
	});
	return html.join('');
};

/**
 * Computes the rank using the given index array. The index array can be
 * obtained from the morpheus.Util.indexSort method. Does not handle ties.
 *
 * @param index
 * @return The ranks.
 */
morpheus.Util.rankIndexArray = function (index) {
	var rank = [];
	var n = index.length;
	for (var j = 0; j < n; j++) {
		rank[index[j]] = j + 1;
	}
	return rank;
};

morpheus.Util.indexSort = function (array, ascending) {
	var pairs = [];
	array.forEach(function (value, index) {
		pairs.push({
			value: value,
			index: index
		});
	});
	return morpheus.Util.indexSortPairs(pairs, ascending);
};
morpheus.Util.indexSortPairs = function (array, ascending) {
	if (ascending) {
		array.sort(function (a, b) {
			return (a.value < b.value ? -1 : (a.value === b.value ? 0 : 1));
		});
	} else {
		array.sort(function (a, b) {
			return (a.value < b.value ? 1 : (a.value === b.value ? 0 : -1));
		});
	}
	var indices = [];
	array.forEach(function (item) {
		indices.push(item.index);
	});
	return indices;
};
morpheus.Util.arrayEquals = function (array1, array2, comparator) {
	if (array1 == array2)
		return true;
	if (array1 == null || array2 == null) {
		return false;
	}
	if (!comparator) {
		comparator = function (a, b) {
			return a === b;
		};
	}
	var length = array1.length;
	if (array2.length !== length) {
		return false;
	}
	for (var i = 0; i < length; i++) {
		if (!comparator(array1[i], array2[i])) {
			return false;
		}
	}
	return true;
};
morpheus.Util._intFormat = typeof d3 !== 'undefined' ? d3.format(',i')
	: function (d) {
	return '' + Math.round(d);
};
morpheus.Util.intFormat = function (n) {
	return morpheus.Util._intFormat(n);
};
morpheus.Util._nf = typeof d3 !== 'undefined' ? d3.format('.4f') : function (d) {
	return '' + d;
};
morpheus.Util.nf = function (n) {
	var str = (n < 1 && n > -1 && n.toPrecision !== undefined) ? n
	.toPrecision(4) : morpheus.Util._nf(n);
	return morpheus.Util.removeTrailingZerosInFraction(str);
};
morpheus.Util.createNumberFormat = function (nfractionDigits) {
	var d3Formatter = d3.format('.' + nfractionDigits + 'f');
	var f = function (value) {
		var str = d3Formatter(value);
		return morpheus.Util.removeTrailingZerosInFraction(str);
	};
	return f;
};

morpheus.Util.wrapNumber = function (value, object) {
	var n = new Number(value);
	n.toObject = function () {
		return object;
	};
	return n;
};
morpheus.Util.toString = function (value) {
	if (value == null) {
		return '';
	} else if (_.isNumber(value)) {
		return morpheus.Util.nf(value);
	} else if (morpheus.Util.isArray(value)) {
		return morpheus.Util.arrayToString(value, ', ');
	}
	return '' + value;
};

morpheus.Util.arrayToString = function (value, sep) {
	var s = [];
	for (var i = 0, length = value.length; i < length; i++) {
		var val_i = value[i];
		if (_.isNumber(val_i)) {
			s.push(morpheus.Util.nf(val_i[i]));
		} else {
			s.push('' + val_i);
		}

	}
	return s.join(sep);

};
morpheus.Util.removeTrailingZerosInFraction = function (str) {
	var index = str.lastIndexOf('.');
	if (index !== -1) {
		var len = str.length;
		var zeros = len;
		for (var i = len - 1; i > index; i--, zeros--) {
			if (str[i] != '0') {
				break;
			}
		}
		if (zeros === (index + 1)) {
			return str.substring(0, index);
		}
		if (zeros < len) {
			return str.substring(0, index) + str.substring(index, zeros);
		}
	}
	return str;
};
morpheus.Util.s = function (n) {
	return n === 1 ? '' : 's';
};
morpheus.Util.create2dArray = function (rows, columns) {
	var array2d = [];
	for (var i = 0; i < rows; i++) {
		var array = [];
		for (var j = 0; j < columns; j++) {
			array[j] = NaN;
		}
		array2d.push(array);
	}
	return array2d;
};
morpheus.Util.escapeRegex = function (value) {
	return value.replace(/[*]/g, '.*')
	.replace(/[-[\]{}()+?,\\^$|#\s]/g, '\\$&');
};

morpheus.Util.createSearchPredicates = function (options) {
	options = $.extend({}, {
		validateFieldNames: true,
		caseSensitive: true
	}, options);
	var tokens = options.tokens;
	if (tokens == null) {
		return [];
	}
	var availableFields = options.fields;
	if (!options.caseSensitive && availableFields != null) {
		for (var i = 0; i < availableFields.length; i++) {
			availableFields[i] = availableFields[i].toLowerCase();

		}
	}
	var validateFieldNames = options.validateFieldNames;
	var fieldSearchEnabled = !validateFieldNames
		|| (availableFields != null && availableFields.length > 0);

	var fieldRegExp = /\\:/g;
	var predicates = [];
	var defaultIsExactMatch = options.defaultMatchMode === 'exact';

	tokens
	.forEach(function (token) {
		var isNot = false;
		if (token[0] === '-') { // not predicate
			token = token.substring(1);
			isNot = true;
		}
		var field = null;
		var semi = token.indexOf(':');
		if (semi > 0) { // field search?
			if (!fieldSearchEnabled
				|| token.charCodeAt(semi - 1) === 92) { // \:
				token = token.replace(fieldRegExp, ':');
			} else { // only a field search if field matches
				// one of available fields
				var possibleToken = $.trim(token.substring(semi + 1));
				// check for "field":"val" and "field:val"
				var possibleField = $.trim(token.substring(0, semi)); // split
				// on :
				if (possibleField.length > 0
					&& possibleField[0] === '"'
					&& possibleField[possibleField.length - 1] === '"') {
					possibleField = possibleField.substring(1,
						possibleField.length - 1);
				} else if (possibleField.length > 0
					&& possibleField[0] === '"'
					&& possibleToken[possibleToken.length - 1] === '"'
					&& possibleToken[0] !== '"') {
					possibleField = possibleField.substring(1,
						possibleField.length);
					possibleToken = '"' + possibleToken;

				}

				if (!validateFieldNames
					|| availableFields.indexOf(options.caseSensitive ? possibleField : possibleField.toLowerCase()) !== -1) {
					token = possibleToken;
					field = possibleField;
				}
			}
		}

		var predicate;
		var rangeIndex = -1;
		var rangeToken = null;
		var rangeIndicators = ['..', '>=', '>', '<=', '<', '='];
		for (var i = 0; i < rangeIndicators.length; i++) {
			rangeIndex = token.indexOf(rangeIndicators[i]);
			if (rangeIndex !== -1) {
				rangeToken = rangeIndicators[i];
				break;
			}
		}

		if (rangeIndex !== -1) { // range query
			if (rangeToken === '..') {
				var start = parseFloat(token.substring(0, rangeIndex));
				var end = parseFloat(token.substring(rangeIndex + 2));
				if (!isNaN(start) && !isNaN(end)) {
					predicate = new morpheus.Util.NumberRangePredicate(
						field, start, end);
				}
			} else if (rangeToken === '>') {
				var val = parseFloat(token.substring(rangeIndex + 1));
				if (!isNaN(val)) {
					predicate = new morpheus.Util.GreaterThanPredicate(
						field, val);
				}
			} else if (rangeToken === '>=') {
				var val = parseFloat(token.substring(rangeIndex + 2));
				if (!isNaN(val)) {
					predicate = new morpheus.Util.GreaterThanOrEqualPredicate(
						field, val);
				}
			} else if (rangeToken === '<') {
				var val = parseFloat(token.substring(rangeIndex + 1));
				if (!isNaN(val)) {
					predicate = new morpheus.Util.LessThanPredicate(
						field, val);
				}
			} else if (rangeToken === '<=') {
				var val = parseFloat(token.substring(rangeIndex + 2));
				if (!isNaN(val)) {
					predicate = new morpheus.Util.LessThanOrEqualPredicate(
						field, val);
				}
			} else if (rangeToken === '=') {
				var val = parseFloat(token.substring(rangeIndex + 1));
				if (!isNaN(val)) {
					predicate = new morpheus.Util.EqualsPredicate(
						field, val);
				}
			} else {
				predicate = defaultIsExactMatch ? new morpheus.Util.ExactTermPredicate(
					field, token)
					: new morpheus.Util.RegexPredicate(field, token);
			}
		} else if (token[0] === '"' && token[token.length - 1] === '"') { // exact
			// match
			token = token.substring(1, token.length - 1);
			predicate = new morpheus.Util.ExactTermPredicate(field,
				token);
		} else if (token.indexOf('*') !== -1) { // contains
			predicate = new morpheus.Util.RegexPredicate(field, token);
		} else {
			predicate = defaultIsExactMatch ? new morpheus.Util.ExactTermPredicate(
				field, token)
				: new morpheus.Util.RegexPredicate(field, token);

		}
		if (predicate != null) {
			predicates.push(isNot ? new morpheus.Util.NotPredicate(
				predicate) : predicate);
		}

	});
	return predicates;
}
;

morpheus.Util.createRegExpStringToMatchText = function (text) {
	var tokens = morpheus.Util.getAutocompleteTokens(text);
	if (tokens.length === 0) {
		return null;
	}
	var regex = [];
	_.each(tokens, function (token) {
		if (token[0] === '"' && token[token.length - 1] === '"') {
			token = token.substring(1, token.length - 1);
			regex.push('^' + morpheus.Util.escapeRegex(token) + '$'); // exact
			// match
		} else {
			regex.push(morpheus.Util.escapeRegex(token));
		}
	});
	return '(' + regex.join('|') + ')';
};
morpheus.Util.createRegExpToMatchText = function (text) {
	var s = morpheus.Util.createRegExpStringToMatchText(text);
	return s == null ? null : new RegExp(s, 'i');
};
morpheus.Util.reorderArray = function (array, index) {
	var newArray = [];
	for (var i = 0; i < index.length; i++) {
		newArray.push(array[index[i]]);
	}
	return newArray;
};
morpheus.Util.getSearchString = function () {
	var s = window.location.search;
	return s.length > 1 ? s.substring(1) : '';
};
/**
 * Takes an array of strings and splits each string by \t
 *
 * @return An array of arrays
 */
morpheus.Util.splitLines = function (lines) {
	var tab = new RegExp('\t');
	var tokens = [];
	for (var i = 0, nlines = lines.length; i < nlines; i++) {
		var line = lines[i];
		if (line === '') {
			continue;
		}
		tokens.push(line.split(tab));
	}
	return tokens;
};

/**
 * @param file
 *            a File or url
 * @return A deferred object that resolves to an array of arrays
 */
morpheus.Util.readLines = function (fileOrUrl) {
	var isFile = fileOrUrl instanceof File;
	var isString = typeof fileOrUrl === 'string' || fileOrUrl instanceof String;
	var name = morpheus.Util.getFileName(fileOrUrl);
	var ext = morpheus.Util.getExtension(name);
	var deferred = $.Deferred();
	if (isString) { // URL
		if (ext === 'xlsx') {
			var oReq = new XMLHttpRequest();
			oReq.open('GET', fileOrUrl, true);
			$.ajaxPrefilter({url: fileOrUrl}, {}, oReq);
			oReq.responseType = 'arraybuffer';
			oReq.onload = function (oEvent) {
				var arrayBuffer = oReq.response; // Note: not
				// oReq.responseText
				if (arrayBuffer) {
					var data = new Uint8Array(arrayBuffer);
					var arr = [];
					for (var i = 0; i != data.length; ++i) {
						arr[i] = String.fromCharCode(data[i]);
					}
					var bstr = arr.join('');
					var lines = morpheus.Util.xlsxTo1dArray(bstr);
					deferred.resolve(lines);
				} else {
					throw 'not found';
				}
			};
			oReq.send(null);
		} else {
			$.ajax({
				url: fileOrUrl,
			}).done(function (text, status, xhr) {
				deferred.resolve(morpheus.Util.splitOnNewLine(text));
			});
		}
	} else if (isFile) {
		var reader = new FileReader();
		reader.onload = function (event) {
			deferred.resolve(ext === 'xlsx' ? morpheus.Util
			.xlsxTo1dArray(event.target.result) : morpheus.Util
			.splitOnNewLine(event.target.result));
		};
		if (ext === 'xlsx') {
			reader.readAsBinaryString(fileOrUrl);
		} else {
			reader.readAsText(fileOrUrl);
		}
	} else { // it's already lines?
		deferred.resolve(fileOrUrl);
	}
	return deferred;
};
morpheus.Util.createValueToIndices = function (array, field) {
	var map = new morpheus.Map();
	_.each(array, function (item) {
		var key = item[field];
		var values = map.get(key);
		if (values === undefined) {
			values = [];
			map.set(key, values);
		}
		values.push(item);
	});
	return map;
};

morpheus.Util.createLoadingEl = function () {
	return $('<div style="overflow:hidden;text-align:center;"><i class="fa fa-spinner fa-spin fa-3x"></i><span style="padding-left:4px;vertical-align:middle;font-weight:bold;">Loading...</span></div>');
};
/**
 * Splits a string by the new line character, trimming whitespace
 */
morpheus.Util.splitOnNewLine = function (text, commentChar) {
	var commentCharCode = commentChar !== undefined ? commentChar.charCodeAt(0)
		: undefined;

	var lines = text.split(/\n/);
	if (lines.length === 1) {
		var tmp = text.split(/\r/); // old school mac?
		if (tmp.length > 1) {
			lines = tmp;
		}
	}

	var rows = [];
	for (var i = 0, nlines = lines.length; i < nlines; i++) {
		var line = lines[i].trim();
		if (line !== '') {
			if (commentCharCode !== undefined) {
				if (line.charCodeAt(0) !== commentCharCode) {
					rows.push(line);
				}
			} else {
				rows.push(line);
			}
		}
	}
	return rows;
};

morpheus.Util.ContainsPredicate = function (field, text) {
	this.field = field;
	text = text.toLowerCase();
	this.text = text;
};
morpheus.Util.ContainsPredicate.prototype = {
	accept: function (value) {
		return value.toLowerCase
			&& value.toLowerCase().indexOf(this.text) !== -1;
	},
	getField: function () {
		return this.field;
	},
	isNumber: function () {
		return false;
	},
	toString: function () {
		return 'ContainsPredicate ' + this.field + ':' + this.text;
	}
};
morpheus.Util.ExactTermPredicate = function (field, term) {
	this.field = field;
	term = term.toLowerCase();
	this.text = term;
};
morpheus.Util.ExactTermPredicate.prototype = {
	accept: function (value) {
		return value && value.toLowerCase && value.toLowerCase() === this.text;
	},
	getField: function () {
		return this.field;
	},
	isNumber: function () {
		return false;
	},
	toString: function () {
		return 'ExactTermPredicate ' + this.field + ':' + this.text;
	}
};
morpheus.Util.RegexPredicate = function (field, text) {
	this.field = field;
	this.text = text;
	this.regex = new RegExp(morpheus.Util.escapeRegex(text), 'i');
};
morpheus.Util.RegexPredicate.prototype = {
	accept: function (value) {
		return this.regex.test(value);
	},
	getField: function () {
		return this.field;
	},
	isNumber: function () {
		return false;
	},
	toString: function () {
		return 'RegexPredicate ' + this.field + ':' + this.regex;
	}
};
morpheus.Util.NumberRangePredicate = function (field, min, max) {
	this.field = field;
	this.min = min;
	this.max = max;
};
morpheus.Util.NumberRangePredicate.prototype = {
	accept: function (value) {
		return value >= this.min && value <= this.max;
	},
	getField: function () {
		return this.field;
	},
	isNumber: function () {
		return true;
	},
	toString: function () {
		return 'NumberRangePredicate ' + this.field + ':' + this.min + '...'
			+ this.max;
	}
};

morpheus.Util.GreaterThanPredicate = function (field, val) {
	this.field = field;
	this.val = val;
};
morpheus.Util.GreaterThanPredicate.prototype = {
	accept: function (value) {
		return value > this.val;
	},
	getField: function () {
		return this.field;
	},
	isNumber: function () {
		return true;
	}
};

morpheus.Util.GreaterThanOrEqualPredicate = function (field, val) {
	this.field = field;
	this.val = val;
};
morpheus.Util.GreaterThanOrEqualPredicate.prototype = {
	accept: function (value) {
		return value >= this.val;
	},
	getField: function () {
		return this.field;
	},
	isNumber: function () {
		return true;
	}
};
morpheus.Util.LessThanPredicate = function (field, val) {
	this.field = field;
	this.val = val;
};
morpheus.Util.LessThanPredicate.prototype = {
	accept: function (value) {
		return value < this.val;
	},
	getField: function () {
		return this.field;
	},
	isNumber: function () {
		return true;
	}
};
morpheus.Util.LessThanOrEqualPredicate = function (field, val) {
	this.field = field;
	this.val = val;
};
morpheus.Util.LessThanOrEqualPredicate.prototype = {
	accept: function (value) {
		return value <= this.val;
	},
	getField: function () {
		return this.field;
	},
	isNumber: function () {
		return true;
	}
};
morpheus.Util.EqualsPredicate = function (field, val) {
	this.field = field;
	this.val = val;
};
morpheus.Util.EqualsPredicate.prototype = {
	accept: function (value) {
		return value === this.val;
	},
	getField: function () {
		return this.field;
	},
	isNumber: function () {
		return true;
	}
};
morpheus.Util.NotPredicate = function (p) {
	this.p = p;
};
morpheus.Util.NotPredicate.prototype = {
	accept: function (value) {
		return !this.p.accept(value);
	},
	getField: function () {
		return this.p.getField();
	},
	isNumber: function () {
		return this.p.isNumber();
	},
	toString: function () {
		return 'NotPredicate ' + this.p;
	}
};

// code taken from KineticJS
morpheus.Events = function () {
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
	on: function (evtStr, handler) {
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
				name: name,
				handler: handler
			});
		}
		return this;
	},
	getListeners: function () {
		if (!this.eventListeners) {
			this.eventListeners = {};
		}
		return this.eventListeners;
	},
	setListeners: function (eventListeners) {
		this.eventListeners = eventListeners;
	},
	/**
	 * Fire an event.
	 *
	 * @param eventType
	 * @param evt
	 */
	trigger: function (eventType, evt) {
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
				events[i].handler.apply(this, [evt]);
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
	off: function (evtStr, handler) {
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
	_off: function (type, name, handler) {
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
	}
};

morpheus.Identifier = function(array) {
	this.array = array;
};
morpheus.Identifier.prototype = {
	toString : function() {
		return this.array.join(',');
	},
	equals : function(otherId) {
		var other = otherId.getArray();
		for (var i = 0, length = this.array; i < length; i++) {
			if (this.array[i] !== other[i]) {
				return false;
			}
		}
		return true;
	},
	getArray : function() {
		return this.array;
	}
};
morpheus.Map = function() {
	this.map = {}; // object string -> key, value
	// the key field is stored to get the original key object back
	this.n = 0;
};
morpheus.Map.prototype = {
	toString : function() {
		var s = [];
		this.forEach(function(value, key) {
			if (s.length > 0) {
				s.push(', ');
			}
			s.push(key);
			s.push('=');
			s.push(value);
		});
		return s.join('');
	},
	keys : function() {
		var keys = [];
		for ( var key in this.map) {
			var pair = this.map[key];
			keys.push(pair.key);
		}
		return keys;
	},
	size : function() {
		return this.n;
	},
	equals : function(m) {
		if (m.size() !== this.size()) {
			return false;
		}
		var ret = true;
		try {
			this.forEach(function(value, key) {
				if (value !== m.get(key)) {
					ret = false;
					throw 'break'; // break out of loop
				}
			});
		} catch (e) {
		}
		return ret;
	},
	setAll : function(map) {
		var _this = this;
		map.forEach(function(value, key) {
			_this.set(key, value);
		});
	},
	set : function(key, value) {
		var skey = '\0' + key;
		var previous = this.map[skey];
		if (previous === undefined) { // only increment size when this is a
			// new key
			this.n++;
		}
		this.map[skey] = {
			key : key,
			value : value
		};
	},
	forEach : function(callback) {
		for ( var key in this.map) {
			var pair = this.map[key];
			callback(pair.value, pair.key);
		}
	},
	values : function() {
		var values = [];
		for ( var key in this.map) {
			var pair = this.map[key];
			values.push(pair.value);
		}
		return values;
	},
	get : function(key) {
		var skey = '\0' + key;
		var pair = this.map[skey];
		return pair !== undefined ? pair.value : undefined;
	},
	clear : function() {
		this.map = {};
		this.n = 0;
	},
	remove : function(key) {
		var skey = '\0' + key;
		var pair = this.map[skey];
		if (pair !== undefined) {
			delete this.map[skey];
			this.n--;
			return pair.value;
		}
	},
	has : function(key) {
		var skey = '\0' + key;
		return this.map[skey] !== undefined;
	}
};
/**
 * Created by baba_beda on 8/16/16.
 */
morpheus.ocpu = function () {
};

morpheus.ocpu.call = function(obj, settings) {
    settings.host = settings.host || "localhost:8004";
    if (settings.library == null) {
        alert("Library is not specified. Call terminated");
        return -1;
    }
    if (settings.fun == null) {
        alert("Function is not specified. Call terminated");
        return -1;
    }
    if (obj == null) {
        alert("No arguments for function presented. Call terminated");
        return -1;
    }
    var http = new XMLHttpRequest();
    var url = "http://" + settings.host + "/ocpu/library/" + settings.library + "/R/" + settings.fun;
    http.open("POST", url, false);
    settings.contentType = settings.contentType || "application/x-protobuf";
    http.setRequestHeader("Content-Type", settings.contentType);

    var params = new Uint8Array(obj.toArrayBuffer());
    http.send(params);

    var loc;
    if (http.status == 201) {
        loc = http.getResponseHeader("Location");
    }
    else {
        alert("Some problems occurred during POST request. Call terminated");
        return -1;
    }

    var url2 = loc + "R/.val/print";
    var http2 = new XMLHttpRequest();
    http2.open("GET", url2, false);
    http2.send(null);
    if (http2.status == 200) {
        return http2.responseText;
    }
    else {
        alert("Some problems occurred during GET request. Call terminated");
        return -1;
    }
};
morpheus.Set = function() {
	this._map = new morpheus.Map();
};
morpheus.Set.prototype = {
	toString : function() {
		var s = [];
		this.forEach(function(key) {
			if (s.length > 0) {
				s.push(', ');
			}
			s.push(key);
		});
		return s.join('');
	},
	size : function() {
		return this._map.size();
	},
	equals : function(m) {
		return this._map.equals(m);
	},
	forEach : function(callback) {
		this._map.forEach(function(value, key) {
			callback(key);
		});
	},
	add : function(value) {
		this._map.set(value, true);
	},
	values : function() {
		var values = [];
		this._map.forEach(function(value, key) {
			values.push(key);
		});
		return values;
	},
	clear : function() {
		this._map.clear();
	},
	remove : function(key) {
		this._map.remove(key);
	},
	has : function(key) {
		return this._map.has(key);
	}
};
morpheus.BufferedReader = function (buffer) {
	this.buffer = buffer;
	this.bufferLength = buffer.length;
	this.index = 0;
	if (typeof TextDecoder !== 'undefined') {
		var textDecoder = new TextDecoder();
		this.decoder = function (buf, start, end) {
			return textDecoder.decode(buf.subarray(start, end));
		};
	} else {
		this.decoder = function (buf, start, end) {
			// TODO convert in chunks
			var s = [];
			for (var i = start; i < end; i++) {
				s.push(String.fromCharCode(buffer[i]));
			}
			return s.join('');
		};
	}
};

morpheus.BufferedReader.prototype = {
	readLine: function () {
		var index = this.index;
		var bufferLength = this.bufferLength;
		if (index >= bufferLength) {

			return null;
		}
		var buffer = this.buffer;
		var start = index;
		var end = start;
		for (; index < bufferLength; index++) {
			var c = buffer[index];
			if (c === 10 || c === 13) { // \n or \r
				end = index;
				if ((index !== bufferLength - 1)
					&& (buffer[index + 1] === 10 || buffer[index + 1] === 13)) { // skip
					// ahead
					index++;
				}
				index++;
				break;
			}
		}
		this.index = index;
		if (start === end && index === bufferLength) { // eof
			return String(this.decoder(this.buffer, start, bufferLength));
		}

		return String(this.decoder(this.buffer, start, end));

	}
};

morpheus.BufferedReader.getArrayBuffer = function (fileOrUrl, callback) {
	var isString = typeof fileOrUrl === 'string' || fileOrUrl instanceof String;
	if (isString) { // URL
		var oReq = new XMLHttpRequest();
		oReq.open('GET', fileOrUrl, true);
		oReq.responseType = 'arraybuffer';
		oReq.onload = function (oEvent) {
			callback(null, oReq.response);
		};

		// oReq.onprogress = function(oEvent) {
		// if (oEvent.lengthComputable) {
		// var percentComplete = oEvent.loaded / oEvent.total;
		// console.log(percentComplete + '%')
		// } else {
		// console.log(oEvent.loaded + ' loaded')
		// }
		// };

		oReq.onerror = function (oEvent) {
			callback(oEvent);
		};
		oReq.onreadystatechange = function (oEvent) {
			if (oReq.readyState === 4 && oReq.status !== 200) {
				oReq.onload = null;
				oReq.onerror = null;
				if (oReq.status === 404) {
					callback(new Error(fileOrUrl + ' not found.'));
				} else {
					callback(new Error('Unable to read ' + fileOrUrl + '.'));
				}
			}
		};

		oReq.send(null);
		return oReq;
	} else {
		var reader = new FileReader();
		reader.onload = function (event) {
			callback(null, event.target.result);
		};
		reader.onerror = function (event) {
			callback(event);
		};
		reader.readAsArrayBuffer(fileOrUrl);
		return reader;
	}
};

/**
 * Class for reading cls files. <p/> <p/> The CLS files are simple files created
 * to load class information into GeneCluster. These files use spaces to
 * separate the fields.
 * </P>
 * <UL>
 * <LI>The first line of a CLS file contains numbers indicating the number of
 * samples and number of classes. The number of samples should correspond to the
 * number of samples in the associated RES or GCT data file.</LI>
 * <p/>
 * <UL>
 * <LI>Line format: (number of samples) (space) (number of classes) (space) 1</LI>
 * <LI>For example: 58 2 1</LI>
 * </UL>
 * <p/>
 * <LI>The second line in a CLS file contains names for the class numbers. The
 * line should begin with a pound sign (#) followed by a space.</LI>
 * <p/>
 * <UL>
 * <LI>Line format: # (space) (class 0 name) (space) (class 1 name)</LI>
 * <p/>
 * <LI>For example: # cured fatal/ref.</LI>
 * </UL>
 * <p/>
 * <LI>The third line contains numeric class labels for each of the samples.
 * The number of class labels should be the same as the number of samples
 * specified in the first line.</LI>
 * <UL>
 * <LI>Line format: (sample 1 class) (space) (sample 2 class) (space) ...
 * (sample N class)</LI>
 * <LI>For example: 0 0 0 ... 1
 * </UL>
 * <p/>
 * </UL>
 */
morpheus.ClsReader = function() {
};
morpheus.ClsReader.prototype = {
	/**
	 * Parses the cls file.
	 * 
	 * @param file
	 *            The file.
	 * @throw new Errors Exception If there is a problem with the data
	 */
	read : function(lines) {
		var regex = /[ ,]+/;
		// header= <num_data> <num_classes> 1
		var header = lines[0].split(regex);
		if (header.length < 3) {
			throw new Error('Header line needs three numbers');
		}
		var headerNumbers = [];
		try {
			for (var i = 0; i < 3; i++) {
				headerNumbers[i] = parseInt($.trim(header[i]));
			}
		} catch (e) {
			throw new Error('Header line element ' + i + ' is not a number');
		}
		if (headerNumbers[0] <= 0) {
			throw new Error(
					'Header line missing first number, number of data points');
		}
		if (headerNumbers[1] <= 0) {
			throw new Error(
					'Header line missing second number, number of classes');
		}
		var numClasses = headerNumbers[1];
		var numItems = headerNumbers[0];
		var classDefinitionLine = lines[1];
		classDefinitionLine = classDefinitionLine.substring(classDefinitionLine
				.indexOf('#') + 1);
		var classNames = $.trim(classDefinitionLine).split(regex);
		if (classNames.length < numClasses) {
			throw new Error('First line specifies ' + numClasses
					+ ' classes, but found ' + classNames.length + '.');
		}
		var dataLine = lines[2];
		var assignments = dataLine.split(regex);
		// convert the assignments to names
		for (var i = 0; i < assignments.length; i++) {
			var assignment = $.trim(assignments[i]);
			var index = parseInt(assignment);
			var tmp = classNames[index];
			if (tmp !== undefined) {
				assignments[i] = tmp;
			}
		}
		return assignments;
	}
};

morpheus.ClsWriter = function() {

};
morpheus.ClsWriter.prototype = {
	write : function(vector) {
		var pw = [];
		var size = vector.size();
		pw.push(size);
		pw.push(' ');
		var set = morpheus.VectorUtil.getSet(vector);
		pw.push(set.size());
		pw.push(' ');
		pw.push('1\n');
		pw.push('#');
		var valueToIndex = new morpheus.Map();
		var index = 0;
		set.forEach(function(name) {
			pw.push(' ');
			pw.push(name);
			valueToIndex.set(name, index++);
		});
		pw.push('\n');
		for (var i = 0; i < size; i++) {
			if (i > 0) {
				pw.push(' ');
			}
			pw.push(valueToIndex.get(vector.getValue(i)));
		}
		pw.push('\n');
		return pw.join('');
	}
};

morpheus.GctReader = function () {

};

morpheus.GctReader.prototype = {
	getFormatName: function () {
		return 'gct';
	},
	read: function (fileOrUrl, callback) {
		if (fileOrUrl instanceof File) {
			this._readChunking(fileOrUrl, callback, false);
		} else {
			this._readNoChunking(fileOrUrl, callback);
		}
	},
	_readChunking: function (fileOrUrl, callback, tryNoChunkIfError) {
		var _this = this;
		// Papa.LocalChunkSize = 10485760 * 10; // 100 MB
		// Papa.RemoteChunkSize = 10485760 * 10; // 100 MB
		var lineNumber = 0;
		var version;
		var numRowAnnotations = 1; // in addition to row id
		var numColumnAnnotations = 0; // in addition to column id
		var nrows = -1;
		var ncols = -1;
		var version = 2;
		var rowMetadataNames = [];
		var columnMetadataNames = [];
		var rowMetadata = [[]];
		var columnMetadata = [[]];
		var dataColumnStart;
		var matrix = [];
		var dataMatrixLineNumberStart;
		var columnIdFieldName = 'id';
		var rowIdFieldName = 'id';
		var columnNamesArray;
		Papa.parse(fileOrUrl, {
			delimiter: "\t",	// auto-detect
			newline: "",	// auto-detect
			header: false,
			dynamicTyping: false,
			preview: 0,
			encoding: "",
			worker: false,
			comments: false,
			step: function (result) {
				if (lineNumber === 0) {
					var text = result.data[0][0].trim();
					if ('#1.2' === text) {
						version = 2;
					} else if ('#1.3' === text) {
						version = 3;
					} else {
						console.log('Unknown version: assuming version 2');
					}
				} else if (lineNumber === 1) {
					var dimensions = result.data[0];
					if (version === 3) {
						if (dimensions.length >= 4) {
							nrows = parseInt(dimensions[0]);
							ncols = parseInt(dimensions[1]);
							numRowAnnotations = parseInt(dimensions[2]);
							numColumnAnnotations = parseInt(dimensions[3]);
						} else { // no dimensions specified
							numRowAnnotations = parseInt(dimensions[0]);
							numColumnAnnotations = parseInt(dimensions[1]);
						}
					} else {
						nrows = parseInt(dimensions[0]);
						ncols = parseInt(dimensions[1]);
						if (nrows <= 0 || ncols <= 0) {
							callback(
								'Number of rows and columns must be greater than 0.');
						}
					}
					dataColumnStart = numRowAnnotations + 1;
				} else if (lineNumber === 2) {
					columnNamesArray = result.data[0];
					for (var i = 0; i < columnNamesArray.length; i++) {
						columnNamesArray[i] = morpheus.Util.copyString(columnNamesArray[i]);
					}
					if (ncols === -1) {
						ncols = columnNamesArray.length - numRowAnnotations - 1;
					}
					if (version == 2) {
						var expectedColumns = ncols + 2;
						if (columnNamesArray.length !== expectedColumns) {
							callback('Expected ' + (expectedColumns - 2)
								+ ' column names, but read '
								+ (columnNamesArray.length - 2) + ' column names.');
						}
					}
					var name = columnNamesArray[0];
					var slashIndex = name.lastIndexOf('/');

					if (slashIndex != -1 && slashIndex < (name.length - 1)) {
						rowIdFieldName = name.substring(0, slashIndex);
						columnIdFieldName = name.substring(slashIndex + 1);
					}
					rowMetadataNames.push(rowIdFieldName);
					columnMetadataNames.push(columnIdFieldName);
					for (var j = 0; j < ncols; j++) {
						var index = j + numRowAnnotations + 1;
						var columnName = index < columnNamesArray.length ? columnNamesArray[index]
							: null;
						columnMetadata[0].push(morpheus.Util.copyString(columnName));
					}

					for (var j = 0; j < numRowAnnotations; j++) {
						var rowMetadataName = '' === columnNamesArray[1] ? 'description'
							: columnNamesArray[j + 1];
						rowMetadataNames.push(
							rowMetadataName);
						rowMetadata.push([]);
					}
					dataMatrixLineNumberStart = 3 + numColumnAnnotations;
				} else { // lines >=3
					var tokens = result.data[0];
					if (lineNumber < dataMatrixLineNumberStart) {
						var metadataName = morpheus.Util.copyString(tokens[0]);
						var v = [];
						columnMetadata.push(v);
						columnMetadataNames.push(metadataName);
						for (var j = 0; j < ncols; j++) {
							v.push(morpheus.Util.copyString(tokens[j + dataColumnStart]));
						}
					} else { // data lines
						if (tokens[0] !== '') {
							var array = new Float32Array(ncols);
							matrix.push(array);
							// we iterate to numRowAnnotations + 1 to include id row
							// metadata field
							for (var rowAnnotationIndex = 0; rowAnnotationIndex <= numRowAnnotations; rowAnnotationIndex++) {
								var rowMetadataValue = tokens[rowAnnotationIndex];
								rowMetadata[rowAnnotationIndex].push(
									morpheus.Util.copyString(rowMetadataValue));

							}

							for (var columnIndex = 0; columnIndex < ncols; columnIndex++) {
								var token = tokens[columnIndex + dataColumnStart];
								array[columnIndex] = parseFloat(token);
							}
						}
					}
				}
				lineNumber++;

			},
			complete: function () {
				var dataset = new morpheus.Dataset({
					name: morpheus.Util.getBaseFileName(morpheus.Util
					.getFileName(fileOrUrl)),
					rows: matrix.length,
					columns: ncols,
					array: matrix,
					dataType: 'Float32'
				});
				for (var i = 0; i < rowMetadataNames.length; i++) {
					dataset.getRowMetadata().add(rowMetadataNames[i]).array = rowMetadata[i];
				}
				for (var i = 0; i < columnMetadataNames.length; i++) {
					dataset.getColumnMetadata().add(columnMetadataNames[i]).array = columnMetadata[i];
				}
				morpheus.MetadataUtil.maybeConvertStrings(dataset.getRowMetadata(), 1);
				morpheus.MetadataUtil.maybeConvertStrings(dataset.getColumnMetadata(),
					1);
				callback(null, dataset);
			},
			error: function (err) {
				if (tryNoChunkIfError) {
					_this._readNoChunking(fileOrUrl, callback);
				} else {
					callback(err);
				}
			},
			download: !(fileOrUrl instanceof File),
			skipEmptyLines: false,
			chunk: undefined,
			fastMode: true,
			beforeFirstChunk: undefined,
			withCredentials: undefined
		});
	},
	_read: function (datasetName, reader) {
		var tab = /\t/;
		var versionLine = $.trim(reader.readLine());
		if (versionLine === '') {
			throw new Error('Missing version line');
		}
		var version = 2;
		if ('#1.2' === versionLine) {
			version = 2;
		} else if ('#1.3' === versionLine) {
			version = 3;
		} else {
			console.log('Unknown version: assuming version 2');
		}
		var dimensionsLine = reader.readLine();
		if (dimensionsLine == null) {
			throw new Error('No dimensions specified');
		}
		// <numRows> <tab> <numCols>
		var dimensions = dimensionsLine.split(/[ \t]/);
		var numRowAnnotations = 1; // in addition to row id
		var numColumnAnnotations = 0; // in addition to column id
		var nrows = -1;
		var ncols = -1;
		if (version === 3) {
			if (dimensions.length >= 4) {
				nrows = parseInt(dimensions[0]);
				ncols = parseInt(dimensions[1]);
				numRowAnnotations = parseInt(dimensions[2]);
				numColumnAnnotations = parseInt(dimensions[3]);
			} else { // no dimensions specified
				numRowAnnotations = parseInt(dimensions[0]);
				numColumnAnnotations = parseInt(dimensions[1]);
			}
		} else {
			nrows = parseInt(dimensions[0]);
			ncols = parseInt(dimensions[1]);
			if (nrows <= 0 || ncols <= 0) {
				throw new Error(
					'Number of rows and columns must be greater than 0.');
			}
		}
		var columnNamesLine = reader.readLine();
		if (columnNamesLine == null) {
			throw new Error('No column annotations');
		}

		var columnNamesArray = columnNamesLine.split(tab);
		if (ncols === -1) {
			ncols = columnNamesArray.length - numRowAnnotations - 1;
		}
		if (version == 2) {
			var expectedColumns = ncols + 2;
			if (columnNamesArray.length !== expectedColumns) {
				throw new Error('Expected ' + (expectedColumns - 2)
					+ ' column names, but read '
					+ (columnNamesArray.length - 2) + ' column names.');
			}
		}
		var name = columnNamesArray[0];
		var slashIndex = name.lastIndexOf('/');
		var columnIdFieldName = 'id';
		var rowIdFieldName = 'id';
		if (slashIndex != -1 && slashIndex < (name.length - 1)) {
			rowIdFieldName = name.substring(0, slashIndex);
			columnIdFieldName = name.substring(slashIndex + 1);
		}
		if (nrows === -1) {
			var matrix = [];
			var rowMetadataNames = [rowIdFieldName];
			var columnMetadataNames = [columnIdFieldName];
			var rowMetadata = [[]];
			var columnMetadata = [[]];
			for (var j = 0; j < ncols; j++) {
				var index = j + numRowAnnotations + 1;
				var columnName = index < columnNamesArray.length ? columnNamesArray[index]
					: null;
				columnMetadata[0].push(morpheus.Util.copyString(columnName));
			}

			for (var j = 0; j < numRowAnnotations; j++) {
				var rowMetadataName = '' === columnNamesArray[1] ? 'description'
					: columnNamesArray[j + 1];
				rowMetadataNames.push(
					rowMetadataName);
				rowMetadata.push([]);
			}

			var dataColumnStart = numRowAnnotations + 1;
			var ntokens = ncols + numRowAnnotations + 1;
			var linen = 3;
			if (numColumnAnnotations > 0) {
				for (var columnAnnotationIndex = 0; columnAnnotationIndex < numColumnAnnotations; columnAnnotationIndex++) {
					var tokens = reader.readLine().split(tab);
					var metadataName = tokens[0];
					var v = [];
					columnMetadata.push(v);
					columnMetadataNames.push(metadataName);
					for (var j = 0; j < ncols; j++) {
						v.push(morpheus.Util.copyString(tokens[j + dataColumnStart]));
					}
				}
			}

			var nonEmptyDescriptionFound = false;
			var numRowAnnotationsPlusOne = numRowAnnotations + 1;
			var s;
			while ((s = reader.readLine()) !== null) {
				if (s !== '') {
					var array = new Float32Array(ncols);
					matrix.push(array);
					var tokens = s.split(tab);
					// we iterate to numRowAnnotations + 1 to include id row
					// metadata field
					for (var rowAnnotationIndex = 0; rowAnnotationIndex < numRowAnnotationsPlusOne; rowAnnotationIndex++) {
						var rowMetadataValue = tokens[rowAnnotationIndex];
						rowMetadata[rowAnnotationIndex].push(
							morpheus.Util.copyString(rowMetadataValue));

					}

					for (var columnIndex = 0; columnIndex < ncols; columnIndex++) {
						var token = tokens[columnIndex + dataColumnStart];
						array[columnIndex] = parseFloat(token);
					}
				}

			}
			var dataset = new morpheus.Dataset({
				name: datasetName,
				rows: matrix.length,
				columns: ncols,
				array: matrix,
				dataType: 'Float32'
			});
			for (var i = 0; i < rowMetadataNames.length; i++) {
				dataset.getRowMetadata().add(rowMetadataNames[i]).array = rowMetadata[i];
			}
			for (var i = 0; i < columnMetadataNames.length; i++) {
				dataset.getColumnMetadata().add(columnMetadataNames[i]).array = columnMetadata[i];
			}
			morpheus.MetadataUtil.maybeConvertStrings(dataset.getRowMetadata(), 1);
			morpheus.MetadataUtil.maybeConvertStrings(dataset.getColumnMetadata(),
				1);
			return dataset;

		} else {
			var dataset = new morpheus.Dataset({
				dataType: 'Float32',
				name: datasetName,
				rows: nrows,
				columns: ncols
			});

			var columnIds = dataset.getColumnMetadata().add(columnIdFieldName);
			if (version == 3) {
				for (var j = 0; j < ncols; j++) {
					var index = j + numRowAnnotations + 1;
					var columnName = index < columnNamesArray.length ? columnNamesArray[index]
						: null;
					columnIds.setValue(j, morpheus.Util.copyString(columnName));
				}

			} else {
				for (var j = 0; j < ncols; j++) {
					var columnName = columnNamesArray[j + numRowAnnotations + 1];
					columnIds.setValue(j, morpheus.Util.copyString(columnName));
				}
			}

			var rowAnnotationVectors = [dataset.getRowMetadata().add(
				rowIdFieldName)];
			if (version === 3) {
				for (var j = 0; j < numRowAnnotations; j++) {
					var rowMetadataName = '' === columnNamesArray[1] ? 'description'
						: columnNamesArray[j + 1];
					rowAnnotationVectors.push(dataset.getRowMetadata().add(
						rowMetadataName));
				}

			} else {
				rowAnnotationVectors.push(dataset.getRowMetadata().add(
					columnNamesArray[1]));
			}

			var dataColumnStart = numRowAnnotations + 1;
			var ntokens = ncols + numRowAnnotations + 1;
			var linen = 3;
			if (numColumnAnnotations > 0) {
				for (var columnAnnotationIndex = 0; columnAnnotationIndex < numColumnAnnotations; columnAnnotationIndex++) {
					var tokens = reader.readLine().split(tab);
					var metadataName = tokens[0];
					var v = dataset.getColumnMetadata().add(metadataName);
					for (var j = 0; j < ncols; j++) {
						v.setValue(j, morpheus.Util.copyString(tokens[j + dataColumnStart]));
					}
				}
			}

			var nonEmptyDescriptionFound = false;
			var numRowAnnotationsPlusOne = numRowAnnotations + 1;

			for (var rowIndex = 0, nrows = dataset.getRowCount(); rowIndex < nrows; rowIndex++) {
				var s = reader.readLine();
				if (s === null) {
					throw new Error('Missing data rows.');
				}
				var tokens = s.split(tab);
				if (version === 2) {
					rowAnnotationVectors[0].setValue(rowIndex, morpheus.Util.copyString(tokens[0]));
					var desc = tokens[1];
					if (!nonEmptyDescriptionFound) {
						nonEmptyDescriptionFound = desc !== '';
					}
					rowAnnotationVectors[1].setValue(rowIndex, morpheus.Util.copyString(desc));
				} else {
					// we iterate to numRowAnnotations + 1 to include id row
					// metadata field
					for (var rowAnnotationIndex = 0; rowAnnotationIndex < numRowAnnotationsPlusOne; rowAnnotationIndex++) {
						var rowMetadataValue = tokens[rowAnnotationIndex];
						rowAnnotationVectors[rowAnnotationIndex].setValue(rowIndex,
							morpheus.Util.copyString(rowMetadataValue));

					}
				}
				for (var columnIndex = 0; columnIndex < ncols; columnIndex++) {
					var token = tokens[columnIndex + dataColumnStart];
					// if (token[0] === '{') {
					// var value = JSON.parse(token);
					// dataset.setValue(rowIndex, columnIndex, morpheus.Util
					// .wrapNumber(value.__v, value));
					// } else {
					// dataset.setValue(rowIndex, columnIndex, parseFloat(token));
					// }
					dataset.setValue(rowIndex, columnIndex, parseFloat(token));
				}

			}

			if (version === 2 && !nonEmptyDescriptionFound) {
				dataset.getRowMetadata().remove(1);
			}
			if (rowIndex !== nrows) {
				throw new Error('Missing data rows');
			}

			morpheus.MetadataUtil.maybeConvertStrings(dataset.getRowMetadata(), 1);
			morpheus.MetadataUtil.maybeConvertStrings(dataset.getColumnMetadata(),
				1);
			return dataset;
		}

	},
	_readNoChunking: function (fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util
		.getFileName(fileOrUrl));
		morpheus.BufferedReader.getArrayBuffer(fileOrUrl, function (err,
																	arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				try {
					callback(null, _this._read(name,
						new morpheus.BufferedReader(new Uint8Array(
							arrayBuffer))));
				} catch (x) {
					if (x.stack) {
						console.log(x.stack);
					}
					callback(x);
				}
			}
		});

	}
};

morpheus.GctWriter = function() {
};

morpheus.GctWriter.idFirst = function(model) {
	var fields = [ 'id', 'Id', 'pr_id' ];
	var idIndex = -1;
	for (var i = 0; i < fields.length; i++) {
		idIndex = morpheus.MetadataUtil.indexOf(model, fields[i]);
		if (idIndex !== -1) {
			break;
		}
	}
	if (idIndex !== -1) {
		var order = [];
		order[0] = idIndex;
		for (var i = 0, j = 1, count = model.getMetadataCount(); i < count; i++) {
			if (i !== idIndex) {
				order[j++] = i;
			}
		}
		return new morpheus.MetadataModelColumnView(model, order);
	}
	return model;
};

morpheus.GctWriter.prototype = {
	toString : function(value) {
		return morpheus.Util.toString(value);
	},
	write : function(dataset) {
		var pw = [];
		var rowMetadata = morpheus.GctWriter.idFirst(dataset.getRowMetadata());
		var columnMetadata = morpheus.GctWriter.idFirst(dataset
				.getColumnMetadata());
		this.writeHeader(rowMetadata, columnMetadata, pw);
		this.writeData(dataset, rowMetadata, pw);
		return pw.join('');
	},
	writeData : function(dataset, rowMetadata, pw) {
		var ncols = dataset.getColumnCount();
		var rowMetadataCount = rowMetadata.getMetadataCount();
		for (var i = 0, rows = dataset.getRowCount(); i < rows; i++) {
			for (var rowMetadataIndex = 0; rowMetadataIndex < rowMetadataCount; rowMetadataIndex++) {
				if (rowMetadataIndex > 0) {
					pw.push('\t');
				}
				var value = rowMetadata.get(rowMetadataIndex).getValue(i);
				if (value !== null) {
					pw.push(this.toString(value));
				}
			}
			for (var j = 0; j < ncols; j++) {
				pw.push('\t');
				var value = dataset.getValue(i, j);
				// pw.push((value != null && value.toObject) ? JSON
				// .stringify(value.toObject()) : morpheus.Util.nf(value));
				pw.push(morpheus.Util.nf(value));
			}
			pw.push('\n');
		}
	},
	writeHeader : function(rowMetadata, columnMetadata, pw) {
		var rows = rowMetadata.getItemCount();
		var ncols = columnMetadata.getItemCount();
		pw.push('#1.3\n');
		var rowMetadataCount = rowMetadata.getMetadataCount();
		pw.push(rows + '\t' + ncols + '\t' + (rowMetadataCount - 1) + '\t'
				+ (columnMetadata.getMetadataCount() - 1));
		pw.push('\n');
		for (var i = 0; i < rowMetadataCount; i++) {
			if (i > 0) {
				pw.push('\t');
			}
			var name = rowMetadata.get(i).getName();
			if (i === 0 && name !== columnMetadata.get(0).getName()) {
				name = name + '/' + columnMetadata.get(0).getName();
			}
			pw.push(name);
		}
		for (var j = 0; j < ncols; j++) {
			pw.push('\t');
			pw.push(this.toString(columnMetadata.get(0).getValue(j)));
		}
		pw.push('\n');
		for (var columnMetadataIndex = 1, metadataSize = columnMetadata
				.getMetadataCount(); columnMetadataIndex < metadataSize; columnMetadataIndex++) {
			pw.push(columnMetadata.get(columnMetadataIndex).getName());
			for (var i = 1; i < rowMetadataCount; i++) {
				pw.push('\t');
				pw.push('na');
			}
			for (var j = 0; j < ncols; j++) {
				pw.push('\t');
				var value = columnMetadata.get(columnMetadataIndex).getValue(j);
				if (value != null) {
					pw.push(this.toString(value));
				}
			}
			pw.push('\n');
		}
	}
};
morpheus.GctWriter12 = function() {
	this.options = {
		rowDescription : 'Description',
		rowId : 'id',
		columnId : 'id'
	};
};
morpheus.GctWriter12.prototype = {
	toString : function(value) {
		return morpheus.Util.toString(value);
	},
	write : function(dataset) {
		var pw = [];
		var rows = dataset.getRowCount();
		var columns = dataset.getColumnCount();
		var version = '#1.2';
		pw.push(version);
		pw.push('\n');
		pw.push(rows + '\t' + columns);
		pw.push('\n');
		var rowMetadata = morpheus.GctWriter.idFirst(dataset.getRowMetadata());
		var columnMetadata = morpheus.GctWriter.idFirst(dataset
				.getColumnMetadata());
		pw.push('Name');
		pw.push('\t');
		pw.push('Description');
		var columnIds = columnMetadata.getByName(this.options.columnId);
		if (!columnIds) {
			columnIds = columnMetadata.get(0);
		}
		for (var j = 0; j < columns; j++) {
			pw.push('\t');
			pw.push(this.toString(columnIds.getValue(j)));
		}
		var rowIds = rowMetadata.get(this.options.rowId);
		if (!rowIds) {
			rowIds = rowMetadata.get(0);
		}
		var rowDescriptions = rowMetadata
				.getByName(this.options.rowDescription);
		if (rowDescriptions == null && rowMetadata.getMetadataCount() > 1) {
			rowDescriptions = rowMetadata.get(1);
		}

		for (var i = 0; i < rows; i++) {
			pw.push('\n');
			pw.push(this.toString(rowIds.getValue(i)));
			pw.push('\t');
			var rowDescription = rowDescriptions != null ? rowDescriptions
					.getValue(i) : null;
			if (rowDescription != null) {
				pw.push(this.toString(rowDescription));
			}
			for (var j = 0; j < columns; j++) {
				pw.push('\t');
				pw.push(morpheus.Util.nf(dataset.getValue(i, j)));
			}
		}
		pw.push('\n');
		return pw.join('');
	}
};

morpheus.GisticReader = function() {

};
morpheus.GisticReader.prototype = {
	read : function(fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util
				.getFileName(fileOrUrl));
		morpheus.BufferedReader.getArrayBuffer(fileOrUrl, function(err,
				arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				try {
					callback(null, _this._read(name,
							new morpheus.BufferedReader(new Uint8Array(
									arrayBuffer))));
				} catch (x) {
					if (x.stack) {
						console.log(x.stack);
					}
					callback(x);
				}
			}
		});

	},
	_read : function(datasetName, reader) {
		var tab = /\t/;
		var header = morpheus.Util.trim(reader.readLine()).split(tab);

		// Unique Name, Descriptor, Wide Peak Limits, Peak Limits, Region
		// Limits, q values, Residual q values after removing segments shared
		// with higher peaks, Broad or Focal, Amplitude Threshold

		var ncols = header.length - 9;
		var matrix = [];
		var s;
		var rowIds = [];
		var qValues = [];
		while ((s = reader.readLine()) !== null) {
			s = morpheus.Util.trim(s);

			if (s !== '') {
				var tokens = s.split(tab);
				if (tokens[8] === 'Actual Copy Change Given') {
					var array = new Float32Array(ncols);
					matrix.push(array);
					rowIds.push(String($.trim(tokens[1])));
					qValues.push(parseFloat(tokens[5]));
					for (var j = 9; j <= ncols; j++) {
						var token = tokens[j];
						array[j - 9] = parseFloat(token);
					}
				}
			}
		}
		var dataset = new morpheus.Dataset({
			name : datasetName,
			rows : matrix.length,
			columns : ncols,
			array : matrix,
			dataType : 'Float32'
		});

		var columnIds = dataset.getColumnMetadata().add('id');
		for (var j = 0; j < ncols; j++) {
			columnIds.setValue(j, String(header[j + 9]));
		}

		dataset.getRowMetadata().add('id').array = rowIds;
		dataset.getRowMetadata().add('q_value').array = qValues;
		return dataset;
	}
};
morpheus.GmtDatasetReader = function() {
};
morpheus.GmtDatasetReader.prototype = {
	getFormatName : function() {
		return 'gmt';
	},
	read : function(fileOrUrl, callback) {
		var name = morpheus.Util.getBaseFileName(morpheus.Util
				.getFileName(fileOrUrl));
		morpheus.BufferedReader.getArrayBuffer(fileOrUrl, function(err,
				arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				try {
					callback(null, morpheus.DatasetUtil.geneSetsToDataset(name,
							new morpheus.GmtReader()
									.read(new morpheus.BufferedReader(
											new Uint8Array(arrayBuffer)))));
				} catch (x) {
					callback(x);
				}
			}
		});

	}
};
morpheus.GmtReader = function() {
};
morpheus.GmtReader.prototype = {
	read : function(reader) {
		var sets = [];
		var tab = /\t/;
		var s;
		while ((s = reader.readLine()) != null) {
			if (s === '' || s[0] === '#') {
				continue;
			}
			var tokens = s.split(tab);
			var name = tokens[0].trim();
			var description = tokens.length > 1 ? tokens[1].trim() : '';
			if ('BLANK' === description) {
				description = '';
			}
			var ids = [];
			for (var i = 2; i < tokens.length; i++) {
				var geneName = tokens[i].trim();
				if (geneName === '') {
					continue; // dont really expect, but for consistency
				} else {
					ids.push(geneName);
				}
			}
			var set = {
				name : name,
				description : description,
				ids : ids
			};
			set.toString = function() {
				return this.name;
			};
			sets.push(set);
		}
		return sets;
	}
};
morpheus.MafFileReader = function () {
	this.geneFilter = null;
};
morpheus.MafFileReader.summarizeMutations = function (dataset) {
	var vector = dataset.getRowMetadata().add('mutation_summary');
	vector.getProperties().set(
		morpheus.VectorKeys.FIELDS,
		['Synonymous', 'In Frame Indel', 'Other Non-Synonymous',
			'Missense', 'Splice Site', 'Frame Shift', 'Nonsense']);
	vector.getProperties().set(morpheus.VectorKeys.DATA_TYPE, '[number]');

	// v.getProperties().set(morpheus.VectorKeys.RECOMPUTE_FUNCTION, true);
	// v.getProperties().set(morpheus.VectorKeys.FUNCTION, function (view) {
	// 	var bins = new Int32Array(7); // 1-7
	// 	for (var i = 0, size = view.size(); i < size; i++) {
	// 		var value = view.getValue(i);
	// 		if (value > 0) {
	// 			bins[value - 1]++;
	// 		}
	// 	}
	// 	return bins;
	// });
	// computing dynamically screws things up b/c summary is computed for other data types (e.g. CN)
	for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
		var bins = new Int32Array(7); // 1-7
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			var value = dataset.getValue(i, j);
			if (value > 0) {
				bins[value - 1]++;
			}
		}
		vector.setValue(i, bins);
	}
};

morpheus.MafFileReader.getField = function (fieldNames, fieldNameToIndex,
											options) {
	options = $.extend({}, {
		remove: true,
		lc: false
	}, options);
	var name;
	var index;

	for (var i = 0; i < fieldNames.length; i++) {
		name = fieldNames[i];
		if (options.lc) {
			var lc = name.toLowerCase();
			index = fieldNameToIndex[lc];
		} else {
			index = fieldNameToIndex[name];
		}
		if (index !== undefined) {
			break;
		}
	}
	if (index !== undefined && options.remove) {
		for (var i = 0; i < fieldNames.length; i++) {
			if (i !== index) {
				delete fieldNameToIndex[fieldNames[i]];
			}
		}

	}
	if (index !== undefined) {
		return {
			name: name,
			index: index
		};
	}
};

morpheus.MafFileReader.VARIANT_MAP = new morpheus.Map();
// silent
morpheus.MafFileReader.VARIANT_MAP.set('Silent', 1);
// in-frame indel
morpheus.MafFileReader.VARIANT_MAP.set('In_Frame_Del', 2);
morpheus.MafFileReader.VARIANT_MAP.set('In_Frame_Ins', 2);
// other
morpheus.MafFileReader.VARIANT_MAP.set('Translation_Start_Site', 3);
morpheus.MafFileReader.VARIANT_MAP.set('Nonstop_Mutation', 3);
morpheus.MafFileReader.VARIANT_MAP.set('3\'UTR', 3);
morpheus.MafFileReader.VARIANT_MAP.set('3\'Flank', 3);
morpheus.MafFileReader.VARIANT_MAP.set('5\'UTR', 3);
morpheus.MafFileReader.VARIANT_MAP.set('5\'Flank', 3);
morpheus.MafFileReader.VARIANT_MAP.set('IGR', 3);
morpheus.MafFileReader.VARIANT_MAP.set('Intron', 3);
morpheus.MafFileReader.VARIANT_MAP.set('RNA', 3);
morpheus.MafFileReader.VARIANT_MAP.set('Targeted_Region', 3);
morpheus.MafFileReader.VARIANT_MAP.set('Unknown', 3);
// mis-sense
morpheus.MafFileReader.VARIANT_MAP.set('Missense_Mutation', 4);
// splice site
morpheus.MafFileReader.VARIANT_MAP.set('Splice_Site', 5);
// frame shift indel
morpheus.MafFileReader.VARIANT_MAP.set('Frame_Shift_Del', 6);
morpheus.MafFileReader.VARIANT_MAP.set('Frame_Shift_Ins', 6);
// non-sense
morpheus.MafFileReader.VARIANT_MAP.set('Nonsense_Mutation', 7);
morpheus.MafFileReader.prototype = {
	setGeneFilter: function (geneFilter) {
		this.geneFilter = geneFilter;
	},
	getFormatName: function () {
		return 'maf';
	},
	_getGeneLevelDataset: function (datasetName, reader) {
		var _this = this;
		var tab = /\t/;
		var header = reader.readLine().split(tab);
		var headerToIndex = {};
		for (var i = 0, length = header.length; i < length; i++) {
			var name = header[i].toLowerCase();
			headerToIndex[name] = i;
		}
		// TODO six classes of base substitution—C>A, C>G, C>T, T>A, T>C, T>G
		// (all substitutions are referred to by the pyrimidine of the mutated
		// Watson–Crick base pair)
		var fields = ['Hugo_Symbol', 'Chromosome', 'Start_position',
			'Reference_Allele', 'Tumor_Seq_Allele2',
			'Variant_Classification', 'Protein_Change', 'ccf_hat',
			'tumor_f', 'i_tumor_f', 'Tumor_Sample_Barcode', 'tumor_name',
			'Tumor_Sample_UUID'];
		var fieldNameToIndex = {};

		for (var i = 0, length = fields.length; i < length; i++) {
			var index = headerToIndex[fields[i].toLowerCase()];
			if (index !== undefined) {
				fieldNameToIndex[fields[i].toLowerCase()] = index;
			}
		}
		var sampleField = morpheus.MafFileReader.getField([
				'Tumor_Sample_Barcode', 'tumor_name', 'Tumor_Sample_UUID'],
			fieldNameToIndex, {
				lc: true,
				remove: true
			});
		if (sampleField == null) {
			throw new Error('Sample id column not found.');
		}
		var sampleColumnName = sampleField.name;
		var sampleIdColumnIndex = sampleField.index;
		var tumorFractionField = morpheus.MafFileReader.getField(['ccf_hat',
			'tumor_f', 'i_tumor_f'], fieldNameToIndex, {
			lc: true,
			remove: true
		});
		var ccfColumnName;
		var ccfColumnIndex;
		if (tumorFractionField !== undefined) {
			ccfColumnName = tumorFractionField.name;
			ccfColumnIndex = tumorFractionField.index;
		}
		var chromosomeColumn = fieldNameToIndex['Chromosome'.toLowerCase()];
		var startPositionColumn = fieldNameToIndex['Start_position'
		.toLowerCase()];
		var refAlleleColumn = fieldNameToIndex['Reference_Allele'.toLowerCase()];
		var tumorAllelColumn = fieldNameToIndex['Tumor_Seq_Allele2'
		.toLowerCase()];
		var proteinChangeColumn = fieldNameToIndex['Protein_Change'
		.toLowerCase()];
		var geneSymbolColumn = fieldNameToIndex['Hugo_Symbol'.toLowerCase()];
		if (geneSymbolColumn == null) {
			throw new Error('Gene symbol column not found.');
		}
		var variantColumnIndex = headerToIndex['Variant_Classification'
		.toLowerCase()];
		if (variantColumnIndex === undefined) {
			throw new Error('Variant_Classification not found');
		}
		// keep fields that are in file only
		fields = [];
		var geneFields = [];
		for (var key in fieldNameToIndex) {
			if (key !== sampleColumnName && key !== ccfColumnName) {
				geneFields.push(key);
			}
			fields.push(key);
		}
		var geneColumnIndices = geneFields.map(function (field) {
			return fieldNameToIndex[field];
		});
		var nGeneFields = geneColumnIndices.length;
		var geneSymbolToIndex = new morpheus.Map();
		var sampleIdToIndex = new morpheus.Map();
		var variantMatrix = [];
		var ccfMatrix = [];
		var s;
		while ((s = reader.readLine()) !== null) {
			var tokens = s.split(tab);
			var sample = String(tokens[sampleIdColumnIndex]);
			var columnIndex = sampleIdToIndex.get(sample);
			if (columnIndex === undefined) {
				columnIndex = sampleIdToIndex.size();
				sampleIdToIndex.set(sample, columnIndex);
			}
			var gene = String(tokens[geneSymbolColumn]);
			if (gene === 'Unknown') {
				continue;
			}
			if (this.geneFilter == null
				|| this.geneFilter.has(tokens[geneSymbolColumn])) {
				var rowIndex = geneSymbolToIndex.get(gene);
				if (rowIndex === undefined) {
					rowIndex = geneSymbolToIndex.size();
					geneSymbolToIndex.set(gene, rowIndex);
				}
				var value = String(tokens[variantColumnIndex]);
				var variantCode = morpheus.MafFileReader.VARIANT_MAP.get(value);
				if (variantCode === undefined) {
					variantCode = 3;
				}
				var variantObject = {};
				var Protein_Change = tokens[proteinChangeColumn];
				if (Protein_Change) {
					variantObject.Protein = String(Protein_Change);
				}
				variantObject.__v = variantCode;
				variantObject.Variant = value;
				variantObject.Mutation = String(tokens[chromosomeColumn]) + ':'
					+ String(tokens[startPositionColumn]) + ' '
					+ String(tokens[refAlleleColumn]) + ' > '
					+ String(tokens[tumorAllelColumn]);
				var wrappedVariant = morpheus.Util.wrapNumber(variantCode,
					variantObject);
				var variantRow = variantMatrix[rowIndex];
				if (variantRow === undefined) {
					variantRow = [];
					variantMatrix[rowIndex] = variantRow;
				}
				var ccf = -1;
				var priorCcf = -1;
				if (ccfColumnIndex !== undefined) {
					var ccfRow = ccfMatrix[rowIndex];
					if (ccfRow === undefined) {
						ccfRow = [];
						ccfMatrix[rowIndex] = ccfRow;
					}
					ccf = parseFloat(tokens[ccfColumnIndex]);
					priorCcf = ccfRow[columnIndex] || -1;
				}
				var priorValue = variantRow[columnIndex] || -1;
				if (variantCode > priorValue) { // take most severe mutation
					variantRow[columnIndex] = wrappedVariant;
					if (ccfColumnIndex !== undefined) {
						ccfRow[columnIndex] = ccf;
					}
				} else if (variantCode === priorValue && ccf > priorCcf) {
					variantRow[columnIndex] = wrappedVariant;
					ccfRow[columnIndex] = ccf;
				}
			}
		}
		var dataset = new morpheus.Dataset({
			name: datasetName,
			array: variantMatrix,
			dataType: 'object',
			rows: geneSymbolToIndex.size(),
			columns: sampleIdToIndex.size()
		});
		var columnIds = dataset.getColumnMetadata().add('id');
		sampleIdToIndex.forEach(function (index, id) {
			columnIds.setValue(index, id);
		});
		var rowIds = dataset.getRowMetadata().add('id');
		geneSymbolToIndex.forEach(function (index, id) {
			rowIds.setValue(index, id);
		});
		for (var i = 0, nrows = dataset.getRowCount(), ncols = dataset
		.getColumnCount(); i < nrows; i++) {
			for (var j = 0; j < ncols; j++) {
				if (variantMatrix[i][j] === undefined) {
					variantMatrix[i][j] = 0;
				}
			}
		}
		if (ccfColumnIndex !== undefined) {
			dataset.addSeries({
				dataType: 'object',
				name: 'allelic_fraction',
				array: ccfMatrix
			});
		}
		if (this.geneFilter) {
			var orderVector = dataset.getRowMetadata().add('order');
			for (var i = 0, size = orderVector.size(); i < size; i++) {
				var gene = rowIds.getValue(i);
				var order = this.geneFilter.get(gene);
				orderVector.setValue(i, order);
			}
			var project = new morpheus.Project(dataset);
			project.setRowSortKeys([new morpheus.SortKey('order',
				morpheus.SortKey.SortOrder.ASCENDING)], true); // sort
			// collapsed
			// dataset
			var tmp = project.getSortedFilteredDataset();
			project = new morpheus.Project(tmp);
			var columnIndices = morpheus.Util.seq(tmp.getColumnCount());
			columnIndices
			.sort(function (a, b) {
				for (var i = 0, nrows = tmp.getRowCount(); i < nrows; i++) {
					for (var seriesIndex = 0, nseries = tmp
					.getSeriesCount(); seriesIndex < nseries; seriesIndex++) {
						var f1 = tmp.getValue(i, a, seriesIndex);
						if (isNaN(f1)) {
							f1 = Number.NEGATIVE_INFINITY;
						}
						f1 = f1.valueOf();
						var f2 = tmp.getValue(i, b, seriesIndex);
						if (isNaN(f2)) {
							f2 = Number.NEGATIVE_INFINITY;
						}
						f2 = f2.valueOf();
						var returnVal = (f1 === f2 ? 0 : (f1 < f2 ? 1
							: -1));
						if (returnVal !== 0) {
							return returnVal;
						}
					}
				}
				return 0;
			});
			dataset = new morpheus.SlicedDatasetView(dataset, null,
				columnIndices);
		}
		morpheus.MafFileReader.summarizeMutations(dataset);
		morpheus.MafFileReader
		.summarizeMutations(new morpheus.TransposedDatasetView(dataset));
		return dataset;
	},
	read: function (fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util
		.getFileName(fileOrUrl));
		morpheus.BufferedReader.getArrayBuffer(fileOrUrl, function (err,
																	arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				try {
					callback(null, _this._getGeneLevelDataset(name,
						new morpheus.BufferedReader(new Uint8Array(
							arrayBuffer))));
				} catch (err) {
					callback(err);
				}
			}
		});

	}
};

morpheus.SegTabReader = function() {
	this.regions = null;
};
morpheus.SegTabReader.binByRegion = function(dataset, regions) {

	var chromosomeVector = dataset.getRowMetadata().getByName('Chromosome');
	var startVector = dataset.getRowMetadata().getByName('Start_bp');
	var endVector = dataset.getRowMetadata().getByName('End_bp');

	var collapsedDataset = new morpheus.Dataset({
		name : dataset.getName(),
		rows : regions.length,
		columns : dataset.getColumnCount(),
		dataType : 'Float32'
	});
	morpheus.DatasetUtil.fill(collapsedDataset, NaN);
	var regionIdVector = collapsedDataset.getRowMetadata().add('id');
	var newChromosomeVector = collapsedDataset.getRowMetadata().add(
			'chromosome');
	var newStartVector = collapsedDataset.getRowMetadata().add('start');
	var newEndVector = collapsedDataset.getRowMetadata().add('end');
	var nsegmentsVector = collapsedDataset.getRowMetadata().add('nsegments');
	var nseries = dataset.getSeriesCount();

	for (var series = 1; series < nseries; series++) {
		collapsedDataset.addSeries({
			name : dataset.getName(series),
			dataType : 'Float32'
		});

	}

	var summarizeFunction = morpheus.Mean;
	collapsedDataset.setColumnMetadata(dataset.getColumnMetadata());
	for (var regionIndex = 0; regionIndex < regions.length; regionIndex++) {
		var region = regions[regionIndex];
		var rowIndices = [];
		for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
			var chromosome = chromosomeVector.getValue(i);
			var start = startVector.getValue(i);
			var end = endVector.getValue(i);
			if (region.chromosome == chromosome && start >= region.start
					&& end <= region.end) {
				rowIndices.push(i);
			}
		}
		if (rowIndices.length > 0) {
			var slice = morpheus.DatasetUtil.slicedView(dataset, rowIndices,
					null);
			var columnView = new morpheus.DatasetColumnView(slice);
			for (var j = 0; j < dataset.getColumnCount(); j++) {
				columnView.setIndex(j);
				for (var series = 0; series < nseries; series++) {
					columnView.setSeriesIndex(series);
					collapsedDataset.setValue(regionIndex, j,
							summarizeFunction(columnView), series);
				}

			}
		}
		nsegmentsVector.setValue(regionIndex, rowIndices.length);
		regionIdVector.setValue(regionIndex, region.id);
		newChromosomeVector.setValue(regionIndex, region.chromosome);
		newStartVector.setValue(regionIndex, region.start);
		newEndVector.setValue(regionIndex, region.end);
	}
	return collapsedDataset;
};

morpheus.SegTabReader.prototype = {
	getFormatName : function() {
		return 'seg';
	},
	setRegions : function(regions) {
		this.regions = regions;
	},
	_read : function(datasetName, reader) {
		var tab = /\t/;
		var header = reader.readLine().split(tab);
		var fieldNameToIndex = {};
		for (var i = 0, length = header.length; i < length; i++) {
			var name = header[i].toLowerCase();
			fieldNameToIndex[name] = i;
		}

		var sampleField = morpheus.MafFileReader.getField([ 'pair_id',
				'Tumor_Sample_Barcode', 'tumor_name', 'Tumor_Sample_UUID',
				'Sample' ], fieldNameToIndex, {
					remove : false,
					lc : true
				});
		var sampleColumnName = sampleField.name;
		var sampleIdColumnIndex = sampleField.index;
		var tumorFractionField = morpheus.MafFileReader.getField([ 'ccf_hat',
				'tumor_f', 'i_tumor_f' ], fieldNameToIndex, {
					remove : false,
					lc : true
				});
		var ccfColumnName;
		var ccfColumnIndex;
		if (tumorFractionField !== undefined) {
			ccfColumnName = tumorFractionField.name;
			ccfColumnIndex = tumorFractionField.index;
		}
		var chromosomeColumn = fieldNameToIndex.Chromosome;
		var startPositionColumn = morpheus.MafFileReader.getField([ 'Start_bp',
				'Start' ], fieldNameToIndex, {
					remove : false,
					lc : true
				}).index;
		var endPositionColumn = morpheus.MafFileReader.getField([ 'End_bp',
				'End' ], fieldNameToIndex, {
					remove : false,
					lc : true
				}).index;
		var valueField = morpheus.MafFileReader.getField([ 'tau',
				'Segment_Mean' ], fieldNameToIndex, {
					remove : false,
					lc : true
				}).index;

		var s;
		var matrix = [];
		var ccfMatrix = [];
		var sampleIdToIndex = new morpheus.Map();
		var chromosomeStartEndToIndex = new morpheus.Map();
		while ((s = reader.readLine()) !== null) {
			if (s === '') {
				continue;
			}
			var tokens = s.split(tab);
			var sample = String(tokens[sampleIdColumnIndex]);
			var columnIndex = sampleIdToIndex.get(sample);
			if (columnIndex === undefined) {
				columnIndex = sampleIdToIndex.size();
				sampleIdToIndex.set(sample, columnIndex);
			}
			var rowId = new morpheus.Identifier([
				String(tokens[chromosomeColumn]),
				String(tokens[startPositionColumn]),
				String(tokens[endPositionColumn]) ]);

			var rowIndex = chromosomeStartEndToIndex.get(rowId);
			if (rowIndex === undefined) {
				rowIndex = chromosomeStartEndToIndex.size();
				chromosomeStartEndToIndex.set(rowId, rowIndex);
			}
			var value = parseFloat(String(tokens[valueField]));
			value = isNaN(value) ? value : (morpheus.Log2(value) - 1);
			var matrixRow = matrix[rowIndex];
			if (matrixRow === undefined) {
				matrixRow = [];
				matrix[rowIndex] = matrixRow;
				if (ccfColumnIndex !== undefined) {
					ccfMatrix[rowIndex] = [];
				}
			}
			matrixRow[columnIndex] = value;
			if (ccfColumnIndex !== undefined) {
				ccfMatrix[rowIndex][columnIndex] = parseFloat(tokens[ccfColumnIndex]);
			}
		}
		var dataset = new morpheus.Dataset({
			name : datasetName,
			array : matrix,
			dataType : 'object',
			rows : chromosomeStartEndToIndex.size(),
			columns : sampleIdToIndex.size()
		});

		var columnIds = dataset.getColumnMetadata().add('id');
		sampleIdToIndex.forEach(function(index, id) {
			columnIds.setValue(index, id);
		});

		var chromosomeVector = dataset.getRowMetadata().add('Chromosome');
		var startVector = dataset.getRowMetadata().add('Start_bp');
		var endVector = dataset.getRowMetadata().add('End_bp');
		chromosomeStartEndToIndex.forEach(function(index, id) {
			chromosomeVector.setValue(index, id.getArray()[0]);
			startVector.setValue(index, id.getArray()[1]);
			endVector.setValue(index, id.getArray()[2]);
		});

		if (ccfColumnIndex !== undefined) {
			dataset.addSeries({
				dataType : 'object',
				name : 'ccf',
				array : ccfMatrix
			});
		}

		if (this.regions != null && this.regions.length > 0) {
			dataset = morpheus.SegTabReader.binByRegion(dataset, this.regions);
		}
		return dataset;
	},
	read : function(fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util
				.getFileName(fileOrUrl));
		morpheus.BufferedReader.getArrayBuffer(fileOrUrl, function(err,
				arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				// try {
				callback(null, _this._read(name, new morpheus.BufferedReader(
						new Uint8Array(arrayBuffer))));
				// } catch (err) {
				// callback(err);
				// }
			}
		});

	}
};

morpheus.TcgaUtil = function () {

};

morpheus.TcgaUtil.DISEASE_STUDIES = {
	"ACC": "Adrenocortical carcinoma",
	"BLCA": "Bladder Urothelial Carcinoma",
	"BRCA": "Breast invasive carcinoma",
	"CESC": "Cervical squamous cell carcinoma and endocervical adenocarcinoma",
	"CHOL": "Cholangiocarcinoma",
//	"CNTL": "Controls",
	"COAD": "Colon adenocarcinoma",
	"COADREAD": "Colonrectal adenocarcinoma",
	"DLBC": "Lymphoid Neoplasm Diffuse Large B-cell Lymphoma",
	"ESCA": "Esophageal carcinoma ",
//	"FPPP": "FFPE Pilot Phase II",
	"GBM": "Glioblastoma multiforme",
	"GBMLGG": "Glioma",
	"HNSC": "Head and Neck squamous cell carcinoma",
	"KICH": "Kidney Chromophobe",
	"KIPAN": "Pan-Kidney Cohort",
	"KIRC": "Kidney renal clear cell carcinoma",
	"KIRP": "Kidney renal papillary cell carcinoma",
	"LAML": "Acute Myeloid Leukemia",
	"LCML": "Chronic Myelogenous Leukemia",
	"LGG": "Brain Lower Grade Glioma",
	"LIHC": "Liver hepatocellular carcinoma",
	"LUAD": "Lung adenocarcinoma",
	"LUSC": "Lung squamous cell carcinoma",
	"MESO": "Mesothelioma",
//	"MISC": "Miscellaneous",
	"OV": "Ovarian serous cystadenocarcinoma",
	"PAAD": "Pancreatic adenocarcinoma",
	"PCPG": "Pheochromocytoma and Paraganglioma",
	"PRAD": "Prostate adenocarcinoma",
	"READ": "Rectum adenocarcinoma",
	"SARC": "Sarcoma",
	"SKCM": "Skin Cutaneous Melanoma",
	"STAD": "Stomach adenocarcinoma",
	"STES": "Stomach and Esophageal Carcinoma",
	"TGCT": "Testicular Germ Cell Tumors",
	"THCA": "Thyroid carcinoma",
	"THYM": "Thymoma",
	"UCEC": "Uterine Corpus Endometrial Carcinoma",
	"UCS": "Uterine Carcinosarcoma",
	"UVM": "Uveal Melanoma"
};

morpheus.TcgaUtil.SAMPLE_TYPES = {
	'01': 'Primary solid Tumor',
	'02': 'Recurrent Solid Tumor',
	'03': 'Primary Blood Derived Cancer - Peripheral Blood',
	'04': 'Recurrent Blood Derived Cancer - Bone Marrow',
	'05': 'Additional - New Primary',
	'06': 'Metastatic',
	'07': 'Additional Metastatic',
	'08': 'Human Tumor Original Cells',
	'09': 'Primary Blood Derived Cancer - Bone Marrow',
	'10': 'Blood Derived Normal',
	'11': 'Solid Tissue Normal',
	'12': 'Buccal Cell Normal',
	'13': 'EBV Immortalized Normal',
	'14': 'Bone Marrow Normal',
	'20': 'Control Analyte',
	'40': 'Recurrent Blood Derived Cancer - Peripheral Blood',
	'50': 'Cell Lines',
	'60': 'Primary Xenograft Tissue',
	'61': 'Cell Line Derived Xenograft Tissue'
};

morpheus.TcgaUtil.barcode = function (s) {
	var tokens = s.split('-');
	var id = tokens[2];
	var sampleType;
	// e.g. TCGA-AC-A23H-01A-11D-A159-09
	if (tokens.length > 3) {
		sampleType = tokens[3];
		if (sampleType.length > 2) {
			sampleType = sampleType.substring(0, 2);
		}
		sampleType = morpheus.TcgaUtil.SAMPLE_TYPES[sampleType];
	} else {
		sampleType = morpheus.TcgaUtil.SAMPLE_TYPES['01'];
	}
	return {
		id: id.toLowerCase(),
		sampleType: sampleType
	};
};

morpheus.TcgaUtil.setIdAndSampleType = function (dataset) {
	var idVector = dataset.getColumnMetadata().get(0);
	var participantId = dataset.getColumnMetadata().add('participant_id');
	var sampleType = dataset.getColumnMetadata().add('sample_type');
	for (var i = 0, size = idVector.size(); i < size; i++) {
		var barcode = morpheus.TcgaUtil.barcode(idVector.getValue(i));
		idVector.setValue(i, barcode.id + '-' + barcode.sampleType);
		sampleType.setValue(i, barcode.sampleType);
		participantId.setValue(i, barcode.id);
	}
};

morpheus.TcgaUtil.getDataset = function (options) {
	var promises = [];
	var datasets = [];
	var returnDeferred = $.Deferred();

	if (options.mrna) {
		// id + type
		var mrna = $.Deferred();
		promises.push(mrna);
		new morpheus.TxtReader().read(options.mrna, function (err, dataset) {
			if (err) {
				console.log('Error reading file:' + err);
			} else {
				datasets.push(dataset);
				morpheus.TcgaUtil.setIdAndSampleType(dataset);
			}
			mrna.resolve();
		});
	}
	var sigGenesLines;
	if (options.mutation) {
		var mutation = $.Deferred();
		promises.push(mutation);
		new morpheus.MafFileReader().read(options.mutation, function (err,
																	  dataset) {
			if (err) {
				console.log('Error reading file:' + err);
			} else {
				datasets.push(dataset);
				morpheus.TcgaUtil.setIdAndSampleType(dataset);
			}
			mutation.resolve();
		});
		var sigGenesAnnotation = morpheus.Util.readLines(options.sigGenes);
		sigGenesAnnotation.done(function (lines) {
			sigGenesLines = lines;
		});
		promises.push(sigGenesAnnotation);
	}
	if (options.gistic) {
		var gistic = $.Deferred();
		promises.push(gistic);
		new morpheus.GisticReader().read(options.gistic,
			function (err, dataset) {
				if (err) {
					console.log('Error reading file:' + err);
				} else {
					datasets.push(dataset);
					morpheus.TcgaUtil.setIdAndSampleType(dataset);
				}
				gistic.resolve();
			});

	}
	if (options.gisticGene) {
		var gisticGene = $.Deferred();
		promises.push(gisticGene);

		new morpheus.TxtReader({
			dataColumnStart: 3

		}).read(options.gisticGene, function (err, dataset) {
			if (err) {
				console.log('Error reading file:' + err);
			} else {
				datasets.push(dataset);
				morpheus.TcgaUtil.setIdAndSampleType(dataset);
			}
			gisticGene.resolve();
		});

	}
	if (options.seg) {
		var seg = $.Deferred();
		promises.push(seg);
		new morpheus.SegTabReader().read(options.seg, function (err, dataset) {
			if (err) {
				console.log('Error reading file:' + err);
			} else {
				datasets.push(dataset);
				morpheus.TcgaUtil.setIdAndSampleType(dataset);
			}
			seg.resolve();
		});
	}
	if (options.rppa) {
		// id + type
		var rppa = $.Deferred();
		promises.push(rppa);

		new morpheus.TxtReader().read(options.rppa, function (err, dataset) {
			if (err) {
				console.log('Error reading file:' + err);
			} else {
				datasets.push(dataset);
				morpheus.TcgaUtil.setIdAndSampleType(dataset);
			}

			rppa.resolve();
		});

	}
	if (options.methylation) {
		// id + type
		var methylation = $.Deferred();
		promises.push(methylation);
		new morpheus.TxtReader({}).read(options.methylation, function (err,
																	   dataset) {
			if (err) {
				console.log('Error reading file:' + err);
			} else {
				datasets.push(dataset);
				morpheus.TcgaUtil.setIdAndSampleType(dataset);
			}
			methylation.resolve();
		});
	}

	var mrnaClustPromise = morpheus.Util.readLines(options.mrnaClust);
	promises.push(mrnaClustPromise);
	var sampleIdToClusterId;
	mrnaClustPromise.done(function (lines) {
		// SampleName cluster silhouetteValue
		// SampleName cluster silhouetteValue
		// TCGA-OR-A5J1-01 1 0.00648776228925048
		sampleIdToClusterId = new morpheus.Map();
		var lineNumber = 0;
		while (lines[lineNumber].indexOf('SampleName') !== -1) {
			lineNumber++;
		}
		var tab = /\t/;
		for (; lineNumber < lines.length; lineNumber++) {
			var tokens = lines[lineNumber].split(tab);
			var barcode = morpheus.TcgaUtil.barcode(tokens[0]);
			sampleIdToClusterId.set(barcode.id + '-' + barcode.sampleType, tokens[1]);
		}
	});
	var annotationCallbacks = [];
	var annotationDef = null;
	if (options.columnAnnotations) {
		annotationDef = morpheus.DatasetUtil.annotate({
			annotations: options.columnAnnotations,
			isColumns: true
		});
		promises.push(annotationDef);
		annotationDef.done(function (array) {
			annotationCallbacks = array;
		});
	}
	$.when.apply($, promises).then(
		function () {
			var datasetToReturn = null;
			if (datasets.length === 1) {
				var sourceName = datasets[0].getName();
				var sourceVector = datasets[0].getRowMetadata().add(
					'Source');
				for (var i = 0; i < sourceVector.size(); i++) {
					sourceVector.setValue(i, sourceName);
				}
				datasetToReturn = datasets[0];

			} else {
				var maxIndex = 0;
				var maxColumns = datasets[0].getColumnCount();
				// use dataset with most columns as the reference or
				// mutation data
				for (var i = 1; i < datasets.length; i++) {
					if (datasets[i].getColumnCount() > maxColumns) {
						maxColumns = datasets[i].getColumnCount();
						maxIndex = i;
					}
					if (datasets[i].getName() === 'mutations_merged.maf') {
						maxColumns = Number.MAX_VALUE;
						maxIndex = i;
					}
				}
				var datasetIndices = [];
				datasetIndices.push(maxIndex);
				for (var i = 0; i < datasets.length; i++) {
					if (i !== maxIndex) {
						datasetIndices.push(i);
					}
				}

				var joined = new morpheus.JoinedDataset(
					datasets[datasetIndices[0]],
					datasets[datasetIndices[1]], 'id', 'id');
				for (var i = 2; i < datasetIndices.length; i++) {
					joined = new morpheus.JoinedDataset(joined,
						datasets[datasetIndices[i]], 'id', 'id');
				}
				datasetToReturn = joined;
			}

			var clusterIdVector = datasetToReturn.getColumnMetadata().add(
				'mRNAseq_cluster');
			var idVector = datasetToReturn.getColumnMetadata().getByName(
				'id');
			for (var j = 0, size = idVector.size(); j < size; j++) {
				clusterIdVector.setValue(j, sampleIdToClusterId
				.get(idVector.getValue(j)));
			}
			// view in space of mutation sample ids only
			if (options.mutation) {
				var sourceToIndices = morpheus.VectorUtil
				.createValueToIndicesMap(datasetToReturn
				.getRowMetadata().getByName('Source'));
				var mutationDataset = new morpheus.SlicedDatasetView(
					datasetToReturn, sourceToIndices
					.get('mutations_merged.maf'));
				new morpheus.OpenFileTool()
				.annotate(sigGenesLines, mutationDataset, false,
					null, 'id', 'gene', ['q']);
				var qVector = mutationDataset.getRowMetadata().getByName(
					'q');
				var qValueVector = mutationDataset.getRowMetadata()
				.getByName('q_value');
				if (qValueVector == null) {
					qValueVector = mutationDataset.getRowMetadata().add(
						'q_value');
				}
				for (var i = 0, size = qValueVector.size(); i < size; i++) {
					qValueVector.setValue(i, qVector.getValue(i));
				}

				mutationDataset.getRowMetadata().remove(
					morpheus.MetadataUtil.indexOf(mutationDataset
					.getRowMetadata(), 'q'));
			}
			if (annotationDef) {
				annotationCallbacks.forEach(function (f) {
					f(datasetToReturn);
				});
			}
			returnDeferred.resolve(datasetToReturn);
		});
	return returnDeferred;
};

morpheus.TxtReader = function (options) {
	this.options = $.extend({}, {
		dataRowStart: 1,
		dataColumnStart: 1
	}, options);
};
morpheus.TxtReader.prototype = {
	read: function (fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util
		.getFileName(fileOrUrl));
		morpheus.BufferedReader.getArrayBuffer(fileOrUrl, function (err,
																	arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				try {
					callback(null, _this._read(name,
						new morpheus.BufferedReader(new Uint8Array(
							arrayBuffer))));
				} catch (x) {
					callback(x);
				}
			}
		});

	},
	_read: function (datasetName, reader) {
		var tab = /\t/;
		var header = morpheus.Util.trim(reader.readLine()).split(tab);
		if (this.options.dataRowStart > 1) {
			for (var i = 1; i < this.options.dataRowStart; i++) {
				reader.readLine();
			}
		}
		var dataColumnStart = this.options.dataColumnStart;
		var ncols = header.length - dataColumnStart;
		var matrix = [];
		var s;
		var arrayOfRowArrays = [];
		for (var i = 0; i < dataColumnStart; i++) {
			arrayOfRowArrays.push([]);
		}

		while ((s = reader.readLine()) !== null) {
			s = morpheus.Util.trim(s);
			if (s !== '') {
				var array = new Float32Array(ncols);
				matrix.push(array);
				var tokens = s.split(tab);
				for (var j = 0; j < dataColumnStart; j++) {
					// row metadata
					arrayOfRowArrays[j].push(morpheus.Util.copyString(tokens[j]));
				}
				for (var j = dataColumnStart; j <= ncols; j++) {
					var token = tokens[j];
					array[j - dataColumnStart] = parseFloat(token);
				}
			}
		}
		var dataset = new morpheus.Dataset({
			name: datasetName,
			rows: matrix.length,
			columns: ncols,
			array: matrix,
			dataType: 'Float32'
		});

		var columnIds = dataset.getColumnMetadata().add('id');
		for (var i = 0, j = dataColumnStart; i < ncols; i++, j++) {
			columnIds.setValue(i, morpheus.Util.copyString(header[j]));
		}
		var rowIdVector = dataset.getRowMetadata().add('id');
		rowIdVector.array = arrayOfRowArrays[0];
		for (var i = 1; i < dataColumnStart; i++) {
			var v = dataset.getRowMetadata().add(header[i]);
			v.array = arrayOfRowArrays[i];
		}

		return dataset;
	}
};

morpheus.XlsxDatasetReader = function() {
};
morpheus.XlsxDatasetReader.prototype = {
	read : function(fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util
				.getFileName(fileOrUrl));
		morpheus.BufferedReader.getArrayBuffer(fileOrUrl, function(err,
				arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				try {
					var data = new Uint8Array(arrayBuffer);
					var arr = [];
					for (var i = 0; i != data.length; ++i) {
						arr[i] = String.fromCharCode(data[i]);
					}
					var bstr = arr.join('');
					callback(null, _this._read(name, bstr));
				} catch (x) {
					callback(x);
				}
			}
		});

	},

	_read : function(datasetName, bstr) {
		var lines = morpheus.Util.xlsxTo2dArray(bstr);
		var nrows = lines.length - 1;
		var header = lines[0];
		var ncols = header.length - 1;
		var dataset = new morpheus.Dataset({
			name : datasetName,
			rows : nrows,
			columns : ncols
		});
		var columnIds = dataset.getColumnMetadata().add('id');
		for (var j = 1; j <= ncols; j++) {
			columnIds.setValue(j - 1, header[j]);
		}
		var rowIds = dataset.getRowMetadata().add('id');
		for (var i = 1; i < lines.length; i++) {
			var tokens = lines[i];
			rowIds.setValue(i - 1, tokens[0]);
			for (var j = 1; j <= ncols; j++) {
				var token = tokens[j];
				var value = parseFloat(token);
				dataset.setValue(i - 1, j - 1, value);
			}
		}
		return dataset;
	}
};

morpheus.VectorAdapter = function(v) {
	if (v == null) {
		throw 'vector is null';
	}
	this.v = v;
};
morpheus.VectorAdapter.prototype = {
	setValue : function(i, value) {
		this.v.setValue(i, value);
	},
	getValue : function(i) {
		return this.v.getValue(i);
	},
	getProperties : function() {
		return this.v.getProperties();
	},
	size : function() {
		return this.v.size();
	},
	getName : function() {
		return this.v.getName();
	},
	setName : function(name) {
		this.v.setName(name);
	}
};
/**
 * @fileOverview The interface for a dataset consisting of a two-dimensional matrix of
 * values. A dataset may also optionally contain one or more series of
 * two-dimensional matrices. A dataset also has metadata associated with each
 * row and column.
 */
/**
 * Creates a new dataset with the specified name and dimensions.
 * 
 * @constructor
 */
morpheus.AbstractDataset = function(name, rows, columns) {
	this.seriesNames = [ name ];
	this.seriesArrays = [];
	this.seriesDataTypes = [];
	this.rows = rows;
	this.columns = columns;
	this.rowMetadataModel = new morpheus.MetadataModel(rows);
	this.columnMetadataModel = new morpheus.MetadataModel(columns);

};
morpheus.AbstractDataset.prototype = {
	/**
	 * @ignore
	 * @param metadata
	 */
	setRowMetadata : function(metadata) {
		this.rowMetadataModel = metadata;
	},
	/**
	 * @ignore
	 * @param metadata
	 */
	setColumnMetadata : function(metadata) {
		this.columnMetadataModel = metadata;
	},
	/**
	 * Returns the name for the given series. Series can be used to store
	 * standard error of data points for example.
	 * 
	 * @param seriesIndex
	 *            the series
	 * @return the series name
	 */
	getName : function(seriesIndex) {
		return this.seriesNames[seriesIndex || 0];
	},
	/**
	 * Sets the name for the given series. Series can be used to store standard
	 * error of data points for example.
	 * 
	 * @param seriesIndex
	 *            the series *
	 * @param name
	 *            the series name
	 */
	setName : function(seriesIndex, name) {
		this.seriesNames[seriesIndex || 0] = name;
	},
	/**
	 * Gets the row metadata for this dataset.
	 * 
	 * @return the row metadata
	 */
	getRowMetadata : function() {
		return this.rowMetadataModel;
	},
	/**
	 * Gets the column metadata for this dataset.
	 * 
	 * @return The column metadata
	 */
	getColumnMetadata : function() {
		return this.columnMetadataModel;
	},
	/**
	 * Returns the number of rows in the dataset.
	 * 
	 * @return the number of rows
	 */
	getRowCount : function() {
		return this.rows;
	},
	/**
	 * Returns the number of columns in the dataset.
	 * 
	 * @return the number of columns
	 */
	getColumnCount : function() {
		return this.columns;
	},
	/**
	 * Returns the value at the given row and column for the given series.
	 * Series can be used to store standard error of data points for example.
	 * 
	 * @param rowIndex
	 *            the row index
	 * @param columnIndex
	 *            the column index
	 * @param seriesIndex
	 *            the series index
	 * @return the value
	 */
	getValue : function(rowIndex, columnIndex, seriesIndex) {
		// not implemented
	},
	/**
	 * Sets the value at the given row and column for the given series.
	 * 
	 * @param rowIndex
	 *            the row index
	 * 
	 * @param columnIndex
	 *            the column index
	 * @param value
	 *            the value
	 * @param seriesIndex
	 *            the series index
	 * 
	 */
	setValue : function(rowIndex, columnIndex, value, seriesIndex) {
		// not implemented
	},
	/**
	 * Adds the specified series.
	 * 
	 * @param options
	 * @param options.name
	 *            the series name
	 * @param options.dataType
	 *            the series data type (e.g. object, Float32, Int8)
	 * @return the series index
	 */
	addSeries : function(options) {
		// not implemented
	},
	/**
	 * Returns the number of matrix series. Series can be used to store standard
	 * error of data points for example.
	 * 
	 * @return the number of series
	 */
	getSeriesCount : function() {
		return this.seriesArrays.length;
	},
	/**
	 * Returns the data type at the specified row and series index.
	 * 
	 * @param rowIndex
	 *            the row index
	 * @param seriesIndex
	 *            the series index
	 * @return the series data type (e.g. object, Float32, Int8)
	 */
	getDataType : function(rowIndex, seriesIndex) {
		return this.seriesDataTypes[seriesIndex];
	},
	toString : function() {
		return this.getName();
	}
};
morpheus.SignalToNoise = function(list1, list2) {
	var m1 = morpheus.Mean(list1);
	var m2 = morpheus.Mean(list2);
	var s1 = Math.sqrt(morpheus.Variance(list1, m1));
	var s2 = Math.sqrt(morpheus.Variance(list2, m2));
	return (m1 - m2) / (s1 + s2);
};
morpheus.SignalToNoise.toString = function() {
	return 'Signal to noise';
};

morpheus.createSignalToNoiseAdjust = function(percent) {
	percent = percent || 0.2;
	var f = function(list1, list2) {
		var m1 = morpheus.Mean(list1);
		var m2 = morpheus.Mean(list2);
		var s1 = Math.sqrt(morpheus.Variance(list1, m1));
		var s2 = Math.sqrt(morpheus.Variance(list2, m2));
		s1 = morpheus.SignalToNoise.thresholdStandardDeviation(m1, s1, percent);
		s2 = morpheus.SignalToNoise.thresholdStandardDeviation(m2, s2, percent);
		// ensure variance is at least 20% of mean
		return (m1 - m2) / (s1 + s2);
	};
	f.toString = function() {
		return 'Signal to noise (adjust standard deviation)';
	};
	return f;
};

morpheus.SignalToNoise.thresholdStandardDeviation = function(mean,
		standardDeviation, percent) {
	var returnValue = standardDeviation;
	var absMean = Math.abs(mean);
	var minStdev = percent * absMean;
	if (minStdev > standardDeviation) {
		returnValue = minStdev;
	}

	if (returnValue < percent) {
		returnValue = percent;
	}
	return returnValue;
};

morpheus.createContingencyTable = function(listOne, listTwo, groupingValue) {
	if (groupingValue == null || isNaN(groupingValue)) {
		groupingValue = 1;
	}
	var aHit = 0;
	var aMiss = 0;
	for (var j = 0, size = listOne.size(); j < size; j++) {
		var val = listOne.getValue(j);
		if (!isNaN(val)) {
			if (val >= groupingValue) {
				aHit++;
			} else {
				aMiss++;
			}
		}

	}
	var bHit = 0;
	var bMiss = 0;
	for (var j = 0, size = listTwo.size(); j < size; j++) {
		var val = listTwo.getValue(j);
		if (!isNaN(val)) {
			if (val >= groupingValue) {
				bHit++;
			} else {
				bMiss++;
			}
		}

	}
	// listOne=drawn, listTwo=not drawn
	// green=1, red=0
	var N = aHit + aMiss + bHit + bMiss;
	var K = aHit + bHit;
	var n = aHit + aMiss;
	var k = aHit;
	var a = k;
	var b = K - k;
	var c = n - k;
	var d = N + k - n - K;
	return [ a, b, c, d ];
};
morpheus.FisherExact = function(listOne, listTwo) {
	var abcd = morpheus.createContingencyTable(listOne, listTwo, 1);
	return morpheus.FisherExact.fisherTest(abcd[0], abcd[1], abcd[2], abcd[3]);
};

morpheus.createFisherExact = function(groupingValue) {
	var f = function(listOne, listTwo) {
		var abcd = morpheus.createContingencyTable(listOne, listTwo,
				groupingValue);
		return morpheus.FisherExact.fisherTest(abcd[0], abcd[1], abcd[2],
				abcd[3]);
	};
	return f;

};

/**
 * Computes the hypergeometric probability.
 */
morpheus.FisherExact.phyper = function(a, b, c, d) {
	return Math
			.exp((morpheus.FisherExact.logFactorial(a + b)
					+ morpheus.FisherExact.logFactorial(c + d)
					+ morpheus.FisherExact.logFactorial(a + c) + morpheus.FisherExact
					.logFactorial(b + d))
					- (morpheus.FisherExact.logFactorial(a)
							+ morpheus.FisherExact.logFactorial(b)
							+ morpheus.FisherExact.logFactorial(c)
							+ morpheus.FisherExact.logFactorial(d) + morpheus.FisherExact
							.logFactorial(a + b + c + d)));

};

morpheus.FisherExact.logFactorials = [ 0.00000000000000000,
		0.00000000000000000, 0.69314718055994531, 1.79175946922805500,
		3.17805383034794562, 4.78749174278204599, 6.57925121201010100,
		8.52516136106541430, 10.60460290274525023, 12.80182748008146961,
		15.10441257307551530, 17.50230784587388584, 19.98721449566188615,
		22.55216385312342289, 25.19122118273868150, 27.89927138384089157,
		30.67186010608067280, 33.50507345013688888, 36.39544520803305358,
		39.33988418719949404, 42.33561646075348503, 45.38013889847690803,
		48.47118135183522388, 51.60667556776437357, 54.78472939811231919,
		58.00360522298051994, 61.26170176100200198, 64.55753862700633106,
		67.88974313718153498, 71.25703896716800901 ];
morpheus.FisherExact.logFactorial = function(k) {
	if (k >= 30) { // stirlings approximation
		var C0 = 9.18938533204672742e-01;
		var C1 = 8.33333333333333333e-02;
		var C3 = -2.77777777777777778e-03;
		var C5 = 7.93650793650793651e-04;
		var C7 = -5.95238095238095238e-04;
		var r = 1.0 / k;
		var rr = r * r;
		return (k + 0.5) * Math.log(k) - k + C0 + r
				* (C1 + rr * (C3 + rr * (C5 + rr * C7)));
		// log k! = (k + 1/2)log(k) - k + (1/2)log(2Pi) + stirlingCorrection(k)
	}
	return morpheus.FisherExact.logFactorials[k];
};

morpheus.FisherExact.fisherTest = function(a, b, c, d) {
	// match R 2-sided fisher.test
	var p = morpheus.FisherExact.phyper(a, b, c, d);
	var sum = p;
	for (var _a = 0, n = a + b + c + d; _a <= n; _a++) {
		var _b = a + b - _a;
		var _c = a + c - _a;
		var _d = b + d - _b;
		if (_a !== a && _b >= 0 && _c >= 0 && _d >= 0) {
			var _p = morpheus.FisherExact.phyper(_a, _b, _c, _d);
			if (_p <= p) {
				sum += _p;
			}
		}
	}
	return Math.min(1, sum);
	// var lt = jStat.hypgeom.cdf(a, a + b + c + d, a + b, a + c);
	// var gt = jStat.hypgeom.cdf(b, a + b + c + d, a + b, b + d);
	// return Math.min(1, 2 * Math.min(lt, gt));
};
morpheus.FisherExact.toString = function() {
	return 'Fisher Exact Test';
};

morpheus.FoldChange = function(list1, list2) {
	var m1 = morpheus.Mean(list1);
	var m2 = morpheus.Mean(list2);
	return (m1 / m2);
};
morpheus.FoldChange.toString = function() {
	return 'Fold Change';
};
morpheus.TTest = function(list1, list2) {
	var m1 = morpheus.Mean(list1);
	var m2 = morpheus.Mean(list2);
	var s1 = Math.sqrt(morpheus.Variance(list1, m1));
	var s2 = Math.sqrt(morpheus.Variance(list2, m2));
	var n1 = morpheus.CountNonNaN(list1);
	var n2 = morpheus.CountNonNaN(list2);
	return ((m1 - m2) / Math.sqrt((s1 * s1 / n1) + (s2 * s2 / n2)));
};
morpheus.TTest.toString = function() {
	return 'T-Test';
};
morpheus.Spearman = function(list1, list2) {
	var flist1 = [];
	var flist2 = [];
	for (var i = 0, n = list1.size(); i < n; i++) {
		var v1 = list1.getValue(i);
		var v2 = list2.getValue(i);
		if (isNaN(v1) || isNaN(v2)) {
			continue;
		}
		flist1.push(v1);
		flist2.push(v2);
	}
	var rank1 = morpheus.Ranking(flist1);
	var rank2 = morpheus.Ranking(flist2);
	return morpheus.Pearson(new morpheus.Vector('', rank1.length)
			.setArray(rank1), new morpheus.Vector('', rank2.length)
			.setArray(rank2));
};
morpheus.Spearman.toString = function() {
	return 'Spearman rank correlation';
};
morpheus.WeightedMean = function(weights, values) {
	var numerator = 0;
	var denom = 0;
	for (var i = 0, size = values.size(); i < size; i++) {
		var value = values.getValue(i);
		if (!isNaN(value)) {
			var weight = weights.getValue(i);
			if (!isNaN(weight)) {
				numerator += (weight * value);
				denom += weight;
			}
		}
	}
	return denom == 0 ? NaN : numerator / denom;
};
morpheus.WeightedMean.toString = function() {
	return 'Weighted average';
};

morpheus.createOneMinusMatrixValues = function(dataset) {
	var f = function(listOne, listTwo) {
		return 1 - dataset.getValue(listOne.getIndex(), listTwo.getIndex());
	};
	f.toString = function() {
		return 'One minus matrix values (for a precomputed similarity matrix)';
	};
	return f;
};

morpheus.Pearson = function(listOne, listTwo) {
	var sumx = 0;
	var sumxx = 0;
	var sumy = 0;
	var sumyy = 0;
	var sumxy = 0;
	var N = 0;
	for (var i = 0, size = listOne.size(); i < size; i++) {
		var x = listOne.getValue(i);
		var y = listTwo.getValue(i);
		if (isNaN(x) || isNaN(y)) {
			continue;
		}
		sumx += x;
		sumxx += x * x;
		sumy += y;
		sumyy += y * y;
		sumxy += x * y;
		N++;
	}
	var numr = sumxy - (sumx * sumy / N);
	var denr = Math.sqrt((sumxx - (sumx * sumx / N))
			* (sumyy - (sumy * sumy / N)));
	return denr == 0 ? 1 : numr / denr;
};
morpheus.Pearson.toString = function() {
	return 'Pearson correlation';
};

morpheus.Jaccard = function(listOne, listTwo) {

	var orCount = 0;
	var andCount = 0;
	for (var i = 0, size = listOne.size(); i < size; i++) {
		var xval = listOne.getValue(i);
		var yval = listTwo.getValue(i);
		if (isNaN(xval) || isNaN(yval)) {
			continue;
		}
		var x = xval > 0;
		var y = yval > 0;
		if (x && y) {
			andCount++;
		} else if (x || y) {
			orCount++;
		}
	}
	if (orCount === 0) {
		return 1;
	}
	return 1 - (andCount / orCount);
};

morpheus.Jaccard.toString = function() {
	return 'Jaccard distance';
};

morpheus.Cosine = function(listOne, listTwo) {
	var sumX2 = 0;
	var sumY2 = 0;
	var sumXY = 0;
	for (var i = 0, size = listOne.size(); i < size; i++) {
		var x = listOne.getValue(i);
		var y = listTwo.getValue(i);
		if (isNaN(x) || isNaN(y)) {
			continue;
		}
		sumX2 += x * x;
		sumY2 += y * y;
		sumXY += x * y;
	}
	return (sumXY / Math.sqrt(sumX2 * sumY2));
};

morpheus.Cosine.toString = function() {
	return 'Cosine similarity';
};

morpheus.Euclidean = function(x, y) {
	var dist = 0;
	for (var i = 0, size = x.size(); i < size; ++i) {
		var x_i = x.getValue(i);
		var y_i = y.getValue(i);
		if (isNaN(x_i) || isNaN(y_i)) {
			continue;
		}
		dist += (x_i - y_i) * (x_i - y_i);
	}
	return Math.sqrt(dist);
};
morpheus.Euclidean.toString = function() {
	return 'Euclidean distance';
};
morpheus.OneMinusFunction = function(f) {
	var dist = function(x, y) {
		return 1 - f(x, y);
	};
	dist.toString = function() {
		var s = f.toString();
		return 'One minus ' + s[0].toLowerCase() + s.substring(1);
	};
	return dist;
};
morpheus.Dataset = function(options) {
	morpheus.AbstractDataset.call(this, options.name, options.rows,
			options.columns);
	if (options.dataType == null) {
		options.dataType = 'Float32';
	}

	this.seriesArrays.push(options.array ? options.array : morpheus.Dataset
			.createArray(options));
	this.seriesDataTypes.push(options.dataType);
};
morpheus.Dataset.toJson = function(dataset, options) {
	options = options || {};

	var data = [];
	for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
		var row = [];
		data.push(row);
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			row[j] = dataset.getValue(i, j);
		}
	}
	var vectorToJson = function(vector) {
		var array = [];
		for (var i = 0, size = vector.size(); i < size; i++) {
			array[i] = vector.getValue(i);
		}
		return {
			name : vector.getName(),
			array : array
		};
	};
	var metadataToJson = function(metadata, fields) {
		var vectors = [];
		var filter;
		if (fields) {
			filter = new morpheus.Set();
			fields.forEach(function(field) {
				filter.add(field);
			});
		}
		for (var i = 0, count = metadata.getMetadataCount(); i < count; i++) {
			var v = metadata.get(i);
			if (filter) {
				if (filter.has(v.getName())) {
					vectors.push(vectorToJson(v));
				}
			} else {
				vectors.push(vectorToJson(v));
			}
		}
		return vectors;
	};
	return {
		rows : dataset.getRowCount(),
		columns : dataset.getColumnCount(),
		seriesArrays : [ data ],
		seriesNames : [ dataset.getName() ],
		rowMetadataModel : {
			vectors : metadataToJson(dataset.getRowMetadata(),
					options.rowFields)
		},
		columnMetadataModel : {
			vectors : metadataToJson(dataset.getColumnMetadata(),
					options.columnFields)
		}
	};
};
morpheus.Dataset.fromJson = function(options) {
	// Object {seriesNames:
	// Array[1], seriesArrays:
	// Array[1], rows:
	// 6238, columns: 7251,
	// rowMetadataModel: Object…}
	// columnMetadataModel: Object
	// itemCount: 7251
	// vectors: Array[3]
	// array: Array[7251]
	// n: 7251
	// name: "pert_id"
	// properties: Object
	// columns: 7251
	// rowMetadataModel: Object
	// rows: 6238
	// seriesArrays: Array[1]
	// seriesNames: Array[1]
	// var array = morpheus.Dataset.createArray(options);
	// for (var i = 0; i < options.rows; i++) {
	// var row = array[i];
	// var jsonRow = options.array[i];
	// for (var j = 0; j < options.columns; j++) {
	// row[j] = jsonRow[j];
	// }
	// }
	options.array = options.seriesArrays[0];
	var dataset = new morpheus.Dataset(options);
	dataset.seriesNames = options.seriesNames;
	if (options.rowMetadataModel) {
		options.rowMetadataModel.vectors.forEach(function(v) {
			var vector = new morpheus.Vector(v.name, dataset.getRowCount());
			vector.array = v.array;
			dataset.rowMetadataModel.vectors.push(vector);
		});
	}
	if (options.columnMetadataModel) {
		options.columnMetadataModel.vectors.forEach(function(v) {
			var vector = new morpheus.Vector(v.name, dataset.getColumnCount());
			vector.array = v.array;
			dataset.columnMetadataModel.vectors.push(vector);
		});
	}
	return dataset;
};
morpheus.Dataset.createArray = function(options) {
	var array = [];
	if (options.dataType == null || options.dataType === 'Float32') {
		for (var i = 0; i < options.rows; i++) {
			array.push(new Float32Array(options.columns));
		}
	} else if (options.dataType === 'Int8') {
		for (var i = 0; i < options.rows; i++) {
			array.push(new Int8Array(options.columns));
		}
	} else if (options.dataType === 'Int16') {
		for (var i = 0; i < options.rows; i++) {
			array.push(new Int16Array(options.columns));
		}
	} else if (options.dataType === 'sparse') {
		// array of objects
		for (var i = 0; i < options.rows; i++) {
			array.push({});
		}
	} else { // dataType===object, array of arrays
		for (var i = 0; i < options.rows; i++) {
			array.push([]);
		}
	}
	return array;
};
morpheus.Dataset.prototype = {
	getValue : function(i, j, seriesIndex) {
		seriesIndex = seriesIndex || 0;
		return this.seriesArrays[seriesIndex][i][j];
	},
	toString : function() {
		return this.getName();
	},
	setValue : function(i, j, value, seriesIndex) {
		seriesIndex = seriesIndex || 0;
		this.seriesArrays[seriesIndex][i][j] = value;
	},
	addSeries : function(options) {
		options = $.extend({}, {
			rows : this.getRowCount(),
			columns : this.getColumnCount(),
			dataType : 'Float32'
		}, options);
		this.seriesDataTypes.push(options.dataType);
		this.seriesNames.push(options.name);
		this.seriesArrays.push(options.array != null ? options.array
				: morpheus.Dataset.createArray(options));
		return this.seriesNames.length - 1;
	},
	setESSession : function (session) {
		this.esSession = session;
	},
	getESSession : function () {
		return this.esSession;
	}

};
morpheus.Util.extend(morpheus.Dataset, morpheus.AbstractDataset);
morpheus.DatasetAdapter = function(dataset, rowMetadata, columnMetadata) {
	if (dataset == null) {
		throw 'dataset is null';
	}
	this.dataset = dataset;
	this.rowMetadata = rowMetadata || dataset.getRowMetadata();
	this.columnMetadata = columnMetadata || dataset.getColumnMetadata();

};
morpheus.DatasetAdapter.prototype = {
	getDataset : function() {
		return this.dataset;
	},
	getName : function(seriesIndex) {
		return this.dataset.getName(seriesIndex);
	},
	setName : function(seriesIndex, name) {
		this.dataset.setName(seriesIndex, name);
	},
	getRowMetadata : function() {
		return this.rowMetadata;
	},
	getColumnMetadata : function() {
		return this.columnMetadata;
	},
	getRowCount : function() {
		return this.dataset.getRowCount();
	},
	getColumnCount : function() {
		return this.dataset.getColumnCount();
	},
	getValue : function(rowIndex, columnIndex, seriesIndex) {
		return this.dataset.getValue(rowIndex, columnIndex, seriesIndex);
	},
	setValue : function(rowIndex, columnIndex, value, seriesIndex) {
		this.dataset.setValue(rowIndex, columnIndex, value, seriesIndex);
	},
	addSeries : function(options) {
		return this.dataset.addSeries(options);
	},
	getSeriesCount : function() {
		return this.dataset.getSeriesCount();
	},
	getDataType : function(rowIndex, seriesIndex) {
		return this.dataset.getDataType(rowIndex, seriesIndex);
	},
	toString : function() {
		return this.dataset.toString();
	}
};
morpheus.DatasetColumnView = function(dataset) {
	this.dataset = dataset;
	this.columnIndex = 0;
	this.seriesIndex = 0;
};
morpheus.DatasetColumnView.prototype = {
	columnIndex : -1,
	size : function() {
		return this.dataset.getRowCount();
	},
	getValue : function(rowIndex) {
		return this.dataset.getValue(rowIndex, this.columnIndex,
				this.seriesIndex);
	},
	setIndex : function(newColumnIndex) {
		this.columnIndex = newColumnIndex;
		return this;
	},
	setSeriesIndex : function(seriesIndex) {
		this.seriesIndex = seriesIndex;
		return this;
	}
};
morpheus.DatasetRowView = function(dataset) {
	this.dataset = dataset;
	this.index = 0;
	this.seriesIndex = 0;
};
morpheus.DatasetRowView.prototype = {
	size : function() {
		return this.dataset.getColumnCount();
	},
	getIndex : function() {
		return this.index;
	},
	getValue : function(columnIndex) {
		return this.dataset.getValue(this.index, columnIndex, this.seriesIndex);
	},
	setIndex : function(newRowIndex) {
		this.index = newRowIndex;
		return this;
	},
	setSeriesIndex : function(seriesIndex) {
		this.seriesIndex = seriesIndex;
		return this;
	},
	setDataset : function(dataset) {
		this.dataset = dataset;
		return this;
	}
};
morpheus.DatasetUtil = function () {
};
morpheus.DatasetUtil.min = function (dataset, seriesIndex) {
	seriesIndex = seriesIndex || 0;
	var min = Number.MAX_VALUE;
	for (var i = 0, rows = dataset.getRowCount(); i < rows; i++) {
		for (var j = 0, columns = dataset.getColumnCount(); j < columns; j++) {
			var d = dataset.getValue(i, j, seriesIndex);
			if (isNaN(d)) {
				continue;
			}
			min = Math.min(min, d);
		}
	}
	return min;
};
morpheus.DatasetUtil.slicedView = function (dataset, rows, columns) {
	return new morpheus.SlicedDatasetView(dataset, rows, columns);
};
morpheus.DatasetUtil.transposedView = function (dataset) {
	return dataset instanceof morpheus.TransposedDatasetView ? dataset
	.getDataset() : new morpheus.TransposedDatasetView(dataset);
};
morpheus.DatasetUtil.max = function (dataset, seriesIndex) {
	seriesIndex = seriesIndex || 0;
	var max = -Number.MAX_VALUE;
	for (var i = 0, rows = dataset.getRowCount(); i < rows; i++) {
		for (var j = 0, columns = dataset.getColumnCount(); j < columns; j++) {
			var d = dataset.getValue(i, j, seriesIndex);
			if (isNaN(d)) {
				continue;
			}
			max = Math.max(max, d);
		}
	}
	return max;
};

morpheus.DatasetUtil.getDatasetReader = function (ext, options) {
	var datasetReader;
	if (ext === 'maf') {
		datasetReader = new morpheus.MafFileReader();
		if (options && options.mafGeneFilter) {
			datasetReader.setGeneFilter(options.mafGeneFilter);
		}
	} else if (ext === 'gct') {
		datasetReader = new morpheus.GctReader();
		// datasetReader = new morpheus.StreamingGctReader();
	} else if (ext === 'gmt') {
		datasetReader = new morpheus.GmtDatasetReader();
	} else if (ext === 'xlsx') {
		datasetReader = new morpheus.XlsxDatasetReader();
	} else if (ext === 'segtab' || ext === 'seg') {
		datasetReader = new morpheus.SegTabReader();
		if (options && options.regions) {
			datasetReader.setRegions(options.regions);
		}
	} else if (ext === 'txt' || ext === 'tsv' || ext === 'csv') {
		datasetReader = new morpheus.TxtReader();
	} else {
		datasetReader = new morpheus.GctReader();
	}
	return datasetReader;
};

morpheus.DatasetUtil.readDatasetArray = function (options) {
	var retDef = $.Deferred();
	var loadedDatasets = [];
	var promises = [];
	_.each(options.dataset, function (option, i) {
		var p = option.dataset.file ? morpheus.DatasetUtil.read(
			option.dataset.file, option.dataset.options)
			: morpheus.DatasetUtil.read(option.dataset);
		p.index = i;
		p.done(function (dataset) {
			loadedDatasets[this.index] = dataset;
		});
		p.fail(function (err) {
			var message = ['Error opening '
			+ (option.dataset.file ? morpheus.Util
			.getFileName(option.dataset.file) : morpheus.Util
			.getFileName(option.dataset)) + '.'];
			if (err.message) {
				message.push('<br />Cause: ');
				message.push(err.message);
			}
			retDef.reject(message.join(''));

		});
		promises.push(p);
	});
	if (promises.length === 0) {
		retDef.reject('No datasets specified.');
	}

	$.when
	.apply($, promises)
	.then(
		function () {
			retDef.resolve(morpheus.DatasetUtil.join(loadedDatasets, 'id'));
		});
	return retDef;
};
/**
 * Annotate a dataset from external file or text.
 *
 * @param options.annotations -
 *            Array of file, datasetField, and fileField.
 * @param options.isColumns -
 *            Whether to annotate columns
 * @return A jQuery Deferred object that resolves to an array of functions to
 *         execute with a dataset parameter.
 */
morpheus.DatasetUtil.annotate = function (options) {
	var retDef = $.Deferred();
	var promises = [];
	var functions = [];
	var isColumns = options.isColumns;
	_.each(options.annotations, function (ann) {
		if (morpheus.Util.isArray(ann.file)) { // already parsed text
			functions.push(function (dataset) {
				new morpheus.OpenFileTool().annotate(ann.file, dataset,
					isColumns, null, ann.datasetField, ann.fileField,
					ann.include);
			});
		} else {
			var result = morpheus.Util.readLines(ann.file);
			var fileName = morpheus.Util.getFileName(ann.file);
			var deferred = $.Deferred();
			promises.push(deferred);
			result.fail(function (message) {
				deferred.reject(message);
			});
			result.done(function (lines) {
				if (morpheus.Util.endsWith(fileName, '.gmt')) {
					var sets = new morpheus.GmtReader().parseLines(lines);
					functions.push(function (dataset) {
						new morpheus.OpenFileTool().annotate(null, dataset,
							isColumns, sets, ann.datasetField,
							ann.fileField);
					});
					deferred.resolve();
				} else if (morpheus.Util.endsWith(fileName, '.cls')) {
					functions.push(function (dataset) {
						new morpheus.OpenFileTool().annotateCls(null, dataset,
							fileName, isColumns, lines);
					});
					deferred.resolve();
				} else {
					functions.push(function (dataset) {
						new morpheus.OpenFileTool().annotate(lines, dataset,
							isColumns, null, ann.datasetField,
							ann.fileField, ann.include);
					});
					deferred.resolve();
				}
			});
		}
	});
	$.when.apply($, promises).then(function () {
		retDef.resolve(functions);
	});
	return retDef;
};
/**
 * @param file
 *            a File or url
 * @return A promise that resolves to Dataset
 */
morpheus.DatasetUtil.read = function (fileOrUrl, options) {
	var isFile = fileOrUrl instanceof File;
	var isString = _.isString(fileOrUrl);
	var ext = options && options.extension ? options.extension : morpheus.Util.getExtension(morpheus.Util.getFileName(fileOrUrl));
	var datasetReader = morpheus.DatasetUtil.getDatasetReader(ext, options);

	if (isString || isFile) { // URL or file
		var deferred = $.Deferred();
		// override toString so can determine file name
		if (options && options.background) {
			var path = morpheus.Util.getScriptPath();
			var blob = new Blob(
				['self.onmessage = function(e) {'
				+ 'importScripts(e.data.path);'
				+ 'var ext = morpheus.Util.getExtension(morpheus.Util'
				+ '.getFileName(e.data.fileOrUrl));'
				+ 'var datasetReader = morpheus.DatasetUtil.getDatasetReader(ext,'
				+ '	e.data.options);'
				+ 'datasetReader.read(e.data.fileOrUrl, function(err,dataset) {'
				+ '	self.postMessage(dataset);' + '	});' + '}']);

			// Obtain a blob URL reference to our worker 'file'.
			var blobURL = window.URL.createObjectURL(blob);
			var worker = new Worker(blobURL); // blobURL);
			worker.addEventListener('message', function (e) {
				// wrap in dataset object
				deferred.resolve(morpheus.Dataset.fromJson(e.data));
				window.URL.revokeObjectURL(blobURL);
			}, false);
			// start the worker
			worker.postMessage({
				path: path,
				fileOrUrl: fileOrUrl,
				options: options
			});

		} else {
			datasetReader.read(fileOrUrl, function (err, dataset) {
				if (err) {
					deferred.reject(err);
				} else {
					deferred.resolve(dataset);
				}

			});

		}
		var pr = deferred.promise();
		pr.toString = function () {
			return '' + fileOrUrl;
		};
		return pr;
	} else if (typeof fileOrUrl.done === 'function') { // assume it's a
		// deferred
		return fileOrUrl;
	} else { // it's already a dataset?
		var deferred = $.Deferred();
		deferred.resolve(fileOrUrl);
		return deferred.promise();
	}

};

/**
 * @param dataset
 *            The dataset to convert to an array
 * @param options.columns
 *            An array of column indices to include from the dataset
 * @param options.columnFields
 *            An array of field names to use in the returned objects that
 *            correspond to the column indices in the dataset
 * @param options.metadataFields
 *            An array of row metadata fields to include from the dataset
 *
 */
morpheus.DatasetUtil.toObjectArray = function (dataset, options) {
	var columns = options.columns || [0];
	var columnFields = options.columnFields || ['value'];
	if (columnFields.length !== columns.length) {
		throw 'columns.length !== columnFields.length';
	}
	var metadataFields = options.metadataFields;
	// grab all of the headers and filter the meta data vectors in the dataset
	// down
	// to the ones specified in metaFields. If metaFields is not passed, take
	// all metadata
	var rowMetadata = dataset.getRowMetadata();
	if (!metadataFields) {
		metadataFields = morpheus.MetadataUtil.getMetadataNames(rowMetadata);
	}
	var vectors = morpheus.MetadataUtil.getVectors(rowMetadata, metadataFields);
	// build an object that contains the matrix values for the given columns
	// along
	// with any metadata
	var array = [];
	for (var i = 0; i < dataset.getRowCount(); i++) {
		var obj = {};
		for (var j = 0; j < columns.length; j++) {
			obj[columnFields[j]] = dataset.getValue(i, columns[j]);
		}
		for (var j = 0; j < vectors.length; j++) {
			obj[vectors[j].getName()] = vectors[j].getValue(i);
		}
		array.push(obj);
	}
	return array;
};
morpheus.DatasetUtil.fixL1K = function (dataset) {
	var names = {
		'cell_id': 'Cell Line',
		'pert_idose': 'Dose (\u00B5M)',
		'pert_iname': 'Name',
		'pert_itime': 'Time (hr)',
		'distil_ss': 'Signature Strength',
		'pert_type': 'Type',
		'cell_lineage': 'Lineage',
		'cell_histology': 'Histology',
		'cell_type': 'Cell Type'
	};
	var fixNames = function (metadata) {
		for (var i = 0, count = metadata.getMetadataCount(); i < count; i++) {
			var v = metadata.get(i);
			var name = v.getName();
			var mapped = names[name];
			if (mapped) {
				v.setName(mapped);
			}
		}
	};
	fixNames(dataset.getRowMetadata());
	fixNames(dataset.getColumnMetadata());
	var fix666 = function (metadata) {
		for (var i = 0, count = metadata.getMetadataCount(); i < count; i++) {
			var v = metadata.get(i);
			if (v.getName() == 'Dose (\u00B5M)') { // convert to number
				for (var j = 0, size = v.size(); j < size; j++) {
					var value = v.getValue(j);
					if (value != null) {
						v.setValue(j, parseFloat(value));
					}
				}
			}
			var isNumber = false;
			for (var j = 0, size = v.size(); j < size; j++) {
				var value = v.getValue(j);
				if (value != null) {
					isNumber = _.isNumber(value);
					break;
				}
			}
			var newValue = isNumber || v.getName() == 'Dose (\u00B5M)' ? 0 : '';
			for (var j = 0, size = v.size(); j < size; j++) {
				var value = v.getValue(j);
				if (value != null && value == '-666') {
					v.setValue(j, newValue);
				}
			}
		}
	};
	fix666(dataset.getRowMetadata());
	fix666(dataset.getColumnMetadata());
	var fixCommas = function (metadata) {
		var regex = /(,)([^ ])/g;
		_.each(['Lineage', 'Histology'], function (name) {
			var v = metadata.getByName(name);
			if (v != null) {
				for (var i = 0, size = v.size(); i < size; i++) {
					var val = v.getValue(i);
					if (val) {
						v.setValue(i, val.replace(regex, ', $2'));
					}
				}
			}
		});
	};
	fixCommas(dataset.getRowMetadata());
	fixCommas(dataset.getColumnMetadata());
};
morpheus.DatasetUtil.geneSetsToDataset = function (name, sets) {
	var uniqueIds = new morpheus.Map();
	for (var i = 0, length = sets.length; i < length; i++) {
		var ids = sets[i].ids;
		for (var j = 0, nIds = ids.length; j < nIds; j++) {
			uniqueIds.set(ids[j], 1);
		}
	}
	var uniqueIdsArray = uniqueIds.keys();
	var dataset = new morpheus.Dataset({
		name: name,
		rows: uniqueIdsArray.length,
		columns: sets.length
	});
	var columnIds = dataset.getColumnMetadata().add('id');
	for (var i = 0, length = sets.length; i < length; i++) {
		columnIds.setValue(i, sets[i].name);
	}
	var rowIds = dataset.getRowMetadata().add('id');
	for (var i = 0, size = uniqueIdsArray.length; i < size; i++) {
		rowIds.setValue(i, uniqueIdsArray[i]);
	}
	var rowIdToIndex = morpheus.VectorUtil.createValueToIndexMap(rowIds);
	for (var i = 0, length = sets.length; i < length; i++) {
		var ids = sets[i].ids;
		for (var j = 0, nIds = ids.length; j < nIds; j++) {
			dataset.setValue(rowIdToIndex.get(ids[j]), i, 1);
		}
	}
	return dataset;
};
morpheus.DatasetUtil.DATASET_FILE_FORMATS = '<a target="_blank" href="http://support.lincscloud.org/hc/en-us/articles/202105453-GCT-Gene-Cluster-Text-Format-">GCT 1.3</a>, '
	+ '<a target="_blank" href="http://www.broadinstitute.org/cancer/software/genepattern/gp_guides/file-formats/sections/gct">GCT 1.2</a>, '
	+ '<a target="_blank" href="https://wiki.nci.nih.gov/display/TCGA/Mutation+Annotation+Format+%28MAF%29+Specification">MAF</a>, '
	+ '<a target="_blank" href="http://www.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#GMT:_Gene_Matrix_Transposed_file_format_.28.2A.gmt.29">GMT</a>, '
	+ ' or a tab-delimited text file';
morpheus.DatasetUtil.BASIC_DATASET_FILE_FORMATS = '<a target="_blank" href="http://support.lincscloud.org/hc/en-us/articles/202105453-GCT-Gene-Cluster-Text-Format-">GCT 1.3</a>, '
	+ '<a target="_blank" href="http://www.broadinstitute.org/cancer/software/genepattern/gp_guides/file-formats/sections/gct">GCT 1.2</a>, '
	+ ' or a tab-delimited text file';
morpheus.DatasetUtil.GCT_FILE_FORMAT = '<a target="_blank" href="http://support.lincscloud.org/hc/en-us/articles/202105453-GCT-Gene-Cluster-Text-Format-">GCT 1.3</a>';
morpheus.DatasetUtil.ANNOTATION_FILE_FORMATS = 'an xlsx file, tab-delimited text file, or a <a target="_blank" href="http://www.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#GMT:_Gene_Matrix_Transposed_file_format_.28.2A.gmt.29">GMT file</a>';
morpheus.DatasetUtil.DENDROGRAM_FILE_FORMATS = 'a <a href="http://en.wikipedia.org/wiki/Newick_format" target="_blank">Newick</a> file';
morpheus.DatasetUtil.OPEN_FILE_FORMATS = '<a target="_blank" href="http://support.lincscloud.org/hc/en-us/articles/202105453-GCT-Gene-Cluster-Text-Format-">GCT 1.3</a>, '
	+ '<a target="_blank" href="http://www.broadinstitute.org/cancer/software/genepattern/gp_guides/file-formats/sections/gct">GCT 1.2</a>, '
	+ '<a target="_blank" href="https://wiki.nci.nih.gov/display/TCGA/Mutation+Annotation+Format+%28MAF%29+Specification">MAF</a>, '
	+ '<a target="_blank", href="http://www.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#GMT:_Gene_Matrix_Transposed_file_format_.28.2A.gmt.29">GMT</a>, '
	+ ' a tab-delimited text file, or a <a href="http://en.wikipedia.org/wiki/Newick_format" target="_blank">Newick</a> file';
morpheus.DatasetUtil.getRootDataset = function (dataset) {
	while (dataset.getDataset) {
		dataset = dataset.getDataset();
	}
	return dataset;
};

morpheus.DatasetUtil.getSeriesIndex = function (dataset, name) {
	for (var i = 0, nseries = dataset.getSeriesCount(); i < nseries; i++) {
		if (name === dataset.getName(i)) {
			return i;
		}
	}
	return -1;
};
morpheus.DatasetUtil.getSeriesNames = function (dataset) {
	var names = [];
	for (var i = 0, nseries = dataset.getSeriesCount(); i < nseries; i++) {
		names.push(dataset.getName(i));
	}
	names.sort(function (a, b) {
		a = a.toLowerCase();
		b = b.toLowerCase();
		return (a < b ? -1 : (a === b ? 0 : 1));
	});
	return names;
};

/**
 * Search dataset values.
 */
morpheus.DatasetUtil.searchValues = function (dataset, text, cb) {
	if (text === '') {
		return;
	}
	var tokens = morpheus.Util.getAutocompleteTokens(text);
	if (tokens.length == 0) {
		return;
	}
	var seriesIndices = [];
	for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
		for (var k = 0, nseries = dataset.getSeriesCount(); k < nseries; k++) {
			if (dataset.getDataType(i, k) === 'object') {
				seriesIndices.push([i, k]);
			}
		}
	}
	if (seriesIndices.length === 0) {
		return;
	}
	var _val;
	elementSearch: for (var k = 0, nseries = seriesIndices.length; k < nseries; k++) {
		var pair = seriesIndices[k];
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			var element = dataset.getValue(pair[0], j, pair[1]);
			if (element != null && element.toObject) {
				_val = element.toObject();
				break elementSearch;
			}
		}
	}
	var fields = _val == null ? [] : _.keys(_val);
	var predicates = morpheus.Util.createSearchPredicates({
		tokens: tokens,
		fields: fields
	});

	var npredicates = predicates.length;

	for (var k = 0, nseries = seriesIndices.length; k < nseries; k++) {
		var pair = seriesIndices[k];
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			var matches = false;
			var element = dataset.getValue(pair[0], j, pair[1]);
			if (element && element.toObject) {
				var object = element.toObject();
				for (var p = 0; p < npredicates && !matches; p++) {
					var predicate = predicates[p];
					var filterColumnName = predicate.getField();
					if (filterColumnName != null) {
						var value = object[filterColumnName];
						if (value != null && predicate.accept(value)) {
							if (cb(value, pair[0], j) === false) {
								return;
							}
							matches = true;
							break;
						}
					} else { // try all fields
						for (var name in object) {
							var value = object[name];
							if (value != null && predicate.accept(value)) {
								if (cb(value, pair[0], j) === false) {
									return;
								}
								matches = true;
								break;
							}
						}
					}
				}

			}
		}
	}

};

/**
 * Search dataset values.
 */
morpheus.DatasetUtil.autocompleteValues = function (dataset) {
	return function (tokens, cb) {

		var token = tokens != null && tokens.length > 0 ? tokens[tokens.selectionStartIndex]
			: '';
		token = $.trim(token);
		var seriesIndices = [];
		for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
			for (var k = 0, nseries = dataset.getSeriesCount(); k < nseries; k++) {
				if (dataset.getDataType(i, k) === 'object') {
					seriesIndices.push([i, k]);
				}
			}
		}
		if (seriesIndices.length === 0) {
			return cb();
		}
		var _val; // first non-null value
		elementSearch: for (var k = 0, nseries = seriesIndices.length; k < nseries; k++) {
			var pair = seriesIndices[k];
			for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
				var element = dataset.getValue(pair[0], j, pair[1]);
				if (element != null && element.toObject) {
					_val = element.toObject();
					break elementSearch;
				}
			}
		}
		var matches = [];
		var fields = _val == null ? [] : _.keys(_val);
		if (token === '') {
			fields.sort(function (a, b) {
				return (a === b ? 0 : (a < b ? -1 : 1));
			});
			fields.forEach(function (field) {
				matches.push({
					value: field + ':',
					label: '<span style="font-weight:300;">' + field
					+ ':</span>',
					show: true
				});
			});
			return cb(matches);
		}

		var field = null;
		var semi = token.indexOf(':');
		if (semi > 0) { // field search?
			if (token.charCodeAt(semi - 1) !== 92) { // \:
				var possibleField = $.trim(token.substring(0, semi));
				if (possibleField.length > 0 && possibleField[0] === '"'
					&& possibleField[token.length - 1] === '"') {
					possibleField = possibleField.substring(1,
						possibleField.length - 1);
				}
				var index = fields.indexOf(possibleField);
				if (index !== -1) {
					token = $.trim(token.substring(semi + 1));
					field = possibleField;
				}
			}

		}

		var set = new morpheus.Set();
		// regex used to determine if a string starts with substring `q`
		var regex = new RegExp('^' + morpheus.Util.escapeRegex(token), 'i');
		// iterate through the pool of strings and for any string that
		// contains the substring `q`, add it to the `matches` array
		var max = 10;

		loop: for (var k = 0, nseries = seriesIndices.length; k < nseries; k++) {
			var pair = seriesIndices[k];
			for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
				var element = dataset.getValue(pair[0], j, pair[1]);
				if (element && element.toObject) {
					var object = element.toObject();
					if (field !== null) {
						var val = object[field];
						if (val != null) {
							var id = new morpheus.Identifier([val, field]);
							if (!set.has(id) && regex.test(val)) {
								set.add(id);
								if (set.size() === max) {
									break loop;
								}
							}
						}
					} else { // search all fields
						for (var name in object) {
							var val = object[name];
							var id = new morpheus.Identifier([val, name]);
							if (!set.has(id) && regex.test(val)) {
								set.add(id);
								if (set.size() === max) {
									break loop;
								}
							}
						}
					}

				}
			}
		}
		set.forEach(function (id) {
			var array = id.getArray();
			var field = array[1];
			var val = array[0];
			matches.push({
				value: field + ':' + val,
				label: '<span style="font-weight:300;">' + field + ':</span>'
				+ '<span style="font-weight:900;">' + val + '</span>'
			});

		});
		if (field == null) {
			fields.forEach(function (field) {
				if (regex.test(field)) {
					matches.push({
						value: field + ':',
						label: '<span style="font-weight:300;">' + field
						+ ':</span>',
						show: true
					});
				}
			});
		}
		cb(matches);
	};

};
// morpheus.DatasetUtil.toJSON = function(dataset) {
// var json = [];
// json.push('{');
// json.push('"name":"' + dataset.getName() + '", ');
// json.push('"v":['); // row major 2d array
// for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
// if (i > 0) {
// json.push(',\n');
// }
// json.push('[');
// for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
// if (j > 0) {
// json.push(',');
// }
// json.push(JSON.stringify(dataset.getValue(i, j)));
// }
// json.push(']');
// }
// json.push(']'); // end v
// var metadataToJson = function(model) {
// json.push('[');
// for (var i = 0, count = model.getMetadataCount(); i < count; i++) {
// var v = model.get(i);
// if (i > 0) {
// json.push(',\n');
// }
// json.push('{');
// json.push('"id":"' + v.getName() + '"');
// json.push(', "v":[');
// for (var j = 0, nitems = v.size(); j < nitems; j++) {
// if (j > 0) {
// json.push(',');
// }
// json.push(JSON.stringify(v.getValue(j)));
// }
// json.push(']'); // end v array
// json.push('}');
// }
// json.push(']');
// };
// json.push(', "cols":');
// metadataToJson(dataset.getColumnMetadata());
// json.push(', "rows":');
// metadataToJson(dataset.getRowMetadata());
// json.push('}'); // end json object
// return json.join('');
// };
morpheus.DatasetUtil.fill = function (dataset, value, seriesIndex) {
	seriesIndex = seriesIndex || 0;
	for (var i = 0, nrows = dataset.getRowCount(), ncols = dataset
	.getColumnCount(); i < nrows; i++) {
		for (var j = 0; j < ncols; j++) {
			dataset.setValue(i, j, value, seriesIndex);
		}
	}
};

morpheus.DatasetUtil.join = function (datasets, field) {
	if (datasets.length === 1) {
		datasets[0].getRowMetadata().add('Source').setValue(0, datasets[0].getName());
		return datasets[0];
	}
	var ids = new morpheus.Set();
	for (var i = 0; i < datasets.length; i++) {
		var idVector = datasets[i].getColumnMetadata().getByName(field);
		for (var j = 0, size = idVector.size(); j < size; j++) {
			ids.add(idVector.getValue(j));
		}
	}
	var dummyDataset = new morpheus.Dataset({
		rows: 0,
		columns: ids.size()
	});
	var dummyIdVector = dummyDataset.getColumnMetadata().add(field);
	var counter = 0;
	ids.forEach(function (id) {
		dummyIdVector.setValue(counter++, id);
	});

	var dataset = new morpheus.JoinedDataset(
		dummyDataset, datasets[0], field,
		field);
	for (var i = 1; i < datasets.length; i++) {
		dataset = new morpheus.JoinedDataset(dataset,
			datasets[i], field, field);
	}
	return dataset;
};
morpheus.DatasetUtil.shallowCopy = function (dataset) {
	// make a shallow copy of the dataset, metadata is immutable via the UI
	var rowMetadataModel = morpheus.MetadataUtil.shallowCopy(dataset
	.getRowMetadata());
	var columnMetadataModel = morpheus.MetadataUtil.shallowCopy(dataset
	.getColumnMetadata());
	dataset.getRowMetadata = function () {
		return rowMetadataModel;
	};
	dataset.getColumnMetadata = function () {
		return columnMetadataModel;
	};
	return dataset;
};

morpheus.DatasetUtil.copy = function (dataset) {
	var newDataset = new morpheus.Dataset({
		name: dataset.getName(),
		rows: dataset.getRowCount(),
		columns: dataset.getColumnCount(),
		dataType: 'object'
	});
	for (var seriesIndex = 0, nseries = dataset.getSeriesCount(); seriesIndex < nseries; seriesIndex++) {
		if (seriesIndex > 0) {
			newDataset.addSeries({
				name: dataset.getName(seriesIndex),
				rows: dataset.getRowCount(),
				columns: dataset.getColumnCount(),
				dataType: 'object'
			});
		}
		for (var i = 0, nrows = dataset.getRowCount(), ncols = dataset
		.getColumnCount(); i < nrows; i++) {
			for (var j = 0; j < ncols; j++) {
				newDataset.setValue(i, j, dataset.getValue(i, j, seriesIndex),
					seriesIndex);
			}
		}
	}
	var rowMetadataModel = morpheus.MetadataUtil.shallowCopy(dataset
	.getRowMetadata());
	var columnMetadataModel = morpheus.MetadataUtil.shallowCopy(dataset
	.getColumnMetadata());
	newDataset.getRowMetadata = function () {
		return rowMetadataModel;
	};
	newDataset.getColumnMetadata = function () {
		return columnMetadataModel;
	};
	return newDataset;
};
morpheus.DatasetUtil.toString = function (dataset, value, seriesIndex) {
	seriesIndex = seriesIndex || 0;
	var s = [];
	for (var i = 0, nrows = dataset.getRowCount(), ncols = dataset
	.getColumnCount(); i < nrows; i++) {
		for (var j = 0; j < ncols; j++) {
			if (j > 0) {
				s.push(', ');
			}
			s.push(morpheus.Util.nf(dataset.getValue(i, j, seriesIndex)));
		}
		s.push('\n');
	}
	return s.join('');
};
morpheus.DatasetUtil.getNonEmptyRows = function (dataset) {
	var rowsToKeep = [];
	for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
		var keep = false;
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			var value = dataset.getValue(i, j);
			if (!isNaN(value)) {
				keep = true;
				break;
			}
		}
		if (keep) {
			rowsToKeep.push(i);
		}
	}
	return rowsToKeep;
};
morpheus.DatasetUtil.getContentArray = function (dataset) {
	var array = [];
	var nr = dataset.rows;
	var nc = dataset.columns;

	for (var i = 0; i < nr; i++) {
		for (var j = 0; j < nc; j++) {
			array.push(dataset.getValue(i, j));
		}
	}
	return array;
};
morpheus.DatasetUtil.getMetadataArray = function (dataset) {
	var pDataArray = [];
	var participantID = [];
	var labelDescription = [];
	console.log(dataset);
	var columnMeta = dataset.getColumnMetadata();
	var features = columnMeta.getMetadataCount();
	var participants = dataset.getColumnCount();
	var vecPartID;

	if (columnMeta.getByName("participant_id") != null) {
		vecPartID = columnMeta.getByName("participant_id");
	}
	else {
		vecPartID = columnMeta.getByName("id");
	}
	for (var i = 0; i < participants; i++) {
		participantID.push({
			strval: vecPartID.getValue(i),
			isNA: false
		});
	}
	for (var j = 0; j < features; j++) {
		var vecJ = columnMeta.get(j);
		if (vecJ.getName() == "participant_id" || vecJ.getName() == "id") {
			continue;
		}
		for (var l = 0; l < participants; l++) {
			pDataArray.push({
				strval : vecJ.getValue(l).toString(),
				isNA : false
			});
		}
		labelDescription.push({
			strval : vecJ.getName(),
			isNA : false
		});
	}

	var rowMeta = dataset.getRowMetadata();
	var rowNames = [];
	var rowNamesVec = rowMeta.getByName("id");
	for (j = 0; j < dataset.getRowCount(); j++) {
		rowNames.push({
			strval : rowNamesVec.getValue(j),
			isNA : false
		})
	}
	return {pdata : pDataArray, participants : participantID, labels : labelDescription, rownames : rowNames};
};
morpheus.DatasetUtil.toESSession = function (dataset) {
	var array = morpheus.DatasetUtil.getContentArray(dataset);
	var meta = morpheus.DatasetUtil.getMetadataArray(dataset);

	var messageJSON = {
		rclass : "LIST",
		rexpValue : [{
			rclass : "REAL",
			realValue : array,
			attrName : "dim",
			attrValue : {
				rclass : "INTEGER",
				intValue : [dataset.getColumnCount(), dataset.getRowCount()]
			}
		}, {
			rclass : "STRING",
			stringValue : meta.pdata,
			attrName : "dim",
			attrValue : {
				rclass : "INTEGER",
				intValue : [dataset.getColumnCount(), meta.pdata.length/dataset.getColumnCount()]
			}
		}, {
			rclass : "STRING",
			stringValue : meta.labels
		}, {
			rclass : "STRING",
			stringValue : meta.participants
		}, {
			rclass : "STRING",
			stringValue : meta.rownames
		}],
		attrName : "names",
		attrValue : {
			rclass : "STRING",
			stringValue : [{
				strval : "data",
				isNA : false
			}, {
				strval : "pData",
				isNA : false
			}, {
				strval : "labelDescription",
				isNA : false
			}, {
				strval : "colNames",
				isNA : false
			}, {
				strval : "rowNames",
				isNA : false
			}]
		}
	};

	console.log(messageJSON);
	ProtoBuf = dcodeIO.ProtoBuf;
	ProtoBuf.protoFromFile("./message.proto", function (error, success) {
			if (error) {
				alert(error);
				return;
			}
			console.log(error, success);
			var builder = success,
				rexp = builder.build("rexp"),
				REXP = rexp.REXP;

			var proto = new REXP(messageJSON);
			var req = ocpu.call("createES", proto, function (session) {
				console.log(session);
				dataset.setESSession(session);
			}, true);

			req.fail(function () {
				alert(req.responseText);
			});
		});

	/*var blob = new Blob([new Uint8Array((new REXP(messageJSON)).toArrayBuffer())], {type: "application/octet-stream"});
	saveAs(blob, "test1.bin");*/
};
morpheus.ElementSelectionModel = function(project) {
	this.viewIndices = new morpheus.Set();
	this.project = project;
};
morpheus.ElementSelectionModel.prototype = {
	click : function(rowIndex, columnIndex, add) {
		var id = new morpheus.Identifier([ rowIndex, columnIndex ]);
		var isSelected = this.viewIndices.has(id);
		if (add) {
			isSelected ? this.viewIndices.remove(id) : this.viewIndices.add(id);
		} else {
			this.viewIndices.clear();
			if (!isSelected) {
				this.viewIndices.add(id);
			}
		}
		this.trigger('selectionChanged');
	},
	setViewIndices : function(indices) {
		this.viewIndices = indices;
		this.trigger('selectionChanged');
	},
	clear : function() {
		this.viewIndices = new morpheus.Set();
	},
	/**
	 * 
	 * @returns {morpheus.Set}
	 */
	getViewIndices : function() {
		return this.viewIndices;
	},
	count : function() {
		return this.viewIndices.size();
	},
	toModelIndices : function() {
		var project = this.project;
		var modelIndices = [];
		this.viewIndices.forEach(function(id) {
			modelIndices.push(project
					.convertViewRowIndexToModel(id.getArray()[0]), project
					.convertViewColumnIndexToModel(id.getArray()[1]));
		});
		return modelIndices;
	},
	save : function() {
		this.modelIndices = this.toModelIndices();
	},
	restore : function() {
		var project = this.project;
		this.viewIndices = new morpheus.Set();
		for (var i = 0, length = this.modelIndices.length; i < length; i++) {
			var rowIndex = project
					.convertModelRowIndexToView(this.modelIndices[i][0]);
			var columnIndex = project
					.convertModelColumnIndexToView(this.modelIndices[i][1]);
			if (rowIndex !== -1 && columnIndex !== -1) {
				this.viewIndices.add(new morpheus.Identifier([ rowIndex,
						columnIndex ]));
			}
		}
	}
};
morpheus.Util.extend(morpheus.ElementSelectionModel, morpheus.Events);
morpheus.CombinedFilter = function(isAndFilter) {
	this.filters = [];
	this.isAndFilter = isAndFilter;
	this.enabledFilters = [];
	this.name = 'combined filter';
};

morpheus.CombinedFilter.prototype = {
	shallowClone : function() {
		var f = new morpheus.CombinedFilter(this.isAndFilter);
		f.filters = this.filters.slice(0);
		return f;
	},
	toString : function() {
		return this.name;
	},
	setAnd : function(isAndFilter, notify) {
		this.isAndFilter = isAndFilter;
		if (notify) {
			this.trigger('and', {});
		}
	},
	isAnd : function() {
		return this.isAndFilter;
	},
	equals : function(f) {
		if (!(f instanceof morpheus.CombinedFilter)) {
			return false;
		}
		if (this.isAndFilter !== f.isAndFilter) {
			return false;
		}
		if (this.filters.length !== f.filters.length) {
			return false;
		}
		for (var i = 0, length = this.filters.length; i < length; i++) {
			if (!this.filters[i].equals(f.filters[i])) {
				return false;
			}
		}
		return true;
	},
	add : function(filter, notify) {
		this.filters.push(filter);
		if (notify) {
			this.trigger('add', {
				filter : filter
			});
		}
	},
	getFilters : function() {
		return this.filters;
	},
	get : function(index) {
		return this.filters[index];
	},
	indexOf : function(name, type) {
		for (var i = 0, length = this.filters.length; i < length; i++) {
			if (this.filters[i].toString() === name
					&& (type == null ? true : this.filters[i] instanceof type)) {
				return i;
			}
		}
		return -1;
	},
	remove : function(index, notify) {
		this.filters.splice(index, 1);
		if (notify) {
			this.trigger('remove', {
				index : index
			});
		}
	},
	set : function(index, filter) {
		this.filters[index] = filter;
	},
	insert : function(index, filter) {
		this.filters.splice(index, 0, filter);
	},
	clear : function() {
		this.filters = [];
	},
	init : function(dataset) {
		for (var i = 0, nfilters = this.filters.length; i < nfilters; i++) {
			if (this.filters[i].init) {
				this.filters[i].init(dataset);
			}
		}
		this.enabledFilters = this.filters.filter(function(filter) {
			return filter.isEnabled();
		});
	},
	accept : function(index) {
		var filters = this.enabledFilters;
		if (this.isAndFilter) {
			for (var i = 0, nfilters = filters.length; i < nfilters; i++) {
				if (filters[i].accept(index) === false) {
					return false;
				}
			}
			return true;
		} else {
			for (var i = 0, nfilters = filters.length; i < nfilters; i++) {
				if (filters[i].accept(index)) {
					return true;
				}
			}
			return false;
		}
		return true;
	},
	isEnabled : function() {
		return this.enabledFilters.length > 0;
	}
};
morpheus.Util.extend(morpheus.CombinedFilter, morpheus.Events);
/**
 * @param acceptIndicesSet
 *            a morpheus.Set that contains the model indices in the dataset to
 *            retain.
 */
morpheus.IndexFilter = function(acceptIndicesSet, name) {
	this.acceptIndicesSet = acceptIndicesSet;
	this.name = name;
};
morpheus.IndexFilter.prototype = {
	enabled : true,
	isEnabled : function() {
		return this.enabled;
	},
	setAcceptIndicesSet : function(acceptIndicesSet) {
		this.acceptIndicesSet = acceptIndicesSet;
	},
	setEnabled : function(enabled) {
		this.enabled = enabled;
	},
	equals : function(filter) {
		return filter instanceof morpheus.IndexFilter
				&& this.acceptIndicesSet.equals(filter.acceptIndicesSet);
	},
	init : function(dataset) {
	},
	toString : function() {
		return this.name;
	},
	/**
	 * 
	 * @param index
	 *            The model index in the dataset
	 * @returns {Boolean} true if index passes filter
	 */
	accept : function(index) {
		return this.acceptIndicesSet.has(index);
	}
};
morpheus.VectorFilter = function(set, maxSetSize, name) {
	this.set = set;
	this.name = name;
	this.maxSetSize = maxSetSize;
};

morpheus.VectorFilter.prototype = {
	enabled : true,
	isEnabled : function() {
		return this.enabled && this.set.size() > 0
				&& this.set.size() !== this.maxSetSize && this.vector != null;
	},
	setEnabled : function(enabled) {
		this.enabled = enabled;
	},
	equals : function(filter) {
		return filter instanceof morpheus.VectorFilter
				&& this.name === filter.name;
	},
	init : function(dataset) {
		this.vector = dataset.getRowMetadata().getByName(this.name);
	},
	toString : function() {
		return this.name;
	},
	/**
	 * 
	 * @param index
	 *            The model index in the dataset
	 * @returns {Boolean} true if index passes filter
	 */
	accept : function(index) {
		return this.set.has(this.vector.getValue(index));
	}
};

morpheus.NotNullFilter = function(name) {
	this.name = name;
};
morpheus.NotNullFilter.prototype = {
	enabled : true,
	isEnabled : function() {
		return this.enabled && this.vector != null;
	},
	setEnabled : function(enabled) {
		this.enabled = enabled;
	},
	equals : function(filter) {
		return filter instanceof morpheus.NotNullFilter
				&& this.name === filter.name;
	},
	init : function(dataset) {
		this.vector = dataset.getRowMetadata().getByName(this.name);
	},
	toString : function() {
		return this.name;
	},
	/**
	 * 
	 * @param index
	 *            The model index in the dataset
	 * @returns {Boolean} true if index passes filter
	 */
	accept : function(index) {
		return this.vector.getValue(index) != null;
	}
};

morpheus.RangeFilter = function(min, max, name) {
	this.min = min;
	this.max = max;
	this.name = name;
};

morpheus.RangeFilter.prototype = {
	enabled : true,
	isEnabled : function() {
		return this.enabled && (!isNaN(this.min) || !isNaN(this.max))
				&& this.vector;
	},
	setEnabled : function(enabled) {
		this.enabled = enabled;
	},
	setMin : function(value) {
		this.min = isNaN(value) ? -Number.MAX_VALUE : value;
	},
	setMax : function(value) {
		this.max = isNaN(value) ? Number.MAX_VALUE : value;
	},
	equals : function(filter) {
		return filter instanceof morpheus.RangeFilter
				&& this.name === filter.name;
	},
	init : function(dataset) {
		this.vector = dataset.getRowMetadata().getByName(this.name);

	},
	toString : function() {
		return this.name;
	},
	/**
	 * 
	 * @param index
	 *            The model index in the dataset
	 * @returns {Boolean} true if index passes filter
	 */
	accept : function(index) {
		var value = this.vector.getValue(index);
		return value >= this.min && value <= this.max;
	}
};

morpheus.TopNFilter = function(n, direction, name) {
	this.n = n;
	this.direction = direction;
	this.name = name;
};

morpheus.TopNFilter.TOP = 0;
morpheus.TopNFilter.BOTTOM = 1;
morpheus.TopNFilter.TOP_BOTTOM = 2;
morpheus.TopNFilter.prototype = {
	enabled : true,
	isEnabled : function() {
		return this.enabled && this.n > 0 && this.vector;
	},
	setEnabled : function(enabled) {
		this.enabled = enabled;
	},
	setN : function(value) {
		this.n = value;
	},
	/**
	 * 
	 * @param direction
	 *            one of '
	 */
	setDirection : function(direction) {
		this.direction = direction;
	},
	equals : function(filter) {
		return filter instanceof morpheus.TopNFilter
				&& this.name === filter.name && this.n === filter.n
				&& this.direction === filter.direction;
	},

	init : function(dataset) {
		if (!this.vector) {
			var vector = dataset.getRowMetadata().getByName(this.name);
			this.vector = vector;
			var set = new morpheus.Set();
			for (var i = 0, size = vector.size(); i < size; i++) {
				var value = vector.getValue(i);
				if (!isNaN(value)) {
					set.add(value);
				}
			}
			var values = set.values();
			// ascending order
			values.sort(function(a, b) {
				return (a === b ? 0 : (a < b ? -1 : 1));
			});
			this.sortedValues = values;
		}
		var topAndBottomIndices = [ (this.sortedValues.length - this.n),
				(this.n - 1) ];

		for (var i = 0; i < topAndBottomIndices.length; i++) {
			topAndBottomIndices[i] = Math.max(0, topAndBottomIndices[i]);
			topAndBottomIndices[i] = Math.min(this.sortedValues.length - 1,
					topAndBottomIndices[i]);
		}

		var topAndBottomValues = [ this.sortedValues[topAndBottomIndices[0]],
				this.sortedValues[topAndBottomIndices[1]] ];

		if (this.direction === morpheus.TopNFilter.TOP) {
			this.f = function(val) {
				return isNaN(val) ? false : val >= topAndBottomValues[0];
			};
		} else if (this.direction === morpheus.TopNFilter.BOTTOM) {
			this.f = function(val) {
				return isNaN(val) ? false : val <= topAndBottomValues[1];
			};
		} else {
			this.f = function(val) {
				return isNaN(val) ? false
						: (val >= topAndBottomValues[0] || val <= topAndBottomValues[1]);
			};
		}

	},
	/**
	 * 
	 * @param index
	 *            The model index in the dataset
	 * @returns {Boolean} true if index passes filter
	 */
	accept : function(index) {
		return this.f(this.vector.getValue(index));
	},
	toString : function() {
		return this.name;
	}
};

morpheus.AlwaysTrueFilter = function() {

};

morpheus.AlwaysTrueFilter.prototype = {
	isEnabled : function() {
		return false;
	},
	setEnabled : function(enabled) {

	},
	equals : function(filter) {
		return filter instanceof morpheus.AlwaysTrueFilter;

	},
	init : function(dataset) {

	},
	toString : function() {
		return 'AlwaysTrue';
	},
	/**
	 * 
	 * @param index
	 *            The model index in the dataset
	 * @returns {Boolean} true if index passes filter
	 */
	accept : function(index) {
		return true;
	}
};

morpheus.IndexMapper = function(project, isRows) {
	this.project = project;
	this.isRows = isRows;
	this.sortKeys = [];
	/**
	 * {morpheus.Map} Maps from model index to view index. Note that not all
	 * model indices are contained in the map because they might have been
	 * filtered from the view.
	 */
	this.modelToView = null;
	/** {Array} filtered model indices */
	this.filteredModelIndices = null;
	/** {Array} sorted and filtered model indices */
	this.filteredSortedModelIndices = null;
	this.filter = new morpheus.CombinedFilter(true);
	this._filter();
	this._sort();
};

morpheus.IndexMapper.prototype = {
	convertModelIndexToView : function(modelIndex) {
		var index = this.modelToView.get(modelIndex);
		return index !== undefined ? index : -1;
	},
	convertViewIndexToModel : function(viewIndex) {
		return (viewIndex < this.filteredSortedModelIndices.length
				&& viewIndex >= 0 ? this.filteredSortedModelIndices[viewIndex]
				: -1);
	},
	convertToView : function() {
		return this.filteredSortedModelIndices;
	},
	setFilter : function(filter) {
		this.filter = filter;
		this._filter();
		this._sort();
	},
	_filter : function() {
		var filter = this.filter;
		var dataset = this.getFullDataset();
		var filteredModelIndices;
		if (filter != null) {
			filter.init(dataset);
			if (filter.isEnabled()) {
				filteredModelIndices = [];
				for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
					if (filter.accept(i)) {
						filteredModelIndices.push(i);
					}
				}
			}
		}

		this.filteredModelIndices = filteredModelIndices != null ? filteredModelIndices
				: morpheus.Util.seq(dataset.getRowCount());
	},
	_sort : function() {
		var sortKeys = this.sortKeys;
		if (sortKeys.length > 0) {
			var dataset = this.getFullDataset();

			var nkeys = sortKeys.length;
			for (var i = 0; i < nkeys; i++) {
				sortKeys[i].init(dataset, this.filteredSortedModelIndices);
			}
			this.filteredSortedModelIndices = this.filteredModelIndices
					.slice(0);
			this.filteredSortedModelIndices.sort(function(a, b) {
				for (var i = 0; i < nkeys; i++) {
					var key = sortKeys[i];
					var comparator = key.getComparator();
					var val1 = key.getValue(a);
					var val2 = key.getValue(b);
					var c = comparator(val1, val2);
					if (c !== 0) {
						return c;
					}
				}
				return 0;
			});
		} else {
			this.filteredSortedModelIndices = this.filteredModelIndices;
		}

		var modelToView = new morpheus.Map();
		for (var i = 0, length = this.filteredSortedModelIndices.length; i < length; i++) {
			modelToView.set(this.filteredSortedModelIndices[i], i);
		}
		this.modelToView = modelToView;
	},
	getFilter : function() {
		return this.filter;
	},
	getViewCount : function() {
		if (this.getFullDataset() == null) {
			return 0;
		}
		return this.filteredSortedModelIndices.length;
	},
	setSelectedModelIndices : function(selectedModelIndices) {
		this.selectionModel.setSelectedModelIndices(selectedModelIndices);
	},
	setSortKeys : function(sortKeys) {
		if (sortKeys == null) {
			sortKeys = [];
		}
		this.sortKeys = sortKeys;
		this._sort();
	},
	getFullDataset : function() {
		var originalDataset = this.project.getFullDataset();
		return this.isRows ? originalDataset : morpheus.DatasetUtil
				.transposedView(originalDataset);
	}
};

/**
 * Adds rows in dataset2 to dataset1
 */
morpheus.JoinedDataset = function(dataset1, dataset2, dataset1Field,
		dataset2Field, sourceFieldName) {
	sourceFieldName = sourceFieldName || 'Source';
	this.dataset1Field = dataset1Field;
	this.dataset2Field = dataset2Field;
	if (dataset1 == null) {
		throw 'dataset1 is null';
	}
	if (dataset2 == null) {
		throw 'dataset2 is null';
	}
	if (dataset1Field) { // reorder dataset 2 to match dataset 1
		var v1 = dataset1.getColumnMetadata().getByName(dataset1Field);
		var dataset2ValueToIndex = morpheus.VectorUtil
				.createValueToIndexMap(dataset2.getColumnMetadata().getByName(
						dataset2Field));
		var dataset2ColumnIndices = [];
		for (var i = 0; i < v1.size(); i++) {
			dataset2ColumnIndices[i] = dataset2ValueToIndex.get(v1.getValue(i));
			// undefined indices are handles in SlicedDatasetWithNulls
		}
		dataset2 = new morpheus.SlicedDatasetWithNulls(dataset2,
				dataset2ColumnIndices, dataset1.getColumnCount(), dataset1
						.getColumnMetadata());
	}

	if (!dataset1.getRowMetadata().getByName(sourceFieldName)) {
		var sourceVector = dataset1.getRowMetadata().add(sourceFieldName);
		var name = dataset1.getName();
		for (var i = 0, nrows = sourceVector.size(); i < nrows; i++) {
			sourceVector.setValue(i, name);
		}
	}
	if (!dataset2.getRowMetadata().getByName(sourceFieldName)) {
		var sourceVector = dataset2.getRowMetadata().add(sourceFieldName);
		var name = dataset2.getName();
		for (var i = 0, nrows = sourceVector.size(); i < nrows; i++) {
			sourceVector.setValue(i, name);
		}

	}

	// make sure dataset1 and dataset2 have the same row metadata fields in the
	// same order
	for (var i = 0, count = dataset1.getRowMetadata().getMetadataCount(); i < count; i++) {
		var name = dataset1.getRowMetadata().get(i).getName();
		if (dataset2.getRowMetadata().getByName(name) == null) {
			dataset2.getRowMetadata().add(name);
		}
	}
	for (var i = 0, count = dataset2.getRowMetadata().getMetadataCount(); i < count; i++) {
		var name = dataset2.getRowMetadata().get(i).getName();
		if (dataset1.getRowMetadata().getByName(name) == null) {
			dataset1.getRowMetadata().add(name);
		}
	}

	// put dataset2 row metadata names in same order as dataset1
	var dataset2RowMetadataOrder = [];
	var metadataInDifferentOrder = false;
	for (var i = 0, count = dataset1.getRowMetadata().getMetadataCount(); i < count; i++) {
		var name = dataset1.getRowMetadata().get(i).getName();
		var index = morpheus.MetadataUtil.indexOf(dataset2.getRowMetadata(),
				name);
		dataset2RowMetadataOrder.push(index);
		if (index !== i) {
			metadataInDifferentOrder = true;
		}
	}
	this.dataset1 = dataset1;
	this.dataset2 = dataset2;
	// TODO put series in same order
	var maxSeriesCount = Math.max(this.dataset1.getSeriesCount(), this.dataset2
			.getSeriesCount());
	for (var i = this.dataset1.getSeriesCount(); i < maxSeriesCount; i++) {
		this.dataset1.addSeries({
			name : this.dataset2.getName(i)
		});
	}
	for (var i = this.dataset2.getSeriesCount(); i < maxSeriesCount; i++) {
		this.dataset2.addSeries({
			name : this.dataset1.getName(i)
		});
	}

	this.rowMetadata = new morpheus.JoinedMetadataModel(this.dataset1
			.getRowMetadata(), !metadataInDifferentOrder ? this.dataset2
			.getRowMetadata() : new morpheus.MetadataModelColumnView(
			this.dataset2.getRowMetadata(), dataset2RowMetadataOrder));
};
morpheus.JoinedDataset.prototype = {
	getName : function(seriesIndex) {
		return this.dataset1.getName(seriesIndex);
	},
	setName : function(seriesIndex, name) {
		this.dataset1.setName(seriesIndex, name);
	},
	getDatasets : function() {
		return [ this.dataset1, this.dataset2 ];
	},
	getDataset1 : function() {
		return this.dataset1;
	},
	getRowMetadata : function() {
		return this.rowMetadata;
	},
	getColumnMetadata : function() {
		return this.dataset1.getColumnMetadata();
	},
	getRowCount : function() {
		return this.dataset1.getRowCount() + this.dataset2.getRowCount();
	},
	getColumnCount : function() {
		return this.dataset1.getColumnCount();
	},
	getValue : function(i, j, seriesIndex) {
		return i < this.dataset1.getRowCount() ? this.dataset1.getValue(i, j,
				seriesIndex) : this.dataset2.getValue(i
				- this.dataset1.getRowCount(), j, seriesIndex);
	},
	setValue : function(i, j, value, seriesIndex) {
		i < this.dataset1.getRowCount() ? this.dataset1.setValue(i, j, value,
				seriesIndex) : this.dataset2.setValue(i
				- this.dataset1.getRowCount(), j, value, seriesIndex);
	},
	getSeriesCount : function() {
		return this.dataset1.getSeriesCount();
	},
	addSeries : function(options) {
		this.dataset1.addSeries(options);
		return this.dataset2.addSeries(options);
	},
	toString : function() {
		return this.getName();
	}
};
morpheus.SlicedDatasetWithNulls = function(dataset, columnIndices, columnCount,
		columnMetadata) {
	morpheus.DatasetAdapter.call(this, dataset);
	this.columnIndices = columnIndices;
	this.columnCount = columnCount;
	this.columnMetadata = columnMetadata;
};
morpheus.SlicedDatasetWithNulls.prototype = {
	getColumnMetadata : function() {
		return this.columnMetadata;
	},
	getColumnCount : function() {
		return this.columnCount;
	},
	getValue : function(i, j, seriesIndex) {
		var index = this.columnIndices[j];
		return index === undefined ? undefined : this.dataset.getValue(i,
				index, seriesIndex);
	},
	setValue : function(i, j, value, seriesIndex) {
		var index = this.columnIndices[j];
		if (index !== undefined) {
			this.dataset.setValue(i, index, value, seriesIndex);
		} else {
			console.log(j + ' out of range');
		}
	}
};
morpheus.Util.extend(morpheus.SlicedDatasetWithNulls, morpheus.DatasetAdapter);
morpheus.JoinedVector = function(v1, v2) {
	this.v1 = v1;
	this.v2 = v2;
	morpheus.VectorAdapter.call(this, v1);
	this.properties = new morpheus.Map();
};
morpheus.JoinedVector.prototype = {
	setValue : function(i, value) {
		i < this.v1.size() ? this.v1.setValue(i, value) : this.v2.setValue(i
				- this.v1.size(), value);
	},
	getValue : function(i) {
		return i < this.v1.size() ? this.v1.getValue(i) : this.v2.getValue(i
				- this.v1.size());
	},
	size : function() {
		return this.v1.size() + this.v2.size();
	},
	getProperties : function() {
		return this.properties;
	}
};
morpheus.Util.extend(morpheus.JoinedVector, morpheus.VectorAdapter);
morpheus.JoinedMetadataModel = function(m1, m2) {
	this.m1 = m1;
	this.m2 = m2;
	this.vectors = [];
	for (var i = 0, count = m1.getMetadataCount(); i < count; i++) {
		var v1 = this.m1.get(i);
		var v2 = this.m2.get(i);
		var v = new morpheus.JoinedVector(v1, v2);
		// copy properties
		v1.getProperties().forEach(function(val, key) {
			if (!morpheus.VectorKeys.COPY_IGNORE.has(key)) {
				v.properties.set(key, val);
			}
		});
		v2.getProperties().forEach(function(val, key) {
			if (!morpheus.VectorKeys.COPY_IGNORE.has(key)) {
				v.properties.set(key, val);
			}
		});

		this.vectors.push(v);
	}
};
morpheus.JoinedMetadataModel.prototype = {
	add : function(name) {
		var index = morpheus.MetadataUtil.indexOf(this, name);
		var oldVector;
		if (index !== -1) {
			oldVector = this.remove(index);
		}
		var v = new morpheus.Vector(name, this.getItemCount());
		if (oldVector != null) {
			// copy properties
			oldVector.getProperties().forEach(function(val, key) {
				v.getProperties().set(key, val);
			});
			// copy values
			for (var i = 0, size = oldVector.size(); i < size; i++) {
				v.setValue(i, oldVector.getValue(i));
			}
		}
		this.vectors.push(v);
		return v;
	},
	getItemCount : function() {
		return this.m1.getItemCount() + this.m2.getItemCount();
	},
	get : function(index) {
		return this.vectors[index];
	},
	remove : function(index) {
		return this.vectors.splice(index, 1)[0];
	},
	getByName : function(name) {
		for (var i = 0, length = this.vectors.length; i < length; i++) {
			if (name === this.vectors[i].getName()) {
				return this.vectors[i];
			}
		}
	},
	getMetadataCount : function() {
		return this.vectors.length;
	}
};

/**
 * @fileOverview Stores annotations for the rows or columns of a dataset.
 */

/**
 * Creates a new meta data model instance.
 * 
 * @param itemCount
 *            the number of items that vectors in this instances will hold.
 * @constructor
 */
morpheus.MetadataModel = function(itemCount) {
	this.itemCount = itemCount;
	this.vectors = [];
};
morpheus.MetadataModel.prototype = {
	/**
	 * Appends the specified vector to this meta data. If an existing vector
	 * with the same name already exists, it is removed and existing properties
	 * and values copied to the new vector before appending the new vector.
	 * 
	 * @param name
	 *            The vector name to be inserted into this meta data instance.
	 * @return the added vector.
	 */
	add : function(name) {
		var index = morpheus.MetadataUtil.indexOf(this, name);
		var oldVector;
		if (index !== -1) {
			oldVector = this.remove(index);
		}
		var v = new morpheus.Vector(name, this.getItemCount());
		if (oldVector != null) {
			// copy properties?
//			oldVector.getProperties().forEach(function(val, key) {
//				if (!morpheus.VectorKeys.COPY_IGNORE.has(key)) {
//					v.getProperties().set(key, val);
//				}
//
//			});
			// copy values
			for (var i = 0, size = oldVector.size(); i < size; i++) {
				var val = oldVector.getValue(i);
				v.setValue(i, val);
			}
		}
		this.vectors.push(v);
		return v;
	},
	/**
	 * Returns the number of items that a vector in this meta data model
	 * contains.
	 * 
	 * @return the item count
	 */
	getItemCount : function() {
		return this.itemCount;
	},
	/**
	 * Returns the vector at the specified metadata index.
	 * 
	 * @param index
	 *            the metadata index
	 * @return the vector
	 */
	get : function(index) {
		if (index < 0 || index >= this.vectors.length) {
			throw 'index ' + index + ' out of range';
		}
		return this.vectors[index];
	},
	/**
	 * Removes the column at the specified position in this meta data instance
	 * Shifts any subsequent columns to the left (subtracts one from their
	 * indices).
	 * 
	 * @param index
	 *            the meta data index to remove.
	 */
	remove : function(index) {
		if (index < 0 || index >= this.vectors.length) {
			throw 'index ' + index + ' out of range';
		}
		return this.vectors.splice(index, 1)[0];
	},
	/**
	 * Returns the vector witht the specified name.
	 * 
	 * @param name
	 *            the vector name
	 * @return the vector
	 */
	getByName : function(name) {
		var index = morpheus.MetadataUtil.indexOf(this, name);
		return index !== -1 ? this.get(index) : undefined;
	},
	/**
	 * Returns the number of vectors in this meta data instance.
	 * 
	 * @return the number of vectors.
	 */
	getMetadataCount : function() {
		return this.vectors.length;
	}
};
morpheus.MetadataModelAdapter = function(model) {
	this.model = model;
};
morpheus.MetadataModelAdapter.prototype = {
	add : function(name) {
		return this.model.add(name);
	},
	getItemCount : function() {
		return this.model.getItemCount();
	},
	get : function(index) {
		return this.model.get(index);
	},
	remove : function(index) {
		return this.model.remove(index);
	},
	getByName : function(name) {
		return this.model.getByName(name);
	},
	getMetadataCount : function() {
		return this.model.getMetadataCount();
	}
};
morpheus.MetadataModelColumnView = function(model, indices) {
	this.model = model;
	this.indices = indices;
};
morpheus.MetadataModelColumnView.prototype = {
	add : function(name) {
		var vector = this.model.add(name);
		var index = morpheus.MetadataUtil.indexOf(this.model, name);
		this.indices.push(index);
		return vector;
	},
	getMetadataCount : function() {
		return this.indices.length;
	},
	get : function(index) {
		if (index < 0 || index >= this.indices.length) {
			throw 'index out of bounds';
		}
		return this.model.get(this.indices[index]);
	},
	remove : function(index) {
		if (index < 0 || index >= this.indices.length) {
			throw 'index out of bounds';
		}
		var v = this.model.remove(this.indices[index]);
		this.indices.splice(index, 1);
		return v;
	},
	getByName : function(name) {
		var index = morpheus.MetadataUtil.indexOf(this, name);
		return index !== -1 ? this.get(index) : undefined;
	}
};
morpheus.Util.extend(morpheus.MetadataModelColumnView,
		morpheus.MetadataModelAdapter);
morpheus.MetadataModelItemView = function(model, indices) {
	this.model = model;
	this.indices = indices;
};
morpheus.MetadataModelItemView.prototype = {
	add : function(name) {
		var v = this.model.add(name);
		return new morpheus.SlicedVector(v, this.indices);
	},
	getItemCount : function() {
		return this.indices.length;
	},
	get : function(index) {
		var v = this.model.get(index);
		if (v === undefined) {
			return undefined;
		}
		return new morpheus.SlicedVector(v, this.indices);
	},
	getByName : function(name) {
		var v = this.model.getByName(name);
		if (v === undefined) {
			return undefined;
		}
		return new morpheus.SlicedVector(v, this.indices);
	},
	getMetadataCount : function() {
		return this.model.getMetadataCount();
	}
};
morpheus.Util.extend(morpheus.MetadataModelItemView,
		morpheus.MetadataModelAdapter);
morpheus.MetadataUtil = function () {
};

morpheus.MetadataUtil.renameFields = function (dataset, options) {
	_.each(options.rows, function (item) {
		if (item.renameTo) {
			var v = dataset.getRowMetadata().getByName(item.field);
			if (v) {
				v.setName(item.renameTo);
			}
		}
	});
	_.each(options.columns, function (item) {
		if (item.renameTo) {
			var v = dataset.getColumnMetadata().getByName(item.field);
			if (v) {
				v.setName(item.renameTo);
			}
		}
	});
};

/**
 * @param options.model
 *            Metadata model
 * @param options.text
 *            Search text
 * @param options.isColumns
 *            Whether to search columns
 * @param options.defaultMatchMode
 *            'exact' or 'contains'
 *
 */
morpheus.MetadataUtil.search = function (options) {
	var model = options.model;
	var text = options.text;
	var isColumns = options.isColumns;
	text = $.trim(text);
	if (text === '') {
		return null;
	}
	var tokens = morpheus.Util.getAutocompleteTokens(text);
	if (tokens.length == 0) {
		return null;
	}
	var indexField = isColumns ? 'COLUMN' : 'ROW';
	var fieldNames = morpheus.MetadataUtil.getMetadataNames(model);
	fieldNames.push(indexField);
	var predicates = morpheus.Util.createSearchPredicates({
		tokens: tokens,
		fields: fieldNames,
		defaultMatchMode: options.defaultMatchMode
	});
	var vectors = [];
	var nameToVector = new morpheus.Map();
	for (var j = 0; j < model.getMetadataCount(); j++) {
		var v = model.get(j);
		var dataType = morpheus.VectorUtil.getDataType(v);
		var wrapper = {
			vector: v,
			dataType: dataType,
			isArray: dataType.indexOf('[') === 0
		};
		nameToVector.set(v.getName(), wrapper);
		vectors.push(wrapper);

	}
	// TODO only search numeric fields for range searches
	var indices = [];
	var npredicates = predicates.length;
	var nfields = vectors.length;
	for (var i = 0, nitems = model.getItemCount(); i < nitems; i++) {
		var matches = false;
		for (var p = 0; p < npredicates && !matches; p++) {
			var predicate = predicates[p];
			var filterColumnName = predicate.getField();
			if (filterColumnName != null) {
				var value = null;
				if (filterColumnName === indexField) {
					value = i + 1;
					if (predicate.accept(value)) {
						matches = true;
						break;
					}
				} else {
					var wrapper = nameToVector.get(filterColumnName);
					if (wrapper) {
						value = wrapper.vector.getValue(i);
						if (value != null) {
							if (wrapper.isArray) {
								for (var k = 0; k < value.length; k++) {
									if (predicate.accept(value[k])) {
										matches = true;
										break;
									}
								}
							} else {
								if (predicate.accept(value)) {
									matches = true;
									break;
								}
							}

						}
					}
				}

			} else { // try all fields
				for (var j = 0; j < nfields; j++) {
					var wrapper = vectors[j];
					var value = wrapper.vector.getValue(i);
					if (value != null) {
						if (wrapper.isArray) {
							for (var k = 0; k < value.length; k++) {
								if (predicate.accept(value[k])) {
									matches = true;
									break;
								}
							}
						} else {
							if (predicate.accept(value)) {
								matches = true;
								break;
							}
						}

					}
				}
			}
		}
		if (matches) {
			indices.push(i);
		}
	}
	return indices;
};

morpheus.MetadataUtil.shallowCopy = function (model) {
	var copy = new morpheus.MetadataModel(model.getItemCount());
	for (var i = 0; i < model.getMetadataCount(); i++) {
		var v = model.get(i);
		// copy properties b/c they can be modified via ui
		var newVector = new morpheus.VectorAdapter(v);
		newVector.properties = new morpheus.Map();
		newVector.getProperties = function () {
			return this.properties;
		};

		v.getProperties().forEach(function (val, key) {
			if (!morpheus.VectorKeys.COPY_IGNORE.has(key)) {
				newVector.properties.set(key, val);
			}

		});

		copy.vectors.push(newVector);
	}
	return copy;
};
morpheus.MetadataUtil.autocomplete = function (model) {
	return function (tokens, cb) {
		// check for term:searchText
		var matches = [];
		var regex = null;
		var regexMatch = null;
		var searchModel = model;
		var token = tokens != null && tokens.length > 0 ? tokens[tokens.selectionStartIndex]
			: '';
		token = $.trim(token);
		try {
			if (token !== '') {
				var field = null;
				var semi = token.indexOf(':');
				if (semi > 0) { // field search?
					if (token.charCodeAt(semi - 1) !== 92) { // \:
						var possibleField = $.trim(token.substring(0, semi));
						if (possibleField.length > 0
							&& possibleField[0] === '"'
							&& possibleField[token.length - 1] === '"') {
							possibleField = possibleField.substring(1,
								possibleField.length - 1);
						}
						var index = morpheus.MetadataUtil.indexOf(searchModel,
							possibleField);
						if (index !== -1) {
							token = $.trim(token.substring(semi + 1));
							searchModel = new morpheus.MetadataModelColumnView(
								model, [index]);
						}
					}

				}
				var set = new morpheus.Set();
				// regex used to determine if a string starts with substring `q`

				regex = new RegExp(morpheus.Util.escapeRegex(token), 'i');
				regexMatch = new RegExp('(' + morpheus.Util.escapeRegex(token) + ')', 'i');
				// iterate through the pool of strings and for any string that
				// contains the substring `q`, add it to the `matches` array
				var max = 10;

				var vectors = [];
				var isArray = [];
				for (var j = 0; j < searchModel.getMetadataCount(); j++) {
					var v = searchModel.get(j);
					var dataType = morpheus.VectorUtil.getDataType(v);
					if (dataType === 'string' || dataType === '[string]') { // skip
						// numeric
						// fields
						vectors.push(v);
						isArray.push(dataType === '[string]');
					}
				}

				var nfields = vectors.length;

				loop: for (var i = 0, nitems = searchModel.getItemCount(); i < nitems; i++) {
					for (var j = 0; j < nfields; j++) {
						var v = vectors[j];
						var val = v.getValue(i);
						if (val != null) {
							if (isArray[j]) {
								for (var k = 0; k < val.length; k++) {
									var id = new morpheus.Identifier([val[k],
										v.getName()]);
									if (!set.has(id) && regex.test(val[k])) {
										set.add(id);
										if (set.size() === max) {
											break loop;
										}
									}
								}
							} else {
								var id = new morpheus.Identifier([val,
									v.getName()]);
								if (!set.has(id) && regex.test(val)) {
									set.add(id);
									if (set.size() === max) {
										break loop;
									}
								}
							}
						}

					}
				}

				set.forEach(function (id) {
					var array = id.getArray();
					var field = array[1];
					var val = array[0];
					var quotedField = field;
					if (quotedField.indexOf(' ') !== -1) {
						quotedField = '"' + quotedField + '"';
					}
					var quotedValue = val;
					if (quotedValue.indexOf(' ') !== -1) {
						quotedValue = '"' + quotedValue + '"';
					}
					matches.push({
						value: quotedField + ':' + quotedValue,
						label: '<span style="font-weight:300;">' + field
						+ ':</span>'
						+ '<span>' + val.replace(regexMatch, '<b>$1</b>')
						+ '</span>'
					});

				});
			}
		} catch (x) {

		}
		// field names
		if (regex == null) {
			regex = new RegExp('.*', 'i');
		}

		for (var j = 0; j < searchModel.getMetadataCount(); j++) {
			var v = searchModel.get(j);
			var dataType = morpheus.VectorUtil.getDataType(v);
			var field = v.getName();
			if (dataType === 'number' || dataType === 'string'
				|| dataType === '[string]') {
				if (regex.test(field)) {
					var quotedField = field;
					if (quotedField.indexOf(' ') !== -1) {
						quotedField = '"' + quotedField + '"';
					}
					matches.push({
						value: quotedField + ':',
						label: '<span style="font-weight:300;">' + (regexMatch == null ? field : field.replace(regexMatch, '<b>$1</b>'))
						+ ':</span>' + (dataType === 'number' ? ('<span' +
						' style="font-weight:300;font-size:85%;">min..max</span>') : ''),
						show: true
					});
				}
			}
		}
		cb(matches);
	};
};

morpheus.MetadataUtil.getMetadataNames = function (metadataModel) {
	var names = [];
	for (var i = 0, count = metadataModel.getMetadataCount(); i < count; i++) {
		names.push(metadataModel.get(i).getName(i));
	}
	names.sort(function (a, b) {
		a = a.toLowerCase();
		b = b.toLowerCase();
		return (a < b ? -1 : (a === b ? 0 : 1));
	});
	return names;
};
morpheus.MetadataUtil.getVectors = function (metadataModel, names) {
	var vectors = [];
	names.forEach(function (name) {
		var v = metadataModel.getByName(name);
		if (!v) {
			throw name + ' not found. Available fields are '
			+ morpheus.MetadataUtil.getMetadataNames(metadataModel);
		}
		vectors.push(v);
	});
	return vectors;
};
morpheus.MetadataUtil.indexOf = function (metadataModel, name) {
	for (var i = 0, length = metadataModel.getMetadataCount(); i < length; i++) {
		if (name === metadataModel.get(i).getName()) {
			return i;
		}
	}
	return -1;
};

morpheus.MetadataUtil.DEFAULT_STRING_ARRAY_FIELDS = ['target', 'moa'];

morpheus.MetadataUtil.DEFAULT_HIDDEN_FIELDS = new morpheus.Set();
['pr_analyte_id', 'pr_gene_title', 'pr_gene_id', 'pr_analyte_num',
	'pr_bset_id', 'pr_lua_id', 'pr_pool_id', 'pr_is_bing', 'pr_is_inf',
	'pr_is_lmark', 'qc_slope', 'qc_f_logp', 'qc_iqr', 'bead_batch',
	'bead_revision', 'bead_set', 'det_mode', 'det_plate', 'det_well',
	'mfc_plate_dim', 'mfc_plate_id', 'mfc_plate_name', 'mfc_plate_quad',
	'mfc_plate_well', 'pert_dose_unit', 'pert_id_vendor', 'pert_mfc_desc',
	'pert_mfc_id', 'pert_time', 'pert_time_unit', 'pert_univ_id',
	'pert_vehicle', 'pool_id', 'rna_plate', 'rna_well', 'count_mean',
	'count_cv', 'provenance_code'].forEach(function (name) {
	morpheus.MetadataUtil.DEFAULT_HIDDEN_FIELDS.add(name);
});

morpheus.MetadataUtil.maybeConvertStrings = function (metadata,
													  metadataStartIndex) {
	for (var i = metadataStartIndex, count = metadata.getMetadataCount(); i < count; i++) {
		morpheus.VectorUtil.maybeConvertStringToNumber(metadata.get(i));
	}
	morpheus.MetadataUtil.DEFAULT_STRING_ARRAY_FIELDS.forEach(function (field) {
		if (metadata.getByName(field)) {
			morpheus.VectorUtil.maybeConvertToStringArray(metadata
			.getByName(field), ',');
		}
	});

};
morpheus.MetadataUtil.copy = function (src, dest) {
	if (src.getItemCount() != dest.getItemCount()) {
		throw 'Item count not equal in source and destination. '
		+ src.getItemCount() + ' != ' + dest.getItemCount();
	}
	var itemCount = src.getItemCount();
	var metadataColumns = src.getMetadataCount();
	for (var j = 0; j < metadataColumns; j++) {
		var srcVector = src.get(j);
		var destVector = dest.getByName(srcVector.getName());
		if (destVector == null) {
			destVector = dest.add(srcVector.getName());
		}
		for (var i = 0; i < itemCount; i++) {
			destVector.setValue(i, srcVector.getValue(i));
		}
	}
};
morpheus.MetadataUtil.addVectorIfNotExists = function (metadataModel, name) {
	var v = metadataModel.getByName(name);
	if (!v) {
		v = metadataModel.add(name);
	}
	return v;
};
morpheus.MetadataUtil.getMatchingIndices = function (metadataModel, tokens) {
	var indices = {};
	for (var itemIndex = 0, nitems = metadataModel.getItemCount(); itemIndex < nitems; itemIndex++) {
		var matches = false;
		for (var metadataIndex = 0, metadataCount = metadataModel
		.getMetadataCount(); metadataIndex < metadataCount && !matches; metadataIndex++) {
			var vector = metadataModel.get(metadataModel
			.getColumnName(metadataIndex));
			var value = vector.getValue(itemIndex);
			for (var i = 0, length = tokens.length; i < length; i++) {
				if (tokens[i] == value) {
					matches = true;
					break;
				}
			}
		}
		if (matches) {
			indices[itemIndex] = 1;
		}
	}
	return indices;
};

morpheus.Positions = function () {
	this.spaces = undefined;
	this.defaultPositionFunction = function (index) {
		return (this.size * index);
	};
	this.squishedPositionFunction = function (index) {
		return this.positions[index];
	};
	this.positionFunction = this.defaultPositionFunction;
	this.squishedIndices = {};
	this.isSquished = false;
};
morpheus.Positions.getBottom = function (rect, rowPositions) {
	var bottom = rowPositions.getLength();
	if (rect != null) {
		bottom = 1 + rowPositions.getIndex(rect.y + rect.height, false);
		bottom = Math.max(0, bottom);
		bottom = Math.min(rowPositions.getLength(), bottom);
	}
	return bottom;
};
morpheus.Positions.getTop = function (rect, rowPositions) {
	var top = 0;
	if (rect != null) {
		top = rowPositions.getIndex(rect.y, false) - 1;
		top = Math.max(0, top);
		top = Math.min(rowPositions.getLength(), top);
	}
	return top;
};
morpheus.Positions.getLeft = function (rect, columnPositions) {
	var left = 0;
	if (rect != null) {
		left = columnPositions.getIndex(rect.x, false) - 1;
		left = Math.max(0, left);
		left = Math.min(columnPositions.getLength(), left);
	}
	return left;
};
morpheus.Positions.getRight = function (rect, columnPositions) {
	var right = columnPositions.getLength();
	if (rect != null) {
		right = 1 + columnPositions.getIndex(rect.x + rect.width, false);
		right = Math.min(columnPositions.getLength(), right);
	}
	return right;
};
morpheus.Positions.prototype = {
	length: 0,
	size: 13,
	squishFactor: 0.1,
	compress: true,
	copy: function () {
		var copy = new morpheus.Positions();
		if (this.spaces) {
			copy.spaces = this.spaces.slice();
		}
		copy.compress = this.compress;
		copy.squishFactor = this.squishFactor;
		copy.size = this.size;
		copy.length = this.length;
		if (this.isSquished) {
			copy.positionFunction = copy.squishedPositionFunction;
			copy.squishedIndices = _.clone(this.squishedIndices);
			copy.isSquished = true;
		}
		return copy;
	},
	getIndex: function (position, exact) {
		if (this.getLength() === 0) {
			return -1;
		}
		if (exact) {
			return this.binaryExactSearch(position);
		} else {
			return this.binaryInExactSearch(position);
		}
	},
	getLength: function () {
		return this.length;
	},
	getPosition: function (index) {
		return this.positionFunction(index)
			+ (this.spaces !== undefined ? this.spaces[index] : 0);
	},
	getItemSize: function (index) {
		return this.squishedIndices[index] === true ? this.size
		* this.squishFactor : this.size;
	},
	getSize: function () {
		return this.size;
	},
	setSpaces: function (spaces) {
		this.spaces = spaces;
	},
	setLength: function (length) {
		this.length = length;
	},
	setSize: function (size) {
		this.size = size;
		if (this.isSquished) {
			this.setSquishedIndices(this.squishedIndices);
		}
	},
	setSquishedIndices: function (squishedIndices) {
		if (squishedIndices != null) {
			var compress = this.compress;
			this.squishedIndices = squishedIndices;
			var positions = [];
			var squishFactor = this.squishFactor;
			var size = this.size;
			var position = 0;
			for (var i = 0, length = this.getLength(); i < length; i++) {
				var itemSize;
				if (squishedIndices[i] === true) {
					positions.push(position);
					itemSize = size * squishFactor;
					position += itemSize;
				} else {
					if (!compress) {
						position = size * i;
					}
					positions.push(position);
					position += size;
				}
			}
			this.isSquished = true;
			this.positions = positions;
			this.positionFunction = this.squishedPositionFunction;
		} else {
			this.squishedIndices = {};
			this.isSquished = false;
			this.positionFunction = this.defaultPositionFunction;
		}
	},
	setSquishFactor: function (f) {
		if (this.squishFactor !== f) {
			this.squishFactor = f;
			if (this.isSquished) {
				this.setSquishedIndices(this.squishedIndices);
			}
		}
	},
	getSquishFactor: function () {
		return this.squishFactor;
	},
	binaryExactSearch: function (position) {
		var low = 0;
		var high = this.length - 1;
		while (low <= high) {
			var mid = (low + high) >> 1;
			var midVal = this.getPosition(mid);
			var size = this.getItemSize(mid);
			if (midVal <= position && position < (midVal + size)) {
				return mid;
			}
			if (midVal < position) {
				low = mid + 1;
			} else if (midVal > position) {
				high = mid - 1;
			} else {
				return mid;
				// key found
			}
		}
		return -1;
		// key not found
	},
	binaryInExactSearch: function (position) {
		var low = 0;
		var high = this.getLength() - 1;
		var maxIndex = this.getLength() - 1;
		if (position <= this.getPosition(0)) {
			return 0;
		}
		while (low <= high) {
			var mid = (low + high) >> 1;
			var midVal = this.getPosition(mid);
			var size = this.getItemSize(mid);
			var nextStart = maxIndex === mid ? midVal + size : this
			.getPosition(mid + 1);
			if (midVal <= position && position < nextStart) {
				return mid;
			}
			if (midVal < position) {
				low = mid + 1;
			} else if (midVal > position) {
				high = mid - 1;
			} else {
				return mid;
				// key found
			}
		}
		return low - 1;
		// key not found
	}
};

morpheus.Project = function(dataset) {
	this.originalDataset = dataset;
	this.rowIndexMapper = new morpheus.IndexMapper(this, true);
	this.columnIndexMapper = new morpheus.IndexMapper(this, false);
	this.groupRows = [];
	this.groupColumns = [];
	this.rowColorModel = new morpheus.VectorColorModel();
	this.columnColorModel = new morpheus.VectorColorModel();
	this.rowShapeModel = new morpheus.VectorShapeModel();
	this.columnShapeModel = new morpheus.VectorShapeModel();
	this.hoverColumnIndex = -1;
	this.hoverRowIndex = -1;
	this.columnSelectionModel = new morpheus.SelectionModel(this, true);
	this.rowSelectionModel = new morpheus.SelectionModel(this, false);
	this.elementSelectionModel = new morpheus.ElementSelectionModel(this);

	morpheus.Project._recomputeCalculatedFields(this.originalDataset);
	morpheus.Project
			._recomputeCalculatedFields(new morpheus.TransposedDatasetView(
					this.originalDataset));
};
morpheus.Project.Events = {
	DATASET_CHANGED : 'datasetChanged',
	ROW_GROUP_BY_CHANGED : 'rowGroupByChanged',
	COLUMN_GROUP_BY_CHANGED : 'columnGroupByChanged',
	ROW_FILTER_CHANGED : 'rowFilterChanged',
	COLUMN_FILTER_CHANGED : 'columnFilterChanged',
	ROW_SORT_ORDER_CHANGED : 'rowSortOrderChanged',
	COLUMN_SORT_ORDER_CHANGED : 'columnSortOrderChanged',
	ROW_TRACK_REMOVED : 'rowTrackRemoved',
	COLUMN_TRACK_REMOVED : 'columnTrackRemoved'
};

morpheus.Project._recomputeCalculatedFields = function(dataset) {
	var metadata = dataset.getRowMetadata();
	var view = new morpheus.DatasetRowView(dataset);
	for (var metadataIndex = 0, count = metadata.getMetadataCount(); metadataIndex < count; metadataIndex++) {
		var v = metadata.get(metadataIndex);
		var f = v.getProperties().get(morpheus.VectorKeys.FUNCTION);
		if (f != null
				&& v.getProperties()
						.get(morpheus.VectorKeys.RECOMPUTE_FUNCTION)) {
			for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
				v.setValue(i, f(view.setIndex(i)));
			}
		}
	}

};
morpheus.Project.prototype = {
	getHoverColumnIndex : function() {
		return this.hoverColumnIndex;
	},
	setHoverColumnIndex : function(index) {
		this.hoverColumnIndex = index;
	},
	getHoverRowIndex : function() {
		return this.hoverRowIndex;
	},
	setHoverRowIndex : function(index) {
		this.hoverRowIndex = index;
	},
	getRowColorModel : function() {
		return this.rowColorModel;
	},
	getRowShapeModel : function() {
		return this.rowShapeModel;
	},
	getColumnShapeModel : function() {
		return this.columnShapeModel;
	},
	getGroupRows : function() {
		return this.groupRows;
	},
	getGroupColumns : function() {
		return this.groupColumns;
	},
	getFullDataset : function() {
		return this.originalDataset;
	},
	getColumnSelectionModel : function() {
		return this.columnSelectionModel;
	},
	getRowSelectionModel : function() {
		return this.rowSelectionModel;
	},
	getFilteredSortedRowIndices : function() {
		return this.rowIndexMapper.convertToView();
	},
	getFilteredSortedColumnIndices : function() {
		return this.columnIndexMapper.convertToView();
	},
	getElementSelectionModel : function() {
		return this.elementSelectionModel;
	},
	setFullDataset : function(dataset, notify) {
		this.originalDataset = dataset;
		this.rowIndexMapper.setFilter(this.rowIndexMapper.getFilter());
		this.columnIndexMapper.setFilter(this.columnIndexMapper.getFilter());
		this.columnSelectionModel.clear();
		this.rowSelectionModel.clear();
		this.elementSelectionModel.clear();

		if (notify) {
			this.trigger(morpheus.Project.Events.DATASET_CHANGED);
		}
	},
	setGroupRows : function(keys, notify) {
		this.groupRows = keys;
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_GROUP_BY_CHANGED);
		}
	},
	setGroupColumns : function(keys, notify) {
		this.groupColumns = keys;
		if (notify) {
			this.trigger(morpheus.Project.Events.COLUMN_GROUP_BY_CHANGED);
		}
	},
	setRowFilter : function(filter, notify) {
		this._saveSelection(false);
		this.rowIndexMapper.setFilter(filter);
		this._restoreSelection(false);
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_FILTER_CHANGED);
		}
	},
	getRowFilter : function() {
		return this.rowIndexMapper.getFilter();
	},
	getColumnFilter : function() {
		return this.columnIndexMapper.getFilter();
	},
	setColumnFilter : function(filter, notify) {
		this._saveSelection(true);
		this.columnIndexMapper.setFilter(filter);
		this._restoreSelection(true);
		if (notify) {
			this.trigger(morpheus.Project.Events.COLUMN_FILTER_CHANGED);
		}
	},
	getColumnColorModel : function() {
		return this.columnColorModel;
	},
	getSortedFilteredDataset : function() {
		return morpheus.DatasetUtil.slicedView(this.getFullDataset(),
				this.rowIndexMapper.convertToView(), this.columnIndexMapper
						.convertToView());
	},
	getSelectedDataset : function(options) {
		options = $.extend({}, {
			selectedRows : true,
			selectedColumns : true,
			emptyToAll : true
		}, options);
		var dataset = this.getSortedFilteredDataset();
		var rows = null;
		if (options.selectedRows) {
			rows = this.rowSelectionModel.getViewIndices().values().sort(
					function(a, b) {
						return (a === b ? 0 : (a < b ? -1 : 1));
					});
			if (rows.length === 0 && options.emptyToAll) {
				rows = null;
			}
		}
		var columns = null;
		if (options.selectedColumns) {
			columns = this.columnSelectionModel.getViewIndices().values().sort(
					function(a, b) {
						return (a === b ? 0 : (a < b ? -1 : 1));
					});
			if (columns.length === 0 && options.emptyToAll) {
				columns = null;
			}
		}
		return morpheus.DatasetUtil.slicedView(dataset, rows, columns);
	},
	_saveSelection : function(isColumns) {
		this.elementSelectionModel.save();
		if (isColumns) {
			this.columnSelectionModel.save();
		} else {
			this.rowSelectionModel.save();
		}
	},
	_restoreSelection : function(isColumns) {
		if (isColumns) {
			this.columnSelectionModel.restore();
		} else {
			this.rowSelectionModel.restore();
		}
		this.elementSelectionModel.restore();
	},
	setRowSortKeys : function(keys, notify) {
		this._saveSelection(false);
		this.rowIndexMapper.setSortKeys(keys);
		this._restoreSelection(false);
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_SORT_ORDER_CHANGED);
		}
	},
	setColumnSortKeys : function(keys, notify) {
		this._saveSelection(true);
		this.columnIndexMapper.setSortKeys(keys);
		this._restoreSelection(true);
		if (notify) {
			this.trigger(morpheus.Project.Events.COLUMN_SORT_ORDER_CHANGED);
		}
	},
	getRowSortKeys : function() {
		return this.rowIndexMapper.sortKeys;
	},
	getColumnSortKeys : function() {
		return this.columnIndexMapper.sortKeys;
	},
	convertViewColumnIndexToModel : function(viewIndex) {
		return this.columnIndexMapper.convertViewIndexToModel(viewIndex);
	},
	convertViewRowIndexToModel : function(viewIndex) {
		return this.rowIndexMapper.convertViewIndexToModel(viewIndex);
	},
	convertModelRowIndexToView : function(modelIndex) {
		return this.rowIndexMapper.convertModelIndexToView(modelIndex);
	},
	convertModelColumnIndexToView : function(modelIndex) {
		return this.columnIndexMapper.convertModelIndexToView(modelIndex);
	},
	isColumnViewIndexSelected : function(index) {
		return this.columnSelectionModel.isViewIndexSelected(index);
	},
	isRowViewIndexSelected : function(index) {
		return this.rowSelectionModel.isViewIndexSelected(index);
	}
};
morpheus.Util.extend(morpheus.Project, morpheus.Events);
morpheus.SelectionModel = function(project, isColumns) {
	this.viewIndices = new morpheus.Set();
	this.project = project;
	this.isColumns = isColumns;
};
morpheus.SelectionModel.prototype = {
	setViewIndices : function(indices, notify) {
		this.viewIndices = indices;
		if (notify) {
			this.trigger('selectionChanged');
		}
	},
	isViewIndexSelected : function(index) {
		return this.viewIndices.has(index);
	},
	clear : function() {
		this.viewIndices = new morpheus.Set();
	},
	/**
	 * 
	 * @returns {morpheus.Set}
	 */
	getViewIndices : function() {
		return this.viewIndices;
	},
	count : function() {
		return this.viewIndices.size();
	},
	toModelIndices : function() {
		var project = this.project;
		var f = this.isColumns ? project.convertViewColumnIndexToModel
				: project.convertViewRowIndexToModel;
		f = _.bind(f, project);
		var modelIndices = [];
		this.viewIndices.forEach(function(index) {
			var m = f(index);
			modelIndices.push(m);
		});
		return modelIndices;
	},
	save : function() {
		this.modelIndices = this.toModelIndices();
	},
	restore : function() {
		var project = this.project;
		this.viewIndices = new morpheus.Set();
		var f = this.isColumns ? project.convertModelColumnIndexToView
				: project.convertModelRowIndexToView;
		f = _.bind(f, project);
		for (var i = 0, length = this.modelIndices.length; i < length; i++) {
			var index = f(this.modelIndices[i]);
			if (index !== -1) {
				this.viewIndices.add(index);
			}
		}
	},
};
morpheus.Util.extend(morpheus.SelectionModel, morpheus.Events);
morpheus.SlicedDatasetView = function(dataset, rowIndices, columnIndices) {
	morpheus.DatasetAdapter.call(this, dataset);
	if (rowIndices == null) {
		rowIndices = null;
	}
	if (columnIndices == null) {
		columnIndices = null;
	}
	this.rowIndices = rowIndices;
	this.columnIndices = columnIndices;
};
morpheus.SlicedDatasetView.prototype = {
	getRowCount : function() {
		return this.rowIndices !== null ? this.rowIndices.length : this.dataset
				.getRowCount();
	},
	getColumnCount : function() {
		return this.columnIndices !== null ? this.columnIndices.length
				: this.dataset.getColumnCount();
	},
	getValue : function(i, j, seriesIndex) {
		return this.dataset.getValue(
				this.rowIndices !== null ? this.rowIndices[i] : i,
				this.columnIndices !== null ? this.columnIndices[j] : j,
				seriesIndex);
	},
	setValue : function(i, j, value, seriesIndex) {
		this.dataset.setValue(
				this.rowIndices !== null ? this.rowIndices[i] : i,
				this.columnIndices !== null ? this.columnIndices[j] : j, value,
				seriesIndex);
	},
	getRowMetadata : function() {
		return this.rowIndices !== null ? new morpheus.MetadataModelItemView(
				this.dataset.getRowMetadata(), this.rowIndices) : this.dataset
				.getRowMetadata();
	},
	getColumnMetadata : function() {
		return this.columnIndices !== null ? new morpheus.MetadataModelItemView(
				this.dataset.getColumnMetadata(), this.columnIndices)
				: this.dataset.getColumnMetadata();
	},
	toString : function() {
		return this.getName();
	}
};
morpheus.Util.extend(morpheus.SlicedDatasetView, morpheus.DatasetAdapter);
morpheus.SlicedVector = function(v, indices) {
	morpheus.VectorAdapter.call(this, v);
	this.indices = indices;
};
morpheus.SlicedVector.prototype = {
	setValue : function(i, value) {
		this.v.setValue(this.indices[i], value);
	},
	getValue : function(i) {
		return this.v.getValue(this.indices[i]);
	},
	size : function() {
		return this.indices.length;
	}
};
morpheus.Util.extend(morpheus.SlicedVector, morpheus.VectorAdapter);
morpheus.MatchesOnTopSortKey = function (project, modelIndices, name) {
	var modelHighlight = {};
	var p = project;
	var viewIndices = [];
	for (var i = 0, j = modelIndices.length, length = modelIndices.length; i < length; i++, j--) {
		modelHighlight[modelIndices[i]] = j;
		viewIndices.push(i);
	}
	this.comparator = function (i1, i2) {
		var a = modelHighlight[i1];
		if (a === undefined) {
			a = 0;
		}
		var b = modelHighlight[i2];
		if (b === undefined) {
			b = 0;
		}
		return (a > b ? -1 : (a === b ? 0 : 1));
	};
	this.indices = viewIndices;
	this.name = name;
};
morpheus.MatchesOnTopSortKey.prototype = {
	init: function () {
	},
	getSortOrder: function () {
		return 2;
	},
	getComparator: function () {
		return this.comparator;
	},
	getValue: function (i) {
		return i;
	},
	toString: function (i) {
		return this.name;
	}
};
morpheus.SortKey = function (field, sortOrder) {
	if (typeof sortOrder === 'string') {
		sortOrder = morpheus.SortKey.SortOrder[sortOrder.toUpperCase()];
	}
	this.field = field;
	this.sortOrder = sortOrder;
	this.v = null;
	this.c = null;
	this.setSortOrder(sortOrder);
};

morpheus.SortKey.SortOrder = {
	ASCENDING: 0,
	DESCENDING: 1,
	UNSORTED: 2,
	CUSTOM: 3,
	TOP_N: 4
};
morpheus.SortKey.ASCENDING_COMPARATOR = function (a, b) {
	// we want NaNs to end up at the bottom
	var aNaN = (a == null || _.isNumber(a) && isNaN(a) || a.length === 0);
	var bNaN = (b == null || _.isNumber(b) && isNaN(b) || b.length === 0);
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}
	if (a.toLowerCase) {
		a = a.toLowerCase();
	}
	if (b.toLowerCase) {
		b = b.toLowerCase();
	}

	return (a === b ? 0 : (a < b ? -1 : 1));
};

morpheus.SortKey.DESCENDING_COMPARATOR = function (a, b) {

	var aNaN = (a == null || _.isNumber(a) && isNaN(a) || a.length === 0);
	var bNaN = (b == null || _.isNumber(b) && isNaN(b)) || b.length === 0;
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}
	if (a.toLowerCase) {
		a = a.toLowerCase();
	}
	if (b.toLowerCase) {
		b = b.toLowerCase();
	}
	return (a === b ? 0 : (a < b ? 1 : -1));
};

morpheus.SortKey.NUMBER_ASCENDING_COMPARATOR = function (a, b) {
	// we want NaNs to end up at the bottom
	var aNaN = (a == null || isNaN(a));
	var bNaN = (b == null || isNaN(b));
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}
	return (a === b ? 0 : (a < b ? -1 : 1));
};

morpheus.SortKey.NUMBER_DESCENDING_COMPARATOR = function (a, b) {
	var aNaN = (a == null || isNaN(a));
	var bNaN = (b == null || isNaN(b));
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}
	return (a === b ? 0 : (a < b ? 1 : -1));
};

morpheus.SortKey.STRING_ASCENDING_COMPARATOR = function (a, b) {
	a = (a == null || a.toLowerCase === undefined) ? null : a.toLowerCase();
	b = (b == null || b.toLowerCase === undefined) ? null : b.toLowerCase();
	return (a === b ? 0 : (a < b ? -1 : 1));
};
morpheus.SortKey.STRING_DESCENDING_COMPARATOR = function (a, b) {
	a = (a == null || a.toLowerCase === undefined) ? null : a.toLowerCase();
	b = (b == null || b.toLowerCase === undefined) ? null : b.toLowerCase();
	return (a === b ? 0 : (a < b ? 1 : -1));
};

morpheus.SortKey.ELEMENT_ASCENDING_COMPARATOR = function (obj1, obj2) {
	var a = +obj1;
	var b = +obj2;
	var aNaN = isNaN(a);
	var bNaN = isNaN(b);
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}

	if (a === b) {
		if (obj1.toObject && obj2.toObject) {
			var a1 = obj1.toObject();
			var b1 = obj2.toObject();
			for (var name in a1) {
				a = a1[name];
				b = b1[name];

				var c = (a === b ? 0 : (a < b ? -1 : 1));
				if (c !== 0) {
					return c;
				}
			}
		}
	}
	return (a === b ? 0 : (a < b ? -1 : 1));
};

morpheus.SortKey.ELEMENT_DESCENDING_COMPARATOR = function (obj1, obj2) {
	// we want NaNs to end up at the bottom
	var a = +obj1;
	var b = +obj2;
	var aNaN = isNaN(a);
	var bNaN = isNaN(b);
	if (aNaN && bNaN) {
		return 0;
	}
	if (aNaN) {
		return 1;
	}
	if (bNaN) {
		return -1;
	}
	if (a === b) {
		if (obj1.toObject && obj2.toObject) {
			var a1 = obj1.toObject();
			var b1 = obj2.toObject();
			for (var name in a1) {
				a = a1[name];
				b = b1[name];
				var c = (a === b ? 0 : (a < b ? 1 : -1));
				if (c !== 0) {
					return c;
				}
			}
		}
	}
	return (a === b ? 0 : (a < b ? 1 : -1));
};
morpheus.SortKey.BOX_PLOT_SUMMARY_FUNCTION = function (array) {
	var box = array.box;
	if (box == null) {
		var v = morpheus.VectorUtil.arrayAsVector(array);
		box = morpheus
		.BoxPlotItem(this.indices != null ? new morpheus.SlicedVector(
			v, this.indices) : v);
		array.box = box;
	}

	return box.q3;
};

morpheus.SortKey.ARRAY_MAX_SUMMARY_FUNCTION = function (array) {
	var a = 0;
	if (array != null) {
		var aPosMax = -Number.MAX_VALUE;
		var aNegMax = Number.MAX_VALUE;
		for (var i = 0, length = array.length; i < length; i++) {
			var value = array[i];
			if (!isNaN(value)) {
				if (value >= 0) {
					aPosMax = value > aPosMax ? value : aPosMax;
				} else {
					aNegMax = value < aNegMax ? value : aNegMax;
				}
			}
		}

		if (aPosMax !== -Number.MAX_VALUE) {
			a = aPosMax;
		}
		if (aNegMax !== Number.MAX_VALUE) {
			a = Math.abs(aNegMax) > a ? aNegMax : a;
		}
	}
	return a;
};
morpheus.SortKey.ARRAY_ASCENDING_COMPARATOR = function (summary) {
	return function (a, b) {
		var aNaN = a == null;
		var bNaN = b == null;
		if (aNaN && bNaN) {
			return 0;
		}
		if (aNaN) {
			return 1;
		}
		if (bNaN) {
			return -1;
		}
		a = summary(a);
		b = summary(b);
		aNaN = isNaN(a);
		bNaN = isNaN(b);
		if (aNaN && bNaN) {
			return 0;
		}
		if (aNaN) {
			return 1;
		}
		if (bNaN) {
			return -1;
		}
		return (a === b ? 0 : (a < b ? -1 : 1));
	};
};

morpheus.SortKey.ARRAY_DESCENDING_COMPARATOR = function (summary) {
	return function (a, b) {
		var aNaN = a == null;
		var bNaN = b == null;
		if (aNaN && bNaN) {
			return 0;
		}
		if (aNaN) {
			return 1;
		}
		if (bNaN) {
			return -1;
		}
		a = summary(a);
		b = summary(b);
		aNaN = isNaN(a);
		bNaN = isNaN(b);
		if (aNaN && bNaN) {
			return 0;
		}
		if (aNaN) {
			return 1;
		}
		if (bNaN) {
			return -1;
		}
		return (a === b ? 0 : (a < b ? 1 : -1));
	};
};

morpheus.SortKey.reverseComparator = function (c) {
	return function (a, b) {
		return c(b, a);
	};
};

morpheus.SortKey.prototype = {
	init: function (dataset) {
		this.v = dataset.getRowMetadata().getByName(this.field);
		if (!this.v) {
			this.v = {};
			this.v.getValue = function () {
				return 0;
			};
			this.c = this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING ? morpheus.SortKey.ASCENDING_COMPARATOR
				: morpheus.SortKey.DESCENDING_COMPARATOR;
		} else {
			var dataType = morpheus.VectorUtil.getDataType(this.v);
			if (dataType === 'number') {
				this.c = this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING ? morpheus.SortKey.NUMBER_ASCENDING_COMPARATOR
					: morpheus.SortKey.NUMBER_DESCENDING_COMPARATOR;
			} else if (dataType === '[number]') {
				var summary = this.v.getProperties().get(
						morpheus.VectorKeys.ARRAY_SUMMARY_FUNCTION)
					|| morpheus.SortKey.ARRAY_MAX_SUMMARY_FUNCTION;

				this.c = this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING ? morpheus.SortKey
				.ARRAY_ASCENDING_COMPARATOR(summary)
					: morpheus.SortKey.ARRAY_DESCENDING_COMPARATOR(summary);
			} else {
				this.c = this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING ? morpheus.SortKey.ASCENDING_COMPARATOR
					: morpheus.SortKey.DESCENDING_COMPARATOR;
			}
		}
	},
	getComparator: function () {
		return this.c;
	},
	getValue: function (i) {
		return this.v.getValue(i);
	},
	setSortOrder: function (sortOrder) {
		this.sortOrder = sortOrder;
	},
	getSortOrder: function () {
		return this.sortOrder;
	},
	toString: function () {
		return this.field;
	}
};
/**
 * @param modelIndices
 *            Selected rows or columns
 * @param isColumnSort -
 *            sort columns by selected rows.
 */
morpheus.SortByValuesKey = function (modelIndices, sortOrder, isColumnSort) {
	this.field = 'selection';
	this.bothCount = 10;
	this.modelIndices = modelIndices;
	this.sortOrder = sortOrder;
	this.isColumnSort = isColumnSort;
	this.setSortOrder(sortOrder);

};
morpheus.SortByValuesKey.prototype = {
	init: function (dataset, visibleModelIndices) {
		// isColumnSort-sort columns by selected rows
		// dataset is transposed if !isColumnSort
		this.dataset = morpheus.DatasetUtil.slicedView(dataset, null,
			this.modelIndices);
		this.rowView = new morpheus.DatasetRowView(this.dataset);
		this.summaryFunction = this.modelIndices.length > 1 ? morpheus.Median
			: function (row) {
			return row.getValue(0);
		};
		if (this.sortOrder === morpheus.SortKey.SortOrder.TOP_N) {
			var pairs = [];

			var missingIndices = [];
			for (var i = 0, nrows = visibleModelIndices.length; i < nrows; i++) {
				var index = visibleModelIndices[i];
				var value = this.summaryFunction(this.rowView.setIndex(index));
				if (!isNaN(value)) {
					pairs.push({
						index: index,
						value: value
					});
				} else {
					missingIndices.push(index);
				}
			}
			// sort values in descending order
			pairs
			.sort(function (a, b) {
				return (a.value < b.value ? 1
					: (a.value === b.value ? 0 : -1));
			});

			var modelIndexToValue = [];
			var nInGroup = Math.min(pairs.length, this.bothCount);
			var counter = 0;
			var topIndex = 0;

			var half = Math.floor(pairs.length / 2);
			var topPairs = pairs.slice(0, half);
			var bottomPairs = pairs.slice(half);
			var bottomIndex = bottomPairs.length - 1;
			var ntop = topPairs.length;
			var npairs = pairs.length;
			while (counter < npairs) {
				for (var i = 0; i < nInGroup && topIndex < ntop; i++, topIndex++, counter++) {
					modelIndexToValue[topPairs[topIndex].index] = counter;
				}
				var indexCounterPairs = [];
				for (var i = 0; i < nInGroup && bottomIndex >= 0; i++, bottomIndex--, counter++) {
					indexCounterPairs.push([bottomPairs[bottomIndex].index,
						counter]);
				}
				for (var i = indexCounterPairs.length - 1, j = 0; i >= 0; i--, j++) {
					var item_i = indexCounterPairs[i];
					var item_j = indexCounterPairs[j];
					modelIndexToValue[item_i[0]] = item_j[1];
				}

			}

			// add on missing
			for (var i = 0, length = missingIndices.length; i < length; i++, counter++) {
				modelIndexToValue[missingIndices[i]] = counter;
			}
			this.modelIndexToValue = modelIndexToValue;

		} else {
			delete this.modelIndexToValue;
		}
	},
	getComparator: function () {
		return this.c;
	},
	getValue: function (i) {
		return this.modelIndexToValue ? this.modelIndexToValue[i] : this
		.summaryFunction(this.rowView.setIndex(i));
	},
	setSortOrder: function (sortOrder) {
		if (typeof sortOrder === 'string') {
			sortOrder = morpheus.SortKey.SortOrder[sortOrder.toUpperCase()];
		}
		this.sortOrder = sortOrder;
		if (this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING) {
			this.c = morpheus.SortKey.ELEMENT_ASCENDING_COMPARATOR;
		} else if (this.sortOrder === morpheus.SortKey.SortOrder.DESCENDING) {
			this.c = morpheus.SortKey.ELEMENT_DESCENDING_COMPARATOR;
		} else {
			this.c = morpheus.SortKey.NUMBER_ASCENDING_COMPARATOR;
		}

	},
	getSortOrder: function () {
		return this.sortOrder;
	},
	toString: function () {
		return 'values';
	}
};
/**
 * @param modelIndices
 *            Array of model indices
 * @param nvisible
 *            The number of visible indices at the time this sort key was
 *            created. Used by dendrogram to determine if dendrogram should be
 *            shown.
 * @param name
 *            This sort key name
 */
morpheus.SpecifiedModelSortOrder = function (modelIndices, nvisible, name) {
	this.nvisible = nvisible;
	var modelIndexToValue = [];
	for (var i = 0, length = modelIndices.length; i < length; i++) {
		modelIndexToValue[modelIndices[i]] = i;
	}
	this.modelIndexToValue = modelIndexToValue;
	this.name = name;
	this.c = morpheus.SortKey.ASCENDING_COMPARATOR;
};
morpheus.SpecifiedModelSortOrder.prototype = {
	init: function (dataset) {
	},
	getComparator: function (a, b) {
		return this.c;
	},
	getValue: function (i) {
		return this.modelIndexToValue[i];
	},
	setSortOrder: function (sortOrder) {
		this.sortOrder = sortOrder;
		this.c = this.sortOrder === morpheus.SortKey.SortOrder.ASCENDING ? morpheus.SortKey.NUMBER_ASCENDING_COMPARATOR
			: morpheus.SortKey.NUMBER_DESCENDING_COMPARATOR;
	},
	getSortOrder: function () {
		return this.sortOrder;
	},
	getName: function () {
		return this.name;
	}
};
morpheus.SortKey.keepExistingSortKeys = function (newSortKeys, existingSortKeys) {
	// keep MatchesOnTopSortKey and dendrogram
	// var existingOnTopSortKey = null;
	var existingSpecifiedSortKey = null;
	for (var i = 0, length = existingSortKeys.length; i < length; i++) {
		var key = existingSortKeys[i];
		// if (key instanceof morpheus.MatchesOnTopSortKey) {
		// existingOnTopSortKey = key;
		// }
		if (key instanceof morpheus.SpecifiedModelSortOrder
			&& key.name === 'dendrogram') {
			existingSpecifiedSortKey = key;
		}
	}
	if (existingSpecifiedSortKey) {
		var newSortKeysHasTopSortKey = false;
		var newSortKeysHasSpecifiedSortKey = false;
		for (var i = 0, length = newSortKeys.length; i < length; i++) {
			var key = newSortKeys[i];
			// if (key instanceof morpheus.MatchesOnTopSortKey) {
			// newSortKeysHasTopSortKey = true;
			// }
			if (key instanceof morpheus.SpecifiedModelSortOrder
				&& key.name === 'dendrogram') {
				newSortKeysHasSpecifiedSortKey = true;
			}
		}
		// if (existingOnTopSortKey && !newSortKeysHasTopSortKey) {
		// newSortKeys.splice(0, 0, existingOnTopSortKey);
		// }
		if (existingSpecifiedSortKey && !newSortKeysHasSpecifiedSortKey) {
			newSortKeys.splice(newSortKeys.length, 0, existingSpecifiedSortKey);
		}
	}
	return newSortKeys;
};
/**
 * Group by key
 *
 * @param values
 */
morpheus.SpecifiedGroupByKey = function (clusterIds) {
	this.clusterIds = clusterIds;
	this.c = function (a, b) {
		return (a === b ? 0 : // Values are equal
			(a < b ? -1 : // (-0.0, 0.0) or (!NaN, NaN)
				1));
	};
};
morpheus.SpecifiedGroupByKey.prototype = {
	init: function (dataset) {
	},
	getComparator: function (a, b) {
		return this.c;
	},
	getValue: function (i) {
		return this.clusterIds[i];
	},
	setSortOrder: function (sortOrder) {
	},
	getSortOrder: function () {
	},
	getName: function () {
		return 'Dendrogram Cut';
	}
};

morpheus.SymmetricProject = function(dataset) {
	this.originalDataset = dataset;
	this.indexMapper = new morpheus.IndexMapper(this, true);
	this.groups = [];
	this.colorModel = new morpheus.VectorColorModel();
	this.shapeModel = new morpheus.VectorShapeModel();
	this.hoverRowIndex = -1;
	this.hoverColumnIndex = -1;
	this.selectionModel = new morpheus.SelectionModel(this, false);
	this.elementSelectionModel = new morpheus.ElementSelectionModel(this);
};

morpheus.SymmetricProject.prototype = {
	getHoverColumnIndex : function() {
		return this.hoverColumnIndex;
	},
	setHoverColumnIndex : function(index) {
		this.hoverColumnIndex = index;
	},
	getHoverRowIndex : function() {
		return this.hoverRowIndex;
	},
	setHoverRowIndex : function(index) {
		this.hoverRowIndex = index;
	},
	getRowColorModel : function() {
		return this.colorModel;
	},
	getRowShapeModel : function() {
		return this.shapeModel;
	},
	getColumnShapeModel : function() {
		return this.shapeModel;
	},
	getGroupRows : function() {
		return this.groups;
	},
	getGroupColumns : function() {
		return this.groups;
	},
	getFullDataset : function() {
		return this.originalDataset;
	},
	getColumnSelectionModel : function() {
		return this.selectionModel;
	},
	getRowSelectionModel : function() {
		return this.selectionModel;
	},
	getElementSelectionModel : function() {
		return this.elementSelectionModel;
	},
	getFilteredSortedRowIndices : function() {
		return this.indexMapper.convertToView();
	},
	getFilteredSortedColumnIndices : function() {
		return this.indexMapper.convertToView();
	},
	setFullDataset : function(dataset, notify) {
		this.originalDataset = dataset;
		this.indexMapper.setFilter(this.indexMapper.getFilter());
		this.selectionModel.clear();
		this.elementSelectionModel.clear();
		if (notify) {
			this.trigger(morpheus.Project.Events.DATASET_CHANGED);
		}
	},
	setGroupRows : function(keys, notify) {
		this.groups = keys;
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_GROUP_BY_CHANGED);
			this.trigger(morpheus.Project.Events.COLUMN_GROUP_BY_CHANGED);
		}
	},
	setGroupColumns : function(keys, notify) {
		this.groups = keys;
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_GROUP_BY_CHANGED);
			this.trigger(morpheus.Project.Events.COLUMN_GROUP_BY_CHANGED);
		}
	},
	setRowFilter : function(filter, notify) {
		this._saveSelection(false);
		this.indexMapper.setFilter(filter);
		this._restoreSelection(false);
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_FILTER_CHANGED);
		}
	},
	getRowFilter : function() {
		return this.indexMapper.getFilter();
	},
	getColumnFilter : function() {
		return this.indexMapper.getFilter();
	},
	setColumnFilter : function(filter, notify) {
		this._saveSelection(true);
		this.indexMapper.setFilter(filter);
		this._restoreSelection(true);
		if (notify) {
			this.trigger(morpheus.Project.Events.COLUMN_FILTER_CHANGED);
		}
	},
	getColumnColorModel : function() {
		return this.colorModel;
	},
	getSortedFilteredDataset : function() {
		return morpheus.DatasetUtil.slicedView(this.getFullDataset(),
				this.indexMapper.convertToView(), this.indexMapper
						.convertToView());
	},
	getSelectedDataset : function(options) {
		options = $.extend({}, {
			selectedRows : true,
			selectedColumns : true,
			emptyToAll : true
		}, options);
		var dataset = this.getSortedFilteredDataset();
		var rows = null;
		if (options.selectedRows) {
			rows = this.selectionModel.getViewIndices().values().sort(
					function(a, b) {
						return (a === b ? 0 : (a < b ? -1 : 1));
					});
			if (rows.length === 0 && options.emptyToAll) {
				rows = null;
			}
		}
		var columns = null;
		if (options.selectedColumns) {
			columns = this.selectionModel.getViewIndices().values().sort(
					function(a, b) {
						return (a === b ? 0 : (a < b ? -1 : 1));
					});
			if (columns.length === 0 && options.emptyToAll) {
				columns = null;
			}
		}
		return morpheus.DatasetUtil.slicedView(dataset, rows, columns);
	},
	_saveSelection : function(isColumns) {
		this.elementSelectionModel.save();
		if (isColumns) {
			this.selectionModel.save();
		} else {
			this.selectionModel.save();
		}
	},
	_restoreSelection : function(isColumns) {
		if (isColumns) {
			this.selectionModel.restore();
		} else {
			this.selectionModel.restore();
		}
		this.elementSelectionModel.restore();
	},
	setRowSortKeys : function(keys, notify) {
		this._saveSelection(false);
		this.indexMapper.setSortKeys(keys);
		this._restoreSelection(false);
		if (notify) {
			this.trigger(morpheus.Project.Events.ROW_SORT_ORDER_CHANGED);
		}
	},
	setColumnSortKeys : function(keys, notify) {
		this._saveSelection(true);
		this.indexMapper.setSortKeys(keys);
		this._restoreSelection(true);
		if (notify) {
			this.trigger(morpheus.Project.Events.COLUMN_SORT_ORDER_CHANGED);
		}
	},
	getRowSortKeys : function() {
		return this.indexMapper.sortKeys;
	},
	getColumnSortKeys : function() {
		return this.indexMapper.sortKeys;
	},
	convertViewColumnIndexToModel : function(viewIndex) {
		return this.indexMapper.convertViewIndexToModel(viewIndex);
	},
	convertViewRowIndexToModel : function(viewIndex) {
		return this.indexMapper.convertViewIndexToModel(viewIndex);
	},
	convertModelRowIndexToView : function(modelIndex) {
		return this.indexMapper.convertModelIndexToView(modelIndex);
	},
	convertModelColumnIndexToView : function(modelIndex) {
		return this.indexMapper.convertModelIndexToView(modelIndex);
	},

	isColumnViewIndexSelected : function(index) {
		return this.selectionModel.isViewIndexSelected(index);
	},
	isRowViewIndexSelected : function(index) {
		return this.selectionModel.isViewIndexSelected(index);
	}
};
morpheus.Util.extend(morpheus.SymmetricProject, morpheus.Events);
morpheus.TransposedDatasetView = function(dataset) {
	morpheus.DatasetAdapter.call(this, dataset);
};
morpheus.TransposedDatasetView.prototype = {
	getRowCount : function() {
		return this.dataset.getColumnCount();
	},
	getColumnCount : function() {
		return this.dataset.getRowCount();
	},
	getValue : function(i, j, seriesIndex) {
		return this.dataset.getValue(j, i, seriesIndex);
	},
	setValue : function(i, j, value, seriesIndex) {
		this.dataset.setValue(j, i, value, seriesIndex);
	},
	getRowMetadata : function() {
		return this.dataset.getColumnMetadata();
	},
	getColumnMetadata : function() {
		return this.dataset.getRowMetadata();
	}
};
morpheus.Util.extend(morpheus.TransposedDatasetView, morpheus.DatasetAdapter);

/**
 * Provides percentile computation.
 * <p>
 * There are several commonly used methods for estimating percentiles (a.k.a.
 * quantiles) based on sample data. For large samples, the different methods
 * agree closely, but when sample sizes are small, different methods will give
 * significantly different results. The algorithm implemented here works as
 * follows:
 * <ol>
 * <li>Let <code>n</code> be the length of the (sorted) array and
 * <code>0 < p <= 100</code> be the desired percentile.</li>
 * <li>If <code> n = 1 </code> return the unique array element (regardless of
 * the value of <code>p</code>); otherwise</li>
 * <li>Compute the estimated percentile position
 * <code> pos = p * (n + 1) / 100</code> and the difference, <code>d</code>
 * between <code>pos</code> and <code>floor(pos)</code> (i.e. the fractional
 * part of <code>pos</code>). If <code>pos >= n</code> return the largest
 * element in the array; otherwise</li>
 * <li>Let <code>lower</code> be the element in position
 * <code>floor(pos)</code> in the array and let <code>upper</code> be the
 * next element in the array. Return <code>lower + d * (upper - lower)</code></li>
 * </ol>
 *
 * @param p Percentile between 0 and 100
 */
morpheus.Percentile = function (vector, p, isSorted) {
	return morpheus.ArrayPercentile(morpheus.RemoveNaN(vector), p, isSorted);
};
/**
 * @private
 * @ignore
 */
morpheus.RemoveNaN = function (values) {
	var array = [];
	for (var i = 0, size = values.size(); i < size; i++) {
		var value = values.getValue(i);
		if (!isNaN(value)) {
			array.push(value);
		}
	}
	return array;
};
morpheus.Median = function (vector) {
	return morpheus.ArrayPercentile(morpheus.RemoveNaN(vector), 50, false);
};
morpheus.Median.toString = function () {
	return 'Median';
};
/**
 * @ignore
 */
morpheus.ArrayPercentile = function (values, p, isSorted) {

	if (!isSorted) {
		values.sort(function (a, b) {
			return (a < b ? -1 : (a === b ? 0 : 1));
		});
	}
	return d3.quantile(values, p / 100);
};
/**
 * @ignore
 */
morpheus.MaxPercentiles = function (percentiles) {
	var f = function (vector) {
		var values = [];
		for (var i = 0, size = vector.size(); i < size; i++) {
			var value = vector.getValue(i);
			if (!isNaN(value)) {
				values.push(value);
			}
		}
		if (values.length === 0) {
			return NaN;
		}
		values.sort(function (a, b) {
			return (a < b ? -1 : (a === b ? 0 : 1));
		});
		var max = 0;
		for (var i = 0; i < percentiles.length; i++) {
			var p = morpheus.ArrayPercentile(values, percentiles[i], true);
			if (Math.abs(p) > Math.abs(max)) {
				max = p;
			}
		}
		return max;
	};
	f.toString = function () {
		var s = ['Maximum of '];
		for (var i = 0, length = percentiles.length; i < length; i++) {
			if (i > 0 && length > 2) {
				s.push(', ');
			}
			if (i === length - 1) {
				s.push(length == 2 ? ' and ' : 'and ');
			}
			s.push(percentiles[i]);
		}
		s.push(' percentiles');
		return s.join('');
	};
	return f;
};
morpheus.Mean = function (vector) {
	var sum = 0;
	var count = 0;
	for (var i = 0, length = vector.size(); i < length; i++) {
		var val = vector.getValue(i);
		if (!isNaN(val)) {
			sum += val;
			count++;
		}
	}
	return count === 0 ? NaN : sum / count;
};
morpheus.Mean.toString = function () {
	return 'Mean';
};
morpheus.Sum = function (vector) {
	var sum = 0;
	var found = false;
	for (var i = 0, length = vector.size(); i < length; i++) {
		var val = vector.getValue(i);
		if (!isNaN(val)) {
			found = true;
			sum += val;
		}
	}
	return !found ? NaN : sum;
};
morpheus.Sum.toString = function () {
	return 'Sum';
};
morpheus.CountNonNaN = function (vector) {
	var count = 0;
	for (var i = 0, length = vector.size(); i < length; i++) {
		var val = vector.getValue(i);
		if (!isNaN(val)) {
			count++;
		}
	}
	return count;
};
morpheus.CountNonNaN.toString = function () {
	return 'Count non-NaN';
};

morpheus.Max = function (vector) {
	var max = -Number.MAX_VALUE;
	var found = false;
	for (var i = 0, length = vector.size(); i < length; i++) {
		var val = vector.getValue(i);
		if (!isNaN(val)) {
			found = true;
			max = Math.max(max, val);
		}
	}
	return !found ? NaN : max;
};
morpheus.Max.toString = function () {
	return 'Max';
};
morpheus.Min = function (vector) {
	var min = Number.MAX_VALUE;
	var found = false;
	for (var i = 0, length = vector.size(); i < length; i++) {
		var val = vector.getValue(i);
		if (!isNaN(val)) {
			found = true;
			min = Math.min(min, val);
		}
	}
	return !found ? NaN : min;
};
morpheus.Min.toString = function () {
	return 'Min';
};
morpheus.Variance = function (list, mean) {
	if (mean == undefined) {
		mean = morpheus.Mean(list);
	}
	var sum = 0;
	var n = 0;
	for (var j = 0, size = list.size(); j < size; j++) {
		var x = list.getValue(j);
		if (!isNaN(x)) {
			var diff = x - mean;
			diff = diff * diff;
			sum += diff;
			n++;
		}
	}
	if (n <= 1) {
		return NaN;
	}
	n = n - 1;
	if (n < 1) {
		n = 1;
	}
	var variance = sum / n;
	return variance;
};
var LOG_10 = Math.log(10);
morpheus.Log10 = function (x) {
	return x <= 0 ? 0 : Math.log(x) / LOG_10;
};
var LOG_2 = Math.log(2);
morpheus.Log2 = function (x) {
	return x <= 0 ? 0 : Math.log(x) / LOG_2;
};

/**
 * Computes the False Discovery Rate using the BH procedure.
 *
 * @param nominalPValues
 *            Array of nominal p-values.
 */
morpheus.FDR_BH = function (nominalPValues) {
	var size = nominalPValues.length;
	var fdr = [];
	var pValueIndices = morpheus.Util.indexSort(nominalPValues, true);
	var ranks = morpheus.Util.rankIndexArray(pValueIndices);

	// check for ties
	for (var i = pValueIndices.length - 1; i > 0; i--) {
		var bigPValue = nominalPValues[pValueIndices[i]];
		var smallPValue = nominalPValues[pValueIndices[i - 1]];
		if (bigPValue == smallPValue) {
			ranks[pValueIndices[i - 1]] = ranks[pValueIndices[i]];
		}
	}
	for (var i = 0; i < size; i++) {
		var rank = ranks[i];
		var p = nominalPValues[i];
		fdr[i] = (p * size) / rank;
	}

	// ensure fdr is monotonically decreasing
	var pIndices = morpheus.Util.indexSort(nominalPValues, false);
	for (var i = 0; i < pIndices.length - 1; i++) {
		var highIndex = pIndices[i];
		var lowIndex = pIndices[i + 1];
		fdr[lowIndex] = Math.min(fdr[lowIndex], fdr[highIndex]);
	}
	for (var i = 0; i < size; i++) {
		fdr[i] = Math.min(fdr[i], 1);
	}
	return fdr;
};

morpheus.FDR_BH.tString = function () {
	return 'FDR(BH)';
};
morpheus.Variance.toString = function () {
	return 'Variance';
};
morpheus.MAD = function (list, median) {
	if (median == null) {
		median = morpheus.Percentile(list, 50);
	}
	var temp = [];
	for (var j = 0, size = list.size(); j < size; j++) {
		var value = list.getValue(j);
		if (!isNaN(value)) {
			temp.push(Math.abs(value - median));
		}
	}
	var r = morpheus.Percentile(new morpheus.Vector('', temp.length)
	.setArray(temp), 50);
	return 1.4826 * r;
}; 
morpheus.MAD.toString = function () {
	return 'Median absolute deviation';
};
morpheus.CV = function (list) {
	var mean = morpheus.Mean(list);
	var stdev = Math.sqrt(morpheus.Variance(list, mean));
	return stdev / mean;
};
morpheus.CV.toString = function () {
	return 'Coefficient of variation';
};

morpheus.BoxPlotItem = function (list) {
	var values = morpheus.RemoveNaN(list);
	values.sort(function (a, b) {
		return (a === b ? 0 : (a < b ? -1 : 1));
	});
	if (values.length === 0) {
		return {
			median: NaN,
			q1: NaN,
			q3: NaN,
			lowerAdjacentValue: NaN,
			upperAdjacentValue: NaN
		};
	}
	var median = morpheus.ArrayPercentile(values, 50, true);
	var q1 = morpheus.ArrayPercentile(values, 25, true);
	var q3 = morpheus.ArrayPercentile(values, 75, true);
	var w = 1.5;
	var upperAdjacentValue = -Number.MAX_VALUE;
	var lowerAdjacentValue = Number.MAX_VALUE;
	// The upper adjacent value (UAV) is the largest observation that is
	// less than or equal to
	// the upper inner fence (UIF), which is the third quartile plus
	// 1.5*IQR.
	//
	// The lower adjacent value (LAV) is the smallest observation that is
	// greater than or equal
	// to the lower inner fence (LIF), which is the first quartile minus
	// 1.5*IQR.
	var upperOutlier = q3 + w * (q3 - q1);
	var lowerOutlier = q1 - w * (q3 - q1);
	var sum = 0;
	for (var i = 0, length = values.length; i < length; i++) {
		var value = values[i];
		if (value <= upperOutlier) {
			upperAdjacentValue = Math.max(upperAdjacentValue, value);
		}
		if (value >= lowerOutlier) {
			lowerAdjacentValue = Math.min(lowerAdjacentValue, value);
		}
		sum += value;
		// if (value > upperOutlier) {
		// upperOutliers.add(new Outlier(i, j, value));
		// }
		// if (value < lowerOutlier) {
		// lowerOutliers.add(new Outlier(i, j, value));
		// }
	}
	var mean = sum / values.length;
	if (lowerAdjacentValue > q1) {
		lowerAdjacentValue = q1;
	}
	if (upperAdjacentValue < q3) {
		upperAdjacentValue = q3;
	}

	return {
		mean: mean,
		median: median,
		q1: q1, // Lower Quartile
		q3: q3, // Upper Quartile
		lowerAdjacentValue: lowerAdjacentValue, // Lower Whisker
		upperAdjacentValue: upperAdjacentValue
		// Upper Whisker
	};

};

/**
 * @fileOverview A collection of values.
 */
/**
 * Creates a new vector with the given name and size.
 * 
 * @param name
 *            the vector name
 * @param size
 *            the number of elements in this vector
 * @constructor
 */
morpheus.Vector = function(name, size) {
	this.name = name;
	this.array = [];
	this.n = size;
	this.properties = new morpheus.Map();
};
/**
 * @static
 */
morpheus.Vector.fromArray = function(name, array) {
	var v = new morpheus.Vector(name, array.length);
	v.array = array;
	return v;
};
morpheus.Vector.prototype = {
	/**
	 * @ignore
	 * @param value
	 */
	push : function(value) {
		this.array.push(value);
	},
	/**
	 * Morpheus specific keys are morpheus.fields, morpheus.visibleFields,
	 * morpheus.function, morpheus.title, morpheus.histogram, morpheus.dataType.
	 * Recognized values for morpheus.dataType are string, number, [string], [number]
	 */
	getProperties : function() {
		return this.properties;
	},
	/**
	 * Sets the value at the specified index.
	 * 
	 * @param index
	 *            the index
	 * @param value
	 *            the value
	 */
	setValue : function(index, value) {
		this.array[index] = value;
	},
	/**
	 * Returns the value at the specified index.
	 * 
	 * @param index
	 *            the index
	 * @return the value
	 */
	getValue : function(index) {
		return this.array[index];
	},
	/**
	 * Returns the number of elements in this vector.
	 * 
	 * @return the size.
	 */
	size : function() {
		return this.n;
	},
	/**
	 * Returns the name of this vector.
	 * 
	 * @return the name
	 */
	getName : function() {
		return this.name;
	},
	/**
	 * @ignore
	 * @param name
	 */
	setName : function(name) {
		this.name = name;
	},
	/**
	 * @ignore
	 * @param array
	 * @returns {morpheus.Vector}
	 */
	setArray : function(array) {
		this.array = array;
		return this;
	}
};
morpheus.VectorColorModel = function () {
	this.vectorNameToColorMap = new morpheus.Map();
	this.vectorNameToColorScheme = new morpheus.Map();
	this.colors = morpheus.VectorColorModel.TWENTY_COLORS;
};

morpheus.VectorColorModel.YES_COLOR = '#d8b365';
morpheus.VectorColorModel.FEMALE = '#ff99ff';
morpheus.VectorColorModel.MALE = '#66ccff';

// tableau 20-same as d3 category20
morpheus.VectorColorModel.TWENTY_COLORS = ['#1f77b4', '#aec7e8', '#ff7f0e',
	'#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd',
	'#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f',
	'#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];
morpheus.VectorColorModel.CATEGORY_20A = morpheus.VectorColorModel.TWENTY_COLORS;
morpheus.VectorColorModel.CATEGORY_20B = ['#393b79', '#5254a3', '#6b6ecf',
	'#9c9ede', '#637939', '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31',
	'#bd9e39', '#e7ba52', '#e7cb94', '#843c39', '#ad494a', '#d6616b',
	'#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'];
morpheus.VectorColorModel.CATEGORY_20C = ['#3182bd', '#6baed6', '#9ecae1',
	'#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354',
	'#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc',
	'#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'];

morpheus.VectorColorModel.CATEGORY_ALL = [].concat(
	morpheus.VectorColorModel.CATEGORY_20A,
	morpheus.VectorColorModel.CATEGORY_20B,
	morpheus.VectorColorModel.CATEGORY_20C);

morpheus.VectorColorModel.TABLEAU10 = ['#1f77b4', '#ff7f0e', '#2ca02c',
	'#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22',
	'#17becf'];
morpheus.VectorColorModel.STANDARD_COLORS = {
	'na': '#c0c0c0',
	'nan': '#c0c0c0',
	'': '#ffffff',
	'wt': '#ffffff',
	'n': '#ffffff',
	'0': '#ffffff',
	'y': morpheus.VectorColorModel.YES_COLOR,
	'1': morpheus.VectorColorModel.YES_COLOR,
	'male': morpheus.VectorColorModel.MALE,
	'm': morpheus.VectorColorModel.MALE,
	'female': morpheus.VectorColorModel.FEMALE,
	'f': morpheus.VectorColorModel.FEMALE,
	'kd': '#C675A8',
	'oe': '#56b4e9',
	'cp': '#FF9933',
	'trt_sh.cgs': '#C675A8',
	'trt_oe': '#56b4e9',
	'trt_cp': '#FF9933',
	'a375': '#1490C1',
	'a549': '#AAC8E9',
	'hcc515': '#1C9C2A',
	'hepg2': '#94DC89',
	'ht29': '#946DBE',
	'mcf7': '#C5B2D5',
	'pc3': '#38C697',
	'asc': '#FF8000',
	'cd34': '#FFBB75',
	'ha1e': '#FB4124',
	'neu': '#FF9A94',
	'npc': '#E57AC6',
	'cancer': '#1490C1',
	'immortalized normal': '#FF8000'
};
morpheus.VectorColorModel.getStandardColor = function (value) {
	if (value == null) {
		return '#ffffff';
	}
	var stringValue = value.toString().toLowerCase();
	return morpheus.VectorColorModel.STANDARD_COLORS[stringValue];

};
morpheus.VectorColorModel.getColorMapForNumber = function (length) {
	var colors;
	if (length < 3) {
		colors = colorbrewer.Set1[3];
	} else {
		colors = colorbrewer.Paired[length];
	}
	return colors ? colors : morpheus.VectorColorModel.TWENTY_COLORS;
};
morpheus.VectorColorModel.prototype = {
	clear: function (vector) {
		this.vectorNameToColorMap.remove(vector.getName());
		this.vectorNameToColorScheme.remove(vector.getName());
	},
	copy: function () {
		var c = new morpheus.VectorColorModel();
		c.colors = this.colors.slice(0);
		this.vectorNameToColorMap.forEach(function (colorMap, name) {
			var newColorMap = new morpheus.Map();
			newColorMap.setAll(colorMap); // copy existing values
			c.vectorNameToColorMap.set(name, newColorMap);
		});
		this.vectorNameToColorScheme.forEach(function (colorScheme, name) {
			c.vectorNameToColorScheme.set(name, colorScheme
			.copy(new morpheus.Project(new morpheus.Dataset('',
				1, 1))));
		});
		return c;
	},
	clearAll: function () {
		this.vectorNameToColorMap = new morpheus.Map();
		this.vectorNameToColorScheme = new morpheus.Map();
	},
	containsDiscreteColor: function (vector, value) {
		var metadataValueToColorMap = this.vectorNameToColorMap.get(vector
		.getName());
		if (metadataValueToColorMap === undefined) {
			return false;
		}
		var c = metadataValueToColorMap.get(value);
		return c != null;
	},
	setDiscreteColorMap: function (colors) {
		this.colors = colors;
	},
	getContinuousColorScheme: function (vector) {
		return this.vectorNameToColorScheme.get(vector.getName());
	},
	getDiscreteColorScheme: function (vector) {
		return this.vectorNameToColorMap.get(vector.getName());
	},
	createContinuousColorMap: function (vector) {
		var minMax = morpheus.VectorUtil.getMinMax(vector);
		var min = minMax.min;
		var max = minMax.max;
		var cs = new morpheus.HeatMapColorScheme(new morpheus.Project(
			new morpheus.Dataset('', 1, 1)), {
			type: 'fixed',
			map: [{
				value: min,
				color: colorbrewer.Greens[3][0]
			}, {
				value: max,
				color: colorbrewer.Greens[3][2]
			}]
		});
		this.vectorNameToColorScheme.set(vector.getName(), cs);
		return cs;

	},
	getContinuousMappedValue: function (vector, value) {
		var cs = this.vectorNameToColorScheme.get(vector.getName());
		if (cs === undefined) {
			cs = this.createContinuousColorMap(vector);
		}
		return cs.getColor(0, 0, value);
	},
	_getColorForValue: function (value) {
		var color = morpheus.VectorColorModel.getStandardColor(value);
		if (color == null) { // try to reuse existing color map
			var existingMetadataValueToColorMap = this.vectorNameToColorMap
			.values();
			for (var i = 0, length = existingMetadataValueToColorMap.length; i < length; i++) {
				color = existingMetadataValueToColorMap[i].get(value);
				if (color !== undefined) {
					return color;
				}
			}
		}
		return color;
	},
	getMappedValue: function (vector, value) {
		var metadataValueToColorMap = this.vectorNameToColorMap.get(vector
		.getName());
		if (metadataValueToColorMap === undefined) {
			metadataValueToColorMap = new morpheus.Map();
			this.vectorNameToColorMap.set(vector.getName(),
				metadataValueToColorMap);
			// set all possible colors
			var values = morpheus.VectorUtil.getValues(vector);
			var ncolors = 0;
			var colors = null;
			if (values.length < 3) {
				colors = colorbrewer.Dark2[3];
			} else {
				colors = colorbrewer.Paired[values.length];
			}

			if (!colors) {
				if (values.length <= 20) {
					colors = d3.scale.category20().range();
				} else {
					colors = morpheus.VectorColorModel.CATEGORY_ALL;
				}
			}

			if (colors) {
				var ncolors = colors.length;
				for (var i = 0, nvalues = values.length; i < nvalues; i++) {
					var color = this._getColorForValue(values[i]);
					if (color == null) {
						color = colors[i % ncolors];
					}
					metadataValueToColorMap.set(values[i], color);
				}
			} else {
				var _this = this;
				_.each(values, function (val) {
					_this.getMappedValue(vector, val);
				});
			}
		}
		var color = metadataValueToColorMap.get(value);
		if (color == null) {
			color = this._getColorForValue(value);
			if (color == null) {
				var index = metadataValueToColorMap.size();
				color = this.colors[index % this.colors.length];
			}
			metadataValueToColorMap.set(value, color);
		}
		return color;
	},
	setMappedValue: function (vector, value, color) {
		var metadataValueToColorMap = this.vectorNameToColorMap.get(vector
		.getName());
		if (metadataValueToColorMap === undefined) {
			metadataValueToColorMap = new morpheus.Map();
			this.vectorNameToColorMap.set(vector.getName(),
				metadataValueToColorMap);
		}
		metadataValueToColorMap.set(value, color);
	}
};

morpheus.VectorKeys = {};
/** [string] of field names in array */
morpheus.VectorKeys.FIELDS = 'morpheus.fields';
morpheus.VectorKeys.VALUE_TO_INDICES = 'morpheus.valueToIndices';
/** [int] of visible field indices in morpheus.VectorKeys.FIELDS */
morpheus.VectorKeys.VISIBLE_FIELDS = 'morpheus.visibleFields';
morpheus.VectorKeys.DATA_TYPE = 'morpheus.dataType';
/** Function to map an array to a single value for sorting */
morpheus.VectorKeys.ARRAY_SUMMARY_FUNCTION = 'morpheus.arraySummaryFunction';
/** Key for object (e.g. box plot) that summarizes data values */
morpheus.VectorKeys.HEADER_SUMMARY = 'morpheus.headerSummary';
/** Key indicating to show header summary */
morpheus.VectorKeys.SHOW_HEADER_SUMMARY = 'morpheus.showHeaderSummary';

morpheus.VectorKeys.TITLE = 'morpheus.title';
/** Function to compute vector value */
morpheus.VectorKeys.FUNCTION = 'morpheus.function';

/** Whether to recompute a function when creating a new heat map */
morpheus.VectorKeys.RECOMPUTE_FUNCTION = 'morpheus.recompute.function';

morpheus.VectorKeys.COPY_IGNORE = new morpheus.Set();
morpheus.VectorKeys.COPY_IGNORE.add(morpheus.VectorKeys.HEADER_SUMMARY);
morpheus.VectorKeys.COPY_IGNORE.add(morpheus.VectorKeys.DATA_TYPE);
morpheus.VectorKeys.COPY_IGNORE.add(morpheus.VectorKeys.VALUE_TO_INDICES);
morpheus.VectorShapeModel = function() {
	this.shapes = morpheus.VectorShapeModel.SHAPES;
	this.vectorNameToShapeMap = new morpheus.Map();
};

morpheus.VectorShapeModel.SHAPES = [ 'circle', 'square', 'plus', 'x',
		'asterisk', 'diamond', 'triangle-up', 'triangle-down', 'triangle-left',
		'triangle-right', 'minus' ];
morpheus.VectorShapeModel.STANDARD_SHAPES = {
	cp : 'diamond',
	oe : 'plus',
	pcl : 'asterisk',
	kd : 'minus',
	ctrl : 'circle'
};

morpheus.VectorShapeModel.prototype = {
	clear : function(vector) {
		this.vectorNameToShapeMap.remove(vector.getName());
	},
	copy : function() {
		var c = new morpheus.VectorShapeModel();
		c.shapes = this.shapes.slice(0);
		this.vectorNameToShapeMap.forEach(function(shapeMap, name) {
			var newShapeMap = new morpheus.Map();
			newShapeMap.setAll(shapeMap); // copy existing values
			c.vectorNameToShapeMap.set(name, newShapeMap);
		});

		return c;
	},
	clearAll : function() {
		this.vectorNameToShapeMap = new morpheus.Map();
	},
	_getShapeForValue : function(value) {
		if (value == null) {
			return 'none';
		}
		var str = value.toString().toLowerCase();
		var mapped = morpheus.VectorShapeModel.STANDARD_SHAPES[str];
		if (mapped !== undefined) {
			return mapped;
		}

		// try to reuse existing map
		var existingMetadataValueToShapeMap = this.vectorNameToShapeMap
				.values();
		for (var i = 0, length = existingMetadataValueToShapeMap.length; i < length; i++) {
			var shape = existingMetadataValueToShapeMap[i].get(value);
			if (shape !== undefined) {
				return shape;
			}
		}

	},
	getMap : function(name) {
		return this.vectorNameToShapeMap.get(name);
	},
	getMappedValue : function(vector, value) {
		var metadataValueToShapeMap = this.vectorNameToShapeMap.get(vector
				.getName());
		if (metadataValueToShapeMap === undefined) {
			metadataValueToShapeMap = new morpheus.Map();
			this.vectorNameToShapeMap.set(vector.getName(),
					metadataValueToShapeMap);
			// set all possible shapes
			var values = morpheus.VectorUtil.getValues(vector);
			for (var i = 0, nvalues = values.length; i < nvalues; i++) {
				var shape = this._getShapeForValue(values[i]);
				if (shape == null) {
					shape = this.shapes[i % this.shapes.length];
				}
				metadataValueToShapeMap.set(values[i], shape);
			}
		}
		var shape = metadataValueToShapeMap.get(value);
		if (shape == null) {
			shape = this._getShapeForValue(value);
			if (shape == null) {
				var index = metadataValueToShapeMap.size();
				shape = this.shapes[index % this.shapes.length];
			}
			metadataValueToShapeMap.set(value, shape);
		}
		return shape;
	},
	setMappedValue : function(vector, value, shape) {
		var metadataValueToShapeMap = this.vectorNameToShapeMap.get(vector
				.getName());
		if (metadataValueToShapeMap === undefined) {
			metadataValueToShapeMap = new morpheus.Map();
			this.vectorNameToShapeMap.set(vector.getName(),
					metadataValueToShapeMap);
		}
		metadataValueToShapeMap.set(value, shape);
	}
};
morpheus.VectorUtil = function () {
};

morpheus.VectorUtil.createValueToIndexMap = function (vector, splitArrayValues) {
	var map = new morpheus.Map();
	var isArray = splitArrayValues && morpheus.VectorUtil.getDataType(vector)[0] === '[';
	for (var j = 0, size = vector.size(); j < size; j++) {
		var val = vector.getValue(j);
		if (isArray) {
			if (val != null) {
				for (var k = 0; k < val.length; k++) {
					map.set(val[k], j);
				}
			}
		} else {
			map.set(val, j);
		}
	}
	return map;
};

morpheus.VectorUtil.createValueToIndicesMap = function (vector, splitArrayValues) {
	if (!vector) {
		throw 'vector is null';
	}
	var isArray = splitArrayValues && morpheus.VectorUtil.getDataType(vector)[0] === '[';
	var map = new morpheus.Map();
	for (var j = 0, size = vector.size(); j < size; j++) {
		var val = vector.getValue(j);
		if (isArray) {
			if (val != null) {
				for (var k = 0; k < val.length; k++) {
					var list = map.get(val[k]);
					if (list === undefined) {
						list = [];
						map.set(val[k], list);
					}
					list.push(j);
				}
			}
		} else {
			var list = map.get(val);
			if (list === undefined) {
				list = [];
				map.set(val, list);
			}
			list.push(j);
		}
	}
	return map;
};

morpheus.VectorUtil.createValueToCountMap = function (vector) {
	if (!vector) {
		throw 'vector is null';
	}
	var map = new morpheus.Map();
	var dataType = morpheus.VectorUtil.getDataType(vector);
	var isArray = dataType[0] === '[';
	for (var j = 0, size = vector.size(); j < size; j++) {
		var val = vector.getValue(j);
		if (val != null) {
			if (isArray) {
				for (var k = 0; k < val.length; k++) {
					var count = map.get(val[k]) || 0;
					map.set(val[k], count + 1);
				}
			} else {
				var count = map.get(val) || 0;
				map.set(val, count + 1);
			}
		}
	}
	return map;
};

morpheus.VectorUtil.createValuesToIndicesMap = function (vectors) {
	var map = new morpheus.Map();
	var nvectors = vectors.length;
	if (vectors[0] == null) {
		throw 'no vectors found';
	}
	for (var i = 0, nitems = vectors[0].size(); i < nitems; i++) {
		var array = [];
		for (var j = 0; j < nvectors; j++) {
			var vector = vectors[j];
			var val = vector.getValue(i);
			array.push(val);
		}
		var key = new morpheus.Identifier(array);
		var list = map.get(key);
		if (list === undefined) {
			list = [];
			map.set(key, list);
		}
		list.push(i);
	}
	return map;
};
morpheus.VectorUtil.createValuesToIndexMap = function (vectors) {
	var map = new morpheus.Map();
	var nvectors = vectors.length;
	if (vectors[0] == null) {
		throw 'no vectors found';
	}
	for (var i = 0, nitems = vectors[0].size(); i < nitems; i++) {
		var array = [];
		for (var j = 0; j < nvectors; j++) {
			var vector = vectors[j];
			var val = vector.getValue(i);
			array.push(val);
		}
		var key = new morpheus.Identifier(array);
		map.set(key, i);
	}
	return map;
};

morpheus.VectorUtil.createValuesToCountMap = function (vectors) {
	var map = new morpheus.Map();
	var nvectors = vectors.length;
	if (vectors[0] == null) {
		throw 'no vectors found';
	}
	for (var i = 0, nitems = vectors[0].size(); i < nitems; i++) {
		var array = [];
		for (var j = 0; j < nvectors; j++) {
			var vector = vectors[j];
			var val = vector.getValue(i);
			array.push(val);
		}
		var key = new morpheus.Identifier(array);
		var count = map.get(key) || 0;
		map.set(key, count + 1);
	}
	return map;
};

/**
 *
 * @param vector
 * @param excludeNull
 * @returns A sorted array of unique values contained in the vector. Note that array values are
 * not split.
 */
morpheus.VectorUtil.getValues = function (vector, excludeNull) {
	var set = new morpheus.Set();
	for (var j = 0, size = vector.size(); j < size; j++) {
		var val = vector.getValue(j);
		if (excludeNull && val == null) {
			continue;
		}
		set.add(val);
	}
	var array = set.values();
	array.sort(morpheus.SortKey.ASCENDING_COMPARATOR);
	return array;
};

morpheus.VectorUtil.getSet = function (vector, splitArrayValues) {
	var set = new morpheus.Set();
	var isArray = splitArrayValues && morpheus.VectorUtil.getDataType(vector)[0] === '[';
	for (var j = 0, size = vector.size(); j < size; j++) {
		var value = vector.getValue(j);
		if (isArray) {
			if (value != null) {
				for (var k = 0, nvalues = value.length; k < nvalues; k++) {
					set.add(value[k]);
				}
			}
		} else {
			set.add(value);
		}

	}
	return set;
};
morpheus.VectorUtil.maybeConvertToStringArray = function (vector, delim) {
	var newValues = [];
	var regex = new RegExp(delim);
	var found = false;
	for (var i = 0, nrows = vector.size(); i < nrows; i++) {
		var s = vector.getValue(i);
		if (s != null) {
			if (!s.split) {
				return false;
			}
			var tokens = s.split(regex);
			newValues.push(tokens);
			if (!found && tokens.length > 1) {
				found = true;
			}
		}

	}
	if (found) {
		for (var i = 0, nrows = newValues.length; i < nrows; i++) {
			vector.setValue(i, newValues[i]);
		}
	}
	vector.getProperties().set(morpheus.VectorKeys.DATA_TYPE, '[string]');
	return found;
};

morpheus.VectorUtil.maybeConvertStringToNumber = function (vector) {
	var newValues = [];

	for (var i = 0, nrows = vector.size(); i < nrows; i++) {
		var s = vector.getValue(i);
		if (s != null && s !== '' && s !== 'NA' && s !== 'NaN') {
			if (!$.isNumeric(s)) {
				return false;
			}
		}
		newValues.push(parseFloat(s));
	}
	for (var i = 0, nrows = newValues.length; i < nrows; i++) {
		vector.setValue(i, newValues[i]);
	}
	vector.getProperties().set(morpheus.VectorKeys.DATA_TYPE, 'number');
	return true;
};
morpheus.VectorUtil.containsMoreThanOneValue = function (vector) {
	return morpheus.VectorUtil.containsMoreThanNValues(vector, 1);
};
morpheus.VectorUtil.containsMoreThanNValues = function (vector, n) {
	var s = new morpheus.Set();
	for (var j = 0, size = vector.size(); j < size; j++) {
		var val = vector.getValue(j);
		s.add(val);
		if (s.size() > n) {
			return true;
		}
	}
	return false;
};

morpheus.VectorUtil.createSpanMap = function (vector) {
	var previous = vector.getValue(0);
	// find 1st row with different value
	var startIndexToEndIndex = new morpheus.Map();
	var start = 0;
	for (var i = 1, nrows = vector.size(); i < nrows; i++) {
		var val = vector.getValue(i);
		if (previous !== val) {
			previous = val;
			// start inclusive, end exclusive
			startIndexToEndIndex.set(start, i);
			start = i;
		}
	}
	startIndexToEndIndex.set(start, vector.size());
	return startIndexToEndIndex;
};
morpheus.VectorUtil.toArray = function (vector) {
	var array = [];
	for (var i = 0, length = vector.size(); i < length; i++) {
		var val = vector.getValue(i);
		array.push(val);
	}
	return array;
};

morpheus.VectorUtil.arrayAsVector = function (array, name) {
	var v = new morpheus.Vector(name, array.length);
	v.array = array;
	return v;
};
morpheus.VectorUtil.toString = function (vector) {
	var array = [];
	for (var i = 0, length = vector.size(); i < length; i++) {
		var val = vector.getValue(i);
		array.push(val);
	}
	return array.join(', ');
};

morpheus.VectorUtil.getDataType = function (vector) {
	var dataType = vector.getProperties().get(morpheus.VectorKeys.DATA_TYPE);
	if (dataType === undefined) {
		var firstNonNull = morpheus.VectorUtil.getFirstNonNull(vector);
		dataType = morpheus.Util.getDataType(firstNonNull);
		vector.getProperties().set(morpheus.VectorKeys.DATA_TYPE, dataType);
	}
	return dataType;

};

morpheus.VectorUtil.getMinMax = function (vector) {
	var min = Number.MAX_VALUE;
	var max = -Number.MAX_VALUE;
	var fields = vector.getProperties().get(morpheus.VectorKeys.FIELDS);
	if (fields != null) {
		var nvalues = fields.length;
		for (var i = 0, size = vector.size(); i < size; i++) {
			var array = vector.getValue(i);
			if (array) {
				for (var j = 0; j < nvalues; j++) {
					var value = array[j];
					if (!isNaN(value)) {
						min = value < min ? value : min;
						max = value > max ? value : max;
					}
				}
			}
		}
	} else {
		for (var i = 0, size = vector.size(); i < size; i++) {
			var value = vector.getValue(i);
			if (!isNaN(value)) {
				min = value < min ? value : min;
				max = value > max ? value : max;
			}
		}
	}
	return {
		min: min,
		max: max
	};
};
morpheus.VectorUtil.getFirstNonNull = function (vector) {
	for (var i = 0, length = vector.size(); i < length; i++) {
		var val = vector.getValue(i);
		if (val != null) {
			return val;
		}
	}
	return null;
};
morpheus.VectorUtil.isNumber = function (vector) {
	return morpheus.VectorUtil.getDataType(vector) === 'number';
};

morpheus.LandingPage = function (pageOptions) {
	pageOptions = $.extend({}, {
		el: $('#vis')
	}, pageOptions);
	this.pageOptions = pageOptions;
	var _this = this;

	var $el = $('<div class="container" style="display: none;"></div>');
	this.$el = $el;
	var html = [];
	html.push('<div data-name="help" class="pull-right"></div>');

	html
	.push('<div style="margin-bottom:10px;"><img src="https://www.broadinstitute.org/cancer/software/morpheus/images/icon.svg" alt="logo" /> <span style="font-size:16px;font-family:Roboto,sans-serif;">Morpheus</span></div>');

	html.push('<h4>Open your own file</h4>');
	html.push('<div data-name="formRow" class="center-block"></div>');
	html.push('<h4>Or select a preloaded dataset</h4>');
	html.push('<div data-name="exampleRow"></div>');
	html.push('</div>');
	$(html.join('')).appendTo($el);

	new morpheus.HelpMenu().$el.appendTo($el.find('[data-name=help]'));
	var formBuilder = new morpheus.FormBuilder();
	formBuilder.append({
		name: 'file',
		showLabel: false,
		value: '',
		type: 'file',
		required: true,
		help: morpheus.DatasetUtil.DATASET_FILE_FORMATS
	});
	formBuilder.$form.appendTo($el.find('[data-name=formRow]'));
	this.formBuilder = formBuilder;
	this.$sampleDatasetsEl = $el.find('[data-name=exampleRow]');

};

morpheus.LandingPage.prototype = {
	dispose: function () {
		this.formBuilder.setValue('file', '');
		this.$el.hide();
		$(window)
		.off(
			'paste.morpheus drop.morpheus dragover.morpheus dragenter.morpheus beforeunload.morpheus');
		$(window).on('beforeunload.morpheus', function () {
			return 'Are you sure you want to close Morpheus?';
		});
		this.formBuilder.off('change');
	},
	show: function () {
		var _this = this;
		if (!this.sampleDatasets) {
			this.sampleDatasets = new morpheus.SampleDatasets({
				$el: this.$sampleDatasetsEl,
				callback: function (heatMapOptions) {
					_this.open(heatMapOptions);
				}
			});
		}

		this.$el.show();

		this.formBuilder.on('change', function (e) {
			var value = e.value;
			if (value !== '' && value != null) {
				_this.openFile(value);
			}
		});
		$(window).on('paste.morpheus', function (e) {
			var tagName = e.target.tagName;
			if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
				return;
			}

			var text = e.originalEvent.clipboardData.getData('text/plain');
			if (text != null && text.length > 0) {
				var blob = new Blob([text]);
				var url = window.URL.createObjectURL(blob);
				e.preventDefault();
				e.stopPropagation();
				_this.openFile(url);
			}

		}).on('dragover.morpheus dragenter.morpheus', function (e) {
			e.preventDefault();
			e.stopPropagation();
		}).on(
			'drop.morpheus',
			function (e) {
				if (e.originalEvent.dataTransfer
					&& e.originalEvent.dataTransfer.files.length) {
					e.preventDefault();
					e.stopPropagation();
					var files = e.originalEvent.dataTransfer.files;
					_this.openFile(files[0]);
				} else if (e.originalEvent.dataTransfer) {
					var url = e.originalEvent.dataTransfer.getData('URL');
					e.preventDefault();
					e.stopPropagation();
					_this.openFile(url);
				}
			});
	},
	open: function (openOptions) {
		this.dispose();
		var heatmap;
		var optionsArray = _.isArray(openOptions) ? openOptions : [openOptions];
		var _this = this;
		optionsArray.forEach(function (options) {
			if (_this.heatmap == null) { // first tab
				options.landingPage = _this;
				options.el = _this.pageOptions.el;

			} else { // more tabs
				options.focus = false;
				options.inheritFromParent = false;
				options.parent = _this.heatmap;
			}
			heatmap = new morpheus.HeatMap(options);
			if (_this.heatmap == null) {
				_this.heatmap = heatmap;
			}
		});

	},
	openFile: function (value) {
		var _this = this;
		var options = {
			dataset: value
		};
		var fileName = morpheus.Util.getFileName(value);
		morpheus.OpenDatasetTool.fileExtensionPrompt(fileName, function (readOptions) {
			if (readOptions) {
				var dataset = options.dataset;
				options.dataset = {
					file: dataset,
					options: {}
				};
				for (var key in readOptions) {
					options.dataset.options[key] = readOptions[key];
				}
			}
			_this.open(options);
		});

	}
};

morpheus.SampleDatasets = function (options) {
	if (!options.openText) {
		options.openText = 'Open';
	}
	var _this = this;
	var $el = options.$el;
	this.callback = options.callback;
	var exampleHtml = [];

	exampleHtml.push('<table class="table table-condensed">');

	exampleHtml
	.push('<td>Cancer Cell Line Encyclopedia (CCLE), Project Achilles</td>');
	exampleHtml
	.push('<td><input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="mrna"> Gene Expression</td>');

	exampleHtml
	.push('<td><input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="cn"> Copy Number By Gene</td>');

	exampleHtml
	.push('<td><input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="sig_genes"> Mutations</td>');

	exampleHtml
	.push('<td><input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="ach"> Gene essentiality</td>');

	exampleHtml
	.push('<td><button disabled type="button" class="btn btn-default" name="ccle">'
		+ options.openText + '</button></td>');
	exampleHtml.push('</tr></table>');

	exampleHtml
	.push('<div class="text-muted">TCGA data version 1/11/2015</div><span class="text-muted">Please adhere to <a target="_blank" href="http://cancergenome.nih.gov/abouttcga/policies/publicationguidelines"> the TCGA publication guidelines</a></u> when using TCGA data in your publications.</span>');

	exampleHtml.push('<div data-name="tcga"></div>');
	$(exampleHtml.join('')).appendTo($el);
	$el.find('[name=ccle]').on('click', function (e) {
		e.preventDefault();
		var $this = $(this);
		var obj = {};
		$this.parents('tr').find('input:checked').each(function (i, c) {
			obj[$(c).data('type')] = true;
		});

		_this.openCCLE(obj);

	});

	$el.on('click', '[name=tcgaLink]', function (e) {
		e.preventDefault();
		var $this = $(this);
		var type = $this.data('disease-type');
		var obj = {};
		$this.parents('tr').find('input:checked').each(function (i, c) {
			obj[$(c).data('type')] = true;
		});
		var options;
		for (var i = 0; i < _this.diseases.length; i++) {
			if (_this.diseases[i].type === type) {
				options = _this.diseases[i];
				break;
			}
		}
		obj.type = type;
		obj.name = options.name;
		_this.openTcga(obj);
	});
	$el
	.on(
		'click',
		'[data-toggle=dataTypeToggle]',
		function (e) {
			var $this = $(this);
			var $button = $this.parents('tr').find('button');
			var isDisabled = $this.parents('tr').find(
					'input:checked').length === 0;
			$button.prop('disabled', isDisabled);
			if (!isDisabled) {
				$button
				.removeClass('animated flash')
				.addClass('animated flash')
				.one(
					'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
					function () {
						$(this).removeClass(
							'animated flash');
					});
			}
		});
	$
	.ajax(
		'https://s3.amazonaws.com/data.clue.io/morpheus/tcga/tcga_index.txt')
	.done(
		function (text) {
			var lines = text.split('\n');
			var diseases = [];
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i];
				if (line === '') {
					continue;
				}
				var tokens = line.split('\t');
				var type = tokens[0];
				var dataTypes = tokens[1].split(',');
				var name = morpheus.TcgaUtil.DISEASE_STUDIES[type];
				var disease = {
					mrna: dataTypes
					.indexOf('mRNAseq_RSEM_normalized_log2.txt') !== -1,
					sig_genes: dataTypes.indexOf('sig_genes.txt') !== -1,
					gistic: dataTypes
					.indexOf('all_lesions.conf_99.txt') !== -1,
					sample_info: dataTypes.indexOf('All_CDEs.txt') !== -1,
					mutation: dataTypes
					.indexOf('mutations_merged.maf.txt') !== -1,
					rppa: dataTypes.indexOf('rppa.txt') !== -1,
					methylation: dataTypes
					.indexOf('meth.by_mean.data.txt') !== -1,
					name: name,
					type: type,
					dataTypes: dataTypes
				};
				if (disease.mrna || disease.gistic
					|| disease.sig_genes || disease.rppa
					|| disease.methylation) {
					diseases.push(disease);
				}
			}
			diseases.sort(function (a, b) {
				a = a.name.toLowerCase();
				b = b.name.toLowerCase();
				return (a === b ? 0 : (a < b ? -1 : 1));

			});
			var tcga = [];
			_this.diseases = diseases;

			tcga.push('<table class="table table-condensed">');
			// ><tr><th>Disease</th><th>Gene Expression</th><th>Copy
			// Number</th><th>Copy Number By
			// Gene</th><th>Mutations</th><th>Proteomics</th><th>Methylation</th></tr>
			for (var i = 0; i < diseases.length; i++) {
				var disease = diseases[i];
				tcga.push('<tr>');

				tcga.push('<td>' + disease.name + '</td>');
				tcga.push('<td>');
				if (disease.mrna) {
					tcga
					.push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="mrna"> Gene Expression');
				}
				tcga.push('</td>');
				tcga.push('<td>');
				if (disease.gistic) {
					tcga
					.push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="gistic"> GISTIC Copy Number');
				}
				tcga.push('</td>');

				tcga.push('<td>');
				if (disease.gistic) {
					tcga
					.push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="gisticGene"> Copy Number By Gene');
				}
				tcga.push('</td>');

				tcga.push('<td>');
				if (disease.sig_genes) {
					tcga
					.push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="sig_genes"> Mutations');
				}
				tcga.push('</td>');
				tcga.push('<td>');
				if (disease.rppa) {
					tcga
					.push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="rppa"> Proteomics');
				}
				tcga.push('</td>');
				tcga.push('<td>');
				if (disease.methylation) {
					tcga
					.push('<input type="checkbox" style="margin-left:4px;" data-toggle="dataTypeToggle" data-type="methylation"> Methylation');
				}
				tcga.push('</td>');

				tcga.push('<td>');

				tcga
				.push('<td><button disabled type="button" class="btn btn-default" name="tcgaLink" data-disease-type="'
					+ disease.type
					+ '">'
					+ options.openText
					+ '</button></td>');

				tcga.push('</td>');

				tcga.push('</tr>');
			}
			tcga.push('</table>');
			$(tcga.join('')).appendTo($el.find('[data-name=tcga]'));
		});
};

morpheus.SampleDatasets.getTcgaDataset = function (options) {
	var baseUrl = 'https://s3.amazonaws.com/data.clue.io/morpheus/tcga/'
		+ options.type + '/';
	var datasetOptions = {};
	if (options.mrna) {
		datasetOptions.mrna = baseUrl + 'mRNAseq_RSEM_normalized_log2.txt';
	}

	if (options.methylation) {
		datasetOptions.methylation = baseUrl + 'meth.by_mean.data.txt';
	}
	if (options.sig_genes) {
		datasetOptions.mutation = baseUrl + 'mutations_merged.maf.txt';
		datasetOptions.sigGenes = baseUrl + 'sig_genes.txt';
	}
	// datasetOptions.seg = baseUrl + 'snp.seg.txt';
	if (options.rppa) {
		datasetOptions.rppa = baseUrl + 'rppa.txt';
	}
	if (options.gistic) {
		datasetOptions.gistic = baseUrl + 'all_lesions.conf_99.txt';
	}
	if (options.gisticGene) {
		datasetOptions.gisticGene = baseUrl + 'all_data_by_genes.txt';
	}

	datasetOptions.mrnaClust = baseUrl + 'bestclus.txt';

	datasetOptions.columnAnnotations = [{
		file: baseUrl + 'All_CDEs.txt',
		datasetField: 'participant_id',
		fileField: 'patient_id'
	}];
	return morpheus.TcgaUtil.getDataset(datasetOptions);

};
morpheus.SampleDatasets.getCCLEDataset = function (options) {
	var datasets = [];
	if (options.sig_genes) {
		datasets
		.push({
			dataset: 'https://s3.amazonaws.com/data.clue.io/morpheus/CCLE_hybrid_capture1650_hg19_NoCommonSNPs_NoNeutralVariants_CDS_2012.05.07.maf.txt'
		});
		// datasets
		// .push({
		// dataset :
		// '//s3.amazonaws.com/data.clue.io/morpheus/1650_HC_plus_RD_muts.maf.txt'
		// });
	}
	if (options.cn) {
		datasets
		.push({
			dataset: 'https://s3.amazonaws.com/data.clue.io/morpheus/CCLE_copynumber_byGene_2013-12-03.gct'
		});
	}

	if (options.mrna) {
		datasets
		.push({
			dataset: 'https://s3.amazonaws.com/data.clue.io/morpheus/CCLE_Expression_Entrez_2012-09-29.txt'
		});
	}
	if (options.ach) {
		datasets
		.push({
			dataset: 'https://s3.amazonaws.com/data.clue.io/morpheus/Achilles_QC_v2.4.3.rnai.Gs.gct'
		});
	}
	var columnAnnotations = [{
		file: 'https://s3.amazonaws.com/data.clue.io/morpheus/CCLE_Sample_Info.txt',
		datasetField: 'id',
		fileField: 'id'
	}];
	if (options.ach) {
		// there are several cell lines that are in Achilles but not CCLE
		columnAnnotations
		.push({
			file: 'https://s3.amazonaws.com/data.clue.io/morpheus/Achilles_v2.4_SampleInfo_small.txt',
			datasetField: 'id',
			fileField: 'id'
		});

	}
	var returnDeferred = $.Deferred();
	var datasetDef = morpheus.DatasetUtil.readDatasetArray({
		dataset: datasets
	});

	var annotationDef = morpheus.DatasetUtil.annotate({
		annotations: columnAnnotations,
		isColumns: true
	});
	var datasetToReturn;
	datasetDef.done(function (d) {
		datasetToReturn = d;
	});
	datasetDef.fail(function (message) {
		returnDeferred.reject(message);
	});
	var annotationCallbacks;
	annotationDef.done(function (callbacks) {
		annotationCallbacks = callbacks;
	});
	annotationDef.fail(function (message) {
		returnDeferred.reject(message);
	});

	$.when.apply($, [datasetDef, annotationDef]).then(function () {

		annotationCallbacks.forEach(function (f) {
			f(datasetToReturn);
		});
		returnDeferred.resolve(datasetToReturn);
	});

	return returnDeferred;
};
morpheus.SampleDatasets.prototype = {

	openTcga: function (options) {
		this
		.callback({
			name: options.name,
			renderReady: function (heatMap) {
				var whitelist = [
					'age_at_initial_pathologic_diagnosis',
					'breast_carcinoma_estrogen_receptor_status',
					'breast_carcinoma_progesterone_receptor_status',
					'lab_proc_her2_neu_immunohistochemistry_receptor_status',
					'days_to_death', 'ethnicity', 'gender',
					'histological_type', 'pathologic_stage'];

				var columnMetadata = heatMap.getProject()
				.getFullDataset().getColumnMetadata();
				for (var i = 0; i < whitelist.length; i++) {
					if (columnMetadata.getByName(whitelist[i])) {
						heatMap.addTrack(whitelist[i], true, 'color');
					}
				}
				// view in space of mutation sample ids only
				if (options.sig_genes) {
					if (heatMap.getTrackIndex('q_value', false) === -1) {
						heatMap.addTrack('q_value', false, 'text');
					}
				}
			},
			columns: [{
				field: 'participant_id',
				display: 'text'
			}, {
				field: 'sample_type',
				display: 'color'
			}, {
				field: 'mutation_summary',
				display: 'stacked_bar'
			}, {
				field: 'mRNAseq_cluster',
				display: 'color, highlight'
			}],
			dataset: morpheus.SampleDatasets.getTcgaDataset(options)
		});
	},
	openCCLE: function (options) {
		this.callback({
			name: 'CCLE',
			rows: [{
				field: 'id',
				display: 'text,tooltip'
			}, {
				field: 'mutation_summary',
				display: 'stacked_bar'
			}, {
				field: 'Source',
				display: 'color'
			}],
			columns: [{
				field: 'id',
				display: 'text,tooltip'
			}, {
				field: 'mutation_summary',
				display: 'stacked_bar'
			}, {
				field: 'gender',
				display: 'color, highlight'
			}, {
				field: 'histology',
				display: 'color, highlight'
			}, {
				field: 'histology subtype',
				display: 'color, highlight'
			}, {
				field: 'primary_site',
				display: 'color, highlight'
			}],
			dataset: morpheus.SampleDatasets.getCCLEDataset(options)
		});
	}
};

morpheus.AdjustDataTool = function() {
};
morpheus.AdjustDataTool.prototype = {
	toString : function() {
		return 'Adjust';
	},
	gui : function() {
		// z-score, robust z-score, log2, inverse log2
		return [ {
			name : 'log_2',
			type : 'checkbox'
		}, {
			name : 'inverse_log_2',
			type : 'checkbox'
		}, {
			name : 'z-score',
			type : 'checkbox',
			help : 'Subtract mean, divide by standard deviation'
		}, {
			name : 'robust_z-score',
			type : 'checkbox',
			help : 'Subtract median, divide by median absolute deviation'
		}, {
			name : 'use_selected_rows_and_columns_only',
			type : 'checkbox'
		} ];
	},
	execute : function(options) {
		var project = options.project;
		var controller = options.controller;

		if (options.input.log_2 || options.input.inverse_log_2
				|| options.input['z-score'] || options.input['robust_z-score']) {
			var selectedColumnIndices = project.getColumnSelectionModel()
					.getViewIndices();
			var selectedRowIndices = project.getRowSelectionModel()
					.getViewIndices();
			project.setFullDataset(morpheus.DatasetUtil.copy(project
					.getFullDataset()));
			project.getColumnSelectionModel().setViewIndices(
					selectedColumnIndices);
			project.getRowSelectionModel().setViewIndices(selectedRowIndices);
			// clone the values 1st
			var dataset = options.input.use_selected_rows_and_columns_only ? project
					.getSelectedDataset()
					: project.getSortedFilteredDataset();
			var rowView = new morpheus.DatasetRowView(dataset);
			var functions = [];
			if (options.input.log_2) {
				for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
					for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
						dataset.setValue(i, j, morpheus.Log2(dataset.getValue(
								i, j)));
					}
				}
			}
			if (options.input.inverse_log_2) {
				for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
					for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
						var value = dataset.getValue(i, j);
						if (value >= 0) {
							dataset.setValue(i, j, Math.pow(2, value));
						}
					}
				}
			}
			if (options.input['z-score']) {
				for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
					rowView.setIndex(i);
					var mean = morpheus.Mean(rowView);
					var stdev = Math.sqrt(morpheus.Variance(rowView));
					for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
						dataset.setValue(i, j, (dataset.getValue(i, j) - mean)
								/ stdev);
					}
				}
			}
			if (options.input['robust_z-score']) {
				for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
					rowView.setIndex(i);
					var median = morpheus.Median(rowView);
					var mad = morpheus.MAD(rowView, median);
					for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
						dataset.setValue(i, j,
								(dataset.getValue(i, j) - median) / mad);
					}
				}
			}

			project.trigger('datasetChanged');
			project.getColumnSelectionModel().setViewIndices(
					selectedColumnIndices, true);
			project.getRowSelectionModel().setViewIndices(selectedRowIndices,
					true);
		}
	}
};
morpheus.AnnotateDendrogramTool = function(isColumns) {
	this._isColumns = isColumns;
};
morpheus.AnnotateDendrogramTool.prototype = {
	toString : function() {
		return 'Annotate Dendrogram';
	},
	gui : function() {
		return [ {
			name : 'file',
			value : '',
			type : 'file',
			required : true,
			help : 'an xlsx file or a tab-delimitted text file'
		} ];
	},
	execute : function(options) {
		var fileOrUrl = options.input.file;
		var isColumns = this._isColumns;
		var controller = options.controller;
		var result = morpheus.Util.readLines(fileOrUrl);
		var fileName = morpheus.Util.getFileName(fileOrUrl);
		var dendrogram = isColumns ? controller.columnDendrogram
				: controller.rowDendrogram;
		var nameToNode = new morpheus.Map();
		morpheus.AbstractDendrogram.dfs(dendrogram.tree.rootNode,
				function(node) {
					nameToNode.set(node.name, node);
					return true;
				});
		var tab = new RegExp('\t');
		result.done(function(lines) {
			var header = lines[0].split(tab);
			var promptTool = {};
			promptTool.execute = function(options) {
				var nodeIdField = options.input.node_id_field;
				var nodeIdIndex = _.indexOf(header, nodeIdField);
				var numberOfMatchingNodes = 0;
				for (var i = 1; i < lines.length; i++) {
					var array = lines[i].split(tab);
					var nodeName = array[nodeIdIndex];
					var node = nameToNode.get(nodeName);
					if (node !== undefined) {
						numberOfMatchingNodes++;
						var info = node.info || (node.info = {});
						for (var j = 0; j < array.length; j++) {
							if (j === nodeIdIndex) {
								continue;
							}
							var vals = info[header[j]];
							if (vals === undefined) {
								vals = [];
								info[header[j]] = vals;
							}
							vals.push(array[j]);
						}
					}
				}
				controller.trigger('dendrogramAnnotated', {
					isColumns : isColumns
				});
				dendrogram.setInvalid(true);
				dendrogram.repaint();
			};
			promptTool.toString = function() {
				return 'Select Node Id Field';
			};
			promptTool.gui = function() {
				return [ {
					name : 'node_id_field',
					type : 'select',
					options : _.map(header, function(item) {
						return {
							name : item,
							value : item
						};
					}),
					required : true
				} ];
			};
			morpheus.HeatMap.showTool(promptTool, controller);
		});
	}
};
/**
 * @param chartOptions.project
 *            morpheus.Project
 * @param chartOptions.getVisibleTrackNames
 *            {Function}
 */
morpheus.ChartTool = function (chartOptions) {
	var _this = this;
	this.getVisibleTrackNames = chartOptions.getVisibleTrackNames;
	this.project = chartOptions.project;
	var project = this.project;
	this.$el = $('<div class="container-fluid">'
		+ '<div class="row">'
		+ '<div data-name="configPane" class="col-xs-2"></div>'
		+ '<div class="col-xs-10"><div style="position:relative;" data-name="chartDiv"></div></div>'
		+ '</div></div>');

	var formBuilder = new morpheus.FormBuilder({
		vertical: true
	});
	this.formBuilder = formBuilder;
	formBuilder.append({
		name: 'chart_type',
		type: 'bootstrap-select',
		options: ['boxplot', 'row scatter matrix', 'column scatter matrix', 'row profile', 'column' +
		' profile']
	});
	var rowOptions = [];
	var columnOptions = [];
	var numericRowOptions = [];
	var numericColumnOptions = [];
	var options = [];
	var numericOptions = [];
	var updateOptions = function () {
		var dataset = project.getFullDataset();
		rowOptions = [{
			name: '(None)',
			value: ''
		}];
		columnOptions = [{
			name: '(None)',
			value: ''
		}];
		numericRowOptions = [{
			name: '(None)',
			value: ''
		}];
		numericColumnOptions = [{
			name: '(None)',
			value: ''
		}];
		options = [{
			name: '(None)',
			value: ''
		}];
		numericOptions = [{
			name: '(None)',
			value: ''
		}];

		morpheus.MetadataUtil.getMetadataNames(dataset.getRowMetadata())
		.forEach(
			function (name) {
				var dataType = morpheus.VectorUtil
				.getDataType(dataset.getRowMetadata()
				.getByName(name));
				if (dataType === 'number'
					|| dataType === '[number]') {
					numericRowOptions.push({
						name: name + ' (row)',
						value: name + '_r'
					});
				}
				rowOptions.push({
					name: name + ' (row)',
					value: name + '_r'
				});
			});

		morpheus.MetadataUtil.getMetadataNames(dataset.getColumnMetadata())
		.forEach(
			function (name) {
				var dataType = morpheus.VectorUtil
				.getDataType(dataset.getColumnMetadata()
				.getByName(name));
				if (dataType === 'number'
					|| dataType === '[number]') {
					numericColumnOptions.push({
						name: name + ' (column)',
						value: name + '_c'
					});
				}
				columnOptions.push({
					name: name + ' (column)',
					value: name + '_c'
				});
			});

		options = options.concat(rowOptions.slice(1));
		options = options.concat(columnOptions.slice(1));

		numericOptions = numericOptions.concat(numericRowOptions.slice(1));
		numericOptions = numericOptions.concat(numericColumnOptions.slice(1));
	};

	updateOptions();
	formBuilder.append({
		name: 'group_columns_by',
		type: 'bootstrap-select',
		options: options
	});
	formBuilder.append({
		name: 'group_rows_by',
		type: 'bootstrap-select',
		options: options
	});

	formBuilder.append({
		name: 'axis_label',
		type: 'bootstrap-select',
		options: rowOptions
	});
	formBuilder.append({
		name: 'show_points',
		type: 'checkbox',
		value: true
	});

	formBuilder.append({
		name: 'color',
		type: 'bootstrap-select',
		options: options
	});

	formBuilder.append({
		name: 'size',
		type: 'bootstrap-select',
		options: numericOptions
	});
	formBuilder.append({
		name: 'tooltip',
		type: 'bootstrap-select',
		multiple: true,
		search: true,
		options: options.slice(1)
	});

	function setVisibility() {
		var chartType = formBuilder.getValue('chart_type');
		formBuilder.setVisible('group_rows_by', chartType === 'boxplot');
		formBuilder.setVisible('group_columns_by', chartType === 'boxplot');
		if (chartType !== 'boxplot') {
			formBuilder.setOptions('axis_label',
				(chartType === 'row scatter matrix' || chartType === 'column profile') ? rowOptions : columnOptions,
				true);
			formBuilder.setOptions('color',
				(chartType === 'row scatter matrix' || chartType === 'column profile') ? columnOptions : rowOptions,
				true);
			formBuilder.setOptions('size',
				(chartType === 'row scatter matrix' || chartType === 'row profile') ? numericColumnOptions
					: numericRowOptions, true);

		} else {
			formBuilder.setOptions('color', options, true);
			formBuilder.setOptions('size', numericOptions, true);
		}
		formBuilder.setVisible('axis_label', chartType !== 'boxplot');

	}

	this.tooltip = [];
	formBuilder.$form.find('select').on('change', function (e) {
		if ($(this).attr('name') === 'tooltip') {
			var tooltipVal = _this.formBuilder.getValue('tooltip');
			_this.tooltip = [];
			if (tooltipVal != null) {
				tooltipVal.forEach(function (tip) {
					_this.tooltip.push(morpheus.ChartTool.getVectorInfo(tip));
				});
			}
		} else {
			setVisibility();
			_this.draw();
		}

	});
	formBuilder.$form.find('input').on('click', function () {
		_this.draw();
	});
	setVisibility();

	var draw = function () {
		_.debounce(_this.draw(), 100);
	};
	var trackChanged = function () {
		updateOptions();
		setVisibility();
		formBuilder.setOptions('group_columns_by', options, true);
		formBuilder.setOptions('group_rows_by', options, true);
	};

	project.getColumnSelectionModel().on('selectionChanged.chart', draw);
	project.getRowSelectionModel().on('selectionChanged.chart', draw);
	project.on('trackChanged.chart', trackChanged);
	this.$chart = this.$el.find('[data-name=chartDiv]');
	var $dialog = $('<div style="background:white;" title="Chart"></div>');
	var $configPane = this.$el.find('[data-name=configPane]');
	formBuilder.$form.appendTo($configPane);
	this.$el.appendTo($dialog);
	$dialog.dialog({
		close: function (event, ui) {
			project.off('trackChanged.chart', trackChanged);
			project.getRowSelectionModel().off('selectionChanged.chart', draw);
			project.getColumnSelectionModel().off('selectionChanged.chart',
				draw);
			_this.$el.empty();
		},

		resizable: true,
		height: 600,
		width: 900
	});
	this.$dialog = $dialog;
	this.draw();
};

morpheus.ChartTool.getPlotlyDefaults = function () {
	var layout = {
		hovermode: 'closest',
		autosize: true,
		paper_bgcolor: 'rgb(255,255,255)',
		plot_bgcolor: 'rgb(229,229,229)',
		showlegend: false,
		margin: {
			l: 80,
			r: 0,
			t: 24, // leave space for modebar
			b: 14,
			autoexpand: true
		},
		xaxis: {
			zeroline: false,
			titlefont: {
				size: 12
			},
			gridcolor: 'rgb(255,255,255)',
			showgrid: true,
			showline: false,
			showticklabels: true,
			tickcolor: 'rgb(127,127,127)',
			ticks: 'outside'
		},
		yaxis: {
			zeroline: false,
			titlefont: {
				size: 12
			},
			gridcolor: 'rgb(255,255,255)',
			showgrid: true,
			showline: false,
			showticklabels: true,
			tickcolor: 'rgb(127,127,127)',
			ticks: 'outside'
		}
	};
	var config = {
		showLink: false,
		displaylogo: false,
		staticPlot: false,
		showHints: true,
		modeBarButtonsToRemove: ['sendDataToCloud', 'zoomIn2d', 'zoomOut2d', 'hoverCompareCartesian', 'hoverClosestCartesian']
	};
	return {
		layout: layout,
		config: config
	};
};

morpheus.ChartTool.getVectorInfo = function (value) {
	var field = value.substring(0, value.length - 2);
	var isColumns = value.substring(value.length - 2) === '_c';
	return {
		field: field,
		isColumns: isColumns
	};
};
morpheus.ChartTool.prototype = {
	annotate: function (options) {
		var _this = this;
		var formBuilder = new morpheus.FormBuilder();
		formBuilder.append({
			name: 'annotation_name',
			type: 'text',
			required: true
		});
		formBuilder.append({
			name: 'annotation_value',
			type: 'text',
			required: true
		});
		// formBuilder.append({
		// name : 'annotate',
		// type : 'radio',
		// required : true,
		// options : [ 'Rows', 'Columns', 'Rows And Columns' ],
		// value : 'Rows'
		// });
		morpheus.FormBuilder
		.showOkCancel({
			title: 'Annotate Selection',
			content: formBuilder.$form,
			okCallback: function () {
				var dataset = options.dataset;
				var eventData = options.eventData;
				var array = options.array;2
				var value = formBuilder.getValue('annotation_value');
				var annotationName = formBuilder
				.getValue('annotation_name');
				// var annotate = formBuilder.getValue('annotate');
				var isRows = true;
				var isColumns = true;
				var existingRowVector = null;
				var rowVector = null;
				if (isRows) {
					existingRowVector = dataset.getRowMetadata()
					.getByName(annotationName);
					rowVector = dataset.getRowMetadata().add(
						annotationName);
				}
				var existingColumnVector = null;
				var columnVector = null;
				if (isColumns) {
					existingColumnVector = dataset.getColumnMetadata()
					.getByName(annotationName);
					columnVector = dataset.getColumnMetadata().add(
						annotationName);
				}

				for (var p = 0, nselected = eventData.points.length; p < nselected; p++) {
					var item = array[eventData.points[p].pointNumber];
					if (isRows) {
						if (_.isArray(item.row)) {
							item.row.forEach(function (r) {
								rowVector.setValue(r, value);
							});

						} else {
							rowVector.setValue(item.row, value);
						}

					}
					if (isColumns) {
						columnVector.setValue(item.column, value);
					}
				}
				if (isRows) {
					morpheus.VectorUtil
					.maybeConvertStringToNumber(rowVector);
					_this.project.trigger('trackChanged', {
						vectors: [rowVector],
						render: existingRowVector != null ? []
							: [morpheus.VectorTrack.RENDER.TEXT],
						columns: false
					});
				}
				if (isColumns) {
					morpheus.VectorUtil
					.maybeConvertStringToNumber(columnVector);
					_this.project.trigger('trackChanged', {
						vectors: [columnVector],
						render: existingColumnVector != null ? []
							: [morpheus.VectorTrack.RENDER.TEXT],
						columns: true
					});
				}
			}
		});

	},
	_createScatter: function (options) {
		var dataset = options.dataset;
		var colorByVector = options.colorByVector;
		var colorModel = options.colorModel;
		var sizeByVector = options.sizeByVector;
		var sizeFunction = options.sizeFunction;

		var heatmap = this.heatmap;
		var myPlot = options.myPlot;
		var isColumnChart = options.isColumnChart;
		// scatter
		var x = [];
		var y = [];
		var text = [];
		var color = colorByVector ? [] : '#1f78b4';
		var size = sizeByVector ? [] : 6;

		var array = [];
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			y.push(dataset.getValue(options.rowIndexOne, j));
			x.push(dataset.getValue(options.rowIndexTwo, j));
			array.push({
				row: [options.rowIndexOne, options.rowIndexTwo],
				column: j
			});
			if (colorByVector) {
				var colorByValue = colorByVector.getValue(j);
				color.push(colorModel.getMappedValue(colorByVector,
					colorByValue));
			}
			if (sizeByVector) {
				var sizeByValue = sizeByVector.getValue(j);
				size.push(sizeFunction(sizeByValue));
			}
			var obj = {
				j: j
			};
			obj.toString = function () {
				var s = [];
				for (var tipIndex = 0; tipIndex < _this.tooltip.length; tipIndex++) {
					var tip = _this.tooltip[tipIndex];
					if (tip.isColumns) {
						morpheus.HeatMapTooltipProvider.vectorToString(dataset.getColumnMetadata().getByName(tip.field),
							this.j, s, '<br>');
					}
				}

				return s.join('');

			};
			text.push(obj);
		}

		// TODO add R^2
		var trace = {
			x: x,
			y: y,
			marker: {
				color: color,
				size: size,
				symbol: 'circle-open'
			},
			text: text,
			mode: 'markers',
			type: 'scatter' // scattergl
		};
		var selection = null;
		var _this = this;
		var config = $
		.extend(
			true,
			{},
			options.config,
			{
				modeBarButtonsToAdd: [[{
					name: 'annotate',
					title: 'Annotate Selection',
					attr: 'dragmode',
					val: 'annotate',
					icon: {
						'width': 1792,
						'path': 'M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z',
						'ascent': 1792,
						'descent': 0
					},
					click: function () {
						if (!selection) {
							morpheus.FormBuilder
							.showInModal({
								title: 'Annotate Selection',
								html: 'Please select points in the chart',
								close: 'Close'
							});
						} else {
							_this.annotate({
								array: array,
								eventData: selection,
								dataset: dataset
							});
						}
					}
				}]]
			});
		Plotly.newPlot(myPlot, [trace], options.layout, config);
		myPlot.on('plotly_selected', function (eventData) {
			selection = eventData;
		});

	},
	_createProfile: function (options) {
		var dataset = options.dataset;
		// only allow coloring by row
		var colorByVector = options.colorByVector;
		var colorModel = options.colorModel;
		var sizeByVector = options.sizeByVector;
		var sizeFunction = options.sizeFunction;
		var axisLabelVector = options.axisLabelVector;
		var isColumnChart = options.isColumnChart;
		var heatmap = this.heatmap;
		var myPlot = options.myPlot;

		var traces = [];
		var ticktext = [];
		var tickvals = [];
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			ticktext.push(axisLabelVector != null ? axisLabelVector.getValue(j) : '' + j);
			tickvals.push(j);
		}
		for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
			// each row is a new trace
			var x = [];
			var y = [];
			var text = [];
			var size = sizeByVector ? [] : 6;
			var color = colorByVector ? colorModel.getMappedValue(colorByVector,
				colorByVector.getValue(i)) : undefined;

			for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
				x.push(j);
				y.push(dataset.getValue(i, j));

				if (sizeByVector) {
					var sizeByValue = sizeByVector.getValue(j);
					size.push(sizeFunction(sizeByValue));
				}
				var obj = {
					i: i,
					j: j
				};
				obj.toString = function () {
					var s = [];
					for (var tipIndex = 0; tipIndex < _this.tooltip.length; tipIndex++) {
						var tip = _this.tooltip[tipIndex];
						if (tip.isColumns) {
							morpheus.HeatMapTooltipProvider.vectorToString(dataset.getColumnMetadata().getByName(tip.field),
								this.j, s, '<br>');
						} else {
							morpheus.HeatMapTooltipProvider.vectorToString(dataset.getRowMetadata().getByName(tip.field),
								this.i, s, '<br>');
						}
					}

					return s.join('');

				};

				text.push(obj);
			}
			var trace = {
					x: x,
					y: y,
					name: colorByVector ? colorByVector.getValue(i) : '',
					tickmode: 'array',
					marker: {
						size: size,
						symbol: 'circle'
					},
					text: text,
					mode: 'lines' + (options.showPoints ? '+markers' : ''
					),
					type: 'scatter' // scattergl
				}
				;
			traces.push(trace);
		}

		var selection = null;
		var _this = this;
		options.layout.xaxis.tickvals = tickvals;
		options.layout.xaxis.ticktext = ticktext;
		options.layout.xaxis.tickmode = 'array';

		var config = $
		.extend(
			true,
			{},
			options.config,
			{
				modeBarButtonsToAdd: [[{
					name: 'annotate',
					title: 'Annotate Selection',
					attr: 'dragmode',
					val: 'annotate',
					icon: {
						'width': 1792,
						'path': 'M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z',
						'ascent': 1792,
						'descent': 0
					},
					click: function () {
						if (!selection) {
							morpheus.FormBuilder
							.showInModal({
								title: 'Annotate Selection',
								html: 'Please select points in the chart',
								close: 'Close'
							});
						} else {
							_this.annotate({
								eventData: selection,
								dataset: dataset
							});
						}
					}
				}]]
			});
		var $parent = $(myPlot).parent();
		options.layout.width = $parent.width();
		options.layout.height = this.$dialog.height() - 30;
		Plotly.newPlot(myPlot, traces, options.layout, config);
		myPlot.on('plotly_selected', function (eventData) {
			selection = eventData;
		});

		function resize() {
			var width = $parent.width();
			var height = _this.$dialog.height() - 30;
			Plotly.relayout(myPlot, {
				width: width,
				height: height
			});
		}

		this.$dialog.on('dialogresize', resize);
		$(myPlot).on('remove', function () {
			_this.$dialog.off('dialogresize');
		});

	},
	_createBoxPlot: function (options) {
		var array = options.array; // array of items
		var points = options.points;
		var colorByVector = options.colorByVector;
		var colorByGetter = options.colorByGetter;
		var colorModel = options.colorModel;
		var myPlot = options.myPlot;
		var dataset = options.dataset;
		var y = [];
		var color = points && colorByVector ? [] : '#1f78b4';
		var text = [];
		var x = [];
		var heatmap = this.heatmap;
		var sizeFunction = options.sizeFunction;
		var sizeByGetter = options.sizeByGetter;
		var size = sizeFunction ? [] : 6;
		var scale = d3.scale.linear().domain([0, 1]).range([-0.3, -1]);
		for (var k = 0, nitems = array.length; k < nitems; k++) {
			var item = array[k];
			y.push(dataset.getValue(item.row, item.column));
			if (points) {
				x.push(scale(Math.random()));
				if (colorByVector) {
					var colorByValue = colorByGetter(item);
					color.push(colorModel.getMappedValue(colorByVector,
						colorByValue));
				}
				if (sizeFunction) {
					var sizeByValue = sizeByGetter(item);
					size.push(sizeFunction(sizeByValue));
				}
				var obj = {
					i: item.row,
					j: item.column
				};
				obj.toString = function () {
					var s = [];
					for (var tipIndex = 0; tipIndex < _this.tooltip.length; tipIndex++) {
						var tip = _this.tooltip[tipIndex];
						if (tip.isColumns) {
							morpheus.HeatMapTooltipProvider.vectorToString(dataset.getColumnMetadata().getByName(tip.field),
								this.j, s, '<br>');
						} else {
							morpheus.HeatMapTooltipProvider.vectorToString(dataset.getRowMetadata().getByName(tip.field),
								this.i, s, '<br>');
						}
					}

					return s.join('');

				};
				text.push(obj);
			}

		}

		var traces = [{
			name: '',
			y: y,
			type: 'box',
			boxpoints: false
		}];
		if (points) {
			traces.push({
				name: '',
				x: x,
				y: y,
				hoverinfo: 'y+text',
				mode: 'markers',
				type: 'scatter',
				text: text,
				marker: {
					symbol: 'circle-open',
					size: size,
					color: color
				}
			});
		}
		var selection = null;
		var _this = this;
		var config = $
		.extend(
			true,
			{},
			options.config,
			{
				modeBarButtonsToAdd: [[{
					name: 'annotate',
					title: 'Annotate Selection',
					attr: 'dragmode',
					val: 'annotate',
					icon: {
						'width': 1792,
						'path': 'M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z',
						'ascent': 1792,
						'descent': 0
					},
					click: function () {
						if (!selection) {
							morpheus.FormBuilder
							.showInModal({
								title: 'Annotate Selection',
								html: 'Please select points in the chart',
								close: 'Close'
							});
						} else {
							_this.annotate({
								array: array,
								eventData: selection,
								dataset: dataset
							});
						}
					}
				}]]
			});

		Plotly.newPlot(myPlot, traces, options.layout, config);
		myPlot.on('plotly_selected', function (eventData) {
			selection = eventData;
		});

	},
	draw: function () {
		var _this = this;
		this.$chart.empty();
		var plotlyDefaults = morpheus.ChartTool.getPlotlyDefaults();
		var layout = plotlyDefaults.layout;
		var config = plotlyDefaults.config;
		var chartWidth = 400;
		var chartHeight = 400;
		var showPoints = this.formBuilder.getValue('show_points');

		var groupColumnsBy = this.formBuilder.getValue('group_columns_by');
		var axisLabel = this.formBuilder.getValue('axis_label');
		var colorBy = this.formBuilder.getValue('color');
		var sizeBy = this.formBuilder.getValue('size');
		var groupRowsBy = this.formBuilder.getValue('group_rows_by');
		var chartType = this.formBuilder.getValue('chart_type');

		var dataset = this.project.getSelectedDataset({
			emptyToAll: false
		});
		this.dataset = dataset;
		if (dataset.getRowCount() * dataset.getColumnCount() === 0) {
			$('<h4>Please select rows and columns in the heat map.</h4>')
			.appendTo(this.$chart);
			return;
		}
		if ((dataset.getRowCount() * dataset.getColumnCount()) > 100000) {
			showPoints = false;
		}

		var grid = [];
		var rowIds = [undefined];
		var columnIds = [undefined];
		var items = [];
		var heatmap = this.heatmap;
		var colorByInfo = morpheus.ChartTool.getVectorInfo(colorBy);
		var sizeByInfo = morpheus.ChartTool.getVectorInfo(sizeBy);
		var colorModel = !colorByInfo.isColumns ? this.project.getRowColorModel()
			: this.project.getColumnColorModel();
		var axisLabelInfo = morpheus.ChartTool.getVectorInfo(axisLabel);
		var axisLabelVector = axisLabelInfo.isColumns ? dataset.getColumnMetadata().getByName(axisLabelInfo.field) : dataset.getRowMetadata().getByName(
			axisLabelInfo.field);
		var sizeByVector = sizeByInfo.isColumns ? dataset.getColumnMetadata().getByName(sizeByInfo.field) : dataset.getRowMetadata().getByName(
			sizeByInfo.field);
		var colorByVector = colorByInfo.isColumns ? dataset.getColumnMetadata().getByName(colorByInfo.field) : dataset.getRowMetadata().getByName(
			colorByInfo.field);

		var sizeByScale = null;
		if (sizeByVector) {
			var minMax = morpheus.VectorUtil.getMinMax(sizeByVector);
			sizeByScale = d3.scale.linear().domain(
				[minMax.min, minMax.max]).range([3, 16])
			.clamp(true);
		}
		if (chartType === 'row profile' || chartType === 'column profile') {
			var $chart = $('<div></div>');
			var myPlot = $chart[0];
			$chart.appendTo(this.$chart);
			if (chartType === 'column profile') {
				dataset = new morpheus.TransposedDatasetView(dataset);
			}
			this
			._createProfile({
				showPoints: showPoints,
				isColumnChart: chartType === 'column profile',
				axisLabelVector: axisLabelVector,
				colorByVector: colorByVector,
				colorModel: colorModel,
				sizeByVector: sizeByVector,
				sizeFunction: sizeByScale,
				myPlot: myPlot,
				dataset: dataset,
				config: config,
				layout: $
				.extend(
					true,
					{},
					layout,
					{
						showlegend: true,
						width: chartWidth,
						height: chartHeight,
						margin: {
							b: 80
						},
						yaxis: {},
						xaxis: {}
					})
			});
		}
		if (chartType === 'row scatter matrix' || chartType === 'column scatter matrix') {
			var transpose = chartType === 'column scatter matrix';

			if (transpose) {
				dataset = new morpheus.TransposedDatasetView(dataset);
			}
			if (dataset.getRowCount() > 20) {
				$('<h4>Maximum chart size exceeded.</h4>')
				.appendTo(this.$chart);
				return;
			}

			// rowIndexOne is along rows of chart (y axis), rowIndexTwo along x
			// axis

			// draw grid
			for (var rowIndexOne = 0, nrows = dataset.getRowCount(); rowIndexOne < nrows; rowIndexOne++) {
				for (var rowIndexTwo = 0; rowIndexTwo < nrows; rowIndexTwo++) {
					if (rowIndexOne > rowIndexTwo) {
						continue;
					}
					var $chart = $('<div style="width:' + chartWidth
						+ 'px;height:' + chartHeight
						+ 'px;position:absolute;left:'
						+ (rowIndexTwo * chartWidth) + 'px;top:'
						+ (rowIndexOne * chartHeight) + 'px;"></div>');
					var myPlot = $chart[0];
					$chart.appendTo(this.$chart);

					if (rowIndexOne === rowIndexTwo) { // boxplot
						var array = [];
						for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
							array.push({
								row: rowIndexTwo,
								column: j
							});
						}

						this
						._createBoxPlot({
							array: array,
							points: showPoints,
							colorByVector: colorByVector,
							colorModel: colorModel,
							colorByGetter: function (item) {
								return colorByVector
								.getValue(item.column);
							},
							sizeByGetter: function (item) {
								return sizeByVector
								.getValue(item.column);
							},
							sizeFunction: sizeByScale,
							myPlot: myPlot,
							dataset: dataset,
							config: config,
							transposed: isColumns,
							layout: $
							.extend(
								true,
								{},
								layout,
								{
									width: chartWidth,
									height: chartHeight,
									margin: {
										b: 80
									},
									xaxis: {
										title: axisLabelVector == null ? ''
											: axisLabelVector
										.getValue(rowIndexTwo),
										showticklabels: false
									}
								})
						});

					} else {
						this
						._createScatter({
							isColumnChart: transpose,
							rowIndexOne: rowIndexOne,
							rowIndexTwo: rowIndexTwo,
							colorByVector: colorByVector,
							colorModel: colorModel,
							colorByGetter: function (item) {
								return colorByVector
								.getValue(item.column);
							},
							sizeByVector: sizeByVector,
							sizeFunction: sizeByScale,
							myPlot: myPlot,
							dataset: dataset,
							config: config,
							layout: $
							.extend(
								true,
								{},
								layout,
								{
									width: chartWidth,
									height: chartHeight,
									margin: {
										b: 80
									},
									yaxis: {
										title: axisLabelVector == null ? ''
											: axisLabelVector
										.getValue(rowIndexOne),
									},
									xaxis: {
										title: axisLabelVector == null ? ''
											: axisLabelVector
										.getValue(rowIndexTwo)
									}
								})
						});

					}
				}
			}
		} else if (chartType === 'boxplot') {
			for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
				for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
					items.push({
						row: i,
						column: j
					});
				}
			}
			var colorByInfo = morpheus.ChartTool.getVectorInfo(colorBy);
			var colorByVector = colorByInfo.isColumns ? dataset.getColumnMetadata()
			.getByName(colorByInfo.field) : dataset.getRowMetadata()
			.getByName(colorByInfo.field);

			var colorModel = !colorByInfo.isColumns ? this.project
			.getRowColorModel() : this.project.getColumnColorModel();
			var colorByGetter = colorByInfo.isColumns ? function (item) {
				return colorByVector.getValue(item.column);
			} : function (item) {
				return colorByVector.getValue(item.row);
			};
			var sizeByVector = sizeByInfo.isColumns ? dataset.getColumnMetadata()
			.getByName(sizeByInfo.field) : dataset.getRowMetadata()
			.getByName(sizeByInfo.field);
			var sizeByGetter = sizeByInfo.isColumns ? function (item) {
				return sizeByVector.getValue(item.column);
			} : function (item) {
				return sizeByVector.getValue(item.row);
			};
			var sizeByScale = null;
			if (sizeByVector) {
				var minMax = morpheus.VectorUtil.getMinMax(sizeByVector);
				sizeByScale = d3.scale.linear().domain([minMax.min, minMax.max])
				.range([3, 16]).clamp(true);
			}
			if (groupColumnsBy || groupRowsBy) {
				var rowIdToArray = new morpheus.Map();
				if (groupRowsBy) {
					var groupRowsByInfo = morpheus.ChartTool
					.getVectorInfo(groupRowsBy);
					var vector = groupRowsByInfo.isColumns ? dataset
					.getColumnMetadata().getByName(groupRowsByInfo.field)
						: dataset.getRowMetadata().getByName(
						groupRowsByInfo.field);

					var getter = groupRowsByInfo.isColumns ? function (item) {
						return vector.getValue(item.column);
					} : function (item) {
						return vector.getValue(item.row);
					};

					for (var i = 0, nitems = items.length; i < nitems; i++) {
						var item = items[i];
						var value = getter(item);
						var array = rowIdToArray.get(value);
						if (array == undefined) {
							array = [];
							rowIdToArray.set(value, array);
						}
						array.push(item);
					}
				} else {
					rowIdToArray.set(undefined, items);
				}

				if (groupColumnsBy) {
					var name = groupColumnsBy.substring(0,
						groupColumnsBy.length - 2);
					var isColumns = groupColumnsBy
						.substring(groupColumnsBy.length - 2) === '_c';
					var vector = isColumns ? dataset.getColumnMetadata().getByName(
						name) : dataset.getRowMetadata().getByName(name);
					var getter = isColumns ? function (item) {
						return vector.getValue(item.column);
					} : function (item) {
						return vector.getValue(item.row);
					};

					var columnIdToIndex = new morpheus.Map();
					var rowIndex = 0;
					rowIdToArray.forEach(function (array, id) {
						grid[rowIndex] = [];
						for (var i = 0, nitems = array.length; i < nitems; i++) {
							var item = array[i];
							var value = getter(item);
							var columnIndex = columnIdToIndex.get(value);
							if (columnIndex === undefined) {
								columnIndex = columnIdToIndex.size();
								columnIdToIndex.set(value, columnIndex);
							}
							if (grid[rowIndex][columnIndex] === undefined) {
								grid[rowIndex][columnIndex] = [];
							}

							grid[rowIndex][columnIndex].push(item);
						}
						rowIds[rowIndex] = id;
						rowIndex++;
					});
					columnIdToIndex.forEach(function (index, id) {
						columnIds[index] = id;
					});

				} else {
					var rowIndex = 0;
					rowIdToArray.forEach(function (array, id) {
						grid[rowIndex] = [array];
						rowIds[rowIndex] = id;
						rowIndex++;
					});
				}

			} else {
				grid = [[items]];
			}

			var gridRowCount = rowIds.length;
			var gridColumnCount = columnIds.length;

			for (var i = 0; i < gridRowCount; i++) {
				var rowId = rowIds[i];
				var yrange = [Number.MAX_VALUE, -Number.MAX_VALUE];
				if (chartType === 'boxplot') {
					for (var j = 0; j < gridColumnCount; j++) {
						var array = grid[i][j];
						if (array) {
							for (var k = 0, nitems = array.length; k < nitems; k++) {
								var item = array[k];
								var value = dataset.getValue(item.row, item.column);
								if (!isNaN(value)) {
									yrange[0] = Math.min(yrange[0], value);
									yrange[1] = Math.max(yrange[1], value);
								}

							}
						}
					}
					// for now increase range by 1%
					var span = yrange[1] - yrange[0];
					var delta = (span * 0.01);
					yrange[1] += delta;
					yrange[0] -= delta;
				}
				for (var j = 0; j < gridColumnCount; j++) {
					var array = grid[i][j];
					var columnId = columnIds[j];
					if (array) {

						var $chart = $('<div style="width:' + chartWidth
							+ 'px;height:' + chartHeight
							+ 'px;position:absolute;left:' + (j * chartWidth)
							+ 'px;top:' + (i * chartHeight) + 'px;"></div>');
						$chart.appendTo(this.$chart);
						var myPlot = $chart[0];
						if (chartType === 'boxplot') {

							this._createBoxPlot({
								layout: $.extend(true, {}, layout, {
									width: chartWidth,
									height: chartHeight,
									yaxis: {
										range: yrange,
										title: rowId,
									},
									xaxis: {
										title: columnId,
										showticklabels: false
									}
								}),
								array: array,
								points: showPoints,
								sizeByGetter: sizeByGetter,
								sizeFunction: sizeByScale,
								colorModel: colorModel,
								colorByVector: colorByVector,
								colorByGetter: colorByGetter,
								myPlot: myPlot,
								dataset: dataset,
								config: config
							});
						}

					}
				}

			}
		}

	}
};

morpheus.CollapseDatasetTool = function () {
};
morpheus.CollapseDatasetTool.Functions = [morpheus.Mean, morpheus.Median,
	new morpheus.MaxPercentiles([25, 75]), morpheus.Min, morpheus.Max, morpheus.Sum];
morpheus.CollapseDatasetTool.Functions.fromString = function (s) {
	for (var i = 0; i < morpheus.CollapseDatasetTool.Functions.length; i++) {
		if (morpheus.CollapseDatasetTool.Functions[i].toString() === s) {
			return morpheus.CollapseDatasetTool.Functions[i];
		}
	}
	throw new Error(s + ' not found');
};
morpheus.CollapseDatasetTool.prototype = {
	toString: function () {
		return 'Collapse';
	},
	init: function (project, form) {
		var setValue = function (val) {
			var isRows = val === 'Rows';
			var names = morpheus.MetadataUtil.getMetadataNames(isRows ? project
			.getFullDataset().getRowMetadata() : project
			.getFullDataset().getColumnMetadata());
			form.setOptions('collapse_to_fields', names);
		};
		form.$form.find('[name=collapse]').on('change', function (e) {
			setValue($(this).val());
		});
		setValue('Rows');
	},
	gui: function () {
		return [{
			name: 'collapse_method',
			options: morpheus.CollapseDatasetTool.Functions,
			value: morpheus.CollapseDatasetTool.Functions[1].toString(),
			type: 'select'
		}, {
			name: 'collapse',
			options: ['Columns', 'Rows'],
			value: 'Rows',
			type: 'radio'
		}, {
			name: 'collapse_to_fields',
			options: [],
			type: 'select',
			multiple: true
		}];
	},
	execute: function (options) {
		var project = options.project;
		var controller = options.controller;
		var f = morpheus.CollapseDatasetTool.Functions
		.fromString(options.input.collapse_method);
		var collapseToFields = options.input.collapse_to_fields;
		if (collapseToFields.length === 0) {
			throw new Error('Please select one or more fields to collapse to');
		}
		var dataset = project.getFullDataset();
		var rows = options.input.collapse == 'Rows';
		if (!rows) {
			dataset = new morpheus.TransposedDatasetView(dataset);
		}
		var allFields = morpheus.MetadataUtil.getMetadataNames(dataset
		.getRowMetadata());
		dataset = morpheus.CollapseDataset(dataset, collapseToFields, f, true);
		if (!rows) {
			dataset = new morpheus.TransposedDatasetView(dataset);
		}
		var set = new morpheus.Map();
		_.each(allFields, function (field) {
			set.set(field, true);
		});
		_.each(collapseToFields, function (field) {
			set.remove(field);
		});
		// hide fields that were not part of collapse to
		set.forEach(function (val, name) {
			controller.setTrackVisible(name, false, !rows);
		});
		project.setFullDataset(dataset, true);
	}
};

morpheus.CreateAnnotation = function() {
};
morpheus.CreateAnnotation.prototype = {
	toString : function() {
		return 'Create Calculated Annotation';
	},
	gui : function() {
		return [
			{
				name : 'annotate',
				options : [ 'Columns', 'Rows' ],
				value : 'Rows',
				type : 'radio'
			},
			{
				name : 'annotation_name',
				value : '',
				type : 'text',
				required : true
			},
			{
				name : 'formula',
				value : '',
				type : 'textarea',
				placeholder : 'e.g MAD()',
				required : true,
				help : 'JavaScript formula. Built-in functions (case-sensitive): COUNT(), MAD(), MAX(), MEAN(), MEDIAN(), MIN(), PERCENTILE(p), SUM(), VARIANCE(). Refer to a field using FIELD(name)'
			}, {
				name : 'use_selected_rows_and_columns_only',
				type : 'checkbox'
			} ];
	},
	execute : function(options) {
		var __project = options.project;
		var isColumns = options.input.annotate == 'Columns';
		var __formula = options.input.formula;
		var __dataset = options.input.use_selected_rows_and_columns_only ? __project
				.getSelectedDataset()
				: __project.getSortedFilteredDataset();
		if (isColumns) {
			__dataset = morpheus.DatasetUtil.transposedView(__dataset);
		}
		var __rowView = new morpheus.DatasetRowView(__dataset);
		var __vector = __dataset.getRowMetadata().add(
				options.input.annotation_name);
		var COUNT = function() {
			return morpheus.CountNonNaN(__rowView);
		};
		var MAD = function() {
			return morpheus.MAD(__rowView);
		};
		var MAX = function() {
			return morpheus.Max(__rowView);
		};
		var MEAN = function() {
			return morpheus.Mean(__rowView);
		};
		var MEDIAN = function(p) {
			return morpheus.Percentile(__rowView, 50);
		};
		var MIN = function() {
			return morpheus.Min(__rowView);
		};
		var PERCENTILE = function(p) {
			return morpheus.Percentile(__rowView, p);
		};
		var SUM = function() {
			return morpheus.Sum(__rowView);
		};
		var VARIANCE = function() {
			return morpheus.Variance(__rowView);
		};
		var __index = 0;
		var FIELD = function(field) {
			var vector = __dataset.getRowMetadata().getByName(field);
			return vector ? vector.getValue(__index) : undefined;
		};

		for (var size = __dataset.getRowCount(); __index < size; __index++) {
			__rowView.setIndex(__index);
			var __val = eval(__formula);
			if (typeof __val === 'function') {
				__val = '';
			}
			__vector.setValue(__index, __val);
		}
		__project.trigger('trackChanged', {
			vectors : [ __vector ],
			render : [ 'text' ],
			columns : isColumns
		});
	}
};
morpheus.DendrogramEnrichmentTool = function(isColumns) {
	this.isColumns = isColumns;
};

morpheus.DendrogramEnrichmentTool.prototype = {
	toString : function() {
		return 'Dendrogram Enrichment';
	},
	gui : function(project) {
		var dataset = project.getSortedFilteredDataset();
		var fields = morpheus.MetadataUtil
				.getMetadataNames(this.isColumns ? dataset.getColumnMetadata()
						: dataset.getRowMetadata());
		return [ {
			name : 'field',
			options : fields,
			type : 'bootstrap-select',
			multiple : false
		}, {
			name : 'min_p-value_for_enrichment',
			type : 'text',
			value : '0.05'
		}, {
			name : 'minimum_number_of_total_members_in_group',
			type : 'text',
			value : '5'
		}, {
			name : 'minimum_number_of_members_in_group',
			type : 'text',
			value : '3'
		} ];
	},
	execute : function(options) {
		var project = options.project;
		var controller = options.controller;
		var pValue = options.input['min_p-value_for_enrichment'];
		var minTotalGroupSize = options.input.minimum_number_of_total_members_in_group;
		var minGroupSize = options.input.minimum_number_of_members_in_group;
		var dataset = project.getSortedFilteredDataset();
		var dendrogram = this.isColumns ? controller.columnDendrogram
				: controller.rowDendrogram;
		var vector = this.isColumns ? dataset.getColumnMetadata().getByName(
				options.input.field) : dataset.getRowMetadata().getByName(
				options.input.field);

		var valueToIndices = morpheus.VectorUtil
				.createValueToIndicesMap(vector);
		var valueToGlobalCount = new morpheus.Map();
		var values = [];
		valueToIndices.forEach(function(indices, value) {
			valueToGlobalCount.set(value, indices.length);
			values.push(value);
		});
		var nvalues = values.length;
		var N = vector.size();

		morpheus.AbstractDendrogram.dfs(dendrogram.tree.rootNode,
				function(node) {
					delete node.info;
					var valueToCount = new morpheus.Map();
					for (var i = 0; i < nvalues; i++) {
						valueToCount.set(values[i], 0);
					}
					var min = node.minIndex;
					var max = node.maxIndex;
					var n = max - min + 1;
					if (n > 1 && n >= minTotalGroupSize) {
						for (var i = min; i <= max; i++) {
							var value = vector.getValue(i);
							valueToCount
									.set(value, valueToCount.get(value) + 1);
						}
						for (var i = 0; i < nvalues; i++) {
							var K = valueToGlobalCount.get(values[i]);
							var k = valueToCount.get(values[i]);
							if (k >= minGroupSize) {
								var a = k;
								var b = K - k;
								var c = n - k;
								var d = N + k - n - K;
								var p = morpheus.FisherExact.fisherTest(a, b,
										c, d);
								if (p <= pValue) {
									if (!node.info) {
										node.info = {};
									}
									node.info[values[i]] = p;

								}
							}
						}
					}
					return true;
				});
		dendrogram.setInvalid(true);
		dendrogram.repaint();
	}
};
morpheus.DevAPI = function() {
};
morpheus.DevAPI.prototype = {
	toString : function() {
		return 'API';
	},
	gui : function() {
		return [ {
			name : 'code',
			value : '',
			type : 'textarea',
			required : true,
			help : 'Enter your code'
		} ];
	},
	execute : function(options) {
		var project = options.project;
		var controller = options.controller;
		var code = options.input.code;
		var dataset = project.getSortedFilteredDataset();
		eval(code);
		project.setFullDataset(project.getFullDataset(), true);
	}
};
morpheus.HClusterTool = function() {
};
morpheus.HClusterTool.PRECOMPUTED_DIST = 'Matrix values (for a precomputed distance matrix)';
morpheus.HClusterTool.PRECOMPUTED_SIM = 'Matrix values (for a precomputed similarity matrix)';
morpheus.HClusterTool.Functions = [ morpheus.Euclidean, morpheus.Jaccard,
		new morpheus.OneMinusFunction(morpheus.Cosine),
		new morpheus.OneMinusFunction(morpheus.Pearson),
		new morpheus.OneMinusFunction(morpheus.Spearman),
		morpheus.HClusterTool.PRECOMPUTED_DIST,
		morpheus.HClusterTool.PRECOMPUTED_SIM ];
morpheus.HClusterTool.Functions.fromString = function(s) {
	for (var i = 0; i < morpheus.HClusterTool.Functions.length; i++) {
		if (morpheus.HClusterTool.Functions[i].toString() === s) {
			return morpheus.HClusterTool.Functions[i];
		}
	}
	throw new Error(s + ' not found');
};

morpheus.HClusterTool.createLinkageMethod = function(linkageString) {
	var linkageMethod;
	if (linkageString === 'Average') {
		linkageMethod = morpheus.AverageLinkage;
	} else if (linkageString === 'Complete') {
		linkageMethod = morpheus.CompleteLinkage;
	} else if (linkageString === 'Single') {
		linkageMethod = morpheus.SingleLinkage;
	} else {
		throw new Error('Unknown linkage method ' + linkageString);
	}
	return linkageMethod;
};

morpheus.HClusterTool.execute = function(dataset, input) {
	// note: in worker here
	var linkageMethod = morpheus.HClusterTool
			.createLinkageMethod(input.linkage_method);
	var f = morpheus.HClusterTool.Functions.fromString(input.metric);
	if (f === morpheus.HClusterTool.PRECOMPUTED_DIST) {
		f = 0;
	} else if (f === morpheus.HClusterTool.PRECOMPUTED_SIM) {
		f = 1;
	}
	var rows = input.cluster == 'Rows' || input.cluster == 'Rows and columns';
	var columns = input.cluster == 'Columns'
			|| input.cluster == 'Rows and columns';
	var doCluster = function(d, groupByFields) {
		return (groupByFields && groupByFields.length > 0) ? new morpheus.HClusterGroupBy(
				d, groupByFields, f, linkageMethod)
				: new morpheus.HCluster(morpheus.HCluster
						.computeDistanceMatrix(d, f), linkageMethod);
	};

	var rowsHcl;
	var columnsHcl;

	if (rows) {
		rowsHcl = doCluster(
				input.selectedColumns ? new morpheus.SlicedDatasetView(dataset,
						null, input.selectedColumns) : dataset,
				input.group_rows_by);
	}
	if (columns) {
		columnsHcl = doCluster(
				morpheus.DatasetUtil
						.transposedView(input.selectedRows ? new morpheus.SlicedDatasetView(
								dataset, input.selectedRows, null)
								: dataset), input.group_columns_by);

	}
	return {
		rowsHcl : rowsHcl,
		columnsHcl : columnsHcl
	};
};
morpheus.HClusterTool.prototype = {
	toString : function() {
		return 'Hierarchical Clustering';
	},
	init : function(project, form) {
		form.setOptions('group_rows_by', morpheus.MetadataUtil
				.getMetadataNames(project.getFullDataset().getRowMetadata()));
		form
				.setOptions('group_columns_by', morpheus.MetadataUtil
						.getMetadataNames(project.getFullDataset()
								.getColumnMetadata()));
		form.setVisible('group_rows_by', false);
		form
				.setVisible('cluster_rows_in_space_of_selected_columns_only',
						false);
		form.$form.find('[name=cluster]').on(
				'change',
				function(e) {
					var val = $(this).val();
					var showGroupColumns = false;
					var showGroupRows = false;
					if (val === 'Columns') {
						showGroupColumns = true;
					} else if (val === 'Rows') {
						showGroupRows = true;
					} else {
						showGroupColumns = true;
						showGroupRows = true;
					}
					form.setVisible('group_columns_by', showGroupColumns);
					form.setVisible('group_rows_by', showGroupRows);
					form.setVisible(
							'cluster_columns_in_space_of_selected_rows_only',
							showGroupColumns);
					form.setVisible(
							'cluster_rows_in_space_of_selected_columns_only',
							showGroupRows);
				});
	},
	gui : function() {
		return [ {
			name : 'metric',
			options : morpheus.HClusterTool.Functions,
			value : morpheus.HClusterTool.Functions[3].toString(),
			type : 'select'
		}, {
			name : 'cluster',
			options : [ 'Columns', 'Rows', 'Rows and columns' ],
			value : 'Columns',
			type : 'select'
		}, {
			name : 'linkage_method',
			options : [ 'Average', 'Complete', 'Single' ],
			value : 'Average',
			type : 'select'
		}, {
			name : 'group_columns_by',
			options : [],
			type : 'bootstrap-select',
			multiple : true
		}, {
			name : 'group_rows_by',
			options : [],
			type : 'bootstrap-select',
			multiple : true
		}, {
			name : 'cluster_columns_in_space_of_selected_rows_only',
			type : 'checkbox'
		}, {
			name : 'cluster_rows_in_space_of_selected_columns_only',
			type : 'checkbox'
		} ];
	},
	execute : function(options) {

		var project = options.project;
		var controller = options.controller;
		var selectedRows = options.input.cluster_columns_in_space_of_selected_rows_only ? project
				.getRowSelectionModel().getViewIndices().values()
				: null;
		var selectedColumns = options.input.cluster_rows_in_space_of_selected_columns_only ? project
				.getColumnSelectionModel().getViewIndices().values()
				: null;
		var rows = options.input.cluster == 'Rows'
				|| options.input.cluster == 'Rows and columns';
		var columns = options.input.cluster == 'Columns'
				|| options.input.cluster == 'Rows and columns';
		options.input.selectedRows = selectedRows;
		options.input.selectedColumns = selectedColumns;
		var dataset = project.getSortedFilteredDataset();

		if (options.input.background === false) {
			var result = morpheus.HClusterTool.execute(dataset, options.input);
			if (result.rowsHcl) {
				controller.setDendrogram(result.rowsHcl.tree, false,
						result.rowsHcl.reorderedIndices);
			}
			if (result.columnsHcl) {
				controller.setDendrogram(result.columnsHcl.tree, true,
						result.columnsHcl.reorderedIndices);
			}
		} else {
			var subtitle = [ 'clustering ' ];
			if (rows) {
				subtitle.push(dataset.getRowCount() + ' row'
						+ morpheus.Util.s(dataset.getRowCount()));
			}
			if (columns) {
				subtitle.push(rows ? ', ' : '');
				subtitle.push(dataset.getColumnCount() + ' column'
						+ morpheus.Util.s(dataset.getColumnCount()));
			}

			var blob = new Blob(
					[ 'self.onmessage = function(e) {'
							+ 'importScripts(e.data.scripts);'
							+ 'self.postMessage(morpheus.HClusterTool.execute(morpheus.Dataset.fromJson(e.data.dataset), e.data.input));'
							+ '}' ]);

			var url = window.URL.createObjectURL(blob);
			var worker = new Worker(url);

			worker.postMessage({
				scripts : morpheus.Util.getScriptPath(),
				dataset : morpheus.Dataset.toJson(dataset, {
					columnFields : options.input.group_columns_by || [],
					rowFields : options.input.group_rows_by || []
				}),
				input : options.input
			});

			worker.onmessage = function(e) {
				var result = e.data;
				if (result.rowsHcl) {
					controller.setDendrogram(result.rowsHcl.tree, false,
							result.rowsHcl.reorderedIndices);
				}
				if (result.columnsHcl) {
					controller.setDendrogram(result.columnsHcl.tree, true,
							result.columnsHcl.reorderedIndices);
				}
				worker.terminate();
				window.URL.revokeObjectURL(url);
			};
			return worker;
		}

	}
};
morpheus.MarkerSelection = function() {

};

/**
 * @private
 */
morpheus.MarkerSelection.Functions = [ morpheus.FisherExact,
		morpheus.FoldChange, morpheus.SignalToNoise,
		morpheus.createSignalToNoiseAdjust(), morpheus.TTest ];

morpheus.MarkerSelection.Functions.fromString = function(s) {
	for (var i = 0; i < morpheus.MarkerSelection.Functions.length; i++) {
		if (morpheus.MarkerSelection.Functions[i].toString() === s) {
			return morpheus.MarkerSelection.Functions[i];
		}
	}
	throw s + ' not found';
};
morpheus.MarkerSelection.execute = function(dataset, input) {
	var aIndices = [];
	var bIndices = [];
	for (var i = 0; i < input.numClassA; i++) {
		aIndices[i] = i;
	}
	for (var i = input.numClassA; i < dataset.getColumnCount(); i++) {
		bIndices[i] = i;
	}

	var f = morpheus.MarkerSelection.Functions.fromString(input.metric);
	var permutations = new morpheus.PermutationPValues(dataset, aIndices,
			bIndices, input.npermutations, f);
	return {
		rowSpecificPValues : permutations.rowSpecificPValues,
		k : permutations.k,
		fdr : permutations.fdr,
		scores : permutations.scores
	};
};
morpheus.MarkerSelection.prototype = {
	toString : function() {
		return 'Marker Selection';
	},
	init : function(project, form) {
		var _this = this;
		var updateAB = function(fieldNames) {
			var ids = [];
			if (fieldNames != null) {
				var vectors = morpheus.MetadataUtil.getVectors(project
						.getFullDataset().getColumnMetadata(), fieldNames);
				var idToIndices = morpheus.VectorUtil
						.createValuesToIndicesMap(vectors);
				idToIndices.forEach(function(indices, id) {
					ids.push(id);
				});
			}
			ids.sort();
			form.setOptions('class_a', ids);
			form.setOptions('class_b', ids);

		};
		var $field = form.$form.find('[name=field]');
		$field.on('change', function(e) {
			updateAB($(this).val());
		});

		if ($field[0].options.length > 0) {
			$field.val($field[0].options[0].value);
		}
		updateAB($field.val());
		var $metric = form.$form.find('[name=metric]');
		$metric.on('change', function(e) {
			var isFishy = $(this).val() === 'Fisher Exact Test';
			form.setVisible('grouping_value', isFishy);
			form.setVisible('permutations', !isFishy);
			form.setVisible('number_of_markers', !isFishy);

		});
		form.setVisible('grouping_value', false);

	},
	gui : function(project) {
		var dataset = project.getSortedFilteredDataset();
		var fields = morpheus.MetadataUtil.getMetadataNames(dataset
				.getColumnMetadata());
		return [
			{
				name : 'metric',
				options : morpheus.MarkerSelection.Functions,
				value : morpheus.SignalToNoise.toString(),
				type : 'select',
				help : ''
			},
			{
				name : 'grouping_value',
				value : '1',
				help : 'Class values are categorized into two groups based on whether dataset values are greater than or equal to this value',
			},
			{
				name : 'field',
				options : fields,
				type : 'select',
				multiple : true
			},
			{
				name : 'class_a',
				title : 'Class A',
				options : [],
				value : '',
				type : 'checkbox-list',
				multiple : true
			},
			{
				name : 'class_b',
				title : 'Class B',
				options : [],
				value : '',
				type : 'checkbox-list',
				multiple : true
			},
			{
				name : 'number_of_markers',
				value : '100',
				type : 'text',
				help : 'The initial number of markers to show in each direction. Click <button title="Filter (Ctrl+L)" type="button" class="btn btn-default btn-xs dropdown-toggle"><span class="fa fa-filter"></span></button> to change.'
			}, {
				name : 'permutations',
				value : '0',
				type : 'text'
			} ];
	},
	execute : function(options) {

		var project = options.project;
		// classA and classB are arrays of identifiers if run via user
		// interface. If run via JSON, will be string arrays
		var classA = options.input.class_a;

		for (var i = 0; i < classA.length; i++) {
			var val = classA[i];
			if (!(val instanceof morpheus.Identifier)) {
				classA[i] = new morpheus.Identifier(
						morpheus.Util.isArray(val) ? val : [ val ]);
			}
		}
		var classB = options.input.class_b;
		for (var i = 0; i < classB.length; i++) {
			var val = classB[i];
			if (!(val instanceof morpheus.Identifier)) {
				classB[i] = new morpheus.Identifier(
						morpheus.Util.isArray(val) ? val : [ val ]);
			}
		}
		var npermutations = parseInt(options.input.permutations);
		var fieldNames = options.input.field;
		if (!morpheus.Util.isArray(fieldNames)) {
			fieldNames = [ fieldNames ];
		}
		var dataset = project.getSortedFilteredDataset();
		var vectors = morpheus.MetadataUtil.getVectors(dataset
				.getColumnMetadata(), fieldNames);

		var idToIndices = morpheus.VectorUtil.createValuesToIndicesMap(vectors);
		var f = morpheus.MarkerSelection.Functions
				.fromString(options.input.metric);

		var aIndices = [];
		var bIndices = [];
		classA.forEach(function(id) {
			var indices = idToIndices.get(id);
			if (indices === undefined) {
				throw new Error(id + ' not found in ' + idToIndices.keys());
			}
			aIndices = aIndices.concat(indices);
		});
		classB.forEach(function(id) {
			var indices = idToIndices.get(id);
			if (indices === undefined) {
				throw new Error(id + ' not found in ' + idToIndices.keys());
			}
			bIndices = bIndices.concat(indices);
		});

		if (aIndices.length === 0 && bIndices.length === 0) {
			throw 'No samples in class A and class B';
		}

		if (aIndices.length === 0) {
			throw 'No samples in class A';
		}
		if (bIndices.length === 0) {
			throw 'No samples in class B';
		}

		var classASet = {};
		for (var i = 0; i < aIndices.length; i++) {
			classASet[aIndices[i]] = true;
		}
		for (var i = 0; i < bIndices.length; i++) {
			if (classASet[bIndices[i]]) {
				throw 'The sample was found in class A and class B';
			}
		}
		var isFishy = f.toString() === morpheus.FisherExact.toString();
		if (aIndices.length === 1 || bIndices.length === 1
				&& !f instanceof morpheus.FisherExact) {
			f = morpheus.FoldChange;
		}
		var list1 = new morpheus.DatasetRowView(new morpheus.SlicedDatasetView(
				dataset, null, aIndices));
		var list2 = new morpheus.DatasetRowView(new morpheus.SlicedDatasetView(
				dataset, null, bIndices));
		// remove
		// other
		// marker
		// selection
		// fields
		var markerSelectionFields = morpheus.MarkerSelection.Functions.map(
				function(f) {
					return f.toString();
				}).concat([ 'odds_ratio', 'FDR(BH)', 'p_value' ]);
		markerSelectionFields.forEach(function(name) {
			var index = morpheus.MetadataUtil.indexOf(dataset.getRowMetadata(),
					name);
			if (index !== -1) {
				dataset.getRowMetadata().remove(index);
				options.controller.removeTrack(name, false);
			}
		});
		var v = dataset.getRowMetadata().add(f.toString());
		var vectors = [ v ];
		var comparisonVector = dataset.getColumnMetadata().add('Comparison');

		for (var i = 0; i < aIndices.length; i++) {
			comparisonVector.setValue(aIndices[i], 'A');
		}
		for (var i = 0; i < bIndices.length; i++) {
			comparisonVector.setValue(bIndices[i], 'B');
		}
		function done() {

			if (project.getRowFilter().getFilters().length > 0) {
				project.getRowFilter().setAnd(true, true);
			}
			var rowFilters = project.getRowFilter().getFilters();
			// remove existing top n filters
			for (var i = 0; i < rowFilters.length; i++) {
				if (rowFilters[i] instanceof morpheus.TopNFilter) {
					project.getRowFilter().remove(i, true);
					i--;
				}
			}
			if (!isFishy) {
				project.getRowFilter().add(
						new morpheus.TopNFilter(
								parseInt(options.input.number_of_markers),
								morpheus.TopNFilter.TOP_BOTTOM, vectors[0]
										.getName()), true);
			}

			project.setRowFilter(project.getRowFilter(), true);
			project.setRowSortKeys([ new morpheus.SortKey(vectors[0].getName(),
					isFishy ? morpheus.SortKey.SortOrder.ASCENDING
							: morpheus.SortKey.SortOrder.DESCENDING) ], true);
			project.setColumnSortKeys([ new morpheus.SortKey(comparisonVector
					.getName(), morpheus.SortKey.SortOrder.ASCENDING) ], true);
			project.trigger('trackChanged', {
				vectors : vectors,
				render : vectors.map(function() {
					return 'text';
				}),
				columns : false
			});
			project.trigger('trackChanged', {
				vectors : [ comparisonVector ],
				render : [ 'color' ],
				columns : true
			});
		}
		if (isFishy) {
			var groupingValue = parseFloat(options.input.grouping_value);
			var oddsRatioVector = dataset.getRowMetadata().add('odds_ratio');
			var fdrVector = dataset.getRowMetadata().add('FDR(BH)');
			var contingencyTableVector = dataset.getRowMetadata().add(
					'contingency_table');
			var pvalues = [];
			for (var i = 0, size = dataset.getRowCount(); i < size; i++) {
				var abcd = morpheus.createContingencyTable(list1.setIndex(i),
						list2.setIndex(i), groupingValue);
				contingencyTableVector.setValue(i, '[[' + abcd[0] + ', '
						+ abcd[1] + '], [' + abcd[2] + ', ' + abcd[3] + ']]');
				var ratio = (abcd[0] * abcd[3]) / (abcd[1] * abcd[2]);
				if (isNaN(ratio) || ratio === Number.POSITIVE_INFINITY) {
					ratio = 0;
				}
				oddsRatioVector.setValue(i, ratio);
				v.setValue(i, morpheus.FisherExact.fisherTest(abcd[0], abcd[1],
						abcd[2], abcd[3]));
				pvalues.push(v.getValue(i));
			}
			var fdr = morpheus.FDR_BH(pvalues);
			for (var i = 0, size = dataset.getRowCount(); i < size; i++) {
				fdrVector.setValue(i, fdr[i]);
			}
			vectors.push(oddsRatioVector);
			vectors.push(fdrVector);
			vectors.push(contingencyTableVector);
			done();
		} else {
			// background
			if (npermutations > 0) {
				options.input.numClassA = aIndices.length;
				options.input.npermutations = npermutations;
				var blob = new Blob(
						[ 'self.onmessage = function(e) {'
								+ 'importScripts(e.data.scripts);'
								+ 'self.postMessage(morpheus.MarkerSelection.execute(morpheus.Dataset.fromJson(e.data.dataset), e.data.input));'
								+ '}' ]);

				var url = window.URL.createObjectURL(blob);
				var worker = new Worker(url);
				var subset = new morpheus.SlicedDatasetView(dataset, null,
						aIndices.concat(bIndices));

				worker.postMessage({
					scripts : morpheus.Util.getScriptPath(),
					dataset : morpheus.Dataset.toJson(subset, {
						columnFields : [],
						rowFields : []
					}),
					input : options.input
				});

				worker.onmessage = function(e) {
					var result = e.data;
					var pvalueVector = dataset.getRowMetadata().add('p_value');
					var fdrVector = dataset.getRowMetadata().add('FDR(BH)');
					var kVector = dataset.getRowMetadata().add('k');

					for (var i = 0, size = pvalueVector.size(); i < size; i++) {
						pvalueVector.setValue(i, result.rowSpecificPValues[i]);
						fdrVector.setValue(i, result.fdr[i]);
						kVector.setValue(i, result.k[i]);
						v.setValue(i, result.scores[i]);
					}
					vectors.push(pvalueVector);
					vectors.push(fdrVector);
					vectors.push(kVector);
					done();
					worker.terminate();
					window.URL.revokeObjectURL(url);
				};
				return worker;
			} else {
				for (var i = 0, size = dataset.getRowCount(); i < size; i++) {
					v.setValue(i, f(list1.setIndex(i), list2.setIndex(i)));
				}
				done();
			}
		}

	}
};
morpheus.NearestNeighbors = function() {
};
morpheus.NearestNeighbors.Functions = [ morpheus.Cosine, morpheus.Euclidean,
		morpheus.Jaccard, morpheus.Pearson, morpheus.Spearman,
		morpheus.WeightedMean ];
morpheus.NearestNeighbors.Functions.fromString = function(s) {
	for (var i = 0; i < morpheus.NearestNeighbors.Functions.length; i++) {
		if (morpheus.NearestNeighbors.Functions[i].toString() === s) {
			return morpheus.NearestNeighbors.Functions[i];
		}
	}
	throw new Error(s + ' not found');
};
morpheus.NearestNeighbors.prototype = {
	toString : function() {
		return 'Nearest Neighbors';
	},
	init : function(project, form) {
		var $selectedOnly = form.$form.find('[name=use_selected_only]')
				.parent();
		form.$form
				.find('[name=compute_nearest_neighbors_of]')
				.on(
						'change',
						function(e) {
							var val = $(this).val();
							if (val === 'selected rows') {
								$($selectedOnly.contents()[1])
										.replaceWith(
												document
														.createTextNode(' Use selected columns only'));
							} else {
								$($selectedOnly.contents()[1])
										.replaceWith(
												document
														.createTextNode(' Use selected rows only'));
							}
						});
		$($selectedOnly.contents()[1]).replaceWith(
				document.createTextNode(' Use selected columns only'));
	},
	gui : function() {
		return [ {
			name : 'metric',
			options : morpheus.NearestNeighbors.Functions,
			value : morpheus.Pearson.toString(),
			type : 'select'
		}, {
			name : 'compute_nearest_neighbors_of',
			options : [ 'selected rows', 'selected columns' ],
			value : 'selected rows',
			type : 'radio'
		}, {
			name : 'use_selected_only',
			type : 'checkbox'
		} ];
	},
	execute : function(options) {
		var project = options.project;
		var isColumns = options.input.compute_nearest_neighbors_of == 'selected columns';
		var controller = options.controller;
		var f = morpheus.NearestNeighbors.Functions
				.fromString(options.input.metric);
		var dataset = project.getSortedFilteredDataset();
		if (isColumns) {
			dataset = morpheus.DatasetUtil.transposedView(dataset);
		}
		var selectedIndices = (isColumns ? project.getColumnSelectionModel()
				: project.getRowSelectionModel()).getViewIndices().values();
		if (selectedIndices.length === 0) {
			throw new Error('No ' + (isColumns ? 'columns' : 'rows')
					+ ' selected');
		}
		var spaceIndices = null;
		if (options.input.use_selected_only) {
			spaceIndices = (!isColumns ? project.getColumnSelectionModel()
					: project.getRowSelectionModel()).getViewIndices().values();
			dataset = morpheus.DatasetUtil.slicedView(dataset, null,
					spaceIndices);
		}
		var d1 = morpheus.DatasetUtil
				.slicedView(dataset, selectedIndices, null);
		var list1;
		if (d1.getRowCount() > 1) {
			// collapse each column in the dataset to a single value
			var columnView = new morpheus.DatasetColumnView(d1);
			var newDataset = new morpheus.Dataset({
				name : '',
				rows : 1,
				columns : d1.getColumnCount()
			});
			for (var j = 0, ncols = d1.getColumnCount(); j < ncols; j++) {
				var v = morpheus.Percentile(columnView.setIndex(j), 50);
				newDataset.setValue(0, j, v);
			}
			d1 = newDataset;
		}
		list1 = new morpheus.DatasetRowView(d1);
		var list2 = new morpheus.DatasetRowView(dataset);
		var values = [];
		var v = dataset.getRowMetadata().getByName(f.toString());
		if (v == null) {
			v = dataset.getRowMetadata().add(f.toString());
		}
		for (var i = 0, size = dataset.getRowCount(); i < size; i++) {
			v.setValue(i, f(list1, list2.setIndex(i)));
		}
		if (!isColumns) {
			project.setRowSortKeys([ new morpheus.SortKey(f.toString(),
					morpheus.SortKey.SortOrder.DESCENDING) ], true);
		} else {
			project.setColumnSortKeys([ new morpheus.SortKey(f.toString(),
					morpheus.SortKey.SortOrder.DESCENDING) ], true);
		}
		project.trigger('trackChanged', {
			vectors : [ v ],
			render : [ 'text' ],
			columns : isColumns
		});
	}
};
morpheus.NewHeatMapTool = function() {
};
morpheus.NewHeatMapTool.prototype = {
	toString : function() {
		return 'New Heat Map (' + morpheus.Util.COMMAND_KEY + 'X)';
	},
	// gui : function() {
	// return [ {
	// name : 'name',
	// type : 'text'
	// }, {
	// name : 'include_selected_rows',
	// type : 'checkbox',
	// value : true
	// }, {
	// name : 'include_selected_columns',
	// type : 'checkbox',
	// value : true
	// } ];
	// },
	execute : function(options) {
		var project = options.project;
		var controller = options.controller;
		var dataset = project.getSelectedDataset({
			selectedRows : true,
			selectedColumns : true
		});
		morpheus.DatasetUtil.shallowCopy(dataset);

		// TODO see if we can subset dendrograms
		// only handle contiguous selections for now
		// if (controller.columnDendrogram != null) {
		// var indices = project.getColumnSelectionModel().getViewIndices()
		// .toArray();
		// morpheus.AbstractDendrogram.leastCommonAncestor();
		// }
		// if (controller.rowDendrogram != null) {
		//
		// }
		var name = options.input.name || controller.getName();
		new morpheus.HeatMap({
			name : name,
			dataset : dataset,
			parent : controller

		});

	}
};
morpheus.OpenDatasetTool = function() {
	this.customUrls = [];
};

morpheus.OpenDatasetTool.fileExtensionPrompt = function(file, callback) {
	var ext = morpheus.Util.getExtension(morpheus.Util.getFileName(file));
	var deferred;
	if (ext === 'maf') {
		this._promptMaf(function(mafGeneFilter) {
			callback(mafGeneFilter);
		});
	} else if (ext === 'seg' || ext === 'segtab') {
		this._promptSegtab(function(regions) {
			callback(regions);
		});

	} else {
		callback(null);
	}

};
morpheus.OpenDatasetTool._promptMaf = function(promptCallback) {
	var formBuilder = new morpheus.FormBuilder();
	formBuilder
			.append({
				name : 'MAF_gene_symbols',
				value : '',
				type : 'textarea',
				required : true,
				help : 'Enter one gene symbol per line to filter genes. Leave blank to show all genes.'
			});
	morpheus.FormBuilder
			.showInModal({
				title : 'Gene Symbols',
				html : formBuilder.$form,
				close : 'OK',
				callback : function() {
					var text = formBuilder.getValue('MAF_gene_symbols');
					var lines = morpheus.Util.splitOnNewLine(text);
					var mafGeneFilter = new morpheus.Map();
					for (var i = 0, nlines = lines.length, counter = 0; i < nlines; i++) {
						var line = lines[i];
						if (line !== '') {
							mafGeneFilter.set(line, counter++);
						}
					}
					var readOptions = mafGeneFilter.size() > 0 ? {
						mafGeneFilter : mafGeneFilter
					} : null;
					promptCallback(readOptions);
				}
			});
};
morpheus.OpenDatasetTool._promptSegtab = function(promptCallback) {
	var formBuilder = new morpheus.FormBuilder();
	formBuilder
			.append({
				name : 'regions',
				value : '',
				type : 'textarea',
				required : true,
				help : 'Define the regions over which you want to define the CNAs. Enter one region per line. Each line should contain region_id, chromosome, start, and end separated by a tab. Leave blank to use all unique segments in the segtab file as regions.'
			});
	morpheus.FormBuilder
			.showInModal({
				title : 'Regions',
				html : formBuilder.$form,
				close : 'OK',
				callback : function() {
					var text = formBuilder.getValue('regions');
					var lines = morpheus.Util.splitOnNewLine(text);
					var regions = [];
					var tab = /\t/;
					for (var i = 0, nlines = lines.length, counter = 0; i < nlines; i++) {
						var line = lines[i];

						if (line !== '') {
							var tokens = line.split(tab);
							if (tokens.length >= 4) {
								regions.push({
									id : tokens[0],
									chromosome : tokens[1],
									start : parseInt(tokens[2]),
									end : parseInt(tokens[3])
								});
							}
						}
					}
					var readOptions = regions.length > 0 ? {
						regions : regions
					} : null;
					promptCallback(readOptions);
				}
			});
};
morpheus.OpenDatasetTool.prototype = {
	toString : function() {
		return 'Open Dataset';
	},
	_read : function(options, deferred) {
		var _this = this;
		var project = options.project;
		var controller = options.controller;
		var file = options.input.file;
		var action = options.input.open_file_action;
		var dataset = project.getSortedFilteredDataset();
		deferred.fail(function(err) {
			var message = [ 'Error opening ' + morpheus.Util.getFileName(file)
					+ '.' ];
			if (err.message) {
				message.push('<br />Cause: ');
				message.push(err.message);
			}
			morpheus.FormBuilder.showInModal({
				title : 'Error',
				html : message.join('')
			});
		});
		deferred
				.done(function(newDataset) {

					var extension = morpheus.Util.getExtension(morpheus.Util
							.getFileName(file));
					var filename = morpheus.Util.getBaseFileName(morpheus.Util
							.getFileName(file));
					if (action === 'append' || action === 'append columns') {

						// "append": append rows to current dataset
						var appendRows = action === 'append';
						// rename fields?
						_.each(controller.options.rows, function(item) {
							if (item.renameTo) {
								var v = newDataset.getRowMetadata().getByName(
										item.field);
								if (v) {
									v.setName(item.renameTo);
								}
							}
						});
						_.each(controller.options.columns, function(item) {
							if (item.renameTo) {
								var v = newDataset.getColumnMetadata()
										.getByName(item.field);
								if (v) {
									v.setName(item.renameTo);
								}
							}
						});

						if (controller.options.datasetReady) {
							controller.options.datasetReady(newDataset);
						}
						var currentDatasetMetadataNames = morpheus.MetadataUtil
								.getMetadataNames(!appendRows ? dataset
										.getRowMetadata() : dataset
										.getColumnMetadata());
						var newDatasetMetadataNames = morpheus.MetadataUtil
								.getMetadataNames(!appendRows ? newDataset
										.getRowMetadata() : newDataset
										.getColumnMetadata());

						if (currentDatasetMetadataNames.length > 1
								|| newDatasetMetadataNames.length > 1) {

							_this
									._matchAppend(
											newDatasetMetadataNames,
											currentDatasetMetadataNames,
											controller,
											function(appendOptions) {
												controller
														.getProject()
														.setFullDataset(
																appendRows ? new morpheus.JoinedDataset(
																		dataset,
																		newDataset,
																		appendOptions.current_dataset_annotation_name,
																		appendOptions.new_dataset_annotation_name)
																		: new morpheus.TransposedDatasetView(
																				new morpheus.JoinedDataset(
																						new morpheus.TransposedDatasetView(
																								dataset),
																						new morpheus.TransposedDatasetView(
																								newDataset),
																						appendOptions.current_dataset_annotation_name,
																						appendOptions.new_dataset_annotation_name)),
																true);

												if (controller.options.renderReady) {
													controller.options
															.renderReady(controller);
													controller.updateDataset();
												}
												if (appendRows) {
													controller
															.getHeatMapElementComponent()
															.getColorScheme()
															.setSeparateColorSchemeForRowMetadataField(
																	'Source');

													var sourcesSet = morpheus.VectorUtil
															.getSet(controller
																	.getProject()
																	.getFullDataset()
																	.getRowMetadata()
																	.getByName(
																			'Source'));
													sourcesSet
															.forEach(function(
																	source) {
																controller
																		.autoDisplay({
																			extension : morpheus.Util
																					.getExtension(source),
																			filename : source
																		});
															});
												}

												controller.tabManager
														.setTabTitle(
																controller.tabId,
																controller
																		.getProject()
																		.getFullDataset()
																		.getRowCount()
																		+ ' row'
																		+ morpheus.Util
																				.s(controller
																						.getProject()
																						.getFullDataset()
																						.getRowCount())
																		+ ' x '
																		+ controller
																				.getProject()
																				.getFullDataset()
																				.getColumnCount()
																		+ ' column'
																		+ morpheus.Util
																				.s(controller
																						.getProject()
																						.getFullDataset()
																						.getColumnCount()));
												controller.revalidate();
											});
						} else { // no need to prompt
							controller
									.getProject()
									.setFullDataset(
											appendRows ? new morpheus.JoinedDataset(
													dataset,
													newDataset,
													currentDatasetMetadataNames[0],
													newDatasetMetadataNames[0])
													: new morpheus.TransposedDatasetView(
															new morpheus.JoinedDataset(
																	new morpheus.TransposedDatasetView(
																			dataset),
																	new morpheus.TransposedDatasetView(
																			newDataset),
																	currentDatasetMetadataNames[0],
																	newDatasetMetadataNames[0])),
											true);
							if (controller.options.renderReady) {
								controller.options.renderReady(controller);
								controller.updateDataset();
							}
							if (appendRows) {
								controller
										.getHeatMapElementComponent()
										.getColorScheme()
										.setSeparateColorSchemeForRowMetadataField(
												'Source');
								var sourcesSet = morpheus.VectorUtil
										.getSet(controller.getProject()
												.getFullDataset()
												.getRowMetadata().getByName(
														'Source'));
								sourcesSet.forEach(function(source) {
									controller.autoDisplay({
										extension : morpheus.Util
												.getExtension(source),
										filename : source
									});
								});
							}
							controller.tabManager.setTabTitle(controller.tabId,
									controller.getProject().getFullDataset()
											.getRowCount()
											+ ' row'
											+ morpheus.Util.s(controller
													.getProject()
													.getFullDataset()
													.getRowCount())
											+ ' x '
											+ controller.getProject()
													.getFullDataset()
													.getColumnCount()
											+ ' column'
											+ morpheus.Util.s(controller
													.getProject()
													.getFullDataset()
													.getColumnCount()));
							controller.revalidate();
						}

					} else if (action === 'overlay') {

						_this
								._matchOverlay(
										morpheus.MetadataUtil
												.getMetadataNames(newDataset
														.getColumnMetadata()),
										morpheus.MetadataUtil
												.getMetadataNames(dataset
														.getColumnMetadata()),
										morpheus.MetadataUtil
												.getMetadataNames(newDataset
														.getRowMetadata()),
										morpheus.MetadataUtil
												.getMetadataNames(dataset
														.getRowMetadata()),
										controller,
										function(appendOptions) {
											var rowValueToIndexMap = morpheus.VectorUtil
													.createValueToIndexMap(dataset
															.getRowMetadata()
															.getByName(
																	appendOptions.current_dataset_row_annotation_name));
											var columnValueToIndexMap = morpheus.VectorUtil
													.createValueToIndexMap(dataset
															.getColumnMetadata()
															.getByName(
																	appendOptions.current_dataset_column_annotation_name));
											var seriesIndex = dataset
													.addSeries({
														name : newDataset
																.getName(),
														dataType : 'object'
													});

											var rowVector = newDataset
													.getRowMetadata()
													.getByName(
															appendOptions.new_dataset_row_annotation_name);
											var rowIndices = [];
											var newDatasetRowIndicesSubset = [];
											for (var i = 0, size = rowVector
													.size(); i < size; i++) {
												var index = rowValueToIndexMap
														.get(rowVector
																.getValue(i));
												if (index !== undefined) {
													rowIndices.push(index);
													newDatasetRowIndicesSubset
															.push(i);
												}
											}

											var columnVector = newDataset
													.getColumnMetadata()
													.getByName(
															appendOptions.new_dataset_column_annotation_name);
											var columnIndices = [];
											var newDatasetColumnIndicesSubset = [];
											for (var i = 0, size = columnVector
													.size(); i < size; i++) {
												var index = columnValueToIndexMap
														.get(columnVector
																.getValue(i));
												if (index !== undefined) {
													columnIndices.push(index);
													newDatasetColumnIndicesSubset
															.push(i);
												}
											}
											newDataset = new morpheus.SlicedDatasetView(
													newDataset,
													newDatasetRowIndicesSubset,
													newDatasetColumnIndicesSubset);
											for (var i = 0, nrows = newDataset
													.getRowCount(); i < nrows; i++) {
												for (var j = 0, ncols = newDataset
														.getColumnCount(); j < ncols; j++) {
													dataset.setValue(
															rowIndices[i],
															columnIndices[j],
															newDataset
																	.getValue(
																			i,
																			j),
															seriesIndex);

												}
											}

										});
					} else if (action === 'open') { // new tab
						new morpheus.HeatMap({
							dataset : newDataset,
							parent : controller,
							inheritFromParent : false
						});

					} else {
						console.log('Unknown action: ' + action);
					}

					controller.revalidate();
				});
	},
	execute : function(options) {
		var file = options.input.file;
		var _this = this;
		morpheus.OpenDatasetTool
				.fileExtensionPrompt(file,
						function(readOptions) {
							var deferred = morpheus.DatasetUtil.read(file,
									readOptions);
							_this._read(options, deferred);
						});

	}, // prompt for metadata field name in dataset and in file
	_matchAppend : function(newDatasetMetadataNames,
			currentDatasetMetadataNames, controller, callback) {
		var tool = {};
		tool.execute = function(options) {
			return options.input;
		};
		tool.toString = function() {
			return 'Select Fields';
		};
		tool.gui = function() {
			var items = [ {
				name : 'current_dataset_annotation_name',
				options : currentDatasetMetadataNames,
				type : 'select',
				required : true
			} ];
			items.push({
				name : 'new_dataset_annotation_name',
				type : 'select',
				options : newDatasetMetadataNames,
				required : true
			});
			return items;
		};
		morpheus.HeatMap.showTool(tool, controller, callback);
	},
	_matchOverlay : function(newDatasetColumnMetadataNames,
			currentDatasetColumnMetadataNames, newDatasetRowMetadataNames,
			currentDatasetRowMetadataNames, controller, callback) {
		var tool = {};
		tool.execute = function(options) {
			return options.input;
		};
		tool.toString = function() {
			return 'Select Fields';
		};
		tool.gui = function() {
			var items = [];
			items.push({
				name : 'current_dataset_column_annotation_name',
				options : currentDatasetColumnMetadataNames,
				type : 'select',
				required : true
			});
			items.push({
				name : 'new_dataset_column_annotation_name',
				type : 'select',
				options : newDatasetColumnMetadataNames,
				required : true
			});
			items.push({
				name : 'current_dataset_row_annotation_name',
				options : currentDatasetRowMetadataNames,
				type : 'select',
				required : true
			});
			items.push({
				name : 'new_dataset_row_annotation_name',
				type : 'select',
				options : newDatasetRowMetadataNames,
				required : true
			});
			return items;
		};
		morpheus.HeatMap.showTool(tool, controller, callback);
	}
};
morpheus.OpenDendrogramTool = function(file) {
	this._file = file;
};
morpheus.OpenDendrogramTool.prototype = {
	toString : function() {
		return 'Open Dendrogram';
	},
	init : function(project, form) {
		var setValue = function(val) {
			var isRows = val === 'Rows';
			var names = morpheus.MetadataUtil.getMetadataNames(isRows ? project
					.getFullDataset().getRowMetadata() : project
					.getFullDataset().getColumnMetadata());
			names.unshift('Newick file does not contain node ids');
			form.setOptions('match_node_id_to', names);
		};
		form.$form.find('[name=orientation]').on('change', function(e) {
			setValue($(this).val());
		});
		setValue('Columns');
	},
	gui : function() {
		return [ {
			name : 'orientation',
			options : [ 'Columns', 'Rows' ],
			value : 'Columns',
			type : 'radio'
		}, {
			name : 'match_node_id_to',
			options : [],
			type : 'select'
		} ];
	},
	execute : function(options) {
		var fileOrUrl = this._file;
		var isColumns = options.input.orientation === 'Columns';
		var dendrogramField = options.input.match_node_id_to;
		if (dendrogramField === 'Newick file does not contain node ids') {
			dendrogramField = null;
		}
		// prompt for annotation in dataset to match node ids on
		var controller = options.controller;
		var dendrogramDeferred = morpheus.Util.getText(fileOrUrl);
		dendrogramDeferred
				.done(function(text) {
					var dataset = options.project.getSortedFilteredDataset();
					if (isColumns) {
						dataset = morpheus.DatasetUtil.transposedView(dataset);
					}
					var tree = morpheus.AbstractDendrogram.parseNewick(text);
					if (tree.leafNodes.length !== dataset.getRowCount()) {
						throw new Error('# leaf nodes in dendrogram '
								+ tree.leafNodes.length + ' != '
								+ dataset.getRowCount());
					}
					var indices = [];
					if (dendrogramField != null) {
						var vector = dataset.getRowMetadata().getByName(
								dendrogramField);
						var valueToIndex = morpheus.VectorUtil
								.createValueToIndexMap(vector);
						for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
							var index = valueToIndex
									.get(tree.leafNodes[i].name);
							if (index === undefined) {
								throw new Error('Unable to find dendrogram id '
										+ tree.leafNodes[i].name
										+ ' in annotations');
							}
							indices.push(index);
						}
					} else {
						for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
							indices.push(i);
						}
					}
					controller.setDendrogram(tree, isColumns, indices);
				});
	}
};
morpheus.OpenFileTool = function(options) {
	this.options = options || {};
};
morpheus.OpenFileTool.prototype = {
	toString : function() {
		return 'Open File';
	},
	gui : function() {
		var array = [ {
			name : 'open_file_action',
			value : 'open',
			type : 'bootstrap-select',
			options : [ {
				name : 'Annotate columns',
				value : 'Annotate Columns'
			}, {
				name : 'Annotate rows',
				value : 'Annotate Rows'
			}, {
				divider : true
			}, {
				name : 'Append rows to current dataset',
				value : 'append'
			}, {
				name : 'Append columns to current dataset',
				value : 'append columns'
			}, {
				name : 'Overlay onto current dataset',
				value : 'overlay'
			}, {
				name : 'Open dataset in new tab',
				value : 'open'
			}, {
				divider : true
			}, {
				name : 'Open dendrogram',
				value : 'Open dendrogram'
			} ]
		} ];
		if (this.options.file == null) {
			array.push({
				name : 'file',
				showLabel : false,
				placeholder : 'Open your own file',
				value : '',
				type : 'file',
				required : true,
				help : morpheus.DatasetUtil.DATASET_FILE_FORMATS
			});
		}
		array.options = {
			ok : this.options.file != null,
			size : 'modal-lg'
		};
		return array;
	},
	init : function(project, form, initOptions) {
		form.$form.find('[name=open_file_action]').on(
				'change',
				function(e) {
					var action = $(this).val();
					if (action === 'append columns' || action === 'append'
							|| action === 'open' || action === 'overlay') {
						form.setHelpText('file',
								morpheus.DatasetUtil.DATASET_FILE_FORMATS);
					} else if (action === 'Open dendrogram') {
						form.setHelpText('file',
								morpheus.DatasetUtil.DENDROGRAM_FILE_FORMATS);
					} else {
						form.setHelpText('file',
								morpheus.DatasetUtil.ANNOTATION_FILE_FORMATS);
					}
				});
		if (this.options.file == null) {
			$('<h4>Use your own file</h4>').insertAfter(
					form.$form.find('.form-group:first'));
			var _this = this;
			var id = _.uniqueId('morpheus');
			form.$form
					.append('<h4><a role="button" data-toggle="collapse" href="#'
							+ id
							+ '" aria-expanded="false" aria-controls="'
							+ id + '">Or select a preloaded dataset</a></h4>');
			var $sampleDatasets = $('<div class="collapse" id="' + id
					+ '" style="overflow:auto;"></div>');
			form.$form.append($sampleDatasets);
			var sampleDatasets = new morpheus.SampleDatasets({
				$el : $sampleDatasets,
				callback : function(heatMapOptions) {
					form.setValue('file', heatMapOptions.dataset);
					_this.ok();

				}
			});
		}
		form.on('change', function(e) {
			var value = e.value;
			if (value !== '' && value != null) {
				form.setValue('file', value);
				_this.ok();
			}
		});

	},

	execute : function(options) {
		var that = this;
		if (this.options.file) {
			options.input.file = this.options.file;
		}

		var project = options.project;
		if (options.input.open_file_action === 'append columns'
				|| options.input.open_file_action === 'append'
				|| options.input.open_file_action === 'open'
				|| options.input.open_file_action === 'overlay') {
			new morpheus.OpenDatasetTool().execute(options);
		} else if (options.input.open_file_action === 'Open dendrogram') {
			morpheus.HeatMap.showTool(new morpheus.OpenDendrogramTool(
					options.input.file), options.controller);
		} else { // annotate rows or columns
			var controller = options.controller;
			var isAnnotateColumns = options.input.open_file_action == 'Annotate Columns';
			var fileOrUrl = options.input.file;
			var dataset = project.getFullDataset();
			var fileName = morpheus.Util.getFileName(fileOrUrl);
			if (morpheus.Util.endsWith(fileName, '.cls')) {
				var result = morpheus.Util.readLines(fileOrUrl);
				result.done(function(lines) {
					that.annotateCls(controller, dataset, fileName,
							isAnnotateColumns, lines);
				});
			} else if (morpheus.Util.endsWith(fileName, '.gmt')) {
				morpheus.BufferedReader.getArrayBuffer(fileOrUrl, function(err,
						buf) {
					if (err) {
						throw new Error('Unable to read ' + fileOrUrl);
					}
					var sets = new morpheus.GmtReader()
							.read(new morpheus.BufferedReader(new Uint8Array(
									buf)));
					that.prompt(null, dataset, controller, isAnnotateColumns,
							sets);
				});

			} else {
				var result = morpheus.Util.readLines(fileOrUrl);
				result.done(function(lines) {
					that.prompt(lines, dataset, controller, isAnnotateColumns,
							null);
				});

			}

		}
	},
	annotateCls : function(controller, dataset, fileName, isColumns, lines) {
		if (isColumns) {
			dataset = morpheus.DatasetUtil.transposedView(dataset);
		}
		var assignments = new morpheus.ClsReader().read(lines);
		if (assignments.length !== dataset.getRowCount()) {
			throw new Error(
					'Number of samples in cls file does not match dataset.');
		}
		var vector = dataset.getRowMetadata().add(
				morpheus.Util.getBaseFileName(fileName));
		for (var i = 0; i < assignments.length; i++) {
			vector.setValue(i, assignments[i]);
		}
		if (controller) {
			controller.getProject().trigger('trackChanged', {
				vectors : [ vector ],
				render : [ 'color' ],
				columns : isColumns
			});
		}
	},
	/**
	 * 
	 * @param lines
	 *            Lines of text in annotation file or null if a gmt file
	 * @param dataset
	 *            Current dataset
	 * @param isColumns
	 *            Whether annotating columns
	 * @param sets
	 *            Sets if a gmt file or null
	 * @param metadataName
	 *            The dataset metadata name to match on
	 * @param fileColumnName
	 *            The metadata file name to match on
	 * @param fileColumnNamesToInclude
	 *            An array of column names to include from the metadata file or
	 *            null to include all
	 */
	annotate : function(lines, dataset, isColumns, sets, metadataName,
			fileColumnName, fileColumnNamesToInclude) {
		if (isColumns) {
			dataset = morpheus.DatasetUtil.transposedView(dataset);
		}
		var vector = dataset.getRowMetadata().getByName(metadataName);
		if (!vector) {
			throw new Error('vector ' + metadataName + ' not found.');
		}
		var vectors = [];
		var idToIndices = morpheus.VectorUtil.createValueToIndicesMap(vector);
		if (!lines) {
			_
					.each(
							sets,
							function(set) {
								var name = set.name;
								var members = set.ids;
								// var v = dataset.getRowMetadata()
								// .getByName(name);
								// overwrite existing values
								// if (!v) {
								var v = dataset.getRowMetadata().add(name);
								// }
								vectors.push(v);
								_
										.each(
												members,
												function(id) {
													var indices = idToIndices
															.get(id);
													if (indices !== undefined) {
														for (var i = 0, nIndices = indices.length; i < nIndices; i++) {
															v.setValue(
																	indices[i],
																	name);
														}
													}
												});
							});
		} else {
			var tab = /\t/;
			var header = lines[0].split(tab);
			var fileMatchOnColumnIndex = _.indexOf(header, fileColumnName);
			if (fileMatchOnColumnIndex === -1) {
				throw new Error(fileColumnName + ' not found in header:'
						+ header);
			}
			var columnIndices = [];
			var nheaders = header.length;
			for (var j = 0; j < header.length; j++) {
				var name = header[j];
				if (j === fileMatchOnColumnIndex) {
					continue;
				}
				if (fileColumnNamesToInclude
						&& _.indexOf(fileColumnNamesToInclude, name) === -1) {
					continue;
				}
				var v = dataset.getRowMetadata().getByName(name);
				if (!v) {
					v = dataset.getRowMetadata().add(name);
				}
				columnIndices.push(j);
				vectors.push(v);
			}
			var nheaders = columnIndices.length;
			for (var i = 1, nrows = lines.length; i < nrows; i++) {
				var line = lines[i].split(tab);
				var id = line[fileMatchOnColumnIndex];
				var indices = idToIndices.get(id);
				if (indices !== undefined) {
					var nIndices = indices.length;
					for (var j = 0; j < nheaders; j++) {
						var token = line[columnIndices[j]];
						var v = vectors[j];
						for (var r = 0; r < nIndices; r++) {
							v.setValue(indices[r], token);
						}
					}
				}
			}
		}
		for (var i = 0; i < vectors.length; i++) {
			morpheus.VectorUtil.maybeConvertStringToNumber(vectors[i]);
		}
		return vectors;
	},
	// prompt for metadata field name in dataset and in file
	prompt : function(lines, dataset, controller, isColumns, sets) {
		var promptTool = {};
		var _this = this;
		var header = lines != null ? lines[0].split('\t') : null;
		promptTool.execute = function(options) {
			var metadataName = options.input.dataset_field_name;
			var fileColumnName = options.input.file_field_name;
			var vectors = _this.annotate(lines, dataset, isColumns, sets,
					metadataName, fileColumnName);
			var render = [];
			for (var i = 0; i < vectors.length; i++) {
				render.push('text');
			}
			controller.getProject().trigger('trackChanged', {
				vectors : vectors,
				render : render,
				columns : isColumns
			});
		};
		promptTool.toString = function() {
			return 'Select Fields To Match On';
		};
		promptTool.gui = function() {
			var items = [ {
				name : 'dataset_field_name',
				options : morpheus.MetadataUtil
						.getMetadataNames(isColumns ? dataset
								.getColumnMetadata() : dataset.getRowMetadata()),
				type : 'select',
				required : true
			} ];
			if (lines) {
				items.push({
					name : 'file_field_name',
					type : 'select',
					options : _.map(header, function(item) {
						return {
							name : item,
							value : item
						};
					}),
					required : true
				});
			}
			return items;
		};
		morpheus.HeatMap.showTool(promptTool, controller);
	}
};

morpheus.PcaPlotTool = function (chartOptions) {
    var _this = this;
    this.project = chartOptions.project;
    var project = this.project;


    this.$el = $('<div class="container-fluid">'
        + '<div class="row">'
        + '<div data-name="configPane" class="col-xs-2"></div>'
        + '<div class="col-xs-10"><div style="position:relative;" data-name="chartDiv"></div></div>'
        + '<div class=""'
        + '</div></div>');

    var formBuilder = new morpheus.FormBuilder({
        vertical: true
    });
    this.formBuilder = formBuilder;
    var rowOptions = [];
    var columnOptions = [];
    var numericRowOptions = [];
    var numericColumnOptions = [];
    var options = [];
    var numericOptions = [];
    var pcaOptions = [];
    var updateOptions = function () {
        var dataset = project.getFullDataset();
        rowOptions = [{
            name: '(None)',
            value: ""
        }];
        columnOptions = [{
            name: '(None)',
            value: ""
        }];
        numericRowOptions = [{
            name: '(None)',
            value: ""
        }];
        numericColumnOptions = [{
            name: '(None)',
            value: ""
        }];
        options = [{
            name: '(None)',
            value: ""
        }];
        numericOptions = [{
            name: '(None)',
            value: ""
        }];
        pcaOptions = [];

        for (var i = 1; i <= _this.project.getSelectedDataset().getColumnCount(); i++) {
            pcaOptions.push({
                name :  "PC" + String(i),
                value : i
            });
        }


        morpheus.MetadataUtil.getMetadataNames(dataset.getRowMetadata())
            .forEach(
                function (name) {
                    var dataType = morpheus.VectorUtil
                        .getDataType(dataset.getRowMetadata()
                            .getByName(name));
                    if (dataType === 'number'
                        || dataType === '[number]') {
                        numericRowOptions.push({
                            name: name + ' (row)',
                            value: name
                        });
                    }
                    rowOptions.push({
                        name: name + ' (row)',
                        value: name
                    });
                });

        morpheus.MetadataUtil.getMetadataNames(dataset.getColumnMetadata())
            .forEach(
                function (name) {
                    var dataType = morpheus.VectorUtil
                        .getDataType(dataset.getColumnMetadata()
                            .getByName(name));
                    if (dataType === 'number'
                        || dataType === '[number]') {
                        numericColumnOptions.push({
                            name: name + ' (column)',
                            value: name
                        });
                    }
                    columnOptions.push({
                        name: name + ' (column)',
                        value: name
                    });
                });


        options = options.concat(rowOptions.slice(1));
        options = options.concat(columnOptions.slice(1));

        numericOptions = numericOptions.concat(numericRowOptions.slice(1));
        numericOptions = numericOptions.concat(numericColumnOptions.slice(1));
    };

    updateOptions();


    formBuilder.append({
        name: 'size',
        type: 'bootstrap-select',
        options: numericOptions
    });
    formBuilder.append({
        name: 'color',
        type: 'bootstrap-select',
        options: options
    });
    formBuilder.append({
        name: 'x-axis',
        type: 'bootstrap-select',
        options: pcaOptions
    });
    formBuilder.append({
        name: 'y-axis',
        type: 'bootstrap-select',
        options: pcaOptions
    });
    formBuilder.append({
        name: 'label',
        type: 'bootstrap-select',
        options: columnOptions
    });

    formBuilder.append({
        name: 'draw',
        type: 'button'
    });




    function setVisibility() {
        formBuilder.setOptions('color', options, true);
        formBuilder.setOptions('size', numericOptions, true);
        formBuilder.setOptions('label', columnOptions, true);
    }

    this.tooltip = [];
    formBuilder.$form.find('select').on('change', function (e) {
        setVisibility();

    });
    /*formBuilder.$form.find('input').on('click', function () {
        _this.draw();
    });*/
    setVisibility();

    /*var draw = function () {
        _.debounce(_this.draw(), 100);
    };*/
    var trackChanged = function () {
        console.log("track changed");
        updateOptions();
        setVisibility();
        formBuilder.setOptions('x-axis', pcaOptions, true);
        formBuilder.setOptions('y-axis', pcaOptions, true);
    };

    project.getColumnSelectionModel().on('selectionChanged.chart', trackChanged);
    project.getRowSelectionModel().on('selectionChanged.chart', trackChanged);
    project.on('trackChanged.chart', trackChanged);
    this.$chart = this.$el.find('[data-name=chartDiv]');
    var $dialog = $('<div style="background:white;" title="Chart"></div>');
    var $configPane = this.$el.find('[data-name=configPane]');
    formBuilder.$form.appendTo($configPane);
    this.$el.appendTo($dialog);
    $dialog.dialog({
        close: function (event, ui) {
            project.off('trackChanged.chart', trackChanged);
            project.getRowSelectionModel().off('selectionChanged.chart', trackChanged);
            project.getColumnSelectionModel().off('selectionChanged.chart', trackChanged);
            _this.$el.empty();
        },

        resizable: true,
        height: 600,
        width: 900
    });
    this.$dialog = $dialog;

    this.draw();
};

morpheus.PcaPlotTool.getVectorInfo = function (value) {
    var field = value.substring(0, value.length - 2);
    var isColumns = value.substring(value.length - 2) === '_c';
    return {
        field: field,
        isColumns: isColumns
    };
};
morpheus.PcaPlotTool.prototype = {
    annotate: function (options) {
        var _this = this;
        var formBuilder = new morpheus.FormBuilder();
        formBuilder.append({
            name: 'annotation_name',
            type: 'text',
            required: true
        });
        formBuilder.append({
            name: 'annotation_value',
            type: 'text',
            required: true
        });
        morpheus.FormBuilder
            .showOkCancel({
                title: 'Annotate Selection',
                content: formBuilder.$form,
                okCallback: function () {
                    var dataset = options.dataset;
                    var eventData = options.eventData;
                    var array = options.array;
                    var value = formBuilder.getValue('annotation_value');
                    var annotationName = formBuilder
                        .getValue('annotation_name');
                    // var annotate = formBuilder.getValue('annotate');
                    var isRows = true;
                    var isColumns = true;
                    var existingRowVector = null;
                    var rowVector = null;
                    if (isRows) {
                        existingRowVector = dataset.getRowMetadata()
                            .getByName(annotationName);
                        rowVector = dataset.getRowMetadata().add(
                            annotationName);
                    }
                    var existingColumnVector = null;
                    var columnVector = null;
                    if (isColumns) {
                        existingColumnVector = dataset.getColumnMetadata()
                            .getByName(annotationName);
                        columnVector = dataset.getColumnMetadata().add(
                            annotationName);
                    }

                    for (var p = 0, nselected = eventData.points.length; p < nselected; p++) {
                        var item = array[eventData.points[p].pointNumber];
                        if (isRows) {
                            if (_.isArray(item.row)) {
                                item.row.forEach(function (r) {
                                    rowVector.setValue(r, value);
                                });

                            } else {
                                rowVector.setValue(item.row, value);
                            }

                        }
                        if (isColumns) {
                            columnVector.setValue(item.column, value);
                        }
                    }
                    if (isRows) {
                        morpheus.VectorUtil
                            .maybeConvertStringToNumber(rowVector);
                        _this.project.trigger('trackChanged', {
                            vectors: [rowVector],
                            render: existingRowVector != null ? []
                                : [morpheus.VectorTrack.RENDER.TEXT],
                            columns: false
                        });
                    }
                    if (isColumns) {
                        morpheus.VectorUtil
                            .maybeConvertStringToNumber(columnVector);
                        _this.project.trigger('trackChanged', {
                            vectors: [columnVector],
                            render: existingColumnVector != null ? []
                                : [morpheus.VectorTrack.RENDER.TEXT],
                            columns: true
                        });
                    }
                }
            });

    },
    draw: function () {
        var _this = this;
        var plotlyDefaults = morpheus.ChartTool.getPlotlyDefaults();
        var layout = plotlyDefaults.layout;
        var config = plotlyDefaults.config;
        var chartWidth = 400;
        var chartHeight = 400;


        var project = this.project;

        if (_this.project.getFullDataset().getESSession()) {
            _this.formBuilder.setEnabled('draw', true);
        }

        this.formBuilder.$form.find('[name="draw"]').on('click', function () {
            _this.$chart.empty();
            var colorBy = _this.formBuilder.getValue('color');
            var sizeBy = _this.formBuilder.getValue('size');
            var pc1 = _this.formBuilder.getValue('x-axis');
            var pc2 = _this.formBuilder.getValue('y-axis');
            var label = _this.formBuilder.getValue('label');

            console.log('draw plot button clicked');
            var dataset = _this.project.getSelectedDataset({
                emptyToAll : false
            });
            _this.dataset = dataset;
            var expressionSet = project.getFullDataset().getESSession();

            var columnIndices = dataset.columnIndices;
            var rowIndices = dataset.rowIndices;
            console.log(dataset);
            console.log(columnIndices);
            console.log(rowIndices);

            console.log(colorBy, sizeBy, pc1, pc2, label);
            var arguments = {
                es : expressionSet,
                c1 : pc1,
                c2 : pc2
            };
            if (columnIndices.length > 0) {
                arguments.columns = columnIndices;
            }
            if (rowIndices.length > 0) {
                arguments.rows = rowIndices;
            }
            if (colorBy != "") {
                arguments.colour = colorBy;
            }
            if (sizeBy != "") {
                arguments.size = sizeBy;
            }
            if (label != "") {
                arguments.label = label;
            }



            console.log(arguments);
            var req = ocpu.call("pcaPlot", arguments, function (session) {
                console.log(session);
                console.log(session.txt);
                var txt = session.txt.split("\n");
                console.log(txt);
                var imageLocationAr = txt[txt.length - 2].split("/");
                var imageLocation = session.getLoc() + "files/" + imageLocationAr[imageLocationAr.length - 1];
                console.log(imageLocation);
                var img = $('<img />', {src : imageLocation, style : "width:720px;height:540px"});
                _this.$chart.prepend(img);
                /*var img = $('<img />', {src : session.getLoc() + 'graphics/1/png', style : "width:720px;height:540px"});*/

            });
            req.fail(function () {
                alert(req.responseText);
            });
        });


    }
};



morpheus.SaveDatasetTool = function() {
};
morpheus.SaveDatasetTool.prototype = {
	toString : function() {
		return 'Save Dataset';
	},
	gui : function() {
		return [
			{
				name : 'file_name',
				type : 'text',
				help : '<a target="_blank" href="http://support.lincscloud.org/hc/en-us/articles/202105453-GCT-Gene-Cluster-Text-Format-">GCT 1.3</a>'
							+ ' or <a target="_blank" href="http://www.broadinstitute.org/cancer/software/genepattern/gp_guides/file-formats/sections/gct">GCT 1.2</a> file name',
				required : true
			}, {
				name : 'file_format',
				type : 'radio',
				options : [ {
					name : 'GCT version 1.2',
					value : '1.2'
				}, {
					name : 'GCT version 1.3',
					value : '1.3'
				} ],
				value : '1.3',
				required : true
			} ];
	},
	execute : function(options) {
		var project = options.project;
		var format = options.input.file_format;
		var fileName = options.input.file_name;
		var controller = options.controller;
		var dataset = project.getSortedFilteredDataset();

		var text = (format === '1.2') ? new morpheus.GctWriter12()
				.write(dataset) : new morpheus.GctWriter().write(dataset);

		var blob = new Blob([ text ], {
			type : 'text/plain;charset=charset=utf-8'
		});
		if (!morpheus.Util.endsWith(fileName.toLowerCase(), '.gct')) {
			fileName += '.gct';
		}
		saveAs(blob, fileName, true);
	}
};
morpheus.SaveImageTool = function() {
};
morpheus.SaveImageTool.prototype = {
	toString : function() {
		return 'Save Image';
	},
	gui : function() {
		return [ {
			name : 'file_name',
			type : 'text',
			required : true
		}, {
			name : 'format',
			type : 'select',
			options : [ 'png', 'svg' ],
			value : 'svg',
			required : true
		} ]; 
	},
	execute : function(options) {
		var fileName = options.input.file_name;
		var format = options.input.format;
		if (!morpheus.Util.endsWith(fileName.toLowerCase(), '.' + format)) {
			fileName += '.' + format;
		}
		var controller = options.controller;
		controller.saveImage(fileName, format);
	}
};
morpheus.SimilarityMatrixTool = function() {
};

morpheus.SimilarityMatrixTool.Functions = [ morpheus.Euclidean,
		morpheus.Jaccard, morpheus.Cosine, morpheus.Pearson, morpheus.Spearman ];
morpheus.SimilarityMatrixTool.Functions.fromString = function(s) {
	for (var i = 0; i < morpheus.SimilarityMatrixTool.Functions.length; i++) {
		if (morpheus.SimilarityMatrixTool.Functions[i].toString() === s) {
			return morpheus.SimilarityMatrixTool.Functions[i];
		}
	}
	throw new Error(s + ' not found');
};
morpheus.SimilarityMatrixTool.execute = function(dataset, input) {
	var isColumnMatrix = input.compute_matrix_for == 'Columns';
	var f = morpheus.SimilarityMatrixTool.Functions.fromString(input.metric);
	return morpheus.HCluster.computeDistanceMatrix(
			isColumnMatrix ? new morpheus.TransposedDatasetView(dataset)
					: dataset, f);
};
morpheus.SimilarityMatrixTool.prototype = {
	toString : function() {
		return 'Similarity Matrix';
	},
	init : function(project, form) {

	},
	gui : function() {
		return [ {
			name : 'metric',
			options : morpheus.SimilarityMatrixTool.Functions,
			value : morpheus.SimilarityMatrixTool.Functions[3].toString(),
			type : 'select'
		}, {
			name : 'compute_matrix_for',
			options : [ 'Columns', 'Rows' ],
			value : 'Columns',
			type : 'radio'
		} ];
	},
	execute : function(options) {
		var project = options.project;
		var controller = options.controller;
		var isColumnMatrix = options.input.compute_matrix_for == 'Columns';
		var f = morpheus.SimilarityMatrixTool.Functions
				.fromString(options.input.metric);
		var dataset = project.getSortedFilteredDataset();
		var blob = new Blob(
				[ 'self.onmessage = function(e) {'
						+ 'importScripts(e.data.scripts);'
						+ 'self.postMessage(morpheus.SimilarityMatrixTool.execute(morpheus.Dataset.fromJson(e.data.dataset), e.data.input));'
						+ '}' ]);

		var url = window.URL.createObjectURL(blob);
		var worker = new Worker(url);

		worker.postMessage({
			scripts : morpheus.Util.getScriptPath(),
			dataset : morpheus.Dataset.toJson(dataset, {
				columnFields : [],
				rowFields : []
			}),
			input : options.input
		});

		worker.onmessage = function(e) {
			var name = controller.getName();
			var matrix = e.data;
			var n = isColumnMatrix ? dataset.getColumnCount() : dataset
					.getRowCount();
			var d = new morpheus.Dataset({
				name : name,
				rows : n,
				columns : n
			});
			// set the diagonal
			var isDistance = f.toString() === morpheus.Euclidean.toString()
					|| f.toString() === morpheus.Jaccard.toString();
			for (var i = 1; i < n; i++) {
				for (var j = 0; j < i; j++) {
					var value = matrix[i][j];
					d.setValue(i, j, value);
					d.setValue(j, i, value);
				}
			}
			// no need to set diagonal if not distance as array already
			// initialized to 0
			if (!isDistance) {
				for (var i = 0; i < n; i++) {
					d.setValue(i, i, 1);
				}
			}
			var metadata = isColumnMatrix ? dataset.getColumnMetadata()
					: dataset.getRowMetadata();
			d.rowMetadataModel = morpheus.MetadataUtil.shallowCopy(metadata);
			d.columnMetadataModel = morpheus.MetadataUtil.shallowCopy(metadata);
			var colorScheme;
			if (!isDistance) {
				colorScheme = {
					type : 'fixed',
					map : [ {
						value : -1,
						color : 'blue'
					}, {
						value : 0,
						color : 'white'
					}, {
						value : 1,
						color : 'red'
					} ]
				};
			} else {
				colorScheme = {
					type : 'fixed',
					map : [ {
						value : 0,
						color : 'white'
					}, {
						value : morpheus.DatasetUtil.max(d),
						color : 'red'
					} ]
				};
			}
			new morpheus.HeatMap({
				colorScheme : colorScheme,
				name : name,
				dataset : d,
				parent : controller,
				inheritFromParentOptions : {
					rows : !isColumnMatrix,
					columns : isColumnMatrix
				}
			});
			worker.terminate();
			window.URL.revokeObjectURL(url);
		};
		return worker;
	}
};
morpheus.TestTool = function () {
};
morpheus.TestTool.prototype = {
    toString : function () {
        return 'Test';
    },
    gui : function () {
        return [

        ];
    },
    execute : function (options) {
        var project = options.project;
        var dataset = project.getFullDataset();
        var matrix = dataset.seriesArrays;

        ocpu.seturl("http://localhost:7120/ocpu/library/base/R");
        var req = ocpu.call("ncol", {
            "x" : matrix
        }, function (session) {
            session.getConsole(function (output) {
                console.log(output);
            });
        });
        req.fail(function () {
            console.log("test tool failed");
        });
    }
};


morpheus.TransposeTool = function() {
};
morpheus.TransposeTool.prototype = {
	toString : function() {
		return 'Transpose';
	},
	execute : function(options) {
		var project = options.project;
		var controller = options.controller;
		var dataset = new morpheus.TransposedDatasetView(project
				.getSortedFilteredDataset());
		// make a shallow copy of the dataset, metadata is immutable via the UI
		var rowMetadataModel = morpheus.MetadataUtil.shallowCopy(dataset
				.getRowMetadata());
		var columnMetadataModel = morpheus.MetadataUtil.shallowCopy(dataset
				.getColumnMetadata());
		dataset.getRowMetadata = function() {
			return rowMetadataModel;
		};
		dataset.getColumnMetadata = function() {
			return columnMetadataModel;
		};

		// TODO see if we can subset dendrograms
		// only handle contiguous selections for now
		// if (controller.columnDendrogram != null) {
		// var indices = project.getColumnSelectionModel().getViewIndices()
		// .toArray();
		// morpheus.AbstractDendrogram.leastCommonAncestor();
		// }
		// if (controller.rowDendrogram != null) {
		//
		// }
		var name = options.input.name || controller.getName();
		new morpheus.HeatMap({
			name : name,
			dataset : dataset,
			inheritFromParentOptions : {
				transpose : true
			},
			parent : controller
		});

	}
};
morpheus.WordCloudTool = function() {

};

/**
 * @param options
 * @param options.el
 *            Element to append svg to
 * @param options.width
 *            svg width
 * @param options.height
 *            svg height
 * @param options.words
 *            Array of words to draw
 * @param options.fontSizeScale
 *            scale for font size
 * @param options.fill
 *            Scale for font color
 * @param options.minSize
 *            min word size
 * @param options.maxSize
 *            max word size
 */
morpheus.WordCloudTool.draw = function(options) {
	var width = options.width;
	var height = options.height;
	var words = options.words;
	var maxSize = options.maxSize;
	var minSize = options.minSize;

	var fill = options.fill || d3.scale.category20b();

	var fontSizeScale = d3.scale.linear().range([ 12, 24 ]).domain(
			[ minSize, maxSize ]).clamp(true);
	var g = d3.select(options.el).append('svg').attr('width', width).attr(
			'height', height).append('g');
	g.attr('transform', 'translate(' + [ width / 2, height / 2 ] + ')');
	g.style('font-weight', '900');
	var angle = d3.scale.linear().domain([ 0, 0 ]).range([ 0, 0 ]).clamp(true);
	d3.layout.cloud().spiral('archimedean').size([ width, height ])
			.words(words).rotate(function() {
				return angle(~~(Math.random() * 5));
			}).fontSize(function(d) {
				return d.size;
			}).on('end', draw).start();
	function draw(words) {
		var text = g.selectAll('text').data(words).enter().append('text')
				.style('font-family', 'Impact').on(
						'mouseover',
						function(d) {
							d3.select(this).transition().style('font-size',
									2 * fontSizeScale(d.size) + 'px');
						}).on(
						'mouseout',
						function(d) {
							d3.select(this).transition().style('font-size',
									fontSizeScale(d.size) + 'px');
						}).on(
						'click',
						function(d) {
							options.heatMap.getToolbar().setSearchText(
								{
									isColumns : options.isColumns,
									text : d.text.indexOf(' ') ? ('"'
												+ d.text + '"') : d.text
								});

						}).style('fill', function(d, i) {
							return fill(i);
						}).attr('text-anchor', 'middle').attr(
						'transform',
						function(d) {
							return 'translate(' + [ d.x, d.y ] + ')rotate('
									+ d.rotate + ')';
						}).text(function(d) {
							return d.text;
						}).style('font-size', function(d) {
							return '1px';
						}).transition().duration(1000).style('font-size', function(d) {
							return fontSizeScale(d.size) + 'px';
						});

	}
};
morpheus.WordCloudTool.drawTable = function(options) {
	var width = options.width;
	var maxSize = options.maxSize;
	var minSize = options.minSize;
	var words = options.words;
	words.sort(function(a, b) {
		return (a.size === b.size ? 0 : (a.size < b.size ? 1 : -1));
	});
	var barHeight = 20;
	var height = words.length * barHeight;
	var scale = d3.scale.linear().domain([ minSize, maxSize ]).range([ 0, 50 ]);
	var g = d3.select(options.el).append('svg').attr('width', width).attr(
			'height', height).append('g');
	var sub = g.selectAll('text').data(words).enter().append('g').attr(
			'transform', function(d, i) {
				return 'translate(0,' + (barHeight + i * barHeight) + ')';
			}).on('click', function(d) {
				options.heatMap.getToolbar().setSearchText({
					isColumns : options.isColumns,
					text : d.text.indexOf(' ') ? ('"' + d.text + '"') : d.text
				});
			});

	sub.append('text').text(function(d) {
		return d.text;
	});
	sub.append('rect').style('fill', '#bdbdbd').attr('width', function(d) {
		return scale(d.size) + 'px';
	}).attr('height', function(d) {
		return '18px';
	}).attr('x', function(d) {
		return '300';
	}).attr('y', function(d) {
		return '-' + barHeight / 2 + 'px';
	});
	sub.append('title').text(
			function(d) {
				return d.text + ' p value: ' + morpheus.Util.nf(d.p)
						+ ', selected count: ' + d.count
						+ ' selected, total count: ' + d.fullCount;
			});

};
morpheus.WordCloudTool.prototype = {
	toString : function() {
		return 'Word Cloud';
	},
	init : function(project, form) {
		form.setOptions('field', morpheus.MetadataUtil.getMetadataNames(project
				.getFullDataset().getRowMetadata()));
		form.$form.find('[name=generate_word_cloud_for]').on(
				'change',
				function(e) {
					var val = $(this).val();
					form.setOptions('field',
							val === 'selected rows' ? morpheus.MetadataUtil
									.getMetadataNames(project.getFullDataset()
											.getRowMetadata())
									: morpheus.MetadataUtil
											.getMetadataNames(project
													.getFullDataset()
													.getColumnMetadata()));
				});

	},
	gui : function() {
		return [ {
			name : 'field',
			type : 'select'
		}, {
			name : 'generate_word_cloud_for',
			options : [ 'selected rows', 'selected columns' ],
			value : 'selected rows',
			type : 'radio'
		} ];
	},
	execute : function(options) {
		var project = options.project;
		var isColumns = options.input.generate_word_cloud_for == 'selected columns';
		var controller = options.controller;
		var field = options.input.field;
		var selectedDataset = project.getSortedFilteredDataset();
		var fullDataset = project.getFullDataset();
		if (isColumns) {
			selectedDataset = morpheus.DatasetUtil
					.transposedView(selectedDataset);
			fullDataset = morpheus.DatasetUtil.transposedView(fullDataset);
		}
		var selectedIndices = (isColumns ? project.getColumnSelectionModel()
				: project.getRowSelectionModel()).getViewIndices().values();
		if (selectedIndices.length === 0) {
			throw new Error('No ' + (isColumns ? 'columns' : 'rows')
					+ ' selected');
		}
		selectedDataset = new morpheus.SlicedDatasetView(selectedDataset,
				selectedIndices, null);
		var vector = selectedDataset.getRowMetadata().getByName(field);
		var valueToCount = morpheus.VectorUtil.createValueToCountMap(vector);
		var totalSelected = 0;
		valueToCount.forEach(function(count, value) {
			totalSelected += count;
		});
		var fullValueToCount = morpheus.VectorUtil
				.createValueToCountMap(fullDataset.getRowMetadata().getByName(
						field));
		var fullTotal = 0;
		fullValueToCount.forEach(function(count, value) {
			fullTotal += count;
		});
		var colorModel = isColumns ? project.getColumnColorModel() : project
				.getRowColorModel();

		var words = [];
		valueToCount.forEach(function(count, value) {
			var fullCount = fullValueToCount.get(value);
			var p = morpheus.FisherExact.fisherTest(count, totalSelected,
					fullCount, fullTotal);
			words.push({
				count : count,
				fullCount : fullCount,
				p : p,
				text : value,
				size : -morpheus.Log2(p)
			});
		});
		var maxSize = -Number.MAX_VALUE;
		var minSize = Number.MAX_VALUE;
		for (var i = 0, length = words.length; i < length; i++) {
			minSize = Math.min(minSize, words[i].size);
			maxSize = Math.max(maxSize, words[i].size);
		}
		var fill = function(value) {
			return colorModel.getMappedValue(vector, words[value].text);
		};
		var $dialog = $('<div style="background-color:white;" title="Word Cloud"></div>');

		var width = 960;
		var height = 600;
		$dialog.dialog({
			resizable : true,
			height : height + 30,
			width : width + 30
		});
		morpheus.WordCloudTool.draw({
			minSize : minSize,
			maxSize : maxSize,
			isColumns : isColumns,
			heatMap : controller,
			el : $dialog[0],
			width : width,
			height : height,
			words : words,
			fill : fill
		});
		morpheus.WordCloudTool.drawTable({
			minSize : minSize,
			maxSize : maxSize,
			isColumns : isColumns,
			heatMap : controller,
			el : $dialog[0],
			width : width,
			words : words
		});

	}
};
morpheus.AbstractCanvas = function(offscreen) {
	this.canvas = morpheus.CanvasUtil.createCanvas();
	this.lastClip = null;
	if (offscreen) {
		this.offscreenCanvas = morpheus.CanvasUtil.createCanvas();
	}
	this.offset = {
		x : 0,
		y : 0
	};
};

morpheus.AbstractCanvas.prototype = {
	visible : true,
	invalid : true,
	scrollX : 0,
	scrollY : 0,
	prefWidth : undefined,
	prefHeight : undefined,
	getCanvas : function() {
		return this.canvas;
	},
	scrollTop : function(pos) {
		if (pos === undefined) {
			return this.offset.y;
		}
		this.offset.y = pos;
	},
	appendTo : function($el) {
		// if (this.offscreenCanvas) {
		// $(this.offscreenCanvas).appendTo($el);
		// }
		$(this.canvas).appendTo($el);
	},
	scrollLeft : function(pos) {
		if (pos === undefined) {
			return this.offset.x;
		}
		this.offset.x = pos;
	},
	dispose : function() {
		$(this.canvas).remove();
		this.offscreenCanvas = undefined;
	},
	getPrefWidth : function() {
		return this.prefWidth;
	},
	/**
	 * Tells this canvas to invalidate any offscreen cached images
	 */
	setInvalid : function(invalid) {
		this.invalid = invalid;
	},
	setBounds : function(bounds) {
		var backingScale = morpheus.CanvasUtil.BACKING_SCALE;
		var canvases = [ this.canvas ];
		if (this.offscreenCanvas) {
			canvases.push(this.offscreenCanvas);
		}
		if (bounds.height != null) {
			_.each(canvases, function(canvas) {
				canvas.height = bounds.height * backingScale;
				canvas.style.height = bounds.height + 'px';
			});
		}
		if (bounds.width != null) {
			_.each(canvases, function(canvas) {
				canvas.width = bounds.width * backingScale;
				canvas.style.width = bounds.width + 'px';
			});
		}
		if (bounds.left != null) {
			_.each(canvases, function(canvas) {
				canvas.style.left = bounds.left + 'px';
			});
		}
		if (bounds.top != null) {
			_.each(canvases, function(canvas) {
				canvas.style.top = bounds.top + 'px';
			});
		}
	},
	/**
	 * Paint this canvas using the specified clip.
	 */
	paint : function(clip) {
		var canvas = this.canvas;
		var context = canvas.getContext('2d');
		morpheus.CanvasUtil.resetTransform(context);
		var width = this.getUnscaledWidth();
		var height = this.getUnscaledHeight();
		context.clearRect(0, 0, width, height);
		if (this.prePaint) {
			morpheus.CanvasUtil.resetTransform(context);
			context.translate(this.offset.x, this.offset.y);
			this.prePaint(clip, context);
		}
		morpheus.CanvasUtil.resetTransform(context);
		if (this.offscreenCanvas) {
			if (this.invalid) {
				var oc = this.offscreenCanvas.getContext('2d');
				morpheus.CanvasUtil.resetTransform(oc);
				context.translate(this.offset.x, this.offset.y);
				oc.clearRect(0, 0, width, height);
				this.draw(clip, oc);
			}
			context.drawImage(this.offscreenCanvas, 0, 0, width, height);
		} else {
			this.draw(clip, context);
		}
		if (this.postPaint) {
			morpheus.CanvasUtil.resetTransform(context);
			context.translate(this.offset.x, this.offset.y);
			this.postPaint(clip, context);
		}
		this.lastClip = clip;
		this.invalid = false;
	},
	repaint : function() {
		if (!this.lastClip) {
			this.lastClip = {
				x : 0,
				y : 0,
				width : this.getUnscaledWidth(),
				height : this.getUnscaledHeight()
			};
		}
		this.paint(this.lastClip);
	},
	/**
	 * Draw this canvas into the specified context.
	 */
	draw : function(clip, context) {
		console.log('Not implemented');
	},
	getPrefHeight : function() {
		return this.prefHeight;
	},
	setPrefWidth : function(prefWidth) {
		this.prefWidth = prefWidth;
	},
	setPrefHeight : function(prefHeight) {
		this.prefHeight = prefHeight;
	},
	isVisible : function() {
		return this.visible;
	},
	setVisible : function(visible) {
		if (this.visible !== visible) {
			this.visible = visible;
			this.canvas.style.display = visible ? '' : 'none';
		}
	},
	getUnscaledWidth : function() {
		return this.canvas.width / morpheus.CanvasUtil.BACKING_SCALE;
	},
	getUnscaledHeight : function() {
		return this.canvas.height / morpheus.CanvasUtil.BACKING_SCALE;
	},
	getWidth : function() {
		return this.canvas.width;
	},
	getHeight : function() {
		return this.canvas.height;
	}
};
morpheus.AbstractColorSupplier = function() {
	this.fractions = [ 0, 0.5, 1 ];
	this.colors = [ 'blue', 'white', 'red' ];
	this.names = null; // optional color stop names
	this.min = 0;
	this.max = 1;
	this.missingColor = '#c0c0c0';
	this.scalingMode = morpheus.HeatMapColorScheme.ScalingMode.RELATIVE;
	this.stepped = false;
	this.sizer = new morpheus.HeatMapSizer();
	this.conditions = new morpheus.HeatMapConditions();
};
morpheus.AbstractColorSupplier.fromJson = function(json) {
	var cs = json.stepped ? new morpheus.SteppedColorSupplier()
			: new morpheus.GradientColorSupplier();
	cs.setDiscrete(json.discrete);
	cs.setScalingMode(json.scalingMode);
	cs.setMin(json.min);
	cs.setMax(json.max);
	cs.setMissingColor(json.missingColor);

	cs.setFractions({
		colors : json.colors,
		fractions : json.fractions,
		names : json.names
	});
	return cs;
};

morpheus.AbstractColorSupplier.prototype = {
	discrete : false,
	getSizer : function() {
		return this.sizer;
	},
	getConditions : function() {
		return this.conditions;
	},
	isDiscrete : function() {
		return this.discrete;
	},
	setDiscrete : function(discrete) {
		this.discrete = discrete;
	},
	createInstance : function() {
		throw 'not implemented';
	},
	copy : function() {
		var c = this.createInstance();
		c.discrete = this.discrete;
		c.setFractions({
			fractions : this.fractions.slice(0),
			colors : this.colors.slice(0)
		});
		if (this.names != null) {
			c.names = this.names.slice(0);
		}
		if (this.sizer) {
			c.sizer = this.sizer.copy();
		}
		if (this.conditions) {
			c.conditions = this.conditions.copy();
		}
		c.scalingMode = this.scalingMode;
		c.min = this.min;
		c.max = this.max;
		c.missingColor = this.missingColor;

		return c;
	},
	setMissingColor : function(missingColor) {
		this.missingColor = missingColor;
	},
	getMissingColor : function() {
		return this.missingColor;
	},
	getScalingMode : function() {
		return this.scalingMode;
	},
	setScalingMode : function(scalingMode) {
		if (scalingMode !== this.scalingMode) {
			if (scalingMode === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
				this.min = 0;
				this.max = 1;
			}
			this.scalingMode = scalingMode;
		}
	},
	isStepped : function() {
		return false;
	},
	getColor : function(row, column, value) {
		throw 'not implemented';
	},
	getColors : function() {
		return this.colors;
	},
	getNames : function() {
		return this.names;
	},
	getFractions : function() {
		return this.fractions;
	},
	getMin : function() {
		return this.min;
	},
	getMax : function() {
		return this.max;
	},
	setMin : function(min) {
		this.min = min;
	},
	setMax : function(max) {
		// the min and max are set by heat map color scheme for each row
		this.max = max;
	},
	/**
	 * 
	 * @param options.fractions
	 *            Array of stop fractions
	 * @param options.colors
	 *            Array of stop colors
	 * @param options.names
	 *            Array of stop names
	 */
	setFractions : function(options) {
		var index = morpheus.Util.indexSort(options.fractions, true);
		this.fractions = morpheus.Util.reorderArray(options.fractions, index);
		this.colors = morpheus.Util.reorderArray(options.colors, index);
		this.names = options.names ? morpheus.Util.reorderArray(options.names,
				index) : null;
	}
};
morpheus.AbstractComponent = function() {
	this.lastClip = null;
	var c = document.createElement('div');
	c.setAttribute('tabindex', '0');
	c.style.outline = 0;
	c.style.overflow = 'hidden';
	c.style.position = 'absolute';
	this.el = c;
	this.$el = $(c);
};
morpheus.AbstractComponent.prototype = {
	visible : true,
	invalid : true,
	prefWidth : undefined,
	prefHeight : undefined,
	appendTo : function($el) {
		$(this.el).appendTo($el);
	},
	dispose : function() {
		$(this.el).remove();
	},
	getPrefWidth : function() {
		return this.prefWidth;
	},
	/**
	 * Tells this component to invalidate 
	 */
	setInvalid : function(invalid) {
		this.invalid = invalid;
	},
	setBounds : function(bounds) {
//		if (bounds.height != null) {
//			this.el.style.height = bounds.height + 'px';
//		}
//		if (bounds.width != null) {
//			this.el.style.width = bounds.width + 'px';
//		}
		if (bounds.left != null) {
			this.$el.css('left', bounds.left + 'px');
		}
		if (bounds.top != null) {
			this.$el.css('top', bounds.top + 'px');
		}
	},
	/**
	 * Paint this canvas using the specified clip.
	 */
	paint : function(clip) {
		var width = this.getUnscaledWidth();
		var height = this.getUnscaledHeight();
		this.draw(clip);
		this.lastClip = clip;
		this.invalid = false;
	},
	repaint : function() {
		if (!this.lastClip) {
			this.lastClip = {
				x : 0,
				y : 0,
				width : this.getUnscaledWidth(),
				height : this.getUnscaledHeight()
			};
		}
		this.paint(this.lastClip);
	},
	/**
	 * Draw this canvas into the specified context.
	 */
	draw : function(clip) {
	},
	getPrefHeight : function() {
		return this.prefHeight;
	},
	setPrefWidth : function(prefWidth) {
		this.prefWidth = prefWidth;
	},
	setPrefHeight : function(prefHeight) {
		this.prefHeight = prefHeight;
	},
	isVisible : function() {
		return this.visible;
	},
	setVisible : function(visible) {
		if (this.visible !== visible) {
			this.visible = visible;
			this.el.style.display = visible ? '' : 'none';
		}
	},
	getUnscaledWidth : function() {
		return this.$el.width();
	},
	getUnscaledHeight : function() {
		return this.$el.height();
	},
	getWidth : function() {
		return this.$el.width();
	},
	getHeight : function() {
		return this.$el.height();
	}
};
/*
 * 
 * @param tree An object with maxHeight, rootNode, leafNodes, nLeafNodes. Each node has an id (integer), name (string), children, height, minIndex, maxIndex, parent. Leaf nodes also have an index.
	The root has the largest height, leaves the smallest height.
	
 */
morpheus.AbstractDendrogram = function(controller, tree, positions, project,
		type) {
	morpheus.AbstractCanvas.call(this, true);
	this._overviewHighlightColor = '#d8b365';
	this._searchHighlightColor = '#e41a1c';
	this._selectedNodeColor = type === morpheus.AbstractDendrogram.Type.COLUMN ? '#377eb8'
			: '#984ea3';
	this.tree = tree;
	this.type = type;
	this.squishEnabled = false;
	this.controller = controller;
	this.positions = positions;
	this.project = project;
	var $label = $('<span></span>');
	$label.addClass('label label-info');
	$label.css('position', 'absolute');
	this.$label = $label;
	var $squishedLabel = $('<span></span>');
	$squishedLabel.addClass('label label-default');
	$squishedLabel.css('position', 'absolute').css('top', 18);
	this.$squishedLabel = $squishedLabel;
	this.$label = $label;
	this.cutHeight = this.tree.maxHeight;
	this.drawLeafNodes = true;
	this.lineWidth = 0.7;
	this.selectedNodeIds = {};
	this.selectedRootNodeIdToNode = {};
	this.nodeIdToHighlightedPathsToRoot = {};
	var _this = this;
	this.defaultStroke = 'rgb(0,0,0)';

	var mouseMove = function(event) {
		if (!morpheus.CanvasUtil.dragging) {
			var position = morpheus.CanvasUtil.getMousePosWithScroll(
					event.target, event, _this.lastClip.x, _this.lastClip.y);
			if (_this.isDragHotSpot(position)) { // dendrogram cutter
				_this.canvas.style.cursor = _this.getResizeCursor();
			} else {
				var nodes;
				if (_this.getNodes) {
					nodes = _this.getNodes(position);
				} else {
					var node = _this.getNode(position);
					if (node) {
						nodes = [ node ];
					}
				}
				if (nodes != null) {
					nodes.sort(function(a, b) {
						return a.name < b.name;
					});
					var tipOptions = {
						event : event
					};
					tipOptions[type === morpheus.AbstractDendrogram.Type.COLUMN ? 'columnNodes'
							: 'rowNodes'] = nodes;
					_this.controller.setToolTip(-1, -1, tipOptions);
					_this.canvas.style.cursor = 'pointer';
				} else {
					_this.controller.setToolTip(-1, -1);
					_this.canvas.style.cursor = 'default';
				}
			}
		}
	};
	var mouseExit = function(e) {
		if (!morpheus.CanvasUtil.dragging) {
			_this.canvas.style.cursor = 'default';
		}
	};
	if (type !== morpheus.AbstractDendrogram.Type.RADIAL) {

		$(this.canvas)
				.on(
						'contextmenu',
						function(e) {
							e.preventDefault();
							e.stopPropagation();
							e.stopImmediatePropagation();
							morpheus.Popup
									.showPopup(
											[ {
												name : 'Annotate...'
											}, {
												name : 'Enrichment...'
											}, {
												separator : true
											}, {
												name : 'Squish',
												checked : _this.squishEnabled
											}, {
												separator : true
											}, {
												name : 'Delete'
											} ],
								{
									x : e.pageX,
									y : e.pageY
								},
											e.target,
											function(menuItem, item) {
												if (item === 'Annotate...') {
													morpheus.HeatMap
															.showTool(
																	new morpheus.AnnotateDendrogramTool(
																			type === morpheus.AbstractDendrogram.Type.COLUMN),
																	_this.controller);
												}
												if (item === 'Enrichment...') {
													morpheus.HeatMap
															.showTool(
																	new morpheus.DendrogramEnrichmentTool(
																			type === morpheus.AbstractDendrogram.Type.COLUMN),
																	_this.controller);
												} else if (item === 'Squish') {
													_this.squishEnabled = !_this.squishEnabled;
													if (!_this.squishEnabled) {
														_this.positions
																.setSquishedIndices(null);
													}
												} else if (item === 'Delete') {
													_this.resetCutHeight();
													_this.controller
															.setDendrogram(
																	null,
																	type === morpheus.AbstractDendrogram.Type.COLUMN);
												}
											});
							return false;
						});

		$(this.canvas).on('mousemove', _.throttle(mouseMove, 100)).on(
				'mouseout', _.throttle(mouseExit, 100)).on('mouseenter',
				_.throttle(mouseMove, 100));
	}
	var dragStartScaledCutHeight = 0;
	this.cutTreeHotSpot = false;
	if (type !== morpheus.AbstractDendrogram.Type.RADIAL) {
		this.hammer = morpheus.Util
				.hammer(this.canvas, [ 'pan', 'tap' ])
				.on(
						'tap',
						function(event) {
							if (!morpheus.CanvasUtil.dragging) {
								var position = morpheus.CanvasUtil
										.getMousePosWithScroll(event.target,
												event, _this.lastClip.x,
												_this.lastClip.y);
								_this.cutTreeHotSpot = _this
										.isDragHotSpot(position);
								if (_this.cutTreeHotSpot) {
									return;
								}
								var node = _this.getNode(position);
								if (node != null && node.parent === undefined) {
									node = null; // can't select root
								}
								var commandKey = morpheus.Util.IS_MAC ? event.srcEvent.metaKey
										: event.srcEvent.ctrlKey;
								_this.setSelectedNode(node,
										event.srcEvent.shiftKey || commandKey);
							}
						})
				.on('panend', function(event) {
					morpheus.CanvasUtil.dragging = false;
					_this.canvas.style.cursor = 'default';
					_this.cutTreeHotSpot = true;
				})
				.on(
						'panstart',
						function(event) {
							var position = morpheus.CanvasUtil
									.getMousePosWithScroll(event.target, event,
											_this.lastClip.x, _this.lastClip.y,
											true);
							_this.cutTreeHotSpot = _this
									.isDragHotSpot(position);
							if (_this.cutTreeHotSpot) { // make sure start event
								// was on hotspot
								morpheus.CanvasUtil.dragging = true;
								_this.canvas.style.cursor = _this
										.getResizeCursor();
								dragStartScaledCutHeight = _this
										.scale(_this.cutHeight);
							}
						})
				.on(
						'panmove',
						function(event) {
							if (_this.cutTreeHotSpot) {
								var cutHeight;
								if (_this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
									var delta = event.deltaY;
									cutHeight = Math
											.max(
													0,
													Math
															.min(
																	_this.tree.maxHeight,
																	_this.scale
																			.invert(dragStartScaledCutHeight
																					+ delta)));
								} else if (_this.type === morpheus.AbstractDendrogram.Type.ROW) {
									var delta = event.deltaX;
									cutHeight = Math
											.max(
													0,
													Math
															.min(
																	_this.tree.maxHeight,
																	_this.scale
																			.invert(dragStartScaledCutHeight
																					+ delta)));
								} else {
									var point = morpheus.CanvasUtil
											.getMousePos(event.target, event);
									point.x = _this.radius - point.x;
									point.y = _this.radius - point.y;
									var radius = Math.sqrt(point.x * point.x
											+ point.y * point.y);
									if (radius <= 4) {
										cutHeight = _this.tree.maxHeight;
									} else {
										cutHeight = Math.max(0, Math.min(
												_this.tree.maxHeight,
												_this.scale.invert(radius)));
									}
								}
								if (cutHeight >= _this.tree.maxHeight) {
									_this.resetCutHeight();
								} else {
									_this.setCutHeight(cutHeight);
								}
								event.preventDefault();
							}
						});
	}
};
morpheus.AbstractDendrogram.Type = {
	COLUMN : 0,
	ROW : 1,
	RADIAL : 2
};
morpheus.AbstractDendrogram.prototype = {
	setSelectedNode : function(node, add) {
		var _this = this;
		var viewIndices;
		var selectionModel = this.type === morpheus.AbstractDendrogram.Type.COLUMN ? this.project
				.getColumnSelectionModel()
				: this.project.getRowSelectionModel();
		if (node == null) {
			// clear selection
			_this.selectedNodeIds = {};
			_this.selectedRootNodeIdToNode = {};
			viewIndices = new morpheus.Set();
		} else {
			if (add) { // add to selection
				viewIndices = selectionModel.getViewIndices();
			} else {
				viewIndices = new morpheus.Set();
				_this.selectedNodeIds = {};
				_this.selectedRootNodeIdToNode = {};
			}
			if (node != null) {
				if (node.children === undefined) { // leaf node
					var contains = _this.nodeIdToHighlightedPathsToRoot[node.id];
					if (!add) {
						_this.nodeIdToHighlightedPathsToRoot = {};
					}
					if (contains) {
						delete _this.nodeIdToHighlightedPathsToRoot[node.id];
						// toggle
					} else {
						_this.nodeIdToHighlightedPathsToRoot[node.id] = node;
					}
				} else {
					_this.selectedRootNodeIdToNode[node.id] = node;
					morpheus.AbstractDendrogram.dfs(node, function(d) {
						_this.selectedNodeIds[d.id] = true;
						return true;
					});
				}
				for (var i = node.minIndex; i <= node.maxIndex; i++) {
					viewIndices.add(i);
				}
			}
		}
		_this.trigger('nodeSelectionChanged', _this.selectedRootNodeIdToNode);
		selectionModel.setViewIndices(viewIndices, true);
		_this.repaint();
	},
	getPathStroke : function(node) {
		if (this.selectedNodeIds[node.id]) {
			return this._selectedNodeColor;
		}
		// if (node.search) {
		// return this._searchHighlightColor;
		// }
		return this.defaultStroke;
	},
	getNodeFill : function(node) {
		if (this.selectedRootNodeIdToNode[node.id]) {
			return this._selectedNodeColor;
		}
		if (node.search) {
			return this._searchHighlightColor;
		}
		if (node.info !== undefined) {
			return this._overviewHighlightColor;
		}
	},
	resetCutHeight : function() {
		this.positions.setSquishedIndices(null);
		if (this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
			this.project.setGroupColumns([], true);
		} else {
			this.project.setGroupRows([], true);
		}
		this.$label.text('');
		this.$squishedLabel.text('');
		var dataset = this.project.getSortedFilteredDataset();
		var clusterIdVector = this.type === morpheus.AbstractDendrogram.Type.COLUMN ? dataset
				.getColumnMetadata().getByName('dendrogram_cut')
				: dataset.getRowMetadata().getByName('dendrogram_cut');
		if (clusterIdVector) {
			for (var i = 0, size = clusterIdVector.size(); i < size; i++) {
				clusterIdVector.setValue(i, NaN);
			}
		}
	},
	setCutHeight : function(height) {
		this.cutHeight = height;
		var squishedIndices = {};
		var clusterNumber = 0;
		var nsquished = 0;

		var squishEnabled = this.squishEnabled;
		var roots = morpheus.AbstractDendrogram.cutAtHeight(this.tree.rootNode,
				this.cutHeight);
		var dataset = this.project.getSortedFilteredDataset();
		var clusterIdVector = this.type === morpheus.AbstractDendrogram.Type.COLUMN ? dataset
				.getColumnMetadata().add('dendrogram_cut')
				: dataset.getRowMetadata().add('dendrogram_cut');
		for (var i = 0, nroots = roots.length; i < nroots; i++) {
			var root = roots[i];
			var minChild = morpheus.AbstractDendrogram.getDeepestChild(root,
					true);
			var maxChild = morpheus.AbstractDendrogram.getDeepestChild(root,
					false);
			var clusterId;
			if (squishEnabled && minChild.index === maxChild.index) {
				squishedIndices[minChild.index] = true;
				clusterId = -2;
				nsquished++;
			} else {
				clusterNumber++;
				clusterId = clusterNumber;
			}
			for (var j = minChild.index; j <= maxChild.index; j++) {
				clusterIdVector.setValue(j, clusterId);
			}

		}
		this.$label.text((clusterNumber) + ' cluster'
				+ morpheus.Util.s(clusterNumber));
		if (nsquished > 0) {
			this.$squishedLabel.text(nsquished + ' squished');
		} else {
			this.$squishedLabel.text('');
		}
		if (squishEnabled) {
			this.positions.setSquishedIndices(squishedIndices);
		}
		if (this.controller.getTrackIndex(clusterIdVector.getName(),
				this.type === morpheus.AbstractDendrogram.Type.COLUMN) === -1) {
			var settings = {
				discrete : true,
				discreteAutoDetermined : true,
				renderMethod : {}
			};
			settings.renderMethod[morpheus.VectorTrack.RENDER.COLOR] = true;
			this.controller.addTrack(clusterIdVector.getName(),
					this.type === morpheus.AbstractDendrogram.Type.COLUMN,
					settings);
		}

		if (this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
			this.project.setGroupColumns([ new morpheus.SortKey(clusterIdVector
					.getName(), morpheus.SortKey.SortOrder.UNSORTED) ], true);
		} else {
			this.project.setGroupRows([ new morpheus.SortKey(clusterIdVector
					.getName(), morpheus.SortKey.SortOrder.UNSORTED) ], true);
		}
	},
	dispose : function() {
		var $c = $(this.canvas);
		$c
				.off('mousemove.morpheus mouseout.morpheus mouseenter.morpheus contextmenu.morpheus');
		$c.remove();
		this.$label.remove();
		this.$squishedLabel.remove();
		this.hammer.destroy();
		this.canvas = null;
		this.$label = null;
		this.$squishedLabel = null;
		this.hammer = null;
	},
	isCut : function() {
		return this.cutHeight < this.tree.maxHeight;
	},
	getMinIndex : function() {
		return 0;
	},
	getMaxIndex : function() {
		return this.positions.getLength() - 1;
	},
	getNode : function(p) {
		var _this = this;
		if (this.lastNode) {
			var xy = _this.toPix(this.lastNode);
			if (Math.abs(xy[0] - p.x) < 4 && Math.abs(xy[1] - p.y) < 4) {
				return this.lastNode;
			}
		}
		this.lastNode = this._getNode(p);
		return this.lastNode;
	},
	// getNode : function(p) {
	// var x = p.x;
	// var y = p.y;
	// var leafIndex = this.positions.getIndex(x, true);
	// if (leafIndex >= 0 && leafIndex < leafNodeIds.length) {
	// leafid = leafNodeIds[leafIndex];
	// } else {
	// return null;
	// }
	// var n = leafNodes.get(leafid);
	// if (n != null) {
	// while (!n.isRoot()) {
	// var parent = n.getParent();
	// getNodePosition(parent, p);
	// if (Math.abs(p.x - x) < 4 && Math.abs(p.y - y) < 4) {
	// return parent;
	// }
	// n = parent;
	// }
	// }
	// return null;
	// },
	_getNode : function(p) {
		var _this = this;
		// brute force search
		var hit = null;
		try {
			morpheus.AbstractDendrogram.dfs(this.tree.rootNode, function(node) {
				var xy = _this.toPix(node);
				if (Math.abs(xy[0] - p.x) < 4 && Math.abs(xy[1] - p.y) < 4) {
					hit = node;
					throw 'break';
				}
				return hit === null;
			});
		} catch (x) {
		}
		return hit;
	},
	getResizeCursor : function() {
		if (this.type === morpheus.AbstractDendrogram.Type.COLUMN) {
			return 'ns-resize';
		} else if (this.type === morpheus.AbstractDendrogram.Type.ROW) {
			return 'ew-resize';
		}
		return 'nesw-resize';
	},
	isDragHotSpot : function(p) {
		return false;
	},
	preDraw : function(context, clip) {
	},
	postDraw : function(context, clip) {
	},
	prePaint : function(clip, context) {
		this.scale = this.createScale();
		var min = this.getMinIndex(clip);
		var max = this.getMaxIndex(clip);
		if (min !== this.lastMinIndex || max !== this.lastMinIndex) {
			this.lastMinIndex = min;
			this.lastMaxIndex = max;
		}
		this.invalid = true;
	},
	draw : function(clip, context) {
		context.translate(-clip.x, -clip.y);
		context.strokeStyle = 'black';
		context.fillStyle = 'black';
		this.scale = this.createScale();
		var min = this.lastMinIndex;
		var max = this.lastMaxIndex;
		context.lineWidth = this.lineWidth;
		this.preDraw(context, clip);
		context.strokeStyle = this.defaultStroke;
		context.fillStyle = 'rgba(166,206,227,0.5)';
		this.drawDFS(context, this.tree.rootNode, min, max, 0);
		context.strokeStyle = 'black';
		context.fillStyle = 'black';
		this.postDraw(context, clip);
	},
	postPaint : function(clip, context) {
		context.strokeStyle = 'black';
		this.paintMouseOver(clip, context);
		// this.drawHighlightedPathsToRoot(context, this.lastMinIndex,
		// this.lastMaxIndex);
	},
	// drawHighlightedPathsToRoot : function(context, minIndex, maxIndex) {
	// context.lineWidth = 1;
	// context.strokeStyle = 'black';
	// context.textAlign = 'left';
	// var i = 0;
	// for ( var key in this.nodeIdToHighlightedPathsToRoot) {
	// context.fillStyle = '#99d594';
	// context.strokeStyle = context.fillStyle;
	// var node = this.nodeIdToHighlightedPathsToRoot[key];
	// if (node.collapsed) {
	// for (var node = node.parent; node.collapsedChildren != null; node =
	// node.parent) {
	// node = node.parent;
	// }
	// }
	// // var pix = this.toPix(node);
	// // context.globalAlpha = 0.5;
	// // context.beginPath();
	// // context.arc(pix[0], pix[1], 8, Math.PI * 2, false);
	// // context.fill();
	// // context.globalAlpha = 1;
	// for (var root = node; root.parent !== undefined; root = root.parent) {
	// this
	// .drawPathFromNodeToParent(context, root, minIndex,
	// maxIndex);
	// }
	// i++;
	// }
	// },
	getNodeRadius : function(node) {
		// if (this._nodeRadiusScaleField != null) {
		// var vals = node.info[this._nodeRadiusScaleField];
		// if (vals === undefined) {
		// return 4;
		// }
		// // TODO get max or min
		// return this._nodeRadiusScale(vals[0]) * 8;
		// }
		return 4;
	},

	drawNode : function(context, node) {
	},
	drawDFS : function(context, node, minIndex, maxIndex) {
		if (this.type !== morpheus.AbstractDendrogram.Type.RADIAL) {
			if ((node.maxIndex < minIndex) || (node.minIndex > maxIndex)) {
				return;
			}
		}
		var nodeFill = this.getNodeFill(node);
		if (nodeFill !== undefined) {
			context.fillStyle = nodeFill;
			this.drawNode(context, node);
		}
		context.strokeStyle = this.getPathStroke(node);
		var children = node.children;
		if (children !== undefined) {
			this.drawNodePath(context, node, minIndex, maxIndex);
			for (var i = 0, nchildren = children.length; i < nchildren; i++) {
				this.drawDFS(context, children[i], minIndex, maxIndex);
			}

		}
	}
};
morpheus.AbstractDendrogram.setIndices = function(root) {
	var setIndex = function(node) {
		var children = node.children;
		var maxIndex = children[0].maxIndex;
		var minIndex = children[0].minIndex;
		for (var i = 1, length = children.length; i < length; i++) {
			var child = children[i];
			minIndex = Math.min(minIndex, child.minIndex);
			maxIndex = Math.max(maxIndex, child.maxIndex);
		}
		node.maxIndex = maxIndex;
		node.minIndex = minIndex;
	};
	var counter = 0;
	var visit = function(node, callback) {
		var children = node.children;
		var n;
		if (children && (n = children.length)) {
			var i = -1;
			while (++i < n) {
				visit(children[i], callback);
			}
		}
		callback(node);
	};
	visit(root, function(n) {
		if (n.children === undefined) {
			n.minIndex = counter;
			n.maxIndex = counter;
			n.index = counter;
			counter++;
		} else {
			setIndex(n);
		}
		return true;
	});
};
morpheus.AbstractDendrogram.convertEdgeLengthsToHeights = function(rootNode) {
	var maxHeight = 0;
	function setHeights(node, height) {
		var newHeight = height;
		if (node.length !== undefined) {
			newHeight += node.length;
		}
		node.height = newHeight;
		maxHeight = Math.max(maxHeight, node.height);
		_.each(node.children, function(child) {
			setHeights(child, newHeight);
		});
	}
	setHeights(rootNode, 0);
	var counter = 0;
	morpheus.AbstractDendrogram.dfs(rootNode, function(node) {
		node.id = counter;
		counter++;
		node.height = maxHeight - node.height;
		return true;
	});
	return {
		maxHeight : maxHeight,
		n : counter
	};
};
morpheus.AbstractDendrogram.parseNewick = function(text) {
	var rootNode = Newick.parse(text);
	var counter = 0;
	var leafNodes = [];
	function visit(node) {
		var children = node.children;
		if (children !== undefined) {
			var left = children[0];
			var right = children[1];
			left.parent = node;
			right.parent = node;
			visit(left);
			visit(right);
		} else { // leaf node
			node.minIndex = counter;
			node.maxIndex = counter;
			node.index = counter;
			leafNodes.push(node);
			counter++;
		}
	}
	visit(rootNode);
	var maxHeight = morpheus.AbstractDendrogram
			.convertEdgeLengthsToHeights(rootNode).maxHeight;
	morpheus.AbstractDendrogram.setNodeDepths(rootNode);
	morpheus.AbstractDendrogram.setIndices(rootNode);
	return {
		maxHeight : rootNode.height,
		rootNode : rootNode,
		leafNodes : leafNodes,
		nLeafNodes : leafNodes.length
	};
};
morpheus.AbstractDendrogram.cutAtHeight = function(rootNode, h) {
	var roots = [];
	morpheus.AbstractDendrogram.dfs(rootNode, function(node) {
		if (node.height < h) {
			roots.push(node);
			return false;
		}
		return true;
	});
	roots.sort(function(a, b) {
		return (a.index < b.index ? -1 : (a.index == b.index ? 0 : 1));
	});
	return roots;
};
morpheus.AbstractDendrogram.getDeepestChild = function(node, isMin) {
	while (true) {
		if (node.children === undefined) {
			return node;
		}
		var index;
		if (isMin) {
			index = node.children[0].index < node.children[node.children.length - 1].index ? 0
					: node.children.length - 1;
		} else {
			index = node.children[0].index > node.children[node.children.length - 1].index ? 0
					: node.children.length - 1;
		}

		node = node.children[index];
	}
};
/**
 * Pre-order depth first traversal 1. Visit the root. 2. Traverse the left
 * subtree. 3. Traverse the right subtree.
 */
morpheus.AbstractDendrogram.dfs = function(node, callback, childrenAccessor) {
	if (childrenAccessor === undefined) {
		childrenAccessor = function(n) {
			return n.children;
		};
	}
	if (callback(node)) {
		var children = childrenAccessor(node);
		var n;
		if (children && (n = children.length)) {
			var i = -1;
			while (++i < n) {
				morpheus.AbstractDendrogram.dfs(children[i], callback,
						childrenAccessor);
			}
		}
	}
};
morpheus.AbstractDendrogram.copyTree = function(tree) {
	var counter = 0;
	function recurse(node) {
		var children = node.children;
		if (children !== undefined) {
			var newChildren = [];
			for (var i = 0, n = children.length; i < n; i++) {
				var copy = $.extend({}, children[i]);
				copy.parent = node;
				newChildren.push(copy);
			}
			node.children = newChildren;
			for (var i = 0, n = newChildren.length; i < n; i++) {
				recurse(newChildren[i]);
			}
		} else {
			node.index = counter;
			node.minIndex = counter;
			node.maxIndex = counter;
			counter++;
		}
	}
	var rootNode = $.extend({}, tree.rootNode);
	rootNode.parent = undefined;
	recurse(rootNode);
	return {
		nLeafNodes : tree.nLeafNodes,
		maxDepth : tree.maxDepth,
		rootNode : rootNode
	};
};
morpheus.AbstractDendrogram.collapseAtDepth = function(rootNode, maxDepth) {
	// restore collapsed children
	morpheus.AbstractDendrogram.dfs(rootNode, function(d) {
		if (d.collapsedChildren) {
			d.children = d.collapsedChildren;
			d.collapsedChildren = undefined;
		}
		return true;
	});
	// collapse nodes below specified depth
	morpheus.AbstractDendrogram.dfs(rootNode, function(d) {
		var depth = d.depth;
		if (depth > maxDepth) {
			d.collapsedChildren = d.children;
			d.children = undefined;
			return false;
		}
		return true;
	});
};
morpheus.AbstractDendrogram.setNodeDepths = function(rootNode) {
	var max = 0;
	function recurse(node, depth) {
		var children = node.children;
		node.depth = depth;
		max = Math.max(depth, max);
		if (children !== undefined) {
			var i = -1;
			var j = depth + 1;
			var n = children.length;
			while (++i < n) {
				var d = recurse(children[i], j);
			}
		}
		return node;
	}
	recurse(rootNode, 0);
	return max;
};
morpheus.AbstractDendrogram.sortDendrogram = function(root, vectorToSortBy,
		project, summaryFunction) {
	summaryFunction = summaryFunction || function(array) {
		var min = Number.MAX_VALUE;
		for (var i = 0; i < array.length; i++) {
			// sum += array[i].weight;
			min = Math.min(min, array[i].weight);
		}
		return min;
	};
	var setWeights = function(node) {
		if (node.children !== undefined) {
			var children = node.children;
			for (var i = 0; i < children.length; i++) {
				setWeights(children[i]);
			}
			node.weight = summaryFunction(children);
		} else {
			node.weight = vectorToSortBy.getValue(node.index);
		}
	};
	setWeights(root);
	// sort children by weight
	var nodeIdToModelIndex = {};
	var leafNodes = morpheus.AbstractDendrogram.getLeafNodes(root);
	_.each(leafNodes, function(node) {
		nodeIdToModelIndex[node.id] = project
				.convertViewColumnIndexToModel(node.index);
	});
	morpheus.AbstractDendrogram.dfs(root, function(node) {
		if (node.children) {
			node.children.sort(function(a, b) {
				return (a.weight === b.weight ? 0 : (a.weight < b.weight ? -1
						: 1));
			});
		}
		return true;
	});
	morpheus.AbstractDendrogram.setIndices(root);
	var sortOrder = [];
	_.each(leafNodes, function(node) {
		var oldModelIndex = nodeIdToModelIndex[node.id];
		var newIndex = node.index;
		sortOrder[newIndex] = oldModelIndex;
	});
	return sortOrder;
};
morpheus.AbstractDendrogram.leastCommonAncestor = function(leafNodes) {
	function getPathToRoot(node) {
		var path = new morpheus.Map();
		while (node != null) {
			path.set(node.id, node);
			node = node.parent;
		}
		return path;
	}
	var path = getPathToRoot(leafNodes[0]);
	for (var i = 1; i < leafNodes.length; i++) {
		var path2 = getPathToRoot(leafNodes[i]);
		path.forEach(function(node, id) {
			if (!path2.has(id)) {
				path.remove(id);
			}
		});
		// keep only those in path that are also in path2
	}
	var max = -Number.MAX_VALUE;
	var maxNode;
	path.forEach(function(n, id) {
		if (n.depth > max) {
			max = n.depth;
			maxNode = n;
		}
	});
	return maxNode;
};
// morpheus.AbstractDendrogram.computePositions = function(rootNode, positions)
// {
// if (rootNode == null) {
// return;
// }
// morpheus.AbstractDendrogram._computePositions(rootNode, positions);
// };
// /**
// * position is (left+right)/2
// */
// morpheus.AbstractDendrogram._computePositions = function(node, positions) {
// if (node.children !== undefined) {
// var children = node.children;
// var left = children[0];
// var right = children[1];
// morpheus.AbstractDendrogram._computePositions(left, positions);
// morpheus.AbstractDendrogram._computePositions(right, positions);
// morpheus.AbstractDendrogram.setIndex(node);
// node.position = (left.position + right.position) / 2;
// } else {
// node.position = positions.getItemSize(node.index) / 2
// + positions.getPosition(node.index);
// }
// };
morpheus.AbstractDendrogram.search = function(rootNode, searchText) {
	var tokens = morpheus.Util.getAutocompleteTokens(searchText);
	var clearSearch = false;
	var predicates;
	var nmatches = 0;
	if (tokens == null || tokens.length == 0) {
		clearSearch = true;
		morpheus.AbstractDendrogram.dfs(rootNode, function(node) {
			node.search = false;
			return true;
		});
		nmatches = -1;
	} else {
		predicates = morpheus.Util.createSearchPredicates({
			tokens : tokens
		});
		var npredicates = predicates.length;
		morpheus.AbstractDendrogram
				.dfs(
						rootNode,
						function(node) {
							var matches = false;
							if (node.info) {
								searchLabel: for ( var name in node.info) {
									var vals = node.info[name];
									if (node.info) {
										for (var p = 0; p < npredicates; p++) {
											var predicate = predicates[p];
											for (var i = 0, nvals = vals.length; i < nvals; i++) {
												if (predicate.accept(vals[i])) {
													matches = true;
													break searchLabel;
												}
											}

										}
									}
								}
							}
							node.search = matches;
							if (matches) {
								nmatches++;
							}
							return true;
						});

	}
	return nmatches;
};
morpheus.AbstractDendrogram.squishNonSearchedNodes = function(heatMap,
		isColumns) {
	if (isColumns) {
		heatMap.getHeatMapElementComponent().getColumnPositions().setSize(13);
	} else {
		heatMap.getHeatMapElementComponent().getRowPositions().setSize(13);
	}
	var expandedLeafNodes = {};
	var dendrogram = isColumns ? heatMap.columnDendrogram
			: heatMap.rowDendrogram;
	morpheus.AbstractDendrogram.dfs(dendrogram.tree.rootNode, function(node) {
		for (var i = node.minIndex; i <= node.maxIndex; i++) {
			if (node.search) {
				expandedLeafNodes[i] = true;
			}
		}
		return true;
	});
	var clusterIds = [];
	var previous = expandedLeafNodes[0];
	var squishedIndices = {};
	if (!previous) {
		squishedIndices[0] = true;
	}
	var clusterNumber = 0;
	clusterIds.push(clusterNumber);
	for (var i = 1, nleaves = dendrogram.tree.leafNodes.length; i < nleaves; i++) {
		var expanded = expandedLeafNodes[i];
		if (expanded !== previous) {
			clusterNumber++;
			previous = expanded;
		}
		if (!expanded) {
			squishedIndices[i] = true;
		}
		clusterIds.push(clusterNumber);
	}
	if (isColumns) {
		heatMap.getHeatMapElementComponent().getColumnPositions()
				.setSquishedIndices(squishedIndices);
		heatMap.getProject().setGroupColumns(
				[ new morpheus.SpecifiedGroupByKey(clusterIds) ], false);
	} else {
		heatMap.getHeatMapElementComponent().getRowPositions()
				.setSquishedIndices(squishedIndices);
		heatMap.getProject().setGroupRows(
				[ new morpheus.SpecifiedGroupByKey(clusterIds) ], false);
	}
};
morpheus.AbstractDendrogram.getLeafNodes = function(rootNode) {
	var leafNodes = [];
	morpheus.AbstractDendrogram.dfs(rootNode, function(node) {
		if (node.children === undefined) {
			leafNodes.push(node);
		}
		return true;
	});
	return leafNodes;
};
morpheus.Util.extend(morpheus.AbstractDendrogram, morpheus.AbstractCanvas);
morpheus.Util.extend(morpheus.AbstractDendrogram, morpheus.Events);

morpheus.CanvasUtil = function () {
};
morpheus.CanvasUtil.dragging = false;

morpheus.CanvasUtil.FONT_NAME = '"Helvetica Neue",Helvetica,Arial,sans-serif';
morpheus.CanvasUtil.FONT_COLOR = 'rgb(34, 34, 34)';
morpheus.CanvasUtil.getPreferredSize = function (c) {
	var size = c.getPreferredSize();
	var prefWidth = c.getPrefWidth();
	var prefHeight = c.getPrefHeight();
	// check for override override
	if (prefWidth !== undefined) {
		size.width = prefWidth;
	}
	if (prefHeight !== undefined) {
		size.height = prefHeight;
	}
	return size;
};
morpheus.CanvasUtil.BACKING_SCALE = 1;
if (typeof window !== 'undefined' && 'devicePixelRatio' in window) {
	if (window.devicePixelRatio > 1) {
		morpheus.CanvasUtil.BACKING_SCALE = window.devicePixelRatio;
	}
}

morpheus.CanvasUtil.setBounds = function (canvas, bounds) {
	var backingScale = morpheus.CanvasUtil.BACKING_SCALE;

	if (bounds.height != null) {
		canvas.height = bounds.height * backingScale;
		canvas.style.height = bounds.height + 'px';
	}
	if (bounds.width != null) {
		canvas.width = bounds.width * backingScale;
		canvas.style.width = bounds.width + 'px';
	}
	if (bounds.left != null) {
		canvas.style.left = bounds.left + 'px';
	}
	if (bounds.top != null) {
		canvas.style.top = bounds.top + 'px';
	}
};

morpheus.CanvasUtil.drawShape = function (context, shape, x, y, size2) {
	if (size2 < 0) {
		return;
	}
	context.beginPath();
	if (shape === 'minus') {
		context.arc(x, y, size2, 0, 2 * Math.PI, false);
		context.moveTo(x - size2, y);
		context.lineTo(x + size2, y);
	} else if (shape === 'circle') {
		context.arc(x, y, size2, 0, 2 * Math.PI, false);
	} else if (shape === 'square') {
		context.rect(x - size2, y - size2, size2 * 2, size2 * 2);
	} else if (shape === 'plus') {
		// vertical line
		context.moveTo(x, y - size2);
		context.lineTo(x, y + size2);
		// horizontal line
		context.moveTo(x - size2, y);
		context.lineTo(x + size2, y);
	} else if (shape === 'x') {
		context.moveTo(x - size2, y - size2);
		context.lineTo(x + size2, y + size2);
		context.moveTo(x + size2, y - size2);
		context.lineTo(x - size2, y + size2);
	} else if (shape === 'asterisk') {
		// x with vertical line
		context.moveTo(x - size2, y - size2);
		context.lineTo(x + size2, y + size2);
		context.moveTo(x + size2, y - size2);
		context.lineTo(x - size2, y + size2);

		context.moveTo(x, y - size2);
		context.lineTo(x, y + size2);
	} else if (shape === 'diamond') {
		// start at middle top
		context.moveTo(x, y - size2);
		// right
		context.lineTo(x + size2, y);
		// bottom
		context.lineTo(x, y + size2);
		// left
		context.lineTo(x - size2, y);
		// top
		context.lineTo(x, y - size2);
	} else if (shape === 'triangle-up') {
		// top
		context.moveTo(x, y - size2);
		// right
		context.lineTo(x + size2, y + size2);
		// left
		context.lineTo(x - size2, y + size2);
		context.lineTo(x, y - size2);
	} else if (shape === 'triangle-down') {
		// bottom
		context.moveTo(x, y + size2);
		// left
		context.lineTo(x - size2, y - size2);
		// right
		context.lineTo(x + size2, y - size2);
		context.lineTo(x, y + size2);
	} else if (shape === 'triangle-left') {
		// left
		context.moveTo(x - size2, y);
		// top
		context.lineTo(x + size2, y - size2);
		// bottom
		context.lineTo(x + size2, y + size2);
		context.lineTo(x - size2, y);
	} else if (shape === 'triangle-right') {
		// right
		context.moveTo(x + size2, y);
		// lower left
		context.lineTo(x - size2, y + size2);

		// upper left
		context.lineTo(x - size2, y - size2);
		context.lineTo(x + size2, y);
	}
	context.stroke();

};
morpheus.CanvasUtil.drawLine = function (context, x1, y1, x2, y2) {
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
};
morpheus.CanvasUtil.resetTransform = function (context) {
	context.setTransform(1, 0, 0, 1, 0, 0);
	if (morpheus.CanvasUtil.BACKING_SCALE !== 1) {
		context.scale(morpheus.CanvasUtil.BACKING_SCALE,
			morpheus.CanvasUtil.BACKING_SCALE);
	}
};
morpheus.CanvasUtil.bezierCurveTo = function (context, start, end) {
	var m1 = (start[1] + end[1]) / 2;
	context.beginPath();
	context.moveTo(start[0], start[1]);
	// context.lineTo(leftp[0], leftp[1]);
	context.bezierCurveTo(start[0], m1, end[0], m1, end[0], end[1]);
	context.stroke();
};
morpheus.CanvasUtil.createCanvas = function () {
	var $c = $('<canvas></canvas>');
	$c.attr('tabindex', '0');
	$c.css({
		cursor: 'default',
		outline: 0,
		overflow: 'hidden',
		position: 'absolute',
		'z-index': 1
	});
	return $c[0];
};
morpheus.CanvasUtil.getHeaderStringWidth = function (context, s) {
	context.font = '14px ' + morpheus.CanvasUtil.FONT_NAME;
	return context.measureText(s).width + 18;
};
morpheus.CanvasUtil.getVectorStringWidth = function (context, vector, positions,
													 end) {
	if (positions.getSize() < 6) {
		return 0;
	}
	var fontSize = Math.min(24, positions.getSize() - 2);
	if (fontSize <= 0) {
		return 0;
	}

	context.font = fontSize + 'px ' + morpheus.CanvasUtil.FONT_NAME;

	var toString = morpheus.VectorTrack.vectorToString(vector);
	var maxWidth = 0;
	// var maxWidth2 = 0;
	var n = end <= 0 ? vector.size() : Math.min(end, vector.size());
	for (var i = 0; i < n; i++) {
		var value = vector.getValue(i);
		if (value != null && value != '') {
			value = toString(value);
		} else {
			continue;
		}
		var width = context.measureText(value).width;
		if (width > maxWidth) {
			maxWidth = width;
		}
		// if (width > maxWidth2 && width < maxWidth) {
		// maxWidth2 = width;
		// }
	}
	return maxWidth > 0 ? (maxWidth + 2) : maxWidth;
};
morpheus.CanvasUtil.clipString = function (context, string, availTextWidth) {
	var textWidth = context.measureText(string).width;
	if (textWidth <= availTextWidth) {
		return string;
	}
	var clipString = '...';
	availTextWidth -= context.measureText(clipString).width;
	if (availTextWidth <= 0) {
		// can not fit any characters
		return clipString;
	}
	var width = 0;
	for (var nChars = 0, stringLength = string.length; nChars < stringLength; nChars++) {
		width += context.measureText(string[nChars]).width;
		if (width > availTextWidth) {
			string = string.substring(0, nChars);
			break;
		}
	}
	return string + clipString;
};
morpheus.CanvasUtil.toSVG = function (drawable, file) {
	var totalSize = {
		width: drawable.getWidth(),
		height: drawable.getHeight()
	};
	var context = new C2S(totalSize.width, totalSize.height);
	context.save();
	drawable.draw({
		x: 0,
		y: 0,
		width: totalSize.width,
		height: totalSize.height
	}, context);
	context.restore();
	var svg = context.getSerializedSvg();
	var blob = new Blob([svg], {
		type: 'text/plain;charset=utf-8'
	});
	saveAs(blob, file);
};
morpheus.CanvasUtil.getMousePos = function (element, event, useDelta) {
	return morpheus.CanvasUtil.getMousePosWithScroll(element, event, 0, 0,
		useDelta);
};

morpheus.CanvasUtil.getClientXY = function (event, useDelta) {
	var clientX;
	var clientY;
	if (event.pointers) {
		if (event.pointers.length > 0) {
			clientX = event.pointers[0].clientX - (useDelta ? event.deltaX : 0);
			clientY = event.pointers[0].clientY - (useDelta ? event.deltaY : 0);
		} else {
			clientX = event.srcEvent.clientX - (useDelta ? event.deltaX : 0);
			clientY = event.srcEvent.clientY - (useDelta ? event.deltaY : 0);
		}
	} else {
		clientX = event.clientX;
		clientY = event.clientY;
	}
	return {
		x: clientX,
		y: clientY
	};
};
morpheus.CanvasUtil.getMousePosWithScroll = function (element, event, scrollX,
													  scrollY, useDelta) {
	return morpheus.CanvasUtil._getMousePosWithScroll(element, scrollX,
		scrollY, morpheus.CanvasUtil.getClientXY(event, useDelta));
};

morpheus.CanvasUtil._getMousePosWithScroll = function (element, scrollX,
													   scrollY, clientXY) {
	var rect = element.getBoundingClientRect();
	return {
		x: clientXY.x - rect.left + scrollX,
		y: clientXY.y - rect.top + scrollY
	};
};

/**
 * @param {morpheus.Set} [] -
 *            options.set set of selected items
 * @see morpheus.Table
 */
morpheus.CheckBoxList = function (options) {
	var _this = this;
	var set = options.set || new morpheus.Set();
	options = $.extend(true, {}, {
		height: '150px',
		showHeader: false,
		select: false,
		search: true,
		checkBoxSelectionOnTop: false,
		rowHeader: function (item) {
			var header = [];
			// header
			// .push('<div style="overflow: hidden;text-overflow: ellipsis;"
			// class="morpheus-hover">');
			header.push('<span><input name="toggle" type="checkbox" '
				+ (set.has(_this.getter(item)) ? ' checked' : '') + '/> ');
			header.push('</span>');
			// header
			// .push('<button
			// style="background-color:inherit;position:absolute;top:0;right:0;line-height:inherit;padding:0px;margin-top:4px;"
			// class="btn btn-link morpheus-hover-show">only</button>');
			// header.push('</div>');
			return header.join('');
			// return '<span><input name="toggle"
			// type="checkbox" '
			// + (set.has(_this.getter(item)) ? ' checked' : '')
			// + '/> </span>'
		}
	}, options);
	options = morpheus.Table.createOptions(options);
	if (options.columns.length === 1) {
		options.maxWidth = 583;
	}
	var idColumn = options.columns[0];
	for (var i = 0; i < options.columns.length; i++) {
		if (options.columns[i].idColumn) {
			idColumn = options.columns[i];
			break;
		}
	}

	this.getter = idColumn.getter;
	var html = [];

	var table = new morpheus.Table(options);
	if (options.columns.length === 1) {
		options.$el.find('.slick-table-header').find('[name=right]').remove();
	}
	this.table = table;
	var html = [];
	html.push('<div style="display:inline;">');
	html.push('<div style="display:inline;" class="dropdown">');
	html
	.push('<button type="button" data-toggle="dropdown" class="btn btn-default btn-xs dropdown-toggle" aria-haspopup="true" aria-expanded="false">');
	html.push('<span class="caret"></span>');
	html.push('</button>');
	html.push('<ul style="font-size:12px;" class="dropdown-menu">');
	html.push('<li><a name="selectAll" href="#">Select All</a></li>');
	html.push('<li><a name="selectNone" href="#">Select None</a></li>');
	html.push('<li><a name="invertSel" href="#">Invert Selection</a></li>');

	html.push('</ul>');
	html.push('</div>');
	html.push('<span name="checkBoxResults" style="padding-left:6px;"></span>');
	html.push('</div>');
	var $checkBoxEl = $(html.join(''));
	table.$header.find('[name=left]').html($checkBoxEl);
	var $checkBoxResults = $checkBoxEl.find('[name=checkBoxResults]');
	var $selectAll = $checkBoxEl.find('[name=selectAll]');
	var $selectNone = $checkBoxEl.find('[name=selectNone]');
	$selectAll.on('click', function (e) {
		var items = table.getItems();
		for (var i = 0, nitems = items.length; i < nitems; i++) {
			set.add(_this.getter(items[i]));
		}
		_this.table.trigger('checkBoxSelectionChanged', {
			source: _this,
			set: set
		});
		e.preventDefault();
		_this.table.redraw();
	});
	$checkBoxEl.find('[name=invertSel]').on('click', function (e) {
		// selected become unselected, unselected become selected
		var items = table.getItems();
		for (var i = 0, nitems = items.length; i < nitems; i++) {
			var val = _this.getter(items[i]);
			if (set.has(val)) {
				set.remove(val);
			} else {
				set.add(val);
			}

		}
		_this.table.trigger('checkBoxSelectionChanged', {
			source: _this,
			set: set
		});
		e.preventDefault();
		_this.table.redraw();
	});
	$selectNone.on('click', function (e) {
		var items = table.getItems();
		for (var i = 0, nitems = items.length; i < nitems; i++) {
			set.remove(_this.getter(items[i]));
		}
		_this.table.trigger('checkBoxSelectionChanged', {
			source: _this,
			set: set
		});

		e.preventDefault();
		_this.table.redraw();
	});

	this.set = set;
	this.table = table;
	$checkBoxResults.html('selected ' + morpheus.Util.intFormat(set.size())
		+ ' of ' + morpheus.Util.intFormat(table.getAllItemCount()));

	var priorCount = 0;
	this.table.on('checkBoxSelectionChanged', function () {
		// if (options.checkBoxSelectionOnTop) {
		// var selectedItems = set.values();
		// selectedItems.sort();
		// for (var i = 0, n = selectedItems.length; i < n; i++) {
		// selectedItems[i].__selected = true;
		// }
		// var previousItems = _this.table.getItems();
		// for (var i = 0, n = previousItems.length; i < n; i++) {
		// var item = previousItems[i];
		// if (!item.__selected) {
		// selectedItems.push(item);
		// }
		// }
		//
		// var $viewport = table.$gridDiv.find('.slick-viewport');
		// var top = $viewport.scrollTop();
		//
		// _this.table.setItems(selectedItems);
		// $viewport.scrollTop(Math.max(0, top
		// + (20 * (set.size() - priorCount))));
		// priorCount = set.size();
		// }
		$checkBoxResults.html('selected ' + morpheus.Util.intFormat(set.size())
			+ ' of ' + morpheus.Util.intFormat(table.getAllItemCount()));
		_this.table.redraw();
	});

	table.on('click',
		function (e) {
			var $target = $(e.target);
			var item = table.getItems()[e.row];
			var value = _this.getter(item);
			if ($target.is('.morpheus-hover-show')) { // only
				set.clear();
				set.add(value);
				_this.table.trigger('checkBoxSelectionChanged', {
					source: _this,
					set: set
				});
			} else if (!options.select
				|| ($target.is('[type=checkbox]') && $target
				.attr('name') === 'toggle')) {
				if (set.has(value)) {
					set.remove(value);
				} else {
					set.add(value);
				}
				_this.table.trigger('checkBoxSelectionChanged', {
					source: _this,
					set: set
				});
			}

		});

};
morpheus.CheckBoxList.prototype = {
	searchWithPredicates: function (predicates) {
		this.table.searchWithPredicates(predicates);
	},
	autocomplete: function (tokens, cb) {
		this.table.autocomplete(tokens, cb);
	},
	setHeight: function (height) {
		this.table.setHeight(height);
	},
	resize: function () {
		this.table.resize();
	},
	setSearchVisible: function (visible) {
		this.table.setSearchVisible(visible);
	},
	getSelectedRows: function () {
		return this.table.getSelectedRows();
	},
	getSelectedItems: function () {
		return this.table.getSelectedItems();
	},
	setSelectedRows: function (rows) {
		this.table.setSelectedRows(rows);
	},
	getItems: function (items) {
		return this.table.getItems();
	},
	getAllItemCount: function () {
		return this.table.getAllItemCount();
	},
	getFilteredItemCount: function () {
		return this.table.getFilteredItemCount();
	},
	setFilter: function (f) {
		this.table.setFilter(f);
	},

	redraw: function () {
		this.table.redraw();
	},
	getSelection: function () {
		return this.set;
	},
	clearSelection: function (values) {
		this.set.clear();
		this.table.redraw();
	},
	setValue: function (values) {
		this.setSelectedValues(values);
	},
	setSelectedValues: function (values) {
		this.set.clear();

		if (morpheus.Util.isArray(values)) {
			for (var i = 0; i < values.length; i++) {
				this.set.add(values[i]);
			}
		} else {
			this.set.add(values);
		}
		this.table.redraw();
	},
	val: function () {
		return this.set.values();
	},
	on: function (evtStr, handler) {
		this.table.on(evtStr, handler);
		return this;
	},
	off: function (evtStr, handler) {
		this.table.off(evtStr, handler);
	},
	setItems: function (items) {
		// remove items in selection that are not in new items
		var newItems = new morpheus.Set();
		var getter = this.getter;
		for (var i = 0; i < items.length; i++) {
			newItems.add(getter(items[i]));

		}
		var selection = this.set;
		selection.forEach(function (val) {
			if (!newItems.has(val)) {
				selection.remove(val);
			}
		});

		this.table.setItems(items);
		this.table.trigger('checkBoxSelectionChanged', {
			source: this,
			set: selection
		});
	}
};

morpheus.ColumnDendrogram = function(controller, tree, positions, project) {
	morpheus.AbstractDendrogram.call(this, controller, tree, positions,
			project, morpheus.AbstractDendrogram.Type.COLUMN);
};
morpheus.ColumnDendrogram.prototype = {
	drawNode : function(context, node) {
		var radius = this.getNodeRadius(node);
		var pix = this.toPix(node);
		context.beginPath();
		context.arc(pix[0], pix[1], 4, Math.PI * 2, false);
		context.fill();
	},
	isDragHotSpot : function(p) {
		return Math.abs(this.scale(this.cutHeight) - p.y) <= 2;
	},
	preDraw : function(context, clip) {
		if (context.setLineDash) {
			context.setLineDash([ 5 ]);
		}
		context.strokeStyle = 'black';
		var ny = this.scale(this.cutHeight);
		context.beginPath();
		context.moveTo(clip.x, ny);
		context.lineTo(this.getUnscaledWidth(), ny);
		context.stroke();
		if (context.setLineDash) {
			context.setLineDash([]);
		}
	},
	createScale : function() {
		// root has the largest height, leaves the smallest height
		return d3.scale.linear().domain([ this.tree.maxHeight, 0 ]).range(
				[ 0, this.getUnscaledHeight() ]);
	},
	paintMouseOver : function(clip, context) {
		if (this.project.getHoverColumnIndex() !== -1) {
			morpheus.CanvasUtil.resetTransform(context);
			context.translate(-clip.x, 0);
			this.drawColumnBorder(context, this.positions, this.project
					.getHoverColumnIndex(), this.getUnscaledWidth());
		}
	},
	drawColumnBorder : function(context, positions, index, gridSize) {
		var size = positions.getItemSize(index);
		var pix = positions.getPosition(index);
		// top and bottom lines
		context.beginPath();
		context.moveTo(pix + size, 0);
		context.lineTo(pix + size, gridSize);
		context.stroke();
		context.beginPath();
		context.moveTo(pix, 0);
		context.lineTo(pix, gridSize);
		context.stroke();
	},
	getMaxIndex : function(clip) {
		return morpheus.Positions.getRight(clip, this.positions);
	},
	getMinIndex : function(clip) {
		return morpheus.Positions.getLeft(clip, this.positions);
	},
	getPreferredSize : function(context) {
		return {
			width : Math.ceil(this.positions.getPosition(this.positions
					.getLength() - 1)
					+ this.positions
							.getItemSize(this.positions.getLength() - 1)),
			height : 100
		};
	},
	toPix : function(node) {
		var min = this.positions.getPosition(node.minIndex)
				+ this.positions.getItemSize(node.minIndex) / 2;
		var max = this.positions.getPosition(node.maxIndex)
				+ this.positions.getItemSize(node.maxIndex) / 2;
		return [ (min + max) / 2, this.scale(node.height) ];
	},
	drawPathFromNodeToParent : function(context, node) {
		var pix = this.toPix(node);
		var parentPix = this.toPix(node.parent);
		context.beginPath();
		context.moveTo(pix[0], pix[1]);
		context.lineTo(pix[0], parentPix[1]);
		context.lineTo(parentPix[0], parentPix[1]);
		context.stroke();
	},
	drawNodePath : function(context, node, minIndex, maxIndex) {
		var children = node.children;
		var left = children[0];
		var right = children[1];
		// set up points for poly line
		var ny = this.scale(node.height);
		var rx = this.toPix(right)[0];
		var ry = this.scale(right.height);
		var lx = this.toPix(left)[0];
		var ly = this.scale(left.height);
		var x, y;
		if (!this.drawLeafNodes) {
			var leftIsLeaf = left.children !== undefined;
			var rightIsLeaf = right.children !== undefined;
			if (leftIsLeaf) {
				ly = ny + 4;
			}
			if (rightIsLeaf) {
				ry = ny + 4;
			}
			x = [ rx, rx, lx, lx ];
			y = [ ry, ny, ny, ly ];
		} else {
			x = [ rx, rx, lx, lx ];
			y = [ ry, ny, ny, ly ];
		}
		context.beginPath();
		context.moveTo(x[0], y[0]);
		for (var i = 1, length = x.length; i < length; i++) {
			context.lineTo(x[i], y[i]);
		}
		context.stroke();
	}
};
morpheus.Util.extend(morpheus.ColumnDendrogram, morpheus.AbstractDendrogram);
morpheus.ConditionalRenderingUI = function(heatmap) {
	var _this = this;
	this.heatmap = heatmap;
	var $div = $('<div class="container-fluid" style="min-width:180px;"></div>');
	$div.on('click', '[data-name=add]', function(e) {
		var $this = $(this);
		var $row = $this.closest('.morpheus-entry');
		// add after
		var index = $row.index();
		var condition = {
			series : null,
			color : 'rgb(0,0,0)',
			shape : null,
			accept : function(val) {
				return false;
			}

		};

		heatmap.heatmap.getColorScheme().getConditions().insert(index,
				condition);

		$row.after(_this.add(condition));
		e.preventDefault();
	});
	$div.on('click', '[data-name=delete]', function(e) {
		var $this = $(this);
		var $row = $this.closest('.morpheus-entry');
		var index = $row.index() - 1;
		heatmap.heatmap.getColorScheme().getConditions().remove(index);
		heatmap.revalidate();
		$row.remove();
		e.preventDefault();
	});
	var html = [];
	html
			.push('<div style="border-bottom:1px solid LightGrey" class="morpheus-entry">');
	html.push('<div class="row">');
	html
			.push('<div class="col-xs-8"><a class="btn btn-default btn-xs" role="button"' +
				' data-name="add" href="#">Add</a></div>');

	html.push('</div>');
	html.push('</div>');

	$div.append(html.join(''));
	this.$div = $div;
	heatmap.heatmap.getColorScheme().getConditions().getConditions().forEach(
			function(c) {
				_this.add(c).appendTo($div);
			});

};

morpheus.ConditionalRenderingUI.prototype = {
	add : function(condition) {
		var _this = this;
		// shape: shapes and line
		// color: if no color cell is drawn using this shape, otherwise draw
		// shape on top of cell
		// series name
		// value >= x and <= x
		var html = [];
		html.push('<div class="morpheus-entry">');
		html.push('<div class="row">');

		html.push('<form>');
		// series
		html.push('<div class="form-group">');
		html
				.push('<label for="cond_series" style="margin-right:1em;">Series</label>');
		html
				.push('<select class="form-control morpheus-form-control-inline" id="cond_series">');
		html.push(morpheus.Util.createOptions(morpheus.DatasetUtil
				.getSeriesNames(this.heatmap.getProject().getFullDataset())));
		html.push('</select>');
		html.push('</div>');

		// condition
		html.push('<div class="form-group">');
		html.push('<label style="margin-right:1em;">Condition</label>');
		html
				.push('<select class="form-control morpheus-form-control-inline" name="lower"><option value="gte">&gt;=</option><option value="gt">&gt;</option></select>');

		html
				.push('<input class="form-control morpheus-form-control-inline" name="v1" size="5" type="text">');
		html.push('<span style="margin-right:1em;">and</span>');
		html
				.push('<select class="form-control morpheus-form-control-inline" name="upper"><option value="lte">&lt;=</option><option value="lt">&lt;</option></select>');
		html
				.push('<input class="form-control morpheus-form-control-inline" name="v2" size="5" type="text">');
		html.push('</div>');

		// shape
		html.push('<div class="form-group">');
		html.push('<label style="margin-right:1em;">Shape</label>');

		var shapeField = new morpheus.ShapeField([ 'circle', 'square',
				'diamond', 'triangle-up', 'triangle-down', 'triangle-left',
				'triangle-right' ]);
		html.push('<div style="display:inline;" data-name="shapeHolder">');
		html.push('</div>');

		// color
		html.push('<div class="form-group">');
		html.push('<label style="margin-right:1em;">Color</label>');
		html
				.push('<input class="form-control" type="color" name="color" style="display:inline; width:6em;">');
		html.push('</div>');
		html.push('</div>'); // row

		// add/delete
		html
				.push('<div style="border-bottom:1px solid LightGrey" class="row">');

		html.push('<div class="col-xs-11">');
		html
				.push('<a class="btn btn-default btn-xs" role="button" data-name="delete"' +
					' href="#">Remove</a>');
		html.push('</div>');

		html.push('</div>'); // row
		html.push('</div>'); // morpheus-entry
		var $el = $(html.join(''));
		shapeField.$el.appendTo($el.find('[data-name=shapeHolder]'));
		var $color = $el.find('[name=color]');
		var $series = $el.find('[id=cond_series]');
		var $v1 = $el.find('[name=v1]');
		var $v2 = $el.find('[name=v2]');
		var $v1Op = $el.find('[name=lower]');
		var $v2Op = $el.find('[name=upper]');

		$color.val(condition.color);
		$series.val(condition.series);
		shapeField.setShapeValue(condition.shape);
		$v1.val(condition.v1);
		$v2.val(condition.v2);
		$v1Op.val(condition.v1Op);
		$v2Op.val(condition.v2Op);
		function updateAccept() {
			var v1 = parseFloat($($v1).val());
			if (isNaN(v1)) {
				v1 = -Number.MAX_VALUE;
			}

			var v2 = parseFloat($($v2).val());
			if (isNaN(v2)) {
				v2 = Number.MAX_VALUE;
			}

			var v1Op = $v1Op.val();
			var v2Op = $v2Op.val();
			var gtf = v1Op === 'gt' ? function(val) {
				return val > v1;
			} : function(val) {
				return val >= v1;
			};
			var ltf = v2Op === 'lt' ? function(val) {
				return val < v2;
			} : function(val) {
				return val <= v2;
			};
			condition.v1 = v1;
			condition.v2 = v2;
			condition.v1Op = v1Op;
			condition.v2Op = v2Op;
			condition.accept = function(val) {
				return gtf(val) && ltf(val);
			};
			_this.heatmap.revalidate();
		}
		$v1Op.on('change', function(e) {
			updateAccept();

		});
		$v2Op.on('change', function(e) {
			updateAccept();
		});
		$v1.on('keyup', _.debounce(function(e) {
			updateAccept();
		}, 100));
		$v2.on('keyup', _.debounce(function(e) {
			updateAccept();
		}, 100));

		$color.on('change', function(e) {
			condition.color = $(this).val();
			_this.heatmap.revalidate();
		});
		shapeField.on('change', function(e) {
			condition.shape = e.shape;
			_this.heatmap.revalidate();
		});
		$series.on('change', function(e) {
			condition.series = $(this).val();
			_this.heatmap.revalidate();
		});
		condition.series = $series.val();
		return $el;

	}
};

morpheus.DiscreteColorSchemeChooser = function(options) {
	var formBuilder = new morpheus.FormBuilder();
	var map = options.colorScheme.scale;
	var html = [ '<select name="colorPicker" class="selectpicker" data-live-search="true">' ];
	map.forEach(function(val, key) {
		html.push('<option');
		html.push(' value="');
		html.push(key);
		html.push('">');
		html.push(key);
		html.push('</option>');
	});
	html.push('</select>');
	formBuilder.append({
		name : 'selected_value',
		type : 'custom',
		value : html.join('')
	});
	var $select = formBuilder.$form.find('[name=colorPicker]');
	formBuilder.append({
		col : 'col-xs-2',
		name : 'selected_color',
		type : 'color'
	});
	var selectedVal = $select.val();
	var _this = this;
	var $color = formBuilder.$form.find('[name=selected_color]');
	$color.val(map.get(selectedVal));
	$color.on('change', function(e) {
		var color = $(this).val();
		map.set(selectedVal, color);
		_this.trigger('change', {
			value : selectedVal,
			color : color
		});
	});
	$select.selectpicker().change(function() {
		// var optionIndex = sel.prop("selectedIndex");
		selectedVal = $select.val();
		var c = map.get(selectedVal);
		$color.val(c);
	});
	this.$div = formBuilder.$form;
};
morpheus.DiscreteColorSchemeChooser.prototype = {
	dispose : function() {
	}
};
morpheus.Util.extend(morpheus.DiscreteColorSchemeChooser, morpheus.Events);
morpheus.DiscreteColorSupplier = function() {
	this.colorMap = new morpheus.Map();
	this.hiddenValue = 0;
	this.hiddenValues = new morpheus.Set();
	morpheus.AbstractColorSupplier.call(this);
	this.scalingMode = morpheus.HeatMapColorScheme.ScalingMode.FIXED;
};

morpheus.DiscreteColorSupplier.prototype = {
	createInstance : function() {
		return new morpheus.DiscreteColorSupplier();
	},
	/**
	 * @param.array Array of name, value, color pairs
	 */
	setColorMap : function(array) {
		this.colorMap = new morpheus.Map();
		this.colors = [];
		this.fractions = [];
		this.names = [];
		this.min = Number.MAX_VALUE;
		this.max = -Number.MAX_VALUE;
		for (var i = 0; i < array.length; i++) {
			this.colorMap.set(array[i].value, array[i].color);
			this.fractions.push(array[i].value);
			this.names.push(array[i].name);
			this.colors.push(array[i].color);
			this.min = Math.min(this.min, array[i].value);
			this.max = Math.max(this.max, array[i].value);
		}
	},
	copy : function() {
		var c = this.createInstance();
		c.names = this.names.slice(0);
		c.colorMap = new morpheus.Map();
		this.colorMap.forEach(function(color, value) {
			c.colorMap.set(value, color);
		});
		c.colors = this.colors.slice(0);
		c.fractions = this.fractions.slice(0);
		this.hiddenValues.forEach(function(val) {
			c.hiddenValues.add(val);
		});

		c.missingColor = this.missingColor;
		return c;
	},

	isStepped : function() {
		return true;
	},
	getColor : function(row, column, value) {
		if (this.hiddenValues.has(value)) {
			value = this.hiddenValue;
		}

		if (isNaN(value)) {
			return this.missingColor;
		}
		return this.colorMap.get(value);
	}
};
morpheus.Util.extend(morpheus.DiscreteColorSupplier,
		morpheus.AbstractColorSupplier);
morpheus.Divider = function(vertical) {
	morpheus.AbstractCanvas.call(this, false);
	this.vertical = vertical;
	var that = this;
	var canvas = this.canvas;
	canvas.style.cursor = vertical ? 'ew-resize' : 'ns-resize';

	if (vertical) {
		this.setBounds({
			height : 15,
			width : 4
		});

	} else {
		this.setBounds({
			height : 4,
			width : 15
		});
	}
	this.hammer = morpheus.Util.hammer(canvas, [ 'pan' ]).on('panstart',
			function(event) {
				that.trigger('resizeStart');
				morpheus.CanvasUtil.dragging = true;
			}).on('panmove', function(event) {
				if (that.vertical) {
					that.trigger('resize', {
						delta : event.deltaX
					});
				} else {
					that.trigger('resize', {
						delta : event.deltaY
					});
				}
			}).on('panend', function(event) {
				morpheus.CanvasUtil.dragging = false;
				that.trigger('resizeEnd');
			});
	this.paint();

};
morpheus.Divider.prototype = {
	dispose : function() {
		morpheus.AbstractCanvas.prototype.dispose.call(this);
		this.hammer.destroy();
	},
	getPreferredSize : function() {
		return {
			width : 3,
			height : this.getUnscaledHeight()
		};
	},
	draw : function(clip, context) {
		var width = this.getUnscaledWidth();
		var height = this.getUnscaledHeight();
		context.clearRect(0, 0, width, height);
		context.strokeStyle = 'black';
		if (!this.vertical) {// horizontal line at top
			context.beginPath();
			context.moveTo(0, 1.5);
			context.lineTo(width, 1.5);
			context.stroke();
		} else { // vertical line at left
			context.beginPath();
			context.moveTo(0, 0);
			context.lineTo(0, height);
			context.stroke();
		}
	}
};
morpheus.Util.extend(morpheus.Divider, morpheus.AbstractCanvas);
morpheus.Util.extend(morpheus.Divider, morpheus.Events);
morpheus.DualList = function(leftOptions, rightOptions) {
	var html = [];
	html.push('<div class="container-fluid">');
	html.push('<div class="row">');
	html.push('<div class="col-xs-4"><label>Available Fields</label></div>');
	html.push('<div class="col-xs-2"></div>');
	html.push('<div class="col-xs-4"><label>Selected Fields</label></div>');
	html.push('</div>'); // row
	html.push('<div class="row">');
	html
			.push('<div class="col-xs-4"><select class="form-control" name="left" multiple></select></div>');
	html
			.push('<div class="col-xs-2"><div class="btn-group-vertical" role="group">'
					+ '<button name="add" type="button" class="btn btn-xs btn-default">Add</button>'
					+ '<button name="remove" type="button" class="btn btn-xs btn-default">Remove</button>'
					+ '<button name="up" type="button" class="btn btn-xs btn-default">Move Up</button>'
					+ '<button name="down" type="button" class="btn btn-xs btn-default">Move Down</button>'
					+ '</div></div>');
	html
			.push('<div class="col-xs-4"><select class="form-control" name="right" multiple></select></div>');
	html.push('</div>'); // row
	html.push('</div>');
	this.$el = $(html.join(''));
	var _this = this;
	this.$el.find('[name=add]').on('click', function() {
		_this.addSelected();
	});
	this.$el.find('[name=remove]').on('click', function() {
		_this.removeSelected();
	});
	this.$el.find('[name=up]').on('click', function() {
		_this.moveUp();
	});
	this.$el.find('[name=down]').on('click', function() {
		_this.moveDown();
	});
	this.left = this.$el.find('[name=left]')[0];
	this.right = this.$el.find('[name=right]')[0];
	for (var i = 0; i < leftOptions.length; i++) {
		this.left.options[i] = leftOptions[i];
	}
	for (var i = 0; i < rightOptions.length; i++) {
		this.right.options[i] = rightOptions[i];
	}
};

morpheus.DualList.prototype = {
	addSelected : function() {
		var left = this.left;
		var right = this.right;
		for (var i = 0; i < left.options.length; i++) {
			if (left.options[i].selected) {
				var opt = left.options[i];
				right.options[right.options.length] = new Option(opt.innerHTML,
						opt.value);
				left.options[i] = null;
				i--;
			}
		}
	},
	addAll : function() {
		var left = this.left;
		var right = this.right;
		for (var i = 0; i < left.options.length; i++) {
			var opt = left.options[i];
			right.options[right.options.length] = new Option(opt.innerHTML,
					opt.value);
		}
		left.options.length = 0;
	},
	removeSelected : function() {
		var left = this.left;
		var right = this.right;
		for (var i = 0; i < right.options.length; i++) {
			if (right.options[i].selected) {
				var opt = right.options[i];
				left.options[left.options.length] = new Option(opt.innerHTML,
						opt.value);
				right.options[i] = null;
				i--;
			}
		}
	},
	getOptions : function(isLeft) {
		var sel = isLeft ? this.left : this.right;
		var options = [];
		for (var i = 0; i < sel.options.length; i++) {
			options.push(sel.options[i].value);
		}
		return options;
	},
	removeAll : function() {
		var left = this.left;
		var right = this.right;
		for (var i = 0; i < right.options.length; i++) {
			var opt = right.options[i];
			left.options[left.options.length] = new Option(opt.innerHTML,
					opt.value);
		}
		right.options.length = 0;
	},
	moveUp : function() {
		var right = this.right;
		var selectedOptions = right.selectedOptions;
		var indices = [];
		for (var i = 0; i < selectedOptions.length; i++) {
			indices.push(selectedOptions[i].index);
		}
		var index = morpheus.Util.indexSort(indices, false);
		for (var i = 0; i < selectedOptions.length; i++) {
			var sel = selectedOptions[index[i]].index;
			var optHTML = right.options[sel].innerHTML;
			var optVal = right.options[sel].value;
			var opt1HTML = right.options[sel - 1].innerHTML;
			var opt1Val = right.options[sel - 1].value;
			right.options[sel] = new Option(opt1HTML, opt1Val);
			right.options[sel - 1] = new Option(optHTML, optVal);
			right.options.selectedIndex = sel - 1;
		}

	},
	moveDown : function() {
		var right = this.right;
		var selectedOptions = right.selectedOptions;
		var indices = [];
		for (var i = 0; i < selectedOptions.length; i++) {
			indices.push(selectedOptions[i].index);
		}
		var index = morpheus.Util.indexSort(indices, false);
		for (var i = 0; i < selectedOptions.length; i++) {
			var sel = selectedOptions[index[i]].index;
			var optHTML = right.options[sel].innerHTML;
			var optVal = right.options[sel].value;
			var opt1HTML = right.options[sel + 1].innerHTML;
			var opt1Val = right.options[sel + 1].value;
			right.options[sel] = new Option(opt1HTML, opt1Val);
			right.options[sel + 1] = new Option(optHTML, optVal);
			right.options.selectedIndex = sel + 1;
		}
	}
};
morpheus.FilterUI = function(project, isColumns) {
	var _this = this;
	this.project = project;
	this.isColumns = isColumns;
	var $div = $('<div style="min-width:180px;"></div>');
	this.$div = $div;
	$div.append(this.addBase());
	var $filterMode = $div.find('[name=filterMode]');
	$filterMode.on('change', function(e) {
		var isAndFilter = $filterMode.prop('checked');
		(isColumns ? project.getColumnFilter() : project.getRowFilter())
				.setAnd(isAndFilter);
		isColumns ? _this.project.setColumnFilter(_this.project
				.getColumnFilter(), true) : _this.project.setRowFilter(
				_this.project.getRowFilter(), true);
		e.preventDefault();
	});

	$div.on('click', '[data-name=add]', function(e) {
		var $this = $(this);
		var $row = $this.closest('.morpheus-entry');
		// add after
		var index = $row.index();
		var newFilter = new morpheus.AlwaysTrueFilter();
		(isColumns ? project.getColumnFilter() : project.getRowFilter())
				.insert(index, newFilter);
		$row.after(_this.add(newFilter));
		e.preventDefault();
	});
	$div.on('click', '[data-name=delete]', function(e) {
		var $this = $(this);
		var $row = $this.closest('.morpheus-entry');
		var index = $row.index() - 1;
		(isColumns ? project.getColumnFilter() : project.getRowFilter())
				.remove(index);
		$row.remove();
		isColumns ? _this.project.setColumnFilter(_this.project
				.getColumnFilter(), true) : _this.project.setRowFilter(
				_this.project.getRowFilter(), true);
		e.preventDefault();
	});
	$div.on('submit', 'form', function(e) {
		var $this = $(this);
		e.preventDefault();
	});
	$div.on('change', '[name=by]', function(e) {
		var $this = $(this);
		var fieldName = $this.val();
		var $row = $this.closest('.morpheus-entry');
		var index = $row.index() - 1;
		_this.createFilter({
			fieldName : fieldName,
			$div : $this
		});

		isColumns ? _this.project.setColumnFilter(_this.project
				.getColumnFilter(), true) : _this.project.setRowFilter(
				_this.project.getRowFilter(), true);
	});
	// show initial filters
	var combinedFilter = (isColumns ? project.getColumnFilter() : project
			.getRowFilter());
	var filters = combinedFilter.getFilters ? combinedFilter.getFilters() : [];
	for (var i = 0; i < filters.length; i++) {
		this.createFilter({
			filter : filters[i]
		});
	}
	if (combinedFilter.on) {
		combinedFilter.on('add', function(e) {
			_this.createFilter({
				filter : e.filter
			});
		});
		combinedFilter.on('remove', function(e) {
			// offset of 1 for header
			var $row = $div.find('.morpheus-entry')[1 + e.index].remove();
		});
		combinedFilter.on('and', function(e) {
			$filterMode.prop('checked', e.source.isAnd());
		});

	}
};

morpheus.FilterUI.rangeFilter = function(project, name, isColumns, $ui, filter) {
	$ui.empty();
	var html = [];
	html.push('<label>Range of values</label><br />');
	html
			.push('<label>>= </label> <input style="max-width:200px;" class="form-control input-sm" name="min" type="text" />');
	html
			.push('<label> and <= </label> <input style="max-width:200px;" class="form-control input-sm" name="max" type="text" />');
	html.push('<br /><a data-name="switch" href="#">Switch to top filter</a>');
	var $form = $(html.join(''));
	$form.appendTo($ui);
	$ui.find('[data-name=switch]')
			.on(
					'click',
					function(e) {
						e.preventDefault();
						var newFilter = morpheus.FilterUI.topFilter(project,
								name, isColumns, $ui);
						var index = -1;
						var filters = isColumns ? project.getColumnFilter()
								.getFilters() : project.getRowFilter()
								.getFilters();
						for (var i = 0; i < filters.length; i++) {
							if (filters[i] === filter) {
								index = i;
								break;
							}
						}
						if (index === -1) {
							throw new Error('Filter not found.');
						}
						(isColumns ? project.getColumnFilter() : project
								.getRowFilter()).set(index, newFilter);
						isColumns ? project.setColumnFilter(project
								.getColumnFilter(), true) : project
								.setRowFilter(project.getRowFilter(), true);
					});
	var $min = $ui.find('[name=min]');
	var $max = $ui.find('[name=max]');
	if (!filter) {
		filter = new morpheus.RangeFilter(-Number.MAX_VALUE, Number.MAX_VALUE,
				name);
	} else {
		$min.val(filter.min);
		$max.val(filter.max);
	}

	$min.on('keyup', _.debounce(function(e) {
		filter.setMin(parseFloat($.trim($(this).val())));
		isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
				: project.setRowFilter(project.getRowFilter(), true);

	}, 100));
	$max.on('keyup', _.debounce(function(e) {
		filter.setMax(parseFloat($.trim($(this).val())));
		isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
				: project.setRowFilter(project.getRowFilter(), true);

	}, 100));

	return filter;

};
morpheus.FilterUI.topFilter = function(project, name, isColumns, $ui, filter) {
	$ui.empty();
	var html = [];
	html.push('<label>Top</label><br />');
	html
			.push('<select style="width:auto;" class="form-control input-sm" name="direction"><option value="Top">Top</option><option value="Bottom">Bottom</option><option value="TopBottom">Top/Bottom</option></select>');
	html
			.push(' <label>N </label> <input style="max-width:200px;" class="form-control input-sm" name="n" type="text" />');
	html.push('<br /><a data-name="switch" href="#">Switch to range filter</a>');
	var $form = $(html.join(''));
	$form.appendTo($ui);
	var $n = $ui.find('[name=n]');
	var $direction = $ui.find('[name=direction]');
	$ui.find('[data-name=switch]')
			.on(
					'click',
					function(e) {
						e.preventDefault();
						var newFilter = morpheus.FilterUI.rangeFilter(project,
								name, isColumns, $ui);
						var index = -1;
						var filters = isColumns ? project.getColumnFilter()
								.getFilters() : project.getRowFilter()
								.getFilters();
						for (var i = 0; i < filters.length; i++) {
							if (filters[i] === filter) {
								index = i;
								break;
							}
						}
						if (index === -1) {
							throw new Error('Filter not found.');
						}
						(isColumns ? project.getColumnFilter() : project
								.getRowFilter()).set(index, newFilter);
						isColumns ? project.setColumnFilter(project
								.getColumnFilter(), true) : project
								.setRowFilter(project.getRowFilter(), true);
					});
	if (!filter) {
		filter = new morpheus.TopNFilter(NaN, morpheus.TopNFilter.TOP, name);
	} else {
		var dirVal;
		if (filter.direction === morpheus.TopNFilter.TOP) {
			dirVal = 'Top';
		} else if (filter.direction === morpheus.TopNFilter.BOTTOM) {
			dirVal = 'Bottom';
		} else {
			dirVal = 'TopBottom';
		}
		$direction.val(dirVal);
		$n.val(filter.n);
	}

	$direction.on('change', function() {
		var dir = $(this).val();
		var dirVal;
		if (dir === 'Top') {
			dirVal = morpheus.TopNFilter.TOP;
		} else if (dir === 'Bottom') {
			dirVal = morpheus.TopNFilter.BOTTOM;
		} else {
			dirVal = morpheus.TopNFilter.TOP_BOTTOM;
		}
		filter.setDirection(dirVal);

		isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
				: project.setRowFilter(project.getRowFilter(), true);
	});
	$n.on('keyup', _.debounce(function(e) {
		filter.setN(parseInt($.trim($(this).val())));
		isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
				: project.setRowFilter(project.getRowFilter(), true);

	}, 100));

	return filter;
};
morpheus.FilterUI.prototype = {
	/**
	 * 
	 * @param options
	 *            options.$div div to add filter to or null to add to end
	 *            options.filter Pre-existing filter or null to create filter
	 *            options.fieldName Field name to filter on
	 */
	createFilter : function(options) {
		var index = -1;
		var $div = options.$div;
		var isColumns = this.isColumns;
		var filter = options.filter;
		var project = this.project;
		var fieldName = filter ? filter.name : options.fieldName;
		var $ui;
		if (!$div) {
			// add filter to end
			var $add = $(this.add(filter));
			$add.appendTo(this.$div);
			$ui = $add.find('[data-name=ui]');
		} else { // existing $div
			var $row = $div.closest('.morpheus-entry');
			index = $row.index() - 1;
			$ui = $row.find('[data-name=ui]');
		}

		$ui.empty();
		var vector = (isColumns ? this.project.getFullDataset()
				.getColumnMetadata() : this.project.getFullDataset()
				.getRowMetadata()).getByName(fieldName);

		if (filter instanceof morpheus.RangeFilter) {
			morpheus.FilterUI.rangeFilter(project, fieldName, isColumns, $ui,
					filter);
		} else if (filter instanceof morpheus.TopNFilter) {
			morpheus.FilterUI.topFilter(project, fieldName, isColumns, $ui,
					filter);
		} else if (filter == null && morpheus.VectorUtil.isNumber(vector)
				&& morpheus.VectorUtil.containsMoreThanNValues(vector, 9)) {
			filter = morpheus.FilterUI.rangeFilter(project, fieldName,
					isColumns, $ui, filter);
		} else {
			var set = morpheus.VectorUtil.getSet(vector);
			var array = set.values();
			array.sort(morpheus.SortKey.ASCENDING_COMPARATOR);
			if (!filter) {
				filter = new morpheus.VectorFilter(new morpheus.Set(), set
						.size(), fieldName);
			} else {
				filter.maxSetSize = array.length;
			}

			var checkBoxList = new morpheus.CheckBoxList({
				responsive : false,
				$el : $ui,
				items : array,
				set : filter.set
			});
			checkBoxList.on('checkBoxSelectionChanged', function() {
				isColumns ? project.setColumnFilter(project.getColumnFilter(),
						true) : project.setRowFilter(project.getRowFilter(),
						true);

			});
		}
		if (index !== -1) {
			// set the filter index
			if (fieldName !== '') {
				(isColumns ? project.getColumnFilter() : project.getRowFilter())
						.set(index, filter);
			} else {
				(isColumns ? project.getColumnFilter() : project.getRowFilter())
						.set(index, new morpheus.AlwaysTrueFilter());
			}
		}
		return filter;
	},

	addBase : function() {
		var html = [];
		html
				.push('<div style="padding-bottom:2px;border-bottom:1px solid #eee" class="morpheus-entry">');
		html.push('<div class="row">');
		html
				.push('<div class="col-xs-12">'
						+ '<div class="checkbox"><label><input type="checkbox" name="filterMode">Pass all filters</label></div> '

						+ '</div>');
		html.push('</div>');
		html.push('<div class="row">');
		html
				.push('<div class="col-xs-8"><a class="btn btn-default btn-xs" role="button"' +
					' data-name="add" href="#">Add</a></div>');

		html.push('</div>');
		html.push('</div>');
		return html.join('');
	},
	add : function(filter) {
		var project = this.project;
		var isColumns = this.isColumns;
		var fields = morpheus.MetadataUtil.getMetadataNames(isColumns ? project
				.getFullDataset().getColumnMetadata() : project
				.getFullDataset().getRowMetadata());
		var html = [];
		html.push('<div class="morpheus-entry">');

		html.push('<div class="form-group">');
		html.push('<label>Field</label>');
		// field

		html
				.push('<select style="max-width:160px;overflow-x:hidden;" name="by" class="form-control input-sm">');
		html.push('<option value=""></option>');
		var filterField = filter ? filter.toString() : null;

		_.each(fields, function(field) {
			html.push('<option value="' + field + '"');
			if (field === filterField) {
				html.push(' selected');
			}
			html.push('>');
			html.push(field);
			html.push('</option>');
		});
		html.push('</select>');
		html.push('</div>');
		html.push('<div class="row">');
		// filter ui
		html.push('<div data-name="ui" class="col-xs-12"></div>');
		html.push('</div>');

		// end filter ui

		// add/delete
		html
				.push('<div style="padding-bottom:6px; border-bottom:1px solid #eee" class="row">');

		html.push('<div class="col-xs-11">');

		html
				.push('<a class="btn btn-default btn-xs" role="button" data-name="delete"' +
					' href="#">Remove</a>');
		html.push('</div>');

		html.push('</div>'); // row
		html.push('</div>'); // morpheus-entry
		return html.join('');
	}
};

morpheus.FormBuilder = function (options) {
	var that = this;
	this.prefix = _.uniqueId('form');
	this.$form = $('<form></form>');
	this.$form.attr('role', 'form').attr('id', this.prefix);
	this.vertical = options && options.vertical;
	if (!this.vertical) {
		this.titleClass = 'col-xs-12 control-label';
		this.labelClass = 'col-xs-4 control-label';
		this.$form.addClass('form-horizontal');
	} else {
		this.labelClass = 'control-label';
		this.titleClass = 'control-label';
	}
	this.$form.on('submit', function (e) {
		e.preventDefault();
	});
	this.$form.on(
		'dragover',
		function (e) {
			var node = $(e.originalEvent.srcElement).parent().parent()
			.prev();
			if (node.is('select') && node.hasClass('file-input')) {
				$(e.originalEvent.srcElement).parent().css('border',
					'1px solid black');
				e.preventDefault();
				e.stopPropagation();
			}
		}).on(
		'dragenter',
		function (e) {
			var node = $(e.originalEvent.srcElement).parent().parent()
			.prev();
			if (node.is('select') && node.hasClass('file-input')) {
				$(e.originalEvent.srcElement).parent().css('border',
					'1px solid black');
				e.preventDefault();
				e.stopPropagation();
			}
		}).on('dragleave', function (e) {
		var node = $(e.originalEvent.srcElement).parent().parent().prev();
		if (node.is('select') && node.hasClass('file-input')) {
			$(e.originalEvent.srcElement).parent().css('border', '');
			e.preventDefault();
			e.stopPropagation();
		}
	}).on('drop', function (e) {
		var node = $(e.originalEvent.srcElement).parent().parent().prev();
		if (node.is('select') && node.hasClass('file-input')) {
			var isMultiple = node.data('multiple'); // multiple files?
			$(e.originalEvent.srcElement).parent().css('border', '');
			var name = node.attr('name');
			name = name.substring(0, name.length - '_picker'.length);
			if (e.originalEvent.dataTransfer) {
				if (e.originalEvent.dataTransfer.files.length) {
					e.preventDefault();
					e.stopPropagation();
					var files = e.originalEvent.dataTransfer.files;
					that.setValue(name, isMultiple ? files : files[0]);
					that.trigger('change', {
						name: name,
						value: files[0]
					});
				} else {
					var url = e.originalEvent.dataTransfer.getData('URL');
					e.preventDefault();
					e.stopPropagation();
					that.setValue(name, isMultiple ? [url] : url);
					that.trigger('change', {
						name: name,
						value: url
					});
				}
			}
		}
	});
	// this.labelColumnDef = '4';
	// this.fieldColumnDef = '8';
};

morpheus.FormBuilder.showProgressBar = function (options) {
	var content = [];
	content.push('<div class="container-fluid">');
	content.push('<div class="row">');
	content.push('<div class="col-xs-8">');
	content
	.push('<div class="progress progress-striped active"><div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div>');
	content.push('</div>'); // col
	content.push('<div class="col-xs-2">');
	content
	.push('<input class="btn btn-default" type="button" name="stop" value="Cancel">');
	content.push('</div>'); // col
	content.push('</div>'); // row
	if (options.subtitle) {
		content.push('<div class="row"><div class="col-xs-8">');
		content.push('<p class="text-muted">');
		content.push(options.subtitle);
		content.push('</p>');
		content.push('</div></div>');
	}
	content.push('</div>');
	var $content = $(content.join(''));
	$content.find('[name=stop]').on('click', function (e) {
		options.stop();
		e.preventDefault();
	});
	return morpheus.FormBuilder.showInDraggableDiv({
		title: options.title,
		$content: $content
	});
};
morpheus.FormBuilder.showInDraggableDiv = function (options) {
	var width = options.width || '300px';
	var html = [];
	html
	.push('<div style="top: 100px; position:absolute; padding-left:10px; padding-right:10px; width:'
		+ width
		+ ' ; background:white; box-shadow: 0 5px 15px rgba(0,0,0,0.5); border: 1px solid rgba(0,0,0,0.2); border-radius: 6px;">');

	html
	.push('<h4 style="cursor:move; border-bottom: 1px solid #e5e5e5;" name="header">'
		+ options.title + '</h4>');
	html.push('<div name="content"></div>');
	html.push('</div>');

	var $div = $(html.join(''));
	var $content = $div.find('[name=content]');
	$div.find('[name=header]').on('dblclick', function () {
		if ($content.css('display') === 'none') {
			$content.css('display', '');
		} else {
			$content.css('display', 'none');
		}
	});

	options.$content.appendTo($content);
	$div.css('left', ($(window).width() / 2) - $content.outerWidth() / 2);
	$div.draggable({
		handle: '[name=header]',
		containment: 'document'
	});
	// $div.resizable();
	$div.appendTo($(document.body));
	return $div;
};

morpheus.FormBuilder.promptForDataset = function (cb) {
	var formBuilder = new morpheus.FormBuilder();
	formBuilder.append({
		name: 'file',
		value: '',
		type: 'file',
		required: true,
		help: morpheus.DatasetUtil.DATASET_FILE_FORMATS
	});
	var $modal;
	formBuilder.on('change', function (e) {
		var value = e.value;
		if (value !== '' && value != null) {
			$modal.modal('hide');
			$modal.remove();
			cb(value);
		}
	});
	$modal = morpheus.FormBuilder.showInModal({
		title: 'Dataset',
		html: formBuilder.$form,
		close: false
	});
};

morpheus.FormBuilder.showMessageModal = function (options) {
	var $div = morpheus.FormBuilder
	._showInModal({
		z: options.z,
		title: options.title,
		html: options.html,
		footer: ('<button type="button" class="btn btn-default"' +
		' data-dismiss="modal">OK</button>'),
		backdrop: options.backdrop,
		size: options.size
	});
	$div.find('button').focus();
	return $div;

	// if (options.draggable) {
	// $div.draggable({
	// handle : $div.find(".modal-header")
	// });
	// }
};

morpheus.FormBuilder._showInModal = function (options) {
	var html = [];
	options = $.extend({}, {
		size: ''
	}, options);
	html.push('<div class="modal" role="dialog" aria-hidden="false"');
	if (options.z) {
		html.push(' style="z-index: ' + options.z + ' !important;"');
	}
	html.push('>');
	html.push('<div class="modal-dialog ' + options.size + '">');
	html.push('<div class="modal-content">');
	html.push(' <div class="modal-header">');
	html
	.push('  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>');
	if (options.title != null) {
		html.push('<h4 class="modal-title">' + options.title + '</h4>');
	}
	html.push('</div>');
	html.push('<div class="modal-body">');
	html.push('</div>');
	if (options.footer) {
		html.push('<div class="modal-footer">');
		html.push(options.footer);
	}
	html.push('</div>');
	html.push('</div>');
	html.push('</div>');
	html.push('</div>');
	var $div = $(html.join(''));
	$div.on('mousewheel', function (e) {
		e.stopPropagation();
	});
	$div.find('.modal-body').html(options.html);
	$div.prependTo($(document.body));
	$div.modal({
		backdrop: options.backdrop === true ? true : false,
	}).on('hidden.bs.modal', function (e) {
		$div.remove();
		if (options.onClose) {
			options.onClose();
		}
	});
	return $div;
};
morpheus.FormBuilder.showInModal = function (options) {
	var $div = morpheus.FormBuilder
	._showInModal({
		z: options.z,
		title: options.title,
		html: options.html,
		footer: options.close ? ('<button type="button" class="btn btn-default" data-dismiss="modal">'
		+ options.close + '</button>')
			: null,
		onClose: options.callback,
		backdrop: options.backdrop,
		size: options.size
	});
	return $div;
	// if (options.draggable) {
	// $div.draggable({
	// handle : $div.find(".modal-header")
	// });
	// }
};

morpheus.FormBuilder.showOkCancel = function (options) {
	options = $.extend({}, {
		ok: true
	}, options);
	var footer = [];
	if (options.ok) {
		footer
		.push('<button name="ok" type="button" class="btn btn-default">OK</button>');
	}
	if (options.apply) {
		footer
		.push('<button name="apply" type="button" class="btn btn-default">Apply</button>');
	}
	footer
	.push('<button name="cancel" type="button" data-dismiss="modal" class="btn btn-default">Cancel</button>');
	var $div = morpheus.FormBuilder._showInModal({
		title: options.title,
		html: options.content,
		footer: footer.join(''),
		onClose: options.hiddenCallback,
		size: options.size
	});
	// if (options.align === 'right') {
	// $div.css('left', $(window).width()
	// - $div.find('.modal-content').width() - 60);
	// }
	var $ok = $div.find('[name=ok]');
	$ok.on('click', function (e) {
		options.okCallback();
		$div.modal('hide');
	});
	if (options.focus) {
		$ok.focus();
	}

	if (options.draggable) {
		$div.draggable({
			handle: '.modal-header',
			containment: 'document'
		});
	}
	return $div;
};

morpheus.FormBuilder.hasChanged = function (object, keyToUIElement) {
	var keys = _.keys(keyToUIElement);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = object[key];
		var $element = keyToUIElement[key];
		if (value !== morpheus.FormBuilder.getValue($element)) {
			return true;
		}
	}
	return false;
};
morpheus.FormBuilder.getValue = function ($element) {
	var list = $element.data('morpheus.checkbox-list');
	if (list != null) {
		return list.val();
	}
	if ($element.attr('type') === 'radio') {
		return $element.filter(':checked').val();
	}
	if ($element.data('type') === 'file') {
		return $element.data('files');
	}
	return $element.attr('type') === 'checkbox' ? $element.prop('checked') ? true
		: false
		: $element.val();
};

// morpheus.FormBuilder._showInModal = function(title, stuff, footer,
// hiddenCallback) {
// var html = [];
// var id = _.uniqueId('dialog');
// html.push('<div id="' + id + '">');
// $(document.body).prepend(html.join(''));
// $('#' + id).html(stuff);
// $('#' + id).dialog({
// modal : true,
// resizable : true,
// height : 'auto',
// width : 400
// }).on('close', function(e) {
// $(this).dialog('destroy');
// $(this).remove();
// if (hiddenCallback) {
// hiddenCallback();
// }
// });
// return id;
// };
morpheus.FormBuilder.prototype = {
	appendContent: function ($content) {
		this.$form.append($content);
	},
	addSeparator: function () {
		var html = [];
		html.push('<div class="form-group">');
		if (!this.vertical) {
			html.push('<div class="col-xs-12">');
		}
		html.push('<hr />');
		if (!this.vertical) {
			html.push('</div>');
		}
		html.push('</div>');
		this.$form.append(html.join(''));
	},
	_append: function (html, field, isFieldStart) {
		var that = this;
		var required = field.required;
		var name = field.name;
		var type = field.type;
		if (type == 'separator') {
			html.push(this.vertical ? '<div class="form-group"></div>'
				: '<div class="col-xs-12">');
			html.push('<hr />');
			html.push('</div>');
			return;
		}
		var title = field.title;
		var disabled = field.disabled;
		var help = field.help;
		var value = field.value;
		var showLabel = field.showLabel;
		var col = '';
		var labelColumn = '';
		if (!this.vertical) {
			col = field.col || 'col-xs-8';
		}
		if (showLabel === undefined) {
			showLabel = 'checkbox' !== type && 'button' !== type
				&& 'radio' !== type;
			showLabel = showLabel || field.options !== undefined;
		}
		var id = that.prefix + '_' + name;
		if (title === undefined) {
			title = name.replace(/_/g, ' ');
			title = title[0].toUpperCase() + title.substring(1);
		}
		if (showLabel) {
			html.push('<label for="' + id + '" class="' + this.labelClass
				+ '">');
			html.push(title);
			html.push('</label>');
			if (isFieldStart) {
				html.push('<div class="' + col + '">');
			}
		} else if (isFieldStart && !this.vertical) {
			html.push('<div class="col-xs-offset-4 ' + col + '">');
		}
		if ('radio' === type) {
			if (field.options) {
				_.each(field.options,
					function (choice) {
						var isChoiceObject = _.isObject(choice)
							&& choice.value !== undefined;
						var optionValue = isChoiceObject ? choice.value
							: choice;
						var optionText = isChoiceObject ? choice.name
							: choice;
						var selected = value === optionValue;
						html.push('<div class="radio"><label>');
						html.push('<input value="' + optionValue
							+ '" name="' + field.name
							+ '" type="radio"');
						if (selected) {
							html.push(' checked');
						}
						html.push('> ');
						if (choice.icon) {
							html.push('<span class="' + choice.icon
								+ '"></span> ');
						}
						optionText = optionText[0].toUpperCase()
							+ optionText.substring(1);
						html.push(optionText);
						html.push('</label></div>');
					});
			} else {
				html.push('<div class="radio"><label>');
				html.push('<input value="' + value + '" name="' + name
					+ '" id="' + id + '" type="radio"');
				if (field.checked) {
					html.push(' checked');
				}
				html.push('> ');
				html.push(value[0].toUpperCase() + value.substring(1));
				html.push('</label></div>');
			}
		} else if ('checkbox' === type) {
			html.push('<div class="checkbox"><label>');
			html.push('<input name="' + name + '" id="' + id
				+ '" type="checkbox"');
			if (value) {
				html.push(' checked');
			}
			html.push('> ');
			html.push(title);
			html.push('</label></div>');
		} else if ('checkbox-list' === type) {
			html.push('<div name="' + name + '" class="checkbox-list"><div>');
		} else if ('select' == type || type == 'bootstrap-select') {
			// if (field.multiple) {
			// field.type = 'bootstrap-select';
			// type = 'bootstrap-select';
			// }
			if (type == 'bootstrap-select') {
				html.push('<select data-live-search="' + (field.search ? true : false) + '" data-selected-text-format="count" name="'
					+ name + '" id="' + id
					+ '" class="selectpicker form-control"');
			} else {
				html.push('<select name="' + name + '" id="' + id
					+ '" class="form-control"');
			}
			if (disabled) {
				html.push(' disabled');
			}
			if (field.multiple) {
				html.push(' multiple');
			}
			html.push('>');
			_.each(field.options, function (choice) {
				if (choice && choice.divider) {
					html.push('<option data-divider="true"></option>');
				} else {
					html.push('<option value="');
					var isChoiceObject = _.isObject(choice)
						&& choice.value !== undefined;
					var optionValue = isChoiceObject ? choice.value : choice;
					var optionText = isChoiceObject ? choice.name : choice;
					html.push(optionValue);
					html.push('"');
					var selected = false;
					if (_.isObject(value)) {
						selected = value[optionValue];
					} else {
						selected = value == optionValue;
					}
					if (selected) {
						html.push(' selected');
					}
					html.push('>');
					html.push(optionText);
					html.push('</option>');
				}
			});
			html.push('</select>');
			if (field.type == 'bootstrap-select' && field.toggle) {
				html.push('<p class="help-block"><a data-name="' + name
					+ '_all" href="#">All</a>&nbsp;|&nbsp;<a data-name="' + name
					+ '_none" href="#">None</a></p>');
				that.$form.on('click', '[data-name=' + name + '_all]',
					function (evt) {
						evt.preventDefault();
						var $select = that.$form
						.find('[name=' + name + ']');
						$select.selectpicker('val', $.map($select
						.find('option'), function (o) {
							return $(o).val();
						}));
						$select.trigger('change');
					});
				that.$form.on('click', '[data-name=' + name + '_none]',
					function (evt) {
						evt.preventDefault();
						var $select = that.$form
						.find('[name=' + name + ']');
						$select.selectpicker('val', []);
						$select.trigger('change');
					});
			}
		} else if ('textarea' == type) {
			html.push('<textarea id="' + id + '" class="form-control" name="'
				+ name + '"');
			if (required) {
				html.push(' required');
			}
			if (field.placeholder) {
				html.push(' placeholder="' + field.placeholder + '"');
			}
			if (disabled) {
				html.push(' disabled');
			}
			html.push('>');
			if (value != null) {
				html.push(value);
			}
			html.push('</textarea>');
		} else if ('button' == type) {
			html.push('<button id="' + id + '" name="' + name
				+ '" type="button" class="btn btn-default btn-sm">');
			if (field.icon) {
				html.push('<span class="' + field.icon + '"></span> ');
			}
			html.push(value ? value : title);
			html.push('</button>');
		} else if ('custom' === type) {
			html.push(value);
		} else if ('file' === type) {
			var isMultiple = field.multiple;
			html
			.push('<select data-multiple="'
				+ isMultiple
				+ '" data-type="file" title="'
				+ (field.placeholder || (isMultiple ? 'Choose one or more files...'
					: 'Choose a file...'))
				+ '" name="'
				+ name
				+ '_picker" data-width="35%" class="file-input selectpicker form-control">');
			var npre = 1;
			var options = [];

			if (field.options) {
				options = options.concat(field.options);
				npre = 1 + field.options.length;
			}
			// data types are file, dropbox, url, and predefined
			options.push('My Computer');
			options.push('URL');
			if (typeof Dropbox !== 'undefined') {
				options.push('Dropbox');
			}
			_.each(options, function (choice, index) {
				var isChoiceObject = _.isObject(choice)
					&& choice.value !== undefined;
				var optionValue = isChoiceObject ? choice.value : choice;
				var optionText = isChoiceObject ? choice.name : choice;
				html.push('<option value="');
				html.push(optionValue);
				html.push('"');
				if (isChoiceObject && choice.disabled) {
					html.push(' disabled');
				}
				if (optionValue === 'Dropbox') {
					html.push(' data-icon="fa fa-dropbox"');
				} else if (optionValue === 'My Computer') {
					html.push(' data-icon="fa fa-desktop"');
				} else if (optionValue === 'URL') {
					html.push(' data-icon="fa fa-external-link"');
				} else if (index > 0) {
					html.push(' data-icon="fa fa-star"');
				}
				html.push('>');
				html.push(optionText);
				html.push('</option>');
			});
			html.push('</select>');
			if (field.url !== false) {
				html.push('<div>');
				html
				.push('<input placeholder="'
					+ (isMultiple ? 'Enter one or more URLs'
						: 'Enter a URL')
					+ '" class="form-control" style="width:50%; display:none;" type="text" name="'
					+ name + '_text">');
				html.push('</div>');
			}
			html.push('<input style="display:none;" type="file" name="' + name
				+ '_file"' + (isMultiple ? ' multiple' : '') + '>');
			// browse button clicked
			// select change
			that.$form
			.on(
				'change',
				'[name=' + name + '_picker]',
				function (evt) {
					var $this = $(this);
					var val = $this.val();

					var showTextInput = val === 'URL';
					if ('Dropbox' === val) {
						var options = {
							success: function (results) {
								var val = !isMultiple ? results[0].link
									: results.map(function (result) {
									return result.link;
								});
								that.setValue(name, val);
								that.trigger('change', {
									name: name,
									value: val
								});
							},
							linkType: 'direct',
							multiselect: isMultiple
						};
						Dropbox.choose(options);
						that.$form.find('[name=' + name + '_picker]').selectpicker('val', '');
					} else if ('My Computer' === val) {
						that.$form.find('[name=' + name + '_file]')
						.click();
						that.$form.find('[name=' + name + '_picker]').selectpicker('val', '');
					}
					that.$form.find('[name=' + name + '_text]')
					.css('display',
						showTextInput ? '' : 'none');
				});
			// URL
			that.$form.on('keyup', '[name=' + name + '_text]', function (evt) {
				var text = $.trim($(this).val());
				if (isMultiple) {
					text = text.split(',').filter(function (t) {
						t = $.trim(t);
						return t !== '';
					});
				}
				that.setValue(name, text);
				if (evt.which === 13) {
					that.trigger('change', {
						name: name,
						value: text
					});
				}
			});
			// browse file selected
			that.$form.on('change', '[name=' + name + '_file]', function (evt) {

				var files = evt.target.files; // FileList object
				that.setValue(name, isMultiple ? files : files[0]);
				that.trigger('change', {
					name: name,
					value: isMultiple ? files : files[0]
				});
			});
		} else {
			type = type == null ? 'text' : type;
			if (type === 'div') {
				html.push('<div name="' + name + '" id="' + id + '"');
			} else {
				html.push('<input type="' + type
					+ '" class="form-control" name="' + name + '" id="'
					+ id + '"');
			}
			if (value != null) {
				html.push(' value="' + value + '"');
			}
			if (field.placeholder) {
				html.push(' placeholder="' + field.placeholder + '"');
			}
			if (required) {
				html.push(' required');
			}
			if (disabled) {
				html.push(' disabled');
			}
			html.push('>');
			if (type === 'div') {
				html.push('</div>');
			}
		}
		if (help !== undefined) {
			html.push('<span data-name="' + name + '_help" class="help-block">');
			html.push(help);
			html.push('</span>');
		}
	},
	append: function (fields) {
		var html = [];
		var that = this;
		var isArray = morpheus.Util.isArray(fields);
		if (!isArray) {
			fields = [fields];
		}
		html.push('<div class="form-group">');
		_.each(fields, function (field, index) {
			that._append(html, field, index === 0);
		});
		html.push('</div>');
		html.push('</div>');
		var $div = $(html.join(''));
		this.$form.append($div);
		var checkBoxLists = $div.find('.checkbox-list');
		if (checkBoxLists.length > 0) {
			var checkBoxIndex = 0;
			_.each(fields, function (field) {
				// needs to already be in dom
				if (field.type === 'checkbox-list') {
					var list = new morpheus.CheckBoxList({
						responsive: false,
						$el: $(checkBoxLists[checkBoxIndex]),
						items: field.options
					});

					$(checkBoxLists[checkBoxIndex]).data(
						'morpheus.checkbox-list', list);
					checkBoxIndex++;
				}
			});
		}
		$div.find('.selectpicker').selectpicker({
			iconBase: 'fa',
			tickIcon: 'fa-check',
			style: 'btn-default btn-sm'
		});
	},
	clear: function () {
		this.$form.empty();
	},
	getValue: function (name) {
		var $v = this.$form.find('[name=' + name + ']');
		if ($v.length === 0) {
			$v = this.$form.find('[name=' + name + '_picker]');
		}
		return morpheus.FormBuilder.getValue($v);
	},
	setOptions: function (name, options, selectFirst) {
		var $select = this.$form.find('[name=' + name + ']');
		var checkBoxList = $select.data('morpheus.checkbox-list');
		if (checkBoxList) {
			checkBoxList.setItems(options);
		} else {
			var html = [];
			var selection = $select.val();
			_.each(options, function (choice) {
				html.push('<option value="');
				var isChoiceObject = _.isObject(choice)
					&& choice.value !== undefined;
				var optionValue = isChoiceObject ? choice.value : choice;
				var optionText = isChoiceObject ? choice.name : choice;
				html.push(optionValue);
				html.push('"');

				html.push('>');
				html.push(optionText);
				html.push('</option>');
			});
			$select.html(html.join(''));
			$select.val(selection);
			if (selectFirst && $select.val() == null) {
				if ($select[0].options.length > 0) {
					$select.val($select[0].options[0].value);
				}

			}
			if ($select.hasClass('selectpicker')) {
				$select.selectpicker('refresh');
				$select.selectpicker('render');
			}
		}
	},
	find: function (name) {
		return this.$form.find('[name=' + name + ']');
	},
	setHelpText: function (name, value) {
		var v = this.$form.find('[data-name=' + name + '_help]');
		v.html(value);
	},
	setValue: function (name, value) {
		var v = this.$form.find('[name=' + name + ']');
		if (v.length === 0) {
			v = this.$form.find('[name=' + name + '_picker]');
			if (v.data('type') === 'file') {
				v.val(value);
				v.selectpicker('render');
				v.data('files', value);
				return;
			}
		}
		var type = v.attr('type');
		var list = v.data('morpheus.checkbox-list');
		if (list) {
			list.setValue(value);
		} else {
			if (type === 'radio') {
				v.filter('[value=' + value + ']').prop('checked', true);
			} else if (type === 'checkbox') {
				v.prop('checked', value);
			} else {
				v.val(value);
			}
			if (v.hasClass('selectpicker')) {
				v.selectpicker('render');
			}
		}

	},
	setVisible: function (name, visible) {
		var $div = this.$form.find('[name=' + name + ']')
		.parents('.form-group');
		if (visible) {
			$div.show();
		} else {
			$div.hide();
		}
	},
	remove: function (name) {
		var $div = this.$form.find('[name=' + name + ']')
		.parents('.form-group');
		$div.remove();
	},
	setEnabled: function (name, enabled) {
		var $div = this.$form.find('[name=' + name + ']');
		$div.attr('disabled', !enabled);
		if (!enabled) {
			$div.parents('.form-group').find('label').addClass('text-muted');
		} else {
			$div.parents('.form-group').find('label').removeClass('text-muted');
		}
	}
};
morpheus.Util.extend(morpheus.FormBuilder, morpheus.Events);

morpheus.GradientColorSupplier = function() {
	morpheus.AbstractColorSupplier.call(this);
	this._updateScale();
};
morpheus.GradientColorSupplier.prototype = {
	createInstance : function() {
		return new morpheus.GradientColorSupplier();
	},
	getColor : function(row, column, value) {
		if (isNaN(value)) {
			return this.missingColor;
		}
		var min = this.min;
		var max = this.max;
		var colors = this.colors;
		if (value <= min) {
			return colors[0];
		} else if (value >= max) {
			return colors[colors.length - 1];
		}
		var fraction = morpheus.SteppedColorSupplier.linearScale(value, min,
				max, 0, 100) / 100;
		return this.colorScale(fraction);
	},
	setFractions : function(options) {
		morpheus.AbstractColorSupplier.prototype.setFractions.call(this,
				options);
		this._updateScale();
	},
	_updateScale : function() {
		this.colorScale = d3.scale.linear().domain(this.fractions).range(
				this.colors).clamp(true);
	}
};
morpheus.Util.extend(morpheus.GradientColorSupplier,
		morpheus.AbstractColorSupplier);
morpheus.Grid = function (options) {
	this.options = options;
	var _this = this;
	var grid;
	this.items = options.items;
	/**
	 * Maps from model index to view index. Note that not all model indices are
	 * contained in the map because they might have been filtered from the view.
	 */
	this.modelToView = null;
	/** view order in model space */
	this.viewOrder = null;
	function getItemColumnValue(item, column) {
		return column.getter(item);
	}

	this.filter = new morpheus.CombinedGridFilter();
	var model = {
		getLength: function () {
			return _this.viewOrder != null ? _this.viewOrder.length
				: _this.items.length;
		},
		getItem: function (index) {
			return _this.items[_this.viewOrder != null ? _this.viewOrder[index]
				: index];
		}
	};
	this.$el = options.$el;

	var gridOptions = $.extend({}, {
		select: true,
		headerRowHeight: 0,
		showHeaderRow: false,
		multiColumnSort: true,
		multiSelect: false,
		topPanelHeight: 0,
		enableTextSelectionOnCells: true,
		forceFitColumns: true,
		dataItemColumnValueExtractor: getItemColumnValue,
		defaultFormatter: function (row, cell, value, columnDef, dataContext) {
			if (_.isNumber(value)) {
				return morpheus.Util.nf(value);
			} else if (morpheus.Util.isArray(value)) {
				var s = [];
				for (var i = 0, length = value.length; i < length; i++) {
					if (i > 0) {
						s.push(', ');
					}
					var val = value[i];
					s.push(value[i]);
				}
				return s.join('');
			} else {
				return value;
			}
		}
	}, options.gridOptions || {});

	grid = new Slick.Grid(options.$el, model, options.columns, gridOptions);
	this.grid = grid;
	grid.registerPlugin(new morpheus.AutoTooltips2());

	grid.onCellChange.subscribe(function (e, args) {
		_this.trigger('edit', args);
	});

	if (gridOptions.select) {
		grid.setSelectionModel(new Slick.RowSelectionModel({
			selectActiveRow: true,
			multiSelect: gridOptions.multiSelect
		}));
		grid.getSelectionModel().onSelectedRangesChanged.subscribe(function (e) {
			var nitems = grid.getDataLength();
			_this.trigger('selectionChanged', {
				selectedRows: grid.getSelectedRows().filter(function (row) {
					return row >= 0 && row <= nitems;
				})
			});
		});
	}

	grid.onSort.subscribe(function (e, args) {
		_this.sortCols = args.sortCols;
		_this._updateMappings();
		grid.invalidate();
	});

	options.$el.on('click', function (e) {
		var cell = grid.getCellFromEvent(e);
		if (cell) {
			_this.trigger('click', {
				row: cell.row,
				target: e.target
			});
		}
	});
	options.$el.on('dblclick', function (e) {
		var cell = grid.getCellFromEvent(e);
		if (cell) {
			_this.trigger('dblclick', {
				row: cell.row,
				target: e.target
			});
		}
	});
	if (options.sort) {
		var gridSortColumns = [];
		var gridColumns = grid.getColumns();
		var sortCols = [];
		options.sort.forEach(function (c) {
			var column = null;
			for (var i = 0; i < gridColumns.length; i++) {
				if (gridColumns[i].name === c.name) {
					column = gridColumns[i];
					break;
				}
			}
			if (column != null) {

				gridSortColumns.push({
					columnId: column.id,
					sortAsc: c.sortAsc
				});
			} else {
				console.log(c.name + ' not found.');
			}
		});
		this.setSortColumns(gridSortColumns);
	}

	this.grid.invalidate();

};
morpheus.Grid.prototype = {
	columnsAutosized: false,
	setSortColumns: function (gridSortColumns) {
		this.grid.setSortColumns(gridSortColumns);
		this.sortCols = [];
		for (var i = 0; i < gridSortColumns.length; i++) {
			var column = this.grid.getColumns()[this.grid.getColumnIndex(gridSortColumns[i].columnId)];
			if (column == null) {
				throw "Unable to find column " + gridSortColumns[i];
			}
			this.sortCols.push({
				sortCol: column,
				sortAsc: gridSortColumns[i].sortAsc
			});
		}

		this._updateMappings();
		this.grid.invalidate();
	},
	setColumns: function (columns) {
		this.grid.setColumns(columns);
		this.grid.resizeCanvas();
		this.grid.invalidate();
	},
	getColumns: function () {
		return this.grid.getColumns();
	},
	getSelectedRows: function () {
		var nitems = this.grid.getDataLength();
		return this.grid.getSelectedRows().filter(function (row) {
			return row >= 0 && row <= nitems;
		});
	},
	getSelectedItems: function () {
		var rows = this.grid.getSelectedRows();
		var selection = [];
		for (var i = 0, nrows = rows.length; i < nrows; i++) {
			selection.push(this.items[this.convertViewIndexToModel(rows[i])]);
		}
		return selection;
	},
	getSelectedItem: function () {
		var rows = this.grid.getSelectedRows();
		if (rows.length === 1) {
			return this.items[this.convertViewIndexToModel(rows[0])];
		}
		return null;
	},
	/**
	 * Gets the sorted, visible items
	 */
	getItems: function () {
		var items = [];
		for (var i = 0, length = this.getFilteredItemCount(); i < length; i++) {
			items.push(this.items[this.convertViewIndexToModel(i)]);
		}
		return items;
	},
	getAllItemCount: function () {
		return this.items.length;
	},
	getAllItems: function () {
		return this.items;
	},
	getFilteredItemCount: function () {
		return this.viewOrder ? this.viewOrder.length : this.items.length;
	},
	redraw: function () {
		this.grid.invalidate();
	},
	redrawRows: function (rows) {
		this.grid.invalidateRows(rows);
		this.grid.render();
	},
	setItems: function (items) {
		// clear the selection
		this.items = items;
		if (this.grid.getSelectionModel()) {
			this.grid.setSelectedRows([]);
		}
		this.setFilter(this.filter);
		this.maybeAutoResizeColumns();
	},
	maybeAutoResizeColumns: function () {
		if (!this.columnsAutosized) {
			this.autosizeColumns();
		}
	},
	convertModelIndexToView: function (modelIndex) {
		if (this.modelToView !== null) {
			var index = this.modelToView.get(modelIndex);
			return index !== undefined ? index : -1;
		}
		return modelIndex;
	},
	convertViewIndexToModel: function (viewIndex) {
		return this.viewOrder != null ? (viewIndex < this.viewOrder.length
		&& viewIndex >= 0 ? this.viewOrder[viewIndex] : -1) : viewIndex;
	},
	_updateMappings: function () {
		var selectedViewIndices = this.grid.getSelectionModel() != null ? this.grid
		.getSelectedRows()
			: null;
		var selectedModelIndices = [];
		if (selectedViewIndices) {
			for (var i = 0, length = selectedViewIndices.length; i < length; i++) {
				selectedModelIndices.push(this
				.convertViewIndexToModel(selectedViewIndices[i]));
			}
		}
		this.viewOrder = null;
		if (this.filter != null) {
			this.filter.init();
			if (!this.filter.isEmpty()) {
				this.viewOrder = [];
				for (var i = 0, length = this.items.length; i < length; i++) {
					if (this.filter.accept(this.items[i])) {
						this.viewOrder.push(i);
					}
				}
			}
		}
		var cols = this.sortCols;
		if (cols && cols.length > 0) {
			if (this.viewOrder == null) {
				this.viewOrder = [];
				for (var i = 0, length = this.items.length; i < length; i++) {
					this.viewOrder.push(i);
				}
			}
			var ncols = cols.length;
			var items = this.items;
			// nulls always go at end

			this.viewOrder.sort(function (index1, index2) {
				for (var i = 0; i < ncols; i++) {
					var getter = cols[i].sortCol.getter;
					var comparator = cols[i].sortAsc ? morpheus.SortKey.ASCENDING_COMPARATOR : morpheus.SortKey.DESCENDING_COMPARATOR;
					var value1 = getter(items[index1]);
					var value2 = getter(items[index2]);
					var result = comparator(value1, value2);
					if (result !== 0) {
						return result;
					}
				}
				return 0;
			});
		}
		if (this.viewOrder != null) {
			this.modelToView = new morpheus.Map();
			for (var i = 0, length = this.viewOrder.length; i < length; i++) {
				this.modelToView.set(this.viewOrder[i], i);
			}
		} else {
			this.modelToView = null;
		}
		if (this.grid.getSelectionModel() != null) {
			var newSelectedViewIndices = [];
			for (var i = 0, length = selectedModelIndices.length; i < length; i++) {
				var index = this
				.convertModelIndexToView(selectedModelIndices[i]);
				if (index !== undefined) {
					newSelectedViewIndices.push(index);
				}
			}
			this.grid.setSelectedRows(newSelectedViewIndices);
		}
	},
	setSelectedRows: function (rows) {
		this.grid.setSelectedRows(rows);
	},
	setFilter: function (filter) {
		this.filter = filter;
		this._updateMappings();
		this.grid.invalidate();
		this.trigger('filter');
	},
	getFilter: function () {
		return this.filter;
	},
	autosizeColumns: function () {
		var columns = this.grid.getColumns();
		var items = this.getItems();

		if (!items || items.length === 0 || !columns || columns.length === 0) {
			return;
		}
		var gridWidth = this.options.$el.width() - 30;
		if (gridWidth <= 0) {
			return;
		}
		this.columnsAutosized = true;
		if (columns.length > -1) {
			var div = document.createElement('div');
			document.body.appendChild(div);
			var $d = $(div);
			$d.css({
				position: 'absolute',
				left: -1000,
				top: -1000
			});

			var $row = $('<div class="slick-table">'
				+ '<div class="ui-state-default slick-header-column slick-header-sortable ui-sortable-handle"></div>'
				+ '<div class="ui-widget-content slick-row"><div class="slick-cell selected"></div></div>'
				+ '</div>');
			var $cell = $row.find('.slick-cell');
			var $header = $row.find('.slick-header-column');
			$row.appendTo($d);

			var maxWidth = Math.min(parseInt(gridWidth / 2), 400);
			var getColumnWidth = function (column) {
				var w = $header.html(column.name).outerWidth() + 13; // leave space for sort indicator

				if (column.prototypeValue) {
					$cell.html(column.prototypeValue);
					w = Math.max($cell.outerWidth(), w);
				} else {
					for (var i = 0, nrows = Math.min(items.length, 10); i < nrows; i++) {
						var html = column.formatter(i, null, column
						.getter(items[i]), column, items[i]);
						var $html = $(html);
						$html.find('.slick-cell-wrapper').attr('class', '');
						$cell.html($html);
						w = Math.max($cell.outerWidth(), w);
					}
				}
				column.width = parseInt(Math.min(maxWidth, w));

			};
			var totalWidth = 0;
			for (var i = 0; i < columns.length; i++) {
				getColumnWidth(columns[i]);
				totalWidth += columns[i].width;
			}

			if (totalWidth < gridWidth) {
				// grow columns
				// var delta = parseInt((gridWidth - totalWidth) / columns.length);
				// for (var i = 0; i < columns.length; i++) {
				// //columns[i].width += delta;
				// }

			} else if (totalWidth > gridWidth) {
				// shrink
				//columns[columns.length - 1].width -= (totalWidth - gridWidth);
				// shrink last column
			}

			$d.remove();
			this.grid.resizeCanvas();
		}

	}
};

morpheus.Util.extend(morpheus.Grid, morpheus.Events);

/**
 * AutoTooltips2 plugin to show/hide tooltips when columns are too narrow to fit
 * content.
 *
 * @constructor
 */
morpheus.AutoTooltips2 = function (options) {
	var _grid;
	var _self = this;
	var tip;

	/**
	 * Initialize plugin.
	 */
	function init(grid) {
		_grid = grid;

		$(_grid.getCanvasNode()).on('mouseover', '.slick-row', showToolTip);
		$(_grid.getCanvasNode()).on('mouseout', '.slick-row', hideToolTip);
		$(_grid.getCanvasNode()).on('mouseup', hideAll);

		// $(_grid.getContainerNode()).on('mouseover', '.slick-header-column',
		// showHeaderToolTip);
		// $(_grid.getContainerNode()).on('mouseout', '.slick-header-column',
		// hideHeaderToolTip);

	}

	/**
	 * Destroy plugin.
	 */
	function destroy() {
		$(_grid.getCanvasNode()).off('mouseover', showToolTip);
		$(_grid.getCanvasNode()).off('mouseout', hideToolTip);
		$(_grid.getCanvasNode()).off('mouseup', hideAll);
		// $(_grid.getContainerNode()).off('mouseover', '.slick-header-column',
		// showHeaderToolTip);
		// $(_grid.getContainerNode()).off('mouseout', '.slick-header-column',
		// hideHeaderToolTip);

	}

	/**
	 * Handle mouse entering grid cell to add/remove tooltip.
	 *
	 * @param {jQuery.Event}
	 *            e - The event
	 */
	function hideToolTip(e) {
		var cell = _grid.getCellFromEvent(e);
		if (cell) {
			var $node = $(_grid.getCellNode(cell.row, cell.cell));
			if ($node.data('bs.tooltip')) {
				$node.tooltip('hide');
			}
		}
	}

	function hideAll() {
		$(_grid.getCanvasNode()).find('[data-original-title]').attr(
			'data-original-title', '').tooltip('hide');

	}

	function hideHeaderToolTip(e) {
		var $node = $(e.target);
		if ($node.data('bs.tooltip')) {
			$node.tooltip('hide');
		}
	}

	function showHeaderToolTip(e) {
		var show = false;
		var $node = $(e.target);

		if (($node[0].scrollWidth > $node[0].offsetWidth)) {
			show = true;
			var $name = $node.find('.slick-column-name');
			if (!$node.data('bs.tooltip')) {
				$node.tooltip({
					placement: 'auto',
					html: true,
					container: 'body',
					trigger: 'manual'
				});
			}
			$node.attr('data-original-title', $name.text());
			if (show) {
				$node.tooltip('show');
			} else {
				$node.tooltip('hide');
			}
		}
	}

	function showToolTip(e) {
		var cell = _grid.getCellFromEvent(e);
		if (cell) {
			var $node = $(_grid.getCellNode(cell.row, cell.cell));
			var text = '';
			var c = _grid.getColumns()[cell.cell];
			var show = false;
			var $checkNode = $node.find('.slick-cell-wrapper');
			if (c.alwaysShowTooltip
				|| ($checkNode[0].scrollWidth > $checkNode[0].offsetWidth)) {
				var item = _grid.getDataItem(cell.row);
				text = c.tooltip(item, c.getter(item));
				show = true;
			}
			$node.attr('data-original-title', text);
			var hasTip = $node.data('bs.tooltip');
			if (!hasTip) {
				$node.tooltip({
					placement: 'auto',
					html: true,
					container: 'body',
					trigger: 'manual'
				});
			}
			if (show) {
				$node.tooltip('show');
			} else if (hasTip) {
				$node.tooltip('hide');
			}
		}
	}

	/**
	 * Handle mouse entering header cell to add/remove tooltip.
	 *
	 * @param {jQuery.Event}
	 *            e - The event
	 * @param {object}
	 *            args.column - The column definition
	 */
	function handleHeaderMouseEnter(e, args) {
		var column = args.column, $node = $(e.target).closest(
			'.slick-header-column');
		if (!column.toolTip) {
			$node.attr('title',
				($node.innerWidth() < $node[0].scrollWidth) ? column.name
					: '');
		}
	}

	// Public API
	$.extend(this, {
		'init': init,
		'destroy': destroy
	});

};

morpheus.CombinedGridFilter = function () {
	this.filters = [];
};
morpheus.CombinedGridFilter.prototype = {
	add: function (filter) {
		this.filters.push(filter);
	},
	getFilters: function () {
		return this.filters;
	},
	get: function (index) {
		return this.filters[index];
	},
	set: function (index, f) {
		this.filters[index] = f;
	},
	init: function () {
		for (var i = 0; i < this.filters.length; i++) {
			this.filters[i].init();
		}

		this.activeFilters = this.filters.filter(function (f) {
			return !f.isEmpty();
		});
		this.nActiveFilters = this.activeFilters.length;
	},
	accept: function (item) {
		for (var i = 0; i < this.nActiveFilters; i++) {
			if (!this.activeFilters[i].accept(item)) {
				return false;
			}
		}
		return true;
	},
	isEmpty: function () {
		return this.activeFilters.length === 0;
	}
};

/**
 * rows and columns can contain field, renameTo, display, order
 *
 */

morpheus.HeatMap = function (options) {
	morpheus.Util.loadTrackingCode();
	var _this = this;
	options = $
	.extend(
		true,
		{},
		{
			/**
			 * The element in which to render to the heat map.
			 */
			el: null,
			/**
			 * A File or URL to a <a target="_blank"
			 * href="http://support.lincscloud.org/hc/en-us/articles/202105453-GCT-Gene-Cluster-Text-Format-">GCT
			 * 1.3</a>, ' + '<a target="_blank"
			 * href="http://www.broadinstitute.org/cancer/software/genepattern/gp_guides/file-formats/sections/gct">GCT
			 * 1.2</a>, ' + '<a target="_blank"
			 * href="https://wiki.nci.nih.gov/display/TCGA/Mutation+Annotation+Format+%28MAF%29+Specification">MAF</a>, ' + '<a
			 * target="_blank",
			 * href="http://www.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#GMT:_Gene_Matrix_Transposed_file_format_.28.2A.gmt.29">GMT</a>, ' + '
			 * or a tab-delimitted text file. Can also be an array
			 * of File or URLs in which case the datasets are
			 * combined by matching on column ids.
			 */
			dataset: undefined,
			/**
			 *
			 * @description Array of file, datasetField, fileField,
			 *              and include (optional fields to include
			 *              from file). File can be xlsx file,
			 *              tab-delimitted text file, or gmt file.
			 *              <p>
			 *              <b>Example:</b> Annotate rows matching
			 *              'name' field in dataset to 'id' field in
			 *              file.
			 *              </p>
			 *              <code>[{file:'https://MY_URL', datasetField:'name', fileField:'id'}]</code>
			 */
			rowAnnotations: undefined,
			/**
			 * Array of file, datasetField, fileField, and include
			 * (optional fields to include from file). File can be
			 * xlsx file, tab-delimitted text file, or gmt file.
			 */
			columnAnnotations: undefined,

			/**
			 * Array of column metadata names to group the heat map
			 * by.
			 *
			 * <p>
			 * <b>Example:</b> Group by the type and gender
			 * metadata field.
			 * </p>
			 *
			 * <code>['type', 'gender']</code>
			 */
			columnGroupBy: undefined,
			/**
			 * Array of row metadata names to group the heat map by.
			 *
			 * <p>
			 * <b>Example:</b> Group by the gene metadata field.
			 * </p>
			 * <code>['gene']</code>
			 */
			rowGroupBy: undefined,
			/**
			 * Object that describes mapping of values to colors.
			 * Type can be 'fixed' or 'relative'. Stepped indicates
			 * whether color scheme is continuous (false) or
			 * discrete (true).
			 * <p>
			 * <b>Example:</b> Use a fixed color scheme with color
			 * stops at -100, -90, 90, and 100.
			 * <p>
			 * <code>{ type : 'fixed', stepped:false, map : [ { value : -100, color :
						 * 'blue' }, { value : -90, color : 'white' }, { value :
						 * 90, color : 'white' }, { value : 100, color : 'red' } ] };</code>
			 */
			colorScheme: undefined,
			/**
			 * Array of metadata names and sort order. Use 0 for
			 * ascending and 1 for descending. To sort by values use
			 * modelIndices.
			 *
			 * <p>
			 * <b>Example:</b> Sort ascending by gene, and then
			 * descending by stdev
			 * </p>
			 * <code>[{field:'gene', order:0}, {field:'stdev',
						 *              order:1}]</code>
			 */
			rowSortBy: undefined,
			/**
			 * Array of metadata names and sort order. Use 0 for
			 * ascending and 1 for descending.
			 *
			 * <p>
			 * <b>Example:</b> to sort ascending by gene, and then
			 * descending by stdev
			 * </p>
			 * <code> [{name:'gene',
						 *              order:0}, {name:'stdev', order:1}]</code>
			 */
			columnSortBy: undefined,
			/**
			 * URL to a dendrogram in <a target="_blank"
			 * href="https://en.wikipedia.org/wiki/Newick_format">Newick
			 * format</a>
			 */
			rowDendrogram: undefined,
			/**
			 * URL to a dendrogram in <a target="_blank"
			 * href="https://en.wikipedia.org/wiki/Newick_format">Newick
			 * format</a>
			 */
			columnDendrogram: undefined,

			/**
			 * Column metadata field in dataset used to match leaf
			 * node ids in column dendrogram Newick file
			 */
			columnDendrogramField: 'id',
			/**
			 * Row metadata field in dataset used to match leaf node
			 * ids in row dendrogram Newick file
			 */
			rowDendrogramField: 'id',
			/**
			 * Array of objects describing how to display row
			 * metadata fields. Each object in the array must have
			 * field, and optionally display, order, and renameTo.
			 * Field is the metadata field name. Display is a comma
			 * delimited string that describes how to render a
			 * metadata field. Options are text, color, stacked_bar,
			 * bar, highlight, shape, discrete, and continuous.
			 * Order is a number that indicates the order in which
			 * the field should appear in the heat map. RenameTo
			 * allows you to rename a field.
			 */
			rows: [],
			/**
			 * Array of objects describing how to display column
			 * metadata fields. Each object in the array must have
			 * field, and optionally display, order, and renameTo.
			 * Field is the metadata field name. Display is a comma
			 * delimited string that describes how to render a
			 * metadata field. Options are text, color, stacked_bar,
			 * bar, highlight, shape, discrete, and continuous.
			 * Order is a number that indicates the order in which
			 * the field should appear in the heat map. RenameTo
			 * allows you to rename a field.
			 */
			columns: [],
			/**
			 * Optional array of tools to run at load time. For
			 * example: <code>tools : [ {
						 * name : 'Marker Selection',
						 * params : {
						 * 		field : [ comparisonVector.getName() ],
						 *      class_a : [ 'A' ], class_b : [ 'B' ] }} ]</code>
			 */
			tools: undefined,
			/**
			 * Optional array of {name:string, values:[]}
			 */
			rowFilter: undefined,
			columnFilter: undefined,
			customUrls: undefined, // Custom urls for File>Open.
			height: 'window', // set the available height for the
			// heat map. If not
			// set, it will be determined automatically
			width: undefined, // set the available width for the
			// heat map. If not
			// set, it will be determined automatically
			/** Whether to focus this tab */
			focus: true,
			inheritFromParent: true,
			inheritFromParentOptions: {
				transpose: false
			},
			structureUrlProvider: undefined,
			promises: undefined, // additional promises to wait
			// for
			renderReady: undefined,
			datasetReady: undefined,
			loadedCallback: undefined,
			name: undefined,
			rowsSortable: true,
			columnsSortable: true,
			popupEnabled: true,
			symmetric: false,
			keyboard: true,
			inlineTooltip: true,
			$loadingImage: morpheus.Util.createLoadingEl(),
			/**
			 * Whether this heat map tab can be closed
			 */
			closeable: true,
			toolbar: {
				zoom: true,
				tools: true,
				searchRows: true,
				searchColumns: true,
				sort: true,
				options: true,
				saveImage: true,
				saveDataset: true,
				openFile: true,
				filter: true,
				colorKey: true,
				searchValues: false
			}
		}, options);

	this.options = options;
	this.tooltipProvider = morpheus.HeatMapTooltipProvider;
	if (!options.el) {
		this.$el = $('<div></div>');
	} else {
		this.$el = $(options.el);
	}
	this.$el.addClass('morpheus');
	if (!options.landingPage) {
		options.landingPage = new morpheus.LandingPage();
		options.landingPage.$el.prependTo(this.$el);
	}
	if (this.options.name == null) {
		this.options.name = morpheus.Util
		.getBaseFileName(morpheus.Util
		.getFileName(this.options.dataset.file ? this.options.dataset.file
			: this.options.dataset));
	}
	var isPrimary = this.options.parent == null;
	if (this.options.parent == null) {

		this.tabManager = this.options.tabManager ? this.options.tabManager
			: new morpheus.TabManager({
			landingPage: this.options.landingPage
		});

		// if (window.location.hostname.indexOf('clue.io') === -1
		// && window.location.pathname.indexOf('cancer/software/morpheus') ===
		// -1) {
		if (!morpheus.HelpMenu.ADDED) { // only show once per page
			morpheus.HelpMenu.ADDED = true;
			var $a = $('<a title="Produced with Morpheus"' +
				' style="display:inline;font-size:85%;margin-right:2px;margin-top:2px;" href="'
				+ morpheus.Util.URL
				+ '" target="_blank"><img alt="Morpheus Icon" style="width:16px;height:16px;" src="'
				+ morpheus.Util.URL + '/images/icon.svg"></a>');
			$a.tooltip({
				placement: 'auto'
			});
			// var $img = $a.find('img');

			var $right = $('<li data-name="help" style="margin-right:2px;"' +
				' class="pull-right"></li>');
			$a.appendTo($right);
			new morpheus.HelpMenu().$el.appendTo($right);
			$right.appendTo(this.tabManager.$nav);
		}
		if (!this.options.tabManager) {
			this.tabManager.$nav.appendTo(this.$el);
			this.tabManager.$tabContent.appendTo(this.$el);
		}
	} else {
		if (this.options.inheritFromParent) {
			this.popupItems = this.options.parent.popupItems;
			if (!this.options.tabOpened) {
				this.options.tabOpened = this.options.parent.options.tabOpened;
			}
			this.options.drawCallback = this.options.parent.options.drawCallback;
		}
		this.tabManager = this.options.parent.tabManager;
	}
	this.$content = $('<div></div>');
	this.$content.css({
		'width': '100%',

		'user-select': 'none',

		'-webkit-user-select': 'none',
		'-webkit-user-drag': 'none',
		'-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',

		'-moz-user-select': 'none',
		'-moz-user-drag': 'none',
		'-moz-tap-highlight-color': 'rgba(0, 0, 0, 0)',

		'-ms-user-select': 'none',
		'-ms-user-drag': 'none',
		'-ms-tap-highlight-color': 'rgba(0, 0, 0, 0)',

		'-o-user-select': 'none',
		'-o-user-drag': 'none',
		'-o-tap-highlight-color': 'rgba(0, 0, 0, 0)',

		'overflow-x': 'visible',
		'overflow-y': 'visible'
	});

	var tab = this.tabManager.add({
		$el: this.$content,
		closeable: this.options.closeable,
		rename: true,
		title: this.options.name,
		object: this,
		focus: this.options.focus
	});
	if (options.$loadingImage) {
		options.$loadingImage.appendTo(this.$content);
	}

	this.tabId = tab.id;
	this.$tabPanel = tab.$panel;
	this.options.dataSource = !options.dataset ? ''
		: (options.dataset.file ? options.dataset.file : options.dataset);
	this._togglingInfoWindow = false;
	this.tooltipMode = 0; // 0=docked, 1=dialog, 2=follow

	var promises = [];
	if (options.promises) {
		for (var i = 0; i < options.promises.length; i++) {
			promises.push(options.promises[i]);
		}
	}
	this.whenLoaded = [];

	if (options.rowAnnotations) {
		var rowDef = morpheus.DatasetUtil.annotate({
			annotations: options.rowAnnotations,
			isColumns: false
		});
		rowDef.done(function (callbacks) {
			_this.whenLoaded = _this.whenLoaded.concat(callbacks);
		});
		promises.push(rowDef);

	}
	if (options.columnAnnotations) {
		var columnDef = morpheus.DatasetUtil.annotate({
			annotations: options.columnAnnotations,
			isColumns: true
		});
		columnDef.done(function (callbacks) {
			_this.whenLoaded = _this.whenLoaded.concat(callbacks);
		});
		promises.push(columnDef);
	}

	if (options.rowDendrogram !== undefined
		&& _.isString(options.rowDendrogram)) {
		var rowDendrogramDeferred = morpheus.Util
		.getText(options.rowDendrogram);
		rowDendrogramDeferred.done(function (text) {
			_this.options.rowDendrogram = morpheus.AbstractDendrogram
			.parseNewick(text);
		});
		promises.push(rowDendrogramDeferred);
	}
	if (options.columnDendrogram !== undefined
		&& _.isString(options.columnDendrogram)) {
		var columnDendrogramDeferred = morpheus.Util
		.getText(options.columnDendrogram);
		columnDendrogramDeferred.done(function (text) {
			_this.options.columnDendrogram = morpheus.AbstractDendrogram
			.parseNewick(text);
		});
		promises.push(columnDendrogramDeferred);
	}
	var heatMapLoaded = function () {
		if (typeof window !== 'undefined') {
			var resize = function () {
				_this.revalidate();

			};
			$(window).on('orientationchange resize', resize);
			_this.$content.on('remove', function () {
				$(window).off('orientationchange resize', resize);
			});
		}
		_this.revalidate();
		if (options.loadedCallback) {
			options.loadedCallback(_this);
		}

		if (_this.options.focus) {
			_this.tabManager.setActiveTab(tab.id);
			$(_this.heatmap.canvas).focus();
		}
		_this.$el.trigger('heatMapLoaded', _this);
	};
	if (morpheus.Util.isArray(options.dataset)) {
		var d = morpheus.DatasetUtil.readDatasetArray(options.dataset);
		d.fail(function (message) {
			if (_this.options.$loadingImage) {
				_this.options.$loadingImage.remove();
			}
			morpheus.FormBuilder.showInModal({
				title: 'Error',
				html: message
			});
		});
		d
		.done(function (joined) {
			if (_this.options.$loadingImage) {
				_this.options.$loadingImage.remove();
			}

			_this.options.dataset = joined;
			_this._init();
			if (joined.getRowMetadata().getByName('Source') != null
				&& !_this.options.colorScheme) {
				_this.heatmap.getColorScheme()
				.setSeparateColorSchemeForRowMetadataField(
					'Source');
			}

			_
			.each(
				options.dataset,
				function (option) {
					if (option.colorScheme) {
						_this.heatmap
						.getColorScheme()
						.setCurrentValue(
							morpheus.Util
							.getBaseFileName(morpheus.Util
							.getFileName(option.dataset)));
						_this.heatmap
						.getColorScheme()
						.setColorSupplierForCurrentValue(
							morpheus.HeatMapColorScheme
							.createColorSupplier(option.colorScheme));

					} else {

						try {
							_this
							.autoDisplay({
								extension: morpheus.Util
								.getExtension(morpheus.Util
								.getFileName(option.dataset)),
								filename: morpheus.Util
								.getBaseFileName(morpheus.Util
								.getFileName(option.dataset))
							});
						} catch (x) {
							console
							.log('Autodisplay errror');
						}

					}
				});
			heatMapLoaded();
		});
	} else {
		var deferred = options.dataset.file ? morpheus.DatasetUtil.read(
			options.dataset.file, options.dataset.options)
			: morpheus.DatasetUtil.read(options.dataset);
		deferred.done(function (dataset) {
			_this.options.dataset = dataset;
		});
		deferred.fail(function (err) {
			_this.options.$loadingImage.remove();
			var message = ['Error opening '
			+ (options.dataset.file ? morpheus.Util
			.getFileName(options.dataset.file) : morpheus.Util
			.getFileName(options.dataset)) + '.'];

			if (err.message) {
				message.push('<br />Cause: ');
				message.push(err.message);

			}

			morpheus.FormBuilder.showInModal({
				title: 'Error',
				html: message.join('')
			});
		});

		promises.push(deferred);
		$.when.apply($, promises).then(function () {
			if (_this.options.$loadingImage) {
				_this.options.$loadingImage.remove();
			}
			_this._init();
			heatMapLoaded();
		});
	}
};

morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS = 6;

morpheus.HeatMap.showTool = function (tool, controller, callback) {
	if (tool.gui) {
		var gui = tool.gui(controller.getProject());
		var formBuilder = new morpheus.FormBuilder();
		_.each(gui, function (item) {
			formBuilder.append(item);
		});
		var tabId = controller.getTabManager().getActiveTabId();
		if (tool.init) {
			tool.init(controller.getProject(), formBuilder, {
				controller: controller
			});
		}

		var okCallback = function () {
			var task = {
				name: tool.toString(),
				tabId: tabId
			};
			controller.getTabManager().addTask(task);
			var input = {};
			_.each(gui, function (item) {
				input[item.name] = formBuilder.getValue(item.name);
			});
			// give a chance for ui to update
			setTimeout(function () {
				try {
					var value = tool.execute({
						controller: controller,
						project: controller.getProject(),
						input: input
					});
					if (value instanceof Worker) {
						value.onerror = function (e) {
							task.worker.terminate();
							morpheus.FormBuilder.showInModal({
								title: 'Error',
								html: e,
								close: 'Close'
							});
							if (e.stack) {
								console.log(e.stack);
							}
						};
						var terminate = _.bind(value.terminate, value);
						task.worker = value;
						value.terminate = function () {
							terminate();
							try {
								controller.getTabManager().removeTask(task);
							} catch (x) {
								console.log('Error removing task');
							}
							if (callback) {
								callback(input);
							}
						};
					} else {
						if (callback) {
							callback(input);
						}
					}
				} catch (e) {
					morpheus.FormBuilder.showInModal({
						title: 'Error',
						html: e,
						close: 'Close'
					});
					if (e.stack) {
						console.log(e.stack);
					}
				} finally {
					if (task.worker === undefined) {
						try {
							controller.getTabManager().removeTask(task);
						} catch (x) {
							console.log('Error removing task');
						}
					}
					if (tool.dispose) {
						tool.dispose();
					}

				}
			}, 0);
		};
		var $formDiv;
		tool.ok = function () {
			okCallback();
			$formDiv.modal('hide');
		};
		var guiOptions = $.extend({}, {
			ok: true
		}, gui.options);
		$formDiv = morpheus.FormBuilder.showOkCancel({
			title: tool.toString(),
			apply: tool.apply,
			ok: guiOptions.ok,
			size: guiOptions.size,
			draggable: true,
			content: formBuilder.$form,
			align: 'right',
			okCallback: okCallback
		});
	} else { // run headless
		try {
			var value = tool.execute({
				controller: controller,
				project: controller.getProject(),
				input: {}
			});
			if (callback) {
				callback({});
			}
		} catch (e) {
			morpheus.FormBuilder.showInModal({
				title: 'Error',
				html: e,
				close: 'Close'
			});
			if (e.stack) {
				console.log(e.stack);
			}
		} finally {
			if (tool.dispose) {
				tool.dispose();
			}
		}
	}
	var toolName = tool.toString();
	var parenIndex = toolName.indexOf('(');
	if (parenIndex !== -1) {
		toolName = toolName.substring(0, parenIndex).trim();
	}
	morpheus.Util.trackEvent({
		eventCategory: 'Tool',
		eventAction: toolName
	});
};
morpheus.HeatMap.getSpaces = function (groupByKeys, length, gapSize) {
	var previousArray = [];
	var nkeys = groupByKeys.length;
	for (var keyIndex = 0; keyIndex < nkeys; keyIndex++) {
		var key = groupByKeys[keyIndex];
		previousArray.push(key.getValue(0));
	}
	var spaces = [];
	var sum = 0;
	spaces.push(sum);
	for (var i = 1; i < length; i++) {
		var isEqual = true;
		for (var keyIndex = 0; keyIndex < nkeys; keyIndex++) {
			var key = groupByKeys[keyIndex];
			var comparator = key.getComparator();
			var val = key.getValue(i);
			var c = comparator(val, previousArray[keyIndex]);
			if (c !== 0) { // not equal, add space
				isEqual = false;
				for (var keyIndex2 = 0; keyIndex2 < nkeys; keyIndex2++) {
					previousArray[keyIndex2] = groupByKeys[keyIndex2]
					.getValue(i);
				}
				break;
			}
		}
		if (!isEqual) {
			sum += gapSize;
		}
		spaces.push(sum);
	}
	return spaces;
};
morpheus.HeatMap.createGroupBySpaces = function (dataset, groupByKeys, gapSize) {
	if (groupByKeys.length > 0) {
		var nkeys = groupByKeys.length;
		for (var keyIndex = 0; keyIndex < nkeys; keyIndex++) {
			groupByKeys[keyIndex].init(dataset);
		}
		return morpheus.HeatMap.getSpaces(groupByKeys, dataset.getRowCount(),
			gapSize);
	}
};
morpheus.HeatMap.isDendrogramVisible = function (project, isColumns) {
	var sortKeys = isColumns ? project.getColumnSortKeys() : project
	.getRowSortKeys();
	// var filter = isColumns ? this.project.getColumnFilter()
	// : this.project.getRowFilter();
	var size = isColumns ? project.getSortedFilteredDataset().getColumnCount()
		: project.getSortedFilteredDataset().getRowCount();

	if (sortKeys.length === 1) {
		return sortKeys[0] instanceof morpheus.SpecifiedModelSortOrder
			&& sortKeys[0].name === 'dendrogram'
			&& sortKeys[0].nvisible === size;
	}
};

morpheus.HeatMap.prototype = {
	gapSize: 10,
	updatingScroll: false,
	autoDisplay: function (options) {
		if (!this.loadingSession && this.project.getFullDataset().getESSession() == null) {
			this.loadingSession = true;
			console.log("es session");
			morpheus.DatasetUtil.toESSession(this.project.getFullDataset());
		}
		if (options.filename == null) {
			options.filename = '';
		}
		var colorScheme;
		if (options.extension === 'segtab' || options.extension === 'seg') {
			colorScheme = {
				type: 'fixed',
				map: morpheus.HeatMapColorScheme.Predefined.CN().map
				.map(function (item) {
					return {
						value: Math.pow(2, 1 + item.value),
						color: item.color
					};
				})
			};
		} else if (options.extension === 'maf') {
			colorScheme = morpheus.HeatMapColorScheme.Predefined.MAF();
			var colorMap = morpheus.HeatMapColorScheme.Predefined.MAF().map;
			var rowMutProfile = this.project.getFullDataset().getRowMetadata()
			.getByName('mutation_summary');
			var columnMutProfile = this.project.getFullDataset()
			.getColumnMetadata().getByName('mutation_summary');

			var track = this.getTrack('mutation_summary', false);
			if (track) {
				track.settingFromConfig('stacked_bar');
			}
			track = this.getTrack('mutation_summary', true);
			if (track) {
				track.settingFromConfig('stacked_bar');
			}
			for (var i = 1; i < colorMap.length; i++) {
				if (rowMutProfile) {
					this.getProject().getRowColorModel().setMappedValue(
						rowMutProfile, i - 1, colorMap[i].color);
				}
				if (columnMutProfile) {
					this.getProject().getColumnColorModel().setMappedValue(
						columnMutProfile, i - 1, colorMap[i].color);
				}
			}
		} else if (options.extension === 'gmt') {
			colorScheme = morpheus.HeatMapColorScheme.Predefined.BINARY();
		} else if (options.filename === 'all_lesions.conf_99'
			|| options.filename === 'all_data_by_genes.txt' || options.filename.toLowerCase().indexOf('gistic') !== -1) {
			colorScheme = {
				type: 'fixed',
				map: [{
					value: -0.5,
					color: 'blue'
				}, {
					value: 0,
					color: 'white'
				}, {
					value: 0.5,
					color: 'red'
				}]
			};
		} else if (options.filename.toLowerCase().indexOf('copynumber') !== -1 || options.filename.toLowerCase().indexOf('copy number') !== -1) {
			colorScheme = {
				type: 'fixed',
				map: [{
					value: -1.5,
					color: 'blue'
				}, {
					value: 0,
					color: 'white'
				}, {
					value: 1.5,
					color: 'red'
				}]
			};
		} else if (options.filename.toLowerCase().indexOf('achilles') !== -1) {
			colorScheme = {
				type: 'fixed',
				map: [{
					value: -3,
					color: 'blue'
				}, {
					value: -1,
					color: 'white'
				}, {
					value: 1,
					color: 'white'
				}, {
					value: 3,
					color: 'red'
				}]
			};
		}

		if (colorScheme && options.filename && this.heatmap.getColorScheme()) {
			this.heatmap.getColorScheme().setCurrentValue(options.filename);
			this.heatmap.getColorScheme().setColorSupplierForCurrentValue(
				morpheus.HeatMapColorScheme
				.createColorSupplier(colorScheme));
		}
		return colorScheme;
	},
	/**
	 *
	 * @param sortOrder
	 * @param isColumns
	 *            Whether sorting based on column selection
	 * @param append
	 *            Whether to add to existing sort order
	 */
	sortBasedOnSelection: function (sortOrder, isColumns, append) {
		// if isColumns, sort rows
		var project = this.project;
		var selectionModel = isColumns ? project.getColumnSelectionModel()
			: project.getRowSelectionModel();
		var modelIndices = selectionModel.toModelIndices();
		if (modelIndices.length === 0) {
			return;
		}

		var priorSortKeyIndex = -1;
		if (sortOrder == null) {
			// toggle sort order?
			var existingSortKeys = isColumns ? project.getRowSortKeys()
				: project.getColumnSortKeys();
			for (var i = 0, length = existingSortKeys.length; i < length; i++) {
				var key = existingSortKeys[i];
				if (key instanceof morpheus.SortByValuesKey
					&& morpheus.Util.arrayEquals(key.modelIndices,
						modelIndices)) {
					priorSortKeyIndex = i;
					if (key.getSortOrder() === morpheus.SortKey.SortOrder.UNSORTED) {
						sortOrder = morpheus.SortKey.SortOrder.DESCENDING; // 1st
						// click
					} else if (key.getSortOrder() === morpheus.SortKey.SortOrder.DESCENDING) {
						sortOrder = morpheus.SortKey.SortOrder.ASCENDING; // 2nd
						// click
					} else if (key.getSortOrder() === morpheus.SortKey.SortOrder.ASCENDING) {
						sortOrder = morpheus.SortKey.SortOrder.TOP_N; // 3rd
						// click
					} else if (key.getSortOrder() === morpheus.SortKey.SortOrder.TOP_N) {
						sortOrder = morpheus.SortKey.SortOrder.UNSORTED; // 4th
						// click
					}
					break;
				}
			}

		}

		if (sortOrder == null) {
			sortOrder = morpheus.SortKey.SortOrder.DESCENDING;
		}

		var sortKeys;
		if (append) {
			sortKeys = !isColumns ? project.getColumnSortKeys() : project
			.getRowSortKeys();

			if (priorSortKeyIndex !== -1) {
				if (sortOrder === morpheus.SortKey.SortOrder.UNSORTED) {
					// remove existing sort key
					sortKeys.splice(priorSortKeyIndex, 1);
				} else {
					sortKeys[priorSortKeyIndex].setSortOrder(sortOrder);
				}

			} else {
				if (sortOrder !== morpheus.SortKey.SortOrder.UNSORTED) {
					sortKeys.push(new morpheus.SortByValuesKey(modelIndices,
						sortOrder, !isColumns));
				}
				// add new sort key
			}

			sortKeys = morpheus.SortKey.keepExistingSortKeys(sortKeys,
				!isColumns ? project.getColumnSortKeys() : project
				.getRowSortKeys());

		} else {
			var newSortKeys = sortOrder === morpheus.SortKey.SortOrder.UNSORTED ? []
				: [new morpheus.SortByValuesKey(modelIndices, sortOrder,
				!isColumns)];
			sortKeys = morpheus.SortKey.keepExistingSortKeys(newSortKeys,
				!isColumns ? project.getColumnSortKeys() : project
				.getRowSortKeys());
		}

		if (!isColumns) { // sort columns by selected rows
			project.setColumnSortKeys(sortKeys, true);
			this.scrollLeft(0);
		} else { // sort rows by selected column
			project.setRowSortKeys(sortKeys, true);
			this.scrollTop(0);
		}
		morpheus.Util.trackEvent({
			eventCategory: 'Tool',
			eventAction: isColumns ? 'sortRowsBasedOnSelection' : 'sortColumnsBasedOnSelection'
		});

	},
	getToolbarElement: function () {
		return this.toolbar.$el;
	},
	getToolbar: function () {
		return this.toolbar;
	},
	setName: function (name) {
		this.options.name = name;
	},
	getName: function () {
		return this.options.name;
	},
	showOptions: function () {
		new morpheus.HeatMapOptions(this);
	},
	getProject: function () {
		return this.project;
	},
	/**
	 * @param tree
	 *            An object with maxHeight, a rootNode, leafNodes, and
	 *            nLeafNodes
	 */
	setDendrogram: function (tree, isColumns, viewIndices) {
		var dendrogram = isColumns ? this.columnDendrogram : this.rowDendrogram;
		if (dendrogram) {
			dendrogram.dispose();
			dendrogram = null;
		}
		if (tree != null) {
			var modelIndices = [];
			var modelIndexSet = new morpheus.Set();
			var size = isColumns ? this.project.getFullDataset()
			.getColumnCount() : this.project.getFullDataset()
			.getRowCount();
			for (var i = 0; i < size; i++) {
				modelIndexSet.add(i);
			}
			for (var i = 0, length = viewIndices.length; i < length; i++) {
				var modelIndex = isColumns ? this.project
				.convertViewColumnIndexToModel(viewIndices[i])
					: this.project
				.convertViewRowIndexToModel(viewIndices[i]);
				modelIndices.push(modelIndex);
				modelIndexSet.remove(modelIndex);
			}
			var nvisible = modelIndices.length;
			// add model indices that weren't visible when clustering
			if (modelIndexSet.size() > 0) {
				var indices = modelIndexSet.values();
				for (var i = 0, length = indices.length; i < length; i++) {
					modelIndices.push(indices[i]);
				}
			}
			if (isColumns) {
				dendrogram = new morpheus.ColumnDendrogram(this, tree,
					this.heatmap.getColumnPositions(), this.project);
				dendrogram.filter = this.project.getColumnFilter()
				.shallowClone();
				this.columnDendrogram = dendrogram;
				this.project.setColumnSortKeys(
					[new morpheus.SpecifiedModelSortOrder(modelIndices,
						nvisible, 'dendrogram')], true);
			} else {
				dendrogram = new morpheus.RowDendrogram(this, tree,
					this.heatmap.getRowPositions(), this.project);
				dendrogram.filter = this.project.getRowFilter().shallowClone();
				this.rowDendrogram = dendrogram;
				this.project.setRowSortKeys(
					[new morpheus.SpecifiedModelSortOrder(modelIndices,
						nvisible, 'dendrogram')], true);
			}
			dendrogram.appendTo(this.$parent);
			dendrogram.$label.appendTo(this.$parent);
			dendrogram.$squishedLabel.appendTo(this.$parent);

		} else { // no more dendrogram
			var sortKeys = isColumns ? this.project.getColumnSortKeys()
				: this.project.getRowSortKeys();
			// remove dendrogram sort key
			for (var i = 0; i < sortKeys.length; i++) {
				if (sortKeys[i] instanceof morpheus.SpecifiedModelSortOrder
					&& sortKeys[i].name === 'dendrogram') {
					sortKeys.splice(i, 1);
					i--;
				}
			}
			if (isColumns) {
				this.heatmap.getColumnPositions().setSquishedIndices(null);
				delete this.columnDendrogram;
				this.project.setColumnSortKeys(sortKeys, true);
			} else {
				delete this.rowDendrogram;
				this.project.setRowSortKeys(sortKeys, true);
				this.heatmap.getRowPositions().setSquishedIndices(null);
			}

		}
		// FIXME update grouping
		this.trigger('dendrogramChanged', {
			isColumns: isColumns
		});
	},

	setCustomUrls: function (customUrls) {
		this._customUrls = customUrls;
	},
	getTabManager: function () {
		return this.tabManager;
	},
	getSelectedElementsText: function () {
		var _this = this;
		var project = this.project;
		var selectedViewIndices = project.getElementSelectionModel()
		.getViewIndices();
		if (selectedViewIndices.size() > 0) {
			var tipText = [];
			var dataset = project.getSortedFilteredDataset();
			var rowTracks = _this.rowTracks.filter(function (t) {
				return t.settings.inlineTooltip;
			});
			var columnTracks = _this.columnTracks.filter(function (t) {
				return t.settings.inlineTooltip;
			});
			selectedViewIndices.forEach(function (id) {
				var rowIndex = id.getArray()[0];
				var columnIndex = id.getArray()[1];
				tipText.push(morpheus.Util.nf(dataset.getValue(rowIndex,
					columnIndex)));
				rowTracks.forEach(function (track) {
					tipText.push('\t');
					tipText.push(morpheus.Util.toString(dataset
					.getRowMetadata().getByName(track.name).getValue(
						rowIndex)));
				});
				columnTracks.forEach(function (track) {
					tipText.push('\t');
					tipText.push(morpheus.Util.toString(dataset
					.getColumnMetadata().getByName(track.name)
					.getValue(columnIndex)));
				});

				tipText.push('\n');

			});
			return tipText.join('');

		}

	},
	_init: function () {
		var _this = this;
		morpheus.MetadataUtil.renameFields(this.options.dataset, this.options);
		var dataset = this.options.dataset;
		var rowDendrogram = this.options.rowDendrogram;
		var columnDendrogram = this.options.columnDendrogram;
		_.each(this.whenLoaded, function (f) {
			f(_this.options.dataset);
		});
		if (this.options.datasetReady) {
			var updatedDataset = this.options.datasetReady(dataset);
			if (updatedDataset) {
				dataset = updatedDataset;
			}
		}

		this.project = this.options.symmetric ? new morpheus.SymmetricProject(
			dataset) : new morpheus.Project(dataset);

		this.tabManager.setTabTitle(this.tabId, this.project.getFullDataset()
			.getRowCount()
			+ ' row'
			+ morpheus.Util.s(this.project.getFullDataset().getRowCount())
			+ ' x '
			+ this.project.getFullDataset().getColumnCount()
			+ ' column'
			+ morpheus.Util.s(this.project.getFullDataset()
			.getColumnCount()));
		if (this.options.inheritFromParent && this.options.parent != null) {
			morpheus.HeatMap.copyFromParent(this.project, this.options);
		}

		var createFiltersFromOptions = function (filters, isColumns) {
			// name, 1. set if string filter, 2. min, max if range filter
			// 3. top and isTop if top n filter
			_.each(filters, function (filter) {
				if (filter.values) {
					if ((isColumns ? _this.project.getFullDataset()
						.getColumnMetadata().getByName(filter.name)
							: _this.project.getFullDataset().getRowMetadata()
						.getByName(filter.name)) != null) {
						var set = new morpheus.Set();
						for (var i = 0; i < filter.values.length; i++) {
							set.add(filter.values[i]);
						}
						(isColumns ? _this.project.getColumnFilter()
							: _this.project.getRowFilter())
						.add(new morpheus.VectorFilter(set, -1,
							filter.name));
					}
				} else {
					(isColumns ? _this.project.getColumnFilter()
						: _this.project.getRowFilter()).add(filter);
				}
			});
			// filter ui will be initialized automatically
			if (isColumns) {
				_this.project.setColumnFilter(_this.project.getColumnFilter(),
					true);
			} else {
				_this.project.setRowFilter(_this.project.getRowFilter());
			}

		};
		if (this.options.rowFilter) {
			createFiltersFromOptions(this.options.rowFilter, false);
		}
		if (this.options.columnFilter) {
			createFiltersFromOptions(this.options.columnFilter, true);
		}
		this.whenLoaded = null;
		this.$parent = $('<div></div>').css('position', 'relative');

		this.$parent.appendTo(this.$content);
		this.toolbar = new morpheus.HeatMapToolBar(this);
		if (this.options.customUrls) {
			this.setCustomUrls(this.options.customUrls);
		}

		// scroll bars at the bottom of the heatmap, and right of the heatmap
		// TODO along bottom of row metadata, and along left of column metadata
		// the viewport is the size of the visible region, the view is the full
		// size of the heat map
		this.vscroll = new morpheus.ScrollBar(true);
		this.vscroll.appendTo(this.$parent);
		this.vscroll.on('scroll', function () {
			if (_this.updatingScroll) {
				return;
			}
			_this.paintAll({
				paintRows: true,
				paintColumns: false,
				invalidateRows: true,
				invalidateColumns: false
			});
		});

		// for resizing column dendrogram
		this.beforeColumnTrackDivider = new morpheus.Divider(false);
		this.beforeColumnTrackDivider.appendTo(this.$parent);
		var dragStartHeight = 0;
		this.beforeColumnTrackDivider.on('resizeStart', function (e) {
			dragStartHeight = _this.columnDendrogram.getUnscaledHeight();
		}).on('resize', function (e) {
			// grow or shrink the column dendrogram
			var newHeight = Math.max(8, dragStartHeight + e.delta);
			_this.columnDendrogram.setPrefHeight(newHeight);
			_this.revalidate();
		}).on('resizeEnd', function () {
			dragStartHeight = 0;
		});

		// for resizing row dendrogram
		this.afterRowDendrogramDivider = new morpheus.Divider(true);
		this.afterRowDendrogramDivider.appendTo(this.$parent);
		var rowDendrogramStartWidth = 0;
		this.afterRowDendrogramDivider.on('resizeStart', function (e) {
			rowDendrogramStartWidth = _this.rowDendrogram.getUnscaledWidth();
		}).on('resize', function (e) {
			// grow or shrink the column dendrogram
			var newWidth = Math.max(8, rowDendrogramStartWidth + e.delta);
			_this.rowDendrogram.setPrefWidth(newWidth);
			_this.revalidate();
		}).on('resizeEnd', function () {
			rowDendrogramStartWidth = 0;
		});

		this.afterVerticalScrollBarDivider = new morpheus.Divider(true);
		this.afterVerticalScrollBarDivider.appendTo(this.$parent);
		var resizeStartHeatMapWidth = 0;
		this.afterVerticalScrollBarDivider.on('resizeStart', function (e) {
			resizeStartHeatMapWidth = _this.heatmap.getUnscaledWidth();
		}).on('resize', function (e) {
			// grow or shrink the heat map
			_this.heatmap.prefWidth = resizeStartHeatMapWidth + e.delta;
			_this.revalidate();
		});
		// horizontal scroll
		this.hscroll = new morpheus.ScrollBar(false);
		this.hscroll.appendTo(this.$parent);
		this.hscroll.on('scroll', function () {
			if (_this.updatingScroll) {
				return;
			}
			_this.paintAll({
				paintRows: false,
				paintColumns: true,
				invalidateRows: false,
				invalidateColumns: true
			});
		});
		var heatmap = new morpheus.HeatMapElementCanvas(this.project);
		if (this.options.drawCallback) {
			heatmap.setDrawCallback(this.options.drawCallback);
		}

		$(heatmap.canvas)
		.on(
			'contextmenu',
			function (e) {

				morpheus.Popup
				.showPopup(
					[

						{
							name: 'Copy',
							disabled: _this.project
							.getElementSelectionModel()
							.count() === 0
						},
						{
							name: 'Save Image (Ctrl-S)'
						},
						{
							separator: true
						},
						{
							name: 'Show Inline Tooltip',
							checked: _this.options.inlineTooltip
						}],
					{
						x: e.pageX,
						y: e.pageY
					},
					e.target,
					function (event, item) {
						if (item === 'Show Inline Tooltip') {
							_this.options.inlineTooltip = !_this.options.inlineTooltip;
						} else if (item === 'Save Image (Ctrl-S)') {
							morpheus.HeatMap
							.showTool(
								new morpheus.SaveImageTool(),
								_this);
						} else if ('Copy') {
							var text = _this
							.getSelectedElementsText();
							if (text !== '') {
								event.clipboardData
								.setData(
									'text/plain',
									text);
							}
						}
					});

				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
			});
		heatmap.appendTo(this.$parent);
		this.heatmap = heatmap;
		var rowDendrogramSortKey = null;
		if (rowDendrogram != undefined) {
			var tree = rowDendrogram;
			if (tree.leafNodes.length !== this.project.getFullDataset()
				.getRowCount()) {
				throw '# leaf nodes in row dendrogram ' + tree.leafNodes.length
				+ ' != ' + this.project.getFullDataset().getRowCount();
			}

			if (this.options.rowDendrogramField != null) {
				var vector = dataset.getRowMetadata().getByName(
					this.options.rowDendrogramField);
				var rowIndices = [];
				var map = new morpheus.Map();
				var re = /[,:]/g;
				for (var j = 0, size = vector.size(); j < size; j++) {
					var key = vector.getValue(j);
					map.set(key.replace(re, ''), j);
				}
				// need to replace special characters to match ids in newick
				// file

				for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
					var index = map.get(tree.leafNodes[i].name);
					if (index === undefined) {
						throw 'Unable to find row dendrogram id '
						+ tree.leafNodes[i].name
						+ ' in row annotations';
					}
					rowIndices.push(index);
				}
			} else {
				for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
					rowIndices.push(i);
				}
			}
			this.rowDendrogram = new morpheus.RowDendrogram(this, tree, heatmap
			.getRowPositions(), this.project, true);
			rowDendrogramSortKey = new morpheus.SpecifiedModelSortOrder(
				rowIndices, rowIndices.length, 'dendrogram');
			this.rowDendrogram.appendTo(this.$parent);
			this.rowDendrogram.$label.appendTo(this.$parent);
			this.rowDendrogram.$squishedLabel.appendTo(this.$parent);
		}
		var columnDendrogramSortKey = null;
		if (columnDendrogram !== undefined) {
			var tree = columnDendrogram;

			if (tree.leafNodes.length !== this.project.getFullDataset()
				.getColumnCount()) {
				throw '# leaf nodes ' + tree.leafNodes.length + ' != '
				+ this.project.getFullDataset().getColumnCount();
			}
			var columnIndices = [];

			if (this.options.columnDendrogramField != null) {
				var vector = dataset.getColumnMetadata().getByName(
					this.options.columnDendrogramField);
				var map = new morpheus.Map();
				var re = /[,:]/g;
				for (var j = 0, size = vector.size(); j < size; j++) {
					var key = vector.getValue(j);
					map.set(key.replace(re, ''), j);
				}

				for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
					var index = map.get(tree.leafNodes[i].name);
					if (index === undefined) {
						throw 'Unable to find column dendrogram id '
						+ tree.leafNodes[i].name
						+ ' in column annotations';
					}
					columnIndices.push(index);
				}
			} else {
				for (var i = 0, length = tree.leafNodes.length; i < length; i++) {
					columnIndices.push(i);
				}

			}
			this.columnDendrogram = new morpheus.ColumnDendrogram(this, tree,
				heatmap.getColumnPositions(), this.project, true);
			columnDendrogramSortKey = new morpheus.SpecifiedModelSortOrder(
				columnIndices, columnIndices.length, 'dendrogram');
			this.columnDendrogram.appendTo(this.$parent);
			this.columnDendrogram.$label.appendTo(this.$parent);
			this.columnDendrogram.$squishedLabel.appendTo(this.$parent);
		}
		if (rowDendrogramSortKey !== null) {
			this.project.setRowSortKeys([rowDendrogramSortKey]);
		}
		if (columnDendrogramSortKey !== null) {
			this.project.setColumnSortKeys([columnDendrogramSortKey]);
		}
		if (this.options.rowGroupBy != null) {
			for (var i = 0; i < this.options.rowGroupBy.length; i++) {
				var key = new morpheus.SortKey(this.options.rowGroupBy[i],
					morpheus.SortKey.SortOrder.UNSORTED);
				this.project.groupRows.push(key);
			}
		}
		if (this.options.rowSortBy) {
			var keys = [];
			for (var i = 0; i < this.options.rowSortBy.length; i++) {
				var sortBy = this.options.rowSortBy[i];
				if (sortBy.modelIndices != null
					&& morpheus.Util.isArray(sortBy.modelIndices)) {
					// sort by values
					keys.push(new morpheus.SortByValuesKey(
						this.options.rowSortBy[i].modelIndices,
						this.options.rowSortBy[i].order, false));
				} else {
					// name is deprecated, use field
					var name = sortBy.name != null ? sortBy.name : sortBy.field;
					if (this.project.getFullDataset().getRowMetadata()
						.getByName(name) != null) {
						keys.push(new morpheus.SortKey(name, sortBy.order));
					}
				}
			}
			this.project.setRowSortKeys(keys, false);
		}
		if (this.options.columnGroupBy != null) {
			for (var i = 0; i < this.options.columnGroupBy.length; i++) {
				var key = new morpheus.SortKey(this.options.columnGroupBy[i],
					morpheus.SortKey.SortOrder.UNSORTED);
				this.project.groupColumns.push(key);
			}
		}
		if (this.options.columnSortBy) {
			var keys = [];
			for (var i = 0; i < this.options.columnSortBy.length; i++) {
				var sortBy = this.options.columnSortBy[i];
				if (sortBy.modelIndices != null
					&& morpheus.Util.isArray(sortBy.modelIndices)) {
					keys.push(new morpheus.SortByValuesKey(sortBy.modelIndices,
						sortBy.order, true));
				} else {
					// name is deprecated, use field
					var name = sortBy.name != null ? sortBy.name : sortBy.field;
					if (this.project.getFullDataset().getColumnMetadata()
						.getByName(name) != null) {
						keys.push(new morpheus.SortKey(name, sortBy.order));
					}
				}
			}
			this.project.setColumnSortKeys(keys, false);
		}
		this.vSortByValuesIndicator = new morpheus.SortByValuesIndicator(
			this.project, true, heatmap.getRowPositions());
		this.vSortByValuesIndicator.appendTo(this.$parent);
		this.hSortByValuesIndicator = new morpheus.SortByValuesIndicator(
			this.project, false, heatmap.getColumnPositions());
		this.hSortByValuesIndicator.appendTo(this.$parent);
		this.verticalSearchBar = new morpheus.ScentedSearch(this.project
			.getRowSelectionModel(), heatmap.getRowPositions(), true,
			this.vscroll, this);
		this.horizontalSearchBar = new morpheus.ScentedSearch(this.project
			.getColumnSelectionModel(), heatmap.getColumnPositions(),
			false, this.hscroll, this);
		this.rowTracks = [];
		this.rowTrackHeaders = [];
		this.columnTracks = [];
		this.columnTrackHeaders = [];
		var setInitialDisplay = function (isColumns, options) {
			var nameToOption = new morpheus.Map();
			// at
			// least
			// one
			// display option
			// supplied
			var displaySpecified = false || (_this.options.parent != null && _this.options.inheritFromParent);
			_.each(options, function (option) {
				if (!displaySpecified) {
					displaySpecified = option.display != null;
				}
				nameToOption.set(option.renameTo != null ? option.renameTo
					: option.field, option);
			});

			var displayMetadata = isColumns ? dataset.getColumnMetadata()
				: dataset.getRowMetadata();
			// see if default fields found
			if (!displaySpecified) {
				var defaultFieldsToShow = new morpheus.Set();
				['pert_iname', 'moa', 'target', 'description']
				.forEach(function (field) {
					defaultFieldsToShow.add(field);
				});
				for (var i = 0, metadataCount = displayMetadata
				.getMetadataCount(); i < metadataCount; i++) {
					var v = displayMetadata.get(i);
					if (defaultFieldsToShow.has(v.getName())) {
						nameToOption.set(v.getName(), {
							display: 'text'
						});
						displaySpecified = true;
					}

				}

			}
			var isFirst = true;
			for (var i = 0, metadataCount = displayMetadata.getMetadataCount(); i < metadataCount; i++) {
				var display = displaySpecified ? 'None' : undefined;
				var v = displayMetadata.get(i);
				var name = v.getName();
				var option = nameToOption.get(name);

				if (morpheus.MetadataUtil.DEFAULT_HIDDEN_FIELDS.has(name)
					&& option == null) {
					continue;
				}
				var count = isColumns ? dataset.getColumnCount() : dataset
				.getRowCount();
				if (!option && !displaySpecified && count > 1
					&& !morpheus.VectorUtil.containsMoreThanOneValue(v)) {
					continue;
				}
				if (option == null) {
					option = {};
				}
				if (option.title) {
					v.getProperties().set(morpheus.VectorKeys.TITLE,
						option.title);
				}
				if (option.display) {
					if (typeof option.display == 'function') {
						display = option.display(name);
					} else {
						display = option.display;
					}
				}
				var add = display !== 'None';
				if (add) {
					if (display == null) {
						if (name === 'pert_iname' || name === 'id' || isFirst) {
							display = 'text,tooltip';
						} else {
							display = isColumns ? 'color,highlight' : 'text';
						}
					}
					isFirst = false;
					var track = isColumns ? _this.addColumnTrack(name, display)
						: _this.addRowTrack(name, display);
					if (track.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)
						&& option.color) {
						var m = isColumns ? _this.project.getColumnColorModel()
							: _this.project.getRowColorModel();
						if (track.isDiscrete()) {
							_.each(options.color, function (p) {
								m.setMappedValue(v, p.value, p.color);
							});
						} else {
							var cs = m.createContinuousColorMap(v);
							var min = Number.MAX_VALUE;
							var max = -Number.MAX_VALUE;
							_.each(options.color, function (p) {
								min = Math.min(min, p.value);
								max = Math.max(max, p.value);
							});

							cs.setMin(min);
							cs.setMax(max);
							var valueToFraction = d3.scale.linear().domain(
								[cs.getMin(), cs.getMax()]).range(
								[0, 1]).clamp(true);
							var fractions = [];
							var colors = [];
							_.each(options.color, function (p) {
								fractions.push(valueToFraction(p.value));
								colors.push(p.color);
							});

							cs.setFractions({
								fractions: fractions,
								colors: colors
							});
						}
					}
					if (track.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)
						&& option.shape) {
						var m = isColumns ? _this.project.getColumnShapeModel()
							: _this.project.getRowShapeModel();
						_.each(options.shape, function (p) {
							m.setMappedValue(v, p.value, p.shape);
						});

					}
				}
			}
		};
		setInitialDisplay(false, this.options.rows);
		setInitialDisplay(true, this.options.columns);
		function reorderTracks(array, isColumns) {
			var nameOrderPairs = [];
			var found = false;
			_.each(array, function (item) {
				var name = item.renameTo || item.field;
				var order = 999;
				if (item.order != null) {
					order = item.order;
					found = true;
				}
				nameOrderPairs.push({
					name: name,
					order: order
				});
			});
			if (found) {
				nameOrderPairs.sort(function (a, b) {
					return (a.order === b.order ? 0 : (a.order < b.order ? -1
						: 1));
				});
				for (var i = 0, counter = 0; i < nameOrderPairs.length; i++) {
					var index = _this.getTrackIndex(nameOrderPairs[i].name,
						isColumns);
					if (index !== -1) {
						_this.moveTrack(index, counter, isColumns);
						counter++;
					}
				}
			}
		}

		reorderTracks(this.options.rows, false);
		reorderTracks(this.options.columns, true);
		var colorSchemeSpecified = this.options.colorScheme != null;
		if (this.options.colorScheme == null) {
			var ext = '';
			if (this.options.dataSource) {
				try {
					ext = morpheus.Util.getExtension(morpheus.Util
					.getFileName(this.options.dataSource));
				} catch (x) {

				}
			}

			var colorScheme = this.autoDisplay({
				filename: morpheus.Util.getBaseFileName(morpheus.Util.getFileName(this.options.dataset)),
				extension: ext
			});
			if (colorScheme == null) {
				colorScheme = {
					type: 'relative'
				};
			}
			this.options.colorScheme = colorScheme;
			var name = this.project.getFullDataset().getName();
			if (ext === 'maf' && !this.options.rowSortBy) {
				var sortKeys = [];
				if (this.project.getFullDataset().getRowMetadata().getByName(
						'order')) {
					sortKeys.push(new morpheus.SortKey('order',
						morpheus.SortKey.SortOrder.ASCENDING));
				}
				sortKeys.push(new morpheus.SortKey('id',
					morpheus.SortKey.SortOrder.ASCENDING));
				this.project.setRowSortKeys(sortKeys, false);

			}
			if (morpheus.DatasetUtil.getSeriesIndex(this.project
				.getFullDataset(), 'allelic_fraction') !== -1) {
				this.options.sizeBy = 'allelic_fraction';
			}

		}

		if (this.options.parent && this.options.inheritFromParent
			&& !colorSchemeSpecified) {
			heatmap.setColorScheme(this.options.parent.heatmap.getColorScheme()
			.copy(this.project));
		} else {
			heatmap.setColorScheme(new morpheus.HeatMapColorScheme(
				this.project, this.options.colorScheme));
			if (this.options.dataset.getRowMetadata().getByName('Source') != null) {
				// separate color scheme for each source file
				var sourcesSet = morpheus.VectorUtil
				.getSet(this.options.dataset.getRowMetadata()
				.getByName('Source'));
				this.heatmap.getColorScheme()
				.setSeparateColorSchemeForRowMetadataField('Source');
				sourcesSet.forEach(function (source) {
					_this.autoDisplay({
						extension: morpheus.Util.getExtension(source),
						filename: '' + source
					});
				});
			}
		}

		if (this.options.sizeBy) {
			heatmap.getColorScheme().getSizer().setSeriesName(
				this.options.sizeBy);
		}
		this.updateDataset();
		if (this.options.uiReady) {
			this.options.uiReady(this);
		}
		if (this.options.tabOpened) {
			try {
				this.options.tabOpened(this);
			} catch (x) {
				console.log('Error in tabOpened');
				if (x.stack) {
					console.log(x.stack);
				}
			}
			this.updateDataset();
		}
		if (this.options.renderReady) {
			try {
				this.options.renderReady(this);
			} catch (x) {
				console.log('Error in renderReady');
				if (x.stack) {
					console.log(x.stack);
				}
			}
			this.updateDataset();
		}

		if (this.options.rowSize != null) {
			if (this.options.rowSize === 'fit') {
				this.heatmap.getRowPositions().setSize(this.getFitRowSize());
			} else {
				this.heatmap.getRowPositions().setSize(this.options.rowSize);
			}
			this.revalidate({
				paint: false
			});

		}
		if (this.options.columnSize != null) {
			if (this.options.columnSize === 'fit') {
				this.heatmap.getColumnPositions().setSize(
					this.getFitColumnSize());
			} else {
				this.heatmap.getColumnPositions().setSize(
					this.options.columnSize);
			}
			this.revalidate({
				paint: false
			});
		}
		if (this.options.rowSize != null && this.options.columnSize != null) {
			// note that we have to revalidate twice because column sizes are
			// dependent on row sizes and vice versa
			if (this.options.columnSize === 'fit') {
				this.heatmap.getColumnPositions().setSize(
					this.getFitColumnSize());
				this.revalidate({
					paint: false
				});
			}
			if (this.options.rowSize === 'fit') {
				this.heatmap.getRowPositions().setSize(this.getFitRowSize());
				this.revalidate({
					paint: false
				});
			}
			this.paintAll({
				paintRows: true,
				paintColumns: true,
				invalidateRows: true,
				invalidateColumns: true
			});
		}

		this.options.parent = null;
		this.$tipFollow = $('<div style="left:-1000px; top:-1000px;" class="morpheus-tip-inline"></div>');
		this.$tipFollow.appendTo(this.$parent);

		this.$tipInfoWindow = $('<div class="morpheus-tip-dialog"></div>');
		this.$tipInfoWindow.appendTo(this.$parent);

		this.$tipInfoWindow.dialog({
			close: function (event, ui) {
				if (!_this._togglingInfoWindow) {
					_this.toggleInfoWindow();
				}
			},
			autoOpen: false,
			width: 220,
			height: 280,
			minHeight: 38,
			minWidth: 10,
			collision: 'fit',
			position: {
				my: 'right-30 bottom',
				at: 'right top',
				of: this.$parent
			},
			title: 'Info'
		});

		this
		.getProject()
		.on(
			'rowFilterChanged columnFilterChanged rowGroupByChanged columnGroupByChanged rowSortOrderChanged columnSortOrderChanged datasetChanged',
			function (e) {
				if (e.type === 'datasetChanged') { // remove
					// tracks
					// that are no
					// longer in the
					// dataset

					var dataset = _this.getProject()
					.getFullDataset();
					for (var i = 0; i < _this.rowTracks.length; i++) {
						var track = _this.rowTracks[i];
						if (!dataset.getRowMetadata().getByName(
								track.getName())) {
							_this.removeTrack(track.getName(),
								false);
							i--;
						}
					}
					for (var i = 0; i < _this.columnTracks.length; i++) {
						var track = _this.columnTracks[i];
						if (!dataset.getColumnMetadata().getByName(
								track.getName())) {
							_this
							.removeTrack(track.getName(),
								true);
							i--;
						}
					}

				}

				_this.updateDataset();
				_this.revalidate();
			});

		this.getProject().on('trackChanged', function (e) {
			var columns = e.columns;
			_.each(e.vectors, function (v, i) {
				var index = _this.getTrackIndex(v.getName(), columns);
				if (index === -1) {
					if (columns) {
						_this.addColumnTrack(v.getName(), e.render[i]);
					} else {
						_this.addRowTrack(v.getName(), e.render[i]);
					}
				} else {
					// repaint
					var track = _this.getTrackByIndex(index, columns);
					var render = e.render[i];
					if (render) {
						track.settingFromConfig(render);
					}
					track.setInvalid(true);
				}
			});
			_this.revalidate();
		});
		this.getProject().on('rowTrackRemoved', function (e) {
			_this.removeTrack(e.vector.getName(), false);
			_this.revalidate();
		});
		this.getProject().on('columnTrackRemoved', function (e) {
			_this.removeTrack(e.vector.getName(), true);
			_this.revalidate();
		});
		this
		.getProject()
		.getRowSelectionModel()
		.on(
			'selectionChanged',
			function () {
				// repaint tracks that indicate selection
				for (var i = 0; i < _this.columnTracks.length; i++) {
					var track = _this.columnTracks[i];
					if (track.settings.stackedBar
						&& track
						.isRenderAs(morpheus.VectorTrack.RENDER.BAR)) {
						track.setInvalid(true);
						track.repaint();

					}
				}
				_this.verticalSearchBar.update();
				_this.paintAll({
					paintRows: true,
					paintColumns: false,
					invalidateRows: false,
					invalidateColumns: false
				});
			});
		this.getProject().getColumnSelectionModel().on('selectionChanged',
			function () {

				_this.horizontalSearchBar.update();
				_this.paintAll({
					paintRows: false,
					paintColumns: true,
					invalidateRows: false,
					invalidateColumns: false
				});
			});

		$(window)
		.on(
			'paste.morpheus',
			function (e) {
				if (_this.isActiveComponent()) {
					var text = e.originalEvent.clipboardData
					.getData('text/plain');
					if (text != null && text.length > 0) {
						var blob = new Blob([text]);
						var url = window.URL.createObjectURL(blob);
						e.preventDefault();
						e.stopPropagation();
						morpheus.HeatMap.showTool(
							new morpheus.OpenFileTool({
								file: url
							}), _this);
					}
				}
			})
		.on('beforecopy.morpheus', function (e) {
			if (_this.isActiveComponent()) {
				e.preventDefault();
			}
		})
		.on(
			'copy.morpheus',
			function (ev) {
				if (_this.isActiveComponent()) {
					var activeComponent = _this
					.getActiveComponent();
					var project = _this.project;

					if (activeComponent === 2) {
						var text = _this.getSelectedElementsText();
						if (text !== '') {
							ev.originalEvent.clipboardData.setData(
								'text/plain', text);
							ev.preventDefault();
							ev.stopImmediatePropagation();
							return;
						}
					}
					// copy all selected rows and columns
					var dataset = project.getSelectedDataset({
						emptyToAll: false
					});
					var columnMetadata = dataset
					.getColumnMetadata();
					var rowMetadata = dataset.getRowMetadata();
					// only copy visible tracks
					var visibleColumnFields = _this
					.getVisibleTrackNames(true);
					var columnFieldIndices = [];
					_.each(visibleColumnFields, function (name) {
						var index = morpheus.MetadataUtil.indexOf(
							columnMetadata, name);
						if (index !== -1) {
							columnFieldIndices.push(index);
						}
					});
					columnMetadata = new morpheus.MetadataModelColumnView(
						columnMetadata, columnFieldIndices);
					var rowMetadata = dataset.getRowMetadata();
					// only copy visible tracks
					var visibleRowFields = _this
					.getVisibleTrackNames(false);
					var rowFieldIndices = [];
					_.each(visibleRowFields, function (name) {
						var index = morpheus.MetadataUtil.indexOf(
							rowMetadata, name);
						if (index !== -1) {
							rowFieldIndices.push(index);
						}
					});
					rowMetadata = new morpheus.MetadataModelColumnView(
						rowMetadata, rowFieldIndices);
					var text = [];
					var rowsSelected = dataset.getRowCount() > 0;
					var columnsSelected = dataset.getColumnCount() > 0;
					if (rowsSelected && columnsSelected) { // copy
						// as
						// gct
						// 1.3
						text = new morpheus.GctWriter()
						.write(dataset);
					} else {
						var text = [];
						var model = rowsSelected ? rowMetadata
							: columnMetadata;
						for (var i = 0, count = model
						.getItemCount(); i < count; i++) {
							for (var j = 0, nfields = model
							.getMetadataCount(); j < nfields; j++) {
								var v = model.get(j);
								if (j > 0) {
									text.push('\t');
								}
								text.push(morpheus.Util.toString(v
								.getValue(i)));
							}
							text.push('\n');
						}
						text = text.join('');
					}
					ev.originalEvent.clipboardData.setData(
						'text/plain', text);
					ev.preventDefault();
					ev.stopImmediatePropagation();

				}
			});
		if (this.options.keyboard) {
			new morpheus.HeatMapKeyListener(this);
		}
		var dragStartScrollTop;
		var dragStartScrollLeft;
		this.hammer = morpheus.Util
		.hammer(_this.heatmap.canvas, ['pan', 'pinch', 'tap'])
		.on('panmove', function (event) {
			_this.updatingScroll = true;
			var rows = false;
			var columns = false;
			if (event.deltaY !== 0) {
				var pos = dragStartScrollTop + event.deltaY;
				_this.scrollTop(pos);
				rows = true;
			}
			if (event.deltaX !== 0) {
				var pos = dragStartScrollLeft + event.deltaX;
				_this.scrollLeft(pos);
				columns = true;
			}
			_this.updatingScroll = false;
			_this.paintAll({
				paintRows: rows,
				paintColumns: rows,
				invalidateRows: rows,
				invalidateColumns: columns
			});
			event.preventDefault();
		})
		.on('panstart', function (event) {
			dragStartScrollTop = _this.scrollTop();
			dragStartScrollLeft = _this.scrollLeft();
		})
		.on(
			'tap',
			function (event) {
				var commandKey = morpheus.Util.IS_MAC ? event.srcEvent.metaKey
					: event.srcEvent.ctrlKey;
				if (morpheus.Util.IS_MAC && event.srcEvent.ctrlKey) { // right-click
					// on
					// Mac
					return;
				}
				var position = morpheus.CanvasUtil
				.getMousePosWithScroll(event.target, event,
					_this.scrollLeft(), _this
					.scrollTop());
				var rowIndex = _this.heatmap.getRowPositions()
				.getIndex(position.y, false);
				var columnIndex = _this.heatmap
				.getColumnPositions().getIndex(position.x,
					false);
				_this.project.getElementSelectionModel().click(
					rowIndex, columnIndex,
					event.srcEvent.shiftKey || commandKey);
			})
		.on(
			'pinch',
			function (event) {
				var scale = event.scale;
				_this.heatmap.getRowPositions().setSize(13 * scale);
				_this.heatmap.getColumnPositions().setSize(
					13 * scale);
				var reval = {};
				if (_this.project.getHoverRowIndex() !== -1) {
					reval.scrollTop = this.heatmap
					.getRowPositions()
					.getPosition(
						this.project.getHoverRowIndex());
				}
				if (_this.project.getHoverColumnIndex() !== -1) {
					reval.scrollLeft = this.heatmap
					.getColumnPositions().getPosition(
						this.project
						.getHoverColumnIndex());
				}

				_this.revalidate(reval);
				event.preventDefault();
			});
		var heatMapMouseMoved = function (event) {
			var mouseI, mouseJ;
			if (event.type === 'mouseout') {
				mouseI = -1;
				mouseJ = -1;
			} else {
				var position = morpheus.CanvasUtil.getMousePosWithScroll(
					event.target, event, _this.scrollLeft(), _this
					.scrollTop());
				mouseI = _this.heatmap.getRowPositions().getIndex(position.y,
					false);
				mouseJ = _this.heatmap.getColumnPositions().getIndex(
					position.x, false);
			}
			_this.setMousePosition(mouseI, mouseJ, {
				event: event
			});
		};
		$(_this.heatmap.canvas).on('mouseout', heatMapMouseMoved).on(
			'mousemove', heatMapMouseMoved);
		_.each(this.options.tools, function (item) {

			var tool = _this.toolbar.getToolByName(item.name);
			if (tool == null) {
				console.log(item.name + ' not found.');
			} else {
				try {
					var gui = tool.gui(_this.getProject());
					var formBuilder = new morpheus.FormBuilder();
					_.each(gui, function (item) {
						formBuilder.append(item);
					});
					var input = {};
					_.each(gui, function (item) {
						input[item.name] = formBuilder.getValue(item.name);
					});
					if (item.params) {
						// overide default values
						for (var key in item.params) {
							input[key] = item.params[key];
						}
					}

					tool.execute({
						controller: _this,
						project: _this.getProject(),
						input: input
					});
				} catch (x) {
					if (x.stack) {
						console.log(x.stack);
					}
					console.log('Error running ' + item.name);
				} finally {
					if (tool.dispose) {
						tool.dispose();
					}
				}
			}

		});
	},
	setMousePosition: function (i, j, options) {
		this.mousePositionOptions = options;
		var updateColumns = this.project.getHoverColumnIndex() !== j;
		var updateRows = this.project.getHoverRowIndex() !== i;
		if (updateColumns || updateRows) {
			this.project.setHoverRowIndex(i);
			this.project.setHoverColumnIndex(j);
			this.setToolTip(i, j, options);
			this.paintAll({
				paintRows: updateRows,
				paintColumns: updateColumns,
				invalidateRows: false,
				invalidateColumns: false
			});
		} else {
			this._updateTipFollowPosition(options);

		}
		// else if (this.tooltipMode === 2 &&
		// (this.project.getHoverColumnIndex() !== -1 || this.project
		// .getHoverRowIndex() !== -1)) {
		//
		// }
		this.trigger('change', {
			name: 'setMousePosition',
			source: this,
			arguments: arguments
		});
	},
	setTooltipMode: function (mode) {
		this._togglingInfoWindow = true;
		this.tooltipMode = mode;
		this.$tipInfoWindow.html('');
		this.toolbar.$tip.html('');
		this.$tipFollow.html('').css({
			left: -1000,
			top: -1000
		});
		this.setToolTip(-1, -1);
		if (this.tooltipMode === 1) {
			this.$tipInfoWindow.dialog('open');
		} else {
			this.$tipInfoWindow.dialog('close');
		}
		this._togglingInfoWindow = false;
	},
	toggleInfoWindow: function () {
		this.setTooltipMode(this.tooltipMode == 1 ? 0 : 1);
	},
	_setTipText: function (tipText, tipFollowText, options) {
		if (this.tooltipMode === 0) {
			this.toolbar.$tip.html(tipText.join(''));
		} else if (this.tooltipMode === 1) {
			this.$tipInfoWindow.html(tipText.join(''));
		}

		if (tipFollowText.length > 0) {
			this.tipFollowHidden = false;
			this.$tipFollow.html('<span style="max-width:400px;">' + tipFollowText.join('') + '</span>');
			this._updateTipFollowPosition(options);
		} else {
			this.tipFollowHidden = true;
			this.$tipFollow.html('').css({
				left: -1000,
				top: -1000
			});
		}
		this.trigger('change', {
			name: 'setToolTip',
			source: this,
			arguments: arguments
		});
	},
	setToolTip: function (rowIndex, columnIndex, options) {
		options = options || {};
		if (this.options.showSeriesNameInTooltip) {
			options.showSeriesNameInTooltip = true;
		}
		if (options.heatMapLens) {
			// don't draw lens if currently visible
			// row lens
			var $wrapper = $('<div></div>');
			var wrapperHeight = 0;
			var wrapperWidth = 0;
			var found = false;
			var inline = [];
			if (rowIndex != null && rowIndex.length > 0) {
				for (var hoverIndex = 0; hoverIndex < rowIndex.length; hoverIndex++) {
					var row = rowIndex[hoverIndex];
					if (row >= 0 && (row >= this.heatmap.lastPosition.bottom || row < this.heatmap.lastPosition.top)) {
						found = true;
						var heatMapWidth = this.heatmap.getUnscaledWidth();
						var top = row; // Math.max(0, rowIndex - 1);
						var bottom = row + 1; //Math.min(rowIndex + 1, this.heatmap.rowPositions.getLength());
						var startPix = this.heatmap.rowPositions.getPosition(top);
						var endPix = startPix + this.heatmap.rowPositions.getItemSize(top);
						var heatMapHeight = endPix - startPix;
						var canvas = morpheus.CanvasUtil.createCanvas();
						var trackWidth = 0;
						for (var i = 0, ntracks = this.rowTracks.length; i < ntracks; i++) {
							var track = this.rowTracks[i];
							if (track.isVisible()) {
								trackWidth += track.getUnscaledWidth();
							}
						}

						var canvasWidth = trackWidth + heatMapWidth + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
						canvas.width = canvasWidth * morpheus.CanvasUtil.BACKING_SCALE;
						canvas.style.width = canvasWidth + 'px';

						canvas.height = heatMapHeight * morpheus.CanvasUtil.BACKING_SCALE;
						canvas.style.height = heatMapHeight + 'px';
						var context = canvas.getContext('2d');
						morpheus.CanvasUtil.resetTransform(context);
						context.save();
						context.translate(-this.heatmap.lastClip.x, -startPix);
						context.rect(this.heatmap.lastClip.x, startPix, this.heatmap.lastClip.width, this.heatmap.lastClip.height);
						context.clip();
						this.heatmap._draw({
							left: this.heatmap.lastPosition.left,
							right: this.heatmap.lastPosition.right,
							top: top,
							bottom: bottom,
							context: context
						});
						context.restore();
						context.translate(heatMapWidth + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS, -startPix);
						trackWidth = 0;
						for (var i = 0, ntracks = this.rowTracks.length; i < ntracks; i++) {
							var track = this.rowTracks[i];
							if (track.isVisible()) {
								context.save();
								context.translate(trackWidth, 0);
								context.rect(0, startPix, track.getUnscaledWidth(), track.lastClip.height);
								context.clip();
								track._draw({
									start: top,
									end: bottom,
									vector: track.getVector(),
									context: context,
									availableSpace: track.getUnscaledWidth()
								});
								context.restore();
								trackWidth += track.getUnscaledWidth();
							}
						}
						$(canvas).appendTo($wrapper);
						canvas.style.top = wrapperHeight + 'px';
						wrapperHeight += parseFloat(canvas.style.height);
						wrapperWidth = parseFloat(canvas.style.width);
					} else {
						inline.push(row);
					}

				}
				if (found) {
					$wrapper.css({
						height: wrapperHeight,
						width: wrapperWidth
					});

					var rect = this.$parent[0].getBoundingClientRect();
					this.$tipFollow.html($wrapper).css({
						left: parseFloat(this.heatmap.canvas.style.left) - 1,
						top: options.event.clientY - rect.top - wrapperHeight / 2
					});
					return;
				} else {
					var tipText = [];
					var tipFollowText = [];
					for (var hoverIndex = 0; hoverIndex < inline.length; hoverIndex++) {
						this.tooltipProvider(this, inline[hoverIndex], -1,
							options, this.tooltipMode === 0 ? '&nbsp;&nbsp;&nbsp;'
								: '<br />', false, tipText);
						if (this.options.inlineTooltip) {
							this.tooltipProvider(this, inline[hoverIndex], -1,
								options, '<br />', true, tipFollowText);

						}
					}
					this._setTipText(tipText, tipFollowText, options);
				}
			}
			if (columnIndex != null && columnIndex.length > 0) {

				for (var hoverIndex = 0; hoverIndex < columnIndex.length; hoverIndex++) {
					var column = columnIndex[hoverIndex];
					if (column >= 0 && (column >= this.heatmap.lastPosition.right || column < this.heatmap.lastPosition.left)) {
						found = true;
						var heatMapHeight = this.heatmap.getUnscaledHeight();
						var left = column; // Math.max(0, rowIndex - 1);
						var right = column + 1; //Math.min(rowIndex + 1, this.heatmap.rowPositions.getLength());
						var startPix = this.heatmap.columnPositions.getPosition(left);
						var endPix = startPix + this.heatmap.columnPositions.getItemSize(left);
						var heatMapWidth = endPix - startPix;
						var canvas = morpheus.CanvasUtil.createCanvas();
						var trackHeight = 0;
						for (var i = 0, ntracks = this.columnTracks.length; i < ntracks; i++) {
							var track = this.columnTracks[i];
							if (track.isVisible()) {
								trackHeight += track.getUnscaledHeight();
							}
						}
						var canvasHeight = trackHeight + heatMapHeight + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
						canvas.width = heatMapWidth * morpheus.CanvasUtil.BACKING_SCALE;
						canvas.style.width = heatMapWidth + 'px';
						canvas.height = canvasHeight * morpheus.CanvasUtil.BACKING_SCALE;
						canvas.style.height = canvasHeight + 'px';
						var context = canvas.getContext('2d');
						morpheus.CanvasUtil.resetTransform(context);
						context.translate(-startPix, 0);
						context.save();
						context.rect(startPix, trackHeight + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS, this.heatmap.lastClip.width, this.heatmap.lastClip.height + trackHeight + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS);
						context.clip();
						context.translate(0, trackHeight + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS - this.heatmap.lastClip.y);

						this.heatmap._draw({
							top: this.heatmap.lastPosition.top,
							bottom: this.heatmap.lastPosition.bottom,
							left: left,
							right: right,
							context: context
						});
						context.restore();
						trackHeight = 0;
						for (var i = 0, ntracks = this.columnTracks.length; i < ntracks; i++) {
							var track = this.columnTracks[i];
							if (track.isVisible()) {
								context.save();
								context.translate(0, trackHeight);
								context.rect(startPix, 0, track.lastClip.width, track.getUnscaledHeight());
								context.clip();
								track._draw({
									start: left,
									end: right,
									vector: track.getVector(),
									context: context,
									availableSpace: track.getUnscaledHeight(),
									clip: {
										x: track.lastClip.x,
										y: track.lastClip.y
									}
								});
								context.restore();
								trackHeight += track.getUnscaledHeight();
							}
						}
						canvas.style.left = wrapperWidth + 'px';
						wrapperWidth += parseFloat(canvas.style.width);
						wrapperHeight = parseFloat(canvas.style.height);
						$(canvas).appendTo($wrapper);
					} else {
						inline.push(column);
					}
				}

				if (found) {
					$wrapper.css({
						height: wrapperHeight,
						width: wrapperWidth
					});

					var rect = this.$parent[0].getBoundingClientRect();
					this.$tipFollow.html($wrapper).css({
						top: parseFloat(this.heatmap.canvas.style.top) - trackHeight - morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS - 1,
						left: (options.event.clientX - rect.left) - (wrapperWidth / 2)
					});
					return;
				} else {
					var tipText = [];
					var tipFollowText = [];
					for (var hoverIndex = 0; hoverIndex < inline.length; hoverIndex++) {
						this.tooltipProvider(this, -1, inline[hoverIndex],
							options, this.tooltipMode === 0 ? '&nbsp;&nbsp;&nbsp;'
								: '<br />', false, tipText);
						if (this.options.inlineTooltip) {
							this.tooltipProvider(this, -1, inline[hoverIndex],
								options, '<br />', true, tipFollowText);
						}
					}
					this._setTipText(tipText, tipFollowText, options);
				}
			}

			// column lens

		}

		// tooltipMode=0 top, 1=window, 2=inline
		var tipText = [];
		this.tooltipProvider(this, rowIndex, columnIndex,
			options, this.tooltipMode === 0 ? '&nbsp;&nbsp;&nbsp;'
				: '<br />', false, tipText);

		var tipFollowText = [];
		if (this.options.inlineTooltip) {
			this.tooltipProvider(this, rowIndex, columnIndex,
				options, '<br />', true, tipFollowText);

			if (this.options.tooltip && rowIndex !== -1 && columnIndex !== -1) {
				tipFollowText.push('<div data-name="tip"></div>');

			}
		}
		this._setTipText(tipText, tipFollowText, options);
		if (this.options.tooltip && rowIndex !== -1 && columnIndex !== -1) {
			this.options.tooltip(this, rowIndex, columnIndex, this.$tipFollow.find('[data-name=tip]'));
		}

	}
	,
	_updateTipFollowPosition: function (options) {
		if (this.tipFollowHidden) {
			return;
		}
		var rect = this.$parent[0].getBoundingClientRect();
		var tipWidth = this.$tipFollow.width();
		var tipHeight = this.$tipFollow.height();
		var left = options.event.clientX - rect.left + 16;
		// default is bottom-right
		if ((left + tipWidth) >= rect.right) { // offscreen right
			left = options.event.clientX - rect.left - 16 - tipWidth;
		}
		var top = options.event.clientY - rect.top + 16;
		if ((top + tipHeight) >= (rect.bottom - rect.top)) { // offscreen
			top = options.event.clientY - rect.top - 16 - tipHeight;
		}
		this.$tipFollow.css({
			left: left,
			top: top
		});
	}
	,
	setTrackVisibility: function (tracks) {
		var _this = this;
		_.each(tracks, function (track) {
			var existingTrack = _this.getTrack(track.name, track.isColumns);
			if (track.visible && existingTrack != null
				&& _.keys(existingTrack.settings).length === 0) {
				existingTrack.settingFromConfig('Text');
			}
			_this.setTrackVisible(track.name, track.visible, track.isColumns);
		});
		this.revalidate();
		this.trigger('change', {
			name: 'setTrackVisibility',
			source: this,
			arguments: arguments
		});
	}
	,
	setTrackVisible: function (name, visible, isColumns) {
		var trackIndex = this.getTrackIndex(name, isColumns);
		if (trackIndex === -1) { // not currently visible
			if (!visible) {
				return;
			}
			if (!isColumns) {
				this.addRowTrack(name);
			} else {
				this.addColumnTrack(name);
			}
		} else {
			var track = isColumns ? this.columnTracks[trackIndex]
				: this.rowTracks[trackIndex];
			var header = isColumns ? this.columnTrackHeaders[trackIndex]
				: this.rowTrackHeaders[trackIndex];
			if (track.isVisible() !== visible) {
				track.setVisible(visible);
				header.setVisible(visible);
			} else {
				return;
			}
		}
		this.trigger('change', {
			name: 'setTrackVisible',
			source: this,
			arguments: arguments
		});
	}
	,
	addRowTrack: function (name, renderSettings) {
		if (name === undefined) {
			throw 'Name not specified';
		}
		if ('None' === renderSettings) {
			return;
		}
		if (renderSettings == null) {
			renderSettings = morpheus.VectorUtil.getDataType(this.project
			.getFullDataset().getRowMetadata().getByName(name)) === '[number]' ? 'bar'
				: morpheus.VectorTrack.RENDER.TEXT;
		}
		var track = new morpheus.VectorTrack(this.project, name, this.heatmap
		.getRowPositions(), false, this);
		track.settingFromConfig(renderSettings);
		this.rowTracks.push(track);
		track.appendTo(this.$parent);
		$(track.canvas).css('z-index', '0');
		var header = new morpheus.VectorTrackHeader(this.project, name, false,
			this);
		this.rowTrackHeaders.push(header);
		header.appendTo(this.$parent);
		$(header.canvas).css('z-index', '0');
		track._selection = new morpheus.TrackSelection(track, this.heatmap
			.getRowPositions(), this.project.getRowSelectionModel(), false,
			this);
		return track;
	}
	,
	addTrack: function (name, isColumns, renderSettings) {
		if (isColumns) {
			this.addColumnTrack(name, renderSettings);
		} else {
			this.addRowTrack(name, renderSettings);
		}

	}
	,
	addColumnTrack: function (name, renderSettings) {
		if (name === undefined) {
			throw 'Name not specified';
		}
		if ('None' === renderSettings) {
			return;
		}
		if (renderSettings == null) {
			renderSettings = morpheus.VectorUtil.getDataType(this.project
			.getFullDataset().getColumnMetadata().getByName(name)) === '[number]' ? 'bar'
				: morpheus.VectorTrack.RENDER.TEXT;
		}
		var track = new morpheus.VectorTrack(this.project, name, this.heatmap
		.getColumnPositions(), true, this);
		track.settingFromConfig(renderSettings);
		this.columnTracks.push(track);
		track.appendTo(this.$parent);
		var header = new morpheus.VectorTrackHeader(this.project, name, true,
			this);
		this.columnTrackHeaders.push(header);
		header.appendTo(this.$parent);
		track._selection = new morpheus.TrackSelection(track, this.heatmap
			.getColumnPositions(), this.project.getColumnSelectionModel(),
			true, this);
		return track;
	}
	,
	addPopup: function (item) {
		if (!this.popupItems) {
			this.popupItems = [];
		}
		this.popupItems.push(item);
	}
	,
	getPopupItems: function () {
		return this.popupItems || [];
	}
	,
	removeTrack: function (name, isColumns) {
		var index = this.getTrackIndex(name, isColumns);
		var tracks = isColumns ? this.columnTracks : this.rowTracks;
		if (isNaN(index) || index < 0 || index >= tracks.length) {
			console.log('removeTrack: ' + name + ' not found.');
			return;
		}

		var headers = isColumns ? this.columnTrackHeaders
			: this.rowTrackHeaders;
		var track = tracks[index];
		var header = headers[index];
		track.dispose();
		track._selection.dispose();
		header.dispose();
		tracks.splice(index, 1);
		headers.splice(index, 1);
		this.trigger('change', {
			name: 'removeTrack',
			source: this,
			arguments: arguments
		});
	}
	,
	updateDataset: function () {
		var dataset = this.project.getSortedFilteredDataset();
		this.verticalSearchBar.update();
		this.horizontalSearchBar.update();
		this.heatmap.setDataset(dataset);
		this.heatmap.getRowPositions().spaces = morpheus.HeatMap
		.createGroupBySpaces(dataset, this.project.getGroupRows(),
			this.gapSize);
		this.heatmap.getColumnPositions().spaces = morpheus.HeatMap
		.createGroupBySpaces(
			new morpheus.TransposedDatasetView(dataset),
			this.project.getGroupColumns(), this.gapSize);
		this.trigger('change', {
			name: 'updateDataset',
			source: this,
			arguments: arguments
		});
	}
	,
	zoom: function (isZoomIn, options) {
		options = $.extend({}, {
			rows: true,
			columns: true
		}, options);
		if (isZoomIn) {
			if (options.rows) {
				this.heatmap.getRowPositions().setSize(
					this.heatmap.getRowPositions().getSize() * 1.5);
			}
			if (options.columns) {
				this.heatmap.getColumnPositions().setSize(
					this.heatmap.getColumnPositions().getSize() * 1.5);
			}
		} else {
			if (options.rows) {
				this.heatmap.getRowPositions().setSize(
					this.heatmap.getRowPositions().getSize() / 1.5);
			}
			if (options.columns) {
				this.heatmap.getColumnPositions().setSize(
					this.heatmap.getColumnPositions().getSize() / 1.5);
			}
		}
		var reval = {};
		if (options.rows && this.project.getHoverRowIndex() !== -1) {
			reval.scrollTop = this.heatmap.getRowPositions().getPosition(
				this.project.getHoverRowIndex());
		}
		if (options.columns && this.project.getHoverColumnIndex() !== -1) {
			reval.scrollLeft = this.heatmap.getColumnPositions().getPosition(
				this.project.getHoverColumnIndex());
		}
		this.revalidate(reval);
		this.trigger('change', {
			name: 'zoom',
			source: this,
			arguments: arguments
		});
	}
	,
	getTrackIndex: function (name, isColumns) {
		var tracks = isColumns ? this.columnTracks : this.rowTracks;
		for (var i = 0, length = tracks.length; i < length; i++) {
			if (tracks[i].name !== undefined && tracks[i].name === name) {
				return i;
			}
		}
		return -1;
	}
	,
	getNumTracks: function (isColumns) {
		return isColumns ? this.columnTracks.length : this.rowTracks.length;
	}
	,
	moveTrack: function (index, newIndex, isColumns) {
		var tracks = isColumns ? this.columnTracks : this.rowTracks;
		var headers = isColumns ? this.columnTrackHeaders
			: this.rowTrackHeaders;
		var track = tracks[index];
		tracks.splice(index, 1);
		var header = headers[index];
		headers.splice(index, 1);
		tracks.splice(newIndex, 0, track);
		headers.splice(newIndex, 0, header);
		this.trigger('change', {
			name: 'moveTrack',
			source: this,
			arguments: arguments
		});
	}
	,
	getTrackByIndex: function (index, isColumns) {
		return isColumns ? this.columnTracks[index] : this.rowTracks[index];
	}
	,
	getTrackHeaderByIndex: function (index, isColumns) {
		return isColumns ? this.columnTrackHeaders[index]
			: this.rowTrackHeaders[index];
	}
	,
	getTrack: function (name, isColumns) {
		var index = this.getTrackIndex(name, isColumns);
		if (index === -1) {
			return undefined;
		}
		return isColumns ? this.columnTracks[index] : this.rowTracks[index];
	}
	,
	/**
	 * @return true if active element is an ancestor of this heat map.
	 */
	isActiveComponent: function () {
		var active = document.activeElement;
		var tagName = active.tagName;
		if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
			return false;
		}
		return this.$tabPanel[0].contains(active);
	}
	,
	getActiveComponent: function () {
		var active = document.activeElement;
		if (active.tagName === 'CANVAS') {
			for (var i = 0, ntracks = this.columnTracks.length; i < ntracks; i++) {
				if (this.columnTracks[i].canvas === active) {
					return 1;
				}
			}
			for (var i = 0, ntracks = this.rowTracks.length; i < ntracks; i++) {
				if (this.rowTracks[i].canvas === active) {
					return 0;
				}
			}
			if (this.heatmap.canvas === active) {
				return 2;
			}
		}
		return -1;
	}
	,
	getVisibleTrackNames: function (isColumns) {
		var names = [];
		var tracks = isColumns ? this.columnTracks : this.rowTracks;
		for (var i = 0, length = tracks.length; i < length; i++) {
			if (tracks[i].isVisible()) {
				names.push(tracks[i].name);
			}
		}
		return names;
	}
	,
	resizeTrack: function (name, width, height, isColumns) {
		var index = this.getTrackIndex(name, isColumns);
		if (index === -1) {
			throw name + ' not found in resize track';
		}
		if (!isColumns) {
			var track = this.rowTracks[index];
			var header = this.rowTrackHeaders[index];
			track.setPrefWidth(width); // can only set width
			header.setPrefWidth(width);
		} else {
			var track = this.columnTracks[index];
			var header = this.columnTrackHeaders[index];
			if (height) {
				track.setPrefHeight(height);
				header.setPrefHeight(height);
			}
			if (width) {
				for (var i = 0; i < this.columnTracks.length; i++) {
					this.columnTracks[i].setPrefWidth(width);
					this.columnTrackHeaders[i].setPrefWidth(width);
				}
				// set width for all tracks
			}
		}
		this.revalidate();
		this.trigger('change', {
			name: 'resizeTrack',
			source: this,
			arguments: arguments
		});
	}
	,
	isDendrogramVisible: function (isColumns) {
		var dendrogram = isColumns ? this.columnDendrogram : this.rowDendrogram;
		if (dendrogram !== undefined) {
			return morpheus.HeatMap
			.isDendrogramVisible(this.project, isColumns);
		}
	}
	,
	/**
	 *
	 * Paint all the components
	 *
	 * @param options.paintRows
	 * @param options.paintColumns
	 * @param options.invalidateRows
	 * @param options.invalidateColumns
	 */
	paintAll: function (options) {
		var unscaledHeight = this.heatmap.getUnscaledHeight();
		var unscaledWidth = this.heatmap.getUnscaledWidth();
		var y = this.scrollTop();
		var x = this.scrollLeft();
		this.hscroll.paint();
		this.vscroll.paint(); // FIXME
		var rows = options.paintRows;
		var columns = options.paintColumns;
		var invalidateRows = options.invalidateRows;
		var invalidateColumns = options.invalidateColumns;
		// FIXME double buffer search bars
		this.hSortByValuesIndicator.setInvalid(invalidateRows
			|| invalidateColumns);
		this.hSortByValuesIndicator.paint({
			x: x,
			y: 0,
			width: unscaledWidth,
			height: this.hSortByValuesIndicator.getUnscaledHeight()
		});
		this.vSortByValuesIndicator.setInvalid(invalidateRows
			|| invalidateColumns);
		this.vSortByValuesIndicator.paint({
			x: 0,
			y: y,
			width: this.vSortByValuesIndicator.getUnscaledWidth(),
			height: unscaledHeight
		});
		if (rows) {
			for (var i = 0, length = this.rowTracks.length; i < length; i++) {
				var track = this.rowTracks[i];
				track.setInvalid(invalidateRows);
				if (track.isVisible()) {
					track.paint({
						x: 0,
						y: y,
						height: unscaledHeight,
						width: unscaledWidth
					});
					this.rowTrackHeaders[i].paint();
				}
			}
			if (this.rowDendrogram != null) {
				this.rowDendrogram.setInvalid(invalidateRows);
				if (this.isDendrogramVisible(false)) {
					this.rowDendrogram.setVisible(true);
					this.rowDendrogram.paint({
						x: 0,
						y: y,
						height: unscaledHeight,
						width: this.rowDendrogram.getUnscaledWidth()
					});
				} else {
					this.rowDendrogram.setVisible(false);
				}
			}
		}
		if (columns) {
			for (var i = 0, length = this.columnTracks.length; i < length; i++) {
				var track = this.columnTracks[i];
				track.setInvalid(invalidateColumns);
				track.paint({
					x: x,
					y: 0,
					width: unscaledWidth,
					height: track.getUnscaledHeight()
				});
				this.columnTrackHeaders[i].paint();
			}
			if (this.columnDendrogram != null) {
				this.columnDendrogram.setInvalid(invalidateColumns);
				if (this.isDendrogramVisible(true)) {
					this.columnDendrogram.setVisible(true);
					this.columnDendrogram.paint({
						x: x,
						y: 0,
						width: unscaledWidth,
						height: this.columnDendrogram.getUnscaledHeight()
					});
				} else {
					this.columnDendrogram.setVisible(false);
				}
			}
		}
		if (invalidateRows || invalidateColumns) {
			this.heatmap.setInvalid(true);
		}
		this.heatmap.paint({
			x: x,
			y: y,
			width: unscaledWidth,
			height: unscaledHeight
		});
		this.trigger('change', {
			name: 'paintAll',
			source: this,
			arguments: arguments
		});
	}
	,
	scrollTop: function (pos) {
		if (pos === undefined) {
			return this.vscroll.getValue();
		}
		this.vscroll.setValue(pos, true);
		this.trigger('change', {
			name: 'scrollTop',
			source: this,
			arguments: arguments
		});
	}
	,
	scrollLeft: function (pos) {
		if (pos === undefined) {
			return this.hscroll.getValue();
		}
		this.trigger('change', {
			name: 'scrollLeft',
			source: this,
			arguments: arguments
		});
		this.hscroll.setValue(pos, true);
	}
	,
	isSelectedTrackColumns: function () {
		return this.selectedTrackIsColumns;
	},
	setSelectedTrack: function (name, isColumns) {
		if (name !== this.selectedTrackName
			|| isColumns !== this.selectedTrackIsColumns) {
			var index = this.getTrackIndex(this.selectedTrackName,
				this.selectedTrackIsColumns);
			if (index !== -1) {
				this.getTrackHeaderByIndex(index, this.selectedTrackIsColumns)
				.setSelected(false);
			}
			this.selectedTrackName = name;
			this.selectedTrackIsColumns = isColumns;
			var index = this.getTrackIndex(this.selectedTrackName,
				this.selectedTrackIsColumns);
			if (index !== -1) {
				this.getTrackHeaderByIndex(index, this.selectedTrackIsColumns)
				.setSelected(true);
			}
			this.trigger('change', {
				name: 'setSelected',
				source: this,
				arguments: arguments
			});
		}
	}
	,
	saveImage: function (file, format) {
		var bounds = this.getTotalSize();
		if (format === 'svg') {
			var context = new C2S(bounds.width, bounds.height);
			this.snapshot(context);
			var svg = context.getSerializedSvg();
			var blob = new Blob([svg], {
				type: 'text/plain;charset=utf-8'
			});
			saveAs(blob, file, true);
		} else {
			var canvas = $('<canvas></canvas>')[0];
			var height = bounds.height;
			var width = bounds.width;
			canvas.height = height;
			canvas.width = width;
			var context = canvas.getContext('2d');
			this.snapshot(context);
			canvas.toBlob(function (blob) {
				if (blob == null || blob.size === 0) {
					morpheus.FormBuilder.showInModal({
						title: 'Save Image',
						html: 'Image is too large to save.'
					});
					return;
				}

				saveAs(blob, file, true);
			});
		}
	}
	,
	getTotalSize: function (options) {
		options = $.extend({}, {
			legend: true
		}, options);
		var _this = this;
		var heatmapPrefSize = this.heatmap.getPreferredSize();
		var totalSize = {
			width: heatmapPrefSize.width,
			height: heatmapPrefSize.height
		};
		if (this.isDendrogramVisible(false)) { // row dendrogram
			totalSize.width += this.rowDendrogram.getUnscaledWidth() + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
		}
		if (this.isDendrogramVisible(true)) {
			totalSize.height += this.columnDendrogram.getUnscaledHeight() + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
		}
		var maxRowHeaderHeight = 0;
		for (var i = 0, length = this.rowTracks.length; i < length; i++) {
			var track = this.rowTracks[i];
			if (track.isVisible()) {
				var headerSize = this.rowTrackHeaders[i].getPrintSize();
				totalSize.width += Math.max(headerSize.width, track
				.getPrintSize().width);
				maxRowHeaderHeight = Math.max(maxRowHeaderHeight, headerSize.height);
			}
		}
		var maxColumnHeaderWidth = 0;
		var columnTrackHeightSum = 0;
		for (var i = 0, length = this.columnTracks.length; i < length; i++) {
			var track = this.columnTracks[i];
			if (track.isVisible()) {
				columnTrackHeightSum += track.getPrintSize().height;
				maxColumnHeaderWidth = Math.max(maxColumnHeaderWidth,
					this.columnTrackHeaders[i].getPrintSize().width);
			}
		}
		totalSize.height += Math.max(columnTrackHeightSum, maxRowHeaderHeight) + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
		totalSize.width += maxColumnHeaderWidth + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
		// color legend
		if (options.legend) {
			var legendHeight = this.heatmap.getColorScheme().getNames() != null ? this.heatmap
			.getColorScheme().getNames().length * 14
				: 40;
			totalSize.height += legendHeight + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
		}
		var trackLegendSize = new morpheus.HeatMapTrackColorLegend(
			_
			.filter(
				this.columnTracks,
				function (track) {
					return track.isVisible()
						&& (track
						.isRenderAs(morpheus.VectorTrack.RENDER.COLOR) || track
						.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR));
				}), this.getProject().getColumnColorModel())
		.getPreferredSize();
		totalSize.height += trackLegendSize.height;
		totalSize.width = Math.max(totalSize.width, trackLegendSize.width);
		trackLegendSize = new morpheus.HeatMapTrackColorLegend(
			_
			.filter(
				this.rowTracks,
				function (track) {
					return track.isVisible()
						&& (track
						.isRenderAs(morpheus.VectorTrack.RENDER.COLOR) || track
						.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR));
				}), this.getProject().getRowColorModel())
		.getPreferredSize();
		totalSize.height += morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS + trackLegendSize.height;
		totalSize.width = morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS + Math.max(totalSize.width, trackLegendSize.width);
		return totalSize;
	}
	,
	getHeatMapElementComponent: function () {
		return this.heatmap;
	}
	,
	snapshot: function (context, options) {
		options = $.extend({}, {
			legend: true
		}, options);
		var heatmapPrefSize = this.heatmap.getPreferredSize();
		var totalSize = this.getTotalSize(options);
		var legendHeight = 0;
		if (options.legend) {
			context.save();
			context.translate(50, 0);
			morpheus.HeatMapColorSchemeLegend.drawColorScheme(context,
				this.heatmap.getColorScheme(), 200, true);
			context.restore();
			legendHeight = this.heatmap.getColorScheme().getNames() != null ? this.heatmap
			.getColorScheme().getNames().length * 14
				: 40;
		}
		context.save();
		context.translate(4, legendHeight);
		// column color legend
		var columnTrackLegend = new morpheus.HeatMapTrackColorLegend(
			_
			.filter(
				this.columnTracks,
				function (track) {
					return track.isVisible()
						&& (track
						.isRenderAs(morpheus.VectorTrack.RENDER.COLOR) || track
						.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR));
				}), this.getProject().getColumnColorModel());
		columnTrackLegend.draw({}, context);
		context.restore();
		// row color legend to the right of column color legend
		var columnTrackLegendSize = columnTrackLegend.getPreferredSize();
		context.save();
		context.translate(4 + columnTrackLegendSize.width, legendHeight);
		var rowTrackLegend = new morpheus.HeatMapTrackColorLegend(
			_
			.filter(
				this.rowTracks,
				function (track) {
					return track.isVisible()
						&& (track
						.isRenderAs(morpheus.VectorTrack.RENDER.COLOR) || track
						.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR));
				}), this.getProject().getRowColorModel());
		rowTrackLegend.draw({}, context);
		context.restore();
		legendHeight += Math.max(rowTrackLegend.getPreferredSize().height,
			columnTrackLegendSize.height);

		var heatmapY = this.isDendrogramVisible(true) ? (this.columnDendrogram
		.getUnscaledHeight() + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS) : 0;
		heatmapY += legendHeight;
		var columnTrackY = heatmapY;
		var heatmapX = this.isDendrogramVisible(false) ? (this.rowDendrogram
		.getUnscaledWidth() + morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS) : 0;
		var isColumnTrackVisible = false;
		for (var i = 0, length = this.columnTracks.length; i < length; i++) {
			var track = this.columnTracks[i];
			if (track.isVisible()) {
				var header = this.columnTrackHeaders[i];
				heatmapX = Math.max(heatmapX, header.getPrintSize().width);
				heatmapY += track.getPrintSize().height;
				isColumnTrackVisible = true;
			}
		}
		if (isColumnTrackVisible) {
			heatmapY += morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
		}

		// check if row headers are taller than column tracks
		for (var i = 0, length = this.rowTracks.length; i < length; i++) {
			var track = this.rowTracks[i];
			if (track.isVisible()) {
				var header = this.rowTrackHeaders[i];
				heatmapY = Math.max(heatmapY, header.getPrintSize().height);
			}
		}
		if (this.isDendrogramVisible(true)) {
			var columnDendrogramClip = {
				x: 0,
				y: 0,
				height: this.columnDendrogram.getUnscaledHeight(),
				width: heatmapPrefSize.width
			};
			context.save();
			context.translate(heatmapX, legendHeight);
			this.columnDendrogram.prePaint(columnDendrogramClip, context);
			this.columnDendrogram.draw(columnDendrogramClip, context);
			context.restore();
		}
		if (this.isDendrogramVisible(false)) {
			var rowDendrogramClip = {
				x: 0,
				y: 0,
				width: this.rowDendrogram.getUnscaledWidth(),
				height: heatmapPrefSize.height
			};
			context.save();
			context.translate(0, heatmapY);
			this.rowDendrogram.prePaint(rowDendrogramClip, context);
			this.rowDendrogram.draw(rowDendrogramClip, context);
			context.restore();
		}

		for (var i = 0, length = this.columnTracks.length; i < length; i++) {
			var track = this.columnTracks[i];
			if (track.isVisible()) {
				context.save();
				context.translate(heatmapX, columnTrackY);
				var trackClip = {
					x: 0,
					y: 0,
					width: heatmapPrefSize.width,
					height: track.getPrintSize().height
				};
				track.print(trackClip, context);
				context.restore();
				// draw header
				var header = this.columnTrackHeaders[i];
				context.save();
				var headerSize = header.getPrintSize();
				var headerClip = {
					x: 0,
					y: 0,
					width: headerSize.width,
					height: trackClip.height
				};
				context.translate(heatmapX - 2, columnTrackY + trackClip.height);
				header.print(headerClip, context);
				context.restore();
				columnTrackY += Math.max(headerClip.height, trackClip.height);
			}
		}
		context.save();
		context.translate(heatmapX, heatmapY);
		this.heatmap.draw({
			x: 0,
			y: 0,
			width: heatmapPrefSize.width,
			height: heatmapPrefSize.height
		}, context);
		context.restore();
		var rowTrackWidthSum = 0;
		for (var i = 0, length = this.rowTracks.length; i < length; i++) {
			var track = this.rowTracks[i];
			if (track.isVisible()) {
				context.save();
				var tx = morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS + heatmapX + heatmapPrefSize.width + rowTrackWidthSum;
				var ty = heatmapY;
				var trackClip = {
					x: 0,
					y: 0,
					width: track.getPrintSize().width,
					height: heatmapPrefSize.height
				};
				context.translate(tx, ty);
				context.strokeStyle = 'white';
				context.rect(0, 0, trackClip.width, trackClip.height);
				// stroke is needed for clip to work for svg export
				context.stroke();
				context.clip();

				track.print(trackClip, context);
				context.restore();
				// draw header
				var header = this.rowTrackHeaders[i];
				context.save();
				var headerSize = header.getPrintSize();
				var headerClip = {
					x: 0,
					y: 0,
					width: headerSize.width,
					height: headerSize.height
				};
				context.translate(tx, ty - 4);
				header.print(headerClip, context);
				context.restore();
				rowTrackWidthSum += Math.max(headerSize.width, trackClip.width);
			}
		}
	}
	,
	resetZoom: function () {
		var heatmap = this.heatmap;
		var rowSizes = heatmap.getRowPositions();
		var columnSizes = heatmap.getColumnPositions();
		rowSizes.setSize(13);
		columnSizes.setSize(13);
		var reval = {};
		if (this.project.getHoverRowIndex() !== -1) {
			reval.scrollTop = this.heatmap.getRowPositions().getPosition(
				this.project.getHoverRowIndex());
		}
		if (this.project.getHoverColumnIndex() !== -1) {
			reval.scrollLeft = this.heatmap.getColumnPositions().getPosition(
				this.project.getHoverColumnIndex());
		}
		this.revalidate(reval);
	}
	,
	getFitColumnSize: function () {
		var heatmap = this.heatmap;
		var availablePixels = this.getAvailableWidth();
		if (this.rowDendrogram) {
			availablePixels -= this.rowDendrogram.getUnscaledWidth();
		}
		var trackPixels = 12; // spacer
		for (var i = 0, length = this.rowTracks.length; i < length; i++) {
			var track = this.rowTracks[i];
			if (track.isVisible()) {
				trackPixels += track.getUnscaledWidth();
			}
		}
		for (var i = 0, length = this.columnTracks.length; i < length; i++) {
			var track = this.columnTracks[i];
			if (track.isVisible()) { // all column track headers have the
				// same width
				trackPixels += this.columnTrackHeaders[i].getUnscaledWidth();
				break;
			}
		}

		availablePixels -= trackPixels;

		var positions = heatmap.getColumnPositions();
		var totalCurrent = positions.getItemSize(positions.getLength() - 1)
			+ positions.getPosition(positions.getLength() - 1);
		var size = positions.getSize();
		size = size * (availablePixels / totalCurrent);
		size = Math.min(13, size);
		return size;
	}
	,
	getFitRowSize: function () {
		var heatmap = this.heatmap;
		var availablePixels = this.getAvailableHeight();

		if (this.columnDendrogram) {
			availablePixels -= this.columnDendrogram.getUnscaledHeight();
		}
		var trackPixels = 12;
		for (var i = 0, length = this.columnTracks.length; i < length; i++) {
			var track = this.columnTracks[i];
			if (track.isVisible()) {
				trackPixels += track.getUnscaledHeight();
			}
		}
		availablePixels -= trackPixels;
		var positions = heatmap.getRowPositions();
		var totalCurrent = positions.getItemSize(positions.getLength() - 1)
			+ positions.getPosition(positions.getLength() - 1);

		var size = positions.getSize();
		size = size * (availablePixels / totalCurrent);
		size = Math.min(13, size);
		return size;
	}
	,
	fitToWindow: function (repaint) {
		this.heatmap.getRowPositions().setSize(this.getFitRowSize());
		this.heatmap.getColumnPositions().setSize(this.getFitColumnSize());
		if (repaint) {
			var reval = {};
			if (this.project.getHoverRowIndex() !== -1) {
				reval.scrollTop = this.heatmap.getRowPositions().getPosition(
					this.project.getHoverRowIndex());
			}
			if (this.project.getHoverColumnIndex() !== -1) {
				reval.scrollLeft = this.heatmap.getColumnPositions()
				.getPosition(this.project.getHoverColumnIndex());
			}
			this.revalidate(reval);
		}
	}
	,
	getAvailableHeight: function () {
		if (_.isNumber(this.options.height)) {
			return this.options.height;
		}
		var height = $(window).height() - this.$parent.offset().top - 24;
		if (this.options.height === 'window') {
			return height;
		}
		return Math.max(Math.round(screen.height * 0.7), height);
	}
	,
	getAvailableWidth: function () {
		if (this.options.width) {
			return this.options.width;
		}
		// (this.$el.parent().outerWidth() - 30);
		// return this.$el.width() - 30;
		return this.tabManager.getWidth() - 30;
	}
	,
	/**
	 * Layout all the components
	 */
	revalidate: function (options) {
		options = $.extend({}, {
			paint: true
		}, options);
		this.updatingScroll = true;
		var availableHeight = this.getAvailableHeight();
		var availableWidth = this.getAvailableWidth();
		var heatmapPrefSize = this.heatmap.getPreferredSize();

		var columnDendrogramHeight = 0;
		var rowDendrogramWidth = 0;
		if (this.columnDendrogram) {
			columnDendrogramHeight = morpheus.CanvasUtil
			.getPreferredSize(this.columnDendrogram).height;
		}
		if (this.rowDendrogram) {
			rowDendrogramWidth = morpheus.CanvasUtil
			.getPreferredSize(this.rowDendrogram).width;
		}
		var rowTrackWidthSum = 0;
		for (var i = 0, length = this.rowTracks.length; i < length; i++) {
			if (this.rowTracks[i].isVisible()) {
				rowTrackWidthSum += Math
				.max(
					morpheus.CanvasUtil
					.getPreferredSize(this.rowTrackHeaders[i]).width,
					morpheus.CanvasUtil
					.getPreferredSize(this.rowTracks[i]).width);
			}
		}
		var ypos = columnDendrogramHeight;
		var maxHeaderWidth = 0;
		for (var i = 0, length = this.columnTracks.length; i < length; i++) {
			if (this.columnTracks[i].isVisible()) {
				var width = morpheus.CanvasUtil
				.getPreferredSize(this.columnTrackHeaders[i]).width;
				maxHeaderWidth = Math.max(maxHeaderWidth, width);
			}
		}
		var xpos = Math.max(rowDendrogramWidth, maxHeaderWidth);
		var heatMapWidth = heatmapPrefSize.width;
		var maxHeatMapWidth = Math.max(50, availableWidth - rowTrackWidthSum
			- xpos
			- morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS);
		if (maxHeatMapWidth > 0 && heatMapWidth > maxHeatMapWidth) {
			heatMapWidth = maxHeatMapWidth;
			heatMapWidth = Math.min(heatMapWidth, heatmapPrefSize.width); // can't
			// go
			// bigger
			// than
			// pref
			// width
		}
		if (this.heatmap.prefWidth !== undefined) { // heat map was manually
			// resized
			heatMapWidth = Math.min(heatmapPrefSize.width,
				this.heatmap.prefWidth);
		}
		if (this.columnDendrogram !== undefined) {
			this.columnDendrogram.setBounds({
				width: heatMapWidth,
				height: columnDendrogramHeight,
				left: xpos,
				top: 0
			});
			this.columnDendrogram.$label.css('left',
				xpos + this.columnDendrogram.getUnscaledWidth() + 10).css(
				'top', 2);
			this.columnDendrogram.$squishedLabel.css('left',
				xpos + this.columnDendrogram.getUnscaledWidth() + 10).css(
				'top', 18);

			this.beforeColumnTrackDivider.setVisible(true);
			this.beforeColumnTrackDivider.setBounds({
				left: xpos - maxHeaderWidth,
				top: ypos,
				width: maxHeaderWidth
			});
			ypos++;
		} else {
			this.beforeColumnTrackDivider.setVisible(false);
		}

		for (var i = 0, length = this.columnTracks.length; i < length; i++) {
			var track = this.columnTracks[i];
			if (track.isVisible()) {
				var size = morpheus.CanvasUtil.getPreferredSize(track);
				var headerSize = morpheus.CanvasUtil
				.getPreferredSize(this.columnTrackHeaders[i]);
				size.height = Math.max(size.height, headerSize.height);
				track.setBounds({
					width: heatMapWidth,
					height: size.height,
					left: xpos,
					top: ypos
				});
				this.columnTrackHeaders[i].setBounds({
					width: maxHeaderWidth,
					height: size.height,
					left: xpos - maxHeaderWidth,
					top: ypos
				});
				ypos += size.height;
			}
		}
		ypos += morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS;
		var heatMapHeight = heatmapPrefSize.height;
		if (heatMapHeight > (availableHeight - ypos)) {
			heatMapHeight = Math.max(100, Math.min(heatmapPrefSize.height,
				availableHeight - ypos));
		}
		if (ypos < 0) {
			ypos = 0;
		}
		if (this.rowDendrogram) {
			this.rowDendrogram.setBounds({
				width: Math.max(rowDendrogramWidth, maxHeaderWidth),
				height: heatMapHeight,
				left: 0,
				top: ypos
			});
			this.rowDendrogram.$label.css('left', 0).css('top', 2);
			this.afterRowDendrogramDivider.setVisible(true);
			this.afterRowDendrogramDivider.setBounds({
				height: heatMapHeight,
				left: this.rowDendrogram.getUnscaledWidth(),
				top: ypos
			});
			xpos++;
		} else {
			this.afterRowDendrogramDivider.setVisible(false);
		}
		this.heatmap.setBounds({
			width: heatMapWidth,
			height: heatMapHeight,
			left: xpos,
			top: ypos
		});
		this.hSortByValuesIndicator.setBounds({
			height: 4,
			width: heatMapWidth,
			left: xpos,
			top: ypos - 4
		});
		this.hscroll.setVisible(heatMapWidth < heatmapPrefSize.width);
		this.hscroll.setExtent(heatMapWidth, heatmapPrefSize.width,
			options.scrollLeft !== undefined ? options.scrollLeft
				: (heatmapPrefSize.width === this.hscroll
			.getTotalExtent() ? this.hscroll.getValue()
				: heatmapPrefSize.width
			* this.hscroll.getValue()
			/ this.hscroll.getMaxValue()));
		this.hscroll.setBounds({
			left: xpos,
			top: ypos + heatMapHeight + 2
		});
		xpos += heatMapWidth;
		var nvisibleRowTracks = 0;
		for (var i = 0, length = this.rowTracks.length; i < length; i++) {
			var track = this.rowTracks[i];
			if (track.isVisible()) {
				nvisibleRowTracks++;
				break;
			}
		}
		this.vSortByValuesIndicator.setBounds({
			width: 4,
			height: heatMapHeight,
			left: xpos,
			top: ypos
		});
		if (nvisibleRowTracks > 0) {
			xpos = xpos
				+ morpheus.HeatMap.SPACE_BETWEEN_HEAT_MAP_AND_ANNOTATIONS; // leave
			// space
			// after
			// afterVerticalScrollBarDivider
		}
		var rowAnnotationXStart = xpos;
		for (var i = 0, length = this.rowTracks.length; i < length; i++) {
			var track = this.rowTracks[i];
			if (track.isVisible()) {
				var size = morpheus.CanvasUtil.getPreferredSize(track);
				var headerSize = morpheus.CanvasUtil
				.getPreferredSize(this.rowTrackHeaders[i]);
				size.width = Math.max(headerSize.width, size.width);
				size.height = heatMapHeight;
				track.setBounds({
					width: size.width,
					height: size.height,
					left: xpos,
					top: ypos
				});

				this.rowTrackHeaders[i].setBounds({
					width: size.width,
					left: xpos,
					top: ypos - headerSize.height - 5,
					height: headerSize.height
				});
				xpos += size.width;
			}
		}
		this.afterVerticalScrollBarDivider
		.setVisible(nvisibleRowTracks > 0 ? true : false);
		this.afterVerticalScrollBarDivider.setBounds({
			left: rowAnnotationXStart - 2,
			top: ypos - 18
		});
		this.vscroll.setVisible(heatMapHeight < heatmapPrefSize.height);
		this.vscroll.setExtent(heatMapHeight, heatmapPrefSize.height,
			options.scrollTop !== undefined ? options.scrollTop
				: (heatmapPrefSize.height === this.vscroll
			.getTotalExtent() ? this.vscroll.getValue()
				: heatmapPrefSize.height
			* this.vscroll.getValue()
			/ this.vscroll.getMaxValue()));
		xpos += 2;
		this.vscroll.setBounds({
			left: xpos,
			top: ypos
		});
		xpos += this.vscroll.getUnscaledWidth();
		if (this.hscroll.isVisible()) {
			ypos += this.hscroll.getUnscaledHeight() + 2;
		}
		var totalHeight = 2 + ypos + heatMapHeight;
		if (options.paint) {
			this.paintAll({
				paintRows: true,
				paintColumns: true,
				invalidateRows: true,
				invalidateColumns: true
			});
		}
		this.$parent.css({
			height: Math.ceil(totalHeight) + 'px'
		});

		this.updatingScroll = false;
		this.trigger('change', {
			name: 'revalidate',
			source: this,
			arguments: arguments
		});
	}
};
morpheus.HeatMap.copyFromParent = function (project, options) {
	// TODO persist sort order, grouping, dendrogram

	project.rowColorModel = options.parent.getProject().getRowColorModel()
	.copy();
	project.columnColorModel = options.parent.getProject()
	.getColumnColorModel().copy();

	project.rowShapeModel = options.parent.getProject().getRowShapeModel()
	.copy();
	project.columnShapeModel = options.parent.getProject()
	.getColumnShapeModel().copy();

	var parentRowTracks = options.parent.rowTracks || [];
	var parentColumnTracks = options.parent.columnTracks || [];
	if (options.inheritFromParentOptions.rows) { // row similarity matrix
		project.columnShapeModel = project.rowShapeModel;
		project.columnColorModel = project.rowColorModel;
		parentColumnTracks = parentRowTracks.slice().reverse();
	}
	if (options.inheritFromParentOptions.columns) { // column similarity matrix
		project.rowShapeModel = project.columnShapeModel;
		project.rowColorModel = project.columnColorModel;
		parentRowTracks = parentColumnTracks.slice().reverse();
	}
	if (options.inheritFromParentOptions.transpose) {
		var tmp = project.rowShapeModel;
		project.rowShapeModel = project.columnShapeModel;
		project.columnShapeModel = tmp;

		tmp = project.rowColorModel;
		project.rowColorModel = project.columnColorModel;
		project.columnColorModel = tmp;

		tmp = parentRowTracks.slice().reverse();
		// swap tracks
		parentRowTracks = parentColumnTracks.slice().reverse();
		parentColumnTracks = tmp;
	}
	// copy track rendering options and order
	// from parent
	options.rows = options.rows || [];

	for (var i = 0; i < parentRowTracks.length; i++) {
		var track = parentRowTracks[i];
		if (track.isVisible()) {
			options.rows.push({
				order: options.rows.length,
				field: track.getName(),
				display: $.extend(true, {}, track.settings),
				force: true
			});
		}
	}
	options.columns = options.columns || [];
	for (var i = 0; i < parentColumnTracks.length; i++) {
		var track = parentColumnTracks[i];
		if (track.isVisible()) {
			options.columns.push({
				order: options.columns.length,
				field: track.getName(),
				display: $.extend(true, {}, track.settings),
				force: true
			});
		}
	}
};
morpheus.Util.extend(morpheus.HeatMap, morpheus.Events);

/**
 * @param type
 *            Either relative or fixed.
 * @param stops
 *            An array of objects with value and color
 */
morpheus.HeatMapColorScheme = function (project, scheme) {
	this.project = project;
	var that = this;

	this.separateColorSchemeForRowMetadataField = null;
	this.rowValueToColorSupplier = {};
	this.value = null;
	if (scheme) {
		this.rowValueToColorSupplier[null] = morpheus.HeatMapColorScheme
		.createColorSupplier(scheme);
		this.currentColorSupplier = this.rowValueToColorSupplier[this.value];
	}
	project
	.on(
		'rowFilterChanged columnFilterChanged rowSortOrderChanged columnSortOrderChanged datasetChanged',
		function () {
			that.projectUpdated();
		});
	this.projectUpdated();
};
morpheus.HeatMapColorScheme.Predefined = {};
morpheus.HeatMapColorScheme.Predefined.SUMMLY = function () {
	return {
		type: 'fixed',
		map: [{
			value: -100,
			color: 'blue'
		}, {
			value: -98,
			color: 'white'
		}, {
			value: 98,
			color: 'white'
		}, {
			value: 100,
			color: 'red'
		}]
	};
};

morpheus.HeatMapColorScheme.Predefined.SUMMLY2 = function () {
	return {
		type: 'fixed',
		map: [{
			value: -100,
			color: 'blue'
		}, {
			value: -98,
			color: '#abdda4'
		}, {
			value: -95,
			color: 'white'
		}, {
			value: 95,
			color: 'white'
		}, {
			value: 98,
			color: '#fdae61'
		}, {
			value: 100,
			color: 'red'
		}]
	};
};

morpheus.HeatMapColorScheme.Predefined.SUMMLY3 = function () {
	return {
		type: 'fixed',
		map: [{
			value: -100,
			color: 'blue'
		}, {
			value: -90,
			color: '#abdda4'
		}, {
			value: -80,
			color: '#e6f598'
		}, {
			value: -70,
			color: 'white'
		}, {
			value: 70,
			color: 'white'
		}, {
			value: 80,
			color: '#fee08b'
		}, {
			value: 90,
			color: '#fdae61'
		}, {
			value: 100,
			color: 'red'
		}]
	};
};

morpheus.HeatMapColorScheme.Predefined.CN = function () {
	return {
		type: 'fixed',
		map: [{
			value: -2,
			color: 'blue'
		}, {
			value: -0.1,
			color: 'white'
		}, {
			value: 0.1,
			color: 'white'
		}, {
			value: 2,
			color: 'red'
		}]
	};
};
morpheus.HeatMapColorScheme.Predefined.BINARY = function () {
	return {
		type: 'fixed',
		map: [{
			value: 0,
			color: 'white'
		}, {
			value: 1,
			color: 'black'
		}]
	};
};
morpheus.HeatMapColorScheme.Predefined.RELATIVE = function () {
	return {
		type: 'relative'
	};
};
morpheus.HeatMapColorScheme.Predefined.MAF = function () {
	// coMut plot colors

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var toHex = function (rgb) {
		ctx.fillStyle = rgb;
		return ctx.fillStyle;
	};

	return {
		type: 'fixed',
		stepped: true,
		map: [{
			value: 0,
			color: toHex('rgb(' + [255, 255, 255].join(',') + ')')
		}, {
			value: 1,
			color: toHex('rgb(' + [77, 175, 74].join(',') + ')'),
			name: 'Synonymous'
		}, {
			value: 2,
			color: toHex('rgb(' + [255, 255, 51].join(',') + ')'),
			name: 'In Frame Indel'
		}, {
			value: 3,
			color: toHex('rgb(' + [166, 86, 40].join(',') + ')'),
			name: 'Other Non-Synonymous'
		}, {
			value: 4,
			color: toHex('rgb(' + [55, 126, 184].join(',') + ')'),
			name: 'Missense'
		}, {
			value: 5,
			color: toHex('rgb(' + [152, 78, 163].join(',') + ')'),
			name: 'Splice Site'
		}, {
			value: 6,
			color: toHex('rgb(' + [255, 127, 0].join(',') + ')'),
			name: 'Frame Shift'
		}, {
			value: 7,
			color: toHex('rgb(' + [228, 26, 28].join(',') + ')'),
			name: 'Nonsense'
		}]
	};
};
// morpheus.HeatMapColorScheme.Predefined.MAF_NEW = function() {
// // Synonymous 1
// //In_frame_Indel 2
// //Other_non_syn. 3
// //Missense 4
// //Splice_Site 5
// //Frame_Shift 6
// //Nonsense 7
// return {
// type : 'fixed',
// stepped : true,
// map : [ {
// value : 0,
// color : 'rgb(' + [ 255, 255, 255 ].join(',') + ')',
// name : ''
// }, {
// value : 1,
// color : 'rgb(' + [ 255, 255, 179 ].join(',') + ')',
// name : 'Silent'
// }, {
// value : 2,
// color : 'rgb(' + [ 69, 117, 180 ].join(',') + ')',
// name : 'In Frame Indel'
// }, {
// value : 3,
// color : 'rgb(' + [ 247, 182, 210 ].join(',') + ')',
// name : 'Other Non-Synonymous'
// }, {
// value : 4,
// color : 'rgb(' + [ 1, 133, 113 ].join(',') + ')',
// name : 'Missense'
// }, {
// value : 5,
// color : 'rgb(' + [ 253, 180, 98 ].join(',') + ')',
// name : 'Splice Site'
// }, {
// value : 6,
// color : 'rgb(' + [ 140, 81, 10 ].join(',') + ')',
// name : 'Frame Shift'
// }, {
// value : 7,
// color : 'rgb(' + [ 123, 50, 148 ].join(',') + ')',
// name : 'Nonsense'
// } ]
// };
// };
morpheus.HeatMapColorScheme.Predefined.ZS = function () {
	return {
		type: 'fixed',
		map: [{
			value: -10,
			color: 'blue'
		}, {
			value: -2,
			color: 'white'
		}, {
			value: 2,
			color: 'white'
		}, {
			value: 10,
			color: 'red'
		}]
	};
};
morpheus.HeatMapColorScheme.ScalingMode = {
	RELATIVE: 0,
	FIXED: 1
};

morpheus.HeatMapConditions = function () {
	this.conditions = [];
	// each condition is a object with fields: series, shape, color and
	// accept(val) function

};
morpheus.HeatMapConditions.prototype = {
	insert: function (index, c) {
		this.conditions.splice(index, 0, c);
	},
	add: function (c) {
		this.conditions.push(c);
	},
	getConditions: function () {
		return this.conditions;
	},
	remove: function (index) {
		this.conditions.splice(index, 1);
	},
	copy: function () {
		var c = new morpheus.HeatMapConditions();
		this.conditions.forEach(function (cond) {
			c.conditions.push(_.clone(cond));
		});
		return c;
	}
};
morpheus.HeatMapSizer = function () {
	this._seriesName = null;
	this._sizeByScale = d3.scale.linear().domain([this._min, this._max])
	.range([0, 1]).clamp(true);
};
morpheus.HeatMapSizer.prototype = {
	_min: 0,
	_max: 1,
	copy: function () {
		var sizer = new morpheus.HeatMapSizer();
		sizer._seriesName = this._seriesName;
		sizer._min = this._mini;
		sizer._max = this._max;
		sizer._sizeByScale = this._sizeByScale.copy();
		return sizer;
	},
	valueToFraction: function (value) {
		return this._sizeByScale(value);
	},
	setMin: function (min) {
		this._min = min;
		this._sizeByScale = d3.scale.linear().domain([this._min, this._max])
		.range([0, 1]).clamp(true);
	},
	setMax: function (max) {
		this._max = max;
		this._sizeByScale = d3.scale.linear().domain([this._min, this._max])
		.range([0, 1]).clamp(true);
	},
	getMin: function () {
		return this._min;
	},
	getMax: function () {
		return this._max;
	},
	getSeriesName: function () {
		return this._seriesName;
	},
	setSeriesName: function (name) {
		this._seriesName = name;
	}
};
morpheus.HeatMapColorScheme.createColorSupplier = function (options) {
	var type = options.type;
	var stepped = options.stepped;
	var map = options.map;
	var scalingMode;
	var colorSupplier = stepped ? new morpheus.SteppedColorSupplier()
		: new morpheus.GradientColorSupplier();
	if (type === 'fixed') {
		scalingMode = morpheus.HeatMapColorScheme.ScalingMode.FIXED;
		if (map) { // get min/max
			var min = Number.MAX_VALUE;
			var max = -Number.MAX_VALUE;
			for (var i = 0; i < map.length; i++) {
				min = Math.min(min, map[i].value);
				max = Math.max(max, map[i].value);
			}
			colorSupplier.setMin(min);
			colorSupplier.setMax(max);
		}
	} else {
		scalingMode = morpheus.HeatMapColorScheme.ScalingMode.RELATIVE;
	}
	if (options.missingColor !== undefined) {
		colorSupplier.setMissingColor(options.missingColor);
	}
	colorSupplier.setScalingMode(scalingMode);
	if (map) {
		var fractions = [];
		var colors = [];
		var names = [];
		var valueToFraction = d3.scale.linear().domain(
			[colorSupplier.getMin(), colorSupplier.getMax()]).range(
			[0, 1]).clamp(true);
		var hasNames = false;
		for (var i = 0; i < map.length; i++) {
			fractions.push(valueToFraction(map[i].value));
			colors.push(map[i].color);
			var name = map[i].name;
			if (!hasNames && name !== undefined) {
				hasNames = true;
			}
			names.push(name);
		}
		colorSupplier.setFractions({
			fractions: fractions,
			colors: colors,
			names: hasNames ? names : null
		});
	}

	return colorSupplier;
};
morpheus.HeatMapColorScheme.prototype = {
	getColors: function () {
		return this.currentColorSupplier.getColors();
	},
	setMissingColor: function (color) {
		this.currentColorSupplier.setMissingColor(color);
	},
	getHiddenValues: function () {
		return this.currentColorSupplier.getHiddenValues ? this.currentColorSupplier
		.getHiddenValues()
			: null;
	},
	getMissingColor: function () {
		return this.currentColorSupplier.getMissingColor();
	},
	getScalingMode: function () {
		return this.currentColorSupplier.getScalingMode();
	},
	getSizer: function () {
		return this.currentColorSupplier.getSizer();
	},
	getConditions: function () {
		return this.currentColorSupplier.getConditions();
	},
	setScalingMode: function (scalingMode) {
		this.currentColorSupplier.setScalingMode(scalingMode);
	},
	getFractions: function () {
		return this.currentColorSupplier.getFractions();
	},
	getNames: function () {
		return this.currentColorSupplier.getNames();
	},
	getMin: function () {
		return this.currentColorSupplier.getMin();
	},
	getMax: function () {
		return this.currentColorSupplier.getMax();
	},
	setMin: function (min) {
		this.currentColorSupplier.setMin(min);
	},
	setMax: function (max) {
		this.currentColorSupplier.setMax(max);
	},
	isStepped: function () {
		return this.currentColorSupplier.isStepped();
	},
	isDiscrete: function () {
		return this.currentColorSupplier.isDiscrete();
	},
	setFractions: function (options) {
		this.currentColorSupplier.setFractions(options);
	},
	setStepped: function (stepped) {
		var oldColorSupplier = this.currentColorSupplier;
		var newColorSupplier = stepped ? new morpheus.SteppedColorSupplier()
			: new morpheus.GradientColorSupplier();
		newColorSupplier.sizer = oldColorSupplier.getSizer();
		newColorSupplier.conditions = oldColorSupplier.getConditions();
		newColorSupplier.setScalingMode(oldColorSupplier.getScalingMode());
		newColorSupplier.setMin(oldColorSupplier.getMin());
		newColorSupplier.setMax(oldColorSupplier.getMax());
		newColorSupplier.setFractions({
			fractions: oldColorSupplier.getFractions(),
			colors: oldColorSupplier.getColors()
		});
		this.currentColorSupplier = newColorSupplier;
		this.rowValueToColorSupplier[this.value] = this.currentColorSupplier;
	},
	toJson: function () {
		var json = {};
		var _this = this;
		if (this.separateColorSchemeForRowMetadataField != null) {
			json.separateColorSchemeForRowMetadataField = this.separateColorSchemeForRowMetadataField;
		}
		json.colorSchemes = {};
		_.each(_.keys(this.rowValueToColorSupplier), function (key) {
			// save each scheme
			var val = _this.rowValueToColorSupplier[key];
			// delete val.sizer;
			// delete val.conditions;
			json.colorSchemes[key] = val;

		});

		return JSON.stringify(json);
	},
	fromJson: function (json) {
		var _this = this;
		if (json.separateColorSchemeForRowMetadataField) {
			this.separateColorSchemeForRowMetadataField = json.separateColorSchemeForRowMetadataField;
			this.vector = this.project.getSortedFilteredDataset()
			.getRowMetadata().getByName(
				this.separateColorSchemeForRowMetadataField);
		}
		this.rowValueToColorSupplier = {};
		_.each(_.keys(json.colorSchemes), function (key) {
			var colorSupplier = morpheus.AbstractColorSupplier
			.fromJson(json.colorSchemes[key]);
			_this.rowValueToColorSupplier[key] = colorSupplier;
		});
		this._ensureColorSupplierExists();

	},
	copy: function (project) {
		var _this = this;
		var c = new morpheus.HeatMapColorScheme(project);
		c.separateColorSchemeForRowMetadataField = this.separateColorSchemeForRowMetadataField;
		if (c.separateColorSchemeForRowMetadataField != null) {
			c.vector = project.getSortedFilteredDataset().getRowMetadata()
			.getByName(c.separateColorSchemeForRowMetadataField);

		}
		if (c.vector == null) {
			c.separateColorSchemeForRowMetadataField = null;
		}
		_.each(_.keys(this.rowValueToColorSupplier), function (key) {
			c.rowValueToColorSupplier[key] = _this.rowValueToColorSupplier[key]
			.copy();
		});

		c.value = this.value;
		c.currentColorSupplier = c.rowValueToColorSupplier[c.value];

		return c;
	},
	setSeparateColorSchemeForRowMetadataField: function (separateColorSchemeForRowMetadataField) {
		if (separateColorSchemeForRowMetadataField != this.separateColorSchemeForRowMetadataField) {
			this.separateColorSchemeForRowMetadataField = separateColorSchemeForRowMetadataField;
			this.vector = this.project.getSortedFilteredDataset()
			.getRowMetadata().getByName(
				separateColorSchemeForRowMetadataField);
			var that = this;
			_.each(_.keys(this.rowValueToColorSupplier), function (key) {
				// remove old color schemes
				delete that.rowValueToColorSupplier[key];
			});
		}
	},
	getProject: function () {
		return this.project;
	},
	getSeparateColorSchemeForRowMetadataField: function () {
		return this.separateColorSchemeForRowMetadataField;
	},
	getColorByValues: function () {
		return _.keys(this.rowValueToColorSupplier);
	},
	projectUpdated: function () {
		var dataset = this.project.getSortedFilteredDataset();
		if (this.separateColorSchemeForRowMetadataField != null) {
			this.vector = this.project.getSortedFilteredDataset()
			.getRowMetadata().getByName(
				this.separateColorSchemeForRowMetadataField);
		}
		this.cachedRowStats = new morpheus.RowStats(dataset);
	},
	/**
	 * @private
	 */
	_ensureColorSupplierExists: function () {
		this.currentColorSupplier = this.rowValueToColorSupplier[this.value];
		if (this.currentColorSupplier === undefined) {
			var cs = morpheus.HeatMapColorScheme.createColorSupplier({
				type: 'relative'
			});
			this.rowValueToColorSupplier[this.value] = cs;
			this.currentColorSupplier = cs;
		}
	},
	setColorSupplierForCurrentValue: function (colorSupplier) {
		this.rowValueToColorSupplier[this.value] = colorSupplier;
		this.currentColorSupplier = colorSupplier;
	},
	setCurrentValue: function (value) {
		this.value = value;
		this._ensureColorSupplierExists();
	},
	isSizeBy: function () {
		this.currentColorSupplier.isSizeBy();
	},
	getColor: function (row, column, val) {
		if (this.vector !== undefined) {
			var tmp = this.vector.getValue(row);
			if (this.value !== tmp) {
				this.value = tmp;
				this._ensureColorSupplierExists();
			}
		}
		if (this.currentColorSupplier.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
			if (this.cachedRowStats.maybeUpdate(row)) {
				this.currentColorSupplier
				.setMin(this.cachedRowStats.rowCachedMin);
				this.currentColorSupplier
				.setMax(this.cachedRowStats.rowCachedMax);
			}
		}
		return this.currentColorSupplier.getColor(row, column, val);
	}
};
morpheus.RowStats = function (dataset) {
	this.datasetRowView = new morpheus.DatasetRowView(dataset);
	this.cachedRow = -1;
	this.rowCachedMax = 0;
	this.rowCachedMin = 0;
};
morpheus.RowStats.prototype = {
	maybeUpdate: function (row) {
		if (this.cachedRow !== row) {
			this.cachedRow = row;
			this.datasetRowView.setIndex(row);
			this.rowCachedMax = -Number.MAX_VALUE;
			this.rowCachedMin = Number.MAX_VALUE;
			for (var j = 0, ncols = this.datasetRowView.size(); j < ncols; j++) {
				var d = this.datasetRowView.getValue(j);
				if (!isNaN(d)) {
					this.rowCachedMax = d > this.rowCachedMax ? d
						: this.rowCachedMax;
					this.rowCachedMin = d < this.rowCachedMin ? d
						: this.rowCachedMin;
				}
			}
			if (this.rowCachedMin === this.rowCachedMax) {
				this.rowCachedMin--;
			}
			return true;
		}
		return false;
	}
};

morpheus.HeatMapColorSchemeChooser = function(options) {
	var that = this;
	this.$div = $('<div></div>');
	this.currentValue = null;
	this.legend = new morpheus.LegendWithStops();
	this.legend.on('added', function(e) {
		var fractions = that.colorScheme.getFractions();
		fractions.push(e.fraction);
		var colors = that.colorScheme.getColors();
		colors.push('black');
		that.colorScheme.setFractions({
			fractions : fractions,
			colors : colors
		});
		that.setSelectedIndex(_.indexOf(fractions, e.fraction));
		that.fireChanged();
	}).on('selectedIndex', function(e) {
		that.setSelectedIndex(e.selectedIndex);
	}).on('delete', function(index) {
		that.deleteSelectedStop();
	}).on(
			'moved',
			function(e) {
				var fraction = e.fraction;
				var fractions = that.colorScheme.getFractions();
				fractions[that.legend.selectedIndex] = fraction;
				that.colorScheme.setFractions({
					fractions : fractions,
					colors : that.colorScheme.getColors()
				});
				var newIndex = that.colorScheme.getFractions()
						.indexOf(fraction);
				if (newIndex !== -1) {
					that.legend.selectedIndex = newIndex;
				}
				var fractionToValue = d3.scale.linear().domain([ 0, 1 ])
						.range(
								[ that.colorScheme.getMin(),
										that.colorScheme.getMax() ])
						.clamp(true);
				that.formBuilder.setValue('selected_value',
						fractionToValue(fractions[that.legend.selectedIndex]));
				that.fireChanged();
			});
	var $row = $('<div></div>');
	$row.css('height', '50px').css('width', '300px').css('margin-left', 'auto')
			.css('margin-right', 'auto');
	$row.appendTo(this.$div);
	this.colorScheme = null;
	$(this.legend.canvas).appendTo($row);
	var formBuilder = new morpheus.FormBuilder();
	var items = [];
	items = items.concat({
		name : 'selected_color',
		type : 'color',
		col : 'col-xs-2'
	}, {
		name : 'selected_value',
		type : 'text',
		col : 'col-xs-4'
	}, [ {
		name : 'delete',
		type : 'button',
		value : 'Delete Selected Color Stop',
	}, {
		name : 'add',
		type : 'button',
		value : 'Add Color Stop'
	} ], {
		name : 'minimum',
		type : 'text',
		col : 'col-xs-4'
	}, {
		name : 'maximum',
		type : 'text',
		col : 'col-xs-4'
	});
	if (options.showRelative) {
		items = items.concat({
			name : 'color_scheme',
			type : 'radio',
			options : [ 'fixed', 'relative' ]
		});
	}
	items = items.concat({
		name : 'missing_color',
		type : 'color',
		col : 'col-xs-2'
	});
	items
			.push({
				name : 'stepped_colors',
				type : 'checkbox',
				value : false,
				help : 'Intervals include left end point and exclude right end point, except for the highest interval'
			});
	_.each(items, function(item) {
		formBuilder.append(item);
	});
	this.$div.append(formBuilder.$form);
	formBuilder.$form.find('[name^=selected],[name=delete]').prop('disabled',
			true);
	formBuilder.$form.find('[name=add]').on('click', function(e) {
		var fractions = that.colorScheme.getFractions();
		var val = 0.5;
		while (val >= 0 && _.indexOf(fractions, val) !== -1) {
			val -= 0.1;
		}
		val = Math.max(0, val);
		fractions.push(val);
		var colors = that.colorScheme.getColors();
		colors.push('black');
		that.colorScheme.setFractions({
			fractions : fractions,
			colors : colors
		});
		that.setSelectedIndex(_.indexOf(fractions, val));
		that.fireChanged();
	});
	formBuilder.$form.find('[name=delete]').on('click', function(e) {
		that.deleteSelectedStop();
	});
	formBuilder.$form.on('keyup', '[name=selected_value]', _.debounce(function(
			e) {
		var val = parseFloat($(this).val());
		if (!isNaN(val)) {
			that.setSelectedValue(val);
			that.fireChanged();
		}
	}, 100));
	formBuilder.$form.on('change', '[name=selected_color]', function(e) {
		var colors = that.colorScheme.getColors();
		colors[that.legend.selectedIndex] = $(this).val();
		that.colorScheme.setFractions({
			fractions : that.colorScheme.getFractions(),
			colors : colors
		});
		that.fireChanged();
	});
	formBuilder.$form.on('change', '[name=missing_color]', function(e) {
		var color = $(this).val();
		that.colorScheme.setMissingColor(color);
		that.fireChanged(false);
	});
	formBuilder.$form.on('change', '[name=stepped_colors]', function(e) {
		that.colorScheme.setStepped($(this).prop('checked'));
		that.fireChanged();
	});
	formBuilder.$form.on('keyup', '[name=minimum]', _.debounce(function(e) {
		var val = parseFloat($(this).val());
		if (!isNaN(val)) {
			that.colorScheme.setMin(val);
			that.setSelectedIndex(that.legend.selectedIndex);
			that.fireChanged(false);
		}
	}, 100));
	formBuilder.$form.on('keyup', '[name=maximum]', _.debounce(function(e) {
		var val = parseFloat($(this).val());
		if (!isNaN(val)) {
			that.colorScheme.setMax(val);
			that.setSelectedIndex(that.legend.selectedIndex);
			that.fireChanged(false);
		}

	}, 100));
	formBuilder.$form
			.on(
					'change',
					'[name=color_scheme]',
					_
							.throttle(
									function(e) {
										that.legend.selectedIndex = -1;
										// FIXME set fixed min and max
										var val = $(this).val();
										var scalingMode = val === 'relative' ? morpheus.HeatMapColorScheme.ScalingMode.RELATIVE
												: morpheus.HeatMapColorScheme.ScalingMode.FIXED;
										that.colorScheme
												.setScalingMode(scalingMode);
										that.setColorScheme(that.colorScheme);
										that.fireChanged();
									}, 100));
	this.formBuilder = formBuilder;
	// selection: delete, color, value
	// general: add, min, max, relative or global
};
morpheus.HeatMapColorSchemeChooser.prototype = {
	deleteSelectedStop : function() {
		var fractions = this.colorScheme.getFractions();
		fractions.splice(this.legend.selectedIndex, 1);
		var colors = this.colorScheme.getColors();
		colors.splice(this.legend.selectedIndex, 1);
		this.colorScheme.setFractions({
			fractions : fractions,
			colors : colors
		});
		this.formBuilder.$form.find('[name^=selected],[name=delete]').prop(
				'disabled', true);
		this.legend.setSelectedIndex(-1);
		this.fireChanged();
	},
	setSelectedValue : function(val) {
		var valueToFraction = d3.scale.linear().domain(
				[ this.colorScheme.getMin(), this.colorScheme.getMax() ])
				.range([ 0, 1 ]).clamp(true);
		var fractions = this.colorScheme.getFractions();
		fractions[this.legend.selectedIndex] = valueToFraction(val);
		this.colorScheme.setFractions({
			fractions : fractions,
			colors : this.colorScheme.getColors()
		});
	},
	setSelectedIndex : function(index) {
		var fractions = this.colorScheme.getFractions();
		if (index >= fractions.length) {
			index = -1;
		}
		this.legend.setSelectedIndex(index);
		var formBuilder = this.formBuilder;
		formBuilder.$form.find('[name^=selected],[name=delete]').prop(
				'disabled', this.legend.selectedIndex === -1);
		if (this.legend.selectedIndex !== -1) {
			var fractionToValue = d3.scale.linear().domain([ 0, 1 ]).range(
					[ this.colorScheme.getMin(), this.colorScheme.getMax() ])
					.clamp(true);
			formBuilder.setValue('selected_value',
					fractionToValue(fractions[this.legend.selectedIndex]));
			var context = this.legend.canvas.getContext('2d');
			var colors = this.colorScheme.getColors();
			context.fillStyle = colors[this.legend.selectedIndex];
			formBuilder.setValue('selected_color', context.fillStyle);
		} else {
			formBuilder.setValue('selected_value', '');
		}
		this.draw();
	},
	setMinMax : function() {
		if (this.colorScheme.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
			this.colorScheme.setMin(0);
			this.colorScheme.setMax(1);
		}
	},
	dispose : function() {
		this.off('change');
		this.legend.destroy();
		this.formBuilder.$form.off('keyup', 'input');
		this.formBuilder.$form.off('change', '[name=color_scheme]');
	},
	restoreCurrentValue : function() {
		if (this.colorScheme.setCurrentValue) {
			this.colorScheme.setCurrentValue(this.currentValue);
		}
	},
	setCurrentValue : function(value) {
		this.currentValue = value;
		if (this.colorScheme.setCurrentValue) {
			this.colorScheme.setCurrentValue(this.currentValue);
		}
		this.setColorScheme(this.colorScheme);
	},
	setColorScheme : function(colorScheme) {
		this.colorScheme = colorScheme;
		this.setMinMax();
		if (colorScheme.setCurrentValue) {
			colorScheme.setCurrentValue(this.currentValue);
		}
		this.formBuilder
				.setValue(
						'color_scheme',
						colorScheme.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE ? 'relative'
								: 'fixed');
		this.formBuilder.$form
				.find('[name=minimum],[name=maximum]')
				.prop(
						'disabled',
						colorScheme.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE);
		this.formBuilder.setValue('minimum', this.colorScheme.getMin());
		this.formBuilder.setValue('maximum', this.colorScheme.getMax());
		this.formBuilder.setValue('stepped_colors', this.colorScheme
				.isStepped());
		this.formBuilder.setValue('missing_color', this.colorScheme
				.getMissingColor());
		this.draw();
	},
	getFractionToStopPix : function() {
		return d3.scale.linear().clamp(true).domain([ 0, 1 ]).range(
				[ this.legend.border,
						this.legend.getUnscaledWidth() - this.legend.border ]);
	},
	fireChanged : function(noreset) {
		this.trigger('change');
		if (noreset !== false) {
			this.setColorScheme(this.colorScheme);
		}
	},
	draw : function() {
		var colorScheme = this.colorScheme;
		if (colorScheme.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
			colorScheme.setMin(0);
			colorScheme.setMax(1);
		}
		var fractions = colorScheme.getFractions();
		var colors = colorScheme.getColors();
		var fractionToStopPix = this.getFractionToStopPix();
		this.legend.draw(fractions, colors, colorScheme.isStepped(),
				fractionToStopPix);
	}
};
morpheus.Util.extend(morpheus.HeatMapColorSchemeChooser, morpheus.Events);
morpheus.HeatMapColorSchemeLegend = function(controller, $keyContent) {
	var colorScheme = controller.heatmap.getColorScheme();

	var tracks = colorScheme.getColorByValues();
	var totalHeight;
	$keyContent.empty();
	var ntracks = tracks.length;
	tracks
			.forEach(function(value) {
				if (value != null || ntracks === 1) {
					if (value != 'null') { // values are stored as string
						var $label = $('<span style="overflow:hidden;text-overflow: ellipsis;width:250px;max-width:250px;">'
								+ value + '</span>');
						$keyContent.append($label);
						totalHeight += $label.height();
					}
					var trackLegend = new morpheus.HeatMapColorSchemeLegendTrack(
							colorScheme, value);
					$(trackLegend.canvas).css('position', '');
					trackLegend.repaint();
					trackLegend.on('selectionChanged', function() {
						controller.heatmap.setInvalid(true);
						controller.heatmap.repaint();
					});
					$keyContent.append($(trackLegend.canvas));
					totalHeight += trackLegend.getUnscaledHeight();
				}
			});
	if (controller.options.$key) {
		$keyContent.append(controller.options.$key);
		totalHeight += controller.options.$key.height();

	}
	var $edit = $('<div style="padding-left:4px; display:inline;"><a data-name="options"' +
		' href="#">Edit</a></div>');

	$edit.find('[data-name=options]').on('click', function(e) {
		e.preventDefault();
		controller.showOptions();
		morpheus.Util.trackEvent({
			eventCategory : 'ToolBar',
			eventAction : 'options'
		});
	});
	totalHeight += $edit.height();
	$keyContent.append($edit);
	$keyContent.css({
		'text-overflow' : 'ellipsis',
		overflow : 'hidden',
		width : 250 + 'px',
		height : totalHeight + 'px'
	});
};

morpheus.HeatMapColorSchemeLegendTrack = function(colorScheme, value) {
	morpheus.AbstractCanvas.call(this, false);
	var _this = this;
	this.value = value;
	this.colorScheme = colorScheme;
	colorScheme.setCurrentValue(value);
	var hiddenValues = colorScheme.getHiddenValues();

	var names = colorScheme.getNames();
	var hasNames = names != null;
	var legendHeight = hasNames ? names.length * 14 : 30;
	var bounds = {
		width : 250,
		height : legendHeight
	};
	this.hasNames = hasNames;
	this.setBounds(bounds);
	if (hasNames && hiddenValues) {
		$(this.canvas)
				.on(
						'click',
						function(e) {
							e.preventDefault();
							e.stopPropagation();
							var clickedRow = Math
									.floor((e.clientY - _this.canvas
											.getBoundingClientRect().top) / 14);
							var fractionToValue = d3.scale.linear().domain(
									[ 0, 1 ]).range(
									[ colorScheme.getMin(),
											colorScheme.getMax() ]).clamp(true);
							var fractions = colorScheme.getFractions();
							var value = fractionToValue(fractions[clickedRow]);
							if (!hiddenValues.has(value)) {
								hiddenValues.add(value);
							} else {
								hiddenValues.remove(value);

							}
							_this.trigger('selectionChanged');
							_this.repaint();
						});
	}
};

morpheus.HeatMapColorSchemeLegendTrack.prototype = {
	draw : function(clip, context) {
		var colorScheme = this.colorScheme;
		colorScheme.setCurrentValue(this.value);
		context.fillStyle = 'white';
		context.fillRect(0, 0, this.getUnscaledWidth(), this
				.getUnscaledHeight());
		context.translate(this.hasNames ? 14
				: (this.getUnscaledWidth() - 200) / 2, 0);
		morpheus.HeatMapColorSchemeLegend.drawColorScheme(context, colorScheme,
				200);

	}

};

morpheus.Util.extend(morpheus.HeatMapColorSchemeLegendTrack,
		morpheus.AbstractCanvas);
morpheus.Util.extend(morpheus.HeatMapColorSchemeLegendTrack, morpheus.Events);
morpheus.HeatMapColorSchemeLegend.drawColorScheme = function(context,
		colorScheme, width, printing, hideText) {
	var names = colorScheme.getNames();
	var hasNames = names != null;
	// if hasNames that we draw vertically to ensure space for names
	if (hasNames) {
		morpheus.HeatMapColorSchemeLegend.drawColorSchemeVertically(context,
				colorScheme, colorScheme.getHiddenValues(), printing);
	} else {
		morpheus.HeatMapColorSchemeLegend.draw(context, colorScheme
				.getFractions(), colorScheme.getColors(), width, 12,
				colorScheme.isStepped());
		context.strokeStyle = 'LightGrey';
		context.strokeRect(0, 0, width, 12);
		if (hideText) {
			return;
		}
		var map = d3.scale.linear().domain([ 0, 1 ]).range([ 0, width ]).clamp(
				true);
		var fractionToValue = d3.scale.linear().domain([ 0, 1 ]).range(
				[ colorScheme.getMin(), colorScheme.getMax() ]).clamp(true);
		context.textAlign = 'center';
		context.textBaseline = 'top';
		context.fillStyle = 'black';
		context.font = '12px ' + morpheus.CanvasUtil.FONT_NAME;
		if (colorScheme.getScalingMode() === morpheus.HeatMapColorScheme.ScalingMode.RELATIVE) {
			context.fillText('row min', 0, 14);
			context.fillText('row max', width, 14);
		} else {
			var fractions = colorScheme.getFractions();
			var lastTextPixEnd = -1;
			// draw from left to middle and then from right to middle to avoid
			// text overlap
			var halfway = parseInt(fractions.length / 2);
			for (var i = 0; i < halfway; i++) {
				var pix = map(fractions[i]);
				var text = '';
				if (hasNames) {
					text = names[i] != '' ? (names[i] + ' ('
							+ fractionToValue(fractions[i]) + ')') : names[i];
				} else {
					text = morpheus.Util.nf(fractionToValue(fractions[i]));
				}
				var textWidth = context.measureText(text).width;
				if (pix > lastTextPixEnd) {
					context.fillText(text, pix, 14);
				}
				lastTextPixEnd = pix + textWidth / 2;
			}
			var lastTextPixStart = 10000;
			for (var i = fractions.length - 1; i >= halfway; i--) {
				var pix = map(fractions[i]);
				var text = '';
				if (hasNames) {
					text = names[i] != '' ? (names[i] + ' ('
							+ fractionToValue(fractions[i]) + ')') : names[i];
				} else {
					text = morpheus.Util.nf(fractionToValue(fractions[i]));
				}

				var textWidth = context.measureText(text).width;
				var textPixEnd = pix + textWidth / 2;
				if (pix < lastTextPixStart) {

					context.fillText(text, pix, 14);
					lastTextPixStart = pix - textWidth / 2;
				}
			}
		}
	}
};
morpheus.HeatMapColorSchemeLegend.drawColorSchemeVertically = function(context,
		colorScheme, hiddenValues, printing) {
	var fractionToValue = d3.scale.linear().domain([ 0, 1 ]).range(
			[ colorScheme.getMin(), colorScheme.getMax() ]).clamp(true);
	context.textAlign = 'left';
	context.textBaseline = 'top';
	context.fillStyle = 'black';
	var fractions = colorScheme.getFractions();
	var colors = colorScheme.getColors();
	var names = colorScheme.getNames();
	context.strokeStyle = 'LightGrey';
	var xpix = 0;
	var ypix = 0;
	context.font = '12px ' + morpheus.CanvasUtil.FONT_NAME;
	for (var i = 0; i < colors.length; i++) {
		var name = names[i];
		if (name != null) {
			context.fillStyle = colors[i];
			context.fillRect(xpix, ypix, 12, 12);
			context.strokeRect(xpix, ypix, 12, 12);
			context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
			if (hiddenValues && !printing) {
				var value = fractionToValue(fractions[i]);
				context.font = '12px FontAwesome';
				if (!hiddenValues.has(value)) {
					context.fillText('\uf00c', -14, ypix); // checked
				}
				// else {
				// context.fillText("\uf096", -14, ypix); // unchecked
				// }
				context.font = '12px ' + morpheus.CanvasUtil.FONT_NAME;
			}
			name += ' (value: ' + fractionToValue(fractions[i]) + ')';
			context.fillText(name, xpix + 16, ypix);
		}
		ypix += 14;
	}
};
morpheus.HeatMapColorSchemeLegend.draw = function(context, fractions, colors,
		width, height, stepped) {
	if (!stepped) {
		var gradient = context.createLinearGradient(0, 0, width, height);
		for (var i = 0, length = fractions.length; i < length; i++) {
			gradient.addColorStop(fractions[i], colors[i]);
		}
		context.fillStyle = gradient;
		context.fillRect(0, 0, width, height);
	} else {
		// intervals include left end point, exclude right end point, except for
		// the highest interval
		// TODO right-most endpoint is not shown
		var map = d3.scale.linear().domain([ 0, 1 ]).range([ 0, width ]).clamp(
				true);
		for (var i = 0, length = fractions.length; i < length; i++) {
			context.fillStyle = colors[i];
			var x1 = map(fractions[i]);
			var x2 = i === length - 1 ? width : map(fractions[i + 1]);
			context.fillRect(Math.min(x1, x2), 0, Math.abs(x2 - x1), height);
		}
	}
};
morpheus.HeatMapColorSchemeLegend.prototype = {};

morpheus.HeatMapSynchronizer = function() {
	this.controllers = [];
};
morpheus.HeatMapSynchronizer.prototype = {
	firing : false,
	getProject : function() {
		return this.controllers[0].getProject();
	},
	zoom : function() {
		this.controllers[0].zoom.apply(this.controllers[0], arguments);
	},
	setTrackVisible : function() {
		this.controllers[0].setTrackVisible.apply(this.controllers[0],
				arguments);
	},
	revalidate : function() {
		this.controllers[0].revalidate.apply(this.controllers[0], arguments);
	},
	add : function(controller) {
		var that = this;
		this.controllers.push(controller);
		// setQuickSearchField, setTrackVisible, removeTrack, updateDataset, zoom, moveTrack, resizeTrack, paintAll, fitToWindow, revalidate, setToolTip, setMousePosition
		controller.on('change', function(event) {
			if (!that.firing) {
				var source = event.source;
				var method = event.name;
				that.firing = true;
				_.each(that.controllers, function(c) {
					if (c !== source) {
						c[method].apply(c, event.arguments);
					}
				});
				that.firing = false;
			}
		});
	}
};
morpheus.HeatMapElementCanvas = function (project) {
	morpheus.AbstractCanvas.call(this, true);
	this.colorScheme = null;
	this.project = project;
	this.dataset = null;
	var _this = this;
	this.columnPositions = new morpheus.Positions();
	this.rowPositions = new morpheus.Positions();
	this.lastPosition = {
		left: -1,
		right: -1,
		top: -1,
		bottom: -1
	};
	project.getElementSelectionModel().on('selectionChanged', function () {
		_this.repaint();
	});
};
morpheus.HeatMapElementCanvas.GRID_COLOR = 'rgb(128,128,128)';
morpheus.HeatMapElementCanvas.prototype = {
	drawGrid: true,
	getColorScheme: function () {
		return this.colorScheme;
	},
	isDrawGrid: function () {
		return this.drawGrid;
	},
	setDrawGrid: function (drawGrid) {
		this.drawGrid = drawGrid;
	},
	setColorScheme: function (colorScheme) {
		this.colorScheme = colorScheme;
	},
	setDataset: function (dataset) {
		this.dataset = dataset;
		this.columnPositions.setLength(this.dataset.getColumnCount());
		this.rowPositions.setLength(this.dataset.getRowCount());
	},
	getColumnPositions: function () {
		return this.columnPositions;
	},
	getRowPositions: function () {
		return this.rowPositions;
	},
	getPreferredSize: function (context) {
		var w = Math.ceil(this.columnPositions.getPosition(this.columnPositions
				.getLength() - 1)
			+ this.columnPositions.getItemSize(this.columnPositions
				.getLength() - 1));
		var h = Math.ceil(this.rowPositions.getPosition(this.rowPositions
				.getLength() - 1)
			+ this.rowPositions
			.getItemSize(this.rowPositions.getLength() - 1));
		return {
			width: Math.max(12, w),
			height: Math.max(12, h)
		};
	},
	prePaint: function (clip, context) {
		var lastPosition = this.lastPosition;
		var columnPositions = this.columnPositions;
		var rowPositions = this.rowPositions;
		var left = morpheus.Positions.getLeft(clip, columnPositions);
		var right = morpheus.Positions.getRight(clip, columnPositions);
		var top = morpheus.Positions.getTop(clip, rowPositions);
		var bottom = morpheus.Positions.getBottom(clip, rowPositions);
		if (this.invalid || left !== lastPosition.left
			|| right !== lastPosition.right || top !== lastPosition.top
			|| bottom !== lastPosition.bottom) {
			lastPosition.right = right;
			lastPosition.left = left;
			lastPosition.top = top;
			lastPosition.bottom = bottom;
			this.invalid = true;
		}
	},
	postPaint: function (clip, context) {
		// draw mouse over stuff
		morpheus.CanvasUtil.resetTransform(context);
		var project = this.project;
		context.strokeStyle = 'Grey';
		context.lineWidth = 1;
		var rowPositions = this.getRowPositions();
		var columnPositions = this.getColumnPositions();
		if (project.getHoverColumnIndex() >= 0
			|| project.getHoverRowIndex() >= 0) {

			var height = rowPositions
			.getItemSize(project.getHoverColumnIndex());
			var width = columnPositions.getItemSize(project
			.getHoverColumnIndex());
			var y = (project.getHoverRowIndex() === -1 ? rowPositions
			.getPosition(rowPositions.getLength() - 1) : rowPositions
			.getPosition(project.getHoverRowIndex()));
			var x = (project.getHoverColumnIndex() === -1 ? columnPositions
			.getPosition(0) : columnPositions.getPosition(project
			.getHoverColumnIndex()));

			if (project.getHoverColumnIndex() !== -1) {
				context.strokeRect(x - clip.x, 0, width, this
				.getUnscaledHeight());
			}
			if (project.getHoverRowIndex() !== -1) {
				context.strokeRect(0, y - clip.y, this.getUnscaledWidth(),
					height);
			}
			if (project.getHoverColumnIndex() !== -1
				&& project.getHoverRowIndex() !== -1) {
				context.strokeStyle = 'black';
				context.lineWidth = 3;
				context.strokeRect(x - clip.x + 1.5, y - clip.y + 1.5,
					width - 1.5, height - 1.5);
			}
		}
		var left = morpheus.Positions.getLeft(clip, columnPositions);
		var right = morpheus.Positions.getRight(clip, columnPositions);
		var top = morpheus.Positions.getTop(clip, rowPositions);
		var bottom = morpheus.Positions.getBottom(clip, rowPositions);
		context.strokeStyle = 'rgb(182,213,253)';
		context.lineWidth = 3;
		// context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		context.translate(-clip.x, -clip.y);
		var selectedElements = project.getElementSelectionModel()
		.getViewIndices();

		if (selectedElements != null) {
			selectedElements.forEach(function (id) {
				var rowIndex = id.getArray()[0];
				var columnIndex = id.getArray()[1];
				if (rowIndex >= top && rowIndex < bottom && columnIndex >= left
					&& columnIndex < right) {
					var rowSize = rowPositions.getItemSize(rowIndex);
					var py = rowPositions.getPosition(rowIndex);
					var columnSize = columnPositions.getItemSize(columnIndex);
					var px = columnPositions.getPosition(columnIndex);
					context.strokeRect(px + 1.5, py + 1.5, columnSize - 1.5,
						rowSize - 1.5);

				}
			});
		}
		// draw selection stuff
		// selectedRowElements = getSelectedRectangles(heatMapElementRenderer
		// .getProject().getRowSelectionModel().getSelectedViewIndices());
		// selectedColumnElements = getSelectedRectangles(heatMapElementRenderer
		// .getProject().getColumnSelectionModel()
		// .getSelectedViewIndices());
		// if (!(selectedRowElements.size() == 0 &&
		// selectedColumnElements.size() == 0)) {
		// if (selectedRowElements.size() == 0) {
		// selectedRowElements.add(new Point(top, bottom - 1));
		// }
		// if (selectedColumnElements.size() == 0) {
		// selectedColumnElements.add(new Point(left, right - 1));
		// }
		// }
		// var emptySelection = selectedRowElements.size() == 0;
		// emptySelection = emptySelection && selectedColumnElements.size() ==
		// 0;
	},
	setElementDrawCallback: function (elementDrawCallback) {
		this._elementDrawCallback = elementDrawCallback;
	},
	draw: function (clip, context) {
		var columnPositions = this.columnPositions;
		var rowPositions = this.rowPositions;
		var left = morpheus.Positions.getLeft(clip, columnPositions);
		var right = morpheus.Positions.getRight(clip, columnPositions);
		var top = morpheus.Positions.getTop(clip, rowPositions);
		var bottom = morpheus.Positions.getBottom(clip, rowPositions);
		if (this.dataset.getRowCount() === 0 || this.dataset.getColumnCount() === 0) {
			return context.fillText('No data', 0, 6);
		} else {
			context.translate(-clip.x, -clip.y);
			this._draw({
				left: left,
				right: right,
				top: top,
				bottom: bottom,
				context: context
			});
			context.translate(clip.x, clip.y);
		}

	},
	_draw: function (options) {
		var left = options.left;
		var right = options.right;
		var top = options.top;
		var bottom = options.bottom;
		var context = options.context;
		var dataset = this.dataset;

		var columnPositions = this.columnPositions;
		var rowPositions = this.rowPositions;

		// context.fillStyle = 'LightGrey';
		// context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		var colorScheme = this.colorScheme;
		var drawGrid = this.drawGrid;
		var elementDrawCallback = this._elementDrawCallback;
		var seriesNameToIndex = {};
		for (var i = 0; i < dataset.getSeriesCount(); i++) {
			seriesNameToIndex[dataset.getName(i)] = i;
		}
		var sizer;
		var sizeBySeriesName;
		var sizeBySeriesIndex;

		var conditions;
		var conditionSeriesIndices;
		context.lineWidth = 0.1;
		for (var row = top; row < bottom; row++) {
			var rowSize = rowPositions.getItemSize(row);
			var py = rowPositions.getPosition(row);
			for (var column = left; column < right; column++) {
				var columnSize = columnPositions.getItemSize(column);
				var px = columnPositions.getPosition(column);
				context.fillStyle = colorScheme.getColor(row, column, dataset
				.getValue(row, column));
				if (column === left) { // check if the color scheme for this
					// row is sizing
					sizer = colorScheme.getSizer();

					sizeBySeriesName = sizer.getSeriesName();
					sizeBySeriesIndex = sizeBySeriesName != null ? seriesNameToIndex[sizeBySeriesName]
						: undefined;
					conditionSeriesIndices = [];
					conditions = colorScheme.getConditions().getConditions();
					for (var ci = 0, nconditions = conditions.length; ci < nconditions; ci++) {
						conditionSeriesIndices
						.push(seriesNameToIndex[conditions[ci].series]);
					}

				}
				var yoffset = 0;
				var cellRowSize = rowSize;
				if (sizeBySeriesIndex !== undefined) {
					var sizeByValue = dataset.getValue(row, column,
						sizeBySeriesIndex);
					if (!isNaN(sizeByValue)) {
						var f = sizer.valueToFraction(sizeByValue);
						var rowDiff = rowSize - rowSize * f;
						yoffset = rowDiff;
						cellRowSize -= rowDiff;
					}
				}
				if (conditions.length > 0) {
					var condition = null;
					for (var ci = 0, nconditions = conditions.length; ci < nconditions; ci++) {
						var cond = conditions[ci];
						var condValue = dataset.getValue(row, column,
							conditionSeriesIndices[ci]);

						if (!isNaN(condValue) && cond.accept(condValue)) {
							condition = cond;
							break;
						}

					}
					if (condition !== null) {
						context.fillRect(px, py + yoffset, columnSize,
							cellRowSize);
						// x and y are at center
						var x = px + cellRowSize / 2;
						var y = py + yoffset + columnSize / 2;
						context.fillStyle = condition.color;
						morpheus.CanvasUtil.drawShape(context, condition.shape,
							x, y, Math.min(columnSize, cellRowSize) / 4);
						context.fill();
					} else {
						context.fillRect(px, py + yoffset, columnSize,
							cellRowSize);
					}
				} else {
					context.fillRect(px, py + yoffset, columnSize, cellRowSize);
				}

				if (elementDrawCallback) {
					elementDrawCallback(context, dataset, row, column, px, py,
						columnSize, rowSize);
				}
			}
		}
		if (drawGrid) {
			context.strokeStyle = morpheus.HeatMapElementCanvas.GRID_COLOR;
			context.lineWidth = 0.1;
			for (var row = top; row < bottom; row++) {
				var rowSize = rowPositions.getItemSize(row);
				var py = rowPositions.getPosition(row);
				for (var column = left; column < right; column++) {
					var columnSize = columnPositions.getItemSize(column);
					var px = columnPositions.getPosition(column);
					var grid = drawGrid && columnSize > 10 && rowSize > 10;
					if (grid) {
						context.strokeRect(px, py, columnSize, rowSize);
					}
				}
			}

		}
		context.lineWidth = 1;

	}
};
morpheus.Util.extend(morpheus.HeatMapElementCanvas, morpheus.AbstractCanvas);

morpheus.HeatMapKeyListener = function (controller) {
	var keydown = function (e) {
		var tagName = e.target.tagName;
		var found = false;
		var commandKey = morpheus.Util.IS_MAC ? e.metaKey : e.ctrlKey;
		var altKey = e.altKey;
		var shiftKey = e.shiftKey;
		if (commandKey && shiftKey && e.which === 70) { // ctrl-shift-f
			controller.getToolbar().toggleMenu();
			found = true;
		}

		if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
			; // skip
		} else if (commandKey && e.which === 65) { // select all
			var active = controller.getActiveComponent();
			if (active !== -1) {
				found = true;
				var selectionModel = active === 0 ? controller.getProject()
				.getRowSelectionModel() : controller.getProject()
				.getColumnSelectionModel();
				var count = active === 0 ? controller.getProject()
				.getSortedFilteredDataset().getRowCount() : controller
				.getProject().getSortedFilteredDataset()
				.getColumnCount();
				var indices = new morpheus.Set();
				for (var i = 0; i < count; i++) {
					indices.add(i);
				}
				selectionModel.setViewIndices(indices, true);
				found = true;
			}
		} else if (e.which === 61 || e.which === 187 || e.which === 107) { // zoom
			// in
			controller.zoom(true);
			found = true;
		} else if (e.which === 173 || e.which === 189 || e.which === 109) { // zoom
			// out
			controller.zoom(false);
			found = true;
		} else if (e.which === 35) { // end
			controller.scrollLeft(controller.heatmap.getPreferredSize().width);
			controller.scrollTop(controller.heatmap.getPreferredSize().height);
			found = true;
		} else if (e.which === 36) { // home
			controller.scrollLeft(0);
			controller.scrollTop(0);
			found = true;
		} else if (e.which === 34) { // page down
			var pos = controller.scrollTop();
			controller.scrollTop(pos + controller.heatmap.getUnscaledHeight()
				- 2);
			found = true;
		} else if (e.which === 33) { // page up
			var pos = controller.scrollTop();
			controller.scrollTop(pos - controller.heatmap.getUnscaledHeight()
				+ 2);

			found = true;
		} else if (e.which === 38) { // up arrow
			if (commandKey) { // to top
				var active = controller.getActiveComponent();
				if (active !== -1) {
					controller.sortBasedOnSelection(morpheus.SortKey.SortOrder.ASCENDING,
						active !== 0, e && e.shiftKey);
				}

			} else {
				controller.scrollTop(controller.scrollTop() - 8);
			}
			found = true;
		} else if (e.which === 40) {// down arrow
			if (commandKey) { // to bottom
				// controller
				// .scrollTop(controller.heatmap.getPreferredSize().height);
				var active = controller.getActiveComponent();
				if (active !== -1) {
					controller.sortBasedOnSelection(morpheus.SortKey.SortOrder.DESCENDING,
						active !== 0, e && e.shiftKey);
				}
			} else {
				controller.scrollTop(controller.scrollTop() + 8);
			}
			found = true;
		} else if (e.which === 37) {// left arrow
			if (commandKey) { // to left
				controller.scrollLeft(0);
			} else {
				controller.scrollLeft(controller.scrollLeft() - 8);
			}
			found = true;
		} else if (e.which === 39) {// right arrow
			if (commandKey) { // to right
				controller
				.scrollLeft(controller.heatmap.getPreferredSize().width);
			} else {
				controller.scrollLeft(controller.scrollLeft() + 8);
			}
			found = true;
		} else if (commandKey) {
			if (e.which === 83) {
				if (shiftKey) {
					morpheus.HeatMap.showTool(new morpheus.SaveDatasetTool(),
						controller);
				} else {
					morpheus.HeatMap.showTool(new morpheus.SaveImageTool(),
						controller);
				}
				found = true;
			} else if (e.which === 79) {
				morpheus.HeatMap.showTool(new morpheus.OpenFileTool(),
					controller);
				found = true;
			} else if (e.which === 70) { // search columns or rows
				controller.getToolbarElement().find(
					e.shiftKey ? '[data-name=searchColumns]'
						: '[data-name=searchRows]').focus();
				found = true;
			} else if (e.which === 88) { // ctrl-X
				morpheus.HeatMap.showTool(new morpheus.NewHeatMapTool(),
					controller);
				found = true;
			}
		}
		if (found) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			return false;
		}
	};
	var $keyelement = controller.$content;
	$keyelement.on('keydown', keydown);
	$keyelement.on('dragover.morpheus dragenter.morpheus', function (e) {
		e.preventDefault();
		e.stopPropagation();
	}).on(
		'drop.morpheus',
		function (e) {
			if (e.originalEvent.dataTransfer
				&& e.originalEvent.dataTransfer.files.length) {
				e.preventDefault();
				e.stopPropagation();
				var files = e.originalEvent.dataTransfer.files;
				morpheus.HeatMap.showTool(new morpheus.OpenFileTool({
					file: files[0]
				}), controller);
			}
		});
	$keyelement.on('paste.morpheus',
		function (e) {
			var tagName = e.target.tagName;
			if (tagName == 'INPUT' || tagName == 'SELECT'
				|| tagName == 'TEXTAREA') {
				return;
			}
			var text = e.originalEvent.clipboardData.getData('text/plain');
			if (text != null && text.length > 0) {
				e.preventDefault();
				e.stopPropagation();
				var blob = new Blob([text]);
				var url = window.URL.createObjectURL(blob);
				morpheus.HeatMap.showTool(new morpheus.OpenFileTool({
					file: url
				}), controller);
			}
		});
	$keyelement.on('mousewheel', function (e) {
		var scrolly = e.deltaY * e.deltaFactor;
		var scrollx = e.deltaX * e.deltaFactor;
		if (e.altKey) {
			controller.zoom(scrolly > 0, {
				rows: true,
				columns: true
			});
		} else {
			if (scrolly !== 0) {
				controller.scrollTop(controller.scrollTop() - scrolly);
			}
			if (scrollx !== 0) {
				controller.scrollLeft(controller.scrollLeft() - scrollx);
			}
		}
		e.preventDefault();
		e.stopPropagation();
	});
};

morpheus.HeatMapOptions = function (controller) {
	var items = [
		{
			name: 'color_by',
			required: true,
			type: 'select',
			options: ['(None)'].concat(morpheus.MetadataUtil
			.getMetadataNames(controller.getProject()
			.getFullDataset().getRowMetadata())),
			value: controller.heatmap.getColorScheme()
			.getSeparateColorSchemeForRowMetadataField()
		}, {
			name: 'color_by_value',
			required: true,
			type: 'select',
			options: []
		}, {
			name: 'load_predefined_scheme',
			required: true,
			type: 'select',
			options: [{
				name: '',
				value: ''
			}, {
				name: 'relative',
				value: 'gene'
			}, {
				name: 'binary',
				value: 'binary'
			}, {
				name: 'MAF',
				value: 'MAF'
			}, {
				name: 'fixed (-1, -0.5, 0.5, 1)',
				value: 'wtcs'
			}, {
				name: 'fixed (-1.5, -0.1, 0.1, 1.5)',
				value: 'cn'
			}, {
				name: 'fixed (-100, -98, -95, 95, 98, 100)',
				value: '100scale2'
			}, {
				name: 'fixed (-100, -98, 98, 100)',
				value: '100scale1'
			}]
		}, {
			name: 'save_color_scheme',
			type: 'button'
		}, {
			name: 'load_color_scheme',
			type: 'file'
		}];
	if (controller.getProject().getFullDataset().getSeriesCount() > 1) {
		items.push({
			name: 'size_by',
			required: true,
			type: 'select',
			options: ['(None)'].concat(morpheus.DatasetUtil
			.getSeriesNames(controller.getProject().getFullDataset()))
		});
		items.push({
			name: 'size_by_minimum',
			title: 'Size by minimum',
			required: true,
			type: 'text',
			col: 'col-xs-4'
		});
		items.push({
			name: 'size_by_maximum',
			title: 'Size by maximum',
			required: true,
			type: 'text',
			col: 'col-xs-4'
		});

		items.push({
			name: 'conditional_rendering',
			required: true,
			type: 'button',
			col: 'col-xs-4'
		});
	}
	var displayItems = [
		{
			name: 'show_grid',
			required: true,
			type: 'checkbox',
			value: controller.heatmap.isDrawGrid()
		},
		{
			name: 'row_size',
			required: true,
			type: 'text',
			col: 'col-xs-4',
			value: morpheus.Util.nf(controller.heatmap.getRowPositions()
			.getSize())
		},
		{
			name: 'column_size',
			required: true,
			type: 'text',
			col: 'col-xs-4',
			value: morpheus.Util.nf(controller.heatmap
			.getColumnPositions().getSize())
		}];
	if (controller.rowDendrogram) {
		displayItems
		.push({
			name: 'row_dendrogram_line_thickness',
			required: true,
			type: 'text',
			col: 'col-xs-4',
			value: morpheus.Util
			.nf(controller.rowDendrogram ? controller.rowDendrogram.lineWidth
				: 1)
		});
	}
	if (controller.columnDendrogram) {
		displayItems
		.push({
			name: 'column_dendrogram_line_thickness',
			required: true,
			type: 'text',
			col: 'col-xs-4',
			value: morpheus.Util
			.nf(controller.columnDendrogram ? controller.columnDendrogram.lineWidth
				: 1)
		});
	}
	displayItems.push({
		name: 'info_window',
		required: true,
		type: 'select',
		col: 'col-xs-4',
		options: [{
			name: 'Fixed To Top',
			value: 0
		}, {
			name: 'New Window',
			value: 1
		}],
		value: controller.tooltipMode
	});

	displayItems.push({
		name: 'inline_tooltip',
		required: true,
		type: 'checkbox',
		value: controller.options.inlineTooltip
	});

	var colorSchemeFormBuilder = new morpheus.FormBuilder();
	_.each(items, function (item) {
		colorSchemeFormBuilder.append(item);
	});
	var displayFormBuilder = new morpheus.FormBuilder();
	_.each(displayItems, function (item) {
		displayFormBuilder.append(item);
	});
	var colorSchemeChooser = new morpheus.HeatMapColorSchemeChooser({
		showRelative: true
	});
	var updatingSizer = false;
	colorSchemeChooser.on('change', function () {
		if (controller.heatmap.getColorScheme().getSizer
			&& controller.heatmap.getColorScheme().getSizer() != null) {
			colorSchemeFormBuilder.setValue('size_by', controller.heatmap
			.getColorScheme().getSizer().getSeriesName());
			colorSchemeFormBuilder.setEnabled('size_by_minimum',
				controller.heatmap.getColorScheme().getSizer()
				.getSeriesName() != null);
			colorSchemeFormBuilder.setEnabled('size_by_maximum',
				controller.heatmap.getColorScheme().getSizer()
				.getSeriesName() != null);

			if (!updatingSizer) {
				colorSchemeFormBuilder.setValue('size_by_minimum',
					controller.heatmap.getColorScheme().getSizer().getMin());
				colorSchemeFormBuilder.setValue('size_by_maximum',
					controller.heatmap.getColorScheme().getSizer().getMax());
			}

		}
		// repaint the heat map when color scheme changes
		controller.heatmap.setInvalid(true);
		controller.heatmap.repaint();
		colorSchemeChooser.restoreCurrentValue();
	});
	function createMetadataField(isColumns) {
		var options = [];
		var value = {};
		_.each(controller.getVisibleTrackNames(isColumns), function (name) {
			value[name] = true;
		});
		_.each(morpheus.MetadataUtil.getMetadataNames(isColumns ? controller
			.getProject().getFullDataset().getColumnMetadata() : controller
			.getProject().getFullDataset().getRowMetadata()),
			function (name) {
				options.push(name);
			});
		var field = {
			type: 'bootstrap-select',
			search: options.length > 10,
			name: isColumns ? 'column_annotations' : 'row_annotations',
			multiple: true,
			value: value,
			options: options,
			toggle: true
		};

		return field;
	}

	var annotationsBuilder = new morpheus.FormBuilder();
	annotationsBuilder.append(createMetadataField(false));
	annotationsBuilder.append(createMetadataField(true));
	function annotationsListener($select, isColumns) {
		var names = [];
		_.each(controller.getVisibleTrackNames(isColumns), function (name) {
			names.push(name);
		});
		var values = $select.val();
		var selectedNow = _.difference(values, names);
		var unselectedNow = _.difference(names, values);
		var tracks = [];
		_.each(selectedNow, function (name) {
			tracks.push({
				name: name,
				isColumns: isColumns,
				visible: true
			});
		});
		_.each(unselectedNow, function (name) {
			tracks.push({
				name: name,
				isColumns: isColumns,
				visible: false
			});
		});
		controller.setTrackVisibility(tracks);
		colorSchemeChooser.restoreCurrentValue();
	}

	var $ca = annotationsBuilder.$form.find('[name=column_annotations]');
	$ca.on('change', function (e) {
		annotationsListener($(this), true);
	});
	var $ra = annotationsBuilder.$form.find('[name=row_annotations]');
	$ra.on('change', function (e) {
		annotationsListener($(this), false);
	});
	var annotationOptionsTabId = _.uniqueId('morpheus');
	var heatMapOptionsTabId = _.uniqueId('morpheus');
	var displayOptionsTabId = _.uniqueId('morpheus');

	var $metadataDiv = $('<div class="tab-pane" id="' + annotationOptionsTabId
		+ '"></div>');
	$metadataDiv.append($(annotationsBuilder.$form));
	var $heatMapDiv = $('<div class="tab-pane active" id="'
		+ heatMapOptionsTabId + '"></div>');
	$heatMapDiv.append(colorSchemeChooser.$div);
	$heatMapDiv.append($(colorSchemeFormBuilder.$form));
	var $displayDiv = $('<div class="tab-pane" id="' + displayOptionsTabId
		+ '"></div>');
	$displayDiv.append($(displayFormBuilder.$form));
	displayFormBuilder.$form.find('[name=show_grid]').on('click', function (e) {
		var grid = $(this).prop('checked');
		controller.heatmap.setDrawGrid(grid);
		controller.revalidate();
		colorSchemeChooser.restoreCurrentValue();
	});
	displayFormBuilder.$form.find('[name=inline_tooltip]').on('click',
		function (e) {
			controller.options.inlineTooltip = $(this).prop('checked');
		});
	displayFormBuilder.$form.find('[name=row_size]').on(
		'keyup',
		_.debounce(function (e) {
			controller.heatmap.getRowPositions().setSize(
				parseFloat($(this).val()));
			controller.revalidate();
			colorSchemeChooser.restoreCurrentValue();

		}, 100));
	displayFormBuilder.$form.find('[name=info_window]').on('change',
		function (e) {
			controller.setTooltipMode(parseInt($(this).val()));
		});

	var $colorByValue = colorSchemeFormBuilder.$form
	.find('[name=color_by_value]');
	var separateSchemesField = controller.heatmap.getColorScheme()
	.getSeparateColorSchemeForRowMetadataField();
	if (separateSchemesField != null) {
		$colorByValue.html(morpheus.Util.createOptions(morpheus.VectorUtil
		.createValueToIndexMap(
			controller.project.getFullDataset().getRowMetadata()
			.getByName(separateSchemesField)).keys()));
	}

	colorSchemeChooser.setColorScheme(controller.heatmap.getColorScheme());
	if (separateSchemesField != null) {
		colorSchemeChooser.setCurrentValue($colorByValue.val());
	}
	if (controller.heatmap.getColorScheme().getSizer
		&& controller.heatmap.getColorScheme().getSizer() != null
		&& controller.heatmap.getColorScheme().getSizer().getSeriesName()) {
		colorSchemeFormBuilder.setValue('size_by', controller.heatmap
		.getColorScheme().getSizer().getSeriesName());
	}
	colorSchemeFormBuilder.$form.find('[name=size_by]')
	.on(
		'change',
		function (e) {
			var series = $(this).val();
			if (series == '(None)') {
				series = null;
			}
			colorSchemeChooser.colorScheme.getSizer()
			.setSeriesName(series);
			colorSchemeChooser.fireChanged();
		});
	colorSchemeFormBuilder.$form.find('[name=size_by_minimum]').on(
		'keyup',
		_.debounce(function (e) {
			updatingSizer = true;
			colorSchemeChooser.colorScheme.getSizer().setMax(
				parseFloat($(this).val()));
			colorSchemeChooser.fireChanged(true);
			updatingSizer = false;
		}, 100));
	colorSchemeFormBuilder.$form.find('[name=size_by_maximum]').on(
		'keyup',
		_.debounce(function (e) {
			updatingSizer = true;
			colorSchemeChooser.colorScheme.getSizer().setMax(
				parseFloat($(this).val()));
			colorSchemeChooser.fireChanged(true);
			updatingSizer = false;
		}, 100));
	colorSchemeFormBuilder.$form
	.find('[name=conditional_rendering]')
	.on(
		'click',
		function (e) {
			e.preventDefault();
			var conditionalRenderingUI = new morpheus.ConditionalRenderingUI(
				controller);
			morpheus.FormBuilder.showInModal({
				title: 'Conditional Rendering',
				html: conditionalRenderingUI.$div,
				close: 'Close',
				z: 1051,
				callback: function () {

				}
			});
		});

	colorSchemeFormBuilder.find('save_color_scheme').on('click', function (e) {
		e.preventDefault();
		var blob = new Blob([controller.heatmap.getColorScheme().toJson()], {
			type: 'application/json'
		});
		saveAs(blob, 'color_scheme.json');
	});
	colorSchemeFormBuilder.on('change', function (e) {
		if (e.name === 'load_color_scheme') {
			if (e.value !== '' && e.value != null) {
				morpheus.Util.getText(e.value).done(
					function (text) {
						var json = JSON.parse($.trim(text));
						controller.heatmap.getColorScheme().fromJson(json);
						colorSchemeChooser
						.setColorScheme(controller.heatmap
						.getColorScheme());
						controller.heatmap.setInvalid(true);
						controller.heatmap.repaint();

					}).fail(function () {
					morpheus.FormBuilder.showInModal({
						title: 'Error',
						html: 'Unable to read saved color scheme.'
					});
				});

			}
		}
	});

	colorSchemeFormBuilder.$form
	.on(
		'change',
		'[name=load_predefined_scheme]',
		function (e) {
			var val = $(this).val();
			if (val !== '') {
				if (val === 'gene') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.RELATIVE()));
				} else if (val === 'cn') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.CN()));
				} else if (val === 'wtcs') {
					controller.heatmap.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier({
							type: 'fixed',
							map: [{
								value: -1,
								color: 'blue'
							}, {
								value: -0.5,
								color: 'white'
							}, {
								value: 0.5,
								color: 'white'
							}, {
								value: 1,
								color: 'red'
							}]
						}));
				} else if (val === 'MAF') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.MAF()));
				} else if (val === 'binary') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.BINARY()));
				} else if (val === '100scale1') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.SUMMLY()));

				} else if (val === '100scale2') {
					controller.heatmap
					.getColorScheme()
					.setColorSupplierForCurrentValue(
						morpheus.HeatMapColorScheme
						.createColorSupplier(morpheus.HeatMapColorScheme.Predefined
						.SUMMLY2()));

				} else {
					console.log('not found');
				}
				colorSchemeChooser
				.setColorScheme(controller.heatmap
				.getColorScheme());
				controller.heatmap.setInvalid(true);
				controller.heatmap.repaint();
				$(this).val('');
			} else {
				console.log('empty option selected');
			}
			colorSchemeChooser.restoreCurrentValue();
		});
	colorSchemeFormBuilder.$form
	.find('[name=color_by]')
	.on(
		'change',
		function (e) {
			var colorByField = $(this).val();
			if (colorByField == '(None)') {
				colorByField = null;
			}
			controller.heatmap.getColorScheme()
			.setSeparateColorSchemeForRowMetadataField(
				colorByField);
			if (colorByField != null) {
				$colorByValue
				.html(morpheus.Util
				.createOptions(morpheus.VectorUtil
				.createValueToIndexMap(
					controller.project
					.getFullDataset()
					.getRowMetadata()
					.getByName(
						colorByField))
				.keys()));
			}
			var colorByValue = $colorByValue.val();
			controller.heatmap.getColorScheme().setCurrentValue(
				colorByValue);
			colorSchemeChooser.setCurrentValue(colorByValue);
			controller.heatmap.setInvalid(true);
			controller.heatmap.repaint();
			colorSchemeChooser.setColorScheme(controller.heatmap
			.getColorScheme());
		});
	$colorByValue.on('change', function (e) {
		if (controller.heatmap.getColorScheme()
			.getSeparateColorSchemeForRowMetadataField() == null) {
			colorSchemeChooser.setCurrentValue(null);
			controller.heatmap.getColorScheme().setCurrentValue(null);
			colorSchemeChooser.setColorScheme(controller.heatmap
			.getColorScheme());
		} else {
			colorSchemeChooser.setCurrentValue($colorByValue.val());
			colorSchemeChooser.setColorScheme(controller.heatmap
			.getColorScheme());
		}
	});
	displayFormBuilder.$form.find('[name=column_size]').on(
		'keyup',
		_.debounce(function (e) {
			controller.heatmap.getColumnPositions().setSize(
				parseFloat($(this).val()));
			controller.revalidate();
			colorSchemeChooser.restoreCurrentValue();

		}, 100));
	displayFormBuilder.$form.find('[name=gap_size]').on('keyup',
		_.debounce(function (e) {
			controller.gapSize = parseFloat($(this).val());
			controller.revalidate();
			colorSchemeChooser.restoreCurrentValue();
		}, 100));
	displayFormBuilder.$form.find('[name=squish_factor]').on('keyup',
		_.debounce(function (e) {
			var f = parseFloat($(this).val());
			controller.heatmap.getColumnPositions().setSquishFactor(f);
			controller.heatmap.getRowPositions().setSquishFactor(f);
			controller.revalidate();
			colorSchemeChooser.restoreCurrentValue();
		}, 100));
	displayFormBuilder.$form.find('[name=row_dendrogram_line_thickness]').on(
		'keyup', _.debounce(function (e) {
			controller.rowDendrogram.lineWidth = parseFloat($(this).val());
			controller.revalidate();
			colorSchemeChooser.restoreCurrentValue();

		}, 100));
	displayFormBuilder.$form.find('[name=column_dendrogram_line_thickness]')
	.on(
		'keyup',
		_.debounce(function (e) {
			controller.columnDendrogram.lineWidth = parseFloat($(
				this).val());
			controller.revalidate();
			colorSchemeChooser.restoreCurrentValue();
		}, 100));
	var $tab = $('<div class="tab-content"></div>');
	$metadataDiv.appendTo($tab);
	$heatMapDiv.appendTo($tab);
	$displayDiv.appendTo($tab);
	var $div = $('<div></div>');
	var $ul = $('<ul class="nav nav-tabs" role="tablist">' + '<li><a href="#'
		+ annotationOptionsTabId
		+ '" role="tab" data-toggle="tab">Annotations</a></li>'
		+ '<li><a href="#' + heatMapOptionsTabId
		+ '" role="tab" data-toggle="tab">Color Scheme</a></li>'
		+ '<li><a href="#' + displayOptionsTabId
		+ '" role="tab" data-toggle="tab">Display</a></li>' + '</ul>');
	$ul.appendTo($div);
	$tab.appendTo($div);
	$ul.find('[role=tab]:eq(1)').tab('show');
	morpheus.FormBuilder.showInModal({
		title: 'Options',
		html: $div,
		close: 'Close',
		callback: function () {
			$div.find('input').off('keyup');
			$ca.off('change');
			$ra.off('change');
			$div.remove();
			colorSchemeChooser.dispose();
		}
	});
};

morpheus.HeatMapToolBar = function (controller) {
	this.controller = controller;
	this.rowSearchResultModelIndices = [];
	this.columnSearchResultModelIndices = [];
	var _this = this;
	var $el = $('<div style="white-space:nowrap;" class="hidden-print container-fluid">'
		+ '<div class="row"><div class="col-xs-12"><div data-name="lineOneColumn"></div></div></div>'
		+ '<div class="row"><div class="col-xs-12"><div data-name="lineTwoColumn" style="border-bottom: 1px solid #e7e7e7;margin-bottom:10px;"></div></div></div>'
		+ '</div>');
	var searchHtml = [];
	var $search = $('<form name="searchForm" class="form form-inline form-compact" role="search"></form>');
	$search.on('submit', function (e) {
		e.preventDefault();
	});
	// search rows
	if (controller.options.toolbar.searchRows) {
		searchHtml.push('<div class="form-group">');
		searchHtml.push('<div class="input-group">');
		searchHtml.push('<div class="input-group-btn">');
		searchHtml
		.push('<button type="button" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span data-toggle="tooltip" title="Search rows. Quote search term for exact match. Narrow search with field: modifier. Exclude matches using - modifier. Use min..max to perform a range search.">Rows</span> <span class="caret"></span></button>');
		searchHtml.push('<ul data-name="rowSearchOptions" class="dropdown-menu">');
		searchHtml.push('<li><a data-name="exact" href="#">Exact Match</a></li>');
		searchHtml
		.push('<li class="active"><a data-name="contains" href="#">Contains</a></li>');
		searchHtml.push('</ul>');
		searchHtml.push('</div>'); // input-group-btn
		searchHtml
		.push('<input type="text" style="border-top:3px solid rgb(127,127,127);width:240px;padding-right:25px;" class="form-control input-sm" autocomplete="off" name="searchRows">');
		searchHtml.push('</div>');
		searchHtml.push('</div>');
		searchHtml.push('<div class="form-group">');
		searchHtml.push('<span data-name="rowSearchDiv" style="display:none;">');
		searchHtml
		.push('<span data-name="searchResultsRows"></span>');
		searchHtml
		.push('<button name="previousRowMatch" type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="Previous"><i class="fa fa-chevron-up"></i></button>');
		searchHtml
		.push('<button name="nextRowMatch" type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="Next"><i class="fa fa-chevron-down"></i></button>');
		searchHtml
		.push('<button name="rowMatchesToTop" type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="Matches To Top"><i class="fa fa-level-up"></i></button>');
		searchHtml.push('</span>');
		searchHtml.push('</div>');

	}
	if (controller.options.toolbar.searchColumns) {
		searchHtml
		.push('<div class="form-group" style="margin-right:10px;"></div>'); // spacer
		// search columns
		searchHtml.push('<div class="form-group">');
		searchHtml.push('<div class="input-group">'); // group
		searchHtml.push('<div class="input-group-btn">');
		searchHtml
		.push('<button type="button" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span data-toggle="tooltip" title="Search columns. Quote search term for exact match. Narrow search with field: modifier. Exclude matches using - modifier. Use min..max to perform a range search.">Columns</span> <span class="caret"></span></button>');
		searchHtml
		.push('<ul data-name="columnSearchOptions" class="dropdown-menu">');
		searchHtml.push('<li><a data-name="exact" href="#">Exact Match</a></li>');
		searchHtml
		.push('<li class="active"><a data-name="contains" href="#">Contains</a></li>');
		searchHtml.push('</ul>');
		searchHtml.push('</div>'); // input-group-btn

		searchHtml
		.push('<input type="text" style="border-right:4px solid rgb(127,127,127);width:240px;padding-right:25px;" class="form-control input-sm" autocomplete="off" name="searchColumns"></div>');
		searchHtml.push('</div>');
		searchHtml.push('</div>');
		searchHtml.push('<div class="form-group" style="margin-left:4px;">');
		searchHtml
		.push('<span data-name="searchResultsColumns"></span>');
		searchHtml.push('<span data-name="columnSearchDiv" style="display:none;">');
		searchHtml
		.push('<button name="previousColumnMatch" type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="Previous"><i class="fa fa-chevron-up"></i></button>');
		searchHtml
		.push('<button name="nextColumnMatch" type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="Next"><i class="fa fa-chevron-down"></i></button>');
		searchHtml
		.push('<button name="columnMatchesToTop" type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="Matches To Top"><i class="fa fa-level-up"></i></button>');
		searchHtml.push('</span>');
		searchHtml.push('</div>');
	}

	// search values
	searchHtml
	.push('<div data-name="searchValuesDiv" class="form-group" style="margin-left:10px;">');
	searchHtml
	.push('<div class="input-group"><span class="input-group-addon">Values</span><input type="text" style="width:240px;padding-right:25px;" class="form-control input-sm" autocomplete="off" name="searchValues"></div>');
	searchHtml.push('</div>');
	searchHtml.push('<div class="form-group" style="margin-left:4px;">');
	searchHtml
	.push('<h6 data-name="searchResultsValues" style="display: inline;"></h6>');
	searchHtml.push('</div>');

	// row dendrogram
	searchHtml
	.push('<div style="display: none;  margin-left:10px;" data-name="searchRowDendrogramWrapper"' +
		' class="form-group">');
	searchHtml
	.push('<div class="input-group"><span class="input-group-addon">Row Dendrogram</span><input type="text" style="width:240px;" class="form-control input-sm" autocomplete="off" name="searchRowDendrogram"></div>');
	searchHtml
	.push('<h6 data-name="searchResultsRowDendrogram" style="display: inline;"></h6>');
	searchHtml.push('</div>');
	// column dendrogram
	searchHtml
	.push('<div style="display: none; margin-left:10px;"' +
		' data-name="searchColumnDendrogramWrapper" class="form-group">');
	searchHtml
	.push('<div class="input-group"><span class="input-group-addon">Column Dendrogram</span><input type="text" style="width:240px;" class="form-control input-sm" autocomplete="off" name="searchColumnDendrogram"></div>');
	searchHtml
	.push('<h6 data-name="searchResultsColumnDendrogram" style="display: inline;"></h6>');
	searchHtml.push('</div>');
	// dimensions
	searchHtml.push('<div class="form-group">');
	searchHtml
	.push('<h6 style="display: inline; margin-left:10px;" data-name="dim"></h6>');
	searchHtml
	.push('<h6 style="display: inline; margin-left:10px; background-color:rgb(182,213,253);"' +
		' data-name="selection"></h6>');
	searchHtml.push('</div>');
	searchHtml.push('<div data-name="buttons" style="margin-left:10px;" class="form-group"></div>');

	$(searchHtml.join('')).appendTo($search);
	if (!controller.options.toolbar.searchValues) {
		$search.find('[data-name=searchValuesDiv]').css('display', 'none');
	}
	var $buttons = $search.find('[data-name=buttons]');

	var $tools = $('<form name="tools" class="form-inline" role="form"></form>');
	$tools.on('submit', function (e) {
		e.preventDefault();
	});

	var toolbarHtml = [];
	// zoom
	if (controller.options.toolbar.zoom) {
		toolbarHtml
		.push('<button type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="Zoom Out (-)" name="out"><span class="fa fa-minus"></span></button>');
		toolbarHtml
		.push('<button type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="Zoom In (+)" name="in"><span class="fa fa-plus"></span></button>');
		toolbarHtml
		.push('<button type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="Fit To Window" name="fit"><span class="fa fa-compress"></span></button>');
		toolbarHtml
		.push('<button type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="Reset Zoom" name="resetZoom">100%</button>');
	}




	toolbarHtml.push('<div class="morpheus-button-divider"></div>');
	if (controller.options.toolbar.sort) {
		toolbarHtml
		.push('<button data-toggle="tooltip" title="Sort" name="sort" type="button" class="btn btn-default btn-xs"><span class="fa fa-sort-alpha-asc"></span></button>');
	}
	if (controller.options.toolbar.options) {
		toolbarHtml
		.push('<button name="options" data-toggle="tooltip" title="Options" type="button" class="btn btn-default btn-xs"><span class="fa fa-cog"></span></button>');

	}

	toolbarHtml.push('<div class="morpheus-button-divider"></div>');
	if (controller.options.toolbar.saveImage) {
		toolbarHtml
		.push('<button name="saveImage" data-toggle="tooltip" title="Save Image ('
			+ morpheus.Util.COMMAND_KEY
			+ 'S)" type="button" class="btn btn-default btn-xs"><span class="fa fa-file-image-o"></span></button>');
	}
	if (controller.options.toolbar.saveDataset) {
		toolbarHtml
		.push('<button name="saveDataset" data-toggle="tooltip" title="Save Dataset ('
			+ morpheus.Util.COMMAND_KEY
			+ 'Shift+S)" type="button" class="btn btn-default btn-xs"><span class="fa fa-floppy-o"></span></button>');
	}
	if (controller.options.toolbar.openFile) {
		toolbarHtml
		.push('<button name="openFile" data-toggle="tooltip" title="Open File ('
			+ morpheus.Util.COMMAND_KEY
			+ 'O)" type="button" class="btn btn-default btn-xs"><span class="fa fa-folder-open-o"></span></button>');
	}
	toolbarHtml.push('<div class="morpheus-button-divider"></div>');
	if (controller.options.toolbar.filter) {
		toolbarHtml
		.push('<button name="filterButton" data-toggle="tooltip" title="Filter" type="button" class="btn btn-default btn-xs"><span class="fa fa-filter"></span></button>');
	}
	if (typeof Plotly !== 'undefined') {
		toolbarHtml
		.push('<button name="chart" data-toggle="tooltip" title="Chart" type="button" class="btn btn-default btn-xs"><span class="fa fa-line-chart"></span></button>');

	}
	var tools = [{
		tool: new morpheus.HClusterTool()
	}, {
		tool: new morpheus.MarkerSelection()
	}, {
		tool: new morpheus.NearestNeighbors()
	}, {
		tool: new morpheus.NewHeatMapTool(),
	}, null, {
		tool: new morpheus.AdjustDataTool()
	}, {
		tool: new morpheus.CollapseDatasetTool()
	}, {
		tool: new morpheus.CreateAnnotation()
	}, {
		tool: new morpheus.SimilarityMatrixTool()
	}, {
		tool: new morpheus.TransposeTool()
	}, {
		tool: new morpheus.WordCloudTool()
	}]; // DevAPI, {
	this.getToolByName = function (name) {
		for (var i = 0; i < tools.length; i++) {
			if (tools[i] && tools[i].tool.toString
				&& tools[i].tool.toString() === name) {
				return tools[i].tool;
			}
		}
		throw name + ' not found';
	};
	if (controller.options.toolbar.tools) {
		toolbarHtml.push('<div class="btn-group">');
		toolbarHtml
		.push('<button type="button" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown"><span title="Tools" data-toggle="tooltip" class="fa fa-wrench"></span> <span class="caret"></span></button>');
		toolbarHtml.push('<ul data-name="tools" class="dropdown-menu" role="menu">');

		for (var i = 0; i < tools.length; i++) {
			if (tools[i] == null) {
				toolbarHtml
				.push('<li role="presentation" class="divider"></li>');
			} else if (tools[i].action) {
				toolbarHtml.push('<li><a data-name="' + i + '" href="#">'
					+ tools[i].name + '</a></li>');
			} else {
				toolbarHtml.push('<li><a data-name="' + i + '" href="#">'
					+ tools[i].tool.toString() + '</a></li>');
			}
		}
		toolbarHtml.push('</ul></div>');
	}

	toolbarHtml.push('<div class="morpheus-button-divider"></div>');
	// legend
	if (controller.options.toolbar.colorKey) {
		toolbarHtml.push('<div class="btn-group">');
		toolbarHtml
		.push('<button type="button" class="btn btn-default btn-xs" data-toggle="dropdown"><span title="Color Key" data-toggle="tooltip" class="fa fa-key"></span></button>');
		toolbarHtml.push('<ul data-name="key" class="dropdown-menu" role="menu">');
		toolbarHtml.push('<li data-name="keyContent"></li>');
		toolbarHtml.push('</ul>');
		toolbarHtml.push('</div>');
	}

	toolbarHtml.push('<div class="morpheus-button-divider"></div>');

	toolbarHtml.push('<button type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="PCAPlot" name="pca">PCA</button>');
	toolbarHtml.push('<div class="morpheus-button-divider"></div>');/*
	toolbarHtml.push('<button type="button" class="btn btn-default btn-xs" data-toggle="tooltip" title="create ExpressionSet" name="es">ES</button>');
*/

	$buttons.on('click', '[name=pca]', function () {
		console.log("test button clicked");
		new morpheus.PcaPlotTool({project : controller.getProject()});

	});

	/*$buttons.on('click', '[name=es]', function () {
		console.log("es button clicked");
		var session = controller.getProject().getFullDataset().getESSession();
	});*/


	var $lineOneColumn = $el.find('[data-name=lineOneColumn]');
	$search.appendTo($lineOneColumn);
	var $toolbarForm = $(toolbarHtml.join(''));
	$toolbarForm.appendTo($buttons);
	if (controller.options.$help) {
		controller.options.$help.appendTo($buttons);
	}
	$('<div data-name="tip" style="height: 14px; font-size: 12px;overflow:hidden;"></div>').appendTo($el.find('[data-name=lineTwoColumn]'));

	// $hide.appendTo($el.find('[data-name=toggleEl]'));
	$el.prependTo(controller.$content);
	var $tools = $el.find('[data-name=tools]');
	this.$tip = $el.find('[data-name=tip]');
	$tools.on('click', 'li > a', function (e) {
		e.preventDefault();
		var index = parseInt($(this).attr('data-name'));
		if (tools[index].tool) {
			morpheus.HeatMap.showTool(tools[index].tool, controller);
		} else {
			tools[index].action();
		}
	});
	this.defaultRowMatchMode = 'contains';
	this.defaultColumnMatchMode = 'contains';
	var $rowSearchOptions = $el.find('[data-name=rowSearchOptions]');
	$rowSearchOptions.on('click', 'li > a', function (e) {
		e.preventDefault();
		_this.defaultRowMatchMode = $(this).attr('data-name');
		$rowSearchOptions.find('li').removeClass('active');
		$(this).parent('li').addClass('active');
		_this.search(true);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'rowSearchMatchMode'
		});
	});
	var $columnSearchOptions = $el.find('[data-name=columnSearchOptions]');
	$columnSearchOptions.on('click', 'li > a', function (e) {
		e.preventDefault();
		_this.defaultColumnMatchMode = $(this).attr('data-name');
		$columnSearchOptions.find('li').removeClass('active');
		$(this).parent('li').addClass('active');
		_this.search(false);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'columnSearchMatchMode'
		});
	});

	var filterModal = [];
	var filterLabelId = _.uniqueId('morpheus');
	filterModal
	.push('<div class="modal fade" tabindex="1" role="dialog" aria-labelledby="'
		+ filterLabelId + '">');
	filterModal.push('<div class="modal-dialog" role="document">');
	filterModal.push('<div class="modal-content">');
	filterModal.push('<div class="modal-header">');
	filterModal
	.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
	filterModal.push('<h4 class="modal-title" id="' + filterLabelId
		+ '">Filter</h4>');
	filterModal.push('</div>');
	filterModal.push('<div class="modal-body">');
	filterModal.push('');
	filterModal.push('</div>');
	filterModal.push('</div>');
	filterModal.push('</div>');
	filterModal.push('</div>');
	var $filterModal = $(filterModal.join(''));
	$filterModal.on('mousewheel', function (e) {
		e.stopPropagation();
	});
	var $filter = $('<div></div>');
	$filter.appendTo($filterModal.find('.modal-body'));
	$filterModal.appendTo($el);
	var filterHtml = [];
	filterHtml
	.push('<div class="radio"><label><input type="radio" name="rowsOrColumns" value="rows" checked>Rows</label></div> ');
	filterHtml
	.push('<div class="radio"><label><input type="radio" name="rowsOrColumns" value="columns">Columns</label></div>');

	var $filterChooser = $(filterHtml.join(''));
	$filterChooser.appendTo($filter);
	var columnFilterUI = new morpheus.FilterUI(controller.getProject(), true);
	var rowFilterUI = new morpheus.FilterUI(controller.getProject(), false);
	controller.getProject().getRowFilter().on('focus', function (e) {
		$filterChooser.find('[value=rows]').prop('checked', true);
		columnFilterUI.$div.hide();
		rowFilterUI.$div.show();
		$filterModal.modal('show');
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'rowFilter'
		});

	});
	controller.getProject().getColumnFilter().on('focus', function (e) {
		$filterChooser.find('[value=columns]').prop('checked', true);
		columnFilterUI.$div.show();
		rowFilterUI.$div.hide();
		$filterModal.modal('show');
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'columnFilter'
		});
	});
	rowFilterUI.$div.appendTo($filter);
	columnFilterUI.$div.appendTo($filter);
	columnFilterUI.$div.css('display', 'none');
	var $filterRadio = $filterChooser.find('[name=rowsOrColumns]');
	$filterRadio.on('change', function (e) {
		var val = $filterRadio.filter(':checked').val();
		if (val === 'columns') {
			columnFilterUI.$div.show();
			rowFilterUI.$div.hide();
		} else {
			columnFilterUI.$div.hide();
			rowFilterUI.$div.show();
		}
		e.preventDefault();
	});
	$el.find('[name=filterButton]').on('click', function () {
		$filterModal.modal('show');
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'filter'
		});
	});
	$el.find('[data-toggle="tooltip"]').tooltip({
		placement: 'bottom',
		container: 'body',
		trigger: 'hover'
	}).on('click', function () {
		$(this).tooltip('hide');
	});
	var $key = $el.find('[data-name=key]');
	var $keyContent = $el.find('[data-name=keyContent]');
	$key.dropdown().parent().on('show.bs.dropdown', function () {
		new morpheus.HeatMapColorSchemeLegend(controller, $keyContent);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'colorKey'
		});
	});
	$el.find('[name=openFile]').on('click', function () {
		morpheus.HeatMap.showTool(new morpheus.OpenFileTool({
			customUrls: controller._customUrls
		}), controller);
	});
	$el.find('[name=saveImage]').on('click', function () {
		morpheus.HeatMap.showTool(new morpheus.SaveImageTool(), controller);
	});
	$el.find('[name=saveDataset]').on('click', function () {
		morpheus.HeatMap.showTool(new morpheus.SaveDatasetTool(), controller);
	});
	$el.find('[name=chart]').on(
		'click',
		function () {
			new morpheus.ChartTool({
				project: controller.getProject(),
				getVisibleTrackNames: _.bind(
					controller.getVisibleTrackNames, controller)
			});
			morpheus.Util.trackEvent({
				eventCategory: 'ToolBar',
				eventAction: 'chart'
			});
		});

	var _this = this;
	$el
	.find('[name=tutorial]')
	.on(
		'click',
		function () {
			window
			.open('http://www.broadinstitute.org/cancer/software/morpheus/tutorial.html');
			morpheus.Util.trackEvent({
				eventCategory: 'ToolBar',
				eventAction: 'tutorial'
			});
		});

	this.$previousColumnMatch = $el.find('[name=previousColumnMatch]');
	this.$nextColumnMatch = $el.find('[name=nextColumnMatch]');
	this.$previousRowMatch = $el.find('[name=previousRowMatch]');
	this.$nextRowMatch = $el.find('[name=nextRowMatch]');
	this.$dimensionsLabel = $el.find('[data-name=dim]');
	this.$columnTextField = $el.find('[name=searchColumns]');
	this.$valueTextField = $el.find('[name=searchValues]');
	this.$selectionLabel = $el.find('[data-name=selection]');
	this.$rowTextField = $el.find('[name=searchRows]');
	this.$columnMatchesToTop = $el.find('[name=columnMatchesToTop]');
	this.$rowMatchesToTop = $el.find('[name=rowMatchesToTop]');
	this.$rowSearchDiv = $el.find('[data-name=rowSearchDiv]');
	this.$columnSearchDiv = $el.find('[data-name=columnSearchDiv]');
	this.$searchRowDendrogramWrapper = $el
	.find('[data-name=searchRowDendrogramWrapper]');
	this.$searchRowDendrogram = $el.find('[name=searchRowDendrogram]');
	this.$searchResultsRowDendrogram = $el
	.find('[data-name=searchResultsRowDendrogram]');
	this.$searchColumnDendrogramWrapper = $el
	.find('[data-name=searchColumnDendrogramWrapper]');
	this.$searchColumnDendrogram = $el.find('[name=searchColumnDendrogram]');
	this.$searchResultsColumnDendrogram = $el
	.find('[data-name=searchResultsColumnDendrogram]');
	controller.on('dendrogramAnnotated', function (e) {
		(e.isColumns ? _this.$searchColumnDendrogramWrapper
			: _this.$searchRowDendrogramWrapper).show();
	});
	controller.on('dendrogramChanged', function (e) {
		(e.isColumns ? _this.$searchColumnDendrogramWrapper
			: _this.$searchRowDendrogramWrapper).hide();
	});
	var project = controller.getProject();

	morpheus.Util.autosuggest({
		$el: this.$rowTextField,
		filter: function (terms, cb) {
			var indices = [];
			var meta = project.getSortedFilteredDataset().getRowMetadata();
			controller.getVisibleTrackNames(false).forEach(function (name) {
				indices.push(morpheus.MetadataUtil.indexOf(meta, name));
			});
			meta = new morpheus.MetadataModelColumnView(meta, indices);
			morpheus.MetadataUtil.autocomplete(meta)(terms, cb);
		},
		select: function () {
			_this.search(true);
		}
	});

	this.$rowTextField.on('keyup', _.debounce(function (e) {
		if (e.which === 13) {
			e.preventDefault();
		}
		_this.search(true);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'searchRows'
		});
	}, 500));
	morpheus.Util.autosuggest({
		$el: this.$columnTextField,
		filter: function (terms, cb) {
			var indices = [];
			var meta = project.getSortedFilteredDataset().getColumnMetadata();
			controller.getVisibleTrackNames(true).forEach(function (name) {
				indices.push(morpheus.MetadataUtil.indexOf(meta, name));
			});
			meta = new morpheus.MetadataModelColumnView(meta, indices);
			morpheus.MetadataUtil.autocomplete(meta)(terms, cb);
		},
		select: function () {
			_this.search(false);
		}
	});
	this.$columnTextField.on('keyup', _.debounce(function (e) {
		if (e.which === 13) {
			e.preventDefault();
		}
		_this.search(false);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'searchColumns'
		});
	}, 500));

	// TODO combine search with autocomplete
	this.$searchRowDendrogram.on('keyup', _.debounce(function (e) {
		if (e.which === 13) {
			// _this.$searchRowDendrogram.autocomplete('close');
			e.preventDefault();
		}
		_this.searchDendrogram(false);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'searchRowDendrogram'
		});
	}, 500));
	this.$searchColumnDendrogram.on('keyup', _.debounce(function (e) {
		if (e.which === 13) {
			// _this.$searchColumnDendrogram.autocomplete('close');
			e.preventDefault();
		}
		_this.searchDendrogram(true);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'searchColumnDendrogram'
		});
	}, 500));

	function searchValues() {
		var $searchResultsLabel = _this.$el.find('[data-name=searchResultsValues]');
		var text = $.trim(_this.$valueTextField.val());
		if (text === '') {
			$searchResultsLabel.html('');
			project.getElementSelectionModel().setViewIndices(null);
		} else {
			var viewIndices = new morpheus.Set();
			morpheus.DatasetUtil.searchValues(project
			.getSortedFilteredDataset(), text, function (value, i, j) {
				viewIndices.add(new morpheus.Identifier([i, j]));
			});
			project.getElementSelectionModel().setViewIndices(viewIndices);
			$searchResultsLabel.html(viewIndices.size() + ' match'
				+ (viewIndices.size() === 1 ? '' : 'es'));
		}
	}

	morpheus.Util.autosuggest({
		$el: this.$valueTextField,
		filter: function (terms, cb) {
			morpheus.DatasetUtil.autocompleteValues(
				project.getSortedFilteredDataset())(terms, cb);
		},
		select: function () {
			searchValues();
		}
	});

	this.$valueTextField.on('keyup', _.debounce(function (e) {
		if (e.which === 13) {
			_this.$valueTextField.autocomplete('close');
			e.preventDefault();
		}
		searchValues();
	}, 500));

	$toolbarForm.on('submit', function (e) {
		e.preventDefault();
	});
	$buttons.on('click', '[name=in]', function (e) {
		e.preventDefault();
		controller.zoom(true);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'zoomIn'
		});
	});
	$buttons.on('click', '[name=out]', function (e) {
		e.preventDefault();
		controller.zoom(false);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'zoomOut'
		});
	});
	$buttons.on('click', '[name=options]', function (e) {
		e.preventDefault();
		controller.showOptions();
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'options'
		});
	});
	$buttons.on('click', '[name=sort]', function (e) {
		e.preventDefault();
		new morpheus.SortDialog(project);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'sort'
		});
	});
	$buttons.on('click', '[name=fit]', function (e) {
		e.preventDefault();
		controller.fitToWindow(true);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'fit'
		});
	});
	$buttons.on('click', '[name=resetZoom]', function (e) {
		e.preventDefault();
		controller.resetZoom();
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'resetZoom'
		});
	});
	this.toggleMenu = function () {
		if ($lineOneColumn.css('display') === 'none') {
			$lineOneColumn.css('display', '');
			_this.$rowTextField.focus();
		} else {
			$lineOneColumn.css('display', 'none');
			$(_this.controller.heatmap.canvas).focus();
		}
	};
	this.$el = $el;
	var updateFilterStatus = function () {
		if (controller.getProject().getRowFilter().isEnabled()
			|| controller.getProject().getColumnFilter().isEnabled()) {
			_this.$el.find('[name=filterButton]').addClass('btn-primary');
		} else {
			_this.$el.find('[name=filterButton]').removeClass('btn-primary');
		}

	};
	updateFilterStatus();

	this.$columnMatchesToTop
	.on(
		'click',
		function (e) {
			e.preventDefault();
			var $this = $(this);
			$this.toggleClass('btn-primary');
			_this.setSelectionOnTop({
				isColumns: true,
				isOnTop: $this.hasClass('btn-primary'),
				updateButtonStatus: false
			});
			morpheus.Util.trackEvent({
				eventCategory: 'ToolBar',
				eventAction: 'columnMatchesToTop'
			});
		});
	this.$rowMatchesToTop
	.on(
		'click',
		function (e) {
			e.preventDefault();
			var $this = $(this);
			$this.toggleClass('btn-primary');
			_this.setSelectionOnTop({
				isColumns: false,
				isOnTop: $this.hasClass('btn-primary'),
				updateButtonStatus: false
			});
			morpheus.Util.trackEvent({
				eventCategory: 'ToolBar',
				eventAction: 'rowMatchesToTop'
			});
		});
	project.on('rowSortOrderChanged.morpheus', function (e) {
		if (_this.searching) {
			return;
		}
		_this._updateSearchIndices(false);
		_this.$rowMatchesToTop.removeClass('btn-primary');
	});

	project.on('columnSortOrderChanged.morpheus', function (e) {
		if (_this.searching) {
			return;
		}
		_this._updateSearchIndices(true);
		_this.$columnMatchesToTop.removeClass('btn-primary');
	});

	controller.getProject().on('rowFilterChanged.morpheus', function (e) {
		_this.search(true);
		updateFilterStatus();
	});
	controller.getProject().on('columnFilterChanged.morpheus', function (e) {
		_this.search(false);
		updateFilterStatus();
	});
	controller.getProject().on('datasetChanged.morpheus', function () {
		_this.search(true);
		_this.search(false);
		updateFilterStatus();
	});
	controller.getProject().getRowSelectionModel().on(
		'selectionChanged.morpheus', function () {
			_this.updateSelectionLabel();
		});
	controller.getProject().getColumnSelectionModel().on(
		'selectionChanged.morpheus', function () {
			_this.updateSelectionLabel();
		});
	this.rowSearchResultViewIndicesSorted = null;
	this.currentRowSearchIndex = 0;
	this.columnSearchResultViewIndicesSorted = null;
	this.currentColumnSearchIndex = -1;
	this.$previousColumnMatch
	.on(
		'click',
		function () {
			_this.currentColumnSearchIndex--;
			if (_this.currentColumnSearchIndex < 0) {
				_this.currentColumnSearchIndex = _this.columnSearchResultViewIndicesSorted.length - 1;
			}
			controller
			.scrollLeft(controller
			.getHeatMapElementComponent()
			.getColumnPositions()
			.getPosition(
				_this.columnSearchResultViewIndicesSorted[_this.currentColumnSearchIndex]));
			morpheus.Util.trackEvent({
				eventCategory: 'ToolBar',
				eventAction: 'previousColumnMatch'
			});
		});
	this.$previousRowMatch
	.on(
		'click',
		function () {
			_this.currentRowSearchIndex--;
			if (_this.currentRowSearchIndex < 0) {
				_this.currentRowSearchIndex = _this.rowSearchResultViewIndicesSorted.length - 1;
			}
			controller
			.scrollTop(controller
			.getHeatMapElementComponent()
			.getRowPositions()
			.getPosition(
				_this.rowSearchResultViewIndicesSorted[_this.currentRowSearchIndex]));
			morpheus.Util.trackEvent({
				eventCategory: 'ToolBar',
				eventAction: 'previousRowMatch'
			});
		});
	this.$nextColumnMatch.on('click', function () {
		_this.next(true);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'nextColumnMatch'
		});

	});
	this.$nextRowMatch.on('click', function () {
		_this.next(false);
		morpheus.Util.trackEvent({
			eventCategory: 'ToolBar',
			eventAction: 'nextRowMatch'
		});
	});
	this.updateDimensionsLabel();
	this.updateSelectionLabel();
};
morpheus.HeatMapToolBar.HIGHLIGHT_SEARCH_MODE = 0;
morpheus.HeatMapToolBar.FILTER_SEARCH_MODE = 1;
morpheus.HeatMapToolBar.MATCHES_TO_TOP_SEARCH_MODE = 2;
morpheus.HeatMapToolBar.SELECT_MATCHES_SEARCH_MODE = 3;
morpheus.HeatMapToolBar.prototype = {
	quickColumnFilter: false,
	searching: false,
	rowSearchMode: morpheus.HeatMapToolBar.SELECT_MATCHES_SEARCH_MODE,
	columnSearchMode: morpheus.HeatMapToolBar.SELECT_MATCHES_SEARCH_MODE,
	_updateSearchIndices: function (isColumns) {
		var project = this.controller.getProject();
		if (isColumns) {
			var viewIndices = [];
			var modelIndices = this.columnSearchResultModelIndices;
			for (var i = 0, length = modelIndices.length; i < length; i++) {
				var index = project
				.convertModelColumnIndexToView(modelIndices[i]);
				if (index !== -1) {
					viewIndices.push(index);
				}
			}
			viewIndices.sort(function (a, b) {
				return a < b ? -1 : 1;
			});
			this.columnSearchResultViewIndicesSorted = viewIndices;
			this.currentColumnSearchIndex = -1;
		} else {
			var viewIndices = [];
			var modelIndices = this.rowSearchResultModelIndices;
			for (var i = 0, length = modelIndices.length; i < length; i++) {
				var index = project.convertModelRowIndexToView(modelIndices[i]);
				if (index !== -1) {
					viewIndices.push(index);
				}
			}
			viewIndices.sort(function (a, b) {
				return a < b ? -1 : 1;
			});
			this.rowSearchResultViewIndicesSorted = viewIndices;
			this.currentRowSearchIndex = -1;
		}
	},
	next: function (isColumns) {
		var controller = this.controller;
		if (isColumns) {
			this.currentColumnSearchIndex++;
			if (this.currentColumnSearchIndex >= this.columnSearchResultViewIndicesSorted.length) {
				this.currentColumnSearchIndex = 0;
			}
			controller
			.scrollLeft(controller
			.getHeatMapElementComponent()
			.getColumnPositions()
			.getPosition(
				this.columnSearchResultViewIndicesSorted[this.currentColumnSearchIndex]));
		} else {
			this.currentRowSearchIndex++;
			if (this.currentRowSearchIndex >= this.rowSearchResultViewIndicesSorted.length) {
				this.currentRowSearchIndex = 0;
			}
			controller
			.scrollTop(controller
			.getHeatMapElementComponent()
			.getRowPositions()
			.getPosition(
				this.rowSearchResultViewIndicesSorted[this.currentRowSearchIndex]));
		}
	},
	setSearchText: function (options) {
		var $tf = options.isColumns ? this.$columnTextField
			: this.$rowTextField;
		var existing = options.append ? $.trim($tf.val()) : '';
		if (existing !== '') {
			existing += ' ';
		}
		if (options.onTop) {
			options.isColumns ? this.$columnMatchesToTop
			.addClass('btn-primary') : this.$rowMatchesToTop
			.addClass('btn-primary');

		}
		$tf.val(existing + options.text);
		this.search(!options.isColumns);
		if (options.scrollTo) {
			this.next(options.isColumns);
			// click next
		}
	},
	updateDimensionsLabel: function () {
		var p = this.controller.getProject();
		var d = p.getFullDataset();
		var f = p.getSortedFilteredDataset();
		var text = 'showing ' + morpheus.Util.intFormat(f.getRowCount())
			+ '/' + morpheus.Util.intFormat(d.getRowCount()) + ' rows, '
			+ morpheus.Util.intFormat(f.getColumnCount()) + '/'
			+ morpheus.Util.intFormat(d.getColumnCount()) + ' columns';
		this.$dimensionsLabel.html(text);
	},
	updateSelectionLabel: function () {
		var nc = this.controller.getProject().getColumnSelectionModel().count();
		var nr = this.controller.getProject().getRowSelectionModel().count();
		var text = [];
		text.push(morpheus.Util.intFormat(nr) + ' row');
		if (nr !== 1) {
			text.push('s');
		}
		text.push(', ');
		text.push(morpheus.Util.intFormat(nc) + ' column');
		if (nc !== 1) {
			text.push('s');
		}
		text.push(' selected');
		this.$selectionLabel.html(text.join(''));
	},
	searchDendrogram: function (isColumns) {
		var text = $.trim(isColumns ? this.$searchColumnDendrogram.val()
			: this.$searchRowDendrogram.val());
		var dendrogram = isColumns ? this.controller.columnDendrogram
			: this.controller.rowDendrogram;
		var $searchResults = isColumns ? this.$searchResultsColumnDendrogram
			: this.$searchResultsRowDendrogram;
		var matches = morpheus.AbstractDendrogram.search(
			dendrogram.tree.rootNode, text);
		if (matches === -1) {
			$searchResults.html('');
		} else {
			$searchResults.html(matches + ' match'
				+ (matches === 1 ? '' : 'es'));
		}
		if (matches <= 0) {
			var positions = isColumns ? this.controller
			.getHeatMapElementComponent().getColumnPositions()
				: this.controller.getHeatMapElementComponent()
			.getRowPositions();
			positions.setSquishedIndices(null);
			if (isColumns) {
				this.controller.getProject().setGroupColumns([], true);
			} else {
				this.controller.getProject().setGroupRows([], true);
			}
			positions.setSize(isColumns ? this.controller.getFitColumnSize()
				: this.controller.getFitRowSize());
		} else {
			morpheus.AbstractDendrogram.squishNonSearchedNodes(this.controller,
				isColumns);
		}
		this.controller.updateDataset(); // need to update spaces for group
		// by
		this.controller.revalidate();
	},
	search: function (isRows) {
		this.searching = true;
		var isMatchesOnTop = isRows ? this.$rowMatchesToTop
		.hasClass('btn-primary') : this.$columnMatchesToTop
		.hasClass('btn-primary');
		var controller = this.controller;
		var project = controller.getProject();

		var sortKeys = isRows ? project.getRowSortKeys() : project
		.getColumnSortKeys();
		var keyIndex = -1;
		for (var i = 0; i < sortKeys.length; i++) {
			if (sortKeys[i].toString() === 'matches on top') {
				keyIndex = i;
				break;
			}
		}
		if (keyIndex !== -1) {
			sortKeys.splice(keyIndex, 1);
		}

		var dataset = project.getSortedFilteredDataset();
		var $searchResultsLabel = this.$el.find('[data-name=searchResults'
			+ (isRows ? 'Rows' : 'Columns') + ']');
		var searchText = !isRows ? $.trim(this.$columnTextField.val()) : $
		.trim(this.$rowTextField.val());

		var metadata = isRows ? dataset.getRowMetadata() : dataset
		.getColumnMetadata();
		var visibleIndices = [];
		controller.getVisibleTrackNames(!isRows).forEach(function (name) {
			visibleIndices.push(morpheus.MetadataUtil.indexOf(metadata, name));
		});
		metadata = new morpheus.MetadataModelColumnView(metadata,
			visibleIndices);

		var searchResultViewIndices = morpheus.MetadataUtil.search({
			model: metadata,
			text: searchText,
			isColumns: !isRows,
			defaultMatchMode: isRows ? this.defaultRowMatchMode
				: this.defaultColumnMatchMode
		});
		if (searchText === '') {
			$searchResultsLabel.html('');
			if (isRows) {
				this.$rowSearchDiv.hide();
			} else {
				this.$columnSearchDiv.hide();
			}

		} else {
			$searchResultsLabel.html(searchResultViewIndices.length + ' match'
				+ (searchResultViewIndices.length === 1 ? '' : 'es'));
			if (isRows) {
				this.$rowSearchDiv.show();
			} else {
				this.$columnSearchDiv.show();
			}

		}

		var searchResultsModelIndices = [];
		if (searchResultViewIndices != null) {
			for (var i = 0, length = searchResultViewIndices.length; i < length; i++) {
				var viewIndex = searchResultViewIndices[i];
				searchResultsModelIndices.push(isRows ? project
				.convertViewRowIndexToModel(viewIndex) : project
				.convertViewColumnIndexToModel(viewIndex));
			}
		}

		if (searchResultViewIndices !== null && isMatchesOnTop) {
			var key = new morpheus.MatchesOnTopSortKey(project,
				searchResultsModelIndices, 'matches on top');
			sortKeys = sortKeys.filter(function (key) {
				return !(key instanceof morpheus.MatchesOnTopSortKey);
			});
			searchResultViewIndices = key.indices; // matching indices
			// are now on top
			// add to beginning of sort keys
			sortKeys.splice(0, 0, key);
			if (isRows) {
				project.setRowSortKeys(sortKeys, false);
			} else {
				project.setColumnSortKeys(sortKeys, false);
			}
		}
		var searchResultsViewIndicesSet = new morpheus.Set();
		if (searchResultViewIndices != null) {
			for (var i = 0, length = searchResultViewIndices.length; i < length; i++) {
				var viewIndex = searchResultViewIndices[i];
				searchResultsViewIndicesSet.add(viewIndex);
			}
		}
		if (searchResultViewIndices == null) {
			searchResultViewIndices = [];
		}

		if (isRows) {
			this.rowSearchResultModelIndices = searchResultsModelIndices;
			this.rowSearchResultViewIndicesSorted = searchResultViewIndices
			.sort(function (a, b) {
				return a < b ? -1 : 1;
			});
			this.currentRowSearchIndex = -1;

		} else {
			this.columnSearchResultModelIndices = searchResultsModelIndices;
			this.columnSearchResultViewIndicesSorted = searchResultViewIndices
			.sort(function (a, b) {
				return a < b ? -1 : 1;
			});
			this.currentColumnSearchIndex = -1;

		}
		// update selection
		(!isRows ? project.getColumnSelectionModel() : project
		.getRowSelectionModel()).setViewIndices(
			searchResultsViewIndicesSet, true);

		if (isMatchesOnTop) { // resort
			if (isRows) {
				project.setRowSortKeys(morpheus.SortKey.keepExistingSortKeys(
					sortKeys, project.getRowSortKeys()), true);
			} else {
				project.setColumnSortKeys(morpheus.SortKey
				.keepExistingSortKeys(sortKeys, project
				.getColumnSortKeys()), true);
			}
		}
		this.updateDimensionsLabel();
		this.updateSelectionLabel();
		this.searching = false;

	},
	isSelectionOnTop: function (isColumns) {
		var $btn = isColumns ? this.$columnMatchesToTop : this.$rowMatchesToTop;
		return $btn.hasClass('btn-primary');
	},
	setSelectionOnTop: function (options) {
		if (options.updateButtonStatus) {
			var $btn = options.isColumns ? this.$columnMatchesToTop : this.$rowMatchesToTop;
			if (options.isOnTop) {
				$btn.addClass('btn-primary');
			} else {
				$btn.removeClass('btn-primary');
			}
		}
		var project = this.controller.getProject();
		var sortKeys = options.isColumns ? project.getColumnSortKeys() : project.getRowSortKeys();
		// clear existing sort keys except dendrogram
		sortKeys = sortKeys
		.filter(function (key) {
			return (key instanceof morpheus.SpecifiedModelSortOrder && key.name === 'dendrogram');
		});
		if (options.isOnTop) { // bring to top
			var key = new morpheus.MatchesOnTopSortKey(project,
				options.isColumns ? this.columnSearchResultModelIndices : this.rowSearchResultModelIndices,
				'matches on top');
			sortKeys.splice(0, 0, key);
			if (options.isColumns) {
				this.controller.scrollLeft(0);
			} else {
				this.controller.scrollTop(0);
			}
		}
		this.searching = true;
		if (options.isColumns) {
			project.setColumnSortKeys(sortKeys, true);
		} else {
			project.setRowSortKeys(sortKeys, true);
		}
		this._updateSearchIndices(options.isColumns);
		this.searching = false;

	}
};

morpheus.HeatMapTooltipProvider = function (heatMap, rowIndex, columnIndex,
											options, separator, quick, tipText) {
	var dataset = heatMap.project.getSortedFilteredDataset();
	if (!quick) {
		if (options.value) { // key value pairs for custom tooltip
			_.each(options.value, function (pair) {
				if (tipText.length > 0) {
					tipText.push(separator);
				}
				tipText.push(pair.name);
				tipText.push(': <b>');
				if (_.isArray(pair.value)) {
					for (var i = 0; i < pair.value.length; i++) {
						if (i > 0) {
							tipText.push(', ');
						}
						tipText.push(pair.value[i]);
					}
				} else {
					tipText.push(pair.value);
				}
				tipText.push('</b>');
			});
		}
	}
	if (rowIndex !== -1 && columnIndex !== -1) {
		for (var i = 0, nseries = dataset.getSeriesCount(); i < nseries; i++) {
			morpheus.HeatMapTooltipProvider._matrixValueToString(dataset,
				rowIndex, columnIndex, i, tipText, separator,
				options.showSeriesNameInTooltip || i > 0);
		}
		if (quick) {
			var quickRowTracks = heatMap.rowTracks.filter(function (t) {
				return t.settings.inlineTooltip;
			});
			morpheus.HeatMapTooltipProvider._tracksToString(quickRowTracks, dataset.getRowMetadata(), rowIndex, tipText, separator);
			morpheus.HeatMapTooltipProvider._tracksToString(heatMap.columnTracks.filter(function (t) {
				return t.settings.inlineTooltip;
			}), dataset.getColumnMetadata(), columnIndex, tipText, separator);

		}
	} else if (quick) {
		if (rowIndex !== -1) {
			morpheus.HeatMapTooltipProvider._tracksToString(heatMap.rowTracks.filter(function (t) {
				return t.settings.inlineTooltip && options.name !== t.getName();
			}), dataset.getRowMetadata(), rowIndex, tipText, separator);
		}
		if (columnIndex !== -1) {
			morpheus.HeatMapTooltipProvider._tracksToString(heatMap.columnTracks.filter(function (t) {
				return t.settings.inlineTooltip && options.name !== t.getName();
			}), dataset.getColumnMetadata(), columnIndex, tipText, separator);
		}
	}

	if (!quick) {
		if (rowIndex !== -1) {
			morpheus.HeatMapTooltipProvider._metadataToString(options,
				heatMap.rowTracks, dataset.getRowMetadata(), rowIndex,
				tipText, separator);
		}
		if (columnIndex !== -1) {
			morpheus.HeatMapTooltipProvider._metadataToString(options,
				heatMap.columnTracks, dataset.getColumnMetadata(),
				columnIndex, tipText, separator);
		}
	} else if (options.name != null) {
		var metadata = (rowIndex !== -1 ? dataset.getRowMetadata() : dataset
		.getColumnMetadata());
		var vector = metadata.getByName(options.name);
		var track = heatMap.getTrack(options.name, columnIndex !== -1);
		var colorByName = track != null ? track.settings.colorByField : null;
		var additionalVector = colorByName != null ? metadata
		.getByName(colorByName) : null;
		morpheus.HeatMapTooltipProvider.vectorToString(vector,
			rowIndex !== -1 ? rowIndex : columnIndex, tipText, separator,
			additionalVector);

	}
	var rowNodes = [];
	var columnNodes = [];
	var selectedRowNodes = [];
	var selectedColumnNodes = [];

	if (options.rowNodes) {
		rowNodes = options.rowNodes;
	}
	if (options.columnNodes) {
		columnNodes = options.columnNodes;
	}
	if (!quick) {
		if (heatMap.rowDendrogram) {
			selectedRowNodes = _
			.values(heatMap.rowDendrogram.selectedRootNodeIdToNode);
		}
		if (heatMap.columnDendrogram) {
			selectedColumnNodes = _
			.values(heatMap.columnDendrogram.selectedRootNodeIdToNode);
		}
		if (selectedRowNodes.length > 0 && rowNodes.length > 0) {
			var nodeIds = {};
			_.each(selectedRowNodes, function (n) {
				nodeIds[n.id] = true;
			});
			rowNodes = _.filter(rowNodes, function (n) {
				return nodeIds[n.id] === undefined;
			});
		}
		if (selectedColumnNodes.length > 0 && columnNodes.length > 0) {
			var nodeIds = {};
			_.each(selectedColumnNodes, function (n) {
				nodeIds[n.id] = true;
			});
			columnNodes = _.filter(columnNodes, function (n) {
				return nodeIds[n.id] === undefined;
			});
		}
	}
	morpheus.HeatMapTooltipProvider._nodesToString(tipText, rowNodes, null,
		separator);
	morpheus.HeatMapTooltipProvider._nodesToString(tipText, columnNodes, null,
		separator);
	if (!quick) {
		if (selectedRowNodes.length > 0) {
			morpheus.HeatMapTooltipProvider._nodesToString(tipText,
				selectedRowNodes, heatMap.rowDendrogram._selectedNodeColor,
				separator);
		}
		if (selectedColumnNodes.length > 0) {
			morpheus.HeatMapTooltipProvider._nodesToString(tipText,
				selectedColumnNodes,
				heatMap.columnDendrogram._selectedNodeColor, separator);
		}
	}

};

morpheus.HeatMapTooltipProvider._matrixValueToString = function (dataset,
																 rowIndex, columnIndex, seriesIndex, tipText, separator,
																 showSeriesNameInTooltip) {
	var val = dataset.getValue(rowIndex, columnIndex, seriesIndex);
	if (val != null) {
		if (val.toObject || !_.isNumber(val)) {
			var obj = val.toObject ? val.toObject() : val;
			var keys = _.keys(obj);
			if (keys.length === 0) {
				var v = morpheus.Util.toString(obj);
				if (tipText.length > 0) {
					tipText.push(separator);
				}
				if (showSeriesNameInTooltip) {
					tipText.push(dataset.getName(seriesIndex));
					tipText.push(': ');
				}
				tipText.push('<b>');
				tipText.push(v);
				tipText.push('</b>');
			} else {
				for (var i = 0, nkeys = keys.length; i < nkeys; i++) {
					var key = keys[i];
					if (key !== '__v') { // special value key
						var objVal = obj[key];
						var v;
						if (morpheus.Util.isArray(objVal)) {
							v = morpheus.Util.arrayToString(objVal, ', ');
						} else {
							v = morpheus.Util.toString(objVal);
						}
						if (tipText.length > 0) {
							tipText.push(separator);
						}
						tipText.push(key);
						tipText.push(': <b>');
						tipText.push(v);
						tipText.push('</b>');
					}
				}
			}

		} else {
			if (tipText.length > 0) {
				tipText.push(separator);
			}

			if (showSeriesNameInTooltip) {
				tipText.push(dataset.getName(seriesIndex));
				tipText.push(': ');
			}
			tipText.push('<b>');
			tipText.push(morpheus.Util.nf(val));
			tipText.push('</b>');
		}
	}
};

morpheus.HeatMapTooltipProvider.vectorToString = function (vector, index,
														   tipText, separator, additionalVector) {
	var arrayValueToString = function (arrayFieldName, arrayVal) {
		if (arrayVal != null) {
			if (arrayFieldName != null) {
				if (tipText.length > 0) {
					tipText.push(separator);
				}
				tipText.push(arrayFieldName); // e.g. PC3
			}
			if (arrayVal.toObject) {
				tipText.push(' ');
				var obj = arrayVal.toObject();
				var keys = _.keys(obj);
				_.each(keys, function (key) {
					var subVal = obj[key];
					if (subVal != null && subVal != '') {
						if (tipText.length > 0) {
							tipText.push(separator);
						}
						tipText.push(key);
						tipText.push(': <b>');
						tipText.push(morpheus.Util.toString(subVal));
						tipText.push('</b>');
					}
				});
			} else {
				tipText.push(': <b>');
				tipText.push(morpheus.Util.toString(arrayVal));
				tipText.push('</b>');
			}

		}
	};
	if (vector != null) {
		var primaryVal = vector.getValue(index);
		if (primaryVal != null && primaryVal != '') {
			var primaryFields = vector.getProperties().get(
				morpheus.VectorKeys.FIELDS);
			if (primaryFields != null) {
				var visibleFieldIndices = vector.getProperties().get(
					morpheus.VectorKeys.VISIBLE_FIELDS);
				if (visibleFieldIndices === undefined) {
					visibleFieldIndices = morpheus.Util
					.seq(primaryFields.length);
				}
				var additionalFieldNames = additionalVector != null ? additionalVector
				.getProperties().get(morpheus.VectorKeys.FIELDS)
					: null;
				var additionalVal = additionalFieldNames != null ? additionalVector
				.getValue(index)
					: null;
				if (tipText.length > 0) {
					tipText.push(separator);
				}
				tipText.push(vector.getName());
				for (var j = 0; j < visibleFieldIndices.length; j++) {
					arrayValueToString(primaryFields[visibleFieldIndices[j]],
						primaryVal[visibleFieldIndices[j]]);
				}

				if (additionalVal != null) {
					if (tipText.length > 0) {
						tipText.push(separator);
					}
					tipText.push(additionalVector.getName());
					for (var j = 0; j < visibleFieldIndices.length; j++) {
						arrayValueToString(
							additionalFieldNames[visibleFieldIndices[j]],
							additionalVal[visibleFieldIndices[j]]);
					}

				}
			} else {
				if (tipText.length > 0) {
					tipText.push(separator);
				}
				tipText.push(vector.getName());
				tipText.push(': <b>');
				tipText.push(morpheus.Util.toString(primaryVal));
				tipText.push('</b>');
			}

		}
	}
};
morpheus.HeatMapTooltipProvider._tracksToString = function (tracks, metadata, index, tipText, separator) {
	for (var i = 0; i < tracks.length; i++) {
		morpheus.HeatMapTooltipProvider.vectorToString(metadata.getByName(tracks[i].name), index, tipText,
			separator);

	}
};
morpheus.HeatMapTooltipProvider._metadataToString = function (options, tracks,
															  metadata, index, tipText, separator) {
	var filtered = [];
	for (var i = 0, ntracks = tracks.length; i < ntracks; i++) {
		var track = tracks[i];
		if ((track.isVisible() && track.isShowTooltip())) {
			if (tracks[i].name === options.name) { // show the vector that we're mousing over 1st
				filtered.splice(0, 0, track);
			} else {
				filtered.push(track);
			}
		}
	}

	morpheus.HeatMapTooltipProvider._tracksToString(filtered, metadata, index, tipText, separator);

};
morpheus.HeatMapTooltipProvider._nodesToString = function (tipText, nodes,
														   color, separator) {
	var renderField = function (name, value) {
		if (value != null) {
			if (tipText.length > 0) {
				tipText.push(separator);
			}
			if (color) {
				tipText.push('<span style="color:' + color + '">');
			}
			tipText.push(name);
			tipText.push(': <b>');
			if (_.isArray(value)) {
				for (var i = 0; i < value.length; i++) {
					if (i > 0) {
						tipText.push(', ');
					}
					tipText.push(morpheus.Util.toString(value[i]));
				}
			} else {
				tipText.push(morpheus.Util.toString(value));
			}
			tipText.push('</b>');
			if (color) {
				tipText.push('</span>');
			}
		}
	};
	_.each(nodes, function (node) {
		if (node.info) {
			for (var name in node.info) {
				var value = node.info[name];
				renderField(name, value);
			}
		}
		renderField('depth', node.depth);
		var nLeafNodes = 1 + Math.abs(node.maxIndex - node.minIndex);
		if (nLeafNodes > 0) {
			renderField('# of leaf nodes', nLeafNodes);
			// renderField('height', node.height);
		}
	});
};

morpheus.HeatMapTrackColorLegend = function(tracks, colorModel) {
	morpheus.AbstractCanvas.call(this, false);
	this.tracks = tracks;
	this.colorModel = colorModel;
	this.canvas.style.position = '';
};
morpheus.HeatMapTrackColorLegend.prototype = {
	getPreferredSize : function() {
		var tracks = this.tracks;
		var colorModel = this.colorModel;
		var xpix = 0;
		var ypix = 0;
		var maxYPix = 0;
		var canvas = this.canvas;
		var context = canvas.getContext('2d');
		context.font = '12px ' + morpheus.CanvasUtil.FONT_NAME;
		for (var i = 0; i < tracks.length; i++) {
			ypix = 0;
			var maxWidth = 0;
			var vector = tracks[i].getVector();
			var map = colorModel.getDiscreteColorScheme(vector);
			if (map == null) { // continuous
				maxWidth = 220;
				ypix += 40;
			} else {
				map.forEach(function(color, key) {
					var width = context.measureText(key).width;
					if (!isNaN(width)) {
						maxWidth = Math.max(maxWidth, width);
					}
					ypix += 14;
				});
			}
			maxWidth = Math.max(maxWidth,
					context.measureText(vector.getName()).width);
			xpix += maxWidth + 10 + 14;
			maxYPix = Math.max(maxYPix, ypix);
		}
		return {
			width : xpix,
			height : maxYPix > 0 ? (maxYPix + 12) : 0
		};
	},
	draw : function(clip, context) {
		var tracks = this.tracks;
		var colorModel = this.colorModel;
		var xpix = 0;
		// legends are placed side by side
		for (var i = 0; i < tracks.length; i++) {
			var ypix = 0;
			var vector = tracks[i].getVector();
			context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
			context.font = '12px ' + morpheus.CanvasUtil.FONT_NAME;
			context.textAlign = 'left';
			// draw name
			context.textBaseline = 'top';
			context.fillText(vector.getName(), xpix, ypix);

			context.strokeStyle = 'LightGrey';
			var maxWidth = 0;
			var textWidth = context.measureText(vector.getName()).width;
			if (!isNaN(textWidth)) {
				maxWidth = Math.max(0, textWidth);
			}
			ypix += 14;

			var scheme = colorModel.getContinuousColorScheme(vector);
			if (scheme != null) { // draw continuous color legend
				context.save();
				context.translate(xpix, ypix);
				morpheus.HeatMapColorSchemeLegend.drawColorScheme(context,
						scheme, 200);
				context.restore();
				maxWidth = Math.max(maxWidth, 220);
				ypix += 40;
			} else {
				var map = colorModel.getDiscreteColorScheme(vector);
				var values = map.keys().sort(
						morpheus.SortKey.ASCENDING_COMPARATOR);
				values.forEach(function(key) {
					if (key != null) {
						var color = colorModel.getMappedValue(vector, key);
						var textWidth = context.measureText(key).width;
						if (!isNaN(textWidth)) {
							maxWidth = Math.max(maxWidth, textWidth);
						}
						context.fillStyle = color;
						context.fillRect(xpix, ypix, 12, 12);
						context.strokeRect(xpix, ypix, 12, 12);
						context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
						context.fillText(key, xpix + 16, ypix);
						ypix += 14;
					}
				});
			}
			xpix += maxWidth + 10 + 14; // space between tracks + color chip
		}
	}
};
morpheus.Util.extend(morpheus.HeatMapTrackColorLegend, morpheus.AbstractCanvas);

morpheus.HeatMapTrackShapeLegend = function(tracks, shapeModel) {
	morpheus.AbstractCanvas.call(this, false);
	this.tracks = tracks;
	this.shapeModel = shapeModel;
	this.canvas.style.position = '';
};
morpheus.HeatMapTrackShapeLegend.prototype = {
	getPreferredSize : function() {
		var tracks = this.tracks;
		var shapeModel = this.shapeModel;
		var canvas = this.canvas;
		var context = canvas.getContext('2d');
		var xpix = 0;
		var ypix = 0;
		var maxYPix = 0;
		for (var i = 0; i < tracks.length; i++) {
			ypix = 0;
			var maxWidth = 0;
			var vector = tracks[i].getVector();
			var map = shapeModel.getMap(vector.getName());

			map.forEach(function(color, key) {
				var width = context.measureText(key).width;
				if (!isNaN(width)) {
					maxWidth = Math.max(maxWidth, width);
				}
				ypix += 14;
			});

			xpix += maxWidth + 24;
			maxYPix = Math.max(maxYPix, ypix);
		}
		return {
			width : xpix,
			height : maxYPix > 0 ? (maxYPix + 30) : 0
		};
	},
	draw : function(clip, context) {
		// draw legends horizontally
		var tracks = this.tracks;
		var shapeModel = this.shapeModel;
		var xpix = 0;
		var ypix = 0;
		context.textAlign = 'left';
		context.textBaseline = 'top';
		context.font = '12px ' + morpheus.CanvasUtil.FONT_NAME;
		context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
		context.strokeStyle = 'black';
		for (var i = 0; i < tracks.length; i++) {
			ypix = 0;
			var maxWidth = 0;
			var vector = tracks[i].getVector();
			context.fillText(vector.getName(), xpix, ypix);
			maxWidth = Math.max(maxWidth,
					context.measureText(vector.getName()).width);
			ypix += 14;
			var map = shapeModel.getMap(vector.getName());
			var values = map.keys().sort(morpheus.SortKey.ASCENDING_COMPARATOR);
			values.forEach(function(key) {
				var shape = shapeModel.getMappedValue(vector, key);
				var width = context.measureText(key).width;
				if (!isNaN(width)) {
					maxWidth = Math.max(maxWidth, width);
				}
				morpheus.CanvasUtil.drawShape(context, shape, xpix + 8,
						ypix + 6, 6);
				context.fillText(key, xpix + 16, ypix);
				ypix += 14;
			});

			xpix += maxWidth + 24; // space between columns + shape
		}
	}
};
morpheus.Util.extend(morpheus.HeatMapTrackShapeLegend, morpheus.AbstractCanvas);
morpheus.HelpMenu = function() {
	var html = [];
	html.push('<div style="margin-left:2px;" class="btn-group">');
	html
			.push('<span style="color:#ca0020;" data-toggle="dropdown" class="fa fa-lg fa-border fa-question-circle"></span>');
	html
			.push('<ul class="dropdown-menu dropdown-menu-right" role="menu">');
	html.push('<li><a data-name="contact" href="#">Contact</a></li>');
	// <li role="presentation" class="divider"></li>

	html.push('<li><a data-name="linking" href="#">Linking</a></li>');
	html.push('<li><a data-name="tutorial" href="#">Tutorial</a></li>');
	html.push('<li><a data-name="source" href="#">Source Code</a></li>');

	html.push('</ul>');
	html.push('</div>');
	this.$el = $(html.join(''));
	this.$el.find('button').on('click', function(e) {
		e.stopImmediatePropagation();
	});
	this.$el.find('[data-name=contact]').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		window.open('mailto:morpheus@broadinstitute.org');
		morpheus.Util.trackEvent({
			eventCategory : 'ToolBar',
			eventAction : 'contact'
		});
	});
	this.$el.find('[data-name=tutorial]').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		window.open(morpheus.Util.URL + 'tutorial.html');
		morpheus.Util.trackEvent({
			eventCategory : 'ToolBar',
			eventAction : 'tutorial'
		});

	});

	this.$el.find('[data-name=linking]').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		window.open(morpheus.Util.URL + 'linking.html');
		morpheus.Util.trackEvent({
			eventCategory : 'ToolBar',
			eventAction : 'linking'
		});
	});
	this.$el.find('[data-name=source]').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		window.open('https://github.com/joshua-gould/morpheus.js');
		morpheus.Util.trackEvent({
			eventCategory : 'ToolBar',
			eventAction : 'source'
		});
	});
};

morpheus.LegendWithStops = function() {
	morpheus.AbstractCanvas.call(this, false);
	this.setBounds({
		width : 300,
		height : 40
	});
	var that = this;
	this.hammer = morpheus.Util.hammer(this.canvas, [ 'pan', 'tap', 'press' ])
			.on(
					'panmove',
					function(event) {
						if (that.panStartSelectedIndex !== -1) {
							var position = morpheus.CanvasUtil.getMousePos(
									event.target, event);
							var fraction = that.fractionToStopPix
									.invert(position.x);
							fraction = Math.max(0, fraction);
							fraction = Math.min(1, fraction);
							that.trigger('moved', {
								fraction : fraction
							});
						}
					}).on(
					'panstart',
					function(event) {
						that.panStartSelectedIndex = that
								.findIndexForPosition( morpheus.CanvasUtil
										.getMousePos(event.target, event, true));
					}).on('panend', function(event) {
						that.panStartSelectedIndex = -1;
					}).on(
					'tap',
					function(event) {
						var position = morpheus.CanvasUtil.getMousePos(
								event.target, event);
						if (event.tapCount > 1) {
							var fraction = that.fractionToStopPix
									.invert(position.x);
							that.trigger('added', {
								fraction : fraction
							});
						} else {
							that.selectedIndex = that
									.findIndexForPosition(position);
							that.trigger('selectedIndex', {
								selectedIndex : that.selectedIndex
							});
						}
					});
	$(this.canvas).on('keydown', function(e) {
		// 8=backspace, 46=delete
		if ((e.which == 8 || e.which == 46) && that.selectedIndex !== -1) {
			that.trigger('delete');
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}
	});
};
morpheus.LegendWithStops.prototype = {
	selectedIndex : -1,
	border : 7,
	stopHalfSize : 5,
	panStartSelectedIndex : -1,
	destroy : function() {
		$(this.canvas).off('keyup');
		this.hammer.destroy();
	},
	setSelectedIndex : function(index) {
		this.panStartSelectedIndex = -1;
	},
	findIndexForPosition : function(position) {
		// pix - stopHalfSize to pix + stopHalfSize
		if (position.y >= 22) {
			for (var i = 0, length = this.fractions.length; i < length; i++) {
				var pix = this.fractionToStopPix(this.fractions[i]);
				var start = pix - this.stopHalfSize;
				var end = pix + this.stopHalfSize;
				if (position.x >= start && position.x <= end) {
					return i;
				}
			}
		}
		return -1;
	},
	draw : function(fractions, colors, stepped, fractionToStopPix) {
		this.fractions = fractions;
		this.colors = colors;
		this.stepped = stepped;
		this.fractionToStopPix = fractionToStopPix;
		var context = this.canvas.getContext('2d');
		morpheus.CanvasUtil.resetTransform(context);
		context.clearRect(0, 0, this.getUnscaledWidth(), this
				.getUnscaledHeight());
		context.translate(this.border, 0);
		morpheus.HeatMapColorSchemeLegend.draw(context, fractions, colors, this
				.getUnscaledWidth()
				- 2 * this.border, this.getUnscaledHeight() - 20, stepped);
		context.translate(-this.border, 0);
		context.lineWidth = 1;
		context.strokeStyle = 'Grey';
		context.strokeRect(this.border, 0, this.getUnscaledWidth() - 2
				* this.border, this.getUnscaledHeight() - 20);
		for (var i = 0; i < fractions.length; i++) {
			if (i > 0 && fractions[i] === fractions[i - 1]) {
				continue;
			}
			context.fillStyle = colors[i];
			var pix = fractionToStopPix(fractions[i]);
			context.fillRect(pix - this.stopHalfSize, 22,
					this.stopHalfSize * 2, this.stopHalfSize * 2);
			if (this.selectedIndex === i) {
				context.lineWidth = 2;
				context.strokeStyle = 'black';
			} else {
				context.lineWidth = 1;
				context.strokeStyle = 'Grey';
			}
			context.strokeRect(pix - this.stopHalfSize, 22,
					this.stopHalfSize * 2, this.stopHalfSize * 2);
		}
	}
};
morpheus.Util.extend(morpheus.LegendWithStops, morpheus.AbstractCanvas);
morpheus.Util.extend(morpheus.LegendWithStops, morpheus.Events);
morpheus.Popup = {};
morpheus.Popup.initted = false;
morpheus.Popup.init = function () {
	if (morpheus.Popup.initted) {
		return;
	}
	var client = new Clipboard('a[data-name=Copy]', {
		text: function (trigger) {
			var event = {
				clipboardData: {
					setData: function (dataType, data) {
						this.data = data;
					}
				}
			};
			morpheus.Popup.popupCallback(event, 'Copy');
			morpheus.Popup.hide();
			return event.clipboardData.data;
		}
	});

	morpheus.Popup.client = client;
	morpheus.Popup.initted = true;
	morpheus.Popup.$popupDiv = $(document.createElement('div'));
	morpheus.Popup.$popupDiv.css('position', 'absolute').css('zIndex', 999)
	.addClass('dropdown clearfix');
	morpheus.Popup.$contextMenu = $(document.createElement('ul'));
	morpheus.Popup.$contextMenu.addClass('dropdown-menu').css('display',
		'block').css('position', 'static').css('margin-bottom', '5px');
	morpheus.Popup.$contextMenu.appendTo(morpheus.Popup.$popupDiv);
	morpheus.Popup.$contextMenu.on('click', 'a', function (e) {
		e.preventDefault();
		var $this = $(this);
		var name = $.trim($this.text());
		if (name !== 'Copy') {
			morpheus.Popup.popupCallback(e, name);
			morpheus.Popup.hide();
		}

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
	// morpheus.Popup.client.unclip();
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
				+ '" data-type="popup-item" tabindex="-1" href="#">');
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
	}
	if ((top + popupHeight) >= (windowHeight)) { // offscreen
		top -= popupHeight;
	}

	morpheus.Popup.$popupDiv.css({
		display: 'block',
		left: left,
		top: top
	});

	morpheus.Popup.$popupDiv.show();

	$body.off('mousedown', morpheus.Popup.hidePopupMenu);
	window.setTimeout(function () {
		$body.on('mousedown', function (e) {
			var $target = $(e.target);
			if ($target.data('type') !== 'popup-item') {
				morpheus.Popup.hidePopupMenu(e);
			}
		});
	}, 1);
};


morpheus.RowDendrogram = function(controller, tree, positions, project) {
	morpheus.AbstractDendrogram.call(this, controller, tree, positions,
			project, morpheus.AbstractDendrogram.Type.ROW);
};
morpheus.RowDendrogram.prototype = {
	drawNode : function(context, node) {
		var radius = this.getNodeRadius(node);
		var pix = this.toPix(node);
		context.beginPath();
		context.arc(pix[0], pix[1], radius, Math.PI * 2, false);
		context.fill();
	},
	isDragHotSpot : function(p) {
		return Math.abs(this.scale(this.cutHeight) - p.x) <= 2;
	},
	preDraw : function(context, clip) {
		if (context.setLineDash) {
			context.setLineDash([ 5 ]);
		}
		context.strokeStyle = 'black';
		var nx = this.scale(this.cutHeight);
		context.beginPath();
		context.moveTo(nx, clip.y);
		context.lineTo(nx, this.getUnscaledHeight());
		context.stroke();
		if (context.setLineDash) {
			context.setLineDash([]);
		}
	},
	getPreferredSize : function() {
		return {
			width : 100,
			height : Math.ceil(this.positions.getPosition(this.positions
					.getLength() - 1)
					+ this.positions
							.getItemSize(this.positions.getLength() - 1))
		};
	},
	paintMouseOver : function(clip, context) {
		if (this.project.getHoverRowIndex() !== -1) {
			morpheus.CanvasUtil.resetTransform(context);
			context.translate(0, -clip.y);
			this.drawRowBorder(context, this.positions, this.project
					.getHoverRowIndex(), this.getUnscaledWidth());
		}
	},
	drawRowBorder : function(context, positions, index, gridSize) {
		var size = positions.getItemSize(index);
		var pix = positions.getPosition(index);
		// top and bottom lines
		context.beginPath();
		context.moveTo(0, pix + size);
		context.lineTo(gridSize, pix + size);
		context.stroke();
		context.beginPath();
		context.moveTo(0, pix);
		context.lineTo(gridSize, pix);
		context.stroke();
	},
	createScale : function() {
		return d3.scale.linear().domain([ 0, this.tree.maxHeight ]).range(
				[ this.getUnscaledWidth(), 0 ]);
	},
	getMaxIndex : function(clip) {
		return morpheus.Positions.getBottom(clip, this.positions);
	},
	getMinIndex : function(clip) {
		return morpheus.Positions.getTop(clip, this.positions);
	},
	toPix : function(node) {
		var min = this.positions.getPosition(node.minIndex)
				+ this.positions.getItemSize(node.minIndex) / 2;
		var max = this.positions.getPosition(node.maxIndex)
				+ this.positions.getItemSize(node.maxIndex) / 2;
		return [ this.scale(node.height), (min + max) / 2 ];
	},
	drawPathFromNodeToParent : function(context, node) {
		var pix = this.toPix(node);
		var parentPix = this.toPix(node.parent);
		context.beginPath();
		context.moveTo(pix[0], pix[1]);
		context.lineTo(parentPix[0], pix[1]);
		context.lineTo(parentPix[0], parentPix[1]);
		context.stroke();
	},
	drawNodePath : function(context, node, minIndex, maxIndex) {
		var children = node.children;
		var left = children[0];
		var right = children[1];
		// set up points for poly line
		var ry = this.toPix(right)[1];
		var rx = this.scale(right.height);
		var ly = this.toPix(left)[1];
		var lx = this.scale(left.height);
		var nx = this.scale(node.height);
		var x;
		var y;
		if (!this.drawLeafNodes) {
			var leftIsLeaf = left.children !== undefined;
			var rightIsLeaf = right.children !== undefined;
			if (leftIsLeaf) {
				lx = nx + 4;
			}
			if (rightIsLeaf) {
				rx = nx + 4;
			}
			x = [ rx, nx, nx, lx ];
			y = [ ry, ry, ly, ly ];
		} else {
			x = [ rx, nx, nx, lx ];
			y = [ ry, ry, ly, ly ];
		}
		context.beginPath();
		context.moveTo(x[0], y[0]);
		for (var i = 1, length = x.length; i < length; i++) {
			context.lineTo(x[i], y[i]);
		}
		context.stroke();
	}
};
morpheus.Util.extend(morpheus.RowDendrogram, morpheus.AbstractDendrogram);
/**
 * @param model{morpheus.SelectionModel}
 */
morpheus.ScentedSearch = function (model, positions, isVertical, scrollbar,
								   controller) {
	morpheus.AbstractCanvas.call(this, false);
	this.model = model;
	this.positions = positions;
	this.isVertical = isVertical;
	this.scrollbar = scrollbar;
	this.controller = controller;
	this.searchIndices = [];
	scrollbar.decorator = this;
	var _this = this;
	var mouseMove = function (e) {
		var indices = _this.getSearchIndices(e);

		document.body.style.cursor = indices.length === 0 ? 'default' : 'pointer';
		scrollbar.canvas.style.cursor = indices.length === 0 ? 'default' : 'pointer';
		var tipOptions = {
			event: e,
			heatMapLens: indices.length >= 0
		};
		if (isVertical) {
			controller.setToolTip(indices.length >= 0 ? indices : null,
				-1, tipOptions);
		} else {
			controller.setToolTip(-1, indices.length >= 0 ? indices
				: null, tipOptions);
		}

	};
	var mouseExit = function (e) {
		// need to set body cursor b/c mouse can be partially on the scroll bar,
		// but the canvas cursor has no effect
		document.body.style.cursor = 'default';
		scrollbar.canvas.style.cursor = 'default';
		controller.setToolTip(-1, -1, {event: e});
	};
	var showPopup = function (e) {
		e.preventDefault();
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		if (e.stopImmediatePropagation) {
			e.stopImmediatePropagation();
		}
		morpheus.Popup
		.showPopup(
			[

				{
					name: 'Selection To Top',
					checked: controller.getToolbar().isSelectionOnTop(!isVertical),
					disabled: isVertical ? controller.getProject().getRowSelectionModel()
					.count() === 0 : controller.getProject().getColumnSelectionModel()
					.count() === 0
				},
				{
					name: 'New Heat Map (' + morpheus.Util.COMMAND_KEY + 'X)'
				}],
			{
				x: e.pageX,
				y: e.pageY
			},
			e.target,
			function (event, item) {
				if (item === 'Selection To Top') {
					controller.getToolbar().setSelectionOnTop({
						isColumns: !isVertical,
						isOnTop: !controller.getToolbar().isSelectionOnTop(!isVertical),
						updateButtonStatus: true
					});
				} else {
					morpheus.HeatMap.showTool(new morpheus.NewHeatMapTool(),
						controller);
				}
			});
		return false;
	};
	$(scrollbar.canvas).on('mousemove.morpheus', mouseMove).on('mouseout.morpheus', mouseExit).on('contextmenu.morpheus', showPopup);

};

morpheus.ScentedSearch.LINE_HEIGHT = 3.5;
morpheus.ScentedSearch.prototype = {
	mouseMovedIndex: -1,
	getIndex: function (event) {
		var pix = morpheus.CanvasUtil.getMousePos(event.target, event);
		var val = pix[this.isVertical ? 'y' : 'x'];
		return this.getIndexForPix(val);
	},
	getSearchIndices: function (event) {
		var pix = morpheus.CanvasUtil.getMousePos(event.target, event);
		var val = pix[this.isVertical ? 'y' : 'x'];
		return this.getSearchIndicesForPix(val);
	},
	getSearchIndicesForPix: function (pix) {
		var indices = this.searchIndices;
		if (indices == null) {
			return [];
		}
		var scale = this.scale;
		var tolerance = morpheus.ScentedSearch.LINE_HEIGHT;
		var matches = [];
		for (var i = 0, length = indices.length; i < length; i++) {
			var midVal = this.positions.getPosition(indices[i]) * scale;
			if (Math.abs(midVal - pix) <= tolerance) {
				matches.push(indices[i]);
			}
		}
		return matches;
	},
	getIndexForPix: function (pix) {
		var indices = this.searchIndices;
		if (indices == null) {
			return -1;
		}
		var tolerance = morpheus.ScentedSearch.LINE_HEIGHT;
		if (this.mouseMovedIndex > 0) {
			var midVal = this.positions
				.getPosition(indices[this.mouseMovedIndex])
				* scale;
			if (Math.abs(midVal - pix) <= tolerance) {
				return this.mouseMovedIndex;
			}
		}
		var low = 0;
		var scale = this.scale;
		var high = indices.length - 1;

		while (low <= high) {
			var mid = (low + high) >> 1;
			var midVal = this.positions.getPosition(indices[mid]) * scale;
			var cmp = 0;
			if (Math.abs(midVal - pix) <= tolerance) {
				cmp = 0;
			} else if (midVal < pix) {
				cmp = -1; // Neither val is NaN, thisVal is smaller
			} else if (midVal > pix) {
				cmp = 1; // Neither val is NaN, thisVal is larger
			}
			if (cmp < 0)
				low = mid + 1;
			else if (cmp > 0)
				high = mid - 1;
			else
				return mid; // key found
		}
		return -1; // -(low + 1); // key not found.

	},
	tap: function (position) {
		var val = position[this.isVertical ? 'y' : 'x'];
		var index = this.getIndexForPix(val);
		this.scrollbar.canvas.style.cursor = index < 0 ? 'default' : 'pointer';
		if (index >= 0) {
			if (this.isVertical) {
				this.controller.scrollTop(this.positions
				.getPosition(this.searchIndices[index]));
			} else {
				this.controller.scrollLeft(this.positions
				.getPosition(this.searchIndices[index]));
			}
			return true;
		}
		return false;
	},
	update: function () {
		this.searchIndices = this.model.getViewIndices().values().sort(
			function (a, b) {
				return a < b ? -1 : 1;
			});
	},
	draw: function (clip, context) {
		var width = this.scrollbar.getUnscaledWidth();
		var height = this.scrollbar.getUnscaledHeight();
		var availableLength = ((this.isVertical ? height : width))
			- morpheus.ScentedSearch.LINE_HEIGHT;
		this.scale = availableLength
			/ (this.positions.getPosition(this.positions.getLength() - 1) + this.positions
			.getItemSize(this.positions.getLength() - 1));
		context.strokeStyle = 'rgb(106,137,177)';
		context.fillStyle = 'rgb(182,213,253)';
		context.lineWidth = 1;
		this.drawIndices(context, this.searchIndices);
		this.drawHoverMatchingValues(context);
	},
	drawHoverMatchingValues: function (context) {
		var heatmap = this.controller;
		context.fillStyle = 'black';
		if (heatmap.mousePositionOptions
			&& heatmap.mousePositionOptions.name != null) {
			var isColumns = !this.isVertical;
			var track = heatmap.getTrack(heatmap.mousePositionOptions.name,
				isColumns);
			if (track == null) {
				return;
			}
			if (track.settings.highlightMatchingValues) {
				var hoverIndex = isColumns ? heatmap.getProject()
				.getHoverColumnIndex() : heatmap.getProject()
				.getHoverRowIndex();
				if (hoverIndex === -1) {
					return;
				}
				var vector = track.getVector();
				var value = vector.getValue(hoverIndex);
				var valueToModelIndices = track.getFullVector().getProperties()
				.get(morpheus.VectorKeys.VALUE_TO_INDICES);
				if (!valueToModelIndices) {
					var fullVector = track.getFullVector();
					valueToModelIndices = morpheus.VectorUtil
					.createValueToIndicesMap(fullVector);
					fullVector.getProperties().set(
						morpheus.VectorKeys.VALUE_TO_INDICES,
						valueToModelIndices);

				}
				var modelIndices = valueToModelIndices.get(value);
				if (modelIndices == null) {
					console.log('valueToModelIndices error');
					return;
				}
				var scale = this.scale;
				var lineLength = !this.isVertical ? this.scrollbar
				.getUnscaledHeight() : this.scrollbar
				.getUnscaledWidth();
				var isVertical = this.isVertical;
				var positions = this.positions;
				var project = heatmap.getProject();
				for (var i = 0, length = modelIndices.length; i < length; i++) {
					var modelIndex = modelIndices[i];
					var index = isVertical ? project
					.convertModelRowIndexToView(modelIndex) : project
					.convertModelColumnIndexToView(modelIndex);
					if (index === -1) {
						continue;
					}
					var pix = positions.getPosition(index) * scale;
					if (isVertical) {
						context.fillRect(0, pix, lineLength,
							morpheus.ScentedSearch.LINE_HEIGHT);
					} else {
						context.fillRect(pix, 0,
							morpheus.ScentedSearch.LINE_HEIGHT, lineLength);

					}
				}
			}

		}
	},
	drawIndices: function (context, highlightedIndices) {
		var scale = this.scale;
		var lineLength = !this.isVertical ? this.scrollbar.getUnscaledHeight()
			: this.scrollbar.getUnscaledWidth();

		var isVertical = this.isVertical;
		var positions = this.positions;
		for (var i = 0, length = highlightedIndices.length; i < length; i++) {
			var index = highlightedIndices[i];
			var pix = positions.getPosition(index) * scale;
			if (isVertical) {
				context.beginPath();
				context.rect(0, pix, lineLength,
					morpheus.ScentedSearch.LINE_HEIGHT);
				context.fill();
				context.stroke();

			} else {
				context.beginPath();
				context.rect(pix, 0, morpheus.ScentedSearch.LINE_HEIGHT,
					lineLength);
				context.fill();
				context.stroke();
			}
		}

	}
};
morpheus.Util.extend(morpheus.ScentedSearch, morpheus.AbstractCanvas);

morpheus.ScrollBar = function(isVertical) {
	morpheus.AbstractCanvas.call(this);
	this.isVertical = isVertical;
	$(this.canvas).css('border', '1px solid #d8d8d8');
	if (isVertical) {
		this.setBounds({
			width : 12
		});
	} else {
		this.setBounds({
			height : 12
		});
	}
	this.field = this.isVertical ? 'y' : 'x';
	var that = this;
	var mouseMove = function(event) {
		if (!morpheus.CanvasUtil.dragging) {
			var position = morpheus.CanvasUtil.getMousePos(event.target, event,
					true);
			var mouseOver = (position[that.field] >= that.thumbPos && position[that.field] <= (that.thumbPos + that.thumbExtent));
			if (that.thumbMouseOver !== mouseOver) {
				that.thumbMouseOver = mouseOver;
				that.repaint();
			}
		}
	};
	var mouseExit = function(e) {
		if (!morpheus.CanvasUtil.dragging && that.thumbMouseOver) {
			that.thumbMouseOver = false;
			that.repaint();
		}
	};
	$(this.canvas).on('mousemove', mouseMove).on('mouseout', mouseExit).on(
			'mouseenter', mouseMove);
	this.hammer = morpheus.Util
			.hammer(this.canvas, [ this.isVertical ? 'panv' : 'panh', 'tap' ])
			.on(
					'panstart',
					function(event) {
						var position = morpheus.CanvasUtil.getMousePos(
								event.target, event, true);
						if (position[that.field] >= that.thumbPos
								&& position[that.field] <= (that.thumbPos + that.thumbExtent)) {
							that.draggingThumb = true;
							that.dragStartThumbPos = that.thumbPos;
						} else {
							that.draggingThumb = false;
						}
					})
			.on('panend', function(event) {
				that.draggingThumb = false;
			})
			.on(
					'panmove',
					function(event) {
						if (that.draggingThumb) {
							var position = morpheus.CanvasUtil.getMousePos(
									event.target, event);
							var thumbPosPix = that.dragStartThumbPos
									+ (that.isVertical ? event.deltaY
											: event.deltaX);
							var f = thumbPosPix
									/ (that.visibleExtent - that.thumbExtent);
							var value = f * that.maxValue;
							// convert pix to value
							that.setValue(value, true);
							event.preventDefault();
							event.srcEvent.stopPropagation();
							event.srcEvent.stopImmediatePropagation();
						}
					})
			.on(
					'tap doubletap',
					function(event) {
						// ensure not clicked on the thumb
						if (!that.draggingThumb) {
							var position = morpheus.CanvasUtil.getMousePos(
									event.target, event);
							if (!that.decorator.tap(position)) {
								// scroll up or down by thumbExtent
								var thumbExtentToValue = (that.thumbExtent / that.totalExtent)
										* that.totalExtent;
								that.scrollToTop = position[that.field] < that.thumbPos;
								that.setValue(that.scrollToTop ? that.value
										- thumbExtentToValue : that.value
										+ thumbExtentToValue, true);
							}
						}
					});
};
morpheus.ScrollBar.prototype = {
	thumbPos : 0, // the top of the thumb, from 0 to visibleExtent-thumbExtent
	thumbExtent : 0,
	extent : 0,
	value : 0, // from 0 to totalExtent-extent
	maxValue : 0, // totalExtent-extent
	totalExtent : 0,
	visibleExtent : 0,
	dragStartThumbPos : 0,
	draggingThumb : false,
	thumbMouseOver : false,
	draw : function(clip, context) {
		var width = this.getUnscaledWidth();
		var height = this.getUnscaledHeight();
		if (this.visibleExtent === this.totalExtent) {
			context.clearRect(0, 0, width, height);
		} else {
			context.fillStyle = 'rgb(241,241,241)';
			context.fillRect(0, 0, width, height);
			context.fillStyle = !this.thumbMouseOver ? 'rgb(137,137,137)'
					: 'rgb(100,100,100)';
			if (this.isVertical) {
				context.fillRect(0, this.thumbPos, width, this.thumbExtent);
			} else {
				context.fillRect(this.thumbPos, 0, this.thumbExtent, height);
			}
		}
		this.decorator.draw(clip, context);
	},
	setThumbPosFromValue : function() {
		// value is thumb top position
		var f = this.maxValue == 0 ? 0 : this.value / this.maxValue;
		this.thumbPos = f * (this.visibleExtent - this.thumbExtent);
		this.thumbPos = Math.max(0, this.thumbPos);
	},
	getValue : function() {
		return this.value;
	},
	getMaxValue : function() {
		return this.maxValue;
	},
	setValue : function(value, trigger) {
		if (isNaN(value)) {
			value = 0;
		}
		if (this.visibleExtent === this.totalExtent) {
			value = 0;
		}
		value = Math.max(value, 0);
		value = Math.min(this.maxValue, value);
		this.value = value;
		this.setThumbPosFromValue();
		if (trigger) {
			this.trigger('scroll', this.value);
			this.repaint();
		}
		return this.value;
	},
	setTotalExtent : function(totalExtent) {
		this.totalExtent = totalExtent;
		this._setRange();
	},
	getTotalExtent : function() {
		return this.totalExtent;
	},
	_setRange : function() {
		this.thumbExtent = Math.max(10, this.visibleExtent
				* (this.visibleExtent / this.totalExtent));
		this.maxValue = this.totalExtent - this.visibleExtent;
		this.maxValue = Math.max(0, this.maxValue);
		if (this.isVertical) {
			this.setBounds({
				height : this.visibleExtent
			});
		} else {
			this.setBounds({
				width : this.visibleExtent
			});
		}
	},
	setExtent : function(visibleExtent, totalExtent, value) {
		this.visibleExtent = visibleExtent;
		this.totalExtent = totalExtent;
		this._setRange();
		this.setValue(value, false);
	}
};
morpheus.Util.extend(morpheus.ScrollBar, morpheus.AbstractCanvas);
morpheus.Util.extend(morpheus.ScrollBar, morpheus.Events);
morpheus.ShapeChooser = function(options) {
	var formBuilder = new morpheus.FormBuilder();
	var map = options.map;
	var html = [ '<select name="valuePicker" class="selectpicker" data-live-search="true">' ];
	map.forEach(function(val, key) {
		html.push('<option');
		html.push(' value="');
		html.push(key);
		html.push('">');
		html.push(key);
		html.push('</option>');
	});
	html.push('</select>');
	formBuilder.append({
		name : 'selected_value',
		type : 'custom',
		value : html.join('')
	});

	var shapeField = new morpheus.ShapeField();

	formBuilder.append({
		col : 'col-xs-2',
		name : 'selected_shape',
		type : 'custom',
		value : '<div data-name="shape"></div>'
	});
	shapeField.$el.appendTo(formBuilder.$form.find('[data-name=shape]'));

	var $valuePicker = formBuilder.$form.find('[name=valuePicker]');
	var selectedVal = $valuePicker.val();
	var _this = this;

	shapeField.setShapeValue(map.get(selectedVal));
	shapeField.on('change', function(e) {
		map.set(selectedVal, e.shape);
		_this.trigger('change', {
			value : selectedVal,
			shape : e.shape
		});

	});
	$valuePicker.selectpicker().change(function() {
		selectedVal = $valuePicker.val();
		shapeField.setShapeValue(map.get(selectedVal));
	});
	this.$div = formBuilder.$form;
};

morpheus.ShapeChooser.prototype = {};

morpheus.Util.extend(morpheus.ShapeChooser, morpheus.Events);

morpheus.ShapeField = function(shapes) {
	shapes = shapes || morpheus.VectorShapeModel.SHAPES;
	var _this = this;
	var html = [];
	var size2 = 8;
	var x = 4;
	var y = 4;
	html
			.push('<div style="margin-bottom:1em;" class="btn-group">');
	html
			.push('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span data-name="selection"></span> <span class="caret"></span></button>');
	html.push('<ul class="dropdown-menu" role="menu">');
	for (var i = 0; i < shapes.length; i++) {
		var context = new C2S(size2 * 2, size2 * 2);
		context.translate(4, 4);
		morpheus.CanvasUtil.drawShape(context, shapes[i], x, y, size2);
		var svg = context.getSerializedSvg();
		html.push('<li><a data-name="' + shapes[i] + '" href="#">' + svg
				+ '</a></li>');
	}
	html.push('<li><a data-name="none" href="#">(None)</a></li>');
	html.push('</ul></div>');
	var $el = $(html.join(''));
	var $header = $el.find('[data-name=selection]');
	$el.on('click', 'li > a', function(e) {
		var shape = $(this).attr('name');
		setShapeValue(shape);
		_this.trigger('change', {
			shape : shape
		});
	});
	var setShapeValue = function(val) {
		$header.data('name', val);
		if (val === 'none') {
			$header.html('(None)');
		} else {
			var context = new C2S(size2 * 2, size2 * 2);
			context.translate(4, 4);
			morpheus.CanvasUtil.drawShape(context, val, x, y, size2);
			$header.html(context.getSerializedSvg());
		}
	};
	this.setShapeValue = setShapeValue;
	this.$el = $el;
};
morpheus.ShapeField.prototype = {};
morpheus.Util.extend(morpheus.ShapeField, morpheus.Events);

morpheus.SortByValuesIndicator = function(project, isVertical, positions) {
	morpheus.AbstractCanvas.call(this, true);
	this.project = project;
	this.isVertical = isVertical;
	this.positions = positions;
	this.lastPosition = {
		start : -1,
		end : -1
	};
};
morpheus.SortByValuesIndicator.prototype = {
	prePaint : function(clip, context) {
		var positions = this.positions;
		var start = 0;
		var end = positions.getLength();
		if (!this.isVertical) {
			start = morpheus.Positions.getLeft(clip, positions);
			end = morpheus.Positions.getRight(clip, positions);
		} else {
			start = morpheus.Positions.getTop(clip, positions);
			end = morpheus.Positions.getBottom(clip, positions);
		}
		if (this.invalid || start !== this.lastPosition.start
				|| end !== this.lastPosition.end) {
			this.lastPosition.start = start;
			this.lastPosition.end = end;
			this.invalid = true;
		}
	},
	draw : function(clip, context) {
		var project = this.project;
		var isVertical = this.isVertical;
		var positions = this.positions;
		var sortKeys = isVertical ? project.getColumnSortKeys() : project
				.getRowSortKeys();
		context.translate(-clip.x, -clip.y);
		context.fillStyle = 'black';
		context.textBaseline = 'top';
		context.textAlign = 'left';
		context.font = '8px ' + morpheus.CanvasUtil.FONT_NAME;
		var start = 0;
		var end = positions.getLength();
		if (!isVertical) {
			start = morpheus.Positions.getLeft(clip, positions);
			end = morpheus.Positions.getRight(clip, positions);
		} else {
			start = morpheus.Positions.getTop(clip, positions);
			end = morpheus.Positions.getBottom(clip, positions);
		}
		var arrowWidth = 3;
		var arrowHeight = 4;
		for (var i = 0; i < sortKeys.length; i++) {
			var key = sortKeys[i];
			if (key instanceof morpheus.SortByValuesKey) { // are we sorting
				// columns by the
				// values in a row?

				var modelIndices = key.modelIndices;
				for (var j = 0; j < modelIndices.length; j++) {
					var modelIndex = modelIndices[j];
					var view = isVertical ? project
							.convertModelRowIndexToView(modelIndex) : project
							.convertModelColumnIndexToView(modelIndex);
					if (view !== -1 && view >= start && view < end) {
						context.save();
						var pix = positions.getPosition(view);
						var size = positions.getItemSize(view);
						if (!isVertical) {
							context.translate(pix + size / 2, 0);
						} else {
							context.translate(2, pix + size / 2);
						}
						context.beginPath();
						// if (!isVertical) {
						if (key.getSortOrder() === morpheus.SortKey.SortOrder.ASCENDING) {
							// up arrow
							context.moveTo(0, 0);
							context.lineTo(arrowWidth, arrowHeight);
							context.lineTo(-arrowWidth, arrowHeight);
						} else if (key.getSortOrder() === morpheus.SortKey.SortOrder.DESCENDING) { // down
							// arrow
							context.moveTo(0, arrowHeight);
							context.lineTo(arrowWidth, 0);
							context.lineTo(-arrowWidth, 0);
						} else { // diamond
							context.moveTo(0, 0);
							context.lineTo(arrowWidth, arrowHeight / 2);
							context.lineTo(0, arrowHeight);
							context.lineTo(-arrowWidth, arrowHeight / 2);

						}
						// } else {
						// if (!ascending) { // left arrow
						// context.moveTo(0, 0);
						// context.lineTo(arrowWidth, arrowHeight);
						// context.lineTo(arrowWidth, -arrowHeight);
						// } else {
						// context.moveTo(arrowWidth, 0); // right arrow
						// context.lineTo(0, arrowHeight);
						// context.lineTo(0, -arrowHeight);
						// }
						// }
						context.fill();

						// don't indicate sort priority b/c of limited space
//						if (sortKeys.length > 1) {
//							context.fillText('' + (i + 1), 0, 0);
//						}
						context.restore();
					}
				}
			}
		}
	}
};
morpheus.Util.extend(morpheus.SortByValuesIndicator, morpheus.AbstractCanvas);
morpheus.SortDialog = function(project) {
	var _this = this;
	// choose rows or columns
	var $chooserDiv = $('<div class="container-fluid"></div>');
	var $div = $('<div class="container-fluid"></div>');
	var html = [];
	html
			.push('<div style="border-bottom:1px solid LightGrey;margin-bottom:20px;" class="row">');
	html.push('<form class="form-horizontal" role="form">');
	html
			.push('<div class="col-xs-2"><label class="control-label">Sort</label></div>');
	html.push('<div class="col-xs-5">');
	html
			.push('<div class="radio"><label><input type="radio" name="rowsOrColumns" value="rows" checked>Rows</label></div>');
	html
			.push('<div class="radio"><label><input type="radio" name="rowsOrColumns" value="columns">Columns</label></div>');
	html.push('</div>');
	html.push('</form>');
	html.push('</div>');
	$chooserDiv.html(html.join(''));
	function toggle(isColumns) {
		_this.isColumns = isColumns;
		var $element = _this.build(project, isColumns);
		$div.empty().html($element);
		$div.on('click', '[data-name=delete]', function(e) {
			var $this = $(this);
			e.preventDefault();
			$this.closest('div.row').remove();
		});
		$div.on('click', '[data-name=add]', function(e) {
			var $this = $(this);
			var level = [];
			var $sibling = $this.closest('div.row');
			_this.createLevel(level, new morpheus.SortKey('',
					morpheus.SortKey.SortOrder.ASCENDING), _this.fields);
			$sibling.after($(level.join('')));
			e.preventDefault();
		});
	}
	$chooserDiv.on('change', '[name=rowsOrColumns]', function(e) {
		var $this = $(this);
		toggle($this.val() === 'columns');
	});
	toggle(false);
	var $outer = $('<div></div>');
	$chooserDiv.appendTo($outer);
	$div.appendTo($outer);
	morpheus.FormBuilder
			.showOkCancel({
				title : 'Sort',
				content : $outer,
				okCallback : function() {
					var $forms = $div.find('form');
					var sortBy = $forms.find('[name=sortBy]').map(function() {
						return $(this).val();
					});
					var sortOrder = $forms.find('[name=sortOrder]:checked')
							.map(function() {
								return $(this).val();
							});
					var groupBy = $div.find('[name=groupBy]').val();
					var newSortKeys = [];
					var modelIndices = _this.isColumns ? project
							.getRowSelectionModel().toModelIndices() : project
							.getColumnSelectionModel().toModelIndices();
					var existingSortKeys = _this.isColumns ? project
							.getColumnSortKeys() : project.getRowSortKeys();
					// keep MatchesOnTopSortKey and dendrogram
					var keysToKeep = _
							.filter(
									existingSortKeys,
									function(key) {
										return key instanceof morpheus.MatchesOnTopSortKey
												|| (key instanceof morpheus.SpecifiedModelSortOrder && key.name === 'dendrogram');
									});
					if (keysToKeep.length > 0) {
						_.each(keysToKeep, function(key) {
							newSortKeys.push(key);
						});
					}
					var newSortKeyFields = new morpheus.Set();
					for (var i = 0; i < sortBy.length; i++) {
						if (!newSortKeyFields.has(sortBy[i])) {
							newSortKeyFields.add(sortBy[i]);
							if (sortBy[i] === 'selection') {
								newSortKeys.push(new morpheus.SortByValuesKey(
										modelIndices, sortOrder[i],
										_this.isColumns));
							} else if (sortBy[i] !== '') {
								newSortKeys.push(new morpheus.SortKey(
										sortBy[i], sortOrder[i]));
							}
						}
					}
					var newGroupKeys = [];
					if (groupBy != null) {
						for (var i = 0; i < groupBy.length; i++) {
							newGroupKeys.push(new morpheus.SortKey(groupBy[i],
									morpheus.SortKey.SortOrder.UNSORTED));
						}
					}

					if (_this.isColumns) {
						project.setGroupColumns(newGroupKeys, false);
						project.setColumnSortKeys(morpheus.SortKey
								.keepExistingSortKeys(newSortKeys, project
										.getColumnSortKeys()), true);
					} else {
						project.setGroupRows(newGroupKeys, false);
						project.setRowSortKeys(morpheus.SortKey
								.keepExistingSortKeys(newSortKeys, project
										.getRowSortKeys()), true);
					}
				}
			});
};
morpheus.SortDialog.prototype = {
	isColumns : false,
	build : function(project, isColumns) {
		var fields = morpheus.MetadataUtil.getMetadataNames(isColumns ? project
				.getFullDataset().getColumnMetadata() : project
				.getFullDataset().getRowMetadata());
		this.fields = fields;
		var html = [];
		var sortKeys = isColumns ? project.getColumnSortKeys() : project
				.getRowSortKeys();
		this.createLevel0(html);
		for (var i = 0; i < sortKeys.length; i++) { // add existing keys
			// ignoring
			// MatchesOnTopSortKey and
			// dendrogram
			if (!(sortKeys[i] instanceof morpheus.MatchesOnTopSortKey)
					&& !(sortKeys[i] instanceof morpheus.SpecifiedModelSortOrder && sortKeys[i].name === 'dendrogram')) {
				this.createLevel(html, sortKeys[i], fields);
			}
		}
		// group by
		html.push('<div class="row">');
		html
				.push('<form name="groupByForm" class="form-horizontal" role="form">');
		html.push('<div class="col-xs-2"><label>Group by</label></div>');
		html.push('<div class="col-xs-4">');
		var groupByKeys = (isColumns ? project.getGroupColumns() : project
				.getGroupRows()).map(function(key) {
					return key.field;
				});

		html.push('<select multiple name="groupBy" class="form-control">');
		_.each(fields, function(field) {
			html.push('<option value="' + field + '"');
			if (_.indexOf(groupByKeys, field) !== -1) {
				html.push(' selected');
			}
			html.push('>');
			html.push(field);
			html.push('</option>');
		});
		html.push('</select>');
		html.push('</form>');
		html.push('</div>');
		return $(html.join(''));
	},
	createLevel0 : function(html) {
		html
				.push('<div style="border-bottom:1px solid LightGrey;margin-bottom:20px;" class="row">');
		html.push('<form class="form-horizontal" role="form">');
		html.push('<div class="col-xs-8">');
		html.push('<a data-name="add" href="#">Add sort level</a>');
		html.push('</div>');
		html.push('</form>');
		html.push('</div>');
	},
	createLevel : function(html, key, fields) {
		html
				.push('<div style="border-bottom:1px solid LightGrey;margin-bottom:20px;" class="row">');
		html.push('<form class="form-horizontal" role="form">');
		html
				.push('<div class="col-xs-2"><label class="control-label">Sort by</label></div>');
		html.push('<div class="col-xs-4">');
		html.push('<select name="sortBy" class="form-control">');
		html.push('<option value=""></option>');
		html.push('<option value="selection"'
				+ (key instanceof morpheus.SortByValuesKey ? ' selected' : '')
				+ '>selection</option>');
		_.each(fields, function(field) {
			html.push('<option value="' + field + '"');
			if (field == key.field) {
				html.push(' selected');
			}
			html.push('>');
			html.push(field);
			html.push('</option>');
		});
		html.push('</select>');
		html.push('</div>');
		html.push('<div class="col-xs-5">');
		html
				.push('<div class="radio"><label><input type="radio" name="sortOrder" value="ascending"'
						+ (morpheus.SortKey.SortOrder.ASCENDING == key
								.getSortOrder() ? ' checked' : '')
						+ '>Ascending</label></div>');
		html
				.push('<div class="radio"><label><input type="radio" name="sortOrder" value="descending"'
						+ (morpheus.SortKey.SortOrder.DESCENDING == key
								.getSortOrder() ? ' checked' : '')
						+ '>Descending</label></div>');
		html.push('</div>');
		html.push('<div class="col-xs-1">');
		html.push('<a data-name="delete" class="pull-right">Delete</a>');
		html.push('</div>');
		html.push('<div class="col-xs-8">');
		html.push('<a data-name="add" href="#">Add sort level</a>');
		html.push('</div>');
		html.push('</form>');
		html.push('</div>');
	}
};

morpheus.Spacer = function(width, height) {
	this.width = width;
	this.height = height;
};
morpheus.Spacer.prototype = {
	prefWidth : undefined,
	prefHeight : undefined,
	visible : true,
	dispose : function() {
	},
	getPrefWidth : function() {
		return this.prefWidth;
	},
	draw : function(clip) {
	},
	getPreferredSize : function() {
		return {
			width : this.width,
			height : this.height
		};
	},
	setBounds : function() {
	},
	getPrefHeight : function() {
		return this.prefHeight;
	},
	setPrefWidth : function(prefWidth) {
		this.prefWidth = prefWidth;
	},
	setPrefHeight : function(prefHeight) {
		this.prefHeight = prefHeight;
	},
	isVisible : function() {
		return this.visible;
	},
	setVisible : function(visible) {
		this.visible = visible;
	},
	getWidth : function() {
		return this.width;
	},
	getHeight : function() {
		return this.height;
	}
};
morpheus.SteppedColorSupplier = function() {
	morpheus.AbstractColorSupplier.call(this);
	this.hiddenValue = 0;
	this.hiddenValues = new morpheus.Set();
	this.stepped = true;
};
/**
 * Convert value from input data range of input0 to input1 to pixel range of
 * pix0, pix1.
 * 
 * @return The converted value.
 */
morpheus.SteppedColorSupplier.linearScale = function(value, input0, input1,
		pix0, pix1) {
	return (value - input0) / (input1 - input0) * (pix1 - pix0) + pix0;
};
morpheus.SteppedColorSupplier.prototype = {
	createInstance : function() {
		return new morpheus.SteppedColorSupplier();
	},
	isStepped : function() {
		return true;
	},
	getHiddenValues : function() {
		return this.hiddenValues;
	},
	getIndexForFraction : function(f) {
		var fractions = this.fractions;
		if (f <= fractions[0]) {
			return 0;
		}
		if (f >= fractions[fractions.length - 1]) {
			return fractions.length - 1;
		}
		// Intervals exclude right end point and include left end point except
		// for the highest interval which includes everything > min
		for (var i = 0; i < fractions.length - 1; i++) {
			var left = fractions[i];
			var right = fractions[i + 1];
			if (f >= left && f < right) {
				return i;
			}
		}
		return fractions.length - 1;
	},
	getColor : function(row, column, value) {
		if (this.hiddenValues.has(value)) {
			value = this.hiddenValue;
		}
		if (isNaN(value)) {
			return this.missingColor;
		}
		var min = this.min;
		var max = this.max;
		var colors = this.colors;
		if (value <= min) {
			return colors[0];
		} else if (value >= max) {
			return colors[colors.length - 1];
		}
		var fraction = morpheus.SteppedColorSupplier.linearScale(value, min,
				max, 0, 100) / 100;
		return colors[this.getIndexForFraction(fraction)];
	}
};
morpheus.Util.extend(morpheus.SteppedColorSupplier,
		morpheus.AbstractColorSupplier);
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

/**
 * @param options.$el The jQuery element to render to. Must be in the DOM.
 * @param options.items An array of items to display in the table
 * @param options.search Whether to create a search widget
 * @param options.rowHeader Renderer to call for each row in the table
 * @param options.rowHeight Table row height
 * @param height: Height in pixels of table. '564px',
 * @param options.collapseBreakpoint: 500
 * @param options.showHeader: true
 * @param options.select: true
 * @param options.responsive: true
 * @param options.fixedWidth: Fixed table with when responsive is false. '320px'
 * @param options.columns An array of column descriptors. Each column can have the properties:
 * visible, name, field, renderer
 */



morpheus.Table = function (options) {
	options = morpheus.Table.createOptions(options);
	this.options = options;
	if (!options.width) {
		options.width = options.$el.attr('class');
	}
	var _this = this;

	var height = options.height;
	var $gridDiv = $('<div class="slick-table'
		+ (options.tableClass ? (' ' + options.tableClass) : '')
		+ '" style="width:' + options.fixedWidth + ';height:' + height
		+ '"></div>');

	this.$gridDiv = $gridDiv;
	$gridDiv.appendTo(options.$el);
	// all columns (including those that are currently not visible */
	var columns = options.columns;
	this.columns = columns;
	var visibleColumns = columns.filter(function (c) {
		return c.visible;
	});
	var grid = new morpheus.Grid({
		gridOptions: {
			select: options.select,
			rowHeight: options.rowHeight,
			autoEdit: false,
			editable: false,
			autoHeight: options.height === 'auto',
			enableTextSelectionOnCells: true,
		},
		$el: $gridDiv,
		items: options.items,
		columns: visibleColumns
	});
	this.grid = grid;
	this.searchFunction = null;
	var searchFilter = {
		isEmpty: function () {
			return _this.searchFunction == null;
		},
		init: function () {
		},
		accept: function (item) {
			return _this.searchFunction(item);
		}
	};
	// add empty search filter
	this.grid
	.getFilter().add(searchFilter);
	var $header = $('<div class="slick-table-header"><div name="top"></div><div style="display: inline-block;" name="left" class="pad-bottom-8 pad-top-8"></div><div name="right" class="pull-right pad-bottom-8' +
		' pad-top-8"></div></div>');
	this.$header = $header;
	var $right = $header.find('.pull-right');
	if (options.search) {
		var tableSearch = new morpheus.TableSearchUI({
			$el: $header.find('[name=top]'),
			$right: $right
		});
		tableSearch.setTable(this);
		this.tableSearch = tableSearch;
	}
	if (options.columnPicker && visibleColumns.length !== this.columns.length) {
		var select = [];
		select
		.push('<select data-width="90px" data-selected-text-format="static" title="Columns..." multiple class="pad-left-4 selectpicker show-tick">');
		// sort column names
		var sortedColumns = this.columns.slice().sort(function (a, b) {
			a = a.name.toLowerCase();
			b = b.name.toLowerCase()
			return (a === b ? 0 : (a < b ? -1 : 1));
		});
		sortedColumns.forEach(function (c, i) {
			select.push('<option value="' + i + '"');
			if (c.visible) {
				select.push(' selected');
			}
			select.push('>');
			select.push(c.name);
			select.push('</option>');
		});
		select.push('</select>');
		var $select = $(select.join(''));
		$select.appendTo($right);
		$select.selectpicker({
			iconBase: 'fa',
			tickIcon: 'fa-check',
			style: 'btn-default btn-xs'
		});
		$select.on('change', function () {
			var oldColumns = grid.getColumns().map(function (c) {
				return c.id;
			});
			var selectedColumnIndices = $select.val();
			visibleColumns = [];
			for (var i = 0; i < selectedColumnIndices.length; i++) {
				visibleColumns.push(sortedColumns[parseInt(selectedColumnIndices[i])]);
			}
			var newColumns = visibleColumns.map(function (c) {
				return c.id;
			});

			grid.setColumns(visibleColumns);

			if (newColumns.length > oldColumns.length) {
				var set = new morpheus.Set();
				for (var i = 0; i < newColumns.length; i++) {
					set.add(newColumns[i]);
				}
				for (var i = 0; i < oldColumns.length; i++) {
					set.remove(oldColumns[i]);
				}
				var added = set.values();

				grid.setSortColumns([{
					columnId: added[0],
					sortAsc: true
				}]);
			}
			// if column added, sort by added column
			_this.resize();
			_this.redraw();

		});
	}
	$header.prependTo(options.$el);
	var collapsed = false;
	var lastWidth = -1;
	var resize = function () {
		if (!_this.options.responsive) {
			return;
		}

		var gridWidth = options.$el.width();
		if (gridWidth === lastWidth) {
			return;
		}
		lastWidth = gridWidth;

		$gridDiv.css('width', gridWidth + 'px');
		// if (options.responsiveHeight) {
		// var verticalPosition = _this.$gridDiv[0].getBoundingClientRect().top
		// + window.pageYOffset;
		// $gridDiv.css('height',
		// (document.body.clientHeight - verticalPosition) + 'px');
		// }
		if (!collapsed && gridWidth < options.collapseBreakpoint
			&& visibleColumns.length > 1) {
			collapsed = true;
			$gridDiv.addClass('slick-stacked');

			_this.grid.grid.getOptions().rowHeight = (options.collapsedRowHeight ? options.collapsedRowHeight : options.rowHeight)
				* visibleColumns.length;
			// collapse
			_this.grid.grid
			.setColumns([{
				id: 0,
				tooltip: function (item, value) {
					var html = [];
					for (var i = 0; i < visibleColumns.length; i++) {
						var text = visibleColumns[i].tooltip(item, visibleColumns[i]
						.getter(item));
						if (text != null && text !== '') {
							html.push(text);
						}
					}
					return html.join('<br />');
				},
				collapsed: true,
				getter: function (item) {
					return item;
				},
				formatter: function (row, cell, value, columnDef,
									 dataContext) {
					var html = [];
					html
					.push('<div class="slick-table-wrapper"><div class="slick-cell-wrapper">');
					if (options.rowHeader) { // e.g. render checkbox
						html.push(options.rowHeader(dataContext));
						html.push('<div style="height:4px;"></div>');
					}
					for (var i = 0; i < visibleColumns.length; i++) {
						if (i > 0) {
							html.push('<div style="height:4px;"></div>');
						}
						var c = visibleColumns[i];
						html.push(c.name);
						html.push(':');
						var s = c.renderer(dataContext, c
						.getter(dataContext));
						html.push(s);

					}
					html.push('</div></div>');
					return html.join('');
				},
				sortable: false,
				name: ''
			}]);
			$gridDiv.find('.slick-header').hide();
			_this.grid.grid.resizeCanvas();
			_this.grid.grid.invalidate();

		} else if (collapsed && gridWidth >= options.collapseBreakpoint) {
			$gridDiv.removeClass('slick-stacked');
			collapsed = false;
			if (options.showHeader) {
				$gridDiv.find('.slick-header').show();
			}
			_this.grid.grid.getOptions().rowHeight = options.rowHeight;
			_this.grid.grid.setColumns(visibleColumns);
			_this.grid.grid.resizeCanvas();
			if (options.select) {
				_this.grid.grid.setSelectedRows(_this.grid.grid
				.getSelectedRows());
			}
			_this.grid.grid.invalidate();
		} else {
			_this.grid.grid.resizeCanvas();
			_this.grid.grid.invalidate();
		}
		_this.grid.maybeAutoResizeColumns();

	};
	if (!options.showHeader) {
		$gridDiv.find('.slick-header').hide();
	}
	if (options.responsive) {
		$(window).on('resize orientationchange', resize);
		$gridDiv.on('remove', function () {
			$(window).off('resize', resize);
		});
		resize();
	}
	this.resize = resize;
	if (visibleColumns.length > 1 && options.items != null
		&& options.items.length > 0) {
		this.setItems(options.items);
	}
	if (!$gridDiv.is(':visible')) {
		// find 1st parent that is not visible
		var $parent = $gridDiv;
		var observer = new MutationObserver(function (mutations) {
			if (window.getComputedStyle($parent[0]).display !== 'none') {
				observer.disconnect();
				resize();
			}
		});

		while ($parent.length > 0) {
			if (window.getComputedStyle($parent[0]).display === 'none') {
				break;
			}
			$parent = $parent.parent();

		}

		if ($parent.length > 0) {
			observer.observe($parent[0], {
				attributes: true,
				childList: false,
				characterData: false
			});
		}

	}
}
;

morpheus.Table.defaultRenderer = function (item, value) {
	if (value == null) {
		return '';
	} else if (_.isNumber(value)) {
		return morpheus.Util.nf(value);
	} else if (morpheus.Util.isArray(value)) {
		var s = [];
		for (var i = 0, length = value.length; i < length; i++) {
			if (i > 0) {
				s.push(', ');
			}
			var val = value[i];
			s.push(value[i]);
		}
		return s.join('');
	} else {
		return '' + value;
	}
};

morpheus.Table.prototype = {
	toText: function () {
		var text = [];
		var items = this.getItems();
		var columns = this.columns.filter(function (c) {
			return c.visible;
		});
		for (var j = 0; j < columns.length; j++) {
			if (j > 0) {
				text.push('\t');
			}
			text.push(columns[j].name);
		}
		text.push('\n');
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			for (var j = 0; j < columns.length; j++) {
				if (j > 0) {
					text.push('\t');
				}
				var value = columns[j].getter(item);
				text.push(morpheus.Util.toString(value));
			}
			text.push('\n');
		}
		return text.join('');
	},
	setHeight: function (height) {
		this.options.height = height;
		if (height === 'auto') {
			this.$gridDiv.css('height', '');
			this.grid.grid.getOptions().autoHeight = true;
			this.grid.grid.setOptions(this.grid.grid.getOptions());

		} else {
			this.$gridDiv.css('height', height);
		}
		this.grid.grid.resizeCanvas();
		if (height === 'auto') {
			var height = this.getItems().length * this.options.rowHeight
				+ this.options.rowHeight;
			this.$gridDiv.find('.slick-viewport').css('height', height + 'px');
		}
		this.grid.grid.invalidate();

	},
	setSearchVisible: function (visible) {
		this.$header.find('[name=search]').css('display', visible ? '' : 'none');
	},
	autocomplete: function (tokens, response) {
		var matches = [];
		var token = tokens != null && tokens.length > 0 ? tokens[tokens.selectionStartIndex]
			: '';
		token = $.trim(token);
		var columns = this.columns.filter(function (c) {
			return (c.searchable && c.visible) || c.alwaysSearch;
		});

		var ncolumns = columns.length;
		var showField = ncolumns > 1;
		if (token === '') {
			if (ncolumns <= 1) {
				return response(matches);
			}
			for (var i = 0; i < ncolumns; i++) {
				var field = columns[i].name;
				matches.push({
					value: field + ':',
					label: '<span style="font-weight:300;">' + field
					+ ':</span>',
					show: true
				});
				// show column names

			}
			matches
			.sort(function (a, b) {
				return (a.value === b.value ? 0
					: (a.value < b.value ? -1 : 1));
			});
			return response(matches);
		}
		var field = null;
		var semi = token.indexOf(':');
		var regex = new RegExp('^' + morpheus.Util.escapeRegex(token), 'i');
		if (semi > 0) { // field search?
			if (token.charCodeAt(semi - 1) !== 92) { // \:
				var possibleField = $.trim(token.substring(0, semi));
				if (possibleField.length > 0 && possibleField[0] === '"'
					&& possibleField[token.length - 1] === '"') {
					possibleField = possibleField.substring(1,
						possibleField.length - 1);
				}
				var columnNameToColumn = new morpheus.Map();
				var columnNames = columns.map(function (c) {
					return c.name;
				});
				for (var i = 0; i < columnNames.length; i++) {
					columnNameToColumn.set(columnNames[i], columns[i]);
				}
				var c = columnNameToColumn.get(possibleField);
				if (c !== undefined) {
					token = $.trim(token.substring(semi + 1));
					columns = [c];
					ncolumns = 1;
				}
			}

		} else if (ncolumns > 1) {
			var regex = new RegExp('^' + morpheus.Util.escapeRegex(token), 'i');
			for (var j = 0; j < ncolumns; j++) {
				var field = columns[j].name;
				if (regex.test(field)) {
					matches.push({
						value: field + ':',
						label: '<span style="font-weight:300;">' + field
						+ ':</span>',
						show: true
					});
				}
			}
		}
		var set = new morpheus.Set();
		var regex = new RegExp('^' + morpheus.Util.escapeRegex(token), 'i');
		var items = this.getItems();
		var dataTypes = [];
		// filter numeric columns
		var filteredColumns = [];
		columns.forEach(function (c) {
			var dataType = null;
			for (var i = 0, nitems = items.length; i < nitems; i++) {
				var value = c.getter(items[i]);
				if (value != null) {
					dataType = morpheus.Util.getDataType(value);
					break;
				}
			}
			if (dataType === 'string' || dataType === '[string]') {
				dataTypes.push(dataType);
				filteredColumns.push(c);
			}
		});
		columns = filteredColumns;
		ncolumns = columns.length;
		var maxSize = matches.length + 10;
		for (var i = 0, nitems = items.length; i < nitems; i++) {
			var item = items[i];
			for (var j = 0; j < ncolumns; j++) {
				var field = columns[j].name;
				var value = columns[j].getter(item);
				var dataType = dataTypes[j];
				if (dataType === '[string]') {
					var nvalues = value == null ? 0 : value.length;
					for (var k = 0; k < nvalues; k++) {
						var val = value[k];
						if (regex.test(val) && !set.has(val)) {
							set.add(val);
							matches
							.push({
								value: showField ? (field + ':' + val)
									: val,
								label: showField ? ('<span style="font-weight:300;">'
								+ field
								+ ':</span>'
								+ '<span style="font-weight:900;">'
								+ val + '</span>')
									: ('<span style="font-weight:900;">'
								+ val + '</span>')
							});
						}
						if (matches.length === maxSize) {
							return response(matches);
						}
					}
				} else {
					if (regex.test(value) && !set.has(value)) {
						set.add(value);
						matches
						.push({
							value: showField ? (field + ':' + value)
								: value,
							label: showField ? ('<span style="font-weight:300;">'
							+ field
							+ ':</span>'
							+ '<span style="font-weight:900;">'
							+ value + '</span>')
								: ('<span style="font-weight:900;">'
							+ value + '</span>')
						});
						if (matches.length === maxSize) {
							return response(matches);
						}
					}
				}

			}
		}
		return response(matches);

	},
	searchWithPredicates: function (predicates) {
		if (predicates == null || predicates.length === 0) {
			this.searchFunction = null;
			this.grid
			.setFilter(this.grid
			.getFilter());
			return;
		}
		var columns = this.columns.filter(function (c) {
			return (c.searchable && c.visible) || c.alwaysSearch;
		});
		var columnNameToColumn = new morpheus.Map();
		var columnNames = columns.map(function (c) {
			return c.name;
		});
		for (var i = 0; i < columnNames.length; i++) {
			columnNameToColumn.set(columnNames[i], columns[i]);
		}

		var filteredPredicates = [];
		var npredicates = predicates.length;
		for (var i = 0; i < npredicates; i++) {
			var predicate = predicates[i];
			var filterColumnName = predicate.getField();
			if (filterColumnName != null) {
				var column = columnNameToColumn.get(filterColumnName);
				if (column) {
					predicate.column = column;
					filteredPredicates.push(predicate);
				}
			} else {
				filteredPredicates.push(predicate);
			}
		}
		predicates = filteredPredicates;
		npredicates = predicates.length;
		var f = function (item) {
			for (var p = 0; p < npredicates; p++) {
				var predicate = predicates[p];
				var searchColumns;
				if (predicate.column) {
					searchColumns = [predicate.column];
				} else {
					searchColumns = columns;
				}
				for (var j = 0, ncolumns = searchColumns.length; j < ncolumns; j++) {
					var value = searchColumns[j].getter(item);
					if (morpheus.Util.isArray(value)) {
						var nvalues = value.length;
						for (var i = 0; i < nvalues; i++) {
							if (predicate.accept(value[i])) {
								return true;
							}
						}
					} else {
						var predicate = predicates[p];
						if (predicate.accept(value)) {
							return true;
						}
					}
				}

			}

			return false;
		};
		this.searchFunction = f;
		this.grid
		.setFilter(this.grid
		.getFilter());
	},
	search: function (text) {
		if (text === '') {
			this.searchFunction = null;
			this.grid
			.setFilter(this.grid
			.getFilter());
		} else {
			var tokens = morpheus.Util.getAutocompleteTokens(text);
			var columns = this.columns.filter(function (c) {
				return (c.searchable && c.visible) || c.alwaysSearch;
			});
			var columnNames = columns.map(function (c) {
				return c.name;
			});
			var predicates = morpheus.Util.createSearchPredicates({
				tokens: tokens,
				fields: columnNames
			});
			this.searchWithPredicates(predicates);
		}
	},
	getSelectedRows: function () {
		return this.grid.getSelectedRows();
	},
	getSelectedItems: function () {
		return this.grid.getSelectedItems();
	},
	getSelectedItem: function () {
		return this.grid.getSelectedItem();
	},
	setSelectedRows: function (rows) {
		this.grid.setSelectedRows(rows);
	},
	getItems: function (items) {
		return this.grid.getItems();
	},
	getAllItemCount: function () {
		return this.grid.getAllItemCount();
	},
	getFilteredItemCount: function () {
		return this.grid.getFilteredItemCount();
	},
	setFilter: function (f) {
		this.grid.setFilter(f);
	},
	getFilter: function () {
		return this.grid.getFilter();
	},
	setItems: function (items) {
		this.grid.setItems(items);
		this.grid.redraw();
		// TODO update height?
	},
	redraw: function () {
		this.grid.redraw();
	},
	/**
	 * @param evtStr
	 *            selectionChanged
	 */
	on: function (evtStr, handler) {
		this.grid.on(evtStr, handler);
		return this;
	},
	off: function (evtStr, handler) {
		this.grid.off(evtStr, handler);
		return this;
	},
	trigger: function (evtStr) {
		this.grid.trigger(evtStr);
	}
};

morpheus.Table.createOptions = function (options) {
	options = $.extend(true, {}, {
		items: [],
		height: '564px',
		collapseBreakpoint: 400,
		showHeader: true,
		select: true,
		rowHeader: null,
		responsive: true,
		fixedWidth: '320px',
		columnPicker: true
	}, options);

	if (!options.columns) {
		options.columns = [{
			name: ''
		}];
	}
	var columns = [];
	options.columns.forEach(function (c, i) {
		var column = $.extend(true, {}, {
			id: i,
			tooltip: function (dataContext, value) {
				return morpheus.Table.defaultRenderer(dataContext, value);
			},
			formatter: function (row, cell, value, columnDef, dataContext) {

				var html = [];
				html.push('<div class="slick-table-wrapper"><div class="slick-cell-wrapper">');
				if (options.rowHeader && cell === 0) {
					html.push(options.rowHeader(dataContext));
				}
				html.push(column.renderer(dataContext, value));
				html.push('</div></div>');
				return html.join('');

			},
			comparator: function (a, b) {
				var aNaN = (a == null || _.isNumber(a) && isNaN(a));
				var bNaN = (b == null || _.isNumber(b) && isNaN(b));
				if (aNaN && bNaN) {
					return 0;
				}
				if (aNaN) {
					return 1;
				}
				if (bNaN) {
					return -1;
				}
				if (a.toLowerCase) {
					a = a.toLowerCase();
				}
				if (b.toLowerCase) {
					b = b.toLowerCase();
				}

				return (a === b ? 0 : (a < b ? -1 : 1));
			},
			sortable: true,
			searchable: true,
			width: null,
			name: c.name,
			renderer: morpheus.Table.defaultRenderer
		}, c);

		if (column.visible === undefined) {
			column.visible = true;
		}
		if (!column.getter) {
			column.getter = column.field == null ? function (item) {
				return item;
			} : function (item) {
				return item[c.field];
			};
		}

		columns.push(column);
	});

	options.columns = columns;
	if (options.columns.length === 1) {
		options.tableClass = 'slick-table-compact';
	} else {
		options.tableClass = 'slick-bordered-table';
	}
	if (!options.rowHeight) {
		// options.rowHeight = options.tableClass === 'slick-table-compact' ? 18
		// 	: 20;
		options.rowHeight = 22;
	}
	return options;
};

morpheus.TableSearchUI = function (options) {
	var _this = this;
	var $search = $('<input name="search" type="text" class="form-control input-sm"' +
		' placeholder="Search" autocomplete="off">');
	$search.appendTo(options.$el);
	this.$search = $search;
	this.$searchResults = $('<span class="pad-top-2 tableview-rowcount" name="search"></span>');
	this.$showAll = $('<div style="display:inline-block;min-width:60px;" name="search" class="pad-left-8 text-button-copy tableview-rowcount">Show' +
		' all</div>');
	this.$searchResults.appendTo(options.$right);
	this.$showAll.appendTo(options.$right);
	this.$showAll.on('click', function (e) {
		e.preventDefault();
		$search.val('');
		_this.table.search('');
		_this.table.trigger('showAll', {table: _this.table});

	});
	$search.on('keyup', _.debounce(function () {
		_this.table.search($.trim($(this).val()));
	}, 100));
	morpheus.Util.autosuggest({
		$el: $search,
		suggestWhenEmpty: true,
		filter: function (tokens, response) {
			_this.table.autocomplete(tokens, response);
		},
		select: function () {
			_this.table.search($.trim($search.val()));
		}
	});
};

morpheus.TableSearchUI.prototype = {
	updateSearchLabel: function () {
		var text = 'Showing: ' + morpheus.Util.intFormat(this.table.getFilteredItemCount()) + ' / ' + morpheus.Util.intFormat(this.table.getAllItemCount());
		this.$searchResults.html(text);
	},
	setTable: function (table) {
		this.table = table;
		var _this = this;

		table.on('filter', function () {
			_this.updateSearchLabel();
		});

	}

};


morpheus.TrackSelection = function(track, positions, selectionModel, isColumns,
		controller) {
	var canvas = track.canvas;
	var startIndex = -1;
	var coord = isColumns ? 'x' : 'y';

	function getPosition(event, useDelta) {
		if (track.settings.squished) {
			var total = positions.getPosition(positions.getLength() - 1)
					+ positions.getItemSize(positions.getLength() - 1);
			var squishFactor = total
					/ (isColumns ? track.getUnscaledWidth() : track
							.getUnscaledHeight());
			var clientXY = morpheus.CanvasUtil.getClientXY(event, useDelta);
			var p = morpheus.CanvasUtil.getMousePosWithScroll(event.target,
					event, 0, 0, useDelta);
			p[coord] *= squishFactor;
			return p;

		} else {
			return morpheus.CanvasUtil.getMousePosWithScroll(event.target,
					event, controller.scrollLeft(), controller.scrollTop(),
					useDelta);
		}

	}

	this.hammer = morpheus.Util
			.hammer(canvas, [ 'pan', 'tap', 'longpress' ])
			.on('longpress', function(event) {
				event.preventDefault();
				event.srcEvent.stopImmediatePropagation();
				event.srcEvent.stopPropagation();
				controller.setSelectedTrack(track.name, isColumns);
				track.showPopup(event.srcEvent);
			})
			.on(
					'panmove',
					function(event) {
						var position = getPosition(event);
						var endIndex = positions.getIndex(position[coord],
								false);
						var commandKey = morpheus.Util.IS_MAC ? event.srcEvent.metaKey
								: event.srcEvent.ctrlKey;
						var viewIndices = commandKey ? selectionModel
								.getViewIndices() : new morpheus.Set();
						var _startIndex = startIndex;
						if (startIndex > endIndex) {
							var tmp = endIndex;
							endIndex = _startIndex;
							_startIndex = tmp;
						}
						for (var i = _startIndex; i <= endIndex; i++) {
							viewIndices.add(i);
						}
						selectionModel.setViewIndices(viewIndices, true);
						if (!isColumns) {
							var scrollTop = controller.scrollTop();
							var scrollBottom = scrollTop
									+ controller.heatmap.getUnscaledHeight();
							if (position.y > scrollBottom) {
								controller.scrollTop(scrollTop + 8);
							} else if (position.y < scrollTop) {
								controller.scrollTop(scrollTop - 8);
							}
						} else {
							var scrollLeft = controller.scrollLeft();
							var scrollRight = scrollLeft
									+ controller.heatmap.getUnscaledWidth();
							if (position.x > scrollRight) {
								controller.scrollLeft(scrollLeft + 8);
							} else if (position.x < scrollLeft) {
								controller.scrollLeft(scrollLeft - 8);
							}
						}
						event.preventDefault();
						event.srcEvent.stopPropagation();
						event.srcEvent.stopImmediatePropagation();
					})
			.on('panstart', function(event) {
				controller.setSelectedTrack(track.name, isColumns);
				var position = getPosition(event, true);
				startIndex = positions.getIndex(position[coord], false);
			})
			.on(
					'tap doubletap',
					function(event) {
						var position = getPosition(event);
						var index = positions.getIndex(position[coord], false);
						if (event.tapCount > 1) {
							if ((isColumns && !controller.options.columnsSortable)
									|| (!isColumns && !controller.options.rowsSortable)) {
								return;
							}
							// var viewIndices = new morpheus.Set();
							// viewIndices.add(index);
							// selectionModel.setViewIndices(viewIndices,
							// false);
							controller.sortBasedOnSelection(null, isColumns,
									event.srcEvent.shiftKey);
						} else {
							controller.setSelectedTrack(track.name, isColumns);
							var commandKey = morpheus.Util.IS_MAC ? event.srcEvent.metaKey
									: event.srcEvent.ctrlKey;
							if (morpheus.Util.IS_MAC && event.srcEvent.ctrlKey) { // right-click
								// on
								// Mac
								return;
							}
							var viewIndices;
							if (commandKey) { // toggle selection
								viewIndices = selectionModel.getViewIndices();
								if (viewIndices.has(index)) {
									viewIndices.remove(index);
								} else {
									viewIndices.add(index);
								}
							} else if (event.srcEvent.shiftKey) { // add to
								// selection
								viewIndices = selectionModel.getViewIndices();
								var min = Number.MAX_VALUE;
								var max = -Number.MAX_VALUE;
								for ( var viewIndex in viewIndices) {
									min = Math.min(viewIndex, min);
									max = Math.max(viewIndex, max);
								}
								if (index >= max) { // select from index to max
									for (var i = max; i <= index; i++) {
										viewIndices.add(i);
									}
								} else {// select from index to min
									for (var i = Math.min(index, min), max = Math
											.max(index, min); i <= max; i++) {
										viewIndices.add(i);
									}
								}
							} else {
								viewIndices = new morpheus.Set();
								viewIndices.add(index);
							}
							selectionModel.setViewIndices(viewIndices, true);
						}
					});
};
morpheus.TrackSelection.prototype = {
	dispose : function() {
		this.hammer.destroy();
	}
};
morpheus.VectorTrack = function (project, name, positions, isColumns, heatmap) {
	morpheus.AbstractCanvas.call(this, true);
	this.preferredSize = {
		width: 0,
		height: 0
	};
	this.project = project;
	this.positions = positions;
	this.isColumns = isColumns;
	this.name = name;
	this.visible = true;
	this.heatmap = heatmap;

	// this.highlightColor = 'rgb(255,255,0)';
	this.id = _.uniqueId();
	var _this = this;
	this.updateSpanMapFunction = function () {
		_this.spanMap = morpheus.VectorUtil.createSpanMap(_this.getVector());
	};

	this.lastPosition = {
		start: -1,
		end: -1
	};
	// for molecule span
	this.events = 'rowSortOrderChanged rowFilterChanged datasetChanged';
	var isTruncated = function (index) {
		if (index !== -1) {
			var size = _this.positions.getItemSize(index);
			if (size < 6) {
				return true;
			}
			var vector = _this.getVector();
			var val = vector.getValue(index);
			if (val != null && val !== '') {
				var toString = morpheus.VectorTrack.vectorToString(vector);
				var fontSize = Math.min(24, _this.positions.getSize() - 2);
				var context = _this.canvas.getContext('2d');
				context.font = fontSize + 'px ' + morpheus.CanvasUtil.FONT_NAME;
				return context.measureText(toString(val)).width > this.textWidth;
			}
		}
	};
	var mouseMoved = function (event) {
		var index = -1;
		if (event.type !== 'mouseout') {
			var position = morpheus.CanvasUtil.getMousePosWithScroll(
				event.target, event, heatmap.scrollLeft(), heatmap
				.scrollTop());
			if (_this.settings.squished) {
				var total = positions.getPosition(positions.getLength() - 1)
					+ positions.getItemSize(positions.getLength() - 1);
				var squishFactor = total
					/ (isColumns ? _this.getUnscaledWidth() : _this
					.getUnscaledHeight());
				position[isColumns ? 'x' : 'y'] *= squishFactor;
			}
			index = !isColumns ? _this.positions.getIndex(position.y, false)
				: _this.positions.getIndex(position.x, false);

		}

		if (isColumns) {
			heatmap.setMousePosition(-1, index, {
				name: _this.name,
				event: event
			});
		} else {
			heatmap.setMousePosition(index, -1, {
				name: _this.name,
				event: event

			});
		}
	};

	$(this.canvas).on('contextmenu.morpheus', function (e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		heatmap.setSelectedTrack(_this.name, isColumns);
		_this.showPopup(e);
		return false;

	});
	// display options:
	// - text and color, shape, bar (stacked or not), highlight matching (any
	// except arrays)
	// - color and bar-discrete or contin
	// - color by for bar plots
	this.settings = {
		maxTextWidth: undefined,
		squished: false,
		inlineTooltip: false,
		tooltip: true,
		discrete: true, // will be set automatically if
		// discreteAutoDetermined is false
		highlightMatchingValues: false,
		discreteAutoDetermined: false,
		colorBarSize: 12,
		stackedBar: false,
		renderMethod: {},
		selectionColor: 'rgb(182,213,253)',
		colorByField: null, // color this vector by another vector
		barColor: '#bdbdbd',
		barSize: 40,
		arcSize: 60,
		min: undefined,
		mid: undefined,
		max: undefined,
		minMaxReversed: false
		// whether to reverse min and max when auto-setting min and max
	};
	$(this.canvas).on('mousemove.morpheus mouseout.morpheus', mouseMoved);
};
morpheus.VectorTrack.RENDER = {
	TEXT: 0,
	COLOR: 1,
	BAR: 2,
	MOLECULE: 3,
	TEXT_AND_COLOR: 4,
	SHAPE: 5,
	ARC: 6,
	BOX_PLOT: 7
};
morpheus.VectorTrack.vectorToString = function (vector) {
	var formatter = function (v) {
		return '' + v;
	};
	var dataType = morpheus.VectorUtil.getDataType(vector);
	if (dataType === 'number') {
		formatter = morpheus.Util.nf;
	} else if (dataType === '[number]') {
		formatter = function (v) {
			var s = [];
			if (v != null) {
				for (var i = 0, arrayLength = v.length; i < arrayLength; i++) {
					s.push(morpheus.Util.nf(v[i]));
				}
			}
			return s.join(', ');
		};
	} else if (dataType === '[string]') {
		formatter = function (v) {
			var s = [];
			if (v != null) {
				for (var i = 0, arrayLength = v.length; i < arrayLength; i++) {
					s.push(v[i]);
				}
			}
			return s.join(', ');
		};
	}
	return formatter;
};

morpheus.VectorTrack.prototype = {
	settingFromConfig: function (conf) {
		var settings = this.settings;
		if (_.isString(conf)) {
			settings.renderMethod = {};
			var tokens = conf.split(',');
			for (var i = 0, length = tokens.length; i < length; i++) {
				var method = $.trim(tokens[i]);
				method = method.toUpperCase();
				var mapped = morpheus.VectorTrack.RENDER[method];
				if (mapped !== undefined) {
					settings.renderMethod[mapped] = true;
				} else if (method === 'DISCRETE') {
					settings.discrete = true;
					settings.discreteAutoDetermined = true;
				} else if (method === 'CONTINUOUS') {
					settings.discrete = false;
					settings.discreteAutoDetermined = true;
				} else if (method === 'HIGHLIGHT') {
					settings.highlightMatchingValues = true;
				} else if (method === 'STACKED_BAR') {
					settings.stackedBar = true;
					settings.renderMethod[morpheus.VectorTrack.RENDER.BAR] = true;
				} else if (method === 'BOX_PLOT') {
					settings.renderMethod[morpheus.VectorTrack.RENDER.BOX_PLOT] = true;
				} else if (method === 'TOOLTIP') {
					settings.inlineTooltip = true;
				} else {
					console.log(method + ' not found.');
				}
			}
		} else if (_.isNumber(conf)) {
			settings.renderMethod = {};
			settings.renderMethod[conf] = true;
		} else if (_.isObject(conf)) {
			conf.maxTextWidth = undefined;
			this.settings = $.extend({}, this.settings, conf);

		}
		this._update();

	},
	isDiscrete: function () {
		return this.settings.discrete;
	},
	setShowTooltip: function (value) {
		this.settings.tooltip = value;
	},
	isShowTooltip: function () {
		return this.settings.tooltip;
	},
	isRenderAs: function (value) {
		return this.settings.renderMethod[value];
	},
	dispose: function () {
		morpheus.AbstractCanvas.prototype.dispose.call(this);
		$(this.canvas).off(
			'contextmenu.morpheus mousemove.morpheus mouseout.morpheus');
		this.project.off(this.events, this.updateSpanMapFunction);
	},
	getName: function () {
		return this.name;
	},
	getVector: function (name) {
		name = name == null ? this.name : name;
		var vector = this.isColumns ? this.project.getSortedFilteredDataset()
		.getColumnMetadata().getByName(name) : this.project
		.getSortedFilteredDataset().getRowMetadata().getByName(name);
		return !vector ? new morpheus.Vector(name, 0) : vector;
	},
	getFullVector: function () {
		var vector = this.isColumns ? this.project.getFullDataset()
		.getColumnMetadata().getByName(this.name) : this.project
		.getFullDataset().getRowMetadata().getByName(this.name);
		return !vector ? new morpheus.Vector(this.name, 0) : vector;
	},
	_updatePreferredSize: function () {
		var size = this._computePreferredSize();
		this.preferredSize.width = size.width;
		this.preferredSize.height = size.height;

	},
	_computePreferredSize: function (forPrint) {
		var width = 0;
		var height = 0;
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)) {
			if (this.positions.getSize() >= 6) {
				var context = this.canvas.getContext('2d');
				var textWidth = morpheus.CanvasUtil.getVectorStringWidth(
					context, this.getVector(), this.positions,
					forPrint ? -1 : (this.isColumns ? 120 : 100));
				if (!forPrint) {
					textWidth = Math.min(textWidth, this.isColumns ? 100 : 500);
					this.settings.maxTextWidth = textWidth;
				}
				width += textWidth;
			} else if (!forPrint) {
				this.settings.maxTextWidth = 0; // text not drawn
			}
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)) {
			width += this.settings.barSize;
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)) {
			width += this.settings.colorBarSize;
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)) {
			width += this.settings.colorBarSize;
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
			width += 300;
		}
		if (!forPrint && !this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
			width = Math.min(300, width);
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.ARC)) {
			width += this.settings.arcSize;
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)) {
			width += 100;
		}
		// 2 pixel spacing between display types
		var nkeys = _.keys(this.settings.renderMethod).length;

		if (nkeys > 0) {
			width += (nkeys - 1) * 2;
		}
		width = Math.max(0, width);
		return this.isColumns ? {
			width: height,
			height: width
		} : {
			width: width,
			height: height
		};

	},
	getPreferredSize: function () {
		return this.preferredSize;
	},
	getPrintSize: function () {
		return this._computePreferredSize(true);
	},
	_createDiscreteValueMap: function () {
		var values = morpheus.VectorUtil.getValues(this.getFullVector());
		values.sort(morpheus.SortKey.ASCENDING_COMPARATOR);
		this.discreteValueMap = new morpheus.Map();
		for (var i = 0, length = values.length; i < length; i++) {
			this.discreteValueMap.set(values[i], i + 1);
		}
		this.settings.min = 0;
		this.settings.mid = 0;
		this.settings.max = values.length;
	},
	_setChartMinMax: function () {
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)) {
			if (!this.settings.stackedBar && this.settings.discrete
				&& !this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)) {
				if (!this.discreteValueMap) {
					this._createDiscreteValueMap();
				}
			} else {
				if (this.settings.min == null || this.settings.max == null
					|| this.settings.mid == null) {
					var vector = this.getFullVector();
					var minMax = morpheus.VectorUtil.getMinMax(vector);
					var min = minMax.min;
					var max = minMax.max;
					if (this.settings.minMaxReversed) {
						var tmp = max;
						max = min;
						min = tmp;
					}
					if (this.settings.min == null) {
						this.settings.min = Math.min(0, min);
					}
					if (this.settings.max == null) {
						this.settings.max = Math.max(0, max);
					}
					if (this.settings.mid == null) {
						this.settings.mid = this.settings.min < 0 ? 0
							: this.settings.min;
					}
				}

			}
		}
	},

	_update: function () {
		if (!this.settings.discreteAutoDetermined
			&& (this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR) || this
			.isRenderAs(morpheus.VectorTrack.RENDER.BAR))) {
			if (this.getFullVector().getProperties().has(
					morpheus.VectorKeys.FIELDS)
				|| morpheus.VectorUtil.getDataType(this.getFullVector()) === 'number' || morpheus.VectorUtil.getDataType(this.getFullVector()) === '[number]') {
				this.settings.discrete = false;
				this.settings.highlightMatchingValues = false;
			}
			this.settings.discreteAutoDetermined = true;
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
			this.project.off(this.events, this.updateSpanMapFunction);
		}
		this._setChartMinMax();
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
			this.project.on(this.events, this.updateSpanMapFunction);
			if (!this.moleculeCache) {
				this.moleculeCache = {};
				var _this = this;

				var valueToModelIndices = this.getFullVector().getProperties()
				.get(morpheus.VectorKeys.VALUE_TO_INDICES);
				if (!valueToModelIndices) {
					var fullVector = this.getFullVector();
					valueToModelIndices = morpheus.VectorUtil
					.createValueToIndicesMap(fullVector);
					fullVector.getProperties().set(
						morpheus.VectorKeys.VALUE_TO_INDICES,
						valueToModelIndices);

				}

				if (_this.heatmap.options.structureUrlProvider !== undefined) {
					valueToModelIndices.forEach(function (indices, value) {
						var url = _this.heatmap.options
						.structureUrlProvider(value);
						var image = new Image();
						image.src = url;
						_this.moleculeCache[value] = image;
					});

					setTimeout(2000, function () {
						_this.setInvalid(true);
						_this.repaint();
					});
				} else {
					var values = valueToModelIndices.keys();
					var doRequest = function (smile) {
						$
						.ajax(
							{
								contentType: 'text/plain',
								context: {
									smile: smile
								},
								data: {
									'string': smile,
									'representation': 'sdf'
								},
								url: 'http://cactus.nci.nih.gov/chemical/structure',
							}).done(function (text) {
							_this.moleculeCache[this.smile] = text;
							if (values.length > 0) {
								doRequest(values.pop());
							}
							_this.invalid = true;
							_this.repaint();
						});
					};
					for (var i = 0; i < 6; i++) {
						doRequest(values.pop());
					}
				}
				this.updateSpanMapFunction();
			}
		}
		this._updatePreferredSize();
	},
	postPaint: function (clip, context) {
		// draw hover, matching values
		context.lineWidth = 1;
		context.strokeStyle = 'Grey';
		var project = this.project;
		var setup = this._setup(context, clip);
		var vector = setup.vector;
		var start = setup.start;
		var end = setup.end;

		// hover
		if (this.isColumns) {
			if (project.getHoverColumnIndex() !== -1) {
				this.drawColumnBorder(context, this.positions, project
				.getHoverColumnIndex(), this.getUnscaledHeight());

			}
		} else {
			if (project.getHoverRowIndex() !== -1) {
				this.drawRowBorder(context, this.positions, project
				.getHoverRowIndex(), this.getUnscaledWidth());
			}
		}
		this._highlightMatchingValues(context, vector, start, end);
	},
	_highlightMatchingValues: function (context, viewVector, start, end) {
		var project = this.project;
		var positions = this.positions;
		context.strokeStyle = 'black';
		context.lineWidth = 3;
		var hoverIndex = this.isColumns ? project.getHoverColumnIndex()
			: project.getHoverRowIndex();
		var value = viewVector.getValue(hoverIndex);

		if (this.settings.highlightMatchingValues
			&& hoverIndex !== -1
			&& this.heatmap.mousePositionOptions
			&& this.heatmap.mousePositionOptions.name === viewVector
			.getName()) {
			var valueToModelIndices = this.getFullVector().getProperties().get(
				morpheus.VectorKeys.VALUE_TO_INDICES);
			if (!valueToModelIndices) {
				var fullVector = this.getFullVector();
				valueToModelIndices = morpheus.VectorUtil
				.createValueToIndicesMap(fullVector);
				fullVector.getProperties().set(
					morpheus.VectorKeys.VALUE_TO_INDICES,
					valueToModelIndices);

			}
			var indices = valueToModelIndices.get(value);
			if (indices == null) {
				console.log('valueToModelIndices error');
				return;
			}
			if (indices.length <= 1) {
				return;
			}
			if (this.isColumns) {
				if (project.getHoverColumnIndex() !== -1) {
					var height = this.getUnscaledHeight();
					// context.fillStyle = '#ffffb3';
					context.beginPath();
					for (var i = 0, nindices = indices.length; i < nindices; i++) {
						var viewIndex = project
						.convertModelColumnIndexToView(indices[i]);
						if (viewIndex >= start && viewIndex < end) {
							var size = positions.getItemSize(viewIndex);
							var pix = positions.getPosition(viewIndex);
							context.rect(pix, 0, size, height);
						}
					}
					context.stroke();

				}
			} else {
				context.beginPath();
				var width = this.getUnscaledWidth();
				var indices = valueToModelIndices.get(value);
				for (var i = 0, nindices = indices.length; i < nindices; i++) {
					var viewIndex = project
					.convertModelRowIndexToView(indices[i]);
					if (viewIndex >= start && viewIndex < end) {
						var size = positions.getItemSize(viewIndex);
						var pix = positions.getPosition(viewIndex);
						context.rect(0, pix, width, size);
					}
				}
				context.stroke();
			}

		}

	},

	drawSelection: function (options) {
		var project = this.project;
		var positions = this.positions;
		var context = options.context;
		var start = options.start;
		var end = options.end;
		context.lineWidth = 1;
		context.fillStyle = this.settings.selectionColor;
		if (this.isColumns) {
			var height = this.getUnscaledHeight();
			var viewIndices = project.getColumnSelectionModel()
			.getViewIndices();
			viewIndices.forEach(function (i) {
				if (i >= start && i <= end) {
					var size = positions.getItemSize(i);
					var pix = positions.getPosition(i);
					context.fillRect(pix, 0, size, height);
				}
			});
		} else {
			var width = this.getUnscaledWidth();
			if (!this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
				var viewIndices = project.getRowSelectionModel()
				.getViewIndices();
				viewIndices.forEach(function (i) {
					if (i >= start && i <= end) {
						var size = positions.getItemSize(i);
						var pix = positions.getPosition(i);
						context.fillRect(0, pix, width, size);
					}
				});
			}
		}

	},
	prePaint: function (clip, context) {
		// draw selection
		var project = this.project;
		var positions = this.positions;
		var setup = this._setup(context, clip);
		var start = setup.start;
		var end = setup.end;
		this.drawSelection({
			context: context,
			start: start,
			end: end
		});
		if (this.invalid || start !== this.lastPosition.start
			|| end !== this.lastPosition.end) {
			this.lastPosition.start = start;
			this.lastPosition.end = end;
			this.invalid = true;
		}
	},
	drawRowBorder: function (context, positions, index, gridSize) {
		var size = positions.getItemSize(index);
		var pix = positions.getPosition(index);
		// top and bottom lines
		context.beginPath();
		context.moveTo(0, pix + size);
		context.lineTo(gridSize, pix + size);
		context.stroke();
		context.beginPath();
		context.moveTo(0, pix);
		context.lineTo(gridSize, pix);
		context.stroke();
	},
	drawColumnBorder: function (context, positions, index, gridSize) {
		var size = positions.getItemSize(index);
		var pix = positions.getPosition(index);
		// top and bottom lines
		context.beginPath();
		context.moveTo(pix + size, 0);
		context.lineTo(pix + size, gridSize);
		context.stroke();
		context.beginPath();
		context.moveTo(pix, 0);
		context.lineTo(pix, gridSize);
		context.stroke();
	},
	isSquished: function () {
		return this.settings.squished;
	},
	_setup: function (context, clip) {
		var start = 0;
		var vector = this.getVector();
		var end = vector.size();
		var settings = this.settings;
		var positions = this.positions;
		var width = clip.width;
		var height = clip.height;
		if (!settings.squished) {
			if (this.isColumns) {
				start = morpheus.Positions.getLeft(clip, positions);
				end = morpheus.Positions.getRight(clip, positions);
			} else {
				start = morpheus.Positions.getTop(clip, positions);
				end = morpheus.Positions.getBottom(clip, positions);
			}
		}
		if (settings.squished) {

			var total = positions.getPosition(positions.getLength() - 1)
				+ positions.getItemSize(positions.getLength() - 1);
			if (!this.isColumns) {
				var squishFactor = height / total;
				context.scale(1, squishFactor);
			} else {
				var squishFactor = width / total;
				context.scale(squishFactor, 1);
			}

		} else {
			context.translate(-clip.x, -clip.y);
		}
		return {
			start: start,
			end: end,
			vector: vector
		};
	},
	draw: function (clip, context) {
		var setup = this._setup(context, clip);
		this._draw({
			start: setup.start,
			end: setup.end,
			vector: setup.vector,
			context: context,
			availableSpace: this.isColumns ? this.getUnscaledHeight()
				: this.getUnscaledWidth(),
			clip: clip
		});
	},
	print: function (clip, context) {
		var vector = this.getVector();
		this._draw({
			start: 0,
			end: vector.size(),
			vector: vector,
			context: context,
			availableSpace: this.isColumns ? clip.height
				: clip.width,
			clip: clip
		});
	},
	/**
	 * @param options.vector
	 * @param options.context
	 * @param options.start
	 * @param options.end
	 * @param options.availableSpace
	 */
	_draw: function (options) {
		var _this = this;
		var context = options.context;
		var vector = options.vector;
		var availableSpace = options.availableSpace;
		var fullAvailableSpace = options.availableSpace;
		var start = options.start;
		var end = options.end;
		var clip = options.clip;
		var positions = this.positions;

		context.textAlign = 'left';
		context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;

		var fontSize = Math.min(24, positions.getSize() - 2);
		var size = 0;
		context.font = fontSize + 'px ' + morpheus.CanvasUtil.FONT_NAME;
		context.strokeStyle = morpheus.HeatMapElementCanvas.GRID_COLOR;
		context.lineWidth = 0.1;

		// grid lines
		if (this.heatmap.heatmap.isDrawGrid() && !this.settings.squished) {
			if (this.isColumns) {
				var gridSize = availableSpace;
				for (var i = start; i < end; i++) {
					var size = positions.getItemSize(i);
					var pix = positions.getPosition(i);
					if (size > 7) {
						context.beginPath();
						context.moveTo(pix + size, 0);
						context.lineTo(pix + size, gridSize);
						context.stroke();
					}
				}
			} else {
				if (!this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
					var gridSize = availableSpace;
					for (var i = start; i < end; i++) {
						var size = positions.getItemSize(i);
						var pix = positions.getPosition(i);
						if (size > 7) {
							context.beginPath();
							context.moveTo(0, pix + size);
							context.lineTo(gridSize, pix + size);
							context.stroke();
						}
					}
				}
			}
		}
		context.lineWidth = 1;
		var offset = 1;

		if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)) {
			this.renderColor(context, vector, start, end, clip,
				this.isColumns ? availableSpace : 0,
				!this.settings.discrete);
			offset += this.settings.colorBarSize + 2;
			availableSpace -= offset;
		}
		if (!this.settings.squished
			&& this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)) {
			this.renderShape(context, vector, start, end, clip,
				this.isColumns ? availableSpace - offset : offset);
			offset += this.settings.colorBarSize + 2;
			availableSpace -= offset;
		}

		if (this.isRenderAs(morpheus.VectorTrack.RENDER.ARC)) {
			this.renderArc(context, vector, start, end, clip,
				this.settings.arcSize);
			offset += this.settings.arcSize + 2;
			availableSpace -= offset;
		}
		if (!this.settings.squished
			&& this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)) {
			this.renderMolecule(context, vector, start, end, clip, offset,
				availableSpace);
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)) {
			var barSize = !this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT) ? (availableSpace - 2)
				: this.settings.barSize;
			offset++;
			this.renderBoxPlot(context, vector, start, end, clip, offset,
				barSize);
			offset += barSize + 2;
			availableSpace -= offset;
		}

		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)) {
			var barSize = !this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT) ? (availableSpace - 1)
				: this.settings.barSize;
			if (this.settings.stackedBar) {
				this.renderStackedBar(context, vector, start, end, clip,
					offset, barSize);
			} else {
				var fields = vector.getProperties().get(
					morpheus.VectorKeys.FIELDS);
				var visibleFieldIndices = vector.getProperties().get(
					morpheus.VectorKeys.VISIBLE_FIELDS);
				if (fields != null && visibleFieldIndices == null) {
					visibleFieldIndices = morpheus.Util.seq(fields.length);
				}

				if (fields != null) {
					this.renderUnstackedBar(context, vector, start, end, clip,
						offset, barSize, visibleFieldIndices);
				} else {
					this.renderBar(context, vector, start, end, clip, offset,
						barSize);
				}
			}
			offset += barSize + 2;
			availableSpace -= offset;
		}

		if (!this.settings.squished
			&& this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)) {
			context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
			this.renderText(context, vector, true, start, end, clip, offset,
				this.isColumns ? fullAvailableSpace : 0);
			offset += this.settings.maxTextWidth + 2;
			availableSpace -= offset;
		}
		this.textWidth = 0;
		if (!this.settings.squished
			&& this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT)) {
			this.textWidth = availableSpace;
			context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
			var dataType = morpheus.VectorUtil.getDataType(vector);
			if (dataType === 'url') {
				context.fillStyle = 'blue';
				this.canvas.style.cursor = 'pointer';
			}
			this.renderText(context, vector, false, start, end, clip, offset,
				this.isColumns ? fullAvailableSpace : 0);
			offset += this.settings.textWidth + 2;
			availableSpace -= offset;
		}

	},
	showPopup: function (e, isHeader) {
		if (!this.heatmap.options.popupEnabled) {
			return;
		}
		var _this = this;
		var project = this.project;
		var isColumns = this.isColumns;
		var hasSelection = isColumns ? project.getColumnSelectionModel()
		.count() > 0 : project.getRowSelectionModel().count() > 0;
		var ANNOTATE_SELECTION = 'Annotate Selection';
		var INVERT_SELECTION = 'Invert Selection';
		var SELECT_ALL = 'Select All';
		var SHOW_SELECTION_ONLY = 'Show Selection Only';
		var CLEAR_SELECTION = 'Clear Selection';
		var HIGHLIGHT_MATCHING_VALUES = 'Highlight Matching Values';
		var FIELDS = 'Choose Fields...';
		var DELETE = 'Delete...';
		var TOOLTIP = 'Show In Tooltip';
		var HIDE = 'Hide';
		var HIDE_OTHERS = 'Hide Others';
		var REMOVE_SHOW_SELECTION_ONLY = 'Show All';
		var SORT_ASC = 'Sort Ascending';
		var SORT_DESC = 'Sort Descending';
		var FILTER = 'Filter...';
		var SORT_SEL_ASC = 'Sort Heat Map Ascending \u2191';
		var SORT_SEL_DESC = 'Sort Heat Map Descending \u2193';
		var SORT_SEL_TOP_N = 'Sort Heat Map Descending/Ascending';
		var DISPLAY_BAR = 'Show Bar Chart';
		var DISPLAY_STACKED_BAR = 'Show Stacked Bar Chart';
		var DISPLAY_BOX_PLOT = 'Show Box Plot';
		var DISPLAY_COLOR = 'Show Color';
		var COLOR_BAR_SIZE = 'Color Bar Size...';
		var DISPLAY_TEXT = 'Show Text';
		var DISPLAY_SHAPE = 'Show Shape';
		var DISPLAY_ARC = 'Show Arc';
		var DISPLAY_TEXT_AND_COLOR = 'Show Colored Text';
		var DISPLAY_STRUCTURE = 'Show Chemical Structure';
		var DISPLAY_CONTINUOUS = 'Continuous';
		var positions = this.positions;
		var heatmap = this.heatmap;

		var sectionToItems = {
			'Sort': [],
			'Selection': [],
			'Display': []
		};
		if (isHeader) {
			sectionToItems.Sort.push({
				name: FILTER
			});
			// sectionToItems['Sort'].push({
			// name : SORT_ASC
			// });
			// sectionToItems['Sort'].push({
			// name : SORT_DESC
			// });
		}

		var customItems = this.heatmap.getPopupItems();
		if (customItems && customItems.length > 0) {
			customItems.forEach(function (item) {
				if (item.columns === isColumns) {
					sectionToItems[item.section].push(item);
				}
			});
		}
		if (sectionToItems.Selection.length > 0) {
			sectionToItems.Selection.push({
				separator: true
			});
		}

		sectionToItems.Selection.push({
			name: 'Copy'
		});
		sectionToItems.Selection.push({
			separator: true
		});
		sectionToItems.Selection.push({
			name: ANNOTATE_SELECTION
		});

		sectionToItems.Selection.push({
			name: INVERT_SELECTION
		});
		sectionToItems.Selection.push({
			name: SELECT_ALL
		});
		sectionToItems.Selection.push({
			name: CLEAR_SELECTION
		});
		// sectionToItems.Selection.push({
		// name : SHOW_SELECTION_ONLY
		// });
		var combinedFilter = isColumns ? project.getColumnFilter() : project
		.getRowFilter();
		var showSelectionOnlyIndex = combinedFilter
		.indexOf(SHOW_SELECTION_ONLY);
		if (showSelectionOnlyIndex !== -1) {
			sectionToItems.Selection.push({
				name: REMOVE_SHOW_SELECTION_ONLY
			});
		}

		if (!isHeader) {
			sectionToItems['Sort'].push({
				name: SORT_SEL_ASC,
				disabled: !hasSelection
			});
			sectionToItems['Sort'].push({
				name: SORT_SEL_DESC,
				disabled: !hasSelection
			});

			sectionToItems['Sort'].push({
				name: SORT_SEL_TOP_N,
				disabled: !hasSelection
			});
		}
		var dataType = morpheus.VectorUtil.getDataType(this.getFullVector());
		var arrayFields = this.getFullVector().getProperties().get(
			morpheus.VectorKeys.FIELDS);
		var isArray = arrayFields !== undefined;
		var isNumber = dataType === 'number' || dataType === '[number]';
		if (isNumber || isArray) {
			sectionToItems.Display.push({
				name: DISPLAY_BAR,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)
			});

		}
		if (isArray) {
			sectionToItems.Display.push({
				name: DISPLAY_STACKED_BAR,
				checked: this.settings.stackedBar
			});
			sectionToItems.Display.push({
				name: DISPLAY_BOX_PLOT,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)
			});
			sectionToItems.Display.push({
				name: FIELDS,
			});

		}
		if (dataType !== 'url') {
			sectionToItems.Display.push({
				name: DISPLAY_TEXT,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT)
			});
			sectionToItems.Display.push({
				name: DISPLAY_COLOR,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)
			});
			if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)) {
				sectionToItems.Display.push({
					name: COLOR_BAR_SIZE
				});
			}
		}
		if (!isArray && dataType !== 'url') {
			sectionToItems.Display.push({
				name: DISPLAY_SHAPE,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)
			});
			// sectionToItems.Display.push({
			// name : DISPLAY_ARC,
			// checked : this.isRenderAs(morpheus.VectorTrack.RENDER.ARC)
			// });

		}

		if (!isArray && !isNumber && !this.isColumns
			&& name.toLowerCase().indexOf('smile') !== -1) {
			sectionToItems.Display.push({
				name: DISPLAY_STRUCTURE,
				checked: this.isRenderAs(morpheus.VectorTrack.RENDER.MOLECULE)
			});
		}

		sectionToItems.Display.push({
			name: TOOLTIP,
			checked: this.settings.inlineTooltip
		});
		if (!isArray && dataType !== 'url') {
			sectionToItems.Display.push({
				name: HIGHLIGHT_MATCHING_VALUES,
				checked: this.settings.highlightMatchingValues
			});
		}
		if (dataType !== 'url') {
			sectionToItems.Display.push({
				name: 'Squished',
				checked: this.settings.squished
			});
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.BOX_PLOT)) {
			sectionToItems.Display.push({
				separator: true
			});
			if (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)) {
				sectionToItems.Display.push({
					name: 'Edit Bar Color...'
				});
			}
			sectionToItems.Display.push({
				name: 'Auto Range'
			});
			sectionToItems.Display.push({
				name: 'Custom Range...'
			});
		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.BAR)
			|| this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)) {
			sectionToItems.Display.push({
				separator: true
			});
			if (isNumber) {
				sectionToItems.Display.push({
					name: DISPLAY_CONTINUOUS,
					checked: !this.settings.discrete
				});
			}
			if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)
				|| this
				.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)
				|| (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR) && isArray)) {
				sectionToItems.Display.push({
					name: 'Edit Colors...'
				});

			}
			if (this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)) {
				sectionToItems.Display.push({
					name: 'Edit Shapes...'
				});

			}
			if (this.isRenderAs(morpheus.VectorTrack.RENDER.COLOR)
				|| this
				.isRenderAs(morpheus.VectorTrack.RENDER.TEXT_AND_COLOR)
				|| (this.isRenderAs(morpheus.VectorTrack.RENDER.BAR) && isArray)) {
				sectionToItems.Display.push({
					name: 'Color Key',
					icon: 'fa fa-key'
				});
			}

		}
		if (this.isRenderAs(morpheus.VectorTrack.RENDER.SHAPE)) {
			sectionToItems.Display.push({
				name: 'Shape Key',
				icon: 'fa fa-key'
			});
		}

		sectionToItems.Display.push({
			separator: true
		});
		sectionToItems.Display.push({
			name: HIDE
		});
		sectionToItems.Display.push({
			name: HIDE_OTHERS,
			disabled: heatmap.getVisibleTrackNames(this.isColumns).length <= 1

		});
		sectionToItems.Display.push({
			separator: true
		});
		sectionToItems.Display.push({
			name: DELETE
		});

		var items = [];

		function addSection(name) {
			if (items.length > 0) {
				items.push({
					separator: true
				});
			}
			items = items.concat(sectionToItems[name]);
		}

		addSection('Sort');
		_.each(sectionToItems.Selection, function (item) {
			if (item.name !== REMOVE_SHOW_SELECTION_ONLY
				&& item.name !== SELECT_ALL) {
				item.disabled = !hasSelection;
			}
		});
		if (!isHeader) {
			addSection('Selection');
		} else {
			addSection('Display');
		}
		if (e.preventDefault) {
			e.preventDefault();
		}

		morpheus.Popup
		.showPopup(
			items,
			{
				x: e.pageX,
				y: e.pageY
			},
			e.target,
			function (event, item) {
				var customItem;
				if (item === 'Copy') {
					var dataset = project
					.getSortedFilteredDataset();
					var v = isColumns ? dataset.getColumnMetadata()
					.getByName(_this.name) : dataset
					.getRowMetadata().getByName(_this.name);
					var selectionModel = isColumns ? project
					.getColumnSelectionModel() : project
					.getRowSelectionModel();
					var text = [];
					selectionModel.getViewIndices().forEach(
						function (index) {
							text.push(morpheus.Util.toString(v
							.getValue(index)));
						});
					event.clipboardData.setData('text/plain', text
					.join('\t'));
				} else if (item === FIELDS) {
					var visibleFieldIndices = _this
					.getFullVector()
					.getProperties()
					.get(morpheus.VectorKeys.VISIBLE_FIELDS);
					var visibleFields;
					if (visibleFieldIndices == null) {
						visibleFields = arrayFields.slice(0);
					} else {
						visibleFields = [];
						for (var i = 0; i < visibleFieldIndices.length; i++) {
							visibleFields
							.push(arrayFields[visibleFieldIndices[i]]);
						}

					}
					var availableFields = [];
					for (var i = 0; i < arrayFields.length; i++) {
						if (visibleFields.indexOf(arrayFields[i]) === -1) {
							availableFields.push(arrayFields[i]);
						}
					}

					var leftOptions = [];
					var rightOptions = [];
					for (var i = 0; i < availableFields.length; i++) {
						leftOptions.push(new Option(
							availableFields[i],
							availableFields[i]));
					}
					for (var i = 0; i < visibleFields.length; i++) {
						rightOptions
						.push(new Option(visibleFields[i],
							visibleFields[i]));
					}

					var list = new morpheus.DualList(leftOptions,
						rightOptions);

					morpheus.FormBuilder
					.showOkCancel({
						title: 'Fields',
						okCallback: function () {
							var visibleFields = list
							.getOptions(false);
							var visibleFieldIndices = [];
							for (var i = 0; i < visibleFields.length; i++) {
								visibleFieldIndices
								.push(arrayFields
								.indexOf(visibleFields[i]));
							}
							var fullVector = _this
							.getFullVector();
							fullVector
							.getProperties()
							.set(
								morpheus.VectorKeys.VISIBLE_FIELDS,
								visibleFieldIndices);

							var summaryFunction = fullVector
							.getProperties()
							.get(
								morpheus.VectorKeys.ARRAY_SUMMARY_FUNCTION);
							if (summaryFunction) {
								summaryFunction.indices = visibleFieldIndices;
							}
							var updatedVector = _this.isColumns ? _this.project
							.getFullDataset()
							.getColumnMetadata()
							.add(_this.name)
								: _this.project
							.getFullDataset()
							.getRowMetadata()
							.add(_this.name);
							// remove cached box field
							for (var i = 0; i < updatedVector
							.size(); i++) {
								var array = fullVector
								.getValue(i);
								if (array != null) {
									array.box = null;
								}

							}

							_this.setInvalid(true);
							_this.repaint();
						},
						content: list.$el
					});
				} else if (item === 'Edit Bar Color...') {
					var formBuilder = new morpheus.FormBuilder();
					formBuilder.append({
						name: 'bar_color',
						type: 'color',
						value: _this.settings.barColor,
						required: true,
						col: 'col-xs-2'
					});
					formBuilder.find('bar_color').on(
						'change',
						function () {
							_this.settings.barColor = $(this)
							.val();
							_this.setInvalid(true);
							_this.repaint();
						});
					morpheus.FormBuilder.showInModal({
						title: 'Bar Color',
						close: 'Close',
						html: formBuilder.$form
					});
				} else if (item === COLOR_BAR_SIZE) {
					var formBuilder = new morpheus.FormBuilder();
					formBuilder.append({
						name: 'size',
						type: 'text',
						value: _this.settings.colorBarSize,
						required: true,
						col: 'col-xs-2'
					});
					formBuilder.find('size').on(
						'change',
						function () {
							var val = parseFloat($(this)
							.val());
							if (val > 0) {
								_this.settings.colorBarSize = val;
								_this.setInvalid(true);
								_this.repaint();
							}
						});
					morpheus.FormBuilder.showInModal({
						title: 'Color Bar Size',
						close: 'Close',
						html: formBuilder.$form
					});
				} else if (item === ANNOTATE_SELECTION) {
					var formBuilder = new morpheus.FormBuilder();
					formBuilder.append({
						name: 'annotation_name',
						type: 'text',
						required: true
					});
					formBuilder.append({
						name: 'annotation_value',
						type: 'text',
						required: true
					});
					morpheus.FormBuilder
					.showOkCancel({
						title: ANNOTATE_SELECTION,
						content: formBuilder.$form,
						okCallback: function () {
							var value = formBuilder
							.getValue('annotation_value');
							var annotationName = formBuilder
							.getValue('annotation_name');
							var dataset = project
							.getSortedFilteredDataset();
							var fullDataset = project
							.getFullDataset();
							if (isColumns) {
								dataset = morpheus.DatasetUtil
								.transposedView(dataset);
								fullDataset = morpheus.DatasetUtil
								.transposedView(fullDataset);
							}

							var existingVector = fullDataset
							.getRowMetadata()
							.getByName(
								annotationName);
							var v = dataset
							.getRowMetadata().add(
								annotationName);

							var selectionModel = isColumns ? project
							.getColumnSelectionModel()
								: project
							.getRowSelectionModel();
							selectionModel
							.getViewIndices()
							.forEach(
								function (index) {
									v
									.setValue(
										index,
										value);
								});
							morpheus.VectorUtil
							.maybeConvertStringToNumber(v);
							project
							.trigger(
								'trackChanged',
								{
									vectors: [v],
									render: existingVector != null ? []
										: [morpheus.VectorTrack.RENDER.TEXT],
									columns: isColumns
								});
						}
					});
				} else if (item === DELETE) {
					morpheus.FormBuilder
					.showOkCancel({
						title: 'Delete',
						content: 'Are you sure you want to delete '
						+ _this.name + '?',
						okCallback: function () {
							var metadata = isColumns ? project
							.getFullDataset()
							.getColumnMetadata()
								: project
							.getFullDataset()
							.getRowMetadata();
							metadata
							.remove(morpheus.MetadataUtil
							.indexOf(
								metadata,
								_this.name));
							var sortKeys = isColumns ? project
							.getColumnSortKeys()
								: project
							.getRowSortKeys();
							var sortKeyIndex = _.indexOf(
								sortKeys.map(function (key) {
									return key.field;
								}), _this.name);
							if (sortKeyIndex !== -1) {
								sortKeys.splice(
									sortKeyIndex, 1);
								if (isColumns) {
									project
									.setColumnSortKeys(
										sortKeys,
										true);
								} else {
									project.setRowSortKeys(
										sortKeys, true);
								}
							}
							var groupByKeys = isColumns ? project
							.getGroupColumns()
								: project
							.getGroupRows();
							var groupByKeyIndex = _
							.indexOf(
								groupByKeys
								.map(function (key) {
									return key.field;
								}),
								_this.name);
							if (groupByKeyIndex !== -1) {
								groupByKeys.splice(
									groupByKeyIndex, 1);
								if (isColumns) {
									project
									.setGroupColumns(
										groupByKeys,
										true);
								} else {
									project.setGroupRows(
										groupByKeys,
										true);
								}
							}
							if (!isColumns) {
								// remove from any group
								// by or sort by
								project
								.trigger(
									'rowTrackRemoved',
									{
										vector: _this
										.getFullVector()
									});
							} else {
								project
								.trigger(
									'columnTrackRemoved',
									{
										vector: _this
										.getFullVector()
									});
							}
						}
					});
				} else if (item === CLEAR_SELECTION) {
					var model = isColumns ? project
					.getColumnSelectionModel() : project
					.getRowSelectionModel();
					model.setViewIndices(new morpheus.Set(), true);
				} else if (item === INVERT_SELECTION) {
					var model = isColumns ? project
					.getColumnSelectionModel() : project
					.getRowSelectionModel();
					var viewIndices = model.getViewIndices();
					var inverse = new morpheus.Set();
					for (var i = 0, n = positions.getLength(); i < n; i++) {
						if (!viewIndices.has(i)) {
							inverse.add(i);
						}
					}
					model.setViewIndices(inverse, true);
				} else if (item === FILTER) {
					var vector = _this.getFullVector();
					var filter;
					var index = _this.isColumns ? _this.project
					.getColumnFilter().indexOf(
						vector.getName())
						: _this.project.getRowFilter().indexOf(
						vector.getName());
					if (index === -1) {
						if (morpheus.VectorUtil.isNumber(vector)
							&& morpheus.VectorUtil
							.containsMoreThanNValues(
								vector, 9)) {
							filter = new morpheus.RangeFilter(NaN,
								NaN, vector.getName());

						} else {
							var set = morpheus.VectorUtil
							.getSet(vector);
							var array = set.values();
							array
							.sort(morpheus.SortKey.ASCENDING_COMPARATOR);
							filter = new morpheus.VectorFilter(set,
								set.size(), vector.getName());
						}
						if (filter) {
							if (_this.isColumns) {
								_this.project.getColumnFilter()
								.add(filter, true);
							} else {
								_this.project.getRowFilter().add(
									filter, true);
							}
						}

					}

					if (_this.isColumns) {
						_this.project.getColumnFilter().trigger(
							'focus', {});
					} else {
						_this.project.getRowFilter().trigger(
							'focus', {});
					}

				} else if (item === SORT_ASC || item === SORT_DESC) {
					var sortKey = new morpheus.SortKey(
						_this.name,
						item === SORT_ASC ? morpheus.SortKey.SortOrder.ASCENDING
							: morpheus.SortKey.SortOrder.DESCENDING);
					if (_this.isColumns) {
						_this.project
						.setColumnSortKeys(
							morpheus.SortKey
							.keepExistingSortKeys(
								[sortKey],
								project
								.getColumnSortKeys()),
							true);
					} else {
						_this.project
						.setRowSortKeys(
							morpheus.SortKey
							.keepExistingSortKeys(
								[sortKey],
								project
								.getRowSortKeys()),
							true);
					}
				} else if (item == SORT_SEL_ASC
					|| item == SORT_SEL_DESC
					|| item === SORT_SEL_TOP_N) {
					var sortOrder;
					if (item === SORT_SEL_ASC) {
						sortOrder = morpheus.SortKey.SortOrder.ASCENDING;
					} else if (item === SORT_SEL_DESC) {
						sortOrder = morpheus.SortKey.SortOrder.DESCENDING;
					} else {
						sortOrder = morpheus.SortKey.SortOrder.TOP_N;
					}
					heatmap.sortBasedOnSelection(sortOrder,
						isColumns, e && e.shiftKey);
				} else if (item === SELECT_ALL) {
					var selectionModel = !isColumns ? heatmap
					.getProject().getRowSelectionModel()
						: heatmap.getProject()
					.getColumnSelectionModel();
					var count = !isColumns ? heatmap.getProject()
					.getSortedFilteredDataset()
					.getRowCount() : heatmap.getProject()
					.getSortedFilteredDataset()
					.getColumnCount();
					var indices = new morpheus.Set();
					for (var i = 0; i < count; i++) {
						indices.add(i);
					}
					selectionModel.setViewIndices(indices, true);
				} else if (item === 'Auto Range') {
					delete _this.settings.min;
					delete _this.settings.max;
					delete _this.settings.mid;
					_this._update();
					heatmap.revalidate();
				} else if (item === 'Custom Range...') {
					var formBuilder = new morpheus.FormBuilder();
					var items = [{
						name: 'min',
						required: true,
						type: 'number',
						value: _this.settings.min
					}, {
						name: 'mid',
						required: true,
						type: 'number',
						value: _this.settings.mid
					}, {
						name: 'max',
						required: true,
						type: 'number',
						value: _this.settings.max
					}];
					_.each(items, function (item) {
						formBuilder.append(item);
					});
					morpheus.FormBuilder
					.showOkCancel({
						title: 'Range',
						content: formBuilder.$form,
						okCallback: function () {
							_this.settings.min = parseFloat(formBuilder
							.getValue('min'));
							_this.settings.mid = parseFloat(formBuilder
							.getValue('mid'));
							_this.settings.max = parseFloat(formBuilder
							.getValue('max'));
							_this._update();
							heatmap.revalidate();
						}
					});
				} else if (item === 'Squished') {
					_this.settings.squished = !_this.settings.squished;
					heatmap.revalidate();
				} else if (item === 'Color Key') {

					var legend = new morpheus.HeatMapTrackColorLegend(
						[_this], isColumns ? _this.project
						.getColumnColorModel()
							: _this.project
						.getRowColorModel());
					var size = legend.getPreferredSize();
					legend.setBounds(size);
					legend.repaint();

					morpheus.FormBuilder.showInModal({
						title: 'Color Key',
						html: legend.canvas
					});
				} else if (item === 'Shape Key') {
					var legend = new morpheus.HeatMapTrackShapeLegend(
						[_this], isColumns ? _this.project
						.getColumnShapeModel()
							: _this.project
						.getRowShapeModel());
					var size = legend.getPreferredSize();
					legend.setBounds(size);
					legend.repaint();

					morpheus.FormBuilder.showInModal({
						title: 'Shape Key',
						html: legend.canvas
					});
				} else if (item === 'Edit Shapes...') {
					var shapeFormBuilder = new morpheus.FormBuilder();
					var shapeModel = isColumns ? _this.project
					.getColumnShapeModel() : _this.project
					.getRowShapeModel();
					var chooser = new morpheus.ShapeChooser({
						map: shapeModel.getMap(_this.name)
					});

					chooser.on('change', function (event) {
						shapeModel.setMappedValue(_this
							.getFullVector(), event.value,
							event.shape);
						_this.setInvalid(true);
						_this.repaint();
					});
					morpheus.FormBuilder.showInModal({
						title: 'Edit Shapes',
						html: chooser.$div,
						close: 'Close'
					});
				} else if (item === 'Edit Colors...') {
					var colorSchemeChooser;
					var colorModel = isColumns ? _this.project
					.getColumnColorModel() : _this.project
					.getRowColorModel();
					if (_this.settings.discrete) {
						colorSchemeChooser = new morpheus.DiscreteColorSchemeChooser(
							{
								colorScheme: {
									scale: colorModel
									.getDiscreteColorScheme(_this
									.getFullVector())
								}
							});
						colorSchemeChooser.on('change', function (event) {
							colorModel.setMappedValue(_this
								.getFullVector(), event.value,
								event.color);
							_this.setInvalid(true);
							_this.repaint();
						});
					} else {
						colorSchemeChooser = new morpheus.HeatMapColorSchemeChooser(
							{
								showRelative: false,
							});
						colorSchemeChooser
						.setColorScheme(colorModel
						.getContinuousColorScheme(_this
						.getFullVector()));
						colorSchemeChooser.on('change', function (event) {
							_this.setInvalid(true);
							_this.repaint();
						});
					}
					morpheus.FormBuilder.showInModal({
						title: 'Edit Colors',
						html: colorSchemeChooser.$div,
						close: 'Close',
						callback: function () {
							colorSchemeChooser.dispose();
						}
					});
				} else if (item === TOOLTIP) {
					_this.settings.inlineTooltip = !_this.settings.inlineTooltip;
				} else if (item === HIGHLIGHT_MATCHING_VALUES) {
					_this.settings.highlightMatchingValues = !_this.settings.highlightMatchingValues;
				} else if ((customItem = _
					.find(
						customItems,
						function (customItem) {
							return customItem.name === item
								&& customItem.columns === isColumns;
						}))) {
					if (customItem.task) {
						// add task
						var task = {
							tabId: _this.heatmap.getTabManager()
							.getActiveTabId()
						};

						_this.heatmap.getTabManager().addTask(task);
						setTimeout(function () {
							try {
								customItem.callback(heatmap);
							} catch (x) {

							}
							_this.heatmap.getTabManager()
							.removeTask(task);
						}, 1);
					} else {
						customItem.callback(heatmap);
					}

				} else if (item === DISPLAY_CONTINUOUS) {
					_this.settings.discrete = !_this.settings.discrete;
					_this._setChartMinMax();
					_this.setInvalid(true);
					_this.repaint();
				} else if (item === HIDE) {
					heatmap.setTrackVisible(_this.name, false,
						_this.isColumns);
					heatmap.revalidate();
				} else if (item === HIDE_OTHERS) {
					var names = heatmap.getVisibleTrackNames(_this.isColumns);
					for (var i = 0; i < names.length; i++) {
						if (names[i] !== _this.name) {
							heatmap.setTrackVisible(names[i], false,
								_this.isColumns);
						}
					}

					heatmap.revalidate();

				} else if (item === DISPLAY_STACKED_BAR) {
					_this.settings.stackedBar = !_this.settings.stackedBar;
					_this._update();
					heatmap.revalidate();
				} else {
					if (item === DISPLAY_BAR) {
						item = morpheus.VectorTrack.RENDER.BAR;
					} else if (item === DISPLAY_COLOR) {
						item = morpheus.VectorTrack.RENDER.COLOR;
					} else if (item === DISPLAY_TEXT) {
						item = morpheus.VectorTrack.RENDER.TEXT;
					} else if (item === DISPLAY_TEXT_AND_COLOR) {
						item = morpheus.VectorTrack.RENDER.TEXT_AND_COLOR;
					} else if (item === DISPLAY_STRUCTURE) {
						item = morpheus.VectorTrack.RENDER.MOLECULE;
					} else if (item === DISPLAY_SHAPE) {
						item = morpheus.VectorTrack.RENDER.SHAPE;
					} else if (item === DISPLAY_ARC) {
						item = morpheus.VectorTrack.RENDER.ARC;
					} else if (item === DISPLAY_BOX_PLOT) {
						item = morpheus.VectorTrack.RENDER.BOX_PLOT;
					} else {
						console.log('Unknown item ' + item);
					}
					var show = !_this.isRenderAs(item);
					if (!show) {
						delete _this.settings.renderMethod[item];
					} else {
						_this.settings.renderMethod[item] = true;
					}
					_this._update();
					heatmap.revalidate();
				}
			});
	},
	renderColor: function (context, vector, start, end, clip, offset,
						   continuous) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		var colorModel = isColumns ? this.project.getColumnColorModel()
			: this.project.getRowColorModel();
		var settings = this.settings;
		var canvasSize = isColumns ? this.getUnscaledHeight() : this
		.getUnscaledWidth();
		var colorBarSize = settings.colorBarSize;
		if (colorBarSize > canvasSize) {
			colorBarSize = canvasSize >= 5 ? (canvasSize - 1)
				: canvasSize;
		}
		var getColor;
		if (!continuous) {
			getColor = _.bind(colorModel.getMappedValue, colorModel);
		} else {
			getColor = _.bind(colorModel.getContinuousMappedValue, colorModel);
		}

		if (vector.getProperties().get(
				morpheus.VectorKeys.FIELDS) != null) {
			var visibleFieldIndices = vector.getProperties().get(
				morpheus.VectorKeys.VISIBLE_FIELDS);
			if (visibleFieldIndices == null) {
				visibleFieldIndices = morpheus.Util.seq(vector.getProperties().get(
					morpheus.VectorKeys.FIELDS).length);
			}
			colorBarSize /= visibleFieldIndices.length;
			var nvisibleFieldIndices = visibleFieldIndices.length;

			for (var i = start; i < end; i++) {
				var array = vector.getValue(i);
				var position = positions.getPosition(i);
				var size = positions.getItemSize(i);
				var _offset = offset;
				if (array != null) {
					for (var j = 0; j < nvisibleFieldIndices; j++) {
						var value = array[visibleFieldIndices[j]];
						var color = getColor(vector, value);
						context.fillStyle = color;
						if (isColumns) {
							context.beginPath();
							context.rect(position, _offset - colorBarSize, size,
								colorBarSize);
							context.fill();
						} else {
							context.beginPath();
							context.rect(_offset, position, colorBarSize, size);
							context.fill();
						}
						_offset += colorBarSize;
					}
				}

			}

		} else {
			for (var i = start; i < end; i++) {
				var value = vector.getValue(i);
				var position = positions.getPosition(i);
				var size = positions.getItemSize(i);
				var color = getColor(vector, value);
				context.fillStyle = color;
				if (isColumns) {
					context.beginPath();
					context.rect(position, offset - colorBarSize, size,
						settings.colorBarSize);
					context.fill();
				} else {
					context.beginPath();
					context.rect(offset, position, colorBarSize, size);
					context.fill();
				}
			}
		}
	},
	renderShape: function (context, vector, start, end, clip, offset) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		var shapeModel = isColumns ? this.project.getColumnShapeModel()
			: this.project.getRowShapeModel();
		var settings = this.settings;
		var canvasSize = isColumns ? this.getUnscaledHeight() : this
		.getUnscaledWidth();
		var colorBarSize = settings.colorBarSize;
		if (colorBarSize > canvasSize) {
			colorBarSize = canvasSize >= 5 ? (canvasSize - 1)
				: canvasSize;
		}
		context.fillStyle = 'black';
		context.strokeStyle = 'black';

		var lineWidth = context.lineWidth;
		context.lineWidth = 1;
		for (var i = start; i < end; i++) {

			var value = vector.getValue(i);
			var position = positions.getPosition(i);
			var itemSize = positions.getItemSize(i);
			var minSize = Math.min(colorBarSize, itemSize);
			var size2 = minSize / 2;
			var shape = shapeModel.getMappedValue(vector, value);
			// x and y are at center
			var x = isColumns ? position + itemSize / 2 : offset + size2;
			var y = isColumns ? offset - size2 : position + itemSize / 2;
			size2 -= 0.5; // small border between cells
			morpheus.CanvasUtil.drawShape(context, shape, x, y, size2);
		}
		context.lineWidth = lineWidth;
	},
	renderArc: function (context, vector, start, end, clip, size) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		var project = this.project;
		context.save();
		context.lineWidth = 1;
		var scale = d3.scale.linear().domain([1, size]).range([0.8, 1])
		.clamp(true);
		var fill = d3.scale.category20b();
		var valueToIndices = morpheus.VectorUtil
		.createValueToIndicesMap(vector);
		var total = positions.getPosition(positions.getLength() - 1)
			+ positions.getItemSize(positions.getLength() - 1);
		context.translate(clip.x, clip.y);
		var width = clip.width;
		var height = clip.height;
		if (!isColumns) {
			var squishFactor = height / total;
			context.scale(1, squishFactor);
		} else {
			var squishFactor = width / total;
			context.scale(squishFactor, 1);
		}
		start = 0;
		end = vector.size();
		for (var i = start; i < end; i++) {
			var value = vector.getValue(i);
			if (value != null) {
				context.strokeStyle = fill(value);
				var indices = valueToIndices.get(value);
				var pix = positions.getPosition(i) + positions.getItemSize(i)
					/ 2;
				for (var j = 0, nindices = indices.length; j < nindices; j++) {
					var viewIndex = indices[j];
					if (viewIndex === i) {
						continue;
					}
					var endPix = positions.getPosition(viewIndex)
						+ positions.getItemSize(viewIndex) / 2;
					var midPix = (endPix + pix) / 2;
					var distance = Math.abs(i - viewIndex);
					var arcRadius = size; // scale(distance) * size;
					if (isColumns) {
						context.beginPath();
						context.moveTo(pix, arcRadius);
						context.quadraticCurveTo(midPix, 1, endPix, arcRadius);
					} else {
						context.beginPath();
						context.moveTo(1, pix);
						context.quadraticCurveTo(arcRadius, midPix, 1, endPix);
					}

					context.stroke();

				}
			}

		}
		context.restore();
	},
	sdfToSvg: function (sdf, width, height) {
		if (!this.jsme && typeof JSApplet !== 'undefined') {
			this.jsmeId = _.uniqueId('m');
			this.$jsmeDiv = $(
				'<div id="'
				+ this.jsmeId
				+ '" style="position:absolute;left:-10000px;top:-10000px;"></div>')
			.appendTo($(document.body));
			this.jsme = new JSApplet.JSME(this.jsmeId, '380px', '340px', {});
		}
		// this.$jsmeDiv.css('width', width + 'px').css('height', height +
		// 'px');
		// this.jsme.setSize(width + 'px', height + 'px');
		this.jsme.readMolFile(sdf);
		var svg = $('#' + this.jsmeId + ' > div > div > div:nth-child(2) > svg');
		var svgWidth = svg.width.baseVal.value;
		var svgHeight = svg.height.baseVal.value;
		var scale = Math.min(width / svgWidth, height / svgHeight);
		var text = '<svg><g transform="scale(' + scale + ')">' + svg.innerHTML
			+ '</g></svg>';
		return text;
	},
	renderMolecule: function (context, vector, start, end, clip, offset) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
		context.strokeStyle = 'black';
		var width = this.getUnscaledWidth();
		var customUrlProvider = this.heatmap.options.structureUrlProvider !== undefined;
		var dummyTarget = {
			childNodes: [],
			getContext: function () {
				return context;
			}
		};
		for (var i = start; i < end; i++) {
			var spanEnd = this.spanMap.get(i);
			if (spanEnd !== undefined) {
				var startPix = positions.getPosition(i);
				var endPix = positions.getPosition(spanEnd - 1)
					+ positions.getSize();
				var size = endPix - startPix;
				var value = vector.getValue(i);
				var cache = this.moleculeCache[value];
				if (cache) {
					if (customUrlProvider) {
						if (cache.complete) {
							// 800 x 400
							var scaleFactor = Math.min(size / cache.height,
								width / cache.width);
							var scaledWidth = cache.width * scaleFactor;
							var scaledHeight = cache.height * scaleFactor;
							var diff = cache.height - scaledHeight;
							startPix += diff / 2;
							try {
								context.drawImage(cache, offset, startPix,
									scaledWidth, scaledHeight);
							} catch (x) {

							}
						}
					} else {
						var text = this.sdfToSvg(cache, width, size);
						canvg(dummyTarget, text, {
							ignoreMouse: true,
							ignoreAnimation: true,
							offsetY: startPix,
							ignoreClear: true,
							ignoreDimensions: true
						});
					}
				}
			}
		}
	},
	createChartScale: function (availableSpace) {
		var domain;
		var range;
		if (this.settings.mid !== this.settings.min
			&& this.settings.mid !== this.settings.max) {
			domain = [this.settings.min, this.settings.mid, this.settings.max];
			range = this.isColumns ? [availableSpace, availableSpace / 2, 0]
				: [0, availableSpace / 2, availableSpace];
		} else {
			domain = [this.settings.min, this.settings.max];
			range = this.isColumns ? [availableSpace, 0] : [0,
				availableSpace];
		}
		var scale = d3.scale.linear().domain(domain).range(range).clamp(true);
		return scale;
	},
	renderBar: function (context, vector, start, end, clip, offset,
						 availableSpace) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		context.fillStyle = this.settings.barColor;
		var scale = this.createChartScale(availableSpace);
		var midPix = scale(this.settings.mid);
		var settings = this.settings;
		var discrete = settings.discrete && this.discreteValueMap != null;
		for (var i = start; i < end; i++) {
			var value = vector.getValue(i);
			if (discrete) {
				value = this.discreteValueMap.get(value);
			}
			var position = positions.getPosition(i);
			var size = positions.getItemSize(i);
			var scaledValue = scale(value);
			if (isColumns) {
				context.beginPath();
				context.rect(position, Math.min(midPix, scaledValue), size,
					Math.abs(midPix - scaledValue));
				context.fill();
			} else {
				context.beginPath();
				context.rect(offset + Math.min(midPix, scaledValue), position,
					Math.abs(midPix - scaledValue), size);
				context.fill();
			}
		}
	},
	renderBoxPlot: function (context, vector, start, end, clip, offset,
							 availableSpace) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		context.strokeStyle = 'black';
		context.save();
		context.translate(offset, 0);
		var scale = this.createChartScale(availableSpace);
		var visibleFieldIndices = vector.getProperties().get(
			morpheus.VectorKeys.VISIBLE_FIELDS);

		if (visibleFieldIndices == null) {
			visibleFieldIndices = morpheus.Util.seq(vector.getProperties().get(
				morpheus.VectorKeys.FIELDS).length);
		}
		var colorByVector = this.settings.colorByField != null ? this
		.getVector(this.settings.colorByField) : null;
		var colorModel = isColumns ? this.project.getColumnColorModel()
			: this.project.getRowColorModel();
		// TODO cache box values
		for (var i = start; i < end; i++) {
			var array = vector.getValue(i);
			if (array != null) {
				var itemSize = positions.getItemSize(i);
				if (itemSize <= 3) {
					continue;
				}
				var radius = 2;
				var pix = positions.getPosition(i);
				var start = pix + 1;
				var end = pix + itemSize - 1;
				var center = (start + end) / 2;
				var _itemSize = itemSize - 2;
				var lineHeight = Math.max(2, _itemSize - 8);
				var box = array.box;
				if (box == null) {
					var v = morpheus.VectorUtil.arrayAsVector(array);
					box = morpheus
					.BoxPlotItem(visibleFieldIndices != null ? new morpheus.SlicedVector(
						v, visibleFieldIndices)
						: v);
					array.box = box;
				}
				context.fillStyle = '#bdbdbd';

				if (!isColumns) {
					// box from q1 (25th q) to q3
					context.fillRect(Math.min(scale(box.q1), scale(box.q3)),
						start, Math.abs(scale(box.q1) - scale(box.q3)),
						_itemSize);
					// draw line from q1 to lav
					context.fillRect(Math.min(scale(box.q1),
						scale(box.lowerAdjacentValue)), center - lineHeight
						/ 2, Math.abs(scale(box.q1)
						- scale(box.lowerAdjacentValue)), lineHeight);
					// draw line from q3 to uav
					context.fillRect(Math.min(scale(box.q3),
						scale(box.upperAdjacentValue)), center - lineHeight
						/ 2, Math.abs(scale(box.q3)
						- scale(box.upperAdjacentValue)), lineHeight);
					// points
					context.fillStyle = '#636363';

					for (var j = 0, length = visibleFieldIndices.length; j < length; j++) {
						var value = array[visibleFieldIndices[j]];
						if (value != null) {
							if (colorByVector != null) {
								var colorByArray = colorByVector.getValue(i);
								if (colorByArray != null) {
									var color = colorModel
									.getMappedValue(
										colorByVector,
										colorByArray[visibleFieldIndices[j]]);
									context.fillStyle = color;
								} else {
									context.fillStyle = '#636363';
								}

							}
							var pix = scale(value);
							context.beginPath();
							context
							.arc(pix, center, radius, Math.PI * 2,
								false);
							context.fill();
						}
					}

				} else { // TOD implement for columns

				}

			}
		}
		context.restore();
	},
	renderStackedBar: function (context, vector, start, end, clip, offset,
								availableSpace) {
		var isColumns = this.isColumns;
		var positions = this.positions;

		var scale = this.createChartScale(availableSpace);
		var midPix = scale(this.settings.mid);
		var settings = this.settings;
		var colorModel = isColumns ? this.project.getColumnColorModel()
			: this.project.getRowColorModel();

		var selectionModel = isColumns ? this.project.getRowSelectionModel()
			: null;
		var selectedModelIndices = selectionModel == null ? [] : selectionModel
		.toModelIndices();
		context.strokeStyle = 'black';
		context.lineWidth = 2;
		for (var i = start; i < end; i++) {
			var array = vector.getValue(i);
			if (array != null) {
				var selectedBinToCount = new morpheus.Map();
				if (array.modelIndexToBin != null) {
					for (var j = 0; j < selectedModelIndices.length; j++) {
						var bin = array.modelIndexToBin
						.get(selectedModelIndices[j]);
						if (bin !== undefined) {
							var prior = selectedBinToCount.get(bin) || 0;
							selectedBinToCount.set(bin, prior + 1);
						}
					}
				}

				var position = positions.getPosition(i);
				var size = positions.getItemSize(i);
				var positivePairs = [];
				var negativePairs = [];
				for (var j = 0, length = array.length; j < length; j++) {
					var value = array[j];
					if (value >= this.settings.mid) {
						positivePairs.push({
							value: value,
							index: j
						});
					} else if (value < 0) {
						negativePairs.push({
							value: value,
							index: j
						});
					}
				}

				var positiveIndices = morpheus.Util.indexSortPairs(
					positivePairs, false); // draw bigger values 1st
				for (var j = 0, length = positiveIndices.length; j < length; j++) {
					var index = positiveIndices[j];
					var value = array[index];
					var color = colorModel.getMappedValue(vector, index);
					context.fillStyle = color;
					var scaledValue = scale(value);
					var nextScaledValue = j === (length - 1) ? midPix
						: scale(array[positiveIndices[j + 1]]);
					if (isColumns) {
						context.beginPath();
						context.rect(position, Math.min(nextScaledValue,
							scaledValue), size, Math.abs(nextScaledValue
							- scaledValue));
						context.fill();
					} else {
						context.beginPath();
						context.rect(offset
							+ Math.min(nextScaledValue, scaledValue),
							position, Math.abs(nextScaledValue
								- scaledValue), size);
						context.fill();
					}
					if (selectedBinToCount.has(index)) {
						context.beginPath();
						var ytop = (nextScaledValue + scaledValue) / 2;
						context.moveTo(position, ytop);
						context.lineTo(position + size, ytop);
						context.stroke();

					}
				}
				var negativeIndices = morpheus.Util.indexSortPairs(
					negativePairs, true); // draw smaller (more negative)
				// values 1st
				for (var j = 0, length = negativeIndices.length; j < length; j++) {
					var index = negativeIndices[j];
					var value = array[index];
					var color = colorModel.getMappedValue(vector, index);
					context.fillStyle = color;
					var scaledValue = scale(value);
					var nextScaledValue = j === (length - 1) ? midPix
						: scale(array[negativeIndices[j + 1]]);
					if (isColumns) {
						context.beginPath();
						context.rect(position, Math.min(nextScaledValue,
							scaledValue), size, Math.abs(nextScaledValue
							- scaledValue));
						context.fill();
					} else {
						context.beginPath();
						context.rect(offset
							+ Math.min(nextScaledValue, scaledValue),
							position, Math.abs(nextScaledValue
								- scaledValue), size);
						context.fill();
					}
					if (selectedBinToCount.has(index)) {
						// draw a line at top of bin
						context.beginPath();
						var ytop = (nextScaledValue + scaledValue) / 2;
						context.moveTo(position, ytop);
						context.lineTo(position + size, ytop);
						context.stroke();
					}
				}
			}
		}
		context.lineWidth = 1;
	},
	renderUnstackedBar: function (context, vector, start, end, clip, offset,
								  availableSpace, fieldIndices) {
		var isColumns = this.isColumns;
		var positions = this.positions;
		var nvalues = fieldIndices.length;
		var settings = this.settings;
		var colorModel = isColumns ? this.project.getColumnColorModel()
			: this.project.getRowColorModel();
		context.fillStyle = this.settings.barColor;
		// context.strokeStyle = '0000f0';
		var barSpacer = 0;
		var barWidth = (availableSpace - (nvalues - 1) * barSpacer) / nvalues;
		var colorByVector = this.settings.colorByField != null ? this
		.getVector(this.settings.colorByField) : null;
		context.strokeStyle = 'white';
		for (var i = start; i < end; i++) {
			var array = vector.getValue(i);
			if (array != null) {
				var position = positions.getPosition(i);
				var itemSize = positions.getItemSize(i);
				var scale = this.createChartScale(itemSize - 1);
				var midPix = scale(this.settings.mid); // need to set mid pix
				// for each item
				var xpix = 0;
				for (var j = 0; j < nvalues; j++) {
					var value = array[fieldIndices[j]];
					if (colorByVector != null) {
						var colorByArray = colorByVector.getValue(i);
						var color = colorModel
						.getMappedValue(
							colorByVector,
							colorByArray != null ? colorByArray[fieldIndices[j]]
								: null);
						context.fillStyle = color;
					}

					var scaledValue = scale(value);

					if (isColumns) {
						context.beginPath();
						context.rect(Math.min(midPix, scaledValue), offset
							+ xpix, Math.abs(midPix - scaledValue),
							barWidth);
						context.fill();
					} else {
						// bar always goes to midpix
						context.beginPath();
						var barHeight = Math.abs(midPix - scaledValue);
						var ypix = position + itemSize
							- Math.max(midPix, scaledValue);
						context.rect(offset + xpix, ypix, barWidth, barHeight);
						context.fill();

					}

					xpix += barWidth + barSpacer;
				}

			}

		}
	},
	renderText: function (context, vector, isColor, start, end, clip, offset,
						  canvasSize) {

		context.textBaseline = 'middle';
		var positions = this.positions;
		var isColumns = this.isColumns;

		var colorModel = isColumns ? this.project.getColumnColorModel()
			: this.project.getRowColorModel();

		if (isColumns) {
			context.translate(clip.x, clip.y); // reset transform, needed for export to svg
		}
		var toStringFunction = morpheus.VectorTrack.vectorToString(vector);
		for (var i = start; i < end; i++) {
			var size = this.positions.getItemSize(i);
			if (size < 6) {
				continue;
			}
			var value = vector.getValue(i);
			if (value != null) {
				value = toStringFunction(value);
				var position = positions.getPosition(i);
				if (isColor) {
					context.fillStyle = colorModel
					.getMappedValue(vector, value);
				}
				if (isColumns) {
					context.save();
					context.translate(position + size / 2 - clip.x, canvasSize
						- clip.y - offset);
					context.rotate(-Math.PI / 2);
					context.fillText(value, 0, 0);
					context.restore();
				} else {
					context.fillText(value, offset, position + size / 2);
				}
			}
		}
	}
};
morpheus.Util.extend(morpheus.VectorTrack, morpheus.AbstractCanvas);

morpheus.VectorTrackHeader = function (project, name, isColumns, controller) {
	morpheus.AbstractCanvas.call(this);
	this.project = project;
	this.name = name;
	this.isColumns = isColumns;
	var canvas = this.canvas;
	this.controller = controller;
	var vector = (isColumns ? project.getFullDataset().getColumnMetadata()
		: project.getFullDataset().getRowMetadata()).getByName(name);
	if (vector && vector.getProperties().has(morpheus.VectorKeys.TITLE)) {
		this.canvas.setAttribute('title', vector.getProperties().get(
			morpheus.VectorKeys.TITLE));
		$(this.canvas).tooltip();
	}

	var _this = this;

	this.setBounds({
		height: this.defaultFontHeight
		+ morpheus.VectorTrackHeader.FONT_OFFSET
	});

	function getResizeCursor(pos) {
		if (isColumns) {
			if (pos.y < 3) {
				return {
					cursor: 'ns-resize',
					isPrevious: true
				};
			}
			if (pos.y >= (_this.getUnscaledHeight() - 3)) {
				return {
					cursor: 'ns-resize',
					isPrevious: false
				};
			}
			if (pos.x >= (_this.getUnscaledWidth() - 3)) { // change change column width
				return {
					isPrevious: false,
					cursor: 'ew-resize'
				};
			}
		} else {
			if (pos.x < 3) {
				return {
					cursor: 'ew-resize',
					isPrevious: true
				};
			}
			if (pos.x >= (_this.getUnscaledWidth() - 3)) {
				return {
					cursor: 'ew-resize',
					isPrevious: false
				};
			}
		}
	}

	var mouseMove = function (event) {
		if (!morpheus.CanvasUtil.dragging) {
			var pos = morpheus.CanvasUtil.getMousePos(event.target, event);
			var resizeCursor = getResizeCursor(pos);
			canvas.style.cursor = resizeCursor == null ? 'default' : resizeCursor.cursor;
			//document.body.style.cursor = !cursor ? 'default' : cursor;
			_this.isMouseOver = true;
			_this.repaint();
		}

	};
	var mouseExit = function (e) {
		if (!morpheus.CanvasUtil.dragging) {
			canvas.style.cursor = 'default';
		}
		_this.isMouseOver = false;
		_this.repaint();
	};
	var showPopup = function (e) {
		controller.setSelectedTrack(_this.name, isColumns);
		var track = controller.getTrack(_this.name, isColumns);
		if (!track) {
			throw _this.name + ' track not found';
		}
		e.preventDefault();
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		if (e.stopImmediatePropagation) {
			e.stopImmediatePropagation();
		}
		track.showPopup(e, true);
		return false;
	};
	this.selectedBackgroundColor = '#c8c8c8';
	this.backgroundColor = '#f9f9f9';
	$(this.canvas).css({'background-color': this.backgroundColor}).on(
		'mousemove.morpheus', mouseMove).on('mouseout.morpheus', mouseExit)
	.on('mouseenter.morpheus', mouseMove);

	$(this.canvas).on('contextmenu.morpheus', showPopup);

	var resizeCursor;
	var dragStartWidth = 0;
	var dragStartHeight = 0;
	var reorderingTrack = false;
	var dragStartPosition;
	var resizeTrackName;
	// var throttled = _.throttle(function(event) {
	//		
	// if (event.type === 'mouseout') {
	// } else {
	// }
	// }, 100);
	// $(canvas).on('mouseout', throttled).on('mousemove', throttled);
	this.hammer = morpheus.Util
	.hammer(canvas, ['pan', 'tap', 'longpress'])
	.on('longpress', function (event) {
		event.preventDefault();
		controller.setSelectedTrack(_this.name, isColumns);
		var track = controller.getTrack(_this.name, isColumns);
		track.showPopup(event.srcEvent, true);
	})
	.on(
		'panend',
		function (event) {
			_this.isMouseOver = false;
			morpheus.CanvasUtil.dragging = false;
			canvas.style.cursor = 'default';
			var index = controller.getTrackIndex(_this.name,
				isColumns);
			var header = controller.getTrackHeaderByIndex(index,
				isColumns);
			var track = controller
			.getTrackByIndex(index, isColumns);
			var $canvas = $(track.canvas);
			$canvas.css('z-index', '0');
			$(header.canvas).css('z-index', '0');
			controller.revalidate();
		})
	.on(
		'panstart',
		function (event) {
			_this.isMouseOver = false;
			if (morpheus.CanvasUtil.dragging) {
				return;
			}
			resizeCursor = getResizeCursor(morpheus.CanvasUtil
			.getMousePos(event.target, event, true));
			if (resizeCursor != null) { // make sure start event was on
				// hotspot
				morpheus.CanvasUtil.dragging = true;
				canvas.style.cursor = resizeCursor.cursor;
				if (resizeCursor.isPrevious) {
					var index = controller.getTrackIndex(_this.name,
						isColumns);
					index--; // FIXME index = -1
					if (index === -1) {
						index = 0;
					}
					var header = controller.getTrackHeaderByIndex(
						index, isColumns);
					dragStartWidth = header.getUnscaledWidth();
					dragStartHeight = header.getUnscaledHeight();
					resizeTrackName = header.name;
				} else {
					resizeTrackName = null;
					dragStartWidth = _this.getUnscaledWidth();
					dragStartHeight = _this.getUnscaledHeight();
				}
				event.preventDefault();
				reorderingTrack = false;
			} else {
				var index = controller.getTrackIndex(_this.name,
					isColumns);
				if (index == -1) {
					throw _this.name + ' not found';
				}
				var header = controller.getTrackHeaderByIndex(
					index, isColumns);
				var track = controller.getTrackByIndex(index,
					isColumns);
				controller.setSelectedTrack(_this.name, isColumns);
				var $canvas = $(track.canvas);
				dragStartPosition = $canvas.position();
				$canvas.css('z-index', '100');
				$(header.canvas).css('z-index', '100');
				morpheus.CanvasUtil.dragging = true;
				resizeCursor = undefined;
				reorderingTrack = true;
			}
		})
	.on(
		'panmove',
		function (event) {
			_this.isMouseOver = false;
			if (resizeCursor != null) {
				var width;
				var height;
				if (resizeCursor.cursor === 'ew-resize') {
					var dx = event.deltaX;
					width = Math.max(8, dragStartWidth + dx);
				}

				if (resizeCursor.cursor === 'ns-resize') {
					var dy = event.deltaY;
					height = Math.max(8, dragStartHeight + dy);
				}

				controller.resizeTrack(resizeTrackName == null ? _this.name : resizeTrackName, width, height,
					isColumns);
			} else if (reorderingTrack) { // reorder
				var index = controller.getTrackIndex(_this.name,
					isColumns);
				var header = controller.getTrackHeaderByIndex(
					index, isColumns);
				var track = controller.getTrackByIndex(index,
					isColumns);
				var ntracks = controller.getNumTracks(isColumns);
				var delta = isColumns ? event.deltaY : event.deltaX;
				var newIndex = index + (delta > 0 ? 1 : -1);
				newIndex = Math.min(Math.max(0, newIndex),
					ntracks - 1);
				var prop = isColumns ? 'top' : 'left';
				var w = isColumns ? 'getUnscaledHeight'
					: 'getUnscaledWidth';
				var trackBounds = {};
				trackBounds[prop] = dragStartPosition[prop] + delta;
				track.setBounds(trackBounds);
				header.setBounds(trackBounds);
				var dragOverTrack = controller.getTrackByIndex(
					newIndex, isColumns);
				var dragOverWidth = dragOverTrack[w]();
				var dragOverLeft = $(dragOverTrack.canvas)
				.position()[prop];
				var dragleft = dragStartPosition[prop] + delta;
				var dragright = dragleft + track[w]();
				if ((delta > 0 && dragright >= dragOverLeft
					+ dragOverWidth / 2)
					|| (delta < 0 && dragleft <= dragOverLeft
					+ dragOverWidth / 2)) {
					if (index !== newIndex) {
						controller.moveTrack(index, newIndex,
							isColumns);
						var otherHeader = controller
						.getTrackHeaderByIndex(index,
							isColumns);
						var otherTrack = controller
						.getTrackByIndex(index, isColumns);
						var $movedCanvas = $(otherTrack.canvas);
						var newLeft = $movedCanvas.position()[prop];
						if (delta < 0) {
							newLeft += track[w]();
						} else {
							newLeft -= track[w]();
						}
						var otherBounds = {};
						otherBounds[prop] = newLeft;
						otherTrack.setBounds(otherBounds);
						otherHeader.setBounds(otherBounds);
					}
				}
			}
		})
	.on(
		'tap',
		function (event) {
			if (morpheus.Util.IS_MAC && event.srcEvent.ctrlKey) { // right-click
				return;
			}
			_this.isMouseOver = false;
			controller.setSelectedTrack(_this.name, isColumns);
			if (isColumns && !controller.options.columnsSortable) {
				return;
			}
			if (!isColumns && !controller.options.rowsSortable) {
				return;
			}

			var additionalSort = event.srcEvent.shiftKey;
			var isGroupBy = false; // event.srcEvent.altKey;

			var existingSortKeyIndex = _this
			.getSortKeyIndexForColumnName(_this
			.getSortKeys(), _this.name);
			var sortOrder;
			var sortKey;
			if (existingSortKeyIndex != -1) {
				sortKey = _this.getSortKeys()[existingSortKeyIndex];
				if (sortKey.getSortOrder() === morpheus.SortKey.SortOrder.UNSORTED) {
					sortOrder = morpheus.SortKey.SortOrder.ASCENDING; // 1st
					// click
				} else if (sortKey.getSortOrder() === morpheus.SortKey.SortOrder.ASCENDING) {
					sortOrder = morpheus.SortKey.SortOrder.DESCENDING; // 2nd
					// click
				} else {
					sortOrder = morpheus.SortKey.SortOrder.UNSORTED; // 3rd
					// click
				}

			} else {
				sortKey = new morpheus.SortKey(_this.name,
					morpheus.SortKey.SortOrder.ASCENDING);
				sortOrder = morpheus.SortKey.SortOrder.ASCENDING;
			}
			if (sortKey != null) {
				sortKey.setSortOrder(sortOrder);
				_this.setSortingStatus(_this.getSortKeys(),
					sortKey, additionalSort, isGroupBy);
			}
			// }
		});
};
morpheus.VectorTrackHeader.FONT_OFFSET = 2;
morpheus.VectorTrackHeader.prototype = {
	selected: false,
	isMouseOver: false,
	defaultFontHeight: 11,
	dispose: function () {
		morpheus.AbstractCanvas.prototype.dispose.call(this);
		$(this.canvas)
		.off(
			'contextmenu.morpheus mousemove.morpheus mouseout.morpheus mouseenter.morpheus');
		this.hammer.destroy();
	},
	getPreferredSize: function () {
		var size = this.getPrintSize();
		size.width += 22;

		if (!this.isColumns) {
			size.height = this.defaultFontHeight
				+ morpheus.VectorTrackHeader.FONT_OFFSET;
		}
		// var vector = (this.isColumns ? this.project.getFullDataset()
		// .getColumnMetadata() : this.project.getFullDataset()
		// .getRowMetadata()).getByName(this.name);
		// if (vector
		// && vector.getProperties().get(
		// morpheus.VectorKeys.SHOW_HEADER_SUMMARY)) {
		// if (isNaN(size.height)) {
		// size.height = 0;
		// }
		// if (!this.isColumns) {
		// size.height += 50;
		// } else {
		// size.width += 50;
		// }
		//
		// }
		return size;
	},
	getPrintSize: function () {
		var context = this.canvas.getContext('2d');
		context.font = this.defaultFontHeight + 'px '
			+ morpheus.CanvasUtil.FONT_NAME;
		var textWidth = 4 + context.measureText(this.name).width;
		return {
			width: textWidth,
			height: this.defaultFontHeight
			+ morpheus.VectorTrackHeader.FONT_OFFSET
		};
	},
	getSortKeys: function () {
		return this.isColumns ? this.project.getColumnSortKeys() : this.project
		.getRowSortKeys();
	},
	setOrder: function (sortKeys) {
		if (this.isColumns) {
			this.project.setColumnSortKeys(morpheus.SortKey
			.keepExistingSortKeys(sortKeys, this.project
			.getColumnSortKeys()), false);
		} else {
			this.project.setRowSortKeys(morpheus.SortKey.keepExistingSortKeys(
				sortKeys, this.project.getRowSortKeys()), false);
		}
	},
	setGroupBy: function (groupBy) {
		var existingGroupBy = this.isColumns ? this.project.groupColumns
			: this.project.groupRows;
		// see if already exists, if so remove it
		var index = -1;
		for (var i = 0, length = existingGroupBy.length; i < length; i++) {
			if (existingGroupBy[i].toString() === groupBy.toString()) {
				index = i;
				break;
			}
		}
		var newGroupBy = [groupBy];
		if (index !== -1) {
			newGroupBy = existingGroupBy;
			newGroupBy.splice(index, 1);
		}
		if (this.isColumns) {
			this.project.setGroupColumns(newGroupBy, true);
		} else {
			this.project.setGroupRows(newGroupBy, true);
		}
	},
	setSelected: function (selected) {
		if (selected != this.selected) {
			this.selected = selected;
			$(this.canvas)
			.css(
				{
					'background-color': this.selected ? this.selectedBackgroundColor
						: this.backgroundColor
				});
		}
	},
	setSortingStatus: function (sortKeys, sortKey, additionalSort, isGroupBy) {
		if (!isGroupBy) {
			if (sortKey.getSortOrder() == morpheus.SortKey.SortOrder.UNSORTED
				&& !additionalSort) {
				this.setOrder([]);
			} else {
				if (additionalSort && sortKeys.length == 0) {
					additionalSort = false;
				}
				if (!additionalSort) {
					sortKeys = [sortKey];
				} else {
					var sortKeyIndex = this.getSortKeyIndexForColumnName(
						sortKeys, sortKey.toString());
					if (sortKeyIndex === -1) { // new sort column
						sortKeys.push(sortKey);
					} else { // change sort order of existing sort column
						sortKeys[sortKeyIndex] = sortKey;
					}
				}
				this.setOrder(sortKeys);
			}
		}
		if (isGroupBy) {
			this.setGroupBy(sortKey);
		} else {
			if (this.isColumns) {
				this.project.trigger('columnSortOrderChanged');
			} else {
				this.project.trigger('rowSortOrderChanged');
			}
		}
	},
	getSortKeyIndexForColumnName: function (sortKeys, columnName) {
		if (sortKeys != null) {
			for (var i = 0, size = sortKeys.length; i < size; i++) {
				if (columnName === sortKeys[i].toString()) {
					return i;
				}
			}
		}
		return -1;
	},
	print: function (clip, context) {
		if (clip.height <= 6) {
			return;
		}
		context.textBaseline = 'bottom';
		if (this.isColumns) {
			context.textAlign = 'right';
			context.font = Math.min(this.defaultFontHeight, clip.height
					- morpheus.VectorTrackHeader.FONT_OFFSET)
				+ 'px ' + morpheus.CanvasUtil.FONT_NAME;
		} else {
			context.textAlign = 'left';
			context.font = (clip.height - morpheus.VectorTrackHeader.FONT_OFFSET)
				+ 'px ' + morpheus.CanvasUtil.FONT_NAME;
		}
		context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
		context.fillText(this.name, 0, 0);
	},
	draw: function (clip, context) {
		var sortKeys = this.getSortKeys();
		var name = this.name;
		var existingSortKeyIndex = this.getSortKeyIndexForColumnName(sortKeys,
			name);
		morpheus.CanvasUtil.resetTransform(context);
		context.clearRect(0, 0, this.getUnscaledWidth(), this
		.getUnscaledHeight());

		if (this.getUnscaledHeight() < 5) {
			return;
		}

		if (this.isColumns) {
			context.beginPath();
			context.moveTo(0, this.getUnscaledHeight());
			context.lineTo(this.getUnscaledWidth(), this.getUnscaledHeight());
			context.stroke();
			context.textAlign = 'right';
		} else {
			context.beginPath();
			context.moveTo(this.getUnscaledWidth(), 0);
			context.lineTo(this.getUnscaledWidth(), this.getUnscaledHeight());
			context.stroke();
			context.textAlign = 'left';
		}
		var fontHeight = Math.min(this.defaultFontHeight, this
			.getUnscaledHeight()
			- morpheus.VectorTrackHeader.FONT_OFFSET);
		var squished = this.controller.getTrack(this.name, this.isColumns).settings.squished;
		context.font = (squished ? 'Italic ' : '') + fontHeight + 'px '
			+ morpheus.CanvasUtil.FONT_NAME;
		var textWidth = context.measureText(name).width;
		var isColumns = this.isColumns;
		var xpix = this.isColumns ? this.getUnscaledWidth() - 2 : 10;
		if (isColumns) {
			if (existingSortKeyIndex != -1) {
				xpix -= 6;
			}
			if (sortKeys.length > 1) {
				xpix -= 6;
			}
		}
		var ypix = this.isColumns ? (this.getUnscaledHeight() / 2)
			: (this.getUnscaledHeight() - (this.defaultFontHeight + morpheus.VectorTrackHeader.FONT_OFFSET) / 2);
		context.textBaseline = 'middle';
		if (this.isMouseOver) {
			context.fillStyle = 'rgb(0,0,0)';
			var xdot = xpix - (isColumns ? textWidth + 4 : 4);
			var ydot = ypix - 3;
			for (var i = 0; i < 2; i++) {
				for (var j = 0; j < 3; j++) {
					context.fillRect(xdot - i * 3, ydot + j * 3, 1.5, 1.5);
				}
			}
		}
		context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
		context.fillText(name, xpix, ypix);
		// var vector = (this.isColumns ? this.project.getFullDataset()
		// .getColumnMetadata() : this.project.getFullDataset()
		// .getRowMetadata()).getByName(this.name);
		// if (vector
		// && vector.getProperties().get(
		// morpheus.VectorKeys.SHOW_HEADER_SUMMARY)) {
		// var summary = vector.getProperties().get(
		// morpheus.VectorKeys.HEADER_SUMMARY);
		// var track = this.controller.getTrack(this.name, this.isColumns);
		// if (summary == null) {
		// var visibleFieldIndices = vector.getProperties().get(
		// morpheus.VectorKeys.VISIBLE_FIELDS);
		//
		// if (visibleFieldIndices == null) {
		// visibleFieldIndices = morpheus.Util
		// .seq(vector.getProperties().get(
		// morpheus.VectorKeys.FIELDS).length);
		// }
		// var bigArray = [];
		// var min = Number.MAX_VALUE;
		// var max = Number.MAX_VALUE;
		// for (var i = 0, size = vector.size(); i < size; i++) {
		// var array = vector.getValue(i);
		// if (array != null) {
		// for (var j = 0, length = visibleFieldIndices.length; j < length; j++)
		// {
		// var value = array[visibleFieldIndices[j]];
		// if (!isNaN(value)) {
		// bigArray.push(value);
		// min = value < min ? value : min;
		// max = value > max ? value : max;
		// }
		// }
		// }
		// }
		// var nbins = Math.ceil(morpheus.Log2(bigArray.length) + 1);
		// var binSize = (max - min) / nbins;
		// var binNumberToOccurences = new Uint32Array(nbins);
		// var maxOccurences = 0;
		// for (var i = 0, size = bigArray.length; i < size; i++) {
		// var value = bigArray[i];
		// var bin = Math.floor((value - min) / binSize);
		// if (bin < 0) {
		// bin = 0;
		// } else if (bin >= binNumberToOccurences.length) {
		// bin = binNumberToOccurences.length - 1;
		// }
		// binNumberToOccurences[bin]++;
		// maxOccurences = Math.max(maxOccurences,
		// binNumberToOccurences[bin]);
		// }
		// summary = {
		// box : morpheus.BoxPlotItem(morpheus.VectorUtil
		// .arrayAsVector(bigArray)),
		// histogram : {
		// binSize : binSize,
		// total : bigArray.length,
		// binNumberToOccurences : binNumberToOccurences,
		// maxOccurences : maxOccurences,
		// min : min,
		// max : max
		// }
		//
		// };
		//
		// vector.getProperties().set(morpheus.VectorKeys.HEADER_SUMMARY,
		// summary);
		// }
		// var box = summary.box;
		// context.save();
		// context.translate(1, 0);
		//
		// var scale = track.createChartScale(this.getUnscaledWidth() - 2); //
		// TODO
		// // make
		// // sure
		// // scale
		// // is
		// // the
		// // same
		// // as
		// // track
		// var itemSize = 12;
		// var pix = 1;
		// var start = pix + 1;
		// var end = pix + itemSize - 1;
		// var center = (start + end) / 2;
		// var _itemSize = itemSize - 2;
		// var lineHeight = Math.max(2, _itemSize - 8);
		// context.fillStyle = 'black';
		// // box from q1 (25th q) to q3
		// context.fillRect(Math.min(scale(box.q1), scale(box.q3)), start,
		// Math.abs(scale(box.q1) - scale(box.q3)), _itemSize);
		// // draw line from q1 to lav
		// context.fillRect(Math.min(scale(box.q1),
		// scale(box.lowerAdjacentValue)), center - lineHeight / 2,
		// Math.abs(scale(box.q1) - scale(box.lowerAdjacentValue)),
		// lineHeight);
		// // draw line from q3 to uav
		// context.fillRect(Math.min(scale(box.q3),
		// scale(box.upperAdjacentValue)), center - lineHeight / 2,
		// Math.abs(scale(box.q3) - scale(box.upperAdjacentValue)),
		// lineHeight);
		// var histogram = summary.histogram;
		// var yscale = d3.scale.linear().domain([ 0, 1 ]).range([ 48, 14 ])
		// .clamp(true);
		// var xscale = d3.scale.linear().domain(
		// [ histogram.min, histogram.max + histogram.binSize ])
		// .range([ 1, this.getUnscaledWidth() - 2 ]).clamp(true);
		// // context.beginPath();
		// // context.moveTo(xscale(0), yscale(0));
		//
		// for (var i = 0, nbins = histogram.binNumberToOccurences.length; i <
		// nbins; i++) {
		// var n = histogram.binNumberToOccurences[i];
		// if (n > 0) {
		// var x = histogram.min + (i * histogram.binSize);
		// var xend = histogram.min + (i * histogram.binSize)
		// + histogram.binSize;
		// var xstart = histogram.min + (i * histogram.binSize);
		// var ypix = yscale(n / histogram.total);
		// context.fillRect(xscale(xstart), ypix, xscale(xend)
		// - xscale(xstart), Math.abs(ypix - yscale(0)));
		// }
		// }
		//
		// context.restore();
		// }
		context.fillStyle = morpheus.CanvasUtil.FONT_COLOR;
		if (existingSortKeyIndex !== -1) {
			context.beginPath();
			var x = this.isColumns ? xpix + 4 : xpix + textWidth + 6;
			var arrowHeight = Math.min(8, this.getUnscaledHeight() / 2 - 1);
			var arrowWidth = 3;
			if (sortKeys[existingSortKeyIndex].getSortOrder() === morpheus.SortKey.SortOrder.ASCENDING) {
				// up arrow
				context.translate(x, ypix - arrowHeight);
				context.moveTo(0, 0);
				context.lineTo(arrowWidth, arrowHeight);
				context.lineTo(-arrowWidth, arrowHeight);
			} else if (sortKeys[existingSortKeyIndex].getSortOrder() === morpheus.SortKey.SortOrder.DESCENDING) { // down
				// arrow
				context.translate(x, ypix);
				context.moveTo(0, arrowHeight);
				context.lineTo(arrowWidth, 0);
				context.lineTo(-arrowWidth, 0);
			} else { // diamond
				context.translate(x, ypix - arrowHeight / 2);
				context.moveTo(0, 0);
				context.lineTo(arrowWidth, arrowHeight / 2);
				context.lineTo(0, arrowHeight);
				context.lineTo(-arrowWidth, arrowHeight / 2);

			}
			context.fill();
			morpheus.CanvasUtil.resetTransform(context);
			if (sortKeys.length > 1) {
				context.textAlign = 'left';
				context.font = '8px ' + morpheus.CanvasUtil.FONT_NAME;
				context.fillText('' + (existingSortKeyIndex + 1), x + 4,
					ypix - 3);
			}
		}
	}
};
morpheus.Util.extend(morpheus.VectorTrackHeader, morpheus.AbstractCanvas);

/**
 * Performs clustering using pairwise average linking on the given distance
 * matrix.
 * 
 * @return array of nodes. Each node object contains a left, right, and
 *         distance.
 */
morpheus.AverageLinkage = function(nelements, distmatrix) {
	var j;
	var n;
	var clusterid;
	var number;
	var result;
	clusterid = []; // nelements;
	number = []; // nelements;
	result = []; // nelements - 1;
	for (var i = 0; i < nelements - 1; i++) {
		result[i] = {
			left : 0,
			right : 0,
			distance : 0
		};
	}
	/*
	 * Setup a list specifying to which cluster an element belongs, and keep
	 * track of the number of elements in each cluster (needed to calculate the
	 * average).
	 */
	for (j = 0; j < nelements; j++) {
		number[j] = 1;
		clusterid[j] = j;
	}
	// ip, jp, and distance;
	var r = {};
	// result array contains array of int left, int right, float distance;
	for (n = nelements; n > 1; n--) {
		morpheus.HCluster.findClosestPair(n, distmatrix, r);
		result[nelements - n] = {};
		result[nelements - n].distance = r.distance;
		var is = r.ip;
		var js = r.jp;
		/* Save result */
		result[nelements - n].left = clusterid[is];
		result[nelements - n].right = clusterid[js];
		/* Fix the distances */
		var sum = number[is] + number[js];
		for (j = 0; j < js; j++) {
			distmatrix[js][j] = distmatrix[is][j] * number[is]
					+ distmatrix[js][j] * number[js];
			distmatrix[js][j] /= sum;
		}
		for (j = js + 1; j < is; j++) {
			distmatrix[j][js] = distmatrix[is][j] * number[is]
					+ distmatrix[j][js] * number[js];
			distmatrix[j][js] /= sum;
		}
		for (j = is + 1; j < n; j++) {
			distmatrix[j][js] = distmatrix[j][is] * number[is]
					+ distmatrix[j][js] * number[js];
			distmatrix[j][js] /= sum;
		}
		for (j = 0; j < is; j++)
			distmatrix[is][j] = distmatrix[n - 1][j];
		for (j = is + 1; j < n - 1; j++)
			distmatrix[j][is] = distmatrix[n - 1][j];
		/* Update number of elements in the clusters */
		number[js] = sum;
		number[is] = number[n - 1];
		/* Update clusterids */
		clusterid[js] = n - nelements - 1;
		clusterid[is] = clusterid[n - 1];
	}
	return result;
};

morpheus.CollapseDataset = function(dataset, collapseToFields,
		summarizeFunction, shallowCopy) {
	var vectors = [];
	for (var i = 0; i < collapseToFields.length; i++) {
		var v = dataset.getRowMetadata().getByName(collapseToFields[i]);
		if (!v) {
			throw collapseToFields[i]
					+ ' not found. Available fields are '
					+ morpheus.MetadataUtil.getMetadataNames(dataset
							.getRowMetadata());
		}
		vectors.push(v);
	}
	var idToIndices = morpheus.VectorUtil.createValuesToIndicesMap(vectors);
	var collapsedDataset = new morpheus.Dataset({
		name : dataset.getName(),
		rows : idToIndices.size(),
		columns : dataset.getColumnCount(),
		dataType : 'Float32'
	});
	var nseries = dataset.getSeriesCount();
	for (var series = 1; series < nseries; series++) {
		collapsedDataset.addSeries({
			name : dataset.getName(i),
			dataType : 'Float32'
		});
	}
	if (shallowCopy) {
		collapsedDataset.setColumnMetadata(dataset.getColumnMetadata());
	} else {
		morpheus.MetadataUtil.copy(dataset.getColumnMetadata(),
				collapsedDataset.getColumnMetadata());
	}
	var nfields = collapseToFields.length;
	var collapseToVectors = [];
	for (var i = 0; i < nfields; i++) {
		collapseToVectors.push(collapsedDataset.getRowMetadata().add(
				collapseToFields[i]));
	}
	var counter = 0;
	idToIndices
			.forEach(function(rowIndices, key) {
				// collapse each column separately
				var slice = morpheus.DatasetUtil.slicedView(dataset,
						rowIndices, null);
				var view = new morpheus.DatasetColumnView(slice);
				for (var series = 0; series < nseries; series++) {
					view.setSeriesIndex(series);
					for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
						view.setIndex(j);
						collapsedDataset.setValue(counter, j,
								summarizeFunction(view), series);
					}
				}
				for (var i = 0; i < nfields; i++) {
					var collapsedToVector = collapseToVectors[i];
					var vector = vectors[i];
					collapsedToVector.setValue(counter, vector
							.getValue(rowIndices[0]));
				}
				counter++;
			});
	return collapsedDataset;
};

morpheus.CompleteLinkage = function(nelements, distmatrix) {
	var j;
	var n;
	var clusterid = []; // new var[nelements];
	var result = [];// new Node[nelements - 1];
	for (var i = 0; i < nelements - 1; i++) {
		result[i] = {
			left : 0,
			right : 0,
			distance : 0
		};
	}
	/* Setup a list specifying to which cluster a gene belongs */
	for (j = 0; j < nelements; j++)
		clusterid[j] = j;
	var r = {};
	for (n = nelements; n > 1; n--) {
		morpheus.HCluster.findClosestPair(n, distmatrix, r);
		result[nelements - n].distance = r.distance;
		var is = r.ip;
		var js = r.jp;
		/* Fix the distances */
		for (j = 0; j < js; j++)
			distmatrix[js][j] = Math.max(distmatrix[is][j], distmatrix[js][j]);
		for (j = js + 1; j < is; j++)
			distmatrix[j][js] = Math.max(distmatrix[is][j], distmatrix[j][js]);
		for (j = is + 1; j < n; j++)
			distmatrix[j][js] = Math.max(distmatrix[j][is], distmatrix[j][js]);
		for (j = 0; j < is; j++)
			distmatrix[is][j] = distmatrix[n - 1][j];
		for (j = is + 1; j < n - 1; j++)
			distmatrix[j][is] = distmatrix[n - 1][j];
		/* Update clusterids */
		result[nelements - n].left = clusterid[is];
		result[nelements - n].right = clusterid[js];
		clusterid[js] = n - nelements - 1;
		clusterid[is] = clusterid[n - 1];
	}
	return result;
};
morpheus.HCluster = function(distmatrix, linkageAlgorithm) {
	var nelements = distmatrix.length;
	var nNodes = nelements - 1;
	if (nNodes === -1) {

		var root = {
			id : 0,
			height : 0,
			index : 0,
			minIndex : 0,
			maxIndex : 0,
			depth : 0
		};

		this.tree = {
			maxHeight : 0,
			rootNode : root,
			leafNodes : [],
			nLeafNodes : 0
		};
		this.reorderedIndices = [ 0 ];
		return;
	}
	// tree array contains array of int left, int right, float distance;
	var tree = linkageAlgorithm(nelements, distmatrix);
	var nodeorder = []; // nNodes;
	var nodecounts = [];// nNodes;
	var order = []; // nelements;
	var nodeID = []; // nNodes;
	for (var i = 0; i < nelements; i++) {
		order[i] = i;
	}
	var leftIds = []; // nNodes
	var rightIds = []; // nNodes
	for (var i = 0; i < nNodes; i++) {
		var min1 = tree[i].left;
		var min2 = tree[i].right;
		/* min1 and min2 are the elements that are to be joined */
		var order1;
		var order2;
		var counts1;
		var counts2;
		var ID1;
		var ID2;
		nodeID[i] = nNodes + (i + 2);
		if (min1 < 0) {
			var index1 = -min1 - 1;
			order1 = nodeorder[index1];
			counts1 = nodecounts[index1];
			ID1 = nodeID[index1];
			tree[i].distance = Math
					.max(tree[i].distance, tree[index1].distance);
		} else {
			order1 = order[min1];
			counts1 = 1;
			ID1 = min1;
		}
		if (min2 < 0) {
			var index2 = -min2 - 1;
			order2 = nodeorder[index2];
			counts2 = nodecounts[index2];
			ID2 = nodeID[index2];
			tree[i].distance = Math
					.max(tree[i].distance, tree[index2].distance);
		} else {
			order2 = order[min2];
			counts2 = 1;
			ID2 = min2;
		}
		leftIds[i] = ID1;
		rightIds[i] = ID2;
		nodecounts[i] = counts1 + counts2;
		nodeorder[i] = (counts1 * order1 + counts2 * order2)
				/ (counts1 + counts2);
	}
	var reorderedIndices = morpheus.HCluster.treeSort(nNodes, order, nodeorder,
			nodecounts, tree);
	var idToIndex = {};
	for (var i = 0, length = reorderedIndices.length; i < length; i++) {
		var index = reorderedIndices[i];
		idToIndex[index] = i;
	}
	var nodeIdToNode = {};
	var node;
	for (var i = 0, length = nodeID.length; i < length; i++) {
		var id = nodeID[i];
		var leftId = leftIds[i];
		var lnode = nodeIdToNode[leftId];
		if (lnode === undefined) {
			lnode = {
				id : leftId
			};
			var index = idToIndex[leftId];
			lnode.index = index;
			lnode.minIndex = index;
			lnode.maxIndex = index;
			nodeIdToNode[lnode.id] = lnode;
		}
		var rightId = rightIds[i];
		var rnode = nodeIdToNode[rightId];
		if (rnode === undefined) {
			rnode = {
				id : rightId
			};
			var index = idToIndex[rightId];
			rnode.index = index;
			rnode.minIndex = index;
			rnode.maxIndex = index;
			nodeIdToNode[rnode.id] = rnode;
		}
		node = {
			id : id,
			children : [ lnode, rnode ],
			height : tree[i].distance,
			index : (rnode.index + lnode.index) / 2.0
		};
		node.minIndex = Math.min(rnode.minIndex, lnode.minIndex);
		node.maxIndex = Math.max(rnode.maxIndex, lnode.maxIndex);
		lnode.parent = node;
		rnode.parent = node;
		nodeIdToNode[node.id] = node;
	}
	this.reorderedIndices = reorderedIndices;
	var leafNodes = [];
	for (var i = 0, length = reorderedIndices.length; i < length; i++) {
		var leaf = nodeIdToNode[reorderedIndices[i]];
		leaf.height = 0;
		leafNodes.push(leaf);
	}

	morpheus.AbstractDendrogram.setNodeDepths(node);

	this.tree = {
		maxHeight : node.height,
		rootNode : node,
		leafNodes : leafNodes,
		nLeafNodes : leafNodes.length
	};
};
/*
 * Searches the distance matrix to find the pair with the shortest distance
 * between them. The indices of the pair are returned in ip and jp; the distance
 * itself is returned by the function.
 * 
 * @param n The number of elements in the distance matrix.
 * 
 * @param distmatrix. A ragged array containing the distance matrix. The number
 * of columns in each row is one less than the row index.
 * 
 * @return The first and second indices of the pair with the shortest distance.
 */
morpheus.HCluster.findClosestPair = function(n, distmatrix, r) {
	var i, j;
	var temp;
	var distance = distmatrix[1][0];
	var ip = 1;
	var jp = 0;
	for (i = 1; i < n; i++) {
		for (j = 0; j < i; j++) {
			temp = distmatrix[i][j];
			if (temp < distance) {
				distance = temp;
				ip = i;
				jp = j;
			}
		}
	}
	r.distance = distance;
	r.ip = ip;
	r.jp = jp;
};
/**
 * Creates a ragged array with the number of rows equal to the number of rows in
 * the dataset. Each row in the array has n columns where n is the row index.
 * 
 * @param dataset
 * @param distanceFunction
 *            The distance function. Use 0 to assume dataset is already a
 *            distance matrix, 1 to assume dataset is already a similarity
 *            matrix.
 * @return the distance matrix
 */
morpheus.HCluster.computeDistanceMatrix = function(dataset, distanceFunction) {
	/* Set up the ragged array */
	var matrix = [];
	var n = dataset.getRowCount();
	for (var i = 1; i < n; i++) {
		matrix[i] = new Float32Array(i);
	}
	// assume dataset is already a distance matrix
	if (distanceFunction === 0) {
		for (var i = 1; i < n; i++) {
			for (var j = 0; j < i; j++) {
				matrix[i][j] = dataset.getValue(i, j);
			}
		}
	} else if (distanceFunction === 1) {
		for (var i = 1; i < n; i++) {
			for (var j = 0; j < i; j++) {
				matrix[i][j] = 1 - dataset.getValue(i, j);
			}
		}
	} else {
		var list1 = new morpheus.DatasetRowView(dataset);
		var list2 = new morpheus.DatasetRowView(dataset);
		/* Calculate the distances and save them in the ragged array */
		for (var i = 1; i < n; i++) {
			list1.setIndex(i);
			for (var j = 0; j < i; j++) {
				matrix[i][j] = distanceFunction(list1, list2.setIndex(j));
			}
		}
	}

	return matrix;
};
morpheus.HCluster.treeSort = function(nNodes, order, nodeorder, nodecounts,
		tree) {
	var nElements = nNodes + 1;
	var i;
	var neworder = []; // nElements;
	var clusterids = []; // nElements;
	for (i = 0; i < nElements; i++) {
		clusterids[i] = i;
		neworder[i] = 0;
	}
	for (i = 0; i < nNodes; i++) {
		var i1 = tree[i].left;
		var i2 = tree[i].right;
		var order1 = (i1 < 0) ? nodeorder[-i1 - 1] : order[i1];
		var order2 = (i2 < 0) ? nodeorder[-i2 - 1] : order[i2];
		var count1 = (i1 < 0) ? nodecounts[-i1 - 1] : 1;
		var count2 = (i2 < 0) ? nodecounts[-i2 - 1] : 1;
		/*
		 * If order1 and order2 are equal, their order is determined by the
		 * order in which they were clustered
		 */
		if (i1 < i2) {
			var increase = (order1 < order2) ? count1 : count2;
			var j;
			for (j = 0; j < nElements; j++) {
				var clusterid = clusterids[j];
				if ((clusterid == i1) && (order1 >= order2)) {
					neworder[j] += increase;
				}
				if ((clusterid == i2) && (order1 < order2)) {
					neworder[j] += increase;
				}
				if ((clusterid == i1) || (clusterid == i2)) {
					clusterids[j] = -i - 1;
				}
			}
		} else {
			var increase = (order1 <= order2) ? count1 : count2;
			var j;
			for (j = 0; j < nElements; j++) {
				var clusterid = clusterids[j];
				if ((clusterid == i1) && (order1 > order2)) {
					neworder[j] += increase;
				}
				if ((clusterid == i2) && (order1 <= order2)) {
					neworder[j] += increase;
				}
				if ((clusterid == i1) || (clusterid == i2)) {
					clusterids[j] = -i - 1;
				}
			}
		}
	}
	return morpheus.Util.indexSort(neworder, true);
};
morpheus.HClusterGroupBy = function(dataset, groupByFieldNames,
		distanceFunction, linkageMethod) {
	var model = dataset.getRowMetadata();
	var vectors = morpheus.MetadataUtil.getVectors(dataset.getRowMetadata(),
			groupByFieldNames);
	var idToIndices = morpheus.VectorUtil.createValuesToIndicesMap(vectors);
	var reorderedIndices = [];
	var offset = 0;
	var root = {
		id : -1,
		children : [],
		height : 0
	};
	var tree = {
		maxHeight : 0,
		rootNode : root,
		leafNodes : [],
		nLeafNodes : 0
	};
	idToIndices
			.forEach(function(rowIndices, id) {
				var originalIndicesForGroup = idToIndices.get(id);
				var subset = morpheus.DatasetUtil.slicedView(dataset,
						originalIndicesForGroup, null);
				var hcl;
				var distanceMatrix = morpheus.HCluster.computeDistanceMatrix(
						subset, distanceFunction);
				hcl = new morpheus.HCluster(distanceMatrix, linkageMethod);
				var reorderedGroupIndices = hcl.reorderedIndices;
				for (var i = 0, rows = subset.getRowCount(); i < rows; i++) {
					var originalIndex = originalIndicesForGroup[reorderedGroupIndices[i]];
					reorderedIndices.push(originalIndex);
				}

				morpheus.AbstractDendrogram.dfs(hcl.tree.rootNode, function(
						node) {
					node.index += offset;
					node.minIndex += offset;
					node.maxIndex += offset;
					node.id += offset;
					return true;
				});
				if (hcl.tree.leafNodes.length === 0) {
					tree.leafNodes = tree.leafNodes
							.concat([ hcl.tree.rootNode ]);
				} else {
					tree.leafNodes = tree.leafNodes.concat(hcl.tree.leafNodes);

				}

				root.children.push(hcl.tree.rootNode);
				if (!isNaN(hcl.tree.maxHeight)) {
					tree.maxHeight = Math.max(tree.maxHeight,
							hcl.tree.maxHeight);
				}
				offset += subset.getRowCount();
			});
	tree.nLeafNodes = tree.leafNodes.length;
	tree.rootNode.height = tree.maxHeight;
	this.tree = tree;
	this.reorderedIndices = reorderedIndices;
};
morpheus.PermutationPValues = function(dataset, aIndices, bIndices,
		numPermutations, f) {
	var numRows = dataset.getRowCount();
	/** unpermuted scores */
	var scores = new Float32Array(numRows);
	/** Whether to smooth p values */
	var smoothPValues = true;
	var list1 = new morpheus.DatasetRowView(new morpheus.SlicedDatasetView(
			dataset, null, aIndices));
	var list2 = new morpheus.DatasetRowView(new morpheus.SlicedDatasetView(
			dataset, null, bIndices));

	for (var i = 0; i < numRows; i++) {
		scores[i] = f(list1.setIndex(i), list2.setIndex(i));
	}
	dataset = new morpheus.SlicedDatasetView(dataset, null, aIndices
			.concat(bIndices));
	var rowSpecificPValues = new Float32Array(numRows);
	var permuter = new morpheus.UnbalancedPermuter(aIndices.length,
			bIndices.length);
	var permutationScore = new morpheus.TwoClassPermutationScore();
	permutationScore.init(dataset, f);
	for (var permutationIndex = 0; permutationIndex < numPermutations; permutationIndex++) {
		permutationScore.setPermutation(permuter.next());
		for (var i = 0; i < numRows; i++) {
			var permutedScore = permutationScore.getScore(i);
			var score = scores[i];
			if (permutedScore >= score) {
				rowSpecificPValues[i]++;
			}
		}
	}
	var N = numPermutations;
	var kArray = new Uint32Array(numRows);
	for (var i = 0; i < numRows; i++) {
		var k = rowSpecificPValues[i];
		kArray[i] = k;
		var p;
		if (smoothPValues) {
			p = (k + 1) / (N + 2);
		} else {
			p = k / N;

		}
		// 2-sided p-value
		var oneMinusP = 1 - p;
		if (oneMinusP < p) {
			p = oneMinusP;
		}
		p *= 2;
		if (p === 0) {
			// ensure not degenerate case where profile is
			// completely
			// flat
			// TODO handle cases where profile is flat (but not
			// completely)

			var val = dataset.getValue(i, 0);
			var flat = true;
			for (var j = 1, cols = dataset.getColumnCount(); j < cols && flat; j++) {
				if (dataset.getValue(i, j) != val) {
					flat = false;
				}
			}
			if (flat) {
				p = 1;
			}
		}
		rowSpecificPValues[i] = p;

	}
	this.rowSpecificPValues = rowSpecificPValues;
	this.k = kArray;
	this.fdr = morpheus.FDR_BH(rowSpecificPValues);
	this.scores = scores;
};
morpheus.PermutationPValues.prototype = {
	getBonferroni : function(index) {
		return Math.min(this.rowSpecificPValues[index] * this.numRows, 1);
	}
};

morpheus.UnbalancedPermuter = function(numClassZero, numClassOne) {
	var assignments = new Uint32Array(numClassZero + numClassOne);
	var indices = new Uint32Array(numClassZero + numClassOne);
	for (var i = 0; i < indices.length; i++) {
		indices[i] = i;
	}
	var n = indices.length;
	// Returns a random integer between min (included) and max (included)
	// Using Math.round() will give you a non-uniform distribution!
	function getRandomIntInclusive(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	this.next = function() {
		// shuffle indices array
		for (var i = n - 1; i >= 1; i--) {
			var j = getRandomIntInclusive(0, i); // random integer such that
			// 0 ≤ j ≤ i
			// exchange a[j] and a[i]
			var tmp = indices[j];
			indices[j] = indices[i];
			indices[i] = tmp;
		}

		// pick 1st numClassOne indices to be class one
		for (var i = 0; i < n; i++) {
			assignments[i] = 0;
		}
		for (var i = 0; i < numClassOne; i++) {
			assignments[indices[i]] = 1;
		}

		return assignments;
	};
};

morpheus.TwoClassPermutationScore = function() {
	this.classZeroView = null;
	this.classOneView = null;

};
morpheus.TwoClassPermutationScore.prototype = {
	getScore : function(index) {
		this.classZeroView.setIndex(index);
		this.classOneView.setIndex(index);
		return this.f(this.classZeroView, this.classOneView);
	},
	init : function(dataset, f) {
		this.dataset = dataset;
		this.classZeroView = new morpheus.DatasetRowView(dataset);
		this.classOneView = new morpheus.DatasetRowView(dataset);
		this.f = f;
	},
	setPermutation : function(permutedAssignments) {
		var zeroIndices = [];
		var oneIndices = [];
		for (var i = 0, length = permutedAssignments.length; i < length; i++) {
			if (permutedAssignments[i] === 0) {
				zeroIndices.push(i);
			} else {
				oneIndices.push(i);
			}
		}

		this.classZeroView.setDataset(new morpheus.SlicedDatasetView(
				this.dataset, null, zeroIndices));
		this.classOneView.setDataset(new morpheus.SlicedDatasetView(
				this.dataset, null, oneIndices));

	}

};

morpheus.Ranking = function(values) {
	var ranks = [];
	for (var i = 0, length = values.length; i < length; i++) {
		ranks.push({
			value : values[i],
			position : i
		});
	}
	if (ranks.length === 0) {
		return [];
	}
	ranks.sort(function(a, b) {
		return (a.value < b.value ? -1 : (a.value === b.value ? 0 : 1));
	});

	var out = [];
	var pos = 1; // position in sorted array
	out[ranks[0].position] = pos;
	var tiesTrace = [];
	tiesTrace.push(ranks[0].position);
	for (var i = 1; i < ranks.length; i++) {
		if (ranks[i].value > ranks[i - 1].value) {
			// tie sequence has ended (or had length 1)
			pos = i + 1;
			if (tiesTrace.length > 1) { // if seq is nontrivial, resolve
				morpheus.Ranking.fillAverage(out, tiesTrace);
			}
			tiesTrace = [];
			tiesTrace.push(ranks[i].position);
		} else {
			// tie sequence continues
			tiesTrace.push(ranks[i].position);
		}
		out[ranks[i].position] = pos;
	}
	if (tiesTrace.length > 1) { // handle tie sequence at end
		morpheus.Ranking.fillAverage(out, tiesTrace);
	}
	return out;
};
morpheus.Ranking.fill = function(data, tiesTrace, value) {
	for (var i = 0, length = tiesTrace.length; i < length; i++) {
		data[tiesTrace[i]] = value;
	}
};
morpheus.Ranking.fillAverage = function(ranks, tiesTrace) {
	var c = ranks[tiesTrace[0]];
	// length of sequence of tied ranks
	var length = tiesTrace.length;
	morpheus.Ranking.fill(ranks, tiesTrace, (2 * c + length - 1) / 2);
};
morpheus.SingleLinkage = function(nelements, distmatrix) {
	var i, j, k;
	var nnodes = nelements - 1;
	var temp = []; // var[nnodes];
	var index = []; // new var[nelements];
	var vector = []; // var[nnodes];
	var result = []; // new Node[nelements];
	for (i = 0; i < nelements; i++) {
		result[i] = {
			left : 0,
			right : 0,
			distance : 0
		};
	}
	for (i = 0; i < nnodes; i++)
		vector[i] = i;
	for (i = 0; i < nelements; i++) {
		result[i].distance = Number.MAX_VALUE;
		for (j = 0; j < i; j++) {
			temp[j] = distmatrix[i][j];
		}
		for (j = 0; j < i; j++) {
			k = vector[j];
			if (result[j].distance >= temp[j]) {
				if (result[j].distance < temp[k]) {
					temp[k] = result[j].distance;
				}
				result[j].distance = temp[j];
				vector[j] = i;
			} else if (temp[j] < temp[k]) {
				temp[k] = temp[j];
			}
		}
		for (j = 0; j < i; j++) {
			if (result[j].distance >= result[vector[j]].distance) {
				vector[j] = i;
			}
		}
	}
	for (i = 0; i < nnodes; i++) {
		result[i].left = i;
	}
	result.sort(function(node1, node2) {
		var term1 = node1.distance;
		var term2 = node2.distance;
		if (term1 < term2)
			return -1;
		if (term1 > term2)
			return +1;
		return 0;
	});
	for (i = 0; i < nelements; i++)
		index[i] = i;
	for (i = 0; i < nnodes; i++) {
		j = result[i].left;
		k = vector[j];
		result[i].left = index[j];
		result[i].right = index[k];
		index[k] = -i - 1;
	}
	var result2 = []; // new Node[nelements - 1];
	for (i = 0; i < nelements - 1; i++) {
		result2[i] = result[i];
	}
	return result2;
};

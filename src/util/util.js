/**
 * @name morpheus
 * @namespace
 */
var morpheus = (typeof morpheus !== 'undefined') ? morpheus : {};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = morpheus; // Node
} else if (typeof define === 'function' && define.amd) {
  define(function () { // AMD module
    return morpheus;
  });
} else {
  global.morpheus = morpheus; // browser global
}
morpheus.Util = function () {
};

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
morpheus.Util.isFetchStreamingSupported = function () {
  return typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Chrome') !== -1;
};

morpheus.Util.viewPortSize = function () {
  return window.getComputedStyle(document.body, ':before').content.replace(
    /"/g, '');
};

morpheus.Util.TRACKING_ENABLED = true;
morpheus.Util.TRACKING_CODE_LOADED = false;
morpheus.Util.loadTrackingCode = function () {
  if (morpheus.Util.TRACKING_ENABLED && typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.onLine) {
    if (morpheus.Util.TRACKING_CODE_LOADED) {
      return;
    } else if (typeof ga === 'undefined') {
      morpheus.Util.TRACKING_CODE_LOADED = true;
      (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
          (i[r].q = i[r].q || []).push(arguments);
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
          m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
      })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
    }
    if (typeof ga !== 'undefined') {
      ga('create', 'UA-53973555-1', 'auto', 'morpheus');
      ga('morpheus.send', 'pageview');
    }
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
    if (morpheus.Util.TRACKING_CODE_LOADED && typeof ga !== 'undefined') {
      ga('morpheus.send', {
        hitType: 'event',
        eventCategory: options.eventCategory,
        eventAction: options.eventAction,
        eventLabel: options.eventLabel
      });
    }
  }

};

morpheus.Util.isString = function (value) {
  return typeof value === 'string' || value instanceof String;
};
/**
 *
 * @param val The value to determine the data type for.
 * @return {String} One of string, number, object, [string], [number], [object]
 */
morpheus.Util.getDataType = function (val) {
  var dataType;
  var isArray = morpheus.Util.isArray(val);
  if (isArray && val.length > 0) {
    val = val[0];
  }
  if (morpheus.Util.isString(val)) {
    dataType = 'string';
  } else if (_.isNumber(val)) {
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
 * Checks whether supplied argument is an array
 */
morpheus.Util.isArray = function (array) {
  var types = [
    Array, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array,
    Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
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
  return (' ' + s).substr(1);
  //return (' ' + s).slice(1);
  // var copy = [];
  // for (var i = 0, end = s.length; i < end; i++) {
  // 	copy.push(s[i]);
  // }
  // return copy.join('');
};
morpheus.Util.getQueryParams = function (s) {
  var params = {};
  if (!s) {
    return params;
  }
  var search = decodeURIComponent(s);
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
morpheus.Util.getScriptPath = function (name) {
  if (!name) {
    name = 'morpheus-latest.min.js';
  }
  var scripts = document.getElementsByTagName('script');
  for (var i = scripts.length - 1; i >= 0; i--) {
    var src = scripts[i].src;
    var index = src.lastIndexOf('/');
    if (index !== -1) {
      src = src.substring(index + 1);
    }
    if (src === name) {
      return scripts[i].src;
    }
  }

  // not found
  if (name === 'morpheus-latest.min.js') {
    return morpheus.Util.getScriptPath('morpheus.js');
  }
  // return 1st script
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
  }
  catch (x) {
    console.log('Unable to delete');
  }
};
morpheus.Util.getFileName = function (fileOrUrl) {
  if (morpheus.Util.isFile(fileOrUrl)) {
    return fileOrUrl.name;
  }
  if (fileOrUrl.name !== undefined) {
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
    }
  }
  return name;
};
morpheus.Util.prefixWithZero = function (value) {
  return value < 10 ? '0' + value : value;
};
morpheus.Util.getExtension = function (name) {
  name = '' + name;
  var dotIndex = name.lastIndexOf('.');
  if (dotIndex > 0) {
    var suffix = name.substring(dotIndex + 1).toLowerCase();
    if (suffix === 'txt' || suffix === 'gz' || suffix === 'tsv') { // see if file is in
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
  search = decodeURIComponent(search);
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

morpheus.Util.isHeadless = function () {
  return typeof $.ui === 'undefined';
};

morpheus.Util.isFile = function (f) {
  return typeof File !== 'undefined' && f instanceof File;
};
morpheus.Util.endsWith = function (string, suffix) {
  return string.length >= suffix.length
    && string.substr(string.length - suffix.length) === suffix;
};
morpheus.Util.measureSvgText = function (text, classname) {
  if (!text || text.length === 0) {
    return {
      height: 0,
      width: 0
    };
  }
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
  if (typeof Hammer !== 'undefined') {
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
    if (_.indexOf(recognizers, 'swipe') !== -1) {
      hammer.add(new Hammer.Swipe());
    }
    return hammer;
  } else {
    return $();
  }

};

morpheus.Util.createTextDecoder = function () {
  if (typeof TextDecoder !== 'undefined') {
    var textDecoder = new TextDecoder();
    return function (buf, start, end) {
      return textDecoder.decode(buf.subarray(start, end));
    };
  } else {
    return function (buf, start, end) {
      // TODO convert in chunks
      var s = [];
      for (var i = start; i < end; i++) {
        s.push(String.fromCharCode(buf[i]));
      }
      return s.join('');
    };
  }
};
morpheus.Util.autocompleteArrayMatcher = function (token, cb, array, fields, max) {
  var filteredSet = new morpheus.Set();
  var regex = new RegExp(morpheus.Util.escapeRegex(token), 'i');
  var regexMatch = new RegExp('(' + morpheus.Util.escapeRegex(token) + ')', 'i');
  // iterate through the pool of strings and for any string that
  // contains the substring `q`, add it to the `matches` array
  if (fields) {
    var nfields = fields.length;
    for (var i = 0, n = array.length; i < n; i++) {
      var item = array[i];
      for (var j = 0; j < nfields; j++) {
        var field = fields[j];
        var value = item[field];
        if (regex.test(value)) {
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
      if (regex.test(value)) {
        filteredSet.add(value);
        if (filteredSet.size() === max) {
          break;
        }
      }

    }
  }
  var matches = [];

  filteredSet.forEach(function (value) {
    var quotedValue = value;
    if (quotedValue.indexOf(' ') !== -1) {
      quotedValue = '"' + quotedValue + '"';
    }
    matches.push({
      value: quotedValue,
      label: '<span>' + value.replace(regexMatch, '<b>$1</b>')
      + '</span>'
    });
  });

  cb(matches);
};

/**
 *
 * @param array. Array of format,data
 */
morpheus.Util.setClipboardData = function (clipboardData, delay) {
  var isRTL = document.documentElement.getAttribute('dir') == 'rtl';
  var fakeElem = document.createElement('div');
  fakeElem.contentEditable = true;

  // Prevent zooming on iOS
  fakeElem.style.fontSize = '12pt';
  // Reset box model

  fakeElem.style.border = '0';
  fakeElem.style.padding = '0';
  fakeElem.style.margin = '0';
  // Move element out of screen horizontally
  fakeElem.style.position = 'absolute';
  fakeElem.style[isRTL ? 'right' : 'left'] = '-999999px';
  // Move element to the same position vertically
  fakeElem.style.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';
  fakeElem.setAttribute('readonly', '');
  //fakeElem.innerHTML = html;
  var f = function (e) {
    clipboardData.forEach(function (elem) {
      e.clipboardData.setData(elem.format, elem.data);
    });

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    fakeElem.removeEventListener('copy', f);
  };
  fakeElem.addEventListener('copy', f);

  document.body.appendChild(fakeElem);
  // if (fakeElem.hasAttribute('contenteditable')) {
  fakeElem.focus();
  // }
  var selection = window.getSelection();
  var range = document.createRange();
  range.selectNodeContents(fakeElem);
  selection.removeAllRanges();
  selection.addRange(range);
  if (delay) {
    setTimeout(function () {
      if (!document.execCommand('copy')) {
        console.log('copy failed');
      }
      document.body.removeChild(fakeElem);
    }, 20);
  } else {
    if (!document.execCommand('copy')) {
      console.log('copy failed');
    }
    document.body.removeChild(fakeElem);
  }
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
  options = $.extend({}, {
    multi: true,
    delay: 500,
    minLength: 0,
    suggestWhenEmpty: true
  }, options);

  var searching = false;

  function _select(event, ui, isKey) {
    if (ui.item.skip) {
      return false;
    }
    if (options.multi) {
      var terms = morpheus.Util
        .getAutocompleteTokens(
          options.$el[0].value,
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
      } else if (ui.item.clear) {
        terms = [value];
      } else {
        terms[terms.selectionStartIndex === -1
        || terms.selectionStartIndex === undefined ? terms.length - 1
          : terms.selectionStartIndex] = value;
      }
      // add the selected item
      options.$el[0].value = terms.join(' ');
      if ((show && !isKey) || (isKey && event.which === 13)) { // did
        // we
        // select
        // just a
        // field name?
        searching = true;
        setTimeout(function () {
          options.$el.autocomplete('search',
            options.$el.val());
        }, 20);
        setTimeout(function () {
          searching = false;
        }, 100);

      }
      if (!isKey && options.select) {
        options.select();
      }
      return false;
    }
    if (!isKey && options.select) {
      options.select();
    }
    if (!isKey && event.which === 13) {
      event.stopImmediatePropagation();
    }
  }

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
        minLength: options.minLength,
        delay: options.delay,
        source: function (request, response) {
          if (request.term.history && options.history) {
            return options.history(response);
          }
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
        focus: function (event, ui) {
          var original = event.originalEvent;
          while (original.originalEvent != null) {
            original = original.originalEvent;
          }
          if (original && /^key/.test(original.type)) {
            return _select(original, ui, true);
          }
          return false;
        },
        select: function (event, ui) {
          return _select(event, ui, false);
        }
      });

  // use html for label instead of default text, class for categories vs. items
  var instance = options.$el.autocomplete('instance');
  if (instance != null) {
    instance._renderItem = function (ul, item) {
      if (item.value == null) { // category
        return $('<li class="' + (item.class ? (' ' + item.class) : '') + ' search-category">')
          .append($('<div>').html(item.label))
          .appendTo(ul);
      }
      return $('<li class="' + (item.class ? (' ' + item.class) : '') + ' search-item">')
        .append($('<div>').html(item.label))
        .appendTo(ul);
    };
    instance._normalize = function (items) {
      return items;
    };
    instance._resizeMenu = function () {
      var ul = this.menu.element;
      ul.outerWidth(instance.element.outerWidth());
    };
  }
  var menu = options.$el.autocomplete('widget');
  menu.menu('option', 'items', '> :not(.search-category)');
  if (menu) {
    menu.addClass('search-menu');
  }
  if (options.suggestWhenEmpty) {
    options.$el.on('focus', function () {
      options.$el.autocomplete('search', options.$el.val());
    });
  }

  options.$el.on('keyup', function (e) {
    if (e.which === 13 && !searching) {
      options.$el.autocomplete('close');
    } else if (e.which === 38 && options.history) { // up arrow
      options.$el.autocomplete('search', {history: true});
    } else if (options.suggestWhenEmpty && options.$el.val() === '') {
      options.$el.autocomplete('search', '');
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
  var inParen = false;
  var tokens = [];
  var currentToken = [];

  for (var i = 0, n = text.length; i < n; i++) {
    var c = text[i];
    if (c === '"') {
      inQuote = !inQuote;
      currentToken.push(c);
    } else if (c === '(' || c === ')') {
      inParen = c === '(';
      currentToken.push(c);
    } else {
      if ((c === ' ' || c === '\t') && !inQuote && !inParen) {
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
  var colors = [];
  var header = [];
  for (var C = r.s.c; C <= r.e.c; ++C) {
    var val = sheet[XLSX.utils.encode_cell({
      c: C,
      r: r.s.r
    })];
    var txt = String(XLSX.utils.format_cell(val));
    header.push(txt);
  }
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
      if (val.s != null && val.s.fgColor != null) {
        var color = '#' + val.s.fgColor.rgb;
        colors.push({
          header: header[row.length],
          color: color,
          value: txt
        });
      }
      row.push(txt);
    }
    rows.push(delim ? row.join(delim) : row);
  }

  rows.colors = colors;
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
/**
 *
 * @param options.data Binary data string
 * @param options.prompt Prompt for sheet name
 * @param callback {Function} Callback
 */
morpheus.Util.xlsxTo2dArray = function (options, callback) {
  var workbook = XLSX.read(options.data, {
    type: 'binary',
    cellFormula: false,
    cellHTML: false,
    cellStyles: true
  });
  var sheetNames = workbook.SheetNames;
  if (options.prompt && sheetNames.length > 1) {
    var formBuilder = new morpheus.FormBuilder();
    formBuilder.append({
      name: 'sheet',
      type: 'bootstrap-select',
      options: sheetNames,
      required: true,
      style: 'max-width:100px;'
    });
    morpheus.FormBuilder.showInModal({
      title: 'Choose Sheet',
      html: formBuilder.$form,
      focus: document.activeElement,
      onClose: function () {
        var worksheet = workbook.Sheets[formBuilder.getValue('sheet')];
        var lines = morpheus.Util.sheetToArray(worksheet);
        callback(null, lines);
      }
    });

  } else {
    var worksheet = workbook.Sheets[sheetNames[0]];
    var lines = morpheus.Util.sheetToArray(worksheet);
    callback(null, lines);
  }

};
/**
 *
 * @param options.data Binary data string
 * @param options.prompt Prompt for sheet name
 * @param callback {Function} Callback
 */
morpheus.Util.xlsxTo1dArray = function (options, callback) {
  var workbook = XLSX.read(options.data, {
    type: 'binary',
    cellFormula: false,
    cellHTML: false,
    cellStyles: true
  });
  var sheetNames = workbook.SheetNames;
  if (options.prompt && sheetNames.length > 1) {
    var formBuilder = new morpheus.FormBuilder();
    formBuilder.append({
      name: 'sheet',
      type: 'bootstrap-select',
      options: sheetNames,
      required: true,
      style: 'max-width:100px;'
    });

    morpheus.FormBuilder.showOkCancel({
      title: 'Choose Sheet',
      cancel: false,
      focus: document.activeElement,
      content: formBuilder.$form,
      okCallback: function () {
        var worksheet = workbook.Sheets[formBuilder.getValue('sheet')];
        callback(null, morpheus.Util.sheetToArray(worksheet, '\t'));
      }
    });

  } else {
    var worksheet = workbook.Sheets[sheetNames[0]];
    callback(null, morpheus.Util.sheetToArray(worksheet, '\t'));
  }

};

/**
 * Returns a promise that resolves to a string
 */
morpheus.Util.getText = function (fileOrUrl) {
  var deferred = $.Deferred();
  if (morpheus.Util.isString(fileOrUrl)) {
    fetch(fileOrUrl).then(function (response) {
      if (response.ok) {
        return response.text();
      } else {
        deferred.reject(response.status + ' ' + response.statusText);
      }
    }).then(function (text) {
      // var type = xhr.getResponseHeader('Content-Type');
      deferred.resolve(text);
    }).catch(function (err) {
      deferred.reject(err);
    });
  } else if (morpheus.Util.isFile(fileOrUrl)) {
    var reader = new FileReader();
    reader.onload = function (event) {
      deferred.resolve(event.target.result);
    };
    reader.readAsText(fileOrUrl);
  } else {
    // what is fileOrUrl?
    deferred.resolve(fileOrUrl);
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
  for (var i = 0, length = array.length; i < length; i++) {
    pairs.push({
      value: array[i],
      index: i
    });
  }
  return morpheus.Util.indexSortPairs(pairs, ascending);
};
morpheus.Util.indexSortPairs = function (array, ascending) {
  if (ascending) {
    array.sort(function (a, b) {
      return (a.value < b.value ? -1 : (a.value === b.value ? (a.index < b.index ? -1 : 1) : 1));
    });
  } else {
    array.sort(function (a, b) {
      return (a.value < b.value ? 1 : (a.value === b.value ? (a.index < b.index ? 1 : -1) : -1));
    });
  }
  var indices = [];
  array.forEach(function (item) {
    indices.push(item.index);
  });
  return indices;
};
morpheus.Util.arrayEquals = function (array1, array2, comparator) {
  if (array1 == array2) {
    return true;
  }
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
morpheus.Util._nf = typeof d3 !== 'undefined' ? d3.format('.2f') : function (d) {
  return '' + d;
};

morpheus.Util.getNumberFormatPatternFractionDigits = function (pattern) {
  return parseInt(pattern.substring(1, pattern.length - 1)) || 0;
};

morpheus.Util.nf = function (n) {
  // var str = (n < 1 && n > -1 && n.toPrecision !== undefined) ? n
  // .toPrecision(4) : morpheus.Util._nf(n);
  // return morpheus.Util.removeTrailingZerosInFraction(str);
  return morpheus.Util._nf(n);
};
morpheus.Util.createNumberFormat = function (pattern) {
  var f = d3.format(pattern);
  f.toJSON = function () {
    return {pattern: pattern};
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
      s.push(morpheus.Util.nf(val_i));
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
          predicate = new morpheus.Util.EqualsPredicate(
            field, val);
        } else {
          console.log('Unknown range token:' + rangeToken);
        }
      } else if (token[0] === '"' && token[token.length - 1] === '"') { // exact
        token = token.substring(1, token.length - 1);
        predicate = new morpheus.Util.ExactTermPredicate(field,
          token);
      } else if (token[0] === '(' && token[token.length - 1] === ')') { // exact terms
        token = token.substring(1, token.length - 1);
        var values = morpheus.Util.getAutocompleteTokens(token);

        if (values.length > 0) {
          predicate = new morpheus.Util.ExactTermsPredicate(field,
            values.map(function (val) {
              if (val[0] === '"' && val[val.length - 1] === '"') {
                val = val.substring(1, val.length - 1);
              }
              return val.toLowerCase();
            }));
        }
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
  var tab = /\t/;
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
 * @return A deferred object that resolves to an array of strings
 */
morpheus.Util.readLines = function (fileOrUrl, interactive) {
  var isFile = morpheus.Util.isFile(fileOrUrl);
  var isString = morpheus.Util.isString(fileOrUrl);
  var name = morpheus.Util.getFileName(fileOrUrl);
  var ext = morpheus.Util.getExtension(name);
  var deferred = $.Deferred();
  if (isString) { // URL
    if (ext === 'xlsx') {
      var fetchOptions = {};
      if (fileOrUrl.headers) {
        fetchOptions.headers = new Headers();
        for (var header in fileOrUrl.headers) {
          fetchOptions.headers.append(header, fileOrUrl.headers[header]);
        }
      }
      fetch(fileOrUrl, fetchOptions).then(function (response) {
        if (response.ok) {
          return response.arrayBuffer();
        } else {
          deferred.reject(response);
        }
      }).then(function (arrayBuffer) {
        if (arrayBuffer) {
          var data = new Uint8Array(arrayBuffer);
          var arr = [];
          for (var i = 0; i != data.length; ++i) {
            arr[i] = String.fromCharCode(data[i]);
          }
          var bstr = arr.join('');
          morpheus.Util.xlsxTo1dArray({
            data: bstr,
            prompt: interactive
          }, function (err, lines) {
            deferred.resolve(lines);
          });

        } else {
          deferred.reject();
        }
      });
    } else {
      fetch(fileOrUrl, fetchOptions).then(function (response) {
        if (response.ok) {
          return response.text();
        } else {
          deferred.reject();
        }
      }).then(function (text) {
        deferred.resolve(morpheus.Util.splitOnNewLine(text));
      }).catch(function (err) {
        deferred.reject(err);
      });
    }
  } else if (isFile) {
    var reader = new FileReader();
    reader.onerror = function () {
      console.log('Unable to read file');
      deferred.reject('Unable to read file');
    };
    reader.onload = function (event) {
      if (ext === 'xlsx' || ext === 'xls') {
        var data = new Uint8Array(event.target.result);
        var arr = [];
        for (var i = 0; i != data.length; ++i) {
          arr[i] = String.fromCharCode(data[i]);
        }
        var bstr = arr.join('');
        morpheus.Util
          .xlsxTo1dArray({
            data: bstr,
            prompt: interactive
          }, function (err, lines) {
            deferred.resolve(lines);
          });
      } else {
        deferred.resolve(morpheus.Util.splitOnNewLine(event.target.result));
      }

    };
    if (ext === 'xlsx' || ext === 'xls') {
      reader.readAsArrayBuffer(fileOrUrl);
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

morpheus.Util.createMorpheusHeader = function () {
  var html = [];
  html.push('<div style="display:inline-block;' +
    ' vertical-align:top;font-size:24px;font-family:sans-serif;">');
  html.push('<span>M</span>');
  html.push('<span>O</span>');
  html.push('<span>R</span>');
  html.push('<span>P</span>');
  html.push('<span>H</span>');
  html.push('<span>E</span>');
  html.push('<span>U</span>');
  html.push('<span>S</span>');
  html.push('</span>');
  html.push('</div>');
  var $div = $(html.join(''));
  var colorScale = d3.scale.linear().domain([0, 4, 7]).range(['#ca0020', '#999999', '#0571b0']).clamp(true);
  var brands = $div.find('span');
  var index = 0;
  var step = function () {
    brands[index].style.color = colorScale(index);
    index++;
    if (index < brands.length) {
      setTimeout(step, 200);
    }
  };
  setTimeout(step, 500);
  return $div;
};
morpheus.Util.createLoadingEl = function () {
  return $(
    '<div style="overflow:hidden;text-align:center;"><i class="fa fa-spinner fa-spin fa-3x"></i><span style="padding-left:4px;vertical-align:middle;font-weight:bold;">Loading...</span></div>');
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
  var rtrim = /\s+$/;
  for (var i = 0, nlines = lines.length; i < nlines; i++) {
    var line = lines[i].replace(rtrim, '');
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
    if (value == null) {
      return false;
    }
    value = ('' + value).toLowerCase();
    return value.indexOf(this.text) !== -1;
  },
  getField: function () {
    return this.field;
  },
  getText: function () {
    return this.text;
  },
  isNumber: function () {
    return false;
  },
  toString: function () {
    return 'ContainsPredicate ' + this.field + ':' + this.text;
  }
};
morpheus.Util.ExactTermsPredicate = function (field, values) {
  this.field = field;
  this.values = new morpheus.Set();
  for (var i = 0, nvalues = values.length; i < nvalues; i++) {
    this.values.add(values[i]);
  }
};
morpheus.Util.ExactTermsPredicate.prototype = {
  accept: function (value) {
    if (value == null) {
      return false;
    }
    value = ('' + value).toLowerCase();
    return this.values.has(value);
  },
  getField: function () {
    return this.field;
  },
  getValues: function () {
    return this.values;
  },
  isNumber: function () {
    return false;
  },
  toString: function () {
    return 'ExactTermsPredicate ' + this.field + ':' + this.text;
  }
};

morpheus.Util.ExactTermPredicate = function (field, term) {
  this.field = field;
  term = term.toLowerCase();
  this.text = term;
};
morpheus.Util.ExactTermPredicate.prototype = {
  accept: function (value) {
    if (value == null) {
      return false;
    }
    value = ('' + value).toLowerCase();
    return value === this.text;
  },
  getField: function () {
    return this.field;
  },
  getText: function () {
    return this.text;
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
    return this.regex.test('' + value);
  },
  getField: function () {
    return this.field;
  },
  getText: function () {
    return this.text;
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

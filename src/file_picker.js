morpheus.FilePicker = function (options) {

  var html = [];
  html.push('<div>');
  html.push('<ul style="margin-bottom:10px;" class="nav nav-pills morpheus">');
  html.push('<li role="presentation" class="active"><a href="#myComputer"' +
    ' aria-controls="myComputer" role="tab" data-toggle="tab"><i class="fa fa-desktop"></i>' +
    ' My Computer</a></li>');
  html.push('<li role="presentation"><a href="#url"' +
    ' aria-controls="url" role="tab" data-toggle="url"><i class="fa fa-link"></i>' +
    ' URL</a></li>');
  html.push('<li role="presentation"><a href="#dropbox"' +
    ' aria-controls="dropbox" role="tab" data-toggle="dropbox"><i class="fa fa-dropbox"></i>' +
    ' Dropbox</a></li>');

  for (var i = 0; i < options.addOn.length; i++) {
    var id = _.uniqueId('morpheus');
    options.addOn[i].id = id;
    html.push('<li role="presentation"><a href="#' + id + '"' +
      ' aria-controls="' + id + '" role="tab" data-toggle="' + id + '">' + options.addOn[i].header + '</a></li>');
  }

  html.push('</ul>');

  html.push('<div class="tab-content"' +
    ' style="text-align:center;cursor:pointer;height:300px;">');

  html.push('<div role="tabpanel" class="tab-pane active" id="myComputer">');
  html.push('<div data-name="drop" class="morpheus-file-drop morpheus-landing-panel">');
  html.push('<button class="btn btn-default"><span class="fa-stack"><i' +
    ' class="fa fa-file-o' +
    ' fa-stack-2x"></i> <i class="fa fa-plus fa-stack-1x"></i></span> Select File</button>' +
    ' <div style="padding-top:10px;">or Copy and Paste Clipboard Data, <span' +
    ' class="morpheus-drag-text">Drag and' +
    ' Drop</span></div>');
  html.push('<input name="hiddenFile" style="display:none;" type="file">');
  html.push('</div>');
  html.push('</div>');

  html.push('<div role="tabpanel" class="tab-pane" id="url">');
  html.push('<div class="morpheus-landing-panel">');
  html.push('<input name="url" placeholder="Enter a URL" class="form-control"' +
    ' style="display:inline;max-width:400px;' +
    ' type="text">');
  html.push('</div>');
  html.push('</div>');

  html.push('<div role="tabpanel" class="tab-pane" id="dropbox">');
  html.push('<div class="morpheus-landing-panel">');
  html.push('<button name="dropbox" class="btn btn-default">Browse Dropbox</button>');
  html.push('</div>');
  html.push('</div>');

  for (var i = 0; i < options.addOn.length; i++) {
    html.push('<div role="tabpanel" class="tab-pane" id="' + options.addOn[i].id + '">');
    html.push('<div class="morpheus-landing-panel">');
    html.push('</div>');
    html.push('</div>');
  }
  html.push('</div>'); // tab-content
  html.push('</div>');
  var $el = $(html.join(''));
  this.$el = $el;
  for (var i = 0; i < options.addOn.length; i++) {
    var $div = $el.find('#' + options.addOn[i].id + ' > .morpheus-landing-panel');
    options.addOn[i].$el.appendTo($div);
  }
  var $file = $el.find('[name=hiddenFile]');
  this.$el.find('.nav').on('click', 'li > a', function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

  var $url = $el.find('[name=url]');
  $url.on('keyup', function (evt) {
    if (evt.which === 13) {
      var text = $.trim($(this).val());
      if (text !== '') {
        options.cb(text);
      }
    }
  });
  var $dropbox = $el.find('[name=dropbox]');
  $dropbox.on('click', function (e) {
    Dropbox.choose({
      success: function (results) {
        var val = results[0].link;
        options.cb(val);
      },
      linkType: 'direct',
      multiselect: false

    });
  });

  $file.on('change', function (evt) {
    var files = evt.target.files; // FileList object
    options.cb(files[0]);
  });
  $(window).on('paste.morpheus', function (e) {
    if ($('#myComputer').is(':visible')) {
      var text = e.originalEvent.clipboardData.getData('text/plain');
      if (text != null && text.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        var url;
        if (text.indexOf('http') === 0) {
          url = text;
        } else {
          var blob = new Blob([text]);
          url = window.URL.createObjectURL(blob);
        }
        options.cb(url);
      }
    }
  })
  var $drop = $el.find('[data-name=drop]');
  var clicking = false;
  $drop.on('click', function (e) {
    if (!clicking) {
      clicking = true;
      $file.click();
      clicking = false;
    }
    // e.preventDefault();
  }).on(
    'dragover',
    function (e) {
      $drop.addClass('drag');
      e.preventDefault();
      e.stopPropagation();
    }).on(
    'dragenter',
    function (e) {
      $drop.addClass('drag');
      e.preventDefault();
      e.stopPropagation();
    }).on('dragleave', function (e) {
    $drop.removeClass('drag');
    e.preventDefault();
    e.stopPropagation();
  }).on('drop', function (e) {
    $drop.removeClass('drag');
    if (e.originalEvent.dataTransfer) {
      if (e.originalEvent.dataTransfer.files.length) {
        e.preventDefault();
        e.stopPropagation();
        var files = e.originalEvent.dataTransfer.files;
        options.cb(files[0]);
      } else {
        var url = e.originalEvent.dataTransfer.getData('URL');
        options.cb(url);
        e.preventDefault();
        e.stopPropagation();

      }
    }
  });
  ;
};

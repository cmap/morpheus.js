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

  if (typeof gapi !== 'undefined') {
    html.push('<li role="presentation"><a href="#google"' +
      ' aria-controls="google" role="tab" data-toggle="google"><i class="fa fa-google"></i>' +
      ' Google</a></li>');
  }
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

  if (typeof gapi !== 'undefined') {
    html.push('<div role="tabpanel" class="tab-pane" id="google">');
    html.push('<div class="morpheus-landing-panel">');
    html.push('<button name="google" class="btn btn-default">Browse Google Drive</button>');
    html.push('</div>');
    html.push('</div>');
  }

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

  var $google = $el.find('[name=google]');
  $google.on('click', function () {
    var developerKey = 'AIzaSyBCRqn5xgdUsJZcC6oJnIInQubaaL3aYvI';
    var clientId = '936482190815-85k6k06b98ihv272n0b7f7fm33v5mmfa.apps.googleusercontent.com';
    var scope = ['https://www.googleapis.com/auth/drive'];

    var pickerApiLoaded = false;
    var oauthToken;

    // Use the API Loader script to load google.picker and gapi.auth.
    function onApiLoad() {
      gapi.load('auth', {'callback': onAuthApiLoad});
      gapi.load('picker', {'callback': onPickerApiLoad});
      gapi.load('drive');
    }

    function onAuthApiLoad() {
      if (1 == 1) {
        window.gapi.auth.authorize(
          {
            'client_id': clientId,
            'scope': scope,
            'immediate': false
          },
          handleAuthResult);
      } else {
        handleAuthResult();
      }
    }

    function onPickerApiLoad() {
      pickerApiLoaded = true;
      createPicker();
    }

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        createPicker();
      }
    }

    function createPicker() {
      if (pickerApiLoaded && oauthToken) {
        var picker = new google.picker.PickerBuilder().addViewGroup(
          new google.picker.ViewGroup(google.picker.ViewId.DOCS).addView(google.picker.ViewId.DOCUMENTS).addView(google.picker.ViewId.SPREADSHEETS)).setOAuthToken(oauthToken).setDeveloperKey(developerKey).setCallback(pickerCallback).build();
        picker.setVisible(true);
      }
    }

    function pickerCallback(data) {
      if (data.action == google.picker.Action.PICKED) {
        var file = data.docs[0];
        var fileName = file.name;
        var accessToken = gapi.auth.getToken().access_token;
        var xhr = new XMLHttpRequest();
        var url = new String('https://www.googleapis.com/drive/v3/files/' + file.id + '?alt=media');
        url.name = fileName;
        url.headers = {'Authorization': 'Bearer ' + accessToken};
        options.cb(url);
        // xhr.open('GET', url, true);
        //   xhr.open('GET', 'https://www.googleapis.com/drive/v3/files/' + file.id +
        // '/export/?mimeType=' + file.mimeType, true);
        //  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        //   xhr.onload = function () {
        //     var text = xhr.responseText;
        //     var ext = morpheus.Util.getExtension(fileName);
        //     var datasetReader = morpheus.DatasetUtil.getDatasetReader(ext, {interactive: true});
        //     if (datasetReader == null) {
        //       datasetReader = new morpheus.Array2dReaderInteractive();
        //     }
        //     options.cb(datasetReader.read());
        //   };
        //   xhr.send();
      }

    }

    onApiLoad();
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

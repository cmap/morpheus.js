/**
 *
 * @param options.fileCallback Callback when file is selected
 * @param options.optionsCallback Callback when preloaded option is selected
 * @constructor
 */
morpheus.FilePicker = function (options) {
  var html = [];
  html.push('<div>');
  var myComputer = _.uniqueId('morpheus');
  var url = _.uniqueId('morpheus');
  var googleId = _.uniqueId('morpheus');
  var dropbox = _.uniqueId('morpheus');
  var preloaded = _.uniqueId('morpheus');
  html.push('<ul style="margin-bottom:10px;" class="nav nav-pills morpheus">');
  html.push('<li role="presentation" class="active"><a href="#' + myComputer + '"' +
    ' aria-controls="' + myComputer + '" role="tab" data-toggle="tab"><i class="fa fa-desktop"></i>' +
    ' My Computer</a></li>');
  html.push('<li role="presentation"><a href="#' + url + '"' +
    ' aria-controls="' + url + '" role="tab" data-toggle="tav"><i class="fa fa-link"></i>' +
    ' URL</a></li>');

  if (typeof gapi !== 'undefined') {
    html.push('<li role="presentation"><a href="#' + googleId + '"' +
      ' aria-controls="' + googleId + '" role="tab" data-toggle="tab"><i class="fa' +
      ' fa-google"></i>' +
      ' Google</a></li>');
  }
  if (typeof Dropbox !== 'undefined') {
    html.push('<li role="presentation"><a href="#' + dropbox + '"' +
      ' aria-controls="' + dropbox + '" role="tab" data-toggle="tab"><i class="fa fa-dropbox"></i>' +
      ' Dropbox</a></li>');
  }

  var $sampleDatasetsEl = $('<div class="morpheus-preloaded"></div>');
  if (navigator.onLine) {
    html.push('<li role="presentation"><a href="#' + preloaded + '"' +
      ' aria-controls="' + preloaded + '" role="tab" data-toggle="tab"><i class="fa fa-database"></i>' +
      ' Preloaded Datasets</a></li>');

    // lazy load
    new morpheus.SampleDatasets({
      $el: $sampleDatasetsEl,
      show: true,
      callback: function (heatMapOptions) {
        options.optionsCallback(heatMapOptions);
      }
    });
  }

  html.push('</ul>');

  html.push('<div class="tab-content"' +
    ' style="text-align:center;cursor:pointer;height:300px;">');

  html.push('<div role="tabpanel" class="tab-pane active" id="' + myComputer + '">');
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

  html.push('<div role="tabpanel" class="tab-pane" id="' + url + '">');
  html.push('<div class="morpheus-landing-panel">');
  html.push('<input name="url" placeholder="Enter a URL" class="form-control"' +
    ' style="display:inline;max-width:400px;' +
    ' type="text"><button name="openUrl" class="btn btn-default"' +
    ' type="button">Go</button>');
  html.push('</div>');
  html.push('</div>');

  if (typeof Dropbox !== 'undefined') {
    html.push('<div role="tabpanel" class="tab-pane" id="' + dropbox + '">');
    html.push('<div class="morpheus-landing-panel">');
    html.push('<button name="dropbox" class="btn btn-default">Browse Dropbox</button>');
    html.push('</div>');
    html.push('</div>');
  }
  if (typeof gapi !== 'undefined') {
    html.push('<div role="tabpanel" class="tab-pane" id="' + googleId + '">');
    html.push('<div class="morpheus-landing-panel">');
    html.push('<button name="google" class="btn btn-default">Browse Google Drive</button>');
    html.push('</div>');
    html.push('</div>');
  }
  if (navigator.onLine) {
    html.push('<div role="tabpanel" class="tab-pane" id="' + preloaded + '">');
    html.push('<div style="height:300px;overflow: auto;" class="morpheus-landing-panel">');
    html.push('</div>');
    html.push('</div>');
  }
  html.push('</div>'); // tab-content
  html.push('</div>');
  var $el = $(html.join(''));
  $sampleDatasetsEl.appendTo($el.find('#' + preloaded + ' > .morpheus-landing-panel'));
  this.$el = $el;

  var $file = $el.find('[name=hiddenFile]');
  var $myComputer = $el.find('[id=' + myComputer + ']');
  this.$el.find('.nav').on('click', 'li > a', function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

  var $url = $el.find('[name=url]');
  $url.on('keyup', function (evt) {
    if (evt.which === 13) {
      var text = $.trim($(this).val());
      if (text !== '') {
        options.fileCallback([text]);
      }
    }
  });
  $el.find('[name=openUrl]').on('click', function (evt) {
    var text = $.trim($url.val());
    if (text !== '') {
      options.fileCallback([text]);
    }
  });

  var $dropbox = $el.find('[name=dropbox]');
  $dropbox.on('click', function (e) {
    Dropbox.choose({
      success: function (results) {
        var val = results[0].link;
        options.fileCallback([val]);
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
    var oauthToken;
    var pickerApiLoaded = false;
    var oauthToken;

    // Use the API Loader script to load google.picker and gapi.auth.
    function onApiLoad() {
      gapi.load('auth', {'callback': onAuthApiLoad});
      gapi.load('picker', {'callback': onPickerApiLoad});
    }

    function onAuthApiLoad() {
      window.gapi.auth.authorize(
        {
          'client_id': clientId,
          'scope': scope,
          'immediate': false
        },
        handleAuthResult);
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

    // Create and render a Picker object for picking user Photos.
    function createPicker() {
      if (pickerApiLoaded && oauthToken) {
        var picker = new google.picker.PickerBuilder().addView(google.picker.ViewId.DOCS)
          .setOAuthToken(oauthToken)
          .setDeveloperKey(developerKey)
          .setCallback(pickerCallback)
          .build();
        picker.setVisible(true);
        $('.picker-dialog-bg').css('z-index', 1052); // make it appear above modals
        $('.picker-dialog').css('z-index', 1053);
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
        options.fileCallback([url]);
      }

    }

    onApiLoad();
  });
  $file.on('change', function (evt) {
    var files = evt.target.files; // FileList object
    for (var i = 0; i < files.length; i++) {
      options.fileCallback([files[i]]);
    }
  });

  $(window).on('paste.morpheus', this.paste = function (e) {
    if ($myComputer.is(':visible')) {
      var text = e.originalEvent.clipboardData.getData('text/plain');
      if (text != null && text.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        var url;
        if (text.indexOf('http') === 0) {
          url = text;
        } else {
          var blob = new Blob([text]);
          url = new String(window.URL.createObjectURL(blob));
          url.name = 'clipboard';
        }
        options.fileCallback([url]);
      }
    }
  });
  var $drop = $el.find('[data-name=drop]');
  var _this = this;
  $el.on('remove', function () {
    $(window).off(_this.paste).off(_this.dragover).off(_this.dragenter).off(_this.dragleave).off(_this.drop);
  });
  var clicking = false;
  $drop.on('click', function (e) {
    if (!clicking) {
      clicking = true;
      $file.click();
      clicking = false;
    }
    // e.preventDefault();
  });
  $(window).on(
    'dragover',
    this.dragover = function (e) {
      if ($myComputer.is(':visible')) {
        $drop.addClass('drag');
        e.preventDefault();
        e.stopPropagation();
      }
    }).on(
    'dragenter',
    this.dragenter = function (e) {
      if ($myComputer.is(':visible')) {
        $drop.addClass('drag');
        e.preventDefault();
        e.stopPropagation();
      }
    }).on('dragleave', this.dragleave = function (e) {
    if ($myComputer.is(':visible')) {
      $drop.removeClass('drag');
      e.preventDefault();
      e.stopPropagation();
    }
  }).on('drop', this.drop = function (e) {
    if ($myComputer.is(':visible')) {
      $drop.removeClass('drag');
      if (e.originalEvent.dataTransfer) {
        if (e.originalEvent.dataTransfer.files.length) {
          e.preventDefault();
          e.stopPropagation();
          var isMtx = false;
          var files = e.originalEvent.dataTransfer.files;
          if (files.length === 3) {
            var genesFile = null;
            var barcodesFile = null;
            var matrixFile = null;
            for (var i = 0; i < files.length; i++) {
              if (files[i].name === 'genes.tsv') {
                genesFile = files[i];
              } else if (files[i].name === 'barcodes.tsv') {
                barcodesFile = files[i];
              } else if (files[i].name === 'matrix.mtx') {
                matrixFile = files[i];
              }
            }
            if (matrixFile != null && genesFile != null && barcodesFile != null) {
              options.fileCallback([matrixFile, genesFile, barcodesFile]);
              isMtx = true;
            }
          }
          if (!isMtx) {
            for (var i = 0; i < files.length; i++) {
              options.fileCallback([files[i]]);
            }
          }
        } else {
          var url = e.originalEvent.dataTransfer.getData('URL');
          options.fileCallback([url]);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  });
};

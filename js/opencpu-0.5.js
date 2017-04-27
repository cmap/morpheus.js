/**
 * Javascript client library for OpenCPU
 * Version 0.5.0
 * Depends: jQuery
 * Requires HTML5 FormData support for file uploads
 * http://github.com/jeroenooms/opencpu.js
 *
 * Include this file in your apps and packages.
 * You only need to use ocpu.seturl if this page is hosted outside of the OpenCPU package. For example:
 *
 * ocpu.seturl("../R") //default, use for apps
 * ocpu.seturl("//public.opencpu.org/ocpu/library/mypackage/R") //CORS
 * ocpu.seturl("/ocpu/library/mypackage/R") //hardcode path
 * ocpu.seturl("https://user:secret/my.server.com/ocpu/library/pkg/R") // basic auth
 */

//Warning for the newbies
if(!window.jQuery) {
  alert("Could not find jQuery! The HTML must include jquery.js before opencpu.js!")
}

(function ( $ ) {

  //global variable
  var r_cors = false;
  var r_path = document.createElement('a');
  r_path.href = "../R";


  //new Session()
  function Session(loc, key, txt){
    this.loc = loc;
    this.key = key;
    this.txt = txt;
    this.output = txt.split(/\r\n|\r|\n/g);

    this.getKey = function(){
      return key;
    };

    this.getLoc = function() {
      return loc;
    };

    this.getFileURL = function(path){
      var new_url = document.createElement('a');
      new_url.href = this.getLoc() + "files/" + path;
      new_url.username = r_path.username;
      new_url.password = r_path.password
      return new_url.href;
    };

    this.getFile = function(path, success){
      var url = this.getFileURL(path);
      return $.get(url, success);
    };

    this.getObject = function(name, data, success){
      //in case of no arguments
      name = name || ".val";

      //first arg is a function
      if(name instanceof Function){
        //pass on to second arg
        success = name;
        name = ".val";
      }


      var url = this.getLoc() + "R/" + name;
      //console.log("opencpu.Session.getObject ::", this.getLoc(), url);
      return $.get(url, data, success);
    };

    this.getGraphics = function (index, data, success) {
      index = index || 1;
      var url = this.getLoc() + "graphics/" + index;
      return $.get(url, data, success);
    };

    this.getStdout = function(success){
      var url = this.getLoc() + "stdout/text";
      return $.get(url, success);
    };

    this.getConsole = function(success){
      var url = this.getLoc() + "console/text";
      return $.get(url, success);
    };
  }

  //for POSTing raw code snippets
  //new Snippet("rnorm(100)")
  function Snippet(code){
    this.code = code || "NULL";

    this.getCode = function(){
      return code;
    };
  }

  //for POSTing files
  //new Upload($('#file')[0].files)
  function Upload(file){
    if(file instanceof File){
      this.file = file;
    } else if(file instanceof FileList){
      this.file = file[0];
    } else if (file.files instanceof FileList){
      this.file = file.files[0];
    } else if (file.length > 0 && file[0].files instanceof FileList){
      this.file = file[0].files[0];
    } else {
      throw 'invalid new Upload(file). Argument file must be a HTML <input type="file"></input>';
    }

    this.getFile = function(){
      return file;
    };
  }

  function stringify(x){
    if(x instanceof Session){
      return x.getKey();
    } else if(x instanceof Snippet){
      return x.getCode();
    } else if(x instanceof Upload){
      return x.getFile();
    } else if(x instanceof File){
      return x;
    } else if(x instanceof FileList){
      return x[0];
    } else if(x && x.files instanceof FileList){
      return x.files[0];
    } else if(x && x.length && x[0].files instanceof FileList){
      return x[0].files[0];
    } else {
      return JSON.stringify(x);
    }
  }

  //low level call
  function r_fun_ajax(fun, settings, handler){
    //validate input
    if(!fun) throw "r_fun_call called without fun";
    settings = settings || {};
    handler = handler || function(){};

    //set global settings
    settings.url = settings.url || (r_path.href + "/" + fun);
    settings.type = settings.type || "POST";
    settings.data = settings.data || {};
    settings.dataType = settings.dataType || "text";
    settings.async = true;
    //console.log("OpenCPU.r_fun_ajax ::", "ajax request settings", settings);
    //ajax call
    var jqxhr = $.ajax(settings).done(function(){
      var loc = jqxhr.getResponseHeader('Location') || console.log("Location response header missing.");
      var key = jqxhr.getResponseHeader('X-ocpu-session') || console.log("X-ocpu-session response header missing.");
      var txt = jqxhr.responseText;

      //in case of cors we translate relative paths to the target domain
      if(r_cors && loc.match("^/[^/]")) {
          loc = r_path.protocol + "//" + r_path.host + loc;
      }
      handler(new Session(loc, key, txt));


    }).fail(function(){
      console.log("OpenCPU error HTTP " + jqxhr.status + "\n" + jqxhr.responseText);
    });

    //function chaining
    return jqxhr;
  }
  //call a function using protobuf arguments
  function r_fun_call_proto(fun, args, handler) {
    return r_fun_ajax(fun, {
      data : new Uint8Array(args.toArrayBuffer()),
      contentType : 'application/x-protobuf',
      processData : false
    }, handler);
  }

  //call a function using json arguments
  function r_fun_call_json(fun, args, handler) {
    return r_fun_ajax(fun, {
      data: JSON.stringify(args || {}),
      contentType: 'application/json'
    }, handler);
  }


  //call function using url encoding
  //needs to wrap arguments in quotes, etc
  function r_fun_call_urlencoded(fun, args, handler, addToKey){
    var data = {};
    $.each(args, function(key, val){
      data[key] = stringify(val) + (val instanceof Session ? addToKey : "");
    });
    return r_fun_ajax(fun, {
      data: $.param(data)
    }, handler);
  }

  //call a function using multipart/form-data
  //use for file uploads. Requires HTML5
  function r_fun_call_multipart(fun, args, handler){
    testhtml5();
    var formdata = new FormData();
    $.each(args, function(key, value) {
      formdata.append(key, stringify(value));
    });
    return r_fun_ajax(fun, {
      data: formdata,
      cache: false,
      contentType: false,
      processData: false
    }, handler);
  }

  //Automatically determines type based on argument classes.
  function r_fun_call(fun, args, handler, useProtobuf, addToKey){
    useProtobuf = useProtobuf || false;
    args = args || {};
    addToKey = addToKey || "";
    var hasfiles = false;
    var hascode = false;

    //find argument types
    $.each(args, function(key, value){
      if(value instanceof File || value instanceof Upload || value instanceof FileList){
        hasfiles = true;
      } else if (value instanceof Snippet || value instanceof Session){
        hascode = true;
      }
    });

    //determine type
    if(hasfiles){
      return r_fun_call_multipart(fun, args, handler);
    } else if(hascode){
      return r_fun_call_urlencoded(fun, args, handler, addToKey);
    } else if (useProtobuf) {
      return r_fun_call_proto(fun, args, handler);
    } else {
      return r_fun_call_json(fun, args, handler);
    }
  }

  //call a function and return JSON
  function rpc(fun, args, handler, useProtobuf){
    useProtobuf = useProtobuf || false;
    return r_fun_call(fun, args, function(session){
      session.getObject(function(data){
        if(handler) handler(data);
      }).fail(function(){
        console.log("Failed to get JSON response for " + session.getLoc());
      });
    }, useProtobuf);
  }

  //plotting widget
  //to be called on an (empty) div.
  $.fn.rplot = function(fun, args, cb) {
    var targetdiv = this;
    var myplot = initplot(targetdiv);

    //reset state
    myplot.setlocation();
    myplot.spinner.show();

    // call the function
    return r_fun_call(fun, args, function(tmp) {
      myplot.setlocation(tmp.getLoc());

      //call success handler as well
      if(cb) cb(tmp);
    }).always(function(){
      myplot.spinner.hide();
    });
  };

  $.fn.graphic = function(session, n){
    initplot(this).setlocation(session.getLoc(), n || "last");
  };

  function initplot(targetdiv){
    if(targetdiv.data("ocpuplot")){
      return targetdiv.data("ocpuplot");
    }
    var ocpuplot = function(){
      //local variables
      var Location;
      var n = "last";
      var pngwidth;
      var pngheight;

      var plotdiv = $('<div />').attr({
        style: "width: 100%; height:100%; min-width: 100px; min-height: 100px; position:relative; background-repeat:no-repeat; background-size: 100% 100%;"
      }).appendTo(targetdiv).css("background-image", "none");

      var spinner = $('<span />').attr({
        style : "position: absolute; top: 20px; left: 20px; z-index:1000; font-family: monospace;"
      }).text("loading...").appendTo(plotdiv).hide();

      var pdf = $('<a />').attr({
        target: "_blank",
        style: "position: absolute; top: 10px; right: 10px; z-index:1000; text-decoration:underline; font-family: monospace;"
      }).text("pdf").appendTo(plotdiv);

      var svg = $('<a />').attr({
        target: "_blank",
        style: "position: absolute; top: 30px; right: 10px; z-index:1000; text-decoration:underline; font-family: monospace;"
      }).text("svg").appendTo(plotdiv);

      var png = $('<a />').attr({
        target: "_blank",
        style: "position: absolute; top: 50px; right: 10px; z-index:1000; text-decoration:underline; font-family: monospace;"
      }).text("png").appendTo(plotdiv);

      function updatepng(){
        if(!Location) return;
        pngwidth = plotdiv.width();
        pngheight = plotdiv.height();
        plotdiv.css("background-image", "url(" + Location + "graphics/" + n + "/png?width=" + pngwidth + "&height=" + pngheight + ")");
      }

      function setlocation(newloc, newn){
        n = newn || n;
        Location = newloc;
        if(!Location){
          pdf.hide();
          svg.hide();
          png.hide();
          plotdiv.css("background-image", "");
        } else {
          pdf.attr("href", Location + "graphics/" + n + "/pdf?width=11.69&height=8.27&paper=a4r").show();
          svg.attr("href", Location + "graphics/" + n + "/svg?width=11&height=6").show();
          png.attr("href", Location + "graphics/" + n + "/png?width=800&height=600").show();
          updatepng();
        }
      }

      // function to update the png image
      var onresize = debounce(function(e) {
        if(pngwidth == plotdiv.width() && pngheight == plotdiv.height()){
          return;
        }
        if(plotdiv.is(":visible")){
          updatepng();
        }
      }, 500);

      // register update handlers
      plotdiv.on("resize", onresize);
      $(window).on("resize", onresize);

      //return objects
      return {
        setlocation: setlocation,
        spinner : spinner
      };
    }();

    targetdiv.data("ocpuplot", ocpuplot);
    return ocpuplot;
  }

  // from understore.js
  function debounce(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate)
          result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow)
        result = func.apply(context, args);
      return result;
    };
  }

  function testhtml5(){
    if( window.FormData === undefined ) {
      alert("Uploading of files requires HTML5. It looks like you are using an outdated browser that does not support this. Please install Firefox, Chrome or Internet Explorer 10+");
      throw "HTML5 required.";
    }
  }

  //export
  window.ocpu = window.ocpu || {};
  var ocpu = window.ocpu;

  //global settings
  function seturl(newpath){
    if(!newpath.match("/R$")){
      alert("ERROR! Trying to set R url to: " + newpath +". Path to an OpenCPU R package must end with '/R'");
    } else {
      r_path = document.createElement('a');
      r_path.href = newpath;
      r_path.href = r_path.href; //IE needs this
      if(location.protocol != r_path.protocol || location.host != r_path.host){
        r_cors = true;
        if (!('withCredentials' in new XMLHttpRequest())) {
          alert("This browser does not support CORS. Try using Firefox or Chrome.");
        } else if(r_path.username && r_path.password) {
          //should only do this for calls to opencpu maybe
          var regex = new RegExp(r_path.host);
          $.ajaxSetup({
            beforeSend: function(xhr, settings) {
              //only use auth for ajax requests to ocpu
              if(regex.test(settings.url)){
                //settings.username = r_path.username;
                //settings.password = r_path.password;

                /* take out user:pass from target url */
                var target = document.createElement('a');
                target.href = settings.url;
                settings.url = target.protocol + "//" + target.host + target.pathname

                /* set basic auth header */
                settings.xhrFields = settings.xhrFields || {};
                settings.xhrFields.withCredentials = true;
                settings.crossDomain = true;
                xhr.setRequestHeader("Authorization", "Basic " + btoa(r_path.username + ":" + r_path.password));

                /* debug */
                console.log("Authenticated request to: " + settings.url + " (" + r_path.username + ", " + r_path.password + ")")
              }
            }
          });
        }
      }

      if(location.protocol == "https:" && r_path.protocol != "https:"){
        alert("Page is hosted on HTTPS but using a (non-SSL) HTTP OpenCPU server. This is insecure and most browsers will not allow this.")
      }

      if(r_cors){
        console.log("Setting path to CORS server " + r_path.href);
      } else {
        console.log("Setting path to local (non-CORS) server " + r_path.href);
      }

      //CORS disallows redirects.
      return $.get(r_path.href + "/", function(resdata){
        //console.log("Path updated. Available objects/functions:\n" + resdata);

      }).fail(function(xhr, textStatus, errorThrown){
        alert("Connection to OpenCPU failed:\n" + textStatus + "\n" + xhr.responseText + "\n" + errorThrown);
      });
    }
  }

  //exported functions
  ocpu.call = r_fun_call;
  ocpu.rpc = rpc;
  ocpu.seturl = seturl;

  ocpu.mycall = r_fun_ajax;

  //exported constructors
  ocpu.Snippet = Snippet;
  ocpu.Upload = Upload;

  //for innernetz exploder
  if (typeof console == "undefined") {
    this.console = {log: function() {}};
  }

}( jQuery ));

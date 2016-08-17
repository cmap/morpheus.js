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
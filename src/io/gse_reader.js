/**
 * Created by dzenkova on 12/8/16.
 */
morpheus.GseReader = function (options) {
    this.options = $.extend({}, {
        dataRowStart: 1,
        dataColumnStart: undefined
    }, options);
};
morpheus.GseReader.prototype = {
    read: function (name, callback) {
        var _this = this;
        var req = ocpu.call('loadGSE', {name : name}, function (session) {
            console.log('morpheus.GseReader.prototype.read ::', session);
            session.getObject(function (success) {
                console.log('morpheus.GseReader.prototype.read ::', success);
                var r = new FileReader();
                success = success.split("/");
                var filePath = session.getLoc() + "files/" + success[success.length - 1];
                filePath = filePath.substring(0, filePath.length - 2);
                console.log('morpheus.GseReader.prototype.read ::', filePath);


                r.onload = function (e) {
                    var contents = e.target.result;
                    ProtoBuf = dcodeIO.ProtoBuf;
                    ProtoBuf.protoFromFile("./message.proto", function (error, success) {
                        if (error) {
                            alert(error);
                            return;
                        }
                        var builder = success,
                            rexp = builder.build("rexp"),
                            REXP = rexp.REXP;

                        var res = REXP.decode(contents);
                        console.log(contents, res.rexpValue);
                    });
                };

                morpheus.BlobFromPath.getFileObject(filePath, function (file) {
                    console.log('morpheus.GseReader.prototype.read ::', file);
                    r.readAsArrayBuffer(file);
                });

            })
        });
        req.fail(function () {
            callback(req.responseText);
            console.log('morpheus.GseReader.prototype.read ::', req.responseText);
        });

    },
    _parse : function (text) {

    }
};

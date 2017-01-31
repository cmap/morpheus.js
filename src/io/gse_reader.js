/**
 * Created by dzenkova on 12/8/16.
 */
morpheus.GseReader = function (options) {
    this.type = options.type;
};
morpheus.GseReader.prototype = {
    read: function (name, callback) {
        var _this = this;
        var req = ocpu.call('loadGSE', {name : name, type : this.type}, function (session) {
            //console.log('morpheus.GseReader.prototype.read ::', session);
            session.getObject(function (success) {
                //console.log('morpheus.GseReader.prototype.read ::', success);
                var r = new FileReader();
                success = success.split("/");
                var fileName = success[success.length - 1].substring(0, success[success.length - 1].length - 2);
                var filePath = session.getLoc() + "files/" + fileName;
                //console.log('morpheus.GseReader.prototype.read ::', filePath);


                r.onload = function (e) {
                    var contents = e.target.result;
                    ProtoBuf = dcodeIO.ProtoBuf;
                    ProtoBuf.protoFromFile("./message.proto", function (error, success) {
                        if (error) {
                            alert(error);
                            console.log("GSEReader ::", "ProtoBuilder failed", error);
                            return;
                        }
                        var builder = success,
                            rexp = builder.build("rexp"),
                            REXP = rexp.REXP;

                        var res = REXP.decode(contents);
                        var flatData = res.rexpValue[0].realValue;
                        var nrowData = res.rexpValue[0].attrValue[0].intValue[0];
                        var ncolData = res.rexpValue[0].attrValue[0].intValue[1];
                        var flatPdata = res.rexpValue[1].stringValue;
                        var participants = res.rexpValue[2].stringValue;
                        var annotation = res.rexpValue[3].stringValue;
                        var id = res.rexpValue[4].stringValue;
                        var metaNames = res.rexpValue[5].stringValue;
                        var matrix = [];
                        for (var i = 0; i < nrowData; i++) {
                            var curArray = new Float32Array(ncolData);
                            for (var j = 0; j < ncolData; j++) {
                                curArray[j] = flatData[i + j * nrowData];
                            }
                            matrix.push(curArray);

                        }
                        var dataset = new morpheus.Dataset({
                            name : name,
                            rows : nrowData,
                            columns : ncolData,
                            array : matrix,
                            dataType : 'Float32',
                            esSession : session
                        });


                        /*console.log("morpheus.GseReader.prototype.read ::", "input list", res);
                        console.log("morpheus.GseReader.prototype.read ::", "metaNames", metaNames);
                        console.log("morpheus.GseReader.prototype.read ::", dataset);*/
                        var columnsIds = dataset.getColumnMetadata().add('id');
                        for (var i = 0; i < ncolData; i++) {
                            columnsIds.setValue(i, morpheus.Util.copyString(participants[i].strval));
                        }
                        //console.log(flatPdata);
                        for (var i = 0; i < metaNames.length; i++) {
                            var curVec = dataset.getColumnMetadata().add(metaNames[i].strval);
                            for (var j = 0; j < ncolData; j++) {
                                curVec.setValue(j, flatPdata[j + i * ncolData].strval);
                            }
                        }

                        var rowIds = dataset.getRowMetadata().add('id');
                        var rowSymbol = dataset.getRowMetadata().add('symbol');
                        for (var i = 0; i < nrowData; i++) {
                            rowIds.setValue(i, id[i].strval);
                            rowSymbol.setValue(i, annotation[i].strval);
                        }
                        morpheus.MetadataUtil.maybeConvertStrings(dataset.getRowMetadata(), 1);
                        morpheus.MetadataUtil.maybeConvertStrings(dataset.getColumnMetadata(),
                            1);
                        callback(null, dataset);

                    });
                };

                morpheus.BlobFromPath.getFileObject(filePath, function (file) {
                    //console.log('morpheus.GseReader.prototype.read ::', file);
                    r.readAsArrayBuffer(file);
                });

            })
        });
        req.fail(function () {
            callback(req.responseText);
            //console.log('morpheus.GseReader.prototype.read ::', req.responseText);
        });

    },
    _parse : function (text) {

    }
};

morpheus.GseReader.nonFlatArray = function (flatArray, nrow, ncol) {

};
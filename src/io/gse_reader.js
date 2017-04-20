morpheus.GseReader = function (options) {
    this.type = options.type;
};
morpheus.GseReader.prototype = {
    read: function (name, callback) {
        var req = ocpu.call('loadGEO', {name : name, type : this.type}, function (session) {
            //console.log('morpheus.GseReader.prototype.read ::', session);
            session.getObject(function (success) {
                //console.log('morpheus.GseReader.prototype.read ::', success);
                var r = new FileReader();
                var filePath = morpheus.Util.getFilePath(session, success);
                //console.log('morpheus.GseReader.prototype.read ::', filePath);
                r.onload = function (e) {
                    var contents = e.target.result;
                    var ProtoBuf = dcodeIO.ProtoBuf;
                    ProtoBuf.protoFromFile("./message.proto", function (error, success) {
                        if (error) {
                            alert(error);
                            console.log("GSEReader ::", "ProtoBuilder failed", error);
                            return;
                        }
                        var builder = success,
                            rexp = builder.build("rexp"),
                            REXP = rexp.REXP,
                            rclass = REXP.RClass;


                        var res = REXP.decode(contents);

                        var jsondata = morpheus.Util.getRexpData(res, rclass);

                        var flatData = jsondata.data.values;
                        var nrowData = jsondata.data.dim[0];
                        var ncolData = jsondata.data.dim[1];
                        var flatPdata = jsondata.pdata.values;
                        var participants = jsondata.participants.values;
                        var annotation = jsondata.symbol.values;
                        console.log(annotation);
                        var id = jsondata.rownames.values;
                        var metaNames = jsondata.colMetaNames.values;
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
                            columnsIds.setValue(i, morpheus.Util.copyString(participants[i]));
                        }
                        //console.log(flatPdata);
                        for (var i = 0; i < metaNames.length; i++) {
                            var curVec = dataset.getColumnMetadata().add(metaNames[i]);
                            for (var j = 0; j < ncolData; j++) {
                                curVec.setValue(j, flatPdata[j + i * ncolData]);
                            }
                        }

                        var rowIds = dataset.getRowMetadata().add('id');
                        if (annotation) {
                            var rowSymbol = dataset.getRowMetadata().add('symbol');
                        }
                        for (var i = 0; i < nrowData; i++) {
                            rowIds.setValue(i, id[i]);
                            if (annotation) {
                                rowSymbol.setValue(i, annotation[i]);
                            }
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
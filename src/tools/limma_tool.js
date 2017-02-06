morpheus.LimmaTool = function() {
};
morpheus.LimmaTool.prototype = {
    toString : function() {
        return 'limma';
    },
    init : function(project, form) {
        var _this = this;
        var updateAB = function (fieldNames) {
            var ids = [];
            if (fieldNames != null) {
                var vectors = morpheus.MetadataUtil.getVectors(project
                    .getFullDataset().getColumnMetadata(), [fieldNames]);
                var idToIndices = morpheus.VectorUtil
                    .createValuesToIndicesMap(vectors);
                idToIndices.forEach(function (indices, id) {
                    ids.push(id);
                });
            }
            ids.sort();
            form.setOptions('class_a', ids);
            form.setValue('class_a', ids[0].array[0]);
            form.setOptions('class_b', ids);
            form.setValue('class_b', ids[0].array[0]);
        };
        var $field = form.$form.find('[name=field]');
        $field.on('change', function(e) {
            updateAB($(this).val());
        });
        if ($field[0].options.length > 0) {
            $field.val($field[0].options[0].value);
        }
        updateAB($field.val());
    },
    gui : function(project) {
        var dataset = project.getSortedFilteredDataset();
        var fields = morpheus.MetadataUtil.getMetadataNames(dataset.getColumnMetadata());
        return [ {
            name : 'field',
            options : fields,
            type : 'select',
            multiple : false
        }, {
            name : 'class_a',
            title : 'Class A',
            options : [],
            value : '',
            type : 'select',
            multiple : false
        }, {
            name : 'class_b',
            title : 'Class B',
            options : [],
            value : '',
            type : 'select',
            multiple : false
        }];
    },
    execute : function (options) {
        var project = options.project;
        var field = options.input.field;
        var classA = options.input.class_a;
        var classB = options.input.class_b;
        console.log(field, classA, classB);

        var dataset = project.getSortedFilteredDataset();
        var es = dataset.getESSession();

        console.log(dataset.getColumnMetadata());
        var v = dataset.getColumnMetadata().getByName("Comparison");
        if (v == null) {
            v = dataset.getColumnMetadata().add("Comparison");
        }
        var v1 = dataset.getColumnMetadata().getByName(field);
        console.log(v1);
        for (var i = 0; i < dataset.getColumnCount(); i++) {
            v.setValue(i, v1.getValue(i) == classA ? "A" : (v1.getValue(i) == classB ? "B" : ""));
        }
        project.trigger('trackChanged', {
            vectors : [v],
            render : ['color'],
            columns : true
        });
        es.then(function(essession) {
            var args = {
                es : essession,
                field : field,
                classA : classA,
                classB : classB
            };
            console.log(args);
            var req = ocpu.call("limmaAnalysis", args, function(session) {
                session.getObject(function(success) {
                    console.log(success);
                    var r = new FileReader();
                    var filePath = morpheus.Util.getFilePath(session, success);

                    r.onload = function (e) {
                        var contents = e.target.result;
                        var ProtoBuf = dcodeIO.ProtoBuf;
                        ProtoBuf.protoFromFile("./message.proto", function(error, success) {
                            if (error) {
                                alert(error);
                                console.log("LimmaTool ::", "ProtoBuilder failed", error);
                            }
                            var builder = success,
                                rexp = builder.build("rexp"),
                                REXP = rexp.REXP,
                                rclass = REXP.RClass;
                            var res = REXP.decode(contents);
                            var data = morpheus.Util.getRexpData(res, rclass);
                            var names = morpheus.Util.getFieldNames(res, rclass);
                            var vs = [];
                            console.log(res, data);
                            names.forEach(function (name) {
                                if (name !== "symbol") {
                                    console.log(name, data[name]);
                                    var v = dataset.getRowMetadata().add(name);
                                    for (var i = 0; i < dataset.getRowCount(); i++) {
                                        v.setValue(i, data[name].values[dataset.rowIndices[i]]);
                                    }
                                    vs.push(v);
                                }

                            });
                            project.trigger('trackChanged', {
                                vectors : vs,
                                render : []
                            });
                        })
                    };
                    morpheus.BlobFromPath.getFileObject(filePath, function (file) {
                        r.readAsArrayBuffer(file);
                    });
                })
            }, false, "::es");
            req.fail(function () {
                console.log(req.responseText);
            });
        });
    }
};
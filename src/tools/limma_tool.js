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
                    .getFullDataset().getColumnMetadata(), fieldNames);
                var idToIndices = morpheus.VectorUtil
                    .createValuesToIndicesMap(vectors);
                idToIndices.forEach(function (indices, id) {
                    ids.push(id);
                });
            }
            ids.sort();
            form.setOptions('class_a', ids);
            //form.setValue('class_a', ids[0].array[0]);
            form.setOptions('class_b', ids);
           // form.setValue('class_b', ids[0].array[0]);
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
        var fields = morpheus.MetadataUtil.getMetadataNames(dataset
            .getColumnMetadata());
        return [ {
            name : 'field',
            options : fields,
            type : 'select',
            multiple : true
        }, {
            name : 'class_a',
            title : 'Class A',
            options : [],
            value : '',
            type : 'checkbox-list',
            multiple : true
        }, {
            name : 'class_b',
            title : 'Class B',
            options : [],
            value : '',
            type : 'checkbox-list',
            multiple : true
        }];
    },
    execute : function (options) {
        var project = options.project;
        var field = options.input.field;
        var classA = options.input.class_a;
        var classB = options.input.class_b;

        if (classA.length == 0 || classB.length == 0) {
            throw new Error("You must choose at least one option in each class");
        }

        console.log("field", field);
        console.log("classA", classA);
        console.log("classB", classB);

        var dataset = project.getSortedFilteredDataset();
        console.log(dataset);
        var es = dataset.getESSession();

        var v = dataset.getColumnMetadata().getByName("Comparison");
        if (v == null) {
            v = dataset.getColumnMetadata().add("Comparison");
        }
        var vs = [];
        field.forEach(function(name) {
            vs.push(dataset.getColumnMetadata().getByName(name));
        });

        var checkCortege = function (vectors, curClass, curColumn) {
            var columnInClass = false;
            for (var j = 0; j < curClass.length; j++) {
                var isEqual = true;
                for (var k = 0; k < vectors.length; k++) {
                    isEqual &= vectors[k].getValue(curColumn) == curClass[j].array[k];
                }
                columnInClass |= isEqual;
            }
            return columnInClass;
        };
        for (var i = 0; i < dataset.getColumnCount(); i++) {
            var columnInA = checkCortege(vs, classA, i);
            var columnInB = checkCortege(vs, classB, i);
            if (columnInA && columnInB) {
                var warning = "Chosen classes have intersection in column " + i;
                throw new Error(warning);
            }
            v.setValue(i, columnInA ? "A" : (columnInB ? "B" : ""));
        }

        /*for (var i = 0; i < dataset.getColumnCount(); i++) {
            var a = true;
            for (var j = 0; j < vs.length; j++) {
                var oneof = false;
                for (var k = 0; k < classA.length; k++) {
                    oneof |= vs[j].getValue(i) == classA[k][j];
                }
            }
            v.setValue(i, v1.getValue(i) == classA ? "A" : (v1.getValue(i) == classB ? "B" : ""));
        }*/
        project.trigger('trackChanged', {
            vectors : [v],
            render : ['color'],
            columns : true
        });

        var values = Array.apply(null, Array(project.getFullDataset().getColumnCount()))
            .map(String.prototype.valueOf, "");

        for (var j = 0; j < dataset.getColumnCount(); j++) {
            values[dataset.columnIndices[j]] = v.getValue(j);
        }

        console.log(values);

        var trueIndices = morpheus.Util.getTrueIndices(dataset);

        es.then(function(essession) {
            var args = {
                es : essession,
                fieldValues : values
            };
            if (trueIndices.rows.length > 0) {
                args.rows = trueIndices.rows;
            }
            if (trueIndices.columns.length > 0) {
                args.columns = trueIndices.columns;
            }
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
                            var rows = trueIndices.rows.length > 0 ? trueIndices.rows : dataset.rowIndices;
                            console.log(trueIndices.rows);
                            if (trueIndices.rows.length > 0) {
                                var backRows = Array.apply(null, Array(dataset.rowIndices.length)).map(Number.prototype.valueOf,0);
                                for (var i = 0; i < trueIndices.rows.length; i++) {
                                    backRows[rows[i]] = i;
                                }
                                rows = backRows;
                            }
                            console.log("rows", rows);
                            names.forEach(function (name) {
                                if (name !== "symbol") {
                                    console.log(name, data[name]);
                                    var v = dataset.getRowMetadata().add(name);
                                    for (var i = 0; i < dataset.getRowCount(); i++) {
                                        v.setValue(i, data[name].values[i]);
                                    }
                                    vs.push(v);
                                }

                            });
                            alert("Limma finished successfully");
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
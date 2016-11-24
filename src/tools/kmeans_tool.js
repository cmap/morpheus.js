/**
 * Created by dzenkova on 11/18/16.
 */
morpheus.KmeansTool = function() {
};
morpheus.KmeansTool.prototype = {
    toString : function() {
        return 'k-means';
    },
    gui : function() {
        // z-score, robust z-score, log2, inverse log2
        return [ {
            name : 'number_of_clusters',
            type : 'text'
        },{
            name : 'use_selected_rows_and_columns_only',
            type : 'checkbox'
        } ];
    },
    execute : function(options) {
        var project = options.project;
        var controller = options.controller;

        var columnIndices = [];
        var rowIndices = [];
        var fullDataset = project.getFullDataset();
        console.log("morpheus.KmeansTool.prototype.execute ::", "full dataset", fullDataset);
        var dataset = project.getSortedFilteredDataset();
        while(dataset.dataset instanceof morpheus.SlicedDatasetView) {
            dataset = dataset.dataset;
        }
        var selectedDataset = project.getSelectedDataset();
        console.log("morpheus.KmeansTool.prototype.execute ::", "sorted dataset", dataset);
        console.log("selected dataset", selectedDataset);
        if (fullDataset instanceof morpheus.SlicedDatasetView) {
            columnIndices = fullDataset.columnIndices;
            rowIndices = fullDataset.rowIndices;
        }
        if (options.input.use_selected_rows_and_columns_only) {
            if ((!selectedDataset.columnIndices && !selectedDataset.rowIndices)) {
                alert("So select some rows and/or columns")
                return;
            }
            if (fullDataset instanceof morpheus.Dataset ||
                fullDataset instanceof morpheus.SlicedDatasetView && !((!selectedDataset.columnIndices) && (!selectedDataset.rowIndices))) {
                columnIndices = selectedDataset.columnIndices;
                rowIndices = selectedDataset.rowIndices;
            }
            else {
                columnIndices = fullDataset.columnIndices;
                rowIndices = fullDataset.rowIndices;
            }
        }
        console.log(columnIndices, rowIndices);
        /*if (columnIndices) {
            for (var i = 0; i < columnIndices.length; i++) {
                columnIndices[i] = dataset.columnIndices[i];
            }
        }
        if (rowIndices) {
            for (var i = 0; i < rowIndices.length; i++) {
                rowIndices[i] = dataset.rowIndices[i];
            }
        }
        console.log(columnIndices, rowIndices);*/
        var number = parseInt(options.input.number_of_clusters);
        if (isNaN(number)) {
            alert("Enter the expected number of clusters");
            return;
        }
        console.log(number);
        var esPromise = fullDataset.getESSession();
        esPromise.then(function(essession) {
            var arguments = {
                es : essession,
                k : number
            };
            if (columnIndices && columnIndices.length > 0) {
                arguments.cols = columnIndices;
            }
            if (rowIndices && rowIndices.length > 0) {
                arguments.rows = rowIndices;
            }
            console.log(arguments);
            var req = ocpu.call("kmeans", arguments, function(session) {
                session.getObject(function(success) {
                    var clusters = JSON.parse(success);
                    var ind = morpheus.MetadataUtil.indexOf(fullDataset.getRowMetadata(), "clusters");

                    if (ind < 0) {
                        fullDataset.getRowMetadata().add("clusters");
                    }
                    var v = fullDataset.getRowMetadata().getByName("clusters");
                    console.log(fullDataset.getRowMetadata().getByName("clusters"));
                    while (v instanceof morpheus.VectorAdapter || v instanceof morpheus.SlicedVector) {
                        v = v.v
                    }
                    console.log(v);
                    v.setArray(clusters);
                    console.log("morpheus.KmeansTool.prototype.execute ::", "updated dataset?", fullDataset);
                    console.log("morpheus.KmeansTool.prototype.execute ::", "clusters?", fullDataset.getRowMetadata().get(morpheus.MetadataUtil.indexOf(fullDataset.getRowMetadata(), "clusters")));
                    project.trigger('trackChanged', {
                        vectors: [fullDataset.getRowMetadata().getByName("clusters")],
                        render: ['color'],
                        continuous: false
                    });
                })
            });

        });
    }
};
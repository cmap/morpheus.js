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
        },{
            name : 'replace_NA_with',
            type : 'bootstrap-select',
            options : [{
                name : 'mean',
                value :'mean'
            }, {
                name : 'median',
                value : 'median'
            }]
        } ];
    },
    execute : function(options) {
        var project = options.project;
        var controller = options.controller;

        var columnIndices = [];
        var rowIndices = [];
        var fullDataset = project.getFullDataset();
        //console.log("morpheus.KmeansTool.prototype.execute ::", "full dataset", fullDataset);
        var sortedDataset = project.getSortedFilteredDataset();

        var dataset = project.getSortedFilteredDataset();
        while(dataset.dataset instanceof morpheus.SlicedDatasetView) {
            dataset = dataset.dataset;
        }
        var selectedDataset = project.getSelectedDataset();
        //console.log("morpheus.KmeansTool.prototype.execute ::", "sorted dataset", dataset);
        //console.log("selected dataset", selectedDataset);

        columnIndices = dataset.columnIndices;
        if (fullDataset.columnIndices && fullDataset.columnIndices.length < columnIndices.length) {
            columnIndices = columnIndices.slice(0, fullDataset.columnIndices.length);
        }
        rowIndices = dataset.rowIndices;
        if (fullDataset.rowIndices && fullDataset.rowIndices.length < rowIndices.length) {
            rowIndices = rowIndices.slice(0, fullDataset.rowIndices.length);
        }

        /*if (fullDataset instanceof morpheus.SlicedDatasetView) {
         columnIndices = fullDataset.columnIndices;
         rowIndices = fullDataset.rowIndices;
         }*/
        if (options.input.use_selected_rows_and_columns_only) {
            var selectedColumns = project.getColumnSelectionModel().getViewIndices().values();
            var selectedRows = project.getRowSelectionModel().getViewIndices().values();
            //console.log(project.getColumnSelectionModel());
            //console.log(project.getRowSelectionModel());

            if (!selectedColumns && !selectedRows) {
                alert("There are no rows and/or columns selected");
                console.log("KMeans :: There are no rows and/or columns selected");
                return;
            }

            columnIndices = [];
            for (var ind in selectedColumns) {
                columnIndices.push(dataset.columnIndices[ind]);
            }
            rowIndices = [];
            for (ind in selectedRows) {
                rowIndices.push(dataset.rowIndices[ind]);
            }/*
             if (fullDataset instanceof morpheus.Dataset ||
             fullDataset instanceof morpheus.SlicedDatasetView && !((!selectedDataset.columnIndices) && (!selectedDataset.rowIndices))) {
             columnIndices = selectedDataset.columnIndices;
             rowIndices = selectedDataset.rowIndices;
             }
             else {
             columnIndices = fullDataset.columnIndices;
             rowIndices = fullDataset.rowIndices;
             }*/
        }
        //console.log(columnIndices, rowIndices);
        //console.log(project.getRowSelectionModel());
        var number = parseInt(options.input.number_of_clusters);
        if (isNaN(number)) {

            console.log("KMeans :: Enter the expected number of clusters");
            throw new Error("Enter the expected number of clusters");
        }
        var replacena = options.input.replace_NA_with;
        //console.log(number);
        var esPromise = fullDataset.getESSession();
        esPromise.then(function(essession) {
            var args = {
                es : essession,
                k : number,
                replacena : replacena
            };
            if (columnIndices && columnIndices.length > 0 && columnIndices.length < dataset.columnIndices.length) {
                args.cols = columnIndices;
            }
            if (rowIndices && rowIndices.length > 0 && rowIndices.length < dataset.rowIndices.length) {
                args.rows = rowIndices;
            }
            //console.log(arguments);
            var req = ocpu.call("kmeans", args, function(session) {
                session.getObject(function(success) {
                    var clusters = JSON.parse(success);

                    var v = sortedDataset.getRowMetadata().getByName("clusters");
                    if (v == null) {
                        v = sortedDataset.getRowMetadata().add("clusters");
                    }
                    //console.log(sortedDataset, sortedDataset.getRowCount(), v, sortedDataset);
                    for (var i = 0; i < sortedDataset.getRowCount(); i++) {
                        v.setValue(i, clusters[dataset.rowIndices[i]]);
                    }
                    //console.log(dataset.getRowMetadata().getByName("clusters"));
                    /*while (v instanceof morpheus.VectorAdapter || v instanceof morpheus.SlicedVector) {
                     v = v.v
                     }*/
                    //console.log(v);
                    //v.setArray(clusters);
                    v.getProperties().set("morpheus.dataType", "string");
                    //console.log("morpheus.KmeansTool.prototype.execute ::", "updated dataset?", dataset);
                    //console.log("morpheus.KmeansTool.prototype.execute ::", "clusters?", dataset.getRowMetadata().get(morpheus.MetadataUtil.indexOf(dataset.getRowMetadata(), "clusters")));
                    project.trigger('trackChanged', {
                        vectors: [v],
                        render: ['color']
                    });
                })
            }, false, "::es");

        });
    }
};
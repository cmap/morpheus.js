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

        console.log(project.getRowFilter());
        //console.log("morpheus.KmeansTool.prototype.execute ::", "full dataset", fullDataset);
        var dataset = project.getSortedFilteredDataset();


        var trueIndices = morpheus.Util.getTrueIndices(dataset);


        //var selectedDataset = project.getSelectedDataset();
        //console.log("morpheus.KmeansTool.prototype.execute ::", "sorted dataset", dataset);
        //console.log("selected dataset", selectedDataset);


        /*if (fullDataset instanceof morpheus.SlicedDatasetView) {
         columnIndices = fullDataset.columnIndices;
         rowIndices = fullDataset.rowIndices;
         }*/
        /*if (options.input.use_selected_rows_and_columns_only) {
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
            }/!*
             if (fullDataset instanceof morpheus.Dataset ||
             fullDataset instanceof morpheus.SlicedDatasetView && !((!selectedDataset.columnIndices) && (!selectedDataset.rowIndices))) {
             columnIndices = selectedDataset.columnIndices;
             rowIndices = selectedDataset.rowIndices;
             }
             else {
             columnIndices = fullDataset.columnIndices;
             rowIndices = fullDataset.rowIndices;
             }*!/
        }*/
        //console.log(columnIndices, rowIndices);
        //console.log(project.getRowSelectionModel());
        var number = parseInt(options.input.number_of_clusters);
        if (isNaN(number)) {

            console.log("KMeans :: Enter the expected number of clusters");
            throw new Error("Enter the expected number of clusters");
        }
        var replacena = options.input.replace_NA_with;
        //console.log(number);
        var esPromise = dataset.getESSession();
        esPromise.then(function(essession) {
            var args = {
                es : essession,
                k : number,
                replacena : replacena
            };
            if (trueIndices.columns.length > 0) {
                args.columns = trueIndices.columns;
            }
            if (trueIndices.rows.length > 0) {
                args.rows = trueIndices.rows;
            }
            //console.log(arguments);
            var req = ocpu.call("kmeans", args, function(session) {
                session.getObject(function(success) {
                    var clusters = JSON.parse(success);

                    console.log(clusters);
                    var v = dataset.getRowMetadata().getByName("clusters");
                    if (v == null) {
                        v = dataset.getRowMetadata().add("clusters");
                    }
                    //console.log(sortedDataset, sortedDataset.getRowCount(), v, sortedDataset);
                    for (var i = 0; i < dataset.getRowCount(); i++) {
                        v.setValue(i, clusters[i]);
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
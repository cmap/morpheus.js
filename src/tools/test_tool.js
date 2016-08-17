morpheus.TestTool = function () {
};
morpheus.TestTool.prototype = {
    toString : function () {
        return 'Test';
    },
    gui : function () {
        return [

        ];
    },
    execute : function (options) {
        var project = options.project;
        var dataset = project.getFullDataset();
        var matrix = dataset.seriesArrays;

        ocpu.seturl("http://localhost:7120/ocpu/library/base/R");
        var req = ocpu.call("ncol", {
            "x" : matrix
        }, function (session) {
            session.getConsole(function (output) {
                console.log(output);
            });
        });
        req.fail(function () {
            console.log("test tool failed");
        });
    }
};


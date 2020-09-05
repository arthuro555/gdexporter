const exporter = require("./GDTools/ExportProject");

// Programmatic API
exports.loadProject = require("./GDTools/loadProject").load;
exports.exporter = function(projectPath, outputDir, buildType) {
    let projectPromise = exports.loadProject(projectPath);
    switch (buildType) {
        case "electron":
            console.log("Exporting for electron")
            projectPromise
                .then(project => {
                    exporter.exportPIXI(project, outputDir, {'exportForElectron': true})
                });
            break;
        
        case "cordova":
            console.log("Exporting for cordova")
            projectPromise
                .then(project => {
                    exporter.exportPIXI(project, outputDir, {'exportForCordova': true})
                });
            break;
    
        case "facebook":
            console.log("Exporting for facebook instant games")
            projectPromise
                .then(project => {
                    exporter.exportPIXI(project, outputDir, {'exportForFacebookInstantGames': true})
                });
            break;
    
        default:
            console.log("Exporting for HTML5 (default)")
            projectPromise
                .then(project => {
                    exporter.exportPIXI(project, outputDir)
                });
    }
    return projectPromise;
};

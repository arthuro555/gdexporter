const argv = require('minimist')(process.argv.slice(2));
const projectLoader = require("../loadProject");
const exporter = require("../GDTools/ExportProject");

let projectPromise = projectLoader.load(argv["p"] || argv["project"] || argv["in"]);
let outputDir = argv["o"] || argv["out"] || "./Exported";

const buildType = argv["build"] || argv["b"];

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


const argv = require('minimist')(process.argv.slice(2));
const projectLoader = require("../loadProject");
const exporter = require("../GDTools/ExportProject");

let projectPromise = projectLoader.load(argv["p"] || argv["project"] || argv["in"]);

if(argv["b"] !== false || argv["build"] !== false) {
    let outputDir = argv["o"] || argv["out"] || "./Exported";
    projectPromise
    .then(project => {
        exporter.exportHTML5(project, outputDir)
    });
}
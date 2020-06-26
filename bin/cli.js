const argv = require('minimist')(process.argv.slice(2));
const { exporter } = require("../main");


const projectDir = argv["p"] || argv["project"] || argv["in"];
const outputDir = argv["o"] || argv["out"] || "./Exported";
const buildType = argv["build"] || argv["b"];

exporter(projectDir, outputDir, buildType);

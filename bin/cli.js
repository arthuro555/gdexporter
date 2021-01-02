const argv = require("minimist")(process.argv.slice(2));
const { exporter } = require("../main");

const projectDir =
  argv["p"] || argv["project"] || argv["in"] || "./Project/game.json";
const outputDir = argv["o"] || argv["out"] || "./Exported";
const buildType = argv["build"] || argv["b"];
const gdevelopVersion =
  argv["version"] || argv["tag"] || argv["v"] || argv["t"];

exporter(projectDir, outputDir, { buildType, gdevelopVersion });

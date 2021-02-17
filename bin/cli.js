const argv = require("minimist")(process.argv.slice(2));
const exporter = require("../src/main");
const { accessSync } = require("fs");
const { join } = require("path");

const projectDir =
  argv["p"] || argv["project"] || argv["in"] || "./Project/game.json";
const outputDir = argv["o"] || argv["out"] || "./Exported";
const buildType = argv["build"] || argv["b"];
const gdevelopVersion =
  argv["version"] || argv["tag"] || argv["v"] || argv["t"];
const options = { buildType, gdevelopVersion, verbose: argv["verbose"] };

const configPath = join(process.cwd(), "gdexport.config.js");
try {
  accessSync(configPath);
  try {
    console.info("⌛ Loading config...");
    Object.assign(options, require(configPath));
  } catch (e) {
    console.log("❌ Error while loading config! ", e);
  }
} catch {
  console.log("📓 No config file found!");
}

exporter(projectDir, outputDir, options);

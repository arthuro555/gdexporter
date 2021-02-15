const loadGD = require("gdcore-tools");
const pluginTools = require("./plugins");

/**
 * @typedef Options The options accepted by the exporter.
 * @property {"electron" | "cordova" | "facebook"} [buildType] The build type (defaults to HTML5).
 * @property {string} [gdevelopVersion] The version of GDevelop to use for exporting.
 * @property {Array<import("./plugins").PluginDescriptor>} [plugins] A list of plugins to run.
 */

/**
 * Exports a GDevelop game.
 * @param {string} projectPath Path to game.json.
 * @param {string} outputDir Path to the output directory.
 * @param {Options} [options] The export options.
 */
module.exports = async (projectPath, outputDir, options) => {
  console.info(" ⌛ Loading plugins...");
  options?.plugins?.forEach(pluginTools.registerPlugin);

  console.info(" ⌛ Loading GDevelop...");
  const gd = await loadGD(options?.gdevelopVersion);
  const project = await gd.loadProject(projectPath);

  await pluginTools.runPreExport(project);

  console.info("📦 Exporting for " + (options?.buildType || "HTML5 (default)"));
  gd.exportProject(project, outputDir, {
    exportForElectron: options?.buildType === "electron",
    exportForCordova: options?.buildType === "cordova",
    exportForFacebookInstantGames: options?.buildType === "facebook",
  });

  let exportPath = outputDir;
  if (options?.buildType === "electron") exportPath += "/app";
  if (options?.buildType === "cordova") exportPath += "/www";
  await pluginTools.runPostExport(exportPath);

  console.log("✅ Done!");
};

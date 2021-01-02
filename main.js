const loadGD = require("./GDTools");

/**
 * @typedef Options The options accepted by the exporter.
 * @property {"electron" | "cordova" | "facebook"} [buildType] The build type (defaults to HTML5).
 * @property {string} [gdevelopVersion] The version of GDevelop to use for exporting.
 */

/**
 * Exports a GDevelop game.
 * @param {string} projectPath Path to game.json.
 * @param {string} outputDir Path to the output directory.
 * @param {Options} [options] The export options.
 */
module.exports = function (projectPath, outputDir, options) {
  let gd;
  const projectPromise = loadGD(options.gdevelopVersion).then((GD) => {
    gd = GD;
    return gd.loadProject(projectPath);
  });
  switch (options.buildType) {
    case "electron":
      projectPromise.then((project) => {
        console.log("📦 Exporting for electron");
        gd.exportProject(project, outputDir, { exportForElectron: true });
      });
      break;

    case "cordova":
      projectPromise.then((project) => {
        console.log("📦 Exporting for cordova");
        gd.exportProject(project, outputDir, { exportForCordova: true });
      });
      break;

    case "facebook":
      projectPromise.then((project) => {
        console.log("📦 Exporting for facebook instant games");
        gd.exportProject(project, outputDir, {
          exportForFacebookInstantGames: true,
        });
      });
      break;

    default:
      projectPromise.then((project) => {
        console.log("📦 Exporting for HTML5 (default)");
        gd.exportProject(project, outputDir);
      });
  }
  return projectPromise;
};

const loadExtensions = require("./JsExtensionsLoader/LocalJsExtensionsLoader");
const projectLoader = require("./LocalProjectOpener");
const eventsFunctionsLoader = require("./EventsFunctionsExtensionsLoader/index")
  .loadProjectEventsFunctionsExtensions;
const eventFunctionsWriter = require("./EventsFunctionsExtensionsLoader/LocalEventsFunctionCodeWriter")
  .makeLocalEventsFunctionCodeWriter;
const localFileSystem = require("./LocalFileSystem").fs;
const assignIn = require("lodash/assignIn");
const { getGD, getRuntimePath, findLatestVersion } = require("./downloadGD");
const { join, resolve } = require("path");

class WrappedGD {
  constructor(gd, pathToRuntime) {
    this.gd = gd;
    this.path = pathToRuntime;
  }

  /**
   * Loads a project json file.
   * @param {string} projectLocation The path to the json file
   */
  loadProject(projectLocation) {
    let project;
    return projectLoader
      .loadProjectFiles(projectLocation)
      .then((projectFile) => {
        projectFile.content.properties.projectFile = projectLocation;
        return projectLoader.loadSerializedProject(
          this.gd,
          projectFile.content
        );
      })
      .then((projectLoaded) => {
        project = projectLoaded;
        project.setProjectFile(resolve(projectLocation));
        return eventsFunctionsLoader(project, eventFunctionsWriter());
      })
      .then(() => project);
  }

  /**
   * Exports a project.
   * @param {*} project The loaded project.
   * @param {string} outputDir The output directory.
   * @param {Object<string>} options Options to pass to the exporter.
   */
  exportProject(project, outputDir, options) {
    const gd = this.gd;
    const fileSystem = assignIn(new gd.AbstractFileSystemJS(), localFileSystem);
    const exporter = new gd.Exporter(fileSystem, this.path);
    const exportOptions = new gd.MapStringBoolean();
    for (let key in options) {
      exportOptions.set(key, options[key]);
    }
    exporter.exportWholePixiProject(project, outputDir, exportOptions);
    exportOptions.delete();
    exporter.delete();
  }

  /**
   * Returns the libGD.js instance.
   */
  getRawGD() {
    return this.gd;
  }

  /**
   * Returns the path to the runtime files.
   * @returns {string}
   */
  getRuntimePath() {
    return join(this.path, "Runtime");
  }
}

const loadGD = async (version) => {
  let gd;
  if (version === undefined) version = await findLatestVersion();
  return (
    getGD(version)
      .then(() => {
        gd = global._GD;
      })
      .then(() => {
        return loadExtensions(
          gd,
          join(getRuntimePath(version), "Runtime", "Extensions")
        );
      })
      /*
    .then(() => {
      const exts = gd.JsPlatform.get().getAllPlatformExtensions();
      for (let i = 0; i < exts.size(); i++) console.log(exts.at(i).getName());
    })
    */
      .then(() => {
        return new WrappedGD(gd, getRuntimePath(version));
      })
  );
};

module.exports = loadGD;

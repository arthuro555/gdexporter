const extensionLoader = require("./JsExtensionsLoader/LocalJsExtensionsLoader");
const projectLoader = require("./LocalProjectOpener");
const eventsFunctionsLoader = require("./EventsFunctionsExtensionsLoader/index").loadProjectEventsFunctionsExtensions;
const eventFunctionsWriter = require("./EventsFunctionsExtensionsLoader/LocalEventsFunctionCodeWriter").makeLocalEventsFunctionCodeWriter;

let project;

exports.load = function(projectLocation) {
  projectLocation = projectLocation || "./Project/game.json";
  return require("./updateGD").getGD()
    .then(() => extensionLoader(gd).loadAllExtensions())
    /*
    .then(() => {
      const exts = gd.JsPlatform.get().getAllPlatformExtensions();
      for(let i = 0; i < exts.size(); i++) console.log(exts.at(i).getName());
    })
    */
    .then(() => projectLoader.loadProjectFiles(projectLocation))
    .then(projectFile => {
      console.log("Loaded File"); 
      projectFile.content.properties.projectFile = projectLocation;
      return projectLoader.loadSerializedProject(gd, projectFile.content);
    })
    .then(projectLoaded => {
      project = projectLoaded;
      return eventsFunctionsLoader(project, eventFunctionsWriter());
    })
    .then(() => project);
}

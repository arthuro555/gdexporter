const extensionLoader = require("./GDTools/JsExtensionsLoader/LocalJsExtensionsLoader");
const projectLoader = require("./GDTools/LocalProjectOpener");

exports.load = function(projectLocation) {
  projectLocation = projectLocation || "./Project/game.json";
  return require("./GDTools/getGD").getGD()
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
      return projectLoader.loadSerializedProject(gd, projectFile.content);
    });
}

const extensionLoader = require("./GDTools/JsExtensionsLoader/LocalJsExtensionsLoader");
const projectLoader = require("./GDTools/LocalProjectOpener");
const exporter = require("./GDTools/ExportProject");

require("./GDTools/getGD").getGD()
  .then(() => extensionLoader(gd).loadAllExtensions())
  /*
  .then(() => {
    const exts = gd.JsPlatform.get().getAllPlatformExtensions();
    for(let i = 0; i < exts.size(); i++) console.log(exts.at(i).getName());
  })
  */
  .then(() => projectLoader.readProjectFile("./Project/game.json"))
  .then(projectFile => {
    console.log("Loaded File"); 
    return projectLoader.loadSerializedProject(gd, projectFile);
  })
  .then(project => {
    console.log("Loaded Project")
    exporter.exportHTML5(project, "./Exported")
  });

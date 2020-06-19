const extensionLoader = require("./GDTools/JsExtensionsLoader/LocalJsExtensionsLoader");
const projectLoader = require("./GDTools/LocalProjectOpener");

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
    const layout = project.getLayoutAt(0);
    const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
    console.log("Generate test code")
    const code = layoutCodeGenerator.generateLayoutCompleteCode(
      layout,
      new gd.SetString(),
      true
    );

    console.log("Generation finished");
    //console.log(code);

    layout.delete();
    layoutCodeGenerator.delete();
  });

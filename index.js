const initGD = require("./getGD").getGD()
  .then(arg => {console.log("Got GD"); return arg;})
  .then(initGD => initGD())
  .then(arg => {console.log("Initied GD"); return arg;})
  .then(gd => (require("./getGDJS")(gd), gd))
  .then(arg => {console.log("Got GDJS"); return arg;})
  .then((extensionsLoader, gd) => {
    let JSPlatform = gd.JsPlatform.get();
    extensionsLoader.loadAllExtensions();
    let project = gd.ProjectHelper.createNewGDJSProject();
	console.log(project);
});

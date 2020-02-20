const initGD = require("./getGD").getGD().then(initGD => {
        initGD().then(gd => {
            require("./getGDJS")(gd).then((extensionsLoader) => {
                let JSPlatform = gd.JsPlatform.get();
                extensionsLoader.loadAllExtensions();
                let project = gd.ProjectHelper.createNewGDJSProject()
                let serializer = new gd.SerializerElement();
        })
    });
});

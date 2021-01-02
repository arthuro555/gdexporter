const path = require("path");
const fs = require("fs-extra-promise");

const checkIfPathHasJsExtensionModule = (extensionFolderPath) => {
  return new Promise((resolve) => {
    const jsExtensionModulePath = path.join(
      extensionFolderPath,
      "JsExtension.js"
    );
    fs.stat(jsExtensionModulePath, (err, stats) => {
      if (err) {
        return resolve(null);
      }

      return resolve(stats.isFile() ? jsExtensionModulePath : null);
    });
  });
};

const findJsExtensionModules = (extensionsRoot) => {
  console.info(
    `Searching for JS extensions (file called JsExtension.js) in ${extensionsRoot}...`
  );
  return new Promise(async (resolve, reject) => {
    const extensionFolders = await fs.readdirAsync(extensionsRoot);

    const filteredExtensionFolders = extensionFolders.filter((folder) => {
      return folder.indexOf("Example") === -1;
    });

    Promise.all(
      filteredExtensionFolders.map((extensionFolder) =>
        checkIfPathHasJsExtensionModule(
          path.join(extensionsRoot, extensionFolder)
        )
      )
    ).then((modulePaths) => {
      resolve(modulePaths.filter((modulePath) => !!modulePath));
    }, reject);
  });
};

module.exports = {
  findJsExtensionModules,
};

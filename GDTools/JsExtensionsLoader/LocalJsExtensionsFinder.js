// Note: this file does not use export/imports nor Flow to allow its usage from Node.js
const path = require('path');
const fs = require('fs');

const checkIfPathHasJsExtensionModule = extensionFolderPath => {
  return new Promise(resolve => {
    const jsExtensionModulePath = path.join(
      extensionFolderPath,
      'JsExtension.js'
    );
    fs.stat(jsExtensionModulePath, (err, stats) => {
      if (err) {
        return resolve(null);
      }

      return resolve(stats.isFile() ? jsExtensionModulePath : null);
    });
  });
};

const findJsExtensionModules = () => {
  return Promise.resolve().then(() => {
    const extensionsRoot = path.join(__dirname, "..", "Runtime", 'Extensions');
    console.info(
      `Searching for JS extensions (file called JsExtension.js) in ${extensionsRoot}...`
    );
    return new Promise((resolve, reject) => {
      fs.readdir(extensionsRoot, (error, extensionFolders) => {
        if (error) {
          return reject(error);
        }
        const filteredExtensionFolders = extensionFolders.filter(folder => {
          return folder.indexOf('Example') === -1;
        });

        Promise.all(
          filteredExtensionFolders.map(extensionFolder =>
            checkIfPathHasJsExtensionModule(
              path.join(extensionsRoot, extensionFolder)
            )
          )
        ).then(modulePaths => {
          resolve(modulePaths.filter(modulePath => !!modulePath));
        }, reject);
      });
    });
  });
};

module.exports = {
  findJsExtensionModules,
};

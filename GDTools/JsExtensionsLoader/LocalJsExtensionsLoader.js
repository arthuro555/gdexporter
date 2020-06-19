const loadExtension = require('./index.js').loadExtension;
const findJsExtensionModules = require('./LocalJsExtensionsFinder').findJsExtensionModules;

const _ = (arg) => arg; // No translations

/**
 * Loader that will find all JS extensions declared in GDJS/Runtime/Extensions/xxx/JsExtension.js.
 * If you add a new extension and also want it to be available for the web-app version, add it in
 * BrowserJsExtensionsLoader.js
 */
module.exports = function makeExtensionsLoader(gd) {
  return {
    loadAllExtensions: () => {
      return findJsExtensionModules().then(
        extensionModulePaths => {
          return Promise.all(
            extensionModulePaths.map(extensionModulePath => {
              let extensionModule = null;
              try {
                extensionModule = require(extensionModulePath);
              } catch (ex) {
                return {
                  extensionModulePath,
                  result: {
                    message:
                      'Unable to import extension. Please check for any syntax error or error that would prevent it from being run.',
                    error: true,
                    rawError: ex,
                  },
                };
              }

              if (extensionModule) {
                return {
                  extensionModulePath,
                  result: loadExtension(
                    _,
                    gd,
                    gd.JsPlatform.get(),
                    extensionModule
                  ),
                };
              }

              return {
                extensionModulePath,
                result: {
                  error: true,
                  message:
                    'Unknown error. Please check for any syntax error or error that would prevent it from being run.',
                },
              };
            })
          );
        },
        err => {
          console.error(`Unable to find JS extensions modules`);
          throw err;
        }
      );
    },
  };
};

const loadExtension = require("./index.js").loadExtension;
const { findJsExtensionModules } = require("./LocalJsExtensionsFinder");

const _ = (arg) => arg; // No translations

/**
 * Loader that will load all JS Extensions.
 */
module.exports = function loadExtensions(gd, extensionsRoot) {
  return findJsExtensionModules(extensionsRoot).then(
    (extensionModulePaths) => {
      return Promise.all(
        extensionModulePaths.map((extensionModulePath) => {
          let extensionModule = null;
          try {
            extensionModule = require(extensionModulePath);
          } catch (ex) {
            return {
              extensionModulePath,
              result: {
                message:
                  "Unable to import extension. Please check for any syntax error or error that would prevent it from being run.",
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
                "Unknown error. Please check for any syntax error or error that would prevent it from being run.",
            },
          };
        })
      );
    },
    (err) => {
      console.error(`Unable to find JS extensions modules`);
      throw err;
    }
  );
};

const fs = require("fs");
const spawn = require("child_process").spawn;
const join = require("path").join;
const some = require('lodash/some');

const gdjsRoot = join(".", "GDJSRuntime")

/**
 * Run extensions tests and check for any non-empty results.
 */
const runExtensionSanityTests = (
  gd,
  extension,
  jsExtensionModule
) => {
  if (!jsExtensionModule.runExtensionSanityTests) {
    return {
      error: true,
      message:
        'Missing runExtensionSanityTests in the extension module exports',
    };
  }

  const testResults = jsExtensionModule.runExtensionSanityTests(gd, extension);
  if (some(testResults)) {
    return {
      error: true,
      message: 'One or more tests are failing for the extension (see rawError)',
      rawError: testResults,
    };
  }

  return {
    error: false,
    message: 'Tests passed successfully',
  };
};

const loadExtension = (_, gd, platform, jsExtensionModule) => {
  if (!jsExtensionModule.createExtension) {
    return {
      message:
        'Extension module found, but no createExtension method is exported',
      error: true,
    };
  }

  let extension = null;
  try {
    extension = jsExtensionModule.createExtension(_, gd);
    if (!extension) {
      return {
        message: `createExtension did not return any extension. Did you forget to return the extension created?`,
        error: true,
      };
    }
  } catch (ex) {
    return {
      message: `🚨 Exception caught while running createExtension. 💣 Please fix this error as this will make GDevelop crash at some point.`,
      error: true,
      dangerous: true,
      rawError: ex,
    };
  }

  try {
    const testsResult = runExtensionSanityTests(
      gd,
      extension,
      jsExtensionModule
    );
    if (testsResult.error) {
      extension.delete();
      return testsResult;
    }
  } catch (ex) {
    return {
      message: `🚨 Exception caught while running runExtensionSanityTests. 💣 Please fix this error as this will make GDevelop crash at some point.`,
      error: true,
      dangerous: true,
      rawError: ex,
    };
  }

  platform.addNewExtension(extension);
  extension.delete(); // Release the extension as it was copied inside gd.JsPlatform

  return {
    message: '✅ Successfully loaded the extension.',
    error: false,
  };
};

const checkIfPathHasJsExtensionModule = extensionFolderPath => {
    const jsExtensionModulePath = join(
    extensionFolderPath,
    'JsExtension.js'
    );
    if(fs.existsSync(jsExtensionModulePath)){
        return fs.statSync(jsExtensionModulePath).isFile() ? jsExtensionModulePath : null;
    } else return null;
};

const findJsExtensionModules = ({ filterExamples }) => {
    const extensionsRoot = join(gdjsRoot, 'Extensions');
    console.info(
        `Searching for JS extensions (file called JsExtension.js) in ${extensionsRoot}...`
    );
    return new Promise((resolve, reject) => {
        fs.readdir(extensionsRoot, (error, extensionFolders) => {
            if (error) {
                return reject(error);
            }

            const filteredExtensionFolders = extensionFolders.filter(folder => {
            if (!filterExamples) return true;

            return folder.indexOf('Example') === -1;
            });

            Promise.all(
            filteredExtensionFolders.map(extensionFolder => 
                checkIfPathHasJsExtensionModule(
                join(extensionsRoot, extensionFolder)
                )
            )
            ).then(modulePaths => {
                resolve(modulePaths.filter(modulePath => !!modulePath));
                }, reject);
        });
    });
};

function makeExtensionsLoader({gd, filterExamples,}){
    return {
      loadAllExtensions: () => {
        return findJsExtensionModules({ filterExamples }).then(
          extensionModulePaths => {
            return Promise.all(
              extensionModulePaths.map(extensionModulePath => {
                let extensionModule = null;
                try {
                  // Why doesn't that solution work?
                  // extensionModulePath = join(".", extensionModulePath);
                  extensionModule = require("./"+extensionModulePath);
                } catch (ex) {
                  console.log(ex)
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
                      str => str,
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

module.exports = (gd) => {
  
    if(!fs.existsSync(gdjsRoot)) {
        console.log("Downloading GDevelop JS Runtime (Might take a while)...")
        fs.mkdirSync(gdjsRoot);
		return new Promise((resolver) => {
        	spawn("cd " + gdjsRoot + " && git init && git remote add -f origin https://github.com/4ian/GDevelop").addListener("close", resolver)
		}).then(() => {
			return fs.writeFile(join(gdjsRoot, ".git", "info", "sparse-checkout"), "GDJS/Runtime");
		}).then(() => {
			return new Promise((resolver) => {
				spawn("cd " + gdjsRoot + " && git pull origin master").addListener("close", resolver);
			});
		}).then(() => makeExtensionsLoader({gd: gd, filterExamples: true}))
    } else {
		return new Promise((resolve) => {
      		resolve(makeExtensionsLoader({gd: gd, filterExamples: true}));
		});
	}
}
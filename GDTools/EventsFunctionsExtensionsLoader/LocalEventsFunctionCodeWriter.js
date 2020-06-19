// @flow
const slugs = require('slugs');
const os = require('os');
const fs = require('fs');

/**
 * Create the EventsFunctionCodeWriter that writes generated code for events functions
 * to local files.
 */
const makeLocalEventsFunctionCodeWriter = () => {
  const outputDir = os.tmpdir() + '/GDGeneratedEventsFunctions';
  fs.mkdir(outputDir, err => {
    if (err && err.code !== 'EEXIST') {
      console.error(
        'Unable to create the directory where to output events functions generated code: ',
        err
      );
      return;
    }
  });

  const getPathFor = (codeNamespace) => {
    return `${outputDir}/${slugs(codeNamespace)}.js`;
  };

  return {
    getIncludeFileFor: (codeNamespace) => getPathFor(codeNamespace),
    writeFunctionCode: (
      functionCodeNamespace,
      code
    ) => {
      return new Promise((resolve, reject) => {
        const filepath = getPathFor(functionCodeNamespace);
        fs.writeFile(filepath, code, err => {
          if (err) return reject(err);

          resolve();
        });
      });
    },
    writeBehaviorCode: (
      behaviorCodeNamespace,
      code
    ) => {
      return new Promise((resolve, reject) => {
        const filepath = getPathFor(behaviorCodeNamespace);
        fs.writeFile(filepath, code, err => {
          if (err) return reject(err);

          resolve();
        });
      });
    },
  };
};
module.exports.makeLocalEventsFunctionCodeWriter = makeLocalEventsFunctionCodeWriter;

const fs = require('fs');
const path = require("path");
const { unsplit } = require("./ObjectSplitter");

module.exports = {
  readProjectFile: (filepath) => {
    return new Promise((resolve, reject) => {
      if (!fs) return reject('Not supported');

      fs.readFile(filepath, { encoding: 'utf8' }, (err, data) => {
        if (err) return reject(err);

        try {
          const dataObject = JSON.parse(data);
          return resolve(dataObject);
        } catch (ex) {
          return reject('Malformed file');
        }
      });
    });
  },
  loadProjectFiles: (filePath) => {
    const projectPath = path.dirname(filePath);
    return module.exports.readProjectFile(filePath).then(object => {
      return unsplit(object, {
        getReferencePartialObject: referencePath => {
          return readJSONFile(path.join(projectPath, referencePath) + '.json');
        },
        isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
        // Limit unsplitting to depth 3 (which would allow properties of layouts/external layouts/external events
        // to be un-splitted, but not the content of these properties), to avoid very slow processing
        // of large game files.
        maxUnsplitDepth: 3,
      }).then(() => {
        return { content: object };
      });
    });
  },
  loadSerializedProject: (gd, projectObject) => {
    const serializedProject = gd.Serializer.fromJSObject(projectObject);
    const newProject = gd.ProjectHelper.createNewGDJSProject();
    newProject.unserializeFrom(serializedProject);
  
    return newProject;
  },
};

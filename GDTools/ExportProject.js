const localFileSystem = require("./LocalFileSystem").fs;
const assignIn = require("lodash/assignIn");
const path = require("path");

const gdjsRoot = path.join(__dirname, "..")

exports.exportHTML5 = function(project, outputDir) {
    const fileSystem = assignIn(
      new gd.AbstractFileSystemJS(),
      localFileSystem
    );
    const exporter = new gd.Exporter(fileSystem, gdjsRoot);
    const exportOptions = new gd.MapStringBoolean();
    exporter.exportWholePixiProject(
      project,
      outputDir,
      exportOptions
    );
    exportOptions.delete();
    exporter.delete();
}

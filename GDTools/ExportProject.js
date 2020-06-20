const localFileSystem = require("./LocalFileSystem").fs;
const assignIn = require("lodash/assignIn");
const path = require("path");

const gdjsRoot = path.join(__dirname, "..")

exports.exportPIXI = function(project, outputDir, options) {
    const fileSystem = assignIn(
      new gd.AbstractFileSystemJS(),
      localFileSystem
    );
    const exporter = new gd.Exporter(fileSystem, gdjsRoot);
    const exportOptions = new gd.MapStringBoolean();
    for(let key in options) {
      exportOptions.set(key, options[key]);
    }
    exporter.exportWholePixiProject(
      project,
      outputDir,
      exportOptions
    );
    exportOptions.delete();
    exporter.delete();
}

/**
 * @typedef PluginDescriptor
 * @property {(options?: Object) => Plugin} plugin
 * @property {Object} [options]
 */

/**
 * @typedef Plugin
 * @property {(project) => void} [preExport] A method called with gd.Project to apply modifications to the project before the export.
 * @property {(document) => void} [document] A method called with the index.html parsed by JSDom.
 * @property {(exportPath) => void} [postExport] A method called with the path to the export at the end.
 */

const preExportCallbacks = new Set();
const documentCallbacks = new Set();
const postExportCallbacks = new Set();

/**
 * Bootstraps JSDom and runs plugins using it.
 */
const runDocument = (exportPath) => {
  // First, check if JSDom is used by any plugin
  if (documentCallbacks.size === 0) return;
  console.info("⌛ Plugins are patching index.html...");

  // Load required dependencies
  const { readFileSync, writeFileSync } = require("fs");
  const { JSDOM } = require("jsdom");

  // Parse the document
  const document = new JSDOM(
    readFileSync(require("path").join(exportPath, "index.html"))
  );

  // Run the plugin functions
  documentCallbacks.forEach((callback) => callback(document.window.document));

  // Write the new document
  writeFileSync(exportPath + "/index.html", document.serialize());
};

module.exports = {
  /**
   * Registers a plugin.
   * @param {PluginDescriptor} pluginDescriptor
   */
  registerPlugin: ({ plugin, options }) => {
    if (typeof plugin !== "function") {
      console.error(
        "❌ Error while loading a plugin: Make sure your module exports a function!"
      );
      return;
    }
    const callbacks = plugin(options);
    if (typeof callbacks !== "object") {
      console.warn("⚠ A plugin function hasn't returned a valid object!");
      return;
    }

    if (callbacks.preExport) preExportCallbacks.add(callbacks.preExport);
    if (callbacks.document) documentCallbacks.add(callbacks.document);
    if (callbacks.postExport) postExportCallbacks.add(callbacks.postExport);
  },

  /**
   * Runs plugins preExport methods.
   * @param {gd.Project} project The gd.Project instance of the project
   */
  runPreExport: (project) => {
    if (preExportCallbacks.size === 0) return;
    console.info("⌛ Plugins are preprocessing the project...");
    preExportCallbacks.forEach((callback) => callback(project));
  },

  /**
   * Runs plugins postExport methods.
   * @param {string} exportPath The path the project was exported to.
   */
  runPostExport: (exportPath) => {
    runDocument(exportPath);
    if (postExportCallbacks.size === 0) return;
    console.info("⌛ Plugins are postprocessing the export...");
    postExportCallbacks.forEach((callback) => callback(exportPath));
  },
};

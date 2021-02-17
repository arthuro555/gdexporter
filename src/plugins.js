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

const preExportCallbacks = [];
const documentCallbacks = [];
const postExportCallbacks = [];

/**
 * Bootstraps JSDom and runs plugins using it.
 */
const runDocument = async (exportPath) => {
  // First, check if JSDom is used by any plugin
  if (documentCallbacks.size === 0) return;
  console.info("⌛ Plugins are patching index.html...");

  // Load required dependencies
  const { writeFile, readFile } = require("fs").promises;
  const { JSDOM } = require("jsdom");

  // Parse the document
  const document = new JSDOM(
    await readFile(require("path").join(exportPath, "index.html"))
  );

  // Run the plugin functions
  for (const callback of documentCallbacks)
    await callback(document.window.document);

  // Write the new document
  await writeFile(exportPath + "/index.html", document.serialize());
};

module.exports = {
  /**
   * Registers a plugin.
   * @param {PluginDescriptor} pluginDescriptor
   */
  registerPlugin: (plugin) => {
    let callbacks;
    if (typeof plugin === "function") callbacks = plugin({});
    else {
      if (typeof plugin !== "object") {
        console.error(
          "❌ Error while loading the config: A plugin is neither a function nor an object!"
        );
        return;
      }

      const { plugin: pluginCtor, options } = plugin;

      if (typeof options !== "object" && typeof options !== "undefined") {
        console.error(
          "❌ Error while loading the config: The options aren't a vlaid javascript object!"
        );
        return;
      }
      if (typeof pluginCtor !== "function") {
        console.error(
          "❌ Error while loading a plugin: Make sure your module exports a function!"
        );
        return;
      }

      callbacks = pluginCtor(options || {});
    }

    if (typeof callbacks !== "object") {
      console.warn("⚠ A plugin function hasn't returned a valid object!");
      return;
    }

    if (callbacks.preExport) preExportCallbacks.push(callbacks.preExport);
    if (callbacks.document) documentCallbacks.push(callbacks.document);
    if (callbacks.postExport) postExportCallbacks.push(callbacks.postExport);
  },

  /**
   * Runs plugins preExport methods.
   * @param {gd.Project} project The gd.Project instance of the project
   */
  runPreExport: async (project) => {
    if (preExportCallbacks.size === 0) return;
    console.info("⌛ Plugins are preprocessing the project...");
    for (const callback of preExportCallbacks) await callback(project);
  },

  /**
   * Runs plugins postExport methods.
   * @param {string} exportPath The path the project was exported to.
   */
  runPostExport: async (exportPath) => {
    await runDocument(exportPath);
    if (postExportCallbacks.size === 0) return;
    console.info("⌛ Plugins are postprocessing the export...");
    for (const callback of postExportCallbacks) await callback(exportPath);
  },
};

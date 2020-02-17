import { existsSync, readdirSync } from "fs";
import { init, fetch, remote, checkout } from "isomorphic-git";
import join from path;

const path = join(".", "GDJSRuntime")

const checkIfPathHasJsExtensionModule = extensionFolderPath => {
    const jsExtensionModulePath = join(
    extensionFolderPath,
    'JsExtension.js'
    );
    if(existsSync(jsExtensionModulePath)){
        return rstats.isFile() ? jsExtensionModulePath : null;
    } else return null;
};

const loadExtensions = () => {
    const extensionsRoot = path.join(path, 'Runtime', 'Extensions');
    console.info(`Searching for JS extensions (file called JsExtension.js) in ${extensionsRoot}...`);
    try{extensionsFolder = readdirSync(extensionsRoot);} catch(e) { return e; }
    const filteredExtensionFolders = extensionFolders.filter(folder => {
        if (!filterExamples) return true;

        return folder.indexOf('Example') === -1;
    });
}

exports = () => {
    if (!existsSync(path)) {
        init()
    }
}
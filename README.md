# gdexporter
A CLI to export a [GDevelop](https://github.com/4ian/GDevelop) game without the IDE (For example for CI).

## Installation
The installation is done via npm, `npm install gdexporter`.

## Usage
`gdexport <options>`

#### Parameters
| Option | Aliases | Description |
| :-: | :-: | :-- |
| `--project` | `-p`, `--in` | Path to the game.json. Defaults to `"./Project/game.json"`. |
| `--out` | `-o` | Path to the output direcory, where the game will be exported. Defaults to `"./Exported"`. |
| `--build` | `-b` | The build type. It can be `"electron"`, `"cordova"` or `"facebook"`. If not specified or invalid, will export to HTML5. |
| `--version` | `--tag`, `-v`, `-t` | The GDevelop version to use for exporting. It uses the github release tag (for example `v5.0.0-beta103`). Uses the latest release by default. |
| `--verbose` | None | This flag enables showing logs from GDCore. |

#### Configuration file
You can add a configuration file to specify the gdexporter options. It has to be named `gdexport.config.js` and to be in the directory of execution of gdexporter. It is the recommended way to specify plugins.

Example configuration file:
```js
module.exports = {
  buildType: "electron",
  gdevelopVersion: "v5.0.0-beta105",
  plugins: [
    require("myPlugin"),
    {
      plugin: require("./myOtherPlugin"),
      options: {
        foo: "bar",
      },
    },
  ],
}
```

## Programmatic API
You can import the module to export a game programatically.  
Example:
```js
const exporter = require("gdexporter");

exporter("path/to/game.json", "path/to/export/directory", {
  buildType: "electron",
  gdevelopVersion: "v5.0.0-beta103",
  plugins: [
    require("myPlugin"),
    {
      plugin: require("./myOtherPlugin"),
      options: {
        foo: "bar",
      },
    },
  ],
}).then(() => console.log("Done!"));
```

## Plugins
It is possible to make plugins for gdexporter easily. A gdexporter plugin is a function that returns an object containing callback functions to call at certain points of the exportation. Plugin options are passed to the function. Here is an example plugin that modifies the project name:
```js
module.exports = ({ name }) => ({
  preExport: (project) => project.setName(name || "ProjectName"),
})
```
If this plugin is used like this:
```js
module.exports = {
  buildType: "electron",
  gdevelopVersion: "v5.0.0-beta105",
  plugins: [
    {
      plugin: require("./myPlugin"),
      options: {
        name: "Awesome Project"
      }
    },
  ],
}
```
Then the exported project would have as name "Awesome Project".


The available callbacks functions are:

#### `preExport(project: gd.Project)`
Called with the gd.Project before exporting to preprocess the project.

#### `document(document: JSDom.window.Document)`
Called with a fake `document` after the export to modify the index.html. Using this to modify the index.html reduces the chances of a conflict between plugins.

#### `postExport(exportPath: string)`
Called with the path to the exported files after all other operations.

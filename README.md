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

## Programmatic API
You can import the module to export a game programatically.  
Example:
```js
const exporter = require("gdexporter");

exporter("path/to/game.json", "path/to/export/directory", {
  buildType: "electron",
  gdevelopVersion: "v5.0.0-beta103",
}).then(() => console.log("Done!"));
```

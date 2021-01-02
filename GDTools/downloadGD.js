const https = require("follow-redirects").https;
const fs = require("fs-extra-promise");
const path = require("path");
const { request } = require("@octokit/request");
const StreamZip = require("node-stream-zip");

const getRuntimePath = (version) => path.join(__dirname, "Versions", version);

const downloadFile = (file, savePath) =>
  new Promise((resolve) => {
    https.get(file, function (response) {
      if (response.statusCode !== 200) {
        throw new Error(
          `❌ Cannot download ${file}! Error ${response.statusCode}: ${response.statusMessage}`
        );
      }
      response.pipe(fs.createWriteStream(savePath)).addListener("close", () => {
        resolve();
      });
    });
  });

const findLatestVersion = () => {
  return new Promise((resolve, reject) => {
    // Fetch base release infos
    console.info(`🕗 Getting latest release tag...`);
    return request("GET /repos/4ian/GDevelop/releases/latest")
      .then(({ data }) => {
        resolve(data.tag_name);
      })
      .catch(() => {
        console.error(
          "❌ Couldn't fetch latest version, using latest local version."
        );
        fs.readdirAsync(path.join(__dirname, "Versions"))
          .then((versions) => resolve(versions[0]))
          .catch(() => {
            console.error(
              "💀 Fatal Error! Couldn't find or download the latest version."
            );
            reject();
          });
      });
  });
};

/**
 * Downloads a GDevelop version (libGD.js, the runtime and the extensions).
 * @param {string} versionTag The GDevelop version tag
 */
const downloadVersion = async function (versionTag) {
  const tasks = [];
  const gdPath = getRuntimePath(versionTag);

  // Make sure "Versions" directory exists
  const versionsDir = path.join(__dirname, "Versions");
  await fs.accessAsync(versionsDir).catch(() => fs.mkdirAsync(versionsDir));

  // Clear directory
  await fs
    .accessAsync(gdPath)
    .catch(() => null) // Swallow the error as it is expected to error
    .then(() => fs.removeAsync(gdPath))
    .finally(() => fs.mkdirAsync(gdPath));

  const commitHash = (
    await request("GET /repos/4ian/GDevelop/git/ref/tags/{tag}", {
      tag: versionTag,
    })
  ).data.object.sha;

  // Fetch the file with the GDJS Runtime and extensions
  console.info(`🕗 Starting download of GDevelop '${versionTag}'...`);
  const zipPath = path.join(gdPath, "gd.zip");
  tasks.push(
    downloadFile(
      "https://codeload.github.com/4ian/GDevelop/legacy.zip/" + versionTag,
      zipPath
    )
      .then(async () => {
        console.info(`✅ Done downloading GDevelop '${versionTag}'`);
        console.info(`🕗 Extracting GDevelop '${versionTag}'...`);
        await fs.mkdirAsync(path.join(gdPath, "Runtime"));
        await fs.mkdirAsync(path.join(gdPath, "Runtime", "Extensions"));
        const zip = new StreamZip({
          file: zipPath,
          storeEntries: true,
        });
        const prefix = `4ian-GDevelop-${commitHash.slice(0, 7)}/`;
        return Promise.all([
          new Promise((resolve) => {
            zip.on("ready", () => {
              zip.extract(
                prefix + "Extensions",
                path.join(gdPath, "Runtime", "Extensions"),
                (e) => {
                  if (e)
                    console.error("❌ Error while extracting extensions! ", e);
                  else resolve();
                }
              );
            });
          }),
          new Promise((resolve) => {
            zip.on("ready", () => {
              zip.extract(
                prefix + "GDJS/Runtime",
                path.join(gdPath, "Runtime"),
                (e) => {
                  if (e)
                    console.error("❌ Error while extracting the runtime! ", e);
                  else resolve();
                }
              );
            });
          }),
        ]);
      })
      .finally(() => fs.removeAsync(zipPath))
      .then(() => console.info(`✅ Done extracting the GDevelop Runtime`))
  );

  // Download the fitting libGD version
  const libGDPath =
    "https://s3.amazonaws.com/gdevelop-gdevelop.js/master/commit/" +
    commitHash +
    "/";
  console.info(`🕗 Starting download of libGD.js and libGD.js.mem...`);
  tasks.push(
    downloadFile(
      libGDPath + "libGD.js",
      path.join(gdPath, "libGD.js")
    ).then(() => console.info(`✅ Done downloading libGD.js`))
  );
  tasks.push(
    downloadFile(
      libGDPath + "libGD.js.mem",
      path.join(gdPath, "libGD.js.mem")
    ).then(() => console.info(`✅ Done downloading libGD.js.mem`))
  );

  return Promise.all(tasks).then(() =>
    console.info(`✅ Successfully downloaded GDevelop version '${versionTag}'`)
  );
};

/**
 * Initialize libGD.js.
 * If the version is not present, download it.
 * Returning `gd` doesn't work, so a hacky workaround with global is used.
 * @param {string} [versionTag] The GDevelop version to use. If not precised, the latest is used.
 */
const getGD = async function (versionTag) {
  const runtimePath = getRuntimePath(versionTag);
  // Download the version if it isn't present
  try {
    fs.accessSync(runtimePath);
  } catch {
    console.log("❌ The GDevelop version was not found, downloading it!");
    await downloadVersion(versionTag).catch(console.error);
  }

  await new Promise((resolve) => {
    require(path.join(runtimePath, "libGD.js"))().then((GD) => {
      global._GD = GD;
      resolve();
    });
  });
};

module.exports = {
  getRuntimePath,
  getGD,
  findLatestVersion,
};

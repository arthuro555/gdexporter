const esbuild = require("esbuild");

/** @param {string} outPath */
const renameBuiltFile = (outPath) => {
  return outPath.replace(/\.ts$/, ".js");
};

/**
 * Builds the GDJS Runtime
 */
module.exports = async (gdPath) => {
  const {
    getAllInOutFilePaths,
    isUntransformedFile,
  } = require("./runtime-files-list")(gdPath);
  const esbuildService = await esbuild.startService();

  // Generate the output file paths
  const {
    allGDJSInOutFilePaths,
    allExtensionsInOutFilePaths,
  } = await getAllInOutFilePaths();

  // Build (or copy) all the files
  let errored = false;
  const startTime = Date.now();
  await Promise.all(
    [...allGDJSInOutFilePaths, ...allExtensionsInOutFilePaths].map(
      async ({ inPath, outPath }) => {
        const outfile = renameBuiltFile(outPath);
        if (isUntransformedFile(inPath) || inPath === outfile) return;
        return esbuildService
          .build({
            sourcemap: true,
            entryPoints: [inPath],
            outfile,
            minify: true,
          })
          .catch(() => {
            // Error is already logged by esbuild.
            errored = true;
          });
      }
    )
  );

  esbuildService.stop();
  const buildDuration = Date.now() - startTime;
  if (!errored) console.info(`✅ Runtime built in ${buildDuration}ms`);
  else console.info(`❌ Error while building gdjs`);
};

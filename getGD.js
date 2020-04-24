const https = require("follow-redirects").https;
const fs = require("fs");
const path = require("path");



exports.downloadGD = function() {
	return new Promise((resolve) => {
		https.get("https://s3.amazonaws.com/gdevelop-gdevelop.js/master/latest/libGD.js", function (response) {
			if (response.statusCode !== 200) {
				throw new Error("Cannot download GDevelop.js! Error " + response.statusCode + ": " + response.statusMessage);
			}
			response.pipe(fs.createWriteStream(path.join(".", "libGD.js"))).addListener("close", resolve);
		});
		https.get("https://s3.amazonaws.com/gdevelop-gdevelop.js/master/latest/libGD.js.mem", function (response) {
			if (response.statusCode !== 200) {
				throw new Error("Cannot download GDevelop.js! Error " + response.statusCode + ": " + response.statusMessage);
			}
			response.pipe(fs.createWriteStream(path.join(".", "libGD.js.mem"))).addListener("close", resolve);
		});
	});
}

exports.getGD = function() {
	// If not already downloaded download GDevelop.js
	if(!fs.existsSync(path.join(".", "libGD.js"))){
		console.log("downlod")
		return exports.downloadGD()
		  .then(() => {
			return require("./libGD.js");
		  });
	}
	return new Promise((resolve) => {
		resolve(require("./libGD.js"));
	})
}
 
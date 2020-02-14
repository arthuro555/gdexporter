const https = require("follow-redirects").https;
const fs = require("fs");
const path = require("path");



exports.downloadGD = function(callback, callbackError) {
	https.get("https://s3.amazonaws.com/gdevelop-gdevelop.js/master/latest/libGD.js", function (response) {
		if (response.statusCode !== 200) {
			throw new Error("Cannot download GDevelop.js! Error " + response.statusCode + ": " + response.statusMessage);
		}
		response.pipe(fs.createWriteStream(path.join(".", "libGD.js")));
	});
	https.get("https://s3.amazonaws.com/gdevelop-gdevelop.js/master/latest/libGD.js.mem", function (response) {
		if (response.statusCode !== 200) {
			throw new Error("Cannot download GDevelop.js! Error " + response.statusCode + ": " + response.statusMessage);
		}
		response.pipe(fs.createWriteStream(path.join(".", "libGD.js.mem")));
	});
	if(typeof callback === "function") {callback();};
}

exports.getGD = function() {
	if(!fs.existsSync(path.join(".", "libGD.js"))){
		return new Promise(exports.downloadGD)
		  .then((resolve) => {
			resolve(require("libGD.js")());
		});
	}
	return new Promise((resolve) => {
		resolve(require("libGD.js")());
	})
}

exports.getGDSync = function() {
	try{
		return require("./libGD.js")();
	} catch {
		console.error("ERROR: Download libGD.js before importing it. Trying to auto Download.")
		exports.downloadGD();
		return this();
	}
}


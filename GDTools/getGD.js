const https = require("follow-redirects").https;
const fs = require("fs");
const path = require("path");


exports.downloadGD = function() {
	return new Promise((resolve) => {
		let ret = 0;
		https.get("https://s3.amazonaws.com/gdevelop-gdevelop.js/master/latest/libGD.js", function (response) {
			if (response.statusCode !== 200) {
				throw new Error("Cannot download GDevelop.js! Error " + response.statusCode + ": " + response.statusMessage);
			}
			response.pipe(fs.createWriteStream(path.join(__dirname, "libGD.js"))).addListener("close", () => {if(++ret===2) resolve()});
		});
		https.get("https://s3.amazonaws.com/gdevelop-gdevelop.js/master/latest/libGD.js.mem", function (response) {
			if (response.statusCode !== 200) {
				throw new Error("Cannot download GDevelop.js! Error " + response.statusCode + ": " + response.statusMessage);
			}
			response.pipe(fs.createWriteStream(path.join(__dirname, "libGD.js.mem"))).addListener("close", () => {if(++ret===2) resolve()});
		});
	})
	.then(() => console.log("libGD done downloading!"));
}

exports.initGD = function(GDModule) {
	return new Promise(resolve => {
		GDModule().then(GD => {
			console.log("Initialized libGD"); 
			global.gd = GD;
			resolve();
		});
	});
}

exports.getGD = function() {
	// If not already downloaded download GDevelop.js
	const libGDPath = path.join(__dirname, "libGD.js");
	if(!fs.existsSync(libGDPath)){
		console.log("libGD not found, downloading it!");
		return exports.downloadGD()
		  .then(() => {
			return exports.initGD(require(libGDPath));
		  });
	} else {
		return Promise.resolve(exports.initGD(require(libGDPath)));
	}
}
 
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

exports = {
  mkDir: function(path) {
    try {
      fs.mkdirsSync(path);
    } catch (e) {
      console.error('mkDir(' + path + ') failed: ' + e);
      return false;
    }
    return true;
  },
  dirExists: function(path) {
    return fs.existsSync(path);
  },
  clearDir: function(path) {
    var files = [];
    var that = this;
    try {
      if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function(file) {
          var curPath = path + '/' + file;
          if (fs.lstatSync(curPath).isDirectory()) {
            // recurse
            that.clearDir(curPath);
          } else {
            // delete file
            try {
              fs.unlinkSync(curPath);
            } catch (e) {
              console.error('fs.unlinkSync(' + curPath + ') failed: ' + e);
            }
          }
        });
      }
    } catch (e) {
      console.error('clearDir(' + path + ') failed: ' + e);
    }
  },
  getTempDir: function() {
    return os.tmpdir();
  },
  fileNameFrom: function(fullpath) {
    if (this._isExternalURL(fullpath)) return fullpath;

    fullpath = this._translateURL(fullpath);
    return path.basename(fullpath);
  },
  dirNameFrom: function(fullpath) {
    if (this._isExternalURL(fullpath)) return '';

    fullpath = this._translateURL(fullpath);
    return path.dirname(fullpath);
  },
  makeAbsolute: function(filename, baseDirectory) {
    if (this._isExternalURL(filename)) return filename;

    filename = this._translateURL(filename);
    if (!this.isAbsolute(baseDirectory))
      baseDirectory = path.resolve(baseDirectory);

    return path.resolve(baseDirectory, path.normalize(filename));
  },
  makeRelative: function(filename, baseDirectory) {
    if (this._isExternalURL(filename)) return filename;

    filename = this._translateURL(filename);
    return path.relative(baseDirectory, path.normalize(filename));
  },
  isAbsolute: function(fullpath) {
    if (this._isExternalURL(fullpath)) return true;

    if (fullpath.length === 0) return true;
    fullpath = this._translateURL(fullpath);
    return (
      (fullpath.length > 0 && fullpath.charAt(0) === '/') ||
      (fullpath.length > 1 && fullpath.charAt(1) === ':')
    );
  },
  copyFile: function(source, dest) {
    //URL are not copied.
    if (this._isExternalURL(source)) return true;

    source = this._translateURL(source);
    try {
      if (source !== dest) fs.copySync(source, dest);
    } catch (e) {
      console.error('copyFile(' + source + ', ' + dest + ') failed: ' + e);
      return false;
    }
    return true;
  },
  writeToFile: function(file, contents) {
    try {
      fs.outputFileSync(file, contents);
    } catch (e) {
      console.error('writeToFile(' + file + ', ...) failed: ' + e);
      return false;
    }
    return true;
  },
  readFile: function(file) {
    try {
      var contents = fs.readFileSync(file);
      return contents.toString();
    } catch (e) {
      console.error('readFile(' + file + ') failed: ' + e);
      return '';
    }
  },
  readDir: function(path, ext) {
    ext = ext.toUpperCase();
    var output = new gd.VectorString();
    try {
      var files = [];
      if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function(file) {
          if (
            ext.length === 0 ||
            file.toUpperCase().indexOf(ext, file.length - ext.length) !== -1
          ) {
            output.push_back(path + '/' + file);
          }
        });
      }
    } catch (e) {
      console.error('readDir(' + path + ',' + ext + ') failed: ' + e);
    }

    return output;
  },
  fileExists: function(filename) {
    filename = this._translateURL(filename);
    try {
      const stat = fs.statSync(filename);
      return stat.isFile();
    } catch (e) {
      return false;
    }
  },
  _isExternalURL: function(filename) {
    return filename.substr(0, 4) === 'http' || filename.substr(0, 4) === 'ftp';
  },
  /**
   * Return the filename associated to the URL on the server, relative to the games directory.
   * (i.e: Transform g/mydirectory/myfile.png to mydirectory/myfile.png).
   */
  _translateURL: function(filename) {
    if (filename.substr(0, 2) === 'g/' || filename.substr(0, 2) === 'g\\')
      filename = filename.substr(2);

    return filename;
  },
};

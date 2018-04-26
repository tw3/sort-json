const { promisify } = require('util');

const fs = require('fs');
const lstatAsync = promisify(fs.lstat);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const path = require('path');
const glob = require("glob");
const globAsync = promisify(glob);

const defaultOptions = {
  outputDir: undefined,
  fileGlob: '*.json',
  debugFlag: false
};

class JsonSorter {
  constructor() {
    this.sorterOptions = Object.assign({}, defaultOptions);
  }

  setOutputDir(outputDir) {
    this.sorterOptions.outputDir = outputDir;
  }

  setFileGlob(fileGlob) {
    this.sorterOptions.fileGlob = fileGlob
  }

  setDebugFlag(debugFlag) {
    this.sorterOptions.debugFlag = debugFlag
  }

  sort(fileNameArray) {
    // console.log('this.sorterOptions', JSON.stringify(this.sorterOptions, null, 2)); // DEBUG

    const promiseArray = fileNameArray.map((fileName) => {
      return new Promise(async (resolve, reject) => {
        const stats = await lstatAsync(fileName);
        if (stats.isDirectory()) {
          await this.sortJsonDir(fileName);
          resolve();
          return;
        }
        if (!stats.isFile()) {
          const message = `'${fileName}' is not a file`;
          const err = new SortJsonException(message);
          reject(err);
        }
        await this.sortJsonFile(fileName);
        resolve();
      });
    });

    return Promise.all(promiseArray);
  }
  
  async sortJsonDir(dirName) {
    const globPattern = `${dirName}/**/${this.sorterOptions.fileGlob}`;
    const globOptions = {};
    const fileNameArray = await globAsync(globPattern, globOptions);
    await this.sort(fileNameArray);
  }
  
  async sortJsonFile(inputFileName) {
    const jsonStr = await readFileAsync(inputFileName, 'utf8')
    const newJsonStr = await this.sortJsonStr(jsonStr);
    const isUnchanged = (newJsonStr == null);
    if (isUnchanged) {
      return;
    }
    if (this.sorterOptions.debugFlag) {
      // DEBUG, simply output new content
      console.log('');
      console.log(newJsonStr);
    } else {
      const isSameJson = (newJsonStr === jsonStr);
      const isSameDir = (this.sorterOptions.outputDir === undefined);
      if (isSameJson && isSameDir) {
        return;
      }
      let outputFileName = inputFileName;
      if (!isSameDir) {
        const inputBaseName = path.basename(inputFileName);
        outputFileName = path.format({
          dir: this.sorterOptions.outputDir,
          base: inputBaseName
        });
      }
      // console.log('outputFileName', outputFileName);
      await writeFileAsync(outputFileName, newJsonStr);
      console.log('Updated', outputFileName);
    }
  }
  
  sortJsonStr(jsonStr) {
    return new Promise((resolve, reject) => {
      try {
        const jsonObj = JSON.parse(jsonStr);
        const sortedJsonObj = JsonSorter.sortObject(jsonObj);
        const newJsonStr = JSON.stringify(sortedJsonObj, null, 2);    
        resolve(newJsonStr);
      } catch (err) {
        reject(err);
      }
    });
  }
  
  static sortObject(object) {
    if (object == null) {
      return null;
    }
    if (Array.isArray(object)) {
      return object.map(JsonSorter.sortObject);
    }
    if (typeof object != "object") {
      return object;
    }
    var keys = Object.keys(object);
    keys.sort();
    var newObject = {};
    for (var i = 0; i < keys.length; i++) {
      newObject[keys[i]] = JsonSorter.sortObject(object[keys[i]]);
    }
    return newObject;
  }
}

class SortJsonException {
  constructor(message) {
    this.message = message;
    this.name = 'SortJsonException';
  }
}

module.exports = JsonSorter;

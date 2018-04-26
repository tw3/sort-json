const { promisify } = require('util');

const fs = require('fs');
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const glob = require("glob");
const globAsync = promisify(glob);
const path = require('path');

const JsonSorter = require('../json-sorter');

const opt = {
  outputDir: './test/output'
};

beforeEach(async (done) => {
  const dirName = opt.outputDir;
  const globPattern = `${dirName}/**/*`;
  const globOptions = {};
  const fileNameArray = await globAsync(globPattern, globOptions);
  fileNameArray.forEach(async (fileName) => {
    // console.log('about to delete', fileName);
    await unlinkAsync(fileName);
  });
  done();
});

test('Output from sortJsonInFiles(input.json) matches expected-output.json', done => {
  const inputFileName = path.resolve('./test/test.json');
  const jsonSorter = new JsonSorter();
  jsonSorter.setOutputDir(opt.outputDir);
  const fileNameArray = [inputFileName];
  jsonSorter.sort(fileNameArray)
    .then(async () => {
      const actualBasename = path.basename(inputFileName);
      const actualOutputFileName = getActualOutputFileName(actualBasename);
      const expectedOutputFileName = path.format({
        dir: path.dirname(inputFileName),
        base: 'expected-output.json'
      });
      const actualOutputJsonStr = await readFileAsync(actualOutputFileName, 'utf8');
      const expectedOutputJsonStr = await readFileAsync(expectedOutputFileName, 'utf8');
      // console.log('actualOutputFileName', actualOutputFileName);
      // console.log('expectedOutputFileName', expectedOutputFileName);
      expect(actualOutputJsonStr).toBe(expectedOutputJsonStr);
      done();
    })
    .catch((err) => {
      done.fail(err);
    });
});

function getActualOutputFileName(basename) {
  return path.format({
    dir: path.resolve(opt.outputDir),
    base: basename
  });
}
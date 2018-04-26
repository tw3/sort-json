const minimist = require('minimist');

const JsonSorter = require('./json-sorter');

const minimistConfig = {
  alias: {
    D: 'debug',
    G: 'glob',
    O: 'outputDir'
  }
}

function main() {
  const args = minimist(process.argv.slice(2), minimistConfig);
  const jsonSorter = new JsonSorter();

  const debugFlag = !!args.D;
  jsonSorter.setDebugFlag(debugFlag);

  if (!!args.G) {
    if (args.G === true) {
      console.error('Glob is missing.');
      return;
    }
    jsonSorter.setFileGlob(args.G);
  }
  
  if (!!args.O) {
    if (args.O === true) {
      console.error('Output directory is missing.');
      return;
    }
    jsonSorter.setOutputDir(args.O);
  }
  
  const fileNameArray = args._;
  const hasInputFileNames = (fileNameArray.length > 0);
  if (!hasInputFileNames) {
    console.error('Please specify one or more JSON files or directories to sort');
    console.error('node sort-json <fileOrFolder> [-D] [-G glob] [-O outputDir]')
    return;
  }

  jsonSorter.sort(fileNameArray)
    .then(() => {
      // console.log('Done');
    })
    .catch((err) => {
      console.error('Error:', err);
    });
}

main();

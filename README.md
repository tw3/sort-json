sort-json
---------
Sorts the attributes in a JSON file

Pre-requisites
--------------

Node.js version 8 or higher

Installation
------------
```
git clone https://github.com/tw3/sort-json.git
cd sort-json
npm install
```

CLI usage
---------

`node sort-json [-D] [-G glob] [-O outputDir] <inputFileOrDir1> [<inputFileOrDir2> ...]`

`-D` or `--debug` to output the sorted JSON to stdout and not write to file

`-G` or `--glob` to update the glob/pattern of files to use for directory updates, by default it look look for all files with a .json suffix ("*.json")

`-O` or `--outputDir` to specify the directory for the sorted JSON file, by default the input file will get overwritten

For example:

`node sort-json -G "*.txt" -O my-output-files my-input-files json1.json`

... will sort the file json1.json plus all of the "*.txt" files in the "my-input-files" directory and output the sorted JSON files in the "my-output-files" directory.

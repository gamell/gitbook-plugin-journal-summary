const fs = require('fs');
const glob = require('glob');
const path = require('path');
const moment = require('moment');
const Parser = require('markdown-parser');
const parser = new Parser();

// Globals

let rootPath = '';

// For testing purposes
global.pluginRoot = path.resolve(__dirname);

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, result) => {
      if (err) return reject(err);
      resolve({contents: result, filePath});
    });
  });
};

function parse({contents, filePath}) {
  return new Promise((resolve, reject) => {
    parser.parse(contents, (err, parsed) => {
      if (err) return reject(err);
      resolve({parsed, filePath});
    });
  });
};

function getTitle({parsed, filePath}) {
  let title = '';
  if ( parsed.headings.length ) {
    title = parsed.headings[0].trim();
  }
  return Promise.resolve({title, filePath});
};

function twoDigitize(i) {
  return ('0' + i).slice(-2);
};

function getEntry({title, filePath}) {
  let fileName = path.parse(filePath).name;
  let date = moment(fileName);
  console.log(`DATE: ${date}`);
  const entry = {
    year: date.year().toString(),
    month: twoDigitize(date.month() + 1),
    day: twoDigitize(date.date()),
    title,
    filePath
  };
  return Promise.resolve(entry);
};

function processFile(filePath) {
  return readFile(`${rootPath}/${filePath}`)
    .then(parse)
    .then(getTitle)
    .then(getEntry)
    .catch((reason) => {
      throw reason;
    });
};

function buildTree(prev, curr) {
  return prev.then((tree) =>
    curr.then(({year, month, day, title, filePath}) => {
      tree[year] = tree[year] || {title: year, filePath: ''};
      tree[year][month] = tree[year][month] || {title: month, filePath: ''};
      tree[year][month][day] = {title, filePath};
      return tree;
    })
  );
};

function generateSummaryTree() {
  return new Promise((resolve, reject) => {
    glob(
      `*/**/*.md`,
      {cwd: rootPath, ignore: ['node_modules/**']},
      (err, files) => {
        if (err) return reject(err);
        return files.map(processFile)
          .reduce(buildTree, Promise.resolve({}))
          .then(resolve);
    });
  });
};

function printTree(summaryTree, depth = 1) {
  const node = Object.entries(summaryTree)[0]; // unwrap outer array
  const root = node.shift(); // get first element of the array
  const res = `${Array(depth).join('  ')}- [${root.title}](${root.filePath || ''})\n`;
  node.forEach((children) => { // for each children of the node, we repeat
    res += printTree(children, res, depth + 1);
  });
  return res;
};

async function init() {
  const bookTitle = this.config.get('title');
  const summaryFilename = this.config.get('structure.summary');
  rootPath = this.resolve('');
  // readmeFilename = this.config.get('structure.readme');

  summaryTree = await generateSummaryTree();
  console.log(`SUMMARY TREE: \n\n${JSON.stringify(summaryTree, null, 2)}`);
  const summary = ( bookTitle ? `# ${bookTitle}\n\n` : '' ) + printTree(summaryTree);
  fs.writeFileSync( `${rootPath}/${summaryFilename}`, summary, 'utf8');
  console.log(`\x1b[36mgitbook-plugin-journal-summary: \x1b[32m${summaryFilename} generated successfully.`);
  return 0;
};

module.exports = {hooks: {'init': init}};

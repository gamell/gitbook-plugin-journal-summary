const fs = require('fs');
const glob = require('glob');
const path = require('path');
const Parser = require('markdown-parser');
const parser = new Parser();

// Globals

let rootPath = '';
let readmeFilename = '';
let summary = '';

// For testing purposes
global.pluginRoot = path.resolve(__dirname);

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, result) => {
      if (err) return reject(err);
      resolve({ contents: result, filePath });
    });
  })
};

function parse({ contents, filePath }) {
  return new Promise((resolve, reject) => {
    parser.parse(contents, (err, parsed) => {
      if (err) return reject(err);
      resolve({ parsed, filePath });
    });
  });
};

function getTitle({ parsed, filePath }) {
  let title = '';
  if ( parsed.headings.length ) {
    title = parsed.headings[0].trim()
  }
  return Promise.resolve({ title, filePath });
};

function getSummaryEntry({ title, filePath }){
  let depth = filePath.match(/\//g).length;
  if (filePath.indexOf(readmeFilename) === -1) {
    depth++;
  }
  const summaryEntry = `${Array(depth).join('    ')}- [${title}](${filePath})\n`
  return Promise.resolve(summaryEntry);
};

function processFile(filePath) {
  return readFile(`${rootPath}/${filePath}`)
    .then(parse)
    .then(getTitle)
    .then(getSummaryEntry)
    .catch((reason) => {
      console.error(reason);
      throw reason;
    });
};

function asyncAppend(prev, curr){
  return prev.then((s0) => curr.then((s1) => s0 + s1));
}

function generateSummary() {
  return new Promise((resolve, reject) => {
    glob(`*/**/*.md`, { cwd: rootPath, ignore: ['node_modules/**'] }, (err, files) => {
      if (err) return reject(err);
      return files
        .map(processFile)
        .reduce(asyncAppend, Promise.resolve('')) // initial value
        .then(resolve);
    });
  });
};

async function init() {
  const bookTitle = this.config.get('title');
  const summaryFilename = this.config.get('structure.summary');
  rootPath = this.resolve('');
  readmeFilename = this.config.get('structure.readme');

  summary = ( bookTitle ? `# ${bookTitle}\n\n` : '' );
  summary += await generateSummary();
  fs.writeFileSync( `${rootPath}/${summaryFilename}`, summary, 'utf8');
  console.log(`\x1b[36mgitbook-plugin-journal-summary: \x1b[32m${summaryFilename} generated successfully.`);
  return 0;
}

module.exports = { hooks: { "init": init } };

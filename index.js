const fs = require('fs');
const glob = require('glob');
const path = require('path');
// const Parser = require('markdown-parser');
// const marked = require('marked');
const md = require('markdown');

// For testing purposes
global.pluginRoot = path.resolve(__dirname);
console.log(`**** pluginRoot = ${global.pluginRoot}`)

let readmeFilename = '';
let summary = '';

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, result) => {
      if (err) return reject(err);
      resolve({contents: result, filePath});
    });
  })
};

function parse({contents, filePath}) {
  return Promise.resolve({parsed: md.renderJsonML(markdownString), filePath});
};

function getTitle({parsed, filePath}) {
  console.log(`PARSED: ${parsed}`);
  // if ( result.headings.length ) {
  //   const fileTitle = result.headings[0].trim()
  // }
  const title = "TEST!"
  return Promise.resolve({title, filePath});
};

function getSummaryEntry({title, filePath}){
  let depth = filePath.match(/\//g).length
  if ( filePath.indexOf( readmeFilename ) == -1 ) {
    depth++;
  }

  return `${Array(depth).join('    ')}- [${title}](${filePath})\n`
};

function processFile(filePath) {
  return readFile(`${root}/${filePath}`).then(parse).then(getTitle).then(getSummaryEntry);
};

function generateSummary() {
  let result = '';
  return new Promise((resolve, reject) => {
    glob(`*/**/*.md`, { cwd: root, ignore: ['node_modules/**'] }, (err, files) => {
      if (err) return reject(err);
      files.forEach((file) => {
        result += processFile(file);
      });
      resolve(result);
    });
  });
};

async function init() {
  const root = this.resolve('');
  const bookTitle = this.config.get('title');
  const summaryFilename = this.config.get('structure.summary');
  readmeFilename = this.config.get('structure.readme');

  summary = ( bookTitle ? `# ${bookTitle}\n\n` : '' )
  summary += await generateSummary();
  fs.writeFileSync( `${root}/${summaryFilename}`, summary, 'utf8');
  console.log(`\x1b[36mgitbook-plugin-journal-summary: \x1b[32m${summaryFilename} generated successfully.`);
}

module.exports = { hooks: { "init": init } };

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const moment = require('moment');
const Parser = require('markdown-parser');
const TreeModel = require('tree-model');
const parser = new Parser();
const tree = new TreeModel();
const treeLevels = ['year', 'month', 'day'];

// Globals

let rootPath = '';

// Get from config later

const config = {generateReadmes: true};

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
  if (parsed.headings.length) {
    title = parsed.headings[0].trim();
  }
  return Promise.resolve({title, filePath});
};

function getName(entry) {
  // TODO: Allow config for more title formats
  return `${entry.day} - ${entry.title}`;
};

function getEntry({title, filePath}) {
  let fileName = path.parse(filePath).name;
  // TODO: Catch and throw away non-date files
  let date = moment(fileName);
  const entry = {
    year: date.format('YYYY'),
    month: date.format('MMMM'), // TODO: Make customizable
    day: date.format('Do'),
    filePath: filePath.replace(rootPath, ''),
    title
  };
  entry.name = getName(entry);
  return Promise.resolve(entry);
};

function processFile(filePath) {
  return readFile(`${rootPath}/${filePath}`)
    .then(parse)
    .then(getTitle)
    .then(getEntry)
    .catch((reason) => {
      console.error(reason);
      throw reason;
    });
};

function insert(root, entry) {
  const {year, month} = entry;
  entry.level = 2;
  const strategy = {strategy: 'breadth'};
  let yearNode = root.first(strategy, (n) => n.model.year === year);
  if (!yearNode) yearNode = root.addChild(tree.parse({name: year, level: 0}));
  let monthNode = yearNode.first(strategy, (n) => n.model.month === month);
  if (!monthNode) monthNode = yearNode.addChild(tree.parse({name: month, level: 1}));
  monthNode.addChild(tree.parse(entry));
  return root;
};

function addToTree(prev, curr) {
  return prev.then((root) =>
    curr.then((entry) =>
      insert(root, entry)
    )
  );
};

function buildTree() {
  return new Promise((resolve, reject) => {
    glob(
      `*/**/*.md`,
      {cwd: rootPath, ignore: ['node_modules/**']},
      (err, files) => {
        if (err) return reject(err);
        const root = tree.parse({name: 'root', children: []});
        return files.map(processFile)
          .reduce(addToTree, Promise.resolve(root))
          .then(resolve, reject);
    });
  });
};

function printTree(root) {
  let res = '';
  root.walk((node) => {
    if (!node.isRoot()) {
      node = node.model;
      const indentation = '  '.repeat(node.level);
      res += `${indentation}- [${node.name}](${node.filePath || ''})\n`;
    }
  });
  return res;
};

function maybeGenerateReadmes(root) {
  return;
};

function generateSummary(root) {
  const bookTitle = this.config.get('title');
  const summaryFilename = this.config.get('structure.summary');
  let summary = ( bookTitle ? `# ${bookTitle}\n\n` : '' );
  summary += printTree(root);
  fs.writeFileSync( `${rootPath}/${summaryFilename}`, summary, 'utf8');
  console.log(`\x1b[36mgitbook-plugin-journal-summary: \x1b[32m${summaryFilename} generated successfully.`);
};

async function init() {
  rootPath = this.resolve('');
  const root = await buildTree();
  await Promise.all([maybeGenerateReadmes(root), generateSummary.call(this, root)]);
  return 0;
};

module.exports = {hooks: {'init': init}};

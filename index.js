const fs = require('fs');
const glob = require('glob');
const path = require('path');
const moment = require('moment');
const Parser = require('markdown-parser');
const TreeModel = require('tree-model');
const parser = new Parser();
const tree = new TreeModel();

// Globals

let rootPath = '';
let summaryFilename = '';

// TODO: Get from config later
const GENERATE_ALL = true;
// const GENERATE_READMES = this.config.get('journal-summary.generateAll');
const cache = {};
const generatedSummaries = [];

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

function getReadmeLink(year, month) {
  if (GENERATE_ALL) {
    let link = `${year}`;
    if (!!month) link += `-${month}`;
    link += '.md';
    return link;
  }
  return '';
}

function insert(root, entry) {
  const {year, month} = entry;
  entry.level = 2;
  const strategy = {strategy: 'breadth'};
  let yearNode = root.first(strategy, (n) => n.model.year === year);
  if (!yearNode) {
    yearNode = root.addChild(tree.parse({
      name: year,
      filePath: getReadmeLink(year),
      level: 0
    }));
  }
  let monthNode = yearNode.first(strategy, (n) => n.model.month === month);
  if (!monthNode) {
    monthNode = yearNode.addChild(tree.parse({
      name: month,
      filePath: getReadmeLink(year, month),
      level: 1
    }));
  }
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
        const root = tree.parse({
          name: 'root',
          children: [],
          filePath: `${rootPath}/${summaryFilename}`
        });
        return files.map(processFile)
          .reduce(addToTree, Promise.resolve(root))
          .then(resolve, reject);
    });
  });
};

function walkTreeFrom(n) {
  let res = '';
  pendingSummaries = [];
  // synchronously walk the whole tree
  n.walk((node) => {
    if (!node.isRoot()) {
      const data = node.model;
      if (cache[data.name]) res += cache[data.name];
      else {
        // will only execut this code ONCE, as the following executions will be cached
        // month or year level AND generateReadmes
        if (node.level < 2 && GENERATE_ALL) {
          pendingSummaries.push(node);
        }
        const data = node.model;
        const indentation = '  '.repeat(data.level);
        const link = data.filePath;
        res += `${indentation}- [${data.name}](${link})\n`;
        cache[data.name] = res;
      }
    }
  });
  // we call generateSummaries for each of the pending ones
  return res;
}

function generateSummary(node) {
  return new Promise((resolve, reject) => {
    if (generatedSummaries[node.model.filePath]) return;
    const data = node.model;
    const title = node.isRoot() ? this.config.get('title') : data.name;
    let summary = ( title ? `# ${title}\n\n` : '' );
    summary += walkTreeFrom(node);
    console.log(`Writing to ${data.filePath}, content: ${summary}`);
    fs.writeFileSync(data.filePath, summary, 'utf8');
    generatedSummaries[node.model.filePath] = true;
    resolve(node);
    console.log(`\x1b[36mgitbook-plugin-journal-summary: \x1b[32m${summaryFilename} generated successfully.`);
  });
};

function generatePendingSummaries() {
  if (pendingSummaries.length = 0) return;
  return Promise.all(pendingSummaries.map(generateSummary))
    .then(generatePendingSummaries);
}

async function init() {
  rootPath = this.resolve('');
  summaryFilename = this.config.get('structure.summary');
  const root = await buildTree();
  pendingSummaries = [generateSummary.call(this, root)];
  await generatePendingSummaries();
  return 0;
};

module.exports = {hooks: {'init': init}};

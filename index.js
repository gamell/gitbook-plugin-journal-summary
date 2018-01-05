const fs = require('fs');
const glob = require('glob');
const path = require('path');
const moment = require('moment');
const Parser = require('markdown-parser');
const TreeModel = require('tree-model');
const parser = new Parser();
const tree = new TreeModel();

// Globals
let ROOT_PATH = '';
// TODO: Get from config later
let GENERATE_ALL;


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
    uri: filePath.replace(ROOT_PATH, ''),
    filePath,
    title
  };
  entry.name = getName(entry);
  return Promise.resolve(entry);
};

function processFile(filePath) {
  return readFile(`${ROOT_PATH}/${filePath}`)
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
    let uri = getReadmeLink(year);
    yearNode = root.addChild(tree.parse({
      name: year,
      title: year,
      filePath: `${ROOT_PATH}/${uri}`,
      uri,
      level: 0
    }));
  }
  let monthNode = yearNode.first(strategy, (n) => n.model.month === month);
  if (!monthNode) {
    let uri = getReadmeLink(year, month);
    monthNode = yearNode.addChild(tree.parse({
      name: month,
      title: `${month} ${year}`,
      filePath: `${ROOT_PATH}/${uri}`,
      uri,
      level: 1
    }));
  }
  monthNode.addChild(tree.parse(entry));
  return Promise.resolve(root);
};

function addToTree(prev, curr) {
  return prev.then((root) =>
    curr.then((entry) =>
      insert(root, entry)
    )
  );
};

function buildTree(rootSummaryFilename) {
  return new Promise((resolve, reject) => {
    glob(
      `*/**/*.md`,
      {cwd: ROOT_PATH, ignore: ['node_modules/**', '_book/**']},
      (err, files) => {
        if (err) return reject(err);
        const root = tree.parse({
          name: 'root',
          children: [],
          filePath: `${ROOT_PATH}/${rootSummaryFilename}`,
          uri: rootSummaryFilename
        });
        return files.map(processFile)
          .reduce(addToTree, Promise.resolve(root))
          .then(resolve, reject);
    });
  });
};

function getLine(ind, name, uri) {
  return `${ind}- [${name}](${uri})\n`;
}

function getSummaryFrom(n, mainSummary) {
  let summary = '';
  const queue = [];
  let maxDepth = 0;
  // synchronously walk the whole tree
  n.walk((node) => {
    if (node.isRoot()) return true;
    const data = node.model;
    let indentation = '';
    if (mainSummary) {
      if (data.level < 2 && GENERATE_ALL) queue.push(node);
      indentation = '  '.repeat(data.level);
    } else {
      // prevent visiting other nodes from the tree that we do not need to visit if we are building a summary file for a Month
      if (data.level < maxDepth && n.model.level > 0) return false;
      let level = data.level - n.model.level;
      indentation = '  '.repeat(level);
      maxDepth = data.level;
      if (level === 0) return true; // skip this level as it will already be in the title, but continue walking the tree
    }
    summary += getLine(indentation, data.name, data.uri);
  });
  return {summary, queue};
}

function writeSummaries(node, isRoot = false, title = '') {
  const data = node.model;
  title = !!title ? title : data.title;
  let {summary, queue} = getSummaryFrom(node, isRoot);
  summary = ( title ? `# ${title}\n\n` : '' ) + summary;
  console.log(`Writing to ${data.filePath}, content: ${summary}`);
  fs.writeFileSync(data.filePath, summary, 'utf8');
  console.log(`\x1b[36mgitbook-plugin-journal-summary: \x1b[32m${data.filePath} generated successfully.`);
  // if we also want to generate the mid-layer summaries, process the queue. Only called once
  if (isRoot && queue.length > 0 && GENERATE_ALL) {
    queue.forEach((node) => writeSummaries(node));
  }
};

async function init() {
  ROOT_PATH = this.resolve('');
  GENERATE_ALL = this.config.get('pluginsConfig.journal-summary.generateAll');
  debugger;
  const rootSummaryFilename = this.config.get('structure.summary');
  const root = await buildTree(rootSummaryFilename);
  writeSummaries(root, true, this.config.get('title'));
  return 0;
};

module.exports = {hooks: {init}};

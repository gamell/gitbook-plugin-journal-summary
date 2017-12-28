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
const GENERATE_ALL = true;
// const GENERATE_READMES = this.config.get('journal-summary.generateAll');
const CACHE = {};

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
    relativeFilePath: filePath.replace(ROOT_PATH, ''),
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
    let relativeFilePath = getReadmeLink(year);
    yearNode = root.addChild(tree.parse({
      name: year,
      filePath: `${ROOT_PATH}/${relativeFilePath}`,
      relativeFilePath,
      level: 0
    }));
  }
  let monthNode = yearNode.first(strategy, (n) => n.model.month === month);
  if (!monthNode) {
    let relativeFilePath = getReadmeLink(year, month);
    monthNode = yearNode.addChild(tree.parse({
      name: month,
      filePath: `${ROOT_PATH}/${relativeFilePath}`,
      relativeFilePath,
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

function buildTree(rootSummaryFilename) {
  return new Promise((resolve, reject) => {
    glob(
      `*/**/*.md`,
      {cwd: ROOT_PATH, ignore: ['node_modules/**']},
      (err, files) => {
        if (err) return reject(err);
        const root = tree.parse({
          name: 'root',
          children: [],
          filePath: `${ROOT_PATH}/${rootSummaryFilename}`,
          relativeFilePath: rootSummaryFilename
        });
        return files.map(processFile)
          .reduce(addToTree, Promise.resolve(root))
          .then(resolve, reject);
    });
  });
};

function getSummaryFrom(n) {
  let summary = '';
  const queue = [];
  // synchronously walk the whole tree
  n.walk((node) => {
    if (!node.isRoot()) {
      const data = node.model;
      if (CACHE[data.name]) {
        summary = CACHE[data.name];
      } else {
        // will only execut this code ONCE, as the following executions will be cached
        // month or year level AND generate summaries
        if (data.level < 2 && !node.isRoot() && GENERATE_ALL) {
          queue.push(node);
        }
        const indentation = '  '.repeat(data.level);
        const link = data.relativeFilePath;
        summary += `${indentation}- [${data.name}](${link})\n`;
        CACHE[data.name] = summary;
      }
    }
  });
  return {summary, queue};
}

function writeSummaries(node, isRoot = false) {
  return new Promise((resolve, reject) => {
    // if (generatedSummaries[node.model.filePath]) return;
    const data = node.model;
    const title = isRoot ? this.config.get('title') : data.name;
    let {summary, queue} = getSummaryFrom(node);
    debugger;
    summary = ( title ? `# ${title}\n\n` : '' ) + summary;
    console.log(`Writing to ${data.filePath}, content: ${summary}`);
    fs.writeFileSync(data.filePath, summary, 'utf8');
    // generatedSummaries[node.model.filePath] = true;
    console.log(`\x1b[36mgitbook-plugin-journal-summary: \x1b[32m${data.filePath} generated successfully.`);
    // if we also want to generate the mid-layer summaries, process the queue. Only called once
    if (isRoot && queue.length > 0 && GENERATE_ALL) {
      Promise.all(queue.map(writeSummaries)).then(resolve, reject);
    } // else
    resolve();
  });
};

async function init() {
  ROOT_PATH = this.resolve('');
  const rootSummaryFilename = this.config.get('structure.summary');
  const root = await buildTree(rootSummaryFilename);
  // generate initial summary from node (will write SUMMARY.md)
  await writeSummaries.call(this, root, true);
  return 0;
};

module.exports = {hooks: {'init': init}};

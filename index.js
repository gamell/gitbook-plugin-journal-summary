const fs = require('fs');
const glob = require('glob');
const path = require('path');
// const Parser = require('markdown-parser');
// const marked = require('marked');
const md = require('markdown');

// For testing purposes
global.pluginRoot = path.resolve(__dirname);

let readmeFilename = '';
let summary = '';

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile('path', 'utf8', (err, result) => {
      if (err) return reject(err);
      resolve({contents: result, filePath});
    });
  })
}

function parse({contents, filePath}) {
  return Promise.resolve({parsed: md.renderJsonML(markdownString), filePath});
}

function getTitle({parsed, filePath}) {
  console.log(`PARSED: ${parsed}`);
  // if ( result.headings.length ) {
  //   const fileTitle = result.headings[0].trim()
  // }
  const title = "TEST!"
  return Promise.resolve({title, filePath});
}

function getSummaryEntry({title, path}){
  let depth = path.match(/\//g).length
  if ( path.indexOf( readmeFilename ) == -1 ) {
    depth++;
  }

  return `${Array(depth).join('    ')}- [${title}](${path})\n`
}

function processFile(filePath) {
  return readFile(`${root}/${filePath}`).then(parse).then(getTitle).then(getSummaryEntry);
}

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
}

function async init() {
  const root = this.resolve('');
  const bookTitle = this.config.get('title');
  const summaryFilename = this.config.get('structure.summary');
  readmeFilename = this.config.get('structure.readme');

  summary = ( bookTitle ? `# ${bookTitle}\n\n` : '' )
  summary += await generateSummary();
  fs.writeFileSync( `${root}/${summaryFilename}`, summary, 'utf8');
  console.log(`\x1b[36mgitbook-plugin-journal-summary: \x1b[32m${summaryFilename} generated successfully.`);
}

module.exports = { hooks: { init } };


// const fs = require('fs'),
//       glob = require('glob'),
//       path = require('path'),
//       Parser = require('markdown-parser')
//
// function generateEntry( title, path, readmeFilename ) {
//   let depth = path.match(/\//g).length
//
//   if ( path.indexOf( readmeFilename ) == -1 )
//     depth++
//
//   return `${Array(depth).join('    ')}- [${title}](${path})\n`
// }
//
// module.exports = {
//   hooks: {
//     init: function () {
//       const parser = new Parser(),
//             root = this.resolve(''),
//             bookTitle = this.config.get('title'),
//             readmeFilename = this.config.get('structure.readme'),
//             summaryFilename = this.config.get('structure.summary')
//
//       let ret = Promise.resolve(),
//           summaryContent = ( bookTitle ? `# ${bookTitle}\n\n` : '' )
//
//       glob(
//         `*/**/*.md`,
//         {
//           cwd: root,
//           ignore: ['node_modules/**']
//         },
//         ( err, files ) => {
//           files.forEach( ( filePath ) => {
//             ret = ret.then(
//               () => {
//                 return new Promise(
//                   ( resolve, reject ) => {
//                     parser.parse(
//                       fs.readFileSync( `${root}/${filePath}`, { encoding: 'utf8' } ),
//                       ( err, result ) => {
//                         if ( result.headings.length ) {
//                           const fileTitle = result.headings[0].trim()
//
//                           summaryContent += generateEntry( fileTitle, filePath, readmeFilename )
//                         }
//
//                         resolve()
//                       }
//                     )
//                   }
//                 )
//               }
//             )
//           })
//
//           ret = ret.then(
//             () => {
//               fs.writeFileSync( `${root}/${summaryFilename}`, summaryContent, { encoding: 'utf8' } )
//
//               console.log(`\x1b[36mgitbook-plugin-summary: \x1b[32m${summaryFilename} generated successfully.`)
//
//               return Promise.resolve()
//             }
//           )
//         }
//       )
//
//       return ret;
//     }
//   }
// }

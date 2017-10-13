const fs = require('fs');
const glob = require('glob');
const path = require('path');
// const Parser = require('markdown-parser');
const marked = require('marked');

const parser;
const root = '';
const bookTitle = '';
const readmeFile = '';
const summaryFile = '';

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile('path', 'utf8', (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  })
}

function trim(data) {
  if ( result.headings.length ) {
    const fileTitle = result.headings[0].trim()
    summaryContent += generateEntry( fileTitle, filePath, readmeFilename )
  }
}

function parse(data) {
  return new Promise((resolve, reject) => {
    parser.parse()
  })
}

function parseFile(file) {
  return new Promise((resolve, reject) =>
    readFile(`${root}/${file}`).then(parse).then(trim);



        resolve()
  );
}

function processFiles(err, files) {
  files.forEach((file) => )
}

function init() {
  parser = new Parser();
  root = this.resolve('');
  bookTitle = this.config.get('title');
  readmeFilename = this.config.get('structure.readme');
  summaryFilename = this.config.get('structure.summary');

  glob(`*/**/*.md`, { cwd: root, ignore: ['node_modules/**'] }, processFiles);
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

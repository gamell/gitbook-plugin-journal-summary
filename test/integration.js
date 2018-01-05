const tester = require('gitbook-tester');
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const journalSummary = require('../index.js');
const fs = require('fs');
const {execSync} = require('child_process');

const pluginRoot = global.pluginRoot;

chai.use(chaiAsPromised);
const assert = chai.assert;

describe('Individual entry journal', function() {
  this.timeout(200000);
  let summaryFile
  let htmlFile;
  before(function(done) {
    tester.builder()
      .withBookJson({
        title: 'Individual entries for each day journal',
        author: 'tester',
        gitbook: '>=3.0.0',
        pluginsConfig: {
          'journal-summary': {
            generateAll: true
          }
        }
      })
      .withLocalPlugin(require('path').join(__dirname, '..')) // parent dir
      .withFile('README.md', 'Individual entries test book')
      .withFile('2016/2016-05/2016-05-01.md', '2016-05-01 Diary Entry')
      .withFile('2017/2017-09/2017-09-10.md', '2017-09-10 Diary Entry')
      .withFile('2017/2017-09/2017-09-11.md', '2017-09-11 Diary Entry')
      .withFile('2017/2017-10/2017-10-01.md', '2017-10-01 Diary Entry')
      .withFile('2017/2017-10/2017-10-05.md', '2017-10-05 Diary Entry')
      .create()
      .then(function(result) {
        console.log(result[0].content);
        debugger;
        summaryFile = result.get('SUMMARY.md').content;
        htmlFile = result.get('index.html');
      }).fin(done).done();
  });

  describe('Summary File', function() {
    it('Should contain 5 lines', function() {
      const lines = summaryFile.split('\n').length;
      assert.equal(lines, 8, 'Number of lines is equal');
    });
    it('Should contain 2016 as level', function() {
      assert.include(summaryFile, `- [2016](${bookSrc}/2016/)`, 'Contains year as level');
    });
    it('Should contain 2017 as level', function() {
      assert.include(summaryFile, `- [2017](${bookSrc}/2017/)`, 'Contains year as level');
    });
  });
});

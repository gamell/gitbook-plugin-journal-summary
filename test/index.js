const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
// const sinon = require('sinon');
const journalSummary = require('../index.js');
const fs = require('fs');
const {execSync} = require('child_process');

const pluginRoot = global.pluginRoot;

chai.use(chaiAsPromised);
const assert = chai.assert;

describe('Individual entry journal', function() {
  const bookSrc = `${pluginRoot}/test/fixtures/individual-entries-journal`;
  const map = {
    'title': 'Test Book',
    'structure.summary': `SUMMARY.md`,
    'structure.readme': `README.md`,
  };
  const fakeContext = {
    resolve: (_) => bookSrc,
    config: {
      get: (key) => map[key]
    }
  };

  function cleanUp() {
    console.log('*** Cleaning up ***');
    execSync(`rm -rf SUMMARY.md`, {cwd: bookSrc});
  }

  describe('Return value', function() {

    after(cleanUp);

    it('Should eventually return 0', function(done) {
      const res = journalSummary.hooks.init.apply(fakeContext);
      assert.eventually.equal(res, 0, 'Returns zero').catch((e) => {
        throw e;
      }).then(done);
    });
  });

  describe('Summary File', function() {

    let summaryFile;

    before(function() {
      // we return a promise so mocha will know when the `before` has actually finished
      execSync(`rm -rf SUMMARY.md`, {cwd: bookSrc});
      return journalSummary.hooks.init.apply(fakeContext).then((_) => {
        summaryFile = fs.readFileSync(`${bookSrc}/SUMMARY.md`, 'utf-8');
      });
    });

    after(cleanUp);

    it('Sould contain the title as the first line', function() {
      assert(summaryFile.indexOf('# Test Book') === 0, 'Has title in first line');
    });
    it('Should contain 13 lines', function() {
      const lines = summaryFile.split('\n').length;
      assert.equal(lines, 13, 'Number of lines is equal');
    });
    it('Should contain 2016 and 2017 as levels', function() {
      assert.include(summaryFile, '- [2016]()\n  - [May]()', 'Contains year as level');
      assert.include(summaryFile, '- [2017]()\n  - [September]()', 'Contains year as level');
    });
    it('Should contain a link to 2016-05-01.md with the correct indentation', function() {
      assert.include(summaryFile, '    - [1st - Nice day at the beach](/2016/2016-05/2016-05-01.md)');
    });
    it('Should contain a link to 2017-09-10.md with the correct indentation', function() {
      assert.include(summaryFile, '    - [10th - Had a walk on the mountain](/2017/2017-09/2017-09-10.md)');
    });
    it('Should contain a link to 2017-09-11.md with the correct indentation', function() {
      assert.include(summaryFile, '    - [11th - Last day of vacation](/2017/2017-09/2017-09-11.md)');
    });
    it('Should contain a link to 2017-10-01.md with the correct indentation', function() {
      assert.include(summaryFile, '    - [1st - I am running out of ideas for the book](/2017/2017-10/2017-10-01.md)');
    });
    it('Should contain a link to 2017-10-05.md with the correct indentation', function() {
      assert.include(summaryFile, '    - [5th - Nice weather in the city](/2017/2017-10/2017-10-05.md)');
    });
  });

});

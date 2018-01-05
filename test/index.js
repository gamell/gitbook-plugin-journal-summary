

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
  const bookSrc = `${pluginRoot}/test/fixtures/individual-entries-journal-with-summaries`;
  const map = {
    'title': 'Test Book',
    'structure.summary': `SUMMARY.md`,
    'structure.readme': `README.md`,
    'pluginsConfig': {
      "journal-summary": {
        "generateAll": true
      }
    }
  };
  const fakeContext = {
    resolve: (_) => bookSrc,
    config: {
      get: (key) => map[key]
    }
  };

  function cleanup() {
    console.log('*** Cleaning up ***');
    execSync(
      `rm -rf SUMMARY.md 2016.md 2017.md 2016-May.md 2017-September.md 2017-October.md`,
      {cwd: bookSrc}
    );
  }

  describe('Return value', function() {

    after(cleanup);

    it('Should eventually return 0', function(done) {
      const res = journalSummary.hooks.init.apply(fakeContext);
      assert.eventually.equal(res, 0, 'Returns zero').catch((e) => {
        throw e;
      }).then(done).catch((e) => done(e));
    });
  });

  describe('Main summary File', function() {

    let summaryFile;

    before(function() {
      // we return a promise so mocha will know when the `before` has actually finished
      cleanup();
      return journalSummary.hooks.init.apply(fakeContext).then((_) => {
        summaryFile = fs.readFileSync(`${bookSrc}/SUMMARY.md`, 'utf-8');
      });
    });

    // after(cleanUp);

    it('Sould contain the title as the first line', function() {
      assert(summaryFile.indexOf('# Test Book') === 0, 'Has title in first line');
    });
    it('Should contain 13 lines', function() {
      const lines = summaryFile.split('\n').length;
      assert.equal(lines, 13, 'Number of lines is equal');
    });
    it('Should contain 2016 and 2017 as levels', function() {
      assert.include(summaryFile, '- [2016](2016.md)\n  - [May](2016-May.md)', 'Contains year as level');
      assert.include(summaryFile, '- [2017](2017.md)\n  - [September](2017-September.md)', 'Contains year as level');
    });
    it('Should contain 2016 level only once', function() {
      let str = '- [2016]';
      assert(summaryFile.indexOf(str) === summaryFile.lastIndexOf(str), 'Contains 2016 level only once');
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

  describe('Intermediate Summary Files', function() {
    let summaryFile2016;
    let summaryFile2016May;
    let summaryFile2017;
    let summaryFile2017Sept;
    let summaryFile2017Oct;

    before(function() {
      // we return a promise so mocha will know when the `before` has actually finished
      cleanup();
      return journalSummary.hooks.init.apply(fakeContext).then((_) => {
        summaryFile2017Sept = fs.readFileSync(`${bookSrc}/2017-September.md`, 'utf-8');
        summaryFile2017 = fs.readFileSync(`${bookSrc}/2017.md`, 'utf-8');
      });
    });

    // after(cleanup);

    it('2017 Should contain summary for all year', function() { // instead of only info for some months
      assert.include(summaryFile2017, '[September](2017-September.md)');
      assert.include(summaryFile2017, '    - [10th - Had a walk on the mountain](/2017/2017-09/2017-09-10.md)');
      assert.include(summaryFile2017, '[October](2017-October.md)');
      assert.include(summaryFile2017, '    - [5th - Nice weather in the city](/2017/2017-10/2017-10-05.md)');
    });

    it('Year-level summaries shoul not contain other years other than themselves', function() { // instead of only info for some months
      assert.notInclude(summaryFile2017, '2016');
    });

    it('Month-level summaries should contain only the days for that month', function() { // instead of only info for some months
      assert.notInclude(summaryFile2017Sept, 'October');
      assert.include(summaryFile2017Sept, '  - [10th - Had a walk on the mountain](/2017/2017-09/2017-09-10.md)');
      assert.include(summaryFile2017Sept, '  - [11th - Last day of vacation](/2017/2017-09/2017-09-11.md)');
    });

    it('Year-level summaries should have the year as header', function() { // instead of only info for some months
      assert.include(summaryFile2017, '# 2017');
    });

    it('Month-level summaries should have the month as header', function() { // instead of only info for some months
      assert.include(summaryFile2017Sept, '# September 2017');
    });

  });

});

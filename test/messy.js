const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
// const sinon = require('sinon');
const journalSummary = require('../index.js');
const fs = require('fs');
const {execSync} = require('child_process');
chai.use(chaiAsPromised);
const assert = chai.assert;

function run(bookSrc) {
  const bookJson = {
    'title': 'Test Book',
    'structure.summary': `SUMMARY.md`,
    'structure.readme': `README.md`
  };
  const fakeContext = {
    resolve: (_) => bookSrc,
    config: {
      get: (key) => bookJson[key]
    }
  };

  function cleanup() {
    console.log('*** Cleaning up ***');
    execSync(
      `rm -rf SUMMARY.md summaries`,
      {cwd: bookSrc}
    );
  }

  describe('With generateAll = true (generate intermediate summary files)', function() {
    let summaryFile2016;
    let summaryFile2016May;
    let summaryFile2017;
    let summaryFile2017Sept;
    let summaryFile2017Oct;

    before(function() {
      // we return a promise so mocha will know when the `before` has actually finished
      cleanup();
      bookJson['pluginsConfig'] = {
        'journal': {
          'generateAll': true
        }
      };
      return journalSummary.hooks.init.apply(fakeContext).then((_) => {
        summaryFile = fs.readFileSync(`${bookSrc}/SUMMARY.md`, 'utf-8');
        summaryFile2016 = fs.readFileSync(`${bookSrc}/summaries/2016.md`, 'utf-8');
        summaryFile2016May = fs.readFileSync(`${bookSrc}/summaries/2016-May.md`, 'utf-8');
        summaryFile2017 = fs.readFileSync(`${bookSrc}/summaries/2017.md`, 'utf-8');
        summaryFile2017Sept = fs.readFileSync(`${bookSrc}/summaries/2017-September.md`, 'utf-8');
        summaryFile2017Oct = fs.readFileSync(`${bookSrc}/summaries/2017-October.md`, 'utf-8');
      });
    });

    after(cleanup);

    it('Intermediate summary files should exist', function() {
      const files = [
        summaryFile2016,
        summaryFile2017,
        summaryFile2016May,
        summaryFile2017Sept,
        summaryFile2017Oct
      ];
      files.forEach((s) => assert((typeof s === 'string') && s.length > 0, `File exists and it's not empty`));
    });

    it('Main Summary File should contain 2016 and 2017 as levels', function() {
      assert.include(summaryFile, '- [2016](summaries/2016.md)\n  - [May](summaries/2016-May.md)', 'Contains year as level');
      assert.include(summaryFile, '- [2017](summaries/2017.md)\n  - [September](summaries/2017-September.md)', 'Contains year as level');
    });

    it('2017 Should contain summary for all year', function() { // instead of only info for some months
      assert.include(summaryFile2017, '[September](summaries/2017-September.md)');
      assert.include(summaryFile2017, '    - [10th - Had a walk on the mountain](/2017/2017-09-10.md)');
      assert.include(summaryFile2017, '[October](summaries/2017-October.md)');
      assert.include(summaryFile2017, '    - [5th - Nice weather in the city](/2017-10-05.md)');
    });

    it('Year-level summaries shoul not contain other years other than themselves', function() { // instead of only info for some months
      assert.notInclude(summaryFile2017, '2016');
    });

    it('Month-level summaries should contain only the days for that month', function() { // instead of only info for some months
      assert.notInclude(summaryFile2017Sept, 'October');
      assert.include(summaryFile2017Sept, '  - [10th - Had a walk on the mountain](/2017/2017-09-10.md)');
      assert.include(summaryFile2017Sept, '  - [11th - Last day of vacation](/2017/2017-09/2017-09-11.md)');
    });

    it('Year-level summaries should have the year as header', function() { // instead of only info for some months
      assert.include(summaryFile2017, '# 2017');
    });

    it('Month-level summaries should have the month as header', function() { // instead of only info for some months
      assert.include(summaryFile2017Sept, '# September 2017');
    });

    it('September should go before October', function() { // instead of only info for some months
      assert.include(summaryFile2017, '# 2017\n\n  - [September]');
      assert.include(summaryFile, '- [2017](summaries/2017.md)\n  - [September](summaries/2017-September.md)');
    });
  });
}

module.exports = {run};

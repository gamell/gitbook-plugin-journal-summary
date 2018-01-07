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

  describe('Return value', function() {

    after(cleanup);

    it('Should eventually return 0', function(done) {
      const res = journalSummary.hooks.init.apply(fakeContext);
      assert.eventually.equal(res, 0, 'Returns zero').catch((e) => {
        throw e;
      }).then(done).catch((e) => done(e));
    });
  });

  describe('With generateAll unset (defaults to false)', function() {

    let summaryFile;

    before(function() {
      // we return a promise so mocha will know when the `before` has actually finished
      cleanup();
      return journalSummary.hooks.init.apply(fakeContext).then((_) => {
        summaryFile = fs.readFileSync(`${bookSrc}/SUMMARY.md`, 'utf-8');
      });
    });

    after(cleanup);

    it('Main Summary file should exist', function() {
      assert(typeof summaryFile === 'string' && summaryFile.length > 0);
    });

    it('Intermediate summary files do not exist', function() {
      assert.throws(() => fs.readFileSync(`${bookSrc}/summaries/2016.md`, 'utf-8'));
    });
  });

  describe('With generateAll = false', function() {

    before(function() {
      // we return a promise so mocha will know when the `before` has actually finished
      cleanup();
      bookJson['pluginsConfig'] = {
        'journal': {
          'generateAll': false
        }
      };
      return journalSummary.hooks.init.apply(fakeContext).then((_) => {
        summaryFile = fs.readFileSync(`${bookSrc}/SUMMARY.md`, 'utf-8');
      });
    });

    after(cleanup);

    it('Main Summary file should exist', function() {
      assert(typeof summaryFile === 'string' && summaryFile.length > 0);
    });

    it('Intermediate summary files do not exist', function() {
      assert.throws(() => fs.readFileSync(`${bookSrc}/summaries/2016.md`, 'utf-8'));
    });

    it('Sould contain the title as the first line', function() {
      assert(summaryFile.indexOf('# Test Book') === 0, 'Has title in first line');
    });
    it('Should contain 13 lines', function() {
      const lines = summaryFile.split('\n').length;
      assert.equal(lines, 13, 'Number of lines is equal');
    });
    it('Should contain 2016 and 2017 as levels without links', function() {
      assert.include(summaryFile, '- [2016]()\n  - [May]()', 'Contains year as level');
      assert.include(summaryFile, '- [2017]()\n  - [September]()', 'Contains year as level');
    });
    it('Should contain 2016 level only once', function() {
      let str = '- [2016]';
      assert(summaryFile.indexOf(str) === summaryFile.lastIndexOf(str), 'Contains 2016 level only once');
    });
    it('Should contain a link to 2016-05-01.md with the correct indentation', function() {
      assert.include(summaryFile, '    - [1st - Nice day at the beach]');
    });
    it('Should contain a link to 2017-09-10.md with the correct indentation', function() {
      assert.include(summaryFile, '    - [10th - Had a walk on the mountain]');
    });
    it('Should contain a link to 2017-09-11.md with the correct indentation', function() {
      assert.include(summaryFile, '    - [11th - Last day of vacation]');
    });
    it('Should contain a link to 2017-10-01.md with the correct indentation', function() {
      assert.include(summaryFile, '    - [1st - I am running out of ideas for the book]');
    });
    it('Should contain a link to 2017-10-05.md with the correct indentation', function() {
      assert.include(summaryFile, '    - [5th - Nice weather in the city]');
    });
  });
}

module.exports = {run};

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const journalSummary = require('../index.js');
const fs = require('fs');
const { execSync } = require('child_process');

const pluginRoot = global.pluginRoot;

chai.use(chaiAsPromised);
const assert = chai.assert;

describe('Individual entry journal', function() {
  const bookSrc = `${pluginRoot}/test/fixtures/individual-entries-journal`;
  const map = {
    title: 'Test Book',
    'structure.summary':  `SUMMARY.md`,
    'structure.readme':   `README.md`,
  };
  const fakeContext = {
    resolve: (_) => bookSrc,
    config: {
      get: (key) => map[key]
    }
  };

  describe('Return value', function() {
    it('Should eventually return 0', function() {
      const res = journalSummary.hooks.init.apply(fakeContext);
      assert.eventually.equal(res, 0, "Returns zero");
    });
  });


  describe('Summary File', function() {
    //const summaryFile = fs.readFileSync(`${bookSrc}/SUMMARY.md`, 'utf-8');

    before(function() {
      //execSync(`rm -rf SUMMARY.md`, { cwd: bookSrc });
      return journalSummary.hooks.init.apply(fakeContext);
    });

    after(function() {
      console.log('*** Cleaning up ***');
      //execSync(`rm -rf SUMMARY.md`, { cwd: bookSrc });
    });

    it('Should contain 5 lines', function() {
      const lines = summaryFile.split('\n').length
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

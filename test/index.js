const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const sinon = require('sinon');
const journalSummary = require('../index.js');
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

  before(function(){
    console.log(' *** Cleaning up SUMMARY.md ***');
    execSync(`rm -rf SUMMARY.md`, { cwd: bookSrc });
  });

  it('should run wihtout errors', function() {
    const res = journalSummary.hooks.init.apply(fakeContext);
    assert.eventually.equal(res, 0, "Returns zero");
  });

  describe('Summary File', function() {

  });
});

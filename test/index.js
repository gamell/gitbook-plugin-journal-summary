const { assert } = require('chai');
const sinon = require('sinon');
const journalSummary = require('../index.js');
const pluginRoot = global.pluginRoot;

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

  });
  beforeEach(function(){

  })
  after(function(){
    //exec(`rm -rf ${bookRoot}`, { cwd: bookSrc });
  })
  describe('Summary File', function() {
    it('should run wihtout errors', function() {
      const res = journalSummary.hooks.init.apply(fakeContext);
      assert.equal(res, 0, "Returns zero");
    });
  });
});

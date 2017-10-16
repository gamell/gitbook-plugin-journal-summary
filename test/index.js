const { assert } = require('chai');
const sinon = require('sinon');
const journalSummary = require('../index.js');
const pluginRoot = global.pluginRoot;

describe('Individual entry journal', function() {
  const bookSrc = `${pluginRoot}/test/fixtures/individual-entries-journal`;

  before(function(){

  });
  beforeEach(function(){

  })
  after(function(){
    //exec(`rm -rf ${bookRoot}`, { cwd: bookSrc });
  })
  describe('Summary File', function() {
    it('should run wihtout errors', function() {
      const map = {
        title: 'Test Book',
        'structure.summary': `${bookSrc}/SUMMARY.md`,
        'structure.readme': `${bookSrc}/README.md`,
      };
      const fakeContext = {
        resolve: () => bookSrc,
        config: {
          get: (key) => map[key]
        }
      };

      const res = journalSummary.hooks.init.apply(fakeContext);
      assert.equal(res, 0, "Returns zero");
    });
  });
});

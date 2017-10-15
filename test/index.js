const { assert } = require('chai');
const { execSync } = require('child_process');
const sinon = require('sinon');
const journalSummary = require('../index.js');
const pluginRoot = global.pluginRoot;

// beforeEach(function() {
//   return db.clear()
//     .then(function() {
//       return db.save([tobi, loki, jane]);
//     });
// });

describe('Individual entries', function() {
  const bookRoot = `${pluginRoot}/test/fixtures/individual-entries`;
  before(function(){
    execSync(`${pluginRoot}/node_modules/.bin/gitbook init`, { cwd: bookRoot });
  });
  beforeEach(function(){
    execSync('mkdir node_modules && ln -s ${pluginRoot} ${bookRoot}/node_modules/journal-summary')
    execSync('../node_modules/.bin/gitbook build', { cwd: bookRoot });
  })
  afterEach(function(){
    execSync('rm -rf node_modules', { cwd: bookRoot });
  })
  describe('Summary File', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

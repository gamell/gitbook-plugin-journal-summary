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



describe('Individual entry journal', function() {
  const bookSrc = `${pluginRoot}/test/fixtures/individual-entries-journal`;
  // Temp test folder to avoid infinite dependency loop
  const bookRoot = `/tmp/gitbook-plugin-journal-summary-test`;
  const gitbookBinary = `${pluginRoot}/node_modules/.bin/gitbook`
  function exec(cmd, opts = { cwd: bookRoot }){
    try {
      const output = execSync(cmd, opts);
      console.log(`Executing: \`${cmd}\`\n\n ${output}`);
    } catch(e) {
      //console.log(`Error Executing: \`${cmd}\` \n\n ${JSON.stringify(e, null, 2)}`);
      throw e;
    }
  };
  before(function(){
    exec(`rm -rf ${bookRoot}`, { cwd: bookSrc });
    exec(`cp -R ${bookSrc} ${bookRoot}`, { cwd: bookSrc });
  });
  beforeEach(function(){
    exec(`mkdir node_modules && ln -s ${pluginRoot} ${bookRoot}/node_modules/gitbook-plugin-journal-summary`);
    exec(`${gitbookBinary} build`);
  })
  after(function(){
    //exec(`rm -rf ${bookRoot}`, { cwd: bookSrc });
  })
  describe('Summary File', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

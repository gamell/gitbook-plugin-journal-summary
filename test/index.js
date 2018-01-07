const common = require('./common.js');
const organizedFoldersTests = require('./organized.js');
const messyFoldersTests = require('./messy.js');
const pluginRoot = global.pluginRoot;

describe('With Organized Folder Structure', function() {
  const bookSrc = `${pluginRoot}/test/fixtures/organized-folder-structure`;
  describe('Running common tests', function() {
    common.run(bookSrc);
  });
  describe('Running specific tests', function() {
    organizedFoldersTests.run(bookSrc);
  });
});

describe('With Messy Folder Structure', function() {
  const bookSrc = `${pluginRoot}/test/fixtures/messy-folder-structure`;
  describe('Running common tests', function() {
    common.run(bookSrc);
  });
  describe('Running specific tests', function() {
    messyFoldersTests.run(bookSrc);
  });
});

const assert = require('assert');
const Cache = require('../src/Cache');
const LruAdapter = require('../src/adapters/LruAdapter');

describe('Cache', function() {
  describe('#constructor()', function() {
    it('should create a cache with given adapter', function() {
      const cache = new Cache({
        adapter: 'Lru',
      });
      assert.strictEqual(cache._adapter instanceof LruAdapter, true);
    });
  });
});

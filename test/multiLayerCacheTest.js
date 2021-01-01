const assert = require('assert');
const MultiLayerCache = require('../src/MultiLayerCache');

describe('MultiLayerCache', function() {
  describe('#put()', function() {
    const stack = new MultiLayerCache([
      {
        adapter: 'Lru'
      },
      {
        adapter: 'Lru',
      },
    ]);
    it('should store value to all layers', function() {
      stack.put('key', 'value');
      assert.strictEqual(stack._adapterStack[0].get('key'), 'value');
      assert.strictEqual(stack._adapterStack[1].get('key'), 'value');
      stack._adapterStack[1].put('key', 'value2');
      assert.strictEqual(stack._adapterStack[0].get('key'), 'value');
      assert.strictEqual(stack._adapterStack[1].get('key'), 'value2');
    });
  });

  describe('#get()', function() {
    const stack = new MultiLayerCache([
      {
        adapter: 'Lru'
      },
      {
        adapter: 'Lru',
      },
    ]);
    it('should return the value in correct order', function() {
      stack.put('key', 'value');
      assert.strictEqual(stack.get('key'), 'value');
      stack._adapterStack[1].put('key', 'value2');
      assert.strictEqual(stack.get('key'), 'value');
      stack._adapterStack[0].put('key', 'value3');
      assert.strictEqual(stack.get('key'), 'value3');
    });
  });

  describe('#has()', function() {
    const stack = new MultiLayerCache([
      {
        adapter: 'Lru'
      },
      {
        adapter: 'Lru',
      },
    ]);
    it('should return true for existing keys', function() {
      stack.put('key', 'value');
      assert.strictEqual(stack.has('key'), true);
      stack._adapterStack[0].remove('key');
      assert.strictEqual(stack.has('key'), true);
      stack._adapterStack[1].remove('key');
      assert.strictEqual(stack.has('key'), false);
    });
  });

  describe('#remove()', function() {
    const stack = new MultiLayerCache([
      {
        adapter: 'Lru'
      },
      {
        adapter: 'Lru',
      },
    ]);
    it('should remove from all stack', function() {
      stack.put('key', 'value');
      assert.strictEqual(stack.has('key'), true);
      stack.remove('key');
      assert.strictEqual(stack.has('key'), false);
    });
  });

  describe('#destroy()', function() {
    const stack = new MultiLayerCache([
      {
        adapter: 'Lru'
      },
      {
        adapter: 'Lru',
      },
    ]);
    it('should destroy the whole stack', function() {
      stack.put('key', 'value');
      stack.put('key2', 'value2');
      assert.strictEqual(stack.has('key') && stack.has('key2'), true);
      stack.destroy();
      assert.strictEqual(stack.has('key') && stack.has('key2'), false);
    });
  });
});

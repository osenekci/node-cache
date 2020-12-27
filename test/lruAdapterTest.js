const assert = require('assert');
const LruAdapter = require('../src/adapters/LruAdapter');

describe('LruAdapter', function() {
  describe('#constructor()', function() {
    it('should assign default options', function() {
      const adapter = new LruAdapter();
      assert.strictEqual(adapter._options.maxAge, Infinity);
      assert.strictEqual(adapter._options.maxSize, Infinity);
      assert.strictEqual(adapter._options.updateAgeOnGet, false);
      assert.strictEqual(adapter._options.allowExpired, false);
    });

    it('should override default options', function() {
      const adapter = new LruAdapter({
        maxAge: 3,
        maxSize: 5,
        updateAgeOnGet: true,
        allowExpired: true,
      });
      assert.strictEqual(adapter._options.maxAge, 3);
      assert.strictEqual(adapter._options.maxSize, 5);
      assert.strictEqual(adapter._options.updateAgeOnGet, true);
      assert.strictEqual(adapter._options.allowExpired, true);
    });

    it('should override default options (mixed)', function() {
      const adapter = new LruAdapter({
        maxAge: 3,
        maxSize: 5,
      });
      assert.strictEqual(adapter._options.maxAge, 3);
      assert.strictEqual(adapter._options.maxSize, 5);
      assert.strictEqual(adapter._options.updateAgeOnGet, false);
      assert.strictEqual(adapter._options.allowExpired, false);
    });
  });

  describe('#put()', function() {
    const adapter = new LruAdapter();
    const sym1 = Symbol('sym');
    it('should store all types of values', function() {
      adapter.put('num1', 2);
      adapter.put('str1', 'aaa');
      adapter.put('bool1', true);
      adapter.put('obj1', {test: 1});
      adapter.put('arr1', [1, 2, 3]);
      adapter.put('sym1', sym1);
      assert.strictEqual(Object.keys(adapter._store).length, 6);
    });

    it('should override a value when reset', function() {
      assert.strictEqual(adapter._store.num1.value.data, 2);
      adapter.put('num1', 5);
      assert.strictEqual(adapter._store.num1.value.data, 5);
    });

    it('should not add if value size is more than cache size', function() {
      const a = new LruAdapter({
        maxSize: 3,
      });
      assert.strictEqual(a.put('str', 'aa'), false);
    });
  });

  describe('#has()', function() {
    const adapter = new LruAdapter();
    adapter.put('sym', Symbol('sym'));
    adapter.put('num', 4);
    it('should return true for existing asset', function() {
      assert.strictEqual(adapter.has('sym'), true);
      assert.strictEqual(adapter.has('num'), true);
    });

    it('should return false for non existing asset', function() {
      assert.strictEqual(adapter.has('sym1'), false);
      assert.strictEqual(adapter.has('num1'), false);
    });
  });

  describe('#remove()', function() {
    const adapter = new LruAdapter();
    adapter.put('str', 'aa');
    adapter.put('num', 4);
    it('should remove item successfully', function() {
      const result = adapter.remove('str');
      assert.strictEqual(result, true);
      assert.strictEqual(adapter._store.str, undefined);
      assert.strictEqual(adapter.remove('str'), false);
    });
  });

  describe('#clear()', function() {
    const adapter = new LruAdapter();
    adapter.put('str', 'aa');
    adapter.put('num', 4);
    it('should empty everything', function() {
      assert.strictEqual(Object.keys(adapter._store).length, 2);
      assert.strictEqual(adapter.clear(), true);
      assert.strictEqual(Object.keys(adapter._store).length, 0);
    });
  });

  describe('#get()', function() {
    const adapter = new LruAdapter();
    adapter.put('str', 'aa');
    adapter.put('num', 4);
    it('should return correct values', function() {
      assert.strictEqual(adapter.get('str'), 'aa');
      assert.strictEqual(adapter.get('num'), 4);
    });
    it('should return default value for non existing items', function() {
      assert.strictEqual(adapter.get('str1'), undefined);
      assert.strictEqual(adapter.get('str1', null), null);
    });
  });

  describe('#size()', function() {
    const adapter = new LruAdapter();
    adapter.put('str', 'aa'); // 4
    adapter.put('num', 4); // 8
    adapter.put('obj', {
      str: 'aaa', // 6
    });
    it('should return correct size', function() {
      assert.strictEqual(adapter.getSize(), 18);
    });
    it('should return correct size after deleting a primitive item', function () {
      adapter.remove('str');
      assert.strictEqual(adapter.getSize(), 14);
    });
    it('should return correct size after deleting a object', function () {
      adapter.remove('obj1');
      assert.strictEqual(adapter.getSize(), 14);
    });
  });

  describe(':lifeTime', function() {
    it('should expire after 2 seconds', function(done) {
      const adapter = new LruAdapter({
        maxAge: 5,
      });
      adapter.put('item', 'aaa');
      assert.strictEqual(adapter.get('item'), 'aaa');
      setTimeout(function() {
        assert.strictEqual(adapter.get('item'), undefined);
        done();
      }, 10);
    });

    it('should expire and still be available', function(done) {
      const adapter = new LruAdapter({
        maxAge: 5,
        allowExpired: true,
      });
      adapter.put('item', 'aaa');
      assert.strictEqual(adapter.get('item'), 'aaa');
      setTimeout(function() {
        assert.strictEqual(adapter.get('item'), 'aaa');
        done();
      }, 10);
    });
  });

  describe(':cleanup', function() {
    it('should cleanup after the space is full', function(done) {
      const adapter = new LruAdapter({
        maxSize: 6,
      });
      for (let i = 0; i < 10; i++) {
        adapter.put(`str${i}`, 'a'); // Should be cleaned up after 3rd item
      }
      setTimeout(function() {
        assert.strictEqual(Object.keys(adapter._store).length, 3);
        assert.strictEqual(adapter.get('str9'), 'a');
        assert.strictEqual(adapter.get('str8'), 'a');
        assert.strictEqual(adapter.get('str7'), 'a');
        assert.strictEqual(adapter.get('str6'), undefined);
        assert.strictEqual(adapter.getSize(), 6);
        done();
      }, 0);
    });

    it('should cleanup expired first', function(done) {
      const adapter = new LruAdapter({
        maxSize: 8,
      });
      for (let i = 0; i < 3; i++) {
        adapter.put(`str${i}`, 'a', (10 - i));
      }
      setTimeout(function() {
        adapter.put('str11', 'a');
        assert.strictEqual(Object.keys(adapter._store).length, 4);
        assert.strictEqual(adapter.get('str0'), 'a');
        assert.strictEqual(adapter.get('str1'), 'a');
        assert.strictEqual(adapter.get('str2'), 'a');
        assert.strictEqual(adapter.get('str11'), 'a');
        assert.strictEqual(adapter.get('str3'), undefined);
        done();
      }, 5);
    });

    it('should update age on get', function(done) {
      const adapter = new LruAdapter({
        maxSize: 10,
        updateAgeOnGet: true,
      });
      adapter.put('str', 'a', 5);
      setTimeout(function() {
        adapter._options.allowExpired = true;
        assert.strictEqual(adapter.get('str'), 'a'); // This should update the age
        adapter._options.allowExpired = false;
        adapter.put('str2', 'a');
        assert.strictEqual(adapter.get('str'), 'a');
        done();
      }, 10);
    });
  });
});

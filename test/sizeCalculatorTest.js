const assert = require('assert');
const SizeCalculator = require('../src/utils/SizeCalculator');

describe('SizeCalculator', function() {
  describe('#sizeOf()', function() {
    const calculator = new SizeCalculator();

    it('should return 0 for empty object', function() {
      assert.strictEqual(calculator.sizeOf({}), 0);
    });

    it('should return 0 for empty array', function() {
      assert.strictEqual(calculator.sizeOf([]), 0);
    });

    it('should return 0 for empty string', function() {
      assert.strictEqual(calculator.sizeOf(''), 0);
    });

    it('should return the correct size for string', function() {
      const str = 'This is test string';
      assert.strictEqual(calculator.sizeOf(str), (str.length * 2));
    });

    it('should return the correct size for number', function() {
      const num = 5;
      assert.strictEqual(calculator.sizeOf(num), 8);
    });

    it('should return the correct size for boolean', function() {
      const bool = true;
      assert.strictEqual(calculator.sizeOf(bool), 4);
    });

    it('should return the correct size for number array', function() {
      const arr = [1, 2, 3, 4, 5, 6];
      assert.strictEqual(calculator.sizeOf(arr), (6 * 8));
    });

    it('should return the correct size for simple object', function() {
      const obj = {
        str: 'a', // 2
        str2: 'aa', // 4
        str3: 'aaa', // 6
        num: 1, // 8
        bool: true, // 4
      };
      assert.strictEqual(calculator.sizeOf(obj), 24);
    });

    it('should return the correct size for nested object', function() {
      const obj = {
        str: 'a', // 2
        obj2: {
          str2: 'aa', // 4
          num: 5, // 8
        },
        obj3: {
          str3: 'aaa', // 6
          obj4: {
            num2: 5, // 8,
            obj5: {
              bool: true, // 4
            }
          }
        }
      };
      assert.strictEqual(calculator.sizeOf(obj), 32);
    });

    it('should return the correct size for complex object', function() {
      const obj = {
        str: 'a', // 2
        num: 1, // 8
        bool: true, // 4
        arr: [
          {
            str: 'a', // 2
          },
          {
            str: 'a', // 2
          },
          {
            str: 'a', // 2
            arr: [
              {
                str: 'aa', // 4
                obj: {
                  str: 'aaa', // 6
                }
              }
            ]
          }
        ]
      };
      assert.strictEqual(calculator.sizeOf(obj), 30);
    });

    it('reference non repeat test', function() {
      const obj1 = {
        str: 'a', // 2
        num: 1, // 8
        bool: true, // 4
      };
      const obj2 = {
        str: 'a',
        obj1: obj1,
        obj2: obj1,
        arr: [obj1, obj1, obj1, JSON.parse(JSON.stringify(obj1))]
      }
      assert.strictEqual(calculator.sizeOf(obj2), 30);
    });
  });
});


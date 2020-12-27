const Utils = require('./Utils');
const Buffer = require('buffer').Buffer

const OBJECT_SIZES = {
  STRING: 2,
  BOOLEAN: 4,
  NUMBER: 8
};

class SizeCalculator {
  constructor(refStore) {
    this._set = refStore || new WeakSet();
  }

  _getSizeOf(val) {
    const type = typeof val;
    switch (type) {
      case 'string':
        return val.length * OBJECT_SIZES.STRING
      case 'boolean':
        return OBJECT_SIZES.BOOLEAN
      case 'number':
        return OBJECT_SIZES.NUMBER
      case 'symbol':
        if (Symbol.keyFor && Symbol.keyFor(val)) {
          return Symbol.keyFor(val).length * OBJECT_SIZES.STRING;
        }
        return (val.toString().length - 8) * OBJECT_SIZES.STRING;
      default:
        return -1;
    }
  }

  _addItemToSet(item) {
    if (this._set.has(item)) {
      return false;
    }
    this._set.add(item);
    return true;
  }

  _iterateObject(obj) {
    if (!this._addItemToSet(obj)) {
      return 0;
    }
    const props = Utils.getObjectProperties(obj);
    const stack = [];
    for (let i = 0; i < props.length; i++) {
      stack.push(obj[props[i]]);
    }
    let size = 0;
    while (stack.length > 0) {
      const item = stack[0];
      stack.splice(0, 1);
      if (Array.isArray(item)) {
        if (!this._addItemToSet(item)) {
          continue;
        }
        size += this._iterateArray(item);
      } else {
        const sizeOfItem = this._getSizeOf(item);
        if (sizeOfItem === -1) {
          if (!this._addItemToSet(item)) {
            continue;
          }
          const itemProps = Utils.getObjectProperties(item);
          for (let i = 0; i < itemProps.length; i++) {
            stack.push(item[itemProps[i]]);
          }
        } else {
          size += sizeOfItem;
        }
      }
    }
    return size;
  }

  _iterateArray(arr) {
    if (arr.length === 0) {
      return 0;
    }
    return arr.map(item => {
      const size = this._getSizeOf(item);
      if (size === -1) {
        return this._iterateObject(item);
      }
      return size;
    }).reduce((acc, current) => {
      return acc + current;
    });
  }

  /**
   * @param {*} obj
   */
  sizeOf(obj) {
    if (Buffer.isBuffer(obj)) {
      return obj.length
    }
    const size = this._getSizeOf(obj);
    if (size !== -1) {
      return size;
    }
    if (Array.isArray(obj)) {
      return this._iterateArray(obj);
    }
    return this._iterateObject(obj);
  }
}

module.exports = SizeCalculator;

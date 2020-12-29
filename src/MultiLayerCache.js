const Cache = require('./Cache');

/**
 * Cache stack
 */
class MultiLayerCache {
  /**
   * @param {Array.<{
   *   adapter:string,
   *   adapterOptions:Object
   * }>} options
   */
  constructor(options) {
    this._adapterStack = [];
    options.forEach(adapterOptions => {
      this._adapterStack.push(new Cache(adapterOptions));
    });
  }

  get(key, def) {
    let value = def;
    // Traverse adapter stack in order and take the first value which is not expired
    for (let i = 0; i < this._adapterStack.length; i++) {
      const val = this._adapterStack[i].get(key, null);
      if (val !== null) {
        value = val;
        break;
      }
    }
    return value;
  }

  /**
   * maxAge is not supported here.
   * Adapters must use the default maxAge
   * @param {string} key
   * @param {Object} data
   */
  put(key, data) {
    let success = true;
    for (let i = 0; i < this._adapterStack.length; i++) {
      success = success && this._adapterStack[i].put(key, data);
    }
    return success;
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  has(key) {
    for (let i = 0; i < this._adapterStack.length; i++) {
      if (this._adapterStack[i].has(key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  remove(key) {
    let success = true;
    for (let i = 0; i < this._adapterStack.length; i++) {
      success = success && this._adapterStack[i].remove(key);
    }
    return success;
  }

  /**
   * @return {boolean}
   */
  destroy() {
    let success = true;
    for (let i = 0; i < this._adapterStack.length; i++) {
      success = success && this._adapterStack[i].destroy(key);
    }
    return success;
  }
}

module.exports = MultiLayerCache;

const Yallist = require('yallist');
const Utils = require('../utils/Utils');
const BaseAdapter = require('../BaseAdapter');
const SizeCalculator = require('../utils/SizeCalculator');

/**
 * LRU Cache Adapter
 */
class LruAdapter extends BaseAdapter {
  /**
   * @param {{
   *  maxAge:?number,
   *  maxSize:?number,
   *  updateAgeOnGet:?boolean,
   *  allowExpired:?boolean
   * }} [options]
   */
  constructor(options) {
    super();
    this._options = Object.assign({
      maxAge: Infinity,
      maxSize: Infinity,
      updateAgeOnGet: false,
      allowExpired: false,
    }, options || {});
    this._store = {};
    this._size = 0;
    this._accessList = new Yallist();
    this._sizeCalculator = new SizeCalculator();
  }

  getSize() {
    return this._size;
  }

  /**
   * @override
   */
  get(key, def) {
    let entry = this._store[key];
    if (!entry) {
      return def;
    }
    entry = entry.value;
    if (this._isEntryExpired(entry) && this._options.allowExpired !== true) {
      this.remove(key);
      return def;
    }
    if (this._options.updateAgeOnGet) {
      this.remove(key);
      entry.createdAt = Date.now();
      this._addNewEntry(entry);
    }
    return entry.data;
  }

  /**
   * @override
   */
  put(key, data, lifeTime) {
    lifeTime = typeof lifeTime !== 'undefined' ? lifeTime : this._options.maxAge;
    const entry = this._createCacheEntry(key, data, lifeTime);
    if (entry.size > this._options.maxSize) {
      return false
    }
    if (this.has(key)) {
      this.remove(key);
      this._addNewEntry(entry);
      return true
    }
    this._addNewEntry(entry);
    return true;
  }

  _addNewEntry(entry) {
    this._size += entry.size;
    this._accessList.unshift(entry);
    this._store[entry.key] = this._accessList.head;
    Utils.invokeAsync(this._retireOldItems);
  }

  _createCacheEntry(key, data, lifeTime) {
    return {
      key: key,
      data: data,
      lifeTime: lifeTime,
      size: this._sizeCalculator.sizeOf(data),
      createdAt: Date.now(),
    };
  }

  _retireOldItems = () => {
    if (this._size <= this._options.maxSize) {
      return;
    }
    // Retire expired first
    for (let key in this._store) {
      if (this._store.hasOwnProperty(key)) {
        if (this._size <= this._options.maxSize) {
          return;
        }
        if (this._isEntryExpired(this._store[key].value)) {
          this.remove(key);
        }
      }
    }
    if (this._size <= this._options.maxSize) {
      return;
    }
    // Remove least recent if size is above expected
    const arr = this._accessList.toArrayReverse();
    let i = 0;
    while (this._size > 0 && this._size > this._options.maxSize) {
      this.remove(arr[i].key);
      i++;
    }
  };

  /**
   * @override
   */
  has(key) {
    const entry = this._store[key];
    if (!entry) {
      return false;
    }
    return this._options.allowExpired || !this._isEntryExpired(entry.value);
  }

  _isEntryExpired(entry) {
    const now = Date.now();
    return now > (entry.createdAt + entry.lifeTime);
  }

  /**
   * @override
   */
  remove(key) {
    const node = this._store[key];
    if (!node) {
      return false;
    }
    this._size -= node.value.size
    delete this._store[key];
    this._accessList.removeNode(node);
    return true;
  }

  /**
   * Clear cache
   */
  clear() {
    for (let key in this._store) {
      if (this._store.hasOwnProperty(key)) {
        this.remove(key);
      }
    }
    return true;
  }
}

module.exports = LruAdapter;

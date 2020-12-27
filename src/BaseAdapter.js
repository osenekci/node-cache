/**
 * Base adapter class
 */
class BaseAdapter {
  /**
   * @param {string} key
   * @param {*} [def]
   * @return {*}
   */
  get(key, def) {
    throw new Error('Method is not declared.');
  }

  /**
   * @param {string} key
   * @param {*} data
   * @param {number} [maxAge]
   * @return {boolean}
   */
  put(key, data, maxAge) {
    throw new Error('Method is not declared.');
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  has(key) {
    throw new Error('Method is not declared.');
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  remove(key) {
    throw new Error('Method is not declared.');
  }

  /**
   * Clear cache
   * @return {boolean}
   */
  clear() {
    throw new Error('Method is not declared.');
  }
}

module.exports = BaseAdapter;
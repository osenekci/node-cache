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
    throw new Error('Not implemented.');
  }

  /**
   * @param {string} key
   * @param {*} data
   * @param {number} [maxAge]
   * @return {boolean}
   */
  put(key, data, maxAge) {
    throw new Error('Not implemented.');
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  has(key) {
    throw new Error('Not implemented.');
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  remove(key) {
    throw new Error('Not implemented.');
  }

  /**
   * @return {boolean}
   */
  init() {
    throw new Error('Not implemented.');
  }

  /**
   * @return {boolean}
   */
  destroy() {
    throw new Error('Not implemented.');
  }
}

module.exports = BaseAdapter;
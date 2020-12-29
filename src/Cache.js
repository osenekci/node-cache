class Cache {
  /**
   * @param {{
   *   adapter:string,
   *   adapterOptions:Object
   * }} options
   */
  constructor(options) {
    /**
     * @type {BaseAdapter}
     * @private
     */
    this._adapter = null;
    this._initializeAdapter(options.adapter, options.adapterOptions);
  }

  _initializeAdapter(adapterName, adapterOptions) {
    const Adapter = require(`./adapters/${adapterName}Adapter.js`);
    const adapter = new Adapter(adapterOptions);
    adapter.init();
    this._adapter = adapter;
  }

  get(key, def) {
    return this._adapter.get(key, def);
  }

  put(key, data, maxAge) {
    return this._adapter.put(key, data, maxAge);
  }

  has(key) {
    return this._adapter.has(key);
  }

  remove(key) {
    return this._adapter.remove(key);
  }

  destroy() {
    return this._adapter.destroy();
  }
}

module.exports = Cache;

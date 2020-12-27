class Utils {
  static invokeAsync(callable) {
    setTimeout(callable, 0);
  }

  static getObjectProperties(obj) {
    const properties = [];
    for (let i in obj) {
      // Calculate inherited properties as well
      properties.push(i);
    }
    if (Object.getOwnPropertySymbols) {
      const symbols = Object.getOwnPropertySymbols(obj)
      Array.prototype.push.apply(properties, symbols)
    }
    return properties;
  }
}

module.exports = Utils;

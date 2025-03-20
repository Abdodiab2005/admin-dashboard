/**
 * Simple in-memory cache implementation with TTL support
 */
class Cache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  /**
   * Set a value in the cache with optional TTL
   * @param {String} key - Cache key
   * @param {*} value - Value to store
   * @param {Number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = null) {
    this.cache.set(key, value);

    // Clear any existing timeout for this key
    if (this.ttls.has(key)) {
      clearTimeout(this.ttls.get(key));
      this.ttls.delete(key);
    }

    // Set new timeout if TTL is provided
    if (ttl) {
      const timeout = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.ttls.set(key, timeout);
    }
  }

  /**
   * Get a value from the cache
   * @param {String} key - Cache key
   * @returns {*} - Cached value or undefined if not found
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Check if a key exists in the cache
   * @param {String} key - Cache key
   * @returns {Boolean} - True if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete a key from the cache
   * @param {String} key - Cache key
   * @returns {Boolean} - True if key was deleted
   */
  delete(key) {
    if (this.ttls.has(key)) {
      clearTimeout(this.ttls.get(key));
      this.ttls.delete(key);
    }
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timeouts
    for (const timeout of this.ttls.values()) {
      clearTimeout(timeout);
    }
    this.ttls.clear();
    this.cache.clear();
  }
}

// Create a singleton instance
const productCache = new Cache();
const categoryCache = new Cache();
const transactionCache = new Cache();

module.exports = {
  productCache,
  categoryCache,
  transactionCache,
};

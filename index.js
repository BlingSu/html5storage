
(function ( global, factory )  {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global.Html5Storage = factory())
})(this, function () {
  class Html5Storage {

    constructor (storage = 'localStorage') {
      this._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC')

      if (!this.supported(window[storage])) {
        console.error(`The browser is not supporte localStorage API !!!`)

        return Object.create(null)
      }

      if (typeof storage === 'string' && window[storage] instanceof Storage) {

        this.storage = window[storage]
      } else {
        this.storage = window.localStorage
      }

      // json格式化base64
      this.jsonFormat = {
        toString(item) {
          return btoa(encodeURIComponent(JSON.stringify(item)))
        },
        toJSON(data) {
          let json = {}
          try {
              json = JSON.parse(decodeURIComponent(atob(data)))
          } catch (err) {
              json = {}
          }
          return json
        }
      }
    }


    // 是否为Date类型
    _isValidateDate (date) {
      return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())
    }

    /**
     * 判断浏览器是否支持localStorage API
     * @param storage
     * @returns {boolean}
     */
    supported (storage) {
      let support = false

      if (storage && storage.setItem) {

        support = true

        let key = `__${Math.round(Math.random() * 1e7)}`

        try {
          storage.setItem(key, key)
          storage.removeItem(key)
        } catch (e) {
          support = false
        }
      }

      return support
    }


    /**
     * 获取过期时间
     * @param opt的key => exp: 值为Date或者number(秒), 其余为number
     * @returns {*}
     * @private
     */

      _getExpiresDate (opt, now) {
      now = now || new Date()

      if (opt.exp) {
        let expires = opt.exp

        if (typeof expires === 'number') {
          expires = expires === Infinity ? this._maxExpireDate : new Date(now.getTime() + expires * 1000)
        } else if (typeof expires === 'string') {
          expires = expires.trim() == '' ? this._maxExpireDate : new Date(expires)
        }

        if (expires && !this._isValidateDate(expires)) {
          throw new Error('exp param cannot be converted to a valid Date instance!!!')
        }
        return expires

      }

      if (opt.hour) {
        let time = parseFloat(opt.hour)

        if (isNaN(time)) {
          throw new Error(`hour param cannot be converted to a valid Date instance!!!`)
        }

        return time === Infinity ? this._maxExpireDate : new Date(now.getTime() + time * 3600000)
      }

      if (opt.day) {
        let time = parseFloat(opt.day)

        if (isNaN(time)) {
          throw new Error(`day param cannot be converted to a valid Date instance!!!`)
        }

        return time === Infinity ? this._maxExpireDate : new Date(now.getTime() + time * 24 * 3600000)
      }

      if (opt.week) {
        let time = parseFloat(opt.hour)

        if (isNaN(time)) {
          throw new Error(`week param cannot be converted to a valid Date instance!!!`)
        }

        return time === Infinity ? this._maxExpireDate : new Date(now.getTime() + time * 7 * 24 * 3600000)
      }

      if (opt.month) {
        let time = parseFloat(opt.month)

        if (isNaN(time)) {
          throw new Error(`month param cannot be converted to a valid Date instance!!!`)
        }

        return time === Infinity ? this._maxExpireDate : new Date(now.getTime() + time * 30 * 24 * 3600000)
      }

      if (opt.year) {
        let time = parseFloat(opt.hour)

        if (isNaN(time)) {
          throw new Error(`year param cannot be converted to a valid Date instance!!!`)
        }

        return time === Infinity ? this._maxExpireDate : new Date(now.getTime() + time * 365 * 30 * 24 * 3600 * 1000)
      }
    }


    // 格式化缓存数据
    _getCacheItem (value, exp) {
      let expires = exp ? this._getExpiresDate(exp) : this._maxExpireDate;

      return {
        c: Date.now(),
        e: expires.getTime(),
        v: value
      }
    }

      // 检查格式化缓存数据
    _isCacheItem (item) {
      if (typeof item !== 'object') {
        return false
      }

      if (item) {
        if ('c' in item && 'e' in item && 'v' in item) {
          return true
        }
      }

      return false
    }

    // 检查key是否为字符串
    _checkKey (key) {
      if (typeof key !== 'string') {

        if (typeof key === 'object') {
          throw new Error(`key must not be an object!!!`)
        }

        console.warn(`key not a string`)
        key = String(key)
      }
      return key
    }

    // 检查是否可用
    _checkEffective (cacheItem) {
      let nowTime = Date.now()
      return nowTime < cacheItem.e
    }

    /**
     * 添加
     * @param key
     * @param val
     * @param option
     * @returns {*}
     */

    set (key, val, option) {

      key = this._checkKey(key)

      if (val === undefined) {
        return this.remove(key)
      }

      let cacheItem = this._getCacheItem(val, option)

      try {
        this.storage.setItem(key, this.jsonFormat.toString(cacheItem))
      } catch (e) {
        console.error(e)
      }

      return val
    }

    /**
     * 重置过期时间
     * @param key
     * @param option
     * @returns {boolean}
     */

    reset (key, option) {
      key = this._checkKey(key)

      let cacheItem = null

      try {
        cacheItem = this.jsonFormat.toJSON(this.storage.getItem(key))
      } catch (e) {
        console.error(e)

        return false
      }

      if (this._isCacheItem(cacheItem)) {
        if (this._checkEffective(cacheItem)) {
          this.set(key, cacheItem.v, option)

          return true
        } else {
          this.remove(key)
        }
      }
      return false
    }

    /**
     * 重置value, 过期时间不变
     * @param key
     * @param val
     * @returns {boolean}
     */

      replace (key, val) {
        key = this._checkKey(key)

        let cacheItem = null

        try {
          cacheItem = this.jsonFormat.toJSON(this.storage.getItem(key))
        } catch (e) {
          console.error(e)

          return false
        }

        if (this._isCacheItem(cacheItem)) {
          if (this._checkEffective(cacheItem)) {
            cacheItem.v = val
            this.storage.setItem(key, this.jsonFormat.toString(cacheItem))

            return true
          } else {
            this.remove(key)
          }
        }

        return false
      }


    /**
    * 当key不存在或过期才添加
    * @param key
    * @param val
    * @param option
    * @returns {boolean}
    */

    add (key, val, option) {
      key = this._checkKey(key)

      try {
        let cacheItem = this.jsonFormat.toJSON(this.storage.getItem(key))

        if (!this._isCacheItem(cacheItem) || !this._checkEffective(cacheItem)) {
          this.set(key, val, option)

          return true
        }
      } catch (e) {
        this.set(key, val, option)

        return true
      }
      return false
    }

    /**
     * 获取数据
     * @param key
     * @returns {*}
     */

    get (key) {
      key = this._checkKey(key)

      let cacheItem = null

      try {

        cacheItem = this.jsonFormat.toJSON(this.storage.getItem(key))
      } catch (err) {
        console.error(err)
        return null
      }
      if (this._isCacheItem(cacheItem)) {
        if (this._checkEffective(cacheItem)) {

          return cacheItem.v
        } else {
          this.storage.removeItem(key)
        }
      }
      return null
    }

    /**
     * 删除数据
     * @param key
     * @returns {*}
     */

    remove (key) {
      key = this._checkKey(key)

      this.storage.removeItem(key)

      return key
    }

    /**
     * 清空所有过期的数据
     * @returns {Array}
     */

    clearExpires () {
      let len = this.storage.length

      let deleteKeys = []

      for (let i = 0; i < len; i++) {
        let key = this.storage.key(i)
        let cacheItem = null

        try {
          cacheItem = this.jsonFormat.toJSON(this.storage.getItem(key))
        } catch (e) {
          console.error(e)
        }

        if (cacheItem !== null && cacheItem.e !== undefined) {
          let nowTime = Date.now()

          if (nowTime >= cacheItem.e) {
            deleteKeys.push(key)

            this.storage.removeItem(key)
          }
        }
      }
      return deleteKeys
    }

    /**
     * 清空所有数据
     */

    clear () {
      this.storage.clear()
    }
  }

  return Html5Storage
})

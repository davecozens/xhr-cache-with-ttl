"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var axios = require('axios');

var dayjs = require('dayjs');

var keyPrefix = 'XCWT_';

function setCacheIndexForKey(key, ttl) {
  localStorage.setItem("".concat(keyPrefix).concat(key, "_metadata"), JSON.stringify({
    ttl: ttl,
    setAt: dayjs().unix()
  }));
}

function setCacheValueForKey(key, value) {
  var ttl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30;
  var writeValue = value;

  if (_typeof(writeValue) === 'object') {
    writeValue = JSON.stringify(writeValue);
  }

  localStorage.setItem("".concat(keyPrefix).concat(key, "_data"), writeValue);
  setCacheIndexForKey(key, ttl);
}

function getCacheValueForKey(key) {
  try {
    var cacheData = localStorage.getItem("XCWT_".concat(key, ".data"));

    if (cacheData) {
      try {
        return JSON.parse(cacheData);
      } catch (e) {
        return cacheData;
      }
    }
  } catch (e) {
    console.error(e);
  }

  return undefined;
}

function removeCacheForKey(key) {
  localStorage.removeItem("".concat(keyPrefix).concat(key, "_metadata"));
  localStorage.removeItem("".concat(keyPrefix).concat(key, "_data"));
}

function getCacheIndexForKey(key, ttl) {
  var cacheMetadata = localStorage.getItem("".concat(keyPrefix).concat(key, "_metadata"));

  if (cacheMetadata) {
    try {
      var parsedCacheMetadata = JSON.parse(cacheMetadata);

      if (ttl) {
        parsedCacheMetadata.ttl = ttl;
      }

      var setAt = parsedCacheMetadata.setAt;
      var expiresAt = setAt + ttl;
      var timeNow = dayjs().unix();
      var expiresIn = expiresAt - timeNow;

      if (expiresIn < 0) {
        removeCacheForKey(key);
        return undefined;
      } else {
        return getCacheValueForKey(key);
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    return undefined;
  }
}

function xhrCache(method, url) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return new Promise(function (resolve, reject) {
    var ttl;

    if (options.ttl) {
      ttl = options.ttl;
    }

    delete options.ttl; // shouldnt be sent to Axios

    var cachedData = getCacheIndexForKey(url, ttl);

    if (cachedData) {
      resolve(cachedData);
    } else {
      try {
        axios[method](url, options).then(function (res) {
          setCacheValueForKey(url, res, ttl);
          resolve(res);
        });
      } catch (e) {
        console.log(e);
        reject(e);
      }
    }
  });
}

module.exports = {
  xhrCache: xhrCache
};
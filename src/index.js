const axios = require('axios')
const dayjs = require('dayjs')
const keyPrefix = 'XCWT_'

function setCacheIndexForKey(key, ttl) {
    localStorage.setItem(`${keyPrefix}${key}_metadata`, JSON.stringify({ttl, setAt: dayjs().unix()}))
}

function setCacheValueForKey(key, value, ttl = 30) {
    let writeValue = value
    if (typeof writeValue === 'object') {
        writeValue = JSON.stringify(writeValue)
    }
    localStorage.setItem(`${keyPrefix}${key}_data`, writeValue)
    setCacheIndexForKey(key, ttl)
}

function getCacheValueForKey(key) {
    try {
        const cacheData = localStorage.getItem(`XCWT_${key}.data`)
        if (cacheData) {
            try {
                return JSON.parse(cacheData)
            } catch (e) {
                return cacheData
            }
        }
    } catch (e) {
        console.error(e)
    }
    return undefined
}

function removeCacheForKey(key) {
    localStorage.removeItem(`${keyPrefix}${key}_metadata`)
    localStorage.removeItem(`${keyPrefix}${key}_data`)
}

function getCacheIndexForKey(key, ttl) {
    const cacheMetadata = localStorage.getItem(`${keyPrefix}${key}_metadata`)
    if (cacheMetadata) {
        try {
            const parsedCacheMetadata = JSON.parse(cacheMetadata)
            if (ttl) {
                parsedCacheMetadata.ttl = ttl
            }
            const setAt = parsedCacheMetadata.setAt
            const expiresAt = setAt + ttl
            const timeNow = dayjs().unix()
            const expiresIn = expiresAt - timeNow
            if (expiresIn < 0) {
                removeCacheForKey(key)
                return undefined
            } else {
                return getCacheValueForKey(key)
            }
        } catch (e) {
            console.error(e)
        }
    } else {
        return undefined
    }

}

function xhrCache(method, url, options = {}) {
    return new Promise(function (resolve, reject) {
        let ttl
        if (options.ttl) {
            ttl = options.ttl
        }
        delete options.ttl // shouldnt be sent to Axios
        const cachedData = getCacheIndexForKey(url, ttl)
        if (cachedData) {
            resolve(cachedData)
        } else {
            try {
                axios[method](url, options).then((res) => {
                    setCacheValueForKey(url, res, ttl)
                    resolve(res)
                })

            } catch (e) {
                console.log(e)
                reject(e)
            }
        }
    })
}

module.exports = {xhrCache}

const axios = require('axios')
const dayjs = require('dayjs')
const keyPrefix='XCWT_'

function putToCacheIndex(key, ttl) {
    localStorage.setItem(`${keyPrefix}${key}_metadata`, JSON.stringify({ttl, expires: dayjs().unix() + ttl}))
}

function putToCache(key, value, ttl = 30) {
    let writeValue = value
    if (typeof writeValue === 'object') {
        writeValue = JSON.stringify(writeValue)
    }
    localStorage.setItem(`${keyPrefix}${key}_data`, writeValue)
    putToCacheIndex(key, ttl)
}

function getFromCache(key) {
    try {
        let cacheData = localStorage.getItem(`XCWT_${key}.data`)
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

function checkInCacheIndex(key) {
    let cacheMetadata = localStorage.getItem(`${keyPrefix}${key}_metadata`)
    if (cacheMetadata) {
        try {
            let parsedCacheMetadata = JSON.parse(cacheMetadata)
            let timeNow = dayjs().unix()
            let expired = timeNow > parsedCacheMetadata.expires
            if (expired) {
                localStorage.removeItem(`${keyPrefix}${key}_metadata`)
                localStorage.removeItem(`${keyPrefix}${key}_data`)
                return undefined
            }
            return getFromCache(key)
        } catch (e) {
            console.error(e)
        }
    } else {
        return undefined
    }

}

function xhrCache(method, url, options = {}) {
    return new Promise(function (resolve, reject) {
        let ttl=300
        if(options.ttl){
            ttl=options.ttl
        }
        delete options.ttl
        let cachedData = checkInCacheIndex(url,ttl)

        if (cachedData) {
            resolve(cachedData)
        } else {
            try {
                axios[method](url, options).then((res) => {
                    putToCache(url, res, ttl)
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

# xhr-cache-with-ttl
Helper function to enable Local Storage caching of XHR requests in a browser with a specified TTL

## Usage

```
import {xhrCache} from 'xhr-cache-with-ttl'
const result = await xhrCache('get', url, {ttl: 45})
```

This library uses Axios, so all methods available to Axios are available here, although generally you'll be using get


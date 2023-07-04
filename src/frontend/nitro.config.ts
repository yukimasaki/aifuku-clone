import { defineNitroConfig } from 'nitropack/config'

// https://nitro.unjs.io/config#devproxy
// https://github.com/http-party/node-http-proxy#options
export default defineNitroConfig({
  devProxy: {
    '/api/': {
      target: 'http://express-container:3000/api/',
      changeOrigin: true,
      hostRewrite: 'true',
      cookieDomainRewrite: 'true',
      headers: {
        'X-Forwarded-Host': 'express-container:3000',
        'X-Forwarded-Proto': 'http'
      },
    }
  }
})

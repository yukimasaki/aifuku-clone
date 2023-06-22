// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    // Docs: https://tailwindcss.nuxtjs.org
    "@nuxtjs/tailwindcss",
  ],
  runtimeConfig: {
    public: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || "",
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || "",
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || "",
    }
  },
  app: {
    head: {
      htmlAttrs: {
        "data-theme": "aifuku",
      }
    }
  }
})

import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // https://nuxt.com/docs/api/configuration/nuxt-config
  devtools: { enabled: true },
  experimental: { appManifest: false },
  // Global page headers: https://nuxt.com/docs/api/configuration/nuxt-config#head
  app: {
    head: {
      title: 'Today I Learned',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Global CSS: https://nuxt.com/docs/api/configuration/nuxt-config#css
  css: [],

  // Modules: https://nuxt.com/docs/api/configuration/nuxt-config#modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint'
  ],

  // Build Configuration
  nitro: {
    preset: 'static'
  },

  // Runtime config
  runtimeConfig: {
    // Private keys are only available on server-side
    // Public keys that are exposed to client-side
    public: {
      TIL_API_HOST: process.env.TIL_API_HOST || 'https://pzbugc7ro1.execute-api.eu-west-1.amazonaws.com/dev/',
      // Endpoint of the `serve` Lambda in til-build-visualisation-data. Returns
      // { createdAt, topics, topPages, network }. Fetched client-side at runtime
      // so the static site picks up fresh data (and its date) without a rebuild.
      TIL_DATA_API: process.env.TIL_DATA_API || 'https://api.todayilearned.cc/visualisation-data'
    }
  }
})
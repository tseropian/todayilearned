import { defineNuxtConfig } from 'nuxt/config'

// Base URL of the unified API Gateway (the `til-api` Serverless service).
// Trailing slash matters: routes are `${apiHost}links/{date}`, etc.
const apiHost = process.env.TIL_API_HOST || 'https://pzbugc7ro1.execute-api.eu-west-1.amazonaws.com/dev/'

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
      // Every backend Lambda now lives behind one API Gateway (the `til-api`
      // Serverless service), so both routes share this base. Point TIL_API_HOST
      // at the unified gateway's invoke URL (keep the trailing slash); by default
      // TIL_DATA_API is derived from it.
      TIL_API_HOST: apiHost,
      // GET {base}/visualisation-data -> { createdAt, topics, topPages, network }.
      TIL_DATA_API: process.env.TIL_DATA_API || `${apiHost}visualisation-data`
    }
  }
})
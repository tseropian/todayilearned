export default defineNuxtConfig({
  // https://nuxt.com/docs/api/configuration/nuxt-config
  devtools: { enabled: true },
  
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
    '@nuxtjs/tailwindcss'
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
      TIL_API_HOST: process.env.TIL_API_HOST || 'https://api.todayilearned.cc/'
    }
  }
})
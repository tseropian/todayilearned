import { defineNuxtConfig } from 'nuxt/config'

// Base URL of the unified API Gateway (the `til-api` Serverless service).
// Trailing slash matters: routes are `${apiHost}links/{date}`, etc.
const apiHost = process.env.TIL_API_HOST || 'https://pzbugc7ro1.execute-api.eu-west-1.amazonaws.com/dev/'

// Enumerate monthly archive routes (/archives/YYYY-MM) from Jan 2019 to the
// current month, mirroring the range the home page renders. The home-page
// links are built client-side (onMounted), so the prerender crawler can't
// discover them — list them explicitly instead so their OG/canonical tags
// are baked into static HTML.
function archiveRoutes(): string[] {
  const routes: string[] = []
  const now = new Date()
  for (let year = 2019; year <= now.getFullYear(); year++) {
    const endMonth = year === now.getFullYear() ? now.getMonth() + 1 : 12
    for (let month = 1; month <= endMonth; month++) {
      routes.push(`/archives/${year}-${String(month).padStart(2, '0')}`)
    }
  }
  return routes
}

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
        { name: 'description', content: "A nerdy list of the things I'm (not) learning on Wikipedia." },
        // OpenGraph defaults (per-page values override title/description/url)
        { property: 'og:site_name', content: 'Today I Learned' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:title', content: 'Today I Learned' },
        { property: 'og:description', content: "A nerdy list of the things I'm (not) learning on Wikipedia." },
        { property: 'og:image', content: 'https://todayilearned.cc/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Today I Learned — a nerdy list of the things I\'m (not) learning on Wikipedia' },
        // Twitter Card defaults
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Today I Learned' },
        { name: 'twitter:description', content: "A nerdy list of the things I'm (not) learning on Wikipedia." },
        { name: 'twitter:image', content: 'https://todayilearned.cc/og-image.png' }
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
    preset: 'static',
    // Prerender the home page and crawl its links so dynamic archive routes
    // (/archives/:slug) are generated with their own OG/canonical tags.
    prerender: {
      crawlLinks: true,
      routes: ['/', ...archiveRoutes()]
    }
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
      TIL_DATA_API: process.env.TIL_DATA_API || `${apiHost}visualisation-data`,
      // Canonical site origin, used to build og:url / canonical links.
      siteUrl: process.env.TIL_SITE_URL || 'https://todayilearned.cc'
    }
  }
})
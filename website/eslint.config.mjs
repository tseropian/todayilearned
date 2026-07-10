import withNuxt from './.nuxt/eslint.config.mjs'
export default withNuxt({
  rules: {
    // Single-word names are conventional for Nuxt pages, layouts, and top-level components
    'vue/multi-word-component-names': 'off'
  }
})

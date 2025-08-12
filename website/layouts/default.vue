<template>
  <div>
    <!-- <Header /> -->
    <slot />
    <Footer />
  </div>
</template>

<script setup>
// Components are auto-imported in Nuxt 3
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

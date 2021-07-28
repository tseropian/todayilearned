<template>
  <div>
    <Menu />
    <transition name="fade">
      <nuxt />
    </transition>
    <Footer />
  </div>
</template>

<script>
import Footer from '~/components/Footer'

export default {
  components: {
    Footer
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

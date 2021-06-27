<template>
  <header id="luxbar" class="luxbar-fixed">
    <input id="luxbar-checkbox" type="checkbox" class="luxbar-checkbox">
    <div class="luxbar-menu luxbar-menu-right luxbar-menu-light">
      <ul class="luxbar-navigation">
        <li class="luxbar-header">
          <a href="#" class="luxbar-brand">
            Today I Learned
          </a>
          <label
            id="luxbar-hamburger"
            class="luxbar-hamburger luxbar-hamburger-doublespin"
            for="luxbar-checkbox"
          > <span /> </label>
        </li>
        <li class="luxbar-item">
          <a href="/#/" @click="onClick">Home</a>
        </li>
        <li class="luxbar-item">
          <a href="/#/about" @click="onClick">About</a>
        </li>
        <li class="luxbar-item">
          <a href="/contact" @click="onClick">Contact</a>
        </li>
      </ul>
    </div>
  </header>
</template>

<script>
export default {
  mounted () {
  },
  methods: {
    onClick () {
      document.getElementById('luxbar-checkbox').checked = false
      document.getElementsByClassName('luxbar-menu')[0].scrollTop = 0
    }
  }
}
</script>
<style>
@import url("https://cdn.rawgit.com/balzss/luxbar/ae5835e2/build/luxbar.min.css");

</style>

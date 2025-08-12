<template>
  <header id="luxbar" class="luxbar-fixed">
    <input id="luxbar-checkbox" type="checkbox" class="luxbar-checkbox">
    <div class="luxbar-menu luxbar-menu-right luxbar-menu-light">
      <ul class="luxbar-navigation">
        <li class="luxbar-header">
          <NuxtLink to="/" class="luxbar-brand">
            Today I Learned
          </NuxtLink>
          <label
            id="luxbar-hamburger"
            class="luxbar-hamburger luxbar-hamburger-doublespin"
            for="luxbar-checkbox"
          > <span /> </label>
        </li>
        <li class="luxbar-item">
          <NuxtLink to="/" @click="onClick">Home</NuxtLink>
        </li>
        <li class="luxbar-item">
          <a href="mailto:hello@todayilearned.cc" @click="onClick">Contact</a>
        </li>
        <li class="luxbar-item">
          <a href="https://github.com/tseropian/todayilearned" target="_blank" rel="noopener noreferrer" @click="onClick">GitHub</a>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup>
const onClick = () => {
  if (process.client) {
    const checkbox = document.getElementById('luxbar-checkbox')
    const menu = document.getElementsByClassName('luxbar-menu')[0]
    if (checkbox) checkbox.checked = false
    if (menu) menu.scrollTop = 0
  }
}
</script>

<style>
@import url("https://cdn.rawgit.com/balzss/luxbar/ae5835e2/build/luxbar.min.css");
</style>

<template>
  <div class="container">
    <div>
      <div style="margin:0 auto; width: 512px;">
        <Logo />
      </div>
      <h1 class="title">
        Today I Learned
      </h1>
      <h2>
        A highly over-engineered project to track the things I'm (not) learning on Wikipedia.
      </h2>

      <div class="links">
        <a
          href="mailto:hello@todayilearned.cc"
          target="_blank"
          rel="noopener noreferrer"
          class="button--green"
        >
          Contact
        </a>
        <a
          href="https://github.com/tseropian/todayilearned"
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
        >
          GitHub
        </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>

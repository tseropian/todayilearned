<template>
  <div id="home">
    <div id="caption">
      <h1>
        Today I Learned
      </h1>
      <h2>
        Archives: {{ slug }}
      </h2>

      <div style="margin:0 auto; width: 80%">
        <Logo />
      </div>

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
      </div>
    </div>
    <div id="links">
      <LinksList
        :start="startDate"
        :end="endDate"
      />
    </div>
    <div style="clear:both" />
  </div>
</template>

<script setup>
import { format, addDays } from 'date-fns'

const route = useRoute()
const slug = route.params.slug

const endDate = slug + '-01'
const startDate = format(addDays(new Date(endDate), 30), 'yyyy-MM-dd')
</script>

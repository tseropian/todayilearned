<template>
  <div id="footer">
    <footer class="footer">
      <p class="poweredby">
        Crafted with ❤️ by <a target="_blank" href="https://twitter.com/thoomyorke">Thomas Seropian</a> between London and Paris.
      </p>
      Generated on {{ currentDate }}
    </footer>
  </div>
</template>

<script setup>
const currentDate = ref('')

onMounted(() => {
  currentDate.value = new Date().toLocaleDateString()
})
</script>

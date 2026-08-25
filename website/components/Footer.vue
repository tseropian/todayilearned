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

<style scoped>
.footer {
  border-top: 3px solid var(--coral);
  margin-top: 32px;
  padding: 16px 30px;
  color: var(--dim);
  font-size: 0.85rem;
}

.footer .poweredby {
  margin: 0 0 4px;
}

.footer a {
  color: var(--overprint);
}
</style>

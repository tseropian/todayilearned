<template>
  <div class="spinner" role="status" :aria-label="label">
    <span class="spinner__ring" />
    <span class="spinner__label">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: 'Loading…'
  }
})
</script>

<style scoped>
.spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 0;
}

.spinner__ring {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid var(--border, #e7e1d5);
  border-top-color: var(--accent, #4f46e5);
  animation: spinner-rotate 0.7s linear infinite;
}

.spinner__label {
  font-size: 0.875rem;
  color: var(--muted, #8a857a);
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .spinner__ring {
    animation-duration: 2s;
  }
}
</style>

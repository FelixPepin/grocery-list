<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'success'].includes(value),
  },
})
</script>

<template>
  <!-- role="alert" makes screen readers read the message as soon as it appears -->
  <p class="alert" :class="type" role="alert">{{ message }}</p>
</template>

<style scoped>
.alert {
  margin: 0;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid;
  border-radius: var(--radius);
  font-weight: 500;
}

.error {
  color: var(--color-error);
  background: var(--color-error-background);
}

.success {
  color: var(--color-success);
  background: var(--color-success-background);
}
</style>
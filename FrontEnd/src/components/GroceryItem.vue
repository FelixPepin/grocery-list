<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n/useI18n'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const { t, formatPrice } = useI18n()

const subtotal = computed(() => props.item.quantity * props.item.unit_price)
</script>

<template>
  <li class="grocery-item">
    <h2 class="name">{{ item.name }}</h2>

    <div class="details">
      <div>
        <p class="label">{{ t('list.quantity') }}</p>
        <p class="value">{{ item.quantity }}</p>
      </div>

      <div>
        <p class="label">{{ t('list.unitPrice') }}</p>
        <p class="value">{{ formatPrice(item.unit_price) }}</p>
      </div>

      <div class="subtotal">
        <p class="label">{{ t('list.subtotal') }}</p>
        <p class="value">{{ formatPrice(subtotal) }}</p>
      </div>
    </div>
  </li>
</template>

<style scoped>
.grocery-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.details {
  display: flex;
  gap: var(--space-lg);
}

.label {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.value {
  margin: 0;
  font-weight: 500;
}

.subtotal .value {
  color: var(--color-primary);
  font-weight: 700;
}
</style>
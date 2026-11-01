<script setup>
import { ref } from 'vue'
import { useI18n } from '../i18n/useI18n'
import { useGroceryList } from '../composables/useGroceryList'
import GroceryItem from './GroceryItem.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import AlertMessage from './AlertMessage.vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const { t, formatPrice } = useI18n()
const { total, deleteAllItems } = useGroceryList()

const isConfirmingClear = ref(false)
const isClearing = ref(false)
const errorCode = ref('')

function askClear() {
  errorCode.value = ''
  isConfirmingClear.value = true
}

async function confirmClear() {
  isClearing.value = true

  try {
    const result = await deleteAllItems()
    if (!result.success) errorCode.value = result.code
    isConfirmingClear.value = false
  } finally {
    isClearing.value = false
  }
}
</script>

<template>
  <div class="list">
    <ul class="grocery-list">
      <GroceryItem v-for="item in items" :key="item.id" :item="item" />
    </ul>

    <div class="summary">
      <p class="total" aria-live="polite">
        {{ t('list.total') }} <strong>{{ formatPrice(total) }}</strong>
      </p>
      <button class="danger" @click="askClear">{{ t('list.clear') }}</button>
    </div>

    <AlertMessage v-if="errorCode" :message="t(`errors.${errorCode}`)" />

    <ConfirmDialog
      :open="isConfirmingClear"
      :message="t('list.confirmClear')"
      :warning="t('common.irreversible')"
      :busy="isClearing"
      @confirm="confirmClear"
      @cancel="isConfirmingClear = false"
    />
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.grocery-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.total {
  margin: 0;
  font-size: 1.1rem;
}

.total strong {
  margin-left: var(--space-sm);
  font-size: 1.3rem;
  color: var(--color-primary);
}

button.danger {
  padding: var(--space-xs) var(--space-md);
  font-size: 0.9rem;
  color: var(--color-error);
  border-color: var(--color-error);
}

button.danger:hover {
  color: white;
  background: var(--color-error);
}
</style>

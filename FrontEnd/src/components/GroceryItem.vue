<script setup>
import { computed, ref } from 'vue'
import { useI18n } from '../i18n/useI18n'
import { useGroceryList } from '../composables/useGroceryList'
import AlertMessage from './AlertMessage.vue'
import GroceryForm from './GroceryForm.vue'
import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const { t, formatPrice } = useI18n()
const { deleteItem } = useGroceryList()

const subtotal = computed(() => props.item.quantity * props.item.unit_price)

const isEditing = ref(false)
const isConfirmingDelete = ref(false)
const isDeleting = ref(false)
const errorCode = ref('')

function startEditing() {
  errorCode.value = ''
  isEditing.value = true
}

function askDelete() {
  errorCode.value = ''
  isConfirmingDelete.value = true
}

async function confirmDelete() {
  isDeleting.value = true

  try {
    const result = await deleteItem(props.item.id)

    // On success the item leaves the list, so this component disappears
    if (!result.success) {
      errorCode.value = result.code
      isConfirmingDelete.value = false
    }
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <li class="grocery-item">
    <GroceryForm v-if="isEditing" :item="item" class="full-width" @done="isEditing = false" />
    <template v-else>
      <div class="content">
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
      </div>
      <div class="actions">
        <button :aria-label="`${t('item.edit')} ${item.name}`" @click="startEditing">
          {{ t('item.edit') }}
        </button>
        <button class="danger" :aria-label="`${t('item.delete')} ${item.name}`" @click="askDelete">
          {{ t('item.delete') }}
        </button>
      </div>
      <ConfirmDialog
        :open="isConfirmingDelete"
        :message="t('item.confirmDelete', { name: item.name })"
        :warning="t('common.irreversible')"
        :busy="isDeleting"
        @confirm="confirmDelete"
        @cancel="isConfirmingDelete = false"
      />
      <AlertMessage v-if="errorCode" class="full-width" :message="t(`errors.${errorCode}`)" />
    </template>
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

.content {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
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

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

button {
  padding: var(--space-xs) var(--space-md);
  font-size: 0.9rem;
}

button:hover:not(:disabled) {
  border-color: var(--color-text-muted);
}

button.danger {
  color: var(--color-error);
  border-color: var(--color-error);
}

button.danger:hover:not(:disabled) {
  color: white;
  background: var(--color-error);
}

/* The edit form and the error take the full width of the card */
.full-width {
  flex-basis: 100%;
}
</style>

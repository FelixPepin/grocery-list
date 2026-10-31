<script setup>
import { ref, watch } from 'vue'
import { useI18n } from '../i18n/useI18n'

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  // Disables the buttons while the action is running
  busy: {
    type: Boolean,
    default: false,
  },
  warning: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const { t } = useI18n()
const dialog = ref(null)

// showModal() is what makes it a real modal: dark backdrop, focus kept inside, Esc to close
watch(
  () => props.open,
  (isOpen) => (isOpen ? dialog.value.showModal() : dialog.value.close()),
)
</script>

<template>
  <!-- .prevent: the parent decides when to close (Esc only asks for it) -->
  <dialog ref="dialog" class="confirm-dialog" @cancel.prevent="emit('cancel')">
    <p class="message">{{ message }}</p>
    <p v-if="warning" class="warning">⚠️ {{ warning }}</p>
    <div class="buttons">
      <!-- autofocus on "No": pressing Enter by accident never deletes -->
      <button autofocus :disabled="busy" @click="emit('cancel')">
        {{ t('common.no') }}
      </button>
      <button class="danger" :disabled="busy" @click="emit('confirm')">
        {{ t('common.yes') }}
      </button>
    </div>
  </dialog>
</template>

<style scoped>
.confirm-dialog {
  max-width: 400px;
  padding: var(--space-lg);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius);
  box-shadow: 0 10px 30px rgb(0 0 0 / 20%);
}

.confirm-dialog::backdrop {
  background: rgb(0 0 0 / 40%);
}

.message {
  margin: 0 0 var(--space-lg);
  font-weight: 500;
}

.warning {
  margin: 0 0 var(--space-lg);
  font-size: 0.9rem;
  color: var(--color-error);
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

button {
  padding: var(--space-sm) var(--space-lg);
  font: inherit;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
}

button.danger {
  color: white;
  background: var(--color-error);
  border-color: var(--color-error);
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>

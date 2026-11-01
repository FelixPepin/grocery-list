<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from '../i18n/useI18n'
import { useGroceryList } from '../composables/useGroceryList'
import { validateItem, NAME_MAX_LENGTH, QUANTITY_MAX, UNIT_PRICE_MAX } from '../utils/validateItem'
import AlertMessage from './AlertMessage.vue'

const props = defineProps({
  // When an item is given, the form edits it instead of creating a new one
  item: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['done'])

const { t } = useI18n()
const { createItem, updateItem } = useGroceryList()

const isEditing = computed(() => props.item !== null)

// The add form and the edit forms can be on the page at the same time: ids must be unique
const idPrefix = props.item ? `edit-${props.item.id}-` : ''
const fieldId = (field) => `${idPrefix}item-${field}`

const FIELDS = ['name', 'quantity', 'unit_price']

const initialForm = () =>
  isEditing.value
    ? { name: props.item.name, quantity: props.item.quantity, unit_price: props.item.unit_price }
    : { name: '', quantity: 1, unit_price: '' }

const form = reactive(initialForm())
const touched = reactive({ name: false, quantity: false, unit_price: false })
const submitted = ref(false)
const isSubmitting = ref(false)
// Codes and names are stored instead of texts, so the messages follow the language switch
const serverErrorCode = ref('')
const successName = ref('')

const nameInput = ref(null)
const quantityInput = ref(null)
const unitPriceInput = ref(null)
const inputs = { name: nameInput, quantity: quantityInput, unit_price: unitPriceInput }

const errors = computed(() => validateItem(form))

const MAX_BY_FIELD = { name: NAME_MAX_LENGTH, quantity: QUANTITY_MAX, unit_price: UNIT_PRICE_MAX }

/** A field's error is shown only once the user left the field or tried to submit. */
const fieldErrors = computed(() => {
  const messages = {}
  for (const field of FIELDS) {
    const code = errors.value[field]
    const isVisible = touched[field] || submitted.value
    messages[field] = isVisible && code ? t(`errors.${code}`, { max: MAX_BY_FIELD[field] }) : ''
  }
  return messages
})

function resetForm() {
  Object.assign(form, initialForm())
  FIELDS.forEach((field) => (touched[field] = false))
  submitted.value = false
}

async function submit() {
  if (isSubmitting.value) return

  submitted.value = true
  serverErrorCode.value = ''
  successName.value = ''

  const firstInvalid = FIELDS.find((field) => errors.value[field])
  if (firstInvalid) {
    inputs[firstInvalid].value.focus()
    return
  }

  isSubmitting.value = true

  try {
    const payload = {
      name: form.name.trim(),
      quantity: form.quantity,
      unit_price: form.unit_price,
    }
    const result = isEditing.value
      ? await updateItem(props.item.id, payload)
      : await createItem(payload)

    if (!result.success) {
      serverErrorCode.value = result.code
      return
    }

    // The list already shows the saved version: the card just closes the edit form
    if (isEditing.value) {
      emit('done')
      return
    }

    successName.value = result.item.name
    resetForm()
    // Ready for the next item without clicking
    nameInput.value.focus()
  } finally {
    isSubmitting.value = false
  }
}

// Lets the user start typing right away when the edit form opens
onMounted(() => {
  if (isEditing.value) nameInput.value.focus()
})
</script>

<template>
  <form
    class="grocery-form"
    :class="{ embedded: isEditing }"
    novalidate
    :aria-busy="isSubmitting"
    @submit.prevent="submit"
    @input="successName = ''"
  >
    <h2>{{ isEditing ? t('form.editTitle') : t('form.title') }}</h2>

    <div class="fields">
      <div class="field">
        <label :for="fieldId('name')">{{ t('form.name') }}</label>
        <input
          :id="fieldId('name')"
          ref="nameInput"
          v-model="form.name"
          type="text"
          autocomplete="off"
          :class="{ invalid: fieldErrors.name }"
          :aria-invalid="fieldErrors.name ? 'true' : undefined"
          :aria-describedby="fieldErrors.name ? fieldId('name-error') : undefined"
          @blur="touched.name = true"
        />
        <small v-if="fieldErrors.name" :id="fieldId('name-error')" class="field-error">
          {{ fieldErrors.name }}
        </small>
      </div>

      <div class="field">
        <label :for="fieldId('quantity')">{{ t('form.quantity') }}</label>
        <input
          :id="fieldId('quantity')"
          ref="quantityInput"
          v-model.number="form.quantity"
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
          :class="{ invalid: fieldErrors.quantity }"
          :aria-invalid="fieldErrors.quantity ? 'true' : undefined"
          :aria-describedby="fieldErrors.quantity ? fieldId('quantity-error') : undefined"
          @blur="touched.quantity = true"
        />
        <small v-if="fieldErrors.quantity" :id="fieldId('quantity-error')" class="field-error">
          {{ fieldErrors.quantity }}
        </small>
      </div>

      <div class="field">
        <label :for="fieldId('unit-price')">{{ t('form.unitPrice') }}</label>
        <input
          :id="fieldId('unit-price')"
          ref="unitPriceInput"
          v-model.number="form.unit_price"
          type="number"
          min="0.01"
          step="0.01"
          inputmode="decimal"
          :class="{ invalid: fieldErrors.unit_price }"
          :aria-invalid="fieldErrors.unit_price ? 'true' : undefined"
          :aria-describedby="fieldErrors.unit_price ? fieldId('unit-price-error') : undefined"
          @blur="touched.unit_price = true"
        />
        <small
          v-if="fieldErrors.unit_price"
          :id="fieldId('unit-price-error')"
          class="field-error"
        >
          {{ fieldErrors.unit_price }}
        </small>
      </div>
    </div>

    <AlertMessage v-if="serverErrorCode" :message="t(`errors.${serverErrorCode}`)" />
    <AlertMessage
      v-if="successName"
      type="success"
      :message="t('form.success', { name: successName })"
    />

    <div class="buttons">
      <button type="submit" :disabled="isSubmitting">
        <template v-if="isEditing">{{ isSubmitting ? t('form.saving') : t('form.save') }}</template>
        <template v-else>{{ isSubmitting ? t('form.submitting') : t('form.submit') }}</template>
      </button>
      <button v-if="isEditing" type="button" class="secondary" @click="emit('done')">
        {{ t('form.cancel') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.grocery-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  padding: var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.grocery-form.embedded {
  margin: 0;
  padding: 0;
  border: none;
  box-shadow: none;
}

h2 {
  margin: 0;
  font-size: 1.1rem;
}

.fields {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-md);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

label {
  font-size: 0.9rem;
  font-weight: 500;
}

input {
  padding: var(--space-sm) var(--space-md);
  font: inherit;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(47 125 79 / 15%);
}

input.invalid {
  border-color: var(--color-error);
}

.field-error {
  color: var(--color-error);
  font-size: 0.85rem;
}

.buttons {
  display: flex;
  gap: var(--space-sm);
}

button {
  font-weight: 600;
  color: white;
  background: var(--color-primary);
  border: none;
}

button:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

button.secondary {
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

button.secondary:hover:not(:disabled) {
  background: var(--color-background);
}

/* One field per line on small screens */
@media (max-width: 600px) {
  .fields {
    grid-template-columns: 1fr;
  }
}
</style>

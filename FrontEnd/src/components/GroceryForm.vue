<script setup>
import { computed, reactive, ref } from 'vue'
import { useI18n } from '../i18n/useI18n'
import { useGroceryList } from '../composables/useGroceryList'
import { validateItem, NAME_MAX_LENGTH, QUANTITY_MAX, UNIT_PRICE_MAX } from '../utils/validateItem'
import AlertMessage from './AlertMessage.vue'

const { t } = useI18n()
const { createItem } = useGroceryList()

const FIELDS = ['name', 'quantity', 'unit_price']

const emptyForm = () => ({ name: '', quantity: 1, unit_price: '' })

const form = reactive(emptyForm())
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

/** Shows a field's error only once the user left the field or tried to submit. */
function fieldError(field) {
  if (!touched[field] && !submitted.value) return ''
  const code = errors.value[field]
  return code ? t(`errors.${code}`, { max: MAX_BY_FIELD[field] }) : ''
}

function resetForm() {
  Object.assign(form, emptyForm())
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
    const result = await createItem({
      name: form.name.trim(),
      quantity: form.quantity,
      unit_price: form.unit_price,
    })

    if (!result.success) {
      serverErrorCode.value = result.code
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
</script>

<template>
  <form
    class="grocery-form"
    novalidate
    :aria-busy="isSubmitting"
    @submit.prevent="submit"
    @input="successName = ''"
  >
    <h2>{{ t('form.title') }}</h2>

    <div class="fields">
      <div class="field">
        <label for="item-name">{{ t('form.name') }}</label>
        <input
          id="item-name"
          ref="nameInput"
          v-model="form.name"
          type="text"
          autocomplete="off"
          :class="{ invalid: fieldError('name') }"
          :aria-invalid="fieldError('name') ? 'true' : undefined"
          :aria-describedby="fieldError('name') ? 'item-name-error' : undefined"
          @blur="touched.name = true"
        />
        <small v-if="fieldError('name')" id="item-name-error" class="field-error">
          {{ fieldError('name') }}
        </small>
      </div>

      <div class="field">
        <label for="item-quantity">{{ t('form.quantity') }}</label>
        <input
          id="item-quantity"
          ref="quantityInput"
          v-model.number="form.quantity"
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
          :class="{ invalid: fieldError('quantity') }"
          :aria-invalid="fieldError('quantity') ? 'true' : undefined"
          :aria-describedby="fieldError('quantity') ? 'item-quantity-error' : undefined"
          @blur="touched.quantity = true"
        />
        <small v-if="fieldError('quantity')" id="item-quantity-error" class="field-error">
          {{ fieldError('quantity') }}
        </small>
      </div>

      <div class="field">
        <label for="item-unit-price">{{ t('form.unitPrice') }}</label>
        <input
          id="item-unit-price"
          ref="unitPriceInput"
          v-model.number="form.unit_price"
          type="number"
          min="0.01"
          step="0.01"
          inputmode="decimal"
          :class="{ invalid: fieldError('unit_price') }"
          :aria-invalid="fieldError('unit_price') ? 'true' : undefined"
          :aria-describedby="fieldError('unit_price') ? 'item-unit-price-error' : undefined"
          @blur="touched.unit_price = true"
        />
        <small v-if="fieldError('unit_price')" id="item-unit-price-error" class="field-error">
          {{ fieldError('unit_price') }}
        </small>
      </div>
    </div>

    <AlertMessage v-if="serverErrorCode" :message="t(`errors.${serverErrorCode}`)" />
    <AlertMessage
      v-if="successName"
      type="success"
      :message="t('form.success', { name: successName })"
    />

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? t('form.submitting') : t('form.submit') }}
    </button>
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

h2 {
  margin: 0;
  font-size: 1.1rem;
}

.fields {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-md);
}

/* One field per line on small screens */
@media (max-width: 600px) {
  .fields {
    grid-template-columns: 1fr;
  }
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

button {
  align-self: flex-start;
  padding: var(--space-sm) var(--space-lg);
  font: inherit;
  font-weight: 600;
  color: white;
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
}

button:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
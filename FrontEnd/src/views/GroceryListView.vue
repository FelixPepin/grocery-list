<script setup>
import { onMounted } from 'vue'
import { useI18n } from '../i18n/useI18n'
import { useGroceryList } from '../composables/useGroceryList'
import GroceryForm from '../components/GroceryForm.vue'
import GroceryList from '../components/GroceryList.vue'
import AlertMessage from '../components/AlertMessage.vue'

const { t } = useI18n()
const { items, isLoading, errorCode, fetchItems } = useGroceryList()

onMounted(fetchItems)
</script>

<template>
  <GroceryForm />

  <!-- Error before empty: a failed load is not an empty list -->
  <p v-if="isLoading" class="status">{{ t('list.loading') }}</p>
  <AlertMessage v-else-if="errorCode" :message="t(`errors.${errorCode}`)" />
  <p v-else-if="items.length === 0" class="status">{{ t('list.empty') }}</p>
  <GroceryList v-else :items="items" />
</template>

<style scoped>
.status {
  color: var(--color-text-muted);
}
</style>

<script setup>
import { onMounted } from 'vue'
import GroceryForm from './components/GroceryForm.vue'
import { useI18n } from './i18n/useI18n'
import { useGroceryList } from './composables/useGroceryList'
import GroceryList from './components/GroceryList.vue'
import AlertMessage from './components/AlertMessage.vue'

const { t } = useI18n()
const { items, isLoading, errorCode, fetchItems } = useGroceryList()

onMounted(fetchItems)
</script>

<template>
  <main class="app">
    <h1>{{ t('app.title') }}</h1>
    <GroceryForm />
    <p v-if="isLoading" class="status">{{ t('list.loading') }}</p>
    <AlertMessage v-else-if="errorCode" :message="t(`errors.${errorCode}`)" />
    <p v-else-if="items.length === 0" class="status">{{ t('list.empty') }}</p>
    <GroceryList v-else :items="items" />
  </main>
</template>

<style scoped>
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-md);
}

h1 {
  margin: 0 0 var(--space-lg);
  font-family: var(--font-title);
  font-weight: 400;
  font-size: 2.2rem;
  color: var(--color-primary);
}

.status {
  color: var(--color-text-muted);
}
</style>

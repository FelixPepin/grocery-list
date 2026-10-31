<script setup>
import GroceryItem from './GroceryItem.vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <ul class="grocery-list">
    <GroceryItem v-for="item in items" :key="item.id" :item="item" />
  </ul>
</template>

<style scoped>
.grocery-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>

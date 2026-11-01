<script setup>
import { useI18n } from '../i18n/useI18n'

const { locale, setLocale, t } = useI18n()

// name is read by screen readers ("FR" alone would be spelled letter by letter)
const LANGUAGES = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
]
</script>

<template>
  <div class="language-toggle" role="group" :aria-label="t('language.label')">
    <button
      v-for="language in LANGUAGES"
      :key="language.code"
      type="button"
      :class="{ active: locale === language.code }"
      :aria-pressed="locale === language.code"
      :aria-label="language.name"
      :lang="language.code"
      @click="setLocale(language.code)"
    >
      {{ language.label }}
    </button>
  </div>
</template>

<style scoped>
.language-toggle {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

button {
  padding: var(--space-xs) var(--space-md);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  border: none;
  /* The group's border is already rounded */
  border-radius: 0;
}

button:hover:not(.active) {
  background: var(--color-background);
}

button.active {
  color: white;
  background: var(--color-primary);
}
</style>

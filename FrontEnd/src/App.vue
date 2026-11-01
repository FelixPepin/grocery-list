<script setup>
import { useI18n } from './i18n/useI18n'
import LanguageToggle from './components/LanguageToggle.vue'

const { t } = useI18n()
</script>

<template>
  <main class="app">
    <header>
      <h1>{{ t('app.title') }}</h1>
      <LanguageToggle />
    </header>
    <nav :aria-label="t('nav.label')">
      <RouterLink to="/">{{ t('nav.list') }}</RouterLink>
      <RouterLink to="/dev-log">{{ t('nav.devLog') }}</RouterLink>
    </nav>

    <RouterView />
  </main>
</template>

<style scoped>
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-md);
}

h1 {
  margin: 0;
  font-family: var(--font-title);
  font-weight: 400;
  font-size: 2.2rem;
  color: var(--color-primary);
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

nav {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

nav a {
  padding: var(--space-sm) 0;
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: none;
  border-bottom: 3px solid transparent;
}

nav a:hover {
  color: var(--color-text);
}

nav a.router-link-active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
</style>

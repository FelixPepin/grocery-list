<script setup>
import { useI18n } from '../i18n/useI18n'
import { devLog } from '../data/devLog'

const { t, locale } = useI18n()

const totalMinutes = devLog.reduce((sum, entry) => sum + entry.minutes, 0)

/** 42 → "42 min", 88 → "1 h 28" */
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return `${hours} h ${String(rest).padStart(2, '0')}`
}
</script>

<template>
  <section>
    <h2>{{ t('devLog.title') }}</h2>
    <p class="intro">{{ t('devLog.intro') }}</p>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">{{ t('devLog.step') }}</th>
            <th scope="col">{{ t('devLog.details') }}</th>
            <th scope="col" class="time">{{ t('devLog.time') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in devLog" :key="entry.step.en">
            <th scope="row">{{ entry.step[locale] }}</th>
            <td>{{ entry.details[locale] }}</td>
            <td class="time">{{ formatDuration(entry.minutes) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colspan="2">{{ t('devLog.total') }}</th>
            <td class="time">{{ formatDuration(totalMinutes) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>
</template>

<style scoped>
h2 {
  margin: 0 0 var(--space-xs);
  font-size: 1.3rem;
}

.intro {
  margin: 0 0 var(--space-lg);
  color: var(--color-text-muted);
}

.table-wrapper {
  overflow-x: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--color-border);
}

thead th {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  background: var(--color-background);
}

tbody th {
  font-weight: 600;
  white-space: nowrap;
}

tbody td {
  color: var(--color-text-muted);
}

.time {
  text-align: right;
  white-space: nowrap;
}

tbody td.time {
  font-weight: 500;
  color: var(--color-text);
}

tfoot th,
tfoot td {
  font-weight: 700;
  border-bottom: none;
}

tfoot td.time {
  font-size: 1.1rem;
  color: var(--color-primary);
}
</style>

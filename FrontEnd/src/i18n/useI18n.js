import { ref } from 'vue'
import { messages } from './messages'

const STORAGE_KEY = 'grocery-list-locale'

// Declared outside useI18n(): every component shares the same language
const locale = ref(getInitialLocale())
document.documentElement.lang = locale.value

/** Saved choice first, then the browser language, then English. */
function getInitialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved in messages) return saved
  } catch {
    // localStorage can be blocked (private mode): fall back to the browser language
  }
  return navigator.language.startsWith('fr') ? 'fr' : 'en'
}

export function useI18n() {
  /**
   * Returns the text for a key like 'list.empty', in the active language.
   * Placeholders like {max} are replaced by the matching value in params.
   */
  function t(key, params = {}) {
    const text = key.split('.').reduce((obj, part) => obj?.[part], messages[locale.value])
    if (typeof text !== 'string') return key
    return text.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match)
  }

  function setLocale(newLocale) {
    locale.value = newLocale
    document.documentElement.lang = newLocale
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {
      // The choice simply won't be remembered
    }
  }

  /** Formats a price in Canadian dollars: $1.50 in English, 1,50 $ in French. */
  function formatPrice(value) {
    return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-CA' : 'en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(value)
  }

  return { locale, t, setLocale, formatPrice }
}
import { describe, it, expect, beforeEach } from 'vitest'
import { useI18n } from '../src/i18n/useI18n'

const { t, setLocale, formatPrice } = useI18n()

// The language is shared by the whole app: reset it so tests don't depend on each other
beforeEach(() => {
  localStorage.clear()
  setLocale('en')
})

describe('useI18n', () => {
  it('returns the text of the active language', () => {
    expect(t('list.empty')).toBe('Your list is empty. Add your first item!')

    setLocale('fr')

    expect(t('list.empty')).toBe('Votre liste est vide. Ajoutez votre premier article!')
  })

  it('replaces placeholders with the given values', () => {
    expect(t('errors.NAME_TOO_LONG', { max: 50 })).toBe('Name cannot exceed 50 characters.')
  })

  it('returns the key itself when a translation is missing', () => {
    expect(t('errors.UNKNOWN_CODE')).toBe('errors.UNKNOWN_CODE')
  })

  it('remembers the chosen language and updates <html lang>', () => {
    setLocale('fr')

    expect(localStorage.getItem('grocery-list-locale')).toBe('fr')
    expect(document.documentElement.lang).toBe('fr')
  })

  it('formats prices in Canadian dollars for each language', () => {
    expect(formatPrice(1.5)).toBe('$1.50')

    setLocale('fr')

    // \s matches the non-breaking space Intl puts before the $ sign in French
    expect(formatPrice(1.5)).toMatch(/^1,50\s\$$/)
  })
})
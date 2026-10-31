import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // Node 25+ has its own localStorage that hides jsdom's (and is undefined without
      // --localstorage-file): turn it off so tests use jsdom's
      execArgv: ['--no-experimental-webstorage'],
      include: ['tests/**/*.test.js'],
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)

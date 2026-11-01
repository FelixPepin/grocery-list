import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'
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
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['tests/setup.js'],
    },
  }),
)

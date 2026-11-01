import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      execArgv: ['--no-experimental-webstorage'],
      include: ['tests/**/*.test.js'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['tests/setup.js'],
    },
  }),
)

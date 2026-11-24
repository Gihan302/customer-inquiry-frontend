import { defineConfig, mergeConfig } from 'vitest/config'
// "nodenext" module resolution (tsconfig.node.json) requires the file extension.
import viteConfig from './vite.config.ts'

// Test settings, layered on top of the normal Vite config (same React plugin).
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // jsdom = a simulated browser DOM inside Node, so components can render without a real browser.
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
      restoreMocks: true,
      // Simulated typing is character-by-character; allow headroom on slower machines.
      testTimeout: 15_000,
    },
  }),
)

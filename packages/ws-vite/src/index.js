import { defineConfig } from 'vite';
import { wsViteConfig, wsVitePlugin as wsVitePlugin_ } from './plugin.js';

function wsVite(options) {
  return defineConfig(
    async (viteOptions) => await wsViteConfig({
      ...options,
    }, viteOptions)
  );
}

export default wsVite;

export const wsVitePlugin = wsVitePlugin_;

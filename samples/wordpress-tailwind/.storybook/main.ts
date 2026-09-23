import { StorybookConfig } from '@storybook/html-vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/templates/**/*.stories.@(ts|js)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  staticDirs: ['../src/public'],
  viteFinal: async (cfg) =>
    mergeConfig(cfg, {
      plugins: [tailwindcss()],
      resolve: {
        // lets colocated stories import helpers as '~sb/twig' without ../../../.. chains
        alias: { '~sb': fileURLToPath(new URL('.', import.meta.url)) },
      },
      server: {
        watch: {
          // Prevent Vite from watching build outputs and unrelated dirs, which
          // causes HMR flood loops when those files change during dev.
          ignored: [
            '**/storybook-static/**',
            '**/node_modules/**',
            '**/.vite/**',
            '**/dist/**',
            '**/.turbo/**',
            '**/*.md',
          ],
        },
      },
    }),
};

export default config;

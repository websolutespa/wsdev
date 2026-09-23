import { Preview } from '@storybook/html-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import { injectSpritemap } from './spritemap';
import { injectFonts } from './fonts';
import { initModules } from './modules';
import './preview.css';

injectSpritemap();
injectFonts();

// Tracks the previous story's module dispose() so it runs before the next
// story initializes its own [data-module] components.
let disposeCurrent: (() => void) | undefined;

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
    // Production parity: auto-init [data-module] after render. play() may still call
    // initModules(canvasElement): the :not(.init) guard makes a second init a no-op.
    (story, ctx) => {
      disposeCurrent?.();
      disposeCurrent = undefined;
      const result = story();
      queueMicrotask(() => {
        if (ctx.canvasElement) {
          void initModules(ctx.canvasElement as HTMLElement).then((dispose) => {
            disposeCurrent = dispose;
          });
        }
      });
      return result;
    },
  ],
  parameters: {
    // Native Storybook 10 source-code panel: shows the rendered HTML of the
    // current story in the addons panel (replaces the autodocs pages).
    docs: { codePanel: true },
    a11y: { test: 'todo' },
    viewport: {
      options: {
        mobile: { name: 'Mobile', styles: { width: '390px', height: '844px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
    },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Base', 'Blocks', 'Forms'],
      },
    },
  },
};

export default preview;

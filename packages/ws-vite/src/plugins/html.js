import { isHtml } from './html/isHtml.js';
import { minifyHtml } from './html/minify.js';
import { prettifyHtml } from './html/prettify.js';

export function htmlPlugin(userOptions) {
  if (!userOptions) {
    return false;
  }
  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }
  const options = {
    prettify: true,
    minify: true,
    filter: /.+\.html/,
    ...userOptions,
  };
  let currentConfig;
  return {
    name: 'vite:html',
    enforce: 'post',

    configResolved(resolved) {
      currentConfig = resolved;
    },

    async transformIndexHtml(html, { filename }) {
      if (!isHtml(filename, options.filter)) {
        return;
      }
      if (currentConfig.command === 'serve' && options.prettify) {
        return prettifyHtml(html);
      }
      if (currentConfig.command === 'build') {
        if (options.minify) {
          return minifyHtml(html, options.minify);
        } else if (options.prettify) {
          return prettifyHtml(html, options.prettify);
        }
      }
    },

  };
}

import { PurgeCSS } from 'purgecss';

export const purgePlugin = (userOptions) => {
  if (!userOptions) {
    return false;
  }
  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }
  const options = {
    ...userOptions,
  };
  // console.log('[vite-purge]', options);
  let _html = '';
  const safeList = options.safeList || [];
  let currentConfig;
  return {
    name: 'vite:purge',
    enforce: 'post',

    configResolved(resolved) {
      currentConfig = resolved;
    },

    transformIndexHtml(html) {
      _html += html;
    },

    async generateBundle(_options, bundle) {
      const cssFiles = Object.keys(bundle).filter(key => key.endsWith('.css'));
      if (!cssFiles) return;
      for (const file of cssFiles) {
        const purged = await new PurgeCSS().purge({
          content: [{ raw: _html, extension: 'html' }],
          css: [{ raw: bundle[file].source }],
          safelist: safeList,
        });
        bundle[file].source = purged[0].css;
      }
    },
  };
};

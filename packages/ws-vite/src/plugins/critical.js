import * as criticalModule from 'critical';

export const criticalPlugin = (userOptions) => {
  if (!userOptions) {
    return false;
  }
  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }
  const options = {
    ...userOptions,
  };
  // console.log('[vite-critical]', options);
  let currentConfig;
  return {
    name: 'vite:critical',
    enforce: 'post',

    configResolved(resolved) {
      currentConfig = resolved;
    },

    async generateBundle(_options, bundle) {
      const htmlFiles = Object.keys(bundle).filter(key => key.endsWith('.html'));
      if (!htmlFiles) return;
      for (const file of htmlFiles) {
        criticalModule.generate({
          inline: true,
          html: bundle[file].source,
          base: `${userOptions.dist}/`,
          target: {
            html: bundle[file].fileName,
          },
          ignore: {
            atrule: ['@font-face'],
          },
        });
      }
    },
  };
};

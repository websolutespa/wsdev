import Vituum from 'vituum';

export const vituumPlugin = (userOptions = {}) => {
  /*
  if (!userOptions) {
    return false;
  }
  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }
  */
  const options = {
    pages: {
      /**
       * default './src'
       * determines where does pages routing work by default outside of pages directory.
       * path is relative to vite root.
       */
      root: './',
      /**
       * default './src/pages'
       * directory where your .html or template engine page files are located.
       * requests are auto-redirected to this directory.
       * path is relative to vite root.
       */
      dir: './',
      ignoredPaths: [],
      normalizeBasePath: true,
    },
    imports: {
      filenamePattern: {
        '+.css': [],
        '+.scss': '/css',
      },
    },
    ...userOptions,
  };
  // console.log('[vite-vituum]', options);
  return Vituum(options);
};

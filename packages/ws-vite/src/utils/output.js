
export const output = (options) => {
  const isBuilding = options.command === 'build' || options.ssr;
  const isDev = options.mode === 'development';
  const output = {
    entryFileNames: (info) => {
      console.log('entryFileNames', info);
      if (isBuilding) {
        return `js/${info.name.replace(/\.twig|\.liquid/g, '')}.min.js`;
      }
      return 'js/[name].js';
    },
    chunkFileNames: (info) => {
      console.log('chunkFileNames', info);
      if (isBuilding) {
        return `js/${info.name.replace(/\.twig|\.liquid/g, '')}.min.js`;
      }
      return 'js/[name].js';
    },
    assetFileNames: (info) => {
      console.log('assetFileNames', info.name, info.type);
      if (info.name.indexOf('.css') !== -1) {
        return `css/[name]${isBuilding ? '' : '.min'}.[ext]`;
      } else {
        return 'assets/[name].[ext]';
      }
    },
    sourcemap: true,
  };
  console.log('[vite-output]', output);
  return output;
};

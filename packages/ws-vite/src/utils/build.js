import { input } from './input.js';
import { output } from './output.js';

export const build = (options) => {
  const isBuilding = options.command === 'build' || options.ssr;
  const isDev = options.mode === 'development';
  const build = {
    outDir: options.paths.distPath,
    emptyOutDir: true,
    rollupOptions: {
      input: input(options),
      output: output(options),
    },
    minify: isBuilding ? 'terser' : 'esbuild',
    cssMinify: 'esbuild',
    sourcemap: true,
    reportCompressedSize: false,
    // manifest: true,
    // cssCodeSplit: true, // default
  };
  // console.log('[vite-build]', build);
  return build;
};

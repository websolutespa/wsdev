import glob from 'glob';
import path from 'path';

export const input = (options) => {
  const twig = glob.sync(
    path.resolve(options.paths.srcPath, '*.twig')
  );
  const liquid = glob.sync(
    path.resolve(options.paths.srcPath, '*.liquid')
  );
  const input = [...twig, ...liquid];
  // console.log('[vite-input]', input);
  return input;
};

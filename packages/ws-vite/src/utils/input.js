import { globSync } from 'glob';
import * as path from 'path';

export const input = (options) => {
  const twigInputs = getInputs(options, '.twig');
  const liquidInputs = getInputs(options, '.liquid');
  const input = [...twigInputs, ...liquidInputs];
  // console.log('[vite-input]', input);
  return input;
};

function getInputs(options, extName = '.twig') {
  const pattern = path.join(options.paths.srcPath, `**/*${extName}`).replace(/\\/g, '/');
  const items = globSync(pattern);
  // console.log('items', items);
  const exclusionPattern = path.join(options.paths.srcPath, `templates/**/*${extName}`).replace(/\\/g, '/');
  const excludedItems = globSync(exclusionPattern);
  // console.log('excludedItems', excludedItems);
  return items.filter(x => !excludedItems.includes(x)).map(x => path.relative(options.paths.srcPath, x).replace(/\\/g, '/'));
}

import Liquid from '@vituum/vite-plugin-liquid';
import { getClassNames } from './helpers/classname.js';
import { getEntries } from './helpers/entries.js';
import { getIcon } from './helpers/icon.js';
import { getImage } from './helpers/image.js';
import { getJson, toJson } from './helpers/json.js';
import { getStyle } from './helpers/style.js';

export const liquidPlugin = (userOptions) => {
  if (!userOptions) {
    return false;
  }
  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }
  const breakpoint = userOptions.globals.theme.breakpoint;
  const options = {
    /**
     * default null
     * root is inherited from vite root by default.
     * but you can change this to path such as './src/' or './src/templates',
     * then you can use includes with paths defaulting to this directory.
     */
    // root: null,
    /**
     * default: ['src/data/**\/*.json']
     * path to additional data provided with json file.
     * can be a file, or a glob like this /path/to/*.jsom.
     */
    data: ['./theme/**/*.json'],
    filters: {
      classNames: getClassNames,
      entries: getEntries,
      icon: getIcon,
      image: getImage(breakpoint),
      json: getJson,
      toJson: toJson,
      style: getStyle,
    },
    ...userOptions,
  };
  // console.log('[vite-liquid]', options);
  return Liquid(options);
};

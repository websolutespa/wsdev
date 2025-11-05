import Twig from '@vituum/vite-plugin-twig';
import { getClassNames } from './helpers/classname.js';
import { getEntries } from './helpers/entries.js';
import { htmlDecode, htmlEncode } from './helpers/html.js';
import { getIcon } from './helpers/icon.js';
import { getImage } from './helpers/image.js';
import { jsonParse, jsonStringify } from './helpers/json.js';
import { getStyle } from './helpers/style.js';

export const twigPlugin = (userOptions) => {
  if (!userOptions) {
    return false;
  }
  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }
  const breakpoint = userOptions.globals.theme?.breakpoint || {
    xs: 0,
    sm: '768px',
    md: '1024px',
    lg: '1440px',
    xl: '1600px'
  };
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
    functions: {
      classNames: getClassNames,
      entries: getEntries,
      htmlDecode,
      htmlEncode,
      icon: getIcon,
      image: getImage(breakpoint),
      jsonParse,
      jsonStringify,
      style: getStyle,
    },
    ...userOptions,
    /*
    globals: {
      theme: (...args) => {
        console.log('test', args);
      },
      test: (...args) => {
        console.log('test', args);
      },
    },
    */
  };
  // console.log('[vite-twig]', options);
  return Twig(options);
};

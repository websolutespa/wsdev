import cors from 'cors';
import Debug from 'debug';
import getEtag from 'etag';
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'pathe';
import { optimize } from 'svgo';
import { normalizePath } from 'vite';
import { pascalCaseToKebabCase } from './helpers/babelcase.js';
import { getIdByKey, isUrlOfKey } from './helpers/server.js';

const XMLNS = 'http://www.w3.org/2000/svg';
const XLINK = 'http://www.w3.org/1999/xlink';

const SPRITEMAP_ID = 'virtual:spritemap';
const ICONS_ID = 'virtual:icons';

const debug = Debug.debug('vite:icons');

export function iconsPlugin(userOptions) {
  if (!userOptions) {
    return false;
  }
  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }

  const options = {
    insert: 'after',
    pattern: 'icon-[dir]-[name]',
    spritemapId: 'spritemap',
    svg: true,
    dirs: [],
    ...userOptions,
  };

  const cache = new Map();

  const { pattern } = options;
  if (!pattern.includes('[name]')) {
    throw new Error('pattern must contain [name] token');
  }

  debug('plugin options:', options);

  let currentConfig;

  return {
    name: 'vite:icons',
    enforce: 'post',

    configResolved(resolved) {
      currentConfig = resolved;
      debug('configResolved:', resolved);
    },

    resolveId(id) {
      if ([SPRITEMAP_ID, ICONS_ID].includes(id)) {
        return getIdByKey(id);
      }
      return null;
    },

    async load(id, ssr) {
      const isBuild = currentConfig.command === 'build';
      if (!isBuild && !ssr) {
        return null;
      }
      const isSpritemap = id.endsWith(SPRITEMAP_ID);
      const isIcons = id.endsWith(ICONS_ID);
      if (!isSpritemap && !isIcons) {
        return null;
      }
      if (isBuild) {
        const { spritemap, icons } = await collectSpritemapAndIcons(cache, options);
        if (isSpritemap) {
          return spritemap;
        }
        if (isIcons) {
          return icons;
        }
      } else {
        return 'export default {}';
      }
    },

    configureServer: ({ middlewares }) => {
      middlewares.use(cors({ origin: '*' }));
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url);
        if (
          isUrlOfKey(url, SPRITEMAP_ID) ||
          isUrlOfKey(url, ICONS_ID)
        ) {
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cache-Control', 'no-cache');
          const { spritemap, icons } = await collectSpritemapAndIcons(cache, options);
          const content = isUrlOfKey(url, SPRITEMAP_ID) ?
            spritemap :
            icons;
          res.setHeader('Etag', getEtag(content, { weak: true }));
          res.statusCode = 200;
          res.end(content);
        } else {
          next();
        }
      });
    },

  };
}

export async function collectSpritemapAndIcons(cache, options) {
  const { spritemap, icons } = await loadSpritemapAndIcons(cache, options);
  const xmlns = `xmlns="${XMLNS}"`;
  const xmlnsLink = `xmlns:xlink="${XLINK}"`;
  const cleanedSpritemap = spritemap
    .replace(new RegExp(xmlns, 'g'), '')
    .replace(new RegExp(xmlnsLink, 'g'), '');
  const spritemapModule = `
if (typeof window !== 'undefined') {
  function loadSpritemap() {
    var body = document.body;
    var spritemap = document.getElementById('${options.spritemapId}');
    if(!spritemap) {
      spritemap = document.createElementNS('${XMLNS}', 'svg');
      spritemap.style.position = 'absolute';
      spritemap.style.width = '0';
      spritemap.style.height = '0';
      spritemap.setAttribute('xmlns','${XMLNS}');
      spritemap.setAttribute('xmlns:link','${XLINK}');
      spritemap.id = '${options.spritemapId}';
    }
    spritemap.innerHTML = ${JSON.stringify(cleanedSpritemap)};
    body.insertBefore(spritemap, body.${options.insert === 'before' ? 'firstChild' : 'lastChild'});
  }
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSpritemap);
  } else {
    loadSpritemap()
  }
}
`;
  return {
    spritemap: `${spritemapModule}
export default {}`,
    icons: `export default ${JSON.stringify(Array.from(icons))}`,
  };
}

/**
 * Preload all icons in advance
 * @param cache
 * @param options
 */
export async function loadSpritemapAndIcons(cache, options) {
  const { dirs } = options;
  let spritemap = '';
  const icons = new Set();
  for (const dir of dirs) {
    const stats = fg.sync('**/*.svg', {
      cwd: dir,
      stats: true,
      absolute: true,
    });
    for (const entry of stats) {
      const path = entry.path;
      const stats = entry.stats;
      const timestamp = stats.mtimeMs;
      const cached = cache.get(path);
      let icon;
      let id;
      const getSymbol = async () => {
        const normalized = normalizePath(path).replace(
          normalizePath(dir + '/'), ''
        );
        id = getId(normalized, options);
        icon = await loadIcon(path, id);
        icons.add(id);
      };
      if (cached) {
        if (cached.timestamp !== timestamp) {
          await getSymbol();
        } else {
          icon = cached.icon;
          id = cached.id;
          id && icons.add(id);
        }
      } else {
        await getSymbol();
      }
      icon && cache.set(path, { icon, id, timestamp });
      spritemap += icon || '';
    }
  }
  return { spritemap, icons };
}

/**
 *
 * @param {string} path
 * @param {string} id
 * @returns
 */
export async function loadIcon(path, id) {
  if (!path) {
    return null;
  }
  const content = fs.readFileSync(path, 'utf-8');
  const symbol = await optimizeIcon(content, id);
  return symbol;
}

export function getId(relativeName, options) {
  const { pattern } = options;
  if (!pattern) {
    return relativeName;
  }
  let id = pattern;
  let currentName = relativeName;
  const { filename = '', folder } = discreteDir(relativeName);
  if (pattern.includes('[dir]')) {
    id = id.replace(/\[dir\]/g, folder);
    if (!folder) {
      id = id.replace('--', '-');
    }
    currentName = filename;
  }
  id = id.replace(/\[name\]/g, currentName);
  return id.replace(path.extname(id), '');
}

async function optimizeIcon(icon, id) {
  // const pascalCase = toPascalCase(`icon-${fileName.replace('.svg', '')}`);
  id = pascalCaseToKebabCase(id);
  const optimized = optimize(icon, {
    multipass: false,
    /*
    datauri: 'base64',
    */
    js2svg: {
      indent: 2, // string with spaces or number of spaces. 4 by default
      pretty: true, // boolean, false by default
    },
    plugins: [
      /*
      {
        name: 'preset-default',
        params: {
          overrides: {
            // customize default plugin options
            inlineStyles: {
              onlyMatchedOnce: false,
            },
            removeDoctype: false,
          },
        },
      },
      */
      'collapseGroups',
      'removeDimensions',
      {
        name: 'replaceAttributesToSVGElement',
        type: 'visitor',
        params: {
          attributes: {
            id: id,
            fill: 'currentColor',
            stroke: 'currentColor',
          },
        },
        fn: (root, params) => {
          if (typeof params.attributes !== 'object') {
            console.error('Error in plugin "addAttributesToSVGElement": absent parameters.');
            return null;
          }
          const attributes = params.attributes;
          return {
            element: {
              enter: (node, parentNode) => {
                // !!! todo: create viewBox if not present
                Object.entries(attributes).forEach(([key, value]) => {
                  switch (key) {
                    case 'fill':
                    case 'stroke':
                      if (node.attributes[key] && node.attributes[key] !== 'none') {
                        node.attributes[key] = value;
                      }
                      break;
                    default:
                      if (node.name === 'svg' && parentNode.type === 'root') {
                        node.attributes[key] = value;
                      }
                  }
                });
              },
            },
          };
        },
      },
      {
        name: 'sortAttrs',
        params: {
          xmlnsOrder: 'alphabetical',
        },
      },
      // 'prefixIds',
    ],
  });
  const optimizedIcon = optimized.data
    .replace(/(<svg)((\w|\W)*?)(<\/svg>)/gm,
      function(m, g1, g2, g3, g4) {
        return `<symbol${g2}</symbol>`;
        // console.log('args', g1, g3, g4);
      }
    );
  return optimizedIcon;
}

export function discreteDir(relativeName) {
  if (!normalizePath(relativeName).includes('/')) {
    return {
      filename: relativeName,
      folder: '',
    };
  }
  const segments = relativeName.split('/');
  const filename = segments.pop();
  const folder = segments.join('-');
  return { filename, folder };
}

function isSvg(fileName) {
  return fileName && fileName.indexOf('.svg') !== -1;
}

import fg from 'fast-glob';
import * as fs from 'fs';
import { getIdByKey } from './helpers/server.js';
import { renderTheme } from './theme/theme.js';

const cache = new Map();

export const themePlugin = (userOptions) => {
  if (!userOptions) {
    return false;
  }
  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }
  const options = {
    ...userOptions,
  };

  const MODULE_ID = 'virtual:theme';
  const CSS_ID = 'virtual:theme.css';

  let currentConfig;
  let renderedTheme;

  return {
    order: 'pre',
    name: 'vite:theme',

    configResolved(resolved) {
      currentConfig = resolved;
      renderedTheme = renderTheme(options);
      setPreprocessorOptions(currentConfig, renderedTheme.scssVars);
    },

    resolveId(id) {
      if ([MODULE_ID, CSS_ID].includes(id)) {
        return getIdByKey(id);
      }
      return null;
    },

    async load(id, ssr) {
      // console.log(id);
      if (id === getIdByKey(MODULE_ID)) {
        return {
          code: `export default ${JSON.stringify(renderedTheme.theme)};`,
          id,
        };
      }
      if (id === getIdByKey(CSS_ID)) {
        return {
          code: renderedTheme.cssVars,
          id,
        };
      }
      /*
      if ([getIdByKey(MODULE_ID), getIdByKey(CSS_ID)].includes(id)) {
        const themes = await getThemes();
        let code = '';
        if (id === getIdByKey(MODULE_ID)) {
          code = `export default ${JSON.stringify(themes[0].theme)};`;
          const scssVars = themes.map(x => x.scssVars).join('/n');
        } else {
          code = themes.map(x => x.cssVars).join('/n');
        }
        return {
          id,
          code,
        };
      }
      */
    },

    /*
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'README.md',
        source: `
#README
`,
      });
    },
    */

  };
};

function setPreprocessorOptions(currentConfig, scssVars) {
  const css = currentConfig.css || (currentConfig.css = {});
  const preprocessorOptions = css.preprocessorOptions || (css.preprocessorOptions = {});
  const scss = preprocessorOptions.scss || (preprocessorOptions.scss = {});
  scss.additionalData = (scss.additionalData || '') + scssVars;
  // console.log(scssVars);
  // console.log('theme.useScssVars', scss.additionalData);
}

async function getTheme(filepath) {
  let json = fs.readFileSync(filepath, 'utf-8');
  const theme = JSON.parse(json);
  const renderedTheme = renderTheme(theme); // { cssVars, scssVars }
  return renderedTheme;
}

async function getThemes(currentConfig) {
  let themes = [];
  const filestats = fg.sync('theme/theme.json', {
    cwd: currentConfig.root,
    stats: true,
    absolute: true,
  });
  // console.log('filestats', filestats);
  for (const entry of filestats) {
    const { path: filepath, stats: {
      mtimeMs,
    } = {} } = entry;
    let theme = '';
    const cached = cache.get(filepath);
    if (cached && cached.mtimeMs === mtimeMs) {
      theme = cached.theme;
    } else {
      theme = await getTheme(filepath);
      cache.set(filepath, { mtimeMs, theme });
      // console.log('theme', theme);
    }
    themes.push(theme);
  }
  return themes;
}

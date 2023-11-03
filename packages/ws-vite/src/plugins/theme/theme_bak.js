import { toKebabCase } from '../helpers/babelcase.js';

function getSassBreakpoints(theme, nameAndValues) {
  const mediaQuery = Object.entries(theme.mediaQuery || {});
  // console.log('mediaQuery', mediaQuery);
  return mediaQuery.length > 0 ? (`
$breakpoint: (${mediaQuery.map(kv => `
"${kv[0]}": ${kv[1]}`).join(',')});
`) : '';
}

function getSassTypography(theme, nameAndValues) {
  const font = Object.entries(theme.font || {});
  // console.log('font', font);
  return font.length > 0 ? (`
$typography: (${font.map(kv => `"${kv[0]}"`).join(',')});
`) : '';
}

function getMediaQuery(theme, nameAndValues) {
  const mediaQuery = Object.entries(theme.mediaQuery || {});
  // console.log('mediaQuery', mediaQuery);
  return mediaQuery.map(([media, value], i) => {
    if (i > 0) {
      const rules = nameAndValues.names.filter(key => key.match(new RegExp(`-${media}$`))).map((key, i) => {
        const mediaKey = key.replace(`-${media}`, '').replace('-default', '');
        return `    --${mediaKey}: var(--${key});`;
      }).join('\n');
      return `
  @media (min-width: ${value}) {
${rules}
  };`;
    } else {
      const rules = nameAndValues.names.filter(key => key.match(new RegExp(`-${media}$`))).map((key, i) => {
        const mediaKey = key.replace('-xs', '').replace('-default', '');
        return `  --${mediaKey}: var(--${key});`;
      }).join('\n');
      return rules;
    }
  }).join('\n');
}

function collectNameAndValues(object, parentKey = '', collection = { names: [], values: [] }) {
  if (object) {
    Object.entries(object).forEach(([key, value]) => {
      key = (parentKey.length ? `${parentKey}-` : '') + toKebabCase(key);
      if (value && typeof value === 'object') {
        collection = collectNameAndValues(value, key, collection);
      } else if (typeof value === 'string' || typeof value === 'number') {
        collection.names.push(key);
        collection.values.push(value);
      }
    });
  }
  return collection;
}

export function renderTheme(theme) {
  const nameAndValues = collectNameAndValues(theme);
  // console.log('nameAndValues', nameAndValues);
  const defaultNames = [];
  nameAndValues.names.filter(key => key.match(/^\w+-default-/)).forEach((key, i) => {
    const name = key.replace('-default', '').replace(/-(xs|sm|md|lg|xl)$/, '');
    if (!defaultNames.includes(name)) {
      defaultNames.push(name);
    }
  });
  /**
   * scssVars
   */
  const scssVars = `${nameAndValues.names.map((key, i) => {
    switch (key) {
      case 'media-query-xs':
      case 'media-query-sm':
      case 'media-query-md':
      case 'media-query-lg':
      case 'media-query-xl':
        return `$${key}: ${nameAndValues.values[i]};`;
      default:
        return `$${key}: var(--${key});`;
    }
  }).join('\n')}
${getSassBreakpoints(theme, nameAndValues)}
${getSassTypography(theme, nameAndValues)}
${defaultNames.map((key, i) => {
    return `$${key}: var(--${key});`;
  }).join('\n')}
`;
  // console.log('scssVars\n', scssVars);
  /**
   * cssVars
   */
  const cssVars = `
:root {
${nameAndValues.names.map((key, i) => {
    const value = nameAndValues.values[i];
    return `  --${key}: ${value};`;
  }).join('\n')}
${nameAndValues.names.filter(key => key.match(/^\w+-default-/)).map((key, i) => {
    const defaultKey = key.replace('-default', '');
    return `  --${defaultKey}: var(--${key});`;
  }).join('\n')}
${getMediaQuery(theme, nameAndValues)}
}
`;
  // console.log('cssVars', cssVars);
  return { scssVars, cssVars, theme, nameAndValues };
}

import { toKebabCase } from '../helpers/babelcase.js';

const S = '  ';

function isNumber(value) {
  return typeof value == 'number';
}

function isString(value) {
  return typeof value == 'string';
}

function isObject(value) {
  return typeof value == 'object' && !Array.isArray(value);
}

function isArray(value) {
  return Array.isArray(value);
}

function isMediaMap(value) {
  if (isObject(value)) {
    const keys = ['xs', 'sm', 'md', 'lg', 'xl'];
    return Object.keys(value).reduce((p, c) => {
      return p && keys.includes(c);
    }, true);
  }
  return false;
}

function isList(value) {
  if (isArray(value)) {
    return value.reduce((p, c) => {
      return p && (isNumber(c) || isList(c));
    }, true);
  }
  return false;
}

function isListOfMany(value) {
  return isList(value) && value.length > 2;
}

function isListOfTwo(value) {
  return isList(value) && value.length == 2;
}

function isVariant(value) {
  return isObject(value) && Object.values(value).reduce((p, c) => p && isObject(c), true);
}

function toScssMap(value) {
  const entries = Object.entries(value || {});
  const values = entries.map((kv) => `"${kv[0]}": ${kv[1]}`).join(',');
  return `(${values})`;
}

function toScssList(value) {
  if (isNumber(value)) {
    return value;
  } else {
    return `(${value.map((x) => toScssList(x)).join(', ')})`;
  }
}

function toMinMax(min, max, breakpoint) {
  const low = parseInt(breakpoint.sm);
  const high = parseInt(breakpoint.xl);
  const viewDiff = high - low;
  const diff = max - min;
  return `max(${min}px, min(${max}px, calc(${min}px + (100vw - ${low}px) / ${viewDiff} * ${diff})))`;
}

function parseValue(value, breakpoint, parentKey = '', collection = { names: [], values: [], scss: [], css: [] }) {
  if (value) {
    Object.entries(value).forEach(([key, value]) => {
      if (key === '$schema') {
        return;
      }
      key = (parentKey.length ? `${parentKey}-` : '') + toKebabCase(key);
      key = key.replace('-default', '');
      if (value && typeof value === 'object') {
        if (isMediaMap(value)) {
          collection.names.push(key);
          collection.values.push(value);
          if (key === 'breakpoint') {
            const values = toScssMap(value);
            collection.scss.push(`$${key}: ${values};`);
          } else {
            const css = Object.entries(breakpoint).map(([k, v], i) => {
              let expression = value[k];
              if (!expression) {
                return '';
              }
              if (isListOfTwo(expression)) {
                expression = toMinMax(expression[0], expression[1], breakpoint);
              }
              if (i === 0) {
                return `${S}--${key}: ${expression};`;
              } else {
                return `${S}@media (min-width: ${v}) {
${S}${S}--${key}: ${expression};
${S}}`;
              }
            });
            collection.css.push(...css);
            collection.scss.push(`$${key}: var(--${key});`);
          }
        } else if (isListOfMany(value)) {
          collection.names.push(key);
          collection.values.push(value);
          const values = toScssList(value);
          collection.scss.push(`$${key}: ${values};`);
        } else if (isListOfTwo(value)) {
          collection.names.push(key);
          collection.values.push(value);
          const values = toMinMax(value[0], value[1], breakpoint);
          collection.css.push(`${S}--${key}: ${values};`);
          collection.scss.push(`$${key}: var(--${key});`);
        } else {
          if (isVariant(value) && parentKey === '') {
            const keys = Object.keys(value);
            collection.scss.push(`$${key}: ('${keys.join('\',\'')}');`);
          }
          collection = parseValue(value, breakpoint, key, collection);
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        collection.names.push(key);
        collection.values.push(value);
        collection.css.push(`${S}--${key}: ${value};`);
        collection.scss.push(`$${key}-raw: ${value};`);
        collection.scss.push(`$${key}: var(--${key});`);
      }
    });
  }
  return collection;
}

export function renderTheme(theme) {
  const breakpoint = theme.breakpoint;
  const collection = parseValue(theme, breakpoint);
  collection.cssVars = `
:root {
${collection.css.join('\n')}
}`;
  collection.scssVars = collection.scss.join('\n');
  collection.theme = theme;
  return collection;
}
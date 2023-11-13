/**
 * @param {string[]} elements
 * @param {{ char?: string; count?: number}} options
 * @returns {string}
 */
function indentElements(elements, { char = ' ', count = 2 } = {}) {
  let level = 0;
  const levels = [];
  return elements.reverse().reduce((indented, element) => {
    if (
      levels.length > 0 &&
      levels[level] &&
      /* if current element tag is the same as previously levels one */
      levels[level] === element.substring(1, levels[level].length + 1)
    ) {
      levels.splice(level, 1);
      level--;
    }
    const indentation = char.repeat(level * count);
    const indentedElement = [
      `${indentation}${element}`,
      ...indented,
    ];
    // if current element tag is closing tag
    // add it to levels elements
    if (element.substring(0, 2) === '</') {
      level++;
      levels[level] = element.substring(2, element.length - 1);
    }
    return indentedElement;
  }, []);
}

/**
 * @param {string} html Any non formatted string
 * @returns {string[]} Array of strings separated on new lines
 */
function removeEmptyLines(html) {
  // Replace
  // - 1 or more spaces or tabs at the start of line
  // - 1 or more spaces or tabs at the end of line
  // - empty lines
  // with empty string
  return html.trim().replace(/(^(\s|\t)+|(( |\t)+)$)/gm, '');
}

/**
 * @param {string} html
 * @returns {string[]} Array of strings splitted on new lines without empty lines
 */
function collectElements(html) {
  const lines = removeEmptyLines(html).split(/[\r\n]+/).filter(Boolean);
  const elements = [];
  let element = '';
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    // If line is closing element/tag separate closing tag from rest of the line with space
    if (line.endsWith('/>')) {
      elements.push(`${element}${line.slice(0, -2)} />`);
      element = '';
      // eslint-disable-next-line no-continue
      continue;
    }
    if (line.endsWith('>')) {
      elements.push(`${element}${line.startsWith('>') || line.startsWith('<') ? '' : ' '}${line}`);
      element = '';
      // eslint-disable-next-line no-continue
      continue;
    }
    element += element.length ? ` ${line}` : line;
  }
  return elements;
}

/**
 * @param {string} html
 * @param {{ char?: string; count?: number }} options
 * @returns {string}
 */
export function prettifyHtml(html, options) {
  const codes = {}; let i = 0;
  html = html.replace(/<code>([\S\s]*?)<\/code>/gm, function(match, group) {
    const key = '$$code' + i + '$$';
    i++;
    codes[key] = group;
    return key;
  });
  let elements = collectElements(html);
  if (options === true) {
    options = {};
  }
  elements = indentElements(elements, options);
  html = elements.join('\n');
  Object.entries(codes).forEach(([k, v]) => {
    html = html.replace(k, '<code>' + v + '</code>');
  });
  return html;
}

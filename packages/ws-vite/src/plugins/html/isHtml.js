
export function isHtml(fileName, filter) {
  if (filter instanceof RegExp) {
    return filter.test(fileName);
  }
  if (typeof filter === 'function') {
    return filter(fileName);
  }
  if (typeof filter === 'string') {
    return fileName === filter;
  }
  return true;
}

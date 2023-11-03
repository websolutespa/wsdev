export function getIdByKey(key) {
  return '\0' + key;
}

export function getResolvedId(id, key) {
  if (key.includes(id)) {
    return '\0' + id;
  }
  return null;
}

export function isIdOfKey(id, key) {
  return id === getIdByKey(key);
}

export function isUrlOfKey(text, key) {
  const regExp = new RegExp(`(/@id/)(.+?)(${key})`);
  return text.match(regExp) != null;
}

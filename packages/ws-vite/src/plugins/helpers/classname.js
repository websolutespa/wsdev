
function isClassNameCollection(value) {
  return typeof value === 'object' && !Array.isArray(value);
}

function classNameCollectionToString(className) {
  const keys = Object.keys(className).filter(key => key !== '_keys');
  const total = keys.length;
  let classNames = '';
  for (let i = 0; i < total; i++) {
    const key = keys[i];
    const value = className[keys[i]];
    if (!value) {
      continue;
    }
    classNames = classNames ? `${classNames} ${String(key)}` : String(key);
  }
  return classNames;
}

export function getClassNames(...props) {
  // console.log('getClassNames', props);
  const total = props.length;
  let classNames = '';
  if (total === 0) {
    return classNames;
  }
  for (let i = 0; i < total; i++) {
    const value = props[i];
    if (!value) {
      continue;
    }
    if (isClassNameCollection(value)) {
      classNames += ` ${classNameCollectionToString(value)}`;
    } else {
      classNames += ` ${String(value).trim()}`;
    }
  }
  return classNames.trim();
}

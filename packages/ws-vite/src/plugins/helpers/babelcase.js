
/**
 * PascalCase
 * camelCase
 * kebab-case
 * snake_case
 * char*case
**/

export function unknownCaseToPascalCase(unknownCase) {
  const pascalCase = unknownCase.replace(
    /(^[a-zA-Z])|(\W|_)+(\w?)([a-z0-9]*)?/g,
    (m, g1, g2, g3, g4) =>
      (g1 ? g1.toUpperCase() : '') +
      (g3 ? g3.toUpperCase() : '') +
      (g4 ? g4.toLowerCase() : '')
  );
  // console.log('unknownCaseToPascalCase', unknownCase, pascalCase);
  return pascalCase;
}

export function pascalCaseToCamelCase(pascalCase) {
  const camelCase =
    pascalCase.charAt(0).toLowerCase() +
    pascalCase.slice(1);
  return camelCase;
}

export function pascalCaseToCharCase(pascalCase, char = '-') {
  const charCase = pascalCase.replace(
    /([A-Z]+)/g,
    (m, g1, index) => (index > 0 ? char : '') + m
  ).toLowerCase();
  return charCase;
}

export function pascalCaseToKebabCase(pascalCase) {
  const kebabCase = pascalCaseToCharCase(pascalCase, '-');
  return kebabCase;
}

export function pascalCaseToSnakeCase(pascalCase) {
  const kebabCase = pascalCaseToCharCase(pascalCase, '_');
  return kebabCase;
}

export function toPascalCase(unknownCase) {
  const pascalCase = unknownCaseToPascalCase(unknownCase);
  return pascalCase;
}

export function toCamelCase(unknownCase) {
  const pascalCase = unknownCaseToPascalCase(unknownCase);
  const camelCase = pascalCaseToCamelCase(pascalCase);
  return camelCase;
}

export function toCharCase(unknownCase, char = '-') {
  const pascalCase = unknownCaseToPascalCase(unknownCase);
  const charCase = pascalCaseToCharCase(pascalCase, char);
  return charCase;
}

export function toKebabCase(unknownCase) {
  const kebabCase = toCharCase(unknownCase, '-');
  return kebabCase;
}

export function toSnakeCase(unknownCase) {
  const snakeCase = toCharCase(unknownCase, '_');
  return snakeCase;
}


export function mapErrors_(errors) {
  return Object.keys(errors).map(key => ({ key, value: errors[key] }));
}

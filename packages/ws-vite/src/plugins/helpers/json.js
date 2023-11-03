
export function getJson(json) {
  return JSON.parse(json);
}

export function toJson(json) {
  return JSON.stringify(json, null, 2);
}

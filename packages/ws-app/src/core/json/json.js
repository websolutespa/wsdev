export function Json(item) {
  return JSON.stringify(item, null, 2);
}

Json.meta = {
  name: 'json',
};

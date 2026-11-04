export function groupBy(items, getKey) {
  const groups = new Map();
  for (const item of items) {
    const key = getKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.values()];
}

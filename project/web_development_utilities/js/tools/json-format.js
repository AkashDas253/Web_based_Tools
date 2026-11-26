function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortKeys(value[k])]));
  }
  return value;
}

export function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    const pos = /position (\d+)/.exec(err.message);
    if (!pos) throw new Error("Invalid JSON: " + err.message);
    const before = text.slice(0, +pos[1]).split("\n");
    throw new Error(`Invalid JSON at line ${before.length}, column ${before[before.length - 1].length + 1}: ${err.message}`);
  }
}

export function formatJson(text, { indent = 2, sort = false, minify = false } = {}) {
  if (!text.trim()) return "";
  let value = parseJson(text);
  if (sort) value = sortKeys(value);
  return minify ? JSON.stringify(value) : JSON.stringify(value, null, indent);
}

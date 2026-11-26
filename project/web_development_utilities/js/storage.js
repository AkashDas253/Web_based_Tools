const NS = "web-dev-util:";

export function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function keys() {
  try {
    return Object.keys(localStorage).filter((k) => k.startsWith(NS));
  } catch {
    return [];
  }
}

export function exportAll() {
  const data = {};
  keys().forEach((k) => (data[k.slice(NS.length)] = get(k.slice(NS.length))));
  return JSON.stringify(data, null, 2);
}

export function importAll(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid data file");
  Object.entries(data).forEach(([k, v]) => set(k, v));
  return Object.keys(data).length;
}

export function clearAll() {
  keys().forEach((k) => localStorage.removeItem(k));
}

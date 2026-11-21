
const HISTORY_KEY = "qr-studio-history";
const SETTINGS_KEY = "qr-studio-settings";

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getHistory() {
  return read(HISTORY_KEY, []);
}

export function addHistory(entry) {
  const history = getHistory();
  history.unshift({
    ...entry,
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    date: new Date().toISOString()
  });

  return write(HISTORY_KEY, history.slice(0, 100));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function getSettings() {
  return read(SETTINGS_KEY, {});
}

export function saveSettings(settings) {
  return write(SETTINGS_KEY, settings);
}

export function clearSettings() {
  localStorage.removeItem(SETTINGS_KEY);
}

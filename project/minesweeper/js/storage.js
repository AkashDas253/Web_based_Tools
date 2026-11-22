const STORAGE_KEY = "minesweeper-records-v1";
const THEME_KEY = "minesweeper-theme-v1";

export function getBestTime(level) {
  const records = readRecords();
  return records[level] ?? null;
}

export function saveBestTime(level, seconds) {
  const records = readRecords();
  if (records[level] === undefined || seconds < records[level]) {
    records[level] = seconds;
    write(STORAGE_KEY, records);
    return true;
  }
  return false;
}

export function getTheme() {
  return read(THEME_KEY) || "dark";
}

export function saveTheme(theme) {
  write(THEME_KEY, theme);
}

function readRecords() {
  return read(STORAGE_KEY) || {};
}

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* Storage may be unavailable; the game remains playable. */ }
}

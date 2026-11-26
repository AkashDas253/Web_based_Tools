export const CHARSETS = {
  Alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  Letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  Digits: "0123456789",
  Hex: "0123456789abcdef",
  "Password (with symbols)": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:,.?",
};

function randomIndex(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

export function randomString(length, charset) {
  const chars = CHARSETS[charset];
  if (!chars) throw new Error("Unknown character set: " + charset);
  const n = Number(length);
  if (!Number.isInteger(n) || n < 1 || n > 512) throw new Error("Length must be an integer between 1 and 512.");
  return Array.from({ length: n }, () => chars[randomIndex(chars.length)]).join("");
}

function bytesToUuid(b) {
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export const NIL_UUID = "00000000-0000-0000-0000-000000000000";

export function uuidV4() {
  return crypto.randomUUID();
}

export function uuidV7(now = Date.now()) {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  let t = now;
  for (let i = 5; i >= 0; i--) {
    b[i] = t % 256;
    t = Math.floor(t / 256);
  }
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  return bytesToUuid(b);
}

export const FORMATS = ["Standard", "Uppercase", "No hyphens", "Uppercase, no hyphens"];

export function formatUuid(uuid, style = "Standard") {
  if (!FORMATS.includes(style)) throw new Error("Unknown format: " + style);
  let out = uuid;
  if (style.toLowerCase().includes("no hyphens")) out = out.replace(/-/g, "");
  if (style.includes("Uppercase")) out = out.toUpperCase();
  return out;
}

export function validateUuids(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines
    .map((line) => {
      const hex = line.replace(/^urn:uuid:/i, "").replace(/^\{|\}$/g, "").replace(/-/g, "");
      const grouped = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(line.replace(/^urn:uuid:/i, "").replace(/^\{|\}$/g, ""));
      if (!/^[0-9a-f]{32}$/i.test(hex) || (line.includes("-") && !grouped)) return `${line}: invalid`;
      if (/^0+$/.test(hex)) return `${line}: valid, nil UUID`;
      if (/^f+$/i.test(hex)) return `${line}: valid, max UUID`;
      const variant = "89abAB".includes(hex[16]) ? "RFC 9562 variant" : "non-RFC variant";
      return `${line}: valid, version ${parseInt(hex[12], 16)}, ${variant}`;
    })
    .join("\n");
}

export const KINDS = ["UUID v4", "UUID v7", "Nil UUID", "Random string"];

export function generate(kind, count, length, charset, style = "Standard") {
  const c = Number(count);
  if (!KINDS.includes(kind)) throw new Error("Unknown type: " + kind);
  if (!Number.isInteger(c) || c < 1 || c > 100) throw new Error("Count must be an integer between 1 and 100.");
  const make = { "UUID v4": uuidV4, "UUID v7": () => uuidV7(), "Nil UUID": () => NIL_UUID }[kind];
  return Array.from({ length: c }, () => (make ? formatUuid(make(), style) : randomString(length, charset))).join("\n");
}

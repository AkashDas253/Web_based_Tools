export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function bytesToBase64(bytes, { urlSafe = false, padding = true } = {}) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  let out = btoa(bin);
  if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_");
  if (!padding) out = out.replace(/=+$/, "");
  return out;
}

export function base64ToBytes(text) {
  const clean = text.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  try {
    return Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
  } catch {
    throw new Error("Input is not valid Base64.");
  }
}

export function encode(text, options) {
  return bytesToBase64(new TextEncoder().encode(text), options);
}

export function decode(text) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(base64ToBytes(text));
  } catch {
    throw new Error("Input is not valid Base64 or does not decode to UTF-8 text.");
  }
}

export async function encodeFile(file, options) {
  if (file.size > MAX_FILE_BYTES) throw new Error("The file exceeds the 5 MB limit.");
  return bytesToBase64(new Uint8Array(await file.arrayBuffer()), options);
}

export const VARIANTS = {
  Standard: {},
  "URL-safe": { urlSafe: true },
  "URL-safe, no padding": { urlSafe: true, padding: false },
};

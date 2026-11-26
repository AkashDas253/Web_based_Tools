import { bytesToBase64 } from "./base64.js";

export const ALGORITHMS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];
export const ENCODINGS = ["Hex", "Base64", "Base64URL"];
export const MAX_FILE_BYTES = 100 * 1024 * 1024;

const rotl = (x, c) => ((x << c) | (x >>> (32 - c))) >>> 0;
const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);
const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];

export function md5(bytes) {
  const len = bytes.length;
  const total = Math.ceil((len + 9) / 64) * 64;
  const padded = new Uint8Array(total);
  padded.set(bytes);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(total - 8, (len * 8) >>> 0, true);
  view.setUint32(total - 4, Math.floor(len / 2 ** 29), true);
  let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  for (let off = 0; off < total; off += 64) {
    const M = Array.from({ length: 16 }, (_, j) => view.getUint32(off + 4 * j, true));
    let [A, B, C, D] = [a0, b0, c0, d0];
    for (let i = 0; i < 64; i++) {
      let F;
      let g;
      if (i < 16) [F, g] = [(B & C) | (~B & D), i];
      else if (i < 32) [F, g] = [(D & B) | (~D & C), (5 * i + 1) % 16];
      else if (i < 48) [F, g] = [B ^ C ^ D, (3 * i + 5) % 16];
      else [F, g] = [C ^ (B | ~D), (7 * i) % 16];
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(F, S[(i >> 4) * 4 + (i % 4)])) >>> 0;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }
  const out = new Uint8Array(16);
  const ov = new DataView(out.buffer);
  [a0, b0, c0, d0].forEach((v, i) => ov.setUint32(i * 4, v, true));
  return out;
}

function hmacMd5(key, message) {
  const k = new Uint8Array(64);
  k.set(key.length > 64 ? md5(key) : key);
  const inner = new Uint8Array(64 + message.length);
  const outer = new Uint8Array(64 + 16);
  for (let i = 0; i < 64; i++) {
    inner[i] = k[i] ^ 0x36;
    outer[i] = k[i] ^ 0x5c;
  }
  inner.set(message, 64);
  outer.set(md5(inner), 64);
  return md5(outer);
}

function format(bytes, encoding) {
  if (encoding === "Hex") return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (encoding === "Base64") return bytesToBase64(bytes);
  if (encoding === "Base64URL") return bytesToBase64(bytes, { urlSafe: true, padding: false });
  throw new Error("Unsupported encoding: " + encoding);
}

export async function digestBytes(bytes, algorithm = "SHA-256", { hmacKey = "", encoding = "Hex" } = {}) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error("Unsupported algorithm: " + algorithm);
  const key = new TextEncoder().encode(hmacKey);
  if (algorithm === "MD5") return format(hmacKey ? hmacMd5(key, bytes) : md5(bytes), encoding);
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error("Web Crypto is unavailable. Serve the page from localhost or HTTPS.");
  }
  if (!hmacKey) return format(new Uint8Array(await crypto.subtle.digest(algorithm, bytes)), encoding);
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: algorithm }, false, ["sign"]);
  return format(new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, bytes)), encoding);
}

export function digest(text, algorithm, options) {
  return digestBytes(new TextEncoder().encode(text), algorithm, options);
}

export async function digestFile(file, algorithm, options) {
  if (file.size > MAX_FILE_BYTES) throw new Error("The file exceeds the 100 MB limit.");
  return digestBytes(new Uint8Array(await file.arrayBuffer()), algorithm, options);
}

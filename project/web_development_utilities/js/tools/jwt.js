import { decode, base64ToBytes } from "./base64.js";

function part(text, name) {
  try {
    return JSON.parse(decode(text));
  } catch {
    throw new Error(`The ${name} is not valid Base64URL-encoded JSON.`);
  }
}

export function decodeJwt(token, now = Date.now()) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("A JWT has three dot-separated parts.");
  const header = part(parts[0], "header");
  const payload = part(parts[1], "payload");
  const claims = [];
  for (const key of ["iat", "nbf", "exp"]) {
    if (typeof payload[key] === "number") claims.push(`${key}: ${new Date(payload[key] * 1000).toISOString()}`);
  }
  if (typeof payload.exp === "number") claims.push(payload.exp * 1000 < now ? "Status: expired" : "Status: not expired");
  return { header, payload, claims, signature: parts[2] };
}

const ALGS = {
  HS256: { kind: "hmac", hash: "SHA-256" },
  HS384: { kind: "hmac", hash: "SHA-384" },
  HS512: { kind: "hmac", hash: "SHA-512" },
  RS256: { kind: "rsa", hash: "SHA-256" },
  RS384: { kind: "rsa", hash: "SHA-384" },
  RS512: { kind: "rsa", hash: "SHA-512" },
  ES256: { kind: "ec", hash: "SHA-256", curve: "P-256" },
  ES384: { kind: "ec", hash: "SHA-384", curve: "P-384" },
  ES512: { kind: "ec", hash: "SHA-512", curve: "P-521" },
};

export const KEY_TYPES = ["Secret (HMAC)", "Public key (PEM)"];

export async function verifyJwt(token, key, keyType) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("A JWT has three dot-separated parts.");
  const header = part(parts[0], "header");
  if (header.alg === "none") throw new Error("Unsigned tokens (alg none) cannot be verified.");
  const spec = ALGS[header.alg];
  if (!spec) throw new Error("Unsupported algorithm: " + header.alg);
  const secret = spec.kind === "hmac";
  if (secret !== (keyType === KEY_TYPES[0])) {
    throw new Error(secret ? "HS algorithms require a secret, not a public key." : "RS and ES algorithms require a public key in PEM format.");
  }
  if (!key.trim()) throw new Error("A key is required.");
  if (!globalThis.crypto || !globalThis.crypto.subtle) throw new Error("Web Crypto is unavailable. Serve the page from localhost or HTTPS.");
  const data = new TextEncoder().encode(parts[0] + "." + parts[1]);
  const signature = base64ToBytes(parts[2]);
  let cryptoKey;
  let algorithm;
  try {
    if (secret) {
      algorithm = "HMAC";
      cryptoKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: spec.hash }, false, ["verify"]);
    } else {
      const der = base64ToBytes(key.replace(/-----[^-]+-----/g, ""));
      const rsa = spec.kind === "rsa";
      algorithm = rsa ? "RSASSA-PKCS1-v1_5" : { name: "ECDSA", hash: spec.hash };
      cryptoKey = await crypto.subtle.importKey("spki", der, rsa ? { name: algorithm, hash: spec.hash } : { name: "ECDSA", namedCurve: spec.curve }, false, ["verify"]);
    }
  } catch {
    throw new Error("The key could not be imported.");
  }
  return crypto.subtle.verify(algorithm, cryptoKey, signature, data);
}

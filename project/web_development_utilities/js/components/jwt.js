import { createToolView } from "./tool-view.js";
import { decodeJwt, verifyJwt, KEY_TYPES } from "../tools/jwt.js";

export const { mount, unmount } = createToolView({
  id: "jwt",
  title: "JWT decoder",
  description: "Decode header, payload and time claims, and optionally verify HS, RS and ES signatures. Tokens and keys stay in the browser and are not stored.",
  inputs: [
    { name: "token", label: "Token", type: "textarea", default: "", persist: false },
    { name: "keyType", label: "Key type", type: "select", options: KEY_TYPES },
    { name: "key", label: "Secret or public key in PEM format (optional)", type: "textarea", default: "", persist: false },
  ],
  run: async ({ token, keyType, key }) => {
    if (!token.trim()) return "";
    const j = decodeJwt(token);
    const claims = j.claims.length ? "\n\n" + j.claims.join("\n") : "";
    let signature = "not checked";
    if (key.trim()) {
      try {
        signature = (await verifyJwt(token, key, keyType)) ? "valid" : "invalid";
      } catch (err) {
        signature = "not verified: " + err.message;
      }
    }
    return `${JSON.stringify(j.header, null, 2)}\n\n${JSON.stringify(j.payload, null, 2)}${claims}\n\nSignature: ${signature}`;
  },
});

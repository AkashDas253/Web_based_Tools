import { createToolView } from "./tool-view.js";
import { encode, decode, encodeFile, VARIANTS } from "../tools/base64.js";

export const { mount, unmount } = createToolView({
  id: "base64",
  title: "Base64",
  description: "Encode or decode text, or encode a file (up to 5 MB). Decoding accepts standard and URL-safe input.",
  inputs: [
    { name: "mode", label: "Operation", type: "select", options: ["Encode text", "Decode text", "Encode file"] },
    { name: "variant", label: "Encoding variant", type: "select", options: Object.keys(VARIANTS) },
    { name: "text", label: "Text", type: "textarea", default: "Hello, world" },
    { name: "file", label: "File (for Encode file)", type: "file" },
  ],
  run: async ({ mode, variant, text, file }) => {
    if (mode === "Encode file") return file ? encodeFile(file, VARIANTS[variant]) : "";
    if (!text) return "";
    return mode === "Encode text" ? encode(text, VARIANTS[variant]) : decode(text);
  },
});

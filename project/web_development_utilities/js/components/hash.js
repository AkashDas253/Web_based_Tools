import { createToolView } from "./tool-view.js";
import { digest, digestFile, ALGORITHMS, ENCODINGS } from "../tools/hash.js";

export const { mount, unmount } = createToolView({
  id: "hash",
  title: "Hash generator",
  description: "MD5 and SHA digests of text or files, with optional HMAC. MD5 and SHA-1 are not suitable for security purposes. The HMAC key is not stored.",
  inputs: [
    { name: "source", label: "Source", type: "select", options: ["Text", "File"] },
    { name: "text", label: "Text", type: "textarea", default: "hello" },
    { name: "file", label: "File (up to 100 MB)", type: "file" },
    { name: "algorithm", label: "Algorithm", type: "select", options: ALGORITHMS },
    { name: "hmacKey", label: "HMAC key (optional)", type: "text", persist: false },
    { name: "encoding", label: "Output encoding", type: "select", options: ENCODINGS },
  ],
  run: ({ source, text, file, algorithm, hmacKey, encoding }) => {
    const options = { hmacKey, encoding };
    if (source === "File") return file ? digestFile(file, algorithm, options) : "";
    return text ? digest(text, algorithm, options) : "";
  },
});

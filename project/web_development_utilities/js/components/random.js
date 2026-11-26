import { createToolView } from "./tool-view.js";
import { generate, validateUuids, CHARSETS, KINDS, FORMATS } from "../tools/random.js";

export const { mount, unmount } = createToolView({
  id: "random",
  title: "UUID and random strings",
  description: "UUID v4 and v7, nil UUID, UUID validation, and random strings or passwords from the browser's cryptographic generator. UUID v7 values are time-ordered by millisecond.",
  inputs: [
    { name: "kind", label: "Type", type: "select", options: [...KINDS, "Validate UUIDs"] },
    { name: "count", label: "Count", type: "number", default: "5" },
    { name: "style", label: "UUID format", type: "select", options: FORMATS },
    { name: "length", label: "Length (random string)", type: "number", default: "24" },
    { name: "charset", label: "Character set (random string)", type: "select", options: Object.keys(CHARSETS) },
    { name: "input", label: "UUIDs to validate (one per line)", type: "textarea", default: "" },
  ],
  run: ({ kind, count, style, length, charset, input }) =>
    kind === "Validate UUIDs" ? validateUuids(input) : generate(kind, count, length, charset, style),
  refresh: true,
});

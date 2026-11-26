import { createToolView } from "./tool-view.js";
import { formatJson } from "../tools/json-format.js";

export const { mount, unmount } = createToolView({
  id: "json-formatter",
  title: "JSON formatter",
  description: "Format, minify and validate JSON.",
  inputs: [
    { name: "text", label: "JSON", type: "textarea", default: '{"b":1,"a":[1,2,3]}' },
    { name: "mode", label: "Mode", type: "select", options: ["Format", "Format with sorted keys", "Minify"] },
    { name: "indent", label: "Indent", type: "select", options: ["2", "4", "8"] },
  ],
  run: ({ text, mode, indent }) =>
    formatJson(text, { indent: +indent, sort: mode.includes("sorted"), minify: mode === "Minify" }),
});

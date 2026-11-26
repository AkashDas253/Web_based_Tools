import { createToolView } from "./tool-view.js";
import { transform, OPERATIONS } from "../tools/text.js";

export const { mount, unmount } = createToolView({
  id: "text-case",
  title: "Case and text converter",
  description: "Case conversion, line operations and text statistics. Case conversions apply per line.",
  inputs: [
    { name: "text", label: "Input", type: "textarea", default: "user profile settings\nmaxRetryCount" },
    { name: "operation", label: "Operation", type: "select", options: Object.keys(OPERATIONS) },
  ],
  run: ({ text, operation }) => (text ? transform(text, operation) : ""),
});

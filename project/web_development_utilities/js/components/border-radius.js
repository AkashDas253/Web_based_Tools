import { createToolView } from "./tool-view.js";
import { borderRadius } from "../tools/css-box.js";

export const { mount, unmount } = createToolView({
  id: "border-radius",
  title: "Border radius",
  description: "Generate a CSS border-radius with per-corner values and live preview.",
  inputs: [
    { name: "tl", label: "Top left", type: "number", default: "24" },
    { name: "tr", label: "Top right", type: "number", default: "8" },
    { name: "br", label: "Bottom right", type: "number", default: "24" },
    { name: "bl", label: "Bottom left", type: "number", default: "8" },
    { name: "unit", label: "Unit", type: "select", options: ["px", "%", "rem"] },
  ],
  run: borderRadius,
  preview: (d, result) => `${result} background:var(--accent);min-height:8rem`,
});

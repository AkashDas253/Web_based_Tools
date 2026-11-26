import { createToolView } from "./tool-view.js";
import { boxShadow } from "../tools/css-box.js";

export const { mount, unmount } = createToolView({
  id: "box-shadow",
  title: "Box shadow",
  description: "Generate a CSS box-shadow with live preview.",
  inputs: [
    { name: "x", label: "X offset (px)", type: "number", default: "0" },
    { name: "y", label: "Y offset (px)", type: "number", default: "8" },
    { name: "blur", label: "Blur (px)", type: "number", default: "24" },
    { name: "spread", label: "Spread (px)", type: "number", default: "0" },
    { name: "color", label: "Color", default: "#000000" },
    { name: "opacity", label: "Opacity (0 to 1)", type: "number", default: "0.25" },
    { name: "inset", label: "Inset", type: "select", options: ["", "inset"] },
  ],
  run: (d) => boxShadow({ ...d, inset: d.inset === "inset" }),
  preview: (d, result) => result,
});

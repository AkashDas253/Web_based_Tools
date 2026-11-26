import { createToolView } from "./tool-view.js";
import { fluidClamp } from "../tools/fluid-type.js";

export const { mount, unmount } = createToolView({
  id: "fluid-type",
  title: "Fluid typography",
  description: "Generate a CSS clamp() that scales font size linearly between two viewport widths.",
  inputs: [
    { name: "minSize", label: "Minimum size (px)", type: "number", default: "16" },
    { name: "maxSize", label: "Maximum size (px)", type: "number", default: "32" },
    { name: "minViewport", label: "Minimum viewport (px)", type: "number", default: "400" },
    { name: "maxViewport", label: "Maximum viewport (px)", type: "number", default: "1200" },
  ],
  run: (d) => `font-size: ${fluidClamp(d)};`,
  preview: (d, result) => result,
  previewText: "The quick brown fox jumps over the lazy dog",
});

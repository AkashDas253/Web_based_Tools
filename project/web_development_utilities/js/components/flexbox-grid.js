import { createToolView } from "./tool-view.js";
import { buildLayout, MODES, DIRECTIONS, WRAPS, JUSTIFY, ALIGN } from "../tools/layout.js";

export const { mount, unmount } = createToolView({
  id: "flexbox-grid",
  title: "Flexbox and grid playground",
  description: "Adjust container properties and preview the layout. Direction and wrap apply to flex; columns apply to grid.",
  inputs: [
    { name: "mode", label: "Display", type: "select", options: MODES },
    { name: "direction", label: "Direction (flex)", type: "select", options: DIRECTIONS },
    { name: "wrap", label: "Wrap (flex)", type: "select", options: WRAPS },
    { name: "columns", label: "Columns (grid)", type: "number", default: "3" },
    { name: "justify", label: "Justify content", type: "select", options: JUSTIFY },
    { name: "align", label: "Align items", type: "select", options: ALIGN },
    { name: "gap", label: "Gap (px)", type: "number", default: "8" },
    { name: "items", label: "Items (1 to 24)", type: "number", default: "5" },
  ],
  run: buildLayout,
  preview: (d, result) => result.replace(/\n/g, " ") + " min-height:10rem;font-size:1rem",
  previewItems: (d) => d.items,
});

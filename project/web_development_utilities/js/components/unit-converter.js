import { createToolView } from "./tool-view.js";
import { convertAll, UNITS } from "../tools/css-units.js";

export const { mount, unmount } = createToolView({
  id: "unit-converter",
  title: "Unit converter",
  description: "Convert between px, rem, em, pt, vw and vh using a base font size and viewport size.",
  inputs: [
    { name: "value", label: "Value", type: "number", default: "24" },
    { name: "from", label: "From", type: "select", options: UNITS },
    { name: "base", label: "Base font size (px)", type: "number", default: "16" },
    { name: "vw", label: "Viewport width (px)", type: "number", default: "1920" },
    { name: "vh", label: "Viewport height (px)", type: "number", default: "1080" },
  ],
  run: ({ value, from, ...ctx }) =>
    Object.entries(convertAll(value, from, ctx)).map(([u, v]) => `${v}${u}`).join("\n"),
});

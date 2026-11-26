import { createToolView } from "./tool-view.js";
import { check } from "../tools/contrast.js";
import { parseColor, toHex } from "../tools/color.js";

const mark = (ok) => (ok ? "pass" : "fail");

export const { mount, unmount } = createToolView({
  id: "contrast",
  title: "Contrast checker",
  description: "WCAG 2.x contrast ratio between a text color and a background color. Alpha is ignored.",
  inputs: [
    { name: "fg", label: "Text color", default: "#1c1f24" },
    { name: "bg", label: "Background color", default: "#ffffff" },
  ],
  run: ({ fg, bg }) => {
    if (!fg.trim() || !bg.trim()) return "";
    const r = check(fg, bg);
    return [
      `Ratio: ${r.ratio.toFixed(2)}:1`,
      `AA normal text (4.5): ${mark(r.aaNormal)}`,
      `AA large text (3): ${mark(r.aaLarge)}`,
      `AAA normal text (7): ${mark(r.aaaNormal)}`,
      `AAA large text (4.5): ${mark(r.aaaLarge)}`,
      `UI components (3): ${mark(r.ui)}`,
    ].join("\n");
  },
  preview: ({ fg, bg }) => `background:${toHex(parseColor(bg))};color:${toHex(parseColor(fg))}`,
  previewText: "Sample text 123",
});

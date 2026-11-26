import { createToolView } from "./tool-view.js";
import { formats, parseColor, toHex } from "../tools/color.js";

export const { mount, unmount } = createToolView({
  id: "color",
  title: "Color converter",
  description: "Convert between HEX, RGB, HSL, HSV, CMYK, OKLCH and CSS names, with alpha. A typed value overrides the picker. Accepted: names, #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), hsla(), hsv(), cmyk(), oklch().",
  inputs: [
    { name: "picker", label: "Picker", type: "color", default: "#1f5fd6" },
    { name: "value", label: "Typed value (optional)", default: "" },
  ],
  run: ({ picker, value }) =>
    Object.entries(formats(value.trim() || picker))
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join("\n"),
  preview: ({ picker, value }) => `background:${toHex(parseColor(value.trim() || picker))}`,
});

import { parseColor, rgbToHsl, hslToRgb, toHex } from "./color.js";

export const SCHEMES = {
  Complementary: [0, 180],
  Analogous: [-30, 0, 30],
  Triadic: [0, 120, 240],
  "Split complementary": [0, 150, 210],
  Tetradic: [0, 90, 180, 270],
};

export const SCHEME_NAMES = [...Object.keys(SCHEMES), "Tints and shades"];

export function generate(input, scheme) {
  const hsl = rgbToHsl(parseColor(input));
  if (scheme === "Tints and shades") {
    return [95, 85, 75, 65, 55, 45, 35, 25, 15].map((l) => toHex(hslToRgb(hsl.h, hsl.s, l)));
  }
  if (!SCHEMES[scheme]) throw new Error("Unknown scheme: " + scheme);
  return SCHEMES[scheme].map((d) => toHex(hslToRgb(hsl.h + d, hsl.s, hsl.l)));
}

export function cssVariables(colors, prefix = "color") {
  return ":root {\n" + colors.map((c, i) => `  --${prefix}-${i + 1}: ${c};`).join("\n") + "\n}";
}

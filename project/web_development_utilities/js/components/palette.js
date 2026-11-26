import { createToolView } from "./tool-view.js";
import { generate, cssVariables, SCHEME_NAMES } from "../tools/palette.js";

export const { mount, unmount } = createToolView({
  id: "palette",
  title: "Palette generator",
  description: "Color schemes and tint scales from a base color, with CSS variable output.",
  inputs: [
    { name: "base", label: "Base color", default: "#1f5fd6" },
    { name: "scheme", label: "Scheme", type: "select", options: SCHEME_NAMES },
  ],
  run: ({ base, scheme }) => {
    if (!base.trim()) return "";
    const colors = generate(base, scheme);
    return colors.join("\n") + "\n\n" + cssVariables(colors);
  },
  preview: ({ base, scheme }) => {
    const colors = generate(base, scheme);
    const n = colors.length;
    const stops = colors.map((c, i) => `${c} ${(i * 100) / n}% ${((i + 1) * 100) / n}%`).join(", ");
    return `background:linear-gradient(90deg, ${stops})`;
  },
});

import { createToolView } from "./tool-view.js";
import { build, TYPES } from "../tools/gradient.js";

export const { mount, unmount } = createToolView({
  id: "gradient",
  title: "Gradient generator",
  description: "CSS gradients from color stops. One stop per line: a color with an optional position, for example #ff0000 25%.",
  inputs: [
    { name: "type", label: "Type", type: "select", options: TYPES },
    { name: "angle", label: "Angle (degrees)", type: "number", default: "135" },
    { name: "stops", label: "Color stops", type: "textarea", default: "#1f5fd6\n#8e44ad 60%\n#e67e22" },
  ],
  run: ({ type, angle, stops }) => build(type, angle, stops),
  preview: (data, result) => result.replace(/;$/, ""),
});

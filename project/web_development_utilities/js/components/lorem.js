import { createToolView } from "./tool-view.js";
import { generate, UNITS } from "../tools/lorem.js";

export const { mount, unmount } = createToolView({
  id: "lorem",
  title: "Lorem ipsum generator",
  description: "Placeholder text by paragraphs, sentences or words. Output is deterministic for the same input.",
  inputs: [
    { name: "unit", label: "Unit", type: "select", options: UNITS },
    { name: "count", label: "Count", type: "number", default: "3" },
  ],
  run: ({ unit, count }) => generate(unit, count),
});

import { createToolView } from "./tool-view.js";
import { INDENTS, sizeReport } from "../tools/formatters.js";

export function createFormatterView({ id, title, description, sample, format, minify, options = [] }) {
  return createToolView({
    id,
    title,
    description,
    inputs: [
      { name: "text", label: "Source", type: "textarea", default: sample },
      { name: "mode", label: "Operation", type: "select", options: ["Format", "Minify"] },
      { name: "indent", label: "Indent (format)", type: "select", options: Object.keys(INDENTS) },
      ...options,
    ],
    run: async (d) => {
      if (!d.text.trim()) return "";
      const out = d.mode === "Minify" ? await minify(d.text, d) : await format(d.text, INDENTS[d.indent], d);
      return { text: out, rich: (el) => (el.textContent = sizeReport(d.text, out)) };
    },
  });
}

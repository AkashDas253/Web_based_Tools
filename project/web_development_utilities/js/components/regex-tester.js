import { createToolView } from "./tool-view.js";
import { findMatches, describe, replaceMatches, segments, FLAGS } from "../tools/regex.js";

export const { mount, unmount } = createToolView({
  id: "regex-tester",
  title: "Regex tester",
  description: "Test a JavaScript regular expression with highlighted matches, capture groups and an optional replacement preview. Replacement honors the global flag and supports $1, $<name> and $&.",
  inputs: [
    { name: "pattern", label: "Pattern", default: "(\\w+)@(\\w+)\\.com" },
    ...FLAGS.map(([name, label]) => ({ name, label, type: "checkbox", default: name === "g" || name === "i" })),
    { name: "text", label: "Text", type: "textarea", default: "ann@example.com, bob@test.com" },
    { name: "replace", label: "Preview replacement", type: "checkbox", default: false },
    { name: "replacement", label: "Replacement", default: "$2:$1" },
  ],
  run: (d) => {
    if (!d.pattern) return "";
    const flags = FLAGS.map(([f]) => f).filter((f) => d[f]).join("");
    const matches = findMatches(d.pattern, flags, d.text);
    let text = describe(matches);
    if (d.replace) text += "\n\nReplaced:\n" + replaceMatches(d.pattern, flags, d.text, d.replacement);
    const rich = matches.some((m) => m.value)
      ? (el) =>
          segments(d.text, matches).forEach((seg) => {
            if (!seg.match) return el.append(document.createTextNode(seg.text));
            const mark = document.createElement("mark");
            mark.textContent = seg.text;
            el.append(mark);
          })
      : null;
    return { text, rich };
  },
});

import { createToolView } from "./tool-view.js";
import { formatDiff, sideBySide, wordRuns } from "../tools/diff.js";

function cell(part) {
  const el = document.createElement("div");
  if (!part) el.className = "empty";
  else {
    el.className = part.type;
    el.textContent = part.text;
  }
  return el;
}

function renderLines(container, rows) {
  const grid = document.createElement("div");
  grid.className = "side";
  rows.forEach((row) => grid.append(cell(row.left), cell(row.right)));
  container.append(grid);
}

function renderWords(container, runs) {
  runs.forEach((run) => {
    if (run.type === "eq") return container.append(document.createTextNode(run.value));
    const el = document.createElement(run.type === "del" ? "del" : "ins");
    el.className = run.type;
    el.textContent = run.value;
    container.append(el);
  });
}

export const { mount, unmount } = createToolView({
  id: "diff",
  title: "Diff checker",
  description: "Compare two texts by line (side by side) or by word (inline). The text result uses - and + for lines, [-removed-] and {+added+} for words.",
  inputs: [
    { name: "a", label: "Original", type: "textarea", default: "one\ntwo\nthree" },
    { name: "b", label: "Changed", type: "textarea", default: "one\n2\nthree\nfour" },
    { name: "mode", label: "Compare by", type: "select", options: ["Lines", "Words"] },
    { name: "ignoreCase", label: "Ignore case", type: "checkbox", default: false },
    { name: "ignoreWhitespace", label: "Ignore whitespace", type: "checkbox", default: false },
  ],
  run: ({ a, b, mode, ignoreCase, ignoreWhitespace }) => {
    if (!a && !b) return "";
    const options = { ignoreCase, ignoreWhitespace };
    const text = formatDiff(a, b, mode, options);
    if (text === "No differences") return text;
    return {
      text,
      rich: (el) => (mode === "Lines" ? renderLines(el, sideBySide(a, b, options)) : renderWords(el, wordRuns(a, b, options))),
    };
  },
});

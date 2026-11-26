import { renderMarkdown, wrapSelection, prefixLines, markdownStats, SAMPLE } from "../tools/markdown.js";

const ACTIONS = {
  bold: (t, s, e) => wrapSelection(t, s, e, "**"),
  italic: (t, s, e) => wrapSelection(t, s, e, "_"),
  heading: (t, s, e) => prefixLines(t, s, e, "## "),
  link: (t, s, e) => wrapSelection(t, s, e, "[", "](https://)", "link text"),
  code: (t, s, e) => wrapSelection(t, s, e, "`"),
  quote: (t, s, e) => prefixLines(t, s, e, "> "),
  list: (t, s, e) => prefixLines(t, s, e, "- "),
  numbered: (t, s, e) => prefixLines(t, s, e, (i) => `${i + 1}. `),
};
const LABELS = { bold: "Bold", italic: "Italic", heading: "Heading", link: "Link", code: "Code", quote: "Quote", list: "List", numbered: "Numbered list" };

let cleanup = [];

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  Object.assign(document.createElement("a"), { href: url, download: name }).click();
  URL.revokeObjectURL(url);
}

export function mount(container, app) {
  container.innerHTML = `<h1>Markdown editor</h1>
<p>Edit Markdown with a live, sanitized preview. Requires the marked and DOMPurify files in vendor/.</p>
<div class="toolbar" id="md-format" role="toolbar" aria-label="Formatting"></div>
<div class="md-grid">
<div class="field"><label for="md-input">Markdown</label><textarea id="md-input" spellcheck="false"></textarea></div>
<div class="field"><span id="md-label">Preview</span><div id="md-preview" class="md-preview" aria-labelledby="md-label" aria-live="polite"></div></div>
</div>
<p id="md-info"></p>
<div class="toolbar" id="md-export"></div>`;
  const $ = (s) => container.querySelector(s);
  const input = $("#md-input");
  const preview = $("#md-preview");
  const info = $("#md-info");
  input.value = app.state.get("markdown", SAMPLE);
  let html = "";
  let token = 0;
  let timer = null;

  async function render() {
    const current = ++token;
    const md = input.value;
    app.state.set("markdown", md);
    try {
      const out = await renderMarkdown(md);
      if (current !== token) return;
      html = out;
      preview.innerHTML = out;
      info.className = "";
      info.textContent = markdownStats(md);
    } catch (err) {
      if (current !== token) return;
      preview.textContent = "";
      info.className = "error";
      info.textContent = err.message;
    }
  }

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      app.notify("Copied");
    } catch {
      app.notify("Clipboard unavailable", "error");
    }
  };
  const doc = () => `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Document</title>\n</head>\n<body>\n${html}\n</body>\n</html>\n`;
  const buttons = [];
  const addButton = (parent, label, handler) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", handler);
    parent.append(b);
    buttons.push([b, handler]);
  };

  Object.keys(ACTIONS).forEach((name) =>
    addButton($("#md-format"), LABELS[name], () => {
      const r = ACTIONS[name](input.value, input.selectionStart, input.selectionEnd);
      input.value = r.text;
      input.focus();
      input.setSelectionRange(r.start, r.end);
      render();
    }),
  );
  addButton($("#md-export"), "Copy HTML", () => copy(html));
  addButton($("#md-export"), "Copy Markdown", () => copy(input.value));
  addButton($("#md-export"), "Download .md", () => download("document.md", input.value, "text/markdown"));
  addButton($("#md-export"), "Download .html", () => download("document.html", doc(), "text/html"));

  const onInput = () => {
    clearTimeout(timer);
    timer = setTimeout(render, 150);
  };
  input.addEventListener("input", onInput);
  cleanup = [() => clearTimeout(timer), () => token++, () => input.removeEventListener("input", onInput), ...buttons.map(([b, h]) => () => b.removeEventListener("click", h))];
  render();
}

export function unmount() {
  cleanup.forEach((fn) => fn());
  cleanup = [];
}

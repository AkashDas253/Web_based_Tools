
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
  math: (t, s, e) => wrapSelection(t, s, e, "\\(", "\\)", "x^2"),
  mathBlock: (t, s, e) => wrapSelection(t, s, e, "$$\n", "\n$$", "\\frac{a}{b}"),
  mermaid: (t, s, e) => wrapSelection(t, s, e, "```mermaid\n", "\n```", "flowchart TD\n    A[Start] --> B[End]"),
};

const LABELS = {
  bold: "Bold",
  italic: "Italic",
  heading: "Heading",
  link: "Link",
  code: "Code",
  quote: "Quote",
  list: "List",
  numbered: "Numbered list",
  math: "Inline math",
  mathBlock: "Block math",
  mermaid: "Mermaid diagram",
};

let cleanup = [];

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  Object.assign(document.createElement("a"), { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function embedStylesheet(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not load stylesheet");
  }

  let css = await response.text();

  const assets = [...new Set(
    [...css.matchAll(/url\((["']?)([^"')]+)\1\)/g)]
      .map((match) => match[2])
      .filter((path) => !/^(data:|https?:|\/|#)/.test(path)),
  )];

  for (const path of assets) {
    const assetUrl = new URL(path, url);
    const assetResponse = await fetch(assetUrl);

    if (!assetResponse.ok) {
      throw new Error("Could not load stylesheet asset");
    }

    const blob = await assetResponse.blob();
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    const dataUrl = `data:${blob.type || "application/octet-stream"};base64,${btoa(binary)}`;

    css = css.replaceAll(
      `url(${path})`,
      `url("${dataUrl}")`,
    ).replaceAll(
      `url("${path}")`,
      `url("${dataUrl}")`,
    ).replaceAll(
      `url('${path}')`,
      `url("${dataUrl}")`,
    );
  }

  return css;
}

export function mount(container, app) {
  container.innerHTML = `<h1>Markdown editor</h1>
<p>Edit Markdown with a live, sanitized preview. Supports GFM, mathematics, Mermaid diagrams and code highlighting.</p>
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

  // Load local styles
  const styles = [
    ["md-katex", "katex/katex.min.css"],
    ["md-highlight", "highlightjs/styles/github.min.css"],
  ];

  const styleElements = styles.map(([id, file]) => {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = new URL("../../vendor/" + file, import.meta.url).href;
    document.head.append(link);
    return link;
  });

  const diagramStyle = document.createElement("style");
  diagramStyle.textContent = `
    .md-preview .md-mermaid {
      overflow-x: auto;
      margin: 1rem 0;
      text-align: center;
    }
    .md-preview .md-mermaid svg {
      max-width: 100%;
      height: auto;
    }
    .md-preview .md-mermaid.error {
      color: var(--err);
      text-align: left;
      white-space: pre-wrap;
    }
    .md-preview pre {
      overflow-x: auto;
    }
    .md-preview .katex-display {
      overflow-x: auto;
      overflow-y: hidden;
      padding: 0.5rem 0;
    }
  `;
  container.append(diagramStyle);

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

  const doc = async () => {
    const katexUrl = new URL("../../vendor/katex/katex.min.css", import.meta.url).href;
    const highlightUrl = new URL("../../vendor/highlightjs/styles/github.min.css", import.meta.url).href;

    const [katexCss, highlightCss] = await Promise.all([
      embedStylesheet(katexUrl),
      embedStylesheet(highlightUrl),
    ]);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Document</title>
<style>
${katexCss}
${highlightCss}
.md-mermaid { overflow-x: auto; margin: 1rem 0; text-align: center; }
.md-mermaid svg { max-width: 100%; height: auto; }
pre { overflow-x: auto; }
.katex-display { overflow-x: auto; overflow-y: hidden; }
</style>
</head>
<body>
${html}
</body>
</html>`;
  };

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

  addButton($("#md-export"), "Download .html", async () => {
    try {
      download("document.html", await doc(), "text/html");
    } catch (err) {
      app.notify(err.message || "HTML export failed", "error");
    }
  });

  const onInput = () => {
    clearTimeout(timer);
    timer = setTimeout(render, 150);
  };

  input.addEventListener("input", onInput);

  cleanup = [
    () => clearTimeout(timer),
    () => token++,
    () => input.removeEventListener("input", onInput),
    ...buttons.map(([b, h]) => () => b.removeEventListener("click", h)),
    ...styleElements.map((el) => () => el.remove()),
    () => diagramStyle.remove(),
  ];

  render();
}

export function unmount() {
  cleanup.forEach((fn) => fn());
  cleanup = [];
}

import { loadVendor } from "./vendor.js";

let hooked = false;

export async function renderMarkdown(md) {
  const [{ marked }, purify] = await Promise.all([loadVendor("marked"), loadVendor("dompurify")]);
  if (!hooked) {
    purify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A" && node.hasAttribute("href")) {
        node.setAttribute("rel", "noopener noreferrer");
        node.setAttribute("target", "_blank");
      }
    });
    hooked = true;
  }
  return purify.sanitize(marked.parse(md, { gfm: true, async: false }));
}

export function wrapSelection(text, start, end, before, after = before, placeholder = "text") {
  const selected = text.slice(start, end) || placeholder;
  return {
    text: text.slice(0, start) + before + selected + after + text.slice(end),
    start: start + before.length,
    end: start + before.length + selected.length,
  };
}

export function prefixLines(text, start, end, prefix) {
  const from = text.lastIndexOf("\n", start - 1) + 1;
  const found = text.indexOf("\n", end);
  const to = found === -1 ? text.length : found;
  const block = text
    .slice(from, to)
    .split("\n")
    .map((line, i) => (typeof prefix === "function" ? prefix(i) : prefix) + line)
    .join("\n");
  return { text: text.slice(0, from) + block + text.slice(to), start: from, end: from + block.length };
}

export function markdownStats(md) {
  const words = (md.match(/\S+/g) || []).length;
  return `${words} words, ${md.length} characters, ${md ? md.split("\n").length : 0} lines`;
}

export const SAMPLE = "# Markdown editor\n\nWrite **bold**, _italic_ and `code`.\n\n- List item\n- Another item\n\n> A quotation\n\n| Column | Value |\n| --- | --- |\n| One | 1 |\n\n[A link](https://example.com)\n";

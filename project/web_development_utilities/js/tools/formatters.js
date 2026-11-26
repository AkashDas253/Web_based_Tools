import { loadVendor } from "./vendor.js";

export const INDENTS = {
  "2 spaces": { indent_size: 2, indent_char: " " },
  "4 spaces": { indent_size: 4, indent_char: " " },
  Tab: { indent_size: 1, indent_char: "\t" },
};

export function indentUnit(indent) {
  return indent.indent_char === "\t" ? "\t" : " ".repeat(indent.indent_size);
}

export function sizeReport(before, after) {
  const enc = new TextEncoder();
  const a = enc.encode(before).length;
  const b = enc.encode(after).length;
  if (!a || a === b) return `Original: ${a} bytes\nResult: ${b} bytes (unchanged)`;
  const pct = Math.round(Math.abs(1 - b / a) * 100);
  return `Original: ${a} bytes\nResult: ${b} bytes (${pct}% ${b < a ? "smaller" : "larger"})`;
}

export async function formatHtml(src, indent, { wrap = 0 } = {}) {
  const b = await loadVendor("beautifier");
  return b.html(src, { ...indent, wrap_line_length: Number(wrap) || 0 });
}

export async function formatCss(src, indent) {
  const b = await loadVendor("beautifier");
  return b.css(src, indent);
}

export async function formatJs(src, indent) {
  const b = await loadVendor("beautifier");
  return b.js(src, { ...indent, preserve_newlines: true, max_preserve_newlines: 2 });
}

export async function minifyJs(src, { mangle = true } = {}) {
  const t = await loadVendor("terser");
  try {
    return (await t.minify(src, { compress: true, mangle })).code;
  } catch (err) {
    if (err.line === undefined) throw err;
    throw new Error(`Syntax error at line ${err.line}, column ${err.col}: ${err.message}`);
  }
}

export async function minifyCss(src) {
  const { minify } = await loadVendor("csso");
  return minify(src).css;
}

export async function minifyHtml(src, { removeComments = true, minifyInline = true } = {}) {
  const m = await loadVendor("htmlminifier");
  return m.minify(src, { collapseWhitespace: true, removeComments, minifyCSS: minifyInline, minifyJS: minifyInline });
}

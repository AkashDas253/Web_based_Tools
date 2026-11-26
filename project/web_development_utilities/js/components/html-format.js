import { createFormatterView } from "./formatter-view.js";
import { formatHtml, minifyHtml } from "../tools/formatters.js";

export const { mount, unmount } = createFormatterView({
  id: "html-format",
  title: "HTML formatter and minifier",
  description: "Format or minify HTML. Requires the js-beautify and html-minifier-terser files in vendor/.",
  sample: "<div class=\"card\"><h1>Title</h1><p>Text <b>bold</b></p><ul><li>One</li><li>Two</li></ul></div>",
  format: (text, indent, d) => formatHtml(text, indent, { wrap: d.wrap }),
  minify: (text, d) => minifyHtml(text, { removeComments: d.removeComments, minifyInline: d.minifyInline }),
  options: [
    { name: "wrap", label: "Wrap line length (format, 0 for none)", type: "number", default: "0" },
    { name: "removeComments", label: "Remove comments (minify)", type: "checkbox", default: true },
    { name: "minifyInline", label: "Minify inline CSS and JavaScript (minify)", type: "checkbox", default: true },
  ],
});

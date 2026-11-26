import { createFormatterView } from "./formatter-view.js";
import { formatJs, minifyJs } from "../tools/formatters.js";

export const { mount, unmount } = createFormatterView({
  id: "js-format",
  title: "JavaScript formatter and minifier",
  description: "Format JavaScript, or minify it with optional name mangling. Syntax errors report line and column. Requires the js-beautify and terser files in vendor/.",
  sample: "function add(first, second) { const total = first + second; return total }\nconsole.log(add(1, 2));",
  format: (text, indent) => formatJs(text, indent),
  minify: (text, d) => minifyJs(text, { mangle: d.mangle }),
  options: [{ name: "mangle", label: "Shorten local names (minify)", type: "checkbox", default: true }],
});

import { createFormatterView } from "./formatter-view.js";
import { formatCss, minifyCss } from "../tools/formatters.js";

export const { mount, unmount } = createFormatterView({
  id: "css-format",
  title: "CSS formatter and minifier",
  description: "Format or minify CSS. Minification also merges and restructures rules. Requires the js-beautify and csso files in vendor/.",
  sample: "a{color:red}.card{margin:0 auto;padding:1rem}.card p{color:red}",
  format: (text, indent) => formatCss(text, indent),
  minify: (text) => minifyCss(text),
});

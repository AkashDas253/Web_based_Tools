import { createFormatterView } from "./formatter-view.js";
import { formatXml, minifyXml } from "../tools/xml.js";
import { indentUnit } from "../tools/formatters.js";

export const { mount, unmount } = createFormatterView({
  id: "xml-format",
  title: "XML formatter and minifier",
  description: "Format or minify XML and check well-formedness (matching tags, quoted attributes, single root). Mixed text and elements are placed on separate lines when formatting. Runs without vendored libraries.",
  sample: "<?xml version=\"1.0\"?><catalog><book id=\"1\"><title>XML Basics</title><price>9.99</price></book><book id=\"2\"/><!-- end --></catalog>",
  format: (text, indent, d) => formatXml(text, { unit: indentUnit(indent), removeComments: d.removeComments }),
  minify: (text, d) => minifyXml(text, { removeComments: d.removeComments }),
  options: [{ name: "removeComments", label: "Remove comments", type: "checkbox", default: false }],
});

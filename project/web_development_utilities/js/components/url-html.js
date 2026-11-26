import { createToolView } from "./tool-view.js";
import { urlEncode, urlDecode, htmlEscape, htmlUnescape, parseQuery } from "../tools/url-html.js";

const modes = {
  "URL encode (component)": (t) => urlEncode(t),
  "URL encode (full URI)": (t) => urlEncode(t, true),
  "URL decode": urlDecode,
  "HTML escape": (t) => htmlEscape(t),
  "HTML escape (non-ASCII as entities)": (t) => htmlEscape(t, { nonAscii: true }),
  "HTML unescape": htmlUnescape,
  "Parse query string": parseQuery,
};

export const { mount, unmount } = createToolView({
  id: "url-html",
  title: "URL and HTML encoder",
  description: "Percent-encoding, HTML entities and query string parsing.",
  inputs: [
    { name: "text", label: "Input", type: "textarea", default: "name=Ann & Bob&q=a+b%20c" },
    { name: "mode", label: "Operation", type: "select", options: Object.keys(modes) },
  ],
  run: ({ text, mode }) => (text ? modes[mode](text) : ""),
});

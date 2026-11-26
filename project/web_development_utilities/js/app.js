import * as storage from "./storage.js";
import { initUI } from "./ui.js";
import * as dashboard from "./components/dashboard.js";
import * as color from "./components/color.js";
import * as contrast from "./components/contrast.js";
import * as palette from "./components/palette.js";
import * as gradient from "./components/gradient.js";
import * as json from "./components/json-formatter.js";
import * as base64 from "./components/base64.js";
import * as hash from "./components/hash.js";
import * as regex from "./components/regex-tester.js";
import * as boxShadow from "./components/box-shadow.js";
import * as borderRadius from "./components/border-radius.js";
import * as unitConverter from "./components/unit-converter.js";
import * as fluidType from "./components/fluid-type.js";
import * as urlHtml from "./components/url-html.js";
import * as jwt from "./components/jwt.js";
import * as random from "./components/random.js";
import * as flexboxGrid from "./components/flexbox-grid.js";
import * as diff from "./components/diff.js";
import * as textCase from "./components/text-case.js";
import * as lorem from "./components/lorem.js";
import * as timestamp from "./components/timestamp.js";
import * as imageDataUri from "./components/image-data-uri.js";
import * as htmlFormat from "./components/html-format.js";
import * as cssFormat from "./components/css-format.js";
import * as jsFormat from "./components/js-format.js";
import * as xmlFormat from "./components/xml-format.js";
import * as markdown from "./components/markdown.js";

const registry = [
  { id: "dashboard", title: "Dashboard", group: "", summary: "", component: dashboard },
  { id: "color", title: "Color converter", group: "Color", summary: "Picker with HEX, RGB and HSL conversion", component: color },
  { id: "contrast", title: "Contrast checker", group: "Color", summary: "WCAG contrast ratio and levels", component: contrast },
  { id: "palette", title: "Palette generator", group: "Color", summary: "Schemes, tints and CSS variables", component: palette },
  { id: "gradient", title: "Gradient generator", group: "Color", summary: "Linear, radial and conic CSS gradients", component: gradient },
  { id: "box-shadow", title: "Box shadow", group: "CSS", summary: "box-shadow with live preview", component: boxShadow },
  { id: "border-radius", title: "Border radius", group: "CSS", summary: "Per-corner border-radius", component: borderRadius },
  { id: "unit-converter", title: "Unit converter", group: "CSS", summary: "px, rem, em, pt, vw and vh", component: unitConverter },
  { id: "fluid-type", title: "Fluid typography", group: "CSS", summary: "clamp() font sizes", component: fluidType },
  { id: "flexbox-grid", title: "Flexbox and grid", group: "CSS", summary: "Interactive layout playground", component: flexboxGrid },
  { id: "json-formatter", title: "JSON formatter", group: "Data and encoding", summary: "Format, minify and validate JSON", component: json },
  { id: "base64", title: "Base64", group: "Data and encoding", summary: "Text and file encoding, URL-safe variants", component: base64 },
  { id: "hash", title: "Hash generator", group: "Data and encoding", summary: "MD5, SHA, HMAC, text and files", component: hash },
  { id: "url-html", title: "URL and HTML encoder", group: "Data and encoding", summary: "Percent-encoding, entities, query strings", component: urlHtml },
  { id: "jwt", title: "JWT decoder", group: "Data and encoding", summary: "Header, payload and expiry", component: jwt },
  { id: "random", title: "UUID and random strings", group: "Data and encoding", summary: "UUID v4 and v7, validation, random strings", component: random },
  { id: "regex-tester", title: "Regex tester", group: "Text and code", summary: "Matches, groups and flags", component: regex },
  { id: "diff", title: "Diff checker", group: "Text and code", summary: "Line and word diff", component: diff },
  { id: "text-case", title: "Case and text converter", group: "Text and code", summary: "Case styles, line operations, statistics", component: textCase },
  { id: "lorem", title: "Lorem ipsum generator", group: "Text and code", summary: "Paragraphs, sentences, words", component: lorem },
  { id: "markdown", title: "Markdown editor", group: "Text and code", summary: "Live sanitized preview, toolbar, export", component: markdown },
  { id: "timestamp", title: "Timestamp converter", group: "Converters", summary: "Unix time, ISO 8601, time zones", component: timestamp },
  { id: "image-data-uri", title: "Image to data URI", group: "Converters", summary: "Encode image files, WebP and JPEG re-encoding", component: imageDataUri },
  { id: "html-format", title: "HTML formatter and minifier", group: "Formatters and minifiers", summary: "Beautify or minify HTML", component: htmlFormat },
  { id: "css-format", title: "CSS formatter and minifier", group: "Formatters and minifiers", summary: "Beautify or minify CSS", component: cssFormat },
  { id: "js-format", title: "JavaScript formatter and minifier", group: "Formatters and minifiers", summary: "Beautify or minify JavaScript", component: jsFormat },
  { id: "xml-format", title: "XML formatter and minifier", group: "Formatters and minifiers", summary: "Format, minify, check well-formedness", component: xmlFormat },
];

const listeners = [];

export const app = {
  registry,
  storage,
  state: {
    get: (key, fallback) => storage.get("state:" + key, fallback),
    set: (key, value) => storage.set("state:" + key, value),
  },
  notify: (message, type = "info") => listeners.forEach((fn) => fn(message, type)),
  onNotify: (fn) => listeners.push(fn),
};

initUI(app);

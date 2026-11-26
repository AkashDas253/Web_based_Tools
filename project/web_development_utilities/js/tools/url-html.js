export { htmlEscape, htmlUnescape } from "./html-entities.js";

export function urlEncode(text, full = false) {
  return full ? encodeURI(text) : encodeURIComponent(text);
}

export function urlDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    throw new Error("Input contains an invalid percent-encoded sequence.");
  }
}

export function parseQuery(text) {
  const query = text.includes("?") ? text.slice(text.indexOf("?") + 1) : text;
  const pairs = [...new URLSearchParams(query.split("#")[0])];
  return pairs.length ? pairs.map(([k, v]) => `${k} = ${v}`).join("\n") : "No parameters";
}

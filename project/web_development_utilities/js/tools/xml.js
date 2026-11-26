const TOKEN = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE(?:[^>[]|\[[\s\S]*?\])*>|<\/?[A-Za-z_:](?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/y;
const NAME = /^[A-Za-z_:][A-Za-z0-9_:.-]*$/;
const ATTR = /([A-Za-z_:][A-Za-z0-9_:.-]*)\s*=\s*(?:"[^"]*"|'[^']*')/g;

function locate(text, index) {
  const before = text.slice(0, index);
  const nl = before.lastIndexOf("\n");
  return { line: before.split("\n").length, col: index - nl };
}

export function parseXml(text) {
  const fail = (message, at) => {
    const { line, col } = locate(text, at);
    return new Error(`${message} at line ${line}, column ${col}.`);
  };
  const root = { children: [] };
  const stack = [root];
  let pos = 0;
  while (pos < text.length) {
    TOKEN.lastIndex = pos;
    const m = TOKEN.exec(text);
    if (!m) throw fail("Malformed markup", pos);
    const tok = m[0];
    const top = stack[stack.length - 1];
    if (tok.startsWith("<!--")) top.children.push({ type: "comment", raw: tok });
    else if (tok.startsWith("<![CDATA[")) {
      if (stack.length === 1) throw fail("CDATA outside the root element", pos);
      top.children.push({ type: "cdata", raw: tok });
    } else if (tok.startsWith("<?")) top.children.push({ type: "pi", raw: tok });
    else if (tok.startsWith("<!DOCTYPE")) top.children.push({ type: "doctype", raw: tok });
    else if (tok.startsWith("</")) {
      const name = tok.slice(2, -1).trim();
      if (stack.length === 1) throw fail(`Unexpected closing tag </${name}>`, pos);
      if (name !== top.name) throw fail(`Expected </${top.name}> but found </${name}>`, pos);
      stack.pop();
    } else if (tok[0] === "<") {
      const sm = tok.match(/^<([^\s/>]+)([\s\S]*?)(\/?)>$/);
      const name = sm[1];
      if (!NAME.test(name)) throw fail(`Invalid element name "${name}"`, pos);
      const seen = new Set();
      for (const a of sm[2].matchAll(ATTR)) {
        if (seen.has(a[1])) throw fail(`Duplicate attribute "${a[1]}" in <${name}>`, pos);
        seen.add(a[1]);
      }
      if (sm[2].replace(ATTR, "").trim() !== "") throw fail(`Invalid attribute syntax in <${name}>`, pos);
      const el = { type: "el", name, attrs: sm[2].trim(), selfClosing: sm[3] === "/", children: [] };
      top.children.push(el);
      if (!el.selfClosing) stack.push(el);
    } else if (stack.length === 1) {
      if (tok.trim()) throw fail("Text outside the root element", pos + tok.search(/\S/));
    } else top.children.push({ type: "text", value: tok });
    pos += tok.length;
  }
  if (stack.length > 1) throw fail(`Unclosed element <${stack[stack.length - 1].name}>`, text.length);
  const roots = root.children.filter((c) => c.type === "el").length;
  if (roots === 0) throw new Error("The document has no root element.");
  if (roots > 1) throw new Error("The document has more than one root element.");
  return root.children;
}

const open = (n) => `<${n.name}${n.attrs ? " " + n.attrs : ""}`;
const blank = (c) => c.type === "text" && !c.value.trim();

function pretty(node, depth, unit, opts) {
  const pad = unit.repeat(depth);
  if (node.type === "text") return [pad + node.value.trim()];
  if (node.type !== "el") return opts.removeComments && node.type === "comment" ? [] : [pad + node.raw];
  if (node.selfClosing) return [pad + open(node) + "/>"];
  const kids = node.children.filter((c) => !blank(c) && !(opts.removeComments && c.type === "comment"));
  if (!kids.length) return [pad + open(node) + "></" + node.name + ">"];
  if (kids.length === 1 && (kids[0].type === "text" || kids[0].type === "cdata")) {
    const inner = kids[0].type === "text" ? kids[0].value.trim() : kids[0].raw;
    return [pad + open(node) + ">" + inner + "</" + node.name + ">"];
  }
  return [pad + open(node) + ">", ...kids.flatMap((k) => pretty(k, depth + 1, unit, opts)), pad + "</" + node.name + ">"];
}

function compact(node, opts) {
  if (node.type === "text") return node.value;
  if (node.type !== "el") return opts.removeComments && node.type === "comment" ? "" : node.raw;
  if (node.selfClosing) return open(node) + "/>";
  const kids = node.children.filter((c) => !(opts.removeComments && c.type === "comment"));
  const structural = kids.some((c) => c.type !== "text" && c.type !== "cdata");
  const kept = structural ? kids.filter((c) => !blank(c)) : kids;
  if (!kept.length) return open(node) + "/>";
  return open(node) + ">" + kept.map((k) => compact(k, opts)).join("") + "</" + node.name + ">";
}

export function formatXml(text, { unit = "  ", removeComments = false } = {}) {
  return parseXml(text).flatMap((n) => pretty(n, 0, unit, { removeComments })).join("\n");
}

export function minifyXml(text, { removeComments = true } = {}) {
  return parseXml(text).map((n) => compact(n, { removeComments })).join("");
}


import { loadVendor } from "./vendor.js";

function protectMath(md) {
  const expressions = [];

  const source = md.replace(
    /\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$/g,
    (expression) => {
      const token = `MATHPLACEHOLDER${expressions.length}TOKEN`;
      expressions.push(expression);
      return token;
    },
  );

  return { source, expressions };
}

function restoreMath(root, expressions) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];

  while (walker.nextNode()) {
    if (/MATHPLACEHOLDER\d+TOKEN/.test(walker.currentNode.nodeValue)) {
      nodes.push(walker.currentNode);
    }
  }

  for (const node of nodes) {
    const pattern = /MATHPLACEHOLDER(\d+)TOKEN/g;
    const value = node.nodeValue;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(value))) {
      fragment.append(document.createTextNode(value.slice(lastIndex, match.index)));

      const expression = expressions[Number(match[1])];

      if (expression !== undefined) {
        fragment.append(document.createTextNode(expression));
      }

      lastIndex = pattern.lastIndex;
    }

    fragment.append(document.createTextNode(value.slice(lastIndex)));
    node.replaceWith(fragment);
  }
}

let hooked = false;
let mermaidInitialized = false;
let diagramId = 0;

export async function renderMarkdown(md) {
  const [{ marked }, purify] = await Promise.all([
    loadVendor("marked"),
    loadVendor("dompurify"),
  ]);

  if (!hooked) {
    purify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A" && node.hasAttribute("href")) {
        node.setAttribute("rel", "noopener noreferrer");
        node.setAttribute("target", "_blank");
      }
    });
    hooked = true;
  }

  // Protect mathematical expressions before Markdown parsing
  const { source, expressions } = protectMath(md);

  const root = document.createElement("div");
  root.innerHTML = purify.sanitize(
    marked.parse(source, { gfm: true, async: false }),
  );

  // Restore mathematical expressions
  restoreMath(root, expressions);

  // Mathematical expressions
  if (expressions.length) {
    await loadVendor("katex");
    const renderMathInElement = await loadVendor("katexAutoRender");

    renderMathInElement(root, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
      trust: false,
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    });
  }

  // Mermaid diagrams
  const diagrams = root.querySelectorAll("pre > code.language-mermaid");

  if (diagrams.length) {
    const mermaid = await loadVendor("mermaid");

    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "default",
      });
      mermaidInitialized = true;
    }

    for (const code of diagrams) {
      const wrapper = document.createElement("div");
      wrapper.className = "md-mermaid";

      try {
        const id = `md-diagram-${++diagramId}`;
        const result = await mermaid.render(id, code.textContent);
        wrapper.innerHTML = result.svg;
        result.bindFunctions?.(wrapper);
      } catch (err) {
        wrapper.className = "md-mermaid error";
        wrapper.textContent = `Diagram error: ${err.message}`;
      }

      code.parentElement.replaceWith(wrapper);
    }
  }

  // Code syntax highlighting
  const blocks = root.querySelectorAll("pre code:not(.language-mermaid)");

  if (blocks.length) {
    const hljs = await loadVendor("highlightjs");
    blocks.forEach((block) => hljs.highlightElement(block));
  }

  return root.innerHTML;
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

  return {
    text: text.slice(0, from) + block + text.slice(to),
    start: from,
    end: from + block.length,
  };
}

export function markdownStats(md) {
  const words = (md.match(/\S+/g) || []).length;
  return `${words} words, ${md.length} characters, ${md ? md.split("\n").length : 0} lines`;
}

export const SAMPLE = `# Markdown editor

Write **bold**, _italic_ and \`code\`.

## Lists

- List item
- Another item

## Tables

| Column | Value |
| --- | --- |
| One | 1 |

## Mathematics

Inline: \\(E = mc^2\\)

Block:

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## Mermaid diagram

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Condition?}
    B -->|Yes| C[Continue]
    B -->|No| D[Stop]
\`\`\`

## Code highlighting

\`\`\`javascript
function greet(name) {
  return \`Hello, ${"${"}name}!\`;
}
\`\`\`

> A quotation

[Example link](https://example.com)
`;

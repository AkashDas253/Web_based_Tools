# Web Development Utilities

A browser-based collection of web development utilities. All processing runs locally in the browser. No data is transmitted and no external requests are made.

## Tools

### Color

| Tool | Features |
|---|---|
| Color Converter | CSS color names, HEX, RGB, HSL, HSV, CMYK, OKLCH, live preview |
| Contrast Checker | WCAG contrast ratio, AA/AAA compliance, text and UI previews |
| Palette Generator | Complementary, analogous, triadic, split-complementary, tetradic, tints and shades |
| Gradient Generator | Linear, radial and conic gradients, multiple color stops |

### CSS

| Tool | Features |
|---|---|
| Flexbox and Grid | Container and item properties, live layout preview, CSS output |
| Box Shadow | Offset, blur, spread, color, opacity and inset |
| Border Radius | Individual corner values in px, %, and rem |
| Unit Converter | px, rem, em, pt, vw and vh |
| Fluid Typography | Responsive font sizing with `clamp()` |

### Data and Encoding

| Tool | Features |
|---|---|
| JSON Formatter | Formatting, key sorting, minification and error reporting |
| Base64 | Text and file encoding/decoding, standard and URL-safe variants |
| Hash Generator | MD5, SHA-1, SHA-256, SHA-384, SHA-512 and HMAC |
| URL and HTML Encoder | URI encoding, HTML entities and query string parsing |
| JWT Decoder | Header, payload, claims, expiry and supported signature verification |
| UUID and Random Strings | UUID v4/v7, validation, random strings and passwords |

### Text and Code

| Tool | Features |
|---|---|
| Diff Checker | Side-by-side line and word comparison, change highlighting |
| Case and Text Converter | Case conversion, sorting, deduplication, reversal and statistics |
| Lorem Ipsum Generator | Paragraph, sentence and word generation |
| Markdown Editor | Live preview, GFM, formatting toolbar, mathematical expressions, Mermaid diagrams, syntax highlighting, HTML/Markdown export |
| Regex Tester | Match highlighting, capture groups, flags and replacement preview |

### Formatters and Minifiers

| Tool | Features |
|---|---|
| HTML Formatter | Formatting and minification |
| CSS Formatter | Formatting and minification with rule merging |
| JavaScript Formatter | Formatting and minification with optional name mangling |
| XML Formatter | Formatting, minification and well-formedness checking |

### Converters

| Tool | Features |
|---|---|
| Timestamp Converter | Unix timestamps, ISO 8601 and IANA time zones |
| Image to Data URI | File conversion, WebP/JPEG re-encoding and CSS/HTML output |

**Shared features:** Dashboard, light and dark themes, persisted inputs, clipboard support, JSON export, and stored-data import and clearing.

## Technologies

- HTML5 and CSS3
- Vanilla JavaScript with ES modules
- Browser APIs: Web Crypto, Clipboard, localStorage and TextEncoder
- Vendored libraries for formatting, minification and Markdown processing

## Project Structure

```text
web-dev-util/
├── index.html
├── README.md
├── vendor-downloads.md
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── ui.js
│   ├── storage.js
│   ├── components/
│   │   ├── dashboard.js
│   │   ├── tool-view.js
│   │   └── one component per tool
│   └── tools/
│       ├── vendor.js
│       └── one logic module per tool
└── vendor/
    ├── js-beautify/
    ├── terser/
    ├── csso/
    ├── html-minifier-terser/
    ├── marked/
    ├── dompurify/
    ├── katex/
    ├── mermaid/
    └── highlightjs/
```

## Architecture

- **`app.js`:** Maintains the tool registry and shared application interface, including state, storage and notifications.
- **`ui.js`:** Handles navigation, hash-based routing, component lifecycle, themes and data import/export.
- **`components/`:** Contains tool interfaces. Components export `mount(container, app)` and `unmount()`. Standard tools use the shared `createToolView` configuration.
- **`tools/`:** Contains tool logic, separated from DOM manipulation.
- **`storage.js`:** Centralizes localStorage access. All storage keys use the `web-dev-util:` prefix.
- **`vendor/`:** Contains locally stored third-party libraries.
- **`tools/vendor.js`:** Loads vendored libraries on demand and reports missing dependencies.

## Running Locally

The project uses ES modules and must be served over HTTP or HTTPS.

```bash
cd web-dev-util
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

The project can also be deployed directly to GitHub Pages.

## Vendor Dependencies

Nine third-party libraries are included in `vendor/`. They are required only by the relevant formatting, minification and Markdown tools. Other tools work independently of these libraries.

| Library | Version | License | Purpose |
|---|---:|---|---|
| js-beautify | 2.0.3 | MIT | HTML, CSS and JavaScript formatting |
| terser | 5.51.2 | BSD-2-Clause | JavaScript minification |
| csso | 5.0.5 | MIT | CSS minification |
| html-minifier-terser | 7.2.0 | MIT | HTML minification |
| marked | 18.2.0 | MIT | Markdown parsing |
| DOMPurify | 3.4.17 | MPL-2.0 / Apache-2.0 | HTML sanitization |
| KaTeX | Verify installed version | Verify license | Mathematical expression rendering |
| Mermaid | Verify installed version | Verify license | Diagram rendering |
| Highlight.js | Verify installed version | Verify license | Code syntax highlighting |

Dependencies are stored locally, pinned to exact versions and loaded on demand. Missing libraries affect only the tools that require them.

Download commands, file paths, SHA-256 checksums, license files and update instructions are maintained in [`vendor-downloads.md`](vendor-downloads.md).

## Limitations

- Requires a modern browser with ES module support.
- SHA hashing and HMAC require HTTPS or localhost through `crypto.subtle`.
- File hashing reads the entire file into memory.
- HMAC keys are not persisted.
- The HTML entity table covers common entities rather than the complete HTML5 set.
- UUID v7 ordering is not guaranteed within the same millisecond.
- JWT verification supports HS, RS and ES algorithms; PS and EdDSA are not supported.
- OKLCH colors outside the sRGB gamut are clamped.
- Contrast checking ignores alpha transparency.
- Regular expressions run on the main thread; catastrophic backtracking can freeze the tab.
- Box Shadow supports a single shadow layer.
- Image to Data URI supports files up to 2 MB. WebP encoding depends on browser support.
- Diff comparison is limited to approximately four million line or word pairs.
- XML formatting checks well-formedness only. It does not validate DTDs or schemas or resolve entities.
- XML mixed content may be reformatted onto separate lines.
- Markdown preview sanitizes raw HTML, removing scripts and event handlers.
- Downloaded Markdown HTML embeds its stylesheets and font assets for standalone viewing.
- Formatting, minification and Markdown tools require their corresponding files in `vendor/`.

## Planned Additions

- **Color:** EyeDropper API integration.
- **CSS:** Multi-layer box shadows.
- **Data and Encoding:** JSON tree viewer, JSON/YAML/CSV/XML converters.
- **Generators:** QR code generator.
- **Formatters and Minifiers:** SQL formatter and SVG minifier.
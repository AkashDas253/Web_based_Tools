import { readAsDataUri, reencode, report, cssUrl, imgTag } from "../tools/image-data-uri.js";

let cleanup = [];

export function mount(container, app) {
  container.innerHTML = `<h1>Image to data URI</h1>
<p>Encode an image file as a data URI, optionally re-encoded as WebP or JPEG. Files stay in the browser. Limit: 2 MB.</p>
<div class="field"><label for="img-file">Image file</label><input id="img-file" type="file" accept="image/*"></div>
<div class="field"><label for="img-fmt">Output format</label><select id="img-fmt"><option>Original</option><option>image/webp</option><option>image/jpeg</option></select></div>
<div class="field"><label for="img-q">Quality for re-encoding (0.1 to 1)</label><input id="img-q" type="number" min="0.1" max="1" step="0.1" value="0.8"></div>
<div id="preview" hidden></div>
<pre id="img-info" aria-live="polite">No image selected</pre>
<div class="field"><label for="img-out">Data URI</label><textarea id="img-out" readonly></textarea></div>
<button id="c-uri" type="button">Copy data URI</button> <button id="c-css" type="button">Copy CSS</button> <button id="c-img" type="button">Copy img tag</button>`;
  const $ = (s) => container.querySelector(s);
  let file = null;
  let original = "";
  let token = 0;

  async function copy(text) {
    if (!text) return app.notify("Nothing to copy", "error");
    try {
      await navigator.clipboard.writeText(text);
      app.notify("Copied");
    } catch {
      app.notify("Clipboard unavailable", "error");
    }
  }

  async function process() {
    if (!file) return;
    const current = ++token;
    const info = $("#img-info");
    try {
      if (!original) original = await readAsDataUri(file);
      const format = $("#img-fmt").value;
      const uri = format === "Original" ? original : await reencode(original, format, Number($("#img-q").value) || 0.8);
      if (current !== token) return;
      info.className = "";
      info.textContent = report(file.size, uri);
      $("#img-out").value = uri;
      const pv = $("#preview");
      pv.hidden = false;
      pv.textContent = "";
      const img = document.createElement("img");
      img.alt = "Preview";
      img.style.maxWidth = "100%";
      img.src = uri;
      pv.append(img);
    } catch (err) {
      if (current !== token) return;
      info.className = "error";
      info.textContent = err.message;
      $("#img-out").value = "";
      $("#preview").hidden = true;
    }
  }

  const onFile = (e) => {
    file = e.target.files[0] || null;
    original = "";
    process();
  };
  const handlers = [
    ["#img-file", "change", onFile],
    ["#img-fmt", "change", process],
    ["#img-q", "input", process],
    ["#c-uri", "click", () => copy($("#img-out").value)],
    ["#c-css", "click", () => copy($("#img-out").value && cssUrl($("#img-out").value))],
    ["#c-img", "click", () => copy($("#img-out").value && imgTag($("#img-out").value))],
  ];
  handlers.forEach(([sel, ev, fn]) => $(sel).addEventListener(ev, fn));
  cleanup = [() => token++, ...handlers.map(([sel, ev, fn]) => () => $(sel).removeEventListener(ev, fn))];
}

export function unmount() {
  cleanup.forEach((fn) => fn());
  cleanup = [];
}

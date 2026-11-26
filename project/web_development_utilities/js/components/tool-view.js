export function createToolView({ id, title, description, inputs, run, preview, previewText = "", refresh = false, previewItems }) {
  let cleanup = [];

  function mount(container, app) {
    const values = app.state.get(id, {});
    container.innerHTML = `<h1>${title}</h1><p>${description}</p><form></form><div id="preview" hidden></div><h2>Result</h2><div id="rich" hidden></div><pre id="out" aria-live="polite"></pre><button id="copy" type="button">Copy result</button>${refresh ? ' <button id="again" type="button">Regenerate</button>' : ""}`;
    const form = container.querySelector("form");
    const out = container.querySelector("#out");
    const pv = container.querySelector("#preview");
    const rich = container.querySelector("#rich");
    const fields = {};

    inputs.forEach((input) => {
      const wrap = document.createElement("div");
      wrap.className = "field";
      const label = document.createElement("label");
      label.textContent = input.label;
      label.htmlFor = `${id}-${input.name}`;
      let el;
      if (input.type === "textarea") el = document.createElement("textarea");
      else if (input.type === "select") {
        el = document.createElement("select");
        input.options.forEach((o) => el.append(new Option(o, o)));
      } else {
        el = document.createElement("input");
        el.type = input.type || "text";
      }
      el.id = label.htmlFor;
      if (input.type === "checkbox") el.checked = Boolean(values[input.name] ?? input.default ?? false);
      else if (input.type !== "file") el.value = values[input.name] ?? input.default ?? "";
      fields[input.name] = el;
      wrap.append(label, el);
      form.append(wrap);
    });

    const keep = new Set(inputs.filter((i) => i.persist !== false && i.type !== "file").map((i) => i.name));
    let token = 0;
    async function update() {
      const current = ++token;
      const data = Object.fromEntries(Object.entries(fields).map(([k, el]) => [k, el.type === "file" ? el.files[0] || null : el.type === "checkbox" ? el.checked : el.value]));
      app.state.set(id, Object.fromEntries(Object.entries(data).filter(([k]) => keep.has(k))));
      try {
        const raw = await run(data);
        if (current !== token) return;
        const result = raw && typeof raw === "object" ? raw.text : raw;
        out.className = "";
        out.textContent = result || "No input";
        rich.textContent = "";
        rich.hidden = !(raw && raw.rich);
        if (raw && raw.rich) raw.rich(rich);
        pv.hidden = !preview || !result;
        if (preview && result) {
          pv.textContent = previewText;
          pv.style.cssText = preview(data, result);
          const items = previewItems ? Math.min(24, Math.max(0, Number(previewItems(data)) || 0)) : 0;
          for (let i = 1; i <= items; i++) {
            const el = document.createElement("div");
            el.className = "item";
            el.textContent = i;
            pv.append(el);
          }
        }
      } catch (err) {
        if (current !== token) return;
        out.className = "error";
        out.textContent = err.message;
        pv.hidden = true;
        rich.hidden = true;
      }
    }

    form.addEventListener("input", update);
    form.addEventListener("submit", (e) => e.preventDefault());
    const copy = container.querySelector("#copy");
    const onCopy = async () => {
      try {
        await navigator.clipboard.writeText(out.textContent);
        app.notify("Copied");
      } catch {
        app.notify("Clipboard unavailable", "error");
      }
    };
    copy.addEventListener("click", onCopy);
    const again = container.querySelector("#again");
    if (again) again.addEventListener("click", update);
    cleanup = [() => form.removeEventListener("input", update), () => copy.removeEventListener("click", onCopy), () => again && again.removeEventListener("click", update), () => token++];
    update();
  }

  function unmount() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
  }

  return { mount, unmount };
}

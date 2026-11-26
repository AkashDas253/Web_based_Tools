const LIBS = {
  beautifier: { file: "js-beautify/beautifier.min.js", type: "script", global: "beautifier", ready: "html" },
  terser: { file: "terser/bundle.min.js", type: "script", global: "Terser", ready: "minify" },
  htmlminifier: { file: "html-minifier-terser/htmlminifier.umd.bundle.min.js", type: "script", global: "HTMLMinifier", ready: "minify" },
  csso: { file: "csso/csso.esm.js", type: "module" },
  marked: { file: "marked/marked.esm.js", type: "module" },
  dompurify: { file: "dompurify/purify.es.js", type: "module", pick: "default" },
};

const cache = new Map();
const href = (file) => new URL("../../vendor/" + file, import.meta.url).href;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = resolve;
    el.onerror = () => reject(new Error("script load failed"));
    document.head.append(el);
  });
}

async function load(lib) {
  if (lib.type === "script") {
    const ready = () => globalThis[lib.global] && typeof globalThis[lib.global][lib.ready] === "function";
    if (!ready()) await loadScript(href(lib.file));
    if (!ready()) throw new Error("library did not initialize");
    return globalThis[lib.global];
  }
  const mod = await import(href(lib.file));
  return lib.pick ? mod[lib.pick] : mod;
}

export function loadVendor(name) {
  const lib = LIBS[name];
  if (!lib) return Promise.reject(new Error("Unknown library: " + name));
  if (!cache.has(name)) {
    const promise = load(lib).catch(() => {
      cache.delete(name);
      throw new Error(`The library "${name}" could not be loaded from vendor/${lib.file}. Download it as described in vendor-downloads.md.`);
    });
    cache.set(name, promise);
  }
  return cache.get(name);
}

const LIMIT = 4e6;

function normalizer({ ignoreCase = false, ignoreWhitespace = false } = {}) {
  return (s) => {
    let v = s;
    if (ignoreWhitespace) v = v.replace(/\s+/g, " ").trim();
    if (ignoreCase) v = v.toLowerCase();
    return v;
  };
}

function sequence(a, b, options) {
  const norm = normalizer(options);
  const na = a.map(norm);
  const nb = b.map(norm);
  const n = a.length;
  const m = b.length;
  if (n * m > LIMIT) throw new Error("Inputs are too large to compare.");
  const w = m + 1;
  const t = new Uint16Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      t[i * w + j] = na[i] === nb[j] ? t[(i + 1) * w + j + 1] + 1 : Math.max(t[(i + 1) * w + j], t[i * w + j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (na[i] === nb[j]) ops.push({ type: "eq", value: a[i++], other: b[j++] });
    else if (t[(i + 1) * w + j] >= t[i * w + j + 1]) ops.push({ type: "del", value: a[i++] });
    else ops.push({ type: "add", value: b[j++] });
  }
  while (i < n) ops.push({ type: "del", value: a[i++] });
  while (j < m) ops.push({ type: "add", value: b[j++] });
  return ops;
}

export function diffLines(a, b, options) {
  return sequence(a.split("\n"), b.split("\n"), options);
}

export function diffWords(a, b, options) {
  return sequence(a.match(/\s+|\S+/g) || [], b.match(/\s+|\S+/g) || [], options);
}

export function mergeRuns(ops) {
  const runs = [];
  ops.forEach((o) => {
    const last = runs[runs.length - 1];
    if (last && last.type === o.type) last.value += o.value;
    else runs.push({ type: o.type, value: o.value });
  });
  return runs;
}

export function wordRuns(a, b, options) {
  return mergeRuns(diffWords(a, b, options));
}

export function sideBySide(a, b, options) {
  const rows = [];
  let dels = [];
  let adds = [];
  const flush = () => {
    const n = Math.max(dels.length, adds.length);
    for (let k = 0; k < n; k++) {
      rows.push({
        left: dels[k] === undefined ? null : { text: dels[k], type: "del" },
        right: adds[k] === undefined ? null : { text: adds[k], type: "add" },
      });
    }
    dels = [];
    adds = [];
  };
  diffLines(a, b, options).forEach((o) => {
    if (o.type === "del") dels.push(o.value);
    else if (o.type === "add") adds.push(o.value);
    else {
      flush();
      rows.push({ left: { text: o.value, type: "eq" }, right: { text: o.other, type: "eq" } });
    }
  });
  flush();
  return rows;
}

export function formatDiff(a, b, mode = "Lines", options = {}) {
  if (mode === "Lines") {
    const ops = diffLines(a, b, options);
    const added = ops.filter((o) => o.type === "add").length;
    const removed = ops.filter((o) => o.type === "del").length;
    if (!added && !removed) return "No differences";
    const mark = { eq: "  ", del: "- ", add: "+ " };
    return `Added: ${added}, removed: ${removed}\n` + ops.map((o) => mark[o.type] + o.value).join("\n");
  }
  const runs = wordRuns(a, b, options);
  if (runs.every((r) => r.type === "eq")) return "No differences";
  return runs.map((r) => (r.type === "eq" ? r.value : r.type === "del" ? `[-${r.value}-]` : `{+${r.value}+}`)).join("");
}

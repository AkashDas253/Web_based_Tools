export const UNITS = ["px", "rem", "em", "pt", "vw", "vh"];

function factor(unit, { base, vw, vh }) {
  const f = { px: 1, rem: base, em: base, pt: 4 / 3, vw: vw / 100, vh: vh / 100 }[unit];
  if (f === undefined) throw new Error("Unsupported unit: " + unit);
  return f;
}

function context({ base = 16, vw = 1920, vh = 1080 } = {}) {
  const ctx = { base: Number(base), vw: Number(vw), vh: Number(vh) };
  if (Object.values(ctx).some((v) => !Number.isFinite(v) || v <= 0)) throw new Error("Base size and viewport must be positive numbers.");
  return ctx;
}

export function convert(value, from, to, options) {
  const n = Number(value);
  if (value === "" || !Number.isFinite(n)) throw new Error("Value must be a number.");
  const ctx = context(options);
  return Number(((n * factor(from, ctx)) / factor(to, ctx)).toFixed(4));
}

export function convertAll(value, from, options) {
  return Object.fromEntries(UNITS.map((u) => [u, convert(value, from, u, options)]));
}

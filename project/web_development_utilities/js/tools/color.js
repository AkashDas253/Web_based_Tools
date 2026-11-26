import { NAMED } from "./color-names.js";

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const UNSUPPORTED = "Unsupported color. Use a name, #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), hsla(), hsv(), cmyk() or oklch().";
const REVERSE = new Map();
Object.entries(NAMED).forEach(([name, hex]) => REVERSE.has(hex) || REVERSE.set(hex, name));

function hexToRgb(h) {
  if (h.length <= 4) h = [...h].map((c) => c + c).join("");
  const a = h.length === 8 ? Math.round((parseInt(h.slice(6, 8), 16) / 255) * 1000) / 1000 : 1;
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a };
}

export function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + (((h % 360) + 360) % 360) / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return { r: f(0), g: f(8), b: f(4) };
}

function hsvToRgb(h, s, v) {
  s /= 100;
  v /= 100;
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return hslToRgb(h, sl * 100, l * 100);
}

const toLinear = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const fromLinear = (v) => Math.round(255 * clamp(v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055, 0, 1));

export function oklchToRgb(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

export function rgbToOklch({ r, g, b }) {
  const [R, G, B] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, Bb);
  const h = C < 0.0001 ? 0 : ((Math.atan2(Bb, A) * 180) / Math.PI + 360) % 360;
  return { L, C, h };
}

export function parseColor(input) {
  const s = input.trim().toLowerCase();
  if (NAMED[s]) return hexToRgb(NAMED[s]);
  let m = s.match(/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (m) return hexToRgb(m[1]);
  m = s.match(/^(rgba?|hsla?|hsv|cmyk|oklch)\(([^)]*)\)$/);
  if (!m) throw new Error(UNSUPPORTED);
  const args = m[2].replace("/", " ").split(/[\s,]+/).filter(Boolean);
  const num = (x) => {
    const v = parseFloat(x);
    if (!Number.isFinite(v)) throw new Error(UNSUPPORTED);
    return v;
  };
  const alpha = (x) => (x === undefined ? 1 : Math.round(clamp(x.endsWith("%") ? num(x) / 100 : num(x), 0, 1) * 1000) / 1000);
  const kind = m[1].replace(/a$/, "");
  const need = kind === "cmyk" ? [4, 4] : [3, 4];
  if (args.length < need[0] || args.length > need[1]) throw new Error(UNSUPPORTED);
  if (kind === "rgb") {
    const ch = (x) => clamp(Math.round(x.endsWith("%") ? num(x) * 2.55 : num(x)), 0, 255);
    return { r: ch(args[0]), g: ch(args[1]), b: ch(args[2]), a: alpha(args[3]) };
  }
  if (kind === "hsl") return { ...hslToRgb(num(args[0]), clamp(num(args[1]), 0, 100), clamp(num(args[2]), 0, 100)), a: alpha(args[3]) };
  if (kind === "hsv") return { ...hsvToRgb(num(args[0]), clamp(num(args[1]), 0, 100), clamp(num(args[2]), 0, 100)), a: alpha(args[3]) };
  if (kind === "cmyk") {
    const [c, mm, y, k] = args.map((x) => clamp(num(x), 0, 100) / 100);
    return { r: Math.round(255 * (1 - c) * (1 - k)), g: Math.round(255 * (1 - mm) * (1 - k)), b: Math.round(255 * (1 - y) * (1 - k)), a: 1 };
  }
  const L = args[0].endsWith("%") ? num(args[0]) / 100 : num(args[0]);
  return { ...oklchToRgb(L, num(args[1]), num(args[2])), a: alpha(args[3]) };
}

export function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: Math.round(l * 100) };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: Math.round((h * 60 + 360) % 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function rgbToHsv(rgb) {
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  return { h: rgbToHsl(rgb).h, s: max === 0 ? 0 : Math.round(((max - min) / max) * 100), v: Math.round(max * 100) };
}

export function rgbToCmyk({ r, g, b }) {
  const k = 1 - Math.max(r, g, b) / 255;
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const f = (v) => Math.round(((1 - v / 255 - k) / (1 - k)) * 100);
  return { c: f(r), m: f(g), y: f(b), k: Math.round(k * 100) };
}

export function toHex({ r, g, b, a }) {
  const hex = [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  const alpha = a !== undefined && a < 1 ? Math.round(a * 255).toString(16).padStart(2, "0") : "";
  return "#" + hex + alpha;
}

export function formats(input) {
  const c = parseColor(input);
  const hsl = rgbToHsl(c);
  const hsv = rgbToHsv(c);
  const cmyk = rgbToCmyk(c);
  const ok = rgbToOklch(c);
  const withAlpha = c.a < 1;
  const out = {
    hex: toHex(c),
    rgb: withAlpha ? `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})` : `rgb(${c.r}, ${c.g}, ${c.b})`,
    hsl: withAlpha ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${c.a})` : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    oklch: `oklch(${Number((ok.L * 100).toFixed(1))}% ${Number(ok.C.toFixed(4))} ${Number(ok.h.toFixed(2))}${withAlpha ? ` / ${c.a}` : ""})`,
  };
  const name = REVERSE.get(out.hex.slice(1));
  if (name) out.name = name;
  return out;
}

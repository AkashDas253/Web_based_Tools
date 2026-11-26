import { parseColor, toHex } from "./color.js";

export const TYPES = ["linear", "radial", "conic"];

export function parseStops(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("At least two color stops are required.");
  return lines.map((line) => {
    const m = line.match(/^(.*?)(?:\s+(\d+(?:\.\d+)?)%)?$/);
    const hex = toHex(parseColor(m[1]));
    if (m[2] === undefined) return hex;
    if (+m[2] > 100) throw new Error("Stop position must be between 0 and 100.");
    return `${hex} ${m[2]}%`;
  });
}

export function build(type, angle, stopsText) {
  if (!TYPES.includes(type)) throw new Error("Unknown gradient type: " + type);
  const deg = Number(angle);
  if (!Number.isFinite(deg) || deg < 0 || deg > 360) throw new Error("Angle must be between 0 and 360.");
  const stops = parseStops(stopsText).join(", ");
  if (type === "linear") return `background: linear-gradient(${deg}deg, ${stops});`;
  if (type === "radial") return `background: radial-gradient(circle, ${stops});`;
  return `background: conic-gradient(from ${deg}deg, ${stops});`;
}

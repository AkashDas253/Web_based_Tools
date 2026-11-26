import { parseColor } from "./color.js";

function num(value, name, min = -Infinity, max = Infinity) {
  const n = Number(value);
  if (value === "" || !Number.isFinite(n) || n < min || n > max) throw new Error(`Invalid value for ${name}`);
  return n;
}

export function boxShadow({ x, y, blur, spread, color, opacity, inset }) {
  const { r, g, b } = parseColor(color);
  const a = num(opacity, "opacity", 0, 1);
  const parts = [num(x, "x offset"), num(y, "y offset"), num(blur, "blur", 0), num(spread, "spread")].map((v) => v + "px");
  return `box-shadow: ${inset ? "inset " : ""}${parts.join(" ")} rgba(${r}, ${g}, ${b}, ${a});`;
}

export function borderRadius({ tl, tr, br, bl, unit }) {
  if (!["px", "%", "rem"].includes(unit)) throw new Error("Unsupported unit: " + unit);
  const values = [tl, tr, br, bl].map((v, i) => num(v, ["top-left", "top-right", "bottom-right", "bottom-left"][i], 0) + unit);
  return `border-radius: ${values.join(" ")};`;
}

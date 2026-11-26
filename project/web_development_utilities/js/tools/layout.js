export const MODES = ["flex", "grid"];
export const DIRECTIONS = ["row", "row-reverse", "column", "column-reverse"];
export const WRAPS = ["nowrap", "wrap", "wrap-reverse"];
export const JUSTIFY = ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"];
export const ALIGN = ["stretch", "flex-start", "center", "flex-end", "baseline"];

function pick(value, list, name) {
  if (!list.includes(value)) throw new Error(`Invalid ${name}: ${value}`);
  return value;
}

function int(value, name, min, max) {
  const n = Number(value);
  if (value === "" || !Number.isInteger(n) || n < min || n > max) throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  return n;
}

export function buildLayout({ mode, direction, wrap, justify, align, gap, columns }) {
  pick(mode, MODES, "mode");
  const g = Number(gap);
  if (gap === "" || !Number.isFinite(g) || g < 0) throw new Error("Gap must be a non-negative number.");
  const common = [`justify-content: ${pick(justify, JUSTIFY, "justify-content")};`, `align-items: ${pick(align, ALIGN, "align-items")};`, `gap: ${g}px;`];
  const head =
    mode === "flex"
      ? ["display: flex;", `flex-direction: ${pick(direction, DIRECTIONS, "direction")};`, `flex-wrap: ${pick(wrap, WRAPS, "wrap")};`]
      : ["display: grid;", `grid-template-columns: repeat(${int(columns, "Columns", 1, 12)}, 1fr);`];
  return [...head, ...common].join("\n");
}

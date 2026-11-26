const round = (n) => Number(n.toFixed(4));

export function fluidClamp({ minSize, maxSize, minViewport, maxViewport }) {
  const [a, b, c, d] = [minSize, maxSize, minViewport, maxViewport].map(Number);
  if ([a, b, c, d].some((v) => !Number.isFinite(v) || v <= 0)) throw new Error("All values must be positive numbers.");
  if (b <= a) throw new Error("Maximum size must be greater than minimum size.");
  if (d <= c) throw new Error("Maximum viewport must be greater than minimum viewport.");
  const slope = (b - a) / (d - c);
  const intercept = a - slope * c;
  return `clamp(${round(a / 16)}rem, ${round(intercept / 16)}rem + ${round(slope * 100)}vw, ${round(b / 16)}rem)`;
}

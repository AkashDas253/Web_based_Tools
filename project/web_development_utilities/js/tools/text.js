export function words(line) {
  return line
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
const perLine = (fn) => (text) => text.split("\n").map(fn).join("\n");

export const OPERATIONS = {
  camelCase: perLine((l) => words(l).map((w, i) => (i ? cap(w) : w)).join("")),
  PascalCase: perLine((l) => words(l).map(cap).join("")),
  snake_case: perLine((l) => words(l).join("_")),
  CONSTANT_CASE: perLine((l) => words(l).join("_").toUpperCase()),
  "kebab-case": perLine((l) => words(l).join("-")),
  "Title Case": perLine((l) => words(l).map(cap).join(" ")),
  UPPERCASE: (t) => t.toUpperCase(),
  lowercase: (t) => t.toLowerCase(),
  "Sort lines": (t) => t.split("\n").sort((a, b) => a.localeCompare(b)).join("\n"),
  "Unique lines": (t) => [...new Set(t.split("\n"))].join("\n"),
  "Reverse lines": (t) => t.split("\n").reverse().join("\n"),
  "Trim lines": perLine((l) => l.trim()),
  Statistics: (t) => `Characters: ${t.length}\nWords: ${(t.match(/\S+/g) || []).length}\nLines: ${t.split("\n").length}`,
};

export function transform(text, operation) {
  const fn = OPERATIONS[operation];
  if (!fn) throw new Error("Unknown operation: " + operation);
  return fn(text);
}

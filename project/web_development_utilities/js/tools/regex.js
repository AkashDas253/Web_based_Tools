export function findMatches(pattern, flags, text, limit = 500) {
  if (!pattern) return [];
  let re;
  try {
    re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
  } catch (err) {
    throw new Error("Invalid pattern: " + err.message);
  }
  const results = [];
  let m;
  while ((m = re.exec(text)) !== null && results.length < limit) {
    results.push({ index: m.index, value: m[0], groups: m.slice(1), named: m.groups || {} });
    if (m[0] === "") re.lastIndex++;
  }
  return results;
}

export function describe(matches) {
  if (!matches.length) return "No matches";
  return matches
    .map((m, i) => {
      const groups = m.groups.map((g, j) => `  group ${j + 1}: ${g}`).join("\n");
      const named = Object.entries(m.named).map(([k, v]) => `  ${k}: ${v}`).join("\n");
      return [`#${i + 1} at ${m.index}: ${JSON.stringify(m.value)}`, groups, named].filter(Boolean).join("\n");
    })
    .join("\n");
}

export function replaceMatches(pattern, flags, text, replacement) {
  let re;
  try {
    re = new RegExp(pattern, flags);
  } catch (err) {
    throw new Error("Invalid pattern: " + err.message);
  }
  return text.replace(re, replacement);
}

export function segments(text, matches) {
  const out = [];
  let pos = 0;
  matches.forEach((m) => {
    if (!m.value || m.index < pos) return;
    if (m.index > pos) out.push({ text: text.slice(pos, m.index), match: false });
    out.push({ text: m.value, match: true });
    pos = m.index + m.value.length;
  });
  if (pos < text.length) out.push({ text: text.slice(pos), match: false });
  return out;
}

export const FLAGS = [
  ["g", "Global (g)"],
  ["i", "Ignore case (i)"],
  ["m", "Multiline (m)"],
  ["s", "Dot matches newline (s)"],
  ["u", "Unicode (u)"],
  ["y", "Sticky (y)"],
];

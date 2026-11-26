const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
const INTRO = WORDS.slice(0, 8);
export const UNITS = ["Paragraphs", "Sentences", "Words"];
const LIMITS = { Paragraphs: 50, Sentences: 200, Words: 2000 };

function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32;
}

function wordList(count, r, intro) {
  const list = intro ? INTRO.slice(0, count) : [];
  while (list.length < count) list.push(WORDS[Math.floor(r() * WORDS.length)]);
  return list;
}

function sentence(r, intro) {
  const count = intro ? 8 : 8 + Math.floor(r() * 7);
  const list = wordList(count, r, intro);
  if (intro) list[4] += ",";
  const text = list.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

export function generate(unit, count) {
  const n = Number(count);
  if (!UNITS.includes(unit)) throw new Error("Unknown unit: " + unit);
  if (!Number.isInteger(n) || n < 1 || n > LIMITS[unit]) throw new Error(`Count must be an integer between 1 and ${LIMITS[unit]}.`);
  const r = rng(2024);
  if (unit === "Words") return wordList(n, r, true).join(" ");
  if (unit === "Sentences") return Array.from({ length: n }, (_, i) => sentence(r, i === 0)).join(" ");
  return Array.from({ length: n }, (_, p) => {
    const sentences = 4 + Math.floor(r() * 3);
    return Array.from({ length: sentences }, (_, i) => sentence(r, p === 0 && i === 0)).join(" ");
  }).join("\n\n");
}

const NAMED = { quot: '"', amp: "&", apos: "'", lt: "<", gt: ">" };

function addRange(start, names) {
  names.split(" ").forEach((n, i) => (NAMED[n] = String.fromCodePoint(start + i)));
}

addRange(0xa0, "nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr deg plusmn sup2 sup3 acute micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest");
addRange(0xc0, "Agrave Aacute Acirc Atilde Auml Aring AElig Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ETH Ntilde Ograve Oacute Ocirc Otilde Ouml times Oslash Ugrave Uacute Ucirc Uuml Yacute THORN szlig agrave aacute acirc atilde auml aring aelig ccedil egrave eacute ecirc euml igrave iacute icirc iuml eth ntilde ograve oacute ocirc otilde ouml divide oslash ugrave uacute ucirc uuml yacute thorn yuml");
addRange(0x391, "Alpha Beta Gamma Delta Epsilon Zeta Eta Theta Iota Kappa Lambda Mu Nu Xi Omicron Pi Rho");
addRange(0x3a3, "Sigma Tau Upsilon Phi Chi Psi Omega");
addRange(0x3b1, "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigmaf sigma tau upsilon phi chi psi omega");

const SINGLES = {
  OElig: 0x152, oelig: 0x153, Scaron: 0x160, scaron: 0x161, Yuml: 0x178, fnof: 0x192, circ: 0x2c6, tilde: 0x2dc,
  ensp: 0x2002, emsp: 0x2003, thinsp: 0x2009, zwnj: 0x200c, zwj: 0x200d, lrm: 0x200e, rlm: 0x200f,
  ndash: 0x2013, mdash: 0x2014, lsquo: 0x2018, rsquo: 0x2019, sbquo: 0x201a, ldquo: 0x201c, rdquo: 0x201d, bdquo: 0x201e,
  dagger: 0x2020, Dagger: 0x2021, bull: 0x2022, hellip: 0x2026, permil: 0x2030, prime: 0x2032, Prime: 0x2033,
  lsaquo: 0x2039, rsaquo: 0x203a, oline: 0x203e, euro: 0x20ac, trade: 0x2122,
  larr: 0x2190, uarr: 0x2191, rarr: 0x2192, darr: 0x2193, harr: 0x2194, rArr: 0x21d2, hArr: 0x21d4,
  forall: 0x2200, part: 0x2202, exist: 0x2203, empty: 0x2205, nabla: 0x2207, isin: 0x2208, notin: 0x2209, ni: 0x220b,
  prod: 0x220f, sum: 0x2211, minus: 0x2212, radic: 0x221a, infin: 0x221e, and: 0x2227, or: 0x2228, cap: 0x2229, cup: 0x222a,
  int: 0x222b, there4: 0x2234, sim: 0x223c, asymp: 0x2248, ne: 0x2260, equiv: 0x2261, le: 0x2264, ge: 0x2265,
  sub: 0x2282, sup: 0x2283, loz: 0x25ca, spades: 0x2660, clubs: 0x2663, hearts: 0x2665, diams: 0x2666,
};
Object.entries(SINGLES).forEach(([n, c]) => (NAMED[n] = String.fromCodePoint(c)));

const REVERSE = new Map();
Object.entries(NAMED).forEach(([n, c]) => REVERSE.has(c) || REVERSE.set(c, n));

export const ENTITY_COUNT = Object.keys(NAMED).length;

export function htmlEscape(text, { nonAscii = false } = {}) {
  const base = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  let out = "";
  for (const ch of text) {
    if (base[ch]) out += base[ch];
    else if (nonAscii && ch.codePointAt(0) > 127) out += REVERSE.has(ch) ? `&${REVERSE.get(ch)};` : `&#x${ch.codePointAt(0).toString(16).toUpperCase()};`;
    else out += ch;
  }
  return out;
}

export function htmlUnescape(text) {
  return text.replace(/&(?:([A-Za-z][A-Za-z0-9]*)|#(\d+)|#[xX]([0-9a-fA-F]+));/g, (m, name, dec, hex) => {
    if (name) return NAMED[name] ?? m;
    const code = dec ? parseInt(dec, 10) : parseInt(hex, 16);
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : m;
  });
}

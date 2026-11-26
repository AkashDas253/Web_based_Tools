export function parseTimestamp(input, now = Date.now()) {
  const s = input.trim();
  if (!s) return new Date(now);
  let date;
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    date = new Date(Math.abs(n) >= 1e11 ? n : n * 1000);
  } else {
    date = new Date(s);
  }
  if (Number.isNaN(date.getTime())) throw new Error("Unrecognized date. Use Unix seconds, milliseconds or an ISO 8601 string.");
  return date;
}

export function describeTimestamp(input, timeZone = "UTC", now) {
  const date = parseTimestamp(input, now);
  const zone = timeZone.trim() || "UTC";
  let local;
  try {
    local = new Intl.DateTimeFormat("en-GB", { timeZone: zone, dateStyle: "full", timeStyle: "long" }).format(date);
  } catch {
    throw new Error("Unknown time zone: " + zone);
  }
  return [
    `Unix seconds: ${Math.floor(date.getTime() / 1000)}`,
    `Unix milliseconds: ${date.getTime()}`,
    `ISO 8601 (UTC): ${date.toISOString()}`,
    `${zone}: ${local}`,
  ].join("\n");
}

import { createToolView } from "./tool-view.js";
import { describeTimestamp } from "../tools/timestamp.js";

export const { mount, unmount } = createToolView({
  id: "timestamp",
  title: "Timestamp converter",
  description: "Unix seconds, Unix milliseconds or ISO 8601 input. Empty input uses the current time.",
  inputs: [
    { name: "value", label: "Timestamp or date", default: "1700000000" },
    { name: "zone", label: "Time zone (IANA name)", default: "UTC" },
  ],
  run: ({ value, zone }) => describeTimestamp(value, zone),
  refresh: true,
});

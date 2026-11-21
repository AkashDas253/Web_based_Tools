
export function getTypes() {
  return [
    { id: "text", label: "Plain text" },
    { id: "url", label: "Website URL" },
    { id: "wifi", label: "Wi-Fi" },
    { id: "email", label: "Email" },
    { id: "sms", label: "SMS" },
    { id: "vcard", label: "Contact (vCard)" }
  ];
}

export function build(type, data = {}) {
  const clean = value => String(value ?? "").trim();
  const escapeVCard = value => clean(value).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

  switch (type) {
    case "text":
      return clean(data.text);

    case "url": {
      const url = clean(data.url);
      if (!url) throw new Error("Enter a URL.");
      const normalized = /^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`;
      try { new URL(normalized); } catch { throw new Error("Enter a valid URL."); }
      return normalized;
    }

    case "wifi": {
      const ssid = clean(data.ssid);
      if (!ssid) throw new Error("Enter the Wi-Fi network name.");
      const escape = value => clean(value).replace(/([\\;,":])/g, "\\$1");
      const security = data.security === "nopass" ? "nopass" : data.security === "WEP" ? "WEP" : "WPA";
      return `WIFI:T:${security};S:${escape(ssid)};${security === "nopass" ? "" : `P:${escape(data.password)};`}${data.hidden ? "H:true;" : ""};`;
    }

    case "email": {
      const address = clean(data.email);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error("Enter a valid email address.");
      return `mailto:${address}?subject=${encodeURIComponent(clean(data.subject))}&body=${encodeURIComponent(clean(data.body))}`;
    }

    case "sms": {
      const phone = clean(data.phone);
      if (!phone) throw new Error("Enter a phone number.");
      return `SMSTO:${phone}:${clean(data.message)}`;
    }

    case "vcard": {
      const name = clean(data.name);
      if (!name) throw new Error("Enter a contact name.");
      return [
        "BEGIN:VCARD", "VERSION:3.0",
        `FN:${escapeVCard(name)}`,
        data.phone ? `TEL:${escapeVCard(data.phone)}` : "",
        data.email ? `EMAIL:${escapeVCard(data.email)}` : "",
        data.organization ? `ORG:${escapeVCard(data.organization)}` : "",
        "END:VCARD"
      ].filter(Boolean).join("\r\n");
    }

    default:
      throw new Error("Unsupported payload type.");
  }
}

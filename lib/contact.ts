export type CmsContact = {
  phone?: string; phoneIntl?: string; email?: string; address?: string;
  postalCode?: string; hours?: string; whatsapp?: string; mapUrl?: string;
  latitude?: number; longitude?: number;
};

export function normalizeContact(value: unknown): CmsContact {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const result: Record<string, string | number> = {};
  for (const key of ["phone", "phoneIntl", "email", "address", "postalCode", "hours"]) {
    if (typeof raw[key] === "string") result[key] = raw[key].trim();
  }
  for (const key of ["whatsapp", "mapUrl"]) {
    if (typeof raw[key] !== "string") continue;
    if (!raw[key]) { result[key] = ""; continue; }
    try {
      const url = new URL(raw[key]);
      if (url.protocol === "https:" || url.protocol === "http:") result[key] = url.href;
    } catch { /* Ignore invalid CMS links. */ }
  }
  for (const [key, max] of [["latitude", 90], ["longitude", 180]] as const) {
    const n = raw[key];
    if (typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= max) result[key] = n;
  }
  return result;
}

export function phoneHref(phone: string) {
  return phone.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[^+\d]/g, "");
}

export function mapQuery(contact: CmsContact) {
  return contact.latitude != null && contact.longitude != null
    ? `${contact.latitude},${contact.longitude}` : contact.address || "";
}

export function directionsUrl(contact: CmsContact) {
  return contact.mapUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery(contact))}`;
}

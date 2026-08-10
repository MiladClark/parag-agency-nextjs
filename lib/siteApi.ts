import { CURRENT_TENANT } from "../content/tenant";

// Client → Payload public site API (contact, and later auth/chat). Every call
// carries this site's tenant so the shared CMS scopes it correctly.
const PAYLOAD = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3601";

export async function submitContact(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<void> {
  const res = await fetch(`${PAYLOAD}/api/site/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-tenant": CURRENT_TENANT },
    body: JSON.stringify({ ...input, tenant: CURRENT_TENANT }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.errors?.[0]?.message || data?.message || "ارسال پیام ناموفق بود.");
}

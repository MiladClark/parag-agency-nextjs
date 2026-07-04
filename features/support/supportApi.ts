import { getAuthToken } from "../../lib/api";
import { CURRENT_TENANT } from "../../content/tenant";

// Chat client → Payload CMS public support endpoints (/api/site/support/*),
// scoped to this site's tenant and the authenticated customer.

export const SUPPORT_KINDS = ["live_chat", "feature_request", "bug_report", "site_message"] as const;
export type SupportKind = (typeof SUPPORT_KINDS)[number];
export type SupportUnreadByKind = Record<SupportKind, number>;

export interface SupportThread {
  id: string;
  user_id: string;
  kind: SupportKind;
  channel: "live" | "ticket";
  status: "open" | "waiting_admin" | "waiting_user" | "resolved" | "closed";
  last_message_at: string | null;
  last_message_body: string | null;
  user_unread_count: number;
  admin_unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  thread_id: string;
  sender_user_id: string;
  sender_role: "user" | "admin";
  body: string | null;
  image_url: string | null;
  created_at: string;
}

const PAYLOAD = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3004";

function headers(json = true): Headers {
  const h = new Headers();
  if (json) h.set("Content-Type", "application/json");
  h.set("x-tenant", CURRENT_TENANT);
  const token = getAuthToken();
  if (token) h.set("Authorization", `JWT ${token}`);
  return h;
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${PAYLOAD}/api/site/support${path}`, {
    ...options,
    headers: options.headers ?? headers(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.errors?.[0]?.message || data?.message || "خطا در گفتگو.");
  return data as T;
}

export function fetchSupportStatus() {
  return api<{ online: boolean }>("/status");
}
export function fetchThreads() {
  return api<{ threads: SupportThread[] }>("/threads");
}
export function createThread(kind: SupportKind = "live_chat", forceNew = false) {
  return api<{ thread: SupportThread }>("/thread", {
    method: "POST",
    body: JSON.stringify({ kind, force_new: forceNew }),
  });
}
export function fetchMessages(threadId: string, since?: string) {
  const qs = new URLSearchParams({ thread: threadId });
  if (since) qs.set("since", since);
  return api<{ messages: SupportMessage[] }>(`/messages?${qs.toString()}`);
}
export function sendMessage(threadId: string, input: { body?: string; image_url?: string }) {
  return api<{ message: SupportMessage }>("/messages", {
    method: "POST",
    body: JSON.stringify({ thread: threadId, ...input }),
  });
}
export function markRead(threadId: string) {
  return api("/read", { method: "POST", body: JSON.stringify({ thread: threadId }) });
}

export async function uploadSupportImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const data = await api<{ url: string }>("/media", { method: "POST", body: form, headers: headers(false) });
  return data.url;
}

export const SUPPORT_KIND_LABELS: Record<SupportKind, string> = {
  live_chat: "گفتگوی زنده",
  feature_request: "درخواست ویژگی",
  bug_report: "گزارش باگ",
  site_message: "پیام سیستمی",
};

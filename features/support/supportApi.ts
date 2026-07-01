import { apiFetch, getApiBaseUrl, getAuthToken } from "../../lib/api";

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

export function fetchSupportStatus() {
  return apiFetch<{ online: boolean }>("/support/status");
}
export function fetchThreads() {
  return apiFetch<{ threads: SupportThread[] }>("/support/threads");
}
export function createThread(kind: SupportKind = "live_chat", forceNew = false) {
  return apiFetch<{ thread: SupportThread }>("/support/threads", {
    method: "POST",
    body: JSON.stringify({ kind, force_new: forceNew }),
  });
}
export function fetchMessages(threadId: string, since?: string) {
  const qs = since ? `?since=${encodeURIComponent(since)}` : "";
  return apiFetch<{ messages: SupportMessage[] }>(`/support/threads/${threadId}/messages${qs}`);
}
export function sendMessage(threadId: string, input: { body?: string; image_url?: string }) {
  return apiFetch<{ message: SupportMessage }>(`/support/threads/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function markRead(threadId: string) {
  return apiFetch(`/support/threads/${threadId}/read`, { method: "POST" });
}
export function fetchUnread() {
  return apiFetch<{ count: number }>("/support/unread");
}
export function fetchUnreadByKind() {
  return apiFetch<{ byKind: SupportUnreadByKind }>("/support/unread-by-kind");
}

export async function uploadSupportImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const headers = new Headers();
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${getApiBaseUrl()}/support/media`, { method: "POST", body: form, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "آپلود تصویر ناموفق بود.");
  return data.url as string;
}

export const SUPPORT_KIND_LABELS: Record<SupportKind, string> = {
  live_chat: "گفتگوی زنده",
  feature_request: "درخواست ویژگی",
  bug_report: "گزارش باگ",
  site_message: "پیام سیستمی",
};

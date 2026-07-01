import { apiFetch, getApiBaseUrl, getAuthToken } from "../../lib/api";
import type { SupportKind, SupportMessage, SupportThread, SupportUnreadByKind } from "../support/supportApi";

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  auth_provider: string;
  is_active: boolean;
  role: "user" | "admin" | "super_admin";
  created_at: string;
}
export interface AdminThread extends SupportThread {
  user_email: string | null;
  user_first_name: string | null;
  user_last_name: string | null;
}
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: number;
  created_at: string;
}

export const adminApi = {
  stats: () => apiFetch<{ users: number; openThreads: number; unreadContact: number }>("/admin/stats"),

  listUsers: (q = "") =>
    apiFetch<{ users: AdminUser[]; total: number }>(`/admin/users?search=${encodeURIComponent(q)}&limit=50`),
  updateUser: (id: string, patch: Partial<Pick<AdminUser, "role" | "is_active" | "first_name" | "last_name">>) =>
    apiFetch<{ user: AdminUser }>(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteUser: (id: string) => apiFetch(`/admin/users/${id}`, { method: "DELETE" }),

  listThreads: (kind?: string, status?: string) =>
    apiFetch<{ threads: AdminThread[] }>(
      `/admin/communications/threads?${[
        kind ? `kind=${encodeURIComponent(kind)}` : "",
        status ? `status=${encodeURIComponent(status)}` : "",
      ]
        .filter(Boolean)
        .join("&")}`,
    ),
  threadMessages: (id: string, since?: string) =>
    apiFetch<{ messages: SupportMessage[] }>(
      `/admin/communications/threads/${id}/messages${since ? `?since=${encodeURIComponent(since)}` : ""}`,
    ),
  reply: (id: string, input: { body?: string; image_url?: string }) =>
    apiFetch<{ message: SupportMessage }>(`/admin/communications/threads/${id}/messages`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  setThreadStatus: (id: string, status: string) =>
    apiFetch<{ thread: AdminThread }>(`/admin/communications/threads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteThread: (id: string) => apiFetch(`/admin/communications/threads/${id}`, { method: "DELETE" }),
  markThreadRead: (id: string) => apiFetch(`/admin/communications/threads/${id}/read`, { method: "POST" }),
  broadcast: (body: string, imageUrl?: string) =>
    apiFetch<{ sent: number }>("/admin/communications/send", {
      method: "POST",
      body: JSON.stringify({ broadcast: true, body, image_url: imageUrl }),
    }),
  searchUsers: (q: string) =>
    apiFetch<{ users: { id: string; email: string; first_name: string | null; last_name: string | null }[] }>(
      `/admin/communications/users?q=${encodeURIComponent(q)}`,
    ),
  sendToUser: (userId: string, body: string, kind: SupportKind = "live_chat", imageUrl?: string) =>
    apiFetch<{ thread: AdminThread; message: SupportMessage }>("/admin/communications/send", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, kind, body, image_url: imageUrl }),
    }),
  supportStatus: () => apiFetch<{ online: boolean }>("/admin/communications/status"),
  setSupportStatus: (online: boolean) =>
    apiFetch<{ online: boolean }>("/admin/communications/status", { method: "PATCH", body: JSON.stringify({ online }) }),
  unreadByKind: () => apiFetch<{ byKind: SupportUnreadByKind }>("/admin/communications/unread-by-kind"),
  uploadMedia: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const headers = new Headers();
    const token = getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${getApiBaseUrl()}/admin/communications/media`, { method: "POST", body: form, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "آپلود تصویر ناموفق بود.");
    return data.url as string;
  },

  listContact: () => apiFetch<{ messages: ContactMessage[] }>("/admin/contact"),
};

import { apiFetch, ApiError, getApiBaseUrl, setAuthToken, getAuthToken } from "./api";

export interface AuthUser {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  auth_provider: "email" | "google";
  is_active: boolean;
  role: "user" | "admin" | "super_admin";
  admin_permissions: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface AuthPayload {
  token: string;
  user: AuthUser;
  profile: Profile | null;
}

export async function loginWithApi(email: string, password: string): Promise<AuthPayload> {
  const data = await apiFetch<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.token);
  return data;
}

export async function registerWithApi(
  email: string,
  password: string,
  passwordConfirm: string,
): Promise<AuthPayload> {
  const data = await apiFetch<AuthPayload>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, passwordConfirm }),
  });
  setAuthToken(data.token);
  return data;
}

export async function fetchMeFromApi(): Promise<{ user: AuthUser; profile: Profile | null } | null> {
  if (!getAuthToken()) return null;
  try {
    return await apiFetch<{ user: AuthUser; profile: Profile | null }>("/auth/me");
  } catch (err) {
    if (err instanceof ApiError && err.code === "SESSION_REVOKED") {
      setAuthToken(null);
      throw err;
    }
    setAuthToken(null);
    return null;
  }
}

export async function logoutFromApi(): Promise<void> {
  try {
    if (getAuthToken()) await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    /* ignore */
  } finally {
    setAuthToken(null);
  }
}

export async function changePasswordWithApi(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirm: string,
): Promise<void> {
  await apiFetch("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
  });
}

export async function updateProfileWithApi(payload: {
  first_name?: string | null;
  last_name?: string | null;
}): Promise<{ user: AuthUser; profile: Profile | null }> {
  return apiFetch("/profile", { method: "PATCH", body: JSON.stringify(payload) });
}

export async function uploadAvatarWithApi(file: File): Promise<{ user: AuthUser; profile: Profile | null }> {
  const form = new FormData();
  form.append("file", file);
  const headers = new Headers();
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${getApiBaseUrl()}/profile/avatar`, { method: "POST", body: form, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || "آپلود تصویر ناموفق بود.");
  return data;
}

export async function deleteAvatarWithApi(): Promise<{ user: AuthUser; profile: Profile | null }> {
  return apiFetch("/profile/avatar", { method: "DELETE" });
}

export function applyOAuthToken(token: string): void {
  setAuthToken(token);
}

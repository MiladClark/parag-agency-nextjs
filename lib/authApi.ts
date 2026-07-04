import { ApiError, setAuthToken, getAuthToken } from "./api";
import { CURRENT_TENANT } from "../content/tenant";

// Auth client → Payload CMS public site endpoints (/api/site/*), scoped to this
// site's tenant. Token is a Payload `customers` JWT stored in localStorage and
// sent as `Authorization: JWT <token>`.

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

const PAYLOAD = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3004";

function authHeaders(json = true): Headers {
  const headers = new Headers();
  if (json) headers.set("Content-Type", "application/json");
  headers.set("x-tenant", CURRENT_TENANT);
  const token = getAuthToken();
  if (token) headers.set("Authorization", `JWT ${token}`);
  return headers;
}

async function siteFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${PAYLOAD}/api/site${path}`, {
    ...options,
    headers: options.headers ?? authHeaders(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.errors?.[0]?.message || body?.message || res.statusText;
    throw new ApiError(message);
  }
  return body as T;
}

export async function loginWithApi(email: string, password: string): Promise<AuthPayload> {
  const data = await siteFetch<AuthPayload>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password, tenant: CURRENT_TENANT }),
  });
  setAuthToken(data.token);
  return data;
}

export async function registerWithApi(
  email: string,
  password: string,
  passwordConfirm: string,
): Promise<AuthPayload> {
  if (password !== passwordConfirm) throw new ApiError("رمز عبور و تکرار آن مطابقت ندارند.");
  const data = await siteFetch<AuthPayload>("/register", {
    method: "POST",
    body: JSON.stringify({ email, password, tenant: CURRENT_TENANT }),
  });
  setAuthToken(data.token);
  return data;
}

export async function fetchMeFromApi(): Promise<{ user: AuthUser; profile: Profile | null } | null> {
  if (!getAuthToken()) return null;
  try {
    return await siteFetch<{ user: AuthUser; profile: Profile | null }>("/me");
  } catch {
    setAuthToken(null);
    return null;
  }
}

export async function logoutFromApi(): Promise<void> {
  try {
    if (getAuthToken()) await siteFetch("/logout", { method: "POST" });
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
  await siteFetch("/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
  });
}

export async function updateProfileWithApi(payload: {
  first_name?: string | null;
  last_name?: string | null;
}): Promise<{ user: AuthUser; profile: Profile | null }> {
  return siteFetch("/profile", { method: "PATCH", body: JSON.stringify(payload) });
}

export async function uploadAvatarWithApi(file: File): Promise<{ user: AuthUser; profile: Profile | null }> {
  const form = new FormData();
  form.append("file", file);
  return siteFetch("/avatar", { method: "POST", body: form, headers: authHeaders(false) });
}

export async function deleteAvatarWithApi(): Promise<{ user: AuthUser; profile: Profile | null }> {
  return siteFetch("/avatar", { method: "DELETE" });
}

export function applyOAuthToken(token: string): void {
  setAuthToken(token);
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  type AuthUser,
  type Profile,
  fetchMeFromApi,
  loginWithApi,
  logoutFromApi,
  registerWithApi,
} from "../../lib/authApi";
import { ApiError } from "../../lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: AuthUser; profile: Profile | null }>;
  signUp: (email: string, password: string, passwordConfirm: string) => Promise<{ user: AuthUser; profile: Profile | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const data = await fetchMeFromApi();
    setUser(data?.user ?? null);
    setProfile(data?.profile ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;
    void fetchMeFromApi()
      .then((data) => {
        if (!mounted) return;
        setUser(data?.user ?? null);
        setProfile(data?.profile ?? null);
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          /* session revoked — already cleared */
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await loginWithApi(email, password);
    setUser(data.user);
    setProfile(data.profile);
    return data;
  }, []);

  const signUp = useCallback(async (email: string, password: string, passwordConfirm: string) => {
    const data = await registerWithApi(email, password, passwordConfirm);
    setUser(data.user);
    setProfile(data.profile);
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await logoutFromApi();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAdmin: profile?.role === "admin" || profile?.role === "super_admin",
      isSuperAdmin: profile?.role === "super_admin",
      isAuthenticated: Boolean(user),
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
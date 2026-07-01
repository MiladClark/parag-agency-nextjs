"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { applyOAuthToken, fetchMeFromApi } from "@/lib/authApi";
import { useAuth } from "@/features/auth/AuthContext";
import { Loader } from "@/components/Loader";

export default function Page() {
  const { refreshProfile } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const err = params.get("error");
    if (err) {
      setError(decodeURIComponent(err));
      return;
    }
    if (!token) {
      setError("توکن ورود دریافت نشد.");
      return;
    }
    applyOAuthToken(token);
    void refreshProfile()
      .then(() => fetchMeFromApi())
      .then((data) => {
        const isAdmin = data?.profile?.role === "admin" || data?.profile?.role === "super_admin";
        router.push(isAdmin ? "/admin" : "/account");
      })
      .catch(() => setError("ورود با گوگل ناموفق بود."));
  }, [refreshProfile, router]);

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        <a href="/login" className="text-accent hover:underline">
          بازگشت به ورود
        </a>
      </div>
    );
  }
  return <Loader label="در حال ورود…" />;
}

"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// Captcha widget for the public forms, driven by whatever the tenant has
// configured in the CMS (تنظیمات وب‌سایت → کپچا). Only the site key ever reaches
// the browser; the CMS holds the secret and does the verifying, so a token from
// here is worthless anywhere else.

export type CaptchaProvider =
  | "none"
  | "recaptcha-v2"
  | "recaptcha-v3"
  | "hcaptcha"
  | "turnstile";

export type CaptchaHandle = {
  getToken: () => Promise<string | undefined>;
  reset: () => void;
};

type WidgetId = number | string;

type CaptchaSdk = {
  execute?: (siteKey: string, opts: { action: string }) => Promise<string>;
  getResponse: (id?: WidgetId) => string;
  ready?: (cb: () => void) => void;
  render: (el: HTMLElement, opts: Record<string, unknown>) => WidgetId;
  reset: (id?: WidgetId) => void;
};

const SDK_GLOBAL: Record<Exclude<CaptchaProvider, "none">, string> = {
  "recaptcha-v2": "grecaptcha",
  "recaptcha-v3": "grecaptcha",
  hcaptcha: "hcaptcha",
  turnstile: "turnstile",
};

const scriptUrl = (provider: Exclude<CaptchaProvider, "none">, siteKey: string): string => {
  switch (provider) {
    case "recaptcha-v2":
      return "https://www.google.com/recaptcha/api.js?render=explicit";
    // v3 is invisible and keys its SDK at load time.
    case "recaptcha-v3":
      return `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    case "hcaptcha":
      return "https://js.hcaptcha.com/1/api.js?render=explicit";
    case "turnstile":
      return "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  }
};

const sdkFor = (provider: Exclude<CaptchaProvider, "none">): CaptchaSdk | undefined =>
  (window as unknown as Record<string, CaptchaSdk | undefined>)[SDK_GLOBAL[provider]];

const loadSdk = (
  provider: Exclude<CaptchaProvider, "none">,
  siteKey: string,
): Promise<CaptchaSdk> => {
  const url = scriptUrl(provider, siteKey);

  return new Promise((resolve, reject) => {
    const settle = () => {
      const sdk = sdkFor(provider);
      if (!sdk) return reject(new Error("captcha SDK missing"));
      if (typeof sdk.ready === "function") sdk.ready(() => resolve(sdk));
      else resolve(sdk);
    };

    if (sdkFor(provider)) return settle();

    // Reuse an existing tag so two forms on one page cannot load it twice.
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${url}"]`);
    if (existing) {
      existing.addEventListener("load", settle, { once: true });
      existing.addEventListener("error", () => reject(new Error("captcha script failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", settle, { once: true });
    script.addEventListener("error", () => reject(new Error("captcha script failed")), {
      once: true,
    });
    document.head.appendChild(script);
  });
};

export const CaptchaBox = forwardRef<
  CaptchaHandle,
  { provider: CaptchaProvider; siteKey: string | null }
>(function CaptchaBox({ provider, siteKey }, ref) {
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<WidgetId | null>(null);

  const active = provider !== "none" && Boolean(siteKey);

  useEffect(() => {
    // `active` already narrows provider away from "none"; siteKey needs its own
    // check to narrow to string.
    if (!active || !siteKey) return;
    // v3 has no widget; its token is minted at submit time.
    if (provider === "recaptcha-v3") {
      void loadSdk(provider, siteKey).catch(() => undefined);
      return;
    }

    let cancelled = false;
    void loadSdk(provider, siteKey)
      .then((sdk) => {
        if (cancelled || !boxRef.current || widgetRef.current !== null) return;
        widgetRef.current = sdk.render(boxRef.current, { sitekey: siteKey });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [active, provider, siteKey]);

  useImperativeHandle(
    ref,
    () => ({
      async getToken() {
        if (!active || !siteKey) return undefined;
        const sdk = sdkFor(provider);
        if (!sdk) return undefined;
        if (provider === "recaptcha-v3") {
          return sdk.execute?.(siteKey, { action: "comment" });
        }
        return widgetRef.current === null ? undefined : sdk.getResponse(widgetRef.current);
      },
      reset() {
        if (!active || provider === "recaptcha-v3") return;
        if (widgetRef.current !== null) sdkFor(provider)?.reset(widgetRef.current);
      },
    }),
    [active, provider, siteKey],
  );

  if (!active || provider === "recaptcha-v3") return null;

  return <div ref={boxRef} className="[direction:ltr]" />;
});

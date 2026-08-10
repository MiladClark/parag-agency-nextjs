import type { NextConfig } from "next";

// ─────────────────────────────────────────────────────────────────────────────
// Response headers.
//
// A full Content-Security-Policy is deliberately not set: the panel can inject
// arbitrary <script> into every page (وب‌سایت‌ها → «اسکریپت‌های سفارشی»), and a
// policy that has to allow that is a policy that allows everything. What is set
// is the part that costs nothing and cannot be undone by a pasted snippet.
//
// `frame-ancestors` allows the CMS origin so the panel can keep previewing this
// site in an iframe; every other site is refused.
// ─────────────────────────────────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === "production";

const cmsOrigin = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3601";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: `frame-ancestors 'self' ${cmsOrigin}` },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // Production only: on http://localhost this would pin the browser to https
  // for the whole origin and make local work impossible.
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

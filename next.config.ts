import type { NextConfig } from "next";

// Content-Security-Policy is deliberately not here — it needs a per-request
// nonce on the request headers, which only the proxy can set. See src/proxy.ts.
const securityHeaders: { key: string; value: string }[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // The legal pages read these with fs at request time, which the tracer can't follow.
  outputFileTracingIncludes: {
    "/legal/*": ["./content/legal/**"],
  },
  // This repo maintains its own AGENTS.md; next dev otherwise writes over it.
  agentRules: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "radix-ui", "cmdk"],
  },
  // Leaving `experimental.serverActions.allowedOrigins` unset keeps Next's
  // built-in Server Action CSRF check strictly same-origin.
  compress: true,
  poweredByHeader: false,
  headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(favicon.ico|manifest.webmanifest|icons/:path*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;

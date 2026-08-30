import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin (via jwks-rsa -> jose) ships an ESM-only module that
  // breaks when Next's server bundler tries to require() it. Keeping these
  // as plain node_modules requires (not bundled) avoids the ERR_REQUIRE_ESM
  // crash in production (Netlify Functions / any Node serverless runtime).
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
};

export default nextConfig;

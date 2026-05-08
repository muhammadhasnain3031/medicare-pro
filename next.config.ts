import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ye line TypeScript errors ko build ke waqt ignore kar degi
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ye line ESLint errors ko build ke waqt ignore kar degi
    ignoreDuringBuilds: true,
  },
  /* Aap baqi options yahan add kar sakte hain */
};

export default nextConfig;
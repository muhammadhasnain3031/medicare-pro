const nextConfig = {
  typescript: {
    // Ye line TypeScript errors ko build ke waqt ignore kar degi
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ye line ESLint errors ko ignore kar degi
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
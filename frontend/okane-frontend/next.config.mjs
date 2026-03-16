/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Use this option with caution.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

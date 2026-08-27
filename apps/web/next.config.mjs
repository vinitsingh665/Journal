/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/database", "@repo/trading-engine"],
  serverExternalPackages: ["@prisma/client", "@repo/database"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

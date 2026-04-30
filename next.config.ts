import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "pdf-parse"],
  devIndicators: false,
};

export default nextConfig;

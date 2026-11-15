import type { NextConfig } from "next";

const base = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(base ? { basePath: base, assetPrefix: base } : {}),
};

export default nextConfig;

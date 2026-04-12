import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-5e52d815a0ea48b5aa905910e63faf7b.r2.dev",
        pathname: "/thumbnails/**",
      },
      {
        protocol: "https",
        hostname: "storage.thanghub.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "192.168.50.22",
        port: "9000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;


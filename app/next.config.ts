import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "portfolio.ftcare-i.com",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/*.png",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;

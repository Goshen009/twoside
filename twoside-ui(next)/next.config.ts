import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['100.103.127.67', '100.99.208.67'],
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;   
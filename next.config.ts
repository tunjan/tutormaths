import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // proxy.ts (the network boundary) runs on the Node.js runtime by default in
  // Next.js 16, which is required for the Supabase server client.
};

export default nextConfig;

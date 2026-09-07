import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Source of truth for agent rules lives outside the repo (Desktop docs).
  agentRules: false,
};

export default nextConfig;

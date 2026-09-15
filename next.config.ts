import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: {
    globalNotFound: true,
  },
  trailingSlash: true,
  poweredByHeader: false,
};

export default withPayload(nextConfig);

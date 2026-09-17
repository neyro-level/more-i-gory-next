import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { createS3MediaRemotePatterns } from "./src/project/media/next-image.ts";

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: createS3MediaRemotePatterns({
      S3_BUCKET: process.env.S3_BUCKET,
      S3_ENDPOINT: process.env.S3_ENDPOINT,
    }),
  },
  output: "standalone",
  trailingSlash: true,
  poweredByHeader: false,
};

export default withPayload(nextConfig);

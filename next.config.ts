import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  output: "export",
  trailingSlash: true,
  env: {
    nextImageExportOptimizer_exportFolderName: "nextImageExportOptimizer",
    nextImageExportOptimizer_exportFolderPath: "out",
    nextImageExportOptimizer_generateAndUseBlurImages: "true",
    nextImageExportOptimizer_imageFolderPath: "public/images",
    nextImageExportOptimizer_quality: "75",
    nextImageExportOptimizer_remoteImageCacheTTL: "0",
    nextImageExportOptimizer_remoteImagesFilename: "remoteOptimizedImages.cjs",
    nextImageExportOptimizer_storePicturesInWEBP: "true",
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: "custom",
  },
  poweredByHeader: false,
  transpilePackages: ["next-image-export-optimizer"],
};

export default nextConfig;

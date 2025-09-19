import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Transpile CSS modules for GrapesJS
  transpilePackages: ['grapesjs', 'grapesjs-blocks-basic'],
  
  // Image domains for user avatars
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  
  // External packages for server components
  serverExternalPackages: ['prisma', '@prisma/client'],
};

export default nextConfig;
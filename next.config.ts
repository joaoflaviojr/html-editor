import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Environment variables
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  
  // Webpack configuration for GrapesJS
  webpack: (config, { dev, isServer }) => {
    // Handle GrapesJS and Monaco Editor
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util'),
      };
    }
    
    return config;
  },
  
  // Image domains for user avatars
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
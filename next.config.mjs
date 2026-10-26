import './scripts/generate-assets.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  experimental: {
    optimizePackageImports: ['@react-three/drei', '@react-three/postprocessing']
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;




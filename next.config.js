/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Abaikan error TypeScript saat build di Vercel
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true 
  },
  // Transpile paket undici agar sintaks modern JavaScript dipahami Webpack
  transpilePackages: ['@vercel/blob', 'undici'],
  
  experimental: {
    serverActions: true,
    // Untuk Next.js 13/14 awal, properti ini WAJIB berada di dalam objek experimental
    serverComponentsExternalPackages: ['@vercel/blob', 'undici'],
  },
};

module.exports = nextConfig;
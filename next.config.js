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
  experimental: {
    // Di Next.js 14+, limit body size server actions ditulis seperti ini jika menggunakan Server Actions:
    serverActions: true,
  },
  // 🛑 Tambahkan package ini agar Webpack tidak crash saat me-build @vercel/blob & undici
  serverExternalPackages: ['@vercel/blob', 'undici'],
};

module.exports = nextConfig;
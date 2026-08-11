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
  // Opsi ukuran limit upload (jika dibutuhkan)
  serverExternalPackages: [],
};

module.exports = nextConfig;
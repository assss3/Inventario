/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  typescript: {
    ignoreBuildErrors: false
  }
}

module.exports = nextConfig
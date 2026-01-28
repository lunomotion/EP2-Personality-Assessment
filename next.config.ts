import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    resolveAlias: {
      '@/generated/prisma': './src/generated/prisma',
    },
  },
}

export default nextConfig

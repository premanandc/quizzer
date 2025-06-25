import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['src/app', 'src/components', 'src/lib'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig

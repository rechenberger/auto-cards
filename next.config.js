/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.output.publicPath = ''
    }
    return config
  },
}

module.exports = nextConfig

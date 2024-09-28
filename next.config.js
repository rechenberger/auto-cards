/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*', // Match all routes
        has: [
          {
            type: 'host',
            value: 'battlegrounds.sackofsecrets.com', // The domain you want to redirect from
          },
        ],
        destination: 'https://auto-cards.com/:path*', // The domain you want to redirect to
        permanent: true, // Use 308 for permanent redirect
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.output.publicPath = ''
    }
    return config
  },
}

module.exports = nextConfig

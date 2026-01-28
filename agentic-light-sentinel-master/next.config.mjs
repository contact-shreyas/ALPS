/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  experimental: {
    swcPlugins: [
      ['next-swc-plugin', {
        jsc: {
          transform: {
            react: {
              throwIfNamespace: false
            }
          }
        }
      }]
    ]
  }
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  async rewrites() {
    return [
      { source: '/privatehouse', destination: '/privatehouse/index.html' },
      { source: '/privatehouse/', destination: '/privatehouse/index.html' },
      { source: '/privatehouse/partners', destination: '/privatehouse/partners.html' },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  distDir: 'dist',
  images: {
    loader: 'imgix',
    path: '/',
  },
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      '/': { page: '/' },
      '/handouts': { page: '/handouts' },
      '/handouts/edit': { page: '/handouts/edit' },
    };
  },
  trailingSlash: true,
};

module.exports = nextConfig;

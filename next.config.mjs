/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/kanji-quest',
  images: {
    unoptimized: true,
  }
};

export default nextConfig;

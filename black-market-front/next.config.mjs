/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io', // Permitimos imágenes de Scryfall
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io', // Para las cartas de Scryfall
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com', // Para las imágenes de productos sellados (Amazon)
      },
      {
        protocol: 'https',
        hostname: 'assets.echomtg.com', // Por si acaso usas imágenes de este dominio en el futuro
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com', // Por si acaso usas imágenes de este dominio en el futuro
      },
    ],
  },
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // L'optimiseur d'images de Vercel refuse toute image source inédite une
    // fois le quota du plan atteint (402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED),
    // ce qui rendait invisibles tous les produits récemment ajoutés. Le
    // redimensionnement est donc délégué à Supabase Storage : voir
    // lib/image-loader.ts.
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
}

module.exports = nextConfig

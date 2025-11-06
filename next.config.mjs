/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'rule34video.com',
      },
      {
        protocol: 'https',
        hostname: 'cdne-pics.youjizz.com',   // ✅ Add this
      },
    ],
  },
};

export default nextConfig;

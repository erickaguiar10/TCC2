// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_TICKETNFT_ADDRESS: process.env.NEXT_PUBLIC_TICKETNFT_ADDRESS,
  },
};

module.exports = nextConfig;

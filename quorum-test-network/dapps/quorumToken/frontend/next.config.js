// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_TICKET_NFT_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_TICKET_NFT_CONTRACT_ADDRESS,
  },
};

module.exports = nextConfig;

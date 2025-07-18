/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // this is the key
  experimental: {
    serverActions: true, // if you're using it
  }
}

module.exports = nextConfig;

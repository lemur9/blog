/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  pageExtensions: ["ts", "tsx", "mdx"],
  turbopack: {
    root: process.cwd(),
  },
  // Allow 127.0.0.1 and localhost to share cookies (cross-origin)
  experimental: {
    // Allow dev server to be accessed from 127.0.0.1
    allowedDevOrigins: ["127.0.0.1", "localhost"],
  },
};
export default nextConfig;

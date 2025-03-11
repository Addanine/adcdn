/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Increase the payload size limit for file uploads
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
    responseLimit: '100mb',
  },
  // Image optimization config
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable strict mode
  reactStrictMode: true,
  // Add custom MIME type support
  experimental: {
    serverComponentsExternalPackages: [
      'bcryptjs', 
      'jsonwebtoken', 
      'pg', 
      'fs-extra'
    ],
  },
};

export default config;

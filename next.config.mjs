

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["logo.clearbit.com", "financialmodelingprep.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["yahoo-finance2"],
  },
};

export default nextConfig;

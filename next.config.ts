import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "discoverholidaysbd.com",
      "ozvxzsjtzdrrwejjiomf.supabase.co",
      "i.pravatar.cc",
      "example.com",
      "res.cloudinary.com",
      "img.examplecdn.com",
      "lh3.googleusercontent.com",
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

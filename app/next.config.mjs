/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize image handling
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },

  // Speed up dev server by skipping lint/typecheck on each nav
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Reduce unnecessary logging
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // Experimental optimizations for faster page transitions
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-select",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-avatar",
      "@radix-ui/react-label",
      "@radix-ui/react-progress",
      "@radix-ui/react-separator",
      "@radix-ui/react-switch",
      "date-fns",
      "recharts",
    ],
  },
};

export default nextConfig;

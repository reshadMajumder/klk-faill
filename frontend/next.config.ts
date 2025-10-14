
import type {NextConfig} from 'next';

// Function to safely extract hostname from a URL
const getHostnameFromUrl = (url: string | undefined) => {
  if (!url) return null;
  try {
    const urlObject = new URL(url);
    return urlObject.hostname;
  } catch (error) {
    return null;
  }
};

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
       // Allow images from the backend server
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      }
];

const backendHostname = getHostnameFromUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

if (backendHostname) {
  remotePatterns.push({
    protocol: 'https',
    hostname: backendHostname,
    port: '',
    pathname: '/**',
  });
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns,
  },
};

export default nextConfig;

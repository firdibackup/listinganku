import type { NextConfig } from 'next';
import { MAX_UPLOAD_BYTES } from './lib/media/downscale';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Next's default Server Action body limit is 1MB — well under the 10MB
      // MAX_UPLOAD_BYTES promises in lib/media/downscale.ts and enforces
      // server-side. Without this, any upload over 1MB 413s before
      // uploadMediaAction ever runs, regardless of what validateUpload allows.
      // Derived from the same constant so the two limits cannot drift apart.
      bodySizeLimit: MAX_UPLOAD_BYTES,
    },
  },
};

export default nextConfig;

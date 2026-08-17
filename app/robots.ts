import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/landing/seo';

// Tanpa data dinamis (hanya aturan tetap + siteUrl(), yang sudah konstan saat
// build lewat inlining NEXT_PUBLIC_*) — dibiarkan statis, beda dengan sitemap.ts.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/projects', '/login', '/api'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

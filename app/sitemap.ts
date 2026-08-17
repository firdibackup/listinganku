import type { MetadataRoute } from 'next';
import { db } from '@/lib/data';
import { siteUrl } from '@/lib/landing/seo';

/**
 * Tanpa ini, Next.js membekukan sitemap.xml sebagai halaman statis saat build
 * — tidak ada API dinamis (cookies/headers) yang terlihat di sini, dan daftar
 * project published dibaca lewat panggilan fungsi biasa ke db, bukan fetch()
 * yang bisa dilacak Next untuk revalidasi. Tanpa force-dynamic, publish atau
 * unpublish project setelah build tidak akan pernah muncul di sitemap sampai
 * redeploy — persis kebalikan dari "sitemap hanya memuat project published"
 * yang jadi tujuan file ini.
 */
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await db.projects.listPublished();
  return projects.map((p) => ({
    url: `${siteUrl()}/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}

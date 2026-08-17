import type { Metadata } from 'next';
import type { HouseType, Project } from '@/lib/data/types';

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export function buildMetadata(project: Project, houseTypes: HouseType[], heroUrl: string | null): Metadata {
  const url = `${siteUrl()}/${project.slug}`;
  const cheapest = houseTypes.length ? Math.min(...houseTypes.map((h) => h.price)) : null;

  const title = project.seo.title || [project.name, project.location].filter(Boolean).join(' — ');
  const description =
    project.seo.description ||
    project.aiContent?.seo.description ||
    [
      project.description,
      houseTypes.length ? `${houseTypes.length} tipe unit tersedia.` : '',
      cheapest ? `Mulai Rp${cheapest.toLocaleString('id-ID')}.` : '',
    ]
      .filter(Boolean)
      .join(' ')
      .slice(0, 300);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Listingku',
      locale: 'id_ID',
      images: heroUrl ? [{ url: heroUrl.startsWith('http') ? heroUrl : `${siteUrl()}${heroUrl}` }] : undefined,
    },
  };
}

export function buildJsonLd(
  project: Project,
  houseTypes: HouseType[],
  faq: { q: string; a: string }[],
): Record<string, unknown>[] {
  const url = `${siteUrl()}/${project.slug}`;

  const listing: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: project.name,
    description: project.description,
    url,
    address: { '@type': 'PostalAddress', addressLocality: project.location, addressCountry: 'ID' },
    offers: houseTypes.map((h) => ({
      '@type': 'Offer',
      name: h.name,
      price: h.price,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      url: `${url}#${h.slug}`,
    })),
  };

  if (faq.length === 0) return [listing];

  return [
    listing,
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ];
}

/**
 * Serialisasi aman untuk dipasang lewat dangerouslySetInnerHTML di dalam
 * <script type="application/ld+json">. JSON.stringify polos TIDAK meng-escape
 * '<', jadi nilai apa pun yang mengalir ke JSON-LD (nama project, deskripsi,
 * nama tipe rumah — semuanya diketik bebas oleh pengguna di wizard) bisa
 * memuat "</script>" dan memutus tag script itu sendiri di level parser HTML,
 * membuka celah suntik markup/skrip baru persis sesudahnya. Parser HTML
 * mengenali "</script" murni dari teks mentahnya, tanpa peduli isi atau
 * atribut type dari tag pembukanya — ini bukan celah teoretis.
 *
 * < diparse balik jadi '<' oleh JSON.parse maupun consumer JSON-LD mana
 * pun (termasuk Rich Results Test Google) karena itu escape unicode yang sah
 * di dalam string JSON, tapi parser HTML tidak pernah membacanya sebagai
 * pembuka/penutup tag karena bukan karakter '<' literal.
 */
export function jsonLdScript(data: Record<string, unknown>[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

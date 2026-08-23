import { describe, it, expect } from 'vitest';
import { buildMetadata, buildJsonLd, jsonLdScript, siteUrl } from '@/lib/landing/seo';
import { seedStore } from '@/fixtures/seed';

const store = seedStore();
const project = store.projects[0];
const houseTypes = store.houseTypes.filter((h) => h.projectId === 'prj_parkspring');

describe('buildMetadata', () => {
  it('jatuh ke nama dan lokasi project saat SEO belum diisi', () => {
    const meta = buildMetadata(project, houseTypes, null);
    expect(meta.title).toBe('Parkspring — Kelapa Gading, Jakarta Utara');
    expect(meta.alternates?.canonical).toBe(`${siteUrl()}/parkspring-gading`);
    expect(meta.openGraph?.title).toBe(meta.title);
  });

  it('mengutamakan SEO yang sudah diisi', () => {
    const meta = buildMetadata(
      { ...project, seo: { title: 'Judul SEO', description: 'Deskripsi SEO' } },
      houseTypes,
      null,
    );
    expect(meta.title).toBe('Judul SEO');
    expect(meta.description).toBe('Deskripsi SEO');
  });
});

describe('buildJsonLd', () => {
  it('menghasilkan RealEstateListing dengan penawaran per tipe rumah', () => {
    const [listing] = buildJsonLd(project, houseTypes, []);
    expect(listing['@type']).toBe('RealEstateListing');
    expect((listing as { offers: unknown[] }).offers).toHaveLength(3);
  });

  it('menambahkan FAQPage hanya bila ada pertanyaan', () => {
    expect(buildJsonLd(project, houseTypes, [])).toHaveLength(1);
    const withFaq = buildJsonLd(project, houseTypes, [{ q: 'Bisa KPR?', a: 'Bisa.' }]);
    expect(withFaq).toHaveLength(2);
    expect(withFaq[1]['@type']).toBe('FAQPage');
  });
});

// JSON-LD dipasang ke halaman lewat dangerouslySetInnerHTML di dalam
// <script type="application/ld+json">. JSON.stringify polos TIDAK meng-escape
// '<', jadi nama project (diketik bebas oleh pengguna di wizard) yang memuat
// "</script>" bisa memutus tag script itu sendiri dan menyuntik markup baru —
// ini satu-satunya permukaan suntik nyata di halaman landing publik.
describe('jsonLdScript — pertahanan dari nama project bermusuhan', () => {
  it('meng-escape "<" supaya "</script>" pada nama project tidak memutus tag JSON-LD', () => {
    const hostileProject = {
      ...project,
      name: 'Rumah Uji </script><script>alert(1)</script> "Mewah"',
    };
    const [listing] = buildJsonLd(hostileProject, houseTypes, []);
    const html = jsonLdScript([listing]);

    // Bukti negatif: tidak satu pun karakter '<' mentah boleh lolos — itulah
    // satu-satunya karakter yang bisa memutus tag <script> di level parser HTML.
    expect(html).not.toContain('<');

    // Escape tidak boleh merusak data: unescape manual lalu JSON.parse harus
    // mengembalikan nama project persis seperti semula.
    const roundTripped = JSON.parse(html.replace(/\\u003c/g, '<')) as { name: string }[];
    expect(roundTripped[0].name).toBe(hostileProject.name);
  });

  it('tetap menghasilkan JSON valid untuk data tanpa karakter berbahaya', () => {
    const [listing] = buildJsonLd(project, houseTypes, []);
    const html = jsonLdScript([listing]);
    expect(JSON.parse(html)).toEqual([listing]);
  });
});

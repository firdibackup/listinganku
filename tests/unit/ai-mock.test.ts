import { describe, it, expect } from 'vitest';
import { AiContentSchema } from '@/lib/ai/schema';
import { mockGenerator } from '@/lib/ai/mock';
import { AiGenerationError } from '@/lib/ai/generator';
import { seedStore } from '@/fixtures/seed';

const store = seedStore();
const project = store.projects[0];
const houseTypes = store.houseTypes.filter((h) => h.projectId === 'prj_parkspring');

describe('mockGenerator', () => {
  it('menghasilkan konten yang lolos skema Gemini', async () => {
    const content = await mockGenerator.generate({ project, houseTypes, brief: project.brief, delayMs: 0 });
    expect(AiContentSchema.safeParse(content).success).toBe(true);
  });

  it('membuat satu entri per tipe rumah, dengan nama yang cocok', async () => {
    const content = await mockGenerator.generate({ project, houseTypes, brief: project.brief, delayMs: 0 });
    expect(content.houseTypes.map((h) => h.name)).toEqual(['Villa', 'Medea', 'Grand']);
  });

  it('menyusun teks dari data proyek sungguhan, bukan lorem ipsum', async () => {
    const content = await mockGenerator.generate({ project, houseTypes, brief: project.brief, delayMs: 0 });
    expect(content.headline).toContain('Parkspring');
    expect(content.description).toContain('Kelapa Gading');
    expect(content.description.split(/\s+/).length).toBeGreaterThanOrEqual(120);
    expect(content.description.toLowerCase()).not.toContain('lorem');
  });

  it('menghasilkan teks berbeda untuk proyek berbeda', async () => {
    const other = store.projects[2];
    const otherTypes = store.houseTypes.filter((h) => h.projectId === other.id);
    const a = await mockGenerator.generate({ project, houseTypes, brief: project.brief, delayMs: 0 });
    const b = await mockGenerator.generate({ project: other, houseTypes: otherTypes, brief: other.brief, delayMs: 0 });
    expect(a.description).not.toBe(b.description);
  });

  it('mematuhi aturan copy: tanpa tanda seru dan tanpa sapaan informal', async () => {
    const content = await mockGenerator.generate({ project, houseTypes, brief: project.brief, delayMs: 0 });
    const all = JSON.stringify(content);
    expect(all).not.toContain('!');
    expect(all).not.toMatch(/\bkamu\b/i);
  });

  it('gagal dengan AiGenerationError saat mode gagal diaktifkan', async () => {
    await expect(mockGenerator.generate({ project, houseTypes, brief: project.brief, delayMs: 0, forceFail: true }))
      .rejects.toBeInstanceOf(AiGenerationError);
  });
});

describe('mockGenerator membaca brief', () => {
  const base = () => {
    const store = seedStore();
    return {
      project: store.projects[0],
      houseTypes: store.houseTypes.filter((h) => h.projectId === 'prj_parkspring'),
      brief: store.projects[0].brief,
      delayMs: 0,
    };
  };

  it('menyebut kawasan dari brief.location di headline', async () => {
    const out = await mockGenerator.generate(base());
    expect(out.headline).toContain('Kelapa Gading');
  });

  it('menurunkan sellingPoints dari brief.highlights, bukan dari facilities saja', async () => {
    const out = await mockGenerator.generate(base());
    expect(out.sellingPoints).toContain('Lokasi strategis di koridor Boulevard Kelapa Gading');
  });

  it('menyebut nearby yang PUNYA menit beserta angkanya', async () => {
    const out = await mockGenerator.generate(base());
    expect(out.description).toContain('3 menit ke Gerbang Tol Kelapa Gading');
  });

  it('menyebut nearby TANPA menit tanpa angka apa pun', async () => {
    const input = base();
    input.brief = {
      ...input.brief,
      nearby: [{ category: 'sekolah' as const, name: 'Sekolah Harapan', minutes: null }],
    };
    const out = await mockGenerator.generate(input);
    expect(out.description).toContain('dekat Sekolah Harapan');
    expect(out.description).not.toMatch(/\d+\s*menit ke Sekolah Harapan/);
  });

  it('mengarahkan pesan WhatsApp ke tujuan CTA yang dipilih agen', async () => {
    const input = base();
    input.brief = { ...input.brief, ctaGoals: ['lihatPromo'] };
    const out = await mockGenerator.generate(input);
    expect(out.cta.whatsappMessage).toContain('promo');
  });

  it('selalu mengembalikan subheadline yang lolos AiContentSchema', async () => {
    const out = await mockGenerator.generate(base());
    expect(AiContentSchema.safeParse(out).success).toBe(true);
    expect(out.subheadline.length).toBeGreaterThan(0);
  });
});

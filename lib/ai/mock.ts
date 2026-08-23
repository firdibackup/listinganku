import { formatArea, formatRupiahShort } from '@/lib/format';
import type { ContentGenerator, GenerateInput } from './generator';
import { AiGenerationError } from './generator';
import type { AiContent } from './schema';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Nearby menjadi kalimat. Yang punya menit menyebut angkanya; yang tidak punya
 * disebut TANPA angka — cermin dari aturan grounding, dan yang membuat asersi
 * "AI tidak mengarang jarak" bisa diuji di atas mock.
 */
function nearbyPhrase(brief: GenerateInput['brief']): string {
  if (!brief.nearby.length) return '';
  const parts = brief.nearby.map((n) =>
    n.minutes === null ? `dekat ${n.name}` : `${n.minutes} menit ke ${n.name}`,
  );
  return ` Akses harian singkat: ${parts.join(', ')}.`;
}

const CTA_MESSAGE: Record<string, string> = {
  whatsapp: 'saya ingin bertanya tentang',
  lihatTipe: 'saya ingin melihat pilihan tipe unit di',
  lihatPromo: 'saya ingin informasi promo yang berlaku di',
  form: 'saya ingin dihubungi mengenai',
};

function paragraphs(input: GenerateInput): string {
  const { project, houseTypes } = input;
  const cheapest = houseTypes.length ? Math.min(...houseTypes.map((h) => h.price)) : 0;
  const names = houseTypes.map((h) => h.name);
  const fasilitas = project.facilities.length ? project.facilities.join(', ').toLowerCase() : 'fasilitas dasar cluster';

  return [
    `${project.name} adalah ${houseTypes.length > 1 ? `cluster dengan ${houseTypes.length} pilihan tipe` : 'hunian'} di ${project.location}${project.developer ? `, dikembangkan oleh ${project.developer}` : ''}. ${project.description}`,
    `Setiap tipe dirancang untuk kebutuhan keluarga yang berbeda. ${names.map((n, i) => `${n} menawarkan ${formatArea(houseTypes[i].landArea)} luas tanah dengan ${formatArea(houseTypes[i].buildingArea)} bangunan dan ${houseTypes[i].bedrooms} kamar tidur`).join('. ')}.`,
    `Kawasan ini dilengkapi ${fasilitas}.${nearbyPhrase(input.brief)} Lingkungan cluster tertutup membuat penghuni lebih tenang.`,
    `Harga dimulai dari ${formatRupiahShort(cheapest)} untuk tipe ${names[0] ?? 'terkecil'}. Skema pembayaran dapat disesuaikan, termasuk KPR melalui bank rekanan dan cicilan bertahap ke developer.`,
    `Unit terbatas pada setiap tipe. Kami menyarankan Anda menjadwalkan survei lebih awal untuk memastikan posisi dan hadap unit yang masih tersedia di ${project.name}.`,
    `Dokumen legalitas lengkap dan proses serah terima dijadwalkan sesuai perjanjian pengikatan jual beli. Tim pemasaran siap membantu Anda menghitung simulasi angsuran sesuai kemampuan.`,
  ].join(' ');
}

export const mockGenerator: ContentGenerator = {
  model: 'mock-gemini-2.5-flash',

  async generate(input: GenerateInput): Promise<AiContent> {
    const delay = input.delayMs ?? 3000 + Math.floor(Math.random() * 5000);
    if (delay > 0) await wait(delay);

    if (input.forceFail || process.env.AI_MOCK_FAIL === '1') throw new AiGenerationError();

    const { project, houseTypes, brief } = input;
    const cheapest = houseTypes.length ? Math.min(...houseTypes.map((h) => h.price)) : 0;
    const area = brief.location?.area || brief.location?.district || project.location.split(',')[0];
    const goal = brief.ctaGoals[0] ?? 'whatsapp';

    return {
      headline: `${project.name} — ${houseTypes.length} tipe hunian di ${area}`,
      subheadline: brief.highlights[0]
        ? `${brief.highlights[0]}.`
        : `Hunian siap huni di ${area} dengan ${houseTypes.length} pilihan tipe.`,
      cta: {
        whatsappMessage: `Halo, ${CTA_MESSAGE[goal] ?? CTA_MESSAGE.whatsapp} ${project.name}.`,
      },
      description: paragraphs(input),
      houseTypes: houseTypes.map((h) => ({
        name: h.name,
        shortDescription: `Tipe ${h.name} dengan ${formatArea(h.landArea)} tanah, ${formatArea(h.buildingArea)} bangunan, ${h.bedrooms} kamar tidur dan ${h.bathrooms} kamar mandi.`,
        sellingPoints: [
          `Luas bangunan ${formatArea(h.buildingArea)}`,
          `${h.bedrooms} kamar tidur, ${h.bathrooms} kamar mandi`,
          `Carport ${h.carport} mobil`,
          `Mulai ${formatRupiahShort(h.price)}`,
        ],
      })),
      sellingPoints: [
        ...brief.highlights.slice(0, 3),
        ...project.facilities.slice(0, brief.highlights.length ? 1 : 3),
        `${houseTypes.length} tipe unit dalam satu lokasi`,
        `Harga mulai ${formatRupiahShort(cheapest)}`,
      ].filter(Boolean),
      faq: [
        { q: 'Apakah bisa KPR?', a: 'Bisa. Pengajuan KPR dilayani melalui bank rekanan dan kami bantu siapkan dokumennya.' },
        { q: 'Kapan serah terima unit?', a: 'Jadwal serah terima mengikuti perjanjian pengikatan jual beli dan progres pembangunan tiap tipe.' },
        { q: 'Apakah harga sudah termasuk pajak?', a: 'Harga yang tercantum belum termasuk pajak dan biaya administrasi. Rinciannya kami kirim saat penawaran resmi.' },
      ],
      seo: {
        title: `${project.name} — dijual di ${project.location}`,
        description: `${houseTypes.length} tipe unit di ${project.name}, ${project.location}. Mulai ${formatRupiahShort(cheapest)}. Hubungi agen untuk survei dan simulasi KPR.`,
      },
      captions: {
        instagram: `${houseTypes.length} tipe, satu cluster. ${project.name} — mulai ${formatRupiahShort(cheapest)}. Link di bio untuk detail tiap tipe.`,
        facebook: `${project.name} di ${project.location} membuka ${houseTypes.length} pilihan tipe mulai ${formatRupiahShort(cheapest)}. Kirim pesan untuk price list lengkap.`,
        whatsapp: `Halo, saya bagikan detail ${project.name} di ${project.location}. Tersedia ${houseTypes.length} tipe mulai ${formatRupiahShort(cheapest)}.`,
      },
    };
  },
};

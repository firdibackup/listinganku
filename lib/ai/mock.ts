import { formatArea, formatRupiahShort } from '@/lib/format';
import type { ContentGenerator, GenerateInput } from './generator';
import { AiGenerationError } from './generator';
import type { AiContent } from './schema';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function paragraphs(input: GenerateInput): string {
  const { project, houseTypes } = input;
  const cheapest = houseTypes.length ? Math.min(...houseTypes.map((h) => h.price)) : 0;
  const names = houseTypes.map((h) => h.name);
  const fasilitas = project.facilities.length ? project.facilities.join(', ').toLowerCase() : 'fasilitas dasar cluster';

  return [
    `${project.name} adalah ${houseTypes.length > 1 ? `cluster dengan ${houseTypes.length} pilihan tipe` : 'hunian'} di ${project.location}${project.developer ? `, dikembangkan oleh ${project.developer}` : ''}. ${project.description}`,
    `Setiap tipe dirancang untuk kebutuhan keluarga yang berbeda. ${names.map((n, i) => `${n} menawarkan ${formatArea(houseTypes[i].landArea)} luas tanah dengan ${formatArea(houseTypes[i].buildingArea)} bangunan dan ${houseTypes[i].bedrooms} kamar tidur`).join('. ')}.`,
    `Kawasan ini dilengkapi ${fasilitas}. Lingkungan cluster tertutup membuat penghuni lebih tenang, sementara akses ke pusat aktivitas tetap singkat untuk perjalanan harian.`,
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

    const { project, houseTypes } = input;
    const cheapest = houseTypes.length ? Math.min(...houseTypes.map((h) => h.price)) : 0;

    return {
      headline: `${project.name} — ${houseTypes.length} tipe hunian di ${project.location.split(',')[0]}`,
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
        ...project.facilities.slice(0, 3),
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

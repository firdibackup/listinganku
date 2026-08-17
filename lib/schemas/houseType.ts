import { z } from 'zod';

/**
 * z.coerce.number() tanpa invalid_type_error membiarkan pesan bawaan Zod
 * lolos ("Expected number, received nan") setiap kali input tidak bisa
 * dikoersi jadi angka (string bukan angka, atau field yang sama sekali tidak
 * dikirim) — koersi mengubah keduanya jadi NaN sebelum pemeriksaan tipe
 * jalan. String kosong TIDAK masuk kategori ini: Number('') adalah 0, bukan
 * NaN, jadi ia lolos pemeriksaan tipe dan jatuh ke .positive()/.min() di
 * bawah yang pesannya sudah Bahasa Indonesia.
 */
const positif = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} harus berupa angka.` })
    .int(`${label} harus berupa bilangan bulat.`)
    .positive(`${label} harus lebih dari nol.`);

const nolKeAtas = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} harus berupa angka.` })
    .int(`${label} harus berupa bilangan bulat.`)
    .min(0, `${label} tidak boleh negatif.`);

export const HouseTypeSchema = z.object({
  name: z.string().trim().min(1, 'Wajib diisi.'),
  price: positif('Harga'),
  landArea: positif('Luas tanah'),
  buildingArea: positif('Luas bangunan'),
  bedrooms: nolKeAtas('Kamar tidur'),
  bathrooms: nolKeAtas('Kamar mandi'),
  carport: nolKeAtas('Carport'),
});

export type HouseTypeInput = z.infer<typeof HouseTypeSchema>;

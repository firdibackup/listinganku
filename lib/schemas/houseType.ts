import { z } from 'zod';

const positif = (label: string) => z.coerce.number().int().positive(`${label} harus lebih dari nol.`);
const nolKeAtas = (label: string) => z.coerce.number().int().min(0, `${label} tidak boleh negatif.`);

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

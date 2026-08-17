import { z } from 'zod';

/** Nomor Indonesia: 08xx / +62 / 62, 9–15 digit setelah normalisasi. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s().-]/g, ''))
  .refine((v) => /^(\+?62|0)8\d{7,12}$/.test(v), { message: 'Masukkan nomor WhatsApp yang valid.' });

export const LeadSchema = z.object({
  name: z.string().trim().min(1, 'Wajib diisi.'),
  phone: phoneSchema,
  email: z.union([z.literal(''), z.string().email('Masukkan email yang valid.')]).optional(),
  message: z.string().trim().min(1, 'Wajib diisi.'),
  houseTypeId: z.string().optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;

import { z } from 'zod';

/**
 * Cermin persis `responseSchema` yang akan dikirim ke Gemini 2.5 Flash.
 * Menjaga bentuk ini stabil membuat pergantian mock → Gemini tidak menyentuh UI.
 */
export const AiContentSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  description: z.string().min(1),
  houseTypes: z.array(
    z.object({
      name: z.string().min(1),
      shortDescription: z.string().min(1),
      sellingPoints: z.array(z.string().min(1)),
    }),
  ),
  sellingPoints: z.array(z.string().min(1)),
  faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })),
  seo: z.object({ title: z.string().min(1), description: z.string().min(1) }),
  captions: z.object({
    instagram: z.string().min(1),
    facebook: z.string().min(1),
    whatsapp: z.string().min(1),
  }),
  /**
   * Hanya pesan WhatsApp yang menjadi data di 3A. Label CTA tetap milik tema —
   * kesepuluh tema punya wordingnya sendiri hasil transkrip file desain.
   */
  cta: z.object({ whatsappMessage: z.string().min(1) }),
});

export type AiContent = z.infer<typeof AiContentSchema>;

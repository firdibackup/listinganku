/**
 * Mock untuk `next/font/google` di lingkungan Vitest. next/font adalah konstruksi
 * build-time Next.js yang tidak bisa dieksekusi di jsdom, jadi vitest.config.ts
 * meng-alias `next/font/google` ke file ini. Setiap factory font mengembalikan
 * bentuk minimal yang dipakai `lib/landing/fonts.ts` — `variable` dan `className`.
 *
 * Saat menambah font tema baru, tambahkan nama ekspornya di sini.
 */
type FontOpts = { variable?: string };

const factory = (opts?: FontOpts) => ({
  variable: opts?.variable ?? '--font-mock',
  className: opts?.variable ?? 'font-mock',
  style: { fontFamily: 'mock' },
});

export const DM_Serif_Display = factory;
export const DM_Sans = factory;
export const Jost = factory;
export const Instrument_Serif = factory;
export const Marcellus = factory;
export const Karla = factory;
export const Anton = factory;
export const Figtree = factory;
export const Lato = factory;
export const Fredoka = factory;
export const Outfit = factory;
export const Archivo_Narrow = factory;
export const Nunito_Sans = factory;
export const Playfair_Display = factory;
export const Inter = factory;
export const Manrope = factory;
export const Fraunces = factory;
export const Space_Grotesk = factory;
export const Libre_Franklin = factory;
export const Cormorant_Garamond = factory;
export const Poppins = factory;
export const Lora = factory;
export const Work_Sans = factory;
export const Archivo = factory;
export const IBM_Plex_Sans = factory;
export const Nunito = factory;
export const Quicksand = factory;

export default factory;

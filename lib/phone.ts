/**
 * Menormalkan nomor Indonesia yang sudah lolos phoneSchema (lib/schemas/lead.ts)
 * ke satu bentuk kanonik: hanya digit, berawalan 62, tanpa "+"/spasi/tanda
 * pemisah — persis bentuk yang dipakai wa.me.
 *
 * Tanpa ini, "081...", "+6281...", dan "6281..." untuk nomor yang SAMA bisa
 * tersimpan sebagai tiga string leads.phone yang berbeda hanya karena gaya
 * ketik pengunjung berbeda. Dipakai oleh submitLeadAction (penyimpanan lead)
 * DAN WhatsAppLink/toWaHref (pembuatan link wa.me) supaya keduanya selalu
 * konsisten satu sama lain.
 */
export function normalizeIndonesianPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  return digits.replace(/^0/, '62');
}

/**
 * Kebalikan tampilan dari normalizeIndonesianPhone: bentuk kanonik "62..." yang
 * tersimpan di leads.phone dikembalikan ke gaya nasional berkelompok seperti di
 * file design ("0813-2244-9087"). Pengelompokan 4-4-sisa; nomor Indonesia
 * panjangnya bervariasi, jadi kelompok terakhir menampung sisanya apa adanya.
 */
export function formatPhoneDisplay(input: string): string {
  const digits = (input ?? '').replace(/\D/g, '');
  if (digits.length === 0) return '—';
  const national = digits.startsWith('62') ? `0${digits.slice(2)}` : digits;
  const groups = [national.slice(0, 4), national.slice(4, 8), national.slice(8)];
  return groups.filter(Boolean).join('-');
}

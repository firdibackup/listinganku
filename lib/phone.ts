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

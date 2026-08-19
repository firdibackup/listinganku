const ID = 'id-ID';

const BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/**
 * Guard untuk nilai kosong atau tidak valid. Formatter adalah pertahanan terakhir
 * antara field kosong dan halaman publik — gradasi diam-diam lebih buruk daripada
 * pembaca yang melihat "—" dan tahu ada sesuatu yang hilang.
 */
function isAbsent(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number' && !Number.isFinite(value)) return true;
  if (value instanceof Date && !Number.isFinite(value.getTime())) return true;
  return false;
}

/** Pemisah ribuan titik, desimal koma — konvensi Indonesia. */
export function formatNumber(value: number | null | undefined): string {
  if (isAbsent(value)) return '—';
  return new Intl.NumberFormat(ID).format(value as number);
}

export function formatRupiah(value: number | null | undefined): string {
  if (isAbsent(value)) return '—';
  return `Rp${formatNumber(Math.round(value as number))}`;
}

/** Bentuk ringkas untuk kartu dan hero: "Rp 2,45 M", "Rp 750 jt". */
export function formatRupiahShort(value: number | null | undefined): string {
  if (isAbsent(value)) return '—';
  const num = value as number;
  const trim = (n: number, digits: number) =>
    new Intl.NumberFormat(ID, { maximumFractionDigits: digits }).format(n);

  if (num >= 1_000_000_000) return `Rp ${trim(num / 1_000_000_000, 2)} M`;
  if (num >= 1_000_000) return `Rp ${trim(num / 1_000_000, 1)} jt`;
  return formatRupiah(num);
}

export function formatArea(m2: number | null | undefined): string {
  if (isAbsent(m2)) return '—';
  return `${formatNumber(m2)} m²`;
}

export function formatDateLong(iso: string | Date | null | undefined): string {
  if (isAbsent(iso)) return '—';
  const d = new Date(iso as string | Date);
  if (!Number.isFinite(d.getTime())) return '—';
  return `${d.getUTCDate()} ${BULAN_PANJANG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDateShort(iso: string | Date | null | undefined): string {
  if (isAbsent(iso)) return '—';
  const d = new Date(iso as string | Date);
  if (!Number.isFinite(d.getTime())) return '—';
  return `${d.getUTCDate()} ${BULAN_PENDEK[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Rasio 0..1 menjadi persen gaya Indonesia ("6,7%"). Satu angka desimal, dan
 * desimal nol dibuang supaya "50%" tidak tampil sebagai "50,0%".
 */
export function formatPercent(value: number | null | undefined): string {
  if (isAbsent(value)) return '—';
  const formatted = new Intl.NumberFormat(ID, { maximumFractionDigits: 1 }).format((value as number) * 100);
  return `${formatted}%`;
}

/**
 * Kolom TANGGAL di tabel Leads: "10 Agu, 09.12". Sengaja tanpa tahun — tabel
 * memuat prospek terbaru dan kolomnya sempit. Titik sebagai pemisah jam adalah
 * konvensi Indonesia ("09.12 WIB"), bukan titik dua.
 *
 * Memakai getter UTC seperti formatDateLong/Short: dirender di server lalu
 * dihidrasi di klien, jadi zona waktu lokal akan membuat teksnya berbeda.
 */
export function formatDateTimeShort(iso: string | Date | null | undefined): string {
  if (isAbsent(iso)) return '—';
  const d = new Date(iso as string | Date);
  if (!Number.isFinite(d.getTime())) return '—';
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${d.getUTCDate()} ${BULAN_PENDEK[d.getUTCMonth()]}, ${hh}.${mm}`;
}

const ID = 'id-ID';

const BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Pemisah ribuan titik, desimal koma — konvensi Indonesia. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(ID).format(value);
}

export function formatRupiah(value: number): string {
  return `Rp${formatNumber(Math.round(value))}`;
}

/** Bentuk ringkas untuk kartu dan hero: "Rp 2,45 M", "Rp 750 jt". */
export function formatRupiahShort(value: number): string {
  const trim = (n: number, digits: number) =>
    new Intl.NumberFormat(ID, { maximumFractionDigits: digits }).format(n);

  if (value >= 1_000_000_000) return `Rp ${trim(value / 1_000_000_000, 2)} M`;
  if (value >= 1_000_000) return `Rp ${trim(value / 1_000_000, 1)} jt`;
  return formatRupiah(value);
}

export function formatArea(m2: number): string {
  return `${formatNumber(m2)} m²`;
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${BULAN_PANJANG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${BULAN_PENDEK[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

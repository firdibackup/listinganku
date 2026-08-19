import { describe, it, expect } from 'vitest';
import { formatRupiahShort, formatRupiah, formatNumber, formatArea, formatDateLong, formatDateShort, formatPercent, formatDateTimeShort } from '@/lib/format';

describe('formatRupiahShort', () => {
  it('memakai koma desimal dan satuan M untuk miliar', () => {
    expect(formatRupiahShort(2_450_000_000)).toBe('Rp 2,45 M');
    expect(formatRupiahShort(4_600_000_000)).toBe('Rp 4,6 M');
  });

  it('memakai satuan jt untuk juta', () => {
    expect(formatRupiahShort(750_000_000)).toBe('Rp 750 jt');
  });

  it('jatuh ke format penuh di bawah satu juta', () => {
    expect(formatRupiahShort(150_000)).toBe('Rp150.000');
  });
});

describe('format lain', () => {
  it('memakai titik sebagai pemisah ribuan', () => {
    expect(formatRupiah(1_850_000_000)).toBe('Rp1.850.000.000');
    expect(formatNumber(1842)).toBe('1.842');
  });

  it('menambahkan satuan meter persegi', () => {
    expect(formatArea(90)).toBe('90 m²');
  });

  it('mengeja bulan dalam Bahasa Indonesia', () => {
    expect(formatDateLong('2026-08-16T00:00:00.000Z')).toBe('16 Agustus 2026');
    expect(formatDateShort('2026-08-16T00:00:00.000Z')).toBe('16 Agu 2026');
  });
});

describe('handle nilai kosong', () => {
  it('formatNumber mengembalikan em dash untuk null, undefined, dan NaN', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(NaN)).toBe('—');
  });

  it('formatRupiah mengembalikan em dash untuk null, undefined, dan NaN', () => {
    expect(formatRupiah(null)).toBe('—');
    expect(formatRupiah(undefined)).toBe('—');
    expect(formatRupiah(NaN)).toBe('—');
  });

  it('formatRupiahShort mengembalikan em dash untuk null, undefined, dan NaN', () => {
    expect(formatRupiahShort(null)).toBe('—');
    expect(formatRupiahShort(undefined)).toBe('—');
    expect(formatRupiahShort(NaN)).toBe('—');
  });

  it('formatArea mengembalikan em dash untuk null, undefined, dan NaN', () => {
    expect(formatArea(null)).toBe('—');
    expect(formatArea(undefined)).toBe('—');
    expect(formatArea(NaN)).toBe('—');
  });

  it('formatDateLong mengembalikan em dash untuk null, undefined, dan invalid date', () => {
    expect(formatDateLong(null)).toBe('—');
    expect(formatDateLong(undefined)).toBe('—');
    expect(formatDateLong('not-a-date')).toBe('—');
  });

  it('formatDateShort mengembalikan em dash untuk null, undefined, dan invalid date', () => {
    expect(formatDateShort(null)).toBe('—');
    expect(formatDateShort(undefined)).toBe('—');
    expect(formatDateShort('not-a-date')).toBe('—');
  });
});

describe('nol adalah nilai nyata', () => {
  it('formatNumber(0) tidak mengembalikan em dash', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('formatRupiah(0) tidak mengembalikan em dash', () => {
    expect(formatRupiah(0)).toBe('Rp0');
  });

  it('formatRupiahShort(0) tidak mengembalikan em dash', () => {
    expect(formatRupiahShort(0)).toBe('Rp0');
  });

  it('formatArea(0) tidak mengembalikan em dash', () => {
    expect(formatArea(0)).toBe('0 m²');
  });
});

describe('formatPercent', () => {
  it('memakai koma desimal dan satu angka di belakang koma', () => {
    expect(formatPercent(0.067)).toBe('6,7%');
    expect(formatPercent(0.002)).toBe('0,2%');
  });

  it('membuang desimal nol daripada menulis "50,0%"', () => {
    expect(formatPercent(0.5)).toBe('50%');
    expect(formatPercent(0)).toBe('0%');
  });

  it('mengembalikan em dash untuk null, undefined, dan NaN', () => {
    expect(formatPercent(null)).toBe('—');
    expect(formatPercent(undefined)).toBe('—');
    expect(formatPercent(NaN)).toBe('—');
  });
});

describe('formatDateTimeShort', () => {
  it('menggabungkan tanggal pendek dan jam gaya 24 jam dipisah koma', () => {
    expect(formatDateTimeShort('2026-08-10T09:12:00.000Z')).toBe('10 Agu, 09.12');
    expect(formatDateTimeShort('2026-08-09T20:44:00.000Z')).toBe('9 Agu, 20.44');
  });

  it('memberi nol di depan pada jam dan menit satu digit', () => {
    expect(formatDateTimeShort('2026-08-06T07:05:00.000Z')).toBe('6 Agu, 07.05');
  });

  it('memakai UTC, sama seperti formatDateShort, supaya server dan klien tidak berbeda', () => {
    // Tanpa ini render server (UTC) dan hidrasi klien (zona lokal) bisa berbeda teks.
    expect(formatDateTimeShort('2026-08-10T23:30:00.000Z')).toBe('10 Agu, 23.30');
  });

  it('mengembalikan em dash untuk nilai kosong atau tanggal tidak valid', () => {
    expect(formatDateTimeShort(null)).toBe('—');
    expect(formatDateTimeShort('bukan-tanggal')).toBe('—');
  });
});

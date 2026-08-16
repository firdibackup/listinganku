import { describe, it, expect } from 'vitest';
import { formatRupiahShort, formatRupiah, formatNumber, formatArea, formatDateLong, formatDateShort } from '@/lib/format';

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

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

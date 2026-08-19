import { describe, it, expect } from 'vitest';
import { formatPhoneDisplay } from '@/lib/phone';

describe('formatPhoneDisplay', () => {
  it('mengubah bentuk kanonik 62 kembali ke gaya nasional berkelompok', () => {
    // submitLeadAction menyimpan bentuk 62 (normalizeIndonesianPhone), tapi
    // desain menampilkan gaya nasional berawalan 0.
    expect(formatPhoneDisplay('6281322449087')).toBe('0813-2244-9087');
    expect(formatPhoneDisplay('6281288994410')).toBe('0812-8899-4410');
  });

  it('menerima nomor yang sudah berawalan 0', () => {
    expect(formatPhoneDisplay('081322449087')).toBe('0813-2244-9087');
  });

  it('membuang spasi, tanda plus, dan tanda hubung yang diketik pengguna', () => {
    expect(formatPhoneDisplay('+62 813-2244 9087')).toBe('0813-2244-9087');
  });

  it('mengelompokkan sisa digit di kelompok terakhir untuk nomor lebih panjang atau pendek', () => {
    expect(formatPhoneDisplay('6281322449')).toBe('0813-2244-9');
    expect(formatPhoneDisplay('62813224490871')).toBe('0813-2244-90871');
  });

  it('mengembalikan em dash untuk masukan kosong daripada string aneh', () => {
    expect(formatPhoneDisplay('')).toBe('—');
    expect(formatPhoneDisplay('   ')).toBe('—');
  });
});

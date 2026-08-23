import { describe, it, expect } from 'vitest';
import { searchRegions, formatRegion, composeLocationLabel } from '@/lib/places/regions';

describe('searchRegions', () => {
  it('mencocokkan nama kecamatan', () => {
    const hits = searchRegions('kelapa gading');
    expect(hits[0].district).toBe('Kelapa Gading');
    expect(hits[0].city).toBe('Jakarta Utara');
  });

  it('mencocokkan nama kota juga, bukan hanya kecamatan', () => {
    expect(searchRegions('tangerang selatan').length).toBeGreaterThan(0);
  });

  it('tidak peka huruf besar-kecil', () => {
    expect(searchRegions('KELAPA GADING')[0].district).toBe('Kelapa Gading');
  });

  it('mendahulukan kecocokan awalan di atas kecocokan tengah', () => {
    const hits = searchRegions('serpong');
    expect(hits[0].district.toLowerCase().startsWith('serpong')).toBe(true);
  });

  it('mengembalikan maksimal 8 hasil', () => {
    expect(searchRegions('an').length).toBeLessThanOrEqual(8);
  });

  it('kueri kosong atau satu huruf tidak mengembalikan apa-apa', () => {
    expect(searchRegions('')).toEqual([]);
    expect(searchRegions('k')).toEqual([]);
  });

  it('kueri tanpa kecocokan mengembalikan array kosong, bukan melempar', () => {
    expect(searchRegions('zzzzqq')).toEqual([]);
  });
});

describe('formatRegion', () => {
  it('merangkai baris kedua combobox', () => {
    expect(formatRegion({ district: 'Kelapa Dua', city: 'Kabupaten Tangerang', province: 'Banten' }))
      .toBe('Kelapa Dua, Kabupaten Tangerang, Banten');
  });
});

describe('composeLocationLabel', () => {
  it('mendahulukan nama kawasan, lalu kecamatan dan kota', () => {
    expect(composeLocationLabel({
      area: 'Gading Serpong', district: 'Kelapa Dua', city: 'Kabupaten Tangerang',
      province: 'Banten', address: '',
    })).toBe('Gading Serpong, Kelapa Dua, Kabupaten Tangerang');
  });

  it('tanpa kawasan, memakai kecamatan dan kota', () => {
    expect(composeLocationLabel({
      area: '', district: 'Kelapa Gading', city: 'Jakarta Utara', province: 'DKI Jakarta', address: '',
    })).toBe('Kelapa Gading, Jakarta Utara');
  });

  it('lokasi kosong menghasilkan string kosong, bukan koma menggantung', () => {
    expect(composeLocationLabel({ area: '', district: '', city: '', province: '', address: '' })).toBe('');
  });
});

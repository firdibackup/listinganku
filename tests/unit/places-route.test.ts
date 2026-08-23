import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/places/route';

const call = (url: string) => GET(new Request(url));

describe('GET /api/places', () => {
  it('mengembalikan hasil untuk kueri yang cocok', async () => {
    const res = await call('http://localhost/api/places?q=kelapa%20gading');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results[0].district).toBe('Kelapa Gading');
  });

  it('kueri kosong mengembalikan daftar kosong, bukan error', async () => {
    const res = await call('http://localhost/api/places');
    expect(res.status).toBe(200);
    expect((await res.json()).results).toEqual([]);
  });

  it('membatasi hasil ke 8', async () => {
    const res = await call('http://localhost/api/places?q=an');
    expect((await res.json()).results.length).toBeLessThanOrEqual(8);
  });
});

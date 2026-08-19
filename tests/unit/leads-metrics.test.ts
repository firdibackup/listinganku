import { describe, it, expect } from 'vitest';
import { computeLeadMetrics } from '@/lib/leads/metrics';
import type { EventRow } from '@/lib/data/types';

const NOW = new Date('2026-08-19T10:00:00.000Z');

function evt(type: EventRow['type'], date: string, count: number, projectId = 'prj_a'): EventRow {
  return { id: `evt_${type}_${date}_${count}`, projectId, houseTypeId: null, type, date, count };
}

describe('computeLeadMetrics — total', () => {
  it('menjumlahkan count per tipe event, bukan menghitung jumlah baris', () => {
    const events = [
      evt('visitor', '2026-08-10', 100),
      evt('visitor', '2026-08-11', 42),
      evt('whatsapp_click', '2026-08-11', 7),
      evt('form_submit', '2026-08-11', 3),
    ];

    const m = computeLeadMetrics(events, NOW);

    expect(m.visitors).toBe(142);
    expect(m.whatsappClicks).toBe(7);
    expect(m.formSubmits).toBe(3);
  });
});

describe('computeLeadMetrics — delta 7 hari', () => {
  it('hanya menghitung event dalam 7 hari terakhir termasuk hari ini', () => {
    const events = [
      evt('visitor', '2026-08-19', 5),  // hari ini — masuk
      evt('visitor', '2026-08-13', 10), // tepat 6 hari lalu — masuk (hari ke-7)
      evt('visitor', '2026-08-12', 99), // 7 hari lalu — di luar jendela
    ];

    const m = computeLeadMetrics(events, NOW);

    expect(m.visitors).toBe(114);
    expect(m.deltas.visitors).toBe(15);
  });

  it('menghitung delta terpisah untuk tiap tipe event', () => {
    const events = [
      evt('whatsapp_click', '2026-08-18', 4),
      evt('whatsapp_click', '2026-08-01', 50),
      evt('form_submit', '2026-08-17', 2),
    ];

    const m = computeLeadMetrics(events, NOW);

    expect(m.deltas.whatsappClicks).toBe(4);
    expect(m.deltas.formSubmits).toBe(2);
  });
});

describe('computeLeadMetrics — konversi', () => {
  it('menghitung klik WhatsApp DAN submit form sebagai lead, bukan hanya baris tabel leads', () => {
    // Angka seed = angka file design: 1.842 visitor, 96 klik WA, 27 submit form,
    // dan kartu Conversion di design berbunyi 6,7%. (96+27)/1842 = 6,68% -> 6,7%.
    // Hanya submit form yang membuat baris `leads` (actions.ts submitLeadAction);
    // klik WhatsApp cuma mencatat event. Memakai leads.length akan melaporkan
    // 0,3% dan diam-diam mengabaikan kanal utama penjualan properti Indonesia.
    const events = [
      evt('visitor', '2026-08-18', 1842),
      evt('whatsapp_click', '2026-08-18', 96),
      evt('form_submit', '2026-08-18', 27),
    ];

    const m = computeLeadMetrics(events, NOW);

    expect(m.conversionRate).toBeCloseTo(0.0668, 4);
  });

  it('mengembalikan 0 saat belum ada visitor, bukan NaN atau Infinity', () => {
    const m = computeLeadMetrics([evt('form_submit', '2026-08-18', 3)], NOW);

    expect(m.conversionRate).toBe(0);
    expect(Number.isFinite(m.conversionRate)).toBe(true);
  });
});

describe('computeLeadMetrics — kosong', () => {
  it('mengembalikan nol di semua metrik tanpa event dan tanpa lead', () => {
    const m = computeLeadMetrics([], NOW);

    expect(m).toEqual({
      visitors: 0, whatsappClicks: 0, formSubmits: 0, conversionRate: 0,
      deltas: { visitors: 0, whatsappClicks: 0, formSubmits: 0 },
    });
  });
});

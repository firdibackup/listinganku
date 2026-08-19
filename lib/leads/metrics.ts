import type { EventRow } from '@/lib/data/types';

export interface LeadMetrics {
  visitors: number;
  whatsappClicks: number;
  formSubmits: number;
  /**
   * Rasio 0..1 dari kartu "Conversion · VISITOR → LEAD". Pembilangnya adalah
   * klik WhatsApp + submit form, bukan jumlah baris tabel `leads`: hanya submit
   * form yang membuat baris lead, sedangkan klik WhatsApp berhenti di event.
   * Memakai leads.length akan mengabaikan kanal penjualan yang justru utama.
   * Selalu berhingga — lihat penjaga pembagian di bawah.
   */
  conversionRate: number;
  deltas: { visitors: number; whatsappClicks: number; formSubmits: number };
}

/** Jendela kartu metrik: hari ini plus 6 hari sebelumnya = 7 hari kalender. */
const WINDOW_DAYS = 7;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Murni supaya bisa diuji tanpa store: halaman Leads yang memasok baris.
 * `now` disuntik (bukan `new Date()` di dalam) agar jendela 7 hari deterministik.
 */
export function computeLeadMetrics(events: EventRow[], now: Date): LeadMetrics {
  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - (WINDOW_DAYS - 1));
  const sinceDate = isoDate(since);

  const totals = { visitor: 0, whatsapp_click: 0, form_submit: 0 };
  const recent = { visitor: 0, whatsapp_click: 0, form_submit: 0 };

  for (const e of events) {
    // Baris event menyimpan `count` teragregasi per hari, bukan satu baris per
    // kejadian — menjumlahkan panjang array akan salah hitung.
    totals[e.type] += e.count;
    if (e.date >= sinceDate) recent[e.type] += e.count;
  }

  return {
    visitors: totals.visitor,
    whatsappClicks: totals.whatsapp_click,
    formSubmits: totals.form_submit,
    // Nol visitor adalah keadaan normal (project baru dipublish), bukan error.
    // Tanpa penjaga ini pembagian menghasilkan NaN — yang lolos ke UI sebagai "NaN%".
    conversionRate: totals.visitor === 0
      ? 0
      : (totals.whatsapp_click + totals.form_submit) / totals.visitor,
    deltas: {
      visitors: recent.visitor,
      whatsappClicks: recent.whatsapp_click,
      formSubmits: recent.form_submit,
    },
  };
}

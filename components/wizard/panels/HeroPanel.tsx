'use client';

import type { CtaGoal, HeroEmphasis, ProjectBrief } from '@/lib/data/types';

export interface PanelProps {
  brief: ProjectBrief;
  onChange: (patch: Partial<ProjectBrief>) => void;
}

const EMPHASIS: { value: HeroEmphasis; label: string }[] = [
  { value: 'promo', label: 'Promo' },
  { value: 'lokasi', label: 'Keunggulan lokasi' },
  { value: 'konsep', label: 'Konsep hunian' },
  { value: 'harga', label: 'Harga' },
];

const GOALS: { value: CtaGoal; label: string }[] = [
  { value: 'whatsapp', label: 'Chat WhatsApp' },
  { value: 'lihatTipe', label: 'Lihat tipe unit' },
  { value: 'lihatPromo', label: 'Lihat promo' },
  { value: 'form', label: 'Isi form' },
];

/**
 * Mengumpulkan INTENT, bukan copy. Tidak ada input judul atau subjudul di sini
 * — itu pekerjaan AI, dan editor yang menyuntingnya setelah generate.
 */
export function HeroPanel({ brief, onChange }: PanelProps) {
  const toggleGoal = (g: CtaGoal) =>
    onChange({
      ctaGoals: brief.ctaGoals.includes(g)
        ? brief.ctaGoals.filter((x) => x !== g)
        : [...brief.ctaGoals, g],
    });

  return (
    <>
      <fieldset className="wz-panel__set">
        <legend className="lw-label">Apa yang ingin ditonjolkan?</legend>
        {EMPHASIS.map((e) => (
          <label key={e.value} className="wz-panel__opt">
            <input
              type="radio" name="heroEmphasis" value={e.value}
              checked={brief.heroEmphasis === e.value}
              onChange={() => onChange({ heroEmphasis: e.value })}
            />
            <span>{e.label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="wz-panel__set">
        <legend className="lw-label">Apa yang ingin dilakukan calon pembeli?</legend>
        {GOALS.map((g) => (
          <label key={g.value} className="wz-panel__opt">
            <input type="checkbox" checked={brief.ctaGoals.includes(g.value)} onChange={() => toggleGoal(g.value)} />
            <span>{g.label}</span>
          </label>
        ))}
      </fieldset>
    </>
  );
}

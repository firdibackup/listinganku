'use client';

import { Button, Chip, Input } from '@/components/ds';
import { FACILITY_OPTIONS } from '@/lib/schemas';
import type { PanelProps } from './HeroPanel';

export function FacilitiesPanel({ brief, onChange }: PanelProps) {
  const has = (name: string) => brief.facilities.some((f) => f.name === name);

  const togglePreset = (name: string) =>
    onChange({
      facilities: has(name)
        ? brief.facilities.filter((f) => f.name !== name)
        : [...brief.facilities, { name, desc: '', mediaIds: [] }],
    });

  const set = (i: number, patch: Partial<{ name: string; desc: string }>) => {
    const next = [...brief.facilities];
    next[i] = { ...next[i], ...patch };
    onChange({ facilities: next });
  };

  return (
    <>
      <div>
        <span className="lw-label">Fasilitas yang tersedia</span>
        <div className="wz__chips">
          {FACILITY_OPTIONS.map((name) => (
            <button key={name} type="button" className="wz__chip" aria-pressed={has(name)} onClick={() => togglePreset(name)}>
              <Chip tone={has(name) ? 'accent' : 'outline'} size="md">{name}</Chip>
            </button>
          ))}
        </div>
      </div>

      {brief.facilities.map((f, i) => (
        <div key={i} className="wz-panel__row">
          <Input label={`Nama fasilitas ${i + 1}`} value={f.name} onChange={(e) => set(i, { name: e.target.value })} />
          <Input label={`Keterangan ${i + 1}`} placeholder="Opsional" value={f.desc} onChange={(e) => set(i, { desc: e.target.value })} />
          <Button
            variant="link" size="sm"
            aria-label={`Hapus fasilitas ${i + 1}`}
            onClick={() => onChange({ facilities: brief.facilities.filter((_, j) => j !== i) })}
          >
            Hapus
          </Button>
        </div>
      ))}

      <Button
        variant="link" size="sm"
        onClick={() => onChange({ facilities: [...brief.facilities, { name: '', desc: '', mediaIds: [] }] })}
      >
        Tambah fasilitas
      </Button>
      <p style={{ fontSize: 13, color: 'var(--sage)' }}>Foto per fasilitas diunggah di halaman project.</p>
    </>
  );
}

'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button, Input } from '@/components/ds';
import { BLOCK_LABELS, type Block, type BlockType } from '@/lib/landing/blocks';
import type { ProjectBrief, ProjectType } from '@/lib/data/types';

interface SectionPlannerProps {
  blocks: Block[];
  brief: ProjectBrief;
  projectType: ProjectType | null;
  onToggle: (blockId: string) => void;
  onUsePreset: () => void;
  onNote: (type: BlockType, text: string) => void;
  /** Panel materi khusus. Section tanpa panel jatuh ke baris catatan bebas. */
  panelFor?: (type: BlockType) => ReactNode;
}

/**
 * Content Planner, BUKAN page builder. Yang sengaja TIDAK ada di sini:
 * reorder section (urutan milik tema), field copy per blok (tidak ada input
 * "Hero Title"), dan apa pun yang menyentuh tampilan. Kalau salah satunya
 * muncul, batas yang membedakan planner dari editor sudah bocor.
 */
export function SectionPlanner({
  blocks, brief, projectType, onToggle, onUsePreset, onNote, panelFor,
}: SectionPlannerProps) {
  const [openType, setOpenType] = useState<BlockType | null>(null);

  const summary = [
    brief.location ? 'Lokasi sudah ditentukan' : null,
    brief.nearby.length ? `${brief.nearby.length} tempat terdekat` : null,
    brief.highlights.length ? `${brief.highlights.length} keunggulan` : null,
    brief.facilities.length ? `${brief.facilities.length} fasilitas` : null,
    brief.promo ? '1 materi promo' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="wz-plan">
      <div className="wz-plan__head">
        <p style={{ fontSize: 14, color: 'var(--sage)' }}>
          Beritahu kami apa yang Anda punya. Kami yang menyusunnya menjadi landing page.
        </p>
        {projectType ? (
          <Button variant="secondary" size="sm" onClick={onUsePreset}>
            Gunakan rekomendasi
          </Button>
        ) : null}
      </div>

      <ul className="wz-plan__list">
        {blocks.map((b) => {
          const open = openType === b.type;
          const panel = panelFor?.(b.type) ?? null;
          return (
            <li key={b.id} className="wz-plan__row">
              <div className="wz-plan__bar">
                <label className="wz-plan__check">
                  <input type="checkbox" checked={b.enabled} onChange={() => onToggle(b.id)} />
                  <span>{BLOCK_LABELS[b.type]}</span>
                </label>
                <button
                  type="button"
                  className="wz-plan__toggle"
                  aria-expanded={open}
                  aria-label={`${open ? 'Tutup' : 'Buka'} materi ${BLOCK_LABELS[b.type]}`}
                  onClick={() => setOpenType(open ? null : b.type)}
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
              </div>

              {open ? (
                <div className="wz-plan__panel" role="region" aria-label={`Materi ${BLOCK_LABELS[b.type]}`}>
                  {panel ?? (
                    <Input
                      label={`Catatan untuk ${BLOCK_LABELS[b.type]}`}
                      hint="Opsional. Ditulis seadanya — ini bahan untuk AI, bukan teks yang tampil."
                      value={brief.notes[b.type] ?? ''}
                      onChange={(e) => onNote(b.type, e.target.value)}
                    />
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="wz-plan__summary">
        <span className="lw-label-sm">Materi yang Anda punya</span>
        <p style={{ fontSize: 14 }}>{summary.length ? summary.join(' · ') : 'Belum ada materi. Tidak masalah.'}</p>
        <p style={{ fontSize: 13, color: 'var(--sage)' }}>Foto diunggah di halaman project.</p>
      </div>
    </div>
  );
}

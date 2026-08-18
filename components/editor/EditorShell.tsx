'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ds';
import { toast } from '@/components/ui';
import { BlockRenderer } from '@/lib/landing/BlockRenderer';
import { resolveBlocks } from '@/lib/landing/resolve';
import { BLOCK_LABELS, moveBlock, toggleBlock, updateBlockProps } from '@/lib/landing/blocks';
import type { Block } from '@/lib/landing/blocks';
import { AVAILABLE_THEMES } from '@/lib/landing/themes';
import { saveBlocksAction, setThemeAction } from '@/app/(dashboard)/projects/[id]/editor/actions';
import type { AgentProfile, HouseType, Media, Project, ThemeName } from '@/lib/data/types';
import { BlockSettingsPanel } from './BlockSettingsPanel';

const ALL_THEMES: ThemeName[] = ['modern', 'showcase', 'luxury'];
const THEME_LABEL: Record<ThemeName, string> = { modern: 'Modern', showcase: 'Showcase', luxury: 'Luxury' };

export function EditorShell({
  project, houseTypes, media, agent,
}: {
  project: Project;
  houseTypes: HouseType[];
  media: Media[];
  agent: AgentProfile;
}) {
  const [blocks, setBlocks] = useState<Block[]>(project.blocks);
  const [theme, setTheme] = useState<ThemeName>(project.theme);
  const [selected, setSelected] = useState(blocks[0]?.id ?? '');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [pending, startTransition] = useTransition();

  const resolved = useMemo(
    () => resolveBlocks({ project: { ...project, blocks }, houseTypes, media, agent }),
    [project, blocks, houseTypes, media, agent],
  );

  const current = blocks.find((b) => b.id === selected);

  function save() {
    startTransition(async () => {
      await saveBlocksAction(project.id, blocks);
      toast.success('Tersimpan');
    });
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 className="lw-h3">Sesuaikan halaman</h1>
          <p className="lw-label-sm" style={{ marginTop: 5, color: 'var(--sage)' }}>
            listingku.app/{project.slug} · {project.status === 'published' ? 'Live' : 'Draft'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/${project.slug}`} target="_blank">
            <Button variant="secondary" size="sm">Preview</Button>
          </Link>
          <Link href={`/projects/${project.id}/publish`}>
            <Button variant="primary" size="sm">Publish</Button>
          </Link>
        </div>
      </div>

      <div className="ed__grid">
        <div className="ed__previewwrap">
          <div className="ed__previewhead">
            <span className="lw-label-sm" style={{ color: 'var(--sage)' }}>Pratinjau</span>
            <div className="ed__device">
              {(['desktop', 'mobile'] as const).map((d) => (
                <button key={d} type="button" className="ed__devicebtn" aria-pressed={device === d} onClick={() => setDevice(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="ed__stage">
            {/* Pratinjau memakai BlockRenderer yang SAMA dengan halaman live —
                karena itu tidak mungkin berbeda dari yang dilihat calon pembeli.
                Bungkusnya <div>, bukan <button>: blok berisi konten interaktif
                (form kontak, tautan WhatsApp) dan menyarangkannya di dalam
                <button> adalah DOM tidak valid. Pemilihan blok yang bisa diakses
                keyboard tetap tersedia lewat daftar blok di panel kanan. */}
            <div
              className="ed__preview"
              style={
                device === 'mobile'
                  ? { width: 390, transform: 'scale(.72)' }
                  : { width: 1200, transform: 'scale(.42)' }
              }
            >
              {resolved.map((block) => (
                <div
                  key={block.id}
                  className="ed__frame"
                  aria-current={block.id === selected ? 'true' : undefined}
                  onClick={() => setSelected(block.id)}
                >
                  <BlockRenderer blocks={[block]} theme={theme} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ed__panel">
          <p className="lw-label">Tema</p>
          <div className="ed__themes">
            {ALL_THEMES.map((t) => (
              <button
                key={t}
                type="button"
                className="ed__theme"
                aria-pressed={theme === t}
                disabled={!AVAILABLE_THEMES.includes(t)}
                onClick={() => {
                  setTheme(t);
                  startTransition(async () => { await setThemeAction(project.id, t); });
                }}
              >
                {THEME_LABEL[t]}
              </button>
            ))}
          </div>
          <p className="lw-caption" style={{ marginTop: 6, color: 'var(--sage)' }}>
            Showcase dan Luxury tersedia setelah desain temanya masuk.
          </p>

          <p className="lw-label" style={{ marginTop: 18 }}>Blok</p>
          <div className="ed__blocks">
            {blocks.map((block) => (
              <div key={block.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  type="button"
                  className={`ed__row${block.enabled ? '' : ' ed__row--off'}`}
                  style={{ flex: 1 }}
                  aria-current={block.id === selected}
                  aria-label={`Blok ${BLOCK_LABELS[block.type]}`}
                  onClick={() => setSelected(block.id)}
                >
                  {BLOCK_LABELS[block.type]}
                </button>
                <span className="ed__rowbtns">
                  <button type="button" aria-label={`Naikkan ${BLOCK_LABELS[block.type]}`} onClick={() => setBlocks(moveBlock(blocks, block.id, 'up'))}>
                    <ChevronUp size={13} />
                  </button>
                  <button type="button" aria-label={`Turunkan ${BLOCK_LABELS[block.type]}`} onClick={() => setBlocks(moveBlock(blocks, block.id, 'down'))}>
                    <ChevronDown size={13} />
                  </button>
                </span>
              </div>
            ))}
          </div>

          {current ? (
            <BlockSettingsPanel
              block={current}
              houseTypes={houseTypes}
              media={media}
              onToggle={() => setBlocks(toggleBlock(blocks, current.id))}
              onPatch={(patch) => setBlocks(updateBlockProps(blocks, current.id, patch))}
            />
          ) : null}

          <div style={{ marginTop: 18 }}>
            <Button variant="primary" size="sm" fullWidth onClick={save} disabled={pending}>
              Simpan perubahan
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

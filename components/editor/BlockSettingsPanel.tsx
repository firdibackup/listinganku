'use client';

import * as Switch from '@radix-ui/react-switch';
import { Input } from '@/components/ds';
import { BLOCK_LABELS } from '@/lib/landing/blocks';
import type { Block } from '@/lib/landing/blocks';
import type { HouseType, Media } from '@/lib/data/types';

export function BlockSettingsPanel({
  block, houseTypes, media, onToggle, onPatch,
}: {
  block: Block;
  houseTypes: HouseType[];
  media: Media[];
  onToggle: () => void;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const p = block.props as Record<string, unknown>;

  return (
    <div className="ed__settings">
      <p className="lw-label-sm" style={{ color: 'var(--sage)' }}>Pengaturan blok</p>
      <p className="lw-label">{BLOCK_LABELS[block.type]}</p>

      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 14 }}>Tampilkan blok</span>
        <Switch.Root
          checked={block.enabled}
          onCheckedChange={onToggle}
          aria-label="Tampilkan blok"
          style={{
            width: 40, height: 23, borderRadius: 999, padding: 3,
            background: block.enabled ? 'var(--evergreen)' : 'var(--ash)', border: 0, cursor: 'pointer',
          }}
        >
          <Switch.Thumb
            style={{
              display: 'block', width: 17, height: 17, borderRadius: '50%', background: 'var(--white)',
              transform: block.enabled ? 'translateX(17px)' : 'translateX(0)',
              transition: 'transform var(--dur-base) var(--ease-standard)',
            }}
          />
        </Switch.Root>
      </label>

      {block.type === 'hero' ? (
        <>
          <Input label="Judul" value={(p.title as string) ?? ''} hint="Kosongkan untuk memakai judul dari AI." onChange={(e) => onPatch({ title: e.target.value || undefined })} />
          <Input label="Subjudul" value={(p.subtitle as string) ?? ''} onChange={(e) => onPatch({ subtitle: e.target.value || undefined })} />
          <div>
            <span className="lw-caption" style={{ color: 'var(--evergreen)' }}>Gambar latar</span>
            <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
              {media.filter((m) => m.type === 'photo').slice(0, 6).map((m) => (
                <button
                  key={m.id} type="button" onClick={() => onPatch({ mediaId: m.id })}
                  style={{
                    height: 40, borderRadius: 4, background: 'var(--mint)', cursor: 'pointer',
                    border: p.mediaId === m.id ? '2px solid var(--evergreen)' : '1px solid var(--ash)',
                  }}
                  aria-label="Pilih gambar latar"
                />
              ))}
            </div>
          </div>
        </>
      ) : null}

      {block.type === 'gallery' ? (
        <div>
          <span className="lw-caption" style={{ color: 'var(--evergreen)' }}>Layout</span>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            {(['carousel', 'grid'] as const).map((layout) => (
              <button
                key={layout} type="button" className="ed__theme" aria-pressed={p.layout === layout}
                onClick={() => onPatch({ layout })}
              >
                {layout === 'carousel' ? 'Carousel' : 'Grid'}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {block.type === 'houseTypes' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {houseTypes.map((h) => {
            const hidden = ((p.hidden as string[]) ?? []).includes(h.id);
            return (
              <button
                key={h.id} type="button" className="ed__row" style={{ border: '1px solid var(--ash)' }}
                onClick={() =>
                  onPatch({
                    hidden: hidden
                      ? ((p.hidden as string[]) ?? []).filter((id) => id !== h.id)
                      : [...(((p.hidden as string[]) ?? [])), h.id],
                  })
                }
              >
                {h.name}
                <span className="lw-label-sm" style={{ color: 'var(--sage)' }}>{hidden ? 'Sembunyi' : 'Tampil'}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {block.type === 'faq' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(((p.items as { q: string; a: string }[]) ?? [])).map((item, i) => (
            <Input
              key={i} label={`Pertanyaan ${i + 1}`} value={item.q}
              onChange={(e) => {
                const items = [...((p.items as { q: string; a: string }[]) ?? [])];
                items[i] = { ...items[i], q: e.target.value };
                onPatch({ items });
              }}
            />
          ))}
          <button
            type="button" className="ds-btn ds-btn--link ds-btn--sm"
            onClick={() => onPatch({ items: [...(((p.items as { q: string; a: string }[]) ?? [])), { q: '', a: '' }] })}
          >
            Tambah FAQ
          </button>
        </div>
      ) : null}

      {block.type === 'agentCta' ? (
        <>
          <Input label="Nomor WhatsApp" value={(p.waNumber as string) ?? ''} hint="Kosongkan untuk memakai nomor dari profil." onChange={(e) => onPatch({ waNumber: e.target.value || undefined })} />
          <Input label="Pesan default" textarea rows={2} value={(p.defaultMessage as string) ?? ''} onChange={(e) => onPatch({ defaultMessage: e.target.value || undefined })} />
        </>
      ) : null}

      {block.type === 'highlights' ? (
        <Input
          label="Selling points" textarea rows={4}
          hint="Satu poin per baris. Kosongkan untuk memakai hasil AI."
          value={(((p.items as string[]) ?? []).join('\n'))}
          onChange={(e) => {
            const items = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
            onPatch({ items: items.length ? items : undefined });
          }}
        />
      ) : null}

      {block.type === 'location' ? (
        <>
          <Input label="Alamat" value={(p.address as string) ?? ''} onChange={(e) => onPatch({ address: e.target.value || undefined })} />
          <Input label="URL peta" value={(p.mapUrl as string) ?? ''} onChange={(e) => onPatch({ mapUrl: e.target.value || undefined })} />
        </>
      ) : null}

      {block.type === 'contactForm' ? (
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 14 }}>Tanyakan tipe yang diminati</span>
          <input
            type="checkbox"
            checked={(p.askHouseType as boolean) ?? true}
            onChange={(e) => onPatch({ askHouseType: e.target.checked })}
          />
        </label>
      ) : null}

      {block.type === 'specs' || block.type === 'facilities' ? (
        <p className="lw-caption" style={{ color: 'var(--sage)' }}>
          Isi blok ini diturunkan otomatis dari data project dan tipe rumah. Ubah datanya di halaman detail project.
        </p>
      ) : null}

      {block.type === 'floorPlans' ? (
        <p className="lw-caption" style={{ color: 'var(--sage)' }}>
          Menampilkan denah yang sudah diunggah pada setiap tipe rumah.
        </p>
      ) : null}
    </div>
  );
}

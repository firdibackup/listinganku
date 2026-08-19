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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="lw-caption" style={{ color: 'var(--evergreen)' }}>Akses lokasi</span>
            {(((p.access as { time: string; place: string }[]) ?? [])).map((row, i) => {
              const access = () => [...((p.access as { time: string; place: string }[]) ?? [])];
              return (
                <div key={i} className="ed__fieldrow">
                  <Input label="Waktu" value={row.time} onChange={(e) => { const a = access(); a[i] = { ...a[i], time: e.target.value }; onPatch({ access: a }); }} />
                  <Input label="Tempat" value={row.place} onChange={(e) => { const a = access(); a[i] = { ...a[i], place: e.target.value }; onPatch({ access: a }); }} />
                  <button type="button" className="ds-btn ds-btn--link ds-btn--sm" aria-label={`Hapus akses ${i + 1}`} onClick={() => onPatch({ access: access().filter((_, j) => j !== i) })}>Hapus</button>
                </div>
              );
            })}
            <button type="button" className="ds-btn ds-btn--link ds-btn--sm" onClick={() => onPatch({ access: [...(((p.access as { time: string; place: string }[]) ?? [])), { time: '', place: '' }] })}>
              Tambah akses
            </button>
          </div>
        </>
      ) : null}

      {block.type === 'pricePromo' ? (
        <>
          <Input label="DP" value={(p.dpText as string) ?? ''} hint="Contoh: 10% atau Rp 200 jt." onChange={(e) => onPatch({ dpText: e.target.value || undefined })} />
          <Input label="Cicilan" value={(p.installmentText as string) ?? ''} hint="Contoh: Rp 18 jt/bln." onChange={(e) => onPatch({ installmentText: e.target.value || undefined })} />
          <Input
            label="Promo" textarea rows={4} hint="Satu promo per baris."
            value={(((p.promos as string[]) ?? []).join('\n'))}
            onChange={(e) => { const promos = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean); onPatch({ promos: promos.length ? promos : undefined }); }}
          />
          <Input label="Catatan" value={(p.note as string) ?? ''} onChange={(e) => onPatch({ note: e.target.value || undefined })} />
        </>
      ) : null}

      {block.type === 'developer' ? (
        <>
          <Input label="Tentang developer" textarea rows={3} value={(p.about as string) ?? ''} onChange={(e) => onPatch({ about: e.target.value || undefined })} />
          <span className="lw-caption" style={{ color: 'var(--evergreen)' }}>Statistik</span>
          {(((p.stats as { value: string; label: string }[]) ?? [])).map((row, i) => {
            const stats = () => [...((p.stats as { value: string; label: string }[]) ?? [])];
            return (
              <div key={i} className="ed__fieldrow">
                <Input label="Angka" value={row.value} onChange={(e) => { const s = stats(); s[i] = { ...s[i], value: e.target.value }; onPatch({ stats: s }); }} />
                <Input label="Label" value={row.label} onChange={(e) => { const s = stats(); s[i] = { ...s[i], label: e.target.value }; onPatch({ stats: s }); }} />
                <button type="button" className="ds-btn ds-btn--link ds-btn--sm" aria-label={`Hapus statistik ${i + 1}`} onClick={() => onPatch({ stats: stats().filter((_, j) => j !== i) })}>Hapus</button>
              </div>
            );
          })}
          <button type="button" className="ds-btn ds-btn--link ds-btn--sm" onClick={() => onPatch({ stats: [...(((p.stats as { value: string; label: string }[]) ?? [])), { value: '', label: '' }] })}>
            Tambah statistik
          </button>
        </>
      ) : null}

      {block.type === 'testimonials' ? (
        <>
          <p className="lw-caption" style={{ color: 'var(--sage)' }}>
            Testimoni tidak pernah diisi AI — ketik kutipan nyata dari penghuni.
          </p>
          {(((p.items as { quote: string; name: string; unit: string }[]) ?? [])).map((row, i) => {
            const items = () => [...((p.items as { quote: string; name: string; unit: string }[]) ?? [])];
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: i ? '1px solid var(--stone)' : undefined, paddingTop: i ? 10 : 0 }}>
                <Input label={`Kutipan ${i + 1}`} textarea rows={2} value={row.quote} onChange={(e) => { const it = items(); it[i] = { ...it[i], quote: e.target.value }; onPatch({ items: it }); }} />
                <div className="ed__fieldrow">
                  <Input label="Nama" value={row.name} onChange={(e) => { const it = items(); it[i] = { ...it[i], name: e.target.value }; onPatch({ items: it }); }} />
                  <Input label="Tipe unit" value={row.unit} onChange={(e) => { const it = items(); it[i] = { ...it[i], unit: e.target.value }; onPatch({ items: it }); }} />
                </div>
                <button type="button" className="ds-btn ds-btn--link ds-btn--sm" style={{ alignSelf: 'flex-start' }} aria-label={`Hapus testimoni ${i + 1}`} onClick={() => onPatch({ items: items().filter((_, j) => j !== i) })}>Hapus</button>
              </div>
            );
          })}
          <button type="button" className="ds-btn ds-btn--link ds-btn--sm" onClick={() => onPatch({ items: [...(((p.items as { quote: string; name: string; unit: string }[]) ?? [])), { quote: '', name: '', unit: '' }] })}>
            Tambah testimoni
          </button>
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

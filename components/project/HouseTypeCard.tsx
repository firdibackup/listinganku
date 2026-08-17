import { Card } from '@/components/ds';
import { formatArea, formatRupiahShort } from '@/lib/format';
import type { HouseType, Media } from '@/lib/data/types';

export interface HouseTypeCardProps {
  houseType: HouseType;
  media: Media[];
  onClick: () => void;
}

export function HouseTypeCard({ houseType, media, onClick }: HouseTypeCardProps) {
  const photos = media.filter((m) => m.type === 'photo');
  const plan = media.find((m) => m.type === 'floor_plan');
  const cover = photos.find((m) => m.isPrimary) ?? photos[0];

  return (
    // Interaktivitas (reset tombol, hover, press) hidup di elemen luar; Card di
    // dalamnya cuma dipakai untuk chrome (bg/border/radius) — pola yang sama
    // dengan components/dashboard/ProjectCard.tsx, supaya token warnanya ikut
    // Card (--surface-card/--border-default), bukan --white/--ash yang
    // di-hardcode terpisah dan bisa melenceng begitu tone Card berubah.
    <button type="button" className="pj__type" onClick={onClick}>
      <Card padded={false} className="pj__type-card">
        <div className="pj__typethumb">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : null}
        </div>
        <div style={{ padding: '14px 16px' }}>
          <p className="lw-label">{houseType.name}</p>
          <p className="lw-label" style={{ marginTop: 5, color: 'var(--evergreen)' }}>
            {formatRupiahShort(houseType.price)}
          </p>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--sage)' }}>
            LT {formatArea(houseType.landArea)} · LB {formatArea(houseType.buildingArea)} · {houseType.bedrooms} KT
          </p>
          <p className="lw-label-sm" style={{ marginTop: 8, color: 'var(--sage)' }}>
            {photos.length} foto{plan ? ' · denah' : ''}
          </p>
        </div>
      </Card>
    </button>
  );
}

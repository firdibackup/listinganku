'use client';

import { useState } from 'react';
import type { ResolvedBlock } from '../../resolve';
import type { ChromeProps } from '../index';
import { formatArea, formatRupiahShort } from '@/lib/format';
import { normalizeIndonesianPhone } from '@/lib/phone';
import { WhatsAppLink } from '@/components/landing/WhatsAppLink';
import { ContactForm } from '@/components/landing/ContactForm';
import { Img, Ph, initials } from '../shared/parts';
import { gallerySlots, planSlots } from '../slots';

/**
 * 06 Arsitektural Beton — ditranskrip dari
 * `design/project/06 Arsitektural Beton.dc.html`.
 *
 * Ciri yang harus bertahan: abu beton, Space Grotesk + Space Mono, garis rambut
 * hitam yang membagi halaman seperti gambar kerja, tombol dalam [ kurung siku ],
 * label section "01 /", dan tipe unit sebagai LEMBAR SPESIFIKASI — baris
 * kunci-nilai, bukan kartu.
 */
export function Header({ project }: ChromeProps) {
  return (
    <header className="lp-ar-header">
      <span className="lp-ar-header__name">{project.name}</span>
      <span className="lp-ar-header__meta">{project.developer}</span>
    </header>
  );
}

export function Hero({ block }: { block: Extract<ResolvedBlock, { type: 'hero' }> }) {
  const rows = [
    block.location ? { k: 'Lokasi', v: block.location } : null,
    block.priceFrom !== null ? { k: 'Harga mulai', v: formatRupiahShort(block.priceFrom) } : null,
    block.badges.length ? { k: 'Catatan', v: block.badges.join(' · ') } : null,
  ].filter((r): r is { k: string; v: string } => r !== null);

  return (
    <>
      <section className="lp-ar-hero">
        <p className="lp-ar-mono lp-ar-hero__meta">
          Project / {block.location || 'Kawasan'} / {new Date().getFullYear()}
        </p>
        <h1 className="lp-ar-hero__title">{block.title}</h1>
        {block.subtitle ? <p className="lp-ar-hero__sub">{block.subtitle}</p> : null}
      </section>
      <div className="lp-ar-heromedia">
        <Img media={block.image} alt="Foto fasade utama" />
      </div>
      <dl className="lp-ar-rows">
        {rows.map((r) => (
          <div key={r.k} className="lp-ar-row">
            <dt>{r.k}</dt>
            <dd>{r.v}</dd>
          </div>
        ))}
      </dl>
      <div className="lp-ar-actions">
        <WhatsAppLink
          projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
          className="lp-ar-btn lp-ar-btn--solid"
        >
          [ Hubungi marketing ]
        </WhatsAppLink>
        <a href="#unit" className="lp-ar-btn lp-ar-btn--line">[ Lihat unit ]</a>
      </div>
    </>
  );
}

export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-ar-sec">
      <p className="lp-ar-mono lp-ar-tag">Kenapa proyek ini</p>
      <ol className="lp-ar-usp">
        {block.items.map((item, i) => (
          <li key={item.title} className="lp-ar-usp__row">
            <span className="lp-ar-mono lp-ar-usp__no">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className="lp-ar-usp__title">{item.title}</span>
              {item.desc ? <span className="lp-ar-usp__desc">{item.desc}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function HouseTypes({ block }: { block: Extract<ResolvedBlock, { type: 'houseTypes' }> }) {
  const [active, setActive] = useState(0);
  if (block.houseTypes.length === 0) return null;
  const current = block.houseTypes[Math.min(active, block.houseTypes.length - 1)];
  const specs = [
    { k: 'Luas tanah', v: formatArea(current.landArea) },
    { k: 'Luas bangunan', v: formatArea(current.buildingArea) },
    { k: 'Kamar tidur', v: String(current.bedrooms) },
    { k: 'Kamar mandi', v: String(current.bathrooms) },
    { k: 'Carport', v: String(current.carport) },
    { k: 'Harga', v: formatRupiahShort(current.price) },
  ];
  return (
    <section className="lp-ar-sec" id="unit">
      <p className="lp-ar-mono lp-ar-tag">Tipe unit</p>
      <h2 className="lp-ar-h2">Lembar spesifikasi</h2>
      <div className="lp-ar-tabs" role="tablist" aria-label="Tipe unit">
        {block.houseTypes.map((h, i) => (
          <button
            key={h.id} type="button" role="tab" aria-selected={i === active}
            className="lp-ar-tab" onClick={() => setActive(i)}
          >
            {h.name}
          </button>
        ))}
      </div>
      <div className="lp-ar-sheet" id={current.slug}>
        <div className="lp-ar-sheet__media">
          <Img media={current.floorPlan ?? current.primaryPhoto} alt={`Denah 2D · Type ${current.name}`} />
        </div>
        <dl className="lp-ar-rows lp-ar-rows--flush">
          {specs.map((s) => (
            <div key={s.k} className="lp-ar-row">
              <dt>{s.k}</dt>
              <dd>{s.v}</dd>
            </div>
          ))}
        </dl>
        {current.shortDescription ? <p className="lp-ar-sheet__note">{current.shortDescription}</p> : null}
      </div>
    </section>
  );
}

export function Specs({ block }: { block: Extract<ResolvedBlock, { type: 'specs' }> }) {
  if (block.houseTypes.length === 0) return null;
  const rows: { label: string; get: (h: (typeof block.houseTypes)[number]) => string }[] = [
    { label: 'Harga', get: (h) => formatRupiahShort(h.price) },
    { label: 'Luas tanah', get: (h) => formatArea(h.landArea) },
    { label: 'Luas bangunan', get: (h) => formatArea(h.buildingArea) },
    { label: 'Kamar tidur', get: (h) => String(h.bedrooms) },
    { label: 'Kamar mandi', get: (h) => String(h.bathrooms) },
    { label: 'Carport', get: (h) => String(h.carport) },
  ];
  return (
    <section className="lp-ar-sec">
      <p className="lp-ar-mono lp-ar-tag">Perbandingan</p>
      <div className="lp-ar-scroll">
        <table className="lp-ar-table">
          <thead>
            <tr>
              <th scope="col">Spesifikasi</th>
              {block.houseTypes.map((h) => <th key={h.id} scope="col">{h.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {block.houseTypes.map((h) => <td key={h.id}>{row.get(h)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function FloorPlans({ block }: { block: Extract<ResolvedBlock, { type: 'floorPlans' }> }) {
  const slots = planSlots(block);
  if (!block.masterplan && slots.length === 0) return null;
  return (
    <section className="lp-ar-sec">
      <p className="lp-ar-mono lp-ar-tag">Masterplan</p>
      <h2 className="lp-ar-h2">Tata kawasan</h2>
      <div className="lp-ar-master">
        <div className="lp-ar-master__grid" aria-hidden />
        <Img media={block.masterplan} alt="Site plan kawasan" />
      </div>
      {block.legend.length ? (
        <ul className="lp-ar-legend">
          {block.legend.map((name, i) => (
            <li key={name} className="lp-ar-legend__row" data-slot={i % 4}>
              <span className="lp-ar-legend__name">
                <span className="lp-ar-legend__dot" aria-hidden />{name}
              </span>
              <span className="lp-ar-legend__qty">{String(i + 1).padStart(2, '0')}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function Location({ block }: { block: Extract<ResolvedBlock, { type: 'location' }> }) {
  return (
    <section className="lp-ar-sec" id="lokasi">
      <p className="lp-ar-mono lp-ar-tag">Lokasi</p>
      <h2 className="lp-ar-h2">Jarak tempuh</h2>
      {block.address ? <p className="lp-ar-mono lp-ar-addr">{block.address}</p> : null}
      <div className="lp-ar-map">
        {block.mapUrl ? (
          <iframe src={block.mapUrl} title={`Peta ${block.address || 'lokasi'}`} loading="lazy" />
        ) : (
          <>
            <div className="lp-ar-map__grid" aria-hidden />
            <div className="lp-ar-map__pin" aria-hidden />
            <span className="lp-ar-mono lp-ar-map__label">Peta lokasi</span>
          </>
        )}
      </div>
      <dl className="lp-ar-rows lp-ar-rows--flush">
        {block.access.map((a, i) => (
          <div key={`${a.place}-${i}`} className="lp-ar-row">
            <dt>{a.place}</dt>
            <dd>{a.time}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Facilities({ block }: { block: Extract<ResolvedBlock, { type: 'facilities' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-ar-sec">
      <p className="lp-ar-mono lp-ar-tag">Fasilitas</p>
      <h2 className="lp-ar-h2">Program kawasan</h2>
      <div className="lp-ar-facgrid">
        {block.items.map((f) => (
          <div key={f.name} className="lp-ar-fac">
            <div className="lp-ar-fac__media"><Ph label={`Foto ${f.name}`} /></div>
            <div className="lp-ar-fac__body">
              <div className="lp-ar-fac__name">{f.name}</div>
              {f.desc ? <div className="lp-ar-mono lp-ar-fac__desc">{f.desc}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Gallery({ block }: { block: Extract<ResolvedBlock, { type: 'gallery' }> }) {
  const slots = gallerySlots(block);
  if (slots.length === 0) return null;
  return (
    <section className="lp-ar-sec">
      <p className="lp-ar-mono lp-ar-tag">Dokumentasi</p>
      <div className="lp-ar-doc">
        {slots.map((slot, i) => (
          <figure key={slot.key} className="lp-ar-doc__cell">
            <Img media={slot.media} alt={slot.caption} />
            <figcaption className="lp-ar-mono lp-ar-doc__cap">
              {String(i + 1).padStart(2, '0')} · {slot.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function PricePromo({ block }: { block: Extract<ResolvedBlock, { type: 'pricePromo' }> }) {
  const empty = block.priceFrom === null && !block.dpText && !block.installmentText
    && block.promos.length === 0 && !block.note;
  if (empty) return null;
  const rows = [
    block.priceFrom !== null ? { k: 'Harga mulai', v: formatRupiahShort(block.priceFrom) } : null,
    block.dpText ? { k: 'DP mulai', v: block.dpText } : null,
    block.installmentText ? { k: 'Cicilan mulai', v: block.installmentText } : null,
  ].filter((r): r is { k: string; v: string } => r !== null);
  return (
    <section className="lp-ar-sec lp-ar-sec--invert">
      <p className="lp-ar-mono lp-ar-tag lp-ar-tag--invert">Harga &amp; promo</p>
      <h2 className="lp-ar-h2 lp-ar-h2--invert">Ketentuan pembelian</h2>
      <dl className="lp-ar-rows lp-ar-rows--invert">
        {rows.map((r) => (
          <div key={r.k} className="lp-ar-row">
            <dt>{r.k}</dt>
            <dd>{r.v}</dd>
          </div>
        ))}
      </dl>
      <ul className="lp-ar-promolist">
        {block.promos.map((p) => <li key={p}>{p}</li>)}
      </ul>
      {block.note ? <p className="lp-ar-mono lp-ar-promonote">{block.note}</p> : null}
    </section>
  );
}

export function Developer({ block }: { block: Extract<ResolvedBlock, { type: 'developer' }> }) {
  if (!block.name && !block.about && block.stats.length === 0) return null;
  return (
    <section className="lp-ar-sec">
      <p className="lp-ar-mono lp-ar-tag">Developer</p>
      {block.name ? <h2 className="lp-ar-h2">{block.name}</h2> : null}
      {block.about ? <p className="lp-ar-lead">{block.about}</p> : null}
      {block.stats.length ? (
        <dl className="lp-ar-rows lp-ar-rows--flush">
          {block.stats.map((s) => (
            <div key={s.label} className="lp-ar-row">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

export function Testimonials({ block }: { block: Extract<ResolvedBlock, { type: 'testimonials' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-ar-sec">
      <p className="lp-ar-mono lp-ar-tag">Testimoni</p>
      {block.items.map((t, i) => (
        <figure key={`${t.name}-${i}`} className="lp-ar-tst">
          <blockquote className="lp-ar-tst__quote">“{t.quote}”</blockquote>
          <figcaption className="lp-ar-mono lp-ar-tst__who">
            {t.name}{t.unit ? ` / ${t.unit}` : ''}
          </figcaption>
        </figure>
      ))}
    </section>
  );
}

export function Faq({ block }: { block: Extract<ResolvedBlock, { type: 'faq' }> }) {
  const [open, setOpen] = useState(0);
  if (block.items.length === 0) return null;
  return (
    <section className="lp-ar-sec">
      <p className="lp-ar-mono lp-ar-tag">Pertanyaan</p>
      <div className="lp-ar-faqlist">
        {block.items.map((item, i) => {
          const isOpen = i === open;
          return (
            <div key={item.q} className="lp-ar-faq">
              <button
                type="button" className="lp-ar-faq__q" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <span className="lp-ar-mono lp-ar-faq__mark" aria-hidden>{isOpen ? '[-]' : '[+]'}</span>
              </button>
              {isOpen ? <div className="lp-ar-faq__a">{item.a}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp-ar-sec" id="kontak">
      <p className="lp-ar-mono lp-ar-tag">Kontak</p>
      <h2 className="lp-ar-h2">Tim marketing</h2>
      <div className="lp-ar-agent">
        <span className="lp-ar-agent__avatar" aria-hidden>{initials(block.agentName)}</span>
        <div>
          <div className="lp-ar-agent__name">{block.agentName}</div>
          <div className="lp-ar-mono lp-ar-agent__role">Property Advisor</div>
        </div>
      </div>
      <div className="lp-ar-actions">
        <WhatsAppLink
          projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
          className="lp-ar-btn lp-ar-btn--solid"
        >
          [ WhatsApp ]
        </WhatsAppLink>
        <a href={`tel:${normalizeIndonesianPhone(block.waNumber)}`} className="lp-ar-btn lp-ar-btn--line">
          [ Telepon ]
        </a>
      </div>
    </section>
  );
}

export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  return (
    <section id="minta-info" className="lp-ar-sec" data-form-block={block.id}>
      <p className="lp-ar-mono lp-ar-tag">Formulir</p>
      <h2 className="lp-ar-h2">Minta informasi</h2>
      <div className="lp-ar-formcard">
        <ContactForm
          projectId={block.projectId}
          houseTypes={block.houseTypes}
          askHouseType={block.askHouseType}
        />
      </div>
    </section>
  );
}

export function Footer({ project, agent }: ChromeProps) {
  const year = new Date().getFullYear();
  const contact = [agent.whatsapp, agent.email].filter(Boolean).join(' · ');
  return (
    <footer className="lp-ar-footer">
      <div className="lp-ar-footer__name">{project.name}</div>
      <div className="lp-ar-mono lp-ar-footer__addr">
        {project.location ? <>{project.location}<br /></> : null}
        Dipasarkan oleh {agent.fullName}
        {contact ? <><br />{contact}</> : null}
      </div>
      <nav className="lp-ar-mono lp-ar-footer__links" aria-label="Navigasi footer">
        <a href="#unit">Tipe unit</a>
        <a href="#kontak">Kontak</a>
      </nav>
      <div className="lp-ar-mono lp-ar-footer__copy">© {year} {project.name}</div>
    </footer>
  );
}

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
 * 08 Klasik Navy — ditranskrip dari `design/project/08 Klasik Navy.dc.html`.
 *
 * Ciri yang harus bertahan: blok hero NAVY di atas halaman putih, Playfair
 * Display + Lato, komposisi RATA TENGAH dari atas sampai bawah, garis rambut
 * tipis sebagai pemisah, dan aksen emas hanya pada satu tombol utama.
 */
export function Header({ project }: ChromeProps) {
  return (
    <header className="lp-cn-header">
      <div className="lp-cn-header__name">{project.name}</div>
      {project.location ? <div className="lp-cn-header__meta">{project.location}</div> : null}
    </header>
  );
}

export function Hero({ block }: { block: Extract<ResolvedBlock, { type: 'hero' }> }) {
  return (
    <>
      <section className="lp-cn-hero">
        <span className="lp-cn-rule" aria-hidden />
        <h1 className="lp-cn-hero__title">{block.title}</h1>
        {block.location ? (
          <p className="lp-cn-hero__eyebrow">
            <span className="lp-cn-dash" aria-hidden />
            {block.location}
            <span className="lp-cn-dash" aria-hidden />
          </p>
        ) : null}
        {block.subtitle ? <p className="lp-cn-hero__sub">{block.subtitle}</p> : null}
        <div className="lp-cn-hero__media">
          <Img media={block.image} alt="Foto fasade utama" />
        </div>
        <div className="lp-cn-hero__actions">
          <WhatsAppLink
            projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
            className="lp-cn-btn lp-cn-btn--gold"
          >
            Hubungi marketing
          </WhatsAppLink>
          <a href="#unit" className="lp-cn-btn lp-cn-btn--ghost">Lihat unit</a>
        </div>
      </section>

      {block.priceFrom !== null || block.badges.length ? (
        <div className="lp-cn-priceband">
          <p className="lp-cn-label">Harga mulai</p>
          {block.priceFrom !== null ? (
            <p className="lp-cn-priceband__value">{formatRupiahShort(block.priceFrom)}</p>
          ) : null}
          {block.badges.length ? (
            <div className="lp-cn-tags">
              {block.badges.map((b) => <span key={b} className="lp-cn-tag">{b}</span>)}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-cn-sec">
      <p className="lp-cn-label">Kenapa proyek ini</p>
      <h2 className="lp-cn-h2">Nilai yang bertahan</h2>
      <div className="lp-cn-usplist">
        {block.items.map((item) => (
          <div key={item.title} className="lp-cn-usp">
            <div className="lp-cn-usp__title">{item.title}</div>
            {item.desc ? <div className="lp-cn-usp__desc">{item.desc}</div> : null}
          </div>
        ))}
      </div>
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
    <section className="lp-cn-sec lp-cn-sec--cream" id="unit">
      <p className="lp-cn-label">Tipe unit</p>
      <h2 className="lp-cn-h2">Tiga tipe kediaman</h2>
      <div className="lp-cn-tabs" role="tablist" aria-label="Tipe unit">
        {block.houseTypes.map((h, i) => (
          <button
            key={h.id} type="button" role="tab" aria-selected={i === active}
            className="lp-cn-tab" onClick={() => setActive(i)}
          >
            {h.name}
          </button>
        ))}
      </div>
      <article className="lp-cn-unit" id={current.slug}>
        <div className="lp-cn-unit__media">
          <Img media={current.primaryPhoto ?? current.floorPlan} alt={`Denah & render · ${current.name}`} />
        </div>
        <div className="lp-cn-unit__body">
          <h3 className="lp-cn-unit__name">Type {current.name}</h3>
          <p className="lp-cn-unit__price">Mulai {formatRupiahShort(current.price)}</p>
          <dl className="lp-cn-rows">
            {specs.map((s) => (
              <div key={s.k} className="lp-cn-row">
                <dt>{s.k}</dt>
                <dd>{s.v}</dd>
              </div>
            ))}
          </dl>
          {current.shortDescription ? <p className="lp-cn-unit__note">{current.shortDescription}</p> : null}
          <a href="#minta-info" className="lp-cn-btn lp-cn-btn--outline">Lihat detail unit</a>
        </div>
      </article>
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
    <section className="lp-cn-sec">
      <p className="lp-cn-label">Spesifikasi</p>
      <h2 className="lp-cn-h2">Perbandingan tipe</h2>
      <div className="lp-cn-scroll">
        <table className="lp-cn-table">
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

export function Facilities({ block }: { block: Extract<ResolvedBlock, { type: 'facilities' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-cn-sec">
      <p className="lp-cn-label">Fasilitas</p>
      <h2 className="lp-cn-h2">Fasilitas kawasan</h2>
      <div className="lp-cn-facstack">
        {block.items.map((f) => (
          <div key={f.name} className="lp-cn-fac">
            <div className="lp-cn-fac__media"><Ph label={`Foto ${f.name}`} /></div>
            <div className="lp-cn-fac__name">{f.name}</div>
            {f.desc ? <div className="lp-cn-fac__desc">{f.desc}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Location({ block }: { block: Extract<ResolvedBlock, { type: 'location' }> }) {
  return (
    <section className="lp-cn-sec lp-cn-sec--cream" id="lokasi">
      <p className="lp-cn-label">Lokasi</p>
      <h2 className="lp-cn-h2">Di jantung kawasan</h2>
      {block.address ? <p className="lp-cn-lead">{block.address}</p> : null}
      <div className="lp-cn-map">
        {block.mapUrl ? (
          <iframe src={block.mapUrl} title={`Peta ${block.address || 'lokasi'}`} loading="lazy" />
        ) : (
          <>
            <div className="lp-cn-map__grid" aria-hidden />
            <div className="lp-cn-map__pin" aria-hidden />
            <span className="lp-cn-map__label">Peta lokasi</span>
          </>
        )}
      </div>
      <dl className="lp-cn-rows lp-cn-rows--wide">
        {block.access.map((a, i) => (
          <div key={`${a.place}-${i}`} className="lp-cn-row">
            <dt>{a.place}</dt>
            <dd>{a.time}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function FloorPlans({ block }: { block: Extract<ResolvedBlock, { type: 'floorPlans' }> }) {
  const slots = planSlots(block);
  if (!block.masterplan && slots.length === 0) return null;
  return (
    <section className="lp-cn-sec">
      <p className="lp-cn-label">Masterplan</p>
      <h2 className="lp-cn-h2">Tata kawasan</h2>
      <div className="lp-cn-master">
        <Img media={block.masterplan} alt="Site plan kawasan" />
      </div>
      {block.legend.length ? (
        <ul className="lp-cn-legend">
          {block.legend.map((name, i) => (
            <li key={name} className="lp-cn-legend__item" data-slot={i % 4}>
              <span className="lp-cn-legend__dot" aria-hidden />{name}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function Gallery({ block }: { block: Extract<ResolvedBlock, { type: 'gallery' }> }) {
  const slots = gallerySlots(block);
  if (slots.length === 0) return null;
  return (
    <section className="lp-cn-sec">
      <p className="lp-cn-label">Galeri</p>
      <h2 className="lp-cn-h2">Suasana kawasan</h2>
      <div className="lp-cn-grid">
        {slots.map((slot, i) => (
          <figure key={slot.key} className="lp-cn-grid__cell" data-wide={i === 0}>
            <Img media={slot.media} alt={slot.caption} />
            <figcaption className="lp-cn-grid__cap">{slot.caption}</figcaption>
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
  return (
    <section className="lp-cn-navy">
      <p className="lp-cn-label lp-cn-label--invert">Harga &amp; promo</p>
      <h2 className="lp-cn-h2 lp-cn-h2--invert">Miliki hunian impian Anda</h2>
      {block.priceFrom !== null ? (
        <p className="lp-cn-navy__price">Mulai {formatRupiahShort(block.priceFrom)}</p>
      ) : null}
      {block.dpText || block.installmentText ? (
        <div className="lp-cn-navy__terms">
          {block.dpText ? (
            <div><div className="lp-cn-label lp-cn-label--invert">DP mulai</div><div className="lp-cn-navy__v">{block.dpText}</div></div>
          ) : null}
          {block.installmentText ? (
            <div><div className="lp-cn-label lp-cn-label--invert">Cicilan</div><div className="lp-cn-navy__v">{block.installmentText}</div></div>
          ) : null}
        </div>
      ) : null}
      <ul className="lp-cn-navy__list">
        {block.promos.map((p) => <li key={p}>{p}</li>)}
      </ul>
      {block.note ? <p className="lp-cn-navy__note">{block.note}</p> : null}
    </section>
  );
}

export function Testimonials({ block }: { block: Extract<ResolvedBlock, { type: 'testimonials' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-cn-sec">
      <p className="lp-cn-label">Testimoni</p>
      {block.items.map((t, i) => (
        <figure key={`${t.name}-${i}`} className="lp-cn-tst">
          <blockquote className="lp-cn-tst__quote">“{t.quote}”</blockquote>
          <figcaption className="lp-cn-tst__who">
            <span className="lp-cn-avatar" aria-hidden>{initials(t.name)}</span>
            <span className="lp-cn-tst__name">{t.name}</span>
            {t.unit ? <span className="lp-cn-tst__unit">{t.unit}</span> : null}
          </figcaption>
        </figure>
      ))}
    </section>
  );
}

export function Developer({ block }: { block: Extract<ResolvedBlock, { type: 'developer' }> }) {
  if (!block.name && !block.about && block.stats.length === 0) return null;
  return (
    <section className="lp-cn-sec lp-cn-sec--cream">
      <p className="lp-cn-label">Developer</p>
      {block.name ? <h2 className="lp-cn-h2">{block.name}</h2> : null}
      {block.about ? <p className="lp-cn-lead">{block.about}</p> : null}
      {block.stats.length ? (
        <div className="lp-cn-stats">
          {block.stats.map((s) => (
            <div key={s.label} className="lp-cn-stat">
              <div className="lp-cn-stat__v">{s.value}</div>
              <div className="lp-cn-stat__k">{s.label}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function Faq({ block }: { block: Extract<ResolvedBlock, { type: 'faq' }> }) {
  const [open, setOpen] = useState(0);
  if (block.items.length === 0) return null;
  return (
    <section className="lp-cn-sec">
      <p className="lp-cn-label">Pertanyaan umum</p>
      <div className="lp-cn-faqlist">
        {block.items.map((item, i) => {
          const isOpen = i === open;
          return (
            <div key={item.q} className="lp-cn-faq">
              <button
                type="button" className="lp-cn-faq__q" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <span className="lp-cn-faq__mark" aria-hidden>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen ? <div className="lp-cn-faq__a">{item.a}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp-cn-sec" id="kontak">
      <p className="lp-cn-label">Tim marketing</p>
      <h2 className="lp-cn-h2">Butuh informasi lebih lanjut?</h2>
      <div className="lp-cn-agent">
        <span className="lp-cn-avatar lp-cn-avatar--lg" aria-hidden>{initials(block.agentName)}</span>
        <div className="lp-cn-agent__name">{block.agentName}</div>
        <div className="lp-cn-agent__role">Property Advisor</div>
      </div>
      <div className="lp-cn-hero__actions">
        <WhatsAppLink
          projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
          className="lp-cn-btn lp-cn-btn--gold"
        >
          WhatsApp
        </WhatsAppLink>
        <a href={`tel:${normalizeIndonesianPhone(block.waNumber)}`} className="lp-cn-btn lp-cn-btn--outline">
          Telepon
        </a>
      </div>
    </section>
  );
}

export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  return (
    <section id="minta-info" className="lp-cn-sec lp-cn-sec--cream" data-form-block={block.id}>
      <p className="lp-cn-label">Minta info</p>
      <h2 className="lp-cn-h2">Tinggalkan kontak Anda</h2>
      <div className="lp-cn-formcard">
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
    <footer className="lp-cn-footer">
      <div className="lp-cn-footer__name">{project.name}</div>
      <div className="lp-cn-footer__addr">
        {project.location ? <>{project.location}<br /></> : null}
        Dipasarkan oleh {agent.fullName}
        {contact ? <><br />{contact}</> : null}
      </div>
      <nav className="lp-cn-footer__links" aria-label="Navigasi footer">
        <a href="#unit">Tipe Unit</a>
        <a href="#kontak">Kontak</a>
      </nav>
      <div className="lp-cn-footer__copy">© {year} {project.name}</div>
    </footer>
  );
}

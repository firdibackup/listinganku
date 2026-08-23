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
 * 01 Premium Gelap — ditranskrip dari `design/project/01 Premium Gelap.dc.html`.
 *
 * Ciri yang harus bertahan: latar hampir hitam, aksen emas, serif ringan untuk
 * judul, sudut nyaris siku (2px), pembatas berupa garis tipis alih-alih kartu,
 * dan eyebrow bernomor di setiap section. Nomornya dari CSS counter, bukan
 * ditulis di JSX — agen boleh mengurutkan ulang blok dan nomornya tetap runut.
 */
export function Header({ project }: ChromeProps) {
  return (
    <header className="lp-pd-header">
      <span className="lp-pd-header__name">{project.name}</span>
      {project.location ? <span className="lp-pd-header__loc">{project.location}</span> : null}
    </header>
  );
}

export function Hero({ block }: { block: Extract<ResolvedBlock, { type: 'hero' }> }) {
  return (
    <>
      <section className="lp-pd-hero">
        <div className="lp-pd-hero__media">
          <Img media={block.image} alt="Foto fasade malam" />
        </div>
        <div className="lp-pd-hero__scrim" />
        <div className="lp-pd-hero__body">
          {block.badges.length ? (
            <div className="lp-pd-hero__badges">
              {block.badges.map((b) => <span key={b} className="lp-pd-badge">{b}</span>)}
            </div>
          ) : null}
          <h1 className="lp-pd-hero__title">{block.title}</h1>
          {block.subtitle ? <p className="lp-pd-hero__sub">{block.subtitle}</p> : null}
          {block.priceFrom !== null ? (
            <p className="lp-pd-hero__price">
              <span className="lp-pd-hero__price-label">Harga mulai</span>
              <span className="lp-pd-hero__price-value">{formatRupiahShort(block.priceFrom)}</span>
            </p>
          ) : null}
        </div>
      </section>

      <div className="lp-pd-herocta">
        <WhatsAppLink
          projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
          className="lp-pd-btn lp-pd-btn--gold"
        >
          Hubungi Marketing
        </WhatsAppLink>
        <a href="#unit" className="lp-pd-btn lp-pd-btn--line">Lihat Unit</a>
      </div>
    </>
  );
}

export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-pd-sec">
      <p className="lp-pd-eyebrow">Kenapa proyek ini</p>
      <ol className="lp-pd-usp">
        {block.items.map((item, i) => (
          <li key={item.title} className="lp-pd-usp__row">
            <span className="lp-pd-usp__no">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className="lp-pd-usp__title">{item.title}</span>
              {item.desc ? <span className="lp-pd-usp__desc">{item.desc}</span> : null}
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
    { k: 'Bangunan', v: formatArea(current.buildingArea) },
    { k: 'Kamar tidur', v: String(current.bedrooms) },
    { k: 'Kamar mandi', v: String(current.bathrooms) },
    { k: 'Carport', v: String(current.carport) },
    { k: 'Harga', v: formatRupiahShort(current.price) },
  ];
  return (
    <section className="lp-pd-sec" id="unit">
      <p className="lp-pd-eyebrow">Tipe unit</p>
      <h2 className="lp-pd-h2">Tiga tipe, satu standar</h2>
      <div className="lp-pd-tabs" role="tablist" aria-label="Tipe unit">
        {block.houseTypes.map((h, i) => (
          <button
            key={h.id} type="button" role="tab" aria-selected={i === active}
            className="lp-pd-tab" onClick={() => setActive(i)}
          >
            {h.name}
          </button>
        ))}
      </div>
      <article className="lp-pd-unit" id={current.slug}>
        <div className="lp-pd-unit__media">
          <Img media={current.primaryPhoto} alt={`Render 3D — ${current.name}`} />
        </div>
        <div className="lp-pd-unit__body">
          <div className="lp-pd-unit__head">
            <h3 className="lp-pd-unit__name">Type {current.name}</h3>
            <span className="lp-pd-unit__price">{formatRupiahShort(current.price)}</span>
          </div>
          <div className="lp-pd-specgrid">
            {specs.map((s) => (
              <div key={s.k} className="lp-pd-spec">
                <div className="lp-pd-spec__k">{s.k}</div>
                <div className="lp-pd-spec__v">{s.v}</div>
              </div>
            ))}
          </div>
          {current.shortDescription ? <p className="lp-pd-unit__note">{current.shortDescription}</p> : null}
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
    <section className="lp-pd-sec">
      <p className="lp-pd-eyebrow">Spesifikasi</p>
      <h2 className="lp-pd-h2">Perbandingan tipe</h2>
      <div className="lp-pd-scroll">
        <table className="lp-pd-table">
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
    <section className="lp-pd-sec lp-pd-sec--bleed">
      <div className="lp-pd-sec__head">
        <p className="lp-pd-eyebrow">Fasilitas</p>
        <h2 className="lp-pd-h2">Kawasan yang hidup</h2>
      </div>
      <div className="lp-pd-facrail">
        {block.items.map((f) => (
          <div key={f.name} className="lp-pd-fac">
            <div className="lp-pd-fac__media"><Ph label={`Foto ${f.name}`} /></div>
            <div className="lp-pd-fac__name">{f.name}</div>
            {f.desc ? <div className="lp-pd-fac__desc">{f.desc}</div> : null}
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
    <section className="lp-pd-sec">
      <p className="lp-pd-eyebrow">Galeri</p>
      <h2 className="lp-pd-h2">Lihat lebih dekat</h2>
      <div className="lp-pd-mosaic">
        {slots.map((slot, i) => (
          <div key={slot.key} className="lp-pd-mosaic__cell" data-wide={i % 3 === 0}>
            <Img media={slot.media} alt={slot.caption} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function Location({ block }: { block: Extract<ResolvedBlock, { type: 'location' }> }) {
  return (
    <section className="lp-pd-sec" id="lokasi">
      <p className="lp-pd-eyebrow">Lokasi</p>
      <h2 className="lp-pd-h2">Terhubung ke mana saja</h2>
      {block.address ? <p className="lp-pd-lead">{block.address}</p> : null}
      <div className="lp-pd-map">
        {block.mapUrl ? (
          <iframe src={block.mapUrl} title={`Peta ${block.address || 'lokasi'}`} loading="lazy" />
        ) : (
          <>
            <div className="lp-pd-map__grid" aria-hidden />
            <div className="lp-pd-map__pin" aria-hidden />
            <span className="lp-pd-map__label">Peta lokasi</span>
          </>
        )}
      </div>
      {block.access.length ? (
        <div className="lp-pd-access">
          {block.access.map((a, i) => (
            <div key={`${a.place}-${i}`} className="lp-pd-access__cell">
              <div className="lp-pd-access__time">{a.time}</div>
              <div className="lp-pd-access__place">{a.place}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function FloorPlans({ block }: { block: Extract<ResolvedBlock, { type: 'floorPlans' }> }) {
  const slots = planSlots(block);
  if (!block.masterplan && slots.length === 0) return null;
  return (
    <section className="lp-pd-sec">
      <p className="lp-pd-eyebrow">Masterplan</p>
      <h2 className="lp-pd-h2">Tata kawasan</h2>
      <div className="lp-pd-master">
        <Img media={block.masterplan} alt="Site plan kawasan" />
      </div>
      {block.legend.length ? (
        <ul className="lp-pd-legend">
          {block.legend.map((name, i) => (
            <li key={name} className="lp-pd-legend__item" data-slot={i % 4}>
              <span className="lp-pd-legend__dot" aria-hidden />{name}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="lp-pd-plans">
        {slots.map((slot) => (
          <div key={slot.key} className="lp-pd-plan">
            <div className="lp-pd-plan__media">
              <Img media={slot.media} alt={`Denah 2D — ${slot.name}`} />
            </div>
            <div className="lp-pd-plan__name">Denah {slot.name}</div>
          </div>
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
    <section className="lp-pd-promo">
      <p className="lp-pd-eyebrow">Harga &amp; promo</p>
      <h2 className="lp-pd-h2">Miliki hunian impian Anda</h2>
      {block.priceFrom !== null ? (
        <p className="lp-pd-promo__price">Mulai {formatRupiahShort(block.priceFrom)}</p>
      ) : null}
      {block.dpText || block.installmentText ? (
        <div className="lp-pd-promo__terms">
          {block.dpText ? (
            <div><div className="lp-pd-promo__k">DP mulai</div><div className="lp-pd-promo__v">{block.dpText}</div></div>
          ) : null}
          {block.installmentText ? (
            <div><div className="lp-pd-promo__k">Cicilan mulai</div><div className="lp-pd-promo__v">{block.installmentText}</div></div>
          ) : null}
        </div>
      ) : null}
      {block.promos.length ? (
        <ul className="lp-pd-promo__list">
          {block.promos.map((p) => <li key={p}>{p}</li>)}
        </ul>
      ) : null}
      {block.note ? <p className="lp-pd-promo__note">{block.note}</p> : null}
    </section>
  );
}

export function Testimonials({ block }: { block: Extract<ResolvedBlock, { type: 'testimonials' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-pd-sec">
      <p className="lp-pd-eyebrow">Testimoni</p>
      {block.items.map((t, i) => (
        <figure key={`${t.name}-${i}`} className="lp-pd-tst">
          <blockquote className="lp-pd-tst__quote">“{t.quote}”</blockquote>
          <figcaption className="lp-pd-tst__who">
            <span className="lp-pd-tst__avatar" aria-hidden>{initials(t.name)}</span>
            <span>
              <span className="lp-pd-tst__name">{t.name}</span>
              {t.unit ? <span className="lp-pd-tst__unit">{t.unit}</span> : null}
            </span>
          </figcaption>
        </figure>
      ))}
    </section>
  );
}

export function Developer({ block }: { block: Extract<ResolvedBlock, { type: 'developer' }> }) {
  if (!block.name && !block.about && block.stats.length === 0) return null;
  return (
    <section className="lp-pd-sec">
      <p className="lp-pd-eyebrow">Developer</p>
      {block.name ? <h2 className="lp-pd-h2">{block.name}</h2> : null}
      {block.about ? <p className="lp-pd-lead">{block.about}</p> : null}
      {block.stats.length ? (
        <div className="lp-pd-stats">
          {block.stats.map((s) => (
            <div key={s.label} className="lp-pd-stat">
              <div className="lp-pd-stat__v">{s.value}</div>
              <div className="lp-pd-stat__k">{s.label}</div>
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
    <section className="lp-pd-sec">
      <p className="lp-pd-eyebrow">FAQ</p>
      <div className="lp-pd-faq">
        {block.items.map((item, i) => {
          const isOpen = i === open;
          return (
            <div key={item.q} className="lp-pd-faq__item">
              <button
                type="button" className="lp-pd-faq__q" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <span className="lp-pd-faq__mark" aria-hidden>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen ? <div className="lp-pd-faq__a">{item.a}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp-pd-sec" id="kontak">
      <p className="lp-pd-eyebrow">Tim marketing</p>
      <h2 className="lp-pd-h2">Butuh informasi lebih lanjut?</h2>
      <p className="lp-pd-lead">Hubungi property consultant kami untuk ketersediaan unit dan simulasi KPR.</p>
      <div className="lp-pd-agent">
        <span className="lp-pd-agent__avatar" aria-hidden>{initials(block.agentName)}</span>
        <div className="lp-pd-agent__body">
          <div className="lp-pd-agent__name">{block.agentName}</div>
          <div className="lp-pd-agent__role">Property Advisor</div>
          <div className="lp-pd-agent__actions">
            <WhatsAppLink
              projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
              className="lp-pd-chip lp-pd-chip--gold"
            >
              WhatsApp
            </WhatsAppLink>
            <a href={`tel:${normalizeIndonesianPhone(block.waNumber)}`} className="lp-pd-chip">Telepon</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  return (
    <section id="minta-info" className="lp-pd-contact" data-form-block={block.id}>
      <h2 className="lp-pd-contact__title">Siap menemukan hunian impian Anda?</h2>
      <p className="lp-pd-contact__lead">
        Jadwalkan survey lokasi dan dapatkan informasi unit terbaru dari tim marketing kami.
      </p>
      <div className="lp-pd-contact__card">
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
    <footer className="lp-pd-footer">
      <div className="lp-pd-footer__name">{project.name}</div>
      <div className="lp-pd-footer__addr">
        {project.location ? <>{project.location}<br /></> : null}
        Dipasarkan oleh {agent.fullName}
        {contact ? <><br />{contact}</> : null}
      </div>
      <nav className="lp-pd-footer__links" aria-label="Navigasi footer">
        <a href="#unit">Tipe Unit</a>
        <a href="#kontak">Kontak</a>
      </nav>
      <div className="lp-pd-footer__copy">© {year} {project.name}</div>
    </footer>
  );
}

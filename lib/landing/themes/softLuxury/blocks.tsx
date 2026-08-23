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
 * 04 Soft Luxury Beige — ditranskrip dari
 * `design/project/04 Soft Luxury Beige.dc.html`.
 *
 * Ciri yang harus bertahan: krem hangat, Marcellus untuk judul, sudut SANGAT
 * membulat (14–28px) dengan tombol pil, kartu putih berbayang lembut, hero
 * sebagai foto di dalam kartu membulat, dan tipe unit sebagai KARTU YANG
 * DIGESER — bukan tab.
 */
export function Header({ project }: ChromeProps) {
  return (
    <header className="lp-sl-header">
      <span className="lp-sl-header__name">{project.name}</span>
      <a href="#kontak" className="lp-sl-header__dot" aria-label="Ke bagian kontak">→</a>
    </header>
  );
}

export function Hero({ block }: { block: Extract<ResolvedBlock, { type: 'hero' }> }) {
  return (
    <>
      <section className="lp-sl-herowrap">
        <div className="lp-sl-hero">
          <Img media={block.image} alt="Foto fasade" />
          <div className="lp-sl-hero__cap">
            {block.location ? <p className="lp-sl-hero__kicker">{block.location}</p> : null}
            <h1 className="lp-sl-hero__title">{block.title}</h1>
          </div>
        </div>
      </section>

      <div className="lp-sl-intro">
        {block.subtitle ? <p className="lp-sl-intro__lead">{block.subtitle}</p> : null}
        <div className="lp-sl-card lp-sl-pricecard">
          <p className="lp-sl-label">Harga mulai</p>
          {block.priceFrom !== null ? (
            <p className="lp-sl-pricecard__value">{formatRupiahShort(block.priceFrom)}</p>
          ) : null}
          {block.badges.length ? (
            <div className="lp-sl-pills">
              {block.badges.map((b) => <span key={b} className="lp-sl-pill">{b}</span>)}
            </div>
          ) : null}
        </div>
        <div className="lp-sl-actions">
          <WhatsAppLink
            projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
            className="lp-sl-btn lp-sl-btn--dark"
          >
            Hubungi Marketing
          </WhatsAppLink>
          <a href="#unit" className="lp-sl-btn lp-sl-btn--line">Lihat Unit</a>
        </div>
      </div>
    </>
  );
}

export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-sl-sec">
      <p className="lp-sl-label">Kenapa proyek ini</p>
      <h2 className="lp-sl-h2">Enam alasan yang bertahan lama</h2>
      <div className="lp-sl-stack">
        {block.items.map((item) => (
          <div key={item.title} className="lp-sl-card lp-sl-usp">
            <div className="lp-sl-usp__title">{item.title}</div>
            {item.desc ? <div className="lp-sl-usp__desc">{item.desc}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function HouseTypes({ block }: { block: Extract<ResolvedBlock, { type: 'houseTypes' }> }) {
  if (block.houseTypes.length === 0) return null;
  return (
    <section className="lp-sl-sec lp-sl-sec--bleed" id="unit">
      <div className="lp-sl-sec__head">
        <p className="lp-sl-label">Tipe unit</p>
        <h2 className="lp-sl-h2">Pilih yang paling Anda butuhkan</h2>
      </div>
      <div className="lp-sl-unitrail">
        {block.houseTypes.map((h) => (
          <article key={h.id} id={h.slug} className="lp-sl-unit">
            <div className="lp-sl-unit__media">
              <Img media={h.primaryPhoto} alt={`Render · ${h.name}`} />
            </div>
            <div className="lp-sl-unit__body">
              <h3 className="lp-sl-unit__name">Type {h.name}</h3>
              <p className="lp-sl-unit__price">Mulai {formatRupiahShort(h.price)}</p>
              <dl className="lp-sl-unit__specs">
                {[
                  { k: 'Luas tanah', v: formatArea(h.landArea) },
                  { k: 'Bangunan', v: formatArea(h.buildingArea) },
                  { k: 'Kamar tidur', v: String(h.bedrooms) },
                  { k: 'Kamar mandi', v: String(h.bathrooms) },
                  { k: 'Carport', v: String(h.carport) },
                ].map((s) => (
                  <div key={s.k}>
                    <dt>{s.k}</dt>
                    <dd>{s.v}</dd>
                  </div>
                ))}
              </dl>
              <a href="#kontak" className="lp-sl-btn lp-sl-btn--line lp-sl-btn--sm">Lihat detail unit</a>
            </div>
          </article>
        ))}
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
    <section className="lp-sl-sec">
      <p className="lp-sl-label">Spesifikasi</p>
      <h2 className="lp-sl-h2">Perbandingan tipe</h2>
      <div className="lp-sl-card lp-sl-scroll">
        <table className="lp-sl-table">
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
    <section className="lp-sl-band lp-sl-band--top">
      <p className="lp-sl-label">Fasilitas</p>
      <h2 className="lp-sl-h2">Ruang bersama yang terawat</h2>
      <div className="lp-sl-stack lp-sl-stack--lg">
        {block.items.map((f) => (
          <div key={f.name} className="lp-sl-fac">
            <div className="lp-sl-fac__media"><Ph label={`Foto ${f.name}`} /></div>
            <div className="lp-sl-fac__body">
              <div className="lp-sl-fac__name">{f.name}</div>
              {f.desc ? <div className="lp-sl-fac__desc">{f.desc}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Location({ block }: { block: Extract<ResolvedBlock, { type: 'location' }> }) {
  return (
    <section className="lp-sl-band" id="lokasi">
      <p className="lp-sl-label">Lokasi</p>
      <h2 className="lp-sl-h2">Dekat dengan semuanya</h2>
      {block.address ? <p className="lp-sl-lead">{block.address}</p> : null}
      <div className="lp-sl-map">
        {block.mapUrl ? (
          <iframe src={block.mapUrl} title={`Peta ${block.address || 'lokasi'}`} loading="lazy" />
        ) : (
          <>
            <div className="lp-sl-map__grid" aria-hidden />
            <div className="lp-sl-map__pin" aria-hidden />
            <span className="lp-sl-map__label">Peta lokasi</span>
          </>
        )}
      </div>
      {block.access.length ? (
        <div className="lp-sl-accesspanel">
          {block.access.map((a, i) => (
            <div key={`${a.place}-${i}`} className="lp-sl-access">
              <span className="lp-sl-access__place">{a.place}</span>
              <span className="lp-sl-access__time">{a.time}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function Gallery({ block }: { block: Extract<ResolvedBlock, { type: 'gallery' }> }) {
  const slots = gallerySlots(block);
  if (slots.length === 0) return null;
  return (
    <section className="lp-sl-sec">
      <p className="lp-sl-label">Galeri</p>
      <h2 className="lp-sl-h2">Suasana kawasan</h2>
      <div className="lp-sl-mosaic">
        {slots.map((slot, i) => (
          <figure key={slot.key} className="lp-sl-mosaic__cell" data-wide={i % 3 === 0}>
            <Img media={slot.media} alt={slot.caption} />
            <figcaption className="lp-sl-mosaic__cap">{slot.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function FloorPlans({ block }: { block: Extract<ResolvedBlock, { type: 'floorPlans' }> }) {
  const slots = planSlots(block);
  if (!block.masterplan && slots.length === 0) return null;
  return (
    <section className="lp-sl-sec">
      <p className="lp-sl-label">Masterplan</p>
      <h2 className="lp-sl-h2">Tata kawasan</h2>
      <div className="lp-sl-master">
        <Img media={block.masterplan} alt="Site plan kawasan" />
      </div>
      {block.legend.length ? (
        <ul className="lp-sl-legend">
          {block.legend.map((name, i) => (
            <li key={name} className="lp-sl-legend__item" data-slot={i % 4}>
              <span className="lp-sl-legend__dot" aria-hidden />{name}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function PricePromo({ block }: { block: Extract<ResolvedBlock, { type: 'pricePromo' }> }) {
  const empty = block.priceFrom === null && !block.dpText && !block.installmentText
    && block.promos.length === 0 && !block.note;
  if (empty) return null;
  return (
    <section className="lp-sl-promowrap">
      <div className="lp-sl-promo">
        <p className="lp-sl-label lp-sl-label--invert">Harga &amp; promo</p>
        <h2 className="lp-sl-h2 lp-sl-h2--invert">Miliki hunian impian Anda</h2>
        {block.priceFrom !== null ? (
          <p className="lp-sl-promo__price">Mulai {formatRupiahShort(block.priceFrom)}</p>
        ) : null}
        {block.dpText || block.installmentText ? (
          <div className="lp-sl-promo__terms">
            {block.dpText ? (
              <div><div className="lp-sl-promo__k">DP mulai</div><div className="lp-sl-promo__v">{block.dpText}</div></div>
            ) : null}
            {block.installmentText ? (
              <div><div className="lp-sl-promo__k">Cicilan mulai</div><div className="lp-sl-promo__v">{block.installmentText}</div></div>
            ) : null}
          </div>
        ) : null}
        <ul className="lp-sl-promo__list">
          {block.promos.map((p) => <li key={p}>{p}</li>)}
        </ul>
        {block.note ? <p className="lp-sl-promo__note">{block.note}</p> : null}
      </div>
    </section>
  );
}

export function Testimonials({ block }: { block: Extract<ResolvedBlock, { type: 'testimonials' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-sl-sec">
      <p className="lp-sl-label">Testimoni</p>
      <div className="lp-sl-stack">
        {block.items.map((t, i) => (
          <figure key={`${t.name}-${i}`} className="lp-sl-card lp-sl-tst">
            <blockquote className="lp-sl-tst__quote">“{t.quote}”</blockquote>
            <figcaption className="lp-sl-tst__who">
              <span className="lp-sl-avatar" aria-hidden>{initials(t.name)}</span>
              <span>
                <span className="lp-sl-tst__name">{t.name}</span>
                {t.unit ? <span className="lp-sl-tst__unit">{t.unit}</span> : null}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Developer({ block }: { block: Extract<ResolvedBlock, { type: 'developer' }> }) {
  if (!block.name && !block.about && block.stats.length === 0) return null;
  return (
    <section className="lp-sl-sec">
      <p className="lp-sl-label">Developer</p>
      {block.name ? <h2 className="lp-sl-h2 lp-sl-h2--sm">{block.name}</h2> : null}
      {block.about ? <p className="lp-sl-lead">{block.about}</p> : null}
      {block.stats.length ? (
        <div className="lp-sl-stats">
          {block.stats.map((s) => (
            <div key={s.label} className="lp-sl-card lp-sl-stat">
              <div className="lp-sl-stat__v">{s.value}</div>
              <div className="lp-sl-stat__k">{s.label}</div>
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
    <section className="lp-sl-sec">
      <p className="lp-sl-label">FAQ</p>
      <h2 className="lp-sl-h2 lp-sl-h2--sm">Pertanyaan umum</h2>
      <div className="lp-sl-stack">
        {block.items.map((item, i) => {
          const isOpen = i === open;
          return (
            <div key={item.q} className="lp-sl-card lp-sl-faq" data-open={isOpen}>
              <button
                type="button" className="lp-sl-faq__q" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <span className="lp-sl-faq__mark" aria-hidden>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen ? <div className="lp-sl-faq__a">{item.a}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp-sl-sec" id="kontak">
      <p className="lp-sl-label">Tim marketing</p>
      <h2 className="lp-sl-h2 lp-sl-h2--sm">Butuh informasi lebih lanjut?</h2>
      <p className="lp-sl-lead">Siap membantu proses KPR hingga serah terima kunci.</p>
      <div className="lp-sl-card lp-sl-agent">
        <span className="lp-sl-avatar lp-sl-avatar--lg" aria-hidden>{initials(block.agentName)}</span>
        <div className="lp-sl-agent__body">
          <div className="lp-sl-agent__name">{block.agentName}</div>
          <div className="lp-sl-agent__role">Property Advisor</div>
          <div className="lp-sl-agent__actions">
            <WhatsAppLink
              projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
              className="lp-sl-btn lp-sl-btn--dark lp-sl-btn--sm"
            >
              WhatsApp
            </WhatsAppLink>
            <a href={`tel:${normalizeIndonesianPhone(block.waNumber)}`} className="lp-sl-btn lp-sl-btn--line lp-sl-btn--sm">
              Telepon
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  return (
    <section id="minta-info" className="lp-sl-sec" data-form-block={block.id}>
      <p className="lp-sl-label">Minta info</p>
      <h2 className="lp-sl-h2">Tinggalkan kontak Anda</h2>
      <p className="lp-sl-lead">Kami balas lewat WhatsApp secepatnya.</p>
      <div className="lp-sl-card lp-sl-formcard">
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
    <footer className="lp-sl-footer">
      <div className="lp-sl-footer__name">{project.name}</div>
      <div className="lp-sl-footer__addr">
        {project.location ? <>{project.location}<br /></> : null}
        Dipasarkan oleh {agent.fullName}
        {contact ? <><br />{contact}</> : null}
      </div>
      <nav className="lp-sl-footer__links" aria-label="Navigasi footer">
        <a href="#unit">Tipe Unit</a>
        <a href="#kontak">Kontak</a>
      </nav>
      <div className="lp-sl-footer__copy">© {year} {project.name}</div>
    </footer>
  );
}

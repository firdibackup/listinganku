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
 * 03 Korporat Biru — ditranskrip dari `design/project/03 Korporat Biru.dc.html`.
 *
 * Ciri yang harus bertahan: pita biru tua dari header sampai bawah form, kartu
 * putih bersudut membulat, Archivo Narrow untuk judul, dan FORM LEAD DI DALAM
 * HERO. Formnya bukan salinan — blok contactForm memang diurutkan tepat setelah
 * hero untuk tema ini (BLOCK_ORDER_BY_THEME), jadi tetap satu jalur lead, satu
 * komponen, satu server action.
 */
export function Header({ project }: ChromeProps) {
  return (
    <header className="lp-cb-header">
      <span className="lp-cb-header__name">{project.name}</span>
      <a href="#minta-info" className="lp-cb-header__cta">Konsultasi gratis</a>
    </header>
  );
}

export function Hero({ block }: { block: Extract<ResolvedBlock, { type: 'hero' }> }) {
  return (
    <section className="lp-cb-hero">
      {block.badges.length ? <p className="lp-cb-hero__flag">{block.badges[0]}</p> : null}
      <h1 className="lp-cb-hero__title">{block.title}</h1>
      {block.subtitle ? <p className="lp-cb-hero__sub">{block.subtitle}</p> : null}
      <div className="lp-cb-hero__media">
        <Img media={block.image} alt="Foto hero kawasan" />
      </div>
      {block.priceFrom !== null ? (
        <p className="lp-cb-hero__price">
          <span>Harga mulai</span>
          <strong>{formatRupiahShort(block.priceFrom)}</strong>
        </p>
      ) : null}
    </section>
  );
}

/** Kartu putih yang duduk di ujung pita biru hero. */
export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  return (
    <section id="minta-info" className="lp-cb-formband" data-form-block={block.id}>
      <div className="lp-cb-formcard">
        <h2 className="lp-cb-formcard__title">Dapatkan brosur &amp; price list</h2>
        <p className="lp-cb-formcard__lead">Dikirim langsung via WhatsApp setelah Anda mengirim data.</p>
        <ContactForm
          projectId={block.projectId}
          houseTypes={block.houseTypes}
          askHouseType={block.askHouseType}
        />
      </div>
    </section>
  );
}

export function Developer({ block }: { block: Extract<ResolvedBlock, { type: 'developer' }> }) {
  if (!block.name && !block.about && block.stats.length === 0) return null;
  return (
    <>
      {block.stats.length ? (
        <div className="lp-cb-statstrip">
          {block.stats.map((s) => (
            <div key={s.label} className="lp-cb-statstrip__cell">
              <div className="lp-cb-statstrip__v">{s.value}</div>
              <div className="lp-cb-statstrip__k">{s.label}</div>
            </div>
          ))}
        </div>
      ) : null}
      {block.about ? (
        <section className="lp-cb-sec">
          <p className="lp-cb-eyebrow">Developer</p>
          {block.name ? <h2 className="lp-cb-h2">{block.name}</h2> : null}
          <p className="lp-cb-lead">{block.about}</p>
        </section>
      ) : null}
    </>
  );
}

export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-cb-sec">
      <p className="lp-cb-eyebrow">Mengapa memilih kami</p>
      <h2 className="lp-cb-h2">Keunggulan yang bisa diukur</h2>
      <div className="lp-cb-usp">
        {block.items.map((item, i) => (
          <div key={item.title} className="lp-cb-usp__card">
            <span className="lp-cb-usp__badge">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <div className="lp-cb-usp__title">{item.title}</div>
              {item.desc ? <div className="lp-cb-usp__desc">{item.desc}</div> : null}
            </div>
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
    { k: 'Bangunan', v: formatArea(current.buildingArea) },
    { k: 'Kamar tidur', v: String(current.bedrooms) },
    { k: 'Kamar mandi', v: String(current.bathrooms) },
    { k: 'Carport', v: String(current.carport) },
    { k: 'Harga', v: formatRupiahShort(current.price) },
  ];
  return (
    <section className="lp-cb-sec" id="unit">
      <p className="lp-cb-eyebrow">Tipe unit</p>
      <h2 className="lp-cb-h2">Tiga tipe, satu kawasan</h2>
      <div className="lp-cb-track" role="tablist" aria-label="Tipe unit">
        {block.houseTypes.map((h, i) => (
          <button
            key={h.id} type="button" role="tab" aria-selected={i === active}
            className="lp-cb-track__tab" onClick={() => setActive(i)}
          >
            {h.name}
          </button>
        ))}
      </div>
      <article className="lp-cb-unit" id={current.slug}>
        <div className="lp-cb-unit__media">
          <Img media={current.primaryPhoto} alt={`Render 3D + denah · ${current.name}`} />
        </div>
        <div className="lp-cb-unit__body">
          <div className="lp-cb-unit__head">
            <div>
              <h3 className="lp-cb-unit__name">Type {current.name}</h3>
              {current.shortDescription ? <p className="lp-cb-unit__note">{current.shortDescription}</p> : null}
            </div>
            <div className="lp-cb-unit__pricebox">
              <div className="lp-cb-unit__pricelabel">Mulai</div>
              <div className="lp-cb-unit__price">{formatRupiahShort(current.price)}</div>
            </div>
          </div>
          <div className="lp-cb-chips">
            {specs.map((s) => (
              <div key={s.k} className="lp-cb-chip">
                <div className="lp-cb-chip__k">{s.k}</div>
                <div className="lp-cb-chip__v">{s.v}</div>
              </div>
            ))}
          </div>
          <div className="lp-cb-unit__actions">
            <a href="#minta-info" className="lp-cb-btn lp-cb-btn--solid">Cek ketersediaan</a>
            <a href="#lokasi" className="lp-cb-btn lp-cb-btn--line">Lihat lokasi</a>
          </div>
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
    <section className="lp-cb-sec">
      <p className="lp-cb-eyebrow">Spesifikasi</p>
      <h2 className="lp-cb-h2">Perbandingan tipe</h2>
      <div className="lp-cb-scroll">
        <table className="lp-cb-table">
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

export function Location({ block }: { block: Extract<ResolvedBlock, { type: 'location' }> }) {
  return (
    <section className="lp-cb-sec lp-cb-sec--tint" id="lokasi">
      <p className="lp-cb-eyebrow">Lokasi &amp; aksesibilitas</p>
      <h2 className="lp-cb-h2">Terhubung ke semua arah</h2>
      {block.address ? <p className="lp-cb-lead">{block.address}</p> : null}
      <div className="lp-cb-map">
        {block.mapUrl ? (
          <iframe src={block.mapUrl} title={`Peta ${block.address || 'lokasi'}`} loading="lazy" />
        ) : (
          <>
            <div className="lp-cb-map__grid" aria-hidden />
            <div className="lp-cb-map__pin" aria-hidden />
            <span className="lp-cb-map__label">Google Maps</span>
          </>
        )}
      </div>
      {block.access.length ? (
        <div className="lp-cb-access">
          {block.access.map((a, i) => (
            <div key={`${a.place}-${i}`} className="lp-cb-access__card">
              <div className="lp-cb-access__time">{a.time}</div>
              <div className="lp-cb-access__place">{a.place}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function Facilities({ block }: { block: Extract<ResolvedBlock, { type: 'facilities' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-cb-sec">
      <p className="lp-cb-eyebrow">Fasilitas</p>
      <h2 className="lp-cb-h2">Fasilitas unggulan kawasan</h2>
      <div className="lp-cb-facgrid">
        {block.items.map((f) => (
          <div key={f.name} className="lp-cb-fac">
            <div className="lp-cb-fac__media"><Ph label={`Foto ${f.name}`} /></div>
            <div className="lp-cb-fac__body">
              <div className="lp-cb-fac__name">{f.name}</div>
              {f.desc ? <div className="lp-cb-fac__desc">{f.desc}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FloorPlans({ block }: { block: Extract<ResolvedBlock, { type: 'floorPlans' }> }) {
  const slots = planSlots(block);
  if (!block.masterplan && slots.length === 0) return null;
  return (
    <section className="lp-cb-sec">
      <p className="lp-cb-eyebrow">Masterplan</p>
      <h2 className="lp-cb-h2">Tata kawasan</h2>
      <div className="lp-cb-master">
        <Img media={block.masterplan} alt="Site plan kawasan" />
      </div>
      {block.legend.length ? (
        <ul className="lp-cb-legend">
          {block.legend.map((name, i) => (
            <li key={name} className="lp-cb-legend__item" data-slot={i % 4}>
              <span className="lp-cb-legend__dot" aria-hidden />{name}
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
    <section className="lp-cb-sec">
      <p className="lp-cb-eyebrow">Galeri</p>
      <h2 className="lp-cb-h2">Show unit &amp; lingkungan</h2>
      <div className="lp-cb-rail">
        {slots.map((slot) => (
          <div key={slot.key} className="lp-cb-rail__item">
            <div className="lp-cb-rail__media"><Img media={slot.media} alt={slot.caption} /></div>
            <div className="lp-cb-rail__cap">{slot.caption}</div>
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
    <section className="lp-cb-promo">
      <p className="lp-cb-eyebrow lp-cb-eyebrow--invert">Promo terbatas</p>
      <h2 className="lp-cb-h2 lp-cb-h2--invert">Miliki hunian impian Anda</h2>
      {block.priceFrom !== null ? (
        <p className="lp-cb-promo__price">Mulai {formatRupiahShort(block.priceFrom)}</p>
      ) : null}
      {block.dpText || block.installmentText ? (
        <div className="lp-cb-promo__terms">
          {block.dpText ? (
            <div className="lp-cb-promo__term"><div className="lp-cb-promo__k">DP mulai</div><div className="lp-cb-promo__v">{block.dpText}</div></div>
          ) : null}
          {block.installmentText ? (
            <div className="lp-cb-promo__term"><div className="lp-cb-promo__k">Cicilan mulai</div><div className="lp-cb-promo__v">{block.installmentText}</div></div>
          ) : null}
        </div>
      ) : null}
      <ul className="lp-cb-promo__list">
        {block.promos.map((p) => <li key={p}>{p}</li>)}
      </ul>
      {block.note ? <p className="lp-cb-promo__note">{block.note}</p> : null}
    </section>
  );
}

export function Testimonials({ block }: { block: Extract<ResolvedBlock, { type: 'testimonials' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-cb-sec">
      <p className="lp-cb-eyebrow">Testimoni</p>
      <div className="lp-cb-tstlist">
        {block.items.map((t, i) => (
          <figure key={`${t.name}-${i}`} className="lp-cb-tst">
            <blockquote className="lp-cb-tst__quote">“{t.quote}”</blockquote>
            <figcaption className="lp-cb-tst__who">
              <span className="lp-cb-avatar" aria-hidden>{initials(t.name)}</span>
              <span>
                <span className="lp-cb-tst__name">{t.name}</span>
                {t.unit ? <span className="lp-cb-tst__unit">{t.unit}</span> : null}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Faq({ block }: { block: Extract<ResolvedBlock, { type: 'faq' }> }) {
  const [open, setOpen] = useState(0);
  if (block.items.length === 0) return null;
  return (
    <section className="lp-cb-sec">
      <p className="lp-cb-eyebrow">FAQ</p>
      <h2 className="lp-cb-h2">Pertanyaan yang sering diajukan</h2>
      <div className="lp-cb-faqlist">
        {block.items.map((item, i) => {
          const isOpen = i === open;
          return (
            <div key={item.q} className="lp-cb-faq" data-open={isOpen}>
              <button
                type="button" className="lp-cb-faq__q" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <span className="lp-cb-faq__mark" aria-hidden>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen ? <div className="lp-cb-faq__a">{item.a}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp-cb-sec lp-cb-sec--tint" id="kontak">
      <p className="lp-cb-eyebrow">Tim marketing</p>
      <h2 className="lp-cb-h2">Butuh informasi lebih lanjut?</h2>
      <p className="lp-cb-lead">Siap membantu proses KPR hingga serah terima kunci.</p>
      <div className="lp-cb-agent">
        <span className="lp-cb-agent__avatar" aria-hidden>{initials(block.agentName)}</span>
        <div className="lp-cb-agent__body">
          <div className="lp-cb-agent__name">{block.agentName}</div>
          <div className="lp-cb-agent__role">Property Advisor</div>
          <div className="lp-cb-agent__actions">
            <WhatsAppLink
              projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
              className="lp-cb-btn lp-cb-btn--solid"
            >
              WhatsApp
            </WhatsAppLink>
            <a href={`tel:${normalizeIndonesianPhone(block.waNumber)}`} className="lp-cb-btn lp-cb-btn--line">
              Telepon
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer({ project, agent }: ChromeProps) {
  const year = new Date().getFullYear();
  const contact = [agent.whatsapp, agent.email].filter(Boolean).join(' · ');
  return (
    <footer className="lp-cb-footer">
      <div className="lp-cb-footer__name">{project.name}</div>
      <div className="lp-cb-footer__addr">
        {project.location ? <>{project.location}<br /></> : null}
        Dipasarkan oleh {agent.fullName}
        {contact ? <><br />{contact}</> : null}
      </div>
      <nav className="lp-cb-footer__links" aria-label="Navigasi footer">
        <a href="#unit">Tipe Unit</a>
        <a href="#kontak">Kontak</a>
      </nav>
      <div className="lp-cb-footer__copy">© {year} {project.name}</div>
    </footer>
  );
}

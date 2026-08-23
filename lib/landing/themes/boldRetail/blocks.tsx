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
 * 05 Bold Retail — ditranskrip dari `design/project/05 Bold Retail.dc.html`.
 *
 * Ciri yang harus bertahan: pita kuning, Anton huruf besar sangat rapat, garis
 * tebal 2–3px di mana-mana, NOL sudut membulat, aksen oranye untuk angka.
 *
 * Strip hitam di atas header memang ada di desain, tapi isinya di sana adalah
 * "SISA 12 UNIT" — klaim kelangkaan yang tidak punya sumber data di aplikasi
 * ini. Bentuknya dipertahankan, isinya diganti fakta yang memang kita punya:
 * lokasi dan developer.
 */
export function Header({ project }: ChromeProps) {
  return (
    <>
      <div className="lp-br-ticker">
        <span>{project.location}</span>
        <span>{project.developer}</span>
      </div>
      <header className="lp-br-header">
        <span className="lp-br-header__name">{project.name}</span>
        <a href="#kontak" className="lp-br-header__cta">Hubungi</a>
      </header>
    </>
  );
}

export function Hero({ block }: { block: Extract<ResolvedBlock, { type: 'hero' }> }) {
  return (
    <section className="lp-br-hero">
      <h1 className="lp-br-hero__title">{block.title}</h1>
      {block.subtitle ? <p className="lp-br-hero__sub">{block.subtitle}</p> : null}
      <div className="lp-br-hero__media">
        <Img media={block.image} alt="Foto hero perumahan" />
      </div>
      <div className="lp-br-hero__actions">
        <WhatsAppLink
          projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
          className="lp-br-btn lp-br-btn--black"
        >
          Klaim promo sekarang
        </WhatsAppLink>
        <a href="#unit" className="lp-br-btn lp-br-btn--outline">Lihat tipe &amp; price list</a>
      </div>
    </section>
  );
}

export function Developer({ block }: { block: Extract<ResolvedBlock, { type: 'developer' }> }) {
  if (!block.name && !block.about && block.stats.length === 0) return null;
  return (
    <>
      {block.stats.length ? (
        <div className="lp-br-statstrip">
          {block.stats.map((s) => (
            <div key={s.label}>
              <div className="lp-br-statstrip__v">{s.value}</div>
              <div className="lp-br-statstrip__k">{s.label}</div>
            </div>
          ))}
        </div>
      ) : null}
      {block.about ? (
        <section className="lp-br-sec">
          <h2 className="lp-br-h2">{block.name || 'Developer'}</h2>
          <p className="lp-br-lead">{block.about}</p>
        </section>
      ) : null}
    </>
  );
}

export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-br-sec">
      <h2 className="lp-br-h2">Kenapa di sini?</h2>
      <div className="lp-br-stack">
        {block.items.map((item, i) => (
          <div key={item.title} className="lp-br-usp">
            <span className="lp-br-usp__no">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <div className="lp-br-usp__title">{item.title}</div>
              {item.desc ? <div className="lp-br-usp__desc">{item.desc}</div> : null}
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
    <section className="lp-br-dark" id="unit">
      <h2 className="lp-br-h2 lp-br-h2--yellow">Pilih tipe</h2>
      <p className="lp-br-dark__lead">Tiga tipe siap huni dengan spesifikasi lengkap.</p>
      <div className="lp-br-tabs" role="tablist" aria-label="Tipe unit">
        {block.houseTypes.map((h, i) => (
          <button
            key={h.id} type="button" role="tab" aria-selected={i === active}
            className="lp-br-tab" onClick={() => setActive(i)}
          >
            {h.name}
          </button>
        ))}
      </div>
      <article className="lp-br-unit" id={current.slug}>
        <div className="lp-br-unit__media">
          <Img media={current.primaryPhoto} alt={`Denah + render · ${current.name}`} />
        </div>
        <div className="lp-br-unit__body">
          <h3 className="lp-br-unit__name">Type {current.name}</h3>
          <p className="lp-br-unit__price">
            <span>Mulai</span>
            <strong>{formatRupiahShort(current.price)}</strong>
          </p>
          <div className="lp-br-specgrid">
            {specs.map((s) => (
              <div key={s.k} className="lp-br-spec">
                <div className="lp-br-spec__k">{s.k}</div>
                <div className="lp-br-spec__v">{s.v}</div>
              </div>
            ))}
          </div>
          {current.shortDescription ? <p className="lp-br-unit__note">{current.shortDescription}</p> : null}
          <a href="#minta-info" className="lp-br-btn lp-br-btn--yellow">Cek ketersediaan unit</a>
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
    <section className="lp-br-sec">
      <h2 className="lp-br-h2">Bandingkan</h2>
      <div className="lp-br-scroll">
        <table className="lp-br-table">
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

export function PricePromo({ block }: { block: Extract<ResolvedBlock, { type: 'pricePromo' }> }) {
  const empty = block.priceFrom === null && !block.dpText && !block.installmentText
    && block.promos.length === 0 && !block.note;
  if (empty) return null;
  return (
    <section className="lp-br-promo">
      <p className="lp-br-promo__eyebrow">Harga &amp; promo</p>
      {block.priceFrom !== null ? (
        <h2 className="lp-br-promo__price">Mulai {formatRupiahShort(block.priceFrom)}</h2>
      ) : null}
      {block.dpText || block.installmentText ? (
        <div className="lp-br-promo__terms">
          {block.dpText ? (
            <div className="lp-br-promo__term"><div className="lp-br-promo__k">DP mulai</div><div className="lp-br-promo__v">{block.dpText}</div></div>
          ) : null}
          {block.installmentText ? (
            <div className="lp-br-promo__term"><div className="lp-br-promo__k">Cicilan</div><div className="lp-br-promo__v">{block.installmentText}</div></div>
          ) : null}
        </div>
      ) : null}
      <ul className="lp-br-promo__list">
        {block.promos.map((p) => <li key={p}>{p}</li>)}
      </ul>
      {block.note ? <p className="lp-br-promo__note">{block.note}</p> : null}
    </section>
  );
}

export function Location({ block }: { block: Extract<ResolvedBlock, { type: 'location' }> }) {
  return (
    <section className="lp-br-sec" id="lokasi">
      <h2 className="lp-br-h2">Lokasi</h2>
      {block.address ? <p className="lp-br-lead">{block.address}</p> : null}
      <div className="lp-br-map">
        {block.mapUrl ? (
          <iframe src={block.mapUrl} title={`Peta ${block.address || 'lokasi'}`} loading="lazy" />
        ) : (
          <>
            <div className="lp-br-map__grid" aria-hidden />
            <div className="lp-br-map__pin" aria-hidden />
            <span className="lp-br-map__label">Google Maps</span>
          </>
        )}
      </div>
      {block.access.length ? (
        <div className="lp-br-access">
          {block.access.map((a, i) => (
            <div key={`${a.place}-${i}`} className="lp-br-access__cell">
              <div className="lp-br-access__time">{a.time}</div>
              <div className="lp-br-access__place">{a.place}</div>
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
    <section className="lp-br-sec">
      <h2 className="lp-br-h2">Fasilitas</h2>
      <div className="lp-br-facgrid">
        {block.items.map((f) => (
          <div key={f.name} className="lp-br-fac">
            <div className="lp-br-fac__media"><Ph label={`Foto ${f.name}`} /></div>
            <div className="lp-br-fac__body">
              <div className="lp-br-fac__name">{f.name}</div>
              {f.desc ? <div className="lp-br-fac__desc">{f.desc}</div> : null}
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
    <section className="lp-br-sec">
      <h2 className="lp-br-h2">Masterplan</h2>
      <div className="lp-br-master">
        <Img media={block.masterplan} alt="Site plan kawasan" />
      </div>
      {block.legend.length ? (
        <ul className="lp-br-legend">
          {block.legend.map((name, i) => (
            <li key={name} className="lp-br-legend__item" data-slot={i % 4}>
              <span className="lp-br-legend__dot" aria-hidden />{name}
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
    <section className="lp-br-sec lp-br-sec--bleed">
      <h2 className="lp-br-h2 lp-br-h2--inset">Galeri</h2>
      <div className="lp-br-rail">
        {slots.map((slot) => (
          <div key={slot.key} className="lp-br-rail__item">
            <div className="lp-br-rail__media"><Img media={slot.media} alt={slot.caption} /></div>
            <div className="lp-br-rail__cap">{slot.caption}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Testimonials({ block }: { block: Extract<ResolvedBlock, { type: 'testimonials' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-br-dark">
      <h2 className="lp-br-h2 lp-br-h2--yellow">Kata pemilik</h2>
      <div className="lp-br-stack">
        {block.items.map((t, i) => (
          <figure key={`${t.name}-${i}`} className="lp-br-tst">
            <blockquote className="lp-br-tst__quote">“{t.quote}”</blockquote>
            <figcaption className="lp-br-tst__who">
              <span className="lp-br-avatar" aria-hidden>{initials(t.name)}</span>
              <span>
                <span className="lp-br-tst__name">{t.name}</span>
                {t.unit ? <span className="lp-br-tst__unit">{t.unit}</span> : null}
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
    <section className="lp-br-sec">
      <h2 className="lp-br-h2">Tanya jawab</h2>
      <div className="lp-br-stack lp-br-stack--tight">
        {block.items.map((item, i) => {
          const isOpen = i === open;
          return (
            <div key={item.q} className="lp-br-faq" data-open={isOpen}>
              <button
                type="button" className="lp-br-faq__q" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <span className="lp-br-faq__mark" aria-hidden>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen ? <div className="lp-br-faq__a">{item.a}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp-br-sec" id="kontak">
      <h2 className="lp-br-h2">Tanya marketing</h2>
      <div className="lp-br-agent">
        <span className="lp-br-agent__avatar" aria-hidden>{initials(block.agentName)}</span>
        <div className="lp-br-agent__body">
          <div className="lp-br-agent__name">{block.agentName}</div>
          <div className="lp-br-agent__role">Property Advisor</div>
        </div>
      </div>
      <div className="lp-br-agent__actions">
        <WhatsAppLink
          projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
          className="lp-br-btn lp-br-btn--black"
        >
          WhatsApp sekarang
        </WhatsAppLink>
        <a href={`tel:${normalizeIndonesianPhone(block.waNumber)}`} className="lp-br-btn lp-br-btn--outline">
          Telepon
        </a>
      </div>
    </section>
  );
}

export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  return (
    <section id="minta-info" className="lp-br-sec" data-form-block={block.id}>
      <h2 className="lp-br-h2">Minta price list</h2>
      <div className="lp-br-formcard">
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
    <footer className="lp-br-footer">
      <div className="lp-br-footer__name">{project.name}</div>
      <div className="lp-br-footer__addr">
        {project.location ? <>{project.location}<br /></> : null}
        Dipasarkan oleh {agent.fullName}
        {contact ? <><br />{contact}</> : null}
      </div>
      <nav className="lp-br-footer__links" aria-label="Navigasi footer">
        <a href="#unit">Tipe Unit</a>
        <a href="#kontak">Kontak</a>
      </nav>
      <div className="lp-br-footer__copy">© {year} {project.name}</div>
    </footer>
  );
}

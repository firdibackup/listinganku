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
 * 02 Editorial Putih — ditranskrip dari `design/project/02 Editorial Putih.dc.html`.
 *
 * Ciri yang harus bertahan: kertas hangat, serif editorial dengan satu kata
 * miring di judul, NOL sudut membulat, pembatas garis rambut, dan tipe unit
 * sebagai DAFTAR bab — bukan tab. Eyebrow "Bab satu/dua/…" datang dari CSS
 * counter (@counter-style lp-bab), jadi kalau agen mengurutkan ulang blok,
 * urutan babnya ikut benar tanpa menyentuh JSX.
 */
export function Header({ project }: ChromeProps) {
  return (
    <header className="lp-ew-header">
      <span className="lp-ew-header__name">{project.name}</span>
      <a href="#kontak" className="lp-ew-header__cta">Hubungi</a>
    </header>
  );
}

/** Judul dipecah supaya kata terakhir tampil miring, seperti "strategis" di desain. */
function TitleWithAccent({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return <>{text}</>;
  const last = words.pop() as string;
  return (
    <>
      {words.join(' ')} <em className="lp-ew-hero__accent">{last}</em>
    </>
  );
}

export function Hero({ block }: { block: Extract<ResolvedBlock, { type: 'hero' }> }) {
  return (
    <>
      <section className="lp-ew-hero">
        {block.location ? <p className="lp-ew-hero__kicker">{block.location}</p> : null}
        <h1 className="lp-ew-hero__title"><TitleWithAccent text={block.title} /></h1>
        {block.subtitle ? <p className="lp-ew-hero__sub">{block.subtitle}</p> : null}
        <div className="lp-ew-hero__actions">
          <WhatsAppLink
            projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
            className="lp-ew-btn lp-ew-btn--solid"
          >
            Hubungi Marketing
          </WhatsAppLink>
          <a href="#unit" className="lp-ew-btn lp-ew-btn--line">Lihat Unit</a>
        </div>
      </section>

      <div className="lp-ew-heroband">
        <Img media={block.image} alt="Foto kawasan" />
      </div>

      <div className="lp-ew-pricerow">
        {block.priceFrom !== null ? (
          <p className="lp-ew-pricerow__line">
            <span className="lp-ew-pricerow__label">Harga mulai</span>
            <span className="lp-ew-pricerow__value">{formatRupiahShort(block.priceFrom)}</span>
          </p>
        ) : null}
        {block.badges.length ? (
          <div className="lp-ew-tags">
            {block.badges.map((b) => <span key={b} className="lp-ew-tag">{b}</span>)}
          </div>
        ) : null}
      </div>
    </>
  );
}

export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-ew-sec">
      <p className="lp-ew-chapter" />
      <h2 className="lp-ew-h2">Kenapa memilih proyek ini</h2>
      <ol className="lp-ew-usp">
        {block.items.map((item, i) => (
          <li key={item.title} className="lp-ew-usp__row">
            <span className="lp-ew-usp__no">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className="lp-ew-usp__title">{item.title}</span>
              {item.desc ? <span className="lp-ew-usp__desc">{item.desc}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function HouseTypes({ block }: { block: Extract<ResolvedBlock, { type: 'houseTypes' }> }) {
  if (block.houseTypes.length === 0) return null;
  return (
    <section className="lp-ew-sec" id="unit">
      <p className="lp-ew-chapter" />
      <h2 className="lp-ew-h2">Pilihan tipe unit</h2>
      {block.houseTypes.map((h) => (
        <article key={h.id} id={h.slug} className="lp-ew-unit">
          <div className="lp-ew-unit__head">
            <h3 className="lp-ew-unit__name">Type {h.name}</h3>
            <span className="lp-ew-unit__price">{formatRupiahShort(h.price)}</span>
          </div>
          <div className="lp-ew-unit__media">
            <Img media={h.primaryPhoto ?? h.floorPlan} alt={`Denah 2D · ${h.name}`} />
          </div>
          <dl className="lp-ew-unit__specs">
            {[
              { k: 'Luas tanah', v: formatArea(h.landArea) },
              { k: 'Bangunan', v: formatArea(h.buildingArea) },
              { k: 'Kamar tidur', v: String(h.bedrooms) },
              { k: 'Kamar mandi', v: String(h.bathrooms) },
              { k: 'Carport', v: String(h.carport) },
            ].map((s) => (
              <div key={s.k} className="lp-ew-unit__spec">
                <dt>{s.k}</dt>
                <dd>{s.v}</dd>
              </div>
            ))}
          </dl>
          {h.shortDescription ? <p className="lp-ew-unit__note">{h.shortDescription}</p> : null}
          <a href="#kontak" className="lp-ew-link">Lihat detail unit →</a>
        </article>
      ))}
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
    <section className="lp-ew-sec">
      <p className="lp-ew-label">Spesifikasi</p>
      <h2 className="lp-ew-h2">Perbandingan tipe</h2>
      <div className="lp-ew-scroll">
        <table className="lp-ew-table">
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
    <section className="lp-ew-sec" id="lokasi">
      <p className="lp-ew-chapter" />
      <h2 className="lp-ew-h2">Lokasi</h2>
      {block.address ? <p className="lp-ew-lead">{block.address}</p> : null}
      <div className="lp-ew-map">
        {block.mapUrl ? (
          <iframe src={block.mapUrl} title={`Peta ${block.address || 'lokasi'}`} loading="lazy" />
        ) : (
          <>
            <div className="lp-ew-map__grid" aria-hidden />
            <div className="lp-ew-map__pin" aria-hidden />
            <span className="lp-ew-map__label">Peta lokasi</span>
          </>
        )}
      </div>
      {block.access.map((a, i) => (
        <div key={`${a.place}-${i}`} className="lp-ew-access">
          <span className="lp-ew-access__place">{a.place}</span>
          <span className="lp-ew-access__time">{a.time}</span>
        </div>
      ))}
    </section>
  );
}

export function Facilities({ block }: { block: Extract<ResolvedBlock, { type: 'facilities' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-ew-sec">
      <p className="lp-ew-chapter" />
      <h2 className="lp-ew-h2">Fasilitas kawasan</h2>
      {block.items.map((f) => (
        <div key={f.name} className="lp-ew-fac">
          <div className="lp-ew-fac__media"><Ph label={`Foto ${f.name}`} /></div>
          <div className="lp-ew-fac__row">
            <div className="lp-ew-fac__name">{f.name}</div>
            {f.desc ? <div className="lp-ew-fac__desc">{f.desc}</div> : null}
          </div>
        </div>
      ))}
    </section>
  );
}

export function FloorPlans({ block }: { block: Extract<ResolvedBlock, { type: 'floorPlans' }> }) {
  const slots = planSlots(block);
  if (!block.masterplan && slots.length === 0) return null;
  return (
    <section className="lp-ew-sec">
      <p className="lp-ew-chapter" />
      <h2 className="lp-ew-h2">Masterplan kawasan</h2>
      <div className="lp-ew-master">
        <Img media={block.masterplan} alt="Site plan kawasan" />
      </div>
      {block.legend.length ? (
        <ul className="lp-ew-legend">
          {block.legend.map((name, i) => (
            <li key={name} className="lp-ew-legend__item" data-slot={i % 4}>
              <span className="lp-ew-legend__dot" aria-hidden />{name}
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
    <section className="lp-ew-sec">
      <p className="lp-ew-chapter" />
      <h2 className="lp-ew-h2">Galeri</h2>
      <div className="lp-ew-grid">
        {slots.map((slot, i) => (
          <figure key={slot.key} className="lp-ew-grid__cell" data-wide={i % 4 === 0}>
            <Img media={slot.media} alt={slot.caption} />
            <figcaption className="lp-ew-grid__cap">{slot.caption}</figcaption>
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
    <section className="lp-ew-promo">
      <p className="lp-ew-chapter lp-ew-chapter--invert" />
      <h2 className="lp-ew-h2 lp-ew-h2--invert">Harga &amp; promo</h2>
      {block.priceFrom !== null ? (
        <p className="lp-ew-promo__price">Mulai {formatRupiahShort(block.priceFrom)}</p>
      ) : null}
      {block.dpText || block.installmentText ? (
        <div className="lp-ew-promo__terms">
          {block.dpText ? (
            <div><div className="lp-ew-promo__k">DP mulai</div><div className="lp-ew-promo__v">{block.dpText}</div></div>
          ) : null}
          {block.installmentText ? (
            <div><div className="lp-ew-promo__k">Cicilan mulai</div><div className="lp-ew-promo__v">{block.installmentText}</div></div>
          ) : null}
        </div>
      ) : null}
      <ul className="lp-ew-promo__list">
        {block.promos.map((p) => <li key={p}>{p}</li>)}
      </ul>
      {block.note ? <p className="lp-ew-promo__note">{block.note}</p> : null}
    </section>
  );
}

export function Testimonials({ block }: { block: Extract<ResolvedBlock, { type: 'testimonials' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-ew-sec">
      <p className="lp-ew-label">Testimoni</p>
      {block.items.map((t, i) => (
        <figure key={`${t.name}-${i}`} className="lp-ew-tst">
          <blockquote className="lp-ew-tst__quote">“{t.quote}”</blockquote>
          <figcaption className="lp-ew-tst__who">
            <span className="lp-ew-avatar" aria-hidden>{initials(t.name)}</span>
            <span>
              <span className="lp-ew-tst__name">{t.name}</span>
              {t.unit ? <span className="lp-ew-tst__unit">{t.unit}</span> : null}
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
    <section className="lp-ew-sec">
      <p className="lp-ew-label">Tentang developer</p>
      {block.name ? <h2 className="lp-ew-h2 lp-ew-h2--sm">{block.name}</h2> : null}
      {block.about ? <p className="lp-ew-lead">{block.about}</p> : null}
      {block.stats.length ? (
        <div className="lp-ew-stats">
          {block.stats.map((s) => (
            <div key={s.label} className="lp-ew-stat">
              <div className="lp-ew-stat__v">{s.value}</div>
              <div className="lp-ew-stat__k">{s.label}</div>
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
    <section className="lp-ew-sec">
      <h2 className="lp-ew-h2 lp-ew-h2--sm">Pertanyaan umum</h2>
      {block.items.map((item, i) => {
        const isOpen = i === open;
        return (
          <div key={item.q} className="lp-ew-faq">
            <button
              type="button" className="lp-ew-faq__q" aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span>{item.q}</span>
              <span className="lp-ew-faq__mark" aria-hidden>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen ? <div className="lp-ew-faq__a">{item.a}</div> : null}
          </div>
        );
      })}
    </section>
  );
}

export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp-ew-sec" id="kontak">
      <h2 className="lp-ew-h2 lp-ew-h2--sm">Butuh informasi lebih lanjut?</h2>
      <p className="lp-ew-lead">Hubungi property consultant kami untuk ketersediaan unit dan simulasi KPR.</p>
      <div className="lp-ew-agent">
        <span className="lp-ew-avatar lp-ew-avatar--lg" aria-hidden>{initials(block.agentName)}</span>
        <div className="lp-ew-agent__body">
          <div className="lp-ew-agent__name">{block.agentName}</div>
          <div className="lp-ew-agent__role">Property Advisor</div>
          <div className="lp-ew-agent__actions">
            <WhatsAppLink
              projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
              className="lp-ew-link"
            >
              WhatsApp
            </WhatsAppLink>
            <a href={`tel:${normalizeIndonesianPhone(block.waNumber)}`} className="lp-ew-link lp-ew-link--muted">
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
    <section id="minta-info" className="lp-ew-contact" data-form-block={block.id}>
      <h2 className="lp-ew-contact__title">Siap menemukan hunian impian Anda?</h2>
      <p className="lp-ew-lead">
        Jadwalkan survey lokasi dan dapatkan informasi unit terbaru dari tim marketing kami.
      </p>
      <div className="lp-ew-contact__card">
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
    <footer className="lp-ew-footer">
      <div className="lp-ew-footer__name">{project.name}</div>
      <div className="lp-ew-footer__addr">
        {project.location ? <>{project.location}<br /></> : null}
        Dipasarkan oleh {agent.fullName}
        {contact ? <><br />{contact}</> : null}
      </div>
      <nav className="lp-ew-footer__links" aria-label="Navigasi footer">
        <a href="#unit">Tipe Unit</a>
        <a href="#kontak">Kontak</a>
      </nav>
      <div className="lp-ew-footer__copy">© {year} {project.name}</div>
    </footer>
  );
}

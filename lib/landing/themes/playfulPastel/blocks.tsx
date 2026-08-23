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
 * 09 Playful Pastel — ditranskrip dari `design/project/09 Playful Pastel.dc.html`.
 *
 * Ciri yang harus bertahan: blok pastel bersudut sangat besar (20–28px), Fredoka
 * untuk judul, semua tombol berbentuk pil, copy yang santai, dan kartu USP yang
 * berganti warna pastel bergantian. Warna pastelnya diturunkan dari palet aktif
 * lewat color-mix (data-slot 0–3), bukan hex tetap — supaya menukar palet tetap
 * menghasilkan kombinasi yang selaras.
 */
export function Header({ project }: ChromeProps) {
  return (
    <header className="lp-pp-header">
      <span className="lp-pp-header__name">{project.name}</span>
      <a href="#kontak" className="lp-pp-header__cta">Tanya dulu</a>
    </header>
  );
}

export function Hero({ block }: { block: Extract<ResolvedBlock, { type: 'hero' }> }) {
  return (
    <section className="lp-pp-herowrap">
      <div className="lp-pp-hero">
        {block.badges.length ? <span className="lp-pp-flag">✦ {block.badges[0]}</span> : null}
        <h1 className="lp-pp-hero__title">{block.title}</h1>
        {block.subtitle ? <p className="lp-pp-hero__sub">{block.subtitle}</p> : null}
        <div className="lp-pp-hero__media">
          <Img media={block.image} alt="Foto hero perumahan" />
        </div>
        <div className="lp-pp-hero__actions">
          <WhatsAppLink
            projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
            className="lp-pp-btn lp-pp-btn--solid"
          >
            Hubungi Marketing
          </WhatsAppLink>
          <a href="#unit" className="lp-pp-btn lp-pp-btn--white">Lihat Unit</a>
        </div>
      </div>
      {/* Kartu kedua di desain berisi "Cicilan mulai" — angka yang hidup di blok
          harga/promo, bukan di hero. Daripada mengisinya dengan badge yang
          bukan cicilan, hero cukup menampilkan harga; badge sisanya jadi pil. */}
      {block.priceFrom !== null || block.badges.length > 1 ? (
        <div className="lp-pp-duo">
          {block.priceFrom !== null ? (
            <div className="lp-pp-duo__card lp-pp-duo__card--wide" data-slot="0">
              <div className="lp-pp-duo__k">Harga mulai</div>
              <div className="lp-pp-duo__v">{formatRupiahShort(block.priceFrom)}</div>
            </div>
          ) : null}
          {block.badges.length > 1 ? (
            <div className="lp-pp-badges">
              {block.badges.slice(1).map((b) => <span key={b} className="lp-pp-badge">{b}</span>)}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-pp-sec">
      <h2 className="lp-pp-h2">Kenapa di sini?</h2>
      <div className="lp-pp-uspgrid">
        {block.items.map((item, i) => (
          <div key={item.title} className="lp-pp-usp" data-slot={i % 4}>
            <span className="lp-pp-usp__chip" aria-hidden />
            <div className="lp-pp-usp__title">{item.title}</div>
            {item.desc ? <div className="lp-pp-usp__desc">{item.desc}</div> : null}
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
    <section className="lp-pp-sec" id="unit">
      <h2 className="lp-pp-h2">Pilih tipe kamu</h2>
      <div className="lp-pp-tabs" role="tablist" aria-label="Tipe unit">
        {block.houseTypes.map((h, i) => (
          <button
            key={h.id} type="button" role="tab" aria-selected={i === active}
            className="lp-pp-tab" onClick={() => setActive(i)}
          >
            {h.name}
          </button>
        ))}
      </div>
      <article className="lp-pp-unit" id={current.slug}>
        <div className="lp-pp-unit__media">
          <Img media={current.primaryPhoto} alt={`Render + denah · ${current.name}`} />
        </div>
        <div className="lp-pp-unit__body">
          <div className="lp-pp-unit__head">
            <h3 className="lp-pp-unit__name">Type {current.name}</h3>
            <span className="lp-pp-unit__price">{formatRupiahShort(current.price)}</span>
          </div>
          <div className="lp-pp-specgrid">
            {specs.map((s) => (
              <div key={s.k} className="lp-pp-spec">
                <div className="lp-pp-spec__k">{s.k}</div>
                <div className="lp-pp-spec__v">{s.v}</div>
              </div>
            ))}
          </div>
          {current.shortDescription ? <p className="lp-pp-unit__note">{current.shortDescription}</p> : null}
          <a href="#minta-info" className="lp-pp-btn lp-pp-btn--solid">Cek ketersediaan unit</a>
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
    <section className="lp-pp-sec">
      <h2 className="lp-pp-h2">Bandingkan tipe</h2>
      <div className="lp-pp-panel lp-pp-scroll">
        <table className="lp-pp-table">
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
    <section className="lp-pp-sec">
      <h2 className="lp-pp-h2">Fasilitasnya lengkap</h2>
      <div className="lp-pp-facgrid">
        {block.items.map((f, i) => (
          <div key={f.name} className="lp-pp-fac" data-slot={i % 4}>
            <div className="lp-pp-fac__media"><Ph label={`Foto ${f.name}`} /></div>
            <div className="lp-pp-fac__name">{f.name}</div>
            {f.desc ? <div className="lp-pp-fac__desc">{f.desc}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Location({ block }: { block: Extract<ResolvedBlock, { type: 'location' }> }) {
  return (
    <section className="lp-pp-sec" id="lokasi">
      <h2 className="lp-pp-h2">Lokasinya enak</h2>
      {block.address ? <p className="lp-pp-lead">{block.address}</p> : null}
      <div className="lp-pp-map">
        {block.mapUrl ? (
          <iframe src={block.mapUrl} title={`Peta ${block.address || 'lokasi'}`} loading="lazy" />
        ) : (
          <>
            <div className="lp-pp-map__grid" aria-hidden />
            <div className="lp-pp-map__pin" aria-hidden />
            <span className="lp-pp-map__label">Peta lokasi</span>
          </>
        )}
      </div>
      {block.access.length ? (
        <div className="lp-pp-accessgrid">
          {block.access.map((a, i) => (
            <div key={`${a.place}-${i}`} className="lp-pp-access" data-slot={i % 4}>
              <div className="lp-pp-access__time">{a.time}</div>
              <div className="lp-pp-access__place">{a.place}</div>
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
    <section className="lp-pp-sec">
      <h2 className="lp-pp-h2">Peta kawasan</h2>
      <div className="lp-pp-master">
        <Img media={block.masterplan} alt="Site plan kawasan" />
      </div>
      {block.legend.length ? (
        <ul className="lp-pp-legend">
          {block.legend.map((name, i) => (
            <li key={name} className="lp-pp-legend__item" data-slot={i % 4}>
              <span className="lp-pp-legend__dot" aria-hidden />{name}
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
    <section className="lp-pp-sec lp-pp-sec--bleed">
      <h2 className="lp-pp-h2 lp-pp-h2--inset">Lihat-lihat dulu</h2>
      <div className="lp-pp-rail">
        {slots.map((slot) => (
          <figure key={slot.key} className="lp-pp-rail__item">
            <div className="lp-pp-rail__media"><Img media={slot.media} alt={slot.caption} /></div>
            <figcaption className="lp-pp-rail__cap">{slot.caption}</figcaption>
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
    <section className="lp-pp-sec">
      <div className="lp-pp-promo">
        <h2 className="lp-pp-h2 lp-pp-h2--invert">Promo bulan ini</h2>
        {block.priceFrom !== null ? (
          <p className="lp-pp-promo__price">Mulai {formatRupiahShort(block.priceFrom)}</p>
        ) : null}
        {block.dpText || block.installmentText ? (
          <div className="lp-pp-promo__terms">
            {block.dpText ? (
              <div className="lp-pp-promo__card"><div className="lp-pp-promo__k">DP mulai</div><div className="lp-pp-promo__v">{block.dpText}</div></div>
            ) : null}
            {block.installmentText ? (
              <div className="lp-pp-promo__card"><div className="lp-pp-promo__k">Cicilan</div><div className="lp-pp-promo__v">{block.installmentText}</div></div>
            ) : null}
          </div>
        ) : null}
        <ul className="lp-pp-promo__list">
          {block.promos.map((p) => <li key={p}>{p}</li>)}
        </ul>
        {block.note ? <p className="lp-pp-promo__note">{block.note}</p> : null}
      </div>
    </section>
  );
}

export function Testimonials({ block }: { block: Extract<ResolvedBlock, { type: 'testimonials' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp-pp-sec">
      <h2 className="lp-pp-h2">Kata penghuni</h2>
      <div className="lp-pp-tststack">
        {block.items.map((t, i) => (
          <figure key={`${t.name}-${i}`} className="lp-pp-tst" data-slot={i % 4}>
            <blockquote className="lp-pp-tst__quote">“{t.quote}”</blockquote>
            <figcaption className="lp-pp-tst__who">
              <span className="lp-pp-avatar" aria-hidden>{initials(t.name)}</span>
              <span>
                <span className="lp-pp-tst__name">{t.name}</span>
                {t.unit ? <span className="lp-pp-tst__unit">{t.unit}</span> : null}
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
    <section className="lp-pp-sec">
      <h2 className="lp-pp-h2">Siapa yang bangun</h2>
      {block.name ? <p className="lp-pp-dev__name">{block.name}</p> : null}
      {block.about ? <p className="lp-pp-lead">{block.about}</p> : null}
      {block.stats.length ? (
        <div className="lp-pp-stats">
          {block.stats.map((s, i) => (
            <div key={s.label} className="lp-pp-stat" data-slot={i % 4}>
              <div className="lp-pp-stat__v">{s.value}</div>
              <div className="lp-pp-stat__k">{s.label}</div>
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
    <section className="lp-pp-sec">
      <h2 className="lp-pp-h2">Sering ditanya</h2>
      <div className="lp-pp-faqlist">
        {block.items.map((item, i) => {
          const isOpen = i === open;
          return (
            <div key={item.q} className="lp-pp-faq" data-open={isOpen}>
              <button
                type="button" className="lp-pp-faq__q" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <span className="lp-pp-faq__mark" aria-hidden>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen ? <div className="lp-pp-faq__a">{item.a}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp-pp-sec" id="kontak">
      <h2 className="lp-pp-h2">Ngobrol dulu, yuk</h2>
      <div className="lp-pp-agent">
        <span className="lp-pp-avatar lp-pp-avatar--lg" aria-hidden>{initials(block.agentName)}</span>
        <div className="lp-pp-agent__body">
          <div className="lp-pp-agent__name">{block.agentName}</div>
          <div className="lp-pp-agent__role">Property Advisor</div>
        </div>
      </div>
      <div className="lp-pp-agent__actions">
        <WhatsAppLink
          projectId={block.projectId} waNumber={block.waNumber} message={block.defaultMessage}
          className="lp-pp-btn lp-pp-btn--solid"
        >
          Chat WhatsApp
        </WhatsAppLink>
        <a href={`tel:${normalizeIndonesianPhone(block.waNumber)}`} className="lp-pp-btn lp-pp-btn--white">
          Telepon
        </a>
      </div>
    </section>
  );
}

export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  return (
    <section id="minta-info" className="lp-pp-sec" data-form-block={block.id}>
      <h2 className="lp-pp-h2">Tinggalin kontak kamu</h2>
      <div className="lp-pp-formcard">
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
    <footer className="lp-pp-footer">
      <div className="lp-pp-footer__name">{project.name}</div>
      <div className="lp-pp-footer__addr">
        {project.location ? <>{project.location}<br /></> : null}
        Dipasarkan oleh {agent.fullName}
        {contact ? <><br />{contact}</> : null}
      </div>
      <nav className="lp-pp-footer__links" aria-label="Navigasi footer">
        <a href="#unit">Tipe Unit</a>
        <a href="#kontak">Kontak</a>
      </nav>
      <div className="lp-pp-footer__copy">© {year} {project.name}</div>
    </footer>
  );
}

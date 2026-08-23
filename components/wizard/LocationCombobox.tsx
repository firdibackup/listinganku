'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { formatRegion, type Region } from '@/lib/places/regions';
import type { LocationDetail } from '@/lib/data/types';

interface LocationComboboxProps {
  value: LocationDetail | null;
  onSelect: (region: Region) => void;
}

/**
 * Combobox ARIA yang ditulis sendiri, BUKAN Radix Popover — dua alasan:
 * @radix-ui/react-popover tidak terpasang, dan Popover memindahkan fokus ke
 * dalam kontennya, kebalikan dari yang dibutuhkan combobox (fokus wajib TETAP
 * di input supaya pengetikan berlanjut). Radix tidak punya primitif combobox.
 *
 * Navigasi keyboard memakai aria-activedescendant, bukan roving tabindex,
 * karena fokus DOM tidak boleh berpindah ke opsi.
 */
export function LocationCombobox({ value, onSelect }: LocationComboboxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Region[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    // Debounce 200 ms + AbortController: tanpa abort, respons lambat untuk
    // kueri lama bisa mendarat SETELAH respons kueri baru dan menimpa hasilnya.
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const body = (await res.json()) as { results: Region[] };
        setResults(body.results);
        setOpen(body.results.length > 0);
        setActive(-1);
      } catch {
        // Abort atau jaringan mati: biarkan hasil lama, jangan menampilkan error
        // di tengah pengetikan. Lokasi tetap bisa diketik di field kawasan.
      }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  function choose(region: Region) {
    onSelect(region);
    setQuery('');
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { setOpen(false); setActive(-1); return; }
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i <= 0 ? results.length - 1 : i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(results[active >= 0 ? active : 0]); }
  }

  return (
    <div className="wz-combo">
      <div className="ds-field">
        <label className="ds-field__label" htmlFor={`${listId}-input`}>
          Cari kota atau kecamatan
        </label>
        <div className="ds-field__control">
          <input
            ref={inputRef}
            id={`${listId}-input`}
            className="ds-field__input"
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
            placeholder="Contoh: Gading Serpong, Tangerang"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            // Blur ditunda supaya klik pada opsi sempat terdaftar sebelum listbox
            // dilepas dari DOM.
            onBlur={() => setTimeout(() => setOpen(false), 120)}
          />
        </div>
      </div>

      {open ? (
        <ul className="wz-combo__list" id={listId} role="listbox" aria-label="Saran lokasi">
          {results.map((r, i) => (
            <li
              key={`${r.district}-${r.city}`}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={`wz-combo__opt${i === active ? ' is-active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(r)}
            >
              <MapPin size={14} aria-hidden="true" />
              <span>
                <span className="wz-combo__name">{r.district}</span>
                <span className="wz-combo__meta">{r.city}, {r.province}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {value ? (
        <p className="wz-combo__picked">
          <MapPin size={14} aria-hidden="true" /> {formatRegion(value)}
        </p>
      ) : null}
    </div>
  );
}

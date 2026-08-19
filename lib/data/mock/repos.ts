import { newId } from '@/lib/ids';
import { defaultBlocksForTheme } from '@/lib/landing/blocks';
import { DEFAULT_THEME, THEME_DEFAULT_PALETTE } from '@/lib/landing/themeNames';
import { uniqueSlug } from '@/lib/slug';
import type { DataStore, NewAiUsage, NewHouseType, NewLead, NewMedia, NewProject } from '../repo';
import type { EventType, StoreShape } from '../types';
import { createStoreHandle } from './store';

const now = () => new Date().toISOString();
const EMPTY_COUNTS: Record<EventType, number> = { visitor: 0, whatsapp_click: 0, form_submit: 0 };

/**
 * Setiap metode baca (dan hasil create/update) HARUS lewat clone() sebelum
 * dikembalikan ke pemanggil, dan setiap masukan (input/patch) HARUS di-clone
 * sebelum disimpan. Tanpa clone di sisi masuk, array/objek bersarang milik
 * pemanggil (facilities, blocks, stats, services, ...) tetap teraliaskan ke
 * dalam store — pemanggil yang lanjut mengubah array itu memutasi store
 * secara diam-diam, tanpa lewat save() dan tanpa tersimpan ke snapshot.
 */
const clone = <T>(value: T): T => structuredClone(value);

export function createMockStore(opts: { persist: boolean; initial?: StoreShape }): DataStore {
  const handle = createStoreHandle(opts);
  const s = handle.state;
  const save = () => handle.commit();

  return {
    agentProfile: {
      async get(userId) {
        return clone(s.agentProfiles.find((a) => a.userId === userId) ?? null);
      },
      async update(userId, patch) {
        const found = s.agentProfiles.find((a) => a.userId === userId);
        if (!found) throw new Error(`Profil agen ${userId} tidak ditemukan.`);
        Object.assign(found, clone(patch));
        save();
        return clone(found);
      },
    },

    projects: {
      async list(userId) {
        return s.projects
          .filter((p) => p.userId === userId)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          .map(clone);
      },
      async get(id) {
        return clone(s.projects.find((p) => p.id === id) ?? null);
      },
      async getBySlug(slug) {
        return clone(s.projects.find((p) => p.slug === slug) ?? null);
      },
      async listPublished() {
        return s.projects.filter((p) => p.status === 'published').map(clone);
      },
      async create(input: NewProject) {
        const created = {
          ...clone(input),
          id: newId('prj'),
          slug: uniqueSlug(input.name, s.projects.map((p) => p.slug)),
          status: 'draft' as const,
          theme: DEFAULT_THEME,
          palette: THEME_DEFAULT_PALETTE[DEFAULT_THEME],
          blocks: defaultBlocksForTheme(DEFAULT_THEME),
          seo: {},
          aiContent: null,
          createdAt: now(),
          updatedAt: now(),
          publishedAt: null,
        };
        s.projects.push(created);
        save();
        return clone(created);
      },
      async update(id, patch) {
        const found = s.projects.find((p) => p.id === id);
        if (!found) throw new Error(`Project ${id} tidak ditemukan.`);
        // id adalah primary key dan tidak pernah bisa ditulis ulang; slug diturunkan
        // sekali saat create karena mengubahnya mematahkan URL publik dan QR code
        // yang sudah beredar. Keduanya dibuang dari patch, apa pun isinya.
        const { id: _ignoredId, slug: _ignoredSlug, ...safePatch } = clone(patch);
        Object.assign(found, safePatch, { updatedAt: now() });
        save();
        return clone(found);
      },
      async remove(id) {
        s.projects = s.projects.filter((p) => p.id !== id);
        s.houseTypes = s.houseTypes.filter((h) => h.projectId !== id);
        s.media = s.media.filter((m) => m.projectId !== id);
        s.events = s.events.filter((e) => e.projectId !== id);
        s.leads = s.leads.filter((l) => l.projectId !== id);
        s.aiUsage = s.aiUsage.filter((u) => u.projectId !== id);
        save();
      },
    },

    houseTypes: {
      async listByProject(projectId) {
        return s.houseTypes
          .filter((h) => h.projectId === projectId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(clone);
      },
      async get(id) {
        return clone(s.houseTypes.find((h) => h.id === id) ?? null);
      },
      async create(input: NewHouseType) {
        const siblings = s.houseTypes.filter((h) => h.projectId === input.projectId);
        const created = {
          ...clone(input),
          id: newId('hts'),
          slug: uniqueSlug(input.name, siblings.map((h) => h.slug)),
          status: 'draft' as const,
          aiContent: null,
          sortOrder: siblings.length,
          createdAt: now(),
          updatedAt: now(),
        };
        s.houseTypes.push(created);
        save();
        return clone(created);
      },
      async update(id, patch) {
        const found = s.houseTypes.find((h) => h.id === id);
        if (!found) throw new Error(`Tipe rumah ${id} tidak ditemukan.`);
        const { id: _ignoredId, slug: _ignoredSlug, ...safePatch } = clone(patch);
        Object.assign(found, safePatch, { updatedAt: now() });
        save();
        return clone(found);
      },
      async remove(id) {
        s.houseTypes = s.houseTypes.filter((h) => h.id !== id);
        s.media = s.media.filter((m) => m.houseTypeId !== id);
        s.events = s.events.filter((e) => e.houseTypeId !== id);
        s.leads = s.leads.filter((l) => l.houseTypeId !== id);
        save();
      },
    },

    media: {
      async listByProject(projectId) {
        return s.media
          .filter((m) => m.projectId === projectId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(clone);
      },
      async create(input: NewMedia) {
        const siblings = s.media.filter(
          (m) => m.projectId === input.projectId && m.houseTypeId === input.houseTypeId,
        );
        // "Foto pertama otomatis utama" harus dihitung per TIPE (photo vs
        // floor_plan) — siblings di atas campur keduanya. Tanpa filter ini,
        // mengunggah floor plan lebih dulu mengunci siblings.length di atas 0
        // selamanya untuk grup itu, dan foto pertama yang menyusul tidak pernah
        // dapat giliran jadi utama sama sekali.
        const sameTypeSiblings = siblings.filter((m) => m.type === input.type);
        const created = {
          ...clone(input),
          id: newId('med'),
          isPrimary: sameTypeSiblings.length === 0 && input.type === 'photo',
          sortOrder: siblings.length,
          createdAt: now(),
        };
        s.media.push(created);
        save();
        return clone(created);
      },
      async remove(id) {
        const target = s.media.find((m) => m.id === id);
        s.media = s.media.filter((m) => m.id !== id);
        // sortOrder tidak pernah dirapikan ulang di atas — tanpa ini, hapus
        // baris di tengah lalu tambah baris baru bisa membuat dua baris
        // berbeda memegang sortOrder yang sama, dan urutan galeri (juga "foto
        // berikutnya" yang dipromosikan jadi utama) jadi bergantung urutan
        // penyisipan array, bukan sortOrder itu sendiri.
        if (target) {
          const siblings = s.media
            .filter((m) => m.projectId === target.projectId && m.houseTypeId === target.houseTypeId)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          siblings.forEach((m, index) => { m.sortOrder = index; });
        }
        save();
      },
      async setPrimary(id) {
        const target = s.media.find((m) => m.id === id);
        if (!target) return;
        for (const m of s.media) {
          if (m.projectId === target.projectId && m.houseTypeId === target.houseTypeId) m.isPrimary = m.id === id;
        }
        save();
      },
    },

    leads: {
      async create(input: NewLead) {
        const created = { ...clone(input), id: newId('lead'), status: 'new' as const, createdAt: now() };
        s.leads.push(created);
        save();
        return clone(created);
      },
      async listByUser(userId) {
        const owned = new Set(s.projects.filter((p) => p.userId === userId).map((p) => p.id));
        return s.leads
          .filter((l) => owned.has(l.projectId))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map(clone);
      },
    },

    events: {
      async record({ projectId, houseTypeId = null, type }) {
        const date = now().slice(0, 10);
        const existing = s.events.find(
          (e) => e.projectId === projectId && e.houseTypeId === houseTypeId && e.type === type && e.date === date,
        );
        if (existing) existing.count += 1;
        else s.events.push({ id: newId('evt'), projectId, houseTypeId, type, date, count: 1 });
        save();
      },
      async countsByProject(projectId) {
        const counts = { ...EMPTY_COUNTS };
        for (const e of s.events) if (e.projectId === projectId) counts[e.type] += e.count;
        return counts;
      },
      async totalsByUser(userId) {
        const owned = new Set(s.projects.filter((p) => p.userId === userId).map((p) => p.id));
        const counts = { ...EMPTY_COUNTS };
        for (const e of s.events) if (owned.has(e.projectId)) counts[e.type] += e.count;
        return counts;
      },
      async listByUser(userId) {
        const owned = new Set(s.projects.filter((p) => p.userId === userId).map((p) => p.id));
        return s.events.filter((e) => owned.has(e.projectId)).map(clone);
      },
    },

    aiUsage: {
      async record(input: NewAiUsage) {
        s.aiUsage.push({ ...clone(input), id: newId('aiu'), createdAt: now() });
        save();
      },
    },

    __dump() {
      return structuredClone(s);
    },
  };
}

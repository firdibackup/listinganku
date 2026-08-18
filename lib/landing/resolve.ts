import type { Block } from './blocks';
import type { AgentProfile, HouseType, Media, Project } from '@/lib/data/types';

export interface ResolvedHouseType {
  id: string;
  name: string;
  slug: string;
  price: number;
  landArea: number;
  buildingArea: number;
  bedrooms: number;
  bathrooms: number;
  carport: number;
  shortDescription: string;
  sellingPoints: string[];
  photos: Media[];
  primaryPhoto: Media | null;
  floorPlan: Media | null;
}

export type ResolvedBlock =
  | { id: string; type: 'hero'; title: string; subtitle: string; image: Media | null }
  | { id: string; type: 'gallery'; layout: 'carousel' | 'grid'; images: Media[] }
  | { id: string; type: 'highlights'; items: string[] }
  | { id: string; type: 'houseTypes'; houseTypes: ResolvedHouseType[] }
  | { id: string; type: 'specs'; houseTypes: ResolvedHouseType[] }
  | { id: string; type: 'facilities'; items: string[] }
  | { id: string; type: 'floorPlans'; plans: { houseType: ResolvedHouseType; media: Media }[] }
  | { id: string; type: 'location'; address: string; mapUrl: string | null }
  | { id: string; type: 'faq'; items: { q: string; a: string }[] }
  | { id: string; type: 'agentCta'; projectId: string; waNumber: string; defaultMessage: string; agentName: string }
  | { id: string; type: 'contactForm'; projectId: string; askHouseType: boolean; houseTypes: ResolvedHouseType[] };

export interface ResolveInput {
  project: Project;
  houseTypes: HouseType[];
  media: Media[];
  agent: AgentProfile;
}

/** Rantai yang menopang tombol "Use AI suggestion": override, lalu AI, lalu fallback. */
export const pick = <T>(override: T | undefined, ai: T | undefined, fallback: T): T => {
  const isAbsent = (v: T | undefined): boolean => {
    if (v === undefined) return true;
    if (v === '') return true; // empty string is absent
    if (Array.isArray(v) && v.length === 0) return true; // empty array is absent
    // Whitespace-only string is deliberately absent so fallback to AI / default occurs
    if (typeof v === 'string' && v.trim() === '') return true;
    return false;
  };

  if (!isAbsent(override)) return override as T;
  if (!isAbsent(ai)) return ai as T;
  return fallback;
};

function resolveHouseTypes(input: ResolveInput, block: Block | undefined): ResolvedHouseType[] {
  const props = (block?.props ?? {}) as { order?: string[]; hidden?: string[] };
  const hidden = new Set(props.hidden ?? []);
  const order = props.order;

  const sorted = order
    ? order.map((id) => input.houseTypes.find((h) => h.id === id)).filter((h): h is HouseType => Boolean(h))
    : [...input.houseTypes].sort((a, b) => a.sortOrder - b.sortOrder);

  return sorted
    .filter((h) => !hidden.has(h.id))
    .map((h) => {
      const own = input.media.filter((m) => m.houseTypeId === h.id);
      const photos = own.filter((m) => m.type === 'photo');
      return {
        id: h.id, name: h.name, slug: h.slug, price: h.price,
        landArea: h.landArea, buildingArea: h.buildingArea,
        bedrooms: h.bedrooms, bathrooms: h.bathrooms, carport: h.carport,
        shortDescription: h.aiContent?.shortDescription ?? '',
        sellingPoints: h.aiContent?.sellingPoints ?? [],
        photos,
        primaryPhoto: photos.find((m) => m.isPrimary) ?? photos[0] ?? null,
        floorPlan: own.find((m) => m.type === 'floor_plan') ?? null,
      };
    });
}

export function resolveBlocks(input: ResolveInput): ResolvedBlock[] {
  const { project, media, agent } = input;
  const ai = project.aiContent;
  const projectPhotos = media.filter((m) => m.houseTypeId === null && m.type === 'photo');
  const byId = (type: string) => project.blocks.find((b) => b.type === type);
  const houseTypes = resolveHouseTypes(input, byId('houseTypes'));

  const out: ResolvedBlock[] = [];

  for (const block of project.blocks) {
    if (!block.enabled) continue;
    const p = block.props as Record<string, unknown>;

    switch (block.type) {
      case 'hero':
        out.push({
          id: block.id, type: 'hero',
          title: pick(p.title as string | undefined, ai?.headline, project.name),
          subtitle: pick(p.subtitle as string | undefined, undefined, project.location),
          image: media.find((m) => m.id === p.mediaId) ?? projectPhotos[0] ?? houseTypes[0]?.primaryPhoto ?? null,
        });
        break;

      case 'gallery': {
        const ids = p.mediaIds as string[] | undefined;
        const resolved = ids?.length
          ? ids.map((id) => media.find((m) => m.id === id)).filter((m): m is Media => Boolean(m))
          : [];
        out.push({
          id: block.id, type: 'gallery',
          layout: (p.layout as 'carousel' | 'grid') ?? 'carousel',
          images: resolved.length > 0 ? resolved : [...projectPhotos, ...houseTypes.flatMap((h) => h.photos)],
        });
        break;
      }

      case 'highlights':
        out.push({
          id: block.id, type: 'highlights',
          items: pick(p.items as string[] | undefined, ai?.sellingPoints, []),
        });
        break;

      case 'houseTypes':
        out.push({ id: block.id, type: 'houseTypes', houseTypes });
        break;

      case 'specs':
        out.push({ id: block.id, type: 'specs', houseTypes });
        break;

      case 'facilities':
        out.push({ id: block.id, type: 'facilities', items: project.facilities });
        break;

      case 'floorPlans': {
        const allow = p.mediaIds as string[] | undefined;
        out.push({
          id: block.id, type: 'floorPlans',
          plans: houseTypes
            .filter((h) => h.floorPlan && (!allow?.length || allow.includes(h.floorPlan.id)))
            .map((h) => ({ houseType: h, media: h.floorPlan as Media })),
        });
        break;
      }

      case 'location':
        out.push({
          id: block.id, type: 'location',
          address: pick(p.address as string | undefined, undefined, project.location),
          mapUrl: (p.mapUrl as string | undefined) ?? null,
        });
        break;

      case 'faq':
        out.push({
          id: block.id, type: 'faq',
          items: pick(p.items as { q: string; a: string }[] | undefined, ai?.faq, []),
        });
        break;

      case 'agentCta':
        out.push({
          id: block.id, type: 'agentCta',
          // projectId: BlockRenderer hanya meneruskan { block } ke komponen tema
          // (lihat lib/landing/BlockRenderer.tsx — bukan file task ini, tidak
          // diubah), jadi AgentCta/ContactFormBlock tidak punya jalan lain untuk
          // tahu project mana yang sedang dirender. ResolvedBlock sudah menjadi
          // tempat SEMUA data siap-pakai lainnya (agentName, waNumber, dst.) di-
          // resolve, jadi projectId ikut pola yang sama alih-alih menambah
          // Context/prop-drilling baru hanya untuk satu field.
          projectId: project.id,
          waNumber: pick(p.waNumber as string | undefined, undefined, agent.whatsapp),
          defaultMessage: pick(
            p.defaultMessage as string | undefined,
            undefined,
            `Halo ${agent.fullName}, saya tertarik dengan ${project.name}.`,
          ),
          agentName: agent.fullName,
        });
        break;

      case 'contactForm':
        out.push({
          id: block.id, type: 'contactForm',
          projectId: project.id, // lihat komentar projectId di kasus 'agentCta' di atas
          askHouseType: (p.askHouseType as boolean | undefined) ?? true,
          houseTypes,
        });
        break;
    }
  }

  return out;
}

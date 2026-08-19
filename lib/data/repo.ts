import type {
  AgentProfile, EventRow, EventType, HouseType, Id, Lead, Media, Project, StoreShape,
} from './types';

export type NewProject = Pick<Project, 'userId' | 'name' | 'location' | 'developer' | 'description' | 'facilities'>;
export type NewHouseType = Pick<
  HouseType, 'projectId' | 'name' | 'price' | 'landArea' | 'buildingArea' | 'bedrooms' | 'bathrooms' | 'carport'
>;
export type NewMedia = Pick<Media, 'userId' | 'projectId' | 'houseTypeId' | 'type' | 'url' | 'size'>;
export type NewLead = Pick<Lead, 'projectId' | 'houseTypeId' | 'name' | 'phone' | 'email' | 'message' | 'source'>;
export type NewAiUsage = Omit<import('./types').AiUsage, 'id' | 'createdAt'>;

/**
 * Satu-satunya kontrak yang dilihat UI. Slice 1 mengisinya dengan mock store;
 * integrasi Supabase nanti menulis implementasi kedua tanpa menyentuh komponen.
 */
export interface DataStore {
  agentProfile: {
    get(userId: Id): Promise<AgentProfile | null>;
    update(userId: Id, patch: Partial<AgentProfile>): Promise<AgentProfile>;
  };
  projects: {
    list(userId: Id): Promise<Project[]>;
    get(id: Id): Promise<Project | null>;
    getBySlug(slug: string): Promise<Project | null>;
    listPublished(): Promise<Project[]>;
    create(input: NewProject): Promise<Project>;
    update(id: Id, patch: Partial<Project>): Promise<Project>;
    remove(id: Id): Promise<void>;
  };
  houseTypes: {
    listByProject(projectId: Id): Promise<HouseType[]>;
    get(id: Id): Promise<HouseType | null>;
    create(input: NewHouseType): Promise<HouseType>;
    update(id: Id, patch: Partial<HouseType>): Promise<HouseType>;
    remove(id: Id): Promise<void>;
  };
  media: {
    listByProject(projectId: Id): Promise<Media[]>;
    create(input: NewMedia): Promise<Media>;
    remove(id: Id): Promise<void>;
    setPrimary(id: Id): Promise<void>;
  };
  leads: {
    create(input: NewLead): Promise<Lead>;
    listByUser(userId: Id): Promise<Lead[]>;
  };
  events: {
    record(input: { projectId: Id; houseTypeId?: Id | null; type: EventType }): Promise<void>;
    countsByProject(projectId: Id): Promise<Record<EventType, number>>;
    totalsByUser(userId: Id): Promise<Record<EventType, number>>;
    /**
     * Baris mentah bertanggal. totalsByUser() meratakan tanggal, jadi kartu
     * delta "7 HARI" di halaman Leads tidak bisa dihitung darinya.
     */
    listByUser(userId: Id): Promise<EventRow[]>;
  };
  aiUsage: {
    record(input: NewAiUsage): Promise<void>;
  };
  /** Hanya untuk pengujian dan snapshot — bukan bagian permukaan yang dipakai UI. */
  __dump(): StoreShape;
}

export type { AgentProfile, EventRow, HouseType, Lead, Media, Project };

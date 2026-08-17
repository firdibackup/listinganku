import type { Block } from '@/lib/landing/blocks';

export type Id = string;
export type ProjectStatus = 'draft' | 'published';
export type ThemeName = 'modern' | 'showcase' | 'luxury';
export type MediaType = 'photo' | 'floor_plan';
export type LeadSource = 'form' | 'whatsapp';
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'negotiation' | 'deal' | 'lost';
export type EventType = 'visitor' | 'whatsapp_click' | 'form_submit';

export interface SeoContent {
  title?: string;
  description?: string;
}

export interface ProjectAiContent {
  headline: string;
  description: string;
  sellingPoints: string[];
  faq: { q: string; a: string }[];
  seo: { title: string; description: string };
  captions: { instagram: string; facebook: string; whatsapp: string };
}

export interface HouseTypeAiContent {
  shortDescription: string;
  sellingPoints: string[];
}

export interface AgentProfile {
  id: Id;
  userId: Id;
  fullName: string;
  email: string;
  whatsapp: string;
  siteName: string;
  subdomain: string;
  theme: string;
  logoUrl: string | null;
  colorScheme: string;
  about: string;
  stats: { closings: number; listings: number; years: number };
  services: string[];
  isPublished: boolean;
}

export interface Project {
  id: Id;
  userId: Id;
  name: string;
  slug: string;
  location: string;
  developer: string;
  description: string;
  facilities: string[];
  status: ProjectStatus;
  theme: ThemeName;
  blocks: Block[];
  seo: SeoContent;
  aiContent: ProjectAiContent | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface HouseType {
  id: Id;
  projectId: Id;
  name: string;
  slug: string;
  price: number;
  landArea: number;
  buildingArea: number;
  bedrooms: number;
  bathrooms: number;
  carport: number;
  status: ProjectStatus;
  aiContent: HouseTypeAiContent | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: Id;
  userId: Id;
  projectId: Id;
  houseTypeId: Id | null;
  type: MediaType;
  url: string;
  size: number;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Lead {
  id: Id;
  projectId: Id;
  houseTypeId: Id | null;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
}

export interface EventRow {
  id: Id;
  projectId: Id;
  houseTypeId: Id | null;
  type: EventType;
  date: string;
  count: number;
}

export interface AiUsage {
  id: Id;
  userId: Id;
  projectId: Id;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  success: boolean;
  error: string | null;
  createdAt: string;
}

export interface StoreShape {
  agentProfiles: AgentProfile[];
  projects: Project[];
  houseTypes: HouseType[];
  media: Media[];
  leads: Lead[];
  events: EventRow[];
  aiUsage: AiUsage[];
}

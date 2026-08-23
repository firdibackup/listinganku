import type { HouseType, Project, ProjectBrief } from '@/lib/data/types';
import type { AiContent } from './schema';

export interface GenerateInput {
  project: Project;
  houseTypes: HouseType[];
  /**
   * Bahan mentah dari agen. Generator WAJIB memakai hanya fakta di sini dan di
   * houseTypes — jangan menyebut angka, jarak, waktu tempuh, harga, atau nama
   * tempat yang tidak ada di keduanya. Kalau `minutes` null, sebut tempatnya
   * tanpa angka.
   */
  brief: ProjectBrief;
  /** Diekspos supaya tes bisa menjalankan mock tanpa menunggu. */
  delayMs?: number;
  forceFail?: boolean;
}

export interface ContentGenerator {
  readonly model: string;
  generate(input: GenerateInput): Promise<AiContent>;
}

export class AiGenerationError extends Error {
  constructor(message = 'AI sedang gangguan.') {
    super(message);
    this.name = 'AiGenerationError';
  }
}

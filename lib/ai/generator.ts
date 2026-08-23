import type { HouseType, Project, ProjectBrief } from '@/lib/data/types';
import type { AiContent } from './schema';

export interface GenerateInput {
  project: Project;
  houseTypes: HouseType[];
  /**
   * Bahan mentah dari agen. Generator WAJIB memakai hanya fakta di `brief`,
   * `houseTypes`, dan field milik `project` sendiri (`project.name`,
   * `project.location`, `project.developer`, `project.description`,
   * `project.facilities`) — jangan menyebut angka, jarak, waktu tempuh,
   * harga, atau nama tempat di luar sumber-sumber itu. Kalau `minutes`
   * null, sebut tempatnya tanpa angka.
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

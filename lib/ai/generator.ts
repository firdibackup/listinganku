import type { HouseType, Project } from '@/lib/data/types';
import type { AiContent } from './schema';

export interface GenerateInput {
  project: Project;
  houseTypes: HouseType[];
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

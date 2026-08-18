import type { ContentGenerator } from './generator';
import { mockGenerator } from './mock';

/** Saat Gemini asli masuk, cabang kedua ditambahkan di sini. Tidak ada tempat lain. */
export function getGenerator(): ContentGenerator {
  return mockGenerator;
}

export { AiContentSchema } from './schema';
export type { AiContent } from './schema';
export { AiGenerationError } from './generator';
export type { ContentGenerator, GenerateInput } from './generator';

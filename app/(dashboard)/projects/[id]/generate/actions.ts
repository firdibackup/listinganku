'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { getGenerator, AiContentSchema } from '@/lib/ai';

export async function generateContentAction(
  projectId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const userId = await requireSessionUserId();
  const project = await db.projects.get(projectId);
  if (!project || project.userId !== userId) return { ok: false, message: 'Project tidak ditemukan.' };

  const houseTypes = await db.houseTypes.listByProject(projectId);
  if (houseTypes.length === 0) return { ok: false, message: 'Tambahkan minimal satu tipe rumah lebih dulu.' };

  const generator = getGenerator();
  const started = Date.now();

  try {
    const raw = await generator.generate({ project, houseTypes });
    const content = AiContentSchema.parse(raw);

    // Respons dipecah: bagian proyek ke projects, tiap tipe ke barisnya sendiri.
    await db.projects.update(projectId, {
      aiContent: {
        headline: content.headline,
        description: content.description,
        sellingPoints: content.sellingPoints,
        faq: content.faq,
        seo: content.seo,
        captions: content.captions,
      },
      seo: { title: content.seo.title, description: content.seo.description },
    });

    for (const entry of content.houseTypes) {
      const match = houseTypes.find((h) => h.name === entry.name);
      if (!match) continue;
      await db.houseTypes.update(match.id, {
        aiContent: { shortDescription: entry.shortDescription, sellingPoints: entry.sellingPoints },
      });
    }

    await db.aiUsage.record({
      userId, projectId, model: generator.model,
      promptTokens: 0, completionTokens: 0,
      latencyMs: Date.now() - started, success: true, error: null,
    });

    revalidatePath(`/projects/${projectId}`);
    return { ok: true };
  } catch (error) {
    await db.aiUsage.record({
      userId, projectId, model: generator.model,
      promptTokens: 0, completionTokens: 0,
      latencyMs: Date.now() - started, success: false,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return { ok: false, message: 'AI sedang gangguan.' };
  }
}

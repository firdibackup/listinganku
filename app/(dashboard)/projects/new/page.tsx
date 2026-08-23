import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { CreateProjectWizard } from '@/components/wizard/CreateProjectWizard';

export const metadata = { title: 'Project baru — Listingku' };

export default async function NewProjectPage() {
  const userId = await requireSessionUserId();
  const projects = await db.projects.list(userId);
  // Autocomplete dari data yang PERNAH dimasukkan user sendiri — tanpa master
  // data developer, yang sengaja di luar scope MVP.
  const developers = [...new Set(projects.map((p) => p.developer).filter(Boolean))].sort();

  return <CreateProjectWizard developers={developers} />;
}
